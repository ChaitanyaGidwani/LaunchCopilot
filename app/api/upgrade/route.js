import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAccount, getAppCount, PRO_PRICE_INR } from "@/lib/account";

export async function GET() {
  try {
    const db = supabase();
    const [account, appCount] = await Promise.all([getAccount(db), getAppCount(db)]);
    return NextResponse.json({ plan: account.plan, appCount, price_inr: PRO_PRICE_INR });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Demo checkout. In production this endpoint becomes the payment-provider
// webhook handler (Razorpay Subscriptions for INR / Stripe for international):
// the client opens the provider's checkout, and the provider calls back here
// on successful payment to activate the plan. The plan-gating logic in
// /api/apps is identical either way — only the activation trigger changes.
export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action === "downgrade" ? "downgrade" : "upgrade";
    const db = supabase();

    const { error } = await db.from("account").upsert({
      id: 1,
      plan: action === "upgrade" ? "pro" : "free",
      upgraded_at: action === "upgrade" ? new Date().toISOString() : null,
    });
    if (error) throw error;

    return NextResponse.json({ plan: action === "upgrade" ? "pro" : "free" });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
