// Gostov račun (Supabase Auth) in njegova članstva pri lokalih.
// Članstvo = vrstica v `customers` (venue_id + email). Povezava z računom po e-naslovu.
import type { SupabaseClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/supabase/ssrServer";
import { consentOf, setVenueMarketing } from "@/lib/consent";

export type Guest = {
  id: string;
  email: string;
  name: string | null;
  birthday: string | null;
  /** Gost je sprejel veljavne pogoje uporabe. Brez tega ne zbira žigov. */
  termsOk: boolean;
  /** Gost želi ponudbe lokalov, pri katerih ima kartico. */
  marketing: boolean;
};

/** Odgovor poti API, kadar gost še ni potrdil pogojev. */
export const NEEDS_CONSENT = { ok: false, consent: true, error: "Najprej potrdi pogoje uporabe." } as const;

export type Member = {
  id: string;
  venue_id: string;
  email: string | null;
  stamps: number;
  points: number;
  birthday: string | null;
  created_at: string;
};

const MEMBER_COLS = "id, venue_id, email, stamps, points, birthday, created_at";
const BDAY = /^\d{2}-\d{2}$/;

export function validBirthday(v: unknown): v is string {
  if (typeof v !== "string" || !BDAY.test(v)) return false;
  const [mm, dd] = v.split("-").map(Number);
  return mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31;
}

/** Prijavljen gost iz seje (piškotki) ali null. */
export async function getGuest(): Promise<Guest | null> {
  const u = await getCurrentUser();
  if (!u?.email) return null;
  const md = (u.user_metadata ?? {}) as Record<string, unknown>;
  const name = typeof md.name === "string" ? md.name : typeof md.full_name === "string" ? md.full_name : null;
  return {
    id: u.id,
    email: u.email.toLowerCase(),
    name: name?.trim() || null,
    birthday: validBirthday(md.birthday) ? md.birthday : null,
    ...consentOf(u),
  };
}

export async function memberships(db: SupabaseClient, email: string): Promise<Member[]> {
  const { data } = await db.from("customers").select(MEMBER_COLS).eq("email", email).order("created_at", { ascending: false }).limit(200);
  return (data ?? []) as Member[];
}

export async function membership(db: SupabaseClient, venueId: string, email: string): Promise<Member | null> {
  const { data } = await db.from("customers").select(MEMBER_COLS).eq("venue_id", venueId).eq("email", email).maybeSingle();
  return (data as Member | null) ?? null;
}

/** Vrne članstvo gosta pri lokalu; če ga še ni, ga ustvari. */
export async function ensureMembership(db: SupabaseClient, venueId: string, guest: Guest): Promise<{ member: Member; isNew: boolean }> {
  const existing = await membership(db, venueId, guest.email);
  if (existing) return { member: existing, isNew: false };
  // rojstni dan prevzamemo iz obstoječega članstva (zapisan samo enkrat), šele nato iz profila
  const { data: known } = await db.from("customers").select("birthday").eq("email", guest.email).not("birthday", "is", null).limit(1);
  const birthday = (known?.[0]?.birthday as string | undefined) ?? guest.birthday;
  const { data, error } = await db
    .from("customers")
    .insert({ venue_id: venueId, email: guest.email, birthday })
    .select(MEMBER_COLS)
    .single();
  if (error) {
    // sočasen vnos (unique venue_id+email) → preberi obstoječega
    const again = await membership(db, venueId, guest.email);
    if (again) return { member: again, isNew: false };
    throw error;
  }
  const member = data as Member;
  // izbira o ponudbah z računa velja tudi za novo kartico
  if (guest.marketing) {
    try {
      await setVenueMarketing(db, venueId, member.id, true, "pridruzitev");
    } catch {
      /* brez zapisa lokal gostu ponudb ne pošilja, kartica pa deluje */
    }
  }
  return { member, isNew: true };
}

/** Datum v Sloveniji (YYYY-MM-DD) — za dnevno omejitev žiga s stojala. */
export function localDay(d = new Date()): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Ljubljana" }).format(d);
}
