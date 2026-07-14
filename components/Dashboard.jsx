"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CHANNELS, CHANNEL_LABELS } from "@/lib/channels";
import { AssetBody, CopyButton, assetToText } from "./AssetView";
import Autopilot from "./Autopilot";

export default function Dashboard({
  app,
  initialAssets,
  initialPlan,
  initialEntries,
  initialQueue = [],
  publishable = [],
  linkedinConnectable = false,
}) {
  const [assets, setAssets] = useState(
    Object.fromEntries(initialAssets.map((a) => [a.channel, a.content]))
  );
  const [status, setStatus] = useState({}); // channel -> idle|busy|error message
  const [plan, setPlan] = useState(initialPlan);
  const [planBusy, setPlanBusy] = useState(false);
  const [entries, setEntries] = useState(initialEntries);
  const [trackBusy, setTrackBusy] = useState(false);
  const [optBusy, setOptBusy] = useState(false);
  const [optResult, setOptResult] = useState(null);
  const [toast, setToast] = useState(null); // { type: "ok"|"err", msg }
  const [doneTasks, setDoneTasks] = useState({}); // "day-index" -> true
  const [genProgress, setGenProgress] = useState(null); // { current, total, label }
  const [queue, setQueue] = useState(initialQueue);
  const [pubBusy, setPubBusy] = useState({}); // channel -> bool

  // Plan checklist progress persists locally per app
  const planKey = `lc-plan-done-${app.id}`;
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(planKey);
      if (saved) setDoneTasks(JSON.parse(saved));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleTask(id) {
    setDoneTasks((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        window.localStorage.setItem(planKey, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function notify(type, msg) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  async function generate(channel) {
    setStatus((s) => ({ ...s, [channel]: "busy" }));
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ appId: app.id, channel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setAssets((a) => ({ ...a, [channel]: data.content }));
      setStatus((s) => ({ ...s, [channel]: "idle" }));
    } catch (e) {
      setStatus((s) => ({ ...s, [channel]: `error: ${e.message}` }));
    }
  }

  async function generateAll() {
    // Sequential to stay under rate limits; each channel updates as it lands.
    // Failures don't stop the run — generate() catches per-channel errors.
    const missing = CHANNELS.filter((c) => !assets[c.key]);
    for (let i = 0; i < missing.length; i++) {
      setGenProgress({ current: i + 1, total: missing.length, label: missing[i].label });
      await generate(missing[i].key);
    }
    setGenProgress(null);
  }

  async function generatePlan() {
    setPlanBusy(true);
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ appId: app.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Plan generation failed");
      setPlan(data.days);
      notify("ok", "7-day plan ready — arm autopilot to schedule the posts.");
    } catch (e) {
      notify("err", e.message);
    } finally {
      setPlanBusy(false);
    }
  }

  // PUBLISH FOR REAL: creates a live post on the platform via its API.
  async function publishNow(channel) {
    if (
      !window.confirm(
        `Publish the ${CHANNEL_LABELS[channel] ?? channel} post LIVE right now? It will appear publicly on your connected account.`
      )
    )
      return;
    setPubBusy((s) => ({ ...s, [channel]: true }));
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ appId: app.id, channel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Publish failed");
      setQueue((q) => {
        const rest = q.filter((p) => p.channel !== channel);
        return [...rest, data.post].sort(
          (a, b) => new Date(a.scheduled_for) - new Date(b.scheduled_for)
        );
      });
      notify("ok", `🎉 Live on ${CHANNEL_LABELS[channel] ?? channel}!`);
      if (data.post?.result_url) window.open(data.post.result_url, "_blank");
    } catch (e) {
      notify("err", e.message);
    } finally {
      setPubBusy((s) => ({ ...s, [channel]: false }));
    }
  }

  async function logEntry(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setTrackBusy(true);
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          appId: app.id,
          channel: fd.get("channel"),
          metric: fd.get("metric"),
          count: Number(fd.get("count")),
          note: fd.get("note"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to log");
      setEntries((prev) => [data.entry, ...prev]);
      form.reset();
      notify("ok", `Logged ${data.entry.count} ${data.entry.metric} for ${CHANNEL_LABELS[data.entry.channel] ?? data.entry.channel}.`);
    } catch (err) {
      notify("err", err.message);
    } finally {
      setTrackBusy(false);
    }
  }

  // THE CLOSED LOOP: rewrite the weakest channel's copy using logged results.
  async function optimize() {
    setOptBusy(true);
    setOptResult(null);
    try {
      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ appId: app.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Optimization failed");
      setAssets((a) => ({ ...a, [data.channel]: data.content }));
      setOptResult(data.channel);
      notify("ok", `Rewrote ${CHANNEL_LABELS[data.channel] ?? data.channel} using your launch data.`);
      setTimeout(() => {
        document
          .getElementById(`channel-${data.channel}`)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } catch (e) {
      notify("err", e.message);
    } finally {
      setOptBusy(false);
    }
  }

  // Aggregate tracking per channel
  const totals = {};
  for (const en of entries) {
    totals[en.channel] = (totals[en.channel] ?? 0) + en.count;
  }
  const maxTotal = Math.max(1, ...Object.values(totals));
  const winner = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
  const generatedCount = Object.keys(assets).length;

  // Plan progress
  const totalTasks = (plan ?? []).reduce((n, d) => n + (d.tasks?.length ?? 0), 0);
  const doneCount = (plan ?? []).reduce(
    (n, d) => n + (d.tasks ?? []).filter((_, i) => doneTasks[`${d.day}-${i}`]).length,
    0
  );

  // Export the whole kit as a Markdown file — for co-founders, docs, backups.
  function downloadKit() {
    const lines = [`# ${app.name} — Launch Kit`, "", `> ${app.pitch}`, ""];
    for (const c of CHANNELS) {
      if (!assets[c.key]) continue;
      lines.push(`## ${c.label}`, "", assetToText(c.key, assets[c.key]), "");
    }
    if (plan) {
      lines.push("## 7-Day Promotion Plan", "");
      for (const d of plan) {
        lines.push(`### Day ${d.day} — ${d.theme}`);
        for (const t of d.tasks ?? []) lines.push(`- [ ] ${t.text} _(${CHANNEL_LABELS[t.channel] ?? t.channel})_`);
        lines.push("");
      }
    }
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${app.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-launch-kit.md`;
    a.click();
    URL.revokeObjectURL(url);
    notify("ok", "Kit downloaded as Markdown.");
  }

  return (
    <div>
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <Link href="/" className="hint" style={{ textDecoration: "none", display: "inline-block", marginTop: 4 }}>
        ← All apps
      </Link>
      <div className="channel-head">
        <h1>{app.name}</h1>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {generatedCount > 0 && (
            <button className="btn secondary small" onClick={downloadKit}>
              ⬇ Download kit
            </button>
          )}
          <a
            className="btn secondary small"
            href={`/share/${app.id}`}
            target="_blank"
            rel="noreferrer"
          >
            🔗 Share this kit
          </a>
        </div>
      </div>
      <p className="lede">
        <span className="badge">{app.category}</span> &nbsp;{app.pitch}
      </p>
      {app.screenshot_urls?.length > 0 && (
        <div className="screens">
          {app.screenshot_urls.map((url) => (
            <div key={url} className="screen-thumb">
              <Image src={url} alt="App screenshot" fill sizes="120px" style={{ objectFit: "cover" }} />
            </div>
          ))}
        </div>
      )}

      <div className="channel-head" style={{ marginTop: 24 }}>
        <h2 style={{ margin: 0 }}>Launch kit ({generatedCount}/{CHANNELS.length} channels)</h2>
        <button className="btn" onClick={generateAll}>
          {generatedCount === 0 ? "⚡ Generate full kit" : "⚡ Generate missing"}
        </button>
      </div>
      <p className="hint">
        Same app, five platforms, five genuinely different voices — the ✓ chips
        on each asset show which platform rules it deliberately follows.
      </p>

      {genProgress && (
        <div className="gen-progress">
          <div className="gen-progress-head">
            <span>
              ✍️ Writing {genProgress.label}… ({genProgress.current}/{genProgress.total})
            </span>
            <span className="hint">~15s per channel</span>
          </div>
          <div className="bar-track" style={{ height: 8 }}>
            <div
              className="bar-fill"
              style={{ width: `${(genProgress.current / genProgress.total) * 100}%`, minWidth: 8, padding: 0 }}
            />
          </div>
        </div>
      )}

      {CHANNELS.map(({ key, label, icon }) => (
        <div className="card" key={key} id={`channel-${key}`}>
          <div className="channel-head">
            <h3>
              {icon} {label}
            </h3>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              {status[key] === "busy" && <span className="badge busy">writing…</span>}
              {status[key]?.startsWith?.("error") && (
                <span className="badge err" title={status[key]}>{status[key]}</span>
              )}
              {assets[key] && status[key] !== "busy" && (
                <span className="badge ok">ready</span>
              )}
              {assets[key] && (
                <CopyButton text={assetToText(key, assets[key])} label="Copy all" />
              )}
              {assets[key] && publishable.includes(key) && (
                <button
                  className="btn small"
                  onClick={() => publishNow(key)}
                  disabled={pubBusy[key]}
                >
                  {pubBusy[key] ? "Publishing…" : "📤 Publish live"}
                </button>
              )}
              {key === "linkedin" && !publishable.includes("linkedin") && linkedinConnectable && (
                <a className="btn secondary small" href={`/api/auth/linkedin/start?appId=${app.id}`}>
                  Connect LinkedIn to publish
                </a>
              )}
              <button
                className="btn secondary small"
                onClick={() => {
                  if (
                    assets[key] &&
                    !window.confirm(`Replace the current ${label} copy? This can't be undone.`)
                  )
                    return;
                  generate(key);
                }}
                disabled={status[key] === "busy"}
              >
                {assets[key] ? "Regenerate" : "Generate"}
              </button>
            </div>
          </div>
          {assets[key] ? (
            <AssetBody channel={key} content={assets[key]} />
          ) : (
            <p className="hint">Not generated yet.</p>
          )}
        </div>
      ))}

      <div className="channel-head" style={{ marginTop: 32 }}>
        <h2 style={{ margin: 0 }}>
          📅 7-day promotion plan
          {plan && totalTasks > 0 && (
            <span className="badge" style={{ marginLeft: 10 }}>
              {doneCount}/{totalTasks} done
            </span>
          )}
        </h2>
        <button className="btn secondary" onClick={generatePlan} disabled={planBusy}>
          {planBusy ? "Planning…" : plan ? "Regenerate plan" : "Generate plan"}
        </button>
      </div>
      <div className="card">
        {plan ? (
          plan.map((d) => (
            <div className="plan-day" key={d.day}>
              <div className="day-num">Day {d.day}</div>
              <div>
                <strong>{d.theme}</strong>
                {(d.tasks ?? []).map((t, i) => {
                  const id = `${d.day}-${i}`;
                  const done = !!doneTasks[id];
                  return (
                    <button
                      type="button"
                      className={`plan-task clickable ${done ? "done" : ""}`}
                      key={i}
                      onClick={() => toggleTask(id)}
                    >
                      <span>{done ? "☑" : "☐"}</span>
                      <span>
                        {t.text}{" "}
                        <span className="chan">[{CHANNEL_LABELS[t.channel] ?? t.channel}]</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <p className="hint">
            Generate a day-by-day checklist sequenced for a {app.category} app.
          </p>
        )}
      </div>

      <Autopilot
        app={app}
        plan={plan}
        publishable={publishable}
        linkedinConnectable={linkedinConnectable}
        queue={queue}
        setQueue={setQueue}
        notify={notify}
      />

      <h2 style={{ marginTop: 32 }}>📊 Which channel is working?</h2>
      <div className="card">
        {Object.keys(totals).length === 0 ? (
          <p className="hint">
            After you post, log installs or clicks per channel here — the kit
            tells you what to say, this tells you where it worked, and the
            optimizer rewrites what didn&apos;t.
          </p>
        ) : (
          <>
            {Object.entries(totals)
              .sort((a, b) => b[1] - a[1])
              .map(([ch, total]) => (
                <div className="bar-row" key={ch}>
                  <span className="bar-label">{CHANNEL_LABELS[ch] ?? ch}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${(total / maxTotal) * 100}%` }}>
                      {total}
                    </div>
                  </div>
                </div>
              ))}
            {winner && (
              <p className="winner">
                🏆 {CHANNEL_LABELS[winner[0]] ?? winner[0]} is your best channel
                so far — double down there first.
              </p>
            )}
            <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <button className="btn small" onClick={optimize} disabled={optBusy}>
                {optBusy ? "🧠 Rewriting…" : "🧠 Rewrite my weakest channel using this data"}
              </button>
              {optResult && (
                <span className="hint">
                  Rewrote {CHANNEL_LABELS[optResult] ?? optResult} — see the
                  hypothesis on its card above.
                </span>
              )}
            </div>
          </>
        )}

        <form onSubmit={logEntry} style={{ marginTop: 12 }}>
          <div className="grid-2">
            <div>
              <label>Channel</label>
              <select name="channel" required defaultValue="twitter">
                {CHANNELS.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
                <option value="telegram">Telegram</option>
                <option value="discord">Discord</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label>Metric</label>
              <select name="metric" defaultValue="installs">
                <option value="installs">Installs</option>
                <option value="clicks">Clicks</option>
                <option value="signups">Signups</option>
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div>
              <label>Count</label>
              <input name="count" type="number" min="0" required placeholder="e.g. 42" />
            </div>
            <div>
              <label>Note (optional)</label>
              <input name="note" maxLength={120} placeholder="e.g. spike after PH feature" />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="btn small" type="submit" disabled={trackBusy}>
              {trackBusy ? "Logging…" : "Log it"}
            </button>
          </div>
        </form>

        {entries.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted)", fontWeight: 650 }}>
              Recent activity
            </span>
            {entries.slice(0, 5).map((en) => (
              <div className="entry-row" key={en.id}>
                <span className="badge">{CHANNEL_LABELS[en.channel] ?? en.channel}</span>
                <span>
                  +{en.count} {en.metric}
                </span>
                {en.note && <span className="hint">· {en.note}</span>}
                <span className="hint" style={{ marginLeft: "auto" }}>
                  {en.logged_on ?? (en.created_at ? String(en.created_at).slice(0, 10) : "")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
