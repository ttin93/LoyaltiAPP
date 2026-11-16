// Pomožne funkcije za barve kartic (barvo izbere lokal, besedilo se prilagodi).

const HEX = /^#[0-9a-fA-F]{6}$/;

export const DEFAULT_CARD_COLOR = "#1F8BF5";

export function safeHex(hex: string | null | undefined, fallback = DEFAULT_CARD_COLOR): string {
  // #16a34a je bil privzeti stolpec v stari shemi → obravnavaj kot "ni izbrano"
  if (!hex || !HEX.test(hex) || hex.toLowerCase() === "#16a34a") return fallback;
  return hex;
}

function rgb(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

/** Relativna svetilnost (WCAG). */
export function luminance(hex: string): number {
  const [r, g, b] = rgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Barva besedila, ki je berljiva na dani podlagi. */
export function onColor(hex: string): "#0B1826" | "#FFFFFF" {
  return luminance(hex) > 0.36 ? "#0B1826" : "#FFFFFF";
}

/** Zmeša barvo s ciljno (t od 0 do 1). */
export function mix(hex: string, target: string, t: number): string {
  const a = rgb(hex);
  const b = rgb(target);
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
/** Temnejši odtenek iste barve. */
export const shade = (hex: string, t: number) => mix(hex, "#000000", t);
/** Svetlejši odtenek iste barve. */
export const tint = (hex: string, t: number) => mix(hex, "#ffffff", t);

export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = rgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}
