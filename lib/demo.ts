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

export const PRICING = [
  {
    key: "osnovni",
    name: "Osnovni",
    tagline: "Digitalni kartonček",
    monthly: 19,
    features: [
      "Stamp card — vsak N-ti obisk = nagrada",
      "Neomejeno strank in skeniranj",
      "1 nagrada (npr. brezplačna kava)",
      "QR za stran gosta",
      "Osnovna zgodovina",
    ],
    accent: "#8A7A66",
  },
  {
    key: "pro",
    name: "Pro",
    tagline: "Točke + rast",
    monthly: 39,
    popular: true,
    features: [
      "Vse iz Osnovni",
      "Točke na € (1 € = X točk)",
      "Več nagrad + napredek",
      "🎡 Wheel-spin + embed na svoj website",
      "Analitika in najboljše stranke",
    ],
    accent: "#E8A23D",
  },
  {
    key: "premium",
    name: "Premium",
    tagline: "Vse vključeno",
    monthly: 69,
    features: [
      "Vse iz Pro",
      "SMS kampanje po segmentih",
      "Prilagoditev strani + lastna domena",
      "POS integracija (eBlagajna) — pride",
      "Prednostna podpora",
    ],
    accent: "#5E7F52",
  },
];
