import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// LinkedIn redirects here after the member approves (or denies) the consent
// screen. Exchanges the code for an access token, reads the member's id via
// OpenID userinfo, and stores both on the singleton account row so
// lib/publishers.js can post on their behalf later (autopilot or "Publish live").
export async function GET(req) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error_description") || searchParams.get("error");
  const stateRaw = searchParams.get("state");

  let appId = "";
  try {
    const state = JSON.parse(Buffer.from(stateRaw || "", "base64url").toString());
    appId = state.appId || "";
  } catch {
    // malformed/missing state — fall back to the pricing page
  }
  const backTo = appId ? `/app/${appId}` : "/pricing";

  if (oauthError) {
    return NextResponse.redirect(`${origin}${backTo}?linkedin=error&msg=${encodeURIComponent(oauthError)}`);
  }
  if (!code) {
    return NextResponse.redirect(`${origin}${backTo}?linkedin=error&msg=${encodeURIComponent("LinkedIn didn't return an authorization code.")}`);
  }

  try {
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI || `${origin}/api/auth/linkedin/callback`;
    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      throw new Error(tokenData.error_description || "LinkedIn did not return an access token.");
    }

    const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json();
    if (!profile.sub) {
      throw new Error("Couldn't read your LinkedIn member id from the profile response.");
    }

    // LinkedIn access tokens are typically valid ~60 days; expires_in comes
    // back in seconds. Fall back to 60 days if it's ever missing.
    const expiresAt = new Date(Date.now() + (tokenData.expires_in ?? 60 * 24 * 60 * 60) * 1000).toISOString();

    const db = supabase();
    const { error: upErr } = await db
      .from("account")
      .update({
        linkedin_access_token: tokenData.access_token,
        linkedin_member_urn: `urn:li:person:${profile.sub}`,
        linkedin_token_expires_at: expiresAt,
        linkedin_connected_at: new Date().toISOString(),
      })
      .eq("id", 1);
    if (upErr) throw upErr;

    return NextResponse.redirect(`${origin}${backTo}?linkedin=connected`);
  } catch (e) {
    return NextResponse.redirect(`${origin}${backTo}?linkedin=error&msg=${encodeURIComponent(e.message)}`);
  }
}
