"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/supabase/ssrServer";
import { getServiceClient } from "@/lib/supabase/server";
import { isSuperadmin } from "@/lib/superadmin";

async function assertSuperadmin() {
  const user = await getCurrentUser();
  if (!user || !isSuperadmin(user.email)) throw new Error("Nimaš dostopa.");
  return getServiceClient();
}

/** Superadmin lahko ureja KATERIKOLI lokal (ne le svojega). */
export async function adminUpdateVenue(formData: FormData) {
  const db = await assertSuperadmin();
  const venueId = String(formData.get("venue_id") || "");
  if (!venueId) throw new Error("Manjka lokal.");

  const patch: Record<string, unknown> = {};
  if (formData.has("name")) patch.name = String(formData.get("name")).trim();
  if (formData.has("brand_color")) patch.brand_color = String(formData.get("brand_color"));
  if (formData.has("points_per_visit"))
    patch.points_per_visit = Math.max(0, Number(formData.get("points_per_visit")) || 0);
  if (formData.has("stamp_goal"))
    patch.stamp_goal = Math.min(12, Math.max(4, Number(formData.get("stamp_goal")) || 10));
  if (formData.has("scan_window_hours"))
    patch.scan_window_hours = Math.max(1, Number(formData.get("scan_window_hours")) || 24);
  if (formData.has("scan_cooldown_minutes"))
    patch.scan_cooldown_minutes = Math.max(0, Number(formData.get("scan_cooldown_minutes")) || 0);
  if (formData.has("google_review_url"))
    patch.google_review_url = String(formData.get("google_review_url")).trim() || null;
  if (formData.has("language")) patch.language = String(formData.get("language")) || "sl";
  if (formData.has("davcna_stevilka")) {
    const dav = String(formData.get("davcna_stevilka")).replace(/\D/g, "").slice(0, 8);
    patch.davcna_stevilka = dav.length === 8 ? dav : null;
  }

  // naročnina
  const PLANS = ["free", "espresso", "doppio", "palaca"];
  const STATUSES = ["trialing", "active", "past_due", "canceled"];
  let planVal: string | undefined;
  if (formData.has("plan")) {
    planVal = PLANS.includes(String(formData.get("plan"))) ? String(formData.get("plan")) : "free";
    patch.plan = planVal;
  }
  if (formData.has("billing_cycle"))
    patch.billing_cycle = String(formData.get("billing_cycle")) === "yearly" ? "yearly" : "monthly";
  if (formData.has("subscription_status"))
    patch.subscription_status = STATUSES.includes(String(formData.get("subscription_status")))
      ? String(formData.get("subscription_status"))
      : "active";
  if (formData.has("commitment_months"))
    patch.commitment_months = Math.max(0, Math.min(60, Number(formData.get("commitment_months")) || 0));
  if (formData.has("custom_price_eur")) {
    const raw = String(formData.get("custom_price_eur")).replace(",", ".").trim();
    const n = raw ? Number(raw) : NaN;
    patch.custom_price_eur = Number.isFinite(n) && n > 0 ? n : null;
  }

  // ob prehodu na plačljiv paket zabeleži začetek naročnine (če še ni)
  if (planVal && planVal !== "free") {
    const { data: cur } = await db.from("venues").select("subscribed_at").eq("id", venueId).maybeSingle();
    if (!cur?.subscribed_at) patch.subscribed_at = new Date().toISOString();
  }

  const { error } = await db.from("venues").update(patch).eq("id", venueId);
  if (error) throw error;
  revalidatePath("/superadmin");
}

/** Podaljšaj (ali zaženi) brezplačni trial lokalu za N dni — comp/test escape hatch. */
export async function adminExtendTrial(formData: FormData) {
  const db = await assertSuperadmin();
  const venueId = String(formData.get("venue_id") || "");
  const days = Math.max(1, Math.min(365, Number(formData.get("days")) || 14));
  if (!venueId) throw new Error("Manjka lokal.");
  const { data: cur } = await db.from("venues").select("trial_ends_at").eq("id", venueId).maybeSingle();
  const curMs = cur?.trial_ends_at ? new Date(cur.trial_ends_at as string).getTime() : 0;
  const base = curMs > Date.now() ? curMs : Date.now(); // podaljšaj od konca, sicer od danes
  const next = new Date(base + days * 864e5).toISOString();
  const { error } = await db.from("venues").update({ trial_ends_at: next }).eq("id", venueId);
  if (error) throw error;
  revalidatePath("/superadmin");
}
