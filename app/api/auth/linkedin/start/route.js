import { NextResponse } from "next/server";
import crypto from "node:crypto";

// Kicks off LinkedIn's OAuth 2.0 consent flow (Consumer tier — Sign In with
// LinkedIn + Share on LinkedIn, both self-serve, no app review needed).
// `state` carries the appId we should bounce back to after consent, so the
// dashboard reopens where the user started the connection.
export async function GET(req) {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "LinkedIn is not configured. Add LINKEDIN_CLIENT_ID/SECRET to .env.local (see .env.example)." },
      { status: 400 }
    );
  }

  const { searchParams, origin } = new URL(req.url);
  const appId = searchParams.get("appId") || "";
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI || `${origin}/api/auth/linkedin/callback`;
  const state = Buffer.from(
    JSON.stringify({ appId, nonce: crypto.randomBytes(8).toString("hex") })
  ).toString("base64url");

  const authUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  // openid + profile: read the member id back via /v2/userinfo.
  // w_member_social: post on the authenticated member's behalf.
  authUrl.searchParams.set("scope", "openid profile w_member_social");
  authUrl.searchParams.set("state", state);

  return NextResponse.redirect(authUrl.toString());
}
