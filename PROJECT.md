# PROJECT.md — Habit Tracker

## Architecture

**Stack:** Next.js 14 (App Router, TypeScript) · Tailwind CSS · Supabase (Postgres + Auth + Realtime) · Vercel

### Request Flow
```
Browser → Next.js App Router
  ├── /login, /register          → public pages (Supabase Auth)
  ├── /                          → protected layout (middleware checks session)
  │     ├── /dashboard           → stats overview
  │     ├── /habits              → habit list + add form
  │     └── /habits/[id]         → habit detail + weekly chart
  └── Supabase JS client         → direct DB calls from client components
```

Middleware (`middleware.ts`) intercepts every request, checks the Supabase session cookie, and redirects unauthenticated users to `/login`.

---

## Database Structure (Supabase)

### Table: `habits`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `user_id` | `uuid` | FK → `auth.users.id` |
| `title` | `text` | Required |
| `description` | `text` | Optional |
| `color` | `text` | Hex string, e.g. `#6366f1` |
| `created_at` | `timestamptz` | Default `now()` |

**RLS policies:**
- `SELECT` where `auth.uid() = user_id`
- `INSERT` with `user_id = auth.uid()`
- `UPDATE` where `auth.uid() = user_id`
- `DELETE` where `auth.uid() = user_id`

### Table: `habit_logs`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `habit_id` | `uuid` | FK → `habits.id` ON DELETE CASCADE |
| `user_id` | `uuid` | FK → `auth.users.id` (for RLS) |
| `completed_date` | `date` | One row per habit per day |
| `created_at` | `timestamptz` | Default `now()` |

**Unique constraint:** `(habit_id, completed_date)` — prevents duplicate logs.

**RLS policies:** same pattern as `habits`, filter on `auth.uid() = user_id`.

---

## Key Features

### 1. Authentication
- Register / login with email + password via Supabase Auth
- Session persisted in cookies (SSR-compatible)
- Logout clears session and redirects to `/login`

### 2. Habit Management
- Create habit: title (required), description (optional), color picker
- List all habits for current user
- Delete habit (cascades to logs)
- Toggle today's completion from the habit card

### 3. Weekly Progress Chart
- Per-habit bar chart showing last 7 days (completed = filled, missed = empty)
- Built with `recharts` or `chart.js`
- Data: query `habit_logs` where `completed_date >= now() - interval '6 days'`

### 4. Statistics Dashboard
- **Completion %** — `(completed days this week / total possible) * 100` across all habits
- **Best habit** — habit with highest completion rate over last 30 days
- **Current streak** — consecutive days where ≥1 habit was completed, counting back from today

### 5. UI / Design
- Dark theme globally (Tailwind `dark` class on `<html>`)
- Glassmorphism cards: `bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl`
- Smooth animations: Framer Motion for card entrance, toggle feedback
- Color-coded habits using the stored `color` field

---

## File Structure

```
tracker/
├── app/
│   ├── layout.tsx               # Root layout, dark theme, font
│   ├── page.tsx                 # Redirect → /dashboard or /login
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── dashboard/page.tsx       # Stats overview
│   ├── habits/
│   │   ├── page.tsx             # Habit list
│   │   └── [id]/page.tsx        # Habit detail + chart
│   └── globals.css
├── components/
│   ├── HabitCard.tsx            # Card with toggle + color + glass effect
│   ├── HabitForm.tsx            # Add/edit habit modal
│   ├── WeeklyChart.tsx          # Recharts bar chart
│   ├── StatsCard.tsx            # Single stat display
│   └── Navbar.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Browser client (singleton)
│   │   └── server.ts            # Server client (uses cookies)
│   └── utils.ts                 # Date helpers, streak calc
├── middleware.ts                 # Auth guard
├── types/
│   └── index.ts                 # Habit, HabitLog, UserStats types
├── .env.local                   # Not committed
├── PROJECT.md
├── SETUP.md
└── CLAUDE.md
```

---

## Implementation Plan

### Phase 1 — Project Setup
1. `npx create-next-app@latest tracker --typescript --tailwind --app`
2. Install deps: `@supabase/supabase-js @supabase/ssr framer-motion recharts`
3. Configure Tailwind dark mode (`darkMode: 'class'`)
4. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`
5. Create `lib/supabase/client.ts` and `lib/supabase/server.ts`

### Phase 2 — Database
1. Create `habits` and `habit_logs` tables in Supabase SQL editor
2. Enable RLS on both tables, add policies
3. Add unique constraint on `(habit_id, completed_date)`

### Phase 3 — Auth
1. Build `/login` and `/register` pages with Supabase Auth
2. Implement `middleware.ts` session guard
3. Add logout button in Navbar

### Phase 4 — Habit CRUD
1. Fetch and display habits list on `/habits`
2. Add habit form (modal) with color picker
3. Delete habit with confirmation
4. Toggle today's completion (insert/delete `habit_logs` row)

### Phase 5 — Charts & Stats
1. `WeeklyChart` component — query last 7 days of logs per habit
2. Dashboard stats — completion %, best habit, streak calculation
3. Wire up `/habits/[id]` detail page

### Phase 6 — Polish & Deploy
1. Framer Motion animations on cards, page transitions
2. Glassmorphism styles, responsive layout
3. Test on mobile
4. Deploy to Vercel, set env vars in Vercel dashboard
