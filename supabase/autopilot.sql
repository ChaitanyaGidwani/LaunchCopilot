-- Autopilot migration: run in Supabase SQL Editor (in addition to schema.sql + upgrade.sql).
-- Queue of posts the system publishes on the user's behalf.

create table if not exists scheduled_posts (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references apps(id) on delete cascade,
  channel text not null,
  scheduled_for timestamptz not null default now(),
  status text not null default 'queued' check (status in ('queued','published','failed')),
  result_url text,
  error text,
  created_at timestamptz not null default now(),
  unique (app_id, channel)
);

create index if not exists idx_sched_due on scheduled_posts(status, scheduled_for);

alter table scheduled_posts enable row level security;

-- ---------------------------------------------------------------------------
-- APPROVAL GATE (run this if you already created scheduled_posts earlier).
-- Nothing publishes itself until a human has approved that specific post, and
-- we remember who/when so the audit trail is visible in the UI.
-- ---------------------------------------------------------------------------
alter table scheduled_posts add column if not exists approved boolean not null default false;
alter table scheduled_posts add column if not exists approved_at timestamptz;
