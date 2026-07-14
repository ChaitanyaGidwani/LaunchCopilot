// Provider-switchable LLM client. Set LLM_PROVIDER=groq|gemini|anthropic|openai in .env.local.
// Uses plain fetch (no SDKs) to keep the dependency surface tiny.

import { parseJSON } from "./parse-json.mjs";

const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 2000; // 2s → 4s → 8s exponential backoff

async function callAnthropic({ system, user, maxTokens }) {
  const opts = {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
    }),
  };
  // Same backoff as the OpenAI-compatible path (429 rate limit, 529 overloaded)
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch("https://api.anthropic.com/v1/messages", opts);
    if ((res.status === 429 || res.status === 529) && attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, INITIAL_DELAY_MS * Math.pow(2, attempt)));
      continue;
    }
    if (!res.ok) {
      throw new Error(`Anthropic API error ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    return data.content?.[0]?.text ?? "";
  }
}

// Shared implementation for any OpenAI-compatible chat completions API
// (OpenAI itself, Google Gemini's compat endpoint, Groq, OpenRouter, ...)
async function callOpenAICompatible({ baseUrl, apiKey, model, providerName, system, user, maxTokens, supportsJsonMode = true, extraBody = {} }) {
  const url = `${baseUrl.replace(/\/$/, "")}/chat/completions`;

  // response_format: { type: "json_object" } is supported by OpenAI and Gemini.
  // Groq's Llama models also support it for llama-3.3-70b-versatile, but we
  // make it opt-in so newer or smaller models can be swapped in safely.
  const responseFormat = supportsJsonMode ? { response_format: { type: "json_object" } } : {};

  const opts = {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      ...responseFormat,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      // Provider-specific params (e.g. Gemini's reasoning_effort) — never
      // sent to providers that don't declare them.
      ...extraBody,
    }),
  };

  // Exponential backoff for rate limits (429). Total worst-case wait:
  // 2s + 4s + 8s = 14s — well within the 60s maxDuration.
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(url, opts);
    if (res.status === 429 && attempt < MAX_RETRIES) {
      const delay = INITIAL_DELAY_MS * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }
    if (!res.ok) {
      throw new Error(`${providerName} API error ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  }
}

function callGroq(args) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set. Get a free key at https://console.groq.com and add it to .env.local.");
  }
  return callOpenAICompatible({
    baseUrl: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    providerName: "Groq",
    // llama-3.3-70b-versatile on Groq supports json_object response_format
    supportsJsonMode: true,
    ...args,
  });
}

function callGemini(args) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set. Get a free key at https://aistudio.google.com and add it to .env.local.");
  }
  return callOpenAICompatible({
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    apiKey: process.env.GEMINI_API_KEY,
    // "gemini-flash-latest" always aliases the current Flash model —
    // gemini-2.5-flash was retired and returns quota errors.
    model: process.env.GEMINI_MODEL || "gemini-flash-latest",
    providerName: "Gemini",
    supportsJsonMode: true,
    // Gemini-only: skip internal "thinking" so the copy fits in max_tokens.
    extraBody: { reasoning_effort: "none" },
    ...args,
  });
}

function callOpenAI(args) {
  return callOpenAICompatible({
    baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || "gpt-4o",
    providerName: "OpenAI",
    supportsJsonMode: true,
    ...args,
  });
}

export async function generateJSON({ system, user, maxTokens = 8000 }) {
  const provider = process.env.LLM_PROVIDER || "groq";
  const args = { system, user, maxTokens };
  let text;
  if (provider === "anthropic") {
    text = await callAnthropic(args);
  } else if (provider === "openai") {
    text = await callOpenAI(args);
  } else if (provider === "gemini") {
    text = await callGemini(args);
  } else {
    // "groq" is the default
    text = await callGroq(args);
  }
  return parseJSON(text);
}
