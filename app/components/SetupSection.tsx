"use client";

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";

// Postavitev (dizajn iz Landing v2) — animiran timeline + "kartica v živo".
// Scroll-reveal prek IntersectionObserver (staggered po indeksu).
const INK = "#2A241D";
const CORAL = "#C4623D";
const AMBER = "#E2A04A";
const GREEN = "#5E7F52";
const MUTED = "#6E6253";

type Step = { n: string; t: string; time: string; d: string; bg: string; stroke: string; icon: ReactNode };
const STEPS: Step[] = [
  { n: "01", t: "Ime & barva", time: "~1 min", d: "Vpiši ime lokala, naloži logo in izberi barvo znamke.", bg: "#F6E4DA", stroke: CORAL, icon: <path d="M12 4c3 4 5 6.2 5 9a5 5 0 0 1-10 0c0-2.8 2-5 5-9z" /> },
  { n: "02", t: "Nastavi nagrado", time: "~1 min", d: "Določi, koliko žigov pomeni nagrado in kaj gost dobi.", bg: "#FBEBD2", stroke: "#B4781E", icon: <><rect x="4.5" y="9" width="15" height="10.5" rx="1.6" /><path d="M4.5 12.5h15M12 9v10.5" /><path d="M12 9C10.6 5.2 6.8 6.2 8.2 8.6c.7 1.2 3.8.4 3.8.4z" /></> },
  { n: "03", t: "Aktiviraj davčno", time: "~2 min", d: "Fotografiraj vzorčni račun — sistem prebere tvojo davčno.", bg: "#E4EBDF", stroke: GREEN, icon: <><path d="M12 3.5l6.5 2.5v5c0 4.3-2.8 7.4-6.5 9-3.7-1.6-6.5-4.7-6.5-9v-5z" /><path d="M9.3 12l2 2 3.4-3.6" /></> },
  { n: "04", t: "Natisni QR", time: "~1 min", d: "Natisni QR in ga postavi na mize. Prve žige podariš že danes.", bg: INK, stroke: "#FBF3E6", icon: <><rect x="4" y="4" width="6" height="6" rx="1.3" /><rect x="14" y="4" width="6" height="6" rx="1.3" /><rect x="4" y="14" width="6" height="6" rx="1.3" /><path d="M14 14h2.5M14 17.5h2.5M18.5 14v2.5M17 20h3M20 17.5V20" /></> },
];

export default function SetupSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { setOn(true); io.disconnect(); }
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const ease = "cubic-bezier(.34,1.56,.64,1)";

  return (
    <div ref={ref} className="mx-auto" style={{ maxWidth: 1120, padding: "64px 24px 48px" }}>
      <div className="flex flex-col items-center text-center" style={{ gap: 14, marginBottom: 44 }}>
        <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: CORAL }}>Postavitev</div>
        <h2 className="font-display" style={{ margin: 0, fontWeight: 800, fontSize: "clamp(28px,3.6vw,44px)", lineHeight: 1.08, letterSpacing: "-0.02em", color: INK }}>V 5 minutah do prve kartice zvestobe</h2>
        <div className="inline-flex items-center" style={{ gap: 7, height: 34, padding: "0 15px", borderRadius: 999, background: "#FCEFD8", color: "#B4781E", fontSize: 13, fontWeight: 800 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" style={{ fill: "none", stroke: "#B4781E", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }}><circle cx="12" cy="12" r="8.5" /><path d="M12 8v4.4l2.8 2" /></svg>
          ≈ 5 minut skupaj
        </div>
      </div>

      <div className="flex flex-wrap items-start justify-center" style={{ gap: 52 }}>
        {/* KORAKI */}
        <div style={{ flex: 1.15, minWidth: 320, maxWidth: 540, position: "relative" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {STEPS.map((s, i) => {
              const last = i === STEPS.length - 1;
              const delay = i * 0.14;
              return (
                <div key={s.n} style={{ position: "relative", display: "flex", gap: 20, alignItems: "flex-start", paddingBottom: last ? 0 : 22 }}>
                  {!last && (
                    <div style={{ position: "absolute", top: 27, bottom: -27, left: 25, width: 3, background: "#EFE4D2", borderRadius: 3, overflow: "hidden", zIndex: 0 }}>
                      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: on ? "100%" : 0, background: "linear-gradient(180deg,#E2A04A,#C4623D)", transition: `height .55s cubic-bezier(.4,0,.2,1) ${delay}s` }} />
                    </div>
                  )}
                  <div style={{ position: "relative", zIndex: 2, width: 54, height: 54, flexShrink: 0, borderRadius: 17, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 16px rgba(42,36,29,0.1)", opacity: on ? 1 : 0, transform: on ? "scale(1)" : "scale(0.5)", transition: `opacity .5s ease ${delay}s, transform .55s ${ease} ${delay}s` }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" style={{ fill: "none", stroke: s.stroke, strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" }}>{s.icon}</svg>
                  </div>
                  <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "#fff", border: "1px solid #EFE6D6", borderRadius: 18, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 5, boxShadow: "0 10px 24px rgba(42,36,29,0.06)", opacity: on ? 1 : 0, transform: on ? "translateX(0)" : "translateX(-16px)", transition: `opacity .55s ease ${delay + 0.05}s, transform .55s ease ${delay + 0.05}s` }}>
                    <span style={{ position: "absolute", top: 8, right: 16, fontWeight: 800, fontSize: 34, color: "#F1E7D6", letterSpacing: "-0.02em" }}>{s.n}</span>
                    <div className="flex items-center" style={{ gap: 10, position: "relative" }}>
                      <span style={{ fontWeight: 800, fontSize: 17.5, letterSpacing: "-0.01em", color: INK }}>{s.t}</span>
                      <span className="inline-flex items-center" style={{ height: 22, padding: "0 9px", borderRadius: 999, background: "#FBF7F0", color: "#9A8F80", fontSize: 11.5, fontWeight: 700 }}>{s.time}</span>
                    </div>
                    <span style={{ fontSize: 14, lineHeight: 1.5, color: MUTED, position: "relative" }}>{s.d}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* KARTICA V ŽIVO */}
        <div style={{ flex: 0.85, minWidth: 280, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, paddingTop: 6 }}>
          <div style={{ width: 300, background: "#fff", borderRadius: 26, padding: 24, boxShadow: "0 30px 70px rgba(42,36,29,0.16),0 4px 14px rgba(42,36,29,0.06)", transform: "rotate(-2deg)" }}>
            {[0, 1, 2, 3].map((j) => {
              const st: CSSProperties = { opacity: on ? 1 : 0, transform: on ? "translateY(0)" : "translateY(12px)", transition: `opacity .55s ease ${0.35 + j * 0.14}s, transform .55s ease ${0.35 + j * 0.14}s`, marginTop: j === 0 ? 0 : j === 1 ? 16 : j === 2 ? 12 : 16 };
              if (j === 0) return (
                <div key={j} style={st}>
                  <div className="flex items-center" style={{ gap: 11 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 13, background: INK, color: "#FBF3E6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 19 }}>L</div>
                    <div className="flex flex-col" style={{ lineHeight: 1.2 }}><span style={{ fontWeight: 800, fontSize: 16 }}>Kavarna Lipa</span><span style={{ fontSize: 11.5, color: "#9A8F80" }}>kartica zvestobe</span></div>
                  </div>
                  <div className="flex items-center" style={{ gap: 8, marginTop: 14 }}>
                    <span style={{ fontSize: 12, color: "#9A8F80", fontWeight: 600 }}>Barva:</span>
                    <span style={{ width: 22, height: 22, borderRadius: 7, background: AMBER, boxShadow: `0 0 0 2px #fff,0 0 0 4px ${AMBER}` }} />
                    <span style={{ width: 22, height: 22, borderRadius: 7, background: CORAL }} />
                    <span style={{ width: 22, height: 22, borderRadius: 7, background: GREEN }} />
                  </div>
                </div>
              );
              if (j === 1) return (
                <div key={j} style={st}>
                  <div className="flex items-center" style={{ gap: 11, background: "#FCEFD8", borderRadius: 14, padding: "12px 14px" }}>
                    <div className="flex items-center justify-center" style={{ width: 34, height: 34, borderRadius: 10, background: "#fff", flexShrink: 0 }}><svg width="18" height="18" viewBox="0 0 24 24" style={{ fill: "none", stroke: AMBER, strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" }}><rect x="4.5" y="9" width="15" height="10.5" rx="1.6" /><path d="M4.5 12.5h15M12 9v10.5" /><path d="M12 9C10.6 5.2 6.8 6.2 8.2 8.6c.7 1.2 3.8.4 3.8.4z" /></svg></div>
                    <div style={{ lineHeight: 1.25 }}><div style={{ fontWeight: 800, fontSize: 13.5, color: INK }}>10 žigov = brezplačna kava</div><div style={{ fontSize: 11.5, color: "#B4862F", fontWeight: 600 }}>tvoja nagrada</div></div>
                  </div>
                </div>
              );
              if (j === 2) return (
                <div key={j} style={st}>
                  <div className="inline-flex items-center" style={{ gap: 8, background: "rgba(94,127,82,0.12)", borderRadius: 999, padding: "8px 14px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" style={{ fill: "none", stroke: GREEN, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M12 3.5l6.5 2.5v5c0 4.3-2.8 7.4-6.5 9-3.7-1.6-6.5-4.7-6.5-9v-5z" /><path d="M9.3 12l2 2 3.4-3.6" /></svg>
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: "#3F5C37" }}>Davčna preverjena</span>
                  </div>
                </div>
              );
              return (
                <div key={j} style={st}>
                  <div className="flex items-center" style={{ gap: 14, background: "#FBF7F0", borderRadius: 16, padding: 14 }}>
                    <svg width="70" height="70" viewBox="0 0 88 88" style={{ display: "block", flexShrink: 0 }}>
                      <rect x="6" y="6" width="22" height="22" rx="3" style={{ fill: "none", stroke: INK, strokeWidth: 4 }} /><rect x="14" y="14" width="6" height="6" style={{ fill: INK }} />
                      <rect x="60" y="6" width="22" height="22" rx="3" style={{ fill: "none", stroke: INK, strokeWidth: 4 }} /><rect x="68" y="14" width="6" height="6" style={{ fill: INK }} />
                      <rect x="6" y="60" width="22" height="22" rx="3" style={{ fill: "none", stroke: INK, strokeWidth: 4 }} /><rect x="14" y="68" width="6" height="6" style={{ fill: INK }} />
                      <g style={{ fill: INK }}><rect x="38" y="6" width="6" height="6" /><rect x="46" y="14" width="6" height="6" /><rect x="38" y="22" width="6" height="6" /><rect x="38" y="38" width="6" height="6" /><rect x="46" y="46" width="6" height="6" /><rect x="60" y="38" width="6" height="6" /><rect x="70" y="38" width="6" height="6" /><rect x="60" y="52" width="6" height="6" /><rect x="70" y="60" width="6" height="6" /><rect x="60" y="70" width="6" height="6" /><rect x="70" y="76" width="6" height="6" /><rect x="38" y="60" width="6" height="6" /><rect x="46" y="68" width="6" height="6" /><rect x="14" y="46" width="6" height="6" /></g>
                    </svg>
                    <div style={{ lineHeight: 1.3 }}><div style={{ fontWeight: 800, fontSize: 13.5, color: INK }}>Skeniraj QR z računa</div><div style={{ fontSize: 11.5, color: "#9A8F80" }}>in žig je tvoj</div></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="inline-flex items-center" style={{ gap: 7, fontSize: 12.5, color: "#9A8F80", fontWeight: 600 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: GREEN }} />Tvoja kartica — sestavljena v živo</div>
        </div>
      </div>
    </div>
  );
}
