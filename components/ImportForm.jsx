"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ONE-LINK INTAKE: paste a store URL → app is created automatically.
export default function ImportForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [upgradeWall, setUpgradeWall] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setUpgradeWall(false);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ storeUrl: url }),
      });
      const data = await res.json();
      if (res.status === 402 || data.code === "UPGRADE_REQUIRED") {
        setUpgradeWall(true);
        setBusy(false);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Import failed");
      router.push(`/app/${data.id}`);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="import-row">
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://apps.apple.com/app/id…  or  https://play.google.com/store/apps/details?id=…"
          aria-label="App Store or Play Store link"
        />
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Reading your listing…" : "🚀 Launch it"}
        </button>
      </div>
      <p className="hint" style={{ marginTop: 8 }}>
        We read your store listing, write platform-native copy for 5 channels,
        and publish on schedule. You paste one link.
      </p>

      {error && <div className="error-box">{error}</div>}
      {upgradeWall && (
        <div className="card subtle" style={{ marginTop: 14, borderColor: "var(--accent)" }}>
          <h3>🔓 Your free launch kit is used</h3>
          <p className="hint">
            One launch is free; app #2 is where Pro pays for itself — unlimited
            apps, regeneration, and autopilot publishing to 5 channels for
            ₹499/month, less than one hour of a freelance copywriter.
          </p>
          <Link className="btn" href="/pricing">See Pro →</Link>
        </div>
      )}
    </form>
  );
}
