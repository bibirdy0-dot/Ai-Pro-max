/**
 * AI Learning Hub - Interactive Rating & Review System (rating.js)
 * จัดการ 6-Dimension Rating, Star UI, Submission, และ Bayesian Average Visualization
 */

const RatingManager = {
  currentFormDimensions: {
    learningFit: 5,
    accuracy: 5,
    simplicity: 5,
    helpfulness: 5,
    easeOfUse: 5,
    value: 5
  },

  /**
   * เรนเดอร์ทั้ง Section ของคะแนนและรีวิวในหน้า Detail
   */
  renderRatingSection(aiId, demoStats = {}) {
    const ratings = window.DataLayer.getAIRatings(aiId, demoStats.initialRating, demoStats.reviewCount);
    
    // Overall Score & Review Count
    const scoreEl = document.getElementById('rating-big-score');
    if (scoreEl) scoreEl.textContent = `★ ${ratings.overallRating}`;

    const totalReviewsEl = document.getElementById('rating-total-reviews');
    if (totalReviewsEl) totalReviewsEl.textContent = `จากผู้ใช้ ${ratings.reviewCount.toLocaleString()} คน`;

    // Breakdown 6 ด้าน
    RatingManager.renderBreakdown(ratings, 'rating-breakdown-bars');

    // ฟอร์ม 6 มิติ
    RatingManager.renderDimensionInputs('dimension-inputs-container');

    // รายการรีวิว
    RatingManager.renderReviewsList(aiId);
  },

  /**
   * เรนเดอร์ตัวเลือกดาว 6 มิติในฟอร์ม
   */
  renderDimensionInputs(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const dims = window.DataLayer.RATING_DIMENSIONS || [
      { key: 'learningFit', label: 'ความเหมาะกับการเรียน', icon: '🎓' },
      { key: 'accuracy', label: 'ความแม่นยำของข้อมูล', icon: '🎯' },
      { key: 'simplicity', label: 'ความเข้าใจง่าย', icon: '💡' },
      { key: 'helpfulness', label: 'ความเป็นประโยชน์', icon: '🤝' },
      { key: 'easeOfUse', label: 'ความสะดวกในการใช้งาน', icon: '⚡' },
      { key: 'value', label: 'ความคุ้มค่า (ฟรี/ราคา)', icon: '💎' }
    ];

    container.innerHTML = dims.map(dim => `
      <div class="rating-dim-row">
        <div>
          <div style="font-weight: 600; font-size: 0.9rem;">${dim.icon} ${dim.label}</div>
          <div style="font-size: 0.76rem; color: var(--text-tertiary);" id="dim-text-${dim.key}">5 / 5 ดาว</div>
        </div>
        <div class="star-rating-input" data-dim="${dim.key}">
          ${[1, 2, 3, 4, 5].map(star => `
            <button type="button" class="star-btn active" data-value="${star}" 
              onclick="RatingManager.setDimensionRating('${dim.key}', ${star})">★</button>
          `).join('')}
        </div>
      </div>
    `).join('');
  },

  setDimensionRating(dimKey, value) {
    RatingManager.currentFormDimensions[dimKey] = value;
    
    // อัปเดต UI ดาว
    const inputGroup = document.querySelector(`.star-rating-input[data-dim="${dimKey}"]`);
    if (inputGroup) {
      const buttons = inputGroup.querySelectorAll('.star-btn');
      buttons.forEach(btn => {
        const val = Number(btn.getAttribute('data-value'));
        if (val <= value) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    const textEl = document.getElementById(`dim-text-${dimKey}`);
    if (textEl) textEl.textContent = `${value} / 5 ดาว`;
  },

  /**
   * เรนเดอร์ Breakdown 6 ด้าน
   */
  renderBreakdown(ratings, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const dims = window.DataLayer.RATING_DIMENSIONS || [
      { key: 'learningFit', label: 'ความเหมาะกับการเรียน', icon: '🎓' },
      { key: 'accuracy', label: 'ความแม่นยำของข้อมูล', icon: '🎯' },
      { key: 'simplicity', label: 'ความเข้าใจง่าย', icon: '💡' },
      { key: 'helpfulness', label: 'ความเป็นประโยชน์', icon: '🤝' },
      { key: 'easeOfUse', label: 'ความสะดวกในการใช้งาน', icon: '⚡' },
      { key: 'value', label: 'ความคุ้มค่า (ฟรี/ราคา)', icon: '💎' }
    ];

    container.innerHTML = dims.map(dim => {
      const score = Number(ratings.dimensions?.[dim.key] || 4.5);
      const percent = (score / 5) * 100;
      return `
        <div style="margin-bottom: 0.75rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.84rem; margin-bottom: 0.25rem;">
            <span style="color: var(--text-secondary);">${dim.icon} ${dim.label}</span>
            <strong style="color: #fbbf24;">${score.toFixed(1)} / 5</strong>
          </div>
          <div style="height: 6px; background: var(--bg-surface-elevated); border-radius: var(--radius-full); overflow: hidden;">
            <div style="width: ${percent}%; height: 100%; background: linear-gradient(90deg, #f59e0b, #fbbf24); border-radius: var(--radius-full);"></div>
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * เรนเดอร์รายการรีวิวจาก LocalStorage / Demo Reviews
   */
  renderReviewsList(aiId) {
    const container = document.getElementById('reviews-list');
    if (!container) return;

    const allReviews = window.DataLayer.getAIReviews(aiId);

    if (!allReviews || allReviews.length === 0) {
      container.innerHTML = `
        <div class="empty-state-box" style="padding: 2.5rem 1.5rem; margin: 1rem 0;">
          <div class="empty-state-icon" style="font-size: 2.5rem;">💬</div>
          <h3 class="empty-state-title" style="font-size: 1.15rem;">ยังไม่มีรีวิวสำหรับ AI นี้</h3>
          <p class="empty-state-desc" style="font-size: 0.88rem;">ร่วมเป็นคนแรกที่แชร์ประสบการณ์การใช้งานเพื่อช่วยเพื่อนๆ นักเรียน</p>
        </div>
      `;
      return;
    }

    container.innerHTML = allReviews.map((rev, idx) => `
      <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.35rem; transition: border-color var(--transition-fast);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--gradient-purple); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0;">
              🎓
            </div>
            <div>
              <div style="font-weight: 700; font-size: 0.95rem;">${rev.userName || 'นักเรียน'}</div>
              <div style="font-size: 0.78rem; color: var(--text-tertiary);">${rev.userRole || 'มัธยมปลาย'} • ${rev.date || 'เมื่อเร็วๆ นี้'}</div>
            </div>
          </div>
          <div style="color: #fbbf24; font-weight: 700; font-size: 0.95rem;">
            ★ ${rev.overall ? rev.overall.toFixed(1) : '5.0'}
          </div>
        </div>

        ${rev.useCase ? `
          <div style="font-size: 0.8rem; color: var(--accent-cyan); margin-bottom: 0.5rem;">
            🎯 ใช้สำหรับ: ${rev.useCase}
          </div>
        ` : ''}

        <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; margin-bottom: 0.85rem;">
          ${rev.comment || 'ใช้งานดีมาก ช่วยประหยัดเวลาในการเรียนได้เยอะ'}
        </p>

        <div style="display: flex; justify-content: flex-end; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 0.65rem; font-size: 0.8rem;">
          <button type="button" class="btn btn-ghost btn-xs" onclick="window.RatingManager.handleHelpful(this, '${aiId}', ${idx})" style="color: var(--text-tertiary);">
            👍 มีประโยชน์ (<span class="helpful-count">${rev.helpfulCount || 0}</span>)
          </button>
        </div>
      </div>
    `).join('');
  },

  handleHelpful(btn, aiId, index) {
    const countEl = btn.querySelector('.helpful-count');
    if (countEl && !btn.classList.contains('clicked')) {
      btn.classList.add('clicked');
      btn.style.color = 'var(--accent-cyan)';
      const current = parseInt(countEl.textContent || '0', 10);
      countEl.textContent = current + 1;
      window.UI.showToast('ขอบคุณสำหรับความคิดเห็น!', 'success');
    }
  },

  /**
   * จัดการส่งรีวิว
   */
  handleReviewSubmit(aiId, formEl) {
    const name = formEl.querySelector('[name="userName"]').value.trim() || 'นักเรียน Demo';
    const role = formEl.querySelector('[name="userRole"]').value || 'มัธยมปลาย';
    const useCase = formEl.querySelector('[name="useCase"]').value.trim() || 'การเรียนทั่วไป';
    const comment = formEl.querySelector('[name="comment"]').value.trim();

    if (!comment) {
      window.UI.showToast('กรุณากรอกข้อความรีวิวและประสบการณ์การใช้งาน', 'warning');
      return;
    }

    // คำนวณ Overall จากค่าเฉลี่ย 6 ด้าน
    const dims = RatingManager.currentFormDimensions;
    const dimValues = Object.values(dims);
    const overall = (dimValues.reduce((a, b) => a + b, 0) / dimValues.length).toFixed(1);

    window.DataLayer.saveReview(aiId, {
      userName: name,
      userRole: role,
      useCase: useCase,
      comment: comment,
      overall: Number(overall),
      dimensions: { ...dims },
      date: new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }),
      helpfulCount: 0
    });

    window.UI.showToast('บันทึกรีวิวของคุณลงใน Browser สำเร็จแล้ว! ✓', 'success');
    formEl.reset();
    setTimeout(() => window.location.reload(), 600);
  }
};

window.RatingManager = RatingManager;
