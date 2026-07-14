# LaunchCopilot — Pitch & Business Content

*(Use directly in the DoraHacks submission form and Discord posts.)*

## One-liner
LaunchCopilot turns basic info about your newly launched mobile app into a full, channel-aware promotion kit — App Store ASO copy, X and LinkedIn launch posts, a Product Hunt pitch, a Reddit post that won't get removed — plus a 7-day promotion plan and simple tracking of which channel actually delivered installs.

## Product description (for submission)
Indie developers ship apps, then stall at promotion: writing store copy, launch threads, and community posts is unfamiliar, unmotivating work — so it either doesn't happen or one generic blurb gets pasted everywhere and ignored. LaunchCopilot takes the app metadata a dev already knows (name, category, pitch, target user, screenshots) and generates platform-native copy for five channels, each written against that platform's real conventions: character-limited ASO fields with a keyword strategy, a hook-first X thread, a story-arc LinkedIn post, a Product Hunt maker comment in PH's expected structure, and a Reddit post in an authentic dev voice with subreddit selection and self-promo-rule awareness. It then sequences a 7-day, ~1-hour-a-day launch plan and lets the dev self-log installs/clicks per channel, so the tool closes the loop: what to say, where to say it, and where it worked.

**Built during the hackathon:** the entire product — intake flow, five channel-aware generation pipelines, 7-day plan generator, dashboard with one-click copy, per-channel tracking, the performance-driven copy optimizer, public share pages, Supabase persistence, provider-switchable LLM backend (Groq/Gemini/Claude/OpenAI).

## The three USPs (say these in the video and to judges)
1. **Channel-native, not generic — and provably so.** Every asset displays "✓ conventions applied" chips (title ≤30 chars, no link in tweet 1, dev transparency disclosed…). Judges don't have to take the AI depth on faith; the reasoning is visible on every card. ChatGPT can write a launch tweet; it won't enforce five platforms' rulebooks simultaneously and show its work.
2. **The closed loop: your launch data rewrites your copy.** Log installs per channel, hit "Rewrite my weakest channel" — the AI reads the performance spread, forms a hypothesis for why that channel underperformed, and rewrites the copy with a changelog. No copywriting tool connects generation to measured results. This is the feature that makes it a product, not a prompt.
3. **Every kit markets itself.** Each kit has a public share page with a one-click Discord post — users showing off their generated kits IS the growth loop (and, this weekend, the Community Validation evidence).

## Target customer
Indie/solo mobile app developers and small dev studios (1–5 people) who ship apps without a marketing team. Sizeable and reachable: thousands of apps hit the stores daily, and these devs congregate in exactly the communities LaunchCopilot writes for (Product Hunt, r/SideProject, #buildinpublic, hackathon Discords).

## Pricing
- **Free:** 1 complete launch kit (single app) — the launch moment is the hook.
- **Pro — ₹499/month:** unlimited apps, regeneration as the app evolves (new features → refreshed ASO + posts), unlimited data-driven optimizations, autopilot publishing to Reddit/Telegram/X/LinkedIn/Discord, tracking history, and upcoming channels (HN, TikTok/Shorts scripts, press kit).
- Why it works: priced like a utility, below one hour of freelance copywriting; the free kit is the demo, the second app is the paywall.

## Why a real user pays (not just why the business could theoretically make money)
This is the question that actually decides revenue, and it has a specific answer, not a vibe:

1. **The free tier isn't a limited trial of the same thing — it's a complete but single-use product.** Nothing is crippled or watermarked on Free; you get the full kit, the full plan, real tracking. What runs out is *quantity*, at exactly the moment quantity starts to matter — app #2. That's a much stronger conversion moment than a 14-day countdown, because the value the user already received is undeniable when they hit the wall.
2. **The real alternative to paying isn't "free forever," it's "worse or more expensive."** Three concrete alternatives, and LaunchCopilot beats all three on the dimension that matters to a shipping developer:
   - *Doing it yourself:* 2–4 hours per launch across five platforms, competing with the hours you'd rather spend building. Pro turns that into minutes, every time, indefinitely.
   - *A freelance copywriter or agency:* ₹15,000–40,000 ($180–480) per launch, days of turnaround, and they still don't publish or track anything — that's a pure copy deliverable. Pro is a full month of unlimited launches for less than one such invoice.
   - *A generic ChatGPT prompt, copy-pasted everywhere:* free, but it's the exact failure mode LaunchCopilot exists to fix — no platform conventions, no publishing, no measurement, and it reads like it. The cost isn't money, it's a launch that underperforms.
3. **Autopilot is the part money buys that no amount of user effort can substitute for.** Copy generation alone could plausibly be "worth doing manually" for a stubborn user. Live, scheduled publishing across five APIs with a working queue and daily cron cannot be manually replicated — there's no free workaround, which is exactly why it's gated to Pro rather than a nice-to-have upsell.
4. **The subscription can be self-funding, not just self-justifying.** ₹499/mo is below what many apps already spend acquiring a single paid install. If platform-native copy converts even marginally better than generic copy-paste — which is the entire thesis of the product — the marketing lift from one extra install covers the month. That's a much easier sell than "trust us, it's worth it."
5. **Value compounds under the subscription instead of resetting.** Tracking history and optimization hypotheses accumulate per account across every app shipped. A user who cancels loses that compounding, which is a stickier reason to stay than most SaaS churn triggers ever manage to build.

## Business Success track — path to revenue (the monetization is BUILT, not slideware)
**Implemented in the product:** the freemium funnel works end-to-end in the demo. Create one app free → the second app hits a live paywall (HTTP 402) → the pricing page upgrades you to Pro → the second app unlocks. In production, the upgrade endpoint becomes a Razorpay Subscriptions webhook (INR-native, UPI/cards) — the gating logic doesn't change, only the activation trigger.

**Unit economics:** one full kit ≈ 6 LLM calls ≈ ₹3–6 of inference at current API pricing. Pro at ₹499/mo with even heavy usage (10 kits + 20 optimizations) costs < ₹100 to serve → 80%+ gross margin from user one. No sales team: the product is self-serve and every kit's public share page recruits the next user.

**Who pays and why:** serial shippers. A dev who launches once takes the free kit; a dev/studio shipping 2+ apps a year (the norm among indie devs — median shipped apps rises with every year of experience) pays ₹499 the moment they hit the wall on app #2, which the demo shows happening. The wedge expands to small app studios (5–20 apps) on a future team plan at ₹1,999/mo.

**Path to first 100 paying users:** (1) this weekend — HackOnVibe Discord, every participant has an app that needs promotion, share-page loop seeds signups; (2) weeks 1–4 — meta-launch: use LaunchCopilot to launch LaunchCopilot on PH/Reddit/X, publish the tracking dashboard publicly as proof; (3) months 2–3 — partner with hackathon organizers (DoraHacks, hack2skill, Unstop): every winning team gets a Pro month, organizers get a polished-looking cohort. 100 Pro users = ₹49,900 MRR ≈ $600 — small, but real, recurring, and defensibly grown from zero marketing spend.

## Go-to-market
1. **Now (during hackathon):** launch LaunchCopilot in the HackOnVibe Discord — a room full of people currently building and launching apps. Ask builders to run THEIR app through it and share results in-thread. Their screenshots are our community validation.
2. **Week 1:** dogfood — use LaunchCopilot to generate its own Product Hunt/Reddit/X launch (the meta-launch is the marketing story).
3. **Month 1:** indie-hacker communities (r/SideProject, r/androidapps devs, Indie Hackers, #buildinpublic), hackathon partner communities (DoraHacks, hack2skill, Unstop) where every winning team has an app to promote.

## Judging criteria mapping
- **Usefulness & Execution:** real, universal indie-dev problem; working end-to-end demo (intake → 5 assets → plan → tracking) in under 3 minutes.
- **AI & Product Depth:** the AI isn't a wrapper — each channel has an expert-encoded convention system (char limits, voice, structure, platform norms); depth is visible by comparing outputs side-by-side. Realistic v2: auth + RLS, store-API install data, direct publishing, A/B copy variants scored against logged installs.
- **Business Potential:** clear customer, freemium → ₹499/mo, GTM that starts the same weekend.
- **Community Validation:** the GTM IS the validation plan — live demo + "run your app through it" thread in the HackOnVibe Discord during the event.

## v2 roadmap (say this when judges ask "what's next")
1. Supabase Auth + per-user workspaces (RLS policies already scaffolded).
2. Real analytics: App Store Connect / Play Console API pulls replace self-logging.
3. Direct publish to Product Hunt if/when they grant write-scope API access (currently a manual request to their team, not self-serve — see below).
4. Copy A/B loop: generate 2 variants per channel, score against logged installs, regenerate from the winner — the tracking data becomes training signal.
5. More channels: Hacker News, TikTok/Shorts scripts, press/media kit.

## PIVOT UPDATE — from advisor to executor (final submission framing)
**New one-liner:** Paste your app's store link. LaunchCopilot writes your entire launch in each platform's native voice — then *publishes it for you*, on schedule, via the Reddit, Telegram, X, LinkedIn, and Discord APIs.

Why this framing wins: advice products compete with ChatGPT; execution products compete with agencies. Input is one URL (the store listing is read automatically); output is real, live posts at real URLs, fired by a daily cron with zero human action. The loop is now: paste link → kit writes itself → autopilot publishes → installs tracked per channel → weakest copy rewritten from the data. The human's only job is to approve (and, for LinkedIn specifically, a one-time OAuth click — LinkedIn requires the member to authorize posting, there's no static API key, unlike the other four). Product Hunt is the one channel that stays copy-paste: PH doesn't offer self-serve write access to their API, it's gated behind a manual request to their team, so promising automatic PH posting would be dishonest. Saying so plainly is the honest answer to "why isn't everything automatic?"
