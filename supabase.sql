-- Dashboard ขนส่งข้อสอบ: schema สำหรับข้อมูลจากไฟล์ Excel
-- รันใน Supabase > SQL Editor > New query
-- หมายเหตุความปลอดภัย: ตารางนี้มีข้อมูลส่วนบุคคลของพนักงานขับรถ
-- ห้ามเปิด policy anon สาธารณะเมื่อใช้ข้อมูลจริง ควรใช้ Authentication + RLS จำกัดผู้ใช้ก่อนใช้งานจริง

create table if not exists public.transport_dashboard_rows (
  id text primary key,
  sheet_key text not null check (sheet_key in ('outbound','return')),
  row_order integer not null default 1,
  row_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.transport_dashboard_settings (
  id integer primary key check (id = 1),
  settings jsonb not null default '{}'::jsonb,
  saved_at timestamptz not null default now()
);

alter table public.transport_dashboard_rows enable row level security;
alter table public.transport_dashboard_settings enable row level security;

-- Policies สำหรับการทดสอบบนเว็บเดิมที่ยังไม่มีระบบล็อกอินเท่านั้น
-- ข้อมูลในตารางจะอ่าน/เพิ่ม/แก้ไข/ลบได้โดยผู้ที่เข้าถึง public API ได้
 drop policy if exists "dashboard rows read" on public.transport_dashboard_rows;
 drop policy if exists "dashboard rows insert" on public.transport_dashboard_rows;
 drop policy if exists "dashboard rows update" on public.transport_dashboard_rows;
 drop policy if exists "dashboard rows delete" on public.transport_dashboard_rows;
 drop policy if exists "dashboard settings read" on public.transport_dashboard_settings;
 drop policy if exists "dashboard settings insert" on public.transport_dashboard_settings;
 drop policy if exists "dashboard settings update" on public.transport_dashboard_settings;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.transport_dashboard_rows to anon, authenticated;
grant select, insert, update on public.transport_dashboard_settings to anon, authenticated;

create policy "dashboard rows read" on public.transport_dashboard_rows for select to anon, authenticated using (true);
create policy "dashboard rows insert" on public.transport_dashboard_rows for insert to anon, authenticated with check (true);
create policy "dashboard rows update" on public.transport_dashboard_rows for update to anon, authenticated using (true) with check (true);
create policy "dashboard rows delete" on public.transport_dashboard_rows for delete to anon, authenticated using (true);
create policy "dashboard settings read" on public.transport_dashboard_settings for select to anon, authenticated using (true);
create policy "dashboard settings insert" on public.transport_dashboard_settings for insert to anon, authenticated with check (true);
create policy "dashboard settings update" on public.transport_dashboard_settings for update to anon, authenticated using (true) with check (true);
