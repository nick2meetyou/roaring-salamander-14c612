create table if not exists public.transport_units (
  id text primary key,
  unit text not null,
  destination text not null default '',
  registration text not null default '',
  scheduled_departure text not null default '08:00',
  actual_departure text not null default '',
  delay_minutes integer not null default 0,
  stops integer not null default 0,
  stops_detail text not null default '',
  return_time text not null default '',
  gps_time text not null default '',
  gps_delay_minutes integer not null default 0,
  status text not null default 'กำลังเดินทาง',
  status_detail text not null default '',
  color text not null default '#3b82f6',
  updated_at timestamptz not null default now()
);
alter table public.transport_units enable row level security;

-- Demo/internal dashboard policy: allow access via anon key.
-- IMPORTANT: for real operational data, replace these policies with authenticated-user policies.
create policy "allow read transport units" on public.transport_units for select to anon using (true);
create policy "allow insert transport units" on public.transport_units for insert to anon with check (true);
create policy "allow update transport units" on public.transport_units for update to anon using (true) with check (true);
create policy "allow delete transport units" on public.transport_units for delete to anon using (true);