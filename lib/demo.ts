import { Venue, Reward } from "./types";

export const DEMO_VENUE: Venue = {
  id: "demo",
  owner_user_id: null,
  name: "Kavarna Moka",
  public_code: "demo",
  logo_url: null,
  brand_color: "#2B1D17",
  davcna_stevilka: "97384933",
  points_model: "per_visit",
  points_per_visit: 15,
  points_per_euro: 50,
  scan_window_hours: 9000,
  redemption_minutes: 5,
  daily_scan_cap: null,
  created_at: "",
};

export const DEMO_REWARDS: Reward[] = [
  { id: "1", venue_id: "demo", name: "Kava po izbiri", image_url: null, points_required: 150, sort_order: 1 },
  { id: "2", venue_id: "demo", name: "Domač rogljiček", image_url: null, points_required: 220, sort_order: 2 },
  { id: "3", venue_id: "demo", name: "Kos torte dneva", image_url: null, points_required: 320, sort_order: 3 },
];

/** Polja srečnega kolesa — zadnje (index 5) je "rigged" zmagovalno. */
export const WHEEL_SLOTS = [
  { label: "Smola", win: false, color: "#EFE6D4" },
  { label: "−10%", win: true, prize: "10 % popust", color: "#F1E7D2" },
  { label: "Smola", win: false, color: "#EFE6D4" },
  { label: "+30 točk", win: true, prize: "30 bonus točk", color: "#F1E7D2" },
  { label: "Smola", win: false, color: "#EFE6D4" },
  { label: "FREE KAVA", win: true, prize: "Brezplačna kava", color: "#E8A23D", big: true },
];
export const WHEEL_TARGET = 5; // vedno pristane na "FREE KAVA"

// ---- Dashboard demo podatki (iz designa) ----
export const DEMO_STATS = [
  { l: "Skupaj skeniranj", v: "482", s: "+18 % na prejšnji mesec" },
  { l: "Št. strank", v: "137", s: "+12 novih ta mesec" },
  { l: "Povp. obiski / stranko", v: "3,5", s: "v zadnjih 30 dneh" },
  { l: "Pogostost obiskov", v: "8,2 dni", s: "med obiskoma" },
  { l: "Podarjene točke", v: "7.230", s: "482 žigov" },
  { l: "Unovčene točke", v: "2.850", s: "19 nagrad" },
];

export const DEMO_HOURS: [string, number, string][] = [
  ["7", 18, "7"], ["8", 34, ""], ["9", 46, ""], ["10", 38, "10"], ["11", 22, ""],
  ["12", 26, ""], ["13", 20, "13"], ["14", 16, ""], ["15", 30, ""], ["16", 42, "16"],
  ["17", 28, ""], ["18", 14, ""], ["19", 10, "19"], ["20", 6, ""], ["21", 4, "21"],
];

export const DEMO_CUSTOMERS = [
  { r: 1, n: "+386 31 ··· 412", v: "24 obiskov", p: "360 točk" },
  { r: 2, n: "+386 40 ··· 198", v: "19 obiskov", p: "285 točk" },
  { r: 3, n: "+386 51 ··· 736", v: "15 obiskov", p: "225 točk" },
  { r: 4, n: "ana.k@···.com", v: "12 obiskov", p: "180 točk" },
];

export const DEMO_HISTORY = [
  { n: "+386 31 ··· 412", t: "danes · 9.12", d: "+15 točk" },
  { n: "+386 51 ··· 736", t: "danes · 8.47", d: "+15 točk" },
  { n: "ana.k@···.com", t: "danes · 8.21", d: "+15 točk" },
  { n: "+386 40 ··· 198", t: "včeraj · 16.30", d: "+15 točk" },
  { n: "+386 31 ··· 412", t: "včeraj · 11.05", d: "+15 točk" },
  { n: "+386 68 ··· 904", t: "včeraj · 9.58", d: "+15 točk" },
  { n: "+386 51 ··· 736", t: "pon · 14.12", d: "+15 točk" },
];

export const DEMO_MARKETING = [
  { n: "+386 31 ··· 412", v: "24", p: "360", a: "danes", ac: "#5E7F52" },
  { n: "+386 40 ··· 198", v: "19", p: "285", a: "včeraj", ac: "#5E7F52" },
  { n: "+386 51 ··· 736", v: "15", p: "225", a: "danes", ac: "#5E7F52" },
  { n: "ana.k@···.com", v: "12", p: "180", a: "pred 3 dnevi", ac: "#8A7A66" },
  { n: "+386 68 ··· 904", v: "9", p: "135", a: "pred 6 dnevi", ac: "#8A7A66" },
  { n: "+386 30 ··· 557", v: "4", p: "60", a: "pred 21 dnevi", ac: "#A33E1D" },
];

// ---- Dodatki (roadmap), prikazani v demo dashboardu ----
export const DEMO_REVIEW = { requested: 312, left: 86, rating: "4,8", before: "3,9" };

export const DEMO_BIRTHDAYS = [
  { n: "+386 31 ··· 412", d: "danes 🎂", soon: true },
  { n: "ana.k@···.com", d: "čez 2 dni", soon: true },
  { n: "+386 40 ··· 198", d: "čez 5 dni", soon: false },
];

// gostje, ki padajo stran (dolgo niso bili) — iz podatkov o obiskih
export const DEMO_CHURN = [
  { n: "+386 30 ··· 557", v: "4 obiski", last: "21 dni" },
  { n: "+386 68 ··· 904", v: "9 obiskov", last: "16 dni" },
  { n: "marko···@···.com", v: "6 obiskov", last: "14 dni" },
];

export type Plan = {
  key: string;
  name: string;
  tagline: string;
  price: string;
  period: string;
  cta: string;
  featured: boolean;
  badge?: string;
  features: string[];
};

export const PRICING: Plan[] = [
  {
    key: "espresso",
    name: "Espresso",
    tagline: "Za prvi korak v zvestobo",
    price: "0 €",
    period: "/ mesec",
    cta: "Začni zastonj",
    featured: false,
    features: ["1 lokal", "QR stran za goste", "Žigi in nagrade", "Do 50 strank", "Osnovna zgodovina"],
  },
  {
    key: "doppio",
    name: "Doppio",
    tagline: "Za lokal, ki želi rasti",
    price: "29 €",
    period: "/ mesec",
    cta: "Izberi Doppio",
    featured: true,
    badge: "Najbolj priljubljeno",
    features: [
      "Vse iz Espresso",
      "Neomejeno strank",
      "Polna analitika",
      "Seznam strank in marketing",
      "PDF in PNG plakati",
      "Ročno dodajanje točk",
    ],
  },
  {
    key: "veriga",
    name: "Veriga",
    tagline: "Za več lokalov pod eno znamko",
    price: "Po dogovoru",
    period: "",
    cta: "Pogovorimo se",
    featured: false,
    features: ["Vse iz Doppio", "Več lokalov, en dashboard", "Skupna analitika verige", "Prioritetna podpora", "Dostop do API"],
  },
];
