// Menjava elektronskega naslova računa (gost ali lastnik).
// Postopek: prijavljen uporabnik vpiše nov naslov → na NOVI naslov pošljemo podpisano povezavo →
// ko jo potrdi, zamenjamo naslov računa in vseh njegovih kartic → na STARI naslov gre obvestilo.
// Brez potrditve z novega naslova se ne spremeni nič, zato tujega naslova ni mogoče prevzeti.
import { createHmac, timingSafeEqual } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

const TTL_MS = 60 * 60 * 1000; // povezava velja eno uro
export const EMAIL_CHANGES_PER_DAY = 5;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validEmail(v: string): boolean {
  return EMAIL.test(v) && v.length <= 120;
}

function sign(payload: string): string {
  const secret = createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY || "dev").update("loyavi-email-change-v1").digest("hex");
  return createHmac("sha256", secret).update(payload).digest("base64url");
}
const enc = (s: string) => Buffer.from(s, "utf8").toString("base64url");
const dec = (s: string) => Buffer.from(s, "base64url").toString("utf8");

/** Žeton veže menjavo na račun, na njegov trenutni naslov in na novi naslov. */
export function emailChangeToken(userId: string, oldEmail: string, newEmail: string, now = Date.now()): string {
  const payload = `${userId}.${enc(oldEmail)}.${enc(newEmail)}.${now + TTL_MS}`;
  return `${payload}.${sign(payload)}`;
}

export function readEmailChangeToken(token: string | undefined | null): { userId: string; oldEmail: string; newEmail: string } | null {
  const parts = String(token ?? "").split(".");
  if (parts.length !== 5) return null;
  const [userId, o, n, exp, sig] = parts;
  const good = sign(`${userId}.${o}.${n}.${exp}`);
  try {
    if (sig.length !== good.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return null;
  } catch {
    return null;
  }
  if (!(Number(exp) > Date.now())) return null;
  const oldEmail = dec(o);
  const newEmail = dec(n);
  return validEmail(oldEmail) && validEmail(newEmail) ? { userId, oldEmail, newEmail } : null;
}

/** Ali naslov že pripada drugemu računu ali kartici. */
export async function emailTaken(db: SupabaseClient, email: string): Promise<boolean> {
  const { count } = await db.from("customers").select("id", { count: "exact", head: true }).eq("email", email);
  if ((count ?? 0) > 0) return true;
  for (let page = 1; page <= 20; page++) {
    const { data } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    const users = data?.users ?? [];
    if (users.some((u) => (u.email ?? "").toLowerCase() === email)) return true;
    if (users.length < 1000) break;
  }
  return false;
}

export type EmailChangeResult = { ok: true; oldEmail: string; newEmail: string } | { ok: false; code: "invalid" | "stale" | "taken" | "failed" };

/** Izvede potrjeno menjavo: naslov računa in naslov na vseh karticah. */
export async function applyEmailChange(db: SupabaseClient, token: string | undefined | null): Promise<EmailChangeResult> {
  const t = readEmailChangeToken(token);
  if (!t) return { ok: false, code: "invalid" };
  const { data } = await db.auth.admin.getUserById(t.userId);
  const user = data?.user;
  // naslov računa se je od zahteve že spremenil: povezava ne velja več
  if (!user?.email || user.email.toLowerCase() !== t.oldEmail) return { ok: false, code: "stale" };
  if (await emailTaken(db, t.newEmail)) return { ok: false, code: "taken" };

  const { error } = await db.auth.admin.updateUserById(user.id, { email: t.newEmail, email_confirm: true });
  if (error) return { ok: false, code: /already|registered|exists/i.test(error.message) ? "taken" : "failed" };

  // kartice so z računom povezane po naslovu, zato gredo z njim
  const { error: cardsError } = await db.from("customers").update({ email: t.newEmail }).eq("email", t.oldEmail);
  if (cardsError) {
    // kartice ne smejo ostati brez lastnika: račun vrnemo na stari naslov
    await db.auth.admin.updateUserById(user.id, { email: t.oldEmail, email_confirm: true });
    return { ok: false, code: "failed" };
  }
  return { ok: true, oldEmail: t.oldEmail, newEmail: t.newEmail };
}

/** Naslov za prikaz v obvestilu: prva črka in domena. */
export function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  return `${name.slice(0, 1)}${"*".repeat(Math.max(2, Math.min(6, name.length - 1)))}@${domain}`;
}
