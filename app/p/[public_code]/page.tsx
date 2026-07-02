import { notFound } from "next/navigation";
import { getServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";
import SetupNotice from "@/app/components/SetupNotice";
import GuestApp from "./GuestApp";
import type { Venue, Reward } from "@/lib/types";

export const dynamic = "force-dynamic";

// Demo podatki za predogled brez Supabase (samo /p/demo).
const DEMO_VENUE: Venue = {
  id: "demo",
  owner_user_id: null,
  name: "Kavarna Lipa",
  public_code: "demo",
  logo_url: null,
  brand_color: "#2B1D17",
  davcna_stevilka: "97384933",
  points_model: "per_visit",
  points_per_visit: 15,
  points_per_euro: 50,
  scan_window_hours: 9000,
  redemption_minutes: 5,
  daily_scan_cap: null,
  created_at: "",
};
const DEMO_REWARDS: Reward[] = [
  { id: "1", venue_id: "demo", name: "Kava po izbiri", image_url: null, points_required: 150, sort_order: 1 },
  { id: "2", venue_id: "demo", name: "Domač rogljiček", image_url: null, points_required: 220, sort_order: 2 },
  { id: "3", venue_id: "demo", name: "Kos torte dneva", image_url: null, points_required: 320, sort_order: 3 },
];

export default async function Page({
  params,
}: {
  params: Promise<{ public_code: string }>;
}) {
  const { public_code } = await params;

  if (!isSupabaseConfigured()) {
    if (public_code === "demo") {
      return <GuestApp venue={DEMO_VENUE} rewards={DEMO_REWARDS} demo />;
    }
    return <SetupNotice />;
  }

  const db = getServiceClient();
  const { data: venue } = await db
    .from("venues")
    .select("*")
    .eq("public_code", public_code)
    .single();
  if (!venue) notFound();

  const { data: rewards } = await db
    .from("rewards")
    .select("*")
    .eq("venue_id", venue.id)
    .order("sort_order");

  return <GuestApp venue={venue} rewards={rewards ?? []} />;
}
