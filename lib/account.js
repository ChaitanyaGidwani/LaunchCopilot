// Plan/paywall helpers. Free plan = 1 launch kit; Pro (₹499/mo) = unlimited.
// Single-workspace account (no auth yet); becomes per-user with RLS in v2.

export const FREE_APP_LIMIT = 1;
export const PRO_PRICE_INR = 499;

export async function getAccount(db) {
  const { data } = await db.from("account").select("*").eq("id", 1).maybeSingle();
  // Tolerate the migration not being run yet — treat as free plan.
  return data ?? { id: 1, plan: "free", upgraded_at: null };
}

export async function getAppCount(db) {
  const { count } = await db.from("apps").select("id", { count: "exact", head: true });
  return count ?? 0;
}
