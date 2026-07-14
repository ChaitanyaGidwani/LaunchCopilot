import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { configuredChannels, linkedInAuthAvailable } from "@/lib/publishers";
import Dashboard from "@/components/Dashboard";

export const dynamic = "force-dynamic";

export default async function AppDashboardPage({ params }) {
  const { id } = await params;
  const db = supabase();

  const [{ data: app }, { data: assets }, { data: plan }, { data: entries }, { data: queue }] =
    await Promise.all([
      db.from("apps").select("*").eq("id", id).single(),
      db.from("assets").select("*").eq("app_id", id),
      db.from("plans").select("*").eq("app_id", id).maybeSingle(),
      db
        .from("tracking_entries")
        .select("*")
        .eq("app_id", id)
        .order("created_at", { ascending: false }),
      db
        .from("scheduled_posts")
        .select("*")
        .eq("app_id", id)
        .order("scheduled_for", { ascending: true }),
    ]);

  if (!app) notFound();

  const publishable = await configuredChannels();
  // LinkedIn needs an app-level env config AND a member to have connected —
  // this tells the UI whether to offer a "Connect LinkedIn" button at all.
  const linkedinConnectable = linkedInAuthAvailable() && !publishable.includes("linkedin");

  return (
    <Dashboard
      app={app}
      initialAssets={assets ?? []}
      initialPlan={plan?.days ?? null}
      initialEntries={entries ?? []}
      initialQueue={queue ?? []}
      publishable={publishable}
      linkedinConnectable={linkedinConnectable}
    />
  );
}
