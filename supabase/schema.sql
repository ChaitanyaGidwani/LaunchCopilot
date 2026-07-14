-- LaunchCopilot schema. Run this in Supabase SQL Editor (Dashboard > SQL Editor > New query).

create extension if not exists pgcrypto;

-- Apps the dev wants to promote
create table if not exists apps (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  category text not null,
  pitch text not null,
  target_user text not null,
  tone text,
  store_link text,
  screenshot_urls text[] not null default '{}'
);

-- Generated assets, one row per channel per app (regeneration replaces the row)
create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references apps(id) on delete cascade,
  channel text not null check (channel in ('aso','twitter','linkedin','product_hunt','reddit')),
  content jsonb not null,
  created_at timestamptz not null default now(),
  unique (app_id, channel)
);

-- 7-day promotion plan, one per app
create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null unique references apps(id) on delete cascade,
  days jsonb not null,
  created_at timestamptz not null default now()
);

-- Self-logged tracking: dev manually reports installs/clicks per channel
create table if not exists tracking_entries (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references apps(id) on delete cascade,
  channel text not null,
  metric text not null default 'installs' check (metric in ('installs','clicks','signups')),
  count integer not null check (count >= 0),
  note text,
  logged_on date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists idx_assets_app on assets(app_id);
create index if not exists idx_tracking_app on tracking_entries(app_id);

-- Public bucket for app screenshots
insert into storage.buckets (id, name, public)
values ('screenshots', 'screenshots', true)
on conflict (id) do nothing;

-- =============================================================================
-- ROW LEVEL SECURITY
--
-- Current approach: the app talks to the DB exclusively via server-side API
-- routes using the service_role key, which bypasses RLS automatically. The
-- policies below act as a safety net — if the anon key is ever accidentally
-- exposed, no data is readable/writable without the service_role.
--
-- v2 upgrade path:
--   1. Add a user_id column to `apps` (and cascade to child tables via app_id).
--   2. Switch the client to use the anon key + Supabase Auth JWT.
--   3. Replace these service_role policies with user-scoped policies:
--        USING (auth.uid() = user_id)
--        WITH CHECK (auth.uid() = user_id)
-- =============================================================================

alter table apps enable row level security;
alter table assets enable row level security;
alter table plans enable row level security;
alter table tracking_entries enable row level security;

-- Service-role-only policies: the service_role key sets `role = 'service_role'`
-- in the JWT, so these policies allow full CRUD only for server-side routes.
-- The anon key gets `role = 'anon'`, which matches nothing here.

create policy "service_role_apps" on apps
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service_role_assets" on assets
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service_role_plans" on plans
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service_role_tracking" on tracking_entries
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
