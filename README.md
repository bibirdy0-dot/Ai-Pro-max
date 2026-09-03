# 🤖 AI Learning Hub

> เว็บไซต์รวม **เครื่องมือ AI สำหรับนักเรียนไทย** — ค้นหา, เปรียบเทียบ, และรับคำแนะนำ AI ที่เหมาะกับคุณ

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue)](https://your-username.github.io/nex)
[![Supabase](https://img.shields.io/badge/Database-Supabase-green)](https://supabase.com)

---

## ✨ ฟีเจอร์หลัก

| ฟีเจอร์ | รายละเอียด |
|---|---|
| 🔍 **ค้นหา AI** | Filter ตามหมวดหมู่, ราคา, ระดับการศึกษา |
| ⚖️ **เปรียบเทียบ** | Compare AI ได้สูงสุด 4 ตัวพร้อมกัน |
| ✨ **Quiz แนะนำ AI** | ตอบ 5 คำถามรับคำแนะนำ AI ที่ Match สูงสุด |
| ❤️ **รายการโปรด** | บันทึก AI ที่ชอบไว้ใช้งานภายหลัง |
| 🌐 **Community** | เสนอ AI ใหม่ให้ชุมชนได้ใช้ร่วมกัน |
| ⭐ **Rating & Review** | ให้คะแนน AI 6 มิติ พร้อมรีวิวจากผู้ใช้จริง |
| 👤 **ระบบบัญชีผู้ใช้** | สมัครสมาชิก, เข้าสู่ระบบ, จัดการโปรไฟล์ |

---

## 🗂️ โครงสร้างไฟล์ (File Structure)

```
nex/
├── index.html              # หน้าแรก
├── discover.html           # ค้นหาและกรอง AI
├── compare.html            # เปรียบเทียบ AI
├── quiz.html               # Quiz แนะนำ AI ส่วนตัว
├── community.html          # ชุมชนเสนอ AI ใหม่
├── favorites.html          # รายการ AI โปรด
├── profile.html            # โปรไฟล์ผู้ใช้และบัญชี
├── ai/
│   └── detail.html         # หน้ารายละเอียด AI แต่ละตัว
├── css/
│   ├── style.css           # Design Tokens และ Global Styles
│   ├── components.css      # Buttons, Cards, UI Components
│   └── responsive.css      # Mobile & Responsive Layout
├── js/
│   ├── supabase-client.js  # 🔌 Supabase Connection & Health Check
│   ├── auth.js             # ระบบ Authentication (Login/Register)
│   ├── data.js             # Data Layer (Supabase + LocalStorage)
│   ├── ui.js               # UI Rendering (Cards, Toast, Modal)
│   ├── app.js              # App Bootstrap & Navigation
│   ├── search.js           # ระบบค้นหาและ Filter
│   ├── compare.js          # Logic เปรียบเทียบ AI
│   ├── rating.js           # ระบบ Rating 6 มิติ
│   ├── recommendation.js   # Algorithm แนะนำ AI
│   ├── community.js        # Community Submissions
│   └── favorites.js        # หน้ารายการโปรด
├── data/
│   └── ai-data.json        # ข้อมูล AI 12 ตัว (Fallback ออฟไลน์)
└── supabase/
    └── supabase_schema_and_seed.sql  # SQL Schema + ข้อมูลเริ่มต้น
```

---

## 🚀 วิธีติดตั้งและใช้งาน

### 1. Clone โปรเจกต์
```bash
git clone https://github.com/your-username/nex.git
cd nex
```

### 2. ตั้งค่า Supabase Database
1. ไปที่ [supabase.com](https://supabase.com) และสร้างโปรเจกต์ใหม่
2. เปิด **SQL Editor** และรันไฟล์ `supabase/supabase_schema_and_seed.sql`
3. อัปเดต Supabase URL และ Anon Key ใน `js/supabase-client.js`

### 3. เปิดใช้งาน
เปิดไฟล์ `index.html` ในเบราว์เซอร์ได้เลย — **ไม่ต้องมี Server!**

หรือใช้ [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) ใน VS Code

---

## 🗄️ Supabase Database Schema

| ตาราง | หน้าที่ |
|---|---|
| `ai_tools` | รายการเครื่องมือ AI ทั้งหมด 12 ตัว |
| `users_profile` | บัญชีผู้ใช้และโปรไฟล์ |
| `reviews` | รีวิวและคะแนน 6 มิติ |
| `favorites` | รายการ AI ที่ผู้ใช้บันทึกไว้ |
| `community_submissions` | AI ที่ชุมชนเสนอเข้ามา |
| `user_preferences` | การตั้งค่าและผล Quiz ส่วนตัว |

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **Database**: [Supabase](https://supabase.com) (PostgreSQL + REST API)
- **Fonts**: Google Fonts (Noto Sans Thai, Inter)
- **Icons**: Emoji Native
- **Hosting**: GitHub Pages / Netlify / Vercel

---

## 👤 Demo Accounts

| Username | Password | Role |
|---|---|---|
| `student` | `password123` | นักเรียน Demo |
| `teacher` | `password123` | คุณครูวิชาการ |

---

## 📄 License

MIT License © 2025–2026 AI Learning Hub
