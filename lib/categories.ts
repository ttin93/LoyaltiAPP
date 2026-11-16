// Kategorije lokalov (shranjene v venues.venue_type). Ključ je stabilen, oznaka je za prikaz.

export type CategoryKey =
  | "kavarna" | "restavracija" | "bar" | "slascicarna" | "pekarna" | "hitra-hrana"
  | "frizer" | "lepota" | "cvetlicarna" | "avtopralnica" | "trgovina" | "fitnes"
  | "hisni-ljubljencki" | "drugo";

export const CATEGORIES: { key: CategoryKey; label: string; plural: string; reward: string }[] = [
  { key: "kavarna", label: "Kavarna", plural: "Kavarne", reward: "Brezplačna kava" },
  { key: "restavracija", label: "Restavracija", plural: "Restavracije", reward: "Brezplačna sladica" },
  { key: "bar", label: "Bar", plural: "Bari", reward: "Brezplačna pijača" },
  { key: "slascicarna", label: "Slaščičarna", plural: "Slaščičarne", reward: "Brezplačna kepica" },
  { key: "pekarna", label: "Pekarna", plural: "Pekarne", reward: "Brezplačen rogljiček" },
  { key: "hitra-hrana", label: "Hitra hrana", plural: "Hitra hrana", reward: "Brezplačen obrok" },
  { key: "frizer", label: "Frizer in brivnica", plural: "Frizerji in brivnice", reward: "Brezplačno striženje" },
  { key: "lepota", label: "Lepotni salon", plural: "Lepotni saloni", reward: "Brezplačna nega" },
  { key: "cvetlicarna", label: "Cvetličarna", plural: "Cvetličarne", reward: "Brezplačen šopek" },
  { key: "avtopralnica", label: "Avtopralnica", plural: "Avtopralnice", reward: "Brezplačno pranje" },
  { key: "trgovina", label: "Trgovina", plural: "Trgovine", reward: "Popust 10 %" },
  { key: "fitnes", label: "Fitnes in šport", plural: "Fitnes in šport", reward: "Brezplačen obisk" },
  { key: "hisni-ljubljencki", label: "Hišni ljubljenčki", plural: "Hišni ljubljenčki", reward: "Brezplačen priboljšek" },
  { key: "drugo", label: "Drugo", plural: "In še več", reward: "Nagrada" },
];

const BY_KEY = new Map(CATEGORIES.map((c) => [c.key, c]));

/** Sprejme tudi stare proste vnose (npr. "Kavarna", "bistro") in jih preslika na ključ. */
export function categoryKey(raw: string | null | undefined): CategoryKey {
  const s = (raw || "").toLowerCase().trim();
  if (BY_KEY.has(s as CategoryKey)) return s as CategoryKey;
  if (/kav|coffee|caf/.test(s)) return "kavarna";
  if (/rest|bistro|gostil|pizz/.test(s)) return "restavracija";
  if (/bar|pub/.test(s)) return "bar";
  if (/sla[sš][cč]|sladol/.test(s)) return "slascicarna";
  if (/pek/.test(s)) return "pekarna";
  if (/hitra|fast|burger|kebab/.test(s)) return "hitra-hrana";
  if (/friz|briv|barber/.test(s)) return "frizer";
  if (/lepot|kozmet|salon|spa/.test(s)) return "lepota";
  if (/cvet/.test(s)) return "cvetlicarna";
  if (/avto|praln/.test(s)) return "avtopralnica";
  if (/trgov|shop|butik/.test(s)) return "trgovina";
  if (/fit|šport|sport|gym/.test(s)) return "fitnes";
  if (/pet|ljubljen/.test(s)) return "hisni-ljubljencki";
  return s ? "drugo" : "kavarna";
}

export function categoryLabel(raw: string | null | undefined): string {
  return BY_KEY.get(categoryKey(raw))?.label ?? "Lokal";
}

export function categoryDefaultReward(raw: string | null | undefined): string {
  return BY_KEY.get(categoryKey(raw))?.reward ?? "Nagrada";
}
