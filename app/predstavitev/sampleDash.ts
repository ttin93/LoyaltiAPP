// Vzorčni podatki za posnetek nadzorne plošče na strani za lokale.
// Lokal in gostje so izmišljeni primeri, številke niso rezultati resničnega lokala.
import type { DashData, GuestRow } from "@/app/dashboard/data";
import { DEMO } from "@/lib/demo";

const DAY = 864e5;
const FIRST = ["maja", "luka", "nina", "tilen", "eva", "jan", "sara", "rok", "ana", "miha", "zala", "nejc", "lara", "žiga", "tjaša", "david", "ema", "matic", "pia", "gašper"];
const LAST = "kpnszhmbtvgrl";

export function sampleDash(): DashData {
  const now = Date.now();
  const iso = (daysAgo: number, hours = 0) => new Date(now - daysAgo * DAY - hours * 36e5).toISOString();

  // obiski po dnevih: več ob koncu tedna
  const perWeekday = [31, 16, 18, 17, 22, 29, 38];
  const daily = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now - (29 - i) * DAY);
    return { day: d.toISOString().slice(0, 10), cnt: perWeekday[d.getDay()] + ((i * 7) % 6) };
  });
  const visits30 = daily.reduce((a, d) => a + d.cnt, 0);

  const guests: GuestRow[] = Array.from({ length: 247 }, (_, i) => {
    const visits = i % 5 < 2 ? 1 : 2 + ((i * 37) % 21); // del gostov je prišel samo enkrat
    return {
      id: `g${i}`,
      email: `${FIRST[i % FIRST.length]}.${LAST[(i * 7) % LAST.length]}${i > 19 ? i : ""}@example.com`,
      stamps: (i * 5) % 8,
      visits,
      lastVisit: iso((i * 3) % 41, i % 9),
      joined: iso(20 + ((i * 11) % 200)),
      birthday: i % 3 === 0 ? "05-14" : null,
      marketing: i % 29 !== 0,
    };
  });

  return {
    venue: {
      id: "demo", code: "kavarna-lipa", name: "Kavarna Lipa", category: "kavarna", city: "Ljubljana", phone: "", color: "#1F8BF5", logoUrl: null,
      goal: 8, reward: "Brezplačna kava", davcna: "12345678",
      meta: { checkin: "both", standKey: "demo", address: "Trubarjeva cesta 21", website: "", hours: "Vsak dan od 7.00 do 20.00", about: "", listed: true, tagline: "Sveže pražena kava in domače pecivo.", coverUrl: "/vzorec/lipa-cover.jpg", wifiName: "Lipa gostje", wifiPass: "kava2026", menuUrl: "", instagram: "kavarnalipa" },
      wheel: { enabled: true, mode: "weighted", winner: 0, segments: [{ label: "Brezplačna kava", weight: 2 }, { label: "Popust 10 %", weight: 4 }] },
      automations: {}, googleReviewUrl: "https://g.page/r/primer", scanWindowHours: 24, cooldownMinutes: 0, redemptionMinutes: 5,
      pageUrl: "https://loyavi.app/p/kavarna-lipa", standUrl: "https://loyavi.app/s/kavarna-lipa", pageQr: "", standQr: "",
    },
    venues: [{ id: "demo", name: "Kavarna Lipa" }],
    ownerEmail: "lastnik@example.com",
    isAdmin: false,
    billing: DEMO
      ? { plan: "free", access: { state: "demo", ok: true, daysLeft: 0, until: null }, venueId: "demo", cycle: "monthly", hasSubscription: false, cancelAtPeriodEnd: false, venueCount: 1, maxVenues: 1 }
      : { plan: "start", access: { state: "active", ok: true, daysLeft: 0, until: iso(-19) }, venueId: "demo", cycle: "monthly", hasSubscription: true, cancelAtPeriodEnd: false, venueCount: 1, maxVenues: 1 },
    stats: {
      guests: guests.length,
      guestsNew30: guests.filter((g) => now - new Date(g.joined).getTime() < 30 * DAY).length,
      visits: guests.reduce((a, g) => a + g.visits, 0),
      visits30,
      visitsPrev30: visits30 - 84,
      returning: guests.filter((g) => g.visits >= 2).length,
      redeemed: 63,
      openCoupons: 12,
      ratingAvg: 4.6,
      ratingCount: 58,
      birthdays: guests.filter((g) => g.birthday).length,
    },
    daily,
    guests,
    guestsTruncated: false,
    coupons: [],
    reviews: [],
    emailLog: [],
    activity: [
      { id: "a1", kind: "visit", when: iso(0, 1), title: "Potrjen obisk", who: "maja.k@example.com" },
      { id: "a2", kind: "coupon", when: iso(0, 2), title: "Prevzeta nagrada: Brezplačna kava", who: "luka.n@example.com" },
      { id: "a3", kind: "review", when: iso(0, 3), title: "Ocena 5 od 5", who: "nina.p@example.com" },
      { id: "a4", kind: "join", when: iso(0, 5), title: "Nov gost", who: "tilen.s@example.com" },
      { id: "a5", kind: "visit", when: iso(1, 1), title: "Potrjen obisk", who: "eva.z@example.com" },
    ],
    emailReady: true,
  };
}
