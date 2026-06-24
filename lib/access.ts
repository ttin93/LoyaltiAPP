import type { Venue, PlanKey } from "@/lib/types";

export type AccessState = "active" | "trialing" | "trial" | "expired";

export type Access = {
  state: AccessState;
  ok: boolean; // ali ima dostop do aplikacije
  daysLeft: number; // za trial / trialing
  /** Datum naslednjega obračuna ali konca triala (ISO) */
  until: string | null;
};

const DAY = 24 * 60 * 60 * 1000;

/**
 * Dostop na nivoju LASTNIKA. `plan` = bestOwnerPlan, `bill` = primarni lokal
 * (kjer živi naročnina). nowMs prek argumenta (server/klient enako).
 */
export function ownerAccess(plan: PlanKey, bill: Pick<Venue, "subscription_status" | "current_period_end" | "trial_ends_at"> | null, nowMs: number): Access {
  const status = bill?.subscription_status ?? "active";
  const periodEnd = bill?.current_period_end ? new Date(bill.current_period_end).getTime() : null;
  const trialEnd = bill?.trial_ends_at ? new Date(bill.trial_ends_at).getTime() : null;
  const paid = plan !== "free" && status !== "canceled";

  // Polar trial (kartica vnaprej) — status trialing
  if (paid && status === "trialing") {
    const days = periodEnd ? Math.max(0, Math.ceil((periodEnd - nowMs) / DAY)) : 0;
    return { state: "trialing", ok: true, daysLeft: days, until: bill?.current_period_end ?? null };
  }
  // plačljiv + aktiven (obdobje še teče ali brez izteka)
  if (paid && (periodEnd == null || periodEnd > nowMs)) {
    return { state: "active", ok: true, daysLeft: 0, until: bill?.current_period_end ?? null };
  }
  // brezplačen trial / grace / superadmin podaljšanje
  if (trialEnd && trialEnd > nowMs) {
    const days = Math.max(0, Math.ceil((trialEnd - nowMs) / DAY));
    return { state: "trial", ok: true, daysLeft: days, until: bill?.trial_ends_at ?? null };
  }
  return { state: "expired", ok: false, daysLeft: 0, until: bill?.trial_ends_at ?? null };
}
