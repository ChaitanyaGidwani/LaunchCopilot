# 🚀 LaunchCopilot

Preferred Deploy Link : https://2026-07-ethos-engineers.vercel.app

Organizer's Deploy Link : https://2026-07-ethos-engineers.hackonvibe.com

Demo Video Link : https://youtu.be/Ye8fpxNaucc

**Ship the app. We ship the launch.**

> Paste your App Store or Play Store link. LaunchCopilot reads your listing, writes platform-native launch copy for five channels, schedules it — and **publishes real posts** to Reddit, Telegram, X, LinkedIn, and Discord automatically. You stay in the editor; the launch happens anyway.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase)
![Groq](https://img.shields.io/badge/AI-Groq%20Llama%203.3-F55036?logo=groq)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 📋 About LaunchCopilot

### What does the application do?

LaunchCopilot is an **AI-powered launch automation platform** built for mobile app developers who have just shipped their app and now face the daunting "Day 1" promotion challenge. The platform transforms the entire post-launch marketing workflow — from copywriting to scheduling to publishing — into a single, automated pipeline.

Here's what happens when a developer uses LaunchCopilot:

1. **One-Link Intake:** The developer pastes their App Store or Google Play Store link. LaunchCopilot automatically reads the store listing (app name, category, description, screenshots) using the Apple Lookup API and Play Store metadata extraction — no manual form filling required.

2. **AI-Generated, Channel-Native Launch Kit:** The AI generates promotion copy for **five distinct channels**, each written against that platform's real conventions and community norms:
   - **App Store Optimization (ASO):** Title (≤30 chars), subtitle, keyword field, and description structured for Apple/Google's search algorithms.
   - **X (Twitter) Thread:** Hook-first opening tweet (no links in tweet 1 — per algorithm best practice), storytelling arc across 3–5 tweets, strategic CTA placement.
   - **LinkedIn Post:** Professional story-arc structure optimized for the "see more" fold, industry-relevant hashtags, founder-voice narrative.
   - **Product Hunt Launch:** Tagline, maker comment in PH's expected structure, feature highlights formatted for the PH audience.
   - **Reddit Post:** Authentic developer voice, subreddit-aware tone (r/SideProject vs r/androidapps), transparent self-promotion disclosure to avoid removal.

3. **7-Day Promotion Plan:** A sequenced, day-by-day launch calendar (~1 hour/day of effort) telling the developer exactly what to post, where, and when — eliminating decision paralysis.

4. **Autopilot Publishing Engine:** LaunchCopilot doesn't just write your launch — it **executes it**. The platform publishes real posts to Reddit (via OAuth password grant), Telegram (Bot API), X (OAuth 1.0a signed requests with thread chaining), LinkedIn (OAuth 2.0 member grant via the Posts API), and Discord (incoming webhook). Posts can be fired manually per channel ("Publish Live") or scheduled via autopilot and executed by a daily cron job with zero human action. Product Hunt is the one exception — PH gates write access behind a manual request to their team rather than self-serve API keys, so its copy stays one-click-ready instead of auto-published.

5. **Performance Tracking & AI Optimization:** Developers log installs and clicks per channel. When enough data exists, the "Rewrite Weakest Channel" optimizer reads the performance spread, hypothesizes why that channel underperformed, and regenerates the copy with a visible changelog — closing the feedback loop between generation and measured results.

6. **Shareable Launch Kits:** Every generated kit has a public share page (`/share/[id]`) with dynamic Open Graph metadata and a one-click Discord share button — users showing off their kits IS the organic growth loop.

### Who is the target audience?

LaunchCopilot is built for **indie and solo mobile app developers, small dev studios (1–5 people), and hackathon builders** who ship apps without a dedicated marketing team.

These developers share a common pain point: they're skilled at building software but unfamiliar, uncomfortable, or unmotivated when it comes to the multi-platform promotion work that follows a launch. The result is typically one of two outcomes — either no promotion at all (the app dies in obscurity), or a single generic blurb copy-pasted everywhere (which gets ignored or removed by platform-savvy communities).

**Primary segments:**
- **Solo indie developers** launching their first or second app, who need expert-level marketing copy but can't afford (or justify) a freelance copywriter or marketing consultant.
- **Serial app shippers** — developers or small studios releasing 2+ apps per year who need repeatable, scalable launch workflows. These are LaunchCopilot's ideal paying customers (Pro plan).
- **Hackathon participants** who build a working product in 48–72 hours and need to promote it immediately for community votes, judge attention, or post-hackathon traction.
- **Build-in-public developers** active on X (#buildinpublic), Reddit (r/SideProject, r/androidapps), Product Hunt, and Indie Hackers — communities where LaunchCopilot's channel-native copy provides the most value.

### Which countries are the expected buyers?

LaunchCopilot targets a **global developer audience** with initial go-to-market focus on the following regions:

| Region | Rationale |
|--------|-----------|
| **India** 🇮🇳 | Largest and fastest-growing developer population globally. Massive indie app ecosystem. Pricing in INR (₹499/mo) is calibrated for Indian purchasing power. UPI/Razorpay-native payment integration planned. Hackathon culture is thriving (DoraHacks, hack2skill, Unstop). |
| **United States** 🇺🇸 | Largest App Store and Play Store market by revenue. Highest concentration of indie developers on Product Hunt, Reddit, and X. Strong #buildinpublic culture. |
| **Southeast Asia** 🇮🇩🇻🇳🇵🇭 | Rapidly growing mobile-first app markets with an emerging indie dev scene. Price-sensitive — LaunchCopilot's free tier and low Pro pricing fit well. |
| **Europe (UK, Germany, Netherlands, Nordics)** 🇬🇧🇩🇪🇳🇱 | Strong indie developer communities, active on Product Hunt and Reddit. High English-language proficiency enables immediate adoption. |
| **Latin America (Brazil, Mexico)** 🇧🇷🇲🇽 | Growing app developer ecosystems, active hackathon communities, price-sensitive market where LaunchCopilot's free tier drives adoption. |

The product is **language-agnostic at the input layer** (the AI adapts to whatever the store listing says) and **English-first at the output layer** (since the five target channels are English-dominant platforms). Localized output channels (e.g., Japanese App Store ASO, Portuguese Reddit communities) are a clear v2 expansion path.

### Who are the competitors?

| Competitor | What They Do | Limitation |
|-----------|-------------|------------|
| **ChatGPT / Claude / Gemini (raw LLMs)** | General-purpose AI that can write marketing copy when prompted | No channel-specific convention enforcement. No persistence, no tracking, no publishing. The developer must know what to ask for — and prompt engineering is itself a skill gap. |
| **Copy.ai / Jasper** | AI copywriting platforms for marketers | Built for marketing teams, not developers. No App Store / Play Store awareness. No mobile-app-specific conventions (ASO keyword fields, subreddit norms). No execution layer — copy-paste only. Expensive ($49–$125/mo). |
| **Opus Clip / Repurpose.io** | AI content repurposing (video → clips → social) | Video-centric, not text/copy. No app store optimization. No developer-focused channels (Reddit, Product Hunt). Solves a different slice of the promotion problem. |
| **AppTweak / Sensor Tower / data.ai** | App Store Optimization (ASO) analytics platforms | ASO-only — no cross-channel promotion. Analytics/intelligence tools, not content generators. Enterprise pricing ($100–$1000+/mo). No publishing capability. |
| **Buffer / Hootsuite / Later** | Social media scheduling & publishing | Platform-agnostic scheduling — no AI content generation, no channel-native copy, no app-specific conventions. The developer still has to write everything. |
| **Freelance copywriters / marketing agencies** | Human-written, bespoke marketing copy | Expensive ($200–$2000+ per launch), slow (days to weeks turnaround), not scalable for serial shippers. Not available at 2 AM when you just shipped. |

### What is LaunchCopilot's advantage?

**1. Execution, Not Advice**
> *"ChatGPT writes copy. LaunchCopilot runs your launch."*

The critical differentiator: LaunchCopilot doesn't stop at generating text. It **publishes real posts** to Reddit, Telegram, X, LinkedIn, and Discord via their APIs — with scheduled autopilot and daily cron execution. Advice products compete with ChatGPT (free, infinite). Execution products compete with agencies ($2000+, slow). LaunchCopilot delivers agency-grade execution at ₹499/mo.

**2. Channel-Native Intelligence — Provably So**
Every generated asset displays visible "✓ conventions applied" chips (e.g., "title ≤30 chars", "no link in tweet 1", "dev transparency disclosed", "subreddit rules checked"). The AI doesn't just write — it enforces five platforms' rulebooks simultaneously and **shows its reasoning**. Judges, users, and developers don't have to take the AI depth on faith; the compliance evidence is on every card.

**3. Closed-Loop Optimization**
LaunchCopilot is the only tool that connects **generation → publication → tracking → AI-driven rewrite** in a single product. Log installs per channel, hit "Rewrite Weakest Channel" — the AI reads the performance spread, hypothesizes why that channel underperformed, and regenerates copy with a visible changelog. No copywriting tool, scheduling tool, or ASO tool closes this loop.

**4. One-Link Onboarding (Zero Friction)**
Input is a single URL. The store listing is read automatically; the AI distills app name, category, pitch, target user, and tone. No forms, no onboarding wizard, no 15-minute setup. Paste → launch kit → published. The entire value chain fires from one link.

**5. Self-Marketing Growth Loop**
Every generated kit has a public share page (`/share/[id]`) with dynamic OG metadata and a one-click share button. Users showing off their AI-generated launch kits to their communities IS the organic acquisition channel — the product markets itself through its own output.

**6. Developer-Native Pricing**
Free tier gives one complete launch kit (the launch moment is the hook). Pro at ₹499/mo (~$6) is priced below one hour of freelance copywriting — accessible to solo developers in India, Southeast Asia, and emerging markets where $49/mo SaaS tools are prohibitive.

---

## ⚡ How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│                        LAUNCHCOPILOT PIPELINE                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   1. INTAKE                                                         │
│   ┌──────────────┐     ┌──────────────────┐     ┌───────────────┐  │
│   │ Paste Store  │────▶│ Auto-read listing │────▶│ AI distills   │  │
│   │ URL          │     │ (Apple/Play API)  │     │ pitch + user  │  │
│   └──────────────┘     └──────────────────┘     └───────┬───────┘  │
│                                                         │          │
│   2. GENERATION                                         ▼          │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │  lib/prompts.js — 5 channel-native expert prompts           │  │
│   │  ┌─────┐ ┌──────┐ ┌────────┐ ┌──────────┐ ┌────────┐      │  │
│   │  │ ASO │ │  X   │ │LinkedIn│ │  Product  │ │ Reddit │      │  │
│   │  │     │ │Thread│ │  Post  │ │   Hunt    │ │  Post  │      │  │
│   │  └─────┘ └──────┘ └────────┘ └──────────┘ └────────┘      │  │
│   └─────────────────────────────────┬───────────────────────────┘  │
│                                     │                              │
│   3. EXECUTION                      ▼                              │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │  lib/publishers.js — Real API integrations                  │  │
│   │  • Reddit: OAuth password grant → submit to subreddit       │  │
│   │  • Telegram: Bot API → channel message                      │  │
│   │  • X: OAuth 1.0a HMAC-SHA1 → threaded tweets               │  │
│   │  • LinkedIn: OAuth 2.0 member grant → Posts API             │  │
│   │  • Discord: incoming webhook → channel message              │  │
│   │  • Autopilot: daily cron fires scheduled posts              │  │
│   └─────────────────────────────────┬───────────────────────────┘  │
│                                     │                              │
│   4. OPTIMIZATION                   ▼                              │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │  Track installs per channel → AI rewrites weakest copy      │  │
│   │  with hypothesis + changelog from real performance data     │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | Next.js 15 (App Router) | Server Components for secure API key handling; streaming SSR |
| **Language** | JavaScript / JSX (no TypeScript) | Speed of iteration for hackathon timeline |
| **Styling** | Custom CSS design system (`globals.css`) | CSS variables, dark theme, no Tailwind dependency |
| **Database** | Supabase (PostgreSQL + Storage) | Server-side only via service-role key; screenshots in storage bucket |
| **AI / LLM** | Groq (Llama 3.3 70B, default, free tier, 30 req/min) | Provider-switchable: `groq` / `gemini` / `anthropic` / `openai` via `LLM_PROVIDER` env var |
| **Validation** | Zod | Schema validation on all 10 API routes |
| **Publishing** | Reddit API, Telegram Bot API, X API v2, LinkedIn Posts API, Discord webhooks | Real OAuth/token integrations — not mock/stub |
| **Scheduling** | Vercel Cron (`vercel.json`) | Daily 9:00 AM → `/api/cron` fires all due posts |

---

## 📁 Project Structure

```
launchcopilot/
├── app/
│   ├── page.jsx                    # Landing: one-link import hero + manual intake form
│   ├── app/[id]/page.jsx           # Dashboard: kit cards, publish buttons, plan, tracking
│   ├── share/[id]/page.jsx         # Public share page with OG metadata + Discord share
│   ├── pricing/page.jsx            # Free vs Pro (₹499/mo) with upgrade flow
│   ├── api/
│   │   ├── apps/route.js           # Create app + screenshot upload + paywall (402)
│   │   ├── import/route.js         # Store URL → auto-created app
│   │   ├── generate/route.js       # Generate one channel's asset
│   │   ├── plan/route.js           # Generate 7-day promotion plan
│   │   ├── optimize/route.js       # Data-driven rewrite of weakest channel
│   │   ├── track/route.js          # Self-logged installs/clicks per channel
│   │   ├── publish/route.js        # Publish one channel LIVE via real API
│   │   ├── autopilot/route.js      # Build scheduled queue from plan days
│   │   ├── cron/route.js           # Publishes due posts (Vercel cron + dashboard button)
│   │   ├── auth/linkedin/start      # Redirects to LinkedIn's OAuth consent screen
│   │   ├── auth/linkedin/callback   # Exchanges code → token, stores it on the account row
│   │   └── upgrade/route.js        # Demo checkout, flips plan to Pro
│   ├── globals.css                 # Design system: CSS vars, dark theme, components
│   ├── error.jsx                   # Error boundary
│   ├── not-found.jsx               # 404 page
│   └── loading.jsx                 # Loading skeleton
├── components/
│   ├── Dashboard.jsx               # Kit cards, progress bar, publish buttons, plan checklist,
│   │                               # autopilot, tracking chart, optimizer, download-as-markdown
│   ├── AssetView.jsx               # Per-channel renderers, CopyButton, conventions chips
│   ├── Autopilot.jsx               # Queue table: queued/due/live/failed + Run due posts
│   ├── ImportForm.jsx              # One-link store URL import
│   ├── IntakeForm.jsx              # Manual app details form
│   ├── DiscordShare.jsx            # One-click share post generator
│   └── UpgradeButton.jsx           # Pro upgrade CTA
├── lib/
│   ├── prompts.js                  # 🧠 CORE IP: 5 channel-aware system prompts +
│   │                               #    plan prompt + optimize prompt + import prompt
│   ├── publishers.js               # 🚀 EXECUTION: Reddit, Telegram, X, LinkedIn, Discord
│   ├── llm.js                      # Provider-switchable LLM client (fetch-based, no SDKs)
│   ├── parse-json.mjs              # Fence-tolerant JSON parser for LLM output
│   ├── supabase.js                 # Server-only Supabase client (service role)
│   ├── account.js                  # Freemium account logic (FREE_APP_LIMIT=1)
│   ├── channels.js                 # Channel constants shared across server/client
│   └── validation.js               # Zod schemas for all API routes
├── supabase/
│   ├── schema.sql                  # apps, assets, plans, tracking_entries + screenshots bucket
│   ├── upgrade.sql                 # account table for freemium
│   ├── autopilot.sql               # scheduled_posts table
│   └── linkedin.sql                # account columns for the stored LinkedIn OAuth token
├── tests/
│   ├── parse-json.test.mjs         # 10 unit tests (LLM output parser)
│   └── live-server-flows.test.mjs  # 3 E2E tests (homepage, app creation, dashboard + share)
├── docs/
│   ├── pitch.md                    # USPs, business model, revenue math
│   ├── demo-script.md              # 3-minute demo walkthrough
│   └── architecture.md             # System architecture + design decisions
├── vercel.json                     # Daily cron: 9:00 → /api/cron
└── HANDOFF.md                      # Full AI agent context document
```

---

## 🚀 Quick Start (~5 minutes)

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Supabase (free tier works)
- Create a project at [supabase.com](https://supabase.com)
- Open **SQL Editor** and run the contents of:
  - `supabase/schema.sql` (core tables)
  - `supabase/upgrade.sql` (account/paywall)
  - `supabase/autopilot.sql` (scheduled posts)
  - `supabase/linkedin.sql` (LinkedIn OAuth token columns — only needed if you connect LinkedIn)
- Copy **Settings → API → Project URL** and **service_role key**

### 3. Configure environment
```bash
cp .env.example .env.local
```
Fill in the required values:
| Variable | Source |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) → API Keys (free, no card required) |
| `CRON_SECRET` | Any random string (for securing the cron endpoint) |

**Optional — for live publishing (Autopilot):**
| Variable | Source |
|----------|--------|
| `TELEGRAM_BOT_TOKEN` | [@BotFather](https://t.me/BotFather) on Telegram → `/newbot` |
| `TELEGRAM_CHAT_ID` | Your channel name (e.g., `@yourchannel`) |
| `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET` | [reddit.com/prefs/apps](https://reddit.com/prefs/apps) → Create "script" app |
| `REDDIT_USERNAME` / `REDDIT_PASSWORD` | Reddit account credentials (no 2FA) |
| `REDDIT_SUBREDDIT` | Target subreddit (no `r/` prefix) |
| `TWITTER_API_KEY` / `TWITTER_API_SECRET` | [developer.x.com](https://developer.x.com) |
| `TWITTER_ACCESS_TOKEN` / `TWITTER_ACCESS_SECRET` | X Developer Portal → User auth tokens |
| `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET` | [developer.linkedin.com](https://developer.linkedin.com) → app → Products → add "Sign In with LinkedIn using OpenID Connect" + "Share on LinkedIn" (both self-serve). Then click **Connect LinkedIn** in the dashboard once — the actual posting permission is a per-member OAuth grant, not just env vars. |
| `DISCORD_WEBHOOK_URL` | Discord channel → Settings → Integrations → Webhooks → New Webhook |

### 4. Run
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000), paste a store link or fill the intake form, and hit **🚀 Launch it**.

---

## 🧪 Testing

```bash
# Unit tests (LLM output parser — 10 tests)
npm test

# E2E tests (requires dev server running — 3 tests)
npm run test:e2e
```

---

## 🛰 Autopilot — The Execution Layer

LaunchCopilot doesn't just write your launch — **it ships it:**

| Feature | How It Works |
|---------|-------------|
| **One-link intake** | Paste an App Store / Play Store URL → listing is read automatically → AI distills pitch, target user, tone. No form. |
| **Real publishing** | Reddit, Telegram, X, LinkedIn, and Discord posts go live via their APIs. "Publish Live" per channel, or arm autopilot for scheduled execution. |
| **Cron autopilot** | `/api/cron` runs daily at 9:00 AM (via Vercel cron) and publishes every due post with zero human action. |
| **Queue management** | Dashboard shows post queue with statuses: `queued` → `due` → `live` / `failed`. "Run due posts" button for manual trigger. |

Unconfigured channels (no API keys) gracefully fall back to copy-paste — the UI adapts automatically based on which publisher keys are present in the environment.

---

## 💰 Business Model

| Tier | Price | Includes |
|------|-------|----------|
| **Free** | ₹0 | 1 complete launch kit (single app) — the launch moment is the hook |
| **Pro** | ₹499/mo (~$6) | Unlimited apps, regeneration, data-driven optimizations, autopilot publishing to 5 channels, tracking history |

**Why a real user pays instead of walking away at kit #1:**
- **The free kit expires by design, not by nag.** It's not a trial countdown — it's exactly one launch. The moment a dev ships app #2 (the norm for anyone who ships more than once), the value the free tier gave them is used up and the wall is real, not simulated.
- **The alternative isn't "do it free," it's "do it worse" or "pay 20-60x more."** A dev's own time writing five platform-native posts plus a 7-day plan runs 2-4 hours even when they know the platforms — LaunchCopilot returns that in minutes. A freelance copywriter for the same scope runs ₹15,000-40,000 ($180-480) per launch and doesn't touch the publishing or tracking loop. ₹499/mo is priced against those two alternatives, not against "free."
- **It compounds instead of resetting.** Every optimization, every tracked result, every regenerated asset accumulates under one Pro subscription across every app a dev ships — the free tier can't hold that history because it only ever sees one app.
- **The autopilot layer is the part free can't approximate at all.** Copy-paste is available to everyone off Free; live publishing to Reddit/Telegram/X/LinkedIn/Discord on a schedule, with zero clicks once armed, is Pro-only infrastructure (OAuth connections, queue state, cron execution) — there's no manual workaround that replicates it.
- **One extra install pays for the month.** At ₹499/mo, the subscription is cheaper than most apps' own cost-per-install on paid ads — meaning if the better, platform-native copy converts even marginally better than a generic post, the subscription is self-funding from the marketing lift alone, not a pure cost center.

**Unit economics:** One full kit ≈ 6 LLM calls ≈ ₹3–6 of inference cost → **80%+ gross margin** from user one. No sales team: the product is self-serve and every kit's public share page recruits the next user.

**Path to first 100 users:** Hackathon Discord → meta-launch (use LaunchCopilot to launch itself) → hackathon-organizer partnerships. 100 Pro users = ₹49,900 MRR.

---

## 🗺 Roadmap

- [x] Channel-native AI generation (5 channels)
- [x] 7-day promotion plan generator
- [x] Per-channel tracking + data-driven copy optimizer
- [x] Freemium paywall (implemented, not slideware)
- [x] One-link store URL import (Apple + Play Store)
- [x] Live publishing: Reddit, Telegram, X APIs
- [x] Live publishing: LinkedIn (OAuth member grant) + Discord (webhook)
- [x] Autopilot + daily cron scheduler
- [x] Public share pages with OG metadata
- [ ] Supabase Auth + per-user workspaces (RLS)
- [ ] Real analytics: App Store Connect / Play Console APIs
- [ ] Copy A/B testing: 2 variants per channel, score against installs
- [ ] Additional channels: Hacker News, TikTok/Shorts scripts, press kit
- [ ] Product Hunt direct publish (blocked on PH granting write-scope access to the app)
- [ ] Razorpay Subscriptions integration (INR-native payments)

---

## 📄 License

MIT

---

<p align="center">
  <strong>ChatGPT writes copy. LaunchCopilot runs your launch.</strong>
</p>
