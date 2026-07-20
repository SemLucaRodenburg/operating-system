-- Levens-OS: initieel datamodel
-- Alle tabellen zijn scoped op auth.uid() via Row Level Security.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- ENUM TYPES
-- ─────────────────────────────────────────────────────────────
create type goal_type as enum ('percent', 'numeric', 'milestones');
create type goal_status as enum ('active', 'done', 'paused', 'archived');
create type habit_kind as enum ('build', 'avoid');
create type habit_cadence as enum ('daily', 'weekly');
create type checkin_type as enum ('morning', 'evening');
create type review_period as enum ('day', 'week');

-- ─────────────────────────────────────────────────────────────
-- USERS (profiel + settings, 1-op-1 met auth.users)
-- ─────────────────────────────────────────────────────────────
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- VISION
-- ─────────────────────────────────────────────────────────────
create table public.vision (
  user_id uuid primary key references public.users(id) on delete cascade,
  statement text not null,
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- DOMAINS
-- ─────────────────────────────────────────────────────────────
create table public.domains (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  color text not null default '#6366f1',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index domains_user_id_idx on public.domains(user_id);

-- ─────────────────────────────────────────────────────────────
-- GOALS
-- ─────────────────────────────────────────────────────────────
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  domain_id uuid references public.domains(id) on delete set null,
  title text not null,
  description text,
  type goal_type not null default 'percent',
  target_value numeric,
  current_value numeric not null default 0,
  unit text,
  deadline date,
  status goal_status not null default 'active',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index goals_user_id_idx on public.goals(user_id);
create index goals_domain_id_idx on public.goals(domain_id);

-- ─────────────────────────────────────────────────────────────
-- MILESTONES
-- ─────────────────────────────────────────────────────────────
create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  title text not null,
  done boolean not null default false,
  due_date date,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index milestones_goal_id_idx on public.milestones(goal_id);

-- ─────────────────────────────────────────────────────────────
-- HABITS
-- ─────────────────────────────────────────────────────────────
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  kind habit_kind not null default 'build',
  cadence habit_cadence not null default 'daily',
  weekly_target int,
  domain_id uuid references public.domains(id) on delete set null,
  anchor boolean not null default false,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index habits_user_id_idx on public.habits(user_id);

-- ─────────────────────────────────────────────────────────────
-- HABIT LOGS
-- ─────────────────────────────────────────────────────────────
create table public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  date date not null,
  done boolean not null default false,
  value numeric,
  note text,
  created_at timestamptz not null default now(),
  unique (habit_id, date)
);
create index habit_logs_habit_id_idx on public.habit_logs(habit_id);
create index habit_logs_date_idx on public.habit_logs(date);

-- ─────────────────────────────────────────────────────────────
-- CHECKINS
-- ─────────────────────────────────────────────────────────────
create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  date date not null,
  type checkin_type not null,
  intention text,
  top_tasks jsonb not null default '[]'::jsonb,
  reflection text,
  weight_kg numeric,
  screen_note text,
  mood int check (mood between 1 and 5),
  created_at timestamptz not null default now(),
  unique (user_id, date, type)
);
create index checkins_user_id_idx on public.checkins(user_id);
create index checkins_date_idx on public.checkins(date);

-- ─────────────────────────────────────────────────────────────
-- CONSEQUENCES
-- ─────────────────────────────────────────────────────────────
create table public.consequences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  source_habit_id uuid references public.habits(id) on delete set null,
  date date not null,
  description text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);
create index consequences_user_id_idx on public.consequences(user_id);

-- ─────────────────────────────────────────────────────────────
-- METRICS (generieke tijdreeks, bv. gewicht, schermtijd)
-- ─────────────────────────────────────────────────────────────
create table public.metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  date date not null,
  key text not null,
  value numeric,
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, date, key)
);
create index metrics_user_id_idx on public.metrics(user_id);

-- ─────────────────────────────────────────────────────────────
-- AI REVIEWS
-- ─────────────────────────────────────────────────────────────
create table public.ai_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  period review_period not null,
  date date not null,
  content text not null,
  model text,
  created_at timestamptz not null default now()
);
create index ai_reviews_user_id_idx on public.ai_reviews(user_id);

-- ─────────────────────────────────────────────────────────────
-- PUSH SUBSCRIPTIONS
-- ─────────────────────────────────────────────────────────────
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  endpoint text not null unique,
  keys jsonb not null,
  created_at timestamptz not null default now()
);
create index push_subscriptions_user_id_idx on public.push_subscriptions(user_id);

-- ─────────────────────────────────────────────────────────────
-- updated_at trigger helper
-- ─────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger goals_set_updated_at
  before update on public.goals
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- Auto-create public.users row on signup
-- ─────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────
alter table public.users enable row level security;
alter table public.vision enable row level security;
alter table public.domains enable row level security;
alter table public.goals enable row level security;
alter table public.milestones enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.checkins enable row level security;
alter table public.consequences enable row level security;
alter table public.metrics enable row level security;
alter table public.ai_reviews enable row level security;
alter table public.push_subscriptions enable row level security;

-- users: alleen eigen rij
create policy "users_select_own" on public.users for select using (auth.uid() = id);
create policy "users_update_own" on public.users for update using (auth.uid() = id);

-- vision
create policy "vision_all_own" on public.vision for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- domains
create policy "domains_all_own" on public.domains for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- goals
create policy "goals_all_own" on public.goals for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- milestones (via parent goal)
create policy "milestones_all_own" on public.milestones for all
  using (exists (select 1 from public.goals g where g.id = milestones.goal_id and g.user_id = auth.uid()))
  with check (exists (select 1 from public.goals g where g.id = milestones.goal_id and g.user_id = auth.uid()));

-- habits
create policy "habits_all_own" on public.habits for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- habit_logs (via parent habit)
create policy "habit_logs_all_own" on public.habit_logs for all
  using (exists (select 1 from public.habits h where h.id = habit_logs.habit_id and h.user_id = auth.uid()))
  with check (exists (select 1 from public.habits h where h.id = habit_logs.habit_id and h.user_id = auth.uid()));

-- checkins
create policy "checkins_all_own" on public.checkins for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- consequences
create policy "consequences_all_own" on public.consequences for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- metrics
create policy "metrics_all_own" on public.metrics for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ai_reviews
create policy "ai_reviews_all_own" on public.ai_reviews for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- push_subscriptions
create policy "push_subscriptions_all_own" on public.push_subscriptions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
