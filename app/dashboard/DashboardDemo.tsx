"use client";

import { useState } from "react";
import { BRAND } from "@/lib/brand";

const JAK = "var(--font-jakarta), sans-serif";
const INK = "#2A241D";
const PAPER = "#FBF3E6";
const CREAM = "#FBF7F0";
const AMBER = "#E2A04A";
const CORAL = "#C4623D";
const GREEN = "#5E7F52";
const MUTED = "#6E6253";
const BORD = "#EFE6D6";

type IcName = "grid" | "chart" | "clock" | "users" | "mega" | "qr" | "sliders" | "gift" | "mail" | "cup" | "bell" | "palette";
function Ic({ name, color = INK, size = 20 }: { name: IcName; color?: string; size?: number }) {
  const st = { fill: "none", stroke: color, strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<IcName, React.ReactNode> = {
    grid: <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" style={st} />,
    chart: <path d="M5 19v-7M12 19V5M19 19v-10" style={st} />,
    clock: <><circle cx={12} cy={12} r={8.5} style={st} /><path d="M12 8v4.4l2.8 2" style={st} /></>,
    users: <><circle cx={9} cy={8} r={3.2} style={st} /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" style={st} /><path d="M16 5.2a3 3 0 0 1 0 5.6M17 19a5.5 5.5 0 0 0-2-4.3" style={st} /></>,
    mega: <><path d="M18 6 7 9.8H4.5v4.4H7L18 18V6Z" style={st} /><path d="M8.5 14.8 9.6 19h2" style={st} /></>,
    qr: <><path d="M4.5 4.5h5.5V10H4.5zM14 4.5h5.5V10H14zM4.5 14h5.5v5.5H4.5z" style={st} /><path d="M14 14h2.3v2.3H14zM17.4 17.4h2.1v2.1h-2.1z" style={st} /></>,
    sliders: <><path d="M4 7.5h16M4 12h16M4 16.5h16" style={st} /><circle cx={15} cy={7.5} r={2.1} style={st} /><circle cx={8.5} cy={12} r={2.1} style={st} /><circle cx={16} cy={16.5} r={2.1} style={st} /></>,
    gift: <><path d="M4.5 9.5h15V20h-15zM4 9.5h16v-3H4zM12 6.5V20" style={st} /><path d="M12 6.5C12 5 11 3.5 9 4c-1.6.4-1.4 2.5 0 2.5zM12 6.5C12 5 13 3.5 15 4c1.6.4 1.4 2.5 0 2.5z" style={st} /></>,
    mail: <path d="M4 6.5h16v11H4zM4.5 7l7.5 5.5L19.5 7" style={st} />,
    cup: <><path d="M5 9h10v5.5A4.5 4.5 0 0 1 10.5 19h-1A4.5 4.5 0 0 1 5 14.5V9Z" style={st} /><path d="M15 10.5h1.6a2.4 2.4 0 0 1 0 4.8H15" style={st} /></>,
    bell: <><path d="M7 10a5 5 0 0 1 10 0c0 5 2 6 2 6H5s2-1 2-6" style={st} /><path d="M10.5 19a1.6 1.6 0 0 0 3 0" style={st} /></>,
    palette: <><circle cx={12} cy={12} r={8.5} style={st} /><circle cx={8.5} cy={10} r={1} style={st} /><circle cx={12} cy={8} r={1} style={st} /><circle cx={15.5} cy={10} r={1} style={st} /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flexShrink: 0 }}>{paths[name]}</svg>;
}

function Toggle({ on }: { on: boolean }) {
  return <div style={{ width: 46, height: 28, borderRadius: 999, background: on ? GREEN : "#DAD0BF", position: "relative", flexShrink: 0 }}><div style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(42,36,29,0.25)" }} /></div>;
}

function QrEl({ px, seed = 7 }: { px: number; seed?: number }) {
  const n = 21; let s = seed;
  const rnd = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const inF = (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
    let on: boolean;
    if (inF) { const rr = r >= n - 7 ? r - (n - 7) : r; const cc = c >= n - 7 ? c - (n - 7) : c; on = rr === 0 || rr === 6 || cc === 0 || cc === 6 || (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4); }
    else on = rnd() > 0.52;
    cells.push(<div key={r + "-" + c} style={{ background: on ? INK : "transparent" }} />);
  }
  return <div style={{ width: px, height: px, display: "grid", gridTemplateColumns: "repeat(21,1fr)", gridTemplateRows: "repeat(21,1fr)" }}>{cells}</div>;
}

function Donut() {
  const r = 42, c = 2 * Math.PI * r, frac = 0.91;
  return <svg width={110} height={110} viewBox="0 0 110 110" style={{ transform: "rotate(-90deg)" }}><circle cx={55} cy={55} r={r} style={{ fill: "none", stroke: "rgba(196,98,61,0.22)", strokeWidth: 12 }} /><circle cx={55} cy={55} r={r} style={{ fill: "none", stroke: GREEN, strokeWidth: 12, strokeLinecap: "round", strokeDasharray: c, strokeDashoffset: c * (1 - frac) }} /></svg>;
}

const HOURS: [string, number][] = [["7", 18], ["8", 34], ["9", 46], ["10", 38], ["11", 22], ["12", 26], ["13", 20], ["14", 16], ["15", 30], ["16", 42], ["17", 28], ["18", 14], ["19", 10], ["20", 6], ["21", 4]];
function HoursBars({ h = 130 }: { h?: number }) {
  return <div className="flex items-end" style={{ gap: 6, height: h + 20 }}>{HOURS.map(([l, v], i) => <div key={i} className="flex flex-1 flex-col items-center justify-end" style={{ gap: 5, height: "100%" }}><div style={{ width: "100%", height: `${Math.round((v / 46) * h)}px`, borderRadius: "5px 5px 2px 2px", background: v === 46 ? INK : AMBER }} /><span style={{ fontSize: 9.5, color: "#B5AB9C", height: 12 }}>{l}</span></div>)}</div>;
}

const NAV: [string, string, IcName][] = [["pregled", "Pregled", "grid"], ["analitika", "Analitika", "chart"], ["zgodovina", "Zgodovina", "clock"], ["stranke", "Stranke", "users"], ["marketing", "Marketing", "mega"], ["sistem", "Sistem", "qr"], ["nastavitve", "Nastavitve", "sliders"]];
const KPIS = [{ l: "Skeniranja", v: "482", d: "+18% na pretekli mesec", dc: GREEN }, { l: "Stranke", v: "137", d: "+12 novih ta mesec", dc: GREEN }, { l: "Povp. obiski / stranko", v: "3,5", d: "zadnjih 30 dni", dc: "#9A8F80" }, { l: "Pogostost obiskov", v: "8,2 dni", d: "med obiskoma", dc: "#9A8F80" }];
const KPIS2 = [{ l: "Unovčene nagrade", v: "19", d: "+5 na pretekli mesec", dc: GREEN }, { l: "Podarjene točke", v: "7.230", d: "482 žigov", dc: "#9A8F80" }, { l: "Aktivni kuponi", v: "34", d: "iz kolesa sreče", dc: "#9A8F80" }, { l: "Konverzija kolesa", v: "62%", d: "vrtljaj → registracija", dc: GREEN }];
const TOPC = [["1", "maja.k@…", "360 t"], ["2", "+386 40 ··· 198", "285 t"], ["3", "+386 51 ··· 736", "225 t"], ["4", "tomaz@…", "180 t"]];
const WEEK: [string, number, number][] = [["pon", 22, 8], ["tor", 26, 10], ["sre", 30, 9], ["čet", 28, 14], ["pet", 40, 18], ["sob", 46, 22], ["ned", 18, 6]];
const GIVEN = [["maja.k@gmail.com", "danes · 9.12"], ["+386 51 ··· 736", "danes · 8.47"], ["+386 40 ··· 198", "danes · 8.21"], ["tomaz@outlook.com", "včeraj · 16.30"], ["+386 31 ··· 412", "včeraj · 11.05"], ["+386 68 ··· 904", "včeraj · 9.58"]];
const REDEEMED = [["maja.k@gmail.com", "danes · 9.40", "Brezplačna kava"], ["+386 51 ··· 736", "včeraj · 17.10", "Brezplačna kava"], ["tomaz@outlook.com", "28. maj · 8.30", "Rogljiček"]];
const CUSTOMERS = [
  { in: "MK", n: "maja.k@gmail.com", v: "24", p: "360", last: "danes", s: "Redni", sBg: "rgba(94,127,82,0.16)", sFg: "#3E5536" },
  { in: "40", n: "+386 40 ··· 198", v: "19", p: "285", last: "včeraj", s: "Redni", sBg: "rgba(94,127,82,0.16)", sFg: "#3E5536" },
  { in: "51", n: "+386 51 ··· 736", v: "15", p: "225", last: "danes", s: "Redni", sBg: "rgba(94,127,82,0.16)", sFg: "#3E5536" },
  { in: "TZ", n: "tomaz@outlook.com", v: "12", p: "180", last: "pred 3 dnevi", s: "Aktiven", sBg: "#FCEFD8", sFg: "#B4781E" },
  { in: "68", n: "+386 68 ··· 904", v: "9", p: "135", last: "pred 6 dnevi", s: "Aktiven", sBg: "#FCEFD8", sFg: "#B4781E" },
  { in: "30", n: "+386 30 ··· 557", v: "4", p: "60", last: "pred 24 dni", s: "Tvegan", sBg: "rgba(196,98,61,0.14)", sFg: "#A8431F" },
];
const CAMPAIGNS: [string, string, string, string, string, string, IcName, string][] = [
  ["Pozdrav novim gostom", "avtomatska · email", "Aktivna", "rgba(94,127,82,0.16)", "#3E5536", "rgba(94,127,82,0.14)", "mail", GREEN],
  ["Pogrešamo te (21+ dni)", "segment · 23 strank", "Osnutek", "#FCEFD8", "#B4781E", "#FCEFD8", "bell", "#B4862F"],
  ["Dvojni žigi · vikend", "enkratna · sob–ned", "Načrtovana", "#F1E8D9", "#6E6253", "#F1E8D9", "cup", "#9A8F80"],
];
const AUTOS: [string, string, boolean][] = [["Dobrodošlica", "ob registraciji", true], ["Nagrada za rojstni dan", "−20% v tednu", true], ["Reaktivacija", "po 30 dneh neaktivnosti", false]];
const SETTINGS: [string, string, IcName][] = [["Znamka", "Logo, ime, barve", "palette"], ["Kolo sreče", "Nagrade in verjetnosti", "gift"], ["Zasloni gosta", "Besedila vseh zaslonov", "sliders"], ["Kuponi & nagrade", "Pravila točk in žigov", "cup"], ["Obvestila", "Email in SMS", "bell"], ["Plačila", "Naročnina · Stripe", "chart"]];

const card: React.CSSProperties = { background: "#fff", border: `1px solid ${BORD}`, borderRadius: 18, padding: 22 };

export default function DashboardDemo() {
  const [sec, setSec] = useState("pregled");
  const [histTab, setHistTab] = useState<"given" | "redeemed">("given");
  const [profile, setProfile] = useState<{ name: string; in: string; v: string; p: string } | null>(null);
  const title = NAV.find((n) => n[0] === sec)?.[1] || "Pregled";

  return (
    <main style={{ background: "#E9E2D6", fontFamily: JAK, color: INK, minHeight: "100dvh", overflowX: "hidden" }}>
      <div className="mx-auto" style={{ maxWidth: 1180, padding: "0 0 40px" }}>
        <div className="lg:my-6 lg:overflow-hidden lg:rounded-[18px] lg:border lg:border-[#D9CDBA] lg:shadow-[0_30px_70px_rgba(34,28,22,0.18)]" style={{ background: "#fff" }}>
          <div className="relative flex" style={{ minHeight: "100dvh" }}>
            {/* SIDEBAR (desktop) */}
            <div className="hidden flex-col lg:flex" style={{ width: 248, flexShrink: 0, background: "#fff", borderRight: `1px solid ${BORD}`, padding: "22px 16px" }}>
              <div className="flex items-center" style={{ gap: 10, padding: "0 8px 18px", borderBottom: "1px solid #F1E8D9", marginBottom: 16 }}>
                <div className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: 13, background: INK, color: PAPER, fontWeight: 800, fontSize: 18 }}>L</div>
                <div className="flex flex-col" style={{ lineHeight: 1.25, flex: 1, minWidth: 0 }}><span style={{ fontWeight: 800, fontSize: 15 }}>Kavarna Lipa</span><span style={{ fontSize: 12, color: "#9A8F80" }}>Ljubljana</span></div>
              </div>
              <div className="flex flex-col" style={{ gap: 3 }}>
                {NAV.map(([id, label, icon]) => { const on = id === sec; return (
                  <button key={id} onClick={() => setSec(id)} className="flex items-center" style={{ gap: 12, height: 44, padding: "0 12px", border: "none", borderRadius: 12, background: on ? "#FCEFD8" : "transparent", color: on ? INK : MUTED, fontFamily: JAK, fontSize: 14.5, fontWeight: on ? 700 : 600, cursor: "pointer", textAlign: "left" }}><Ic name={icon} color={on ? INK : "#A89B88"} size={20} /><span>{label}</span></button>
                ); })}
              </div>
              <div className="flex items-center" style={{ marginTop: "auto", gap: 10, padding: "10px 8px 0", borderTop: "1px solid #F1E8D9" }}>
                <div className="flex items-center justify-center" style={{ width: 34, height: 34, borderRadius: "50%", background: "#FCEFD8", color: "#B4781E", fontWeight: 800, fontSize: 14 }}>AK</div>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 700 }}>Ana Kovač</div><div style={{ fontSize: 11.5, color: "#9A8F80" }}>ana@mora.si</div></div>
              </div>
            </div>

            {/* MAIN */}
            <div className="flex flex-1 flex-col" style={{ minWidth: 0, background: CREAM }}>
              {/* topbar */}
              <div className="flex flex-wrap items-center justify-between" style={{ minHeight: 64, flexShrink: 0, borderBottom: `1px solid ${BORD}`, padding: "12px 20px", gap: 12 }}>
                <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: "-0.01em" }}>{title}</div>
                <div className="flex items-center" style={{ gap: 10 }}>
                  <div className="flex" style={{ background: "#fff", border: "1px solid #EFE4D2", borderRadius: 11, padding: 3 }}>{["30 dni", "90 dni", "Leto"].map((t, i) => <span key={t} className="flex items-center" style={{ height: 32, padding: "0 13px", borderRadius: 8, background: i === 0 ? INK : "transparent", color: i === 0 ? PAPER : MUTED, fontSize: 12.5, fontWeight: i === 0 ? 700 : 600 }}>{t}</span>)}</div>
                  <button style={{ height: 38, padding: "0 16px", border: "none", borderRadius: 11, background: AMBER, color: INK, fontFamily: JAK, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>Izvozi</button>
                </div>
              </div>

              {/* MOBILE nav */}
              <div className="flex gap-2 overflow-x-auto px-4 py-3 lg:hidden" style={{ borderBottom: `1px solid ${BORD}` }}>
                {NAV.map(([id, label, icon]) => { const on = id === sec; return <button key={id} onClick={() => setSec(id)} className="flex flex-shrink-0 items-center gap-1.5" style={{ height: 34, padding: "0 12px", borderRadius: 10, border: "none", background: on ? INK : "#fff", color: on ? PAPER : MUTED, fontFamily: JAK, fontSize: 13, fontWeight: 700, cursor: "pointer" }}><Ic name={icon} color={on ? PAPER : "#A89B88"} size={15} />{label}</button>; })}
              </div>

              <div style={{ flex: 1, padding: "20px clamp(16px,2.5vw,28px)" }}>
                {sec === "pregled" && (
                  <div className="flex flex-col" style={{ gap: 20 }}>
                    <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>{KPIS.map((k) => <div key={k.l} style={{ ...card, padding: 18, display: "flex", flexDirection: "column", gap: 6 }}><span style={{ fontSize: 12.5, fontWeight: 600, color: "#9A8F80" }}>{k.l}</span><span style={{ fontWeight: 800, fontSize: 28, letterSpacing: "-0.01em" }}>{k.v}</span><span style={{ fontSize: 12, fontWeight: 700, color: k.dc }}>{k.d}</span></div>)}</div>
                    <div className="grid gap-3.5 lg:grid-cols-[1.6fr_1fr]">
                      <div style={card}><div className="flex items-center justify-between" style={{ marginBottom: 20 }}><span style={{ fontWeight: 700, fontSize: 15 }}>Obiski po urah</span><span style={{ fontSize: 12.5, color: "#9A8F80" }}>vrh ob 9h</span></div><HoursBars h={150} /></div>
                      <div style={{ ...card, display: "flex", flexDirection: "column", gap: 14 }}><span style={{ fontWeight: 700, fontSize: 15 }}>Najboljše stranke</span>{TOPC.map(([r, n, p]) => <div key={r} className="flex items-center" style={{ gap: 11 }}><div className="flex items-center justify-center" style={{ width: 30, height: 30, borderRadius: "50%", background: "#FCEFD8", color: "#B4781E", fontWeight: 800, fontSize: 12 }}>{r}</div><span className="flex-1 truncate" style={{ fontSize: 13.5, fontWeight: 600 }}>{n}</span><span style={{ fontSize: 13, fontWeight: 700, color: "#B4862F" }}>{p}</span></div>)}</div>
                    </div>
                  </div>
                )}

                {sec === "analitika" && (
                  <div className="flex flex-col" style={{ gap: 20 }}>
                    <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>{KPIS2.map((k) => <div key={k.l} style={{ ...card, padding: 18, display: "flex", flexDirection: "column", gap: 6 }}><span style={{ fontSize: 12.5, fontWeight: 600, color: "#9A8F80" }}>{k.l}</span><span style={{ fontWeight: 800, fontSize: 28, letterSpacing: "-0.01em" }}>{k.v}</span><span style={{ fontSize: 12, fontWeight: 700, color: k.dc }}>{k.d}</span></div>)}</div>
                    <div className="grid gap-3.5 lg:grid-cols-2">
                      <div style={card}><div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Novi vs. ponovni obiski</div><div className="flex items-end" style={{ gap: 10, height: 150 }}>{WEEK.map(([l, rep, nw]) => <div key={l} className="flex flex-1 flex-col items-center justify-end" style={{ gap: 6, height: "100%" }}><div className="flex w-full flex-col justify-end" style={{ height: "100%", gap: 2 }}><div style={{ width: "100%", height: `${Math.round((nw / 68) * 150)}px`, borderRadius: "5px 5px 0 0", background: AMBER }} /><div style={{ width: "100%", height: `${Math.round((rep / 68) * 150)}px`, borderRadius: "0 0 3px 3px", background: INK }} /></div><span style={{ fontSize: 10, color: "#B5AB9C" }}>{l}</span></div>)}</div><div className="flex" style={{ gap: 16, marginTop: 14, fontSize: 12, color: MUTED }}><span className="flex items-center" style={{ gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: INK }} />Ponovni</span><span className="flex items-center" style={{ gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: AMBER }} />Novi</span></div></div>
                      <div style={{ ...card, display: "flex", flexDirection: "column", gap: 16 }}><div style={{ fontWeight: 700, fontSize: 15 }}>Zadržanje strank</div><div className="flex items-center" style={{ gap: 22 }}><Donut /><div className="flex flex-col" style={{ gap: 12 }}><div><div style={{ fontWeight: 800, fontSize: 24, color: GREEN }}>91%</div><div style={{ fontSize: 12, color: "#9A8F80" }}>aktivnih po 30 dneh</div></div><div><div style={{ fontWeight: 800, fontSize: 24, color: CORAL }}>9%</div><div style={{ fontSize: 12, color: "#9A8F80" }}>churn · ↓ 2% / mesec</div></div></div></div><div style={{ background: "#FCEFD8", borderRadius: 12, padding: "12px 14px", fontSize: 12.5, lineHeight: 1.45, color: "#7A5E1E" }}>23 strank ni bilo &gt; 21 dni. Razmisli o »pogrešamo te« kampanji.</div></div>
                    </div>
                  </div>
                )}

                {sec === "zgodovina" && (
                  <div className="flex flex-col" style={{ gap: 16 }}>
                    <div className="flex" style={{ background: "#F1E8D9", borderRadius: 12, padding: 4, width: 280 }}>{(["given", "redeemed"] as const).map((t) => <button key={t} onClick={() => setHistTab(t)} style={{ flex: 1, height: 36, border: "none", borderRadius: 9, background: histTab === t ? "#fff" : "transparent", color: histTab === t ? INK : "#9A8F80", fontFamily: JAK, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>{t === "given" ? "Podarjene" : "Unovčene"}</button>)}</div>
                    <div style={{ ...card, padding: "6px 22px" }}>{(histTab === "given" ? GIVEN : REDEEMED).map((h, i) => <div key={i} className="flex items-center" style={{ gap: 14, padding: "15px 0", borderTop: i ? "1px solid #F4ECDF" : "none" }}><div className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: "50%", background: histTab === "given" ? "rgba(196,98,61,0.1)" : "#FCEFD8", flexShrink: 0 }}><Ic name={histTab === "given" ? "cup" : "gift"} color={histTab === "given" ? CORAL : "#B4862F"} size={18} /></div><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 600 }}>{h[0]}</div><div style={{ fontSize: 12.5, color: "#9A8F80" }}>{h[1]}</div></div><div style={{ fontSize: 14, fontWeight: 700, color: histTab === "given" ? GREEN : CORAL, whiteSpace: "nowrap" }}>{histTab === "given" ? "+15 točk" : h[2]}</div></div>)}</div>
                  </div>
                )}

                {sec === "stranke" && (
                  <div className="flex flex-col" style={{ gap: 16 }}>
                    <div className="flex items-center" style={{ gap: 12 }}><div className="flex flex-1 items-center" style={{ height: 44, border: "1px solid #EFE4D2", borderRadius: 12, background: "#fff", gap: 10, padding: "0 14px" }}><Ic name="users" color="#B5AB9C" size={17} /><span style={{ fontSize: 14, color: "#B5AB9C" }}>Išči po emailu ali telefonu…</span></div><div className="flex items-center" style={{ height: 44, padding: "0 16px", border: "1px solid #EFE4D2", borderRadius: 12, background: "#fff", gap: 8, fontSize: 13.5, fontWeight: 600, color: MUTED }}>Vsi · 137</div></div>
                    <div style={{ ...card, padding: 0, overflow: "hidden" }}>
                      <div className="hidden items-center sm:flex" style={{ gap: 14, padding: "14px 22px", fontSize: 11.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "#A89B88", background: "#FBF6EC" }}><div style={{ flex: 1 }}>Stranka</div><div style={{ width: 70, textAlign: "right" }}>Obiski</div><div style={{ width: 70, textAlign: "right" }}>Točke</div><div style={{ width: 110, textAlign: "right" }}>Zadnji</div><div style={{ width: 80, textAlign: "right" }}>Status</div></div>
                      {CUSTOMERS.map((c, i) => <button key={c.n} onClick={() => setProfile({ name: c.n, in: c.in, v: c.v, p: c.p })} className="flex w-full items-center" style={{ gap: 14, padding: "15px 22px", border: "none", borderTop: i ? "1px solid #F4ECDF" : "none", background: "transparent", cursor: "pointer", fontFamily: JAK, textAlign: "left" }}><div className="flex flex-1 items-center" style={{ gap: 11, minWidth: 0 }}><div className="flex items-center justify-center" style={{ width: 34, height: 34, borderRadius: "50%", background: "#FCEFD8", color: "#B4781E", fontWeight: 800, fontSize: 12.5, flexShrink: 0 }}>{c.in}</div><span className="truncate" style={{ fontSize: 14, fontWeight: 600 }}>{c.n}</span></div><div className="hidden sm:block" style={{ width: 70, textAlign: "right", fontSize: 13.5, color: MUTED }}>{c.v}</div><div className="hidden sm:block" style={{ width: 70, textAlign: "right", fontSize: 13.5, fontWeight: 700, color: "#B4862F" }}>{c.p}</div><div className="hidden sm:block" style={{ width: 110, textAlign: "right", fontSize: 13, color: "#9A8F80" }}>{c.last}</div><div style={{ width: 80, textAlign: "right" }}><span style={{ height: 24, padding: "0 10px", borderRadius: 999, background: c.sBg, color: c.sFg, fontSize: 11.5, fontWeight: 700, display: "inline-flex", alignItems: "center" }}>{c.s}</span></div></button>)}
                    </div>
                  </div>
                )}

                {sec === "marketing" && (
                  <div className="flex flex-col" style={{ gap: 18 }}>
                    <div className="grid gap-3.5 lg:grid-cols-[1.4fr_1fr]">
                      <div style={{ ...card, display: "flex", flexDirection: "column", gap: 14 }}><div className="flex items-center justify-between"><span style={{ fontWeight: 700, fontSize: 15 }}>Kampanje</span><button style={{ height: 34, padding: "0 14px", border: "none", borderRadius: 10, background: INK, color: PAPER, fontFamily: JAK, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Nova kampanja</button></div>{CAMPAIGNS.map(([n, meta, st, sBg, sFg, bg, icon, icc]) => <div key={n} className="flex items-center" style={{ gap: 13, padding: 13, border: "1px solid #F1E8D9", borderRadius: 14 }}><div className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: 12, background: bg, flexShrink: 0 }}><Ic name={icon} color={icc} size={20} /></div><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{n}</div><div style={{ fontSize: 12, color: "#9A8F80" }}>{meta}</div></div><span style={{ height: 24, padding: "0 10px", borderRadius: 999, background: sBg, color: sFg, fontSize: 11.5, fontWeight: 700, display: "inline-flex", alignItems: "center" }}>{st}</span></div>)}</div>
                      <div style={{ ...card, display: "flex", flexDirection: "column", gap: 14 }}><span style={{ fontWeight: 700, fontSize: 15 }}>Avtomatizacije</span>{AUTOS.map(([n, d, on]) => <div key={n} className="flex items-center" style={{ gap: 12 }}><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13.5, fontWeight: 600 }}>{n}</div><div style={{ fontSize: 12, color: "#9A8F80" }}>{d}</div></div><Toggle on={on} /></div>)}</div>
                    </div>
                    <div className="flex flex-wrap items-center" style={{ background: INK, borderRadius: 18, padding: 24, gap: 24, color: PAPER }}><div style={{ flex: 1, minWidth: 240 }}><div style={{ fontWeight: 800, fontSize: 17, marginBottom: 4 }}>Kalkulator stroška kampanje</div><div style={{ fontSize: 13.5, color: "rgba(251,243,230,0.65)", lineHeight: 1.5 }}>Segment <strong style={{ color: AMBER }}>»Neaktivni 21+ dni«</strong> · 23 strank · nagrada −15% (povp. 0,9 €/unovčitev).</div></div><div className="flex" style={{ gap: 26 }}><div><div style={{ fontSize: 12, color: "rgba(251,243,230,0.55)" }}>Doseg</div><div style={{ fontWeight: 800, fontSize: 24 }}>23</div></div><div><div style={{ fontSize: 12, color: "rgba(251,243,230,0.55)" }}>Pričak. unovč.</div><div style={{ fontWeight: 800, fontSize: 24 }}>~9</div></div><div><div style={{ fontSize: 12, color: "rgba(251,243,230,0.55)" }}>Ocena stroška</div><div style={{ fontWeight: 800, fontSize: 24, color: AMBER }}>8 €</div></div></div></div>
                  </div>
                )}

                {sec === "sistem" && (
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div style={{ ...card, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 24 }}><span className="self-start" style={{ fontWeight: 700, fontSize: 15 }}>QR plakat za mize</span><div style={{ background: "#fff", border: "1px solid #EFE4D2", borderRadius: 16, padding: 18 }}><QrEl px={190} seed={7} /></div><div className="flex items-center" style={{ height: 40, padding: "0 16px", borderRadius: 999, background: CREAM, border: "1px solid #EFE4D2", gap: 8, fontSize: 14, fontWeight: 600, color: MUTED }}>loyavi.app/p/mora</div><div className="flex w-full" style={{ gap: 10 }}>{["Prenesi PNG", "Prenesi PDF"].map((t) => <button key={t} style={{ flex: 1, height: 46, border: `1.5px solid ${INK}`, borderRadius: 12, background: "transparent", color: INK, fontFamily: JAK, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{t}</button>)}</div></div>
                    <div className="flex flex-col" style={{ gap: 16 }}>
                      <div style={{ ...card, display: "flex", flexDirection: "column", gap: 12 }}><span style={{ fontWeight: 700, fontSize: 15 }}>Vgradi na svojo spletno stran</span><span style={{ fontSize: 13, color: "#9A8F80", lineHeight: 1.5 }}>Prilepi to kodo v &lt;body&gt; — gostom pokaže plavajoči gumb s kolesom sreče.</span><div style={{ background: INK, borderRadius: 12, padding: 14, fontFamily: "ui-monospace,Menlo,monospace", fontSize: 12.5, color: "#E8C99A", lineHeight: 1.5, wordBreak: "break-all" }}>&lt;script src=&quot;https://loyavi.app/w.js&quot; data-venue=&quot;mora&quot;&gt;&lt;/script&gt;</div><button style={{ height: 42, border: "none", borderRadius: 11, background: AMBER, color: INK, fontFamily: JAK, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>Kopiraj kodo</button></div>
                      <div style={{ background: "#fff", border: `2px solid ${AMBER}`, borderRadius: 18, padding: 22, display: "flex", flexDirection: "column", gap: 10 }}><div className="flex items-center justify-between"><span style={{ fontWeight: 700, fontSize: 15 }}>Skeniranje računov</span><span style={{ height: 26, padding: "0 11px", borderRadius: 999, background: "rgba(94,127,82,0.16)", color: "#3E5536", fontSize: 11.5, fontWeight: 800, display: "flex", alignItems: "center" }}>Aktivno</span></div><span style={{ fontSize: 13, color: MUTED, lineHeight: 1.5 }}>Davčna št. prebrana iz vzorčnega računa. Točke prinesejo samo tvoji računi.</span></div>
                    </div>
                  </div>
                )}

                {sec === "nastavitve" && (
                  <div className="flex flex-col" style={{ gap: 16 }}>
                    <div style={{ fontSize: 14, color: MUTED, maxWidth: 560, lineHeight: 1.5 }}>Vse prilagodiš sam — barve, besedila, kupone in zaslone gosta.</div>
                    <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>{SETTINGS.map(([n, d, icon]) => <div key={n} style={{ ...card, padding: 20, display: "flex", flexDirection: "column", gap: 10 }}><div className="flex items-center justify-center" style={{ width: 42, height: 42, borderRadius: 12, background: CREAM }}><Ic name={icon} color="#B4862F" size={22} /></div><div style={{ fontWeight: 700, fontSize: 15 }}>{n}</div><div style={{ fontSize: 13, color: "#9A8F80", lineHeight: 1.45 }}>{d}</div></div>)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* PROFILE MODAL */}
            {profile && (
              <div onClick={() => setProfile(null)} className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(26,18,13,0.42)", backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)", padding: 24, zIndex: 20 }}>
                <div onClick={(e) => e.stopPropagation()} style={{ width: 440, maxWidth: "100%", background: CREAM, borderRadius: 24, overflow: "hidden", boxShadow: "0 30px 70px rgba(26,18,13,0.4)" }}>
                  <div className="flex items-center" style={{ background: INK, padding: 24, gap: 14, color: PAPER }}><div className="flex items-center justify-center" style={{ width: 52, height: 52, borderRadius: 16, background: AMBER, color: INK, fontWeight: 800, fontSize: 21 }}>{profile.in}</div><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 800, fontSize: 18 }}>{profile.name}</div><div style={{ fontSize: 12.5, color: "rgba(251,243,230,0.6)" }}>Član od mar 2026 · {profile.v} obiskov</div></div><button onClick={() => setProfile(null)} aria-label="Zapri" className="flex items-center justify-center" style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: "rgba(251,243,230,0.14)", cursor: "pointer" }}><svg width="15" height="15" viewBox="0 0 24 24" style={{ fill: "none", stroke: PAPER, strokeWidth: 2.2, strokeLinecap: "round" }}><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" /></svg></button></div>
                  <div className="flex flex-col" style={{ padding: 22, gap: 16 }}>
                    <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>{[[profile.p, "točk", "#B4862F"], [profile.v, "obiskov", INK], ["2", "nagrade", GREEN]].map(([v, l, c], i) => <div key={i} style={{ background: "#fff", border: `1px solid ${BORD}`, borderRadius: 14, padding: 14, textAlign: "center" }}><div style={{ fontWeight: 800, fontSize: 22, color: c }}>{v}</div><div style={{ fontSize: 11.5, color: "#9A8F80" }}>{l}</div></div>)}</div>
                    <div style={{ background: "#fff", border: `1px solid ${BORD}`, borderRadius: 14, padding: 16 }}><div style={{ fontSize: 12, fontWeight: 700, color: "#9A8F80", marginBottom: 10 }}>Zadnji obiski</div><div className="flex flex-col" style={{ gap: 9 }}>{[["danes · 9.12", "+15 točk", GREEN], ["včeraj · 8.40", "+15 točk", GREEN], ["28. maj · unovčil kavo", "−150 točk", CORAL]].map(([t, d, c], i) => <div key={i} className="flex justify-between" style={{ fontSize: 13 }}><span style={{ color: MUTED }}>{t}</span><span style={{ fontWeight: 700, color: c }}>{d}</span></div>)}</div></div>
                    <div className="flex" style={{ gap: 10 }}><button style={{ flex: 1, height: 46, border: "none", borderRadius: 12, background: INK, color: PAPER, fontFamily: JAK, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Pošlji sporočilo</button><button style={{ height: 46, padding: "0 16px", border: "1.5px solid #E4D9C7", borderRadius: 12, background: "transparent", color: MUTED, fontFamily: JAK, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Dodaj točke</button></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="text-center" style={{ fontSize: 12, color: "#A89B88", paddingBottom: 8 }}>{BRAND} · demo nadzorne plošče</div>
    </main>
  );
}
