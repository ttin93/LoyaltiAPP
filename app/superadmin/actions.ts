"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/supabase/ssrServer";
import { getServiceClient } from "@/lib/supabase/server";
import { isSuperadmin } from "@/lib/superadmin";
import { bestOwnerPlan } from "@/lib/plans";
import { sendBatch, emailConfigured } from "@/lib/email";
import { brandedEmail, textToHtml } from "@/lib/emailTemplate";
import type { PlanKey, LogEntry } from "@/lib/types";

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

/**
 * Super-admin → LASTNIKI: pošlji branded e-pošto (ponudbe/novice) po segmentu.
 * Segmenti: all / paying / trial / free.
 */
export async function sendOwnerCampaign(formData: FormData): Promise<{ sent: number; failed: number; total: number; error?: string }> {
  const db = await assertSuperadmin();
  const subject = String(formData.get("subject") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const segment = String(formData.get("segment") || "all");
  if (!subject || !message) return { sent: 0, failed: 0, total: 0, error: "Vpiši zadevo in sporočilo." };
  if (!emailConfigured()) return { sent: 0, failed: 0, total: 0, error: "E-pošta ni nastavljena (RESEND_API_KEY)." };

  const now = Date.now();
  const [{ data: venues }, usersRes] = await Promise.all([
    db.from("venues").select("owner_user_id, plan, subscription_status, trial_ends_at"),
    db.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);
  const rows = (venues ?? []) as { owner_user_id: string | null; plan?: PlanKey; subscription_status?: string; trial_ends_at?: string | null }[];
  const byOwner = new Map<string, typeof rows>();
  for (const r of rows) {
    if (!r.owner_user_id) continue;
    const arr = byOwner.get(r.owner_user_id) ?? [];
    arr.push(r);
    byOwner.set(r.owner_user_id, arr);
  }

  const recipients: string[] = [];
  for (const u of usersRes.data?.users ?? []) {
    if (!u.email) continue;
    const owned = byOwner.get(u.id) ?? [];
    const plan = bestOwnerPlan(owned);
    const paying = plan !== "free";
    const onTrial = !paying && owned.some((v) => v.trial_ends_at && new Date(v.trial_ends_at).getTime() > now);
    const match =
      segment === "all" ||
      (segment === "paying" && paying) ||
      (segment === "trial" && onTrial) ||
      (segment === "free" && !paying && !onTrial);
    if (match) recipients.push(u.email);
  }

  const items = recipients.map((to) => ({
    to,
    subject,
    html: brandedEmail({
      brandName: "Tally",
      brandColor: "#C4623D",
      heading: subject,
      bodyHtml: textToHtml(message),
    }),
  }));
  const { sent, failed } = await sendBatch(items, { from: process.env.RESEND_FROM });
  return { sent, failed, total: items.length };
}

/** Per-lokal dnevnik: zadnji skeni / unovčenja / ročne točke / ocene (za super-admin). */
export async function adminVenueLog(venueId: string): Promise<LogEntry[]> {
  const db = await assertSuperadmin();
  if (!venueId) return [];
  type C = { email?: string | null; phone?: string | null } | null;
  const [s, r, g, rev] = await Promise.all([
    db.from("scans").select("created_at, points_awarded, customers(email, phone)").eq("venue_id", venueId).order("created_at", { ascending: false }).limit(20),
    db.from("redemptions").select("created_at, points_spent, rewards(name), customers(email, phone)").eq("venue_id", venueId).order("created_at", { ascending: false }).limit(20),
    db.from("point_grants").select("created_at, points, customers(email, phone)").eq("venue_id", venueId).order("created_at", { ascending: false }).limit(10),
    db.from("reviews").select("created_at, stars, to_google").eq("venue_id", venueId).order("created_at", { ascending: false }).limit(10),
  ]);
  const who = (c: C) => c?.email || c?.phone || "gost";
  const out: LogEntry[] = [];
  for (const x of (s.data ?? []) as { created_at: string; points_awarded: number; customers: C }[]) out.push({ type: "sken", when: x.created_at, detail: `${who(x.customers)} · +${x.points_awarded} t` });
  for (const x of (r.data ?? []) as { created_at: string; points_spent: number; rewards: { name?: string } | null; customers: C }[]) out.push({ type: "unovčenje", when: x.created_at, detail: `${who(x.customers)} · ${x.rewards?.name ?? "nagrada"} (−${x.points_spent})` });
  for (const x of (g.data ?? []) as { created_at: string; points: number; customers: C }[]) out.push({ type: "ročno", when: x.created_at, detail: `${who(x.customers)} · +${x.points} t (admin)` });
  for (const x of (rev.data ?? []) as { created_at: string; stars: number; to_google: boolean }[]) out.push({ type: "ocena", when: x.created_at, detail: `${x.stars}★ ${x.to_google ? "→ Google" : "zasebno"}` });
  return out.sort((a, b) => (a.when < b.when ? 1 : -1)).slice(0, 40);
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
