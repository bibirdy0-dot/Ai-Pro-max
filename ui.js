/**
 * AI Learning Hub - UI Components & SVG Chart Engine (ui.js)
 * จัดการการสร้าง HTML Cards, 8-Skill Radar SVG Chart, Modals, และ Toast Notifications
 */

const UI = {
  // สกิลทั้ง 8 ด้านตามสเปก
  SKILLS_DEF: [
    { key: 'learning', label: 'Learning', labelTh: 'การเรียนรู้ & อธิบาย', icon: '📚' },
    { key: 'reasoning', label: 'Reasoning', labelTh: 'การคิดวิเคราะห์', icon: '🧠' },
    { key: 'writing', label: 'Writing', labelTh: 'การเขียน & เรียบเรียง', icon: '✍️' },
    { key: 'research', label: 'Research', labelTh: 'ค้นคว้า & อ้างอิง', icon: '🔎' },
    { key: 'coding', label: 'Coding', labelTh: 'เขียนโค้ด & แก้บั๊ก', icon: '💻' },
    { key: 'mathScience', label: 'Math & Science', labelTh: 'คณิต & วิทย์', icon: '🧮' },
    { key: 'creativeMedia', label: 'Creative', labelTh: 'ภาพ & สื่อการสอน', icon: '🎨' },
    { key: 'productivity', label: 'Productivity', labelTh: 'ความเร็ว & จัดการ', icon: '⚡' }
  ],

  /**
   * สร้าง 8-Skill Octagon Radar Chart ด้วย Pure SVG
   * @param {Object} skills - object คะแนน { learning: 90, reasoning: 85, ... }
   * @param {Object} options - { size: 340, animate: true }
   */
  createRadarChartSVG(skills = {}, options = {}) {
    const size = options.size || 340;
    const center = size / 2;
    const radius = size * 0.36;
    const numAxes = UI.SKILLS_DEF.length;
    const angleStep = (Math.PI * 2) / numAxes;

    // Helper แปลง Polar coordinate เป็น Cartesian (x, y)
    const getCoordinates = (index, valueRatio) => {
      const angle = index * angleStep - Math.PI / 2;
      const x = center + radius * valueRatio * Math.cos(angle);
      const y = center + radius * valueRatio * Math.sin(angle);
      return { x, y };
    };

    // สร้างเส้นโครงตาข่าย Octagon (Grid levels: 25%, 50%, 75%, 100%)
    let gridPolygons = '';
    [0.25, 0.5, 0.75, 1.0].forEach(level => {
      let points = [];
      for (let i = 0; i < numAxes; i++) {
        const pt = getCoordinates(i, level);
        points.push(`${pt.x.toFixed(1)},${pt.y.toFixed(1)}`);
      }
      gridPolygons += `<polygon points="${points.join(' ')}" class="radar-grid-polygon" />`;
    });

    // สร้างเส้นแกนและ Label ประจำแกน
    let axesLines = '';
    let labelsSVG = '';
    UI.SKILLS_DEF.forEach((def, i) => {
      const outerPt = getCoordinates(i, 1.0);
      axesLines += `<line x1="${center}" y1="${center}" x2="${outerPt.x.toFixed(1)}" y2="${outerPt.y.toFixed(1)}" class="radar-axis-line" />`;

      // Label ตำแหน่งขอบนอก
      const labelPt = getCoordinates(i, 1.24);
      const score = skills[def.key] || 0;
      labelsSVG += `
        <text x="${labelPt.x.toFixed(1)}" y="${labelPt.y.toFixed(1)}" class="radar-label">
          ${def.label} (${score})
        </text>
      `;
    });

    // สร้าง Polygon รูปข้อมูลของ AI
    let dataPoints = [];
    let circlesSVG = '';
    UI.SKILLS_DEF.forEach((def, i) => {
      const val = Math.min(100, Math.max(0, skills[def.key] || 0));
      const pt = getCoordinates(i, val / 100);
      dataPoints.push(`${pt.x.toFixed(1)},${pt.y.toFixed(1)}`);

      circlesSVG += `
        <circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="4.5" class="radar-point"
          data-skill="${def.label}" data-score="${val}">
          <title>${def.label} (${def.labelTh}): ${val}/100</title>
        </circle>
      `;
    });

    const dataPolygon = `<polygon points="${dataPoints.join(' ')}" class="radar-data-polygon" />`;

    // สรุปทักษะเด่น 3 อันดับแรก
    const sortedSkills = [...UI.SKILLS_DEF]
      .sort((a, b) => (skills[b.key] || 0) - (skills[a.key] || 0));
    
    const topSkills = sortedSkills.slice(0, 3);
    const topNames = topSkills.map(s => `<strong>${s.label} (${skills[s.key]}/100)</strong>`).join(', ');

    const summaryText = `เด่นด้าน ${topNames}`;

    return `
      <div class="radar-chart-container" role="img" aria-label="8-Skill Radar Chart: ${summaryText.replace(/<[^>]*>?/gm, '')}">
        <svg viewBox="0 0 ${size} ${size}" class="radar-svg">
          <g class="radar-grid">${gridPolygons}</g>
          <g class="radar-axes">${axesLines}</g>
          <g class="radar-data">${dataPolygon}${circlesSVG}</g>
          <g class="radar-labels">${labelsSVG}</g>
        </svg>
        <div class="radar-summary-box">
          ✨ ${summaryText}
        </div>
      </div>
    `;
  },

  /**
   * เรนเดอร์ AI Card สำหรับแสดงใน Grid (Discover, Home, Favorites)
   * (เน้นชื่อ AI ตัวหนังสือชัดเจน ไม่ต้องพึ่งพาไฟล์รูปภาพ)
   */
  renderAICard(ai, options = {}) {
    const isFav = window.DataLayer.isFavorite(ai.id);
    const ratings = window.DataLayer.getAIRatings(ai.id, ai.demoStats?.initialRating, ai.demoStats?.reviewCount);
    
    // Top 2 skills preview
    const top2 = [...UI.SKILLS_DEF]
      .sort((a, b) => (ai.skills[b.key] || 0) - (ai.skills[a.key] || 0))
      .slice(0, 2);

    const detailUrl = window.location.pathname.includes('/ai/') ? `detail.html?id=${ai.id}` : `ai/detail.html?id=${ai.id}`;

    return `
      <article class="ai-card" data-id="${ai.id}">
        <div class="ai-card-header">
          <div class="ai-card-meta" style="width: 100%;">
            <div class="ai-card-title-row">
              <h3 class="ai-card-name" title="${ai.name}" style="font-size: 1.25rem; font-weight: 800;">${ai.name}</h3>
              <span class="badge ${ai.pricing === 'Free' ? 'badge-verified' : 'badge-cyan'}">${ai.pricing}</span>
            </div>
            <div class="ai-card-developer">${ai.developer} • <span class="badge badge-demo">Demo</span></div>
          </div>
        </div>

        <p class="ai-card-desc">${ai.description}</p>

        <div class="ai-card-tags">
          ${ai.categories.slice(0, 3).map(c => `<span class="ai-tag">${c}</span>`).join('')}
          ${ai.badge ? `<span class="ai-tag" style="color: var(--accent-cyan); border-color: rgba(34,211,238,0.3);">${ai.badge}</span>` : ''}
        </div>

        <div class="ai-card-skills-mini">
          ${top2.map(s => `
            <div class="skill-mini-row">
              <span class="skill-mini-label">${s.icon} ${s.label}</span>
              <div class="skill-mini-bar-bg">
                <div class="skill-mini-bar-fill" style="width: ${ai.skills[s.key]}%;"></div>
              </div>
              <span class="skill-mini-score">${ai.skills[s.key]}</span>
            </div>
          `).join('')}
        </div>

        <div class="ai-card-footer">
          <div class="ai-card-rating" title="คะแนนเฉลี่ยจากผู้ใช้">
            <span>⭐ ${ratings.overallRating}</span>
            <span class="ai-card-review-count">(${ratings.reviewCount})</span>
          </div>

          <div class="ai-card-actions">
            <button type="button" class="btn-icon ${isFav ? 'favorited' : ''}" onclick="window.App.handleToggleFavorite('${ai.id}', this)" title="${isFav ? 'ลบออกจากรายการโปรด' : 'บันทึกเป็นรายการโปรด'}" aria-label="Favorite">
              ${isFav ? '❤️' : '♡'}
            </button>
            <button type="button" class="btn btn-outline btn-xs" onclick="window.App.handleToggleCompare('${ai.id}')" title="เพิ่มลงรายการเปรียบเทียบ">
              ⚖️ เปรียบเทียบ
            </button>
            <a href="${detailUrl}" class="btn btn-secondary btn-xs">
              ดูรายละเอียด
            </a>
            <a href="${ai.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-xs" title="เปิด Official Website จริง">
              🚀 ใช้งาน AI
            </a>
          </div>
        </div>
      </article>
    `;
  },

  /**
   * แสดง Toast Notification
   */
  showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const icons = {
      success: '✅',
      info: '💡',
      warning: '⚠️',
      error: '❌'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span style="font-size: 1.1rem;">${icons[type] || '✨'}</span>
      <div style="flex: 1;">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  /**
   * เปิดหน้าต่าง Auth Modal สำหรับ Login หรือ Register
   * @param {string} initialTab - 'login' หรือ 'register'
   */
  showAuthModal(initialTab = 'login') {
    let backdrop = document.getElementById('global-auth-modal');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'global-auth-modal';
      backdrop.className = 'auth-modal-backdrop';
      backdrop.innerHTML = `
        <div class="auth-modal-card" role="dialog" aria-modal="true">
          <div class="auth-modal-header">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--gradient-brand); display: flex; align-items: center; justify-content: center; font-size: 1rem;">
                🔐
              </div>
              <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary);" id="auth-modal-title">
                เข้าสู่ระบบ AI Learning Hub
              </h3>
            </div>
            <button type="button" class="auth-modal-close" onclick="window.UI.closeAuthModal()" aria-label="ปิด">✕</button>
          </div>

          <div class="auth-tabs-nav">
            <button type="button" class="auth-tab-btn" id="auth-tab-login" onclick="window.UI.switchAuthTab('login')">
              🔑 เข้าสู่ระบบ
            </button>
            <button type="button" class="auth-tab-btn" id="auth-tab-register" onclick="window.UI.switchAuthTab('register')">
              ✨ สร้างบัญชีใหม่
            </button>
          </div>

          <div class="auth-modal-body">
            <!-- Form 1: Login -->
            <form id="auth-login-form" onsubmit="window.UI.handleAuthLogin(event)">
              <div class="auth-form-group">
                <label class="auth-label" for="login-username">ชื่อผู้ใช้ (Username):</label>
                <div class="auth-input-wrapper">
                  <input type="text" id="login-username" class="auth-input" placeholder="เช่น student หรือ yourname" required autocomplete="username">
                </div>
              </div>

              <div class="auth-form-group">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                  <label class="auth-label" for="login-password" style="margin-bottom: 0;">รหัสผ่าน (Password):</label>
                </div>
                <div class="auth-input-wrapper">
                  <input type="password" id="login-password" class="auth-input has-icon-right" placeholder="กรอกรหัสผ่านของคุณ" required autocomplete="current-password">
                  <button type="button" class="auth-icon-btn" onclick="window.UI.togglePasswordVisibility('login-password', this)" title="ดู/ซ่อนรหัสผ่าน">
                    👁️
                  </button>
                </div>
              </div>

              <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.75rem; font-size: 0.95rem; margin-top: 0.5rem;">
                🚀 เข้าสู่ระบบ
              </button>

              <div class="auth-hint-box">
                <div style="font-weight: 700; margin-bottom: 0.35rem; color: var(--accent-cyan);">💡 บัญชีทดสอบด่วน (คลิกเพื่อใส่ข้อมูล):</div>
                <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
                  <button type="button" class="auth-hint-badge" onclick="window.UI.fillDemoAccount('student', 'password123')">นักเรียน: student / password123</button>
                  <button type="button" class="auth-hint-badge" onclick="window.UI.fillDemoAccount('teacher', 'password123')">คุณครู: teacher / password123</button>
                </div>
              </div>
            </form>

            <!-- Form 2: Register -->
            <form id="auth-register-form" style="display: none;" onsubmit="window.UI.handleAuthRegister(event)">
              <div class="auth-form-group">
                <label class="auth-label" for="reg-username">ชื่อผู้ใช้สำหรับล็อกอิน (Username):</label>
                <div class="auth-input-wrapper">
                  <input type="text" id="reg-username" class="auth-input" placeholder="ตัวอักษรภาษาอังกฤษหรือตัวเลข เช่น somchai_ai" required autocomplete="username" pattern="^[a-zA-Z0-9_]{3,20}$" title="ใช้ตัวอักษรภาษาอังกฤษ ตัวเลข หรือ _ ความยาว 3-20 ตัวอักษร">
                </div>
              </div>

              <div class="auth-form-group">
                <label class="auth-label" for="reg-displayname">ชื่อที่ใช้แสดง (Display Name):</label>
                <div class="auth-input-wrapper">
                  <input type="text" id="reg-displayname" class="auth-input" placeholder="เช่น สมชาย ใจดี หรือ Sam" required>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.15rem;">
                <div>
                  <label class="auth-label" for="reg-avatar">รูปโปรไฟล์ (Emoji):</label>
                  <select id="reg-avatar" class="select-control" style="width: 100%;">
                    <option value="🎓">🎓 นักเรียน</option>
                    <option value="🚀">🚀 นักค้นคว้า</option>
                    <option value="💻">💻 สายโปรแกรมเมอร์</option>
                    <option value="🎨">🎨 สายครีเอทีฟ</option>
                    <option value="⚡">⚡ ผู้ใฝ่รู้</option>
                    <option value="👨‍🏫">👨‍🏫 คุณครู</option>
                  </select>
                </div>
                <div>
                  <label class="auth-label" for="reg-level">ระดับการศึกษา:</label>
                  <select id="reg-level" class="select-control" style="width: 100%;">
                    <option value="มัธยมศึกษาตอนต้น">มัธยมต้น</option>
                    <option value="มัธยมศึกษาตอนปลาย" selected>มัธยมปลาย</option>
                    <option value="มหาวิทยาลัย">มหาวิทยาลัย</option>
                    <option value="บุคคลทั่วไป">บุคคลทั่วไป</option>
                  </select>
                </div>
              </div>

              <div class="auth-form-group">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                  <label class="auth-label" for="reg-password" style="margin-bottom: 0;">กำหนดรหัสผ่าน (Password):</label>
                  <button type="button" class="btn btn-outline btn-xs" onclick="window.UI.handleGeneratePassword('reg-password')" style="padding: 0.2rem 0.5rem; font-size: 0.75rem; border-color: var(--accent-cyan); color: var(--accent-cyan);">
                    🎲 สุ่มสร้างรหัสผ่าน
                  </button>
                </div>
                <div class="auth-input-wrapper">
                  <input type="password" id="reg-password" class="auth-input has-icon-right" placeholder="อย่างน้อย 6 ตัวอักษร" required minlength="6" oninput="window.UI.handlePasswordInput(this.value)">
                  <button type="button" class="auth-icon-btn" onclick="window.UI.togglePasswordVisibility('reg-password', this)" title="ดู/ซ่อนรหัสผ่าน">
                    👁️
                  </button>
                </div>
                
                <!-- Password Strength Meter -->
                <div class="password-strength-container" id="reg-strength-container">
                  <div class="strength-bar-track">
                    <div class="strength-bar-progress" id="reg-strength-bar"></div>
                  </div>
                  <div class="strength-label-row">
                    <span>ความปลอดภัย: <strong id="reg-strength-text" style="color: var(--text-tertiary);">ยังไม่ระบุ</strong></span>
                    <span id="reg-strength-hint" style="color: var(--text-muted);">แนะนำ 8+ ตัวอักษร</span>
                  </div>
                </div>

                <!-- Password Generator Output Box (Shows when generated) -->
                <div class="password-generator-widget" id="reg-pwd-widget" style="display: none;">
                  <div class="pwd-gen-header">
                    <span>✨ รหัสผ่านที่สร้างขึ้นใหม่:</span>
                    <span style="font-size: 0.75rem; opacity: 0.8;">ความปลอดภัยสูง</span>
                  </div>
                  <div class="pwd-gen-result-row">
                    <div class="pwd-gen-box" id="reg-pwd-box"></div>
                    <button type="button" class="pwd-gen-action-btn" onclick="window.UI.copyGeneratedPassword()">📋 คัดลอก</button>
                  </div>
                </div>
              </div>

              <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.75rem; font-size: 0.95rem; margin-top: 0.5rem;">
                ✨ ยืนยันการสร้างบัญชี
              </button>
            </form>
          </div>
        </div>
      `;
      document.body.appendChild(backdrop);

      // Close when clicking outside modal card
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          window.UI.closeAuthModal();
        }
      });
    }

    window.UI.switchAuthTab(initialTab);
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeAuthModal() {
    const backdrop = document.getElementById('global-auth-modal');
    if (backdrop) {
      backdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  switchAuthTab(tab) {
    const loginBtn = document.getElementById('auth-tab-login');
    const regBtn = document.getElementById('auth-tab-register');
    const loginForm = document.getElementById('auth-login-form');
    const regForm = document.getElementById('auth-register-form');
    const title = document.getElementById('auth-modal-title');

    if (!loginBtn || !regBtn) return;

    if (tab === 'register') {
      loginBtn.classList.remove('active');
      regBtn.classList.add('active');
      loginForm.style.display = 'none';
      regForm.style.display = 'block';
      title.textContent = 'สร้างบัญชีผู้ใช้ใหม่';
    } else {
      regBtn.classList.remove('active');
      loginBtn.classList.add('active');
      regForm.style.display = 'none';
      loginForm.style.display = 'block';
      title.textContent = 'เข้าสู่ระบบ AI Learning Hub';
    }
  },

  handleAuthLogin(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');
    if (!usernameInput || !passwordInput) return;

    const res = window.Auth.login(usernameInput.value, passwordInput.value);
    if (res.success) {
      window.UI.showToast(res.message, 'success');
      window.UI.closeAuthModal();
      // Reload profile data if on profile page
      if (typeof window.loadProfileData === 'function') {
        window.loadProfileData();
      }
    } else {
      window.UI.showToast(res.message, 'error');
    }
  },

  handleAuthRegister(event) {
    event.preventDefault();
    const username = document.getElementById('reg-username').value;
    const displayName = document.getElementById('reg-displayname').value;
    const avatar = document.getElementById('reg-avatar').value;
    const educationLevel = document.getElementById('reg-level').value;
    const password = document.getElementById('reg-password').value;

    const res = window.Auth.register({ username, displayName, avatar, educationLevel, password });
    if (res.success) {
      window.UI.showToast(res.message, 'success');
      window.UI.closeAuthModal();
      // Reload profile data if on profile page
      if (typeof window.loadProfileData === 'function') {
        window.loadProfileData();
      }
    } else {
      window.UI.showToast(res.message, 'error');
    }
  },

  fillDemoAccount(username, password) {
    const uInput = document.getElementById('login-username');
    const pInput = document.getElementById('login-password');
    if (uInput && pInput) {
      uInput.value = username;
      pInput.value = password;
      window.UI.showToast(`กรอกข้อมูลบัญชี ${username} เรียบร้อยแล้ว`, 'info');
    }
  },

  togglePasswordVisibility(inputId, btnEl) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      btnEl.textContent = '🙈';
    } else {
      input.type = 'password';
      btnEl.textContent = '👁️';
    }
  },

  handlePasswordInput(val) {
    const strength = window.Auth.checkPasswordStrength(val);
    const bar = document.getElementById('reg-strength-bar');
    const text = document.getElementById('reg-strength-text');
    if (bar && text) {
      bar.style.width = `${strength.percent}%`;
      bar.style.backgroundColor = strength.color;
      text.textContent = strength.label;
      text.style.color = strength.color;
    }
  },

  handleGeneratePassword(targetInputId) {
    const generated = window.Auth.generateStrongPassword(12);
    const input = document.getElementById(targetInputId);
    if (input) {
      input.value = generated;
      input.type = 'text'; // Show generated password immediately
      this.handlePasswordInput(generated);
    }

    // Show result widget
    const widget = document.getElementById('reg-pwd-widget');
    const box = document.getElementById('reg-pwd-box');
    if (widget && box) {
      widget.style.display = 'block';
      box.textContent = generated;
    }

    window.UI.showToast('🎲 สุ่มสร้างรหัสผ่านปลอดภัยสำเร็จแล้ว!', 'success');
  },

  copyGeneratedPassword() {
    const box = document.getElementById('reg-pwd-box');
    if (box && box.textContent) {
      navigator.clipboard.writeText(box.textContent).then(() => {
        window.UI.showToast('📋 คัดลอกรหัสผ่านลงคลิปบอร์ดแล้ว', 'success');
      }).catch(() => {
        window.UI.showToast('ไม่สามารถคัดลอกได้อัตโนมัติ กรุณาคัดลอกด้วยตนเอง', 'warning');
      });
    }
  }
};

window.UI = UI;

