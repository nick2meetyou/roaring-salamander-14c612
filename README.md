# Dashboard การขนส่งกระดาษคำตอบ

แดชบอร์ด React + Vite ที่จัดหน้าตาให้ใกล้ภาพอ้างอิง พร้อม CRUD (เพิ่ม/แก้ไข/ลบ), ค้นหา, กรองสถานะ, export CSV และ responsive layout

## 1) เปิดในเครื่อง
```bash
npm install
npm run dev
```

ถ้าไม่ตั้งค่า Supabase ระบบจะใช้ `localStorage` ของ browser เป็นโหมดสาธิต ข้อมูลจะคงอยู่ใน browser/เครื่องนั้นเท่านั้น

## 2) ใช้ฐานข้อมูลร่วมกัน (แนะนำสำหรับการใช้งานจริง)
1. สร้างโปรเจกต์ที่ [Supabase](https://supabase.com/)
2. ไปที่ SQL Editor แล้วรันไฟล์ `supabase.sql`
3. คัดลอก Project URL และ anon/public key จาก Project Settings → API
4. สร้างไฟล์ `.env` จาก `.env.example` แล้วกำหนด:
   ```
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   ```
5. `npm install` และ `npm run dev` อีกครั้ง ข้อมูลจะอ่าน/เขียนผ่าน Supabase
6. นำ URL และ anon key เดียวกันไปตั้งใน Netlify: Site configuration → Environment variables โดยใช้ชื่อ `VITE_SUPABASE_URL` และ `VITE_SUPABASE_ANON_KEY` จากนั้น trigger deploy ใหม่

**ความปลอดภัย:** SQL ตัวอย่างเปิด CRUD ให้ `anon` เพื่อให้ทดลองได้ง่ายเท่านั้น ไม่ควรใช้กับข้อมูลปฏิบัติการจริงโดยไม่เพิ่มระบบ Authentication และ Row Level Security ที่จำกัดสิทธิ์ผู้ใช้ ห้ามนำ `service_role` key ไปไว้ใน frontend หรือ Netlify environment variables ที่ขึ้นต้นด้วย `VITE_`.

## 3) Deploy บน Netlify
- อัปโหลดโฟลเดอร์นี้ขึ้น GitHub
- Netlify → Add new site → Import an existing project → เลือก repository
- Build command: `npm run build`
- Publish directory: `dist`
- ตั้ง environment variables ตามข้อ 2 (หากใช้ Supabase) แล้ว Deploy

## หมายเหตุ
ข้อมูลตัวอย่างถูกจำลองตามข้อความที่อ่านได้จากภาพ ไม่ใช่ข้อมูลสดจาก GPS จริง และเวลา/สถานะในภาพจะไม่อัปเดตอัตโนมัติจนกว่าจะมีการแก้ไขข้อมูลหรือเชื่อมต่อระบบต้นทาง
