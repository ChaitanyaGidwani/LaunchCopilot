# LaunchCopilot — AI Agent Handoff Context
> Paste this whole file as context into any LLM/agent continuing this work.
> Last updated: July 11, 2026, ~evening. Hackathon deadline: July 12, 2026.

## WHAT THIS IS
LaunchCopilot: hackathon project for HackOnVibe 2026 (DoraHacks), theme "effective
promotion of a newly launched mobile app." Solo builder: Chaitanya (engineering
student, comfortable with code). Judged on: Usefulness & Execution, AI & Product
Depth, Business Potential, Community Validation. There is also a "Business Success"
prize track (strongest path to revenue).

**Product (post-pivot one-liner):** Paste your app's store link. LaunchCopilot
writes your entire launch in each platform's native voice — then PUBLISHES it for
you, on schedule, via the Reddit, Telegram, and X APIs.

**Critical strategic context:** The organizer told the builder that advice-products
lose to execution-products ("Opus Clips wins because it posts FOR you"). We pivoted
from "AI writes your launch copy" to "AI writes AND ships your launch." The
execution layer (autopilot) is the winning story. Judges must see a REAL post
created live at a real URL.

## STACK & ARCHITECTURE
- Next.js 15 App Router, plain JS/JSX (no TS), no Tailwind — custom CSS design
  system in `app/globals.css` (CSS vars, dark theme).
- Supabase (Postgres + storage) — ALL access server-side via service-role key
  (`lib/supabase.js`). No auth (deliberate scope cut, documented as v2).
- LLM: provider-switchable via plain fetch, no SDKs (`lib/llm.js`).
  LLM_PROVIDER=groq (default; FREE, 30 req/min) | gemini | anthropic | openai.
  Default model: llama-3.3-70b-versatile via Groq (https://console.groq.com).
  Gemini fallback: MUST use `gemini-flash-latest` (gemini-2.5/2.0-flash are RETIRED and
  return quota errors with limit:0 — do not "fix" by switching to them).
  `reasoning_effort:"none"` is sent ONLY to Gemini (thinking models truncate JSON
  otherwise); maxTokens=8000. `response_format:{type:"json_object"}` is sent to all
  providers that support it (Groq/OpenAI/Gemini); controlled by `supportsJsonMode` flag.
- Zod validation on all API routes (`lib/validation.js`).
- Tests: `npm test` = 10 unit tests on `lib/parse-json.mjs` (LLM output parser),
  all passing. `npm run test:e2e` needs `npm run dev` running.

## FILE MAP (all verified compiling)
- `lib/prompts.js` — CORE IP: per-channel system prompts (aso, twitter, linkedin,
  product_hunt, reddit) each encoding real platform conventions + returns
  `conventions_applied` chips; also buildPlanPrompt (7-day plan),
  buildOptimizePrompt (rewrites weakest channel using tracking data),
  buildImportPrompt (distills store listing → pitch/target_user/tone).
- `lib/publishers.js` — EXECUTION LAYER: publishes real posts via Reddit API
  (script-app password grant → oauth.reddit.com/api/submit), Telegram Bot API
  (sendMessage), X API v2 (OAuth 1.0a HMAC-SHA1 signed, posts whole thread with
  reply chaining). `configuredChannels()` reads env to see what's live.
- `lib/llm.js`, `lib/parse-json.mjs`, `lib/supabase.js`, `lib/account.js`
  (freemium: FREE_APP_LIMIT=1, singleton account row id=1), `lib/validation.js`.
- API routes (`app/api/*/route.js`): apps (create + paywall 402 + screenshot
  upload), import (store URL → auto-created app), generate (one channel),
  plan, optimize (data-driven rewrite of weakest channel), track (self-logged
  installs), publish (publish one channel LIVE now), autopilot (build queue
  from plan days), cron (publishes due queued posts; GET=Vercel cron w/
  CRON_SECRET, POST=dashboard button), upgrade (demo checkout, flips plan).
- Pages: `/` (one-link ImportForm hero + manual IntakeForm in <details> +
  3-step "how it works"), `/app/[id]` (Dashboard), `/share/[id]` (public
  read-only kit + DiscordShare + dynamic OG metadata), `/pricing` (Free vs Pro
  ₹499/mo w/ Recommended flag + UpgradeButton + demo reset). error.jsx,
  not-found.jsx, loading.jsx skeletons for all routes.
- Components: Dashboard.jsx (kit cards + gen progress bar + publish-live buttons
  + interactive plan checklist w/ localStorage + Autopilot + tracking chart +
  optimizer + download-kit-as-markdown + toasts), AssetView.jsx (per-channel
  renderers, CopyButton, assetToText, conventions chips, optimization box),
  Autopilot.jsx (queue table: queued/due/live/failed + Run due posts),
  ImportForm, IntakeForm, DiscordShare, UpgradeButton.
- `supabase/schema.sql` (apps, assets, plans, tracking_entries + screenshots
  bucket), `supabase/upgrade.sql` (account table), `supabase/autopilot.sql`
  (scheduled_posts). ALL THREE ALREADY RUN by the user in Supabase SQL Editor.
- `vercel.json` — daily cron 9:00 → /api/cron.
- `docs/pitch.md` (USPs, business model, revenue math, PIVOT UPDATE section),
  `docs/demo-script.md` (3-min script — needs updating for autopilot demo),
  `docs/architecture.md`, `fix.md` (audit with status table), HANDOFF.md (this).

## CURRENT STATE / WHAT WORKS
- Full pipeline tested working locally with Groq (Llama 3.3 70B): intake → 5 channels
  generate → plan → tracking → optimizer. Paywall + pricing + upgrade flow work.
- All Supabase migrations run. `.env.local` has SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY, LLM_PROVIDER=groq, GROQ_API_KEY.
  Gemini key also retained as commented fallback.
- NEW autopilot layer code-complete and import-verified, but NOT yet runtime
  tested (needs publisher keys + dev server restart).

## IMMEDIATE NEXT STEPS (in order)
1. **Telegram publisher (5 min, no gatekeeping):** @BotFather → /newbot → token.
   Public channel, add bot as admin. .env.local: TELEGRAM_BOT_TOKEN,
   TELEGRAM_CHAT_ID=@channelname. `rm -rf .next && npm run dev`.
2. **Test the money shot:** dashboard → Autopilot shows "Connected: Telegram" →
   generate kit if needed → "Publish live" → real t.me post opens. Also test
   "Arm autopilot" → "Run due posts".
3. **Reddit (blocked earlier):** user's network got "blocked by network security"
   on reddit.com — retry app creation on PHONE HOTSPOT (new IP fixes it).
   reddit.com/prefs/apps → create app → type "script" → redirect
   http://localhost:3000. Client ID = string under "personal use script";
   secret = "secret" field. Env: REDDIT_CLIENT_ID/SECRET/USERNAME/PASSWORD/
   REDDIT_SUBREDDIT (their own test sub, no r/ prefix). 2FA on the account
   breaks password grant — use throwaway account.
4. **One-link intake test:** paste a real App Store link (apps.apple.com/...id123)
   on homepage → app auto-creates. (Free-plan limit is 1 app — use "Reset to
   free (demo)" on /pricing or upgrade to Pro to create more.)
5. **Update docs/demo-script.md** for the new flow: paste link (0:20) → kit
   side-by-side (1:00) → PUBLISH LIVE + show t.me/reddit URL (1:40, climax) →
   autopilot queue + cron mention (2:10) → tracking/optimizer (2:25) → paywall +
   ₹499 + unit economics (2:40).
6. **Record demo video**, then **push to team repo**:
   `git clone https://github.com/HackOnVibeCom/2026-07-ethos-engineers.git`
   already exists at ~/Desktop/2026-07-ethos-engineers (placeholder index.html
   already deleted+pushed). Copy project files in EXCLUDING node_modules, .next,
   .env.local; commit; push. Repo CI (Cloudflare Pages static) will fail — that's
   fine/expected; deploy the live link on Vercel instead (import repo, paste env
   vars, CRON_SECRET too).
7. **DoraHacks submission** + post in HackOnVibe Discord asking people to run
   their apps through it (community validation criterion). /share/[id] pages +
   "Copy share post" button exist for this.

## GOTCHAS / LANDMINES (learned the hard way)
- **Project folder name has a TRAILING SPACE**: `~/Desktop/launchcopilot ` —
  breaks naive shell paths. Recommend renaming to `launchcopilot` (then re-open
  in editors). Old folders `launchcopilot` and `launchcopilot 2` are gone.
- User's zsh doesn't accept `#` comment lines when pasting commands.
- Next.js webpack cache corrupts after adding routes while dev server runs:
  fix = `rm -rf .next && npm run dev` (happened twice).
- **LLM_PROVIDER default is now `groq`** (Llama 3.3 70B, 30 req/min free tier —
  6× more headroom than Gemini's 5 req/min). "Generate full kit" fires 5 sequential
  calls — Groq handles this without hitting rate limits. To fall back to Gemini:
  set LLM_PROVIDER=gemini and ensure GEMINI_API_KEY is set.
- Never print/commit .env.local. It contains real Supabase service-role +
  Groq/Gemini keys. All zips/rsyncs so far have excluded it.
- LinkedIn & Product Hunt have NO public posting APIs — their copy stays
  copy-paste. This is stated honestly in UI + pitch; don't promise otherwise.
- The user's Gemini API key format is `AQ.Ab8...` (new format, valid).
- Antigravity (Google IDE agent) also edits this codebase — it added
  lib/validation.js, retry/backoff in llm.js, loading skeletons, E2E tests.
  Check current file state before large edits.

## BUSINESS CONTENT (for submission fields)
- Freemium: 1 free launch kit; Pro ₹499/mo (unlimited apps, regeneration,
  optimizations, autopilot). Paywall is IMPLEMENTED (HTTP 402 → /pricing →
  upgrade → unlocked). Unit economics: ~₹3-6 LLM cost per kit → 80%+ margin.
  Path to first 100 paying users: hackathon Discord → meta-launch (use the tool
  to launch itself) → hackathon-organizer partnerships. 100 Pro = ₹49,900 MRR.
- Positioning line: "ChatGPT writes copy. LaunchCopilot runs your launch."
