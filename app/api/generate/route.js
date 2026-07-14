import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateJSON } from "@/lib/llm";
import { buildChannelPrompt } from "@/lib/prompts";
import { generateSchema, validate } from "@/lib/validation";

export const maxDuration = 60;

export async function POST(req) {
  try {
    const body = await req.json();
    const { data: input, error: valError } = validate(generateSchema, body);
    if (valError) {
      return NextResponse.json({ error: valError }, { status: 400 });
    }

    const db = supabase();
    const { data: app, error: appErr } = await db
      .from("apps")
      .select("*")
      .eq("id", input.appId)
      .single();
    if (appErr || !app) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    const { system, user } = buildChannelPrompt(input.channel, app);
    const content = await generateJSON({ system, user });

    // Regeneration replaces the existing asset for this channel
    const { error: upsertErr } = await db
      .from("assets")
      .upsert(
        { app_id: input.appId, channel: input.channel, content, created_at: new Date().toISOString() },
        { onConflict: "app_id,channel" }
      );
    if (upsertErr) throw upsertErr;

    return NextResponse.json({ channel: input.channel, content });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
