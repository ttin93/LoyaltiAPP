"use client";

import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";

const INK = "#2A241D";

// svetla barva → temno besedilo (za berljivost na brand headerju)
function isLight(hex: string): boolean {
  const h = (hex || "").replace("#", "");
  if (h.length < 6) return false;
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 165;
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // brez CORS se load ponesreči (namesto taintanja) → QR ostane čist
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

export default function QrCode({ path, accent, venueName, brandColor, logoUrl, reward }: {
  path: string; accent: string; venueName?: string; brandColor?: string; logoUrl?: string | null; reward?: string | null;
}) {
  const [dataUrl, setDataUrl] = useState("");
  const [fullUrl, setFullUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  // QR v temni (INK, zanesljivo berljiv) + logo lokala v sredini (H korekcija dopušča prekritje)
  const genQR = useCallback(async (url: string, size: number): Promise<HTMLCanvasElement> => {
    const c = document.createElement("canvas");
    await QRCode.toCanvas(c, url, { width: size, margin: 1, errorCorrectionLevel: "H", color: { dark: INK, light: "#ffffff" } });
    if (logoUrl) {
      try {
        const img = await loadImg(logoUrl);
        const ctx = c.getContext("2d");
        if (ctx) {
          const box = Math.round(size * 0.22), x = (size - box) / 2, y = (size - box) / 2, pad = Math.round(box * 0.14);
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.roundRect(x - pad, y - pad, box + pad * 2, box + pad * 2, 12);
          ctx.fill();
          ctx.drawImage(img, x, y, box, box);
        }
      } catch { /* logo nedostopen → čist QR */ }
    }
    return c;
  }, [logoUrl]);

  useEffect(() => {
    const url = `${window.location.origin}${path}`;
    setFullUrl(url);
    genQR(url, 512).then((c) => setDataUrl(c.toDataURL("image/png"))).catch(() => {});
  }, [path, genQR]);

  function download(name: string, url: string) {
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
  }

  // Brandiran plakat za mizo (PNG): brand header + QR z logom + poziv + nagrada
  async function downloadPoster() {
    setBusy(true);
    try {
      try { await (document as unknown as { fonts?: { ready?: Promise<unknown> } }).fonts?.ready; } catch { /* ignore */ }
      const url = `${window.location.origin}${path}`;
      const qr = await genQR(url, 520);
      const W = 760, H = 1040, cv = document.createElement("canvas");
      cv.width = W; cv.height = H;
      const ctx = cv.getContext("2d");
      if (!ctx) return;
      const brand = brandColor || accent || INK;
      const F = "'Plus Jakarta Sans',system-ui,sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "#FBF7F0"; ctx.fillRect(0, 0, W, H);
      // header
      const headH = 156;
      ctx.fillStyle = brand; ctx.fillRect(0, 0, W, headH);
      ctx.fillStyle = isLight(brand) ? INK : "#FBF3E6";
      ctx.font = `800 46px ${F}`; ctx.fillText(venueName || "Loyavi", W / 2, 90);
      ctx.font = `600 22px ${F}`; ctx.fillText("Kartica zvestobe", W / 2, 128);
      // QR bela kartica
      const qs = 470, qx = (W - qs) / 2, qy = 218;
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.roundRect(qx - 32, qy - 32, qs + 64, qs + 64, 30); ctx.fill();
      ctx.drawImage(qr, qx, qy, qs, qs);
      // poziv
      ctx.fillStyle = INK; ctx.font = `800 40px ${F}`; ctx.fillText("Skeniraj za žig ☕", W / 2, qy + qs + 118);
      ctx.fillStyle = "#6E6253"; ctx.font = `500 25px ${F}`;
      ctx.fillText(reward ? `Zbiraj žige → ${reward}` : "Zbiraj žige in prejmi nagrado", W / 2, qy + qs + 160);
      // footer
      ctx.fillStyle = "#B5AB9C"; ctx.font = `600 18px ${F}`;
      ctx.fillText("Brez aplikacije · powered by Loyavi", W / 2, H - 42);
      download(`${(venueName || "loyavi").toLowerCase().replace(/\s+/g, "-")}-plakat.png`, cv.toDataURL("image/png"));
    } catch { /* ignore */ } finally { setBusy(false); }
  }

  return (
    <div className="flex flex-col items-center">
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={dataUrl} alt="QR koda" className="h-48 w-48 rounded-xl border border-neutral-200" />
      ) : (
        <div className="h-48 w-48 animate-pulse rounded-xl bg-neutral-100" />
      )}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <a href={dataUrl || "#"} download="loyavi-qr.png" className="rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: accent }}>Prenesi PNG</a>
        <button onClick={downloadPoster} disabled={busy} className="rounded-lg border px-4 py-2 text-sm font-semibold" style={{ borderColor: accent, color: accent }}>{busy ? "…" : "Prenesi plakat"}</button>
        <button
          onClick={() => { navigator.clipboard?.writeText(fullUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium"
        >
          {copied ? "Kopirano ✓" : "Kopiraj povezavo"}
        </button>
      </div>
      <p className="mt-3 break-all text-center text-xs text-neutral-400">{fullUrl}</p>
    </div>
  );
}
