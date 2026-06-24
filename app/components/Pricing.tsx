"use client";

import { useState } from "react";
import Link from "next/link";

const INK = "#2A241D";
const AMBER = "#E2A04A";
const GREEN = "#5E7F52";
const BORDER = "#EFE6D6";
const MUTED = "#6E6253";
const PARTNER = "/partner";
const DEMO_DASH = "/demo/dashboard";
const YEARLY_MONTHS = 10; // letno = mesečna × 10 (2 meseca gratis)

const fmtEur = (n: number) => `${n.toLocaleString("sl-SI", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

function Check({ stroke = GREEN, size = 17 }: { stroke?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 2 }}>
      <path d="M5 12.5l4.2 4.3L19 7" fill="none" stroke={stroke} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Plan = { name: string; tag: string; monthly: number | null; featured: boolean; cta: string; feats: string[] };
// "· kmalu" sufiks = funkcija še ne deluje → prikažemo zatemnjeno z značko "kmalu" (obljubljaj samo kar teče)
const PLANS: Plan[] = [
  { name: "Start", tag: "Vse za en lokal", monthly: 49.99, featured: false, cta: "Začni s Start", feats: ["1 lokal", "Žigi, točke, kuponi", "Google ocene (autopilot)", "Kolo sreče", "E-pošta na segmente (vsi / neaktivni / skoraj polna)", "Osnovna analitika"] },
  { name: "Grow", tag: "Rast & avtomatizacija", monthly: 79.99, featured: true, cta: "Izberi Grow", feats: ["Vse iz Start", "Do 5 lokalov", "Segmentacija strank po meri", "Marketing avtomatizacije", "Napredna analitika + časovni filtri", "Embed widget (kolo na tvoj web)", "SMS · kmalu", "WhatsApp · kmalu", "CSV izvoz · kmalu"] },
  { name: "Scale", tag: "Veriga, po dogovoru", monthly: null, featured: false, cta: "Pogovorimo se", feats: ["Vse iz Grow", "Veriga lokalov, en dashboard", "POS / API integracija", "Zasloni gosta po meri", "Namenski skrbnik"] },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  return (
    <>
      {/* MESEČNO / LETNO toggle */}
      <div className="flex items-center justify-center flex-wrap" style={{ gap: 12, marginBottom: 32 }}>
        <div className="flex" style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 999, padding: 5 }}>
          {([["Mesečno", false], ["Letno", true]] as const).map(([label, y]) => (
            <button key={label} onClick={() => setYearly(y)} style={{ height: 40, padding: "0 24px", border: "none", borderRadius: 999, background: yearly === y ? INK : "transparent", color: yearly === y ? "#F8F3EA" : MUTED, fontFamily: "inherit", fontWeight: 700, fontSize: 14.5, cursor: "pointer", transition: "background 0.15s" }}>{label}</button>
          ))}
        </div>
        <span className="flex items-center" style={{ height: 32, padding: "0 13px", borderRadius: 999, background: "rgba(94,127,82,0.14)", color: GREEN, fontSize: 12.5, fontWeight: 800 }}>2 meseca gratis 🎉</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 20, alignItems: "stretch" }}>
        {PLANS.map((p) => {
          const yr = p.monthly != null ? p.monthly * YEARLY_MONTHS : null;
          return (
            <div key={p.name} style={p.featured ? { background: INK, borderRadius: 24, padding: 30, display: "flex", flexDirection: "column", gap: 18, position: "relative", boxShadow: "0 26px 60px rgba(42,36,29,0.3)", transform: "translateY(-8px)" } : { background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 24, padding: 30, display: "flex", flexDirection: "column", gap: 18 }}>
              {p.featured && <div style={{ position: "absolute", top: 22, right: 24, height: 28, padding: "0 12px", borderRadius: 999, background: AMBER, color: INK, fontSize: 11.5, fontWeight: 800, display: "flex", alignItems: "center" }}>Najbolj priljubljeno</div>}
              <div><div style={{ fontWeight: 800, fontSize: 21, color: p.featured ? "#F8F3EA" : INK }}>{p.name}</div><div style={{ fontSize: 14, color: p.featured ? "#B7A488" : "#9A8F80" }}>{p.tag}</div></div>
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontWeight: 800, fontSize: 38, letterSpacing: "-0.02em", color: p.featured ? "#F8F3EA" : INK, whiteSpace: "nowrap" }}>{p.monthly == null ? "Po dogovoru" : yearly ? fmtEur(yr as number) : fmtEur(p.monthly)}</span>
                  {p.monthly != null && <span style={{ fontSize: 15, color: p.featured ? "#B7A488" : "#9A8F80" }}>{yearly ? "/ leto" : "/ mesec"}</span>}
                </div>
                {p.monthly != null && yearly && <div style={{ fontSize: 12.5, color: p.featured ? "#B7A488" : "#9A8F80", marginTop: 4 }}>2 meseca gratis · {fmtEur((yr as number) / 12)}/mes</div>}
              </div>
              <Link href={p.name === "Palača" ? DEMO_DASH : PARTNER} style={p.featured ? { height: 50, borderRadius: 14, background: AMBER, color: INK, fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" } : { height: 50, borderRadius: 14, border: `1.5px solid ${INK}`, color: INK, fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{p.cta}</Link>
              <div className="flex flex-col" style={{ gap: 11, borderTop: p.featured ? "1px solid rgba(248,243,234,0.14)" : "1px solid #F1E8D9", paddingTop: 18 }}>
                {p.feats.map((f) => {
                  const soon = f.endsWith("· kmalu");
                  const label = soon ? f.replace(" · kmalu", "") : f;
                  return (
                    <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, color: soon ? (p.featured ? "#9A8A72" : "#A89B88") : p.featured ? "#E9E0D2" : "#41382C", lineHeight: 1.4 }}>
                      {soon
                        ? <span style={{ width: 17, height: 17, flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: p.featured ? "#9A8A72" : "#C3B6A2" }}>○</span>
                        : <Check stroke={p.featured ? AMBER : GREEN} size={17} />}
                      <span>{label}{soon && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: p.featured ? AMBER : "#B4781E", border: `1px solid ${p.featured ? "rgba(226,160,74,0.4)" : "#E9D9B8"}`, borderRadius: 6, padding: "1px 5px" }}>kmalu</span>}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
