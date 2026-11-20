// Javni pogled na lokal (očiščen: brez ključev, plačil in skrivnosti) + pomožne poizvedbe.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Venue, WheelConfig, PlanKey } from "@/lib/types";
import { venueMeta, type CheckinMode } from "@/lib/venueMeta";
import { categoryDefaultReward, categoryKey } from "@/lib/categories";
import { safeHex } from "@/lib/color";
import { bestOwnerPlan } from "@/lib/plans";
import { ownerAccess } from "@/lib/access";

export type VenueView = {
  id: string;
  code: string;
  name: string;
  category: string;
  city: string | null;
  color: string;
  logoUrl: string | null;
  goal: number;
  reward: string;
  phone: string | null;
  address: string;
  website: string;
  hours: string;
  about: string;
  tagline: string;
  coverUrl: string;
  wifiName: string;
  wifiPass: string;
  menuUrl: string;
  instagram: string;
  checkin: CheckinMode;
  /** Največ en žig na gosta na dan. */
  dailyLimit: boolean;
  /** Ali lokal lahko sprejema žige (aktivirano skeniranje oz. stojalo). */
  live: boolean;
  wheel: { enabled: boolean; segments: string[] };
  redemptionMinutes: number;
  /** Kam gredo zadovoljni gostje (4–5 zvezdic). */
  reviewUrl: string;
};

export const DEFAULT_WHEEL: WheelConfig = {
  enabled: true,
  mode: "weighted",
  winner: 0,
  segments: [
    { label: "Brezplačna kava", weight: 2 },
    { label: "Popust 10 %", weight: 4 },
    { label: "Sladko presenečenje", weight: 3 },
    { label: "Popust 15 %", weight: 2 },
    { label: "Brezplačen dodatek", weight: 3 },
    { label: "Popust 5 %", weight: 4 },
  ],
};

export function wheelOf(v: { wheel_config?: WheelConfig | null }): WheelConfig {
  const w = v.wheel_config;
  return w && Array.isArray(w.segments) && w.segments.length >= 2 ? w : DEFAULT_WHEEL;
}

export function toVenueView(v: Venue, stampReward: string | null): VenueView {
  const meta = venueMeta(v);
  const wheel = wheelOf(v);
  const receiptOk = !!v.davcna_stevilka;
  const standOk = !!meta.standKey;
  const live = meta.checkin === "receipt" ? receiptOk : meta.checkin === "stand" ? standOk : receiptOk || standOk;
  return {
    id: v.id,
    code: v.public_code,
    name: v.name,
    category: categoryKey((v as { venue_type?: string | null }).venue_type),
    city: v.city ?? null,
    color: safeHex(v.brand_color),
    logoUrl: v.logo_url,
    goal: v.stamp_goal || 10,
    reward: stampReward || categoryDefaultReward((v as { venue_type?: string | null }).venue_type),
    phone: (v as { phone?: string | null }).phone ?? null,
    address: meta.address,
    website: meta.website,
    hours: meta.hours,
    about: meta.about,
    tagline: meta.tagline,
    coverUrl: meta.coverUrl,
    wifiName: meta.wifiName,
    wifiPass: meta.wifiPass,
    menuUrl: meta.menuUrl,
    instagram: meta.instagram,
    checkin: meta.checkin,
    dailyLimit: meta.dailyLimit,
    live,
    wheel: { enabled: wheel.enabled !== false, segments: wheel.segments.map((s) => s.label || "Nagrada") },
    redemptionMinutes: v.redemption_minutes || 5,
    reviewUrl: v.google_review_url || `https://www.google.com/search?q=${encodeURIComponent(v.name + (v.city ? " " + v.city : ""))}`,
  };
}

export async function venueByCode(db: SupabaseClient, code: string): Promise<Venue | null> {
  const { data } = await db.from("venues").select("*").eq("public_code", code).maybeSingle();
  return (data as Venue | null) ?? null;
}

export async function stampRewardName(db: SupabaseClient, venueId: string): Promise<string | null> {
  const { data } = await db.from("rewards").select("name").eq("venue_id", venueId).eq("kind", "stamp").limit(1);
  return (data?.[0]?.name as string | undefined) ?? null;
}

/** Imena nagrad za več lokalov naenkrat (za denarnico). */
export async function stampRewardNames(db: SupabaseClient, venueIds: string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  if (!venueIds.length) return out;
  const { data } = await db.from("rewards").select("venue_id, name").in("venue_id", venueIds).eq("kind", "stamp");
  for (const r of data ?? []) if (!out.has(r.venue_id as string)) out.set(r.venue_id as string, r.name as string);
  return out;
}

/** Ali ima lastnik lokala veljaven dostop (plačan paket ali poskusno obdobje). */
export async function venueHasAccess(db: SupabaseClient, v: Venue): Promise<boolean> {
  if (!v.owner_user_id) return true; // demo / sistemski lokali
  const { data } = await db
    .from("venues")
    .select("plan, subscription_status, current_period_end, trial_ends_at, created_at")
    .eq("owner_user_id", v.owner_user_id)
    .order("created_at", { ascending: true });
  const all = (data ?? []) as { plan?: PlanKey | null; subscription_status?: string | null; current_period_end?: string | null; trial_ends_at?: string | null }[];
  if (!all.length) return true;
  const plan = bestOwnerPlan(all);
  return ownerAccess(plan, all[0] as Parameters<typeof ownerAccess>[1], Date.now()).ok;
}
