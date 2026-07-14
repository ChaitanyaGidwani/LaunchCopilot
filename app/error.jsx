"use client";

export default function Error({ error, reset }) {
  return (
    <div className="card" style={{ marginTop: 48, textAlign: "center", padding: "40px 24px" }}>
      <div style={{ fontSize: 40, marginBottom: 8 }}>🛠️</div>
      <h2 style={{ marginTop: 0 }}>Something went sideways</h2>
      <p className="hint" style={{ maxWidth: 420, margin: "0 auto 18px" }}>
        {error?.message || "An unexpected error occurred."} Your generated copy
        is safe — it&apos;s stored, not lost.
      </p>
      <button className="btn" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
