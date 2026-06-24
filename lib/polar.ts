import crypto from "node:crypto";
import type { PlanKey, BillingCycle } from "@/lib/types";

// ── Polar (Merchant of Record) helper ────────────────────────────────────────
// Vzorec prevzet iz AskHerOut: surov Polar REST + svix-style podpis webhooka.
// Tally prodaja PONAVLJAJOČE naročnine (en Polar produkt na paket × cikel).

const POLAR_BASE = "https://api.polar.sh";

export function polarConfigured(): boolean {
  return Boolean(process.env.POLAR_API_TOKEN);
}

/** Env ime produkta za (paket × cikel). Palača/Brezplačni nimata self-serve checkouta. */
export function polarProductEnv(plan: PlanKey, cycle: BillingCycle): string | null {
  if (plan === "free" || plan === "palaca") return null;
  const key = `POLAR_PRODUCT_${plan.toUpperCase()}_${cycle.toUpperCase()}_ID`;
  return key;
}

export function polarProductId(plan: PlanKey, cycle: BillingCycle): string | undefined {
  const env = polarProductEnv(plan, cycle);
  return env ? process.env[env] : undefined;
}

/** Obratno: iz Polar product_id ugotovi (paket, cikel). Za webhook, ko metadata manjka. */
export function planFromProductId(productId: string | undefined): { plan: PlanKey; cycle: BillingCycle } | null {
  if (!productId) return null;
  const combos: [PlanKey, BillingCycle][] = [
    ["espresso", "monthly"], ["espresso", "yearly"],
    ["doppio", "monthly"], ["doppio", "yearly"],
  ];
  for (const [plan, cycle] of combos) {
    if (process.env[`POLAR_PRODUCT_${plan.toUpperCase()}_${cycle.toUpperCase()}_ID`] === productId) {
      return { plan, cycle };
    }
  }
  return null;
}

async function polarFetch(path: string, init: RequestInit): Promise<Response> {
  const token = process.env.POLAR_API_TOKEN;
  if (!token) throw new Error("POLAR_API_TOKEN ni nastavljen.");
  return fetch(`${POLAR_BASE}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });
}

/** Ustvari checkout sejo za naročnino. Vrne URL za preusmeritev kupca. */
export async function createCheckout(args: {
  productId: string;
  customerEmail?: string;
  successUrl: string;
  metadata: Record<string, string>;
}): Promise<{ url: string; id: string } | { error: string }> {
  const r = await polarFetch("/v1/checkouts/", {
    method: "POST",
    body: JSON.stringify({
      product_id: args.productId,
      customer_email: args.customerEmail || undefined,
      success_url: args.successUrl,
      allow_discount_codes: true,
      metadata: args.metadata,
    }),
  });
  if (!r.ok) {
    const text = await r.text();
    console.error("[polar checkout] non-2xx", r.status, text);
    return { error: "Checkouta ni bilo mogoče ustvariti." };
  }
  const data = (await r.json()) as { url?: string; id?: string };
  if (!data.url) return { error: "Polar ni vrnil URL checkouta." };
  return { url: data.url, id: data.id || "" };
}

/**
 * Spremeni paket OBSTOJEČE naročnine (mesečno↔letno / Start↔Grow) s proracijo —
 * Polar pripiše dobropis za neporabljeno + prilagodi naslednji obračun. BREZ nove naročnine.
 */
export async function updateSubscription(subscriptionId: string, productId: string): Promise<{ ok: true } | { error: string }> {
  const r = await polarFetch(`/v1/subscriptions/${subscriptionId}`, {
    method: "PATCH",
    body: JSON.stringify({ product_id: productId, proration_behavior: "prorate" }),
  });
  if (!r.ok) {
    const text = await r.text();
    console.error("[polar update-sub] non-2xx", r.status, text);
    return { error: "Spremembe paketa ni bilo mogoče izvesti." };
  }
  return { ok: true };
}

/** Ustvari sejo Polar kupčevega portala (upravljanje/preklic naročnine, kartica, računi). */
export async function createCustomerPortal(customerId: string): Promise<{ url: string } | { error: string }> {
  const r = await polarFetch("/v1/customer-sessions/", {
    method: "POST",
    body: JSON.stringify({ customer_id: customerId }),
  });
  if (!r.ok) {
    const text = await r.text();
    console.error("[polar portal] non-2xx", r.status, text);
    return { error: "Portala ni bilo mogoče odpreti." };
  }
  const data = (await r.json()) as { customer_portal_url?: string };
  if (!data.customer_portal_url) return { error: "Polar ni vrnil URL portala." };
  return { url: data.customer_portal_url };
}

// ── Webhook podpis (Standard Webhooks / svix-style HMAC) ─────────────────────
// Prevzeto iz AskHerOut: fail-closed v produkciji, ±5 min replay okno,
// constant-time primerjava, podpora polar_whs_/whsec_ predponam.
const TIMESTAMP_TOLERANCE_SEC = 5 * 60;

export function verifyPolarSignature(req: Request, raw: string): boolean {
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("[polar] POLAR_WEBHOOK_SECRET ni nastavljen v produkciji — zavrnjeno");
      return false;
    }
    console.warn("[polar] webhook secret ni nastavljen (dev) — dovoljeno");
    return true;
  }
  const id = req.headers.get("webhook-id") || "";
  const ts = req.headers.get("webhook-timestamp") || "";
  const sigHeader = req.headers.get("webhook-signature") || "";
  if (!id || !ts || !sigHeader) return false;

  const tsNum = Number(ts);
  if (!Number.isFinite(tsNum)) return false;
  const nowSec = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSec - tsNum) > TIMESTAMP_TOLERANCE_SEC) return false;

  const cleanSecret = secret.replace(/^(polar_whs_|whsec_)/, "");
  const candidateKeys: Buffer[] = [];
  try { candidateKeys.push(Buffer.from(cleanSecret, "base64")); } catch {}
  candidateKeys.push(Buffer.from(cleanSecret, "utf8"));
  candidateKeys.push(Buffer.from(secret, "utf8"));

  const payload = `${id}.${ts}.${raw}`;
  const candidateSigs = sigHeader.split(" ").map((s) => s.split(",")[1]).filter(Boolean);

  for (const key of candidateKeys) {
    const expected = crypto.createHmac("sha256", key).update(payload).digest("base64");
    const expBuf = Buffer.from(expected);
    for (const got of candidateSigs) {
      const gotBuf = Buffer.from(got);
      if (gotBuf.length === expBuf.length && crypto.timingSafeEqual(gotBuf, expBuf)) return true;
    }
  }
  return false;
}

/** Absolutni izvor aplikacije za success/cancel URL-je. */
export function appOrigin(req: Request): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const origin = req.headers.get("origin");
  if (origin) return origin;
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  return host ? `${proto}://${host}` : "http://localhost:3000";
}
