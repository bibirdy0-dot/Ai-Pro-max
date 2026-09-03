/**
 * AI Learning Hub - Supabase Client Module (supabase-client.js)
 * จัดการการเชื่อมต่อไปยัง Supabase Backend (PostgreSQL + REST API)
 * พร้อมระบบตรวจจับสถานะการเชื่อมต่อ และ Fallback ไปยัง LocalStorage/JSON อัตโนมัติ
 */

const SUPABASE_CONFIG = {
  url: 'https://bbxgjruzuyhxagczkjfv.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJieGdqcnV6dXloeGFnY3pramZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MTQzMzUsImV4cCI6MjEwMzk5MDMzNX0.c-Jg0p9VU314NInl6eoNuPxgSRUIdDCC6dNPuWac_og'
};

let _supabaseClient = null;
let _isSupabaseOnline = null;

/**
 * ดึงหรือสร้าง Supabase Client Instance
 */
function getSupabaseClient() {
  if (_supabaseClient) return _supabaseClient;

  // ตรวจสอบว่าโหลด Library @supabase/supabase-js สำเร็จหรือไม่
  if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    try {
      _supabaseClient = window.supabase.createClient(
        SUPABASE_CONFIG.url,
        SUPABASE_CONFIG.anonKey
      );
      console.log('[Supabase] Client initialized successfully.');
      return _supabaseClient;
    } catch (err) {
      console.warn('[Supabase] Failed to initialize Supabase client:', err);
    }
  } else {
    console.warn('[Supabase] Supabase JS SDK not detected on window.supabase.');
  }
  return null;
}

/**
 * ทดสอบการเชื่อมต่อไปยังฐานข้อมูล Supabase ว่าตารางพร้อมใช้งานหรือไม่
 */
async function checkSupabaseConnection() {
  if (_isSupabaseOnline !== null) return _isSupabaseOnline;

  const client = getSupabaseClient();
  if (!client) {
    _isSupabaseOnline = false;
    return false;
  }

  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 4000)
    );
    const queryPromise = client.from('ai_tools').select('id').limit(1);

    const { error } = await Promise.race([queryPromise, timeoutPromise]);
    if (error) {
      console.warn('[Supabase] Connection test returned error (tables might not be created yet):', error.message);
      _isSupabaseOnline = false;
      return false;
    }

    _isSupabaseOnline = true;
    console.log('[Supabase] Connected to Supabase PostgreSQL database successfully! 🚀');
    return true;
  } catch (err) {
    console.warn('[Supabase] Database check failed:', err.message);
    _isSupabaseOnline = false;
    return false;
  }
}

// Export ตัวแปรและฟังก์ชันไปยัง Global window.SupabaseService
window.SupabaseService = {
  config: SUPABASE_CONFIG,
  getClient: getSupabaseClient,
  checkConnection: checkSupabaseConnection,
  get isOnline() {
    return _isSupabaseOnline;
  },
  resetConnectionState() {
    _isSupabaseOnline = null;
  }
};
