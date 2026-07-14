-- LinkedIn direct-publish migration: run in the Supabase SQL Editor (in
-- addition to schema.sql + upgrade.sql + autopilot.sql).
--
-- LinkedIn requires a real user OAuth grant (w_member_social) to post on a
-- member's behalf — there's no static API key like Reddit/Telegram/X, so the
-- access token has to live somewhere. Single-workspace app (no auth yet), so
-- it's stored on the same singleton `account` row Pro-plan state already
-- lives on. v2 (multi-tenant): move these columns to a per-user table.

alter table account
  add column if not exists linkedin_access_token text,
  add column if not exists linkedin_member_urn text,
  add column if not exists linkedin_token_expires_at timestamptz,
  add column if not exists linkedin_connected_at timestamptz;
