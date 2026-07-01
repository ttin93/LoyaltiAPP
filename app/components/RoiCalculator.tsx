"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

// ROI kalkulator — konzervativna ocena (jasno označena kot ocena, ne obljuba).
const INK = "#2A241D";
const AMBER = "#E2A04A";
const LIGHT_GREEN = "#9DBE8E";
const JAK = "var(--font-jakarta), sans-serif";

// Konzervativne predpostavke (prikazane uporabniku):
const ADOPTION = 0.3; // ~30 % gostov se vključi in skenira
const EXTRA_VISITS_PER_MEMBER = 0.6; // vključen gost pride ~0,6× več na mesec

export default function RoiCalculator() {
  const [daily, setDaily] = useState(80); // računov na dan
  const [spend, setSpend] = useState(4); // povprečen račun €

  const { extraVisits, extraRevenue, members } = useMemo(() => {
    const monthlyGuests = daily * 30;
    const m = Math.round(monthlyGuests * ADOPTION);
    const v = Math.round(m * EXTRA_VISITS_PER_MEMBER);
    return { members: m, extraVisits: v, extraRevenue: Math.round(v * spend) };
  }, [daily, spend]);

  const fmt = (n: number) => n.toLocaleString("sl-SI");

  return (
    <div className="mx-auto" style={{ maxWidth: 1200, padding: "40px 24px" }}>
      <div style={{ background: INK, borderRadius: 28, padding: "clamp(28px,4vw,48px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 40, alignItems: "center" }}>
        {/* vnos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: AMBER }}>Koliko ti prinese</div>
          <h2 className="font-display" style={{ margin: 0, fontWeight: 800, fontSize: "clamp(26px,3.2vw,38px)", lineHeight: 1.1, letterSpacing: "-0.02em", color: "#F8F3EA" }}>Izračunaj svoj donos</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="flex items-center justify-between" style={{ color: "rgba(248,243,234,0.8)", fontSize: 14.5, fontWeight: 600 }}>
              <span>Računov na dan</span><span style={{ color: "#F8F3EA", fontWeight: 800 }}>{daily}</span>
            </div>
            <input type="range" min={20} max={400} step={5} value={daily} onChange={(e) => setDaily(Number(e.target.value))} style={{ width: "100%", accentColor: AMBER }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="flex items-center justify-between" style={{ color: "rgba(248,243,234,0.8)", fontSize: 14.5, fontWeight: 600 }}>
              <span>Povprečen račun</span><span style={{ color: "#F8F3EA", fontWeight: 800 }}>{spend} €</span>
            </div>
            <input type="range" min={2} max={30} step={1} value={spend} onChange={(e) => setSpend(Number(e.target.value))} style={{ width: "100%", accentColor: AMBER }} />
          </div>

          <p style={{ margin: "4px 0 0", fontSize: 12.5, lineHeight: 1.5, color: "rgba(248,243,234,0.5)" }}>
            Ocena ob konzervativni predpostavki: ~30 % gostov se vključi ({fmt(members)} gostov/mesec) in vsak pride ~0,6× več. Rezultati so ocena, ne obljuba.
          </p>
        </div>

        {/* rezultat */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "rgba(251,247,240,0.06)", border: "1px solid rgba(248,243,234,0.14)", borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 13.5, color: "rgba(248,243,234,0.7)" }}>Dodatni obiski / mesec</span>
            <span className="font-display" style={{ fontWeight: 800, fontSize: 44, letterSpacing: "-0.02em", color: LIGHT_GREEN }}>+{fmt(extraVisits)}</span>
          </div>
          <div style={{ background: AMBER, borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 13.5, color: "rgba(42,36,29,0.7)", fontWeight: 600 }}>Ocenjen dodaten prihodek / mesec</span>
            <span className="font-display" style={{ fontWeight: 800, fontSize: 44, letterSpacing: "-0.02em", color: INK }}>+{fmt(extraRevenue)} €</span>
          </div>
          <Link href="/partner" style={{ marginTop: 4, height: 52, borderRadius: 14, background: "#FBF3E6", color: INK, fontSize: 15.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none", fontFamily: JAK }}>
            Začni brezplačno
            <svg width="17" height="17" viewBox="0 0 24 24" style={{ fill: "none", stroke: INK, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
