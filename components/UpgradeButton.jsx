"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Demo checkout: activates Pro instantly. In production this button opens
// Razorpay/Stripe checkout and /api/upgrade becomes the payment webhook.
export default function UpgradeButton({ plan }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function change(action) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/upgrade", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upgrade failed");
      router.refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (plan === "pro") {
    return (
      <div>
        <span className="badge ok">✓ Pro active</span>
        <button
          className="copy-btn"
          style={{ marginLeft: 10 }}
          onClick={() => change("downgrade")}
          disabled={busy}
        >
          Reset to free (demo)
        </button>
      </div>
    );
  }

  return (
    <div>
      <button className="btn" onClick={() => change("upgrade")} disabled={busy}>
        {busy ? "Activating…" : "Upgrade to Pro →"}
      </button>
      {error && <div className="error-box">{error}</div>}
    </div>
  );
}
