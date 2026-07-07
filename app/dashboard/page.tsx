import { redirect } from "next/navigation";
import { isSupabaseConfigured, getServiceClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/ssrServer";
import { isSuperadmin } from "@/lib/superadmin";
import { bestOwnerPlan } from "@/lib/plans";
import { ownerAccess } from "@/lib/access";
import Dashboard, { type ReviewRow } from "./Dashboard";
import DashboardDemo from "./DashboardDemo";
import type { Venue, Reward, Customer, ScanRow, RedemptionRow, GrantRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ v?: string }> }) {
  if (!isSupabaseConfigured()) return <DashboardDemo />;

  const user = await getCurrentUser();
  if (!user) redirect("/partner");

  const db = getServiceClient();
  // lastnik ima lahko VEČ lokalov — naloži vse, izberi trenutnega po ?v=
  const { data: venues } = await db
    .from("venues")
    .select("*")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: true });
  if (!venues || !venues.length) redirect("/partner");
  const sp = await searchParams;
  const venue = venues.find((v) => v.id === sp?.v) || venues[0];

  const [{ data: rewards }, { data: customers }, { data: scans }, { data: redemptions }, { data: reviews }, { data: grants }, scanCountRes, customerCountRes, { data: dailyScans }, { data: hourlyScans }, { data: emailLog }] =
    await Promise.all([
      db.from("rewards").select("*").eq("venue_id", venue.id).order("points_required"),
      db.from("customers").select("*").eq("venue_id", venue.id).order("points", { ascending: false }),
      db
        .from("scans")
        .select("id, created_at, points_awarded, customer_id, customers(phone, email)")
        .eq("venue_id", venue.id)
        .order("created_at", { ascending: false })
        .limit(200),
      db
        .from("redemptions")
        .select("id, created_at, points_spent, rewards(name), customers(phone, email)")
        .eq("venue_id", venue.id)
        .order("created_at", { ascending: false })
        .limit(200),
      db
        .from("reviews")
        .select("id, stars, comment, to_google, created_at")
        .eq("venue_id", venue.id)
        .order("created_at", { ascending: false })
        .limit(300),
      db
        .from("point_grants")
        .select("id, created_at, points, note, customers(phone, email)")
        .eq("venue_id", venue.id)
        .order("created_at", { ascending: false })
        .limit(200),
      // KPI-ji + grafi prek strežniške agregacije (mimo 1000-row PostgREST limita)
      db.from("scans").select("id", { count: "exact", head: true }).eq("venue_id", venue.id),
      db.from("customers").select("id", { count: "exact", head: true }).eq("venue_id", venue.id),
      db.rpc("venue_daily_scans", { p_venue_id: venue.id, p_days: 365 }),
      db.rpc("venue_hourly_scans", { p_venue_id: venue.id, p_days: 365 }),
      // dnevnik pošiljanja (za Marketing → Dnevnik)
      db.from("email_log").select("id, kind, created_at, customers(email)").eq("venue_id", venue.id).order("created_at", { ascending: false }).limit(150),
    ]);
  const scanCount = scanCountRes.count ?? (scans?.length ?? 0);
  const customerCount = customerCountRes.count ?? (customers?.length ?? 0);

  return (
    <Dashboard
      venue={venue as Venue}
      venues={venues.map((v) => ({ id: v.id as string, name: v.name as string }))}
      rewards={(rewards ?? []) as Reward[]}
      customers={(customers ?? []) as Customer[]}
      scans={(scans ?? []) as unknown as ScanRow[]}
      redemptions={(redemptions ?? []) as unknown as RedemptionRow[]}
      reviews={(reviews ?? []) as unknown as ReviewRow[]}
      grants={(grants ?? []) as unknown as GrantRow[]}
      ownerEmail={user.email ?? ""}
      isAdmin={isSuperadmin(user.email)}
      ownerPlan={bestOwnerPlan(venues)}
      billingVenue={venues[0] as Venue}
      access={ownerAccess(bestOwnerPlan(venues), venues[0] as Venue, Date.now())}
      scanCount={scanCount}
      customerCount={customerCount}
      dailyScans={(dailyScans ?? []) as { day: string; cnt: number }[]}
      hourlyScans={(hourlyScans ?? []) as { hour: number; cnt: number }[]}
      emailLog={(emailLog ?? []) as unknown as { id: string; kind: string; created_at: string; customers: { email: string | null } | null }[]}
    />
  );
}
