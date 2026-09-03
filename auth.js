/**
 * AI Learning Hub - Authentication & User Management Module (auth.js)
 * จัดการระบบสมัครสมาชิก (Register), เข้าสู่ระบบ (Login), ออกจากระบบ (Logout),
 * การสุ่มสร้างรหัสผ่าน (Password Generator), แถบวัดความปลอดภัยรหัสผ่าน (Password Strength)
 * และจัดการ Session ผู้ใช้ผ่าน LocalStorage
 */

const AUTH_STORAGE_KEYS = {
  USERS: 'aihub_users',
  CURRENT_USER: 'aihub_current_user'
};

// บัญชีเริ่มต้นสำหรับทดสอบ (Default Mock Users)
const DEFAULT_USERS = [
  {
    id: 'user_student_demo',
    username: 'student',
    password: 'password123',
    displayName: 'นักเรียน Demo',
    avatar: '🎓',
    role: 'student',
    educationLevel: 'มัธยมศึกษาตอนปลาย',
    preferredPrice: 'All',
    createdAt: '2025-01-15T08:00:00.000Z'
  },
  {
    id: 'user_teacher_demo',
    username: 'teacher',
    password: 'password123',
    displayName: 'คุณครูวิชาการ',
    avatar: '👨‍🏫',
    role: 'teacher',
    educationLevel: 'มหาวิทยาลัย',
    preferredPrice: 'Freemium',
    createdAt: '2025-02-01T10:30:00.000Z'
  }
];

const Auth = {
  /**
   * ดึงรายการผู้ใช้ทั้งหมดจาก LocalStorage
   */
  getAllUsers() {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEYS.USERS);
      if (!stored) {
        // บันทึก Default Users ลง Storage ครั้งแรก
        localStorage.setItem(AUTH_STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
        return DEFAULT_USERS;
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('[Auth] Error getting users:', error);
      return DEFAULT_USERS;
    }
  },

  /**
   * บันทึกรายการผู้ใช้ลง LocalStorage
   */
  saveAllUsers(users) {
    try {
      localStorage.setItem(AUTH_STORAGE_KEYS.USERS, JSON.stringify(users));
      return true;
    } catch (error) {
      console.error('[Auth] Error saving users:', error);
      return false;
    }
  },

  /**
   * ดึงข้อมูลผู้ใช้ที่กำลังล็อกอินอยู่ปัจจุบัน
   */
  getCurrentUser() {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEYS.CURRENT_USER);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch (error) {
      console.error('[Auth] Error getting current user:', error);
      return null;
    }
  },

  /**
   * ตรวจสอบว่าล็อกอินอยู่หรือไม่
   */
  isLoggedIn() {
    return this.getCurrentUser() !== null;
  },

  /**
   * สมัครสมาชิกใหม่ (Register / Sign Up)
   * @param {Object} data - { username, password, displayName, avatar, educationLevel }
   */
  register(data) {
    const { username, password, displayName, avatar = '🎓', educationLevel = 'มัธยมศึกษาตอนปลาย' } = data;

    // ตรวจสอบค่าว่าง
    if (!username || !username.trim()) {
      return { success: false, message: 'กรุณากรอกชื่อผู้ใช้ (Username)' };
    }
    if (!password || password.length < 6) {
      return { success: false, message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' };
    }

    const cleanUsername = username.trim().toLowerCase();
    const users = this.getAllUsers();

    // ตรวจสอบ Username ซ้ำ
    const isExisting = users.some(u => u.username.toLowerCase() === cleanUsername);
    if (isExisting) {
      return { success: false, message: `ชื่อผู้ใช้ "${cleanUsername}" ถูกใช้งานไปแล้ว กรุณาเลือกชื่ออื่น` };
    }

    const newUser = {
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      username: cleanUsername,
      password: password,
      displayName: (displayName && displayName.trim()) ? displayName.trim() : cleanUsername,
      avatar: avatar || '🎓',
      role: 'student',
      educationLevel: educationLevel || 'มัธยมศึกษาตอนปลาย',
      preferredPrice: 'All',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveAllUsers(users);

    // Sync ไปยัง Supabase users_profile
    try {
      const client = window.SupabaseService ? window.SupabaseService.getClient() : null;
      if (client) {
        client.from('users_profile').insert({
          id: newUser.id,
          username: newUser.username,
          password: newUser.password,
          displayName: newUser.displayName,
          avatar: newUser.avatar,
          role: newUser.role,
          educationLevel: newUser.educationLevel,
          preferredPrice: newUser.preferredPrice
        }).then(({ error }) => {
          if (error) console.warn('[Auth] Supabase user registration error:', error.message);
          else console.log('[Auth] User registered on Supabase successfully! 👤');
        });
      }
    } catch (err) {
      console.warn('[Auth] Supabase registration sync error:', err);
    }

    // ล็อกอินอัตโนมัติทันทีหลังสมัครเสร็จ
    this.setCurrentSession(newUser);

    return {
      success: true,
      message: `สมัครสมาชิกสำเร็จ! ยินดีต้อนรับคุณ ${newUser.displayName}`,
      user: newUser
    };
  },

  /**
   * เข้าสู่ระบบ (Login / Sign In)
   * @param {string} username 
   * @param {string} password 
   */
  login(username, password) {
    if (!username || !password) {
      return { success: false, message: 'กรุณากรอกทั้งชื่อผู้ใช้และรหัสผ่าน' };
    }

    const cleanUsername = username.trim().toLowerCase();
    const users = this.getAllUsers();
    const foundUser = users.find(u => u.username.toLowerCase() === cleanUsername);

    if (!foundUser) {
      return { success: false, message: 'ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาตรวจสอบชื่อผู้ใช้หรือสมัครสมาชิกใหม่' };
    }

    if (foundUser.password !== password) {
      return { success: false, message: 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' };
    }

    this.setCurrentSession(foundUser);

    return {
      success: true,
      message: `เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับ ${foundUser.displayName}`,
      user: foundUser
    };
  },

  /**
   * บันทึก Session ผู้ใช้ปัจจุบัน และ Dispatch Event
   */
  setCurrentSession(user) {
    try {
      // ไม่เก็บ password ใน session user object เพื่อความปลอดภัย
      const sessionUser = { ...user };
      delete sessionUser.password;
      
      localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, JSON.stringify(sessionUser));
      
      window.dispatchEvent(new CustomEvent('aihub:auth-state-changed', {
        detail: { isLoggedIn: true, user: sessionUser }
      }));
    } catch (e) {
      console.error('[Auth] Set session error:', e);
    }
  },

  /**
   * ออกจากระบบ (Logout)
   */
  logout() {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER);
      
      window.dispatchEvent(new CustomEvent('aihub:auth-state-changed', {
        detail: { isLoggedIn: false, user: null }
      }));

      return { success: true, message: 'ออกจากระบบเรียบร้อยแล้ว' };
    } catch (e) {
      console.error('[Auth] Logout error:', e);
      return { success: false, message: 'เกิดข้อผิดพลาดในการออกจากระบบ' };
    }
  },

  /**
   * เปลี่ยนรหัสผ่าน (Change Password)
   */
  changePassword(oldPassword, newPassword) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนเปลี่ยนรหัสผ่าน' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร' };
    }

    const users = this.getAllUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex === -1) {
      return { success: false, message: 'ไม่พบบัญชีผู้ใช้ในระบบ' };
    }

    if (users[userIndex].password !== oldPassword) {
      return { success: false, message: 'รหัสผ่านเดิมไม่ถูกต้อง' };
    }

    users[userIndex].password = newPassword;
    this.saveAllUsers(users);

    // Sync รหัสผ่านใหม่ไปยัง Supabase
    try {
      const client = window.SupabaseService ? window.SupabaseService.getClient() : null;
      if (client) {
        client.from('users_profile').update({ password: newPassword }).eq('id', currentUser.id).then();
      }
    } catch (err) {
      console.warn('[Auth] Supabase change password sync error:', err);
    }

    return { success: true, message: 'เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว' };
  },

  /**
   * อัปเดตข้อมูลโปรไฟล์ (Update Profile)
   */
  updateProfile(updateData) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนแก้ไขโปรไฟล์' };
    }

    const users = this.getAllUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex === -1) {
      return { success: false, message: 'ไม่พบบัญชีผู้ใช้ในระบบ' };
    }

    // Merge updates
    const updatedUser = {
      ...users[userIndex],
      displayName: updateData.displayName || users[userIndex].displayName,
      avatar: updateData.avatar || users[userIndex].avatar,
      educationLevel: updateData.educationLevel || users[userIndex].educationLevel,
      preferredPrice: updateData.preferredPrice || users[userIndex].preferredPrice
    };

    users[userIndex] = updatedUser;
    this.saveAllUsers(users);
    this.setCurrentSession(updatedUser);

    // Sync โปรไฟล์ไปยัง Supabase
    try {
      const client = window.SupabaseService ? window.SupabaseService.getClient() : null;
      if (client) {
        client.from('users_profile').update({
          displayName: updatedUser.displayName,
          avatar: updatedUser.avatar,
          educationLevel: updatedUser.educationLevel,
          preferredPrice: updatedUser.preferredPrice
        }).eq('id', currentUser.id).then();
      }
    } catch (err) {
      console.warn('[Auth] Supabase update profile sync error:', err);
    }

    return { success: true, message: 'บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว', user: updatedUser };
  },

  /**
   * สุ่มสร้างรหัสผ่านที่ปลอดภัย (Strong Password Generator)
   * @param {number} length - ความยาวรหัสผ่าน (ค่าเริ่มต้น 12 ตัวอักษร)
   * @param {Object} options - { uppercase, lowercase, numbers, symbols }
   */
  generateStrongPassword(length = 12, options = { uppercase: true, lowercase: true, numbers: true, symbols: true }) {
    const uppercaseChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // ตัด I, O ที่คล้าย 1, 0 ออกเพื่ออ่านง่าย
    const lowercaseChars = 'abcdefghijkmnopqrstuvwxyz'; // ตัด l
    const numberChars = '23456789'; // ตัด 0, 1
    const symbolChars = '!@#$%&*+?';

    let charPool = '';
    let requiredChars = [];

    if (options.uppercase) {
      charPool += uppercaseChars;
      requiredChars.push(uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)]);
    }
    if (options.lowercase) {
      charPool += lowercaseChars;
      requiredChars.push(lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)]);
    }
    if (options.numbers) {
      charPool += numberChars;
      requiredChars.push(numberChars[Math.floor(Math.random() * numberChars.length)]);
    }
    if (options.symbols) {
      charPool += symbolChars;
      requiredChars.push(symbolChars[Math.floor(Math.random() * symbolChars.length)]);
    }

    if (!charPool) charPool = lowercaseChars + numberChars;

    // เติมตัวอักษรที่เหลือ
    let password = [...requiredChars];
    const remainingLength = Math.max(0, length - requiredChars.length);
    for (let i = 0; i < remainingLength; i++) {
      const randomIndex = Math.floor(Math.random() * charPool.length);
      password.push(charPool[randomIndex]);
    }

    // สลับตำแหน่งตัวอักษรแบบสุ่ม (Fisher-Yates shuffle)
    for (let i = password.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [password[i], password[j]] = [password[j], password[i]];
    }

    return password.join('');
  },

  /**
   * ตรวจสอบระดับความปลอดภัยของรหัสผ่าน (Password Strength)
   * @param {string} password 
   * @returns {Object} { score: 0-4, label: 'อ่อนมาก'|'อ่อน'|'ปานกลาง'|'แข็งแกร่ง'|'ปลอดภัยสูงสุด', color: string, percent: number }
   */
  checkPasswordStrength(password) {
    if (!password) {
      return { score: 0, label: 'ยังไม่ได้ระบุ', color: 'var(--text-tertiary)', percent: 0 };
    }

    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    switch (score) {
      case 0:
      case 1:
        return { score: 1, label: 'อ่อนมาก (เสี่ยง)', color: '#ef4444', percent: 20 };
      case 2:
        return { score: 2, label: 'พอใช้ (ควรเพิ่มความยาว)', color: '#f97316', percent: 45 };
      case 3:
        return { score: 3, label: 'ปานกลาง (ใช้งานได้)', color: '#eab308', percent: 70 };
      case 4:
        return { score: 4, label: 'แข็งแกร่ง (ปลอดภัย)', color: '#10b981', percent: 90 };
      case 5:
      default:
        return { score: 5, label: 'ปลอดภัยสูงสุด 🛡️', color: '#06b6d4', percent: 100 };
    }
  }
};

window.Auth = Auth;
