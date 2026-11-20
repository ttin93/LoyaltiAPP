// Podpisana povezava za odjavo od ponudb lokala. Odjava je vrstica v `email_log`
// (kind = 'unsubscribe', venue_id, customer_id); stanje in pravila so v lib/consent.ts.
import { createHmac, timingSafeEqual } from "crypto";
import { siteOrigin } from "@/lib/brand";

export const UNSUB_KIND = "unsubscribe";

function secret(): string {
  return createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY || "dev").update("loyavi-unsub-v1").digest("hex");
}

export function unsubToken(customerId: string): string {
  return createHmac("sha256", secret()).update(customerId).digest("hex").slice(0, 32);
}

export function unsubValid(customerId: string, token: string | undefined): boolean {
  if (!customerId || !token) return false;
  const good = unsubToken(customerId);
  try {
    return token.length === good.length && timingSafeEqual(Buffer.from(token), Buffer.from(good));
  } catch {
    return false;
  }
}

export function unsubUrl(customerId: string): string {
  return `${siteOrigin()}/odjava?c=${customerId}&t=${unsubToken(customerId)}`;
}
