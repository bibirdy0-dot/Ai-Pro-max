/**
 * AI Learning Hub - Favorites Module (favorites.js)
 * จัดการหน้าแสดงรายการ AI ที่ผู้ใช้บันทึกไว้
 */

const FavoritesPage = {
  async init() {
    const container = document.getElementById('favorites-grid');
    const emptyBox = document.getElementById('favorites-empty');
    if (!container) return;

    const favIds = window.DataLayer.getFavorites();
    if (favIds.length === 0) {
      if (emptyBox) emptyBox.style.display = 'block';
      container.innerHTML = '';
      return;
    }

    if (emptyBox) emptyBox.style.display = 'none';

    const allAI = await window.DataLayer.getAllAI();
    const favAIs = allAI.filter(a => favIds.includes(a.id));

    container.innerHTML = favAIs.map(ai => window.UI.renderAICard(ai)).join('');
  },

  clearAll() {
    if (confirm('คุณต้องการลบรายการ AI ที่บันทึกไว้ทั้งหมดหรือไม่?')) {
      window.DataLayer.safeSetStorage(window.DataLayer.STORAGE_KEYS.FAVORITES, []);
      window.UI.showToast('ลบรายการโปรดทั้งหมดเรียบร้อยแล้ว', 'info');
      FavoritesPage.init();
    }
  }
};

window.FavoritesPage = FavoritesPage;
