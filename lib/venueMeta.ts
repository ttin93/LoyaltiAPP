// Dodatne nastavitve lokala za v2. Dokler ni čistilne migracije, živijo v
// venues.automations.__v2 (jsonb). Vsa koda bere/piše SAMO prek teh funkcij.

export type CheckinMode = "receipt" | "stand" | "both";

export type VenueMeta = {
  /** Kako gost zabeleži obisk. */
  checkin: CheckinMode;
  /** Skrivni ključ v povezavi stojala (QR/NFC). */
  standKey: string;
  address: string;
  website: string;
  hours: string;
  about: string;
  /** Ali je lokal viden v javnem imeniku. */
  listed: boolean;
  /** Kratek opis pod imenom lokala (ena vrstica). */
  tagline: string;
  /** Naslovna fotografija strani lokala (javni naslov slike). */
  coverUrl: string;
  /** Ime omrežja Wi-Fi za goste in geslo. Vidno vsem, ki odprejo stran lokala. */
  wifiName: string;
  wifiPass: string;
  /** Povezava do menija ali cenika (naložena datoteka ali spletna stran). */
  menuUrl: string;
  /** Uporabniško ime na Instagramu, brez afne. */
  instagram: string;
};

type WithAutomations = { automations?: unknown };
const str = (v: unknown): string => (typeof v === "string" ? v : "");

export function venueMeta(v: WithAutomations | null | undefined): VenueMeta {
  const raw = ((v?.automations as Record<string, unknown> | null | undefined)?.__v2 ?? {}) as Partial<VenueMeta>;
  const checkin: CheckinMode = raw.checkin === "stand" || raw.checkin === "both" ? raw.checkin : "receipt";
  return {
    checkin,
    standKey: typeof raw.standKey === "string" ? raw.standKey : "",
    address: typeof raw.address === "string" ? raw.address : "",
    website: typeof raw.website === "string" ? raw.website : "",
    hours: typeof raw.hours === "string" ? raw.hours : "",
    about: typeof raw.about === "string" ? raw.about : "",
    listed: raw.listed === true,
    tagline: str(raw.tagline),
    coverUrl: str(raw.coverUrl),
    wifiName: str(raw.wifiName),
    wifiPass: str(raw.wifiPass),
    menuUrl: str(raw.menuUrl),
    instagram: str(raw.instagram),
  };
}

/** Vrne nov objekt `automations` z združenimi v2 nastavitvami (ostale ključe pusti pri miru). */
export function mergeVenueMeta(automations: unknown, patch: Partial<VenueMeta>): Record<string, unknown> {
  const base = (automations && typeof automations === "object" ? automations : {}) as Record<string, unknown>;
  const current = venueMeta({ automations: base });
  return { ...base, __v2: { ...current, ...patch } };
}

export function newStandKey(): string {
  const a = new Uint8Array(9);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 14);
}

export const CHECKIN_LABEL: Record<CheckinMode, string> = {
  receipt: "Račun",
  stand: "Stojalo",
  both: "Račun ali stojalo",
};
