# How the rain app is built

A record of the `rain.kneapps.fyi` project, so a new conversation (or a new person) can continue without the original chat.

> **Starting a new conversation with this file:** read sections 6 (how Dor likes to work), 5 (gotchas) and 2 (accounts).
> The code is in the public repo `kovals320/rain`. Other apps share the same accounts; see section 5 before adding tables.

## 1. What the app is

`משקעים ניר אליהו`: a public, read-only site showing rainfall for Kibbutz Nir Eliyahu (Hebrew, right-to-left, mobile-first).
Anyone with the link can view; only the admin (`/login`, no sign-up) can change anything. Hidden from search engines.

**Status (2026-10-18):** infrastructure only. Home page with placeholder cards, admin login, empty admin page, `/api/health`.
The data, pages (monthly, daily, charts, about) and admin tools will be decided later.

**Rain season = September to May.** Rain from September 2025 to May 2026 is season `25/26` (and so on, back to `76/77`).

Open questions (Dor is checking):
- June–August rain: 8 days, 21.5 mm in total (1979-08-16 1.9, 1992-06-16 3.4, 1992-06-17 1.1, 1993-06-07 0.9,
  1999-06-26 0.2, 2011-08-30 0.2, 2011-08-31 0.2, 2018-06-12 13.6). Leave out of season totals, add to the season
  that ended, or add to the next one?
- No reports between 2024-05-04 and 2025-01-10 (autumn of 24/25 missing?).

Stack: Next.js 16 (App Router, TypeScript), Tailwind v4, `@supabase/ssr`, font Rubik.

**Design** (own look, different from the media sites): pale sky-to-aqua gradient background, white cards with a thin border,
bright blue active tab, teal and blue numbers, a two-drop icon. Tokens in `src/app/globals.css` (`@theme`):

| Token | Value | Use |
|---|---|---|
| `sky` / `aqua` | `#eef6fb` / `#e3f7f6` | background gradient, inactive tabs |
| `card` | `#ffffff` | cards, header |
| `ink` | `#12283a` | text |
| `muted` | `#55687a` | labels |
| `line` | `#dbe7f0` | borders |
| `rain` / `rain-deep` | `#2563eb` / `#1d4fc4` | active tab, buttons, blue numbers |
| `teal` | `#0b7a74` | teal numbers |
| `drop` | `#7cc3e0` | decorative icons |

Contrast checked: ink/sky 13.8, muted/white 5.8, white/rain 5.2, teal/white 5.2.

## 2. Accounts and where things live

| Service | What | Notes |
|---|---|---|
| GitHub | `kovals320/rain` | Vercel deploys every push to `main` |
| Vercel | team "Apps" (`apps-2265`), project `rain` | Claude's Vercel connector gets 403 on this team: import, env vars and domain are done in the browser. Do NOT add the Supabase integration offered on import |
| Cloudflare | zone `kneapps.fyi` | `rain` CNAME to Vercel (DNS only, grey cloud) |
| Supabase | shared project `home` (`pjujibzoscawmstarerz`) | Every table/function/policy/bucket uses the `rain_` prefix |

## 3. Environment variables (Vercel, all environments)

| Name | Type | Value |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Config | `https://pjujibzoscawmstarerz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Config | Supabase publishable key (`sb_publishable_...`) |

`/api/health` checks Supabase auth and that the `rain_` tables exist.

## 4. Supabase

Schema in `supabase/migrations/rain_initial.sql` (applied as migration `rain_initial`): `rain_members` (admin list, locked,
change only via SQL) and the functions `rain_is_member()` / `rain_is_admin()` for policies on future tables.
Admin: `dor@kne.org.il` (same Supabase user as the other apps).

`rain_daily` (`supabase/migrations/rain_daily.sql`): `date` (primary key) and `rainfall_mm` (numeric 5,1), one row per day with
rain; days without a row had no rain. Public read, admin write.
Imported 2026-10-18 from `KneRainDaily_export.csv` (columns `date`, `rainfall` only): 2,820 days, 1976-10-23 to 2026-04-01,
total 29,295.7 mm, max 137.0 mm on 2018-12-06. Verified with an md5 over all rows (identical to the file).
Note: no rows between 2024-05-04 and 2025-01-10, so season 2024/25 is missing its autumn (only 157.5 mm recorded).

Auth: `https://rain.kneapps.fyi/**` in Authentication → URL Configuration → Redirect URLs. Never change the Site URL (shared project).

New tables: prefix `rain_`, RLS on, public read (`to anon, authenticated using (true)`) and write only for
`public.rain_is_admin()`, the same pattern as the media apps.

## 5. Gotchas (shared with the other apps)

- Supabase `home` prefixes in use: `home_`, `sport_`, `sec_`, `shirim3_`, `media_`, `kmedia_`, `rain_`.
- Claude cannot create GitHub repos; Dor creates them empty, Claude attaches with push access.
- Vercel connector: 403 on team Apps. Claude gives exact names/values; Dor does it in the browser.
- The site blocks crawlers, so Claude can't fetch `/api/health`; Dor opens it and pastes the result.
- Destructive SQL through the Supabase connector may be cancelled; drop tables in the dashboard if needed.
- Keys and passwords never go in the chat. Dor pastes them into Vercel himself.

## 6. Working preferences of the owner (Dor)

- Writes in Hebrew; **replies in English**.
- Setup work: one step at a time, explained, wait for confirmation.
- App features: build the whole thing and report when done.
- Tables get the project's prefix (`rain_`).

## 7. Setup log

1. 2026-10-18: repo `kovals320/rain` created empty; starter shell written (shell code from `kmedia`, new design), pushed.
2. Supabase migration `rain_initial` applied. Redirect URL `https://rain.kneapps.fyi/**` added.
3. Vercel project `rain` (team Apps), 2 env vars (section 3), no Supabase integration.
4. Domain `rain.kneapps.fyi`: added in Vercel, CNAME `rain` in Cloudflare (DNS only).
5. Checked: `/api/health` ok, home page, admin login works.
6. `rain_daily` created and filled with the daily history (section 4).
