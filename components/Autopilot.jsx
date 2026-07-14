"use client";

import { useEffect, useState } from "react";

const LABELS = {
  reddit: "Reddit",
  telegram: "Telegram",
  twitter: "X / Twitter",
  aso: "App Store",
  linkedin: "LinkedIn",
  product_hunt: "Product Hunt",
  discord: "Discord",
};

function StatusBadge({ post }) {
  if (post.status === "published") return <span className="badge ok">✓ live</span>;
  if (post.status === "failed")
    return <span className="badge err" title={post.error}>failed</span>;
  const due = new Date(post.scheduled_for) <= new Date();
  return (
    <span className={`badge ${due ? "busy" : ""}`} suppressHydrationWarning>
      {due ? "due now" : "queued"}
    </span>
  );
}

// THE AUTOPILOT CONSOLE — posts that publish themselves. Queue state lives in
// Dashboard so per-card "Publish live" buttons stay in sync with this table.
export default function Autopilot({ app, plan, publishable, linkedinConnectable, queue, setQueue, notify }) {
  const [building, setBuilding] = useState(false);
  const [running, setRunning] = useState(false);

  // Reflect the ?linkedin=connected|error redirect from /api/auth/linkedin/callback.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const li = params.get("linkedin");
    if (!li) return;
    if (li === "connected") notify("ok", "LinkedIn connected — it can now publish live.");
    else if (li === "error") notify("err", `LinkedIn connection failed: ${params.get("msg") || "unknown error"}`);
    params.delete("linkedin");
    params.delete("msg");
    const rest = params.toString();
    window.history.replaceState({}, "", window.location.pathname + (rest ? `?${rest}` : ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refreshQueue() {
    const res = await fetch(`/api/autopilot?appId=${app.id}`);
    const data = await res.json();
    if (res.ok) setQueue(data.queue);
  }

  async function startAutopilot() {
    setBuilding(true);
    try {
      const res = await fetch("/api/autopilot", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ appId: app.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't build the queue");
      setQueue(data.queue);
      notify("ok", `Autopilot armed — ${data.queue.filter((q) => q.status === "queued").length} post(s) scheduled.`);
    } catch (e) {
      notify("err", e.message);
    } finally {
      setBuilding(false);
    }
  }

  async function runDue() {
    setRunning(true);
    try {
      const res = await fetch("/api/cron", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Run failed");
      await refreshQueue();
      const ok = (data.results ?? []).filter((r) => r.status === "published").length;
      const bad = (data.results ?? []).filter((r) => r.status === "failed").length;
      if (data.ran === 0) notify("ok", "Nothing due yet — posts fire on their scheduled day.");
      else notify(bad ? "err" : "ok", `Published ${ok} post(s)${bad ? `, ${bad} failed — see queue` : ""}.`);
    } catch (e) {
      notify("err", e.message);
    } finally {
      setRunning(false);
    }
  }

  return (
    <>
      <div className="channel-head" style={{ marginTop: 32 }}>
        <h2 style={{ margin: 0 }}>🛰 Launch autopilot</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {linkedinConnectable && (
            <a className="btn secondary" href={`/api/auth/linkedin/start?appId=${app.id}`}>
              💼 Connect LinkedIn
            </a>
          )}
          <button className="btn secondary" onClick={startAutopilot} disabled={building}>
            {building ? "Scheduling…" : queue.length ? "Re-sync queue" : "Arm autopilot"}
          </button>
          {queue.some((q) => q.status === "queued") && (
            <button className="btn" onClick={runDue} disabled={running}>
              {running ? "Publishing…" : "▶ Run due posts"}
            </button>
          )}
        </div>
      </div>
      <div className="card">
        {publishable.length === 0 ? (
          <p className="hint">
            No publishers connected yet. Add Reddit, Telegram, X, or Discord
            keys to <code>.env.local</code> (see <code>.env.example</code>) and
            restart, or connect LinkedIn with the button above — then your
            posts publish themselves on schedule. In production a daily cron
            fires them with zero clicks.
          </p>
        ) : queue.length === 0 ? (
          <p className="hint">
            Connected: {publishable.map((c) => LABELS[c] ?? c).join(", ")}.{" "}
            {plan
              ? "Arm autopilot to schedule real posts on the days your plan says to fire them. A daily cron publishes them automatically when deployed."
              : "Generate the 7-day plan first — autopilot schedules posts on the days the plan says to fire them."}
          </p>
        ) : (
          <>
            {queue.map((post) => (
              <div className="queue-row" key={post.id ?? post.channel}>
                <span className="bar-label">{LABELS[post.channel] ?? post.channel}</span>
                <span className="hint" suppressHydrationWarning>
                  {new Date(post.scheduled_for).toLocaleString(undefined, {
                    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </span>
                <StatusBadge post={post} />
                {post.result_url && (
                  <a
                    href={post.result_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "var(--accent)", fontSize: 13, marginLeft: "auto" }}
                  >
                    View live post ↗
                  </a>
                )}
                {post.status === "failed" && (
                  <span
                    className="hint"
                    style={{ marginLeft: "auto", maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    title={post.error}
                  >
                    {post.error}
                  </span>
                )}
              </div>
            ))}
            <p className="hint" style={{ marginTop: 10 }}>
              Deployed on Vercel, a daily cron publishes due posts automatically
              — no clicks. Product Hunt has no self-serve posting API (they
              gate write access behind a manual request), so its copy stays
              one-click-ready in the kit above.
            </p>
          </>
        )}
      </div>
    </>
  );
}
