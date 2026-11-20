// Podatki nadzorne plošče: en strežniški nalagalnik, ki vrne očiščen, serializabilen objekt.
import type { SupabaseClient } from "@supabase/supabase-js";
import QRCode from "qrcode";
import type { Venue, Automations, WheelConfig, PlanKey, BillingCycle } from "@/lib/types";
import { venueMeta, type VenueMeta } from "@/lib/venueMeta";
import { wheelOf, stampRewardName } from "@/lib/venues";
import { categoryDefaultReward, categoryKey } from "@/lib/categories";
import { safeHex } from "@/lib/color";
import { siteOrigin } from "@/lib/brand";
import { localDay } from "@/lib/guest";
import { SOURCE, type CouponSource } from "@/lib/coupons";
import type { Access } from "@/lib/access";
import { marketingAllowedIds, NON_EMAIL_KINDS } from "@/lib/consent";

export type GuestRow = {
  id: string;
  email: string;
  stamps: number;
  visits: number;
  lastVisit: string | null;
  joined: string;
  birthday: string | null;
  /** true = gost je dovolil ponudbe tega lokala in se ni odjavil */
  marketing: boolean;
};

export type CouponRow = {
  id: string;
  name: string;
  status: "pending" | "ready" | "active" | "redeemed" | "expired";
  source: CouponSource;
  createdAt: string;
  customerId: string;
};

export type ReviewRow = { id: string; stars: number; comment: string | null; toGoogle: boolean; createdAt: string; email: string | null };
export type LogRow = { id: string; kind: string; createdAt: string; email: string | null };
export type Activity = { id: string; kind: "visit" | "coupon" | "review" | "join"; when: string; title: string; who: string };

export type DashVenue = {
  id: string;
  code: string;
  name: string;
  category: string;
  city: string;
  phone: string;
  color: string;
  logoUrl: string | null;
  goal: number;
  reward: string;
  davcna: string | null;
  meta: VenueMeta;
  wheel: WheelConfig;
  automations: Automations;
  googleReviewUrl: string;
  scanWindowHours: number;
  cooldownMinutes: number;
  redemptionMinutes: number;
  pageUrl: string;
  standUrl: string;
  pageQr: string;
  standQr: string;
};

export type Billing = {
  plan: PlanKey;
  access: Access;
  venueId: string;
  cycle: BillingCycle;
  hasSubscription: boolean;
  cancelAtPeriodEnd: boolean;
  venueCount: number;
  maxVenues: number;
};

export type DashData = {
  venue: DashVenue;
  venues: { id: string; name: string }[];
  ownerEmail: string;
  isAdmin: boolean;
  billing: Billing;
  stats: {
    guests: number;
    guestsNew30: number;
    visits: number;
    visits30: number;
    visitsPrev30: number;
    returning: number;
    redeemed: number;
    openCoupons: number;
    ratingAvg: number | null;
    ratingCount: number;
    birthdays: number;
  };
  /** Zadnjih 30 dni, najstarejši prvi. */
  daily: { day: string; cnt: number }[];
  guests: GuestRow[];
  guestsTruncated: boolean;
  coupons: CouponRow[];
  reviews: ReviewRow[];
  emailLog: LogRow[];
  activity: Activity[];
  emailReady: boolean;
};

const DAY = 864e5;
const PAGE = 1000; // PostgREST vrne največ 1000 vrstic na zahtevek

async function pageAll<T>(make: (from: number, to: number) => PromiseLike<{ data: unknown }>, maxRows: number): Promise<{ rows: T[]; truncated: boolean }> {
  const rows: T[] = [];
  for (let from = 0; from < maxRows; from += PAGE) {
    const { data } = await make(from, from + PAGE - 1);
    const chunk = (data ?? []) as T[];
    rows.push(...chunk);
    if (chunk.length < PAGE) return { rows, truncated: false };
  }
  return { rows, truncated: true };
}

function sourceOf(code: number): CouponSource {
  const hit = (Object.entries(SOURCE) as [CouponSource, number][]).find(([, v]) => v === code);
  return hit ? hit[0] : "card";
}

async function qrSvg(text: string): Promise<string> {
  return QRCode.toString(text, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#000000", light: "#FFFFFF" } });
}

export async function toDashVenue(db: SupabaseClient, v: Venue): Promise<DashVenue> {
  const meta = venueMeta(v);
  const origin = siteOrigin();
  const pageUrl = `${origin}/p/${v.public_code}`;
  const standUrl = `${origin}/s/${v.public_code}?k=${meta.standKey}`;
  const autos: Automations = {};
  for (const [k, a] of Object.entries((v.automations ?? {}) as Record<string, unknown>)) {
    if (!k.startsWith("__") && a && typeof a === "object") autos[k] = a as Automations[string];
  }
  const [reward, pageQr, standQr] = await Promise.all([stampRewardName(db, v.id), qrSvg(pageUrl), qrSvg(standUrl)]);
  return {
    id: v.id,
    code: v.public_code,
    name: v.name,
    category: categoryKey(v.venue_type),
    city: v.city ?? "",
    phone: v.phone ?? "",
    color: safeHex(v.brand_color),
    logoUrl: v.logo_url,
    goal: v.stamp_goal || 10,
    reward: reward || categoryDefaultReward(v.venue_type),
    davcna: v.davcna_stevilka,
    meta,
    wheel: wheelOf(v),
    automations: autos,
    googleReviewUrl: v.google_review_url ?? "",
    scanWindowHours: v.scan_window_hours || 24,
    cooldownMinutes: v.scan_cooldown_minutes ?? 0,
    redemptionMinutes: v.redemption_minutes || 5,
    pageUrl,
    standUrl,
    pageQr,
    standQr,
  };
}

type CustRow = { id: string; email: string | null; stamps: number | null; birthday: string | null; created_at: string };
type ScanLite = { customer_id: string; created_at: string };
type RedRow = { id: string; status: string; points_spent: number; created_at: string; customer_id: string; rewards: { name: string } | { name: string }[] | null };

export async function loadDashboard(db: SupabaseClient, venue: Venue): Promise<Omit<DashData, "venues" | "ownerEmail" | "isAdmin" | "billing" | "emailReady">> {
  const id = venue.id;
  const now = Date.now();
  const since30 = new Date(now - 30 * DAY).toISOString();

  const [dashVenue, custs, scans, daily, reds, redeemedRes, openRes, reviews, log, visitsRes, guestsRes, allowed] = await Promise.all([
    toDashVenue(db, venue),
    pageAll<CustRow>((from, to) => db.from("customers").select("id, email, stamps, birthday, created_at").eq("venue_id", id).order("created_at", { ascending: false }).range(from, to), 5000),
    pageAll<ScanLite>((from, to) => db.from("scans").select("customer_id, created_at").eq("venue_id", id).order("created_at", { ascending: false }).range(from, to), 20000),
    db.rpc("venue_daily_scans", { p_venue_id: id, p_days: 61 }),
    db.from("redemptions").select("id, status, points_spent, created_at, customer_id, rewards(name)").eq("venue_id", id).order("created_at", { ascending: false }).limit(500),
    db.from("redemptions").select("id", { count: "exact", head: true }).eq("venue_id", id).eq("status", "redeemed"),
    db.from("redemptions").select("id", { count: "exact", head: true }).eq("venue_id", id).in("status", ["pending", "ready", "active"]),
    db.from("reviews").select("id, stars, comment, to_google, created_at, customer_id").eq("venue_id", id).order("created_at", { ascending: false }).limit(300),
    db.from("email_log").select("id, kind, created_at, customer_id").eq("venue_id", id).not("kind", "in", `(${NON_EMAIL_KINDS.join(",")})`).order("created_at", { ascending: false }).limit(100),
    db.from("scans").select("id", { count: "exact", head: true }).eq("venue_id", id),
    db.from("customers").select("id", { count: "exact", head: true }).eq("venue_id", id),
    marketingAllowedIds(db, id),
  ]);

  // obiski in zadnji obisk na gosta
  const visitsBy = new Map<string, number>();
  const lastBy = new Map<string, string>();
  for (const s of scans.rows) {
    visitsBy.set(s.customer_id, (visitsBy.get(s.customer_id) ?? 0) + 1);
    if (!lastBy.has(s.customer_id)) lastBy.set(s.customer_id, s.created_at);
  }
  const emailBy = new Map(custs.rows.map((c) => [c.id, c.email]));

  const guests: GuestRow[] = custs.rows
    .filter((c) => c.email)
    .map((c) => ({
      id: c.id,
      email: c.email as string,
      stamps: c.stamps ?? 0,
      visits: visitsBy.get(c.id) ?? 0,
      lastVisit: lastBy.get(c.id) ?? null,
      joined: c.created_at,
      birthday: c.birthday,
      marketing: allowed.has(c.id),
    }));

  // zadnjih 30 dni + prejšnjih 30 (za primerjavo)
  const cntByDay = new Map<string, number>(((daily.data ?? []) as { day: string; cnt: number }[]).map((d) => [d.day, Number(d.cnt)]));
  const days: { day: string; cnt: number }[] = [];
  let visits30 = 0;
  let visitsPrev30 = 0;
  // dneve štejemo po koledarju, ne po 24 urah: ob premiku ure bi se sicer en dan podvojil, drugi izgubil
  const [ty, tm, td] = localDay(new Date(now)).split("-").map(Number);
  for (let i = 59; i >= 0; i--) {
    const day = new Date(Date.UTC(ty, tm - 1, td - i)).toISOString().slice(0, 10);
    const cnt = cntByDay.get(day) ?? 0;
    if (i < 30) {
      days.push({ day, cnt });
      visits30 += cnt;
    } else visitsPrev30 += cnt;
  }

  const coupons: CouponRow[] = ((reds.data ?? []) as unknown as RedRow[]).map((r) => {
    const rw = Array.isArray(r.rewards) ? r.rewards[0] : r.rewards;
    return { id: r.id, name: rw?.name ?? "Nagrada", status: r.status as CouponRow["status"], source: sourceOf(r.points_spent), createdAt: r.created_at, customerId: r.customer_id };
  });

  const reviewRows: ReviewRow[] = ((reviews.data ?? []) as { id: string; stars: number; comment: string | null; to_google: boolean; created_at: string; customer_id: string | null }[]).map((r) => ({
    id: r.id,
    stars: r.stars,
    comment: r.comment,
    toGoogle: r.to_google,
    createdAt: r.created_at,
    email: r.customer_id ? (emailBy.get(r.customer_id) ?? null) : null,
  }));
  const ratingCount = reviewRows.length;
  const ratingAvg = ratingCount ? reviewRows.reduce((a, r) => a + r.stars, 0) / ratingCount : null;

  const emailLog: LogRow[] = ((log.data ?? []) as { id: string; kind: string; created_at: string; customer_id: string | null }[]).map((l) => ({
    id: l.id,
    kind: l.kind,
    createdAt: l.created_at,
    email: l.customer_id ? (emailBy.get(l.customer_id) ?? null) : null,
  }));

  const who = (cid: string | null) => (cid && emailBy.get(cid)) || "Gost";
  const activity: Activity[] = [
    ...scans.rows.slice(0, 8).map((s, i) => ({ id: `v${i}`, kind: "visit" as const, when: s.created_at, title: "Potrjen obisk", who: who(s.customer_id) })),
    ...coupons.filter((c) => c.status === "redeemed").slice(0, 5).map((c) => ({ id: `c${c.id}`, kind: "coupon" as const, when: c.createdAt, title: `Prevzeta nagrada: ${c.name}`, who: who(c.customerId) })),
    ...reviewRows.slice(0, 5).map((r) => ({ id: `r${r.id}`, kind: "review" as const, when: r.createdAt, title: `Ocena ${r.stars} od 5`, who: r.email ?? "Gost" })),
    ...custs.rows.slice(0, 5).map((c) => ({ id: `j${c.id}`, kind: "join" as const, when: c.created_at, title: "Nov gost", who: c.email ?? "Gost" })),
  ]
    .sort((a, b) => b.when.localeCompare(a.when))
    .slice(0, 10);

  const guestTotal = guestsRes.count ?? guests.length;
  return {
    venue: dashVenue,
    stats: {
      guests: guestTotal,
      guestsNew30: custs.rows.filter((c) => c.created_at >= since30).length,
      visits: visitsRes.count ?? scans.rows.length,
      visits30,
      visitsPrev30,
      returning: guests.filter((g) => g.visits >= 2).length,
      redeemed: redeemedRes.count ?? 0,
      openCoupons: openRes.count ?? 0,
      ratingAvg,
      ratingCount,
      birthdays: custs.rows.filter((c) => c.birthday).length,
    },
    daily: days,
    guests,
    guestsTruncated: custs.truncated || scans.truncated,
    coupons,
    reviews: reviewRows,
    emailLog,
    activity,
  };
}
