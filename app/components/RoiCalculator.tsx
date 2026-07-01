"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BRAND } from "@/lib/brand";

// ROI kalkulator (dizajn iz Landing v2) — svetla kartica + primerjava Zdaj vs Z Loyavi.
// Konzervativne, jasno označene predpostavke (ocena, ne obljuba).
const INK = "#2A241D";
const JAK = "var(--font-jakarta), sans-serif";
const ADOPTION = 0.3; // ~30 % gostov se vključi
const EXTRA_VISITS = 0.6; // vključen gost pride ~0,6× več na mesec

const fmt = (n: number) => Math.round(n).toLocaleString("sl-SI");

function Slider({ label, val, unit, min, max, step, on }: { label: string; val: number; unit: string; min: number; max: number; step: number; on: (n: number) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      <div className="flex items-baseline justify-between">
        <span style={{ fontSize: 14.5, fontWeight: 700, color: "#41382C" }}>{label}</span>
        <span style={{ fontWeight: 800, fontSize: 22, color: "#C4623D", letterSpacing: "-0.01em" }}>{val}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={val} onChange={(e) => on(Number(e.target.value))} style={{ width: "100%", height: 6, accentColor: "#E2A04A", cursor: "pointer" }} />
    </div>
  );
}

export default function RoiCalculator() {
  const [perDay, setPerDay] = useState(80);
  const [avgBill, setAvgBill] = useState(4);

  const { joiners, extraVisits, extraRev, nowRev, withRev, nowW } = useMemo(() => {
    const j = Math.round(perDay * 30 * ADOPTION);
    const v = Math.round(j * EXTRA_VISITS);
    const er = v * avgBill;
    const now = perDay * 30 * avgBill;
    const wr = now + er;
    return { joiners: j, extraVisits: v, extraRev: er, nowRev: now, withRev: wr, nowW: wr > 0 ? (now / wr) * 100 : 0 };
  }, [perDay, avgBill]);

  return (
    <div className="mx-auto" style={{ maxWidth: 1160, padding: "44px 24px" }}>
      <div style={{ background: "linear-gradient(140deg,#FFFFFF 0%,#FCF6EB 100%)", border: "1px solid #EFE6D6", borderRadius: 28, padding: "clamp(26px,4vw,44px)", boxShadow: "0 22px 54px rgba(42,36,29,0.08)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -70, right: -50, width: 220, height: 220, borderRadius: "50%", background: "rgba(226,160,74,0.1)" }} />
        <div style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: 44, alignItems: "center" }}>
          {/* kontrole */}
          <div style={{ flex: 1, minWidth: 300, display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#C4623D" }}>Koliko ti prinese</div>
              <h2 className="font-display" style={{ margin: 0, fontWeight: 800, fontSize: "clamp(28px,3.4vw,42px)", lineHeight: 1.06, letterSpacing: "-0.02em", color: INK }}>Izračunaj svoj donos</h2>
              <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: "#6E6253", maxWidth: 400 }}>Premakni drsnika in poglej, koliko dodatnih obiskov in prihodka zvestoba prinese tvojemu lokalu.</p>
            </div>
            <Slider label="Računov na dan" val={perDay} unit="" min={5} max={200} step={5} on={setPerDay} />
            <Slider label="Povprečen račun" val={avgBill} unit=" €" min={3} max={40} step={1} on={setAvgBill} />
            <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "#9A8F80", maxWidth: 430 }}>Ocena ob konzervativni predpostavki: ~30 % gostov se vključi ({fmt(joiners)} gostov/mesec) in vsak pride ~0,6× več. Rezultati so ocena, ne obljuba.</div>
          </div>

          {/* rezultati */}
          <div style={{ flex: 1.05, minWidth: 300, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#FBF7F0", border: "1px solid #F0E7D7", borderRadius: 22, padding: "20px 22px 18px" }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#41382C" }}>Mesečni prihodek</span>
                <div className="flex items-center" style={{ gap: 12 }}>
                  <span className="flex items-center" style={{ gap: 5, fontSize: 11.5, fontWeight: 700, color: "#9A8F80" }}><span style={{ width: 9, height: 9, borderRadius: 3, background: "#D8CBB4" }} />Zdaj</span>
                  <span className="flex items-center" style={{ gap: 5, fontSize: 11.5, fontWeight: 700, color: "#B4781E" }}><span style={{ width: 9, height: 9, borderRadius: 3, background: "#E2A04A" }} />Z {BRAND}</span>
                </div>
              </div>
              {[{ k: "Zdaj", v: nowRev, c: "#D8CBB4", w: nowW }, { k: `Z ${BRAND}`, v: withRev, c: "#E2A04A", w: 100 }].map((b) => (
                <div key={b.k} style={{ marginTop: 10 }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 5 }}>
                    <span style={{ fontSize: 12.5, color: "#6E6253", fontWeight: 600 }}>{b.k}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: INK }}>{fmt(b.v)} €</span>
                  </div>
                  <div style={{ height: 12, borderRadius: 999, background: "#EDE3D2", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${b.w}%`, borderRadius: 999, background: b.c, transition: "width .35s ease" }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: "#FFFFFF", border: "1px solid #EFE6D6", borderRadius: 16, padding: "16px 18px" }}>
                <div style={{ fontSize: 12.5, color: "#6E6253", marginBottom: 4 }}>Dodatni obiski / mesec</div>
                <div className="font-display" style={{ fontWeight: 800, fontSize: 30, letterSpacing: "-0.02em", color: "#4E8A5F", lineHeight: 1 }}>+{fmt(extraVisits)}</div>
              </div>
              <div style={{ background: "#FCEFD8", border: "1px solid #F3DFBB", borderRadius: 16, padding: "16px 18px" }}>
                <div style={{ fontSize: 12.5, color: "#B4862F", marginBottom: 4 }}>Dodaten prihodek / mesec</div>
                <div className="font-display" style={{ fontWeight: 800, fontSize: 30, letterSpacing: "-0.02em", color: "#B4781E", lineHeight: 1, whiteSpace: "nowrap" }}>+{fmt(extraRev)} €</div>
              </div>
            </div>
            <Link href="/partner" style={{ height: 54, borderRadius: 16, background: INK, color: "#FBF3E6", fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 9, textDecoration: "none", fontFamily: JAK }}>
              Začni brezplačno
              <svg width="18" height="18" viewBox="0 0 24 24" style={{ fill: "none", stroke: "#FBF3E6", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
