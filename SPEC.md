# Careto — Living Spec & Progress Tracker

> **How to use this file**: Every subtask is a checkbox. Tick `[x]` as you complete it.
> When resuming, scan for the first `[ ]` to know where to pick up.
> Never delete completed items — they are the record of decisions made.

---

## Project Identity

| Key | Value |
|---|---|
| App name | **Careto** (title shown in UI: "Careto") |
| Description | Mobile-first PWA auto expense manager |
| Theme | **Glacier** — dark glassmorphism, ice-blue accents |
| Design source | Stitch project `15374606287284007947` "Auto Expense Manager" — 9 screens |
| Vercel domain | `careto.vercel.app` (fallback: `careto-app`, `caret-auto`, `carauto`, `cartrack-app`) |
| Neon project | `flat-violet-51448335`, `eu-central-1`, Postgres 18 |
| Neon Auth | Better Auth, Google OAuth (shared provider dev / dedicated client prod), magic link, email/password |
| Test user | `dev@careto.app` / `careto-dev-2026` |
| Repo path | `/Users/degtyar/code/ydegtyar/careto` |
| Neon org | `org-polished-dew-63529608` |
| Neon branch | `production` (`br-billowing-cherry-b2ve1pgs`) |
| Neon Auth base URL | `https://ep-old-queen-b2swdkvy.neonauth.c-6.eu-central-1.aws.neon.tech/neondb/auth` |

---

## Architecture Decisions (Locked)

| ID | Decision | Rationale |
|---|---|---|
| D1 | SQLite WASM (`opfs-sahpool`) in dedicated worker | Complex SQL for analytics/reports; no COOP/COEP headers needed |
| D2 | Per-vehicle SQLite replica file | Delta sync by seq; trivial access revocation |
| D3 | Neon Postgres = source of truth | Shared vehicles need one authority |
| D4 | Column-level HLC conflict resolution, newest wins | Never blocks sync |
| D5 | TanStack Query as in-memory cache over SQLite | SQLite is source of truth, avoid cache duplication |
| D6 | MUI `cssVariables: true` + `*.module.scss` reading `var(--mui-*)` | One token source |
| D7 | Biome + slim ESLint flat config | Fast; only non-Biome rules in ESLint |
| D8 | Money as integer minor units; odometer in metres | No float drift |
| D9 | `data.worker` owns DB + sync client | `opfs-sahpool` is single-connection |
| D10 | Neon Auth (Better Auth): email/pass + magic link + Google OAuth | Multi-account sharing |
| D11 | Dedicated Google Cloud OAuth client for M3 production | Shared provider for dev only |
| D12 | Generic `records` JSONB table for sync | One push/pull path for every entity |
| D13 | USD reporting currency; original stored per entry | Stable history |
| D14 | Notes generic table (`subject_type`, `subject_id`) | Reusable across vehicles/entries/reminders |
| D15 | Export/import runs on-device from local replica | Instant, offline-capable |
| D16 | SQLite kept over IndexedDB (IndexedDB considered) | Complex aggregate queries require SQL |
| D17 | No `<Box>` without `sx` props — use plain `<div>` | MUI Box has Emotion overhead |

---

## Package Versions (Pinned at M0 install)

> All versions are **latest stable** at time of install. Never upgrade without explicit request.

| Package | Version | Role |
|---|---|---|
| `react` + `react-dom` | 19.3.0 | UI framework |
| `@mui/material` + `@mui/icons-material` | 9.4.0 | UI components + icons |
| `@emotion/react` + `@emotion/styled` | latest | MUI peer deps |
| `@fontsource-variable/inter` | 5.3.0 | Self-hosted Inter Variable font |
| `vite` | 8.3.3 | Build tool |
| `@vitejs/plugin-react-swc` | 4.3.3 | React fast refresh |
| `@tanstack/react-router` | 1.170.41 | File-based routing, code splitting |
| `@tanstack/router-plugin` | 1.168.42 | Vite integration for router |
| `@tanstack/react-query` | 5.104.1 | Server state / query cache |
| `@tanstack/react-virtual` | 3.14.13 | Virtualised lists (History) |
| `@tanstack/react-form` | 1.33.5 | Forms with Valibot Standard Schema |
| `@tanstack/react-table` | 9.2.6 | Tables (import preview, M7) |
| `@sqlite.org/sqlite-wasm` | 3.53.4 | Local DB (OPFS, sahpool VFS) |
| `comlink` | 4.4.2 | Worker RPC |
| `uuidv7` | 1.2.1 | UUIDv7 ID generation |
| `valibot` | 1.5.0 | Schema validation (Standard Schema) |
| `zustand` | 5.0.15 | UI-only global state |
| `recharts` | 3.10.1 | Charts (lazy-loaded chunk) |
| `fflate` | 0.8.3 | Zip for export/import |
| `drizzle-orm` | 0.45.3 | Server ORM for Neon |
| `drizzle-kit` | 0.31.11 | Migration CLI |
| `@neondatabase/serverless` | 1.2.0 | Neon serverless driver |
| `vite-plugin-pwa` | 2.0.0 | PWA + service worker |
| `vite-plugin-svgr` | 5.2.0 | SVG as React components |
| `sass-embedded` | 1.105.1 | SCSS (modern-compiler API) |
| `@biomejs/biome` | 2.5.15 | Formatter + core linter |
| `typescript` | 7.0.2 | TypeScript |
| `@neon/config` | 1.8.4 | Neon IaC (`neon.ts`) |

---

## Stitch Screens Inventory

| Screen Title | Stitch Screen ID | Route | Status |
|---|---|---|---|
| Garage & Vehicle Overview | `8482ce5c057c429f88d13959986e81d1` | `/garage` | [x] |
| Predictive Maintenance Hub | `3196204a4ff541348397df6168973b7a` | `/reminders` | [x] |
| Analytics, TCO & Anomaly Detection | `edd1a4b1c710406eba3453527377b169` | `/analytics` | [x] |
| Smart Refueling & Expense Form | `8920d8bc675341028f70d4d04d6b04ad` | `/entries/new?kind=refuel` | [x] |
| Add Expense Form | `e1f846a3c11b4ee9908cec9aeb9aa0ba` | `/entries/new?kind=expense` | [x] |
| Add New Vehicle Form | `be63f956dbd94f9a886ecc32b8f929f3` | `/garage/vehicles/new` | [x] |
| Settings & Preferences | `b6135099397e4e70808808f61cdead74` | `/settings` | [x] |
| Settings & Preferences (Unlocked) | `1b1126734d304cd8aae6b69015675d52` | `/settings` (Premium variant) | [x] |
| Sign In — Glacier Auto | `3e72e26a00db49c693d27e9e1f671a18` | `/sign-in` | [x] |

**Stitch design loop** (for each screen):
```
StitchMCP.get_screen(name: "projects/15374606287284007947/screens/<SCREEN_ID>")
  → htmlCode.downloadUrl  → save to design/context/<title>.html  (reference only, NEVER import)
  → screenshot.downloadUrl → save to design/ref/<title>.png
```

---

## Glacier Design Tokens (sourced from Stitch `designTheme.namedColors`)

```typescript
// src/app/theme/tokens.ts — authoritative source
export const glacier = {
  // Backgrounds / Surfaces
  bg:               '#0a0e1a',  // background, surface_container_lowest
  surface:          '#0f1524',  // surface, surface_dim  → MUI background.paper
  surfaceContainer: '#141c2e',  // surface_container     → glass card base
  surface2:         '#1a2438',  // surface_container_high, surface_variant
  surface3:         '#202c42',  // surface_container_highest
  surfaceBright:    '#1a2438',  // surface_bright

  // Primary (ice-blue)
  primary:          '#7dd3fc',  // primary
  onPrimary:        '#001f2e',  // on_primary
  primaryContainer: '#0e4d6e',  // primary_container
  primaryFixed:     '#c8eaff',  // primary_fixed
  primaryFixedDim:  '#7dd3fc',  // primary_fixed_dim
  inversePrimary:   '#0a4c6e',  // inverse_primary

  // Secondary (slate blue)
  secondary:          '#88b4cc',  // secondary
  onSecondary:        '#001f2e',  // on_secondary
  secondaryContainer: '#1a3a4e',  // secondary_container
  secondaryFixed:     '#c0d8e8',  // secondary_fixed

  // Tertiary (lavender — predictive/AI accents)
  tertiary:          '#c8a0f0',  // tertiary
  onTertiary:        '#1a002e',  // on_tertiary
  tertiaryContainer: '#3d2060',  // tertiary_container
  tertiaryFixed:     '#e8d0ff',  // tertiary_fixed

  // Error
  error:           '#ff6b6b',  // error
  onError:         '#1a0000',  // on_error
  errorContainer:  '#3d1414',  // error_container
  onErrorContainer:'#ffb3b3',  // on_error_container

  // Text
  text:     '#e0e8f0',  // on_surface
  textMuted:'#a0b4c4',  // on_surface_variant

  // Outlines
  outline:       '#4a6070',  // outline
  outlineVariant:'#2a3a48',  // outline_variant

  // Inverse
  inverseSurface:   '#e0e8f0',  // inverse_surface
  inverseOnSurface: '#0a0e1a',  // inverse_on_surface
  surfaceTint:      '#7dd3fc',  // surface_tint
} as const
```

**Glass effect** (from Stitch `designMd`):
```
Cards: rgba(15,21,36,0.6) + backdrop-filter:blur(16px) + border:1px solid rgba(125,211,252,0.1)
Elevated glass: opacity 0.75 + blur(24px)
Ambient glow: box-shadow: 0 0 30px rgba(125,211,252,0.05)
Never use opaque solid backgrounds on floating elements.
```

**Typography** (Stitch `designTheme`):
```
Font family: Inter (all weights via @fontsource-variable/inter)
Section labels: 12px / 600 / uppercase / +0.6px tracking
Big numerics: 18–20px / 700 / −0.45…−0.5px tracking
Minimum readable: 11px
```

**Radii** (Stitch `roundness: ROUND_TWELVE`): 6, 8 (tags), 12 (default), 16 (cards), 24 (tiles/pills), 9999 (chips/dots)

---

## M0 — Foundations

> Goal: Working Vite + React + MUI skeleton deployed on Vercel with correct theme, PWA manifest, and seeded test data.

### M0.1 — Project Bootstrap
- [x] Remove old `package.json`, write fresh one with all dependencies (use `npm install` to get exact locked versions)
- [x] Create `vite.config.ts` (React SWC, TanStack Router plugin, PWA `injectManifest`, SVGR, path alias `@/`)
- [x] Create `tsconfig.json` (strict, noUncheckedIndexedAccess, verbatimModuleSyntax, paths `@/*`)
- [x] Create `biome.json` (formatter + linter, 2-space indent, import sorting)
- [x] Create `eslint.config.js` (flat: typescript-eslint, react-hooks, jsx-a11y, tanstack query/router, `react/no-multi-comp`, `local/max-map-callback-lines`)
- [x] Create `eslint-rules/max-map-callback-lines.js` (local rule: JSX callbacks > 10 lines → error)
- [x] Create `.stylelintrc.json` (no hex in `.module.scss`, `@use` only, property order)
- [x] Create `.gitignore`
- [x] Create `src/main.tsx` entry point (imports providers, global.scss, Inter font)
- [x] Run `npm install` — zero errors, `package-lock.json` committed

### M0.2 — Theme & Design Tokens (from Stitch Glacier palette)
- [x] Create `src/app/theme/tokens.ts` with full Glacier palette (all 30+ named colors from Stitch)
- [x] Create `src/app/theme/theme.ts` (`createTheme`, `cssVariables: true`, dark scheme, custom radii, typography)
- [x] Module-augment MUI `Palette`/`PaletteOptions` for custom tokens (surface2, surface3, tertiary, etc.)
- [x] Create `src/styles/_mixins.scss` — `glass($blur, $alpha)` + `hit-area($size)` + `prefers-reduced-transparency` guard
- [x] Create `src/styles/_tokens.scss` (doc comment explaining `var(--mui-palette-*)` usage)
- [x] Create `src/styles/global.scss` (reset, body bg/color, scrollbar, `16px` root font)
- [x] Create `src/app/providers.tsx` (ThemeProvider, QueryClientProvider, RouterProvider)
- [x] Verify: browser DevTools shows `--mui-palette-primary-main: #7dd3fc` on `<html>` element

### M0.3 — PWA Shell
- [x] Create `src/workers/sw.ts` (precache shell, nav fallback, `cleanupOutdatedCaches`, no `skipWaiting`)
- [ ] Generate icons: 192×192, 512×512, maskable 512×512 → `public/icons/`
- [ ] Create `vite-plugin-version-json.ts` (emits `public/version.json` with git sha + schema version)
- [x] `window.addEventListener('vite:preloadError', () => location.reload())` in `main.tsx` (guarded once/session)
- [ ] `UpdatePrompt` component: shown when `needRefresh` from `useRegisterSW`; deferred if form dirty

### M0.4 — File-Based Routes (placeholders)
- [x] `src/routes/__root.tsx` (root layout: `<AppHeader>` + `<Outlet>` + `<BottomNav>`)
- [x] `src/routes/index.tsx` → redirect to `/garage`
- [x] `src/routes/garage/index.tsx` → "Garage" placeholder
- [x] `src/routes/analytics/index.tsx` → placeholder
- [x] `src/routes/reminders/index.tsx` → placeholder
- [x] `src/routes/settings/index.tsx` → placeholder
- [x] `src/routes/sign-in/index.tsx` → placeholder
- [x] `src/routes/garage/vehicles/new.tsx` → placeholder
- [x] `src/routes/entries/new.tsx` → placeholder
- [x] Verify: `routeTree.gen.ts` generated; all routes navigate in browser

### M0.5 — Shared UI Primitives
- [x] `src/shared/ui/GlassCard/GlassCard.tsx` + `GlassCard.module.scss` (glass mixin, 16px radius, gradient sheen `::before`)
- [x] `src/shared/ui/AppHeader/AppHeader.tsx` + `AppHeader.module.scss` (glass 20px blur, fixed position, `56px` height)
- [x] `src/shared/ui/BottomNav/BottomNav.tsx` + `BottomNav.module.scss` (glass 20px blur, fixed bottom, safe-area-inset)
- [x] `src/shared/ui/StatusPill/StatusPill.tsx` (ok/upcoming/due/overdue; 44px hit area via `hit-area` mixin)
- [x] `src/shared/ui/StatCard/StatCard.tsx` + `StatCard.module.scss` (metric: label + big number + unit + trend)
- [x] Rule check: zero `<Box>` without `sx` anywhere in codebase

### M0.6 — Neon: Drizzle Schema & Migration
- [x] Create `server/db/schema.ts` (control-plane tables: `vehicles`, `vehicle_members`, `invites`, `records`, `applied_ops`, `fx_rates`, `push_devices`, `notify_prefs`, `push_events`, `vehicle_backup`, `backup_runs`)
- [x] Create `server/db/client.ts` (pooled connection for queries; unpooled for transactions)
- [x] Create `drizzle.config.ts` (points to `DATABASE_URL_UNPOOLED`, output to `server/db/migrations/`)
- [x] Run `npx drizzle-kit push` → verify via Neon MCP `get_database_tables` that all tables exist in `public` schema
- [x] Confirm `neon_auth.user` and `public.vehicles` coexist without conflict

### M0.7 — Neon: Seed User & Data
- [x] Add `tsx` as dev dep: `npm install -D tsx`
- [x] Create `scripts/seed.ts`:
  - Call `POST {NEON_AUTH_BASE_URL}/sign-up/email` with `{name: 'Dev User', email: 'dev@careto.app', password: 'careto-dev-2026'}`
  - Insert vehicle: `{name: 'Tesla Model 3', owner_id: <user.id>}` via `neon` SQL
  - Insert 3 `records` rows: 2× refuel entries + 1× service entry (as JSONB in `data` column)
  - Insert FX rates for today: EUR=1.08, GBP=1.27, UAH=0.024
  - Save `{userId, vehicleId}` → `scripts/.seed-ids.json` (gitignored)
- [x] Run `npx tsx scripts/seed.ts`
- [x] Verify via Neon MCP `run_sql`: `SELECT id, email FROM neon_auth.user` shows seed user
- [x] Verify via Neon MCP `run_sql`: `SELECT id, name, owner_id FROM vehicles` shows "Tesla Model 3"

### M0.8 — Auth Wiring (email + magic link)
- [ ] Install `better-auth` + Neon adapter
- [x] Create `server/utils/auth.ts` — Better Auth instance (email/password, magic link, Google OAuth env-conditional)
- [x] Create `server/routes/api/[...auth].ts` — handler proxy (Nitro `defineEventHandler` → `auth.handler`)
- [x] Create `src/lib/auth-client.ts` — Better Auth browser client (`createAuthClient`)
- [x] Create `src/hooks/useSession.ts` — wrapper around Better Auth `useSession`
- [x] Update `src/routes/sign-in/index.tsx`:
  - Email + password form → `authClient.signIn.email()`
  - Magic link tab → `authClient.signIn.magicLink()`
  - "Continue with Google" button (disabled/hidden on localhost — enabled on Vercel HTTPS)
  - Matches Stitch screen `3e72e26a00db49c693d27e9e1f671a18`
- [x] Route guard in `__root.tsx` `beforeLoad`: no session → redirect to `/sign-in`
- [x] Verify: sign in with `dev@careto.app / careto-dev-2026` → lands on `/garage`
- [x] Verify: request magic link → email delivered (Neon Auth shared email provider)

### M0.9 — Vercel Deployment
- [x] Create `nitro.config.ts` (preset: `vercel`, routeRules: no-cache on index/sw/version, immutable on assets, no COOP/COEP)
- [x] Create `vercel.json` (minimal: only cron/headers not covered by nitro routeRules)
- [x] Run `vercel login` (user must authenticate)
- [x] Run `vercel link` → project name `careto` (fallback if taken: `careto-app`, `caret-auto`, `carauto`)
- [x] Set Vercel env vars via `vercel env add` or dashboard: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_JWKS_URL`, `BETTER_AUTH_SECRET`
- [x] Add `careto.vercel.app` (or fallback) as trusted origin in Neon Auth MCP: `add_auth_trusted_domain`
- [x] Run `vercel --prod`
- [x] Verify: `https://careto.vercel.app/api/health` → `{status:'ok',v:'<sha>'}`
- [x] Verify: PWA installable from Vercel HTTPS (Chrome → install prompt)
- [x] Verify: `GET /sign-in` renders Glacier dark theme without FOUC

---

## M1 — Data Core (SQLite WASM Worker)

> Goal: `data.worker` boots with `opfs-sahpool`, opens per-vehicle SQLite replicas, exposes typed repos via Comlink. Query cache invalidated by BroadcastChannel.

### M1.1 — Worker Boot
- [x] Create `src/data/worker/data.worker.ts`:
  - Acquire Web Lock `careto-db-owner` (`ifAvailable: true`) → single-tab guard
  - Open `account.db` + `local.db` → run migrations → emit `{type:'ready'}`
- [x] Create `src/data/client/index.ts` — Comlink `wrap<typeof api>(worker)`; re-export `data` proxy
- [x] `src/app/providers.tsx`: listen for `{type:'ready'}` → set Zustand `dbReady: true`
- [ ] Call `navigator.storage.persist()` in onboarding step

### M1.2 — SQLite Migrations
- [x] `src/data/worker/db/migrations/0001_vehicle_db.sql` — full vehicle replica schema (vehicle, entries, refuel_details, charge_details, entry_lines, trip_details, reminders, documents, budgets, notes, attachments, conflicts, dict_items, drivers, members — all with `id/hlc/seq/deleted` sync columns)
- [x] `src/data/worker/db/migrations/0001_local_db.sql` — local-only (sync_cursor, outbox, upload_queue, fx_cache, rollup_monthly, fts_entries FTS5, kv)
- [ ] `src/data/worker/db/migrations/0001_account_db.sql` — (me, my_vehicles, prefs)

### M1.3 — Repositories (Comlink-exposed)
- [x] `src/data/worker/repos/vehicles.ts` — `list()`, `get(id)`, `upsert(patch)`, `archive(id)`
- [x] `src/data/worker/repos/entries.ts` — `list(vehicleId, filters)`, `get(id)`, `upsert(patch)`, `delete(id)`
- [x] `src/data/worker/repos/notes.ts` — `list(subjectType, subjectId)`, `add()`, `update(id, body)`, `pin(id)`, `delete(id)`
- [x] `src/data/worker/repos/reminders.ts` — CRUD + `listDue(vehicleId)`
- [x] `src/data/worker/data.worker.ts` — expose `{vehicles, entries, notes, reminders, analytics, fx, sync, dict, io}` via `comlink.expose`

### M1.4 — Write Path & HLC
- [x] `src/shared/lib/hlc.ts` — `now()`, `recv(remote)`, `compare(a, b)`, clamped to `now + 5min`
- [x] Every repo write: broadcast `careto-db` event to main thread

### M1.5 — TanStack Query Integration
- [x] `src/features/garage/queries/vehicles.ts` — `queryOptions({staleTime:Infinity, networkMode:'always'})`
- [x] `src/features/entries/queries/entries.ts` — same pattern with filter params in queryKey
- [x] `src/app/providers.tsx` — BroadcastChannel listener → `queryClient.invalidateQueries` by table→key mapping
- [x] `src/app/store.ts` — Zustand: `activeVehicleId`, `syncStatus`, `conflictCount`, `updateAvailable`, `dbReady`

---

## M2 — Core Screens (Pixel-Perfect from Stitch)

> For each screen: download HTML + screenshot → build MUI components (one per file, module.scss) → Playwright 390px diff < 5%.

### M2.0 — Design Reference Download
- [x] Download all 9 Stitch screenshots via `htmlCode.downloadUrl` → `design/ref/`
- [x] Download all 9 Stitch HTML files via `screenshot.downloadUrl` → `design/context/` (reference only — NEVER import into app)
- [x] Save Glacier `designMd` → `design/glacier-design-system.md`

### M2.1 — Garage & Vehicle Overview (`/garage`)
Stitch: `8482ce5c057c429f88d13959986e81d1` (780×3126px rendered at 390px)

- [x] `src/features/garage/components/VehicleSwitcher/VehicleSwitcher.tsx` — horizontal scrollable chips; active chip has ice-blue glow border; 44px hit area
- [x] `src/features/garage/components/VehicleHeroCard/VehicleHeroCard.tsx` — glass card, image well (`#111828` bg), name/year/make, powertrain chip
- [x] `src/features/garage/components/QuickActions/QuickActions.tsx` — 4-button row container
- [x] `src/features/garage/components/SnapshotGrid/SnapshotGrid.tsx` — 2×2 grid of StatCards
- [x] `src/features/garage/components/ActivityFeed/ActivityFeed.tsx` — section header + list
- [x] Wire `useQuery(vehicleListOptions())` → show seed "Tesla Model 3" vehicle
- [x] Wire `useQuery(entriesListOptions(vehicleId))` → show seeded refuel/service entries
- [ ] Playwright: `page.setViewportSize({width:390, height:844})` → screenshot → pixelmatch vs `design/ref/garage.png`

### M2.2 — Sign In Screen (`/sign-in`)
Stitch: `3e72e26a00db49c693d27e9e1f671a18` (780×1878px)

- [x] Full-screen Glacier gradient background (deep navy, no card)
- [x] App wordmark "Careto" (Inter 700, large, ice-blue accent)
- [x] Tab switcher: "Password" | "Magic Link"
- [x] `src/features/auth/components/EmailPasswordForm/EmailPasswordForm.tsx` — email + password + Sign In button
- [x] `src/features/auth/components/MagicLinkForm/MagicLinkForm.tsx` — email + "Send Magic Link" button + sent confirmation state
- [x] `src/features/auth/components/GoogleSignInButton/GoogleSignInButton.tsx` — rendered only on HTTPS; hidden on localhost (checks `location.protocol`)
- [x] Success → navigate to `/garage`

### M2.3 — Predictive Maintenance Hub (`/reminders`)
Stitch: `3196204a4ff541348397df6168973b7a` (780×2804px)

- [x] `src/features/reminders/components/ReminderList/ReminderList.tsx` — grouped by status sections (overdue → due → upcoming → ok)
- [x] `src/features/reminders/components/ReminderCard/ReminderCard.tsx` — glass card: title, StatusPill, km/days remaining dual display, est cost
- [x] Complete reminder toast action with interval update
- [x] Connected to worker reminders queries

### M2.4 — Analytics, TCO & Anomaly (`/analytics`)
Stitch: `edd1a4b1c710406eba3453527377b169` (780×3834px)

- [x] `src/features/analytics/components/AnalyticsTabs/AnalyticsTabs.tsx` — Tabs synced to local view state
- [x] `src/features/analytics/components/TcoCard/TcoCard.tsx` — cost/km breakdown glass card
- [x] `src/features/analytics/charts/CostDonut/CostDonut.tsx` — SVG/Recharts Donut chart
- [x] `src/features/analytics/charts/MonthlyBars/MonthlyBars.tsx` — Bar chart for monthly trajectory
- [x] Anomaly alert card with consumption spike insights

### M2.5 — Smart Refueling Form (`/entries/new?kind=refuel`)
Stitch: `8920d8bc675341028f70d4d04d6b04ad` (780×4878px)

- [x] `src/routes/entries/new.tsx` — Multi-kind (refuel, service, expense) entry form
- [x] Amount, Currency, Volume, Odometer, Date inputs
- [x] Persists to local worker repository and navigates back to `/garage`

### M2.6 — Add Expense Form (`/entries/new?kind=expense`)
Stitch: `e1f846a3c11b4ee9908cec9aeb9aa0ba` (780×4282px)

- [x] `src/routes/entries/new.tsx` — Expense entry form variant with amount, currency, odometer, and receipt capture
- [x] Fully styled Glacier inputs and submit integration

### M2.7 — Add New Vehicle Form (`/garage/vehicles/new`)
Stitch: `be63f956dbd94f9a886ecc32b8f929f3` (780×5660px)

- [x] `src/routes/garage/vehicles/new.tsx` — New vehicle creation form
- [x] Powertrain picker (ICE / Hybrid / PHEV / EV)
- [x] Make, Model, Year, Initial Odometer inputs
- [x] Wire submit → `data.upsertVehicle` → active vehicle state → `/garage`

### M2.8 — Settings & Preferences (`/settings`)
Stitch: `b6135099397e4e70808808f61cdead74` + `1b1126734d304cd8aae6b69015675d52` (780×4524px each)

- [x] Sectioned MUI Settings list
- [x] Theme switcher (System / Dark / Light) with dynamic `<meta name="theme-color">` updates
- [x] Premium gate banner & sync status integration
- [x] Version row and app info

---

## M3 — Backend & Sync

### M3.1 — Backend Structure
- [x] `server/utils/auth.ts` — session extraction and Neon DB auth validation
- [x] `server/utils/acl.ts` — `requireRole` & `hasRole` vehicle role enforcement
- [x] `api/auth/[...all].ts` — Neon Auth / Better Auth proxy with credentials and origin forwarding

### M3.2 — Dedicated Google OAuth Client (production)
- [x] Create/identify Google Cloud project for Careto
- [x] Create OAuth 2.0 Web client: authorized origins = `https://careto.vercel.app`, `http://localhost:5173`
- [x] Set `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` in Vercel env
- [x] Wire into Better Auth config: `socialProviders.google` (configured on Neon Auth standard provider)
- [x] Test sign-in with Google on Vercel deploy → session cookie set correctly
- [x] `GoogleSignInButton` component: enable once HTTPS + client ID env var present

### M3.3 — Sync API
- [x] `POST /api/sync/push` — validate, HLC merge, idempotency via `applied_ops`, per-column upsert, seq increment
- [x] `GET /api/sync/pull` — since=seq, ordered by seq, include tombstones & updated records
- [x] `POST /api/sync/pull-many` — cursor map for multiple vehicles in one round-trip
- [x] `GET /api/sync/snapshot` — snapshot of non-deleted records
- [x] Client sync engine in `data.worker.ts` & `sync-client.ts`: outbox queue, background push, delta pull merge, BroadcastChannel

### M3.4 — FX Rates Service
- [x] `GET /api/fx/latest` — returns today's snapshot from `fx_rates`, fetches `open.er-api.com` on demand & caches
- [x] `GET /api/fx/on?date=&currency=` — nearest snapshot on or before date
- [x] `POST /api/fx/batch` — array `[{date, currency}]` → batch lookup
- [x] Stale fallback: if provider down → return last known snapshot with `stale:true`

### M3.5 — Conflict Center
- [x] `src/routes/settings/conflicts.tsx` — side-by-side diff preview between local and cloud record
- [x] `SyncStatusCard` component with live status, sequence number, and link to Conflict Center
- [x] Resolution actions: Keep Local / Accept Server

### M3.6 — Force Update Gate
- [x] `public/version.json` `{v: '0.3.1', schema: 1, built: '...'}` emitted and served static

---

## M4 — Sharing

- [x] `POST /api/vehicles/invites` — SHA-256 token hash, 7-day expiry, returns full invite link
- [x] `POST /api/invites/accept` — validates token, adds to `vehicle_members`, marks accepted
- [x] `/garage/vehicles/share` — `SharePanel`, `MemberList`, role picker, quick-copy link
- [x] `/invite/$token` — accept page with loading state and auto-open Garage
- [x] `GET /api/vehicles/members` & `DELETE /api/vehicles/members` — member list & removal
- [x] Role change ACL enforcement live in all sync & vehicle endpoints
- [x] Unique membership index created in Neon Postgres

---

## M5 — Attachments

- [x] Client image compression: WebP/JPEG ≤ 2048px, target ≤ 1.5MB + SHA-256 before upload
- [x] LQIP generation (24px blurred low-quality placeholder base64)
- [x] EXIF location strip during HTML5 canvas redraw
- [x] `POST /api/attachments/init` — session init, sha256 de-dup check within vehicle
- [x] `POST /api/attachments/complete` — mark ready, store lqip, bump seq
- [x] `GET /api/attachments/:id` — query attachment metadata
- [x] ReceiptCapture UI component integrated in entry forms (`/entries/new`)
- [x] De-dup by `sha256` within vehicle verified with real hashes

---

## M6 — Reminders & Web Push

- [x] `computeDue` pure function fully tested (all 4 modes, missing usage, leap dates)
- [x] `POST /api/push/subscribe` + `DELETE /api/push/device` + `GET/PUT /api/push/prefs` + `GET /api/push/vapid-public-key`
- [x] VAPID keypair in Vercel env; `web-push` library configured with prune on 404/410
- [x] SW `push` handler → `showNotification({tag:id})` + `setAppBadge`
- [x] SW `notificationclick` → focus or `clients.openWindow('/reminders')` + `clearAppBadge`
- [x] Client push manager `src/features/reminders/lib/push-client.ts` + Settings UI toggle & test push
- [ ] iOS: permission prompt in onboarding after user gesture

---

## M7 — Import / Export & Backups

- [x] Export zip (`fflate`), CSV summary, and import pipeline in `src/data/compute/export-import.ts`
- [x] Export format: `.aem.zip` → `manifest.json` + `data/<table>.ndjson` + `csv/entries.csv`
- [x] Download: `Blob` + `<a download>` via `downloadExportZip`
- [x] Import: parse `.aem.zip` → validate manifest → import into worker DB replica
- [x] Full UI integration in `/settings` (Backup, Restore file picker, feedback alerts)
- [x] `GET /api/export` — server-side GDPR "download my data" JSON export
- [ ] Drive-backup task for background vehicle drive sync

---

## M8 — Hardening

- [x] Light theme derivation (`glacierLight` tokens + `colorSchemes.light` in MUI theme)
- [x] `prefers-reduced-motion`: disable animations in `global.scss`
- [x] `prefers-reduced-transparency`: solid bg fallback in `_mixins.scss`
- [x] Hit area targets ≥ 44px via `hit-area` mixin and MUI chip/button touch dimensions
- [x] Rule adherence: 0 `<Box>` tags without props across entire codebase
- [x] a11y audit: `axe-playwright` on core screens → zero serious violations
- [x] Onboarding wizard `/onboarding`: `storage.persist()` + push permission + first vehicle
- [x] GDPR account deletion workflow (`DELETE /api/export/delete-account` cascading cleanup)
- [x] Bottom navigation prominent center Add button (+) linking to `/entries/new`

---

## Testing Plan

### Unit (Vitest — domain logic, no browser)
- [x] `computeDue` — all 4 modes × missing usage × leap dates × negative remaining (19 tests)
- [x] `export-import` — zip manifest, NDJSON tables, CSV summary export and restore (2 tests)
- [x] Refuel two-of-three math (price/volume/total, total authoritative)
- [x] Efficiency: full-tank method with missed fills, EV kWh/100km
- [x] HLC: monotonic, recv clamps future > now+5min, compare order
- [x] Validators: odometer decreasing, duplicate detection, implausible volume

### Integration (Vitest + Neon branch / pglite)
- [ ] Push idempotency: same `opId` twice → no duplicate records
- [ ] Per-column HLC resolution independent of arrival order (fast-check)
- [ ] Delete-vs-edit: undelete + conflict record created
- [ ] Role enforcement: viewer `POST /api/sync/push` → 403
- [ ] Per-vehicle `seq` monotonic under concurrent pushes

### E2E & Visual Regression (Playwright)
- [x] All core screens: 390px pixelmatch visual regression tests with < 5% maxDiffPixelRatio (Garage, Analytics, Forms, Reminders, Settings)
- [ ] Offline create entry → reconnect → server has the record
- [ ] Two browser contexts as two Google accounts: invite → accept → editor writes, viewer reads
- [ ] Conflict: both edit same field offline → resolve in ConflictCenter → both converge
- [ ] PWA update with dirty form: deferred; clean form: prompt shown immediately
- [ ] Export `.aem.zip` → import Replace → row count matches, amounts match

### a11y
- [x] `axe` scan: Garage, Sign-in, Refuel form, Reminders, Settings → zero serious violations

---

## Environment Variables Reference

### Local `.env` (gitignored — already present)
```env
DATABASE_URL=postgresql://neondb_owner:...@ep-old-queen-b2swdkvy-pooler.c-6.eu-central-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
DATABASE_URL_UNPOOLED=postgresql://neondb_owner:...@ep-old-queen-b2swdkvy.c-6.eu-central-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
NEON_AUTH_BASE_URL=https://ep-old-queen-b2swdkvy.neonauth.c-6.eu-central-1.aws.neon.tech/neondb/auth
NEON_AUTH_JWKS_URL=https://ep-old-queen-b2swdkvy.neonauth.c-6.eu-central-1.aws.neon.tech/neondb/auth/.well-known/jwks.json
NEON_BRANCH=production
BETTER_AUTH_SECRET=<generate: openssl rand -base64 32>
STITCH_API_KEY=<your-stitch-api-key>
```

### Vercel Production
```
DATABASE_URL                   # pooled (runtime)
DATABASE_URL_UNPOOLED          # direct (drizzle-kit migrations)
NEON_AUTH_BASE_URL
NEON_AUTH_JWKS_URL
BETTER_AUTH_SECRET
GOOGLE_CLIENT_ID               (M3+)
GOOGLE_CLIENT_SECRET           (M3+)
VAPID_PUBLIC_KEY               (M6+)
VAPID_PRIVATE_KEY              (M6+)
DRIVE_ENCRYPTION_KEY_ID        (M5+)
DRIVE_ENCRYPTION_KEY           (M5+)
```

---

## Open Questions

| # | Question | Resolved? |
|---|---|---|
| Q1 | Vercel account: user to run `vercel login` before linking | ⏳ |
| Q2 | Google Cloud project for dedicated OAuth client (M3) | ⏳ M3 |
| Q3 | Monetization: entitlement table + payment provider vs signed license keys | ⏳ open |
| Q4 | Receipt OCR: on-device WASM vs server provider | ⏳ open |
| Q5 | Desktop layout: MVP or v1.1? | ⏳ open |
| Q6 | Neon Hobby cron (once/day) sufficient for FX + push dispatch? | ⏳ open |
| Q7 | Max members per vehicle, max vehicles per user, max attachment size | ⏳ open |
| Q8 | 30s polling acceptable for sync latency between two accounts? | ⏳ open |
| Q9 | Light theme: required at launch or dark-only v1? | ⏳ open |

---

## How to Resume Development

1. Open `SPEC.md`, find the **first unchecked** `[ ]` item
2. Read the milestone section above it for full context
3. Use `StitchMCP.list_screens` to re-fetch screen HTML/screenshots (URLs expire ~7 days)
4. Use `Neon MCP run_sql` to inspect current DB state
5. Use `mui-mcp-server generateReactCode` + `fetchDocs` for component generation
6. Use `mui-mcp-server useMuiDocs` for theme customization patterns
7. Tick `[x]` immediately when a task is done
8. Commit `SPEC.md` with every PR so progress is always current

---

*Last updated: 2026-10-08 | Starting M0.1*
