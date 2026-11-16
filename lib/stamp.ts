// Skupna logika dodelitve žiga (račun ali stojalo) + podpis piškotka stojala.
import { createHmac, timingSafeEqual } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Venue } from "@/lib/types";
import type { Member } from "@/lib/guest";
import { grantCoupon, unlockPending } from "@/lib/coupons";
import { stampRewardName } from "@/lib/venues";
import { categoryDefaultReward } from "@/lib/categories";

export class DuplicateStamp extends Error {}

export type StampResult = {
  stamps: number;
  goal: number;
  cardCompleted: boolean;
  rewardName: string;
  /** Kuponi, ki so s tem obiskom postali veljavni (npr. nagrada s kolesa). */
  unlocked: string[];
  askReview: boolean;
};

/** Minute do naslednjega dovoljenega žiga (0 = lahko takoj). */
export async function cooldownLeft(db: SupabaseClient, venue: Venue, customerId: string): Promise<number> {
  const cooldown = venue.scan_cooldown_minutes || 0;
  if (cooldown <= 0) return 0;
  const { data: last } = await db
    .from("scans")
    .select("created_at")
    .eq("venue_id", venue.id)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!last) return 0;
  const mins = (Date.now() - new Date(last.created_at as string).getTime()) / 60000;
  return mins < cooldown ? Math.max(1, Math.ceil(cooldown - mins)) : 0;
}

export async function awardStamp(
  db: SupabaseClient,
  venue: Venue,
  member: Member,
  proof: { zoi: string; davcna: string | null; issuedAt: Date },
): Promise<StampResult> {
  const goal = venue.stamp_goal || 10;
  const { data, error } = await db.rpc("award_scan", {
    p_venue_id: venue.id,
    p_customer_id: member.id,
    p_zoi: proof.zoi,
    p_davcna: proof.davcna,
    p_issued_at: proof.issuedAt.toISOString(),
    p_amount: null,
    p_points: venue.points_per_visit ?? 0,
    p_stamp_goal: goal,
  });
  if (error) {
    if (error.code === "23505") throw new DuplicateStamp();
    throw error;
  }
  const row = (Array.isArray(data) ? data[0] : data) as { stamps: number; card_completed: boolean } | null;
  const cardCompleted = !!row?.card_completed;
  const rewardName = (await stampRewardName(db, venue.id)) || categoryDefaultReward(venue.venue_type);

  if (cardCompleted) {
    await grantCoupon(db, { venueId: venue.id, customerId: member.id, name: rewardName, source: "card", status: "ready" });
  }
  const unlocked = await unlockPending(db, member.id);

  // Oceno prosimo največ enkrat na 60 dni na lokal.
  const since = new Date(Date.now() - 60 * 864e5).toISOString();
  const { count } = await db
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("venue_id", venue.id)
    .eq("customer_id", member.id)
    .gte("created_at", since);

  return { stamps: row?.stamps ?? 0, goal, cardCompleted, rewardName, unlocked, askReview: (count ?? 0) === 0 };
}

// ── Piškotek stojala: dokaz, da je gost pravkar odprl povezavo s stojala (QR/NFC) ──
const STAND_COOKIE = "lv_stand";
const STAND_TTL_MS = 15 * 60 * 1000;

function standSecret(): string {
  return createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY || "dev").update("loyavi-stand-v1").digest("hex");
}
function sign(payload: string): string {
  return createHmac("sha256", standSecret()).update(payload).digest("hex");
}

export function standCookie(venueId: string): { name: string; value: string; maxAge: number } {
  const exp = Date.now() + STAND_TTL_MS;
  const payload = `${venueId}.${exp}`;
  return { name: STAND_COOKIE, value: `${payload}.${sign(payload)}`, maxAge: Math.floor(STAND_TTL_MS / 1000) };
}

export function standCookieValid(value: string | undefined, venueId: string): boolean {
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const [vid, exp, sig] = parts;
  if (vid !== venueId || !(Number(exp) > Date.now())) return false;
  const good = sign(`${vid}.${exp}`);
  try {
    return sig.length === good.length && timingSafeEqual(Buffer.from(sig), Buffer.from(good));
  } catch {
    return false;
  }
}

export { STAND_COOKIE };
