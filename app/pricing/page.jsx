import { supabase } from "@/lib/supabase";
import { getAccount, getAppCount, PRO_PRICE_INR } from "@/lib/account";
import UpgradeButton from "@/components/UpgradeButton";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  let plan = "free";
  let appCount = 0;
  try {
    const db = supabase();
    const account = await getAccount(db);
    plan = account.plan;
    appCount = await getAppCount(db);
  } catch {
    // unconfigured env — render the page anyway
  }

  return (
    <div>
      <div className="hero">
        <span className="eyebrow">💳 Simple pricing</span>
        <h1>Pricing</h1>
        <p className="lede">
          Your first launch is on us. Pay when LaunchCopilot becomes part of
          how you ship — not before.
        </p>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Free</h3>
          <p style={{ fontSize: 30, fontWeight: 750, margin: "4px 0" }}>₹0</p>
          <p className="hint">The launch moment, covered.</p>
          <ul>
            <li>1 complete launch kit (1 app)</li>
            <li>All 5 channels + conventions shown</li>
            <li>7-day promotion plan</li>
            <li>Channel tracking + 1 AI optimization</li>
            <li>Public share page</li>
          </ul>
          {plan === "free" && (
            <p className="hint" style={{ marginTop: 14 }}>
              Current plan — {appCount === 0 ? "your free kit is unused" : "your free kit is used"}.
            </p>
          )}
        </div>

        <div className="card pro-card">
          <span className="pro-flag">Recommended</span>
          <h3>Pro</h3>
          <p style={{ fontSize: 30, fontWeight: 750, margin: "4px 0" }}>
            ₹{PRO_PRICE_INR}
            <span style={{ fontSize: 14, color: "var(--muted)", fontWeight: 550 }}>/month</span>
          </p>
          <p className="hint">For devs who keep shipping.</p>
          <ul>
            <li>Unlimited apps and launch kits</li>
            <li>Regenerate copy as your app evolves</li>
            <li>Unlimited data-driven optimizations</li>
            <li>Autopilot publishing — Reddit, Telegram, X, LinkedIn, Discord</li>
            <li>Multi-app tracking dashboard</li>
            <li>Coming: HN + Shorts scripts, press kit</li>
          </ul>
          <div style={{ marginTop: 14 }}>
            <UpgradeButton plan={plan} />
          </div>
        </div>
      </div>

      <div className="opt-box" style={{ marginTop: 8 }}>
        <strong>The math that makes ₹499/mo an easy yes</strong>
        <p>
          A launch you self-write across five platforms costs 2–4 hours you
          could spend building. The same scope from a freelance copywriter
          runs ₹15,000–40,000 per launch and still won&apos;t touch
          publishing or tracking. Pro costs less than one of those hours,
          every month, for every app you ship — and if the better copy wins
          you even one extra install over generic copy-paste, the
          subscription already paid for itself.
        </p>
      </div>

      <span className="section-label">Why people actually pay for this</span>
      <div className="steps">
        <div className="step">
          <span className="step-num">⏱️</span>
          <strong>It&apos;s not a discount on your time — it&apos;s a refund of it</strong>
          <span className="hint">
            Free gets you one kit; Pro gets you that same 2–4 hours back on
            every future launch, indefinitely. The math only gets better the
            more you ship.
          </span>
        </div>
        <div className="step">
          <span className="step-num">📡</span>
          <strong>Autopilot is infrastructure Free can&apos;t fake</strong>
          <span className="hint">
            Copy-paste is available to everyone. Live, scheduled publishing
            to five platforms with zero clicks once armed needs OAuth
            connections, a queue, and a cron — that&apos;s what Pro actually buys.
          </span>
        </div>
        <div className="step">
          <span className="step-num">📈</span>
          <strong>Every app compounds under one subscription</strong>
          <span className="hint">
            Tracking history and optimizations stack across every app you
            launch — Free only ever sees one. Serial shippers get better
            copy over time; one-off users don&apos;t need to.
          </span>
        </div>
      </div>

      <p className="hint" style={{ marginTop: 16 }}>
        No lock-in — cancel anytime from this page. Pricing is in INR because
        that&apos;s who we built this for first; more currencies land with
        Razorpay checkout.
      </p>
    </div>
  );
}
