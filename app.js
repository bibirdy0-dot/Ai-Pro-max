/**
 * AI Learning Hub - Global Application Controller (app.js)
 * จัดการ Navbar, Mobile Menu, Floating Compare Bar, และ Event Listeners ทั่วไป
 */

const App = {
  init() {
    App.highlightActiveNav();
    App.setupHamburgerMenu();
    App.setupFloatingCompareBar();
    App.updateFavoriteCount();
    App.setupAuthNavbar();
    App.setupMobileBottomNav();

    // ฟัง Event เมื่อรายการโปรดหรือการเปรียบเทียบเปลี่ยน
    window.addEventListener('aihub:favorite-changed', () => {
      App.updateFavoriteCount();
      App.updateMobileNavBadge();
    });

    window.addEventListener('aihub:compare-changed', () => {
      App.setupFloatingCompareBar();
    });

    // ฟัง Event เมื่อสถานะ Authentication เปลี่ยนแปลง
    window.addEventListener('aihub:auth-state-changed', () => {
      App.setupAuthNavbar();
      App.setupMobileBottomNav();
    });
  },

  highlightActiveNav() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.includes(currentPath)) {
        link.classList.add('active');
      } else if (currentPath === '' || currentPath === 'index.html') {
        if (href === 'index.html' || href === './index.html' || href === '../index.html') {
          link.classList.add('active');
        }
      }
    });
  },

  setupHamburgerMenu() {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburgerBtn && navMenu) {
      // สร้าง Backdrop ถ้ายังไม่มี
      let backdrop = document.getElementById('drawer-backdrop');
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'drawer-backdrop';
        backdrop.style.cssText = `
          position: fixed; inset: 0; background: rgba(0,0,0,0.65);
          backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
          z-index: 1190; opacity: 0; pointer-events: none;
          transition: opacity 0.3s ease;
        `;
        document.body.appendChild(backdrop);
      }

      const toggleMenu = (open) => {
        const isOpen = open !== undefined ? open : !navMenu.classList.contains('open');
        navMenu.classList.toggle('open', isOpen);
        hamburgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        if (backdrop) {
          backdrop.style.opacity = isOpen ? '1' : '0';
          backdrop.style.pointerEvents = isOpen ? 'auto' : 'none';
        }
      };

      hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
      });

      if (backdrop) {
        backdrop.addEventListener('click', () => toggleMenu(false));
      }

      // ปิดเมนูเมื่อกดเลือกลิงก์
      navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => toggleMenu(false));
      });
    }
  },

  updateFavoriteCount() {
    const badge = document.getElementById('nav-fav-count');
    if (badge) {
      const favs = window.DataLayer.getFavorites();
      badge.textContent = favs.length;
      badge.style.display = favs.length > 0 ? 'inline-flex' : 'none';
    }
  },

  async setupFloatingCompareBar() {
    let bar = document.getElementById('compare-floating-bar');
    const compareList = window.DataLayer.getCompareList();

    if (!bar && compareList.length > 0) {
      bar = document.createElement('div');
      bar.id = 'compare-floating-bar';
      document.body.appendChild(bar);
    }

    if (!bar) return;

    if (compareList.length === 0) {
      bar.classList.remove('active');
      return;
    }

    const allAI = await window.DataLayer.getAllAI();
    const selectedAIs = allAI.filter(a => compareList.includes(a.id));

    const comparePageUrl = window.location.pathname.includes('/ai/') || window.location.pathname.includes('/admin/')
      ? '../compare.html'
      : 'compare.html';

    bar.innerHTML = `
      <div style="font-weight: 700; font-size: 0.9rem; color: var(--accent-cyan);">
        ⚖️ เปรียบเทียบ (${selectedAIs.length}/4):
      </div>
      <div class="compare-chips-list">
        ${selectedAIs.map(ai => `
          <div class="compare-chip">
            <span>${ai.name}</span>
            <span onclick="window.App.handleRemoveCompare('${ai.id}')" style="cursor: pointer; opacity: 0.7; font-weight: bold;">✕</span>
          </div>
        `).join('')}
      </div>
      <div style="display: flex; gap: 0.5rem;">
        <a href="${comparePageUrl}" class="btn btn-primary btn-sm">เปิดตารางเปรียบเทียบ</a>
        <button class="btn btn-outline btn-sm" onclick="window.DataLayer.clearCompare()">ล้าง</button>
      </div>
    `;

    bar.classList.add('active');
  },

  handleToggleFavorite(aiId, btnElement) {
    const isAdded = window.DataLayer.toggleFavorite(aiId);
    if (btnElement) {
      btnElement.classList.toggle('favorited', isAdded);
      btnElement.innerHTML = isAdded ? '❤️' : '♡';
    }
    window.UI.showToast(isAdded ? 'บันทึกลงในรายการโปรดแล้ว' : 'ลบออกจากรายการโปรดแล้ว', isAdded ? 'success' : 'info');
  },

  handleToggleCompare(aiId) {
    const res = window.DataLayer.addToCompare(aiId);
    if (res.success) {
      window.UI.showToast('เพิ่มลงในรายการเปรียบเทียบแล้ว', 'success');
    } else {
      window.UI.showToast(res.message, 'warning');
    }
  },

  handleRemoveCompare(aiId) {
    window.DataLayer.removeFromCompare(aiId);
    window.UI.showToast('นำออกจากรายการเปรียบเทียบแล้ว', 'info');
  },

  setupAuthNavbar() {
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;

    // ตรวจสอบสถานะ User จาก Auth module
    const currentUser = window.Auth ? window.Auth.getCurrentUser() : null;
    const isProfilePage = window.location.pathname.endsWith('profile.html');
    const profileUrl = window.location.pathname.includes('/ai/') || window.location.pathname.includes('/admin/')
      ? '../profile.html'
      : 'profile.html';

    // ลบ profile-btn เก่าหรือ user-nav-wrapper เดิมออกก่อนสร้างใหม่
    const existingWrapper = navActions.querySelector('.user-nav-wrapper');
    const existingProfileBtn = navActions.querySelector('.profile-btn');
    const existingGuestBtn = navActions.querySelector('.guest-auth-btn');

    if (existingWrapper) existingWrapper.remove();
    if (existingProfileBtn) existingProfileBtn.remove();
    if (existingGuestBtn) existingGuestBtn.remove();

    const hamburgerBtn = navActions.querySelector('.hamburger-btn');

    if (currentUser) {
      // ผู้ใช้ล็อกอินแล้ว: แสดง Avatar, ชื่อ และ Dropdown Menu
      const wrapper = document.createElement('div');
      wrapper.className = 'user-nav-wrapper';
      wrapper.innerHTML = `
        <button type="button" class="profile-btn" id="nav-user-menu-btn" onclick="window.App.toggleUserDropdown(event)" aria-expanded="false">
          <div class="profile-avatar-pill">${currentUser.avatar || '🎓'}</div>
          <span>${currentUser.displayName || currentUser.username}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-left: 2px; opacity: 0.7;"><path d="M6 9l6 6 6-6"/></svg>
        </button>

        <div class="user-nav-dropdown" id="nav-user-dropdown">
          <div class="user-dropdown-header">
            <div class="user-dropdown-name">${currentUser.displayName || currentUser.username}</div>
            <div class="user-dropdown-meta">@${currentUser.username} • ${currentUser.educationLevel || 'นักเรียน'}</div>
          </div>
          <a href="${profileUrl}" class="user-dropdown-item">
            <span>👤</span>
            <span>จัดการข้อมูลโปรไฟล์</span>
          </a>
          <button type="button" class="user-dropdown-item" onclick="window.UI.showAuthModal('register')">
            <span>➕</span>
            <span>สร้างบัญชีอื่นเพิ่ม</span>
          </button>
          <button type="button" class="user-dropdown-item danger" onclick="window.App.handleLogout()">
            <span>🚪</span>
            <span>ออกจากระบบ</span>
          </button>
        </div>
      `;

      if (hamburgerBtn) {
        navActions.insertBefore(wrapper, hamburgerBtn);
      } else {
        navActions.appendChild(wrapper);
      }
    } else {
      // ผู้ใช้ยังไม่ล็อกอิน: แสดงปุ่ม เข้าสู่ระบบ / สร้างบัญชี
      const guestBtn = document.createElement('button');
      guestBtn.type = 'button';
      guestBtn.className = 'btn btn-primary btn-sm guest-auth-btn';
      guestBtn.style.padding = '0.45rem 0.9rem';
      guestBtn.style.fontSize = '0.85rem';
      guestBtn.innerHTML = `<span>🔑 เข้าสู่ระบบ / สมัคร</span>`;
      guestBtn.onclick = () => window.UI.showAuthModal('login');

      if (hamburgerBtn) {
        navActions.insertBefore(guestBtn, hamburgerBtn);
      } else {
        navActions.appendChild(guestBtn);
      }
    }

    // ปิด dropdown เมื่อกดข้างนอก
    document.addEventListener('click', (e) => {
      const dropdown = document.getElementById('nav-user-dropdown');
      const btn = document.getElementById('nav-user-menu-btn');
      if (dropdown && btn && !dropdown.contains(e.target) && !btn.contains(e.target)) {
        dropdown.classList.remove('show');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  },

  toggleUserDropdown(event) {
    event.stopPropagation();
    const dropdown = document.getElementById('nav-user-dropdown');
    const btn = document.getElementById('nav-user-menu-btn');
    if (dropdown) {
      const isOpen = dropdown.classList.toggle('show');
      if (btn) btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }
  },

  handleLogout() {
    if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
      const res = window.Auth.logout();
      window.UI.showToast(res.message, 'info');
      // Reload profile page if on profile page
      if (window.location.pathname.endsWith('profile.html')) {
        setTimeout(() => window.location.reload(), 400);
      }
    }
  },

  /**
   * สร้าง Mobile Bottom Navigation Bar สไตล์ Native App
   */
  setupMobileBottomNav() {
    let bottomNav = document.getElementById('mobile-bottom-nav');
    if (!bottomNav) {
      bottomNav = document.createElement('nav');
      bottomNav.id = 'mobile-bottom-nav';
      bottomNav.className = 'mobile-bottom-nav';
      bottomNav.setAttribute('aria-label', 'Mobile Bottom Navigation');
      document.body.appendChild(bottomNav);
    }

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const isSubDir = window.location.pathname.includes('/ai/') || window.location.pathname.includes('/admin/');
    const prefix = isSubDir ? '../' : '';

    const favCount = window.DataLayer ? window.DataLayer.getFavorites().length : 0;
    const currentUser = window.Auth ? window.Auth.getCurrentUser() : null;

    const navItems = [
      {
        path: 'index.html',
        url: `${prefix}index.html`,
        icon: '🏠',
        label: 'หน้าแรก',
        isActive: currentPath === '' || currentPath === 'index.html'
      },
      {
        path: 'discover.html',
        url: `${prefix}discover.html`,
        icon: '🔍',
        label: 'ค้นหา AI',
        isActive: currentPath === 'discover.html'
      },
      {
        path: 'compare.html',
        url: `${prefix}compare.html`,
        icon: '⚖️',
        label: 'เปรียบเทียบ',
        isActive: currentPath === 'compare.html'
      },
      {
        path: 'favorites.html',
        url: `${prefix}favorites.html`,
        icon: '❤️',
        label: 'รายการโปรด',
        badge: favCount > 0 ? favCount : null,
        badgeId: 'mobile-fav-badge',
        isActive: currentPath === 'favorites.html'
      },
      {
        path: 'profile.html',
        url: `${prefix}profile.html`,
        icon: currentUser ? (currentUser.avatar || '🎓') : '👤',
        label: currentUser ? (currentUser.displayName || currentUser.username) : 'บัญชี/โปรไฟล์',
        isActive: currentPath === 'profile.html'
      }
    ];

    bottomNav.innerHTML = navItems.map(item => `
      <a href="${item.url}" class="mobile-nav-item ${item.isActive ? 'active' : ''}">
        <span class="mobile-nav-icon">${item.icon}</span>
        <span>${item.label}</span>
        ${item.badgeId ? `<span class="mobile-nav-badge" id="${item.badgeId}" style="${item.badge ? 'display:flex;' : 'display:none;'}">${item.badge || 0}</span>` : ''}
      </a>
    `).join('');
  },

  updateMobileNavBadge() {
    const badge = document.getElementById('mobile-fav-badge');
    if (badge && window.DataLayer) {
      const favs = window.DataLayer.getFavorites();
      badge.textContent = favs.length;
      badge.style.display = favs.length > 0 ? 'flex' : 'none';
    }
  }
};

window.App = App;

// เมื่อ DOM โหลดเสร็จ เริ่มทำงานทันที
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
