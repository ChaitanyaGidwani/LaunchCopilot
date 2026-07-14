// ============================================================================
// THE PUBLISHER ENGINE — LaunchCopilot doesn't just write your launch, it
// SHIPS it. Each publisher takes generated copy and creates a real, live post
// via that platform's API, returning the public URL.
//
// Most publishers are configured entirely by env vars (Reddit, Telegram, X,
// Discord). LinkedIn is the exception: LinkedIn requires a real per-member
// OAuth grant (w_member_social) to post on someone's behalf — there's no
// static API key — so its "configured" state also depends on a token stored
// in Supabase (see /api/auth/linkedin/*). That's why configuredChannels() is
// async: every other publisher answers instantly from env, LinkedIn needs a
// DB round-trip to check the token is present and unexpired.
// ============================================================================

import crypto from "node:crypto";
import { supabase } from "./supabase";

const UA = "LaunchCopilot/1.0 (indie app launch autopilot)";

function link(app) {
  return app.store_link || "";
}

function fillLink(text, app) {
  return (text || "").replaceAll("[STORE_LINK]", link(app)).trim();
}

// ---------------------------------------------------------------------------
// Reddit — script-app password grant (reddit.com/prefs/apps → "script")
// ---------------------------------------------------------------------------
async function redditToken() {
  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      authorization:
        "Basic " +
        Buffer.from(
          `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`
        ).toString("base64"),
      "content-type": "application/x-www-form-urlencoded",
      "user-agent": UA,
    },
    body: new URLSearchParams({
      grant_type: "password",
      username: process.env.REDDIT_USERNAME,
      password: process.env.REDDIT_PASSWORD,
    }),
  });
  const data = await res.json();
  if (!data.access_token) {
    throw new Error("Reddit auth failed: " + JSON.stringify(data).slice(0, 200));
  }
  return data.access_token;
}

async function publishReddit(app, assets) {
  const content = assets.reddit;
  if (!content) throw new Error("Generate the Reddit copy first.");
  // Safety: post to YOUR configured subreddit (e.g. a test sub or your app's
  // own community) — never spam the AI-suggested sub without reading its rules.
  const sr = (process.env.REDDIT_SUBREDDIT || "").replace(/^r\//, "");
  if (!sr) throw new Error("Set REDDIT_SUBREDDIT in .env.local (e.g. your test subreddit).");

  const token = await redditToken();
  const res = await fetch("https://oauth.reddit.com/api/submit", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/x-www-form-urlencoded",
      "user-agent": UA,
    },
    body: new URLSearchParams({
      sr,
      kind: "self",
      title: content.title,
      text: fillLink(content.body, app),
      api_type: "json",
    }),
  });
  const data = await res.json();
  const errors = data?.json?.errors;
  if (errors?.length) throw new Error("Reddit rejected the post: " + JSON.stringify(errors));
  const url = data?.json?.data?.url;
  if (!url) throw new Error("Reddit did not return a post URL: " + JSON.stringify(data).slice(0, 200));
  return { url };
}

// ---------------------------------------------------------------------------
// Telegram — bot posts the launch announcement to your channel
// ---------------------------------------------------------------------------
async function publishTelegram(app, assets) {
  const tagline = assets.product_hunt?.tagline;
  const hook = assets.twitter?.tweets?.[0];
  const text = [
    `🚀 ${app.name} just launched!`,
    tagline ? `\n${tagline}` : `\n${app.pitch}`,
    hook ? `\n${fillLink(hook, app)}` : "",
    link(app) ? `\n${link(app)}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) throw new Error("TELEGRAM_BOT_TOKEN is not set in .env.local");

  let chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId) {
    try {
      const updatesRes = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`);
      const updatesData = await updatesRes.json();
      if (updatesData?.ok && updatesData?.result?.length) {
        for (let i = updatesData.result.length - 1; i >= 0; i--) {
          const u = updatesData.result[i];
          const cid =
            u.channel_post?.chat?.id ||
            u.message?.chat?.id ||
            u.my_chat_member?.chat?.id ||
            u.callback_query?.message?.chat?.id;
          if (cid) {
            chatId = cid;
            break;
          }
        }
      }
    } catch (err) {
      // Fall through to error check below
    }
  }

  if (!chatId) {
    throw new Error(
      "Telegram chat ID not set. Either add TELEGRAM_CHAT_ID=@yourchannel (or numeric ID) to .env.local, or send a message / add @launch2bot as admin to your Telegram channel first so it can auto-detect the chat."
    );
  }

  const res = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    }
  );
  const data = await res.json();
  if (!data.ok) throw new Error("Telegram error: " + (data.description || res.status));
  const chat = data.result?.chat;
  const url = chat?.username
    ? `https://t.me/${chat.username}/${data.result.message_id}`
    : `https://t.me/c/${String(chat?.id || "").replace(/^-100/, "")}/${data.result.message_id || ""}`;
  return { url };
}

// ---------------------------------------------------------------------------
// X / Twitter — OAuth 1.0a user context, posts the whole thread
// ---------------------------------------------------------------------------
function oauth1Header(method, url, tokens) {
  const oauth = {
    oauth_consumer_key: tokens.appKey,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: tokens.accessToken,
    oauth_version: "1.0",
  };
  const enc = encodeURIComponent;
  const paramString = Object.keys(oauth)
    .sort()
    .map((k) => `${enc(k)}=${enc(oauth[k])}`)
    .join("&");
  const base = [method.toUpperCase(), enc(url), enc(paramString)].join("&");
  const signingKey = `${enc(tokens.appSecret)}&${enc(tokens.accessSecret)}`;
  oauth.oauth_signature = crypto.createHmac("sha1", signingKey).update(base).digest("base64");
  return (
    "OAuth " +
    Object.keys(oauth)
      .sort()
      .map((k) => `${enc(k)}="${enc(oauth[k])}"`)
      .join(", ")
  );
}

async function publishTwitter(app, assets) {
  const content = assets.twitter;
  if (!content?.tweets?.length) throw new Error("Generate the X thread first.");
  const tokens = {
    appKey: process.env.TWITTER_APP_KEY,
    appSecret: process.env.TWITTER_APP_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
  };
  const url = "https://api.twitter.com/2/tweets";
  let firstId = null;
  let replyTo = null;

  for (const raw of content.tweets) {
    const body = { text: fillLink(raw, app) };
    if (replyTo) body.reply = { in_reply_to_tweet_id: replyTo };
    const res = await fetch(url, {
      method: "POST",
      headers: {
        authorization: oauth1Header("POST", url, tokens),
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    const id = data?.data?.id;
    if (!id) throw new Error(`X API error ${res.status}: ${JSON.stringify(data).slice(0, 200)}`);
    if (!firstId) firstId = id;
    replyTo = id;
  }
  return { url: `https://x.com/i/web/status/${firstId}` };
}

// ---------------------------------------------------------------------------
// LinkedIn — real OAuth 2.0 user grant (w_member_social), posts as the member
// ---------------------------------------------------------------------------
// Unlike Reddit/Telegram/X, LinkedIn has no "generate a static key and go"
// option — Share on LinkedIn requires the member to explicitly authorize your
// app (self-serve, no review needed for personal-profile posting), and the
// resulting access token is what lets you post. See app/api/auth/linkedin/*.
function linkedInEnvReady() {
  return !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET);
}

async function getAccountRow() {
  const db = supabase();
  const { data } = await db.from("account").select("*").eq("id", 1).maybeSingle();
  return data;
}

function linkedInTokenValid(account) {
  if (!account?.linkedin_access_token || !account?.linkedin_member_urn) return false;
  if (account.linkedin_token_expires_at && new Date(account.linkedin_token_expires_at) <= new Date()) {
    return false;
  }
  return true;
}

async function linkedInIsConfigured() {
  if (!linkedInEnvReady()) return false;
  try {
    return linkedInTokenValid(await getAccountRow());
  } catch {
    return false;
  }
}

async function publishLinkedIn(app, assets) {
  const content = assets.linkedin;
  if (!content?.post) throw new Error("Generate the LinkedIn copy first.");

  const account = await getAccountRow();
  if (!linkedInTokenValid(account)) {
    throw new Error(
      "LinkedIn isn't connected (or the connection expired) — reconnect it from the autopilot panel."
    );
  }

  const res = await fetch("https://api.linkedin.com/rest/posts", {
    method: "POST",
    headers: {
      authorization: `Bearer ${account.linkedin_access_token}`,
      "content-type": "application/json",
      "LinkedIn-Version": "202506",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author: account.linkedin_member_urn,
      commentary: fillLink(content.post, app),
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`LinkedIn API error ${res.status}: ${errText.slice(0, 200)}`);
  }
  // Posts API returns the created post's URN in a header, not the body.
  const postUrn = res.headers.get("x-restli-id");
  const url = postUrn
    ? `https://www.linkedin.com/feed/update/${postUrn}/`
    : "https://www.linkedin.com/feed/";
  return { url };
}

// ---------------------------------------------------------------------------
// Discord — incoming webhook, no OAuth needed (self-serve, instant)
// ---------------------------------------------------------------------------
async function publishDiscord(app, assets) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) throw new Error("DISCORD_WEBHOOK_URL is not set in .env.local");

  const tagline = assets.product_hunt?.tagline;
  const hook = assets.twitter?.tweets?.[0];
  const content = [
    `🚀 **${app.name}** just launched!`,
    tagline ? tagline : app.pitch,
    hook ? fillLink(hook, app) : "",
    link(app) ? link(app) : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const res = await fetch(`${webhookUrl}${webhookUrl.includes("?") ? "&" : "?"}wait=true`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Discord webhook error ${res.status}: ${errText.slice(0, 200)}`);
  }
  const data = await res.json().catch(() => null);
  // ?wait=true returns the created message; build a jump link if we have the
  // ids, otherwise just point at the channel.
  const url =
    data?.id && data?.channel_id
      ? `https://discord.com/channels/${data.guild_id ?? "@me"}/${data.channel_id}/${data.id}`
      : null;
  return { url: url ?? "https://discord.com" };
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------
const PUBLISHERS = {
  reddit: {
    label: "Reddit",
    isConfigured: () =>
      !!(
        process.env.REDDIT_CLIENT_ID &&
        process.env.REDDIT_CLIENT_SECRET &&
        process.env.REDDIT_USERNAME &&
        process.env.REDDIT_PASSWORD &&
        process.env.REDDIT_SUBREDDIT
      ),
    publish: publishReddit,
  },
  telegram: {
    label: "Telegram",
    isConfigured: () => !!process.env.TELEGRAM_BOT_TOKEN,
    publish: publishTelegram,
  },
  twitter: {
    label: "X / Twitter",
    isConfigured: () =>
      !!(
        process.env.TWITTER_APP_KEY &&
        process.env.TWITTER_APP_SECRET &&
        process.env.TWITTER_ACCESS_TOKEN &&
        process.env.TWITTER_ACCESS_SECRET
      ),
    publish: publishTwitter,
  },
  linkedin: {
    label: "LinkedIn",
    isConfigured: linkedInIsConfigured, // async — checks env AND a live DB token
    publish: publishLinkedIn,
  },
  discord: {
    label: "Discord",
    isConfigured: () => !!process.env.DISCORD_WEBHOOK_URL,
    publish: publishDiscord,
  },
};

export const PUBLISHABLE_CHANNELS = Object.keys(PUBLISHERS);

// Every other publisher's isConfigured() is sync (reads env only); LinkedIn's
// is async (reads env + a Supabase token). Awaiting Boolean.resolve-wrapped
// results keeps this one function usable everywhere regardless of channel.
export async function configuredChannels() {
  const checks = await Promise.all(
    PUBLISHABLE_CHANNELS.map(async (c) => [c, await PUBLISHERS[c].isConfigured()])
  );
  return checks.filter(([, ok]) => ok).map(([c]) => c);
}

// Sync helper for UI: "is LinkedIn even set up as an app, so we should offer
// a Connect button?" — independent of whether a member has authorized yet.
export function linkedInAuthAvailable() {
  return linkedInEnvReady();
}

// assets: { channelKey: contentJson } for this app
export async function publish(channel, app, assets) {
  const pub = PUBLISHERS[channel];
  if (!pub) throw new Error(`No publisher for channel: ${channel}`);
  if (!(await pub.isConfigured())) {
    throw new Error(`${pub.label} is not configured — add its keys to .env.local (see .env.example).`);
  }
  return pub.publish(app, assets);
}
