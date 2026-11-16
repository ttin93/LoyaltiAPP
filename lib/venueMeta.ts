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
};

type WithAutomations = { automations?: unknown };

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
