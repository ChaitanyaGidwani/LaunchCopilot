# HackOnVibe — Project Questionnaire

**1. What does your application/service do?**

LaunchCopilot is an AI-powered launch automation platform for mobile app developers who have just shipped and now face the "Day 1" promotion challenge. The developer pastes their App Store or Google Play link; LaunchCopilot auto-reads the listing (via the Apple Lookup API and Play Store metadata) and generates channel-native launch copy for five channels — App Store Optimization, an X (Twitter) thread, a LinkedIn post, a Product Hunt launch, and a Reddit post — plus a sequenced 7-day promotion plan. Its autopilot engine then publishes real posts to Reddit, Telegram, X, LinkedIn, and Discord (manually per channel or via a scheduled daily cron). Developers log installs/clicks per channel, and a "Rewrite Weakest Channel" optimizer regenerates the underperforming copy. Every kit also gets a public share page with Open Graph metadata.

**2. Who is the target audience?**

Indie and solo mobile app developers, small dev studios (1-5 people), and hackathon builders who ship apps without a dedicated marketing team. Primary segments: solo indie developers launching their first or second app; serial app shippers (2+ apps per year, the ideal Pro customers); hackathon participants needing immediate traction; and build-in-public developers active on X, Reddit, Product Hunt, and Indie Hackers.

**3. Which countries are the expected buyers of this service?**

A global developer audience with initial go-to-market focus on India, the United States, Southeast Asia (Indonesia, Vietnam, Philippines), Europe (UK, Germany, Netherlands, Nordics), and Latin America (Brazil, Mexico). The product is language-agnostic at the input layer and English-first at the output layer, with localized output channels as a v2 path.

**4. Who are your competitors?**

Raw general-purpose LLMs (ChatGPT/Claude/Gemini) — no channel-specific conventions, persistence, tracking, or publishing; Copy.ai/Jasper — built for marketers, not app-aware, and expensive; Opus Clip/Repurpose.io — video-centric; AppTweak/Sensor Tower/data.ai — ASO analytics only, no publishing; Buffer/Hootsuite/Later — scheduling with no AI generation; and freelance copywriters/marketing agencies — expensive, slow, and not scalable for serial shippers.

**5. What is your advantage?**

Execution, not advice — it publishes real posts to five channels rather than stopping at copy; channel-native intelligence made provable via visible "conventions applied" compliance chips; closed-loop optimization (generation → publication → tracking → AI-driven rewrite in one product); one-link onboarding (paste a URL, zero friction); a self-marketing growth loop (public share pages); and developer-native pricing (a free tier plus Pro at ₹499/mo, ~$6).
