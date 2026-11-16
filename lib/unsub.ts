// Odjava od marketinških sporočil lokala. Brez sprememb sheme: odjava je vrstica
// v `email_log` (kind = 'unsubscribe', venue_id, customer_id). Povezava je podpisana.
import { createHmac, timingSafeEqual } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
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

/** Gostje lokala, ki ne želijo marketinških sporočil. */
export async function unsubscribedIds(db: SupabaseClient, venueId: string): Promise<Set<string>> {
  const { data } = await db.from("email_log").select("customer_id").eq("venue_id", venueId).eq("kind", UNSUB_KIND).limit(1000);
  return new Set((data ?? []).map((r) => r.customer_id as string).filter(Boolean));
}

export async function isUnsubscribed(db: SupabaseClient, venueId: string, customerId: string): Promise<boolean> {
  const { count } = await db.from("email_log").select("id", { count: "exact", head: true }).eq("venue_id", venueId).eq("customer_id", customerId).eq("kind", UNSUB_KIND);
  return (count ?? 0) > 0;
}

export async function setUnsubscribed(db: SupabaseClient, venueId: string, customerId: string, off: boolean): Promise<void> {
  if (off) {
    if (!(await isUnsubscribed(db, venueId, customerId))) await db.from("email_log").insert({ kind: UNSUB_KIND, venue_id: venueId, customer_id: customerId });
  } else {
    await db.from("email_log").delete().eq("venue_id", venueId).eq("customer_id", customerId).eq("kind", UNSUB_KIND);
  }
}
