# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Habit Tracker web app — users can add habits, mark daily completions, view weekly progress charts, and see statistics (completion %, best habit, current streak). Dark theme with glassmorphism UI.

**Stack:** Next.js (App Router) + TypeScript + Tailwind CSS + Supabase (auth + DB) + Vercel (deploy)

## Commands

```bash
# Development
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint

# Testing (once configured)
npm test             # Run all tests
npm test -- --testPathPattern=<file>  # Run single test file
```

## Architecture

### Auth & Data Isolation
Supabase Auth (email/password) handles sessions. All DB tables use Row-Level Security (RLS) so users only access their own data. Unauthenticated users are redirected to `/login` via Next.js middleware.

### Database Schema
- **habits** — `id, user_id, title, description, color, created_at`
- **habit_logs** — `id, habit_id, user_id, completed_date` (one row per habit per day)

`user_id` on both tables is the Supabase Auth UID; RLS policies filter on `auth.uid()`.

### Key Layers
- `app/` — Next.js App Router pages and layouts
- `lib/supabase.ts` — Supabase client initialization (browser + server clients)
- `components/` — UI components (habit cards, charts, stats)
- `app/api/` — API routes if server-side mutations are needed (otherwise use Supabase client directly)

### Environment Variables
Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

See `SETUP.md` for how to obtain these from the Supabase dashboard.

## Key Documents
- `trackerprompt.md` — Original project specification (Russian)
- `PROJECT.md` — Detailed architecture, DB schema, file structure, implementation plan
- `SETUP.md` — Developer setup: env vars, Supabase config, manual steps before first run
