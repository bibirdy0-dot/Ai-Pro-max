/**
 * AI Learning Hub - Smart Search & Filter Engine (search.js)
 * วิเคราะห์คำค้นหา (Keyword & Student Intent), Filter & Sorter อัจฉริยะ
 */

const SearchEngine = {
  // Keyword mappings สำหรับ Intent ของนักเรียน
  INTENT_KEYWORDS: {
    coding: {
      tokens: ['code', 'coding', 'python', 'javascript', 'c++', 'java', 'html', 'css', 'เขียนโค้ด', 'โปรแกรม', 'แก้บั๊ก', 'อัลกอริทึม'],
      skillKey: 'coding',
      reason: 'AI นี้เหมาะเพราะมีความสามารถด้าน Coding และเขียนโค้ดระดับสูง'
    },
    mathScience: {
      tokens: ['คณิต', 'ฟิสิกส์', 'เคมี', 'ชีวะ', 'math', 'calculus', 'แคลคูลัส', 'แก้โจทย์', 'สูตร', 'สมการ', 'สถิติ', 'วิทยาศาสตร์', 'โครงงาน'],
      skillKey: 'mathScience',
      reason: 'AI นี้เหมาะเพราะเด่นด้าน Math & Science และการคำนวณที่แม่นยำ'
    },
    writing: {
      tokens: ['เขียน', 'เรียงความ', 'บทความ', 'essay', 'เกลา', 'สำนวน', 'ตรวจคำผิด', 'ไวยากรณ์', 'grammar', 'รายงาน', 'เล่มรายงาน'],
      skillKey: 'writing',
      reason: 'AI นี้เหมาะเพราะเด่นด้าน Writing เรียบเรียงภาษาได้อย่างเป็นธรรมชาติ'
    },
    research: {
      tokens: ['ค้นคว้า', 'วิจัย', 'research', 'อ้างอิง', 'บรรณานุกรม', 'citation', 'pdf', 'แหล่งข้อมูล', 'paper', 'วิชาการ'],
      skillKey: 'research',
      reason: 'AI นี้เหมาะเพราะเด่นด้าน Research และการค้นหาข้อมูลพร้อมอ้างอิง'
    },
    creativeMedia: {
      tokens: ['สไลด์', 'presentation', 'ภาพ', 'รูปภาพ', 'วาดรูป', 'โปสเตอร์', 'infographic', 'canva', 'วิดีโอ', 'สร้างสื่อ', 'พรีเซนต์'],
      skillKey: 'creativeMedia',
      reason: 'AI นี้เหมาะเพราะเด่นด้าน Creative & Media ช่วยสร้างสไลด์และสื่อการเรียนรู้'
    },
    translation: {
      tokens: ['แปล', 'แปลภาษา', 'อังกฤษ', 'translate', 'ภาษา', 'ฝึกภาษา'],
      skillKey: 'writing',
      reason: 'AI นี้เหมาะเพราะเชี่ยวชาญการแปลภาษาและตรวจทานไวยากรณ์'
    },
    learning: {
      tokens: ['สรุป', 'เรียน', 'ติว', 'สอบ', 'ทำความเข้าใจ', 'อธิบาย', 'สอน', 'บทเรียน', 'ม.ปลาย', 'ม.ต้น', 'มหาลัย'],
      skillKey: 'learning',
      reason: 'AI นี้เหมาะเพราะเด่นด้าน Learning อธิบายคอนเซปต์ยากๆ ให้เข้าใจง่าย'
    }
  },

  /**
   * ค้นหาและวิเคราะห์ Query
   */
  search(aiList, query = '', filters = {}, sortBy = 'recommended') {
    const rawQuery = query.trim().toLowerCase();
    const tokens = rawQuery ? rawQuery.split(/\s+/) : [];

    // 1. ตรวจจับ Intent
    let detectedIntent = null;
    if (rawQuery) {
      for (const [key, conf] of Object.entries(SearchEngine.INTENT_KEYWORDS)) {
        if (conf.tokens.some(t => rawQuery.includes(t))) {
          detectedIntent = conf;
          break;
        }
      }
    }

    // 2. กรองข้อมูล (Filtering)
    let filtered = aiList.filter(ai => {
      // Query Match
      if (tokens.length > 0) {
        const fullText = [
          ai.name,
          ai.developer,
          ai.tagline,
          ai.description,
          ...ai.categories,
          ...ai.useCases,
          ...ai.subjects,
          ...ai.educationLevel || [],
          ai.pricing
        ].join(' ').toLowerCase();

        // ตรวจสอบว่ามี token ตรงไหม
        const hasMatch = tokens.some(token => fullText.includes(token));
        if (!hasMatch) return false;
      }

      // Filter: Category
      if (filters.category && filters.category !== 'All') {
        if (!ai.categories.includes(filters.category)) return false;
      }

      // Filter: Subject
      if (filters.subject && filters.subject !== 'All') {
        if (!ai.subjects.includes(filters.subject) && !ai.subjects.includes('ทั่วไป') && !ai.subjects.includes('ทุกวิชา')) {
          return false;
        }
      }

      // Filter: Pricing
      if (filters.pricing && filters.pricing !== 'All') {
        if (filters.pricing === 'Free' && ai.pricing !== 'Free') return false;
        if (filters.pricing === 'Freemium' && ai.pricing !== 'Freemium' && ai.pricing !== 'Free') return false;
      }

      // Filter: Min Skill
      if (filters.skill && filters.minSkillScore) {
        if ((ai.skills[filters.skill] || 0) < Number(filters.minSkillScore)) return false;
      }

      // Filter: Platform
      if (filters.platform && filters.platform !== 'All') {
        if (!ai.platforms.some(p => p.toLowerCase().includes(filters.platform.toLowerCase()))) return false;
      }

      return true;
    });

    // 3. จัดเรียง (Sorting)
    filtered.sort((a, b) => {
      const statsA = window.DataLayer.getAIRatings(a.id, a.demoStats?.initialRating, a.demoStats?.reviewCount);
      const statsB = window.DataLayer.getAIRatings(b.id, b.demoStats?.initialRating, b.demoStats?.reviewCount);

      switch (sortBy) {
        case 'rating':
          return statsB.overallRating - statsA.overallRating;
        case 'reviews':
          return statsB.reviewCount - statsA.reviewCount;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'recommended':
        default:
          if (detectedIntent && detectedIntent.skillKey) {
            return (b.skills[detectedIntent.skillKey] || 0) - (a.skills[detectedIntent.skillKey] || 0);
          }
          return statsB.overallRating - statsA.overallRating;
      }
    });

    // 4. แยก Best Match vs Other Matches
    let bestMatches = [];
    let otherMatches = [];

    if (detectedIntent && filtered.length > 0) {
      // ตัวที่มีคะแนน Skill ด้านนั้นสูงสุดและคะแนนเกิน 90 ให้เป็น Best Match
      bestMatches = filtered.filter(ai => (ai.skills[detectedIntent.skillKey] || 0) >= 88).slice(0, 2);
      otherMatches = filtered.filter(ai => !bestMatches.some(bm => bm.id === ai.id));
    } else {
      otherMatches = filtered;
    }

    return {
      query: rawQuery,
      detectedIntent,
      bestMatches,
      otherMatches,
      total: filtered.length
    };
  }
};

window.SearchEngine = SearchEngine;
