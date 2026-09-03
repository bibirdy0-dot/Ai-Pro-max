/**
 * AI Learning Hub - Comparison Module (compare.js)
 * จัดการการเปรียบเทียบ AI 2-4 ตัว พร้อมตาราง Matrix และ Highlights Summary
 */

const CompareManager = {
  /**
   * สร้าง Highlight Cards + Human Summary สรุปความต่างของ AI
   */
  generateHumanSummary(aiList) {
    if (!aiList || aiList.length < 2) return '';

    // 1. หาตัวเด่นที่สุดสำหรับการเรียน (Learning + Reasoning)
    const bestLearning = [...aiList].sort((a, b) => 
      ((b.skills.learning || 0) + (b.skills.reasoning || 0)) - 
      ((a.skills.learning || 0) + (a.skills.reasoning || 0))
    )[0];

    // 2. หาตัวคุ้มค่าที่สุด (Free หรือ Freemium ที่คะแนนคุ้มค่า)
    const freeList = aiList.filter(a => a.pricing === 'Free' || a.pricing.includes('Free for Students'));
    const bestValue = freeList.length > 0 ? freeList[0] : aiList.find(a => a.pricing === 'Freemium') || aiList[0];

    // 3. หาตัวเด่น Coding
    const topCoder = [...aiList].sort((a, b) => (b.skills.coding || 0) - (a.skills.coding || 0))[0];

    // 4. หาตัวเด่น Math & Science
    const topMath = [...aiList].sort((a, b) => (b.skills.mathScience || 0) - (a.skills.mathScience || 0))[0];

    return `
      <!-- Highlight Badges Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1.75rem;">
        
        <div style="background: var(--bg-surface-elevated); border: 1px solid rgba(34,211,238,0.3); border-radius: var(--radius-md); padding: 1.15rem;">
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--accent-cyan); margin-bottom: 0.35rem;">🏆 เหมาะที่สุดสำหรับการเรียน</div>
          <div style="font-size: 1.1rem; font-weight: 800; margin-bottom: 0.2rem;">${bestLearning.name}</div>
          <div style="font-size: 0.78rem; color: var(--text-tertiary);">ทักษะ Learning & Reasoning รวมสูงสุด</div>
        </div>

        <div style="background: var(--bg-surface-elevated); border: 1px solid rgba(16,185,129,0.3); border-radius: var(--radius-md); padding: 1.15rem;">
          <div style="font-size: 0.8rem; font-weight: 700; color: #34d399; margin-bottom: 0.35rem;">💰 คุ้มค่าที่สุด (ฟรี/ประหยัด)</div>
          <div style="font-size: 1.1rem; font-weight: 800; margin-bottom: 0.2rem;">${bestValue.name}</div>
          <div style="font-size: 0.78rem; color: var(--text-tertiary);">${bestValue.pricing} (${bestValue.pricingDetails || 'เวอร์ชันฟรีสมบูรณ์'})</div>
        </div>

        <div style="background: var(--bg-surface-elevated); border: 1px solid rgba(99,102,241,0.3); border-radius: var(--radius-md); padding: 1.15rem;">
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--accent-indigo); margin-bottom: 0.35rem;">💻 เด่นด้าน Coding</div>
          <div style="font-size: 1.1rem; font-weight: 800; margin-bottom: 0.2rem;">${topCoder.name}</div>
          <div style="font-size: 0.78rem; color: var(--text-tertiary);">ทักษะ Coding ${topCoder.skills.coding}/100</div>
        </div>

        <div style="background: var(--bg-surface-elevated); border: 1px solid rgba(245,158,11,0.3); border-radius: var(--radius-md); padding: 1.15rem;">
          <div style="font-size: 0.8rem; font-weight: 700; color: #fbbf24; margin-bottom: 0.35rem;">🔬 เด่นด้าน คณิต-วิทย์</div>
          <div style="font-size: 1.1rem; font-weight: 800; margin-bottom: 0.2rem;">${topMath.name}</div>
          <div style="font-size: 0.78rem; color: var(--text-tertiary);">ทักษะ Math & Science ${topMath.skills.mathScience}/100</div>
        </div>

      </div>
    `;
  },

  /**
   * สร้างตารางเปรียบเทียบ Matrix
   */
  renderMatrixTable(aiList) {
    if (!aiList || aiList.length < 2) {
      return `
        <div class="empty-state-box">
          <div class="empty-state-icon">⚖️</div>
          <h3 class="empty-state-title">เลือก AI อย่างน้อย 2 ตัวเพื่อเริ่มเปรียบเทียบ</h3>
          <p class="empty-state-desc">กดปุ่ม "เปรียบเทียบ" บน AI Card ในหน้าค้นหาเพื่อนำมาเปรียบเทียบคุณสมบัติคู่ขนาน</p>
          <a href="discover.html" class="btn btn-primary">ค้นหา AI เพื่อเปรียบเทียบ</a>
        </div>
      `;
    }

    const ratings = aiList.map(ai => window.DataLayer.getAIRatings(ai.id, ai.demoStats?.initialRating, ai.demoStats?.reviewCount));

    return `
      <div style="overflow-x: auto; padding-bottom: 1rem;">
        <table class="compare-matrix-table">
          <thead>
            <tr>
              <th style="width: 180px;">คุณสมบัติ / AI</th>
              ${aiList.map(ai => `
                <th style="min-width: 200px; text-align: center;">
                  <div style="font-size: 1.25rem; font-weight: 800; margin-bottom: 0.2rem;">${ai.name}</div>
                  <div style="font-size: 0.78rem; color: var(--text-tertiary); margin-bottom: 0.75rem;">${ai.developer}</div>
                  <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                    <a href="ai/detail.html?id=${ai.id}" class="btn btn-secondary btn-xs">
                      ดูรายละเอียด
                    </a>
                    <a href="${ai.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-xs">
                      🚀 ใช้งาน AI จริง
                    </a>
                  </div>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>คะแนนรวมเฉลี่ย</strong></td>
              ${ratings.map(r => `
                <td style="text-align: center;">
                  <span style="font-size: 1.1rem; font-weight: 700; color: #fbbf24;">★ ${r.overallRating}</span>
                  <div style="font-size: 0.75rem; color: var(--text-tertiary);">(${r.reviewCount} รีวิว Demo)</div>
                </td>
              `).join('')}
            </tr>
            <tr>
              <td><strong>ระดับราคา & เวอร์ชันฟรี</strong></td>
              ${aiList.map(ai => `
                <td style="text-align: center;">
                  <span class="badge ${ai.pricing === 'Free' ? 'badge-verified' : 'badge-cyan'}">${ai.pricing}</span>
                  <div style="font-size: 0.8rem; color: var(--text-tertiary); margin-top: 0.3rem;">${ai.pricingDetails || ''}</div>
                </td>
              `).join('')}
            </tr>
            <tr>
              <td><strong>8-Skill Radar Matrix</strong></td>
              ${aiList.map(ai => `
                <td>
                  ${window.UI.createRadarChartSVG(ai.skills, { size: 240 })}
                </td>
              `).join('')}
            </tr>
            <tr>
              <td><strong>จุดเด่นสำคัญ (Pros)</strong></td>
              ${aiList.map(ai => `
                <td>
                  <ul style="padding-left: 1.1rem; font-size: 0.86rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 0.35rem;">
                    ${ai.pros.map(p => `<li>${p}</li>`).join('')}
                  </ul>
                </td>
              `).join('')}
            </tr>
            <tr>
              <td><strong>ข้อสังเกต & ข้อจำกัด</strong></td>
              ${aiList.map(ai => `
                <td>
                  <ul style="padding-left: 1.1rem; font-size: 0.86rem; color: var(--text-tertiary); display: flex; flex-direction: column; gap: 0.35rem;">
                    ${ai.cons.map(c => `<li>${c}</li>`).join('')}
                  </ul>
                </td>
              `).join('')}
            </tr>
            <tr>
              <td><strong>แพลตฟอร์ม</strong></td>
              ${aiList.map(ai => `
                <td style="text-align: center; font-size: 0.86rem; color: var(--text-secondary);">
                  ${ai.platforms.join(', ')}
                </td>
              `).join('')}
            </tr>
            <tr>
              <td><strong>จัดการ</strong></td>
              ${aiList.map(ai => `
                <td style="text-align: center;">
                  <button type="button" class="btn btn-outline btn-xs" onclick="window.CompareManager.handleRemove('${ai.id}')" style="color: var(--accent-rose); border-color: rgba(244, 63, 94, 0.3);">
                    ลบออก
                  </button>
                </td>
              `).join('')}
            </tr>
          </tbody>
        </table>
      </div>
    `;
  },

  handleRemove(aiId) {
    window.DataLayer.removeFromCompare(aiId);
    window.location.reload();
  }
};

window.CompareManager = CompareManager;
