// Verifies the Play Store importer against real listings, without the app.
//   node scripts/check-play-import.mjs
//   node scripts/check-play-import.mjs <play-store-url>
const targets = process.argv[2]
  ? [process.argv[2]]
  : [
      "https://play.google.com/store/apps/details?id=com.tinder",
      "https://play.google.com/store/apps/details?id=com.spotify.music",
      "https://play.google.com/store/apps/details?id=com.whatsapp",
    ];

function decodeEntities(str = "") {
  return str.replace(/&amp;/g, "&").replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ");
}

for (const target of targets) {
  const pageUrl = new URL(target);
  if (!pageUrl.searchParams.get("hl")) pageUrl.searchParams.set("hl", "en");
  if (!pageUrl.searchParams.get("gl")) pageUrl.searchParams.set("gl", "US");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
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
    const html = await res.text();
    const meta = (prop) => {
      const m =
        html.match(new RegExp(`<meta[^>]+property="${prop}"[^>]+content="([^"]*)"`, "i")) ||
        html.match(new RegExp(`<meta[^>]+content="([^"]*)"[^>]+property="${prop}"`, "i")) ||
        html.match(new RegExp(`<meta[^>]+name="${prop}"[^>]+content="([^"]*)"`, "i"));
      return m ? decodeEntities(m[1]) : "";
    };
    let name = meta("og:title") || (html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ?? "");
    name = decodeEntities(name)
      .replace(/\s*[-–—]\s*(Apps|Applications|Games)?\s*on Google Play.*$/i, "")
      .replace(/\s*[-–—]\s*Google Play.*$/i, "").trim();
    const genre =
      html.match(/itemprop="genre"[^>]*>([^<]+)</i)?.[1] ||
      html.match(/"applicationCategory"\s*:\s*"([^"]+)"/i)?.[1] || "";
    const shots = [...new Set(html.match(/https:\/\/play-lh\.googleusercontent\.com\/[A-Za-z0-9_\-]+/g) || [])].slice(0, 3);

    console.log(`\n${res.ok ? "OK " : "FAIL"} HTTP ${res.status}  ${target}`);
    console.log(`   name:   ${name || "(EMPTY - parser would fail)"}`);
    console.log(`   genre:  ${genre.trim() || "(none -> 'Other')"}`);
    console.log(`   desc:   ${(meta("og:description") || "").slice(0, 70)}`);
    console.log(`   shots:  ${shots.length}`);
  } catch (e) {
    console.log(`\nFAIL ${target}\n   ${e.name}: ${e.message}`);
  } finally {
    clearTimeout(timeout);
  }
}
