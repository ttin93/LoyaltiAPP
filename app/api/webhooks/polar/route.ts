import { NextResponse, after } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { verifyPolarSignature, planFromProductId } from "@/lib/polar";
import { PLANS, chargedAmount, fmtEur } from "@/lib/plans";
import { notifyAdminPurchase } from "@/lib/notify";
import type { PlanKey, BillingCycle, SubStatus } from "@/lib/types";

// Polar webhook — sinhronizira stanje naročnine na lokal (venues).
// Dogodki: subscription.created / .active / .updated / .uncanceled / .canceled / .revoked
//
// Trdnost (prevzeto iz AskHerOut): fail-closed v produkciji brez secreta,
// ±5 min replay okno, constant-time podpis. Match lokala prek metadata.venueId,
// sicer prek polar_subscription_id / polar_customer_id.
export const runtime = "nodejs";

type PolarSub = {
  id?: string;
  status?: string;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean;
  customer_id?: string | null;
  product_id?: string | null;
  started_at?: string | null;
  metadata?: Record<string, unknown> | null;
};
type PolarEvent = { type: string; data?: PolarSub };

function mapStatus(s: string | undefined): SubStatus {
  switch (s) {
    case "trialing": return "trialing";
    case "past_due": return "past_due";
    case "canceled":
    case "unpaid":
    case "incomplete_expired": return "canceled";
    default: return "active";
  }
}

async function findVenue(meta: Record<string, string>, sub: PolarSub) {
  const db = getServiceClient();
  const tries: [string, string | undefined][] = [
    ["id", meta.venueId || meta.venue_id],
    ["polar_subscription_id", sub.id || undefined],
    ["polar_customer_id", sub.customer_id || undefined],
  ];
  for (const [col, val] of tries) {
    if (!val) continue;
    const { data } = await db.from("venues").select("id, subscribed_at").eq(col, val).maybeSingle();
    if (data) return data as { id: string; subscribed_at: string | null };
  }
  return null;
}

export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyPolarSignature(req, raw)) {
    return NextResponse.json({ error: "bad signature" }, { status: 401 });
  }

  let event: PolarEvent;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  if (!event.type?.startsWith("subscription.")) {
    return NextResponse.json({ ok: true, ignored: event.type });
  }

  const sub = event.data || {};
  const meta = (sub.metadata || {}) as Record<string, string>;
  const venue = await findVenue(meta, sub);
  if (!venue) {
    console.warn("[polar] subscription event brez ujemajočega lokala", { type: event.type, subId: sub.id });
    return NextResponse.json({ ok: true, matched: "none" });
  }

  const db = getServiceClient();
  const patch: Record<string, unknown> = {
    polar_subscription_id: sub.id ?? null,
    polar_customer_id: sub.customer_id ?? null,
  };

  if (event.type === "subscription.revoked") {
    // dostop končan — nazaj na brezplačni paket
    patch.plan = "free";
    patch.subscription_status = "canceled";
    patch.current_period_end = null;
    patch.cancel_at_period_end = false;
    patch.polar_subscription_id = null;
  } else {
    // created / active / updated / uncanceled / canceled
    const fromMeta = meta.plan && meta.cycle ? { plan: meta.plan as PlanKey, cycle: meta.cycle as BillingCycle } : null;
    const resolved = fromMeta || planFromProductId(sub.product_id ?? undefined);
    if (resolved) {
      patch.plan = resolved.plan;
      patch.billing_cycle = resolved.cycle;
    }
    patch.subscription_status = mapStatus(sub.status);
    patch.cancel_at_period_end = Boolean(sub.cancel_at_period_end);
    patch.current_period_end = sub.current_period_end ?? null;
    if (!venue.subscribed_at) patch.subscribed_at = sub.started_at || new Date().toISOString();
  }

  const { error } = await db.from("venues").update(patch).eq("id", venue.id);
  if (error) {
    console.error("[polar] update lokala spodletel", error);
    return NextResponse.json({ error: "db update failed" }, { status: 500 });
  }

  // Potrditev nakupa lastniku (ob aktivaciji naročnine) — best-effort
  if (event.type === "subscription.active") {
    after(async () => {
      try {
        const sb = getServiceClient();
        const { data: v } = await sb.from("venues").select("name, owner_user_id, plan, billing_cycle, custom_price_eur, current_period_end").eq("id", venue.id).single();
        if (!v?.owner_user_id) return;
        const { data: u } = await sb.auth.admin.getUserById(v.owner_user_id);
        const plan = (v.plan ?? "free") as PlanKey;
        await notifyAdminPurchase(u?.user?.email, {
          venueName: v.name as string,
          plan: PLANS[plan]?.label ?? plan,
          amount: fmtEur(chargedAmount(plan, v.billing_cycle as BillingCycle, v.custom_price_eur as number | null)),
          date: new Date().toLocaleDateString("sl-SI"),
          nextRenewal: v.current_period_end ? new Date(v.current_period_end as string).toLocaleDateString("sl-SI") : "—",
        });
      } catch (e) { console.error("[polar] purchase email", e); }
    });
  }

  return NextResponse.json({ ok: true, venueId: venue.id, type: event.type });
}

export function GET() {
  return NextResponse.json({ ok: true, endpoint: "polar-webhook" });
}
