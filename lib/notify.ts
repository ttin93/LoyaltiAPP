// Best-effort e-poštni sprožilci. Vsak je varen: če ni RESEND ključa (ali emaila)
// → tiho ne naredi nič. Nikoli ne vrže napake v glavni tok (vse v try/catch).
import { sendEmail, emailConfigured } from "@/lib/email";
import * as T from "@/lib/emailTemplate";
import { getServiceClient } from "@/lib/supabase/server";
import type { Venue } from "@/lib/types";

type V = Pick<Venue, "id" | "name" | "brand_color" | "public_code" | "stamp_goal" | "plan" | "resend_api_key" | "email_from">;

function origin() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "";
}
function guestSender(v: V) {
  return v.plan === "scale" && v.resend_api_key ? { apiKey: v.resend_api_key, from: v.email_from || undefined } : {};
}
function canGuest(v: V) {
  return emailConfigured() || !!(v.plan === "scale" && v.resend_api_key);
}
export function couponCode(v: { public_code?: string }) {
  return `${(v.public_code || "LOYA").slice(0, 4).toUpperCase()}-${Math.random().toString(16).slice(2, 6).toUpperCase()}`;
}
function gBase(v: V) {
  return { venueName: v.name, brandColor: v.brand_color, ctaUrl: `${origin()}/p/${v.public_code}` };
}
/** Best-effort vpis v email_log (lastnikov dnevnik pošiljanja). Nikoli ne vrže. */
async function logEmail(kind: string, venueId: string, customerEmail?: string | null) {
  try {
    const db = getServiceClient();
    let customerId: string | null = null;
    if (customerEmail) {
      const { data } = await db.from("customers").select("id").eq("venue_id", venueId).eq("email", customerEmail).maybeSingle();
      customerId = (data?.id as string) ?? null;
    }
    await db.from("email_log").insert({ kind, venue_id: venueId, customer_id: customerId });
  } catch { /* dnevnik ne sme podreti pošiljanja */ }
}

// ── GOST ──────────────────────────────────────────────────────────────────
export async function notifyWelcome(v: V, email?: string | null) {
  if (!email || !canGuest(v)) return;
  try {
    const db = getServiceClient();
    const { data: rw } = await db.from("rewards").select("name").eq("venue_id", v.id).eq("kind", "stamp").maybeSingle();
    const { data: prs } = await db.from("rewards").select("name, points_required, image_url").eq("venue_id", v.id).eq("kind", "points").order("points_required", { ascending: true }).limit(5);
    const pointRewards = (prs || []).map((r) => ({ name: r.name as string, points: r.points_required as number, image: (r.image_url as string | null) || null }));
    const html = T.emailWelcome(gBase(v), { rewardName: (rw?.name as string) || "Brezplačna kava", stampsTotal: v.stamp_goal || 10, pointRewards });
    const r = await sendEmail({ to: email, subject: `Dobrodošel pri ${v.name}! 👋`, html, ...guestSender(v) });
    if (r.ok) await logEmail("welcome", v.id, email);
  } catch (e) { console.error("[notify welcome]", e); }
}

export async function notifyPoints(v: V, email: string | null | undefined, d: { points: number; total: number; toReward: number | string; stampsFilled: number; rewardName: string }) {
  if (!email || !canGuest(v)) return;
  try {
    const html = T.emailPoints(gBase(v), { points: d.points, totalPoints: d.total, toReward: d.toReward, stampsFilled: d.stampsFilled, stampsTotal: v.stamp_goal || 10, rewardName: d.rewardName });
    const r = await sendEmail({ to: email, subject: "Dobil si točke za obisk! ⭐", html, ...guestSender(v) });
    if (r.ok) await logEmail("points", v.id, email);
  } catch (e) { console.error("[notify points]", e); }
}

export async function notifyCouponEarned(v: V, email: string | null | undefined, d: { rewardName: string }) {
  if (!email || !canGuest(v)) return;
  try {
    const html = T.emailCouponEarned(gBase(v), { rewardName: d.rewardName, couponCode: couponCode(v), stampsTotal: v.stamp_goal || 10 });
    const r = await sendEmail({ to: email, subject: `🎉 Čestitke! Zaslužil si ${d.rewardName}!`, html, ...guestSender(v) });
    if (r.ok) await logEmail("coupon_earned", v.id, email);
  } catch (e) { console.error("[notify coupon-earned]", e); }
}

export async function notifyReviewThanks(v: V, email: string | null | undefined, d: { stars: number; comment?: string }) {
  if (!email || !canGuest(v)) return;
  try {
    const html = T.emailReviewThanks(gBase(v), { stars: d.stars, comment: d.comment });
    const r = await sendEmail({ to: email, subject: "⭐ Hvala za vašo oceno!", html, ...guestSender(v) });
    if (r.ok) await logEmail("review_thanks", v.id, email);
  } catch (e) { console.error("[notify review]", e); }
}

export async function notifyWeMissYou(v: V, email: string | null | undefined, d: { days: number; lastVisit?: string }) {
  if (!email || !canGuest(v)) return;
  try {
    const html = T.emailWeMissYou(gBase(v), { days: d.days, lastVisit: d.lastVisit });
    await sendEmail({ to: email, subject: `Pogrešamo te pri ${v.name} 😔`, html, ...guestSender(v) });
  } catch (e) { console.error("[notify miss]", e); }
}

export async function notifyAnniversary(v: V, email: string | null | undefined, d: { visits: number | string; totalPoints: number | string; rewards: number | string; giftName: string }) {
  if (!email || !canGuest(v)) return;
  try {
    const html = T.emailAnniversary(gBase(v), { visits: d.visits, totalPoints: d.totalPoints, rewards: d.rewards, giftName: d.giftName, couponCode: couponCode(v) });
    await sendEmail({ to: email, subject: `🎂 Že eno leto skupaj — ${v.name} te razvaja!`, html, ...guestSender(v) });
  } catch (e) { console.error("[notify anniversary]", e); }
}

export async function notifyBirthdayVenue(v: V, email: string | null | undefined, d: { years: number | string; offer: string; offerDesc: string }) {
  if (!email || !canGuest(v)) return;
  try {
    const html = T.emailBirthdayVenue(gBase(v), { years: d.years, offer: d.offer, offerDesc: d.offerDesc });
    await sendEmail({ to: email, subject: `🎊 ${v.name} praznuje! Posebna ponudba.`, html, ...guestSender(v) });
  } catch (e) { console.error("[notify bday-venue]", e); }
}

export async function notifyBirthdayGuest(v: V, email: string | null | undefined, d: { giftName: string }) {
  if (!email || !canGuest(v)) return;
  try {
    const html = T.emailBirthdayGuest(gBase(v), { giftName: d.giftName, couponCode: couponCode(v) });
    await sendEmail({ to: email, subject: `🎂 Vse najboljše od ${v.name}!`, html, ...guestSender(v) });
  } catch (e) { console.error("[notify bday-guest]", e); }
}

// ── ADMIN (Loyavi → lastnik) — samo platformni ključ ─────────────────────────
export async function notifyOwnerWelcome(email: string | null | undefined, ownerName: string | null | undefined, venueName: string) {
  if (!email || !emailConfigured()) return;
  try {
    const html = T.emailOwnerWelcome({ ownerName: ownerName || undefined, venueName, ctaUrl: `${origin()}/dashboard` });
    await sendEmail({ to: email, subject: "🏪 Dobrodošli v Loyavi!", html });
  } catch (e) { console.error("[notify owner-welcome]", e); }
}

export async function notifyAdminPurchase(email: string | null | undefined, d: { venueName: string; plan: string; amount: string; date: string; nextRenewal: string }) {
  if (!email || !emailConfigured()) return;
  try {
    const html = T.emailAdminPurchase({ ...d, ctaUrl: `${origin()}/dashboard` });
    await sendEmail({ to: email, subject: "✅ Hvala za naročnino Loyavi", html });
  } catch (e) { console.error("[notify admin-purchase]", e); }
}

export async function notifyAdminExpiring(email: string | null | undefined, d: { venueName: string; plan: string; expiresOn: string }) {
  if (!email || !emailConfigured()) return;
  try {
    const html = T.emailAdminExpiring({ ...d, ctaUrl: `${origin()}/dashboard` });
    await sendEmail({ to: email, subject: "⏰ Tvoja Loyavi naročnina kmalu poteče", html });
  } catch (e) { console.error("[notify admin-expiring]", e); }
}
