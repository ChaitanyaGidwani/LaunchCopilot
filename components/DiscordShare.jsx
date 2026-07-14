"use client";

import { useState } from "react";

// One-click Discord post — turns every generated kit into community validation.
export default function DiscordShare({ appName, tagline }) {
  const [copied, setCopied] = useState(false);

  const text = [
    `🚀 Just generated the entire launch kit for **${appName}** with LaunchCopilot — ASO copy, X thread, LinkedIn post, Product Hunt pitch, and a Reddit post that won't get removed, each written for that platform's actual conventions. Plus a 7-day promotion plan.`,
    tagline ? `\nThe PH tagline it wrote: "${tagline}"` : "",
    `\nRun your own app through it and roast the output 👇`,
    typeof window !== "undefined" ? window.location.href : "",
  ]
    .filter(Boolean)
    .join("\n");

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="card subtle" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <span className="hint" style={{ margin: 0 }}>
        Show your community what you&apos;re launching — share this kit.
      </span>
      <button className="btn small" onClick={copy}>
        {copied ? "Copied ✓" : "💬 Copy share post"}
      </button>
    </div>
  );
}
