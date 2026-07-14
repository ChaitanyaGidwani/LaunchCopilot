import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { configuredChannels } from "@/lib/publishers";

// Builds the launch autopilot queue: every configured publisher gets a post
// scheduled on the day the 7-day plan says that channel should fire.
export async function POST(req) {
  try {
    const { appId } = await req.json();
    if (!appId) return NextResponse.json({ error: "appId is required" }, { status: 400 });

    const db = supabase();
    const [{ data: app }, { data: planRow }, { data: assetRows }, { data: existing }] =
      await Promise.all([
        db.from("apps").select("*").eq("id", appId).single(),
        db.from("plans").select("*").eq("app_id", appId).maybeSingle(),
        db.from("assets").select("channel").eq("app_id", appId),
        db.from("scheduled_posts").select("*").eq("app_id", appId),
      ]);
    if (!app) return NextResponse.json({ error: "App not found" }, { status: 404 });

    const configured = await configuredChannels();
    if (!configured.length) {
      return NextResponse.json(
        { error: "No publishers configured. Add Reddit / Telegram / X / LinkedIn / Discord keys to .env.local (see .env.example) and restart." },
        { status: 400 }
      );
    }

    const haveAssets = new Set((assetRows ?? []).map((a) => a.channel));
    const alreadyPublished = new Set(
      (existing ?? []).filter((p) => p.status === "published").map((p) => p.channel)
    );

    // Which plan day does each channel fire on? (default day 1)
    const dayFor = {};
    for (const d of planRow?.days ?? []) {
      for (const t of d.tasks ?? []) {
        if (t.channel && dayFor[t.channel] === undefined) dayFor[t.channel] = d.day;
      }
    }

    // Channels whose copy comes from generated assets need the asset first —
    // Telegram/Discord compose their own announcement from whatever assets
    // already exist, so they're exempt.
    const NEEDS_GENERATED_ASSET = new Set(["twitter", "reddit", "linkedin"]);

    const rows = [];
    for (const channel of configured) {
      if (alreadyPublished.has(channel)) continue;
      if (NEEDS_GENERATED_ASSET.has(channel) && !haveAssets.has(channel)) continue;
      const day = dayFor[channel] ?? 1;
      const when = new Date();
      when.setDate(when.getDate() + (day - 1));
      when.setHours(9, 0, 0, 0);
      if (when < new Date()) when.setTime(Date.now()); // day 1 = now
      rows.push({
        app_id: appId,
        channel,
        status: "queued",
        scheduled_for: when.toISOString(),
        result_url: null,
        error: null,
      });
    }

    if (rows.length) {
      const { error: upErr } = await db
        .from("scheduled_posts")
        .upsert(rows, { onConflict: "app_id,channel" });
      if (upErr) throw upErr;
    }

    const { data: queue } = await db
      .from("scheduled_posts")
      .select("*")
      .eq("app_id", appId)
      .order("scheduled_for", { ascending: true });

    return NextResponse.json({ queue: queue ?? [], configured });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const appId = new URL(req.url).searchParams.get("appId");
    if (!appId) return NextResponse.json({ error: "appId is required" }, { status: 400 });
    const { data: queue } = await supabase()
      .from("scheduled_posts")
      .select("*")
      .eq("app_id", appId)
      .order("scheduled_for", { ascending: true });
    return NextResponse.json({ queue: queue ?? [] });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
