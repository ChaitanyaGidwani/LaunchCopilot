import { createClient } from "@supabase/supabase-js";

// Server-side client using the service role key.
// All DB access happens in API routes / server components — the key never
// reaches the browser, so auth/RLS is not needed in single-workspace mode.
//
// ⚠️  KNOWN SHORTCUT: The service_role key bypasses RLS entirely. This is
// acceptable for a single-workspace deployment but NOT for multi-tenant production.
//
// v2 upgrade path:
//   1. Add Supabase Auth (e.g. magic link or OAuth).
//   2. Switch to createBrowserClient / createServerClient with the anon key.
//   3. Add a user_id column to `apps` and scope all queries + RLS policies
//      to `auth.uid() = user_id`.
//   4. Remove this service-role singleton entirely.
let _client = null;

export function supabase() {
  if (!_client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        "Supabase is not configured. Copy .env.example to .env.local and fill in SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
      );
    }
    _client = createClient(url, key, { auth: { persistSession: false } });
  }
  return _client;
}
