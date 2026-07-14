import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { trackSchema, validate } from "@/lib/validation";

export async function POST(req) {
  try {
    const body = await req.json();
    const { data: input, error: valError } = validate(trackSchema, body);
    if (valError) {
      return NextResponse.json({ error: valError }, { status: 400 });
    }

    const { data, error } = await supabase()
      .from("tracking_entries")
      .insert({
        app_id: input.appId,
        channel: input.channel,
        metric: input.metric,
        count: input.count,
        note: input.note || null,
      })
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ entry: data });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
