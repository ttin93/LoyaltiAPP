// Kuponi (strežniški ledger). Dokler ni čistilne migracije, živijo v tabeli `redemptions`:
//   status        pending → ready → active → redeemed | expired
//   points_spent  koda vira (glej SOURCE)
//   reward_id     ime kupona (rewards.name); za nagrade s kolesa nastane vrstica kind='prize'
//   expires_at    veljavnost kupona; ob aktivaciji se prepiše s časovnikom unovčenja
// Vsa koda bere/piše kupone SAMO prek teh funkcij.
import type { SupabaseClient } from "@supabase/supabase-js";

export const SOURCE = { card: 0, welcome: -1, birthday: -2, campaign: -3, manual: -4 } as const;
export type CouponSource = keyof typeof SOURCE;
export type CouponStatus = "pending" | "ready" | "active" | "redeemed" | "expired";

export type Coupon = {
  id: string;
  venueId: string;
  customerId: string;
  name: string;
  source: CouponSource;
  status: CouponStatus;
  /** ISO; pri `active` je to iztek časovnika, pri `ready` veljavnost (ali null = brez izteka). */
  expiresAt: string | null;
  createdAt: string;
};

const WELCOME_VALID_DAYS = 30;
const DAY = 864e5;

type Row = {
  id: string;
  venue_id: string;
  customer_id: string;
  status: string;
  points_spent: number;
  expires_at: string | null;
  created_at: string;
  rewards: { name: string } | { name: string }[] | null;
};

const COLS = "id, venue_id, customer_id, status, points_spent, expires_at, created_at, rewards(name)";

function sourceOf(code: number): CouponSource {
  const hit = (Object.entries(SOURCE) as [CouponSource, number][]).find(([, v]) => v === code);
  return hit ? hit[0] : "card"; // stari zapisi (points_spent > 0) = unovčenja za točke
}

function toCoupon(r: Row): Coupon {
  const rw = Array.isArray(r.rewards) ? r.rewards[0] : r.rewards;
  return {
    id: r.id,
    venueId: r.venue_id,
    customerId: r.customer_id,
    name: rw?.name ?? "Nagrada",
    source: sourceOf(r.points_spent),
    status: r.status as CouponStatus,
    expiresAt: r.expires_at,
    createdAt: r.created_at,
  };
}

/** Poišče (ali ustvari) vrstico v `rewards`, ki nosi ime kupona. */
async function rewardIdFor(db: SupabaseClient, venueId: string, name: string): Promise<string> {
  const clean = name.trim().slice(0, 80) || "Nagrada";
  const { data: found } = await db.from("rewards").select("id").eq("venue_id", venueId).eq("name", clean).maybeSingle();
  if (found) return found.id as string;
  const { data: made, error } = await db
    .from("rewards")
    .insert({ venue_id: venueId, name: clean, points_required: 0, sort_order: 999, kind: "prize" })
    .select("id")
    .single();
  if (error) {
    // sočasen vnos istega imena → preberi obstoječo
    const { data: again } = await db.from("rewards").select("id").eq("venue_id", venueId).eq("name", clean).maybeSingle();
    if (again) return again.id as string;
    throw error;
  }
  return made.id as string;
}

export async function grantCoupon(
  db: SupabaseClient,
  a: { venueId: string; customerId: string; name: string; source: CouponSource; status?: "pending" | "ready"; validDays?: number | null },
): Promise<Coupon> {
  const rewardId = await rewardIdFor(db, a.venueId, a.name);
  const status = a.status ?? "ready";
  const expires = status === "ready" && a.validDays ? new Date(Date.now() + a.validDays * DAY).toISOString() : null;
  const { data, error } = await db
    .from("redemptions")
    .insert({ venue_id: a.venueId, customer_id: a.customerId, reward_id: rewardId, points_spent: SOURCE[a.source], status, expires_at: expires })
    .select(COLS)
    .single();
  if (error) throw error;
  return toCoupon(data as unknown as Row);
}

/** Odprti kuponi (pending/ready/active) za dana članstva. Pretekle sproti označi kot potekle. */
export async function openCoupons(db: SupabaseClient, customerIds: string[]): Promise<Coupon[]> {
  if (!customerIds.length) return [];
  const { data } = await db
    .from("redemptions")
    .select(COLS)
    .in("customer_id", customerIds)
    .in("status", ["pending", "ready", "active"])
    .order("created_at", { ascending: false })
    .limit(200);
  const now = Date.now();
  const live: Coupon[] = [];
  const dead: string[] = [];
  for (const r of (data ?? []) as unknown as Row[]) {
    const c = toCoupon(r);
    if (c.status !== "pending" && c.expiresAt && new Date(c.expiresAt).getTime() < now) dead.push(c.id);
    else live.push(c);
  }
  if (dead.length) await db.from("redemptions").update({ status: "expired" }).in("id", dead);
  return live;
}

/** Ali je članstvo že dobilo nagrado dobrodošlice (kolo)? Velja en sam, ne glede na stanje. */
export async function hasWelcome(db: SupabaseClient, customerId: string): Promise<boolean> {
  const { count } = await db
    .from("redemptions")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", customerId)
    .eq("points_spent", SOURCE.welcome);
  return (count ?? 0) > 0;
}

/** Po prvem potrjenem obisku: kuponi na čakanju postanejo veljavni. Vrne imena odklenjenih. */
export async function unlockPending(db: SupabaseClient, customerId: string): Promise<string[]> {
  const { data } = await db
    .from("redemptions")
    .update({ status: "ready", expires_at: new Date(Date.now() + WELCOME_VALID_DAYS * DAY).toISOString() })
    .eq("customer_id", customerId)
    .eq("status", "pending")
    .select("rewards(name)");
  return ((data ?? []) as unknown as { rewards: { name: string } | { name: string }[] | null }[]).map((r) => {
    const rw = Array.isArray(r.rewards) ? r.rewards[0] : r.rewards;
    return rw?.name ?? "Nagrada";
  });
}

/** Gost aktivira kupon ob blagajni: ready → active, steče časovnik. Atomarno (samo en klic uspe). */
export async function activateCoupon(db: SupabaseClient, couponId: string, customerIds: string[], minutes: number): Promise<Coupon | null> {
  const now = new Date();
  const { data } = await db
    .from("redemptions")
    .update({ status: "active", activated_at: now.toISOString(), expires_at: new Date(now.getTime() + minutes * 60000).toISOString() })
    .eq("id", couponId)
    .in("customer_id", customerIds)
    .eq("status", "ready")
    .select(COLS);
  const row = (data ?? [])[0] as unknown as Row | undefined;
  return row ? toCoupon(row) : null;
}

/** Osebje potrdi prevzem: active → redeemed (če časovnik še teče), sicer expired. */
export async function confirmCoupon(db: SupabaseClient, couponId: string, customerIds: string[]): Promise<"redeemed" | "expired" | "invalid"> {
  const { data: cur } = await db
    .from("redemptions")
    .select("id, status, expires_at")
    .eq("id", couponId)
    .in("customer_id", customerIds)
    .maybeSingle();
  if (!cur || cur.status !== "active") return cur?.status === "redeemed" ? "redeemed" : "invalid";
  const alive = !cur.expires_at || new Date(cur.expires_at as string).getTime() >= Date.now();
  const next = alive ? "redeemed" : "expired";
  const { data } = await db.from("redemptions").update({ status: next }).eq("id", couponId).eq("status", "active").select("id");
  return (data ?? []).length ? next : "invalid";
}
