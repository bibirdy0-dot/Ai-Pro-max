-- ========================================================================
-- AI Learning Hub - Supabase Database Schema & Seed Data
-- ========================================================================
-- คำแนะนำ: คัดลอกเนื้อหาทั้งหมดนี้ไปวางใน Supabase Dashboard -> SQL Editor
-- แล้วกดปุ่ม "Run" เพื่อสร้างตารางและนำเข้าข้อมูลเริ่มต้นทั้งหมด
-- ========================================================================

-- 1. ตาราง AI Tools (รายการเครื่องมือ AI ทั้งหมด)
CREATE TABLE IF NOT EXISTS public.ai_tools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  developer TEXT NOT NULL,
  logo TEXT,
  badge TEXT,
  tagline TEXT,
  description TEXT,
  url TEXT,
  pricing TEXT,
  "pricingDetails" TEXT,
  categories JSONB DEFAULT '[]'::jsonb,
  "useCases" JSONB DEFAULT '[]'::jsonb,
  subjects JSONB DEFAULT '[]'::jsonb,
  "educationLevel" JSONB DEFAULT '[]'::jsonb,
  skills JSONB DEFAULT '{}'::jsonb,
  pros JSONB DEFAULT '[]'::jsonb,
  cons JSONB DEFAULT '[]'::jsonb,
  limitations JSONB DEFAULT '[]'::jsonb,
  languages JSONB DEFAULT '[]'::jsonb,
  platforms JSONB DEFAULT '[]'::jsonb,
  verified BOOLEAN DEFAULT false,
  "demoStats" JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 2. ตาราง Users Profile (บัญชีสมาชิกและข้อมูลโปรไฟล์)
CREATE TABLE IF NOT EXISTS public.users_profile (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  "displayName" TEXT,
  avatar TEXT DEFAULT '🎓',
  role TEXT DEFAULT 'student',
  "educationLevel" TEXT DEFAULT 'มัธยมศึกษาตอนปลาย',
  "preferredPrice" TEXT DEFAULT 'All',
  "createdAt" TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 3. ตาราง Reviews (รีวิวและการให้คะแนน 6 มิติ)
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  "aiId" TEXT REFERENCES public.ai_tools(id) ON DELETE CASCADE,
  "userName" TEXT NOT NULL,
  "userRole" TEXT,
  avatar TEXT DEFAULT '🎓',
  date TEXT,
  overall NUMERIC NOT NULL,
  dimensions JSONB DEFAULT '{}'::jsonb,
  "useCase" TEXT,
  comment TEXT,
  likes INTEGER DEFAULT 0,
  reported BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 4. ตาราง Favorites (รายการ AI โปรดของผู้ใช้)
CREATE TABLE IF NOT EXISTS public.favorites (
  id BIGSERIAL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "aiId" TEXT REFERENCES public.ai_tools(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  UNIQUE("userId", "aiId")
);

-- 5. ตาราง Community Submissions (AI ที่ชุมชนเสนอเข้ามา)
CREATE TABLE IF NOT EXISTS public.community_submissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT,
  "useCase" TEXT,
  "whyRecommend" TEXT,
  "submittedBy" TEXT,
  "submittedDate" TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 6. ตาราง User Preferences (การตั้งค่าและความสนใจของผู้ใช้)
CREATE TABLE IF NOT EXISTS public.user_preferences (
  "userId" TEXT PRIMARY KEY,
  "educationLevel" TEXT,
  "interestedSubjects" JSONB DEFAULT '[]'::jsonb,
  "preferredPrice" TEXT DEFAULT 'All',
  "quizResults" JSONB,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- ========================================================================
-- เปิดใช้งาน Row Level Security (RLS) & นโยบายความปลอดภัย
-- ========================================================================
ALTER TABLE public.ai_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- ลบ Policies เดิม (ถ้ามี) เพื่อป้องกัน Error ซ้ำซ้อน
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public Read ai_tools" ON public.ai_tools;
  DROP POLICY IF EXISTS "Public Insert ai_tools" ON public.ai_tools;
  DROP POLICY IF EXISTS "Public Update ai_tools" ON public.ai_tools;
  
  DROP POLICY IF EXISTS "Public Read users_profile" ON public.users_profile;
  DROP POLICY IF EXISTS "Public Insert users_profile" ON public.users_profile;
  DROP POLICY IF EXISTS "Public Update users_profile" ON public.users_profile;

  DROP POLICY IF EXISTS "Public Read reviews" ON public.reviews;
  DROP POLICY IF EXISTS "Public Insert reviews" ON public.reviews;
  DROP POLICY IF EXISTS "Public Update reviews" ON public.reviews;

  DROP POLICY IF EXISTS "Public Read favorites" ON public.favorites;
  DROP POLICY IF EXISTS "Public Insert favorites" ON public.favorites;
  DROP POLICY IF EXISTS "Public Delete favorites" ON public.favorites;

  DROP POLICY IF EXISTS "Public Read community_submissions" ON public.community_submissions;
  DROP POLICY IF EXISTS "Public Insert community_submissions" ON public.community_submissions;
  DROP POLICY IF EXISTS "Public Update community_submissions" ON public.community_submissions;

  DROP POLICY IF EXISTS "Public All user_preferences" ON public.user_preferences;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- สร้าง Policies อนุญาตให้เข้าถึงผ่าน Anon Key และ Authenticated Key
CREATE POLICY "Public Read ai_tools" ON public.ai_tools FOR SELECT USING (true);
CREATE POLICY "Public Insert ai_tools" ON public.ai_tools FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update ai_tools" ON public.ai_tools FOR UPDATE USING (true);

CREATE POLICY "Public Read users_profile" ON public.users_profile FOR SELECT USING (true);
CREATE POLICY "Public Insert users_profile" ON public.users_profile FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update users_profile" ON public.users_profile FOR UPDATE USING (true);

CREATE POLICY "Public Read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public Insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update reviews" ON public.reviews FOR UPDATE USING (true);

CREATE POLICY "Public Read favorites" ON public.favorites FOR SELECT USING (true);
CREATE POLICY "Public Insert favorites" ON public.favorites FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Delete favorites" ON public.favorites FOR DELETE USING (true);

CREATE POLICY "Public Read community_submissions" ON public.community_submissions FOR SELECT USING (true);
CREATE POLICY "Public Insert community_submissions" ON public.community_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update community_submissions" ON public.community_submissions FOR UPDATE USING (true);

CREATE POLICY "Public All user_preferences" ON public.user_preferences FOR ALL USING (true);

-- ========================================================================
-- SEED DATA (นำเข้าข้อมูลเริ่มต้น)
-- ========================================================================

-- นำเข้าข้อมูล AI ทั้ง 12 ตัว
INSERT INTO public.ai_tools (
  id, name, developer, logo, badge, tagline, description, url, pricing, "pricingDetails",
  categories, "useCases", subjects, "educationLevel", skills, pros, cons, limitations, languages, platforms, verified, "demoStats"
) VALUES (
  'chatgpt',
  'ChatGPT',
  'OpenAI',
  'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
  'Popular',
  'AI สารพัดประโยชน์ที่เก่งรอบด้าน อธิบายเข้าใจง่าย',
  'โมเดลปัญญาประดิษฐ์สนทนาอัจฉริยะจาก OpenAI เหมาะอย่างยิ่งสำหรับการถามตอบเนื้อหาบทเรียน ช่วยอธิบายคอนเซปต์ยากๆ ให้เข้าใจง่าย สรุปบทความ และช่วยร่างงานเขียนหรือโค้ดเบื้องต้น',
  'https://chatgpt.com',
  'Freemium',
  'ใช้งาน GPT-4o mini และ GPT-4o ฟรีแบบจำกัดจำนวน / Plus $20/เดือน',
  '["Learning","Writing","Coding","Productivity"]'::jsonb,
  '["สรุปบทเรียน","อธิบายเนื้อหา","ช่วยคิดหัวข้อรายงาน","เขียนโค้ดเริ่มต้น","ฝึกภาษา"]'::jsonb,
  '["ทั่วไป","ชีววิทยา","ประวัติศาสตร์","ภาษาอังกฤษ","คอมพิวเตอร์","สังคมศึกษา"]'::jsonb,
  '["มัธยมต้น","มัธยมปลาย","มหาวิทยาลัย","บุคคลทั่วไป"]'::jsonb,
  '{"learning":95,"reasoning":90,"writing":92,"research":85,"coding":90,"mathScience":86,"creativeMedia":82,"productivity":94}'::jsonb,
  '["อธิบายภาษาง่าย มีความเป็นธรรมชาติสูงมาก","มีแอปพลิเคชันมือถือทั้ง iOS/Android ใช้งานสะดวก","รองรับการอัปโหลดรูปภาพและไฟล์เพื่อวิเคราะห์ (ในโควตาฟรี)","มี Voice Mode คุยฝึกภาษาแบบโต้ตอบด้วยเสียงได้ยอดเยี่ยม"]'::jsonb,
  '["บางครั้งอาจตอบข้อมูลคลาดเคลื่อน (Hallucination) โดยไม่ระบุแหล่งที่มา","การคำนวณคณิตศาสตร์ซับซ้อนบางข้อยังมีผิดพลาดถ้าไม่ใช้ Code Interpreter"]'::jsonb,
  '["โควตาการใช้งานโมเดลระดับสูง (GPT-4o) มีจำกัดสำหรับผู้ใช้ฟรีในแต่ละช่วงเวลา"]'::jsonb,
  '["ไทย","อังกฤษ","และกว่า 50+ ภาษา"]'::jsonb,
  '["Web","iOS","Android","macOS","Windows"]'::jsonb,
  true,
  '{"initialRating":4.8,"reviewCount":142}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  developer = EXCLUDED.developer,
  logo = EXCLUDED.logo,
  badge = EXCLUDED.badge,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  url = EXCLUDED.url,
  pricing = EXCLUDED.pricing,
  "pricingDetails" = EXCLUDED."pricingDetails",
  categories = EXCLUDED.categories,
  "useCases" = EXCLUDED."useCases",
  subjects = EXCLUDED.subjects,
  "educationLevel" = EXCLUDED."educationLevel",
  skills = EXCLUDED.skills,
  pros = EXCLUDED.pros,
  cons = EXCLUDED.cons,
  limitations = EXCLUDED.limitations,
  languages = EXCLUDED.languages,
  platforms = EXCLUDED.platforms,
  verified = EXCLUDED.verified,
  "demoStats" = EXCLUDED."demoStats";

INSERT INTO public.ai_tools (
  id, name, developer, logo, badge, tagline, description, url, pricing, "pricingDetails",
  categories, "useCases", subjects, "educationLevel", skills, pros, cons, limitations, languages, platforms, verified, "demoStats"
) VALUES (
  'claude',
  'Claude',
  'Anthropic',
  'https://upload.wikimedia.org/wikipedia/commons/7/78/Anthropic_logo.svg',
  'Top Writing',
  'AI สังเคราะห์ข้อมูล เขียนบทความ และวิเคราะห์โค้ดระดับสูง',
  'AI จาก Anthropic ที่โดดเด่นเรื่องการประมวลผลข้อความขนาดยาว การเขียนภาษาที่สละสลวย เป็นธรรมชาติ และการคิดวิเคราะห์อย่างมีเหตุผล เหมาะสำหรับนักเรียนนักศึกษาที่ต้องอ่านเอกสารวิชาการยาวๆ',
  'https://claude.ai',
  'Freemium',
  'ใช้งาน Claude 3.5 Sonnet ฟรีจำกัดข้อความต่อวัน / Pro $20/เดือน',
  '["Writing","Learning","Coding","Research"]'::jsonb,
  '["สรุปเอกสาร PDF ยาวๆ","เขียนรายงานเชิงวิชาการ","วิเคราะห์และแก้บั๊กโค้ด","ตรวจทานสำนวนภาษา"]'::jsonb,
  '["ภาษาไทย","ภาษาอังกฤษ","วรรณกรรม","วิทยาศาสตร์","คอมพิวเตอร์","ปรัชญา"]'::jsonb,
  '["มัธยมปลาย","มหาวิทยาลัย","บุคคลทั่วไป"]'::jsonb,
  '{"learning":92,"reasoning":96,"writing":98,"research":93,"coding":95,"mathScience":88,"creativeMedia":76,"productivity":91}'::jsonb,
  '["ทักษะการเขียนภาษาไทยและอังกฤษสละสลวย ละเอียดและเป็นธรรมชาติมากที่สุด","มีฟีเจอร์ Artifacts ช่วยแสดงผลเอกสาร เว็บไซต์ และโค้ดแบบ Interactive ได้ทันที","อ่านและสรุปไฟล์เอกสารขนาดใหญ่ (PDF, DOCX) ได้แม่นยำสูง"]'::jsonb,
  '["โควตาข้อความฟรีจำกัดค่อนข้างเร็วในช่วงเวลาที่มีผู้ใช้งานหนาแน่น","ไม่สามารถค้นหาข้อมูลสดบนเว็บแบบเรียลไทม์ได้โดยตรงในเวอร์ชันฟรี"]'::jsonb,
  '["มีขีดจำกัดข้อความต่อช่วงเวลา 5 ชั่วโมงสำหรับผู้ใช้บัญชีฟรี"]'::jsonb,
  '["ไทย","อังกฤษ","และภาษาอื่นๆ ทั่วโลก"]'::jsonb,
  '["Web","iOS","Android"]'::jsonb,
  true,
  '{"initialRating":4.9,"reviewCount":118}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  developer = EXCLUDED.developer,
  logo = EXCLUDED.logo,
  badge = EXCLUDED.badge,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  url = EXCLUDED.url,
  pricing = EXCLUDED.pricing,
  "pricingDetails" = EXCLUDED."pricingDetails",
  categories = EXCLUDED.categories,
  "useCases" = EXCLUDED."useCases",
  subjects = EXCLUDED.subjects,
  "educationLevel" = EXCLUDED."educationLevel",
  skills = EXCLUDED.skills,
  pros = EXCLUDED.pros,
  cons = EXCLUDED.cons,
  limitations = EXCLUDED.limitations,
  languages = EXCLUDED.languages,
  platforms = EXCLUDED.platforms,
  verified = EXCLUDED.verified,
  "demoStats" = EXCLUDED."demoStats";

INSERT INTO public.ai_tools (
  id, name, developer, logo, badge, tagline, description, url, pricing, "pricingDetails",
  categories, "useCases", subjects, "educationLevel", skills, pros, cons, limitations, languages, platforms, verified, "demoStats"
) VALUES (
  'perplexity',
  'Perplexity AI',
  'Perplexity',
  'https://upload.wikimedia.org/wikipedia/commons/1/1a/Perplexity_AI_logo.svg',
  'Best Research',
  'AI ค้นคว้าข้อมูลพร้อมอ้างอิงแหล่งที่มา (Citations) ชัดเจน',
  'เครื่องมือค้นหาและสังเคราะห์ข้อมูลด้วย AI ที่ค้นหาข้อมูลล่าสุดจากอินเทอร์เน็ต พร้อมแนบลิงก์แหล่งอ้างอิงทุกประโยค เหมาะอย่างยิ่งสำหรับทำรายงาน งานวิจัย และค้นหาข้อมูลวิชาการที่ต้องการความถูกต้อง',
  'https://www.perplexity.ai',
  'Freemium',
  'ค้นหาแบบ Quick Search ฟรีไม่จำกัด / Pro Search ฟรี 5 ครั้งต่อวัน / Pro $20/เดือน',
  '["Research","Learning","Productivity"]'::jsonb,
  '["ค้นคว้าทำรายงาน","หาแหล่งอ้างอิง บรรณานุกรม","ติดตามข่าวสารข้อมูลปัจจุบัน","เปรียบเทียบข้อมูลทางวิชาการ"]'::jsonb,
  '["วิทยาศาสตร์","สังคมศาสตร์","ประวัติศาสตร์","การแพทย์","ทั่วไป"]'::jsonb,
  '["มัธยมต้น","มัธยมปลาย","มหาวิทยาลัย","บุคคลทั่วไป"]'::jsonb,
  '{"learning":90,"reasoning":88,"writing":84,"research":99,"coding":78,"mathScience":86,"creativeMedia":65,"productivity":95}'::jsonb,
  '["มีลิงก์อ้างอิงชัดเจนทุกจุด ตรวจสอบที่มาของข้อมูลได้ทันที","มีฟีเจอร์ Focus Search เจาะจงเฉพาะ Academic Papers, YouTube หรือ Reddit ได้","ข้อมูลอัปเดตแบบเรียลไทม์จากอินเทอร์เน็ต"]'::jsonb,
  '["ทักษะการแต่งเนื้อหาสร้างสรรค์หรืองานเขียนเรียงความยังสู้ Claude ไม่ได้","Pro Search ที่ใช้วิเคราะห์ลึกจำกัดจำนวนครั้งในเวอร์ชันฟรี"]'::jsonb,
  '["จำกัด Pro Search 5 ครั้งต่อทุกๆ 4 ชั่วโมงสำหรับบัญชีฟรี"]'::jsonb,
  '["ไทย","อังกฤษ","และหลากหลายภาษา"]'::jsonb,
  '["Web","iOS","Android","Chrome Extension"]'::jsonb,
  true,
  '{"initialRating":4.85,"reviewCount":96}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  developer = EXCLUDED.developer,
  logo = EXCLUDED.logo,
  badge = EXCLUDED.badge,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  url = EXCLUDED.url,
  pricing = EXCLUDED.pricing,
  "pricingDetails" = EXCLUDED."pricingDetails",
  categories = EXCLUDED.categories,
  "useCases" = EXCLUDED."useCases",
  subjects = EXCLUDED.subjects,
  "educationLevel" = EXCLUDED."educationLevel",
  skills = EXCLUDED.skills,
  pros = EXCLUDED.pros,
  cons = EXCLUDED.cons,
  limitations = EXCLUDED.limitations,
  languages = EXCLUDED.languages,
  platforms = EXCLUDED.platforms,
  verified = EXCLUDED.verified,
  "demoStats" = EXCLUDED."demoStats";

INSERT INTO public.ai_tools (
  id, name, developer, logo, badge, tagline, description, url, pricing, "pricingDetails",
  categories, "useCases", subjects, "educationLevel", skills, pros, cons, limitations, languages, platforms, verified, "demoStats"
) VALUES (
  'gemini',
  'Google Gemini',
  'Google',
  'https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg',
  'Multimodal',
  'AI สารพัดประโยชน์จาก Google เชื่อมต่อ YouTube และ Docs',
  'AI Multimodal จาก Google ที่สามารถวิเคราะห์ข้อความ ภาพ เสียง และวิดีโอ เชื่อมต่อกับระบบนิเวศของ Google เช่น Google Docs, Drive และค้นหาข้อมูลจากวิดีโอบน YouTube ได้โดยตรง',
  'https://gemini.google.com',
  'Freemium',
  'ใช้งาน Gemini 1.5 Flash ฟรีไม่จำกัด / Gemini Advanced (1.5 Pro) สมัครแพ็กเกจ Google One',
  '["Learning","Research","Productivity","Creative & Media"]'::jsonb,
  '["สรุปคลิปวิดีโอ YouTube","ช่วยทำสไลด์และเอกสาร","ค้นหาข้อมูลเชื่อมกับ Google","แปลภาษาและอธิบายภาพ"]'::jsonb,
  '["วิทยาศาสตร์","ภาษาต่างประเทศ","คอมพิวเตอร์","ภูมิศาสตร์","ทั่วไป"]'::jsonb,
  '["มัธยมต้น","มัธยมปลาย","มหาวิทยาลัย","บุคคลทั่วไป"]'::jsonb,
  '{"learning":92,"reasoning":89,"writing":88,"research":91,"coding":86,"mathScience":87,"creativeMedia":85,"productivity":93}'::jsonb,
  '["สรุปและจับประเด็นวิดีโอ YouTube ได้โดยไม่ต้องดูคลิปเต็ม","ส่งออกผลลัพธ์ไปยัง Google Docs และ Gmail ได้ในคลิกเดียว","รองรับ Context Window ขนาดยาวมาก วิเคราะห์ไฟล์ใหญ่ได้ดี"]'::jsonb,
  '["บางครั้งตอบสั้นหรือสรุปแบบรวบรัดเกินไป","การเขียนโค้ดระดับสูงยังมีความแม่นยำเป็นรอง Claude 3.5"]'::jsonb,
  '["ฟีเจอร์ระดับสูงบางอย่างต้องใช้บัญชี Google ส่วนบุคคล (บางโรงเรียนอาจปิดกั้น)"]'::jsonb,
  '["ไทย","อังกฤษ","และกว่า 40+ ภาษา"]'::jsonb,
  '["Web","Android","iOS (Google App)"]'::jsonb,
  true,
  '{"initialRating":4.7,"reviewCount":88}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  developer = EXCLUDED.developer,
  logo = EXCLUDED.logo,
  badge = EXCLUDED.badge,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  url = EXCLUDED.url,
  pricing = EXCLUDED.pricing,
  "pricingDetails" = EXCLUDED."pricingDetails",
  categories = EXCLUDED.categories,
  "useCases" = EXCLUDED."useCases",
  subjects = EXCLUDED.subjects,
  "educationLevel" = EXCLUDED."educationLevel",
  skills = EXCLUDED.skills,
  pros = EXCLUDED.pros,
  cons = EXCLUDED.cons,
  limitations = EXCLUDED.limitations,
  languages = EXCLUDED.languages,
  platforms = EXCLUDED.platforms,
  verified = EXCLUDED.verified,
  "demoStats" = EXCLUDED."demoStats";

INSERT INTO public.ai_tools (
  id, name, developer, logo, badge, tagline, description, url, pricing, "pricingDetails",
  categories, "useCases", subjects, "educationLevel", skills, pros, cons, limitations, languages, platforms, verified, "demoStats"
) VALUES (
  'wolfram-alpha',
  'Wolfram Alpha',
  'Wolfram Research',
  'https://upload.wikimedia.org/wikipedia/commons/e/eb/Wolfram_Alpha_logo.svg',
  'Math & Science',
  'เครื่องมือคำนวณและตอบปัญหาคณิตศาสตร์ วิทยาศาสตร์ แม่นยำ 100%',
  'Computational Knowledge Engine อันดับหนึ่งสำหรับการเรียนคณิตศาสตร์ แคลคูลัส ฟิสิกส์ และเคมี แก้สมการพร้อมแสดงวิธีทำทีละขั้นตอน (Step-by-step) ไม่มีปัญหาการตอบมั่วเหมือน AI ภาษาทั่วไป',
  'https://www.wolframalpha.com',
  'Freemium',
  'คำนวณผลลัพธ์ฟรี / แสดง Step-by-step Solution และ Pro features เริ่มต้น $5/เดือนสำหรับนักเรียน',
  '["Math & Science","Learning"]'::jsonb,
  '["แก้โจทย์แคลคูลัส","วาดกราฟฟังก์ชัน 2D/3D","ดุลสมการเคมี","คำนวณฟิสิกส์และสถิติ"]'::jsonb,
  '["คณิตศาสตร์","แคลคูลัส","พีชคณิต","ฟิสิกส์","เคมี","สถิติ"]'::jsonb,
  '["มัธยมปลาย","มหาวิทยาลัย"]'::jsonb,
  '{"learning":88,"reasoning":98,"writing":50,"research":85,"coding":82,"mathScience":100,"creativeMedia":40,"productivity":86}'::jsonb,
  '["ความแม่นยำด้านการคำนวณและสูตรคณิตศาสตร์ 100% เชื่อถือได้สูงสุด","พล็อตกราฟฟังก์ชันและแสดงคุณสมบัติทางคณิตศาสตร์ได้อย่างละเอียด","มีฐานข้อมูลค่าคงที่และตารางธาตุ/ข้อมูลวิทยาศาสตร์ที่สมบูรณ์"]'::jsonb,
  '["การแสดงวิธีทำทีละขั้นตอน (Step-by-step) ละเอียดต้องสมัครสมาชิก Pro","ไม่เหมาะกับงานเขียนหรือการสรุปบทความภาษาทั่วไป"]'::jsonb,
  '["ต้องพิมพ์คำสั่งหรือสมการในรูปแบบที่ระบบเข้าใจได้ถูกต้อง"]'::jsonb,
  '["อังกฤษ (รับ Input สูตรคณิตศาสตร์สากล)"]'::jsonb,
  '["Web","iOS","Android"]'::jsonb,
  true,
  '{"initialRating":4.8,"reviewCount":75}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  developer = EXCLUDED.developer,
  logo = EXCLUDED.logo,
  badge = EXCLUDED.badge,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  url = EXCLUDED.url,
  pricing = EXCLUDED.pricing,
  "pricingDetails" = EXCLUDED."pricingDetails",
  categories = EXCLUDED.categories,
  "useCases" = EXCLUDED."useCases",
  subjects = EXCLUDED.subjects,
  "educationLevel" = EXCLUDED."educationLevel",
  skills = EXCLUDED.skills,
  pros = EXCLUDED.pros,
  cons = EXCLUDED.cons,
  limitations = EXCLUDED.limitations,
  languages = EXCLUDED.languages,
  platforms = EXCLUDED.platforms,
  verified = EXCLUDED.verified,
  "demoStats" = EXCLUDED."demoStats";

INSERT INTO public.ai_tools (
  id, name, developer, logo, badge, tagline, description, url, pricing, "pricingDetails",
  categories, "useCases", subjects, "educationLevel", skills, pros, cons, limitations, languages, platforms, verified, "demoStats"
) VALUES (
  'deepl',
  'DeepL Translate',
  'DeepL',
  'https://upload.wikimedia.org/wikipedia/commons/0/0f/DeepL_logo.svg',
  'Best Translation',
  'เครื่องมือแปลภาษาด้วย AI ที่แม่นยำและเป็นธรรมชาติที่สุดในโลก',
  'สุดยอดระบบแปลภาษาด้วยโครงข่ายประสาทเทียม (Neural Network) แปลบทความวิชาการ เอกสาร PDF/Word ได้อย่างสละสลวยตามหลักไวยากรณ์และบริบท ไม่แข็งทื่อเหมือนเครื่องแปลภาษาทั่วไป',
  'https://www.deepl.com',
  'Freemium',
  'แปลข้อความฟรีสูงสุด 1,500 ตัวอักษรต่อครั้ง และแปลเอกสารฟรี 3 ไฟล์ต่อเดือน',
  '["Writing","Learning","Productivity"]'::jsonb,
  '["แปลบทความวิชาการภาษาอังกฤษเป็นไทย","แปลศัพท์และสำนวนเฉพาะทาง","ตรวจทานความถูกต้องของการแปล","แปลไฟล์สไลด์และเอกสาร"]'::jsonb,
  '["ภาษาอังกฤษ","ภาษาต่างประเทศ","การแปล","ภาษาศาสตร์"]'::jsonb,
  '["มัธยมต้น","มัธยมปลาย","มหาวิทยาลัย","บุคคลทั่วไป"]'::jsonb,
  '{"learning":86,"reasoning":75,"writing":95,"research":80,"coding":40,"mathScience":60,"creativeMedia":60,"productivity":96}'::jsonb,
  '["แปลภาษาได้สละสลวย เป็นธรรมชาติ และรักษาบริบทเดิมได้ดีที่สุด","สามารถเลือกคำศัพท์ทางเลือก (Alternatives) ปรับโทนของประโยคได้","มีฟีเจอร์ DeepL Write ช่วยเกลาไวยากรณ์ภาษาอังกฤษ"]'::jsonb,
  '["จำกัดจำนวนตัวอักษรและจำนวนไฟล์เอกสารในเวอร์ชันฟรี","ไม่สามารถถามตอบหรือสร้างเนื้อหาใหม่ได้ (เป็นเครื่องมือแปลเฉพาะทาง)"]'::jsonb,
  '["ฟรีสูงสุด 1,500 ตัวอักษรต่อการแปล 1 ครั้ง"]'::jsonb,
  '["ไทย","อังกฤษ","ญี่ปุ่น","จีน","เยอรมัน","และกว่า 30+ ภาษา"]'::jsonb,
  '["Web","Windows","macOS","iOS","Android","Browser Extension"]'::jsonb,
  true,
  '{"initialRating":4.9,"reviewCount":105}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  developer = EXCLUDED.developer,
  logo = EXCLUDED.logo,
  badge = EXCLUDED.badge,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  url = EXCLUDED.url,
  pricing = EXCLUDED.pricing,
  "pricingDetails" = EXCLUDED."pricingDetails",
  categories = EXCLUDED.categories,
  "useCases" = EXCLUDED."useCases",
  subjects = EXCLUDED.subjects,
  "educationLevel" = EXCLUDED."educationLevel",
  skills = EXCLUDED.skills,
  pros = EXCLUDED.pros,
  cons = EXCLUDED.cons,
  limitations = EXCLUDED.limitations,
  languages = EXCLUDED.languages,
  platforms = EXCLUDED.platforms,
  verified = EXCLUDED.verified,
  "demoStats" = EXCLUDED."demoStats";

INSERT INTO public.ai_tools (
  id, name, developer, logo, badge, tagline, description, url, pricing, "pricingDetails",
  categories, "useCases", subjects, "educationLevel", skills, pros, cons, limitations, languages, platforms, verified, "demoStats"
) VALUES (
  'canva-magic',
  'Canva Magic Studio',
  'Canva',
  'https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg',
  'Creative & Slides',
  'AI ช่วยสร้างสไลด์ พรีเซนเทชัน โปสเตอร์ และสื่อการเรียนรู้อัตโนมัติ',
  'ชุดเครื่องมือ AI ใน Canva ที่ช่วยนักเรียนสร้างสไลด์นำเสนอ เพียงแค่พิมพ์หัวข้อที่ต้องการ AI จะช่วยร่างเนื้อหา ออกแบบ Layout และสร้างภาพประกอบให้เสร็จสรรพ พร้อมปรับแต่งได้ตามใจชอบ',
  'https://www.canva.com',
  'Freemium',
  'ใช้งานฟังก์ชันพื้นฐานและเครื่องมือ AI เริ่มต้นฟรี / Canva for Education ฟรีสำหรับครูและนักเรียนที่มีอีเมลสถานศึกษา',
  '["Creative & Media","Productivity"]'::jsonb,
  '["สร้างสไลด์ Presentation หน้าห้อง","ทำอินโฟกราฟิกสรุปบทเรียน","ออกแบบโปสเตอร์รายงาน","สร้างรูปภาพประกอบเนื้อหา"]'::jsonb,
  '["ศิลปะ","การนำเสนอ","การออกแบบ","สื่อสารมวลชน","ทุกวิชา"]'::jsonb,
  '["มัธยมต้น","มัธยมปลาย","มหาวิทยาลัย"]'::jsonb,
  '{"learning":78,"reasoning":72,"writing":80,"research":70,"coding":45,"mathScience":55,"creativeMedia":99,"productivity":94}'::jsonb,
  '["สร้างสไลด์ Presentation ครบชุดในเวลาไม่กี่วินาที","มี Template สวยงามสำหรับนักเรียนนับแสนแบบ","Canva for Education แจก Pro ฟรีสำหรับโรงเรียนและสถานศึกษาที่เข้าร่วม"]'::jsonb,
  '["เนื้อหาข้อความที่ AI ร่างให้อาจต้องนำมาปรับแต่งเพิ่มเติมเพื่อความลึกซึ้ง","เครื่องมือ AI เจนภาพระดับสูงบางอย่างจำกัดโควตาเครดิตต่อเดือน"]'::jsonb,
  '["เครดิต Magic Studio มีจำกัดในบัญชีฟรีทั่วไป"]'::jsonb,
  '["ไทย","อังกฤษ","และเกือบทุกภาษา"]'::jsonb,
  '["Web","iOS","Android","Windows","macOS"]'::jsonb,
  true,
  '{"initialRating":4.82,"reviewCount":130}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  developer = EXCLUDED.developer,
  logo = EXCLUDED.logo,
  badge = EXCLUDED.badge,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  url = EXCLUDED.url,
  pricing = EXCLUDED.pricing,
  "pricingDetails" = EXCLUDED."pricingDetails",
  categories = EXCLUDED.categories,
  "useCases" = EXCLUDED."useCases",
  subjects = EXCLUDED.subjects,
  "educationLevel" = EXCLUDED."educationLevel",
  skills = EXCLUDED.skills,
  pros = EXCLUDED.pros,
  cons = EXCLUDED.cons,
  limitations = EXCLUDED.limitations,
  languages = EXCLUDED.languages,
  platforms = EXCLUDED.platforms,
  verified = EXCLUDED.verified,
  "demoStats" = EXCLUDED."demoStats";

INSERT INTO public.ai_tools (
  id, name, developer, logo, badge, tagline, description, url, pricing, "pricingDetails",
  categories, "useCases", subjects, "educationLevel", skills, pros, cons, limitations, languages, platforms, verified, "demoStats"
) VALUES (
  'github-copilot',
  'GitHub Copilot',
  'GitHub / Microsoft',
  'https://upload.wikimedia.org/wikipedia/commons/c/c2/GitHub_Invertocat_Logo.svg',
  'Coding Pro',
  'ผู้ช่วยเขียนโค้ดและตรวจแก้โปรแกรมใน VS Code ฟรีสำหรับนักเรียน',
  'AI คู่หูสำหรับนักเรียนสายโปรแกรมมิ่ง ทำงานในโปรแกรมเขียนโค้ด (VS Code) ช่วยเติมโค้ดอัตโนมัติ อธิบายการทำงานของฟังก์ชัน และแนะนำวิธีแก้ error นักเรียนสามารถขอใช้งานฟรีได้ผ่าน GitHub Student Developer Pack',
  'https://github.com/features/copilot',
  'Paid / Free for Students',
  'ฟรี 100% สำหรับนักเรียนและนักศึกษาผ่าน GitHub Student Developer Pack / บุคคลทั่วไป $10/เดือน',
  '["Coding","Learning","Productivity"]'::jsonb,
  '["เขียนโค้ด Python, C++, Java, Web","ช่วยอธิบายโค้ดที่อ่านไม่เข้าใจ","หาบั๊กและแนะนำวิธีแก้ไข","สร้าง Unit Test"]'::jsonb,
  '["วิทยาการคำนวณ","วิศวกรรมคอมพิวเตอร์","เทคโนโลยีสารสนเทศ","Coding"]'::jsonb,
  '["มัธยมปลาย","มหาวิทยาลัย"]'::jsonb,
  '{"learning":88,"reasoning":92,"writing":70,"research":80,"coding":99,"mathScience":86,"creativeMedia":50,"productivity":97}'::jsonb,
  '["นักเรียนนักศึกษาขอสิทธิ์ใช้งานฟรีได้ตลอดระยะเวลาการศึกษา","ฝังตัวใน VS Code ทำงานลื่นไหล ไม่ต้องสลับหน้าต่างเบราว์เซอร์","เข้าใจ Context ของโปรเจกต์โค้ดทั้งหมดที่กำลังเปิดอยู่"]'::jsonb,
  '["ต้องมีขั้นตอนการยืนยันสถานะนักเรียนด้วยอีเมลสถานศึกษาหรือบัตรนักเรียน","หากไม่มีสถานะนักเรียนจะมีค่าบริการรายเดือน"]'::jsonb,
  '["ต้องติดตั้ง Extension ใน VS Code หรือ IDE ที่รองรับ"]'::jsonb,
  '["ทุกภาษาโปรแกรมมิ่ง (Python, JS, C++, Java, etc.)"]'::jsonb,
  '["VS Code","JetBrains","Neovim","Visual Studio"]'::jsonb,
  true,
  '{"initialRating":4.92,"reviewCount":84}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  developer = EXCLUDED.developer,
  logo = EXCLUDED.logo,
  badge = EXCLUDED.badge,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  url = EXCLUDED.url,
  pricing = EXCLUDED.pricing,
  "pricingDetails" = EXCLUDED."pricingDetails",
  categories = EXCLUDED.categories,
  "useCases" = EXCLUDED."useCases",
  subjects = EXCLUDED.subjects,
  "educationLevel" = EXCLUDED."educationLevel",
  skills = EXCLUDED.skills,
  pros = EXCLUDED.pros,
  cons = EXCLUDED.cons,
  limitations = EXCLUDED.limitations,
  languages = EXCLUDED.languages,
  platforms = EXCLUDED.platforms,
  verified = EXCLUDED.verified,
  "demoStats" = EXCLUDED."demoStats";

INSERT INTO public.ai_tools (
  id, name, developer, logo, badge, tagline, description, url, pricing, "pricingDetails",
  categories, "useCases", subjects, "educationLevel", skills, pros, cons, limitations, languages, platforms, verified, "demoStats"
) VALUES (
  'grammarly',
  'Grammarly',
  'Grammarly',
  'https://upload.wikimedia.org/wikipedia/commons/1/18/Grammarly_logo.svg',
  'Grammar & Tone',
  'AI ตรวจไวยากรณ์ภาษาอังกฤษ เกลาสำนวน และเช็ค Plagiarism',
  'ผู้ช่วยตรวจทานงานเขียนภาษาอังกฤษระดับโลก ช่วยเช็คตัวสะกด แกรมม่า ปรับระดับความเป็นทางการ (Tone) และช่วยแนะนำการเลือกใช้คำศัพท์ที่เหมาะสมสำหรับการเขียน Essay และรายงาน',
  'https://www.grammarly.com',
  'Freemium',
  'ตรวจไวยากรณ์และตัวสะกดพื้นฐานฟรี / Premium สำหรับการเกลาประโยคและเช็ค Plagiarism $12/เดือน',
  '["Writing","Learning","Productivity"]'::jsonb,
  '["ตรวจ Essay ภาษาอังกฤษ","เกลาไวยากรณ์รายงาน","ปรับระดับภาษาให้ดูเป็นมืออาชีพ","ตรวจการคัดลอกผลงาน (Plagiarism)"]'::jsonb,
  '["ภาษาอังกฤษ","การเขียนเชิงวิชาการ","การสื่อสารสากล"]'::jsonb,
  '["มัธยมต้น","มัธยมปลาย","มหาวิทยาลัย","บุคคลทั่วไป"]'::jsonb,
  '{"learning":84,"reasoning":78,"writing":97,"research":75,"coding":40,"mathScience":50,"creativeMedia":65,"productivity":93}'::jsonb,
  '["ตรวจจับข้อผิดพลาดไวยากรณ์ภาษาอังกฤษได้แม่นยำ พร้อมคำอธิบายเหตุผล","มี Extension ทำงานบน Google Docs, เว็บบอร์ด และอีเมลได้ทันที","ช่วยปรับระดับความสุภาพและโทนของงานเขียนได้ตามต้องการ"]'::jsonb,
  '["รองรับเฉพาะภาษาอังกฤษเป็นหลัก ไม่รองรับภาษาไทย","ฟีเจอร์ตรวจเช็ค Plagiarism และการเรียบเรียงประโยคขั้นสูงอยู่ในแพ็กเกจเสียเงิน"]'::jsonb,
  '["เวอร์ชันฟรีเน้นตรวจคำผิดและไวยากรณ์พื้นฐาน"]'::jsonb,
  '["อังกฤษ (US, UK, CA, AU, IN)"]'::jsonb,
  '["Web","Windows","macOS","Chrome Extension","iOS","Android"]'::jsonb,
  true,
  '{"initialRating":4.75,"reviewCount":92}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  developer = EXCLUDED.developer,
  logo = EXCLUDED.logo,
  badge = EXCLUDED.badge,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  url = EXCLUDED.url,
  pricing = EXCLUDED.pricing,
  "pricingDetails" = EXCLUDED."pricingDetails",
  categories = EXCLUDED.categories,
  "useCases" = EXCLUDED."useCases",
  subjects = EXCLUDED.subjects,
  "educationLevel" = EXCLUDED."educationLevel",
  skills = EXCLUDED.skills,
  pros = EXCLUDED.pros,
  cons = EXCLUDED.cons,
  limitations = EXCLUDED.limitations,
  languages = EXCLUDED.languages,
  platforms = EXCLUDED.platforms,
  verified = EXCLUDED.verified,
  "demoStats" = EXCLUDED."demoStats";

INSERT INTO public.ai_tools (
  id, name, developer, logo, badge, tagline, description, url, pricing, "pricingDetails",
  categories, "useCases", subjects, "educationLevel", skills, pros, cons, limitations, languages, platforms, verified, "demoStats"
) VALUES (
  'julius-ai',
  'Julius AI',
  'Julius AI',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Math-icon.svg/512px-Math-icon.svg.png',
  'Data & Graphs',
  'AI วิเคราะห์ข้อมูล ทำสถิติ และวาดกราฟจากไฟล์ Excel/CSV',
  'AI ด้านการวิเคราะห์ข้อมูลและวิทยาศาสตร์ เพียงแค่อัปโหลดไฟล์ Excel หรือ CSV แล้วพิมพ์สั่งเป็นภาษาคน ระบบจะช่วยคำนวณสถิติ สร้างกราฟวิเคราะห์ และหาความสัมพันธ์ของข้อมูลให้ทันที',
  'https://julius.ai',
  'Freemium',
  'ส่งข้อความวิเคราะห์ฟรี 15 ข้อความต่อเดือน / สมาชิกแบบชำระเงินเริ่มต้น $20/เดือน',
  '["Math & Science","Research","Productivity"]'::jsonb,
  '["วิเคราะห์ข้อมูลโครงงานวิชาการ","สร้างกราฟสถิติจาก Excel","แก้โจทย์คณิตศาสตร์เชิงลึก","สรุปข้อมูลตารางขนาดใหญ่"]'::jsonb,
  '["สถิติ","คณิตศาสตร์","วิทยาศาสตร์","เศรษฐศาสตร์","งานวิจัย"]'::jsonb,
  '["มัธยมปลาย","มหาวิทยาลัย"]'::jsonb,
  '{"learning":86,"reasoning":94,"writing":75,"research":91,"coding":92,"mathScience":96,"creativeMedia":70,"productivity":90}'::jsonb,
  '["สร้างแผนภูมิและกราฟสถิติสวยงามพร้อมดาวน์โหลดไปใส่ในเล่มรายงานได้ทันที","แสดงโค้ด Python ที่ใช้ในการคำนวณ ตรวจสอบสูตรได้โปร่งใส","เหมาะมากสำหรับการทำโครงงานวิทยาศาสตร์และวิจัยระดับโรงเรียนและมหาวิทยาลัย"]'::jsonb,
  '["โควตาข้อความฟรี 15 ข้อความต่อเดือนค่อนข้างน้อยสำหรับการวิเคราะห์ต่อเนื่อง","ผู้ใช้ต้องมีไฟล์ข้อมูลดิบ (Excel/CSV) จึงจะดึงศักยภาพได้สูงสุด"]'::jsonb,
  '["จำกัด 15 ข้อความฟรีต่อเดือนในเวอร์ชันทดลอง"]'::jsonb,
  '["อังกฤษ","ไทย (เข้าใจคำสั่งพื้นฐาน)"]'::jsonb,
  '["Web","iOS","Android"]'::jsonb,
  true,
  '{"initialRating":4.68,"reviewCount":46}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  developer = EXCLUDED.developer,
  logo = EXCLUDED.logo,
  badge = EXCLUDED.badge,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  url = EXCLUDED.url,
  pricing = EXCLUDED.pricing,
  "pricingDetails" = EXCLUDED."pricingDetails",
  categories = EXCLUDED.categories,
  "useCases" = EXCLUDED."useCases",
  subjects = EXCLUDED.subjects,
  "educationLevel" = EXCLUDED."educationLevel",
  skills = EXCLUDED.skills,
  pros = EXCLUDED.pros,
  cons = EXCLUDED.cons,
  limitations = EXCLUDED.limitations,
  languages = EXCLUDED.languages,
  platforms = EXCLUDED.platforms,
  verified = EXCLUDED.verified,
  "demoStats" = EXCLUDED."demoStats";

INSERT INTO public.ai_tools (
  id, name, developer, logo, badge, tagline, description, url, pricing, "pricingDetails",
  categories, "useCases", subjects, "educationLevel", skills, pros, cons, limitations, languages, platforms, verified, "demoStats"
) VALUES (
  'notion-ai',
  'Notion AI',
  'Notion Labs',
  'https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg',
  'Productivity',
  'AI จัดระเบียบโน้ต สรุปเลกเชอร์ และจัดการตารางอ่านหนังสือ',
  'ระบบ AI ที่ฝังตัวอยู่ในสมุดจดโน้ต Notion ช่วยสรุปเลกเชอร์ที่จดไว้ แปลงโน้ตยาวๆ เป็น Action Items หรือตารางอ่านหนังสือ และช่วยระดมความคิดในการทำงานกลุ่ม',
  'https://www.notion.so/product/ai',
  'Freemium / Add-on',
  'Notion ปกติฟรีสำหรับนักศึกษา / Notion AI มีโควตาทดลองใช้ฟรี จากนั้น $8-10/เดือน',
  '["Productivity","Writing","Learning"]'::jsonb,
  '["สรุปเลกเชอร์จากห้องเรียน","จัดตารางอ่านหนังสือก่อนสอบ","ระดมความคิดทำงานกลุ่ม","สร้างฐานความรู้ (Second Brain)"]'::jsonb,
  '["การจัดระเบียบ","ทุกวิชา","การบริหารเวลา","การทำงานร่วมกัน"]'::jsonb,
  '["มัธยมต้น","มัธยมปลาย","มหาวิทยาลัย"]'::jsonb,
  '{"learning":88,"reasoning":82,"writing":90,"research":84,"coding":70,"mathScience":65,"creativeMedia":78,"productivity":98}'::jsonb,
  '["ผสานรวมกับการจดโน้ตและการจัดการโปรเจกต์ได้อย่างไร้รอยต่อ","มีฟีเจอร์ Q&A ถามข้อมูลจากโน้ตเก่าๆ ที่เราเคยจดไว้ได้ทั้งหมด","นักเรียนนักศึกษาสมัคร Notion Plus ฟรีได้ด้วยอีเมลสถานศึกษา"]'::jsonb,
  '["ฟีเจอร์ Notion AI ต้องชำระเงินเพิ่มหลังจากหมดโควตาทดลองใช้ฟรี","ต้องใช้เวลาเรียนรู้วิธีจัดระเบียบหน้ากระดาษ Notion ในช่วงแรก"]'::jsonb,
  '["โควตาทดลองใช้ AI มีจำกัดต่อ Workspace"]'::jsonb,
  '["ไทย","อังกฤษ","และกว่า 20+ ภาษา"]'::jsonb,
  '["Web","macOS","Windows","iOS","Android"]'::jsonb,
  true,
  '{"initialRating":4.78,"reviewCount":89}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  developer = EXCLUDED.developer,
  logo = EXCLUDED.logo,
  badge = EXCLUDED.badge,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  url = EXCLUDED.url,
  pricing = EXCLUDED.pricing,
  "pricingDetails" = EXCLUDED."pricingDetails",
  categories = EXCLUDED.categories,
  "useCases" = EXCLUDED."useCases",
  subjects = EXCLUDED.subjects,
  "educationLevel" = EXCLUDED."educationLevel",
  skills = EXCLUDED.skills,
  pros = EXCLUDED.pros,
  cons = EXCLUDED.cons,
  limitations = EXCLUDED.limitations,
  languages = EXCLUDED.languages,
  platforms = EXCLUDED.platforms,
  verified = EXCLUDED.verified,
  "demoStats" = EXCLUDED."demoStats";

INSERT INTO public.ai_tools (
  id, name, developer, logo, badge, tagline, description, url, pricing, "pricingDetails",
  categories, "useCases", subjects, "educationLevel", skills, pros, cons, limitations, languages, platforms, verified, "demoStats"
) VALUES (
  'copilot-ms',
  'Microsoft Copilot',
  'Microsoft',
  'https://upload.wikimedia.org/wikipedia/commons/2/2a/Microsoft_365_Copilot_Icon.svg',
  'Free GPT-4',
  'AI สารพัดประโยชน์พร้อมค้นเว็บสดและวาดรูป DALL-E ฟรี',
  'AI ผู้ช่วยจาก Microsoft ที่ใช้โมเดล GPT-4 และ DALL-E 3 ฟรี ค้นหาข้อมูลล่าสุดจากเว็บบราวเซอร์ Edge ช่วยสร้างภาพประกอบการเรียน และสรุปหน้าเว็บหรือไฟล์ PDF ได้ฟรีทันที',
  'https://copilot.microsoft.com',
  'Free',
  'ใช้งาน GPT-4 และ DALL-E 3 ฟรี 100% ผ่านบัญชี Microsoft ทั่วไป',
  '["Learning","Research","Creative & Media","Productivity"]'::jsonb,
  '["ค้นหาข้อมูลบนเว็บพร้อมอ้างอิง","สร้างภาพประกอบรายงานด้วย DALL-E","สรุปหน้าเว็บและ PDF ในเบราว์เซอร์ Edge","ช่วยตรวจทานการบ้าน"]'::jsonb,
  '["ทั่วไป","วิทยาศาสตร์","สังคมศึกษา","ศิลปะ","ภาษาอังกฤษ"]'::jsonb,
  '["มัธยมต้น","มัธยมปลาย","มหาวิทยาลัย","บุคคลทั่วไป"]'::jsonb,
  '{"learning":90,"reasoning":88,"writing":86,"research":92,"coding":84,"mathScience":85,"creativeMedia":92,"productivity":91}'::jsonb,
  '["เข้าถึงโมเดล GPT-4 และสร้างรูป DALL-E 3 ฟรีโดยไม่มีค่าใช้จ่าย","มี Sidebar สรุป PDF และวิดีโอในเบราว์เซอร์ Microsoft Edge ได้สะดวก","มีระบบเลือกรูปแบบการตอบ (Creative, Balanced, Precise)"]'::jsonb,
  '["ความเร็วในการตอบสนองอาจช้ากว่า ChatGPT เล็กน้อยในบางช่วงเวลา","การสนทนายาวๆ มีการจำกัดจำนวนเทิร์นต่อหนึ่ง Session"]'::jsonb,
  '["จำกัด 30 ข้อความต่อหนึ่งหัวข้อสนทนา (เริ่มหัวข้อใหม่ได้ฟรีไม่จำกัด)"]'::jsonb,
  '["ไทย","อังกฤษ","และหลากหลายภาษา"]'::jsonb,
  '["Web","Windows (Built-in)","iOS","Android","Edge Browser"]'::jsonb,
  true,
  '{"initialRating":4.72,"reviewCount":98}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  developer = EXCLUDED.developer,
  logo = EXCLUDED.logo,
  badge = EXCLUDED.badge,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  url = EXCLUDED.url,
  pricing = EXCLUDED.pricing,
  "pricingDetails" = EXCLUDED."pricingDetails",
  categories = EXCLUDED.categories,
  "useCases" = EXCLUDED."useCases",
  subjects = EXCLUDED.subjects,
  "educationLevel" = EXCLUDED."educationLevel",
  skills = EXCLUDED.skills,
  pros = EXCLUDED.pros,
  cons = EXCLUDED.cons,
  limitations = EXCLUDED.limitations,
  languages = EXCLUDED.languages,
  platforms = EXCLUDED.platforms,
  verified = EXCLUDED.verified,
  "demoStats" = EXCLUDED."demoStats";

-- บัญชีผู้ใช้เริ่มต้น
INSERT INTO public.users_profile (id, username, password, "displayName", avatar, role, "educationLevel", "preferredPrice")
VALUES
  ('user_student_demo', 'student', 'password123', 'นักเรียน Demo', '🎓', 'student', 'มัธยมศึกษาตอนปลาย', 'All'),
  ('user_teacher_demo', 'teacher', 'password123', 'คุณครูวิชาการ', '👨‍🏫', 'teacher', 'มหาวิทยาลัย', 'Freemium')
ON CONFLICT (id) DO NOTHING;

-- รีวิวตัวอย่างเริ่มต้น
INSERT INTO public.reviews (id, "aiId", "userName", "userRole", avatar, date, overall, dimensions, "useCase", comment, likes)
VALUES
  ('seed_1_chatgpt', 'chatgpt', 'ก้องภพ (ม.6 สายวิทย์)', 'มัธยมปลาย', '👨‍🎓', '2025-01-15', 5, '{"learningFit": 5, "accuracy": 4.8, "simplicity": 5, "helpfulness": 4.9, "easeOfUse": 5, "value": 4.9}'::jsonb, 'สรุปชีววิทยา & เคมี', 'ช่วยสรุปเนื้อหายากๆ ได้กระชับมาก อธิบายวงจรเครบส์เข้าใจง่ายกว่าอ่านในหนังสือเองเยอะเลยครับ', 24),
  ('seed_2_chatgpt', 'chatgpt', 'แพรวา (ปี 1 วิศวะ)', 'มหาวิทยาลัย', '👩‍💻', '2025-01-10', 4.5, '{"learningFit": 4.7, "accuracy": 4.6, "simplicity": 4.8, "helpfulness": 4.7, "easeOfUse": 4.9, "value": 4.6}'::jsonb, 'ช่วยเขียนโค้ดและแก้บั๊ก', 'ช่วยคิดอัลกอริทึมได้เร็วมาก แนะนำให้ตรวจสอบผลลัพธ์อีกครั้งก่อนนำไปส่งอาจารย์เพื่อความชัวร์', 18),
  ('seed_1_claude', 'claude', 'ธนพล (ปี 2 อักษรศาสตร์)', 'มหาวิทยาลัย', '📚', '2025-01-18', 5, '{"learningFit": 5, "accuracy": 5, "simplicity": 4.8, "helpfulness": 5, "easeOfUse": 4.7, "value": 4.8}'::jsonb, 'เขียนรายงานภาษาอังกฤษ', 'ทักษะการเรียบเรียงภาษาดีมาก สำนวนสละสลวยเหมือนเจ้าของภาษาเขียนเองเลยครับ', 31),
  ('seed_1_perplexity', 'perplexity', 'ณัฐชา (ม.5 สายศิลป์-คำนวณ)', 'มัธยมปลาย', '🔬', '2025-01-20', 4.9, '{"learningFit": 4.9, "accuracy": 5, "simplicity": 4.7, "helpfulness": 4.9, "easeOfUse": 4.8, "value": 5}'::jsonb, 'ค้นคว้าทำรายงานประวัติศาสตร์', 'ชอบตรงที่มีแหล่งอ้างอิงชัดเจน สามารถกดคลิกไปอ่านต่อจากต้นฉบับได้ทันที', 27)
ON CONFLICT (id) DO NOTHING;

-- ข้อเสนอแนะ AI จากชุมชนเริ่มต้น
INSERT INTO public.community_submissions (id, name, url, category, "useCase", "whyRecommend", "submittedBy", "submittedDate", status)
VALUES
  ('sub_demo_1', 'Phind AI', 'https://www.phind.com', 'Coding', 'ค้นหาเทคนิคการเขียนโปรแกรมสำหรับโปรเจกต์', 'ตอบปัญหาเกี่ยวกับโค้ดได้ตรงจุดพร้อมตัวอย่างชัดเจน', 'คุณสมชาย (นักเรียน Demo)', '2025-01-18', 'pending')
ON CONFLICT (id) DO NOTHING;
