import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServiceClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/ssrServer";
import { isSuperadmin } from "@/lib/superadmin";
import { bestOwnerPlan, planMaxVenues } from "@/lib/plans";
import { ownerAccess } from "@/lib/access";
import { emailConfigured } from "@/lib/email";
import type { Venue } from "@/lib/types";
import { loadDashboard, type DashData } from "./data";
import Dashboard from "./Dashboard";
import { SECTION_KEYS, type SectionKey } from "./keys";

export const metadata: Metadata = { title: "Nadzorna plošča", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ v?: string; s?: string; novo?: string; billing?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/partner");

  const db = getServiceClient();
  // lastnik ima lahko več lokalov; trenutnega izbere ?v=
  const { data: rows } = await db.from("venues").select("*").eq("owner_user_id", user.id).order("created_at", { ascending: true });
  const venues = (rows ?? []) as Venue[];
  if (!venues.length) redirect("/partner");

  const sp = await searchParams;
  const venue = venues.find((v) => v.id === sp?.v) ?? venues[0];
  const plan = bestOwnerPlan(venues);
  const bill = venues[0]; // naročnina živi na prvem lokalu
  // eslint-disable-next-line react-hooks/purity -- strežniška komponenta, čas se prebere enkrat na zahtevek
  const access = ownerAccess(plan, bill, Date.now());

  const data: DashData = {
    ...(await loadDashboard(db, venue)),
    venues: venues.map((v) => ({ id: v.id, name: v.name })),
    ownerEmail: user.email ?? "",
    isAdmin: isSuperadmin(user.email),
    emailReady: emailConfigured(),
    billing: {
      plan,
      access,
      venueId: bill.id,
      cycle: bill.billing_cycle === "yearly" ? "yearly" : "monthly",
      hasSubscription: !!bill.polar_customer_id,
      cancelAtPeriodEnd: !!bill.cancel_at_period_end,
      venueCount: venues.length,
      maxVenues: planMaxVenues(plan),
    },
  };

  const initial = (SECTION_KEYS as readonly string[]).includes(sp?.s ?? "") ? (sp!.s as SectionKey) : "pregled";
  return <Dashboard key={venue.id} data={data} initialSection={access.ok ? initial : "narocnina"} isNew={sp?.novo === "1"} billingSuccess={sp?.billing === "success"} />;
}
