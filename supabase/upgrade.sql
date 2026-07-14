-- Monetization migration: run this in the Supabase SQL Editor (in addition to schema.sql).
-- Single-account plan state (no auth in hackathon scope; becomes per-user with Supabase Auth in v2).

create table if not exists account (
  id int primary key default 1 check (id = 1),
  plan text not null default 'free' check (plan in ('free','pro')),
  upgraded_at timestamptz
);

insert into account (id, plan) values (1, 'free')
on conflict (id) do nothing;

alter table account enable row level security;
