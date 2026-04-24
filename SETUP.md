# SETUP.md — Developer Setup Guide

## Prerequisites

- Node.js 18+ and npm
- A [Supabase](https://supabase.com) account (free tier is enough)
- A [Vercel](https://vercel.com) account (for deployment)
- Supabase CLI: `npm install -g supabase`

---

## 1. Supabase Setup

### 1.1 Create a project
1. Go to [supabase.com](https://supabase.com) → **New project**
2. Choose a name, set a strong database password (save it — you'll need it for direct DB access)
3. Select the region closest to your users
4. Wait ~2 minutes for the project to provision

### 1.2 Get your API keys
In your Supabase project dashboard: **Settings → API**

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | "Project URL" |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | "Project API keys → anon public" |

Copy both values — you'll add them to `.env.local` in step 3.

### 1.3 Create the database schema via migrations

The schema is managed with Supabase CLI migrations — do not run SQL manually in the dashboard.

**Link your local project to the remote Supabase project:**
```bash
supabase login
supabase init          # creates supabase/ directory (run once)
supabase link --project-ref your-project-id
```

Your project ref is in **Settings → General → Reference ID**.

**Create the initial migration:**
```bash
supabase migration new init_schema
```

This creates `supabase/migrations/<timestamp>_init_schema.sql`. Paste the following into that file:

```sql
-- Habits table
create table habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  color text not null default '#6366f1',
  created_at timestamptz not null default now()
);

-- Habit completion logs
create table habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  completed_date date not null,
  created_at timestamptz not null default now(),
  unique (habit_id, completed_date)
);

-- Enable Row Level Security
alter table habits enable row level security;
alter table habit_logs enable row level security;

-- RLS policies for habits
create policy "Users manage own habits"
  on habits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- RLS policies for habit_logs
create policy "Users manage own logs"
  on habit_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

**Push the migration to your remote Supabase project:**
```bash
supabase db push
```

For future schema changes, always create a new migration file (`supabase migration new <name>`) rather than editing existing ones.

### 1.4 Enable Email Auth
In your Supabase dashboard: **Authentication → Providers → Email**
- Ensure "Enable Email provider" is toggled on
- For development, you can disable "Confirm email" to skip email verification

---

## 2. Local Development Setup

### 2.1 Clone and install
```bash
git clone <your-repo-url>
cd tracker
npm install
```

### 2.2 Create `.env.local`
Create a file named `.env.local` in the project root (never commit this file):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the values with what you copied in step 1.2.

### 2.3 Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the app.

---

## 3. Vercel Deployment

### 3.1 Deploy
```bash
npm install -g vercel
vercel
```

Or connect your GitHub repo in the [Vercel dashboard](https://vercel.com/new) for automatic deploys on push.

### 3.2 Add environment variables in Vercel
In your Vercel project: **Settings → Environment Variables**

Add both variables from `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Set them for **Production**, **Preview**, and **Development** environments.

### 3.3 Configure Supabase redirect URLs
In Supabase dashboard: **Authentication → URL Configuration**

Add your Vercel deployment URL to the allowed redirect URLs:
```
https://your-app.vercel.app/**
```

Also add `http://localhost:3000/**` for local development.

---

## Summary Checklist

- [ ] Supabase project created, password saved
- [ ] `NEXT_PUBLIC_SUPABASE_URL` copied
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` copied
- [ ] `supabase link` completed
- [ ] Migration file created and `supabase db push` run
- [ ] Email auth enabled in Supabase
- [ ] `.env.local` created with both keys
- [ ] `npm install` completed
- [ ] `npm run dev` runs without errors
- [ ] (Deploy) Env vars added to Vercel
- [ ] (Deploy) Redirect URLs configured in Supabase
