import Link from "next/link";
import { BRAND } from "@/lib/brand";

const INK = "#2A241D";
const CREAM = "#FBF7F0";
const PAPER = "#FBF3E6";
const CORAL = "#C4623D";
const AMBER = "#E2A04A";
const GREEN = "#5E7F52";
const MUTED = "#6E6253";
const BORDER = "#EFE6D6";
const JAK = "var(--font-jakarta), sans-serif";

const PARTNER = "/partner";
const DEMO_GUEST = "/p/demo";
const DEMO_DASH = "/demo/dashboard";

function Cup({ stroke, size }: { stroke: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", fill: "none", stroke, strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round" }}>
      <path d="M5 9h10v5.5A4.5 4.5 0 0 1 10.5 19h-1A4.5 4.5 0 0 1 5 14.5V9Z" />
      <path d="M15 10.5h1.6a2.4 2.4 0 0 1 0 4.8H15" />
    </svg>
  );
}
function Check({ stroke = GREEN, size = 17 }: { stroke?: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0, fill: "none", stroke, strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M5 12.5l4.2 4.2L19 7" /></svg>;
}
function Star({ fill, size }: { fill: string; size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}><path d="M12 3.5l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z" style={{ fill, stroke: "none" }} /></svg>;
}
function Stars({ n, fill, empty, size }: { n: number; fill: string; empty: string; size: number }) {
  return <div style={{ display: "flex", gap: 2 }}>{[0, 1, 2, 3, 4].map((i) => <Star key={i} fill={i < n ? fill : empty} size={size} />)}</div>;
}

const HERO_ROTS = [-5, 4, -3, 6, -4, 3, -5, 2, -4, 0];
function HeroStamps() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
      {Array.from({ length: 10 }).map((_, i) => {
        const filled = i < 7, reward = i === 9;
        if (filled) return <div key={i} style={{ aspectRatio: "1", borderRadius: "50%", border: `2px solid ${CORAL}`, background: "rgba(196,98,61,0.09)", display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${HERO_ROTS[i]}deg)` }}><Cup stroke={CORAL} size={15} /></div>;
        if (reward) return <div key={i} style={{ aspectRatio: "1", borderRadius: "50%", background: "#FCEFD8", display: "flex", alignItems: "center", justifyContent: "center" }}><Cup stroke={AMBER} size={15} /></div>;
        return <div key={i} style={{ aspectRatio: "1", borderRadius: "50%", border: "2px solid #EFE4D2", background: CREAM }} />;
      })}
    </div>
  );
}

function RatingChart() {
  const pts = [4.1, 4.2, 4.3, 4.5, 4.6, 4.8];
  const w = 300, h = 70, pad = 4, min = 4.0, max = 4.9;
  const xs = pts.map((_, i) => pad + (i * (w - pad * 2)) / (pts.length - 1));
  const ys = pts.map((p) => h - pad - ((p - min) / (max - min)) * (h - pad * 2));
  let d = `M${xs[0]} ${ys[0]}`;
  for (let i = 1; i < pts.length; i++) d += ` L${xs[i]} ${ys[i]}`;
  const area = `${d} L${xs[xs.length - 1]} ${h} L${xs[0]} ${h} Z`;
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <path d={area} style={{ fill: "rgba(226,160,74,0.14)", stroke: "none" }} />
      <path d={d} style={{ fill: "none", stroke: AMBER, strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" }} />
      {xs.map((x, i) => <circle key={i} cx={x} cy={ys[i]} r={i === xs.length - 1 ? 4 : 2.5} style={{ fill: i === xs.length - 1 ? AMBER : CREAM, stroke: AMBER, strokeWidth: 2 }} />)}
    </svg>
  );
}
function Donut() {
  const r = 38, c = 2 * Math.PI * r, frac = 0.91;
  return (
    <svg width={96} height={96} viewBox="0 0 96 96" style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={48} cy={48} r={r} style={{ fill: "none", stroke: "rgba(248,243,234,0.12)", strokeWidth: 11 }} />
      <circle cx={48} cy={48} r={r} style={{ fill: "none", stroke: "#5E9E6E", strokeWidth: 11, strokeLinecap: "round", strokeDasharray: c, strokeDashoffset: c * (1 - frac) }} />
    </svg>
  );
}

const HOURS: [string, number, string][] = [["7", 18, "7"], ["8", 34, ""], ["9", 46, ""], ["10", 38, "10"], ["11", 22, ""], ["12", 26, ""], ["13", 20, "13"], ["14", 16, ""], ["15", 30, ""], ["16", 42, "16"], ["17", 28, ""], ["18", 14, ""], ["19", 10, "19"], ["20", 6, ""], ["21", 4, "21"]];
const HERO_STATS = [{ v: "+32%", l: "ponovnih obiskov v 3 mesecih", c: GREEN }, { v: "4,8★", l: "povprečna ocena na Googlu", c: AMBER }, { v: "3×", l: "več Google ocen kot prej", c: CORAL }, { v: "0 €", l: "provizije na obisk gosta", c: INK }];
const DASH_KPIS = [{ l: "Skeniranja", v: "482", d: "+18%" }, { l: "Stranke", v: "137", d: "+12 novih" }, { l: "Nove ocene", v: "86", d: "+41%" }, { l: "Poslani kuponi", v: "210", d: "38% unovč." }];
const STEPS = [
  { n: "01", bg: CREAM, color: INK, rot: false, icon: <svg width="25" height="25" viewBox="0 0 24 24" style={{ fill: "none", stroke: INK, strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M4 8.6A2.6 2.6 0 0 1 6.6 6h1.5l1.5-2h4.8l1.5 2h1.5A2.6 2.6 0 0 1 20 8.6v7.8A2.6 2.6 0 0 1 17.4 19H6.6A2.6 2.6 0 0 1 4 16.4V8.6Z" /><circle cx="12" cy="12.7" r="3.4" /></svg>, t: "Skenira račun", d: "Odpre tvojo stran prek QR na mizi in poskenira fiskalni QR. Brez aplikacije, brez kartice." },
  { n: "02", bg: "rgba(196,98,61,0.1)", color: CORAL, rot: true, icon: <Cup stroke={CORAL} size={25} />, t: "Dobi žig + postane kontakt", d: "Štampiljka tlesne na kartonček. Gost je zdaj v tvoji bazi — z obiski, točkami in zgodovino." },
  { n: "03", bg: "rgba(94,127,82,0.14)", color: GREEN, rot: false, icon: <svg width="25" height="25" viewBox="0 0 24 24" style={{ fill: "none", stroke: GREEN, strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M12 3.5l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z" /></svg>, t: "Pusti oceno", d: "Po skenu ga povabimo k oceni. Zadovoljni gredo na Google, nezadovoljni naravnost k tebi." },
];
const PLANS = [
  { name: "Espresso", tag: "Za en lokal, ki začenja", price: "49,99 €", per: "/ mesec", featured: false, cta: "Izberi Espresso", feats: ["1 lokal", "QR stran za goste", "Žigi, točke in nagrade", "Neomejeno strank", "Stroj za Google ocene", "Osnovna analitika"] },
  { name: "Doppio", tag: "Cel marketinški stroj", price: "79,99 €", per: "/ mesec", featured: true, cta: "Izberi Doppio", feats: ["Vse iz Espresso", "Sporočila + kuponi + segmenti", "Avtomatizacije (rojstni dan, reaktivacija)", "Kolo sreče + vgradni widget", "Polna analitika in izvoz", "Prednostna podpora"] },
  { name: "Palača", tag: "Veriga & zasloni po meri", price: "Po dogovoru", per: "", featured: false, cta: "Pogovorimo se", feats: ["Vse iz Doppio", "Več lokalov, en dashboard", "Zasloni gosta po meri", "Dostop do API", "Namenski skrbnik"] },
];
const TRUST = ["Kavarne", "Bistroji", "Slaščičarne", "Picerije", "Frizerji", "Pekarne"];
const FAQS = [
  { q: "Kako deluje zbiranje Google ocen?", a: "Po skenu gost oceni obisk z zvezdicami. Pri 4–5 zvezdicah ga z enim dotikom pošljemo na vašo Google stran; pri 3 ali manj ostane mnenje zasebno v vaši plošči, da lahko ukrepate, preden gre v javnost." },
  { q: "Mora gost naložiti aplikacijo?", a: "Ne. Vse teče v brskalniku prek QR kode na mizi. Registracija je en korak z emailom — brez gesla, brez prenosa." },
  { q: "Lahko pošiljam sporočila in kupone gostom?", a: "Da. V plošči ustvariš kupon, izbereš segment (npr. najboljši ali neaktivni gosti) in pošlješ. Avtomatizacije, kot je sporočilo za rojstni dan, tečejo same." },
  { q: "Je to skladno z GDPR?", a: "Da. Gost ob registraciji poda privolitev za sporočila; kadarkoli se lahko odjavi. Podatki so shranjeni v EU in nikoli se ne delijo naprej." },
  { q: "Kako preprečite zlorabo računov?", a: "Vsak fiskalni račun ima unikatno oznako (ZOI) in se prizna le enkrat. Štejejo samo računi vašega lokala, izdani v zadnjih 24 urah." },
  { q: "Koliko časa traja postavitev?", a: "Okoli pet minut: ime, logo, barva, fotografiraš vzorčni račun za aktivacijo in natisneš QR. Gostje lahko zbirajo žige še isti dan." },
];

function Logo({ size = 34, fs = 20 }: { size?: number; fs?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <div style={{ width: size, height: size, borderRadius: 11, background: INK, color: PAPER, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: Math.round(size * 0.5) }}>{BRAND.charAt(0)}</div>
      <span style={{ fontWeight: 800, fontSize: fs, letterSpacing: "-0.01em" }}>{BRAND}</span>
    </div>
  );
}

export default function Home() {
  return (
    <div style={{ background: CREAM, fontFamily: JAK, color: INK, minHeight: "100vh", overflowX: "hidden" }}>
      {/* NAV */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(251,247,240,0.82)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderBottom: "1px solid rgba(42,36,29,0.07)" }}>
        <div className="mx-auto flex items-center gap-3.5" style={{ maxWidth: 1200, height: 68, padding: "0 24px" }}>
          <Logo />
          <div className="ml-7 hidden items-center gap-6 md:flex">
            <a href="#kako" style={{ fontSize: 14.5, fontWeight: 600, color: MUTED }}>Kako deluje</a>
            <a href="#ocene" style={{ fontSize: 14.5, fontWeight: 600, color: MUTED }}>Google ocene</a>
            <a href="#marketing" style={{ fontSize: 14.5, fontWeight: 600, color: MUTED }}>Marketing</a>
            <a href="#cene" style={{ fontSize: 14.5, fontWeight: 600, color: MUTED }}>Cene</a>
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            <Link href={PARTNER} className="hidden sm:flex" style={{ height: 42, padding: "0 16px", borderRadius: 12, color: INK, fontSize: 14.5, fontWeight: 700, alignItems: "center" }}>Prijava</Link>
            <Link href={PARTNER} style={{ height: 42, padding: "0 20px", borderRadius: 12, background: INK, color: PAPER, fontSize: 14.5, fontWeight: 700, display: "flex", alignItems: "center" }}>Začni brezplačno</Link>
          </div>
        </div>
      </div>

      {/* HERO */}
      <div className="mx-auto flex flex-wrap items-center" style={{ maxWidth: 1200, padding: "64px 24px 40px", gap: 48 }}>
        <div className="flex flex-col" style={{ flex: "1.08", minWidth: 340, gap: 22 }}>
          <div className="self-start" style={{ display: "flex", alignItems: "center", gap: 8, height: 34, padding: "0 14px", borderRadius: 999, background: "#FCEFD8", color: "#B4781E", fontSize: 13, fontWeight: 700 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: AMBER }} />Zvestoba · Google ocene · marketing — v enem</div>
          <h1 style={{ margin: 0, fontWeight: 800, fontSize: "clamp(40px,5.4vw,66px)", lineHeight: 1.0, letterSpacing: "-0.025em" }}>Stalni gosti se ne zgodijo. <span style={{ color: CORAL }}>Zgradiš jih.</span></h1>
          <p style={{ margin: 0, fontSize: "clamp(16px,1.5vw,19px)", lineHeight: 1.55, color: MUTED, maxWidth: 500 }}>Gost skenira QR z računa in dobi žig. Ti pa zgradiš bazo svojih najboljših gostov, <strong style={{ color: INK }}>avtomatsko zbiraš Google ocene</strong> in jim z enim klikom pošlješ ponudbo s kuponom.</p>
          <div className="flex flex-wrap" style={{ gap: 12 }}>
            <Link href={PARTNER} style={{ height: 56, padding: "0 28px", borderRadius: 16, background: INK, color: PAPER, fontSize: 16.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 9, boxShadow: "0 12px 26px rgba(42,36,29,0.22)" }}>Začni brezplačno<svg width="18" height="18" viewBox="0 0 24 24" style={{ fill: "none", stroke: PAPER, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M5 12h14M13 6l6 6-6 6" /></svg></Link>
            <Link href={DEMO_GUEST} style={{ height: 56, padding: "0 24px", borderRadius: 16, border: "1.5px solid #E0D2BC", background: "#fff", color: INK, fontSize: 16.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>Poglej demo v živo</Link>
          </div>
          <div className="flex flex-wrap items-center" style={{ gap: 20, marginTop: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: MUTED }}><Check size={18} />Postavljeno v 5 minutah</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: MUTED }}><Check size={18} />Brez aplikacije za gosta</div>
          </div>
        </div>
        {/* hero visual */}
        <div className="flex justify-center" style={{ flex: 1, minWidth: 320, position: "relative" }}>
          <div style={{ position: "relative", width: 340 }}>
            <div style={{ position: "absolute", top: -20, right: -10, zIndex: 3, height: 44, padding: "0 16px", borderRadius: 999, background: GREEN, color: "#F4F0E4", fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", gap: 7, boxShadow: "0 12px 28px rgba(94,127,82,0.35)", animation: "floaty 5s ease-in-out infinite" }}>+1 žig</div>
            <div style={{ position: "absolute", top: 70, left: -30, zIndex: 3, height: 48, padding: "0 15px", borderRadius: 14, background: "#fff", boxShadow: "0 14px 30px rgba(42,36,29,0.16)", display: "flex", alignItems: "center", gap: 8, animation: "floaty2 6s ease-in-out infinite" }}><Stars n={5} fill={AMBER} empty="#EFE4D2" size={13} /><span style={{ fontSize: 12.5, fontWeight: 700 }}>nova ocena</span></div>
            <div style={{ position: "absolute", bottom: 24, left: -26, zIndex: 3, height: 50, padding: "0 15px 0 11px", borderRadius: 14, background: "#fff", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 14px 30px rgba(42,36,29,0.16)", animation: "floaty3 5.5s ease-in-out infinite" }}><div style={{ width: 32, height: 32, borderRadius: 9, background: "#FCEFD8", display: "flex", alignItems: "center", justifyContent: "center" }}><Cup stroke={AMBER} size={17} /></div><div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}><span style={{ fontSize: 12, fontWeight: 800 }}>Kupon poslan</span><span style={{ fontSize: 11, color: "#9A8F80" }}>42 gostom</span></div></div>
            <div style={{ position: "relative", zIndex: 2, background: "#fff", borderRadius: 28, padding: "26px 24px", transform: "rotate(-3deg)", boxShadow: "0 30px 70px rgba(42,36,29,0.2),0 4px 14px rgba(42,36,29,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 18 }}><div style={{ width: 46, height: 46, borderRadius: 14, background: INK, color: PAPER, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20 }}>M</div><div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}><span style={{ fontWeight: 800, fontSize: 17 }}>Mora</span><span style={{ fontSize: 12, color: "#9A8F80" }}>tvoja kartica zvestobe</span></div><div style={{ marginLeft: "auto", textAlign: "right", lineHeight: 1 }}><div style={{ fontWeight: 800, fontSize: 28 }}>7</div><div style={{ fontSize: 11, color: "#9A8F80" }}>/ 10</div></div></div>
              <HeroStamps />
              <div style={{ marginTop: 16, background: CREAM, borderRadius: 14, padding: "12px 14px", fontSize: 13, color: MUTED }}>Še <strong style={{ color: INK }}>3 obiski</strong> do brezplačne kave</div>
            </div>
          </div>
        </div>
      </div>

      {/* TRUST */}
      <div style={{ borderTop: "1px solid rgba(42,36,29,0.08)", borderBottom: "1px solid rgba(42,36,29,0.08)", background: "rgba(255,255,255,0.5)", padding: "30px 0" }}>
        <div className="mx-auto flex flex-col items-center" style={{ maxWidth: 1100, padding: "0 24px", gap: 16 }}>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#A89B88" }}>Narejeno za vse, ki imajo stalne goste</span>
          <div className="flex flex-wrap justify-center" style={{ gap: 10 }}>
            {TRUST.map((t) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 17px", borderRadius: 999, background: "#fff", border: `1px solid ${BORDER}`, boxShadow: "0 1px 2px rgba(42,36,29,0.04)", fontWeight: 700, fontSize: 14.5, color: "#41382C" }}><Cup stroke={CORAL} size={17} />{t}</div>
            ))}
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="mx-auto" style={{ maxWidth: 1200, padding: "48px 24px 8px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
          {HERO_STATS.map((s) => (
            <div key={s.l} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 20, padding: 22, display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontWeight: 800, fontSize: 38, letterSpacing: "-0.02em", color: s.c }}>{s.v}</span>
              <span style={{ fontSize: 14, color: MUTED, lineHeight: 1.4 }}>{s.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* KAKO DELUJE */}
      <div id="kako" className="mx-auto" style={{ maxWidth: 1200, padding: "72px 24px 40px" }}>
        <div className="flex flex-col items-center text-center" style={{ gap: 10, marginBottom: 44 }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: CORAL }}>Tako preprosto je</div>
          <h2 style={{ margin: 0, fontWeight: 800, fontSize: "clamp(30px,3.6vw,44px)", lineHeight: 1.08, letterSpacing: "-0.02em" }}>En sken sproži tri stvari</h2>
          <p style={{ margin: 0, fontSize: 17, color: MUTED, maxWidth: 560, lineHeight: 1.5 }}>Gost poskenira fiskalni QR z računa. V isti sekundi dobi žig, ti pa novega gosta v bazi in priložnost za oceno.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 18 }}>
          {STEPS.map((s) => (
            <div key={s.n} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 22, padding: 26, display: "flex", flexDirection: "column", gap: 13 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ width: 50, height: 50, borderRadius: 15, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", transform: s.rot ? "rotate(-5deg)" : undefined }}>{s.icon}</div>
                <span style={{ fontWeight: 800, fontSize: 36, color: "#EAD9BC" }}>{s.n}</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.01em" }}>{s.t}</div>
              <div style={{ fontSize: 14.5, lineHeight: 1.55, color: MUTED }}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* OCENE (dark) */}
      <div id="ocene" style={{ background: INK, marginTop: 40 }}>
        <div className="mx-auto flex flex-wrap items-center" style={{ maxWidth: 1200, padding: "80px 24px", gap: 52 }}>
          <div className="flex flex-col" style={{ flex: 1, minWidth: 320, gap: 20 }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: AMBER }}>Stroj za Google ocene</div>
            <h2 style={{ margin: 0, fontWeight: 800, fontSize: "clamp(28px,3.6vw,44px)", lineHeight: 1.06, letterSpacing: "-0.02em", color: "#F8F3EA" }}>Več zvezdic na Googlu,<br />nič slabih ocen v javnosti</h2>
            <p style={{ margin: 0, fontSize: 16.5, lineHeight: 1.6, color: "rgba(248,243,234,0.74)", maxWidth: 460 }}>Po vsakem skenu gost oceni obisk. <strong style={{ color: "#F8F3EA" }}>3 zvezdice ali manj</strong> ostanejo pri tebi kot zasebna povratna informacija — priložnost, da popraviš. <strong style={{ color: "#F8F3EA" }}>4 ali 5</strong> jih z enim klikom pošljemo na Google.</p>
            <div className="flex flex-col" style={{ gap: 13, marginTop: 4 }}>
              {["Prestreže nezadovoljne preden objavijo javno", "Usmeri zadovoljne naravnost na Google z enim dotikom", "Vsa zasebna mnenja zbrana na enem mestu v plošči"].map((t) => (
                <div key={t} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}><div style={{ width: 28, height: 28, borderRadius: 9, background: "rgba(226,160,74,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Check stroke={AMBER} size={15} /></div><div style={{ fontSize: 15, lineHeight: 1.5, color: "rgba(248,243,234,0.9)" }}>{t}</div></div>
              ))}
            </div>
            <Link href={DEMO_DASH} className="self-start" style={{ marginTop: 6, height: 50, padding: "0 22px", borderRadius: 14, background: AMBER, color: INK, fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>Poglej, kako deluje<svg width="16" height="16" viewBox="0 0 24 24" style={{ fill: "none", stroke: INK, strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M5 12h14M13 6l6 6-6 6" /></svg></Link>
          </div>
          {/* review visual */}
          <div className="flex flex-col" style={{ flex: 1, minWidth: 320, gap: 16 }}>
            <div style={{ background: CREAM, borderRadius: 22, padding: 22, boxShadow: "0 22px 50px rgba(0,0,0,0.3)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}><div style={{ width: 38, height: 38, borderRadius: 11, background: INK, color: PAPER, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16 }}>M</div><div style={{ fontWeight: 800, fontSize: 15 }}>Kako je bilo pri Mora?</div></div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", padding: "10px 0 6px" }}><Stars n={5} fill={AMBER} empty="#E4D9C7" size={30} /></div>
              <div style={{ textAlign: "center", fontSize: 12.5, color: "#9A8F80" }}>Dotakni se zvezdic</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: "rgba(251,247,240,0.08)", border: "1px solid rgba(248,243,234,0.14)", borderRadius: 18, padding: 16, display: "flex", flexDirection: "column", gap: 8 }}><Stars n={2} fill="rgba(248,243,234,0.5)" empty="rgba(248,243,234,0.18)" size={13} /><div style={{ fontWeight: 800, fontSize: 14, color: "#F8F3EA" }}>≤ 3 zvezdice</div><div style={{ fontSize: 12.5, lineHeight: 1.45, color: "rgba(248,243,234,0.6)" }}>Ostane pri tebi kot zasebna pripomba. Gost ne gre na Google.</div></div>
              <div style={{ background: AMBER, borderRadius: 18, padding: 16, display: "flex", flexDirection: "column", gap: 8 }}><Stars n={5} fill={INK} empty="rgba(42,36,29,0.25)" size={13} /><div style={{ fontWeight: 800, fontSize: 14, color: INK }}>4–5 zvezdic</div><div style={{ fontSize: 12.5, lineHeight: 1.45, color: "rgba(42,36,29,0.7)" }}>Z enim dotikom objavi na Googlu. Tvoja ocena raste.</div></div>
            </div>
            <div style={{ background: CREAM, borderRadius: 22, padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}><div><div style={{ display: "flex", alignItems: "baseline", gap: 6 }}><span style={{ fontWeight: 800, fontSize: 30, letterSpacing: "-0.02em" }}>4,8</span><Star fill={AMBER} size={20} /></div><div style={{ fontSize: 12.5, color: "#9A8F80" }}>povprečna ocena na Googlu</div></div><div style={{ textAlign: "right" }}><div style={{ fontWeight: 800, fontSize: 18, color: GREEN }}>+86</div><div style={{ fontSize: 12, color: "#9A8F80" }}>ocen v 3 mes.</div></div></div>
              <RatingChart />
            </div>
          </div>
        </div>
      </div>

      {/* MARKETING */}
      <div id="marketing" className="mx-auto flex flex-wrap items-center" style={{ maxWidth: 1200, padding: "80px 24px 40px", gap: 52 }}>
        <div className="flex items-center" style={{ flex: 1, minWidth: 320, gap: 22, position: "relative" }}>
          <div style={{ flex: 1, background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 22, padding: 20, boxShadow: "0 18px 44px rgba(42,36,29,0.1)" }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#B4862F", marginBottom: 12 }}>Nova kampanja</div>
            <div style={{ background: CREAM, border: "1px solid #EFE4D2", borderRadius: 13, padding: 13, fontSize: 13.5, lineHeight: 1.5, color: INK, marginBottom: 12 }}>Pogrešamo te! Ta teden <strong>−20%</strong> na vse kave ☕ Se vidiva pri Mora.</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "linear-gradient(135deg,#FCEFD8,#F8E3C2)", borderRadius: 13, padding: 12, marginBottom: 14 }}><div style={{ width: 36, height: 36, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Cup stroke={AMBER} size={19} /></div><div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 800 }}>Kupon: −20% kava</div><div style={{ fontSize: 11.5, color: "#B4862F", fontWeight: 600 }}>priložen · velja 7 dni</div></div></div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 13px", background: CREAM, borderRadius: 12, marginBottom: 14 }}><span style={{ fontSize: 13, color: MUTED }}>Segment</span><span style={{ fontSize: 13, fontWeight: 700 }}>Najboljši gosti · 42</span></div>
            <div style={{ width: "100%", height: 48, borderRadius: 13, background: INK, color: PAPER, fontSize: 14.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><svg width="17" height="17" viewBox="0 0 24 24" style={{ fill: "none", stroke: PAPER, strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M4 12l16-7-7 16-2-7z" /></svg>Pošlji 42 gostom</div>
          </div>
          <div className="hidden sm:block" style={{ width: 198, flexShrink: 0, animation: "floaty3 6s ease-in-out infinite" }}>
            <div style={{ background: "#15100B", borderRadius: 36, padding: 7, boxShadow: "0 30px 60px rgba(42,36,29,0.32),0 0 0 1px rgba(42,36,29,0.35)" }}>
              <div style={{ position: "relative", borderRadius: 30, overflow: "hidden", height: 372, background: "linear-gradient(165deg,#3C3024 0%,#241B12 55%,#15100B 100%)" }}>
                <div style={{ position: "absolute", top: 9, left: "50%", transform: "translateX(-50%)", width: 58, height: 17, borderRadius: 10, background: "#000", zIndex: 5 }} />
                <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", padding: "16px 13px 18px", boxSizing: "border-box" }}>
                  <div style={{ textAlign: "center", color: "#F8F3EA", paddingTop: 30 }}><div style={{ fontSize: 12, fontWeight: 600, opacity: 0.68 }}>torek, 12. maj</div><div style={{ fontSize: 54, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1, marginTop: 2 }}>9:41</div></div>
                  <div style={{ flex: 1 }} />
                  <div style={{ background: "rgba(251,247,240,0.95)", borderRadius: 18, padding: "11px 12px", display: "flex", gap: 9, boxShadow: "0 10px 22px rgba(0,0,0,0.24)" }}><div style={{ width: 30, height: 30, borderRadius: 9, background: INK, color: PAPER, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>M</div><div style={{ flex: 1, minWidth: 0 }}><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}><span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", color: INK }}>MORA</span><span style={{ fontSize: 10, color: "#9A8F80" }}>zdaj</span></div><div style={{ fontSize: 11.5, lineHeight: 1.35, color: "#3A3228" }}>Pogrešamo te! Ta teden −20% na vse kave ☕</div></div></div>
                  <div style={{ marginTop: 9, background: "linear-gradient(135deg,#FCEFD8,#F6DEBC)", borderRadius: 18, padding: "13px 14px", boxShadow: "0 10px 22px rgba(0,0,0,0.2)" }}><div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: CORAL }} /><span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.14em", color: "#B4781E" }}>KUPON · MORA</span></div><div style={{ fontWeight: 800, fontSize: 17, color: INK, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>−20% kava</div><div style={{ margin: "9px 0", borderTop: "1.5px dashed rgba(180,134,47,0.45)" }} /><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><span style={{ fontWeight: 800, fontSize: 13, letterSpacing: "0.08em", color: INK }}>MORA-20</span><span style={{ fontSize: 10.5, color: "#B4862F", fontWeight: 600 }}>velja 7 dni</span></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col" style={{ flex: 1, minWidth: 320, gap: 20 }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: CORAL }}>Direkten marketing</div>
          <h2 style={{ margin: 0, fontWeight: 800, fontSize: "clamp(28px,3.4vw,42px)", lineHeight: 1.06, letterSpacing: "-0.02em" }}>Pošlji ponudbo naravnost<br />v žep svojih gostov</h2>
          <p style={{ margin: 0, fontSize: 16.5, lineHeight: 1.6, color: MUTED, maxWidth: 460 }}>Ni gneče? Pošlji kupon najboljšim gostom. Rojstni dan? Avtomatsko sporočilo. Vse iz plošče — ustvariš kupon, izbereš segment, pošlješ.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[["Ustvari kupone", "Popusti, darila, 2 za 1"], ["Pametni segmenti", "Najboljši · neaktivni · novi"], ["Avtomatizacije", "Rojstni dan, reaktivacija"], ["Merljiv učinek", "Vidiš, kdo je unovčil"]].map(([t, d]) => (
              <div key={t} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 6 }}><div style={{ width: 36, height: 36, borderRadius: 10, background: CREAM, display: "flex", alignItems: "center", justifyContent: "center" }}><Cup stroke={CORAL} size={19} /></div><div style={{ fontWeight: 700, fontSize: 14.5 }}>{t}</div><div style={{ fontSize: 12.5, color: "#9A8F80", lineHeight: 1.4 }}>{d}</div></div>
            ))}
          </div>
        </div>
      </div>

      {/* DASHBOARD */}
      <div className="mx-auto" style={{ maxWidth: 1200, padding: "56px 24px 40px" }}>
        <div className="flex flex-col items-center text-center" style={{ gap: 10, marginBottom: 40 }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: CORAL }}>Tvoja nadzorna plošča</div>
          <h2 style={{ margin: 0, fontWeight: 800, fontSize: "clamp(28px,3.4vw,42px)", lineHeight: 1.08, letterSpacing: "-0.02em" }}>Vse o tvojih gostih, na enem mestu</h2>
        </div>
        <div style={{ background: INK, borderRadius: 28, padding: "clamp(24px,4vw,40px)", boxShadow: "0 30px 70px rgba(42,36,29,0.28)" }}>
          <div className="flex flex-wrap items-center justify-between" style={{ marginBottom: 20, gap: 12 }}>
            <div style={{ color: "#F8F3EA", fontWeight: 800, fontSize: 22 }}>Pregled · zadnjih 30 dni</div>
            <div style={{ height: 32, padding: "0 14px", borderRadius: 999, background: "rgba(248,243,234,0.1)", color: "#E8C99A", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center" }}>Mora · Ljubljana</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 16 }}>
            {DASH_KPIS.map((k) => (
              <div key={k.l} style={{ background: "rgba(248,243,234,0.06)", border: "1px solid rgba(248,243,234,0.1)", borderRadius: 16, padding: 16 }}><div style={{ fontSize: 12, color: "#B7A488", marginBottom: 4 }}>{k.l}</div><div style={{ fontWeight: 800, fontSize: 26, color: "#F8F3EA" }}>{k.v}</div><div style={{ fontSize: 11.5, color: "#5E9E6E", fontWeight: 700 }}>{k.d}</div></div>
            ))}
          </div>
          <div className="grid gap-4" style={{ gridTemplateColumns: "1.6fr 1fr" }}>
            <div style={{ background: "rgba(248,243,234,0.06)", border: "1px solid rgba(248,243,234,0.1)", borderRadius: 18, padding: 20 }}>
              <div style={{ fontSize: 12.5, color: "#B7A488", fontWeight: 600, marginBottom: 16 }}>Obiski po urah</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 120 }}>
                {HOURS.map(([h, v, lbl], i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, justifyContent: "flex-end", height: "100%" }}><div style={{ width: "100%", height: `${Math.round((v / 46) * 110)}px`, borderRadius: "5px 5px 2px 2px", background: v === 46 ? AMBER : "rgba(226,160,74,0.4)" }} /><div style={{ fontSize: 9, color: "#7C6B55", height: 11 }}>{lbl}</div></div>
                ))}
              </div>
            </div>
            <div style={{ background: "rgba(248,243,234,0.06)", border: "1px solid rgba(248,243,234,0.1)", borderRadius: 18, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 12.5, color: "#B7A488", fontWeight: 600 }}>Zadržanje strank</div>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}><Donut /><div style={{ display: "flex", flexDirection: "column", gap: 10 }}><div><div style={{ fontWeight: 800, fontSize: 20, color: "#5E9E6E" }}>91%</div><div style={{ fontSize: 11, color: "#B7A488" }}>se vrne v 30 dneh</div></div><div><div style={{ fontWeight: 800, fontSize: 20, color: AMBER }}>3,5×</div><div style={{ fontSize: 11, color: "#B7A488" }}>obiskov / gost</div></div></div></div>
            </div>
          </div>
        </div>
      </div>

      {/* CENE */}
      <div id="cene" className="mx-auto" style={{ maxWidth: 1200, padding: "72px 24px 40px" }}>
        <div className="flex flex-col items-center text-center" style={{ gap: 10, marginBottom: 44 }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: CORAL }}>Cene</div>
          <h2 style={{ margin: 0, fontWeight: 800, fontSize: "clamp(30px,3.8vw,46px)", lineHeight: 1.05, letterSpacing: "-0.02em" }}>En paket za vsako fazo</h2>
          <p style={{ margin: 0, fontSize: 17, color: MUTED, maxWidth: 500 }}>Brez provizije na obisk, brez vezave. Začni zastonj, nadgradi, ko raste.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 20, alignItems: "stretch" }}>
          {PLANS.map((p) => (
            <div key={p.name} style={p.featured ? { background: INK, borderRadius: 24, padding: 30, display: "flex", flexDirection: "column", gap: 18, position: "relative", boxShadow: "0 26px 60px rgba(42,36,29,0.3)", transform: "translateY(-8px)" } : { background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 24, padding: 30, display: "flex", flexDirection: "column", gap: 18 }}>
              {p.featured && <div style={{ position: "absolute", top: 22, right: 24, height: 28, padding: "0 12px", borderRadius: 999, background: AMBER, color: INK, fontSize: 11.5, fontWeight: 800, display: "flex", alignItems: "center" }}>Najbolj priljubljeno</div>}
              <div><div style={{ fontWeight: 800, fontSize: 21, color: p.featured ? "#F8F3EA" : INK }}>{p.name}</div><div style={{ fontSize: 14, color: p.featured ? "#B7A488" : "#9A8F80" }}>{p.tag}</div></div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}><span style={{ fontWeight: 800, fontSize: 38, letterSpacing: "-0.02em", color: p.featured ? "#F8F3EA" : INK, whiteSpace: "nowrap" }}>{p.price}</span>{p.per && <span style={{ fontSize: 15, color: p.featured ? "#B7A488" : "#9A8F80" }}>{p.per}</span>}</div>
              <Link href={p.name === "Palača" ? DEMO_DASH : PARTNER} style={p.featured ? { height: 50, borderRadius: 14, background: AMBER, color: INK, fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" } : { height: 50, borderRadius: 14, border: `1.5px solid ${INK}`, color: INK, fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{p.cta}</Link>
              <div className="flex flex-col" style={{ gap: 11, borderTop: p.featured ? "1px solid rgba(248,243,234,0.14)" : "1px solid #F1E8D9", paddingTop: 18 }}>
                {p.feats.map((f) => (
                  <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, color: p.featured ? "#E9E0D2" : "#41382C", lineHeight: 1.4 }}><Check stroke={p.featured ? AMBER : GREEN} size={17} />{f}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 22, fontSize: 14, color: "#9A8F80" }}>Vse cene brez DDV · prekličeš kadarkoli · 14 dni brezplačno na plačljivih paketih</div>
      </div>

      {/* FAQ */}
      <div id="faq" className="mx-auto" style={{ maxWidth: 760, padding: "56px 24px 40px" }}>
        <div className="flex flex-col items-center text-center" style={{ gap: 8, marginBottom: 32 }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: CORAL }}>Pogosta vprašanja</div>
          <h2 style={{ margin: 0, fontWeight: 800, fontSize: "clamp(28px,3.4vw,40px)", letterSpacing: "-0.02em" }}>Še kaj ti ni jasno?</h2>
        </div>
        <div className="flex flex-col" style={{ gap: 12 }}>
          {FAQS.map((q) => (
            <div key={q.q} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 18, padding: "22px 24px", display: "flex", flexDirection: "column", gap: 8 }}><div style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.01em" }}>{q.q}</div><div style={{ fontSize: 15, lineHeight: 1.6, color: MUTED }}>{q.a}</div></div>
          ))}
        </div>
      </div>

      {/* FINAL CTA */}
      <div className="mx-auto" style={{ maxWidth: 1200, padding: "40px 24px 72px" }}>
        <div style={{ background: INK, borderRadius: 32, padding: "clamp(40px,6vw,72px)", display: "flex", flexDirection: "column", alignItems: "center", gap: 22, textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(226,160,74,0.18)" }} />
          <div style={{ position: "absolute", bottom: -70, left: -30, width: 180, height: 180, borderRadius: "50%", background: "rgba(196,98,61,0.2)" }} />
          <div className="relative flex flex-col items-center" style={{ gap: 22 }}>
            <h2 style={{ margin: 0, fontWeight: 800, fontSize: "clamp(30px,4.2vw,52px)", lineHeight: 1.04, letterSpacing: "-0.02em", color: "#F8F3EA", maxWidth: 640 }}>Zvestoba, ocene in marketing — danes</h2>
            <p style={{ margin: 0, fontSize: 17.5, lineHeight: 1.55, color: "rgba(248,243,234,0.8)", maxWidth: 480 }}>Ustvari stran, natisni QR, postavi na mize. Prve žige in ocene lahko zbereš že popoldne.</p>
            <div className="flex flex-wrap justify-center" style={{ gap: 12 }}>
              <Link href={PARTNER} style={{ height: 56, padding: "0 30px", borderRadius: 16, background: AMBER, color: INK, fontSize: 16.5, fontWeight: 800, display: "flex", alignItems: "center", gap: 9 }}>Začni brezplačno<svg width="18" height="18" viewBox="0 0 24 24" style={{ fill: "none", stroke: INK, strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M5 12h14M13 6l6 6-6 6" /></svg></Link>
              <Link href={DEMO_GUEST} style={{ height: 56, padding: "0 26px", borderRadius: 16, border: "1.5px solid rgba(248,243,234,0.3)", color: "#F8F3EA", fontSize: 16.5, fontWeight: 700, display: "flex", alignItems: "center" }}>Poglej demo</Link>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: "1px solid rgba(42,36,29,0.1)", background: "#fff" }}>
        <div className="mx-auto" style={{ maxWidth: 1200, padding: "56px 24px 26px" }}>
          <div className="flex flex-wrap justify-between" style={{ gap: 48 }}>
            <div className="flex flex-col" style={{ maxWidth: 330, gap: 14 }}>
              <Logo />
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: MUTED }}>Zvestoba, Google ocene in direkten marketing — vse na fiskalni račun. Brez aplikacije za gosta, postavljeno v 5 minutah.</p>
            </div>
            <div className="flex flex-wrap" style={{ gap: "clamp(40px,6vw,72px)" }}>
              {[["Produkt", [["Kako deluje", "#kako"], ["Google ocene", "#ocene"], ["Marketing", "#marketing"], ["Cene", "#cene"], ["Demo", DEMO_DASH]]], ["Podjetje", [["Kontakt", "/kontakt"]]], ["Pravno", [["Pogoji uporabe", "/pogoji"], ["Zasebnost", "/zasebnost"], ["Piškotki", "/piskotki"]]]].map(([title, links]) => (
                <div key={title as string} className="flex flex-col" style={{ gap: 13 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#A89B88" }}>{title as string}</span>
                  {(links as [string, string][]).map(([l, href]) => href.startsWith("#") ? <a key={l} href={href} style={{ fontSize: 14, color: MUTED }}>{l}</a> : <Link key={l} href={href} style={{ fontSize: 14, color: MUTED }}>{l}</Link>)}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between" style={{ marginTop: 40, paddingTop: 22, borderTop: "1px solid #F1E8D9", gap: 12 }}>
            <span style={{ fontSize: 13, color: "#A89B88" }}>© 2026 {BRAND} · Vse pravice pridržane</span>
            <span style={{ fontSize: 13, color: "#A89B88", display: "flex", alignItems: "center", gap: 8 }}>Narejeno v Ljubljani<span style={{ width: 4, height: 4, borderRadius: "50%", background: "#CDBFA8" }} />Slovenščina</span>
          </div>
        </div>
      </div>
    </div>
  );
}
