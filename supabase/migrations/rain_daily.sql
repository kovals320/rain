-- Daily rainfall, one row per day with rain (applied as migration rain_daily).
create table public.rain_daily (
  date date primary key,
  rainfall_mm numeric(5,1) not null check (rainfall_mm >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.rain_daily is 'rain app: daily rainfall in mm, daily rainfall, single source data_202610181746.csv. Public read, admin write.';
alter table public.rain_daily enable row level security;
create policy "rain_daily public read" on public.rain_daily
  for select to anon, authenticated using (true);
create policy "rain_daily managed by admins" on public.rain_daily
  for all to authenticated using (public.rain_is_admin()) with check (public.rain_is_admin());

-- Season of each day (applied as migration rain_daily_season): June-May, named by its September.
-- Jun-Aug rain counts toward the season that starts that September (Dor's decision, 2026-10-18).
alter table public.rain_daily
  add column season_start integer generated always as (
    case when extract(month from date) >= 6 then extract(year from date)::int else extract(year from date)::int - 1 end
  ) stored;
create index rain_daily_season on public.rain_daily (season_start);
