import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateJSON } from "@/lib/llm";
import { buildImportPrompt } from "@/lib/prompts";
import { getAccount, getAppCount, FREE_APP_LIMIT } from "@/lib/account";

export const maxDuration = 60;

// ONE-LINK INTAKE: paste an App Store / Play Store URL, get a ready app.
// Apple: official iTunes Lookup API. Google Play: og: meta tags.
async function fetchStoreListing(storeUrl) {
  const url = new URL(storeUrl);

  if (url.hostname.includes("apps.apple.com")) {
    const idMatch = url.pathname.match(/id(\d+)/);
    if (!idMatch) throw new Error("Couldn't find the app id in that App Store link.");
    const res = await fetch(`https://itunes.apple.com/lookup?id=${idMatch[1]}`);
    const data = await res.json();
    const r = data.results?.[0];
    if (!r) throw new Error("Apple couldn't find that app. Check the link.");
    return {
      name: r.trackName,
      description: r.description || "",
      category: r.primaryGenreName || "Other",
      screenshots: (r.screenshotUrls || []).slice(0, 3),
      store_link: r.trackViewUrl || storeUrl,
    };
  }

  if (url.hostname.includes("play.google.com")) {
    const res = await fetch(storeUrl, {
      headers: { "user-agent": "Mozilla/5.0 (LaunchCopilot importer)" },
    });
    const html = await res.text();
    const meta = (prop) => {
      const m = html.match(
        new RegExp(`<meta[^>]+property="${prop}"[^>]+content="([^"]*)"`, "i")
      ) || html.match(new RegExp(`<meta[^>]+content="([^"]*)"[^>]+property="${prop}"`, "i"));
      return m ? m[1] : "";
    };
    const rawTitle = meta("og:title");
    if (!rawTitle) throw new Error("Couldn't read that Play Store page. Check the link.");
    const genreMatch = html.match(/itemprop="genre"[^>]*>([^<]+)</i);
    return {
      name: rawTitle.replace(/\s*[-–]\s*(Apps|Applications) on Google Play.*$/i, "").trim(),
      description: meta("og:description"),
      category: genreMatch ? genreMatch[1].trim() : "Other",
      screenshots: meta("og:image") ? [meta("og:image")] : [],
      store_link: storeUrl,
    };
  }

  throw new Error("Paste an App Store (apps.apple.com) or Play Store (play.google.com) link.");
}

export async function POST(req) {
  try {
    const { storeUrl } = await req.json();
    if (!storeUrl || !/^https?:\/\//.test(storeUrl)) {
      return NextResponse.json({ error: "A valid store URL is required" }, { status: 400 });
    }

    const db = supabase();

    // Freemium paywall — same rule as manual intake
    const account = await getAccount(db);
    if (account.plan !== "pro") {
      const appCount = await getAppCount(db);
      if (appCount >= FREE_APP_LIMIT) {
        return NextResponse.json(
          {
            error: "Your free launch kit is used. Upgrade to Pro (₹499/mo) for unlimited apps.",
            code: "UPGRADE_REQUIRED",
          },
          { status: 402 }
        );
      }
    }

    const listing = await fetchStoreListing(storeUrl.trim());

    // AI distills the raw listing into the marketing inputs the kit needs
    const { system, user } = buildImportPrompt(listing);
    const distilled = await generateJSON({ system, user, maxTokens: 1000 });

    const { data, error } = await db
      .from("apps")
      .insert({
        name: listing.name.slice(0, 60),
        category: listing.category.slice(0, 40),
        pitch: (distilled.pitch || listing.description.slice(0, 140)).slice(0, 140),
        target_user: (distilled.target_user || "People browsing the app store").slice(0, 140),
        tone: (distilled.tone || null)?.slice?.(0, 60) ?? null,
        store_link: listing.store_link,
        screenshot_urls: listing.screenshots,
      })
      .select("id")
      .single();
    if (error) throw error;

    return NextResponse.json({ id: data.id });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
