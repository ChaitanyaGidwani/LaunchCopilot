"use client";

import { useState } from "react";
import { CHANNELS, CHANNEL_LABELS } from "@/lib/channels";


export function CopyButton({ text, label = "Copy" }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button className={`copy-btn ${copied ? "copied" : ""}`} onClick={copy}>
      {copied ? "Copied ✓" : label}
    </button>
  );
}

function Field({ label, text, showCount }) {
  if (!text) return null;
  return (
    <div className="asset-field">
      <div className="field-head">
        <span className="field-label">
          {label}
          {showCount && <span className="char-count"> · {text.length} chars</span>}
        </span>
        <CopyButton text={text} />
      </div>
      <pre>{text}</pre>
    </div>
  );
}

function Note({ text }) {
  if (!text) return null;
  return <p className="hint">💡 {text}</p>;
}

// "Why this works" — the platform rules this copy deliberately follows.
// Makes the channel-aware reasoning VISIBLE instead of implied.
function Conventions({ items }) {
  if (!items?.length) return null;
  return (
    <div className="chips">
      {items.map((c, i) => (
        <span className="chip" key={i}>✓ {c}</span>
      ))}
    </div>
  );
}

// Shown when this asset was rewritten by the optimizer using tracking data.
function OptimizationBox({ content }) {
  if (!content.optimization_hypothesis) return null;
  return (
    <div className="opt-box">
      <strong>🧠 Optimized from your launch data</strong>
      <p>{content.optimization_hypothesis}</p>
      {(content.changes_made ?? []).map((c, i) => (
        <div className="plan-task" key={i}>
          <span>→</span>
          <span>{c}</span>
        </div>
      ))}
    </div>
  );
}

function ChannelFields({ channel, content }) {
  switch (channel) {
    case "aso":
      return (
        <>
          <Field label="Title" text={content.title} showCount />
          <Field label="Subtitle" text={content.subtitle} showCount />
          <Field label="Keyword field" text={content.keyword_field} showCount />
          <Field label="Description" text={content.description} />
          <Note text={content.aso_rationale} />
        </>
      );
    case "twitter":
      return (
        <>
          {(content.tweets ?? []).map((t, i) => (
            <Field key={i} label={`Tweet ${i + 1}`} text={t} showCount />
          ))}
          <Field label="Full thread" text={(content.tweets ?? []).join("\n\n")} />
          <Note text={content.posting_tip} />
        </>
      );
    case "linkedin":
      return (
        <>
          <Field label="Post" text={content.post} />
          <Note text={content.posting_tip} />
        </>
      );
    case "product_hunt":
      return (
        <>
          <Field label="Tagline" text={content.tagline} showCount />
          <Field label="First comment (maker's comment)" text={content.first_comment} />
          <Note text={content.launch_tip} />
        </>
      );
    case "reddit":
      return (
        <>
          <Field label="Subreddit" text={content.subreddit} />
          <Note text={content.subreddit_rationale} />
          <Field label="Post title" text={content.title} />
          <Field label="Post body" text={content.body} />
          <Note text={content.rules_warning} />
        </>
      );
    default:
      return <pre>{JSON.stringify(content, null, 2)}</pre>;
  }
}

// Plain-text export of a whole asset — used by the per-channel "Copy all" button.
export function assetToText(channel, content) {
  switch (channel) {
    case "aso":
      return [
        `TITLE: ${content.title}`,
        `SUBTITLE: ${content.subtitle}`,
        `KEYWORDS: ${content.keyword_field}`,
        `DESCRIPTION:\n${content.description}`,
      ].filter(Boolean).join("\n\n");
    case "twitter":
      return (content.tweets ?? []).join("\n\n");
    case "linkedin":
      return content.post ?? "";
    case "product_hunt":
      return [`TAGLINE: ${content.tagline}`, `FIRST COMMENT:\n${content.first_comment}`]
        .filter(Boolean).join("\n\n");
    case "reddit":
      return [
        `SUBREDDIT: ${content.subreddit}`,
        `TITLE: ${content.title}`,
        `BODY:\n${content.body}`,
      ].filter(Boolean).join("\n\n");
    default:
      return JSON.stringify(content, null, 2);
  }
}

// Per-channel renderers — each asset's structure mirrors its platform
export function AssetBody({ channel, content }) {
  return (
    <>
      <OptimizationBox content={content} />
      <Conventions items={content.conventions_applied} />
      <ChannelFields channel={channel} content={content} />
    </>
  );
}
