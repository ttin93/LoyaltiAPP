import type { PlanKey, BillingCycle } from "@/lib/types";
import { DEMO, DEMO_MAX_VENUES } from "@/lib/demo";

/**
 * Letni model: plačaš X mesecev, dobiš 12 (2 meseca gratis).
 * YEARLY_MONTHS = 10 → letno = mesečna × 10. Spremeni na enem mestu.
 */
export const YEARLY_MONTHS = 10;
export const YEARLY_FREE_MONTHS = 12 - YEARLY_MONTHS;
/** Izpeljani % popust (za prikaze, ki želijo odstotek). */
export const YEARLY_DISCOUNT = YEARLY_FREE_MONTHS / 12;

// Ključi v bazi/Polarju = start/grow/scale (interno); oznake za prikaz = Lokal/Veriga/Po meri.
export const PLANS: Record<PlanKey, { label: string; tag: string; monthly: number | null }> = {
  free: { label: DEMO ? "Demo" : "Preizkus", tag: DEMO ? "Vse funkcije, brezplačno" : "Brez naročnine", monthly: 0 },
  start: { label: "Lokal", tag: "En lokal", monthly: 49.99 },
  grow: { label: "Veriga", tag: "Do 5 lokalov", monthly: 79.99 },
  scale: { label: "Po meri", tag: "Več kot 5 lokalov, po dogovoru", monthly: null }, // cena po dogovoru → custom_price_eur
};

export const PLAN_ORDER: PlanKey[] = ["free", "start", "grow", "scale"];

// ── Zmožnosti po paketu ──────────────────────────────────────────────────────
// v2: vsi paketi imajo vse funkcije; razlika je samo število lokalov (PLAN_MAX_VENUES).
export type PlanFeature =
  | "wheel" | "emailBasic" | "customSegments" | "automations"
  | "advancedAnalytics" | "embedWidget" | "sms" | "whatsapp" | "export";

const ALL_FEATURES: Record<PlanFeature, boolean> = {
  wheel: true, emailBasic: true, customSegments: true, automations: true,
  advancedAnalytics: true, embedWidget: true, sms: true, whatsapp: true, export: true,
};

export const PLAN_FEATURES: Record<PlanKey, Record<PlanFeature, boolean>> = {
  free: { ...ALL_FEATURES }, // pilot: vse odprto
  start: { ...ALL_FEATURES },
  grow: { ...ALL_FEATURES },
  scale: { ...ALL_FEATURES },
};

// free = brezplačni preizkus: dovolimo toliko lokalov kot paket Veriga, da ga lastnik lahko preizkusi.
export const PLAN_MAX_VENUES: Record<PlanKey, number> = { free: 5, start: 1, grow: 5, scale: 999 };

export function planFeature(plan: PlanKey | undefined, f: PlanFeature): boolean {
  return PLAN_FEATURES[plan ?? "free"]?.[f] ?? false;
}
export function planMaxVenues(plan: PlanKey | undefined): number {
  // demo: en račun = en lokal; več lokalov odobri superadmin z dodelitvijo paketa Veriga ali Po meri
  if (DEMO && (plan ?? "free") === "free") return DEMO_MAX_VENUES;
  return PLAN_MAX_VENUES[plan ?? "free"] ?? 1;
}
export function rankPlan(p: PlanKey | undefined): number {
  return PLAN_ORDER.indexOf(p ?? "free");
}
/**
 * PER-LASTNIK model: ena naročnina pokrije lastnika + do N lokalov.
 * Vrne NAJBOLJŠI aktiven paket med lastnikovimi lokali (canceled ne šteje).
 * Če nima plačljivega → "free" (pilot = neomejeno).
 */
export function bestOwnerPlan(
  venues: { plan?: PlanKey | null; subscription_status?: string | null }[],
): PlanKey {
  let best: PlanKey = "free";
  for (const v of venues) {
    const p = (v.plan ?? "free") as PlanKey;
    const active = p !== "free" && v.subscription_status !== "canceled";
    if (active && rankPlan(p) > rankPlan(best)) best = p;
  }
  return best;
}

/** Osnovna mesečna cena za lokal (custom_price_eur povozi paketno ceno; npr. za Palačo). */
export function baseMonthly(plan: PlanKey | undefined, customPrice?: number | null): number {
  if (customPrice != null && customPrice > 0) return customPrice;
  const p = PLANS[plan ?? "free"];
  return p?.monthly ?? 0;
}

/** Mesečni ekvivalent prihodka (za MRR): letni znesek / 12. */
export function monthlyEquivalent(
  plan: PlanKey | undefined,
  cycle: BillingCycle | undefined,
  customPrice?: number | null,
): number {
  const base = baseMonthly(plan, customPrice);
  return cycle === "yearly" ? (base * YEARLY_MONTHS) / 12 : base;
}

/** Koliko lokal dejansko plača ob obračunu (mesečno ali letni znesek vnaprej = ×10). */
export function chargedAmount(
  plan: PlanKey | undefined,
  cycle: BillingCycle | undefined,
  customPrice?: number | null,
): number {
  const base = baseMonthly(plan, customPrice);
  return cycle === "yearly" ? base * YEARLY_MONTHS : base;
}

export function isPaying(plan: PlanKey | undefined, status: string | undefined): boolean {
  return (plan ?? "free") !== "free" && status !== "canceled";
}

export function fmtEur(n: number): string {
  return `${n.toLocaleString("sl-SI", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

export const STATUS_LABEL: Record<string, string> = {
  trialing: "Poskusno",
  active: "Aktivna",
  past_due: "Zapadlo",
  canceled: "Preklicana",
};
