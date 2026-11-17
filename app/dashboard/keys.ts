import { DEMO } from "@/lib/demo";

// Razdelki nadzorne plošče (deljeno med strežnikom in klientom).
export const SECTION_KEYS = ["pregled", "kartica", "gostje", "marketing", "ocene", "kolo", "obiski", "nastavitve", "narocnina"] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export const SECTION_LABEL: Record<SectionKey, string> = {
  pregled: "Pregled",
  kartica: "Kartica",
  gostje: "Gostje",
  marketing: "Marketing",
  ocene: "Ocene",
  kolo: "Kolo dobrodošlice",
  obiski: "Obiski in koda QR",
  nastavitve: "Nastavitve",
  narocnina: DEMO ? "Demo paket" : "Naročnina", // ključ ostane, da stare povezave (?s=narocnina) delujejo
};
