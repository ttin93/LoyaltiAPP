"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Venue, Reward, Customer, ScanRow, RedemptionRow } from "@/lib/types";
import { updateVenueSettings, activateScanning, testReceipt, saveReward, deleteReward, addManualPoints, signOut } from "@/app/actions";
import Scanner from "@/app/components/Scanner";
import QrCode from "./QrCode";

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

type IcName = "grid" | "chart" | "clock" | "users" | "mega" | "qr" | "sliders" | "star" | "crown";
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
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flexShrink: 0 }}>{p[name]}</svg>;
}

const NAV: [string, string, IcName][] = [["pregled", "Pregled", "grid"], ["analitika", "Analitika", "chart"], ["ocene", "Ocene", "star"], ["zgodovina", "Zgodovina", "clock"], ["stranke", "Stranke", "users"], ["marketing", "Marketing", "mega"], ["sistem", "Sistem", "qr"], ["nastavitve", "Nastavitve", "sliders"], ["narocnina", "Naročnina", "crown"]];
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

export default function Dashboard({ venue, venues = [], rewards, customers, scans, redemptions, reviews = [], ownerEmail }: { venue: Venue; venues?: { id: string; name: string }[]; rewards: Reward[]; customers: Customer[]; scans: ScanRow[]; redemptions: RedemptionRow[]; reviews?: ReviewRow[]; ownerEmail: string }) {
  const router = useRouter();
  const [sec, setSec] = useState("pregled");
  const [switchOpen, setSwitchOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanMode, setScanMode] = useState<"activate" | "test">("activate");
  const [histTab, setHistTab] = useState<"given" | "redeemed">("given");
  const [msg, setMsg] = useState<string | null>(null);
  const [range, setRange] = useState(30); // analitika: dni
  const [custQuery, setCustQuery] = useState("");
  const [custSel, setCustSel] = useState<Customer | null>(null);
  const [settingsColor, setSettingsColor] = useState(venue.brand_color || "#E2A04A");
  const title = NAV.find((n) => n[0] === sec)?.[1] || "Pregled";

  const stats = useMemo(() => {
    const pointsAwarded = scans.reduce((a, s) => a + s.points_awarded, 0);
    const pointsRedeemed = redemptions.reduce((a, r) => a + r.points_spent, 0);
    const visits = new Map<string, { visits: number; last: string }>();
    for (const s of scans) { const cur = visits.get(s.customer_id) ?? { visits: 0, last: s.created_at }; cur.visits += 1; if (s.created_at > cur.last) cur.last = s.created_at; visits.set(s.customer_id, cur); }
    const days: { label: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const key = d.toISOString().slice(0, 10); days.push({ label: key.slice(5), count: scans.filter((s) => s.created_at.slice(0, 10) === key).length }); }
    const maxDay = Math.max(1, ...days.map((d) => d.count));
    return { pointsAwarded, pointsRedeemed, avgVisits: customers.length ? (scans.length / customers.length).toFixed(1) : "0", visits, days, maxDay };
  }, [scans, redemptions, customers]);

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
  const segCount = segSel === "Najboljši" ? seg.best : segSel === "Neaktivni 21+ dni" ? seg.inactive : seg.active;
  const [campaignMsg, setCampaignMsg] = useState("Pogrešamo te! Ta teden −20% na vse kave ☕");

  // ANALITIKA — dinamičen razpon (7/30/90 dni)
  const ana = useMemo(() => {
    const now = Date.now();
    const since = now - range * 864e5;
    const inRange = scans.filter((s) => new Date(s.created_at).getTime() >= since);
    const redIn = redemptions.filter((r) => new Date(r.created_at).getTime() >= since);
    const buckets = Math.min(range, 30);
    const step = range / buckets;
    const days: { label: string; count: number }[] = [];
    for (let i = buckets - 1; i >= 0; i--) {
      const d0 = now - (i + 1) * step * 864e5, d1 = now - i * step * 864e5, lab = new Date(d1);
      days.push({ label: `${String(lab.getDate()).padStart(2, "0")}.${String(lab.getMonth() + 1).padStart(2, "0")}`, count: inRange.filter((s) => { const t = new Date(s.created_at).getTime(); return t >= d0 && t < d1; }).length });
    }
    const hours = Array.from({ length: 24 }, () => 0);
    for (const s of inRange) hours[new Date(s.created_at).getHours()]++;
    const newCust = customers.filter((c) => new Date(c.created_at).getTime() >= since).length;
    const pop = new Map<string, number>();
    for (const r of redIn) { const n = r.rewards?.name || "nagrada"; pop.set(n, (pop.get(n) || 0) + 1); }
    const topRewards = [...pop.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { scans: inRange.length, redemptions: redIn.length, newCust, ptsAw: inRange.reduce((a, s) => a + s.points_awarded, 0), ptsRe: redIn.reduce((a, r) => a + r.points_spent, 0), days, maxDay: Math.max(1, ...days.map((d) => d.count)), hours, maxHour: Math.max(1, ...hours), topRewards };
  }, [scans, redemptions, customers, range]);

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

  function flash(t: string) { setMsg(t); setTimeout(() => setMsg(null), 3000); }
  async function run(fn: () => Promise<unknown>, ok?: string) { try { await fn(); if (ok) flash(ok); router.refresh(); } catch (e) { flash(e instanceof Error ? e.message : "Napaka."); } }
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
                    <a href="/partner?new=1" className="flex items-center" style={{ height: 38, padding: "0 10px", borderRadius: 9, fontSize: 13.5, fontWeight: 700, color: "#B4781E", textDecoration: "none", borderTop: "1px solid #F1E8D9", marginTop: 4 }}>+ Nov lokal</a>
                  </div>
                )}
              </div>
              <div className="flex flex-col" style={{ gap: 3 }}>{NAV.map(([id, label, icon]) => { const on = id === sec; return <button key={id} onClick={() => setSec(id)} className="flex items-center" style={{ gap: 12, height: 44, padding: "0 12px", border: "none", borderRadius: 12, background: on ? "#FCEFD8" : "transparent", color: on ? INK : MUTED, fontFamily: JAK, fontSize: 14.5, fontWeight: on ? 700 : 600, cursor: "pointer", textAlign: "left" }}><Ic name={icon} color={on ? INK : "#A89B88"} size={20} /><span>{label}</span></button>; })}</div>
              <button onClick={() => setSec("narocnina")} className="flex flex-col" style={{ marginTop: "auto", gap: 5, textAlign: "left", border: "1px solid #F0D9A8", background: "linear-gradient(160deg,#FCEFD8,#F8E2BD)", borderRadius: 14, padding: "13px 14px", cursor: "pointer", fontFamily: JAK }}>
                <div className="flex items-center" style={{ gap: 7 }}><Ic name="crown" color="#B4781E" size={16} /><span style={{ fontSize: 13, fontWeight: 800, color: "#7A5E1E" }}>Brezplačni paket</span></div>
                <span style={{ fontSize: 11.5, color: "#9A7B36", lineHeight: 1.4 }}>Nadgradi za SMS, več lokalov in napredno analitiko.</span>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: "#B4781E", marginTop: 2 }}>Nadgradi paket →</span>
              </button>
              <form action={signOut} className="flex items-center" style={{ gap: 10, padding: "12px 8px 0", marginTop: 12, borderTop: "1px solid #F1E8D9" }}><button style={{ fontSize: 13, fontWeight: 600, color: "#9A8F80", background: "none", border: "none", cursor: "pointer", fontFamily: JAK }}>Odjava · {ownerEmail}</button></form>
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
                    <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>
                      <Kpi l="Skeniranja" v={scans.length} d={`${stats.pointsAwarded} podarjenih točk`} dc={GREEN} />
                      <Kpi l="Stranke" v={customers.length} />
                      <Kpi l="Povp. obiski / stranko" v={stats.avgVisits} />
                      <Kpi l="Unovčene točke" v={stats.pointsRedeemed} dc={CORAL} />
                    </div>
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
                      <div className="flex" style={{ background: "#F1E8D9", borderRadius: 12, padding: 4 }}>{([[7, "7 dni"], [30, "30 dni"], [90, "90 dni"], [365, "Leto"]] as const).map(([d, l]) => <button key={d} onClick={() => setRange(d)} style={{ height: 32, padding: "0 14px", border: "none", borderRadius: 9, background: range === d ? "#fff" : "transparent", color: range === d ? INK : "#9A8F80", fontFamily: JAK, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{l}</button>)}</div>
                    </div>
                    <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))" }}>
                      <Kpi l="Skeniranja" v={ana.scans} d={`${ana.ptsAw} podarjenih točk`} dc={GREEN} />
                      <Kpi l="Nove stranke" v={ana.newCust} d={`v ${range} dneh`} />
                      <Kpi l="Unovčene nagrade" v={ana.redemptions} d={`${ana.ptsRe} točk porabljenih`} dc={CORAL} />
                      <Kpi l="Povp. obiski / stranko" v={stats.avgVisits} />
                      <Kpi l="Najboljši gosti" v={seg.best} d="200+ točk" />
                      <Kpi l="Neaktivni 21+ dni" v={seg.inactive} d="za reaktivacijo" dc={CORAL} />
                    </div>
                    <div style={card}><div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18 }}>Skeniranja po dnevih</div><div className="flex items-end" style={{ gap: 4, height: 150 }}>{ana.days.map((d, i) => <div key={i} className="flex flex-1 flex-col items-center justify-end" style={{ gap: 5, height: "100%" }}><div style={{ width: "100%", height: `${Math.round((d.count / ana.maxDay) * 130)}px`, minHeight: d.count ? 4 : 0, borderRadius: "4px 4px 1px 1px", background: AMBER }} title={`${d.count}`} />{(ana.days.length <= 14 || i % 3 === 0) && <span style={{ fontSize: 8.5, color: "#B5AB9C", whiteSpace: "nowrap" }}>{d.label}</span>}</div>)}</div></div>
                    <div className="grid gap-3.5 lg:grid-cols-[1fr_1fr]">
                      {/* ure dneva */}
                      <div style={card}><div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18 }}>Najbolj obiskane ure</div><div className="flex items-end" style={{ gap: 2, height: 110 }}>{ana.hours.map((h, i) => <div key={i} className="flex flex-1 flex-col items-center justify-end" style={{ height: "100%", gap: 4 }}><div style={{ width: "100%", height: `${Math.round((h / ana.maxHour) * 92)}px`, minHeight: h ? 3 : 0, borderRadius: 2, background: h ? GREEN : "#EFE6D6" }} title={`${i}h · ${h}`} />{i % 6 === 0 && <span style={{ fontSize: 8, color: "#B5AB9C" }}>{i}h</span>}</div>)}</div></div>
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
                  <div className="grid gap-3.5 lg:grid-cols-[1.4fr_1fr]">
                    <div style={{ ...card, display: "flex", flexDirection: "column", gap: 14 }}>
                      <div className="flex items-center justify-between"><span style={{ fontWeight: 700, fontSize: 15 }}>Nova kampanja</span><span className="flex items-center" style={{ height: 24, padding: "0 10px", borderRadius: 999, background: "rgba(94,127,82,0.14)", color: "#3E5536", fontSize: 11, fontWeight: 800 }}>E-pošta</span></div>
                      <div className="flex flex-col" style={{ gap: 7 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: MUTED }}>Predloge</span>
                        <div className="flex" style={{ gap: 7, flexWrap: "wrap" }}>{PRESETS.map((p) => <button key={p.k} onClick={() => { setCampaignMsg(p.t); setSegSel(p.seg); }} style={{ height: 32, padding: "0 12px", borderRadius: 99, border: "1px solid #E4D9C7", background: campaignMsg === p.t ? "#FCEFD8" : "#fff", color: INK, fontFamily: JAK, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>{p.k}</button>)}</div>
                      </div>
                      <textarea rows={4} value={campaignMsg} onChange={(e) => setCampaignMsg(e.target.value)} style={{ width: "100%", border: "1.5px solid #E4D9C7", borderRadius: 12, background: CREAM, padding: 12, fontFamily: JAK, fontSize: 14, color: INK, outline: "none", boxSizing: "border-box", resize: "vertical" }} />
                      <label className="flex flex-col" style={{ gap: 5 }}><span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>Komu pošljem</span><select value={segSel} onChange={(e) => setSegSel(e.target.value)} style={inp}>{["Najboljši", "Aktivni", "Neaktivni 21+ dni", "Vsi gostje"].map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
                      <div className="flex items-center justify-between" style={{ background: CREAM, borderRadius: 12, padding: "11px 14px" }}><span style={{ fontSize: 13, color: MUTED }}>Prejemniki</span><span style={{ fontSize: 14, fontWeight: 700 }}>{segSel === "Vsi gostje" ? customers.length : segCount} gostov</span></div>
                      <button onClick={() => flash("E-pošta kampanje pride z e-poštnim providerjem (kmalu). SMS/WhatsApp pozneje.")} style={{ height: 48, border: "none", borderRadius: 12, background: INK, color: PAPER, fontFamily: JAK, fontSize: 14.5, fontWeight: 700, cursor: "pointer" }}>Pošlji e-pošto · {segSel === "Vsi gostje" ? customers.length : segCount} gostom</button>
                      <span style={{ fontSize: 12, color: "#9A8F80", lineHeight: 1.5 }}>Zaenkrat samo e-pošta (gostje se prijavijo z emailom). SMS in WhatsApp dodamo pozneje.</span>
                    </div>
                    <div style={{ ...card, display: "flex", flexDirection: "column", gap: 12 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>Tvoji segmenti</span>
                      {([["Najboljši (200+ t)", seg.best], ["Aktivni (≤14 dni)", seg.active], ["Neaktivni (21+ dni)", seg.inactive], ["Vsi gostje", customers.length]] as const).map(([l, n]) => <div key={l} className="flex items-center justify-between" style={{ borderBottom: "1px solid #F1E8D9", paddingBottom: 8 }}><span style={{ fontSize: 13.5, color: MUTED }}>{l}</span><span style={{ fontWeight: 800, fontSize: 15, color: "#B4862F" }}>{n}</span></div>)}
                      <span style={{ fontSize: 12.5, color: "#9A8F80", lineHeight: 1.5, marginTop: 4 }}>Segmenti se računajo iz pravih obiskov. Urejanje pravil segmentov + ročni izbor gostov dodamo kmalu.</span>
                    </div>
                  </div>
                )}

                {sec === "zgodovina" && (
                  <div className="flex flex-col" style={{ gap: 16 }}>
                    <div className="flex" style={{ background: "#F1E8D9", borderRadius: 12, padding: 4, width: 280 }}>{(["given", "redeemed"] as const).map((t) => <button key={t} onClick={() => setHistTab(t)} style={{ flex: 1, height: 36, border: "none", borderRadius: 9, background: histTab === t ? "#fff" : "transparent", color: histTab === t ? INK : "#9A8F80", fontFamily: JAK, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>{t === "given" ? "Podarjene" : "Unovčene"}</button>)}</div>
                    <div style={{ ...card, padding: "6px 22px" }}>
                      {histTab === "given" ? (scans.length === 0 ? <div style={{ padding: "20px 0", textAlign: "center", fontSize: 13.5, color: "#9A8F80" }}>Ni zapisov.</div> : scans.map((s, i) => <div key={s.id} className="flex items-center justify-between" style={{ padding: "14px 0", borderTop: i ? "1px solid #F4ECDF" : "none" }}><div style={{ minWidth: 0 }}><div className="truncate" style={{ fontSize: 14, fontWeight: 600 }}>{s.customers?.phone ?? "—"}</div><div style={{ fontSize: 12.5, color: "#9A8F80" }}>{fmt(s.created_at)}</div></div><span style={{ fontSize: 14, fontWeight: 700, color: GREEN, whiteSpace: "nowrap" }}>+{s.points_awarded}</span></div>))
                        : (redemptions.length === 0 ? <div style={{ padding: "20px 0", textAlign: "center", fontSize: 13.5, color: "#9A8F80" }}>Ni zapisov.</div> : redemptions.map((r, i) => <div key={r.id} className="flex items-center justify-between" style={{ padding: "14px 0", borderTop: i ? "1px solid #F4ECDF" : "none" }}><div style={{ minWidth: 0 }}><div className="truncate" style={{ fontSize: 14, fontWeight: 600 }}>{r.customers?.phone ?? "—"} · {r.rewards?.name ?? "nagrada"}</div><div style={{ fontSize: 12.5, color: "#9A8F80" }}>{fmt(r.created_at)}</div></div><span style={{ fontSize: 14, fontWeight: 700, color: CORAL, whiteSpace: "nowrap" }}>−{r.points_spent}</span></div>))}
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

                {sec === "sistem" && (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {/* QR */}
                    <div style={{ ...card, display: "flex", flexDirection: "column", gap: 14 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>QR koda lokala</span>
                      <span style={{ fontSize: 13, color: "#9A8F80", lineHeight: 1.5 }}>Natisni in postavi na pult. Gostje skenirajo → odpre se njihova stran zvestobe.</span>
                      <QrCode path={`/p/${venue.public_code}`} accent={AMBER} />
                      <a href={`/p/${venue.public_code}`} target="_blank" rel="noreferrer" className="flex items-center justify-center" style={{ height: 42, borderRadius: 10, border: "1.5px solid #E4D9C7", color: INK, textDecoration: "none", fontSize: 13.5, fontWeight: 700, fontFamily: JAK }}>Odpri predogled gostove strani →</a>
                      <span style={{ fontSize: 12, color: "#9A8F80", lineHeight: 1.5 }}>QR po meri (logo, barva, format nalepke/namizni stojalo) dodamo kmalu.</span>
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
                    {/* lokal in točke */}
                    <form action={async (fd) => { await updateVenueSettings(fd); router.refresh(); flash("Nastavitve shranjene."); }} style={{ ...card, display: "flex", flexDirection: "column", gap: 14 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>Lokal in pravila</span>
                      <label className="flex flex-col" style={{ gap: 5 }}><span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>Ime lokala</span><input name="name" defaultValue={venue.name} style={inp} /></label>
                      {/* barva — color picker + hex */}
                      <div className="flex flex-col" style={{ gap: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>Barva znamke</span>
                        <input type="hidden" name="brand_color" value={settingsColor} />
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
                        <label className="flex flex-col" style={{ gap: 5 }}><span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>Točke na obisk</span><input name="points_per_visit" type="number" min={0} defaultValue={String(venue.points_per_visit)} style={inp} /></label>
                        <label className="flex flex-col" style={{ gap: 5 }}><span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>Žigov za kartonček</span><input name="stamp_goal" type="number" min={4} max={12} defaultValue={String(venue.stamp_goal ?? 10)} style={inp} /></label>
                      </div>
                      <label className="flex flex-col" style={{ gap: 5 }}><span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>Časovno okno računa (ure)</span><input name="scan_window_hours" type="number" defaultValue={String(venue.scan_window_hours)} style={inp} /></label>
                      <label className="flex flex-col" style={{ gap: 5 }}><span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>Google povezava za ocene</span><input name="google_review_url" type="url" defaultValue={venue.google_review_url ?? ""} placeholder="https://g.page/r/…" style={inp} /><span style={{ fontSize: 11.5, color: "#9A8F80", lineHeight: 1.4 }}>Kamor pošljemo zadovoljne goste (4–5★). Najdeš jo v Google Business profilu → »Pridobi več ocen«.</span></label>
                      <button style={{ marginTop: 4, height: 48, border: "none", borderRadius: 12, background: INK, color: PAPER, fontFamily: JAK, fontSize: 14.5, fontWeight: 700, cursor: "pointer", alignSelf: "flex-start", padding: "0 22px" }}>Shrani</button>
                    </form>
                  </div>
                )}

                {sec === "narocnina" && (
                  <div className="flex flex-col" style={{ gap: 16, maxWidth: 640 }}>
                    <div style={{ ...card, display: "flex", flexDirection: "column", gap: 6 }}>
                      <div className="flex items-center justify-between"><span style={{ fontWeight: 800, fontSize: 18 }}>Tvoj paket</span><span className="flex items-center" style={{ height: 26, padding: "0 12px", borderRadius: 999, background: "rgba(94,127,82,0.14)", color: "#3E5536", fontSize: 12, fontWeight: 800 }}>Brezplačni (pilot)</span></div>
                      <span style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.5 }}>Med pilotom je vse odprto. Plačljivi paketi se vklopijo ob zagonu — obračun je <b>na lokal</b>.</span>
                    </div>
                    <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
                      {([["Espresso", "49,99 €", ["1 lokal", "Žigi + točke", "Google ocene", "E-pošta kampanje"], false], ["Doppio", "79,99 €", ["Vse iz Espresso", "Več lokalov", "SMS + WhatsApp", "Napredna analitika"], true], ["Palača", "po dogovoru", ["Veriga lokalov", "Prioritetna podpora", "Integracije / POS", "Lasten dizajn"], false]] as const).map(([name, price, feats, hot]) => (
                        <div key={name} style={{ ...card, border: hot ? `2px solid ${AMBER}` : `1px solid ${BORD}`, display: "flex", flexDirection: "column", gap: 12, position: "relative" }}>
                          {hot && <span style={{ position: "absolute", top: -11, left: 18, height: 22, padding: "0 10px", borderRadius: 999, background: AMBER, color: INK, fontSize: 10.5, fontWeight: 800, display: "flex", alignItems: "center" }}>NAJPOGOSTEJE</span>}
                          <div><div style={{ fontWeight: 800, fontSize: 16 }}>{name}</div><div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.01em" }}>{price}<span style={{ fontSize: 12.5, fontWeight: 600, color: "#9A8F80" }}>{price.includes("€") ? " / mes" : ""}</span></div></div>
                          <div className="flex flex-col" style={{ gap: 7 }}>{feats.map((f) => <div key={f} className="flex items-center" style={{ gap: 8, fontSize: 13, color: MUTED }}><svg width="15" height="15" viewBox="0 0 24 24" style={{ fill: "none", stroke: GREEN, strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round", flexShrink: 0 }}><path d="M5 12.5l4.2 4.3L19 7" /></svg>{f}</div>)}</div>
                          <button onClick={() => flash("Plačljivi paketi se vklopijo ob zagonu — javi se, ko želiš nadgraditi.")} style={{ marginTop: "auto", height: 42, border: hot ? "none" : "1.5px solid #E4D9C7", borderRadius: 12, background: hot ? INK : "#fff", color: hot ? PAPER : INK, fontFamily: JAK, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>Izberi {name}</button>
                        </div>
                      ))}
                    </div>
                    <div style={{ ...card, display: "flex", flexDirection: "column", gap: 10 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>Naročnina & računi</span>
                      <span style={{ fontSize: 13, color: MUTED, lineHeight: 1.5 }}>Upravljanje plačila, računov in obračuna po lokalih dodamo ob vklopu plačil (Stripe). Zaenkrat brez stroškov.</span>
                      <button onClick={() => flash("Upravljanje naročnine pride z vklopom plačil.")} style={{ height: 42, width: "fit-content", padding: "0 18px", border: "1.5px solid #E4D9C7", borderRadius: 12, background: "#fff", color: INK, fontFamily: JAK, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>Upravljaj naročnino</button>
                    </div>
                  </div>
                )}
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
