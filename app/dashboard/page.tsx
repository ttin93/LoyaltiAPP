import { redirect } from "next/navigation";
import { isSupabaseConfigured, getServiceClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/ssrServer";
import Dashboard from "./Dashboard";
import DashboardDemo from "./DashboardDemo";
import type { Venue, Reward, Customer, ScanRow, RedemptionRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) return <DashboardDemo />;

  const user = await getCurrentUser();
  if (!user) redirect("/partner");

  const db = getServiceClient();
  const { data: venues } = await db
    .from("venues")
    .select("*")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1);
  const venue = venues?.[0];
  if (!venue) redirect("/partner");

  const [{ data: rewards }, { data: customers }, { data: scans }, { data: redemptions }] =
    await Promise.all([
      db.from("rewards").select("*").eq("venue_id", venue.id).order("points_required"),
      db.from("customers").select("*").eq("venue_id", venue.id).order("points", { ascending: false }),
      db
        .from("scans")
        .select("id, created_at, points_awarded, customer_id, customers(phone)")
        .eq("venue_id", venue.id)
        .order("created_at", { ascending: false })
        .limit(200),
      db
        .from("redemptions")
        .select("id, created_at, points_spent, rewards(name), customers(phone)")
        .eq("venue_id", venue.id)
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

  return (
    <Dashboard
      venue={venue as Venue}
      rewards={(rewards ?? []) as Reward[]}
      customers={(customers ?? []) as Customer[]}
      scans={(scans ?? []) as unknown as ScanRow[]}
      redemptions={(redemptions ?? []) as unknown as RedemptionRow[]}
      ownerEmail={user.email ?? ""}
    />
  );
}
