// Sprožilci elektronskih sporočil. Vsak je varen: brez ključa za pošto ali naslova tiho
// ne naredi nič in nikoli ne vrže napake v glavni tok.
import { sendEmail, emailConfigured } from "@/lib/email";
import * as T from "@/lib/emailTemplate";
import { getServiceClient } from "@/lib/supabase/server";
import { siteOrigin } from "@/lib/brand";
import { venueMeta } from "@/lib/venueMeta";
import { stampRewardName } from "@/lib/venues";
import { categoryDefaultReward } from "@/lib/categories";
import { unsubUrl } from "@/lib/unsub";
import type { Venue } from "@/lib/types";

type V = Pick<Venue, "id" | "name" | "brand_color" | "public_code" | "stamp_goal" | "plan" | "resend_api_key" | "email_from" | "automations" | "venue_type">;

/** Pošiljatelj za goste: ime lokala, naslov platforme (ali lastna domena pri paketu po meri). */
function guestSender(v: V): { apiKey?: string; from?: string } {
  if (v.plan === "scale" && v.resend_api_key) return { apiKey: v.resend_api_key, from: v.email_from || undefined };
  const base = process.env.RESEND_FROM || "";
  const addr = base.match(/<([^>]+)>/)?.[1] || (base.includes("@") ? base.trim() : "");
  if (!addr) return {};
  const name = v.name.replace(/["<>\r\n]/g, "").trim().slice(0, 60);
  return { from: `${name} prek Loyavi <${addr}>` };
}
const canGuest = (v: V) => emailConfigured() || !!(v.plan === "scale" && v.resend_api_key);
const base = (v: V, customerId?: string): T.GuestBase => ({
  venueName: v.name,
  brandColor: v.brand_color,
  ctaUrl: `${siteOrigin()}/p/${v.public_code}`,
  unsubUrl: customerId ? unsubUrl(customerId) : undefined,
});

/** Zapis v dnevnik pošiljanja (lastnik ga vidi v nadzorni plošči). Nikoli ne vrže. */
async function logEmail(kind: string, venueId: string, customer: { id?: string | null; email?: string | null }) {
  try {
    const db = getServiceClient();
    let customerId = customer.id ?? null;
    if (!customerId && customer.email) {
      const { data } = await db.from("customers").select("id").eq("venue_id", venueId).eq("email", customer.email).maybeSingle();
      customerId = (data?.id as string) ?? null;
    }
    await db.from("email_log").insert({ kind, venue_id: venueId, customer_id: customerId });
  } catch {
    /* dnevnik ne sme podreti pošiljanja */
  }
}

async function rewardOf(v: V): Promise<string> {
  try {
    return (await stampRewardName(getServiceClient(), v.id)) || categoryDefaultReward(v.venue_type);
  } catch {
    return categoryDefaultReward(v.venue_type);
  }
}

// ── GOST: osnovna sporočila ─────────────────────────────────────────────────
export async function notifyWelcome(v: V, email?: string | null) {
  if (!email || !canGuest(v)) return;
  try {
    const html = T.emailWelcome(base(v), { goal: v.stamp_goal || 10, reward: await rewardOf(v), checkin: venueMeta(v).checkin });
    const r = await sendEmail({ to: email, subject: `Tvoja kartica pri lokalu ${v.name} je pripravljena`, html, ...guestSender(v) });
    if (r.ok) await logEmail("welcome", v.id, { email });
  } catch (e) {
    console.error("[notify welcome]", e);
  }
}

export async function notifyCouponEarned(v: V, email: string | null | undefined, d: { rewardName: string }) {
  if (!email || !canGuest(v)) return;
  try {
    const html = T.emailCouponEarned(base(v), { goal: v.stamp_goal || 10, reward: d.rewardName });
    const r = await sendEmail({ to: email, subject: `Kartica je polna. Čaka te: ${d.rewardName}`, html, ...guestSender(v) });
    if (r.ok) await logEmail("coupon_earned", v.id, { email });
  } catch (e) {
    console.error("[notify coupon-earned]", e);
  }
}

// ── GOST: samodejna marketinška sporočila (z odjavo) ────────────────────────
const SUBJECT: Record<T.MarketingKind, (v: string) => string> = {
  we_miss_you: (v) => `${v}: nekaj časa te ni bilo`,
  birthday_guest: (v) => `Vse najboljše od ekipe ${v}`,
  anniversary: (v) => `Eno leto s kartico lokala ${v}`,
  birthday_venue: (v) => `${v} praznuje`,
};

/** Vrne true, če je bilo sporočilo oddano. Dnevnik zapiše klicatelj (cron), ker ga rabi za dedup. */
export async function notifyMarketing(v: V, customer: { id: string; email: string }, kind: T.MarketingKind, d: { message: string; couponName?: string }): Promise<boolean> {
  if (!customer.email || !canGuest(v)) return false;
  try {
    const html = T.emailMarketing(base(v, customer.id), kind, d);
    const r = await sendEmail({ to: customer.email, subject: SUBJECT[kind](v.name), html, ...guestSender(v) });
    return r.ok;
  } catch (e) {
    console.error(`[notify ${kind}]`, e);
    return false;
  }
}

/** Pošiljatelj in osnova za kampanje (uporabi strežniška akcija). */
export function campaignParts(v: V, customerId: string) {
  return { base: base(v, customerId), sender: guestSender(v) };
}

// ── LASTNIK (Loyavi → lokal): samo platformni ključ ─────────────────────────
const dash = () => `${siteOrigin()}/dashboard`;

export async function notifyOwnerWelcome(email: string | null | undefined, _ownerName: string | null | undefined, venueName: string) {
  if (!email || !emailConfigured()) return;
  try {
    await sendEmail({ to: email, subject: `Lokal ${venueName} je ustvarjen. Kaj sledi`, html: T.emailOwnerWelcome({ venueName, ctaUrl: dash() }) });
  } catch (e) {
    console.error("[notify owner-welcome]", e);
  }
}

export async function notifyAdminPurchase(email: string | null | undefined, d: { venueName: string; plan: string; amount: string; date: string; nextRenewal: string }) {
  if (!email || !emailConfigured()) return;
  try {
    await sendEmail({ to: email, subject: "Naročnina Loyavi je aktivna", html: T.emailAdminPurchase({ ...d, ctaUrl: dash() }) });
  } catch (e) {
    console.error("[notify admin-purchase]", e);
  }
}

export async function notifyAdminExpiring(email: string | null | undefined, d: { venueName: string; plan: string; expiresOn: string; trial: boolean }) {
  if (!email || !emailConfigured()) return;
  try {
    const subject = d.trial ? `Brezplačni preizkus se izteče ${d.expiresOn}` : `Naročnina Loyavi se izteče ${d.expiresOn}`;
    await sendEmail({ to: email, subject, html: T.emailAdminExpiring({ ...d, ctaUrl: `${dash()}?s=narocnina` }) });
  } catch (e) {
    console.error("[notify admin-expiring]", e);
  }
}
