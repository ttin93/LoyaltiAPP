"use client";

import { useEffect, useRef, useState } from "react";

// QR editor: oblike pik, barve, logo v sredini — v živo. Uporablja qr-code-styling.
// Berljivost: vedno H korekcija; opozorilo ob nizkem kontrastu.
const INK = "#2A241D";
type Dot = "rounded" | "square" | "dots" | "classy" | "extra-rounded";
type QRInst = InstanceType<(typeof import("qr-code-styling"))["default"]>;

const SHAPES: { key: Dot; label: string }[] = [
  { key: "rounded", label: "Zaobljeno" },
  { key: "square", label: "Klasično" },
  { key: "dots", label: "Pike" },
  { key: "classy", label: "Elegantno" },
  { key: "extra-rounded", label: "Mehko" },
];

function lum(hex: string): number {
  const h = (hex || "").replace("#", "");
  if (h.length < 6) return 1;
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export default function QrEditor({ path, accent, venueName, brandColor, logoUrl, reward }: {
  path: string; accent: string; venueName?: string; brandColor?: string; logoUrl?: string | null; reward?: string | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRInst | null>(null);
  const [full, setFull] = useState("");
  const [dot, setDot] = useState<Dot>("rounded");
  const [color, setColor] = useState(INK);
  const [bg, setBg] = useState("#ffffff");
  const [useLogo, setUseLogo] = useState(!!logoUrl);
  const [copied, setCopied] = useState(false);

  useEffect(() => { setFull(`${window.location.origin}${path}`); }, [path]);

  useEffect(() => {
    if (!full) return;
    let cancelled = false;
    (async () => {
      const QRCodeStyling = (await import("qr-code-styling")).default;
      if (cancelled || !ref.current) return;
      const qr = new QRCodeStyling({
        width: 240, height: 240, type: "canvas", data: full,
        qrOptions: { errorCorrectionLevel: "H" },
        dotsOptions: { type: dot, color },
        cornersSquareOptions: { type: dot === "dots" || dot === "classy" ? "dot" : "extra-rounded", color },
        cornersDotOptions: { color },
        backgroundOptions: { color: bg },
        image: useLogo && logoUrl ? logoUrl : undefined,
        imageOptions: { crossOrigin: "anonymous", margin: 6, imageSize: 0.34, hideBackgroundDots: true },
      });
      qrRef.current = qr;
      ref.current.innerHTML = "";
      qr.append(ref.current);
    })();
    return () => { cancelled = true; };
  }, [full, dot, color, bg, useLogo, logoUrl]);

  function preset(d: Dot, c: string) { setDot(d); setColor(c); }

  function downloadPng() {
    qrRef.current?.download({ name: `${(venueName || "loyavi").toLowerCase().replace(/\s+/g, "-")}-qr`, extension: "png" });
  }

  async function downloadPoster() {
    const qc = ref.current?.querySelector("canvas") as HTMLCanvasElement | null;
    if (!qc) return;
    try { await (document as unknown as { fonts?: { ready?: Promise<unknown> } }).fonts?.ready; } catch { /* ignore */ }
    const W = 760, H = 1040, cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const brand = brandColor || accent || INK, F = "'Plus Jakarta Sans',system-ui,sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#FBF7F0"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = brand; ctx.fillRect(0, 0, W, 156);
    ctx.fillStyle = lum(brand) > 0.62 ? INK : "#FBF3E6";
    ctx.font = `800 46px ${F}`; ctx.fillText(venueName || "Loyavi", W / 2, 90);
    ctx.font = `600 22px ${F}`; ctx.fillText("Kartica zvestobe", W / 2, 128);
    const qs = 470, qx = (W - qs) / 2, qy = 218;
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.roundRect(qx - 32, qy - 32, qs + 64, qs + 64, 30); ctx.fill();
    ctx.drawImage(qc, qx, qy, qs, qs);
    ctx.fillStyle = INK; ctx.font = `800 40px ${F}`; ctx.fillText("Skeniraj za žig ☕", W / 2, qy + qs + 118);
    ctx.fillStyle = "#6E6253"; ctx.font = `500 25px ${F}`;
    ctx.fillText(reward ? `Zbiraj žige → ${reward}` : "Zbiraj žige in prejmi nagrado", W / 2, qy + qs + 160);
    ctx.fillStyle = "#B5AB9C"; ctx.font = `600 18px ${F}`; ctx.fillText("Brez aplikacije · powered by Loyavi", W / 2, H - 42);
    const a = document.createElement("a");
    a.href = cv.toDataURL("image/png"); a.download = `${(venueName || "loyavi").toLowerCase().replace(/\s+/g, "-")}-plakat.png`; a.click();
  }

  const lowContrast = Math.abs(lum(color) - lum(bg)) < 0.4;
  const swatch = { width: 30, height: 30, borderRadius: 8, border: "1px solid #E0D2BC", cursor: "pointer", padding: 0, background: "none" } as const;
  const brandDark = lum(brandColor || "") <= 0.62 ? (brandColor || INK) : INK;

  return (
    <div className="flex flex-col items-center" style={{ gap: 16 }}>
      <div ref={ref} style={{ width: 240, height: 240, borderRadius: 16, overflow: "hidden", border: "1px solid #EFE6D6" }} />

      {/* oblike */}
      <div className="flex flex-wrap justify-center" style={{ gap: 7 }}>
        {SHAPES.map((s) => (
          <button key={s.key} onClick={() => setDot(s.key)} style={{ height: 34, padding: "0 13px", borderRadius: 10, border: `1.5px solid ${dot === s.key ? INK : "#E4D9C7"}`, background: dot === s.key ? INK : "#fff", color: dot === s.key ? "#FBF3E6" : INK, fontFamily: "var(--font-jakarta), sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{s.label}</button>
        ))}
      </div>

      {/* barve + logo */}
      <div className="flex flex-wrap items-center justify-center" style={{ gap: 16 }}>
        <label className="flex items-center" style={{ gap: 8, fontSize: 13, color: "#6E6253", fontWeight: 600 }}>Barva<input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={swatch} /></label>
        <label className="flex items-center" style={{ gap: 8, fontSize: 13, color: "#6E6253", fontWeight: 600 }}>Ozadje<input type="color" value={bg} onChange={(e) => setBg(e.target.value)} style={swatch} /></label>
        {logoUrl && <label className="flex items-center" style={{ gap: 7, fontSize: 13, color: "#6E6253", fontWeight: 600, cursor: "pointer" }}><input type="checkbox" checked={useLogo} onChange={(e) => setUseLogo(e.target.checked)} />Logo v sredini</label>}
      </div>

      {/* hitre barve */}
      <div className="flex flex-wrap items-center justify-center" style={{ gap: 7 }}>
        <span style={{ fontSize: 12, color: "#9A8F80" }}>Hitro:</span>
        {[["Klasična", "square", INK], ["Zaobljena", "rounded", INK], ["Brand", "rounded", brandDark]].map(([lbl, d, c]) => (
          <button key={lbl as string} onClick={() => preset(d as Dot, c as string)} style={{ height: 30, padding: "0 11px", borderRadius: 999, border: "1px solid #E4D9C7", background: "#fff", color: INK, fontFamily: "var(--font-jakarta), sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{lbl}</button>
        ))}
      </div>

      {lowContrast && <div style={{ fontSize: 12, color: "#9B3F1E", background: "rgba(196,98,61,0.1)", borderRadius: 10, padding: "8px 12px", textAlign: "center", lineHeight: 1.4 }}>⚠ Nizek kontrast — QR morda ne bo berljiv. Izberi temnejšo barvo na svetlem ozadju.</div>}

      <div className="flex flex-wrap justify-center" style={{ gap: 8 }}>
        <button onClick={downloadPng} className="rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: accent }}>Prenesi PNG</button>
        <button onClick={downloadPoster} className="rounded-lg border px-4 py-2 text-sm font-semibold" style={{ borderColor: accent, color: accent }}>Prenesi plakat</button>
        <button onClick={() => { navigator.clipboard?.writeText(full); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium">{copied ? "Kopirano ✓" : "Kopiraj povezavo"}</button>
      </div>
      <p className="break-all text-center text-xs text-neutral-400">{full}</p>
    </div>
  );
}
