-- Daily rainfall, one row per day with rain (applied as migration rain_daily).
create table public.rain_daily (
  date date primary key,
  rainfall_mm numeric(5,1) not null check (rainfall_mm >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.rain_daily is 'rain app: daily rainfall in mm, one row per day with rain. Public read, admin write.';
alter table public.rain_daily enable row level security;
create policy "rain_daily public read" on public.rain_daily
  for select to anon, authenticated using (true);
create policy "rain_daily managed by admins" on public.rain_daily
  for all to authenticated using (public.rain_is_admin()) with check (public.rain_is_admin());
