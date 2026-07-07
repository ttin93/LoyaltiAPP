"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Venue, Reward, Customer, ScanRow, RedemptionRow, GrantRow, WheelConfig, WheelSegment, Automation, Automations, PlanKey } from "@/lib/types";
import { updateVenueSettings, activateScanning, testReceipt, saveReward, deleteReward, addManualPoints, saveWheel, saveAutomations, sendGuestCampaign, saveEmailSettings, uploadLogo, removeLogo, uploadRewardImage, removeRewardImage, signOut } from "@/app/actions";
import { PLANS, fmtEur, monthlyEquivalent, chargedAmount, STATUS_LABEL, planFeature, planMaxVenues } from "@/lib/plans";
import type { Access } from "@/lib/access";
import Scanner from "@/app/components/Scanner";
import QrEditor from "./QrEditor";

export type ReviewRow = { id: string; stars: number; comment: string | null; to_google: boolean; created_at: string };

const JAK = "var(--font-jakarta), sans-serif";
const INK = "#2A241D";
const PAPER = "#FBF3E6";
const CREAM = "#FBF7F0";
const AMBER = "#E2A04A";
const CORAL = "#C4623D";
const GREEN = "#5E7F52";
const MUTED = "#6E6253";
const BORD = "#EFE6D6";

type IcName = "grid" | "chart" | "clock" | "users" | "mega" | "qr" | "sliders" | "star" | "crown" | "wheel";
function Ic({ name, color = INK, size = 20 }: { name: IcName; color?: string; size?: number }) {
  const st = { fill: "none", stroke: color, strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const p: Record<IcName, React.ReactNode> = {
    grid: <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" style={st} />,
    chart: <path d="M5 19v-7M12 19V5M19 19v-10" style={st} />,
    clock: <><circle cx={12} cy={12} r={8.5} style={st} /><path d="M12 8v4.4l2.8 2" style={st} /></>,
    users: <><circle cx={9} cy={8} r={3.2} style={st} /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" style={st} /><path d="M16 5.2a3 3 0 0 1 0 5.6M17 19a5.5 5.5 0 0 0-2-4.3" style={st} /></>,
    mega: <><path d="M18 6 7 9.8H4.5v4.4H7L18 18V6Z" style={st} /><path d="M8.5 14.8 9.6 19h2" style={st} /></>,
    qr: <><path d="M4.5 4.5h5.5V10H4.5zM14 4.5h5.5V10H14zM4.5 14h5.5v5.5H4.5z" style={st} /><path d="M14 14h2.3v2.3H14zM17.4 17.4h2.1v2.1h-2.1z" style={st} /></>,
    sliders: <><path d="M4 7.5h16M4 12h16M4 16.5h16" style={st} /><circle cx={15} cy={7.5} r={2.1} style={st} /><circle cx={8.5} cy={12} r={2.1} style={st} /><circle cx={16} cy={16.5} r={2.1} style={st} /></>,
    star: <path d="M12 4.5l2.3 4.8 5.2.7-3.8 3.6 1 5.1L12 16.4 7.1 18.3l1-5.1L4.3 9.6l5.2-.7L12 4.5Z" style={st} />,
    crown: <><path d="M4 8.5l3.5 3 4.5-6 4.5 6 3.5-3-1.5 9.5H5.5L4 8.5Z" style={st} /><path d="M5.5 18h13" style={st} /></>,
    wheel: <><circle cx={12} cy={12} r={8.5} style={st} /><path d="M12 3.5v17M3.5 12h17M6 6l12 12M18 6 6 18" style={st} /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flexShrink: 0 }}>{p[name]}</svg>;
}

const NAV: [string, string, IcName][] = [["pregled", "Pregled", "grid"], ["analitika", "Analitika", "chart"], ["ocene", "Ocene", "star"], ["zgodovina", "Zgodovina", "clock"], ["stranke", "Stranke", "users"], ["marketing", "Marketing", "mega"], ["kolo", "Kolo sreče", "wheel"], ["sistem", "Sistem", "qr"], ["nastavitve", "Nastavitve", "sliders"], ["narocnina", "Naročnina", "crown"]];
const card: React.CSSProperties = { background: "#fff", border: `1px solid ${BORD}`, borderRadius: 18, padding: 22 };
const inp: React.CSSProperties = { height: 46, width: "100%", border: "1.5px solid #E4D9C7", borderRadius: 12, background: "#fff", padding: "0 14px", fontFamily: JAK, fontSize: 14.5, color: INK, outline: "none", boxSizing: "border-box" };
function fmt(ts: string) { return new Date(ts).toLocaleString("sl-SI", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }); }
const PRESETS: { k: string; t: string; seg: string }[] = [
  { k: "Pogrešamo te", t: "Pogrešamo te! Ta teden −20% na vse kave ☕ Se vidiva?", seg: "Neaktivni 21+ dni" },
  { k: "Nagrada čaka", t: "Tvoja nagrada te čaka 🎁 Oglasi se ta teden in jo prevzemi.", seg: "Aktivni" },
  { k: "Rojstni dan", t: "Vse najboljše! 🎂 Ta teden te častimo s sladico ob kavi.", seg: "Najboljši" },
  { k: "Vikend akcija", t: "Vikend dvojni žigi! Vsak račun ta vikend = +1 žig extra ⭐", seg: "Aktivni" },
];
function StarRow({ n, size = 14 }: { n: number; size?: number }) {
  return <span style={{ letterSpacing: 1, whiteSpace: "nowrap" }}>{[1, 2, 3, 4, 5].map((i) => <span key={i} style={{ color: i <= n ? AMBER : "#E4D9C7", fontSize: size }}>★</span>)}</span>;
}
const LANGS: [string, string][] = [["sl", "Slovenščina 🇸🇮"], ["en", "English 🇬🇧"], ["hr", "Hrvaški 🇭🇷"], ["sr", "Srbski 🇷🇸"], ["bs", "Bosanski 🇧🇦"], ["de", "Nemški 🇩🇪"]];

// Marketing avtomatizacije
const AUTO_DEFS: { key: string; label: string; desc: string; emoji: string; field?: "days" | "months" | "date" }[] = [
  { key: "welcome", label: "Dobrodošlica", desc: "Ko se gost prvič prijavi.", emoji: "👋" },
  { key: "inactive", label: "Pogrešamo te", desc: "Ko gost X dni ne pride.", emoji: "🥺", field: "days" },
  { key: "anniversary", label: "Obletnica pridružitve", desc: "Ko mine X mesecev odkar se je gost pridružil.", emoji: "🎂", field: "months" },
  { key: "guest_birthday", label: "Rojstni dan gosta", desc: "Na gostov rojstni dan (rabi rojstni datum — dodamo ob prijavi).", emoji: "🎈" },
  { key: "venue_birthday", label: "Rojstni dan lokala", desc: "Na obletnico lokala.", emoji: "🎉", field: "date" },
  { key: "card_complete", label: "Polna kartica", desc: "Ko gost napolni kartonček.", emoji: "✅" },
];
function defaultAuto(key: string): Automation {
  const m: Record<string, Partial<Automation>> = {
    welcome: { message: "Dobrodošel v naši kavarni! ☕ Tvoj prvi obisk si zasluži posebno pozornost." },
    inactive: { message: "Pogrešamo te! 💛 Pridi na kavo ta teden — čaka te presenečenje.", days: 30, coupon: true },
    anniversary: { message: "Že eno leto skupaj! 🎂 Hvala za zvestobo — kava gre na nas.", months: 12, coupon: true },
    guest_birthday: { message: "Vse najboljše! 🎈 Danes te častimo s sladico ob kavi.", coupon: true, couponName: "Sladica" },
    venue_birthday: { message: "Praznujemo rojstni dan lokala! 🎉 Ta teden te častimo.", date: "01-01", coupon: true },
    card_complete: { message: "Bravo, kartonček je poln! 🎉 Nagrada te čaka v denarnici." },
  };
  return { enabled: false, message: "", coupon: false, couponName: "Brezplačna kava", ...m[key] };
}
function buildAutomations(saved?: Automations | null): Automations {
  const out: Automations = {};
  for (const d of AUTO_DEFS) out[d.key] = { ...defaultAuto(d.key), ...(saved?.[d.key] || {}) };
  return out;
}
const DEFAULT_WHEEL: WheelConfig = { enabled: true, mode: "fixed", winner: 0, segments: [{ label: "Brezplačna kava", weight: 1 }, { label: "−10 %", weight: 1 }, { label: "+30 točk", weight: 1 }, { label: "Piškot", weight: 1 }, { label: "−15 %", weight: 1 }, { label: "Sirup", weight: 1 }] };
const SEGFILL = ["#E2A04A", "#C4623D", "#5E7F52", "#3D5A80", "#8E5BA6", "#D98C3A", "#7A9E6E", "#B05050"];

function WheelMini({ segments, winner, accent }: { segments: WheelSegment[]; winner: number; accent: string }) {
  const n = Math.max(1, segments.length), cx = 100, cy = 100, r = 92, seg = 360 / n;
  const polar = (deg: number) => { const a = ((deg - 90) * Math.PI) / 180; return [Math.round((cx + r * Math.cos(a)) * 100) / 100, Math.round((cy + r * Math.sin(a)) * 100) / 100]; };
  return (
    <svg width="220" height="220" viewBox="0 0 200 200" style={{ display: "block", filter: "drop-shadow(0 10px 22px rgba(42,36,29,0.14))" }}>
      {segments.map((s, i) => {
        const [x0, y0] = polar(i * seg), [x1, y1] = polar((i + 1) * seg);
        const isWin = i === winner;
        const fill = isWin ? accent : i % 2 === 0 ? "#FFFFFF" : "#F6EAD6";
        const mid = i * seg + seg / 2, a = ((mid - 90) * Math.PI) / 180;
        const lx = Math.round((cx + r * 0.6 * Math.cos(a)) * 100) / 100, ly = Math.round((cy + r * 0.6 * Math.sin(a)) * 100) / 100;
        return (
          <g key={i}>
            <path d={`M${cx} ${cy} L${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1} Z`} fill={fill} stroke="#EAD9BC" strokeWidth={1} />
            <text x={lx} y={ly} transform={`rotate(${mid} ${lx} ${ly})`} textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: JAK, fontWeight: isWin ? 800 : 700, fontSize: n > 7 ? 7 : 8, fill: isWin ? "#fff" : "#7A6A50" }}>{(s.label || "—").slice(0, 12)}</text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={r + 2} fill="none" stroke={INK} strokeWidth={4} />
      <circle cx={cx} cy={cy} r={24} fill={INK} stroke="#fff" strokeWidth={3} />
    </svg>
  );
}

export default function Dashboard({ venue, venues = [], rewards, customers, scans, redemptions, reviews = [], grants = [], ownerEmail, isAdmin = false, ownerPlan, billingVenue, access, scanCount = 0, customerCount = 0, dailyScans = [], hourlyScans = [], emailLog = [] }: { venue: Venue; venues?: { id: string; name: string }[]; rewards: Reward[]; customers: Customer[]; scans: ScanRow[]; redemptions: RedemptionRow[]; reviews?: ReviewRow[]; grants?: GrantRow[]; ownerEmail: string; isAdmin?: boolean; ownerPlan: PlanKey; billingVenue: Venue; access: Access; scanCount?: number; customerCount?: number; dailyScans?: { day: string; cnt: number }[]; hourlyScans?: { hour: number; cnt: number }[]; emailLog?: { id: string; kind: string; created_at: string; customers: { email: string | null } | null }[] }) {
  const router = useRouter();
  const [sec, setSec] = useState("pregled");
  const [roiSpend, setRoiSpend] = useState(4); // povpr. račun za ROI oceno (nastavljiv)
  const [switchOpen, setSwitchOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanMode, setScanMode] = useState<"activate" | "test">("activate");
  const [histTab, setHistTab] = useState<"given" | "redeemed">("given");
  const [histQuery, setHistQuery] = useState("");
  const [histDay, setHistDay] = useState("");
  const [histHour, setHistHour] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [range, setRange] = useState(30); // analitika: dni
  const [custQuery, setCustQuery] = useState("");
  const [custSel, setCustSel] = useState<Customer | null>(null);
  const [settingsColor, setSettingsColor] = useState(venue.brand_color || "#E2A04A");
  const [lang, setLang] = useState((venue as { language?: string }).language || "sl");
  const [sName, setSName] = useState(venue.name);
  const [sPoints, setSPoints] = useState(String(venue.points_per_visit));
  const [sGoal, setSGoal] = useState(String(venue.stamp_goal ?? 10));
  const [sWindow, setSWindow] = useState(String(venue.scan_window_hours));
  const [sCooldown, setSCooldown] = useState(String((venue as { scan_cooldown_minutes?: number }).scan_cooldown_minutes ?? 0));
  const [sGoogle, setSGoogle] = useState(venue.google_review_url ?? "");
  const [wheel, setWheel] = useState<WheelConfig>(() => (venue.wheel_config && Array.isArray(venue.wheel_config.segments) && venue.wheel_config.segments.length ? venue.wheel_config : DEFAULT_WHEEL));
  function patchWheel(p: Partial<WheelConfig>) { setWheel((w) => ({ ...w, ...p })); }
  function setSeg(i: number, p: Partial<WheelSegment>) { setWheel((w) => ({ ...w, segments: w.segments.map((s, j) => (j === i ? { ...s, ...p } : s)) })); }
  const totalW = wheel.segments.reduce((a, s) => a + (Number(s.weight) || 0), 0);
  const title = NAV.find((n) => n[0] === sec)?.[1] || "Pregled";

  // ── Gating po paketu (PER-LASTNIK: najboljši paket med vsemi lokali). free = pilot = vse. ──
  const curPlan = ownerPlan;
  const gate = {
    segments: planFeature(curPlan, "customSegments"),
    automations: planFeature(curPlan, "automations"),
    analytics: planFeature(curPlan, "advancedAnalytics"),
    embed: planFeature(curPlan, "embedWidget"),
  };
  const maxVenues = planMaxVenues(curPlan);
  const canAddVenue = venues.length < maxVenues;
  function lockCard(t: string, d: string) {
    return (
      <div className="flex flex-col items-start" style={{ background: "#fff", border: `1px solid ${BORD}`, borderRadius: 18, gap: 10, padding: "26px 24px", maxWidth: 460 }}>
        <div className="flex items-center justify-center" style={{ width: 48, height: 48, borderRadius: 14, background: "#FCEFD8", fontSize: 22 }}>🔒</div>
        <div style={{ fontWeight: 800, fontSize: 17 }}>{t}</div>
        <div style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.5 }}>{d}</div>
        <button onClick={() => setSec("narocnina")} style={{ marginTop: 4, height: 44, padding: "0 22px", border: "none", borderRadius: 12, background: INK, color: PAPER, fontFamily: JAK, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Nadgradi na Grow →</button>
      </div>
    );
  }

  const stats = useMemo(() => {
    const pointsAwarded = scanCount * (venue.points_per_visit || 0);
    const pointsRedeemed = redemptions.reduce((a, r) => a + r.points_spent, 0);
    const visits = new Map<string, { visits: number; last: string }>();
    for (const s of scans) { const cur = visits.get(s.customer_id) ?? { visits: 0, last: s.created_at }; cur.visits += 1; if (s.created_at > cur.last) cur.last = s.created_at; visits.set(s.customer_id, cur); }
    const dmap = new Map(dailyScans.map((d) => [d.day, Number(d.cnt)]));
    const days: { label: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const key = d.toISOString().slice(0, 10); days.push({ label: key.slice(5), count: dmap.get(key) ?? 0 }); }
    const maxDay = Math.max(1, ...days.map((d) => d.count));
    return { pointsAwarded, pointsRedeemed, avgVisits: customerCount ? (scanCount / customerCount).toFixed(1) : "0", visits, days, maxDay };
  }, [scans, redemptions, scanCount, customerCount, dailyScans, venue.points_per_visit]);

  const topCustomers = useMemo(() => [...customers].sort((a, b) => b.points - a.points).slice(0, 4), [customers]);

  const seg = useMemo(() => {
    const now = Date.now();
    let active = 0, inactive = 0;
    for (const c of customers) {
      const v = stats.visits.get(c.id);
      if (!v) { inactive++; continue; }
      const days = (now - new Date(v.last).getTime()) / 864e5;
      if (days <= 14) active++; else if (days >= 21) inactive++;
    }
    const best = customers.filter((c) => c.points >= 200).length;
    return { active, inactive, best };
  }, [customers, stats]);

  const [segSel, setSegSel] = useState("Najboljši");
  const [campaignMsg, setCampaignMsg] = useState("Pogrešamo te! Ta teden −20% na vse kave ☕");
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [couponOn, setCouponOn] = useState(false);
  const [couponName, setCouponName] = useState("Brezplačna kava");
  const [segMinPts, setSegMinPts] = useState(100);
  const [mktTab, setMktTab] = useState<"campaign" | "auto" | "log">("campaign");
  const [autos, setAutos] = useState<Automations>(() => buildAutomations((venue as { automations?: Automations | null }).automations));
  const setAuto = (key: string, patch: Partial<Automation>) => setAutos((a) => ({ ...a, [key]: { ...a[key], ...patch } }));
  const autoCount = Object.values(autos).filter((a) => a.enabled).length;

  // MARKETING — kdo so dejanski prejemniki izbranega segmenta (minus ročno odstranjeni)
  const segCustomers = useMemo(() => {
    const now = Date.now();
    return customers.filter((c) => {
      const v = stats.visits.get(c.id);
      const days = v ? (now - new Date(v.last).getTime()) / 864e5 : Infinity;
      if (segSel === "Najboljši") return c.points >= 200;
      if (segSel === "Aktivni") return !!v && days <= 14;
      if (segSel === "Neaktivni 21+ dni") return !v || days >= 21;
      if (segSel === "Po meri") return c.points >= segMinPts;
      return true; // Vsi gostje
    });
  }, [customers, segSel, stats, segMinPts]);
  const recipients = segCustomers.filter((c) => !removed.has(c.id));

  // ANALITIKA — dinamičen razpon (7/30/90 dni)
  const ana = useMemo(() => {
    const now = Date.now();
    const since = now - range * 864e5;
    const dmap = new Map(dailyScans.map((d) => [d.day, Number(d.cnt)]));
    // dnevna štetja za zadnjih `range` dni (strežniško, mimo 1000-limita)
    const perDay: { label: string; count: number }[] = [];
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      perDay.push({ label: `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`, count: dmap.get(key) ?? 0 });
    }
    const buckets = Math.min(range, 30);
    const size = Math.max(1, Math.ceil(perDay.length / buckets));
    const days: { label: string; count: number }[] = [];
    for (let i = 0; i < perDay.length; i += size) { const chunk = perDay.slice(i, i + size); days.push({ label: chunk[chunk.length - 1].label, count: chunk.reduce((a, c) => a + c.count, 0) }); }
    const scansInRange = perDay.reduce((a, c) => a + c.count, 0);
    const hours = Array.from({ length: 24 }, () => 0);
    for (const h of hourlyScans) hours[h.hour] = Number(h.cnt);
    const redIn = redemptions.filter((r) => new Date(r.created_at).getTime() >= since);
    const newCust = customers.filter((c) => new Date(c.created_at).getTime() >= since).length;
    const pop = new Map<string, number>();
    for (const r of redIn) { const n = r.rewards?.name || "nagrada"; pop.set(n, (pop.get(n) || 0) + 1); }
    const topRewards = [...pop.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { scans: scansInRange, redemptions: redIn.length, newCust, ptsAw: scansInRange * (venue.points_per_visit || 0), ptsRe: redIn.reduce((a, r) => a + r.points_spent, 0), days, maxDay: Math.max(1, ...days.map((d) => d.count)), hours, maxHour: Math.max(1, ...hours), topRewards };
  }, [dailyScans, hourlyScans, redemptions, customers, range, venue.points_per_visit]);

  // OCENE — Google-review statistika
  const rev = useMemo(() => {
    const total = reviews.length;
    const avg = total ? reviews.reduce((a, r) => a + r.stars, 0) / total : 0;
    return { total, avg, toGoogle: reviews.filter((r) => r.to_google).length, low: reviews.filter((r) => r.stars <= 3), dist: [1, 2, 3, 4, 5].map((s) => reviews.filter((r) => r.stars === s).length) };
  }, [reviews]);

  // STRANKE — iskalnik
  const custFiltered = useMemo(() => {
    const q = custQuery.trim().toLowerCase();
    return q ? customers.filter((c) => (c.email || c.phone || "").toLowerCase().includes(q)) : customers;
  }, [customers, custQuery]);

  const stampRewards = rewards.filter((r) => (r as Reward).kind === "stamp");
  const pointsRewards = rewards.filter((r) => (r as Reward).kind !== "stamp");

  // ZGODOVINA — podarjene = skeni + ročne točke (kdo/kdaj/kaj)
  const givenLog = useMemo(() => {
    const a = scans.map((s) => ({ id: "s" + s.id, t: s.created_at, who: s.customers?.email ?? s.customers?.phone ?? "—", points: s.points_awarded, manual: false }));
    const b = grants.map((g) => ({ id: "g" + g.id, t: g.created_at, who: g.customers?.email ?? g.customers?.phone ?? "—", points: g.points, manual: true }));
    return [...a, ...b].sort((x, y) => (x.t < y.t ? 1 : -1));
  }, [scans, grants]);

  // ZGODOVINA filtri (ime / dan / ura)
  const histMatch = (t: string, who: string) => {
    const q = histQuery.trim().toLowerCase();
    if (q && !who.toLowerCase().includes(q)) return false;
    const d = new Date(t);
    if (histDay) { const ld = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; if (ld !== histDay) return false; }
    if (histHour !== "" && d.getHours() !== Number(histHour)) return false;
    return true;
  };
  const givenView = givenLog.filter((g) => histMatch(g.t, g.who));
  const redeemedView = redemptions.filter((r) => histMatch(r.created_at, r.customers?.email ?? r.customers?.phone ?? ""));
  const histActive = histQuery.trim() !== "" || histDay !== "" || histHour !== "";

  function flash(t: string) { setMsg(t); setTimeout(() => setMsg(null), 3000); }
  async function run(fn: () => Promise<unknown>, ok?: string) { try { await fn(); if (ok) flash(ok); router.refresh(); } catch (e) { flash(e instanceof Error ? e.message : "Napaka."); } }

  // ── BILLING (Polar) ──────────────────────────────────────────────────────
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(billingVenue.billing_cycle === "yearly" ? "yearly" : "monthly");
  const [billingBusy, setBillingBusy] = useState(false);
  async function startCheckout(plan: "start" | "grow") {
    setBillingBusy(true);
    try {
      const r = await fetch("/api/billing/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ venueId: billingVenue.id, plan, cycle: billingCycle }) });
      const j = await r.json();
      if (j.url) { window.location.href = j.url; return; }
      if (j.changed) { flash("Paket spremenjen — obračun se prilagodi sorazmerno."); router.refresh(); setBillingBusy(false); return; }
      flash(j.error || "Checkouta ni bilo mogoče odpreti.");
    } catch { flash("Napaka povezave."); }
    setBillingBusy(false);
  }
  async function openPortal() {
    setBillingBusy(true);
    try {
      const r = await fetch("/api/billing/portal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ venueId: billingVenue.id }) });
      const j = await r.json();
      if (j.url) { window.location.href = j.url; return; }
      flash(j.error || "Portala ni bilo mogoče odpreti.");
    } catch { flash("Napaka povezave."); }
    setBillingBusy(false);
  }
  // Logo upload
  const [logoBusy, setLogoBusy] = useState(false);
  async function onLogoPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setLogoBusy(true);
    const fd = new FormData();
    fd.set("file", f);
    try {
      const r = await uploadLogo(fd);
      if (r.error) flash("⚠ " + r.error);
      else { flash("Logo naložen."); router.refresh(); }
    } catch (err) { flash(err instanceof Error ? err.message : "Napaka."); }
    setLogoBusy(false);
    e.target.value = "";
  }

  const [rwImgBusy, setRwImgBusy] = useState<string | null>(null);
  async function onRewardImagePick(e: React.ChangeEvent<HTMLInputElement>, rewardId: string) {
    const f = e.target.files?.[0];
    if (!f) return;
    setRwImgBusy(rewardId);
    const fd = new FormData();
    fd.set("file", f);
    fd.set("rewardId", rewardId);
    try {
      const r = await uploadRewardImage(fd);
      if (r.error) flash("⚠ " + r.error);
      else { flash("Slika nagrade naložena."); router.refresh(); }
    } catch (err) { flash(err instanceof Error ? err.message : "Napaka."); }
    setRwImgBusy(null);
    e.target.value = "";
  }
  const rewardThumb = (r: Reward) => (
    <div className="flex items-center" style={{ gap: 4, flexShrink: 0 }}>
      <label title={r.image_url ? "Zamenjaj sliko" : "Naloži sliko"} className="flex items-center justify-center" style={{ width: 46, height: 46, borderRadius: 11, overflow: "hidden", border: `1px solid ${BORD}`, background: r.image_url ? "#fff" : CREAM, cursor: "pointer", flexShrink: 0 }}>
        {r.image_url ? <img src={r.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 17, opacity: 0.45 }}>{rwImgBusy === r.id ? "…" : "🖼"}</span>}
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => onRewardImagePick(e, r.id)} disabled={rwImgBusy === r.id} style={{ display: "none" }} />
      </label>
      {r.image_url && <button type="button" title="Odstrani sliko" onClick={() => run(() => removeRewardImage(r.id), "Slika odstranjena.")} style={{ width: 22, height: 22, borderRadius: 7, border: "1px solid #E4D9C7", background: "#fff", color: CORAL, cursor: "pointer", fontSize: 11, lineHeight: 1, fontFamily: JAK, padding: 0, flexShrink: 0 }}>✕</button>}
    </div>
  );

  // Marketing: pošlji e-pošto kampanjo gostom (z email naslovom)
  const [campaignBusy, setCampaignBusy] = useState(false);
  async function sendCampaign() {
    const emails = recipients.map((c) => c.email).filter((e): e is string => !!e);
    if (!emails.length) { flash("Noben prejemnik nima e-pošte."); return; }
    const subject = (campaignMsg.split("\n")[0] || "").slice(0, 60) || `Ponudba pri ${venue.name}`;
    const msg = campaignMsg + (couponOn ? `\n\n🎟️ Kupon zate: ${couponName}` : "");
    setCampaignBusy(true);
    try {
      const r = await sendGuestCampaign({ subject, message: msg, emails });
      if (r.error) flash("⚠ " + r.error);
      else flash(`Poslano ${r.sent}/${r.total}${r.failed ? ` · ${r.failed} ni uspelo` : ""}.`);
    } catch (e) { flash(e instanceof Error ? e.message : "Napaka."); }
    setCampaignBusy(false);
  }

  // Vrnitev s Polar checkouta → potrdi + odpri Naročnino (webhook posodobi v par sekundah)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("billing") === "success") {
      flash("Hvala! Naročnina se aktivira v nekaj sekundah.");
      setSec("narocnina");
      window.history.replaceState({}, "", "/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  async function handleScanResult(payload: string) {
    setScanning(false);
    if (scanMode === "test") {
      try { const r = await testReceipt(payload); flash(r.ok ? `✅ ${r.msg}` : `❌ ${r.msg}`); } catch (e) { flash(e instanceof Error ? e.message : "Napaka."); }
      return;
    }
    await run(async () => { const d = await activateScanning(payload); flash(`Skeniranje aktivno — davčna ${d}.`); });
  }
  function openScan(mode: "activate" | "test") { setScanMode(mode); setScanning(true); }

  const Kpi = ({ l, v, d, dc }: { l: string; v: React.ReactNode; d?: string; dc?: string }) => <div style={{ ...card, padding: 18, display: "flex", flexDirection: "column", gap: 6 }}><span style={{ fontSize: 12.5, fontWeight: 600, color: "#9A8F80" }}>{l}</span><span style={{ fontWeight: 800, fontSize: 28, letterSpacing: "-0.01em" }}>{v}</span>{d && <span style={{ fontSize: 12, fontWeight: 700, color: dc || "#9A8F80" }}>{d}</span>}</div>;

  // ── PAYWALL: brez aktivne naročnine / triala ni dostopa (var. 3) ──
  if (!access.ok) {
    return (
      <main className="flex items-center justify-center" style={{ background: "#E9E2D6", fontFamily: JAK, color: INK, minHeight: "100dvh", padding: 20 }}>
        <div className="flex flex-col items-center text-center" style={{ background: CREAM, border: `1px solid ${BORD}`, borderRadius: 24, padding: "34px 28px", maxWidth: 460, gap: 14 }}>
          <div className="flex items-center justify-center" style={{ width: 60, height: 60, borderRadius: 17, background: "#FCEFD8", fontSize: 28 }}>🔒</div>
          <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: "-0.01em" }}>Tvoj brezplačni dostop je potekel</div>
          <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.5 }}>Za nadaljevanje izberi paket. Plačilo varno vodi <b>Polar</b> — kartica, računi in DDV urejeni, prekličeš kadarkoli.</div>
          <div className="flex" style={{ background: "#fff", border: `1px solid ${BORD}`, borderRadius: 999, padding: 4, marginTop: 4 }}>
            {(["monthly", "yearly"] as const).map((c) => <button key={c} onClick={() => setBillingCycle(c)} style={{ height: 34, padding: "0 16px", border: "none", borderRadius: 999, background: billingCycle === c ? INK : "transparent", color: billingCycle === c ? PAPER : MUTED, fontFamily: JAK, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{c === "monthly" ? "Mesečno" : "Letno −2 mes"}</button>)}
          </div>
          <div className="flex w-full" style={{ gap: 10, marginTop: 4 }}>
            {(["start", "grow"] as const).map((p) => { const m = PLANS[p].monthly || 0; const per = billingCycle === "yearly" ? (m * 10) / 12 : m; return (
              <button key={p} onClick={() => startCheckout(p)} disabled={billingBusy} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "14px 10px", border: p === "grow" ? "none" : `1.5px solid ${BORD}`, borderRadius: 14, background: p === "grow" ? INK : "#fff", color: p === "grow" ? PAPER : INK, fontFamily: JAK, cursor: "pointer", opacity: billingBusy ? 0.6 : 1 }}>
                <span style={{ fontSize: 14, fontWeight: 800 }}>{PLANS[p].label}</span>
                <span style={{ fontSize: 16, fontWeight: 800 }}>{fmtEur(per)}<span style={{ fontSize: 11, fontWeight: 600, opacity: 0.7 }}>/mes</span></span>
              </button>
            ); })}
          </div>
          <a href="/kontakt" style={{ fontSize: 12.5, color: MUTED, marginTop: 2 }}>Veriga lokalov? Pogovorimo se →</a>
          <form action={signOut}><button style={{ fontSize: 12.5, fontWeight: 600, color: "#9A8F80", background: "none", border: "none", cursor: "pointer", fontFamily: JAK }}>Odjava · {ownerEmail}</button></form>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: "#E9E2D6", fontFamily: JAK, color: INK, minHeight: "100dvh", overflowX: "hidden" }}>
      <div className="mx-auto" style={{ maxWidth: 1180, padding: "0 0 40px" }}>
        <div className="lg:my-6 lg:overflow-hidden lg:rounded-[18px] lg:border lg:border-[#D9CDBA] lg:shadow-[0_30px_70px_rgba(34,28,22,0.18)]" style={{ background: "#fff" }}>
          <div className="flex" style={{ minHeight: "100dvh" }}>
            {/* SIDEBAR */}
            <div className="hidden flex-col lg:flex" style={{ width: 248, flexShrink: 0, background: "#fff", borderRight: `1px solid ${BORD}`, padding: "22px 16px" }}>
              <div className="relative" style={{ padding: "0 0 18px", borderBottom: "1px solid #F1E8D9", marginBottom: 16 }}>
                <button onClick={() => setSwitchOpen((o) => !o)} className="flex w-full items-center" style={{ gap: 10, padding: "0 8px", background: "none", border: "none", cursor: "pointer", fontFamily: JAK, textAlign: "left" }}>
                  <div className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: 13, background: INK, color: PAPER, fontWeight: 800, fontSize: 18, flexShrink: 0 }}>{venue.name.charAt(0).toUpperCase()}</div>
                  <div className="flex flex-col" style={{ lineHeight: 1.25, flex: 1, minWidth: 0 }}><span className="truncate" style={{ fontWeight: 800, fontSize: 15 }}>{venue.name}</span><span className="truncate" style={{ fontSize: 12, color: "#9A8F80" }}>{(venue as { city?: string }).city || `${venues.length} ${venues.length === 1 ? "lokal" : "lokali"}`}</span></div>
                  <svg width="16" height="16" viewBox="0 0 24 24" style={{ fill: "none", stroke: "#B5AB9C", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", flexShrink: 0 }}><path d="M8 9l4-4 4 4M8 15l4 4 4-4" /></svg>
                </button>
                {switchOpen && (
                  <div className="absolute" style={{ top: "calc(100% - 8px)", left: 4, right: 4, background: "#fff", border: "1px solid #E4D9C7", borderRadius: 12, boxShadow: "0 14px 34px rgba(42,36,29,0.16)", zIndex: 30, padding: 6 }}>
                    {venues.map((v) => <a key={v.id} href={`/dashboard?v=${v.id}`} className="flex items-center truncate" style={{ height: 38, padding: "0 10px", borderRadius: 9, fontSize: 13.5, fontWeight: v.id === venue.id ? 700 : 600, color: INK, textDecoration: "none", background: v.id === venue.id ? "#FCEFD8" : "transparent" }}>{v.name}</a>)}
                    {canAddVenue ? (
                      <a href="/partner?new=1" className="flex items-center" style={{ height: 38, padding: "0 10px", borderRadius: 9, fontSize: 13.5, fontWeight: 700, color: "#B4781E", textDecoration: "none", borderTop: "1px solid #F1E8D9", marginTop: 4 }}>+ Nov lokal</a>
                    ) : (
                      <button onClick={() => { setSwitchOpen(false); setSec("narocnina"); }} className="flex flex-col items-start" style={{ width: "100%", padding: "8px 10px", borderRadius: 9, background: "none", border: "none", borderTop: "1px solid #F1E8D9", marginTop: 4, cursor: "pointer", textAlign: "left", fontFamily: JAK }}><span style={{ fontSize: 12.5, fontWeight: 700, color: "#B4781E" }}>🔒 Limit lokalov ({venues.length}/{maxVenues})</span><span style={{ fontSize: 11.5, color: "#9A8F80" }}>Nadgradi za več lokalov →</span></button>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-col" style={{ gap: 3 }}>{NAV.map(([id, label, icon]) => { const on = id === sec; return <button key={id} onClick={() => setSec(id)} className="flex items-center" style={{ gap: 12, height: 44, padding: "0 12px", border: "none", borderRadius: 12, background: on ? "#FCEFD8" : "transparent", color: on ? INK : MUTED, fontFamily: JAK, fontSize: 14.5, fontWeight: on ? 700 : 600, cursor: "pointer", textAlign: "left" }}><Ic name={icon} color={on ? INK : "#A89B88"} size={20} /><span>{label}</span></button>; })}</div>
              {(() => {
                const op = ownerPlan;
                const opPaid = op !== "free" && (billingVenue.subscription_status ?? "active") !== "canceled";
                return (
                  <button onClick={() => setSec("narocnina")} className="flex flex-col" style={{ marginTop: "auto", gap: 5, textAlign: "left", border: "1px solid #F0D9A8", background: "linear-gradient(160deg,#FCEFD8,#F8E2BD)", borderRadius: 14, padding: "13px 14px", cursor: "pointer", fontFamily: JAK }}>
                    <div className="flex items-center" style={{ gap: 7 }}><Ic name="crown" color="#B4781E" size={16} /><span style={{ fontSize: 13, fontWeight: 800, color: "#7A5E1E" }}>{opPaid ? `Paket ${PLANS[op].label}` : "Brezplačni paket"}</span></div>
                    <span style={{ fontSize: 11.5, color: "#9A7B36", lineHeight: 1.4 }}>{opPaid ? "Upravljaj naročnino, plačilo in preklic." : "Nadgradi za SMS, več lokalov in napredno analitiko."}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: "#B4781E", marginTop: 2 }}>{opPaid ? "Naročnina →" : "Nadgradi paket →"}</span>
                  </button>
                );
              })()}
              {isAdmin && <a href="/superadmin" className="flex items-center" style={{ gap: 8, marginTop: 12, height: 42, padding: "0 13px", borderRadius: 12, background: INK, color: PAPER, fontSize: 13.5, fontWeight: 700, textDecoration: "none" }}><span style={{ fontSize: 15 }}>⚡</span> Super Admin</a>}
              <form action={signOut} className="flex items-center" style={{ gap: 10, padding: "12px 8px 0", marginTop: isAdmin ? 8 : 12, borderTop: "1px solid #F1E8D9" }}><button style={{ fontSize: 13, fontWeight: 600, color: "#9A8F80", background: "none", border: "none", cursor: "pointer", fontFamily: JAK }}>Odjava · {ownerEmail}</button></form>
            </div>

            {/* MAIN */}
            <div className="flex flex-1 flex-col" style={{ minWidth: 0, background: CREAM }}>
              <div className="flex items-center justify-between" style={{ minHeight: 64, flexShrink: 0, borderBottom: `1px solid ${BORD}`, padding: "12px 20px" }}>
                <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: "-0.01em" }}>{title}</div>
                <form action={signOut} className="lg:hidden"><button style={{ fontSize: 13, fontWeight: 600, color: "#9A8F80", background: "none", border: "none", fontFamily: JAK }}>Odjava</button></form>
              </div>
              <div className="flex gap-2 overflow-x-auto px-4 py-3 lg:hidden" style={{ borderBottom: `1px solid ${BORD}` }}>{NAV.map(([id, label, icon]) => { const on = id === sec; return <button key={id} onClick={() => setSec(id)} className="flex flex-shrink-0 items-center gap-1.5" style={{ height: 34, padding: "0 12px", borderRadius: 10, border: "none", background: on ? INK : "#fff", color: on ? PAPER : MUTED, fontFamily: JAK, fontSize: 13, fontWeight: 700, cursor: "pointer" }}><Ic name={icon} color={on ? PAPER : "#A89B88"} size={15} />{label}</button>; })}</div>

              <div style={{ flex: 1, padding: "20px clamp(16px,2.5vw,28px)" }}>
                {!venue.davcna_stevilka && <div style={{ marginBottom: 18, borderRadius: 14, background: "#FCEFD8", border: "1px solid #F0D9A8", padding: "14px 16px", fontSize: 13.5, color: "#7A5E1E", lineHeight: 1.5 }}>⚠️ Skeniranje še ni aktivno. V <b>Sistem</b> aktiviraj z vzorčnim računom.</div>}

                {sec === "pregled" && (
                  <div className="flex flex-col" style={{ gap: 20 }}>
                    {/* hitre akcije */}
                    <div className="flex" style={{ gap: 10, flexWrap: "wrap" }}>
                      {([["Testiraj račun", "sistem"], ["Uredi kolo", "kolo"], ["Nova kampanja", "marketing"], ["QR koda", "sistem"], ["Ocene", "ocene"]] as const).map(([t, target]) => <button key={t} onClick={() => setSec(target)} style={{ height: 40, padding: "0 16px", border: "1px solid #E4D9C7", borderRadius: 11, background: "#fff", color: INK, fontFamily: JAK, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>{t}</button>)}
                    </div>
                    {/* za dokončat (setup) */}
                    {(() => {
                      const items = [
                        { done: !!venue.davcna_stevilka, label: "Aktiviraj skeniranje računov", to: "sistem" },
                        { done: stampRewards.length > 0 || pointsRewards.length > 0, label: "Dodaj vsaj eno nagrado", to: "nastavitve" },
                        { done: !!venue.google_review_url, label: "Nastavi Google povezavo za ocene", to: "nastavitve" },
                        { done: !!venue.wheel_config, label: "Uredi kolo sreče", to: "kolo" },
                      ];
                      const left = items.filter((i) => !i.done);
                      if (!left.length) return null;
                      return (
                        <div style={{ ...card, display: "flex", flexDirection: "column", gap: 10 }}>
                          <div className="flex items-center justify-between"><span style={{ fontWeight: 700, fontSize: 15 }}>Za dokončat</span><span style={{ fontSize: 12.5, color: "#9A8F80" }}>{items.length - left.length}/{items.length} urejeno</span></div>
                          {left.map((i) => <button key={i.label} onClick={() => setSec(i.to)} className="flex items-center justify-between" style={{ background: CREAM, border: "1px solid #F1E8D9", borderRadius: 12, padding: "11px 14px", cursor: "pointer", fontFamily: JAK, textAlign: "left" }}><span className="flex items-center" style={{ gap: 10 }}><span style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #D9CDBA", flexShrink: 0 }} /><span style={{ fontSize: 13.5, fontWeight: 600, color: INK }}>{i.label}</span></span><span style={{ fontSize: 18, color: "#B5AB9C" }}>›</span></button>)}
                        </div>
                      );
                    })()}
                    <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>
                      <Kpi l="Skeniranja" v={scanCount} d={`${stats.pointsAwarded} podarjenih točk`} dc={GREEN} />
                      <Kpi l="Stranke" v={customerCount} />
                      <Kpi l="Povp. obiski / stranko" v={stats.avgVisits} />
                      <Kpi l="Unovčene točke" v={stats.pointsRedeemed} dc={CORAL} />
                    </div>
                    {/* ROI: kaj ti je Loyavi prinesel (ocena, nastavljiv povpr. račun) */}
                    {(() => {
                      const repeat = Math.max(0, scanCount - customerCount);
                      const revenue = repeat * roiSpend;
                      const rewardsRedeemed = redemptions.length;
                      const cost = PLANS[ownerPlan]?.monthly || 0;
                      return (
                        <div style={{ background: INK, borderRadius: 18, padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
                          <div className="flex items-center justify-between" style={{ flexWrap: "wrap", gap: 10 }}>
                            <span style={{ fontWeight: 800, fontSize: 16, color: "#F8F3EA" }}>Kaj ti je Loyavi prinesel</span>
                            <label className="flex items-center" style={{ gap: 7, fontSize: 12.5, color: "#B7A488" }}>povpr. račun
                              <input type="number" min={1} max={200} value={roiSpend} onChange={(e) => setRoiSpend(Math.max(1, Number(e.target.value) || 1))} style={{ width: 58, height: 30, borderRadius: 8, border: "1px solid rgba(248,243,234,0.2)", background: "rgba(248,243,234,0.08)", color: "#F8F3EA", textAlign: "center", fontFamily: JAK, fontSize: 13 }} /> €
                            </label>
                          </div>
                          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))" }}>
                            <div><div style={{ fontSize: 12, color: "#B7A488", marginBottom: 4 }}>Ocenjen dodaten prihodek</div><div style={{ fontWeight: 800, fontSize: 29, color: "#9DBE8E", letterSpacing: "-0.01em" }}>+{fmtEur(revenue)}</div></div>
                            <div><div style={{ fontSize: 12, color: "#B7A488", marginBottom: 4 }}>Ponovni obiski</div><div style={{ fontWeight: 800, fontSize: 29, color: "#F8F3EA" }}>{repeat}</div></div>
                            <div><div style={{ fontSize: 12, color: "#B7A488", marginBottom: 4 }}>Unovčene nagrade</div><div style={{ fontWeight: 800, fontSize: 29, color: "#E2A04A" }}>{rewardsRedeemed}</div></div>
                            {cost > 0 && <div><div style={{ fontSize: 12, color: "#B7A488", marginBottom: 4 }}>Donos na strošek</div><div style={{ fontWeight: 800, fontSize: 29, color: "#9DBE8E" }}>{revenue > 0 ? Math.round(revenue / cost) : 0}×</div></div>}
                          </div>
                          <div style={{ fontSize: 11.5, color: "rgba(248,243,234,0.45)", lineHeight: 1.5 }}>Ocena: ponovni obiski = skeniranja − prve prijave, pomnoženo s povprečnim računom. Vrednost je ocena, ne točen znesek.</div>
                        </div>
                      );
                    })()}
                    <div className="grid gap-3.5 lg:grid-cols-[1.6fr_1fr]">
                      <div style={card}><div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18 }}>Skeniranja (zadnjih 14 dni)</div><div className="flex items-end" style={{ gap: 5, height: 150 }}>{stats.days.map((d) => <div key={d.label} className="flex flex-1 flex-col items-center justify-end" style={{ gap: 5, height: "100%" }}><div style={{ width: "100%", height: `${Math.round((d.count / stats.maxDay) * 130)}px`, minHeight: d.count ? 4 : 0, borderRadius: "5px 5px 2px 2px", background: AMBER }} /><span style={{ fontSize: 9, color: "#B5AB9C" }}>{d.label}</span></div>)}</div></div>
                      <div style={{ ...card, display: "flex", flexDirection: "column", gap: 14 }}><span style={{ fontWeight: 700, fontSize: 15 }}>Najboljše stranke</span>{topCustomers.length === 0 && <span style={{ fontSize: 13.5, color: "#9A8F80" }}>Še ni strank.</span>}{topCustomers.map((c, i) => <div key={c.id} className="flex items-center" style={{ gap: 11 }}><div className="flex items-center justify-center" style={{ width: 30, height: 30, borderRadius: "50%", background: "#FCEFD8", color: "#B4781E", fontWeight: 800, fontSize: 12 }}>{i + 1}</div><span className="flex-1 truncate" style={{ fontSize: 13.5, fontWeight: 600 }}>{c.email || c.phone || "—"}</span><span style={{ fontSize: 13, fontWeight: 700, color: "#B4862F" }}>{c.points} t</span></div>)}</div>
                    </div>
                  </div>
                )}

                {sec === "analitika" && (
                  <div className="flex flex-col" style={{ gap: 20 }}>
                    {/* časovni filter */}
                    <div className="flex items-center justify-between" style={{ flexWrap: "wrap", gap: 10 }}>
                      <span style={{ fontSize: 13.5, color: MUTED }}>Obdobje</span>
                      {gate.analytics ? (
                        <div className="flex" style={{ background: "#F1E8D9", borderRadius: 12, padding: 4 }}>{([[7, "7 dni"], [30, "30 dni"], [90, "90 dni"], [365, "Leto"]] as const).map(([d, l]) => <button key={d} onClick={() => setRange(d)} style={{ height: 32, padding: "0 14px", border: "none", borderRadius: 9, background: range === d ? "#fff" : "transparent", color: range === d ? INK : "#9A8F80", fontFamily: JAK, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{l}</button>)}</div>
                      ) : (
                        <button onClick={() => setSec("narocnina")} className="flex items-center" style={{ gap: 7, height: 36, padding: "0 14px", border: `1px solid ${BORD}`, borderRadius: 10, background: "#fff", color: MUTED, fontFamily: JAK, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Zadnjih 30 dni <span style={{ fontSize: 11, fontWeight: 800, color: "#B4781E" }}>🔒 časovni filtri v Grow</span></button>
                      )}
                    </div>
                    <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))" }}>
                      <Kpi l="Skeniranja" v={ana.scans} d={`${ana.ptsAw} podarjenih točk`} dc={GREEN} />
                      <Kpi l="Nove stranke" v={ana.newCust} d={`v ${range} dneh`} />
                      <Kpi l="Unovčene nagrade" v={ana.redemptions} d={`${ana.ptsRe} točk porabljenih`} dc={CORAL} />
                      <Kpi l="Povp. obiski / stranko" v={stats.avgVisits} />
                      <Kpi l="Najboljši gosti" v={seg.best} d="200+ točk" />
                      <Kpi l="Neaktivni 21+ dni" v={seg.inactive} d="za reaktivacijo" dc={CORAL} />
                    </div>
                    <div style={card}>
                      <div className="flex items-baseline justify-between" style={{ marginBottom: 16 }}><span style={{ fontWeight: 700, fontSize: 15 }}>Skeniranja po dnevih</span><span style={{ fontSize: 12, color: "#9A8F80" }}>skupaj {ana.scans}</span></div>
                      <div className="flex" style={{ gap: 8 }}>
                        <div className="flex flex-col items-end justify-between" style={{ height: 150, paddingBottom: 16, fontSize: 9, color: "#B5AB9C", minWidth: 14 }}><span>{ana.maxDay}</span><span>{Math.round(ana.maxDay / 2)}</span><span>0</span></div>
                        <div className="flex flex-1 items-end" style={{ gap: 4, height: 150 }}>{ana.days.map((d, i) => <div key={i} className="group relative flex flex-1 flex-col items-center justify-end" style={{ gap: 5, height: "100%" }}><div className="pointer-events-none absolute left-1/2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100" style={{ top: 0, whiteSpace: "nowrap", background: INK, color: PAPER, fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 7, zIndex: 10, boxShadow: "0 6px 16px rgba(42,36,29,0.3)" }}>{d.label} · {d.count} {d.count === 1 ? "sken" : "skenov"}</div><div className="transition-opacity group-hover:opacity-75" style={{ width: "100%", height: `${Math.round((d.count / ana.maxDay) * 118)}px`, minHeight: d.count ? 4 : 0, borderRadius: "4px 4px 1px 1px", background: AMBER }} />{(ana.days.length <= 14 || i % 3 === 0) && <span style={{ fontSize: 8.5, color: "#B5AB9C", whiteSpace: "nowrap" }}>{d.label}</span>}</div>)}</div>
                      </div>
                    </div>
                    <div className="grid gap-3.5 lg:grid-cols-[1fr_1fr]">
                      {/* ure dneva */}
                      <div style={card}>
                        <div className="flex items-baseline justify-between" style={{ marginBottom: 16 }}><span style={{ fontWeight: 700, fontSize: 15 }}>Najbolj obiskane ure</span><span style={{ fontSize: 12, color: "#9A8F80" }}>vrh {ana.maxHour}</span></div>
                        <div className="flex" style={{ gap: 6 }}>
                          <div className="flex flex-col items-end justify-between" style={{ height: 110, paddingBottom: 14, fontSize: 9, color: "#B5AB9C", minWidth: 12 }}><span>{ana.maxHour}</span><span>0</span></div>
                          <div className="flex flex-1 items-end" style={{ gap: 2, height: 110 }}>{ana.hours.map((h, i) => <div key={i} className="group relative flex flex-1 flex-col items-center justify-end" style={{ height: "100%", gap: 4 }}><div className="pointer-events-none absolute left-1/2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100" style={{ top: -2, whiteSpace: "nowrap", background: INK, color: PAPER, fontSize: 10.5, fontWeight: 700, padding: "3px 7px", borderRadius: 7, zIndex: 10, boxShadow: "0 6px 16px rgba(42,36,29,0.3)" }}>{String(i).padStart(2, "0")}:00 · {h} {h === 1 ? "sken" : "skenov"}</div><div className="transition-opacity group-hover:opacity-75" style={{ width: "100%", height: `${Math.round((h / ana.maxHour) * 82)}px`, minHeight: h ? 3 : 0, borderRadius: 2, background: h ? GREEN : "#EFE6D6" }} />{i % 6 === 0 && <span style={{ fontSize: 8, color: "#B5AB9C" }}>{i}h</span>}</div>)}</div>
                        </div>
                      </div>
                      {/* segmenti */}
                      <div style={{ ...card, display: "flex", flexDirection: "column", gap: 12 }}><div style={{ fontWeight: 700, fontSize: 15 }}>Segmenti</div>{([["Najboljši (200+ t)", seg.best, GREEN], ["Aktivni (≤14 dni)", seg.active, INK], ["Neaktivni (21+ dni)", seg.inactive, CORAL]] as const).map(([l, n, c]) => <div key={l} className="flex items-center justify-between"><span style={{ fontSize: 13.5, color: MUTED }}>{l}</span><span style={{ fontWeight: 800, fontSize: 16, color: c }}>{n}</span></div>)}</div>
                    </div>
                    {/* priljubljene nagrade */}
                    <div style={{ ...card, display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>Najpogosteje unovčene nagrade</div>
                      {ana.topRewards.length === 0 ? <span style={{ fontSize: 13.5, color: "#9A8F80" }}>Še ni unovčenih nagrad v tem obdobju.</span> : ana.topRewards.map(([n, c]) => { const max = ana.topRewards[0][1]; return <div key={n} className="flex items-center" style={{ gap: 12 }}><span className="truncate" style={{ width: 150, fontSize: 13.5, fontWeight: 600 }}>{n}</span><div style={{ flex: 1, height: 10, borderRadius: 99, background: "#F1E8D9", overflow: "hidden" }}><div style={{ width: `${Math.round((c / max) * 100)}%`, height: "100%", borderRadius: 99, background: CORAL }} /></div><span style={{ fontSize: 13, fontWeight: 700, color: CORAL, width: 28, textAlign: "right" }}>{c}</span></div>; })}
                    </div>
                  </div>
                )}

                {sec === "ocene" && (
                  <div className="flex flex-col" style={{ gap: 20 }}>
                    <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>
                      <Kpi l="Vseh ocen" v={rev.total} />
                      <Kpi l="Povprečje" v={<span className="flex items-center" style={{ gap: 8 }}>{rev.avg.toFixed(1)} <StarRow n={Math.round(rev.avg)} size={15} /></span>} />
                      <Kpi l="Poslano na Google" v={rev.toGoogle} d={rev.total ? `${Math.round((rev.toGoogle / rev.total) * 100)}% gostov` : undefined} dc={GREEN} />
                      <Kpi l="Slabe ocene (≤3★)" v={rev.low.length} d="prestrežene zasebno" dc={CORAL} />
                    </div>
                    <div className="grid gap-3.5 lg:grid-cols-[1fr_1.4fr]">
                      {/* distribucija */}
                      <div style={{ ...card, display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>Razporeditev ocen</div>
                        {[5, 4, 3, 2, 1].map((s) => { const c = rev.dist[s - 1]; const max = Math.max(1, ...rev.dist); return <div key={s} className="flex items-center" style={{ gap: 10 }}><span style={{ width: 16, fontSize: 13, fontWeight: 700, color: MUTED }}>{s}★</span><div style={{ flex: 1, height: 10, borderRadius: 99, background: "#F1E8D9", overflow: "hidden" }}><div style={{ width: `${Math.round((c / max) * 100)}%`, height: "100%", borderRadius: 99, background: s >= 4 ? GREEN : s === 3 ? AMBER : CORAL }} /></div><span style={{ width: 26, textAlign: "right", fontSize: 13, fontWeight: 700, color: MUTED }}>{c}</span></div>; })}
                      </div>
                      {/* slabe ocene s komentarji */}
                      <div style={{ ...card, display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>Zasebni feedback (≤3★)</div>
                        {rev.low.length === 0 ? <span style={{ fontSize: 13.5, color: "#9A8F80" }}>Ni slabih ocen — odlično! 🎉</span> : rev.low.slice(0, 20).map((r) => <div key={r.id} className="flex flex-col" style={{ gap: 4, borderBottom: "1px solid #F4ECDF", paddingBottom: 10 }}><div className="flex items-center justify-between"><StarRow n={r.stars} /><span style={{ fontSize: 12, color: "#9A8F80" }}>{fmt(r.created_at)}</span></div>{r.comment && <span style={{ fontSize: 13.5, color: INK, lineHeight: 1.45 }}>{r.comment}</span>}</div>)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between" style={{ background: "#FCEFD8", borderRadius: 14, padding: "14px 16px", gap: 12, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, lineHeight: 1.5, color: "#7A5E1E", flex: 1, minWidth: 220 }}>{venue.google_review_url ? <>Google-povezava je nastavljena. 4–5★ gostje gredo naravnost na tvoj Google profil.</> : <>⚠️ Še nimaš Google-povezave. Brez nje gostje pristanejo na Google iskanju imena lokala.</>}</span>
                      <button onClick={() => setSec("nastavitve")} style={{ height: 40, padding: "0 16px", border: "none", borderRadius: 10, background: INK, color: PAPER, fontFamily: JAK, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Nastavi povezavo</button>
                    </div>
                  </div>
                )}

                {sec === "marketing" && (
                  <div className="flex flex-col" style={{ gap: 16 }}>
                    <div className="flex" style={{ background: "#F1E8D9", borderRadius: 12, padding: 4, maxWidth: 480 }}>{([["campaign", "Enkratna kampanja"], ["auto", `Avtomatizacije${autoCount ? ` · ${autoCount}` : ""}`], ["log", "Dnevnik"]] as const).map(([k, l]) => { const locked = k === "auto" && !gate.automations; return <button key={k} onClick={() => setMktTab(k)} style={{ flex: 1, height: 38, border: "none", borderRadius: 9, background: mktTab === k && !locked ? "#fff" : "transparent", color: locked ? "#B4781E" : mktTab === k ? INK : "#9A8F80", fontFamily: JAK, fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>{locked ? "🔒 " : ""}{l}</button>; })}</div>
                    {mktTab === "campaign" && (
                  <div className="grid gap-3.5 lg:grid-cols-[1.4fr_1fr]">
                    <div style={{ ...card, display: "flex", flexDirection: "column", gap: 14 }}>
                      <div className="flex items-center justify-between"><span style={{ fontWeight: 700, fontSize: 15 }}>Nova kampanja</span><span className="flex items-center" style={{ height: 24, padding: "0 10px", borderRadius: 999, background: "rgba(94,127,82,0.14)", color: "#3E5536", fontSize: 11, fontWeight: 800 }}>E-pošta</span></div>
                      <div className="flex flex-col" style={{ gap: 7 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: MUTED }}>Predloge</span>
                        <div className="flex" style={{ gap: 7, flexWrap: "wrap" }}>{PRESETS.map((p) => <button key={p.k} onClick={() => { setCampaignMsg(p.t); setSegSel(p.seg); setRemoved(new Set()); }} style={{ height: 32, padding: "0 12px", borderRadius: 99, border: "1px solid #E4D9C7", background: campaignMsg === p.t ? "#FCEFD8" : "#fff", color: INK, fontFamily: JAK, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>{p.k}</button>)}</div>
                      </div>
                      <textarea rows={4} value={campaignMsg} onChange={(e) => setCampaignMsg(e.target.value)} style={{ width: "100%", border: "1.5px solid #E4D9C7", borderRadius: 12, background: CREAM, padding: 12, fontFamily: JAK, fontSize: 14, color: INK, outline: "none", boxSizing: "border-box", resize: "vertical" }} />
                      {/* kupon kampanje */}
                      <div className="flex flex-col" style={{ gap: 10, background: CREAM, borderRadius: 12, padding: "12px 14px" }}>
                        <div className="flex items-center justify-between">
                          <span style={{ fontSize: 13.5, fontWeight: 700 }}>🎟️ Pripni kupon</span>
                          <button type="button" onClick={() => setCouponOn((o) => !o)} aria-label="kupon" style={{ width: 46, height: 26, borderRadius: 999, border: "none", background: couponOn ? GREEN : "#D9CDBA", position: "relative", cursor: "pointer", flexShrink: 0 }}><span style={{ position: "absolute", top: 3, left: couponOn ? 23 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .15s" }} /></button>
                        </div>
                        {couponOn && (
                          <div className="flex flex-col" style={{ gap: 8 }}>
                            <div className="flex" style={{ gap: 6, flexWrap: "wrap" }}>{["Brezplačna kava", "−20 %", "1+1 gratis", "Rogljiček"].map((p) => <button key={p} onClick={() => setCouponName(p)} style={{ height: 30, padding: "0 11px", borderRadius: 99, border: "1px solid #E4D9C7", background: couponName === p ? "#FCEFD8" : "#fff", color: INK, fontFamily: JAK, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{p}</button>)}</div>
                            <input value={couponName} onChange={(e) => setCouponName(e.target.value)} placeholder="ime kupona" style={inp} />
                            <span style={{ fontSize: 11.5, color: "#9A8F80", lineHeight: 1.4 }}>Vsak prejemnik dobi ta kupon v denarnico, ko odpre kampanjo.</span>
                          </div>
                        )}
                      </div>
                      <label className="flex flex-col" style={{ gap: 5 }}><span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>Komu pošljem (segment)</span><select value={segSel} onChange={(e) => { setSegSel(e.target.value); setRemoved(new Set()); }} style={inp}>{["Najboljši", "Aktivni", "Neaktivni 21+ dni", "Vsi gostje", ...(gate.segments ? ["Po meri"] : [])].map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
                      {!gate.segments && <button onClick={() => setSec("narocnina")} style={{ alignSelf: "flex-start", background: "none", border: "none", padding: 0, fontSize: 12.5, fontWeight: 700, color: "#B4781E", cursor: "pointer" }}>🔒 Segmenti po meri (prag točk) v Grow →</button>}
                      {gate.segments && segSel === "Po meri" && <label className="flex items-center justify-between" style={{ background: CREAM, borderRadius: 12, padding: "9px 14px" }}><span style={{ fontSize: 13, color: MUTED }}>Pravilo: vsaj točk</span><input value={segMinPts} onChange={(e) => { setSegMinPts(Math.max(0, Number(e.target.value) || 0)); setRemoved(new Set()); }} type="number" min={0} style={{ ...inp, width: 90 }} /></label>}
                      {/* seznam prejemnikov */}
                      <div className="flex flex-col" style={{ gap: 8 }}>
                        <div className="flex items-center justify-between"><span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>Prejemniki</span><span style={{ fontSize: 13.5, fontWeight: 800, color: "#B4862F" }}>{recipients.length}</span></div>
                        <div style={{ maxHeight: 176, overflowY: "auto", border: "1px solid #F1E8D9", borderRadius: 12 }}>
                          {recipients.length === 0 ? <div style={{ padding: 16, textAlign: "center", fontSize: 13, color: "#9A8F80" }}>Ni prejemnikov v tem segmentu.</div> : recipients.map((c, i) => <div key={c.id} className="flex items-center justify-between" style={{ padding: "9px 12px", borderTop: i ? "1px solid #F4ECDF" : "none", gap: 8 }}><span className="truncate" style={{ fontSize: 13, fontWeight: 600, minWidth: 0 }}>{c.email || c.phone || "—"}</span><div className="flex items-center" style={{ gap: 9, flexShrink: 0 }}><span style={{ fontSize: 12, color: "#9A8F80" }}>{c.points} t</span><button onClick={() => setRemoved((s) => new Set(s).add(c.id))} aria-label="odstrani" style={{ width: 24, height: 24, border: "1px solid #E4D9C7", borderRadius: 7, background: "#fff", color: CORAL, cursor: "pointer", fontFamily: JAK, fontSize: 12, lineHeight: 1 }}>✕</button></div></div>)}
                        </div>
                        {removed.size > 0 && <button onClick={() => setRemoved(new Set())} style={{ alignSelf: "flex-start", fontSize: 12, fontWeight: 700, color: "#9A8F80", background: "none", border: "none", cursor: "pointer", fontFamily: JAK }}>↩ Povrni odstranjene ({removed.size})</button>}
                      </div>
                      <button onClick={sendCampaign} disabled={recipients.length === 0 || campaignBusy} style={{ height: 48, border: "none", borderRadius: 12, background: INK, color: PAPER, fontFamily: JAK, fontSize: 14.5, fontWeight: 700, cursor: recipients.length === 0 ? "not-allowed" : "pointer", opacity: recipients.length === 0 || campaignBusy ? 0.5 : 1 }}>{campaignBusy ? "Pošiljam…" : `Pošlji e-pošto · ${recipients.length} gostom${couponOn ? " 🎟️" : ""}`}</button>
                      <span style={{ fontSize: 12, color: "#9A8F80", lineHeight: 1.5 }}>Pošlje samo gostom z e-pošto. Rabi nastavljen RESEND_API_KEY (Scale: lasten ključ). SMS/WhatsApp kmalu.</span>
                    </div>
                    <div style={{ ...card, display: "flex", flexDirection: "column", gap: 10 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>Tvoji segmenti</span>
                      {([["Najboljši (200+ t)", seg.best, "Najboljši"], ["Aktivni (≤14 dni)", seg.active, "Aktivni"], ["Neaktivni (21+ dni)", seg.inactive, "Neaktivni 21+ dni"], ["Vsi gostje", customers.length, "Vsi gostje"]] as const).map(([l, n, key]) => <button key={key} onClick={() => { setSegSel(key); setRemoved(new Set()); }} className="flex items-center justify-between" style={{ padding: "9px 10px", borderRadius: 9, background: segSel === key ? "#FCEFD8" : "transparent", border: "none", cursor: "pointer", fontFamily: JAK, textAlign: "left" }}><span style={{ fontSize: 13.5, fontWeight: segSel === key ? 700 : 600, color: segSel === key ? INK : MUTED }}>{l}</span><span style={{ fontWeight: 800, fontSize: 15, color: "#B4862F" }}>{n}</span></button>)}
                      <span style={{ fontSize: 12.5, color: "#9A8F80", lineHeight: 1.5, marginTop: 4 }}>Klikni segment za izbor. »Po meri« nastaviš prag točk, prejemnike pa ročno odstraniš na levi.</span>
                    </div>
                  </div>
                    )}
                    {mktTab === "log" && (() => {
                      const KIND: Record<string, [string, string]> = {
                        welcome: ["Dobrodošlica", GREEN], points: ["Točke za obisk", "#B4862F"], coupon_earned: ["Kupon zaslužen", CORAL],
                        review_thanks: ["Hvala za oceno", AMBER], campaign: ["Kampanja", INK], we_miss_you: ["Pogrešamo te", CORAL],
                        anniversary: ["Obletnica", "#8E5BA6"], birthday_guest: ["Rojstni dan gosta", "#B4862F"], birthday_venue: ["Rojstni dan lokala", AMBER],
                        admin_expiring: ["Opomnik naročnine", MUTED],
                      };
                      const fmtTs = (iso: string) => new Date(iso).toLocaleString("sl-SI", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
                      return (
                        <div style={{ ...card, display: "flex", flexDirection: "column", gap: 4, maxWidth: 760 }}>
                          <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                            <span style={{ fontWeight: 700, fontSize: 15 }}>Dnevnik poslanih sporočil</span>
                            <span style={{ fontSize: 12, color: "#9A8F80" }}>zadnjih {emailLog.length}</span>
                          </div>
                          {emailLog.length === 0 && <span style={{ fontSize: 13.5, color: "#9A8F80" }}>Še ni poslanih sporočil. Tu se bodo beležila avtomatska in kampanjska sporočila.</span>}
                          {emailLog.map((e) => {
                            const [label, kcol] = KIND[e.kind] || [e.kind, MUTED];
                            return (
                              <div key={e.id} className="flex items-center" style={{ gap: 10, padding: "9px 2px", borderBottom: "1px solid #F5EEE0" }}>
                                <span className="flex items-center" style={{ height: 24, padding: "0 10px", borderRadius: 999, background: `${kcol}1A`, color: kcol, fontSize: 11.5, fontWeight: 800, flexShrink: 0, whiteSpace: "nowrap" }}>{label}</span>
                                <span className="flex-1 truncate" style={{ fontSize: 13, fontWeight: 600, color: INK }}>{e.customers?.email || (e.kind === "birthday_venue" ? "vsi gostje z e-pošto" : "lastnik lokala")}</span>
                                <span style={{ fontSize: 12, color: "#9A8F80", flexShrink: 0 }}>{fmtTs(e.created_at)}</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                    {mktTab === "auto" && !gate.automations && lockCard("Marketing avtomatizacije", "Win-back, rojstni dan in obletnica — e-pošta se pošlje SAMA, ko se gost ne vrne. Največji vzvod za ponovne obiske. Odkleneš v Grow.")}
                    {mktTab === "auto" && gate.automations && (
                      <div className="flex flex-col" style={{ gap: 14, maxWidth: 760 }}>
                        <div style={{ background: "#FCEFD8", borderRadius: 14, padding: "14px 16px", fontSize: 13, lineHeight: 1.5, color: "#7A5E1E" }}>Avtomatizacije pošljejo e-pošto <b>same</b>, ko se zgodi sprožilec — vklopiš jih enkrat. (Dejansko pošiljanje se vklopi z e-poštnim providerjem.)</div>
                        {AUTO_DEFS.map((d) => {
                          const a = autos[d.key];
                          return (
                            <div key={d.key} style={{ ...card, display: "flex", flexDirection: "column", gap: a.enabled ? 12 : 0, padding: 16 }}>
                              <div className="flex items-center justify-between" style={{ gap: 12 }}>
                                <div className="flex items-center" style={{ gap: 12, minWidth: 0 }}>
                                  <span style={{ fontSize: 26, flexShrink: 0 }}>{d.emoji}</span>
                                  <div style={{ minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 15 }}>{d.label}</div><div style={{ fontSize: 12.5, color: "#9A8F80", lineHeight: 1.4 }}>{d.desc}</div></div>
                                </div>
                                <button onClick={() => setAuto(d.key, { enabled: !a.enabled })} aria-label="vklop" style={{ width: 50, height: 28, borderRadius: 999, border: "none", background: a.enabled ? GREEN : "#D9CDBA", position: "relative", cursor: "pointer", flexShrink: 0 }}><span style={{ position: "absolute", top: 3, left: a.enabled ? 25 : 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", transition: "left .15s" }} /></button>
                              </div>
                              {a.enabled && (
                                <div className="flex flex-col" style={{ gap: 10, borderTop: "1px solid #F1E8D9", paddingTop: 12 }}>
                                  {d.field === "days" && <label className="flex items-center justify-between" style={{ background: CREAM, borderRadius: 12, padding: "9px 14px" }}><span style={{ fontSize: 13, color: MUTED }}>Po koliko dneh neaktivnosti</span><input type="number" min={1} value={a.days ?? 30} onChange={(e) => setAuto(d.key, { days: Math.max(1, Number(e.target.value) || 30) })} style={{ ...inp, width: 80 }} /></label>}
                                  {d.field === "months" && <label className="flex items-center justify-between" style={{ background: CREAM, borderRadius: 12, padding: "9px 14px" }}><span style={{ fontSize: 13, color: MUTED }}>Po koliko mesecih</span><input type="number" min={1} value={a.months ?? 12} onChange={(e) => setAuto(d.key, { months: Math.max(1, Number(e.target.value) || 12) })} style={{ ...inp, width: 80 }} /></label>}
                                  {d.field === "date" && <label className="flex items-center justify-between" style={{ background: CREAM, borderRadius: 12, padding: "9px 14px" }}><span style={{ fontSize: 13, color: MUTED }}>Datum lokala</span><input type="text" value={a.date ?? "01-01"} onChange={(e) => setAuto(d.key, { date: e.target.value })} placeholder="MM-DD" style={{ ...inp, width: 110 }} /></label>}
                                  <textarea value={a.message} onChange={(e) => setAuto(d.key, { message: e.target.value })} rows={2} placeholder="Sporočilo…" style={{ width: "100%", border: "1.5px solid #E4D9C7", borderRadius: 12, background: CREAM, padding: 12, fontFamily: JAK, fontSize: 14, color: INK, outline: "none", boxSizing: "border-box", resize: "vertical" }} />
                                  <div className="flex items-center justify-between" style={{ background: CREAM, borderRadius: 12, padding: "9px 14px" }}>
                                    <span style={{ fontSize: 13, fontWeight: 700 }}>🎟️ Pripni kupon</span>
                                    <button onClick={() => setAuto(d.key, { coupon: !a.coupon })} aria-label="kupon" style={{ width: 44, height: 24, borderRadius: 999, border: "none", background: a.coupon ? GREEN : "#D9CDBA", position: "relative", cursor: "pointer", flexShrink: 0 }}><span style={{ position: "absolute", top: 3, left: a.coupon ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .15s" }} /></button>
                                  </div>
                                  {a.coupon && <input value={a.couponName} onChange={(e) => setAuto(d.key, { couponName: e.target.value })} placeholder="ime kupona" style={inp} />}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        <button onClick={() => run(() => saveAutomations(autos), "Avtomatizacije shranjene.")} style={{ height: 48, padding: "0 24px", border: "none", borderRadius: 12, background: INK, color: PAPER, fontFamily: JAK, fontSize: 14.5, fontWeight: 700, cursor: "pointer", alignSelf: "flex-start" }}>Shrani avtomatizacije</button>
                      </div>
                    )}
                  </div>
                )}

                {sec === "zgodovina" && (
                  <div className="flex flex-col" style={{ gap: 16 }}>
                    <div className="flex" style={{ background: "#F1E8D9", borderRadius: 12, padding: 4, width: 280 }}>{(["given", "redeemed"] as const).map((t) => <button key={t} onClick={() => setHistTab(t)} style={{ flex: 1, height: 36, border: "none", borderRadius: 9, background: histTab === t ? "#fff" : "transparent", color: histTab === t ? INK : "#9A8F80", fontFamily: JAK, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>{t === "given" ? "Podarjene" : "Unovčene"}</button>)}</div>
                    {/* filtri: ime / dan / ura */}
                    <div className="flex flex-wrap items-center" style={{ gap: 10 }}>
                      <input value={histQuery} onChange={(e) => setHistQuery(e.target.value)} placeholder="Išči ime / email…" style={{ ...inp, maxWidth: 230 }} />
                      <input value={histDay} onChange={(e) => setHistDay(e.target.value)} type="date" aria-label="Dan" style={{ ...inp, width: 160 }} />
                      <select value={histHour} onChange={(e) => setHistHour(e.target.value)} aria-label="Ura" style={{ ...inp, width: 150 }}><option value="">Vse ure</option>{Array.from({ length: 24 }).map((_, h) => <option key={h} value={h}>{String(h).padStart(2, "0")}:00–{String(h).padStart(2, "0")}:59</option>)}</select>
                      {histActive && <button onClick={() => { setHistQuery(""); setHistDay(""); setHistHour(""); }} style={{ height: 46, padding: "0 14px", border: "1px solid #E4D9C7", borderRadius: 12, background: "#fff", color: MUTED, fontFamily: JAK, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Počisti</button>}
                      <span style={{ fontSize: 13, color: "#9A8F80", marginLeft: "auto" }}>{histTab === "given" ? givenView.length : redeemedView.length} zapisov</span>
                    </div>
                    <div style={{ ...card, padding: "6px 22px" }}>
                      {histTab === "given" ? (givenView.length === 0 ? <div style={{ padding: "20px 0", textAlign: "center", fontSize: 13.5, color: "#9A8F80" }}>{histActive ? "Ni zadetkov za izbrane filtre." : "Ni zapisov."}</div> : givenView.map((g, i) => <div key={g.id} className="flex items-center justify-between" style={{ padding: "14px 0", borderTop: i ? "1px solid #F4ECDF" : "none", gap: 12 }}><div style={{ minWidth: 0 }}><div className="flex items-center truncate" style={{ fontSize: 14, fontWeight: 600, gap: 8 }}>{g.who}{g.manual && <span style={{ height: 18, padding: "0 7px", borderRadius: 999, background: "#FCEFD8", color: "#B4781E", fontSize: 10.5, fontWeight: 800, display: "inline-flex", alignItems: "center", flexShrink: 0 }}>ročno</span>}</div><div style={{ fontSize: 12.5, color: "#9A8F80" }}>{g.manual ? "ročni vnos" : "skeniran račun"} · {fmt(g.t)}</div></div><span style={{ fontSize: 14, fontWeight: 700, color: GREEN, whiteSpace: "nowrap" }}>+{g.points}</span></div>))
                        : (redeemedView.length === 0 ? <div style={{ padding: "20px 0", textAlign: "center", fontSize: 13.5, color: "#9A8F80" }}>{histActive ? "Ni zadetkov za izbrane filtre." : "Ni zapisov."}</div> : redeemedView.map((r, i) => <div key={r.id} className="flex items-center justify-between" style={{ padding: "14px 0", borderTop: i ? "1px solid #F4ECDF" : "none", gap: 12 }}><div style={{ minWidth: 0 }}><div className="truncate" style={{ fontSize: 14, fontWeight: 600 }}>{r.customers?.email ?? r.customers?.phone ?? "—"}</div><div style={{ fontSize: 12.5, color: "#9A8F80" }}>{r.rewards?.name ?? "nagrada"} · {fmt(r.created_at)}</div></div><span style={{ fontSize: 14, fontWeight: 700, color: CORAL, whiteSpace: "nowrap" }}>−{r.points_spent}</span></div>))}
                    </div>
                  </div>
                )}

                {sec === "stranke" && (
                  <div className="flex flex-col" style={{ gap: 14 }}>
                    <div className="flex items-center" style={{ gap: 12, flexWrap: "wrap" }}>
                      <input value={custQuery} onChange={(e) => setCustQuery(e.target.value)} placeholder="Išči po emailu / telefonu…" style={{ ...inp, maxWidth: 320 }} />
                      <span style={{ fontSize: 13, color: "#9A8F80" }}>{custFiltered.length} {custFiltered.length === 1 ? "stranka" : "strank"}</span>
                    </div>
                    <div style={{ ...card, padding: 0, overflow: "hidden" }}>
                      <div className="hidden items-center sm:flex" style={{ gap: 14, padding: "14px 22px", fontSize: 11.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "#A89B88", background: "#FBF6EC" }}><div style={{ flex: 1 }}>Stranka</div><div style={{ width: 64, textAlign: "right" }}>Točke</div><div style={{ width: 60, textAlign: "right" }}>Žigi</div><div style={{ width: 60, textAlign: "right" }}>Obiski</div><div style={{ width: 110, textAlign: "right" }}>Zadnji</div><div style={{ width: 84, textAlign: "right" }}>Ročno</div></div>
                      {custFiltered.length === 0 && <div style={{ padding: "28px 0", textAlign: "center", fontSize: 14, color: "#9A8F80" }}>{customers.length === 0 ? "Še ni strank." : "Ni zadetkov."}</div>}
                      {custFiltered.map((c, i) => { const v = stats.visits.get(c.id); return <div key={c.id} onClick={() => setCustSel(c)} className="flex items-center" style={{ gap: 14, padding: "13px 22px", borderTop: i ? "1px solid #F4ECDF" : "none", cursor: "pointer" }}><div className="flex flex-1 items-center truncate" style={{ fontSize: 14, fontWeight: 600, minWidth: 0 }}>{c.email ?? c.phone ?? "—"}</div><div style={{ width: 64, textAlign: "right", fontSize: 13.5, fontWeight: 700, color: "#B4862F" }}>{c.points}</div><div className="hidden sm:block" style={{ width: 60, textAlign: "right", fontSize: 13.5, color: MUTED }}>{c.stamps ?? 0}</div><div className="hidden sm:block" style={{ width: 60, textAlign: "right", fontSize: 13.5, color: MUTED }}>{v?.visits ?? 0}</div><div className="hidden sm:block" style={{ width: 110, textAlign: "right", fontSize: 13, color: "#9A8F80" }}>{v ? fmt(v.last) : "—"}</div><div style={{ width: 84, textAlign: "right" }}><button onClick={(e) => { e.stopPropagation(); const n = Number(window.prompt(`Dodaj točke za ${c.email ?? c.phone ?? "stranko"}:`, "10")); if (n) run(() => addManualPoints(c.id, n), "Točke dodane."); }} style={{ border: "1px solid #E4D9C7", borderRadius: 9, padding: "5px 9px", fontSize: 12, fontWeight: 700, background: "#fff", cursor: "pointer", fontFamily: JAK }}>+ točke</button></div></div>; })}
                    </div>
                  </div>
                )}

                {sec === "kolo" && (
                  <div className="flex flex-col" style={{ gap: 16, maxWidth: 780 }}>
                    <div style={{ background: "#FCEFD8", borderRadius: 14, padding: "14px 16px", fontSize: 13, lineHeight: 1.5, color: "#7A5E1E" }}>Kolo se zavrti <b>samo novim gostom</b> ob prvi prijavi (welcome nagrada). Tu izbereš segmente in kako se določi zadetek.</div>
                    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
                      <div className="flex flex-col" style={{ gap: 14 }}>
                        {/* vklop + način */}
                        <div style={{ ...card, display: "flex", flexDirection: "column", gap: 14 }}>
                          <div className="flex items-center justify-between">
                            <div><div style={{ fontWeight: 700, fontSize: 15 }}>Kolo sreče</div><div style={{ fontSize: 12.5, color: "#9A8F80" }}>Prikaži kolo novim gostom</div></div>
                            <button onClick={() => patchWheel({ enabled: !wheel.enabled })} aria-label="vklop" style={{ width: 50, height: 28, borderRadius: 999, border: "none", background: wheel.enabled ? GREEN : "#D9CDBA", position: "relative", cursor: "pointer", flexShrink: 0 }}><span style={{ position: "absolute", top: 3, left: wheel.enabled ? 25 : 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", transition: "left .15s" }} /></button>
                          </div>
                          <div style={{ height: 1, background: "#F1E8D9" }} />
                          <div className="flex flex-col" style={{ gap: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>Način zadetka</span>
                            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                              {([["fixed", "Vedno isti zadetek", "Kolo se vrti, a vedno pristane na isti nagradi."], ["weighted", "Naključno (%)", "Vsak segment ima svoj % možnosti."]] as const).map(([m, t, d]) => <button key={m} onClick={() => patchWheel({ mode: m })} style={{ textAlign: "left", border: wheel.mode === m ? `2px solid ${AMBER}` : "1px solid #E4D9C7", borderRadius: 14, background: wheel.mode === m ? "#FCEFD8" : "#fff", padding: "12px 13px", cursor: "pointer", fontFamily: JAK }}><div style={{ fontSize: 13.5, fontWeight: 700 }}>{t}</div><div style={{ fontSize: 11.5, color: "#9A8F80", lineHeight: 1.4, marginTop: 3 }}>{d}</div></button>)}
                            </div>
                          </div>
                        </div>
                        {/* segmenti */}
                        <div style={{ ...card, display: "flex", flexDirection: "column", gap: 10 }}>
                          <div className="flex items-center justify-between"><span style={{ fontWeight: 700, fontSize: 15 }}>Segmenti</span>{wheel.mode === "weighted" && <span style={{ fontSize: 12, color: totalW > 0 ? "#9A8F80" : CORAL }}>skupaj {totalW} uteži</span>}</div>
                          {wheel.segments.map((s, i) => (
                            <div key={i} className="flex items-center" style={{ gap: 8 }}>
                              {wheel.mode === "fixed" ? <button onClick={() => patchWheel({ winner: i })} aria-label="zmagovalec" title="Naredi za zadetek" style={{ width: 22, height: 22, borderRadius: "50%", border: wheel.winner === i ? `6px solid ${GREEN}` : "2px solid #D9CDBA", background: "#fff", cursor: "pointer", flexShrink: 0 }} /> : <span style={{ width: 10, height: 10, borderRadius: "50%", background: SEGFILL[i % SEGFILL.length], flexShrink: 0, margin: "0 6px" }} />}
                              <input value={s.label} onChange={(e) => setSeg(i, { label: e.target.value })} placeholder="napis segmenta" style={{ ...inp, flex: 1 }} />
                              {wheel.mode === "weighted" && <><input value={s.weight} onChange={(e) => setSeg(i, { weight: Math.max(0, Number(e.target.value) || 0) })} type="number" min={0} style={{ ...inp, width: 62 }} /><span style={{ fontSize: 12, fontWeight: 700, color: "#9A8F80", width: 38, textAlign: "right" }}>{totalW > 0 ? Math.round((s.weight / totalW) * 100) : 0}%</span></>}
                              <button onClick={() => patchWheel({ segments: wheel.segments.filter((_, j) => j !== i), winner: Math.max(0, Math.min(wheel.winner, wheel.segments.length - 2)) })} disabled={wheel.segments.length <= 2} aria-label="odstrani" style={{ width: 38, height: 46, border: "1px solid #E4D9C7", borderRadius: 12, background: "#fff", color: CORAL, cursor: wheel.segments.length <= 2 ? "not-allowed" : "pointer", opacity: wheel.segments.length <= 2 ? 0.4 : 1, fontFamily: JAK, flexShrink: 0 }}>✕</button>
                            </div>
                          ))}
                          {wheel.segments.length < 8 && <button onClick={() => patchWheel({ segments: [...wheel.segments, { label: "", weight: 1 }] })} className="flex items-center justify-center" style={{ height: 44, border: "1.5px dashed #E0D2BC", borderRadius: 12, color: "#9A8F80", fontSize: 13.5, fontWeight: 700, gap: 8, background: "transparent", cursor: "pointer", fontFamily: JAK }}>+ Dodaj segment</button>}
                          {wheel.mode === "fixed" && <span style={{ fontSize: 12, color: "#9A8F80", lineHeight: 1.5 }}>Zmagovalni segment (zelena pika) gost vedno osvoji — drugi so samo za videz.</span>}
                        </div>
                        <div className="flex" style={{ gap: 10 }}>
                          <button onClick={() => run(() => saveWheel(wheel), "Kolo shranjeno.")} style={{ height: 48, padding: "0 22px", border: "none", borderRadius: 12, background: INK, color: PAPER, fontFamily: JAK, fontSize: 14.5, fontWeight: 700, cursor: "pointer" }}>Shrani kolo</button>
                          <button onClick={() => setWheel(DEFAULT_WHEEL)} style={{ height: 48, padding: "0 18px", border: "1.5px solid #E4D9C7", borderRadius: 12, background: "#fff", color: MUTED, fontFamily: JAK, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Ponastavi</button>
                        </div>
                      </div>
                      {/* predogled */}
                      <div className="flex flex-col items-center" style={{ ...card, gap: 12, height: "fit-content" }}>
                        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#A89B88" }}>Predogled</span>
                        <WheelMini segments={wheel.segments} winner={wheel.mode === "fixed" ? wheel.winner : -1} accent={settingsColor} />
                        <span style={{ fontSize: 12.5, color: wheel.enabled ? GREEN : "#9A8F80", fontWeight: 700 }}>{wheel.enabled ? "● Aktivno" : "○ Izklopljeno"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {sec === "sistem" && (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {/* QR */}
                    <div style={{ ...card, display: "flex", flexDirection: "column", gap: 14 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>QR koda lokala</span>
                      <span style={{ fontSize: 13, color: "#9A8F80", lineHeight: 1.5 }}>Natisni in postavi na pult. Gostje skenirajo → odpre se njihova stran zvestobe.</span>
                      <QrEditor path={`/p/${venue.public_code}`} accent={AMBER} venueName={venue.name} brandColor={venue.brand_color} logoUrl={venue.logo_url} reward={stampRewards[0]?.name} />
                      <a href={`/p/${venue.public_code}`} target="_blank" rel="noreferrer" className="flex items-center justify-center" style={{ height: 42, borderRadius: 10, border: "1.5px solid #E4D9C7", color: INK, textDecoration: "none", fontSize: 13.5, fontWeight: 700, fontFamily: JAK }}>Odpri predogled gostove strani →</a>
                      <span style={{ fontSize: 12, color: "#9A8F80", lineHeight: 1.5 }}>Uredi obliko, barve in logo QR-ja zgoraj. »Prenesi plakat« naredi brandiran plakat za mizo.</span>
                    </div>
                    {/* skeniranje */}
                    <div className="flex flex-col" style={{ gap: 16 }}>
                      <div style={{ background: "#fff", border: `2px solid ${venue.davcna_stevilka ? GREEN : AMBER}`, borderRadius: 18, padding: 22, display: "flex", flexDirection: "column", gap: 12 }}>
                        <div className="flex items-center justify-between"><span style={{ fontWeight: 700, fontSize: 15 }}>Skeniranje računov</span><span style={{ height: 26, padding: "0 11px", borderRadius: 999, background: venue.davcna_stevilka ? "rgba(94,127,82,0.16)" : "#FCEFD8", color: venue.davcna_stevilka ? "#3E5536" : "#B4781E", fontSize: 11.5, fontWeight: 800, display: "flex", alignItems: "center" }}>{venue.davcna_stevilka ? "Aktivno" : "Ni aktivno"}</span></div>
                        {venue.davcna_stevilka ? <span style={{ fontSize: 13, color: MUTED, lineHeight: 1.5 }}>Sprejemamo račune z davčno <b>{venue.davcna_stevilka}</b>. Točke prinesejo samo tvoji računi.</span> : <span style={{ fontSize: 13, color: MUTED, lineHeight: 1.5 }}>Aktiviraj s skeniranjem vzorčnega računa <b>ali</b> ročno vpiši davčno številko spodaj.</span>}
                        <button onClick={() => openScan("activate")} style={{ height: 44, border: "none", borderRadius: 12, background: AMBER, color: INK, fontFamily: JAK, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{venue.davcna_stevilka ? "Ponovno aktiviraj (skeniraj)" : "Aktiviraj s skeniranjem"}</button>
                        <form action={async (fd) => { await updateVenueSettings(fd); router.refresh(); flash("Davčna shranjena."); }} className="flex items-center" style={{ gap: 8, borderTop: "1px solid #F1E8D9", paddingTop: 12 }}>
                          <input name="davcna_stevilka" defaultValue={venue.davcna_stevilka ?? ""} placeholder="Ročno: davčna (8 številk)" inputMode="numeric" style={{ ...inp, flex: 1 }} />
                          <button style={{ height: 46, padding: "0 14px", border: "1px solid #E4D9C7", borderRadius: 12, background: "#fff", color: INK, fontFamily: JAK, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Shrani</button>
                        </form>
                      </div>
                      {/* test */}
                      <div style={{ ...card, display: "flex", flexDirection: "column", gap: 10 }}>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>Testiraj račun</span>
                        <span style={{ fontSize: 13, color: MUTED, lineHeight: 1.5 }}>Poskeniraj račun in preverimo, ali je <b>veljaven za tvoj lokal</b> in <b>unikaten</b> — brez dodeljevanja točk (ne gleda ure ne datuma).</span>
                        <button onClick={() => openScan("test")} style={{ height: 44, border: "1.5px solid #E4D9C7", borderRadius: 12, background: "#fff", color: INK, fontFamily: JAK, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Odpri skener za test</button>
                      </div>
                    </div>
                  </div>
                )}

                {sec === "nastavitve" && (
                  <div className="flex flex-col" style={{ gap: 16, maxWidth: 580 }}>
                    {/* nagrade za žige */}
                    <div style={{ ...card, display: "flex", flexDirection: "column", gap: 10 }}>
                      <div className="flex items-center" style={{ gap: 8 }}><span style={{ fontWeight: 700, fontSize: 15 }}>Nagrade za žige</span><span style={{ fontSize: 12, color: "#9A8F80" }}>kartonček · vrednost = št. žigov</span></div>
                      {stampRewards.length === 0 && <span style={{ fontSize: 13, color: "#9A8F80" }}>Ni žig-nagrade.</span>}
                      {stampRewards.map((r) => (
                        <form key={r.id} action={async (fd) => { await saveReward(fd); router.refresh(); flash("Nagrada shranjena."); }} className="flex items-center" style={{ gap: 8 }}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="kind" value="stamp" />
                          {rewardThumb(r)}
                          <input name="name" defaultValue={r.name} style={{ ...inp, flex: 1 }} />
                          <input name="points_required" type="number" defaultValue={String(r.points_required)} title="žigov" style={{ ...inp, width: 72 }} />
                          <span style={{ fontSize: 12, color: "#9A8F80" }}>žig.</span>
                          <button style={{ height: 46, padding: "0 14px", border: "none", borderRadius: 12, background: INK, color: PAPER, fontFamily: JAK, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Shrani</button>
                          <button type="button" onClick={async () => { await deleteReward(r.id); router.refresh(); flash("Nagrada izbrisana."); }} style={{ height: 46, width: 40, border: "1px solid #E4D9C7", borderRadius: 12, background: "#fff", color: CORAL, cursor: "pointer", fontFamily: JAK }}>✕</button>
                        </form>
                      ))}
                      {stampRewards.length === 0 && (
                        <form action={async (fd) => { await saveReward(fd); router.refresh(); flash("Žig-nagrada dodana."); }} className="flex items-center" style={{ gap: 8, borderTop: "1px solid #F1E8D9", paddingTop: 12, marginTop: 4 }}>
                          <input type="hidden" name="kind" value="stamp" />
                          <input name="name" placeholder="npr. Brezplačna kava" style={{ ...inp, flex: 1 }} />
                          <input name="points_required" type="number" placeholder="žigi" style={{ ...inp, width: 72 }} />
                          <button style={{ height: 46, padding: "0 14px", border: "none", borderRadius: 12, background: AMBER, color: INK, fontFamily: JAK, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Dodaj</button>
                        </form>
                      )}
                    </div>
                    {/* nagrade za točke */}
                    <div style={{ ...card, display: "flex", flexDirection: "column", gap: 10 }}>
                      <div className="flex items-center" style={{ gap: 8 }}><span style={{ fontWeight: 700, fontSize: 15 }}>Nagrade za točke</span><span style={{ fontSize: 12, color: "#9A8F80" }}>vrednost = št. točk</span></div>
                      {pointsRewards.length === 0 && <span style={{ fontSize: 13, color: "#9A8F80" }}>Ni točkovnih nagrad.</span>}
                      {pointsRewards.map((r) => (
                        <form key={r.id} action={async (fd) => { await saveReward(fd); router.refresh(); flash("Nagrada shranjena."); }} className="flex items-center" style={{ gap: 8 }}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="kind" value="points" />
                          {rewardThumb(r)}
                          <input name="name" defaultValue={r.name} style={{ ...inp, flex: 1 }} />
                          <input name="points_required" type="number" defaultValue={String(r.points_required)} style={{ ...inp, width: 72 }} />
                          <span style={{ fontSize: 12, color: "#9A8F80" }}>t</span>
                          <button style={{ height: 46, padding: "0 14px", border: "none", borderRadius: 12, background: INK, color: PAPER, fontFamily: JAK, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Shrani</button>
                          <button type="button" onClick={async () => { await deleteReward(r.id); router.refresh(); flash("Nagrada izbrisana."); }} style={{ height: 46, width: 40, border: "1px solid #E4D9C7", borderRadius: 12, background: "#fff", color: CORAL, cursor: "pointer", fontFamily: JAK }}>✕</button>
                        </form>
                      ))}
                      <form action={async (fd) => { await saveReward(fd); router.refresh(); flash("Nagrada dodana."); }} className="flex items-center" style={{ gap: 8, borderTop: "1px solid #F1E8D9", paddingTop: 12, marginTop: 4 }}>
                        <input type="hidden" name="kind" value="points" />
                        <input name="name" placeholder="Nova nagrada" style={{ ...inp, flex: 1 }} />
                        <input name="points_required" type="number" placeholder="točke" style={{ ...inp, width: 72 }} />
                        <button style={{ height: 46, padding: "0 14px", border: "none", borderRadius: 12, background: AMBER, color: INK, fontFamily: JAK, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Dodaj</button>
                      </form>
                    </div>
                    {/* logo */}
                    <div style={{ ...card, display: "flex", flexDirection: "column", gap: 12 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>Logo lokala</span>
                      <div className="flex items-center" style={{ gap: 14 }}>
                        <div className="flex items-center justify-center" style={{ width: 56, height: 56, borderRadius: 14, background: venue.logo_url ? "#fff" : INK, color: PAPER, fontWeight: 800, fontSize: 22, overflow: "hidden", border: `1px solid ${BORD}`, flexShrink: 0 }}>
                          {venue.logo_url ? <img src={venue.logo_url} alt="logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : venue.name.charAt(0).toUpperCase()}
                        </div>
                        <label className="inline-flex items-center" style={{ height: 42, padding: "0 16px", border: "1.5px solid #E4D9C7", borderRadius: 12, background: "#fff", color: INK, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
                          {logoBusy ? "Nalagam…" : venue.logo_url ? "Zamenjaj logo" : "Naloži logo"}
                          <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={onLogoPick} disabled={logoBusy} style={{ display: "none" }} />
                        </label>
                        {venue.logo_url && <button onClick={() => run(() => removeLogo(), "Logo odstranjen.")} style={{ height: 42, padding: "0 14px", border: "1px solid #E4D9C7", borderRadius: 12, background: "#fff", color: CORAL, fontFamily: JAK, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Odstrani</button>}
                      </div>
                      <span style={{ fontSize: 11.5, color: "#9A8F80", lineHeight: 1.4 }}>PNG / JPG / WEBP / SVG do 2 MB. Pokaže se gostom na njihovi strani zvestobe.</span>
                    </div>
                    {/* lokal in točke */}
                    <div style={{ ...card, display: "flex", flexDirection: "column", gap: 14 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>Lokal in pravila</span>
                      <label className="flex flex-col" style={{ gap: 5 }}><span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>Ime lokala</span><input value={sName} onChange={(e) => setSName(e.target.value)} style={inp} /></label>
                      {/* barva — color picker + hex */}
                      <div className="flex flex-col" style={{ gap: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>Barva znamke</span>
                        <div className="flex items-center" style={{ gap: 10 }}>
                          <label className="flex items-center justify-center" style={{ width: 46, height: 46, borderRadius: 12, border: "1.5px solid #E4D9C7", background: settingsColor, cursor: "pointer", position: "relative", overflow: "hidden", flexShrink: 0 }}><input type="color" value={/^#[0-9a-fA-F]{6}$/.test(settingsColor) ? settingsColor : "#E2A04A"} onChange={(e) => setSettingsColor(e.target.value)} style={{ position: "absolute", inset: 0, width: "150%", height: "150%", opacity: 0, cursor: "pointer", border: "none" }} /></label>
                          <div className="flex items-center" style={{ gap: 8, border: "1.5px solid #E4D9C7", borderRadius: 12, height: 46, padding: "0 14px", background: "#fff", flex: 1, maxWidth: 200 }}>
                            <span style={{ width: 18, height: 18, borderRadius: 5, background: settingsColor, flexShrink: 0 }} />
                            <input value={settingsColor.toUpperCase()} onChange={(e) => { let v = e.target.value.replace(/[^#0-9a-fA-F]/g, ""); if (!v.startsWith("#")) v = "#" + v; setSettingsColor(v.slice(0, 7)); }} style={{ flex: 1, border: "none", outline: "none", fontFamily: JAK, fontSize: 14, fontWeight: 700, color: INK, background: "transparent" }} />
                          </div>
                          <div className="flex" style={{ gap: 6 }}>{["#E2A04A", "#C4623D", "#5E7F52", "#3D5A80", "#8E5BA6"].map((c) => <button type="button" key={c} onClick={() => setSettingsColor(c)} aria-label="barva" style={{ width: 26, height: 26, borderRadius: "50%", border: "none", background: c, cursor: "pointer", boxShadow: c.toLowerCase() === settingsColor.toLowerCase() ? "0 0 0 2px #fff,0 0 0 4px #2A241D" : "none" }} />)}</div>
                        </div>
                      </div>
                      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <label className="flex flex-col" style={{ gap: 5 }}><span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>Točke na obisk</span><input value={sPoints} onChange={(e) => setSPoints(e.target.value)} type="number" min={0} style={inp} /></label>
                        <label className="flex flex-col" style={{ gap: 5 }}><span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>Žigov za kartonček</span><input value={sGoal} onChange={(e) => setSGoal(e.target.value)} type="number" min={4} max={12} style={inp} /></label>
                      </div>
                      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <label className="flex flex-col" style={{ gap: 5 }}><span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>Časovno okno računa (ure)</span><input value={sWindow} onChange={(e) => setSWindow(e.target.value)} type="number" min={1} style={inp} /></label>
                        <label className="flex flex-col" style={{ gap: 5 }}><span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>Razmik med skeniranji (min)</span><input value={sCooldown} onChange={(e) => setSCooldown(e.target.value)} type="number" min={0} style={inp} /></label>
                      </div>
                      <span style={{ fontSize: 11.5, color: "#9A8F80", lineHeight: 1.4, marginTop: -6 }}>Razmik = koliko časa mora miniti, preden ista stranka spet skenira (npr. 60 = ena kava na uro). 0 = brez omejitve.</span>
                      <label className="flex flex-col" style={{ gap: 5 }}><span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>Google povezava za ocene</span><input value={sGoogle} onChange={(e) => setSGoogle(e.target.value)} type="url" placeholder="https://g.page/r/…" style={inp} /><span style={{ fontSize: 11.5, color: "#9A8F80", lineHeight: 1.4 }}>Kamor pošljemo zadovoljne goste (4–5★). Najdeš jo v Google Business profilu → »Pridobi več ocen«.</span></label>
                      <label className="flex flex-col" style={{ gap: 5 }}><span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>Jezik gostove strani</span><select name="language" value={lang} onChange={(e) => setLang(e.target.value)} style={inp}>{LANGS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select><span style={{ fontSize: 11.5, color: "#9A8F80", lineHeight: 1.4 }}>Jezik celotnega flowa za goste. Prevodi (EN/HR/SR/BS/DE) se vklopijo kmalu — zaenkrat se nastavitev shrani.</span></label>
                      <button onClick={() => { const fd = new FormData(); fd.set("name", sName); fd.set("brand_color", settingsColor); fd.set("points_per_visit", sPoints); fd.set("stamp_goal", sGoal); fd.set("scan_window_hours", sWindow); fd.set("scan_cooldown_minutes", sCooldown); fd.set("google_review_url", sGoogle); fd.set("language", lang); run(() => updateVenueSettings(fd), "Nastavitve shranjene."); }} style={{ marginTop: 4, height: 48, border: "none", borderRadius: 12, background: INK, color: PAPER, fontFamily: JAK, fontSize: 14.5, fontWeight: 700, cursor: "pointer", alignSelf: "flex-start", padding: "0 22px" }}>Shrani</button>
                    </div>
                    {curPlan === "scale" && (
                      <div style={{ ...card, display: "flex", flexDirection: "column", gap: 12 }}>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>E-pošta iz tvoje domene <span style={{ fontSize: 11, fontWeight: 800, color: "#B4781E" }}>SCALE</span></span>
                        <span style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.5 }}>Vnesi svoj Resend ključ + pošiljatelja — kampanje gostom gredo iz tvoje domene (boljša dostavljivost + branding).</span>
                        <form action={async (fd) => { await saveEmailSettings(fd); router.refresh(); flash("E-pošta shranjena."); }} className="flex flex-col" style={{ gap: 10 }}>
                          <label className="flex flex-col" style={{ gap: 5 }}><span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>Resend API ključ</span><input name="resend_api_key" defaultValue={billingVenue.resend_api_key ?? ""} placeholder="re_…" style={inp} /></label>
                          <label className="flex flex-col" style={{ gap: 5 }}><span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>Pošiljatelj (From)</span><input name="email_from" defaultValue={billingVenue.email_from ?? ""} placeholder="Ime <pozdrav@tvojadomena.si>" style={inp} /></label>
                          <button style={{ height: 46, padding: "0 18px", border: "none", borderRadius: 12, background: INK, color: PAPER, fontFamily: JAK, fontSize: 13.5, fontWeight: 700, cursor: "pointer", alignSelf: "flex-start" }}>Shrani e-pošto</button>
                        </form>
                      </div>
                    )}
                  </div>
                )}

                {sec === "narocnina" && (() => {
                  const plan = (billingVenue.plan ?? "free") as PlanKey;
                  const status = billingVenue.subscription_status ?? "active";
                  const paid = plan !== "free" && status !== "canceled";
                  const cycleNow: "monthly" | "yearly" = billingVenue.billing_cycle === "yearly" ? "yearly" : "monthly";
                  const monthlyEq = monthlyEquivalent(plan, billingVenue.billing_cycle, billingVenue.custom_price_eur);
                  const nextCharge = billingVenue.current_period_end ? new Date(billingVenue.current_period_end) : null;
                  const cancelAtEnd = !!billingVenue.cancel_at_period_end;
                  const fmtDay = (d: Date) => d.toLocaleDateString("sl-SI", { day: "2-digit", month: "2-digit", year: "numeric" });
                  const FEATS: Record<string, string[]> = {
                    start: ["1 lokal", "Žigi, točke, kuponi", "Google ocene", "Kolo sreče", "E-pošta na segmente", "Osnovna analitika"],
                    grow: ["Vse iz Start", "Do 5 lokalov", "Segmentacija po meri", "Marketing avtomatizacije", "Napredna analitika", "Embed widget"],
                    scale: ["Vse iz Grow", "Veriga lokalov", "POS / API integracija", "Namenski skrbnik"],
                  };
                  const cards: [PlanKey, boolean][] = [["start", false], ["grow", true], ["scale", false]];
                  const perMonth = (p: PlanKey) => (billingCycle === "yearly" ? monthlyEquivalent(p, "yearly") : PLANS[p].monthly || 0);
                  const trialUntil = access.until ? new Date(access.until) : null;
                  return (
                    <div className="flex flex-col" style={{ gap: 16, maxWidth: 680 }}>
                      {/* TRIAL ODŠTEVANJE */}
                      {(access.state === "trial" || access.state === "trialing") && (
                        <div className="flex items-center" style={{ gap: 12, background: "linear-gradient(135deg,#FCEFD8,#F8E2BD)", border: "1px solid #F0D9A8", borderRadius: 16, padding: "14px 16px" }}>
                          <div className="flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: 12, background: "#fff", fontSize: 20, flexShrink: 0 }}>⏳</div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 15, color: "#7A5E1E" }}>Brezplačno še {access.daysLeft} {access.daysLeft === 1 ? "dan" : access.daysLeft === 2 ? "dneva" : "dni"}</div>
                            <div style={{ fontSize: 12.5, color: "#9A7B36", lineHeight: 1.4 }}>
                              {access.state === "trialing" && trialUntil
                                ? `${fmtDay(trialUntil)} se prične obračun ${fmtEur(monthlyEq)}/mes.`
                                : trialUntil ? `Preizkus traja do ${fmtDay(trialUntil)} — nato izberi paket za nadaljevanje.` : "Izberi paket za nadaljevanje."}
                            </div>
                            {access.state === "trial" && (
                              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#7A5E1E", marginTop: 4 }}>
                                ✨ V preizkusu imaš odklenjene VSE funkcije (raven Grow) — avtomatizacije, segmente po meri, napredno analitiko. Z izbiro paketa obdržiš tisto, kar paket vsebuje.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {/* TRENUTNI PAKET */}
                      <div style={{ ...card, display: "flex", flexDirection: "column", gap: 10 }}>
                        <div className="flex items-center justify-between">
                          <span style={{ fontWeight: 800, fontSize: 18 }}>Tvoj paket</span>
                          <span className="flex items-center" style={{ height: 26, padding: "0 12px", borderRadius: 999, background: paid ? "rgba(94,127,82,0.14)" : "rgba(110,98,83,0.12)", color: paid ? "#3E5536" : MUTED, fontSize: 12, fontWeight: 800 }}>{paid ? STATUS_LABEL[status] || "Aktivna" : "Brezplačni"}</span>
                        </div>
                        {paid ? (
                          <>
                            <div className="flex items-baseline" style={{ gap: 8 }}>
                              <span style={{ fontWeight: 800, fontSize: 24 }}>{PLANS[plan].label}</span>
                              <span style={{ fontSize: 14, color: MUTED }}>{fmtEur(monthlyEq)}/mes · {cycleNow === "yearly" ? "letno" : "mesečno"}</span>
                            </div>
                            <span style={{ fontSize: 13.5, color: cancelAtEnd ? CORAL : MUTED, lineHeight: 1.5 }}>
                              {cancelAtEnd
                                ? `Naročnina preklicana — aktivna še do ${nextCharge ? fmtDay(nextCharge) : "konca obdobja"}.`
                                : nextCharge ? `Naslednje plačilo: ${fmtDay(nextCharge)}.` : "Naročnina aktivna."}
                            </span>
                            <button onClick={openPortal} disabled={billingBusy} style={{ height: 44, width: "fit-content", padding: "0 18px", border: "none", borderRadius: 12, background: INK, color: PAPER, fontFamily: JAK, fontSize: 13.5, fontWeight: 700, cursor: "pointer", opacity: billingBusy ? 0.6 : 1 }}>Upravljaj naročnino / Prekliči →</button>
                          </>
                        ) : (
                          <span style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.5 }}>Trenutno si na <b>brezplačnem paketu</b>. Izberi paket spodaj — plačilo varno vodi Polar (kartica, računi, DDV). Prekličeš kadarkoli.</span>
                        )}
                      </div>

                      {/* CIKEL TOGGLE */}
                      <div className="flex items-center" style={{ gap: 10 }}>
                        <div className="flex" style={{ background: "#fff", border: `1px solid ${BORD}`, borderRadius: 12, padding: 4, gap: 4 }}>
                          {(["monthly", "yearly"] as const).map((c) => (
                            <button key={c} onClick={() => setBillingCycle(c)} style={{ height: 34, padding: "0 16px", border: "none", borderRadius: 9, background: billingCycle === c ? INK : "transparent", color: billingCycle === c ? PAPER : MUTED, fontFamily: JAK, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{c === "monthly" ? "Mesečno" : "Letno"}</button>
                          ))}
                        </div>
                        {billingCycle === "yearly" && <span style={{ fontSize: 12.5, fontWeight: 700, color: GREEN }}>2 meseca gratis 🎉</span>}
                      </div>

                      {/* PAKETI */}
                      <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
                        {cards.map(([p, hot]) => {
                          const isCurrent = p === plan && paid;
                          const m = PLANS[p].monthly;
                          return (
                            <div key={p} style={{ ...card, border: isCurrent ? `2px solid ${GREEN}` : hot ? `2px solid ${AMBER}` : `1px solid ${BORD}`, display: "flex", flexDirection: "column", gap: 12, position: "relative" }}>
                              {isCurrent ? <span style={{ position: "absolute", top: -11, left: 18, height: 22, padding: "0 10px", borderRadius: 999, background: GREEN, color: "#F4F0E4", fontSize: 10.5, fontWeight: 800, display: "flex", alignItems: "center" }}>TRENUTNI</span> : hot ? <span style={{ position: "absolute", top: -11, left: 18, height: 22, padding: "0 10px", borderRadius: 999, background: AMBER, color: INK, fontSize: 10.5, fontWeight: 800, display: "flex", alignItems: "center" }}>NAJPOGOSTEJE</span> : null}
                              <div>
                                <div style={{ fontWeight: 800, fontSize: 16 }}>{PLANS[p].label}</div>
                                {m == null ? (
                                  <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.01em" }}>po dogovoru</div>
                                ) : (
                                  <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.01em" }}>{fmtEur(perMonth(p))}<span style={{ fontSize: 12.5, fontWeight: 600, color: "#9A8F80" }}> / mes</span></div>
                                )}
                                {m != null && billingCycle === "yearly" && <div style={{ fontSize: 11.5, color: "#9A8F80" }}>obračunano letno ({fmtEur(chargedAmount(p, "yearly"))})</div>}
                              </div>
                              <div className="flex flex-col" style={{ gap: 7 }}>{(FEATS[p] || []).map((f) => <div key={f} className="flex items-center" style={{ gap: 8, fontSize: 13, color: MUTED }}><svg width="15" height="15" viewBox="0 0 24 24" style={{ fill: "none", stroke: GREEN, strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round", flexShrink: 0 }}><path d="M5 12.5l4.2 4.3L19 7" /></svg>{f}</div>)}</div>
                              {isCurrent ? (
                                <button disabled style={{ marginTop: "auto", height: 42, border: `1.5px solid ${GREEN}`, borderRadius: 12, background: "rgba(94,127,82,0.1)", color: "#3E5536", fontFamily: JAK, fontSize: 13.5, fontWeight: 700, cursor: "default" }}>Trenutni paket</button>
                              ) : p === "scale" ? (
                                <a href="/kontakt" style={{ marginTop: "auto", height: 42, display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid #E4D9C7", borderRadius: 12, background: "#fff", color: INK, fontFamily: JAK, fontSize: 13.5, fontWeight: 700, textDecoration: "none" }}>Pogovorimo se</a>
                              ) : (
                                <button onClick={() => startCheckout(p as "start" | "grow")} disabled={billingBusy} style={{ marginTop: "auto", height: 42, border: hot ? "none" : "1.5px solid #E4D9C7", borderRadius: 12, background: hot ? INK : "#fff", color: hot ? PAPER : INK, fontFamily: JAK, fontSize: 13.5, fontWeight: 700, cursor: "pointer", opacity: billingBusy ? 0.6 : 1 }}>{paid ? `Preklopi na ${PLANS[p].label}` : `Izberi ${PLANS[p].label}`}</button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <span style={{ fontSize: 12, color: "#9A8F80", lineHeight: 1.5 }}>Plačila varno vodi <b>Polar</b> (Merchant of Record) — kartica, računi in DDV so urejeni. Obračun je na lokal, prekličeš kadarkoli prek „Upravljaj naročnino&quot;.</span>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {scanning && <Scanner onResult={handleScanResult} onClose={() => setScanning(false)} title={scanMode === "test" ? "Testiraj račun" : "Skeniraj vzorčni račun"} />}

      {custSel && (() => { const v = stats.visits.get(custSel.id); const cs = scans.filter((s) => s.customer_id === custSel.id).slice(0, 8); return (
        <div onClick={() => setCustSel(null)} className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" style={{ background: "rgba(34,28,22,0.45)", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, background: CREAM, borderRadius: 22, padding: 24, fontFamily: JAK, maxHeight: "85vh", overflowY: "auto" }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
              <div className="flex items-center" style={{ gap: 12, minWidth: 0 }}>
                <div className="flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: 13, background: INK, color: PAPER, fontWeight: 800, fontSize: 18, flexShrink: 0 }}>{(custSel.email || custSel.phone || "?").charAt(0).toUpperCase()}</div>
                <div style={{ minWidth: 0 }}><div className="truncate" style={{ fontWeight: 800, fontSize: 16 }}>{custSel.email || custSel.phone || "—"}</div><div style={{ fontSize: 12.5, color: "#9A8F80" }}>od {fmt(custSel.created_at)}</div></div>
              </div>
              <button onClick={() => setCustSel(null)} style={{ width: 32, height: 32, border: "1px solid #E4D9C7", borderRadius: 10, background: "#fff", color: MUTED, cursor: "pointer", fontFamily: JAK, flexShrink: 0 }}>✕</button>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
              {([["Točke", custSel.points, "#B4862F"], ["Žigi", custSel.stamps ?? 0, INK], ["Obiski", v?.visits ?? 0, GREEN]] as const).map(([l, n, c]) => <div key={l} style={{ background: "#fff", border: `1px solid ${BORD}`, borderRadius: 14, padding: "12px 10px", textAlign: "center" }}><div style={{ fontWeight: 800, fontSize: 22, color: c }}>{n}</div><div style={{ fontSize: 11.5, color: "#9A8F80" }}>{l}</div></div>)}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Zadnji obiski</div>
            <div style={{ background: "#fff", border: `1px solid ${BORD}`, borderRadius: 14, padding: "4px 14px", marginBottom: 16 }}>
              {cs.length === 0 ? <div style={{ padding: "14px 0", textAlign: "center", fontSize: 13, color: "#9A8F80" }}>Ni skenov.</div> : cs.map((s, i) => <div key={s.id} className="flex items-center justify-between" style={{ padding: "10px 0", borderTop: i ? "1px solid #F4ECDF" : "none" }}><span style={{ fontSize: 13, color: MUTED }}>{fmt(s.created_at)}</span><span style={{ fontSize: 13, fontWeight: 700, color: GREEN }}>+{s.points_awarded}</span></div>)}
            </div>
            <button onClick={() => { const n = Number(window.prompt(`Dodaj točke za ${custSel.email ?? custSel.phone ?? "stranko"}:`, "10")); if (n) { run(() => addManualPoints(custSel.id, n), "Točke dodane."); setCustSel(null); } }} style={{ height: 46, width: "100%", border: "none", borderRadius: 12, background: INK, color: PAPER, fontFamily: JAK, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>+ Ročno dodaj točke</button>
          </div>
        </div>
      ); })()}

      {msg && <div className="fixed inset-x-0 z-50 mx-auto text-center" style={{ bottom: 24, width: "90%", maxWidth: 380, borderRadius: 14, background: INK, color: PAPER, padding: "12px 16px", fontSize: 14, fontWeight: 600, fontFamily: JAK, boxShadow: "0 12px 30px rgba(42,36,29,0.3)" }}>{msg}</div>}
    </main>
  );
}
