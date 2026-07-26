import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Human approval for a queued post. Autopilot will not publish anything that
// has not passed through here — reviewed content only.
export async function POST(req) {
  try {
    const { postId, approved } = await req.json();
    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }
    const isApproved = approved !== false;

    const { data, error } = await supabase()
      .from("scheduled_posts")
      .update({
        approved: isApproved,
        approved_at: isApproved ? new Date().toISOString() : null,
      })
      .eq("id", postId)
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ post: data });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
