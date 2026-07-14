import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { publish, PUBLISHABLE_CHANNELS } from "@/lib/publishers";

export const maxDuration = 60;

// Publish one channel's generated copy to the real platform, right now.
export async function POST(req) {
  try {
    const { appId, channel } = await req.json();
    if (!appId || !PUBLISHABLE_CHANNELS.includes(channel)) {
      return NextResponse.json(
        { error: `appId and a publishable channel (${PUBLISHABLE_CHANNELS.join(", ")}) are required` },
        { status: 400 }
      );
    }

    const db = supabase();
    const [{ data: app }, { data: assetRows }] = await Promise.all([
      db.from("apps").select("*").eq("id", appId).single(),
      db.from("assets").select("*").eq("app_id", appId),
    ]);
    if (!app) return NextResponse.json({ error: "App not found" }, { status: 404 });

    const assets = Object.fromEntries((assetRows ?? []).map((a) => [a.channel, a.content]));

    let row;
    try {
      const { url } = await publish(channel, app, assets);
      row = { app_id: appId, channel, status: "published", result_url: url, error: null, scheduled_for: new Date().toISOString() };
    } catch (e) {
      row = { app_id: appId, channel, status: "failed", result_url: null, error: e.message, scheduled_for: new Date().toISOString() };
    }

    const { data: saved, error: upErr } = await db
      .from("scheduled_posts")
      .upsert(row, { onConflict: "app_id,channel" })
      .select("*")
      .single();
    if (upErr) throw upErr;

    if (saved.status === "failed") {
      return NextResponse.json({ error: saved.error, post: saved }, { status: 502 });
    }
    return NextResponse.json({ post: saved });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
