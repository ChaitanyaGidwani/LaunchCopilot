import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createAppSchema, validate } from "@/lib/validation";
import { getAccount, getAppCount, FREE_APP_LIMIT } from "@/lib/account";

export async function POST(req) {
  try {
    const form = await req.formData();
    const raw = {
      name: form.get("name")?.toString() ?? "",
      category: form.get("category")?.toString() ?? "",
      pitch: form.get("pitch")?.toString() ?? "",
      target_user: form.get("target_user")?.toString() ?? "",
      tone: form.get("tone")?.toString() || null,
      store_link: form.get("store_link")?.toString() || null,
    };

    const { data: fields, error: valError } = validate(createAppSchema, raw);
    if (valError) {
      return NextResponse.json({ error: valError }, { status: 400 });
    }

    const db = supabase();

    // FREEMIUM PAYWALL: free plan includes exactly 1 launch kit.
    const account = await getAccount(db);
    if (account.plan !== "pro") {
      const appCount = await getAppCount(db);
      if (appCount >= FREE_APP_LIMIT) {
        return NextResponse.json(
          {
            error:
              "Your free launch kit is used. Upgrade to Pro (₹499/mo) for unlimited apps, copy regeneration, and multi-app tracking.",
            code: "UPGRADE_REQUIRED",
          },
          { status: 402 }
        );
      }
    }

    // Upload up to 3 screenshots to the public bucket (in parallel)
    const files = form.getAll("screenshots").filter((f) => f && f.size > 0);
    const uploadResults = await Promise.allSettled(
      files.slice(0, 3).map(async (file) => {
        const ext = (file.name?.split(".").pop() || "png").toLowerCase();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await db.storage
          .from("screenshots")
          .upload(path, file, { contentType: file.type || "image/png" });
        if (upErr) throw upErr;
        const { data } = db.storage.from("screenshots").getPublicUrl(path);
        return data.publicUrl;
      })
    );
    const screenshot_urls = uploadResults
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value);

    const { data, error } = await db
      .from("apps")
      .insert({
        name: fields.name,
        category: fields.category,
        pitch: fields.pitch,
        target_user: fields.target_user,
        tone: fields.tone,
        store_link: fields.store_link || null,
        screenshot_urls,
      })
      .select("id")
      .single();

    if (error) throw error;
    return NextResponse.json({ id: data.id });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
