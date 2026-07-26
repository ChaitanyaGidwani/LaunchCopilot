import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { publish } from "@/lib/publishers";

export const maxDuration = 60;

// THE AUTOPILOT HEARTBEAT. Vercel Cron calls GET daily (see vercel.json);
// the dashboard's "Run due posts" button calls POST for on-demand execution.
// Publishes every queued post whose scheduled time has arrived.
async function runDuePosts() {
  const db = supabase();
  // APPROVAL GATE: autopilot only ever publishes posts a human has approved.
  // Unapproved posts stay queued indefinitely — no surprise posting, which is
  // also what keeps accounts out of spam/ban territory.
  const { data: due } = await db
    .from("scheduled_posts")
    .select("*")
    .eq("status", "queued")
    .eq("approved", true)
    .lte("scheduled_for", new Date().toISOString())
    .limit(10);

  const results = [];
  const seenChannels = new Set();
  for (const post of due ?? []) {
    // RATE LIMIT: at most one post per channel per run, and a courtesy gap
    // between calls so we never burst a platform's API.
    if (seenChannels.has(post.channel)) continue;
    seenChannels.add(post.channel);
    if (results.length > 0) await new Promise((r) => setTimeout(r, 2000));
    const [{ data: app }, { data: assetRows }] = await Promise.all([
      db.from("apps").select("*").eq("id", post.app_id).single(),
      db.from("assets").select("*").eq("app_id", post.app_id),
    ]);
    const assets = Object.fromEntries((assetRows ?? []).map((a) => [a.channel, a.content]));

    let update;
    try {
      const { url } = await publish(post.channel, app, assets);
      update = { status: "published", result_url: url, error: null };
    } catch (e) {
      update = { status: "failed", error: e.message };
    }
    await db.from("scheduled_posts").update(update).eq("id", post.id);
    results.push({ channel: post.channel, ...update });
  }
  return results;
}

// Vercel Cron (requires CRON_SECRET when set)
export async function GET(req) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const results = await runDuePosts();
    return NextResponse.json({ ran: results.length, results });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Dashboard "Run due posts" button
export async function POST() {
  try {
    const results = await runDuePosts();
    return NextResponse.json({ ran: results.length, results });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
