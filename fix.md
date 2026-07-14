# Codebase Issues & Tech Debt (fix.md)

Based on the analysis of the codebase, here are the key issues and areas for improvement, categorized by impact.

## AUDIT STATUS (updated)
| Item | Status |
|---|---|
| RLS policies / anon key / user auth | ⏳ **Deliberate v2 scope** — single-workspace by design; upgrade path documented in `lib/supabase.js` and `docs/pitch.md` |
| Unoptimized images | ✅ Fixed — `next/image` + `remotePatterns` for Supabase storage |
| Missing loading states | ✅ Fixed — `loading.jsx` skeletons for `/`, `/app/[id]`, and `/share/[id]` |
| Sequential image uploads | ✅ Fixed — `Promise.allSettled` parallel uploads |
| LLM 429 handling vs maxDuration | ✅ Fixed — exponential backoff (2s/4s/8s, worst case 14s < 60s) |
| Schema validation | ✅ Fixed — Zod schemas on all 5 API routes (`lib/validation.js`) |
| JSON parsing edge cases | ✅ Fixed — multi-fence-aware parser, extracted to `lib/parse-json.mjs` |
| Linters/formatters | ✅ Fixed — eslint + `next/core-web-vitals`, `npm run lint` |
| No testing framework | ✅ Fixed — `npm test` runs `node --test tests/` (10 unit tests on the LLM output parser) |

## 1. Security & Authentication (High Priority)
*   **Missing Row Level Security (RLS) Policies:** The `supabase/schema.sql` script enables RLS on all tables but defines no policies. The app currently bypasses RLS entirely by using the `SUPABASE_SERVICE_ROLE_KEY` in `lib/supabase.js`.
*   **Service Role Key Usage:** Relying on the service role key for all database operations in production is a significant security risk. It gives admin privileges and bypasses all protections. The app needs to transition to using standard anon keys with proper RLS policies.
*   **No User Authentication:** The application lacks user authentication. Any user who knows (or guesses) an App ID can view or modify its assets and plans.

## 2. Next.js & React Best Practices (Medium Priority)
*   **Unoptimized Images:** `components/Dashboard.jsx` uses standard `<img>` tags (and disables the ESLint rule) instead of Next.js's `<Image>` component (`next/image`), leading to unoptimized image loading.
*   **Missing Loading States:** Server components like `app/page.jsx` use `export const dynamic = "force-dynamic";` and fetch data directly, which can cause poor Time to First Byte (TTFB). There are no `loading.jsx` files or React Suspense boundaries to show fallback UI while data loads.
*   **Sequential Image Uploads:** In `app/api/apps/route.js`, screenshot uploads are handled sequentially in a `for...of` loop. This could be optimized to run concurrently using `Promise.all()`.

## 3. Resilience & Error Handling (Medium Priority)
*   **LLM Rate Limit Handling:** In `lib/llm.js`, the `callOpenAICompatible` function handles HTTP 429 (Rate Limit) errors by sleeping for 30 seconds (`await new Promise(r => setTimeout(r, 30000));`). Since API routes (`app/api/generate/route.js`) have `export const maxDuration = 60;`, a 30-second delay plus the actual LLM generation time could easily exceed the timeout limit, causing the request to fail entirely.
*   **Lack of Schema Validation:** The API routes (e.g., `app/api/apps/route.js`) extract data from `FormData` or JSON bodies and insert it directly into the database. There is no robust validation library (like Zod) in place to validate types, sanitize inputs, or enforce limits (like max string lengths).
*   **JSON Parsing Edge Cases:** The `parseJSON` function in `lib/llm.js` is somewhat resilient but could fail if the LLM outputs multiple markdown blocks or heavily pads the response before/after the JSON.

## 4. Tooling & DX (Low Priority)
*   **Missing Linters/Formatters:** The `package.json` does not include `eslint` or `prettier` dependencies, making it difficult to enforce code style and catch simple syntax or import errors.
*   **No Testing Framework:** There are no tests (unit, integration, or E2E) configured in the repository.
