-- rain app (rain.kneapps.fyi) in the shared Supabase project "home". Every object uses the rain_ prefix.

-- Admins who can sign in and edit (everyone else views publicly). Locked: change only via SQL.
create table public.rain_members (
  email text primary key check (email = lower(email)),
  display_name text,
  role text not null default 'admin' check (role in ('admin', 'member')),
  created_at timestamptz not null default now()
);
comment on table public.rain_members is 'rain app: the single admin who can sign in and edit. Locked: change only via SQL.';
alter table public.rain_members enable row level security;
insert into public.rain_members (email, display_name, role) values ('dor@kne.org.il', 'דור', 'admin');

create or replace function public.rain_is_member() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.rain_members where email = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;
create or replace function public.rain_is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.rain_members
                 where email = lower(coalesce(auth.jwt() ->> 'email', '')) and role = 'admin');
$$;
revoke execute on function public.rain_is_member() from public, anon;
revoke execute on function public.rain_is_admin() from public, anon;
grant execute on function public.rain_is_member() to authenticated;
grant execute on function public.rain_is_admin() to authenticated;

create policy "rain_members read by members" on public.rain_members
  for select to authenticated using (public.rain_is_member());
create policy "rain_members locked" on public.rain_members
  for all to authenticated using (false) with check (false);
