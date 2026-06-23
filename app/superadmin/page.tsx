import { notFound } from "next/navigation";
import { isSupabaseConfigured, getServiceClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/ssrServer";
import { isSuperadmin } from "@/lib/superadmin";
import { monthlyEquivalent, isPaying, PLANS, PLAN_ORDER } from "@/lib/plans";
import Superadmin from "./Superadmin";
import type { Venue, PlanKey } from "@/lib/types";

export const dynamic = "force-dynamic";

export type SAVenue = Venue & {
  ownerEmail: string | null;
  cCustomers: number;
  cScans: number;
  cScans30: number;
  cRedemptions: number;
  lastScan: string | null;
  reviewAvg: number | null;
  reviewCount: number;
  newCustomers7: number;
};

export type SAOwner = {
  id: string;
  email: string | null;
  created_at: string | null;
  last_sign_in_at: string | null;
  venueNames: string[];
};

export type SATotals = {
  venues: number;
  owners: number;
  customers: number;
  scans: number;
  scans30: number;
  redemptions: number;
  newCustomers7: number;
  reviewAvg: number | null;
  reviewCount: number;
};

export type SADay = { date: string; label: string; count: number };

export type SARevenue = {
  mrr: number;
  arr: number;
  paying: number;
  free: number;
  trialing: number;
  avgPerPaying: number;
  monthlyCount: number;
  yearlyCount: number;
  committed: number;
  byPlan: { plan: PlanKey; label: string; count: number; mrr: number }[];
};

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

export default async function SuperadminPage() {
  if (!isSupabaseConfigured()) notFound();
  const user = await getCurrentUser();
  if (!user || !isSuperadmin(user.email)) notFound();

  const db = getServiceClient();

  const [venuesRes, customersRes, scansRes, redemptionsRes, reviewsRes, usersRes] =
    await Promise.all([
      db.from("venues").select("*").order("created_at", { ascending: false }),
      db.from("customers").select("id, venue_id, created_at"),
      db
        .from("scans")
        .select("id, venue_id, created_at")
        .order("created_at", { ascending: false })
        .limit(8000),
      db.from("redemptions").select("id, venue_id, created_at").limit(8000),
      db.from("reviews").select("id, venue_id, stars, created_at").limit(8000),
      db.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    ]);

  const venues = (venuesRes.data ?? []) as Venue[];
  const customers = (customersRes.data ?? []) as { id: string; venue_id: string; created_at: string }[];
  const scans = (scansRes.data ?? []) as { id: string; venue_id: string; created_at: string }[];
  const redemptions = (redemptionsRes.data ?? []) as { id: string; venue_id: string; created_at: string }[];
  const reviews = (reviewsRes.data ?? []) as { id: string; venue_id: string; stars: number; created_at: string }[];
  const users = usersRes.data?.users ?? [];

  const now = new Date();
  const d30 = new Date(now.getTime() - 30 * 864e5);
  const d7 = new Date(now.getTime() - 7 * 864e5);

  const emailById = new Map(users.map((u) => [u.id, u.email ?? null]));

  // per-venue agregati
  const stat = (vid: string) => {
    const vc = customers.filter((c) => c.venue_id === vid);
    const vs = scans.filter((s) => s.venue_id === vid);
    const vr = reviews.filter((r) => r.venue_id === vid);
    const vred = redemptions.filter((r) => r.venue_id === vid);
    const avg = vr.length ? Math.round((vr.reduce((a, r) => a + (r.stars || 0), 0) / vr.length) * 10) / 10 : null;
    return {
      cCustomers: vc.length,
      cScans: vs.length,
      cScans30: vs.filter((s) => new Date(s.created_at) >= d30).length,
      cRedemptions: vred.length,
      lastScan: vs[0]?.created_at ?? null, // scans ordered desc
      reviewAvg: avg,
      reviewCount: vr.length,
      newCustomers7: vc.filter((c) => new Date(c.created_at) >= d7).length,
    };
  };

  const saVenues: SAVenue[] = venues.map((v) => ({
    ...v,
    ownerEmail: v.owner_user_id ? emailById.get(v.owner_user_id) ?? null : null,
    ...stat(v.id),
  }));

  // lastniki (auth uporabniki, ki imajo vsaj 1 lokal — ali vsi?)
  const venuesByOwner = new Map<string, string[]>();
  for (const v of venues) {
    if (!v.owner_user_id) continue;
    const arr = venuesByOwner.get(v.owner_user_id) ?? [];
    arr.push(v.name);
    venuesByOwner.set(v.owner_user_id, arr);
  }
  const owners: SAOwner[] = users
    .map((u) => ({
      id: u.id,
      email: u.email ?? null,
      created_at: u.created_at ?? null,
      last_sign_in_at: u.last_sign_in_at ?? null,
      venueNames: venuesByOwner.get(u.id) ?? [],
    }))
    .sort((a, b) => (b.venueNames.length - a.venueNames.length) || ((b.created_at || "") > (a.created_at || "") ? 1 : -1));

  const reviewAvgAll = reviews.length
    ? Math.round((reviews.reduce((a, r) => a + (r.stars || 0), 0) / reviews.length) * 10) / 10
    : null;

  const totals: SATotals = {
    venues: venues.length,
    owners: owners.filter((o) => o.venueNames.length > 0).length,
    customers: customers.length,
    scans: scans.length,
    scans30: scans.filter((s) => new Date(s.created_at) >= d30).length,
    redemptions: redemptions.length,
    newCustomers7: customers.filter((c) => new Date(c.created_at) >= d7).length,
    reviewAvg: reviewAvgAll,
    reviewCount: reviews.length,
  };

  // 30-dnevna platformna serija skenov
  const buckets = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 864e5);
    buckets.set(dayKey(d), 0);
  }
  for (const s of scans) {
    const k = s.created_at.slice(0, 10);
    if (buckets.has(k)) buckets.set(k, (buckets.get(k) || 0) + 1);
  }
  const series: SADay[] = Array.from(buckets.entries()).map(([date, count]) => ({
    date,
    label: `${date.slice(8, 10)}.${date.slice(5, 7)}`,
    count,
  }));

  // ---- naročnine / prihodek ----
  let mrr = 0;
  let paying = 0;
  let trialing = 0;
  let monthlyCount = 0;
  let yearlyCount = 0;
  let committed = 0;
  const planAgg = new Map<PlanKey, { count: number; mrr: number }>();
  for (const v of venues) {
    const plan = (v.plan ?? "free") as PlanKey;
    const status = v.subscription_status ?? "active";
    const me = monthlyEquivalent(plan, v.billing_cycle, v.custom_price_eur);
    if (isPaying(plan, status)) {
      paying++;
      mrr += me;
      if (v.billing_cycle === "yearly") yearlyCount++;
      else monthlyCount++;
      if ((v.commitment_months ?? 0) > 0) committed++;
      const a = planAgg.get(plan) ?? { count: 0, mrr: 0 };
      a.count++;
      a.mrr += me;
      planAgg.set(plan, a);
    }
    if (status === "trialing") trialing++;
  }
  mrr = Math.round(mrr * 100) / 100;
  const revenue: SARevenue = {
    mrr,
    arr: Math.round(mrr * 12 * 100) / 100,
    paying,
    free: venues.length - paying,
    trialing,
    avgPerPaying: paying ? Math.round((mrr / paying) * 100) / 100 : 0,
    monthlyCount,
    yearlyCount,
    committed,
    byPlan: PLAN_ORDER.filter((p) => p !== "free").map((p) => ({
      plan: p,
      label: PLANS[p].label,
      count: planAgg.get(p)?.count ?? 0,
      mrr: Math.round((planAgg.get(p)?.mrr ?? 0) * 100) / 100,
    })),
  };

  return (
    <Superadmin
      venues={saVenues}
      owners={owners}
      totals={totals}
      series={series}
      revenue={revenue}
      adminEmail={user.email ?? ""}
    />
  );
}
