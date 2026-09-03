/**
 * AI Learning Hub - Recommendation Engine (recommendation.js)
 * คำนวณความเหมาะสม (Recommendation Match % 0-100) ตามเงื่อนไขของนักเรียน
 * โดยคำนวณจาก Task Fit, Subject Fit, Skill Weights, และ Pricing Fit จากข้อมูลจริง ไม่มีการสุ่ม
 */

const RecommendationEngine = {
  // Mapping วัตถุประสงค์ (Task) ไปยังน้ำหนัก 8 Skills
  TASK_SKILL_WEIGHTS: {
    'learn': { learning: 0.4, reasoning: 0.3, productivity: 0.3 },
    'math': { mathScience: 0.5, reasoning: 0.3, learning: 0.2 },
    'write': { writing: 0.5, reasoning: 0.3, research: 0.2 },
    'code': { coding: 0.5, reasoning: 0.3, productivity: 0.2 },
    'research': { research: 0.5, writing: 0.3, reasoning: 0.2 },
    'presentation': { creativeMedia: 0.5, productivity: 0.3, writing: 0.2 },
    'language': { writing: 0.4, learning: 0.4, productivity: 0.2 }
  },

  /**
   * คำนวณคะแนนความเหมาะสม (0 - 100) ของ AI แต่ละตัว
   * @param {Object} ai - ข้อมูล AI
   * @param {Object} criteria - { level, task, subject, freeOnly, answerStyle }
   */
  calculateMatchScore(ai, criteria = {}) {
    let score = 0;
    const reasons = [];

    // 1. Task & Skill Fit (สูงสุด 50 คะแนน)
    const weights = RecommendationEngine.TASK_SKILL_WEIGHTS[criteria.task] || { learning: 0.4, reasoning: 0.3, productivity: 0.3 };
    let skillWeightedSum = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([skillKey, weight]) => {
      const skillScore = ai.skills[skillKey] || 50;
      skillWeightedSum += skillScore * weight;
      totalWeight += weight;
    });

    const skillFit = totalWeight > 0 ? (skillWeightedSum / totalWeight) : 70;
    // ปรับให้มีน้ำหนักสูงสุด 50 คะแนน
    const taskScore = (skillFit / 100) * 50;
    score += taskScore;

    if (skillFit >= 90) {
      reasons.push(`ทักษะตรงกับงานที่คุณต้องการอย่างมาก (${Math.round(skillFit)}/100)`);
    }

    // 2. Subject Fit (สูงสุด 20 คะแนน)
    if (criteria.subject) {
      const sub = criteria.subject.toLowerCase();
      const directSubject = ai.subjects.some(s => s.toLowerCase().includes(sub));
      const generalSubject = ai.subjects.includes('ทั่วไป') || ai.subjects.includes('ทุกวิชา');

      if (directSubject) {
        score += 20;
        reasons.push(`รองรับและเชี่ยวชาญวิชา ${criteria.subject} โดยตรง`);
      } else if (generalSubject) {
        score += 15;
        reasons.push(`รองรับหลากหลายสาขาวิชา`);
      } else {
        score += 8;
      }
    } else {
      score += 15;
    }

    // 3. Education Level Fit (สูงสุด 15 คะแนน)
    if (criteria.level && ai.educationLevel) {
      if (ai.educationLevel.includes(criteria.level) || ai.educationLevel.includes('บุคคลทั่วไป')) {
        score += 15;
      } else {
        score += 8;
      }
    } else {
      score += 12;
    }

    // 4. Pricing Fit (สูงสุด 15 คะแนน)
    if (criteria.freeOnly === true || criteria.freeOnly === 'true' || criteria.freeOnly === 'yes') {
      if (ai.pricing === 'Free') {
        score += 15;
        reasons.push('ใช้งานได้ฟรี 100% ตรงตามงบประมาณ');
      } else if (ai.pricing === 'Freemium' || ai.pricing.includes('Free for Students')) {
        score += 12;
        reasons.push('มีเวอร์ชันใช้งานฟรีหรือสิทธิ์ฟรีสำหรับนักเรียน');
      } else {
        score += 2;
      }
    } else {
      score += 15;
    }

    // รวมคะแนนเป็น Recommendation Match (0 - 100)
    const finalMatch = Math.min(99, Math.max(45, Math.round(score)));

    return {
      ai,
      matchScore: finalMatch,
      reasons,
      topSkill: Object.entries(ai.skills).sort((a, b) => b[1] - a[1])[0]
    };
  },

  /**
   * รัน Recommendation และเรียงลำดับผลลัพธ์
   */
  getRecommendations(aiList, criteria) {
    const scored = aiList.map(ai => RecommendationEngine.calculateMatchScore(ai, criteria));
    scored.sort((a, b) => b.matchScore - a.matchScore);

    const bestPick = scored[0];
    const alternatives = scored.slice(1, 4);

    return {
      bestPick,
      alternatives,
      totalEvaluated: aiList.length,
      criteria
    };
  }
};

window.RecommendationEngine = RecommendationEngine;
