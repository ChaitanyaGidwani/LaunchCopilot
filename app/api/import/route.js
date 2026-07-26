import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateJSON } from "@/lib/llm";
import { buildImportPrompt } from "@/lib/prompts";
import { getAccount, getAppCount, FREE_APP_LIMIT } from "@/lib/account";

export const maxDuration = 60;

// Store listings are HTML-escaped; unescape before we hand text to the model.
function decodeEntities(str = "") {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

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
    // Play has no public lookup API, so we read the listing page. It is heavy
    // and geo/consent sensitive, so: real browser UA, forced locale, and a
    // hard timeout — otherwise the browser just reports "Load failed".
    const pageUrl = new URL(storeUrl);
    if (!pageUrl.searchParams.get("hl")) pageUrl.searchParams.set("hl", "en");
    if (!pageUrl.searchParams.get("gl")) pageUrl.searchParams.set("gl", "US");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let html;
    try {
      const res = await fetch(pageUrl.toString(), {
        signal: controller.signal,
        headers: {
          "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
          "accept-language": "en-US,en;q=0.9",
          accept: "text/html,application/xhtml+xml",
        },
      });
      if (!res.ok) {
        throw new Error(`Google Play returned ${res.status} for that link.`);
      }
      html = await res.text();
    } catch (e) {
      if (e.name === "AbortError") {
        throw new Error("Google Play took too long to respond. Try again, or paste the App Store link.");
      }
      throw new Error(`Couldn't reach Google Play: ${e.message}`);
    } finally {
      clearTimeout(timeout);
    }

    const meta = (prop) => {
      const m =
        html.match(new RegExp(`<meta[^>]+property="${prop}"[^>]+content="([^"]*)"`, "i")) ||
        html.match(new RegExp(`<meta[^>]+content="([^"]*)"[^>]+property="${prop}"`, "i")) ||
        html.match(new RegExp(`<meta[^>]+name="${prop}"[^>]+content="([^"]*)"`, "i"));
      return m ? decodeEntities(m[1]) : "";
    };

    // og:title is the reliable one, but fall back to <title> and itemprop.
    let rawTitle =
      meta("og:title") ||
      (html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ?? "") ||
      (html.match(/itemprop="name"[^>]*>\s*<[^>]*>([^<]+)</i)?.[1] ?? "");
    rawTitle = decodeEntities(rawTitle).trim();
    if (!rawTitle) {
      throw new Error(
        "Couldn't read that Play Store listing (Google may have served a consent page). Paste the App Store link, or add the app manually."
      );
    }

    const genre =
      html.match(/itemprop="genre"[^>]*>([^<]+)</i)?.[1] ||
      html.match(/"applicationCategory"\s*:\s*"([^"]+)"/i)?.[1] ||
      "";

    // Play embeds screenshots as play-lh.googleusercontent.com URLs.
    const shots = [...new Set(
      (html.match(/https:\/\/play-lh\.googleusercontent\.com\/[A-Za-z0-9_\-]+/g) || [])
    )].slice(0, 3);

    const ogImage = meta("og:image");
    return {
      name: rawTitle
        .replace(/\s*[-–—]\s*(Apps|Applications|Games)?\s*on Google Play.*$/i, "")
        .replace(/\s*[-–—]\s*Google Play.*$/i, "")
        .trim(),
      description: meta("og:description") || meta("description"),
      category: genre.trim() || "Other",
      screenshots: shots.length ? shots : ogImage ? [ogImage] : [],
      store_link: pageUrl.toString(),
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
