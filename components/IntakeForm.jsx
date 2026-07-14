"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CATEGORIES = [
  "Productivity", "Health & Fitness", "Finance", "Education", "Social",
  "Photo & Video", "Games", "Utilities", "Travel", "Food & Drink",
  "Developer Tools", "Lifestyle", "Other",
];

export default function IntakeForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [upgradeWall, setUpgradeWall] = useState(false);
  const [pitch, setPitch] = useState("");
  const [targetUser, setTargetUser] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setUpgradeWall(false);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await fetch("/api/apps", { method: "POST", body: formData });
      const data = await res.json();
      if (res.status === 402 || data.code === "UPGRADE_REQUIRED") {
        setUpgradeWall(true);
        setSubmitting(false);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Failed to create app");
      router.push(`/app/${data.id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="grid-2">
        <div>
          <label htmlFor="name">App name *</label>
          <input id="name" name="name" required maxLength={60} placeholder="e.g. HabitDeck" />
        </div>
        <div>
          <label htmlFor="category">Category *</label>
          <select id="category" name="category" required defaultValue="">
            <option value="" disabled>Select a category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <label htmlFor="pitch" style={{ display: "flex", justifyContent: "space-between" }}>
        <span>One-line pitch *</span>
        <span className="char-count">{pitch.length}/140</span>
      </label>
      <input
        id="pitch" name="pitch" required maxLength={140}
        value={pitch} onChange={(e) => setPitch(e.target.value)}
        placeholder="e.g. A habit tracker that turns your streaks into a card game"
      />

      <label htmlFor="target_user" style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Target user *</span>
        <span className="char-count">{targetUser.length}/140</span>
      </label>
      <input
        id="target_user" name="target_user" required maxLength={140}
        value={targetUser} onChange={(e) => setTargetUser(e.target.value)}
        placeholder="e.g. Students and young professionals who abandon habit apps after a week"
      />

      <div className="grid-2">
        <div>
          <label htmlFor="tone">Tone (optional)</label>
          <input id="tone" name="tone" maxLength={60} placeholder="e.g. playful, minimal, serious" />
        </div>
        <div>
          <label htmlFor="store_link">App Store / Play Store link (optional)</label>
          <input id="store_link" name="store_link" type="url" placeholder="https://..." />
        </div>
      </div>

      <label htmlFor="screenshots">Screenshots (optional, up to 3)</label>
      <input id="screenshots" name="screenshots" type="file" accept="image/*" multiple />

      {error && <div className="error-box">{error}</div>}

      {upgradeWall && (
        <div className="card subtle" style={{ marginTop: 14, borderColor: "var(--accent)" }}>
          <h3>🔓 Your free launch kit is used</h3>
          <p className="hint">
            The free plan covers one launch — the moment you ship again, Pro
            pays for itself: unlimited apps, copy regeneration, autopilot
            publishing, and multi-app tracking for ₹499/month.
          </p>
          <Link className="btn" href="/pricing">
            See Pro →
          </Link>
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? "Creating…" : "Generate my launch kit →"}
        </button>
      </div>
    </form>
  );
}
