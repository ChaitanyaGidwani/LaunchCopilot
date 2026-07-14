import Link from "next/link";
import ImportForm from "@/components/ImportForm";
import IntakeForm from "@/components/IntakeForm";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function getRecentApps() {
  try {
    const { data } = await supabase()
      .from("apps")
      .select("id, name, category, created_at")
      .order("created_at", { ascending: false })
      .limit(10);
    return { apps: data ?? [], error: null };
  } catch (e) {
    return { apps: [], error: e.message };
  }
}

export default async function HomePage() {
  const { apps, error } = await getRecentApps();

  return (
    <div>
      <div className="hero">
        <span className="eyebrow">🛰️ AI launch copilot for indie devs</span>
        <h1>
          Paste a link.{" "}
          <span className="gradient-text">Your app launch runs itself.</span>
        </h1>
        <p className="lede">
          Drop your App Store or Play Store link. LaunchCopilot reads your
          listing, writes platform-native copy for five channels, schedules it —
          and publishes real posts to Reddit, Telegram, and X automatically.
          You stay in the editor; the launch happens anyway.
        </p>
      </div>

      {error && (
        <div className="error-box">
          Setup needed: {error} — see README.md for the 5-minute setup.
        </div>
      )}

      <div className="card" style={{ borderColor: "var(--accent)" }}>
        <h2 style={{ marginTop: 0 }}>Launch your app</h2>
        <ImportForm />
        <details style={{ marginTop: 14 }}>
          <summary className="hint" style={{ cursor: "pointer" }}>
            No store link yet? Fill in the details manually
          </summary>
          <div style={{ marginTop: 10 }}>
            <IntakeForm />
          </div>
        </details>
      </div>

      <span className="section-label">How it works</span>
      <div className="steps">
        <div className="step">
          <span className="step-num">1</span>
          <strong>Paste your store link</strong>
          <span className="hint">AI reads the listing — name, category, screenshots, positioning.</span>
        </div>
        <div className="step">
          <span className="step-num">2</span>
          <strong>Kit writes itself</strong>
          <span className="hint">ASO, X, LinkedIn, Product Hunt, Reddit — each in that platform&apos;s native voice.</span>
        </div>
        <div className="step">
          <span className="step-num">3</span>
          <strong>Autopilot publishes</strong>
          <span className="hint">Real posts go live on schedule via Reddit, Telegram &amp; X APIs. Results tracked, weakest copy rewritten.</span>
        </div>
      </div>

      {apps.length > 0 && (
        <div className="card subtle">
          <h2 style={{ marginTop: 0 }}>Recent apps</h2>
          {apps.map((a) => (
            <div className="app-list-item" key={a.id}>
              <Link href={`/app/${a.id}`}>{a.name}</Link>
              <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span className="hint">
                  {a.created_at ? String(a.created_at).slice(0, 10) : ""}
                </span>
                <span className="badge">{a.category}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
