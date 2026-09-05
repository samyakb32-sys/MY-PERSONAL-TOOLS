-- ARIXIA: user settings + chat history, synced per-account across devices.
-- Run this once in your Supabase project's SQL editor.

create table if not exists user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table user_settings enable row level security;

create policy "users manage their own settings"
  on user_settings
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New chat',
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table chat_sessions enable row level security;

create policy "users manage their own chat sessions"
  on chat_sessions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists chat_sessions_user_id_idx on chat_sessions(user_id);

create table if not exists creations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  tags text[] not null default '{}',
  status text not null default 'in-progress' check (status in ('live', 'in-progress', 'archived')),
  repo_url text,
  live_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table creations enable row level security;

create policy "users manage their own creations"
  on creations
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists creations_user_id_idx on creations(user_id);

create table if not exists automations (
  user_id uuid not null references auth.users(id) on delete cascade,
  automation_key text not null,
  enabled boolean not null default false,
  last_run timestamptz,
  primary key (user_id, automation_key)
);

alter table automations enable row level security;

create policy "users manage their own automations"
  on automations
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
