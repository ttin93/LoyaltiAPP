"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import { Icon } from "@/app/components/icons";

const JAK = "var(--font-jakarta), sans-serif";
const AMBER = "#E2A04A";
const PAPER = "#FBF3E6";

export default function Scanner({
  onResult,
  onClose,
  title = "Skeniraj račun",
  demo = false,
}: {
  onResult: (text: string) => void;
  onClose: () => void;
  title?: string;
  demo?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState("");
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    if (demo) return;
    let active = true;
    const reader = new BrowserMultiFormatReader();
    reader
      .decodeFromVideoDevice(undefined, videoRef.current!, (result) => {
        if (result && active) {
          active = false;
          controlsRef.current?.stop();
          onResult(result.getText());
        }
      })
      .then((controls) => { controlsRef.current = controls; })
      .catch(() => { setError("Kamera ni na voljo"); });
    return () => { active = false; controlsRef.current?.stop(); };
  }, [onResult, demo]);

  const corner = (pos: "tl" | "tr" | "bl" | "br"): React.CSSProperties => ({
    position: "absolute",
    width: 38,
    height: 38,
    ...(pos[0] === "t" ? { top: -2 } : { bottom: -2 }),
    ...(pos[1] === "l" ? { left: -2 } : { right: -2 }),
    [pos[0] === "t" ? "borderTop" : "borderBottom"]: `3px solid ${AMBER}`,
    [pos[1] === "l" ? "borderLeft" : "borderRight"]: `3px solid ${AMBER}`,
    borderRadius: pos === "tl" ? "14px 0 0 0" : pos === "tr" ? "0 14px 0 0" : pos === "bl" ? "0 0 0 14px" : "0 0 14px 0",
  });

  const simBtn = (label: string, payload: string, primary = false): React.ReactNode => (
    <button onClick={() => onResult(payload)} style={{ height: 46, border: primary ? "none" : "1px solid rgba(251,243,230,0.16)", borderRadius: 13, background: primary ? "#5E7F52" : "rgba(251,243,230,0.05)", color: primary ? "#F4F0E4" : "rgba(251,243,230,0.82)", fontFamily: JAK, fontSize: 13.5, fontWeight: primary ? 700 : 600, cursor: "pointer" }}>
      {label}
    </button>
  );

  const camActive = !demo && !error;

  return (
    <div
      className="fixed inset-0 z-50 mx-auto flex w-full max-w-md flex-col"
      style={{ background: "radial-gradient(125% 90% at 50% 30%, #241B12 0%, #15100A 68%)", color: PAPER, fontFamily: JAK, padding: "52px 22px 28px" }}
    >
      {/* top bar */}
      <div className="flex items-center justify-between">
        <button onClick={onClose} aria-label="Zapri" className="flex items-center justify-center" style={{ width: 42, height: 42, borderRadius: "50%", border: "1px solid rgba(251,243,230,0.14)", background: "rgba(251,243,230,0.06)", cursor: "pointer" }}>
          <Icon name="x" color={PAPER} size={16} strokeWidth={2} />
        </button>
        <span style={{ fontWeight: 700, fontSize: 16 }}>{title}</span>
        <div style={{ width: 42 }} />
      </div>

      {/* frame */}
      <div className="flex flex-1 flex-col items-center justify-center" style={{ gap: 26 }}>
        <div style={{ position: "relative", width: 256, height: 256 }}>
          {/* amber sij okoli okvirja */}
          <div aria-hidden style={{ position: "absolute", inset: -36, borderRadius: "50%", background: "radial-gradient(circle, rgba(226,160,74,0.22), transparent 68%)", filter: "blur(6px)" }} />
          {/* okno */}
          <div style={{ position: "absolute", inset: 0, borderRadius: 22, overflow: "hidden", background: "rgba(0,0,0,0.35)", boxShadow: "inset 0 0 0 1px rgba(251,243,230,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* ghost QR — vedno viden v ozadju */}
            <Icon name="qr" color="rgba(251,243,230,0.14)" size={150} strokeWidth={1.3} />
            {/* živa kamera (prekrije ghost, ko teče) */}
            {camActive && (
              <video ref={videoRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} muted playsInline />
            )}
          </div>
          {/* vogali */}
          <div style={corner("tl")} />
          <div style={corner("tr")} />
          <div style={corner("bl")} />
          <div style={corner("br")} />
          {/* scanline */}
          {camActive && (
            <div style={{ position: "absolute", left: "9%", right: "9%", height: 2.5, borderRadius: 3, top: "12%", background: `linear-gradient(90deg, rgba(226,160,74,0), ${AMBER}, rgba(226,160,74,0))`, boxShadow: "0 0 16px rgba(226,160,74,0.9)", animation: "scanSweep 2.4s ease-in-out infinite alternate" }} />
          )}
        </div>
        <div style={{ maxWidth: 260, textAlign: "center", fontSize: 14.5, lineHeight: 1.5, color: "rgba(251,243,230,0.68)" }}>
          {error ? "Kamera ni na voljo — vnesi kodo z računa ročno." : "Poravnaj QR z dna računa v okvir. Žig se doda samodejno."}
        </div>
      </div>

      {/* spodaj */}
      {demo ? (
        <div style={{ background: "rgba(251,243,230,0.05)", border: "1px solid rgba(251,243,230,0.14)", borderRadius: 18, padding: 14 }}>
          <div style={{ fontSize: 10.5, letterSpacing: "0.12em", fontWeight: 800, color: AMBER, marginBottom: 10 }}>DEMO · SIMULIRAJ REZULTAT</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {simBtn("Veljaven račun", "DEMO_OK", true)}
            {simBtn("Že skeniran", "DEMO_DUP")}
            {simBtn("Tuj lokal", "DEMO_FOREIGN")}
            {simBtn("Prestar račun", "DEMO_OLD")}
          </div>
        </div>
      ) : showManual || error ? (
        <div style={{ background: "rgba(251,243,230,0.05)", border: "1px solid rgba(251,243,230,0.14)", borderRadius: 18, padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(251,243,230,0.6)", marginBottom: 9 }}>Vnesi številko iz QR kode</div>
          <div className="flex" style={{ gap: 8 }}>
            <input value={manual} onChange={(e) => setManual(e.target.value)} inputMode="numeric" placeholder="3312493755740614…" className="min-w-0 flex-1" style={{ height: 46, borderRadius: 13, padding: "0 14px", fontSize: 14, outline: "none", border: "1px solid rgba(251,243,230,0.16)", background: "rgba(251,243,230,0.08)", color: PAPER, fontFamily: JAK }} />
            <button onClick={() => manual.trim() && onResult(manual.trim())} style={{ height: 46, borderRadius: 13, padding: "0 18px", fontSize: 14, fontWeight: 700, border: "none", background: AMBER, color: "#2A241D", cursor: "pointer", fontFamily: JAK }}>Potrdi</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowManual(true)} style={{ alignSelf: "center", background: "transparent", border: "none", color: "rgba(251,243,230,0.55)", fontFamily: JAK, fontSize: 13.5, fontWeight: 600, textDecoration: "underline", cursor: "pointer", padding: 10 }}>
          Kamera ne dela? Vnesi kodo ročno
        </button>
      )}
    </div>
  );
}
