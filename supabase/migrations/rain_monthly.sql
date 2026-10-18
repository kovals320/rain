-- Final rainfall per month (applied as migration rain_monthly). Season = Sep-May; season_start 2025 = 25/26.
-- Filled by scripts/merge_monthly.py from the daily reports and the monthly file (KneRain_export.csv).
create table public.rain_monthly (
  year integer not null check (year between 1900 and 2100),
  month integer not null check (month between 1 and 12),
  season_start integer not null,
  rainfall_mm numeric(6,1) not null check (rainfall_mm >= 0),
  source text not null check (source in ('daily', 'monthly', 'manual')),
  needs_review boolean not null default false,
  daily_sum_mm numeric(6,1),
  monthly_file_mm numeric(6,1),
  note text,
  updated_at timestamptz not null default now(),
  primary key (year, month),
  check (season_start = case when month >= 9 then year else year - 1 end)
);
comment on table public.rain_monthly is 'rain app: final rainfall per month (season Sep-May, season_start 2025 = 25/26). Merged from daily reports and the monthly file. Public read, admin write.';
create index rain_monthly_season on public.rain_monthly (season_start);
alter table public.rain_monthly enable row level security;
create policy "rain_monthly public read" on public.rain_monthly
  for select to anon, authenticated using (true);
create policy "rain_monthly managed by admins" on public.rain_monthly
  for all to authenticated using (public.rain_is_admin()) with check (public.rain_is_admin());
