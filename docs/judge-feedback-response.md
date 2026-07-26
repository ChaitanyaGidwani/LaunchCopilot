# Judge Feedback → Action Plan

Four judges. Scores: Business 7/7/5/7, World-impact 8/6/3/2.
One sentence summarises all four reviews:

> **The idea and UX are right. The differentiator (publish + track + optimise)
> is not something a judge could personally verify.**

Everything below is ordered by score impact per hour of work.

---

## ✅ FIXED IN THIS PASS

| Judge | Issue | Fix |
|---|---|---|
| Igor | LinkedIn throws **426** | `LinkedIn-Version: 202506` was expired — LinkedIn 426s any version older than ~12 months. Now tries `LINKEDIN_API_VERSION` then walks back through recent versions; clear error if all fail. `lib/publishers.js` |
| Igor | Play Store link "**Load failed**" (Tinder) | Rewrote the Play importer: real browser UA, forced `hl=en&gl=US` (consent-page redirects were the cause), 15s abort timeout, `<title>`/itemprop fallbacks, multi-screenshot extraction, HTML entity decoding, honest error messages. `app/api/import/route.js` |
| Igor | "Recent Apps" leaks user data + duplicates | Renamed to **Example launches**, de-duplicated by name, filters scratch entries (`test*`, `demo*`…), caps at 6, adds a privacy line. `app/page.jsx` |
| Oleg, Oleh | Auto-posting = ban/spam risk; users won't let AI post unreviewed | **Approval gate.** `scheduled_posts.approved` defaults false; cron publishes *only* approved posts. UI shows `needs review` → **✓ Approve** → `approved` → `publishing next run`. Plus rate limiting: max one post per channel per run, 2s spacing. |

**Run this migration:** the new lines at the bottom of `supabase/autopilot.sql`
(`alter table scheduled_posts add column ... approved`).

---

## 🎯 THE ONE THING THAT MOVES THE SCORE MOST

Illia scored **5 and 2** and said exactly why:

> "the fact that I cannot connect Telegram there now, cannot connect LinkedIn
> here, although they are somehow declared… if this were implemented, I would
> give 7, 8, 9, 10."

**The problem is not the code — publishing works. It is that connections live in
`.env.local`, so only you can connect anything.** A judge opening your live URL
can never reach the feature that makes you different from a prompt wrapper.

**Fix: move credentials from env vars into the app.** A `/connections` page where
the user pastes their own credentials, stored per-account in Supabase:

- **Discord webhook** — paste one URL. 30 seconds, no OAuth, no approval. *Do this first.*
- **Telegram** — paste bot token + channel. 2 minutes via @BotFather.
- **LinkedIn** — OAuth already built (`/api/auth/linkedin/*`); just needs the button surfaced.
- **Reddit/X** — keep as env/advanced, they need app review.

`lib/publishers.js` already reads config through `isConfigured()`/`getAccountRow()`,
so this is a read-source change, not a rewrite. Est. 2–4 hours. It converts
"declared" into "demonstrated" for every future judge.

---

## 💰 CONTENT QUALITY = THE PAID-SUBSCRIPTION QUESTION

Igor: *"is the generated content quality high enough to justify a paid
subscription?"* Oleh: *"real quality depends on originality, knowledge of the
audience… be careful with the claim that content is automatically optimised."*

Three cheap credibility moves:

1. **Upgrade the model for paid tiers.** Free tier can stay on a fast model;
   Pro should call a frontier model. One env var, and it becomes a real pricing
   justification ("Pro writes with our best model").
2. **Ground the copy in real signal.** You already fetch the store listing —
   also feed the model the app's *actual reviews* and top competitor taglines.
   Copy grounded in real user language beats generic LLM prose, and it is a
   defensible answer to "why not just ChatGPT?".
3. **Soften the claim.** Say "written to each platform's conventions" (provable,
   your ✓ chips show it) rather than "optimised for every platform" (not provable).

## 📅 MAKE THE CALENDAR THE PRODUCT (Oleh)

He called the 7-day plan your strongest feature and wants it central: each item
showing platform, time, the prepared content, approval state, and result. You now
have `scheduled_posts.approved` + `result_url` — merging the plan view and the
autopilot queue into one calendar is mostly UI work and would land his main ask.

## 🌍 WORLD IMPACT (weakest axis: 2, 3)

Both low scores came from "it just generates more content." Reframe around
*discovery*: the tool helps good apps get found, and the tracking loop proves
which channel actually delivered installs. Showing one real tracked click →
install chain is worth more than any wording change. Also widen the stated
audience beyond developers — Illia explicitly said marketers, freelancers, and
non-technical founders are all in scope, and you are narrowing yourself.
