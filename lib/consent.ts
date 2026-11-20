// Soglasja gosta. Brez sprememb sheme:
//  - sprejem pogojev in izbira o ponudbah sta v `app_metadata` uporabnika (piše ju samo strežnik),
//  - dovoljenje za ponudbe posameznega lokala je vrstica v `email_log`
//    (kind = 'marketing_optin', ref = različica besedila in vir), odjava je vrstica 'unsubscribe'.
// Lokal sme gostu poslati ponudbo samo, če ima gost pri njem dovoljenje in se ni odjavil.
// Obvestila o kartici (dobrodošlica, polna kartica) niso ponudbe in soglasja ne potrebujejo.
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { UNSUB_KIND } from "@/lib/unsub";

/** Različica besedil, ki jih gost potrdi (datum zadnje vsebinske spremembe pogojev). */
export const TERMS_VERSION = "2026-11-20";
/** Najstarejša različica, ki še velja. Povečaj samo ob bistveni spremembi pogojev: takrat vsi potrdijo znova. */
export const TERMS_MIN = "2026-11-20";
export const OPTIN_KIND = "marketing_optin";
/** Vrstice v dnevniku, ki niso poslana sporočila. */
export const NON_EMAIL_KINDS = [UNSUB_KIND, OPTIN_KIND];

export type ConsentState = { termsOk: boolean; marketing: boolean };
type Stored = { terms?: string; terms_at?: string; marketing?: boolean; marketing_at?: string };
type Source = "prijava" | "profil" | "pridruzitev" | "odjava";

const stored = (user: Pick<User, "app_metadata"> | null | undefined): Stored => ((user?.app_metadata ?? {}) as { consent?: Stored }).consent ?? {};

export function consentOf(user: Pick<User, "app_metadata"> | null | undefined): ConsentState {
  const c = stored(user);
  return { termsOk: typeof c.terms === "string" && c.terms >= TERMS_MIN, marketing: c.marketing === true };
}

/** Pot do koraka s soglasji, ki gosta po potrditvi vrne na `next`. */
export function consentPath(next: string): string {
  return `/prijava/soglasje?next=${encodeURIComponent(next)}`;
}

const ref = (source: Source) => `${TERMS_VERSION}:${source}`;

/** Dovoljenje za ponudbe enega lokala (ob pridružitvi ali ponovni prijavi na sporočila). */
export async function setVenueMarketing(db: SupabaseClient, venueId: string, customerId: string, on: boolean, source: Source): Promise<void> {
  if (on) {
    await db.from("email_log").delete().eq("venue_id", venueId).eq("customer_id", customerId).eq("kind", UNSUB_KIND);
    await db.from("email_log").insert({ kind: OPTIN_KIND, venue_id: venueId, customer_id: customerId, ref: ref(source) });
    return;
  }
  const { count } = await db.from("email_log").select("id", { count: "exact", head: true }).eq("venue_id", venueId).eq("customer_id", customerId).eq("kind", UNSUB_KIND);
  if (!count) await db.from("email_log").insert({ kind: UNSUB_KIND, venue_id: venueId, customer_id: customerId, ref: ref(source) });
}

export async function venueMarketingOn(db: SupabaseClient, venueId: string, customerId: string): Promise<boolean> {
  const { data } = await db.from("email_log").select("kind").eq("venue_id", venueId).eq("customer_id", customerId).in("kind", NON_EMAIL_KINDS).limit(200);
  const kinds = new Set((data ?? []).map((r) => r.kind as string));
  return kinds.has(OPTIN_KIND) && !kinds.has(UNSUB_KIND);
}

/** Gostje lokala, ki jim lokal sme pošiljati ponudbe. */
export async function marketingAllowedIds(db: SupabaseClient, venueId: string): Promise<Set<string>> {
  const yes = new Set<string>();
  const no = new Set<string>();
  const PAGE = 1000;
  for (let from = 0; from < 100000; from += PAGE) {
    const { data } = await db.from("email_log").select("customer_id, kind").eq("venue_id", venueId).in("kind", NON_EMAIL_KINDS).order("created_at", { ascending: true }).range(from, from + PAGE - 1);
    const rows = (data ?? []) as { customer_id: string | null; kind: string }[];
    for (const r of rows) if (r.customer_id) (r.kind === OPTIN_KIND ? yes : no).add(r.customer_id);
    if (rows.length < PAGE) break;
  }
  for (const id of no) yes.delete(id);
  return yes;
}

/** Izbiro o ponudbah prenese na vse kartice gosta. */
async function syncMarketing(db: SupabaseClient, email: string, on: boolean, source: Source): Promise<void> {
  const { data } = await db.from("customers").select("id, venue_id").eq("email", email).limit(500);
  const rows = (data ?? []) as { id: string; venue_id: string }[];
  if (!rows.length) return;
  const ids = rows.map((r) => r.id);
  if (on) {
    await db.from("email_log").delete().in("customer_id", ids).eq("kind", UNSUB_KIND);
    await db.from("email_log").insert(rows.map((r) => ({ kind: OPTIN_KIND, venue_id: r.venue_id, customer_id: r.id, ref: ref(source) })));
    return;
  }
  const { data: off } = await db.from("email_log").select("customer_id").in("customer_id", ids).eq("kind", UNSUB_KIND);
  const has = new Set((off ?? []).map((r) => r.customer_id as string));
  const add = rows.filter((r) => !has.has(r.id));
  if (add.length) await db.from("email_log").insert(add.map((r) => ({ kind: UNSUB_KIND, venue_id: r.venue_id, customer_id: r.id, ref: ref(source) })));
}

/**
 * Zapiše sprejem pogojev in izbiro o ponudbah. Čas zapiše strežnik, zato je zapis dokaz,
 * kdaj in na katero različico besedila je gost pristal.
 */
export async function saveConsent(db: SupabaseClient, user: User, a: { acceptTerms: boolean; marketing: boolean }): Promise<void> {
  if (!user.email) throw new Error("Račun nima elektronskega naslova.");
  const now = new Date().toISOString();
  const prev = stored(user);
  const next: Stored = { ...prev };
  if (a.acceptTerms) {
    next.terms = TERMS_VERSION;
    next.terms_at = now;
  }
  const changed = prev.marketing !== a.marketing || !prev.marketing_at;
  if (changed) {
    next.marketing = a.marketing;
    next.marketing_at = now;
  }
  const { error } = await db.auth.admin.updateUserById(user.id, { app_metadata: { ...(user.app_metadata ?? {}), consent: next } });
  if (error) throw error;
  if (changed) await syncMarketing(db, user.email.toLowerCase(), a.marketing, a.acceptTerms ? "prijava" : "profil");
}
