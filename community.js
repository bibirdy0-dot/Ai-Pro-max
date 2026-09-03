/**
 * AI Learning Hub - Community Submission Module (community.js)
 * จัดการการเสนอ AI ใหม่จากชุมชนนักเรียน
 */

const CommunityModule = {
  init() {
    const listContainer = document.getElementById('community-submissions-list');
    if (listContainer) {
      const submissions = window.DataLayer.getSubmissions();
      listContainer.innerHTML = submissions.map(sub => `
        <div class="ai-card" style="margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
            <div>
              <h4 style="font-size: 1.15rem; font-weight: 700; color: var(--text-primary);">${sub.name}</h4>
              <a href="${sub.url}" target="_blank" rel="noopener noreferrer" style="font-size: 0.82rem; color: var(--accent-cyan);">
                🔗 ${sub.url}
              </a>
            </div>
            <span class="badge ${sub.status === 'approved' ? 'badge-verified' : 'badge-demo'}">
              ${sub.status === 'approved' ? 'อนุมัติแล้ว' : 'รอตรวจสอบ (Pending)'}
            </span>
          </div>
          <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
            <strong>เหตุผลที่แนะนำ:</strong> ${sub.whyRecommend}
          </p>
          <div style="font-size: 0.8rem; color: var(--text-tertiary);">
            หมวดหมู่: <span class="badge badge-purple">${sub.category}</span> • เสนอโดย: ${sub.submittedBy} (${sub.submittedDate})
          </div>
        </div>
      `).join('');
    }

    const form = document.getElementById('community-submit-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = form.querySelector('[name="name"]').value.trim();
        const url = form.querySelector('[name="url"]').value.trim();
        const category = form.querySelector('[name="category"]').value;
        const useCase = form.querySelector('[name="useCase"]').value.trim();
        const whyRecommend = form.querySelector('[name="whyRecommend"]').value.trim();
        const submittedBy = form.querySelector('[name="submittedBy"]').value.trim() || 'เพื่อนนักเรียน';

        if (!name || !url || !whyRecommend) {
          window.UI.showToast('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน', 'warning');
          return;
        }

        // Basic URL validator
        try {
          new URL(url);
        } catch (_) {
          window.UI.showToast('กรุณากรอก URL ที่ถูกต้อง เช่น https://example.com', 'error');
          return;
        }

        window.DataLayer.submitCommunityAI({
          name, url, category, useCase, whyRecommend, submittedBy
        });

        window.UI.showToast('ส่งข้อเสนอ AI เรียบร้อยแล้ว! (Demo: ข้อมูลถูกเก็บไว้ใน Browser)', 'success');
        form.reset();
        setTimeout(() => CommunityModule.init(), 500);
      });
    }
  }
};

window.CommunityModule = CommunityModule;
