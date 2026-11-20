// Nastavitve platforme brez nove tabele: vrstica v `email_log` (kind = 'platform_setting',
// venue_id in customer_id prazna, ref = "ključ=vrednost"). Velja zadnja vrstica za ključ.
import type { SupabaseClient } from "@supabase/supabase-js";
import { superadminEmails } from "@/lib/superadmin";

export const SETTING_KIND = "platform_setting";
const LEAD_KEY = "lead_email";
const EMAIL = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/;

/** Iz vnosa (naslovi, ločeni z vejico, podpičjem ali presledkom) vrne do pet veljavnih naslovov brez ponovitev. */
export function parseEmails(raw: string): string[] {
  const out: string[] = [];
  for (const part of String(raw ?? "").split(/[\s,;]+/)) {
    const e = part.trim().toLowerCase();
    if (e && EMAIL.test(e) && e.length <= 120 && !out.includes(e)) out.push(e);
  }
  return out.slice(0, 5);
}

async function readSetting(db: SupabaseClient, key: string): Promise<string | null> {
  const { data } = await db.from("email_log").select("ref").eq("kind", SETTING_KIND).is("venue_id", null).like("ref", `${key}=%`).order("created_at", { ascending: false }).limit(1);
  const ref = data?.[0]?.ref as string | undefined;
  return ref ? ref.slice(key.length + 1) : null;
}

async function writeSetting(db: SupabaseClient, key: string, value: string): Promise<boolean> {
  const { error } = await db.from("email_log").insert({ kind: SETTING_KIND, ref: `${key}=${value}` });
  if (error) return false;
  // stare vrednosti istega ključa niso več potrebne
  const { data } = await db.from("email_log").select("id").eq("kind", SETTING_KIND).is("venue_id", null).like("ref", `${key}=%`).order("created_at", { ascending: false }).range(1, 50);
  const old = (data ?? []).map((r) => r.id as string);
  if (old.length) await db.from("email_log").delete().in("id", old);
  return true;
}

/**
 * Kam gredo obvestila o novih povpraševanjih (kontaktni obrazec, prošnja za več lokalov).
 * Vrstni red: nastavitev iz superadmina, okoljska spremenljivka LEAD_NOTIFY_EMAIL, prvi skrbnik.
 * Vedno en naslov ali izrecno našteti naslovi, da isto obvestilo ne pride večkrat.
 */
export async function leadEmails(db: SupabaseClient): Promise<string[]> {
  try {
    const saved = parseEmails((await readSetting(db, LEAD_KEY)) ?? "");
    if (saved.length) return saved;
  } catch {
    /* brez nastavitve velja privzeti naslov */
  }
  const env = parseEmails(process.env.LEAD_NOTIFY_EMAIL ?? "");
  return env.length ? env : superadminEmails().slice(0, 1);
}

/** Shrani naslove za obvestila. Vrne shranjene naslove ali null, če ni nobenega veljavnega. */
export async function setLeadEmails(db: SupabaseClient, raw: string): Promise<string[] | null> {
  const list = parseEmails(raw);
  if (!list.length) return null;
  return (await writeSetting(db, LEAD_KEY, list.join(","))) ? list : null;
}
