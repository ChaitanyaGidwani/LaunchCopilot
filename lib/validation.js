import { z } from "zod";

// Shared UUID validator
const uuidField = z.string().uuid("Must be a valid UUID");

// Valid channel keys (must match schema.sql CHECK constraint)
const channelEnum = z.enum(["aso", "twitter", "linkedin", "product_hunt", "reddit"]);

// Valid metric keys (must match schema.sql CHECK constraint)
const metricEnum = z.enum(["installs", "clicks", "signups"]);

// ---------------------------------------------------------------------------
// POST /api/apps — create a new app (parsed from FormData, not JSON)
// ---------------------------------------------------------------------------
export const createAppSchema = z.object({
  name: z.string().trim().min(1, "App name is required").max(60),
  category: z.string().trim().min(1, "Category is required").max(40),
  pitch: z.string().trim().min(1, "Pitch is required").max(140),
  target_user: z.string().trim().min(1, "Target user is required").max(140),
  tone: z.string().trim().max(60).nullable().optional(),
  store_link: z.string().url().nullable().optional().or(z.literal("")),
});

// ---------------------------------------------------------------------------
// POST /api/generate — generate an asset for one channel
// ---------------------------------------------------------------------------
export const generateSchema = z.object({
  appId: uuidField,
  channel: channelEnum,
});

// ---------------------------------------------------------------------------
// POST /api/plan — generate a 7-day promotion plan
// ---------------------------------------------------------------------------
export const planSchema = z.object({
  appId: uuidField,
});

// ---------------------------------------------------------------------------
// POST /api/track — log an install/click/signup entry
// ---------------------------------------------------------------------------
export const trackSchema = z.object({
  appId: uuidField,
  channel: z.string().trim().min(1, "Channel is required").max(30),
  metric: metricEnum.optional().default("installs"),
  count: z
    .number({ coerce: true })
    .int("Count must be an integer")
    .min(0, "Count must be >= 0"),
  note: z.string().trim().max(120).nullable().optional(),
});

// ---------------------------------------------------------------------------
// POST /api/optimize — rewrite the weakest channel's copy
// ---------------------------------------------------------------------------
export const optimizeSchema = z.object({
  appId: uuidField,
  channel: channelEnum.optional(),
});

// ---------------------------------------------------------------------------
// Helper: validate and return a clean { data } or { error } result.
// Use in API routes:
//   const { data, error } = validate(schema, rawInput);
//   if (error) return NextResponse.json({ error }, { status: 400 });
// ---------------------------------------------------------------------------
export function validate(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) {
    const message = result.error.issues.map((i) => i.message).join("; ");
    return { data: null, error: message };
  }
  return { data: result.data, error: null };
}
