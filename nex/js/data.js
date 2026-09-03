/**
 * AI Learning Hub - Data Layer Module (data.js)
 * จัดการการอ่านและบันทึกข้อมูล AI, Reviews, Ratings, Favorites, Submissions, Preferences
 * โดยใช้ LocalStorage และ ai-data.json แยก Logic ออกจาก UI รองรับการเปลี่ยนเป็น API Backend ในอนาคต
 */

const STORAGE_KEYS = {
  FAVORITES: 'aihub_favorites',
  RATINGS: 'aihub_ratings',
  REVIEWS: 'aihub_reviews',
  PREFERENCES: 'aihub_preferences',
  RECENT: 'aihub_recent',
  SUBMISSIONS: 'aihub_submissions',
  COMPARE: 'aihub_compare'
};

// Initial in-memory cache
let _aiCache = null;

/**
 * ป้องกัน JSON Parse Error และดึงข้อมูลจาก LocalStorage อย่างปลอดภัย
 */
function safeGetStorage(key, defaultValue = []) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.warn(`[DataLayer] Failed to parse localStorage for key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * บันทึกข้อมูลลง LocalStorage พร้อม Error Handling
 */
function safeSetStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`[DataLayer] Failed to save to localStorage for key "${key}":`, error);
    return false;
  }
}

/**
 * Helper หา Relative Path ไปยัง data/ai-data.json ไม่ว่าจะเปิดจาก root หรือ subfolder
 */
function getJsonDataPath() {
  const path = window.location.pathname;
  if (path.includes('/ai/') || path.includes('/admin/')) {
    return '../data/ai-data.json';
  }
  return './data/ai-data.json';
}

/**
 * ดึงรายการ AI ทั้งหมดจาก JSON ไฟล์ หรือจาก Cache
 */
async function getAllAI() {
  if (_aiCache && _aiCache.length > 0) {
    return _aiCache;
  }

  // พยายามดึงจาก Supabase Database ก่อน
  if (window.SupabaseService) {
    const client = window.SupabaseService.getClient();
    if (client) {
      try {
        const { data, error } = await client.from('ai_tools').select('*');
        if (!error && data && data.length > 0) {
          _aiCache = data;
          console.log('[DataLayer] Loaded', data.length, 'AI tools from Supabase.');
          return data;
        }
      } catch (err) {
        console.warn('[DataLayer] Supabase query failed, falling back to local JSON:', err);
      }
    }
  }

  try {
    const response = await fetch(getJsonDataPath());
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    const data = await response.json();
    _aiCache = data;
    return data;
  } catch (error) {
    console.error('[DataLayer] Error loading AI data from JSON:', error);
    // Fallback array if fetch fails
    return _aiCache || [];
  }
}

/**
 * ดึงข้อมูล AI รายตัวตาม ID
 */
async function getAIById(id) {
  if (!id) return null;
  const list = await getAllAI();
  return list.find(item => item.id.toLowerCase() === id.toLowerCase()) || null;
}

/**
 * ค้นหาและดึง AI ที่ใกล้เคียงหรือหมวดหมู่เดียวกัน (Similar AI)
 */
async function getSimilarAI(currentId, limit = 3) {
  const current = await getAIById(currentId);
  if (!current) return [];
  
  const all = await getAllAI();
  return all
    .filter(item => item.id !== currentId)
    .map(item => {
      // คำนวณความคล้ายคลึงตาม Category และ Skills
      let score = 0;
      item.categories.forEach(cat => {
        if (current.categories.includes(cat)) score += 3;
      });
      item.subjects.forEach(sub => {
        if (current.subjects.includes(sub)) score += 2;
      });
      return { item, similarity: score };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map(res => res.item);
}

/* =========================================================================
   FAVORITES SYSTEM
   ========================================================================= */

function getFavorites() {
  return safeGetStorage(STORAGE_KEYS.FAVORITES, []);
}

function isFavorite(aiId) {
  const favs = getFavorites();
  return favs.includes(aiId);
}

function toggleFavorite(aiId) {
  const favs = getFavorites();
  let updated;
  let added = false;
  if (favs.includes(aiId)) {
    updated = favs.filter(id => id !== aiId);
  } else {
    updated = [...favs, aiId];
    added = true;
  }
  safeSetStorage(STORAGE_KEYS.FAVORITES, updated);
  
  // Dispatch custom event เพื่อให้ทุก UI Component อัปเดตทันที
  window.dispatchEvent(new CustomEvent('aihub:favorite-changed', {
    detail: { aiId, isFavorite: added, total: updated.length }
  }));

  // Sync กับตาราง favorites บน Supabase
  try {
    const user = window.Auth ? window.Auth.getCurrentUser() : null;
    const client = window.SupabaseService ? window.SupabaseService.getClient() : null;
    if (user && client) {
      if (added) {
        client.from('favorites').insert({ userId: user.id, aiId: aiId }).then();
      } else {
        client.from('favorites').delete().match({ userId: user.id, aiId: aiId }).then();
      }
    }
  } catch (err) {
    console.warn('[DataLayer] Supabase favorite sync error:', err);
  }

  return added;
}

/* =========================================================================
   COMPARE SYSTEM (2-4 AIs)
   ========================================================================= */

function getCompareList() {
  return safeGetStorage(STORAGE_KEYS.COMPARE, []);
}

function addToCompare(aiId) {
  const list = getCompareList();
  if (list.includes(aiId)) return { success: false, message: 'มี AI ตัวนี้อยู่ในรายการเปรียบเทียบแล้ว' };
  if (list.length >= 4) return { success: false, message: 'เปรียบเทียบได้สูงสุด 4 ตัวพร้อมกัน' };
  
  list.push(aiId);
  safeSetStorage(STORAGE_KEYS.COMPARE, list);
  window.dispatchEvent(new CustomEvent('aihub:compare-changed', { detail: { list } }));
  return { success: true, list };
}

function removeFromCompare(aiId) {
  const list = getCompareList().filter(id => id !== aiId);
  safeSetStorage(STORAGE_KEYS.COMPARE, list);
  window.dispatchEvent(new CustomEvent('aihub:compare-changed', { detail: { list } }));
  return list;
}

function clearCompare() {
  safeSetStorage(STORAGE_KEYS.COMPARE, []);
  window.dispatchEvent(new CustomEvent('aihub:compare-changed', { detail: { list: [] } }));
}

/* =========================================================================
   RECENTLY VIEWED
   ========================================================================= */

function getRecentlyViewed() {
  return safeGetStorage(STORAGE_KEYS.RECENT, []);
}

function addRecentlyViewed(aiId) {
  let recent = getRecentlyViewed().filter(id => id !== aiId);
  recent.unshift(aiId);
  if (recent.length > 8) recent = recent.slice(0, 8);
  safeSetStorage(STORAGE_KEYS.RECENT, recent);
}

/* =========================================================================
   RATINGS & REVIEWS (6 Dimensions + Bayesian Average)
   ========================================================================= */

// มิติการให้คะแนนทั้ง 6 ด้าน
const RATING_DIMENSIONS = [
  { key: 'learningFit', label: 'ความเหมาะกับการเรียน', icon: '📚' },
  { key: 'accuracy', label: 'ความแม่นยำ/คุณภาพคำตอบ', icon: '🎯' },
  { key: 'simplicity', label: 'ความเข้าใจง่าย', icon: '💡' },
  { key: 'helpfulness', label: 'ความสามารถในการช่วยทำงาน', icon: '⚡' },
  { key: 'easeOfUse', label: 'ความง่ายในการใช้งาน', icon: '👌' },
  { key: 'value', label: 'ความคุ้มค่า', icon: '💎' }
];

/**
 * ดึงคะแนน Rating รวมและ Breakdown ของ AI จากทั้ง Demo Base Stats และ LocalStorage
 */
function getAIRatings(aiId, initialBaseRating = 4.7, initialReviewCount = 50) {
  const allRatings = safeGetStorage(STORAGE_KEYS.RATINGS, {});
  const aiSpecific = allRatings[aiId] || [];
  
  // Base starting values
  const baseCount = initialReviewCount;
  const baseAvg = initialBaseRating;
  
  if (aiSpecific.length === 0) {
    return {
      overallRating: baseAvg,
      reviewCount: baseCount,
      dimensions: {
        learningFit: baseAvg,
        accuracy: (baseAvg * 0.98).toFixed(1),
        simplicity: (baseAvg * 1.01).toFixed(1),
        helpfulness: baseAvg,
        easeOfUse: (baseAvg * 1.02).toFixed(1),
        value: (baseAvg * 0.99).toFixed(1)
      },
      distribution: { 5: 65, 4: 25, 3: 8, 2: 2, 1: 0 }
    };
  }

  // คำนวณจากรีวิวที่ผู้ใช้ส่งในเครื่อง
  let totalSum = baseAvg * baseCount;
  let count = baseCount + aiSpecific.length;
  
  const dimSums = {
    learningFit: baseAvg * baseCount,
    accuracy: (baseAvg * 0.98) * baseCount,
    simplicity: (baseAvg * 1.01) * baseCount,
    helpfulness: baseAvg * baseCount,
    easeOfUse: (baseAvg * 1.02) * baseCount,
    value: (baseAvg * 0.99) * baseCount
  };

  const dist = { 5: 65, 4: 25, 3: 8, 2: 2, 1: 0 };

  aiSpecific.forEach(r => {
    totalSum += r.overall;
    const rounded = Math.min(5, Math.max(1, Math.round(r.overall)));
    dist[rounded] = (dist[rounded] || 0) + 1;

    if (r.dimensions) {
      Object.keys(dimSums).forEach(dim => {
        if (r.dimensions[dim]) dimSums[dim] += Number(r.dimensions[dim]);
      });
    }
  });

  const rawAvg = totalSum / count;

  // Bayesian Weighted Rating (Prior m=15, Global Mean C=4.5)
  const m = 15;
  const C = 4.5;
  const weightedRating = ((count / (count + m)) * rawAvg) + ((m / (count + m)) * C);

  const dimAverages = {};
  Object.keys(dimSums).forEach(dim => {
    dimAverages[dim] = (dimSums[dim] / count).toFixed(1);
  });

  return {
    overallRating: Number(weightedRating.toFixed(2)),
    rawAverage: Number(rawAvg.toFixed(2)),
    reviewCount: count,
    dimensions: dimAverages,
    distribution: dist
  };
}

/**
 * บันทึก Rating & Review ใหม่ลง LocalStorage
 */
function saveReview(aiId, reviewData) {
  const allReviews = safeGetStorage(STORAGE_KEYS.REVIEWS, {});
  if (!allReviews[aiId]) allReviews[aiId] = [];

  const newReview = {
    id: 'rev_' + Date.now(),
    userName: reviewData.userName || 'นักเรียน Demo',
    userRole: reviewData.userRole || 'มัธยมปลาย',
    avatar: reviewData.avatar || '🎓',
    date: new Date().toISOString().split('T')[0],
    overall: Number(reviewData.overall),
    dimensions: reviewData.dimensions || {},
    useCase: reviewData.useCase || 'การเรียนทั่วไป',
    comment: reviewData.comment || '',
    likes: 0,
    likedByMe: false,
    reported: false
  };

  allReviews[aiId].unshift(newReview);
  safeSetStorage(STORAGE_KEYS.REVIEWS, allReviews);

  // บันทึก Rating Stats แยก
  const allRatings = safeGetStorage(STORAGE_KEYS.RATINGS, {});
  if (!allRatings[aiId]) allRatings[aiId] = [];
  allRatings[aiId].push({
    overall: newReview.overall,
    dimensions: newReview.dimensions,
    date: newReview.date
  });
  safeSetStorage(STORAGE_KEYS.RATINGS, allRatings);

  // Sync บันทึกลงตาราง reviews บน Supabase
  try {
    const client = window.SupabaseService ? window.SupabaseService.getClient() : null;
    if (client) {
      client.from('reviews').insert({
        id: newReview.id,
        aiId: aiId,
        userName: newReview.userName,
        userRole: newReview.userRole,
        avatar: newReview.avatar,
        date: newReview.date,
        overall: newReview.overall,
        dimensions: newReview.dimensions,
        useCase: newReview.useCase,
        comment: newReview.comment,
        likes: newReview.likes,
        reported: newReview.reported
      }).then(({ error }) => {
        if (error) console.warn('[DataLayer] Supabase review insert error:', error.message);
        else console.log('[DataLayer] Review saved to Supabase successfully! 📝');
      });
    }
  } catch (err) {
    console.warn('[DataLayer] Supabase review sync error:', err);
  }

  window.dispatchEvent(new CustomEvent('aihub:review-added', { detail: { aiId, review: newReview } }));
  return newReview;
}

/**
 * ดึงรายการรีวิวทั้งหมดของ AI ตัวนั้น
 */
function getReviewsByAI(aiId) {
  const allReviews = safeGetStorage(STORAGE_KEYS.REVIEWS, {});
  const userReviews = allReviews[aiId] || [];

  // Default seed demo reviews เพื่อให้หน้ารายละเอียดดูสมบูรณ์
  const seedReviews = [
    {
      id: 'seed_1_' + aiId,
      userName: 'ก้องภพ (ม.6 สายวิทย์)',
      userRole: 'มัธยมปลาย',
      avatar: '👨‍🎓',
      date: '2025-01-15',
      overall: 5,
      useCase: 'สรุปชีววิทยา & เคมี',
      comment: 'ช่วยสรุปเนื้อหายากๆ ได้กระชับมาก อธิบายวงจรเครบส์เข้าใจง่ายกว่าอ่านในหนังสือเองเยอะเลยครับ',
      likes: 24,
      likedByMe: false,
      isDemoSeed: true
    },
    {
      id: 'seed_2_' + aiId,
      userName: 'แพรวา (ปี 1 วิศวะ)',
      userRole: 'มหาวิทยาลัย',
      avatar: '👩‍💻',
      date: '2025-01-10',
      overall: 4.5,
      useCase: 'ช่วยเขียนโค้ดและแก้บั๊ก',
      comment: 'ช่วยคิดอัลกอริทึมได้เร็วมาก แนะนำให้ตรวจสอบผลลัพธ์อีกครั้งก่อนนำไปส่งอาจารย์เพื่อความชัวร์',
      likes: 18,
      likedByMe: false,
      isDemoSeed: true
    }
  ];

  return [...userReviews, ...seedReviews];
}

/**
 * กด Like / Unlike รีวิว
 */
function toggleLikeReview(aiId, reviewId) {
  const allReviews = safeGetStorage(STORAGE_KEYS.REVIEWS, {});
  if (!allReviews[aiId]) return null;

  const rev = allReviews[aiId].find(r => r.id === reviewId);
  if (rev) {
    if (rev.likedByMe) {
      rev.likes = Math.max(0, rev.likes - 1);
      rev.likedByMe = false;
    } else {
      rev.likes += 1;
      rev.likedByMe = true;
    }
    safeSetStorage(STORAGE_KEYS.REVIEWS, allReviews);
    return rev;
  }
  return null;
}

/* =========================================================================
   COMMUNITY SUBMISSIONS (เสนอ AI ใหม่)
   ========================================================================= */

function getSubmissions() {
  return safeGetStorage(STORAGE_KEYS.SUBMISSIONS, [
    {
      id: 'sub_demo_1',
      name: 'Phind AI',
      url: 'https://www.phind.com',
      category: 'Coding',
      useCase: 'ค้นหาเทคนิคการเขียนโปรแกรมสำหรับโปรเจกต์',
      whyRecommend: 'ตอบปัญหาเกี่ยวกับโค้ดได้ตรงจุดพร้อมตัวอย่างชัดเจน',
      submittedBy: 'คุณสมชาย (นักเรียน Demo)',
      submittedDate: '2025-01-18',
      status: 'pending' // pending, approved, rejected
    }
  ]);
}

function submitCommunityAI(data) {
  const submissions = getSubmissions();
  const newSub = {
    id: 'sub_' + Date.now(),
    name: data.name.trim(),
    url: data.url.trim(),
    category: data.category || 'Learning',
    useCase: data.useCase.trim(),
    whyRecommend: data.whyRecommend.trim(),
    submittedBy: data.submittedBy || 'ผู้ใช้ Demo',
    submittedDate: new Date().toISOString().split('T')[0],
    status: 'pending'
  };
  submissions.unshift(newSub);
  safeSetStorage(STORAGE_KEYS.SUBMISSIONS, submissions);

  // Sync กับตาราง community_submissions บน Supabase
  try {
    const client = window.SupabaseService ? window.SupabaseService.getClient() : null;
    if (client) {
      client.from('community_submissions').insert(newSub).then(({ error }) => {
        if (error) console.warn('[DataLayer] Supabase community submission error:', error.message);
        else console.log('[DataLayer] Community submission saved to Supabase! 🌐');
      });
    }
  } catch (err) {
    console.warn('[DataLayer] Supabase submission sync error:', err);
  }

  return newSub;
}

function updateSubmissionStatus(subId, newStatus) {
  const submissions = getSubmissions();
  const sub = submissions.find(s => s.id === subId);
  if (sub) {
    sub.status = newStatus;
    safeSetStorage(STORAGE_KEYS.SUBMISSIONS, submissions);
    return true;
  }
  return false;
}

/* =========================================================================
   USER PREFERENCES & CLEAR ALL DATA
   ========================================================================= */

function getUserPreferences() {
  return safeGetStorage(STORAGE_KEYS.PREFERENCES, {
    educationLevel: 'มัธยมปลาย',
    interestedSubjects: ['วิทยาศาสตร์', 'คณิตศาสตร์', 'Coding'],
    preferredPrice: 'All',
    quizResults: null
  });
}

function saveUserPreferences(prefs) {
  const current = getUserPreferences();
  const updated = { ...current, ...prefs };
  safeSetStorage(STORAGE_KEYS.PREFERENCES, updated);

  // Sync กับตาราง user_preferences บน Supabase
  try {
    const user = window.Auth ? window.Auth.getCurrentUser() : null;
    const client = window.SupabaseService ? window.SupabaseService.getClient() : null;
    if (user && client) {
      client.from('user_preferences').upsert({
        userId: user.id,
        educationLevel: updated.educationLevel,
        interestedSubjects: updated.interestedSubjects,
        preferredPrice: updated.preferredPrice,
        quizResults: updated.quizResults,
        updated_at: new Date().toISOString()
      }).then();
    }
  } catch (err) {
    console.warn('[DataLayer] Supabase preferences sync error:', err);
  }

  return updated;
}

function resetAllDemoData() {
  Object.values(STORAGE_KEYS).forEach(k => {
    localStorage.removeItem(k);
  });
  window.dispatchEvent(new CustomEvent('aihub:data-reset'));
  return true;
}

// Export functions to window.DataLayer for clean access
window.DataLayer = {
  STORAGE_KEYS,
  getAllAI,
  getAIById,
  getSimilarAI,
  getFavorites,
  isFavorite,
  toggleFavorite,
  getCompareList,
  addToCompare,
  removeFromCompare,
  clearCompare,
  getRecentlyViewed,
  addRecentlyViewed,
  RATING_DIMENSIONS,
  getAIRatings,
  saveReview,
  getReviewsByAI,
  getAIReviews: getReviewsByAI,
  toggleLikeReview,
  getSubmissions,
  submitCommunityAI,
  updateSubmissionStatus,
  getUserPreferences,
  saveUserPreferences,
  resetAllDemoData
};
