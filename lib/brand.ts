// Centralno ime znamke + kontakt. Spremeni samo tu, pa se posodobi povsod.
export const BRAND = "Loyavi";
export const BRAND_EMAIL = "info@loyavi.app";
export const BRAND_CITY = "Ljubljana, Slovenija";
export const BRAND_TAGLINE = "Vsak obisk šteje.";
export const BRAND_DESCRIPTION =
  "Vse kartice zvestobe v telefonu. Zbiraj žige v najljubših lokalih in prevzemi nagrade. Brezplačno, brez kartončkov.";

// Barve znamke (uporabno izven Tailwinda: maili, OG slika, manifest).
export const COLOR = {
  base: "#FDFDFE",
  s1: "#F3F6FA",
  s2: "#E9EEF4",
  s3: "#DDE5EE",
  line: "#D7DFE9",
  fg: "#0B1826",
  mute: "#4F5D70",
  dim: "#6B7889",
  brand: "#1F8BF5",
  brandInk: "#0B6BD0",
  tint: "#E3F1FF",
  accent: "#E63F26",
} as const;

/**
 * Kanonični naslov strani. Gola domena loyavi.app samo preusmeri na www, zato povezave, kode QR,
 * nalepke NFC, pošta in oznaka canonical kažejo naravnost na www (brez dodatne preusmeritve).
 * Če je v okolju še vpisana gola domena, jo popravimo tukaj.
 */
export function siteOrigin(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  return !env || env === "https://loyavi.app" ? "https://www.loyavi.app" : env;
}
