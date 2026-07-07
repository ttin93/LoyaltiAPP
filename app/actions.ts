"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { createSSRClient, getCurrentUser } from "@/lib/supabase/ssrServer";
import { getServiceClient } from "@/lib/supabase/server";
import { parseFiscalQR } from "@/lib/fiscalQr";
import type { WheelConfig, Automations } from "@/lib/types";
import { PLANS, bestOwnerPlan, planMaxVenues } from "@/lib/plans";
import { sendBatch, emailConfigured } from "@/lib/email";
import { emailCampaign } from "@/lib/emailTemplate";
import { notifyOwnerWelcome } from "@/lib/notify";

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[čć]/g, "c")
      .replace(/š/g, "s")
      .replace(/ž/g, "z")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 24) || "lokal"
  );
}

async function ownerVenue() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Nisi prijavljen.");
  const db = getServiceClient();
  // limit(1) namesto maybeSingle: maybeSingle vrže napako, če je lastnik nekoč ustvaril >1 lokal
  const { data: venues } = await db
    .from("venues")
    .select("*")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1);
  return { user, db, venue: venues?.[0] ?? null };
}

export async function createVenue(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Nisi prijavljen.");
  const db = getServiceClient();

  // PER-LASTNIK limit: koliko lokalov že ima + njegov najboljši aktiven paket
  const { data: owned } = await db
    .from("venues")
    .select("plan, subscription_status")
    .eq("owner_user_id", user.id);
  const ownerPlan = bestOwnerPlan(owned ?? []);
  const maxVenues = planMaxVenues(ownerPlan);
  if ((owned?.length ?? 0) >= maxVenues) {
    throw new Error(
      `Tvoj paket (${PLANS[ownerPlan].label}) dovoljuje ${maxVenues} ${maxVenues === 1 ? "lokal" : "lokalov"}. Nadgradi za več.`,
    );
  }

  const name = String(formData.get("name") || "").trim();
  const brand = String(formData.get("brand_color") || "#16a34a");
  if (!name) throw new Error("Vpiši ime lokala.");

  const owner_name = String(formData.get("owner_name") || "").trim() || null;
  const phone = String(formData.get("phone") || "").trim() || null;
  const venue_type = String(formData.get("venue_type") || "").trim() || null;
  const city = String(formData.get("city") || "").trim() || null;
  const points_model = formData.get("points_model") === "per_euro" ? "per_euro" : "per_visit";

  // nastavljiv žig-cilj (4–12) + točk na obisk (lahko 0 = samo žigi)
  const rawPts = Number(formData.get("points_per_visit"));
  const pointsPerVisit = Math.min(50, Math.max(0, Number.isFinite(rawPts) ? rawPts : 10));
  const stampGoal = Math.min(12, Math.max(4, Number(formData.get("stamp_goal")) || 10));
  const rewardName = String(formData.get("reward_name") || "").trim() || "Brezplačna kava";

  // točkovne nagrade (urejene v onboardingu); prazne/0 odpademo
  let extraRewards: { name: string; points: number }[] = [];
  try {
    const parsed = JSON.parse(String(formData.get("point_rewards") || "[]"));
    if (Array.isArray(parsed)) extraRewards = parsed;
  } catch {
    /* ignore */
  }
  const pointRewardRows = extraRewards
    .map((r) => ({ name: String(r?.name || "").trim(), points: Math.max(0, Number(r?.points) || 0) }))
    .filter((r) => r.name && r.points > 0)
    .map((r, i) => ({ name: r.name, points: r.points, sort: i + 2 }));

  // unikaten public_code: ime + 8 naključnih številk (dovoljuje več lokalov z istim
  // imenom + koda je težje ugibljiva/naštevljiva). Ob (astronomsko redkem) trku regeneriraj.
  const base = slugify(name);
  const rand8 = () => String(Math.floor(Math.random() * 1e8)).padStart(8, "0");
  let code = `${base}-${rand8()}`;
  for (let i = 0; i < 6; i++) {
    const { data: existing } = await db
      .from("venues")
      .select("id")
      .eq("public_code", code)
      .maybeSingle();
    if (!existing) break;
    code = `${base}-${rand8()}`;
  }

  const { data: venue, error } = await db
    .from("venues")
    .insert({ owner_user_id: user.id, name, brand_color: brand, public_code: code, owner_name, phone, venue_type, city, points_model, points_per_visit: pointsPerVisit, stamp_goal: stampGoal, trial_ends_at: new Date(Date.now() + 30 * 864e5).toISOString() })
    .select("*")
    .single();
  if (error) throw error;

  // kava = ŽIGI (poln kartonček = stampGoal žigov); druge nagrade = TOČKE
  await db.from("rewards").insert([
    { venue_id: venue.id, name: rewardName, points_required: stampGoal, sort_order: 1, kind: "stamp" },
    ...pointRewardRows.map((r) => ({ venue_id: venue.id, name: r.name, points_required: r.points, sort_order: r.sort, kind: "points" })),
  ]);

  after(() => notifyOwnerWelcome(user.email, owner_name, name));
  redirect("/dashboard");
}

export async function updateVenueSettings(formData: FormData) {
  const { db, venue } = await ownerVenue();
  if (!venue) throw new Error("Nimaš lokala.");
  const patch: Record<string, unknown> = {};
  if (formData.has("name")) patch.name = String(formData.get("name")).trim();
  if (formData.has("brand_color")) patch.brand_color = String(formData.get("brand_color"));
  if (formData.has("points_per_visit"))
    patch.points_per_visit = Math.max(0, Number(formData.get("points_per_visit")) || 0);
  if (formData.has("stamp_goal"))
    patch.stamp_goal = Math.min(12, Math.max(4, Number(formData.get("stamp_goal")) || 10));
  if (formData.has("scan_window_hours"))
    patch.scan_window_hours = Number(formData.get("scan_window_hours"));
  if (formData.has("scan_cooldown_minutes"))
    patch.scan_cooldown_minutes = Math.max(0, Number(formData.get("scan_cooldown_minutes")) || 0);
  if (formData.has("google_review_url"))
    patch.google_review_url = String(formData.get("google_review_url")).trim() || null;
  if (formData.has("language")) patch.language = String(formData.get("language")) || "sl";
  if (formData.has("davcna_stevilka")) {
    const dav = String(formData.get("davcna_stevilka")).replace(/\D/g, "").slice(0, 8);
    patch.davcna_stevilka = dav.length === 8 ? dav : null;
  }
  const { error } = await db.from("venues").update(patch).eq("id", venue.id);
  if (error) throw error;
  revalidatePath("/dashboard");
}

/** Aktiviraj skeniranje: iz vzorčnega fiskalnega QR preberi davčno izdajatelja. */
export async function activateScanning(payload: string): Promise<string> {
  const { db, venue } = await ownerVenue();
  if (!venue) throw new Error("Nimaš lokala.");
  const parsed = parseFiscalQR(payload); // vrže, če neveljaven
  await db.from("venues").update({ davcna_stevilka: parsed.davcna }).eq("id", venue.id);
  revalidatePath("/dashboard");
  return parsed.davcna;
}

export async function saveReward(formData: FormData) {
  const { db, venue } = await ownerVenue();
  if (!venue) throw new Error("Nimaš lokala.");
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const points = Number(formData.get("points_required"));
  const kind = formData.get("kind") === "stamp" ? "stamp" : "points";
  if (!name || !points) throw new Error("Vpiši ime in vrednost.");
  if (id) {
    await db
      .from("rewards")
      .update({ name, points_required: points })
      .eq("id", id)
      .eq("venue_id", venue.id);
  } else {
    await db
      .from("rewards")
      .insert({ venue_id: venue.id, name, points_required: points, sort_order: 99, kind });
  }
  revalidatePath("/dashboard");
}

/**
 * Testiraj fiskalni račun BREZ dodeljevanja točk: pove ali je veljaven za ta lokal
 * in ali je unikaten. (Ne gleda ure/datuma — samo struktura, davčna in ZOI.)
 */
export async function testReceipt(payload: string): Promise<{ ok: boolean; msg: string }> {
  const { db, venue } = await ownerVenue();
  if (!venue) throw new Error("Nimaš lokala.");
  let parsed;
  try {
    parsed = parseFiscalQR(payload);
  } catch (e) {
    return { ok: false, msg: e instanceof Error ? e.message : "QR ni veljaven fiskalni račun." };
  }
  if (venue.davcna_stevilka && parsed.davcna !== venue.davcna_stevilka) {
    return { ok: false, msg: `Račun ni tega lokala (davčna ${parsed.davcna}).` };
  }
  const { data: dup } = await db
    .from("scans")
    .select("id")
    .eq("zoi", parsed.zoiHex)
    .maybeSingle();
  if (dup) return { ok: false, msg: "Račun je že bil uporabljen — ni unikaten." };
  return { ok: true, msg: `Veljaven račun · davčna ${parsed.davcna}` };
}

export async function deleteReward(id: string) {
  const { db, venue } = await ownerVenue();
  if (!venue) throw new Error("Nimaš lokala.");
  await db.from("rewards").delete().eq("id", id).eq("venue_id", venue.id);
  revalidatePath("/dashboard");
}

export async function addManualPoints(customerId: string, points: number) {
  const { db, venue } = await ownerVenue();
  if (!venue) throw new Error("Nimaš lokala.");
  const { data: c } = await db
    .from("customers")
    .select("id, venue_id, points")
    .eq("id", customerId)
    .single();
  if (!c || c.venue_id !== venue.id) throw new Error("Neveljavna stranka.");
  await db
    .from("customers")
    .update({ points: c.points + points })
    .eq("id", customerId);
  // dnevnik: kdo/kdaj/koliko (vidno v Zgodovini)
  await db.from("point_grants").insert({ venue_id: venue.id, customer_id: customerId, points });
  revalidatePath("/dashboard");
}

/** Shrani konfiguracijo kolesa sreče. */
export async function saveWheel(config: WheelConfig) {
  const { db, venue } = await ownerVenue();
  if (!venue) throw new Error("Nimaš lokala.");
  await db.from("venues").update({ wheel_config: config }).eq("id", venue.id);
  revalidatePath("/dashboard");
}

/** Shrani marketing avtomatizacije. */
export async function saveAutomations(autos: Automations) {
  const { db, venue } = await ownerVenue();
  if (!venue) throw new Error("Nimaš lokala.");
  await db.from("venues").update({ automations: autos }).eq("id", venue.id);
  revalidatePath("/dashboard");
}

/** Lokal → gostje: pošlji branded e-pošto kampanjo. Scale lahko uporabi svoj Resend ključ. */
export async function sendGuestCampaign(args: { subject: string; message: string; emails: string[] }): Promise<{ sent: number; failed: number; total: number; error?: string }> {
  const { venue } = await ownerVenue();
  if (!venue) throw new Error("Nimaš lokala.");
  if (!args.subject.trim() || !args.message.trim()) return { sent: 0, failed: 0, total: 0, error: "Vpiši zadevo in sporočilo." };
  const emails = (args.emails || []).filter((e) => e && /.+@.+\..+/.test(e));
  if (!emails.length) return { sent: 0, failed: 0, total: 0, error: "Ni prejemnikov z e-pošto." };
  const byo = venue.plan === "scale" && venue.resend_api_key
    ? { apiKey: venue.resend_api_key as string, from: (venue.email_from as string) || undefined }
    : null;
  if (!byo && !emailConfigured()) return { sent: 0, failed: 0, total: 0, error: "E-pošta še ni nastavljena (RESEND_API_KEY)." };
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "";
  const ctaUrl = origin ? `${origin}/p/${venue.public_code}` : "#";
  const items = emails.map((to) => ({
    to,
    subject: args.subject,
    html: emailCampaign({ venueName: venue.name, brandColor: venue.brand_color, ctaUrl }, { heading: args.subject, message: args.message }),
  }));
  const { sent, failed } = await sendBatch(items, byo ? { apiKey: byo.apiKey, from: byo.from } : undefined);
  // dnevnik pošiljanja (best-effort): zabeleži prejemnike kampanje
  if (sent > 0) {
    try {
      const db = getServiceClient();
      const { data: recips } = await db.from("customers").select("id").eq("venue_id", venue.id).in("email", emails);
      if (recips?.length) await db.from("email_log").insert(recips.map((r) => ({ kind: "campaign", venue_id: venue.id, customer_id: r.id })));
    } catch { /* dnevnik ne sme podreti kampanje */ }
  }
  return { sent, failed, total: items.length };
}

/** Scale: shrani lasten Resend ključ + pošiljatelja (BYO domena). */
export async function saveEmailSettings(formData: FormData) {
  const { db, venue } = await ownerVenue();
  if (!venue) throw new Error("Nimaš lokala.");
  const key = String(formData.get("resend_api_key") || "").trim() || null;
  const from = String(formData.get("email_from") || "").trim() || null;
  await db.from("venues").update({ resend_api_key: key, email_from: from }).eq("id", venue.id);
  revalidatePath("/dashboard");
}

/** Naloži logo lokala v Storage (bucket "logos") + shrani URL na venue. */
export async function uploadLogo(formData: FormData): Promise<{ url?: string; error?: string }> {
  const { db, venue } = await ownerVenue();
  if (!venue) throw new Error("Nimaš lokala.");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Ni datoteke." };
  if (file.size > 2 * 1024 * 1024) return { error: "Slika naj bo manjša od 2 MB." };
  if (!/^image\/(png|jpe?g|webp|svg\+xml)$/.test(file.type)) return { error: "Dovoljeni: PNG, JPG, WEBP, SVG." };
  const ext = file.type.includes("svg") ? "svg" : file.type.includes("png") ? "png" : file.type.includes("webp") ? "webp" : "jpg";
  const path = `${venue.id}/logo-${Date.now()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await db.storage.from("logos").upload(path, buf, { contentType: file.type, upsert: true });
  if (upErr) return { error: "Nalaganje ni uspelo: " + upErr.message };
  const url = db.storage.from("logos").getPublicUrl(path).data.publicUrl;
  const { error } = await db.from("venues").update({ logo_url: url }).eq("id", venue.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { url };
}

export async function removeLogo() {
  const { db, venue } = await ownerVenue();
  if (!venue) throw new Error("Nimaš lokala.");
  await db.from("venues").update({ logo_url: null }).eq("id", venue.id);
  revalidatePath("/dashboard");
}

/** Naloži sliko nagrade v Storage (bucket "logos") + shrani URL na nagrado. */
export async function uploadRewardImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  const { db, venue } = await ownerVenue();
  if (!venue) throw new Error("Nimaš lokala.");
  const rewardId = String(formData.get("rewardId") || "");
  if (!rewardId) return { error: "Manjka nagrada." };
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Ni datoteke." };
  if (file.size > 2 * 1024 * 1024) return { error: "Slika naj bo manjša od 2 MB." };
  if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) return { error: "Dovoljeni: PNG, JPG, WEBP." };
  // varnost: nagrada mora pripadati lokalu lastnika
  const { data: rw } = await db.from("rewards").select("id").eq("id", rewardId).eq("venue_id", venue.id).maybeSingle();
  if (!rw) return { error: "Nagrada ne obstaja." };
  const ext = file.type.includes("png") ? "png" : file.type.includes("webp") ? "webp" : "jpg";
  const path = `${venue.id}/reward-${rewardId}-${Date.now()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await db.storage.from("logos").upload(path, buf, { contentType: file.type, upsert: true });
  if (upErr) return { error: "Nalaganje ni uspelo: " + upErr.message };
  const url = db.storage.from("logos").getPublicUrl(path).data.publicUrl;
  const { error } = await db.from("rewards").update({ image_url: url }).eq("id", rewardId).eq("venue_id", venue.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { url };
}

export async function removeRewardImage(rewardId: string) {
  const { db, venue } = await ownerVenue();
  if (!venue) throw new Error("Nimaš lokala.");
  await db.from("rewards").update({ image_url: null }).eq("id", rewardId).eq("venue_id", venue.id);
  revalidatePath("/dashboard");
}

export async function signOut() {
  const supabase = await createSSRClient();
  await supabase.auth.signOut();
  redirect("/partner");
}
