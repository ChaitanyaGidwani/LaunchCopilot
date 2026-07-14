# Architecture

```
Browser (React client components)
  │  IntakeForm ── multipart POST ──▶ /api/apps ──▶ Supabase (apps + storage/screenshots)
  │  Dashboard ── JSON POST ───────▶ /api/generate ─┐
  │             ── JSON POST ───────▶ /api/plan ─────┤──▶ lib/prompts.js (channel-aware
  │             ── JSON POST ───────▶ /api/track     │     system prompts — THE core IP)
  │                                                  └──▶ lib/llm.js ──▶ Anthropic or OpenAI
  └── server components read apps/assets/plans/tracking directly from Supabase
```

## Where the "channel-aware copywriter" lives

`lib/prompts.js`. One shared `appBrief()` (the app's metadata) is paired with a
**per-channel system prompt** that encodes that platform's real conventions —
ASO character limits and keyword-field rules, X thread structure (no link in
tweet 1, hook first), LinkedIn story arc + "see more" fold, Product Hunt
maker-comment structure, Reddit anti-marketing norms + subreddit selection.
Same input, five different expert personas → visibly different, defensible
outputs. Adding a channel = adding one prompt object; zero new UI code
(renderers are per-channel switch cases in `Dashboard.jsx`).

## Key decisions (and why, given ~2.5 days)

- **All DB access server-side with the service role key.** No auth, no RLS
  policies to debug, key never reaches the browser. Honest cut; v2 = Supabase Auth.
- **Plain-fetch LLM client, provider switch via env** (`lib/llm.js`). No SDK
  version issues; `LLM_PROVIDER=anthropic|openai`. JSON extracted with a
  fence-tolerant parser.
- **One row per (app, channel) with jsonb content, upsert on regenerate.**
  Regeneration is free schema-wise; history is a v2 concern.
- **Sequential "generate all"** on the client — avoids rate limits, and the
  per-channel status badges make it feel alive rather than slow.
- **Tracking is self-reported.** A number input beats a store-API OAuth flow
  by two days of work and demos identically.

## Scope-risk flags (watch these while polishing)

1. **Screenshot upload** is the most breakable path (bucket perms, file types).
   It's optional in the form — if it misbehaves during demo prep, demo without it.
2. **LLM latency**: 5 channels ≈ 30–60s total. Demo script pre-generates the
   hero app; never generate all 5 live on stage.
3. **JSON parse failures**: parser tolerates fences/preamble; a per-channel
   Regenerate button is the recovery path. Don't build retries.
