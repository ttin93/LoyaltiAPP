"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { createSSRClient, getCurrentUser } from "@/lib/supabase/ssrServer";
import { getServiceClient } from "@/lib/supabase/server";
import { parseFiscalQR } from "@/lib/fiscalQr";
import type { WheelConfig, Automations, Venue } from "@/lib/types";
import { sendBatch, emailConfigured } from "@/lib/email";
import { emailCampaign } from "@/lib/emailTemplate";
import { categoryKey } from "@/lib/categories";
import { safeHex } from "@/lib/color";
import { mergeVenueMeta, newStandKey, venueMeta, type CheckinMode } from "@/lib/venueMeta";
import { grantCoupon } from "@/lib/coupons";
import { campaignParts, notifyAdminLead } from "@/lib/notify";
import { unsubscribedIds } from "@/lib/unsub";
import { DEMO, DEMO_CAMPAIGNS_PER_WEEK } from "@/lib/demo";

type Result = { ok: true } | { ok: false; error: string };
const fail = (error: string): Result => ({ ok: false, error });

/** Lokal, ki ga ureja prijavljeni lastnik. Vedno preveri lastništvo. */
async function owned(venueId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Nisi prijavljen.");
  const db = getServiceClient();
  const { data } = await db.from("venues").select("*").eq("id", venueId).eq("owner_user_id", user.id).maybeSingle();
  if (!data) throw new Error("Lokal ne obstaja ali ni tvoj.");
  return { user, db, venue: data as Venue };
}

const clamp = (n: unknown, lo: number, hi: number, dflt: number) => {
  const v = Number(n);
  return Number.isFinite(v) ? Math.min(hi, Math.max(lo, Math.round(v))) : dflt;
};
const text = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

// ── Profil lokala, pravila, način beleženja ──────────────────────────────────
export type VenuePatch = {
  name?: string;
  category?: string;
  city?: string;
  phone?: string;
  address?: string;
  website?: string;
  hours?: string;
  about?: string;
  listed?: boolean;
  checkin?: CheckinMode;
  color?: string;
  scanWindowHours?: number;
  cooldownMinutes?: number;
  redemptionMinutes?: number;
  googleReviewUrl?: string;
};

export async function saveVenue(venueId: string, p: VenuePatch): Promise<Result> {
  const { db, venue } = await owned(venueId);
  const cols: Record<string, unknown> = {};
  if (p.name !== undefined) {
    const name = text(p.name, 60);
    if (name.length < 2) return fail("Vpiši ime lokala.");
    cols.name = name;
  }
  if (p.category !== undefined) cols.venue_type = categoryKey(p.category);
  if (p.city !== undefined) cols.city = text(p.city, 60) || null;
  if (p.phone !== undefined) cols.phone = text(p.phone, 30) || null;
  if (p.color !== undefined) cols.brand_color = safeHex(p.color);
  if (p.scanWindowHours !== undefined) cols.scan_window_hours = clamp(p.scanWindowHours, 1, 9000, 24);
  if (p.cooldownMinutes !== undefined) cols.scan_cooldown_minutes = clamp(p.cooldownMinutes, 0, 1440, 0);
  if (p.redemptionMinutes !== undefined) cols.redemption_minutes = clamp(p.redemptionMinutes, 1, 60, 5);
  if (p.googleReviewUrl !== undefined) {
    const url = text(p.googleReviewUrl, 300);
    if (url && !/^https?:\/\//i.test(url)) return fail("Povezava naj se začne s https://");
    cols.google_review_url = url || null;
  }

  const meta: Parameters<typeof mergeVenueMeta>[1] = {};
  if (p.address !== undefined) meta.address = text(p.address, 120);
  if (p.hours !== undefined) meta.hours = text(p.hours, 200);
  if (p.about !== undefined) meta.about = text(p.about, 300);
  if (p.listed !== undefined) meta.listed = !!p.listed;
  if (p.website !== undefined) {
    const w = text(p.website, 200);
    meta.website = w && !/^https?:\/\//i.test(w) ? `https://${w}` : w;
  }
  if (p.checkin !== undefined) {
    meta.checkin = p.checkin === "stand" || p.checkin === "both" ? p.checkin : "receipt";
    if (!venueMeta(venue).standKey) meta.standKey = newStandKey();
  }
  if (Object.keys(meta).length) cols.automations = mergeVenueMeta(venue.automations, meta);

  if (!Object.keys(cols).length) return { ok: true };
  const { error } = await db.from("venues").update(cols).eq("id", venue.id);
  if (error) return fail("Shranjevanje ni uspelo.");
  revalidatePath("/dashboard");
  return { ok: true };
}

/** Kartica: število žigov in nagrada za polno kartico. */
export async function saveCard(venueId: string, p: { goal: number; reward: string; color?: string }): Promise<Result> {
  const { db, venue } = await owned(venueId);
  const goal = clamp(p.goal, 4, 12, 8);
  const reward = text(p.reward, 60);
  if (!reward) return fail("Vpiši nagrado.");
  const cols: Record<string, unknown> = { stamp_goal: goal };
  if (p.color !== undefined) cols.brand_color = safeHex(p.color);
  await db.from("venues").update(cols).eq("id", venue.id);

  const { data: existing } = await db.from("rewards").select("id").eq("venue_id", venue.id).eq("kind", "stamp").limit(1);
  if (existing?.length) {
    const { error } = await db.from("rewards").update({ name: reward, points_required: goal }).eq("id", existing[0].id);
    if (error) return fail("Nagrada s tem imenom že obstaja. Izberi drugo ime.");
  } else {
    const { error } = await db.from("rewards").insert({ venue_id: venue.id, name: reward, points_required: goal, sort_order: 1, kind: "stamp" });
    if (error) return fail("Nagrada s tem imenom že obstaja. Izberi drugo ime.");
  }
  revalidatePath("/dashboard");
  return { ok: true };
}

// ── Skeniranje računov: davčna številka izdajatelja ───────────────────────────
/** Iz vzorčnega fiskalnega računa prebere davčno številko lokala in vklopi skeniranje. */
export async function activateScanning(venueId: string, payload: string): Promise<{ ok: true; davcna: string } | { ok: false; error: string }> {
  const { db, venue } = await owned(venueId);
  try {
    const parsed = parseFiscalQR(payload);
    await db.from("venues").update({ davcna_stevilka: parsed.davcna }).eq("id", venue.id);
    revalidatePath("/dashboard");
    return { ok: true, davcna: parsed.davcna };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Kode ni mogoče prebrati." };
  }
}

export async function setDavcna(venueId: string, value: string): Promise<Result> {
  const { db, venue } = await owned(venueId);
  const dav = value.replace(/\D/g, "");
  if (dav && dav.length !== 8) return fail("Davčna številka ima 8 števk.");
  await db.from("venues").update({ davcna_stevilka: dav || null }).eq("id", venue.id);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function regenerateStandKey(venueId: string): Promise<Result> {
  const { db, venue } = await owned(venueId);
  await db.from("venues").update({ automations: mergeVenueMeta(venue.automations, { standKey: newStandKey() }) }).eq("id", venue.id);
  revalidatePath("/dashboard");
  return { ok: true };
}

// ── Kolo, avtomatizacije ─────────────────────────────────────────────────────
export async function saveWheel(venueId: string, config: WheelConfig): Promise<Result> {
  const { db, venue } = await owned(venueId);
  const segments = (config.segments ?? [])
    .map((s) => ({ label: text(s.label, 28), weight: clamp(s.weight, 0, 100, 1) }))
    .filter((s) => s.label)
    .slice(0, 8);
  if (segments.length < 2) return fail("Kolo potrebuje vsaj dva segmenta.");
  const clean: WheelConfig = {
    enabled: config.enabled !== false,
    mode: config.mode === "fixed" ? "fixed" : "weighted",
    winner: clamp(config.winner, 0, segments.length - 1, 0),
    segments,
  };
  await db.from("venues").update({ wheel_config: clean }).eq("id", venue.id);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function saveAutomations(venueId: string, autos: Automations): Promise<Result> {
  const { db, venue } = await owned(venueId);
  // ohrani v2 nastavitve lokala, ki živijo v istem stolpcu
  const keep = (venue.automations as Record<string, unknown> | null | undefined)?.__v2;
  const clean: Record<string, unknown> = {};
  for (const [k, a] of Object.entries(autos ?? {})) {
    if (k.startsWith("__") || !a) continue;
    clean[k] = {
      enabled: !!a.enabled,
      message: text(a.message, 600),
      coupon: !!a.coupon,
      couponName: text(a.couponName, 60),
      ...(a.days !== undefined ? { days: clamp(a.days, 7, 365, 30) } : {}),
      ...(a.date !== undefined ? { date: /^\d{2}-\d{2}$/.test(String(a.date)) ? a.date : "" } : {}),
    };
  }
  if (keep) clean.__v2 = keep;
  await db.from("venues").update({ automations: clean }).eq("id", venue.id);
  revalidatePath("/dashboard");
  return { ok: true };
}

// ── Gostje: ročni žig, podarjen kupon ────────────────────────────────────────
export async function giftCoupon(venueId: string, customerId: string, name: string): Promise<Result> {
  const { db, venue } = await owned(venueId);
  const label = text(name, 60);
  if (!label) return fail("Vpiši, kaj podarjaš.");
  const { data: c } = await db.from("customers").select("id").eq("id", customerId).eq("venue_id", venue.id).maybeSingle();
  if (!c) return fail("Gost ne obstaja.");
  await grantCoupon(db, { venueId: venue.id, customerId, name: label, source: "manual", status: "ready" });
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function addManualStamp(venueId: string, customerId: string): Promise<Result> {
  const { db, venue } = await owned(venueId);
  const { data: c } = await db.from("customers").select("id, stamps").eq("id", customerId).eq("venue_id", venue.id).maybeSingle();
  if (!c) return fail("Gost ne obstaja.");
  const goal = venue.stamp_goal || 10;
  const next = (c.stamps ?? 0) + 1;
  if (next >= goal) {
    const { data: rw } = await db.from("rewards").select("name").eq("venue_id", venue.id).eq("kind", "stamp").limit(1);
    await db.from("customers").update({ stamps: next - goal }).eq("id", customerId);
    await grantCoupon(db, { venueId: venue.id, customerId, name: (rw?.[0]?.name as string) || "Nagrada", source: "card", status: "ready" });
  } else {
    await db.from("customers").update({ stamps: next }).eq("id", customerId);
  }
  await db.from("point_grants").insert({ venue_id: venue.id, customer_id: customerId, points: 0, note: "ročni žig" });
  revalidatePath("/dashboard");
  return { ok: true };
}

// ── Kampanja po elektronski pošti ────────────────────────────────────────────
export type Segment = "all" | "active" | "inactive" | "close";

export async function sendCampaign(
  venueId: string,
  a: { subject: string; message: string; segment: Segment; couponName?: string },
): Promise<{ ok: true; sent: number; failed: number; total: number } | { ok: false; error: string }> {
  const { db, venue } = await owned(venueId);
  const subject = text(a.subject, 120);
  const message = text(a.message, 2000);
  if (!subject || !message) return { ok: false, error: "Vpiši zadevo in sporočilo." };
  if (!emailConfigured()) return { ok: false, error: "Pošiljanje pošte še ni nastavljeno." };

  const { data: custs } = await db.from("customers").select("id, email, stamps").eq("venue_id", venue.id).not("email", "is", null).limit(5000);
  let list = (custs ?? []) as { id: string; email: string; stamps: number }[];
  if (a.segment === "close") {
    const goal = venue.stamp_goal || 10;
    list = list.filter((c) => goal - (c.stamps ?? 0) <= 2);
  } else if (a.segment === "active" || a.segment === "inactive") {
    const since = new Date(Date.now() - 30 * 864e5).toISOString();
    const { data: recent } = await db.from("scans").select("customer_id").eq("venue_id", venue.id).gte("created_at", since).limit(20000);
    const activeIds = new Set((recent ?? []).map((r) => r.customer_id as string));
    list = list.filter((c) => (a.segment === "active" ? activeIds.has(c.id) : !activeIds.has(c.id)));
  }
  // gostje, ki so se odjavili od sporočil tega lokala, jih ne prejmejo
  const off = await unsubscribedIds(db, venue.id);
  list = list.filter((c) => !off.has(c.id));
  if (!list.length) return { ok: false, error: "V izbrani skupini ni gostov." };
  if (list.length > 400) return { ok: false, error: "Skupina je prevelika za eno pošiljanje. Izberi ožjo skupino." };

  // demo: omejeno število kampanj na teden (vsi lokali si delijo isto kvoto pošte)
  if (DEMO) {
    const since = new Date(Date.now() - 7 * 864e5).toISOString();
    const { data: recent } = await db.from("email_log").select("created_at").eq("venue_id", venue.id).eq("kind", "campaign").gte("created_at", since).limit(5000);
    // vrstice ene kampanje se vpišejo skupaj; štejemo različne minute pošiljanja
    const runs = new Set((recent ?? []).map((r) => String(r.created_at).slice(0, 16)));
    if (runs.size >= DEMO_CAMPAIGNS_PER_WEEK) {
      return { ok: false, error: `V demo obdobju lahko pošlješ ${DEMO_CAMPAIGNS_PER_WEEK} kampanji na teden. Naslednjo lahko pošlješ čez nekaj dni.` };
    }
  }

  const couponName = text(a.couponName, 60);
  const items = list.map((c) => ({
    to: c.email,
    subject,
    html: emailCampaign(campaignParts(venue, c.id).base, { heading: subject, message, couponName: couponName || undefined }),
  }));
  const { sent, failed } = await sendBatch(items, campaignParts(venue, list[0].id).sender);

  if (sent > 0) {
    try {
      if (couponName) {
        for (const c of list) await grantCoupon(db, { venueId: venue.id, customerId: c.id, name: couponName, source: "campaign", status: "ready", validDays: 30 });
      }
      await db.from("email_log").insert(list.map((c) => ({ kind: "campaign", venue_id: venue.id, customer_id: c.id })));
    } catch {
      /* dnevnik ne sme podreti kampanje */
    }
  }
  revalidatePath("/dashboard");
  return { ok: true, sent, failed, total: items.length };
}

// ── Povpraševanje za več lokalov (demo: en račun = en lokal) ─────────────────
export async function requestMoreVenues(venueId: string, a: { locations: number; message: string }): Promise<Result> {
  const { user, db, venue } = await owned(venueId);
  const email = user.email ?? "";
  if (!email) return fail("Računu manjka elektronski naslov.");
  const locations = clamp(a.locations, 2, 500, 2);
  const message = text(a.message, 1000);

  // največ eno povpraševanje na račun na dan
  const since = new Date(Date.now() - 864e5).toISOString();
  const { count } = await db.from("leads").select("id", { count: "exact", head: true }).eq("email", email).eq("heard", "veriga").gte("created_at", since);
  if ((count ?? 0) > 0) return fail("Povpraševanje si že poslal. Odgovorimo ti po elektronski pošti.");

  const body = `Število lokalov: ${locations}.${message ? `\n\n${message}` : ""}`;
  const { error } = await db.from("leads").insert({ venue: venue.name, email, phone: venue.phone ?? null, venue_type: venue.venue_type ?? null, city: venue.city ?? null, heard: "veriga", message: body });
  if (error) return fail("Povpraševanja ni bilo mogoče poslati. Poskusi znova ali nam piši.");

  after(() =>
    notifyAdminLead({
      heading: "Povpraševanje za več lokalov",
      rows: [
        ["Lokal", venue.name],
        ["Račun", email],
        ["Kraj", venue.city ?? "ni vpisano"],
        ["Število lokalov", String(locations)],
      ],
      message,
      replyTo: email,
    }),
  );
  return { ok: true };
}

// ── Logo ─────────────────────────────────────────────────────────────────────
export async function uploadLogo(venueId: string, formData: FormData): Promise<Result> {
  const { db, venue } = await owned(venueId);
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return fail("Izberi sliko.");
  if (file.size > 2 * 1024 * 1024) return fail("Slika naj bo manjša od 2 MB.");
  if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) return fail("Dovoljene so slike PNG, JPG in WEBP.");
  const ext = file.type.includes("png") ? "png" : file.type.includes("webp") ? "webp" : "jpg";
  const path = `${venue.id}/logo-${Date.now()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await db.storage.from("logos").upload(path, buf, { contentType: file.type, upsert: true });
  if (upErr) return fail("Nalaganje ni uspelo.");
  const url = db.storage.from("logos").getPublicUrl(path).data.publicUrl;
  await db.from("venues").update({ logo_url: url }).eq("id", venue.id);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function removeLogo(venueId: string): Promise<Result> {
  const { db, venue } = await owned(venueId);
  await db.from("venues").update({ logo_url: null }).eq("id", venue.id);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function signOut() {
  const supabase = await createSSRClient();
  await supabase.auth.signOut();
  redirect("/");
}
