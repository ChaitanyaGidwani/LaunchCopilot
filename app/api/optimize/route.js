import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateJSON } from "@/lib/llm";
import { buildOptimizePrompt, CHANNEL_KEYS } from "@/lib/prompts";
import { optimizeSchema, validate } from "@/lib/validation";

export const maxDuration = 60;

// THE CLOSED LOOP: takes the dev's self-logged per-channel results, finds the
// weakest channel that has generated copy, and rewrites that copy with a
// hypothesis about why it underperformed. Tracking data becomes AI input.
export async function POST(req) {
  try {
    const body = await req.json();
    const { data: input, error: valError } = validate(optimizeSchema, body);
    if (valError) {
      return NextResponse.json({ error: valError }, { status: 400 });
    }

    const db = supabase();
    const [{ data: app }, { data: assets }, { data: entries }] = await Promise.all([
      db.from("apps").select("*").eq("id", input.appId).single(),
      db.from("assets").select("*").eq("app_id", input.appId),
      db.from("tracking_entries").select("*").eq("app_id", input.appId),
    ]);

    if (!app) return NextResponse.json({ error: "App not found" }, { status: 404 });
    if (!entries?.length) {
      return NextResponse.json(
        { error: "Log at least one result per channel first — the optimizer needs data." },
        { status: 400 }
      );
    }
    if (!assets?.length) {
      return NextResponse.json(
        { error: "Generate the launch kit first." },
        { status: 400 }
      );
    }

    // Totals per channel (0 for generated channels with no logged results)
    const totals = {};
    for (const en of entries) totals[en.channel] = (totals[en.channel] ?? 0) + en.count;
    const performance = assets
      .map((a) => ({ channel: a.channel, total: totals[a.channel] ?? 0 }))
      .sort((a, b) => a.total - b.total);

    // Target: explicit channel, else the weakest generated channel
    const target = input.channel && CHANNEL_KEYS.includes(input.channel)
      ? input.channel
      : performance[0].channel;
    const currentAsset = assets.find((a) => a.channel === target);
    if (!currentAsset) {
      return NextResponse.json(
        { error: `No generated copy for channel ${target}` },
        { status: 400 }
      );
    }

    const { system, user } = buildOptimizePrompt(app, target, currentAsset.content, performance);
    const content = await generateJSON({ system, user });

    const { error: upsertErr } = await db
      .from("assets")
      .upsert(
        { app_id: input.appId, channel: target, content, created_at: new Date().toISOString() },
        { onConflict: "app_id,channel" }
      );
    if (upsertErr) throw upsertErr;

    return NextResponse.json({ channel: target, content });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
