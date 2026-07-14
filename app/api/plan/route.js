import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateJSON } from "@/lib/llm";
import { buildPlanPrompt } from "@/lib/prompts";
import { planSchema, validate } from "@/lib/validation";

export const maxDuration = 60;

export async function POST(req) {
  try {
    const body = await req.json();
    const { data: input, error: valError } = validate(planSchema, body);
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

    const { system, user } = buildPlanPrompt(app);
    const result = await generateJSON({ system, user });
    const days = result.days ?? [];

    const { error: upsertErr } = await db
      .from("plans")
      .upsert(
        { app_id: input.appId, days, created_at: new Date().toISOString() },
        { onConflict: "app_id" }
      );
    if (upsertErr) throw upsertErr;

    return NextResponse.json({ days });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
