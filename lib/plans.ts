import type { PlanKey, BillingCycle } from "@/lib/types";

/** Letni popust: letno = 12 mesecev z X % popusta (npr. 0.20 = −20 %). Spremeni na enem mestu. */
export const YEARLY_DISCOUNT = 0.2;

export const PLANS: Record<PlanKey, { label: string; tag: string; monthly: number | null }> = {
  free: { label: "Brezplačni", tag: "Začetni", monthly: 0 },
  espresso: { label: "Espresso", tag: "En lokal", monthly: 49.99 },
  doppio: { label: "Doppio", tag: "Marketinški stroj", monthly: 79.99 },
  palaca: { label: "Palača", tag: "Po dogovoru", monthly: null }, // cena po dogovoru → custom_price_eur
};

export const PLAN_ORDER: PlanKey[] = ["free", "espresso", "doppio", "palaca"];

/** Osnovna mesečna cena za lokal (custom_price_eur povozi paketno ceno; npr. za Palačo). */
export function baseMonthly(plan: PlanKey | undefined, customPrice?: number | null): number {
  if (customPrice != null && customPrice > 0) return customPrice;
  const p = PLANS[plan ?? "free"];
  return p?.monthly ?? 0;
}

/** Mesečni ekvivalent prihodka (za MRR): letni paket šteje z letnim popustom. */
export function monthlyEquivalent(
  plan: PlanKey | undefined,
  cycle: BillingCycle | undefined,
  customPrice?: number | null,
): number {
  const base = baseMonthly(plan, customPrice);
  return cycle === "yearly" ? base * (1 - YEARLY_DISCOUNT) : base;
}

/** Koliko lokal dejansko plača ob obračunu (mesečno ali letni znesek vnaprej). */
export function chargedAmount(
  plan: PlanKey | undefined,
  cycle: BillingCycle | undefined,
  customPrice?: number | null,
): number {
  const base = baseMonthly(plan, customPrice);
  return cycle === "yearly" ? base * 12 * (1 - YEARLY_DISCOUNT) : base;
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
