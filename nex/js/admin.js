/**
 * AI Learning Hub - Admin Demo Dashboard Module (admin.js)
 * จัดการ Catalog AI, อนุมัติ/ปฏิเสธ Submissions, สถิติภาพรวม
 */

const AdminDashboard = {
  async init() {
    AdminDashboard.renderStats();
    AdminDashboard.renderSubmissions();
    AdminDashboard.renderCatalog();
  },

  async renderStats() {
    const allAI = await window.DataLayer.getAllAI();
    const subs = window.DataLayer.getSubmissions();
    const reviews = window.DataLayer.safeGetStorage(window.DataLayer.STORAGE_KEYS.REVIEWS, {});
    
    let totalReviews = 0;
    Object.values(reviews).forEach(arr => totalReviews += arr.length);

    document.getElementById('stat-total-ai').textContent = allAI.length;
    document.getElementById('stat-pending-subs').textContent = subs.filter(s => s.status === 'pending').length;
    document.getElementById('stat-user-reviews').textContent = totalReviews;
  },

  renderSubmissions() {
    const container = document.getElementById('admin-submissions-tbody');
    if (!container) return;

    const subs = window.DataLayer.getSubmissions();
    if (subs.length === 0) {
      container.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem; color: var(--text-tertiary);">ไม่มีรายการเสนอ AI</td></tr>`;
      return;
    }

    container.innerHTML = subs.map(s => `
      <tr>
        <td><strong>${s.name}</strong></td>
        <td><a href="${s.url}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-cyan); font-size: 0.85rem;">${s.url}</a></td>
        <td><span class="badge badge-purple">${s.category}</span></td>
        <td>
          <span class="badge ${s.status === 'approved' ? 'badge-verified' : (s.status === 'rejected' ? 'badge-demo' : 'badge-cyan')}">
            ${s.status}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 0.4rem;">
            <button class="btn btn-primary btn-sm" onclick="AdminDashboard.updateStatus('${s.id}', 'approved')">อนุมัติ</button>
            <button class="btn btn-secondary btn-sm" onclick="AdminDashboard.updateStatus('${s.id}', 'rejected')">ปฏิเสธ</button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  updateStatus(subId, status) {
    window.DataLayer.updateSubmissionStatus(subId, status);
    window.UI.showToast(`ปรับสถานะ Submission เป็น "${status}" เรียบร้อยแล้ว`, 'info');
    AdminDashboard.renderStats();
    AdminDashboard.renderSubmissions();
  },

  async renderCatalog() {
    const container = document.getElementById('admin-catalog-tbody');
    if (!container) return;

    const allAI = await window.DataLayer.getAllAI();
    container.innerHTML = allAI.map(ai => `
      <tr>
        <td>
          <strong>${ai.name}</strong>
        </td>
        <td>${ai.developer}</td>
        <td><span class="badge badge-cyan">${ai.pricing}</span></td>
        <td>${ai.categories.join(', ')}</td>
        <td>
          <a href="../ai/detail.html?id=${ai.id}" class="btn btn-outline btn-sm">ดูหน้าจริง</a>
        </td>
      </tr>
    `).join('');
  }
};

window.AdminDashboard = AdminDashboard;
