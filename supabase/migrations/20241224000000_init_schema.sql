create table habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  color text not null default '#6366f1',
  created_at timestamptz not null default now()
);

create table habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  completed_date date not null,
  created_at timestamptz not null default now(),
  unique (habit_id, completed_date)
);

alter table habits enable row level security;
alter table habit_logs enable row level security;

create policy "Users manage own habits"
  on habits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own logs"
  on habit_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
