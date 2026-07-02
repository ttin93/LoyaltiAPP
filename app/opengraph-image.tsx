import { ImageResponse } from "next/og";

// OG slika za deljenje linka (WhatsApp/FB/LinkedIn preview). Brand: Loyavi.
export const runtime = "edge";
export const alt = "Loyavi — kartica zvestobe za lokale";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#2A241D";
const PAPER = "#FBF3E6";
const CREAM = "#FBF7F0";
const AMBER = "#E2A04A";
const CORAL = "#C4623D";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: CREAM, padding: 64, fontFamily: "sans-serif" }}>
        <div style={{ flex: 1.2, display: "flex", flexDirection: "column", justifyContent: "center", gap: 28 }}>
          {/* logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 76, height: 76, borderRadius: 22, background: INK, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={PAPER} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 9h10v5.5A4.5 4.5 0 0 1 10.5 19h-1A4.5 4.5 0 0 1 5 14.5V9Z" />
                <path d="M15 10.5h1.6a2.4 2.4 0 0 1 0 4.8H15" />
              </svg>
            </div>
            <div style={{ fontSize: 52, fontWeight: 800, color: INK, letterSpacing: "-1px" }}>Loyavi</div>
          </div>
          <div style={{ fontSize: 64, fontWeight: 800, color: INK, lineHeight: 1.05, letterSpacing: "-2px", display: "flex", flexDirection: "column" }}>
            <span>Stalni gosti se ne</span>
            <span style={{ display: "flex" }}>zgodijo. <span style={{ color: CORAL, marginLeft: 16 }}>Zgradiš jih.</span></span>
          </div>
          <div style={{ fontSize: 28, color: "#6E6253", display: "flex" }}>Žigi, Google ocene in marketing — na fiskalni račun.</div>
        </div>
        {/* kartica */}
        <div style={{ flex: 0.9, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 380, background: "#fff", borderRadius: 32, padding: 34, display: "flex", flexDirection: "column", gap: 22, transform: "rotate(-3deg)", boxShadow: "0 40px 80px rgba(42,36,29,0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 54, height: 54, borderRadius: 16, background: INK, color: PAPER, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800 }}>L</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: INK }}>Kavarna Lipa</div>
                <div style={{ fontSize: 14, color: "#9A8F80" }}>kartica zvestobe</div>
              </div>
              <div style={{ marginLeft: "auto", fontSize: 34, fontWeight: 800, color: INK }}>7<span style={{ fontSize: 18, color: "#9A8F80" }}>/10</span></div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {[1, 1, 1, 1, 1, 1, 1, 0, 0, 0].map((f, i) => (
                <div key={i} style={{ width: 52, height: 52, borderRadius: 26, border: f ? `3px solid ${CORAL}` : "3px solid #EFE4D2", background: f ? "rgba(196,98,61,0.09)" : "#FBF7F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={f ? CORAL : "#CFC2AC"} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 9h10v5.5A4.5 4.5 0 0 1 10.5 19h-1A4.5 4.5 0 0 1 5 14.5V9Z" />
                    <path d="M15 10.5h1.6a2.4 2.4 0 0 1 0 4.8H15" />
                  </svg>
                </div>
              ))}
            </div>
            <div style={{ background: "#FCEFD8", borderRadius: 16, padding: "14px 18px", fontSize: 17, color: "#8A5B14", fontWeight: 700, display: "flex" }}>Še 3 obiski do brezplačne kave ☕</div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
