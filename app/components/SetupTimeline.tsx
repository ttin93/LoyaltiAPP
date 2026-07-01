// "Postavljeno v 5 min" — vidna časovnica korak-za-korakom. Server komponenta.
const INK = "#2A241D";
const CORAL = "#C4623D";
const AMBER = "#E2A04A";
const GREEN = "#5E7F52";
const MUTED = "#6E6253";
const BORDER = "#EFE6D6";

const STEPS: { t: string; s: string; c: string }[] = [
  { t: "Ime & barva", s: "~1 min", c: CORAL },
  { t: "Nastavi nagrado", s: "~1 min", c: AMBER },
  { t: "Aktiviraj davčno", s: "~2 min", c: GREEN },
  { t: "Natisni QR", s: "~1 min", c: INK },
];

export default function SetupTimeline() {
  return (
    <div className="mx-auto" style={{ maxWidth: 1100, padding: "8px 24px 8px" }}>
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 24, padding: "clamp(22px,3vw,32px)", boxShadow: "0 12px 34px rgba(42,36,29,0.06)" }}>
        <div className="flex flex-wrap items-center justify-between" style={{ gap: 12, marginBottom: 22 }}>
          <div style={{ fontWeight: 800, fontSize: "clamp(19px,2.2vw,24px)", letterSpacing: "-0.01em", color: INK }}>V 5 minutah do prve kartice zvestobe</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 34, padding: "0 15px", borderRadius: 999, background: "#FCEFD8", color: "#B4781E", fontSize: 13.5, fontWeight: 800 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" style={{ fill: "none", stroke: "#B4781E", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" }}><circle cx="12" cy="12" r="8.5" /><path d="M12 8v4.4l2.8 2" /></svg>
            ≈ 5 minut skupaj
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
          {STEPS.map((s, i) => (
            <div key={s.t} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="flex items-center" style={{ gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 11, background: `${s.c}18`, color: s.c, fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
                <div style={{ flex: 1, height: 2, background: i < STEPS.length - 1 ? BORDER : "transparent", borderRadius: 2 }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: INK }}>{s.t}</div>
                <div style={{ fontSize: 12.5, color: MUTED, marginTop: 2 }}>{s.s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
