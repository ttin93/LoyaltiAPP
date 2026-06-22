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
    if (demo) return; // v demu ni kamere — uporabi simulacijo
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
      .then((controls) => {
        controlsRef.current = controls;
      })
      .catch((e) => { setError(e?.message ?? "Kamera ni dostopna."); setShowManual(true); });
    return () => {
      active = false;
      controlsRef.current?.stop();
    };
  }, [onResult, demo]);

  const corner = (pos: "tl" | "tr" | "bl" | "br"): React.CSSProperties => ({
    position: "absolute",
    width: 42,
    height: 42,
    ...(pos[0] === "t" ? { top: 0 } : { bottom: 0 }),
    ...(pos[1] === "l" ? { left: 0 } : { right: 0 }),
    [pos[0] === "t" ? "borderTop" : "borderBottom"]: `3px solid ${AMBER}`,
    [pos[1] === "l" ? "borderLeft" : "borderRight"]: `3px solid ${AMBER}`,
    borderRadius: pos === "tl" ? "12px 0 0 0" : pos === "tr" ? "0 12px 0 0" : pos === "bl" ? "0 0 0 12px" : "0 0 12px 0",
  });

  const simBtn = (label: string, payload: string, primary = false): React.ReactNode => (
    <button
      onClick={() => onResult(payload)}
      style={{
        height: 44,
        border: primary ? "none" : "1px solid rgba(251,243,230,0.28)",
        borderRadius: 12,
        background: primary ? "#5E7F52" : "transparent",
        color: primary ? "#F4F0E4" : "rgba(251,243,230,0.85)",
        fontFamily: JAK,
        fontSize: 13.5,
        fontWeight: primary ? 700 : 600,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-50 mx-auto flex w-full max-w-md flex-col"
      style={{ background: "#1C160F", color: PAPER, fontFamily: JAK, padding: "56px 20px 28px" }}
    >
      {/* top bar */}
      <div className="flex items-center justify-between">
        <button onClick={onClose} aria-label="Zapri" className="flex items-center justify-center" style={{ width: 42, height: 42, borderRadius: "50%", border: "none", background: "rgba(251,243,230,0.12)", cursor: "pointer" }}>
          <Icon name="x" color={PAPER} size={16} strokeWidth={2} />
        </button>
        <span style={{ fontWeight: 700, fontSize: 16 }}>{title}</span>
        <div style={{ width: 42 }} />
      </div>

      {/* frame */}
      <div className="flex flex-1 flex-col items-center justify-center" style={{ gap: 24 }}>
        <div style={{ position: "relative", width: 250, height: 250 }}>
          <div style={corner("tl")} />
          <div style={corner("tr")} />
          <div style={corner("bl")} />
          <div style={corner("br")} />
          <div style={{ position: "absolute", inset: 16, borderRadius: 10, overflow: "hidden", background: "rgba(251,243,230,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {demo ? (
              <Icon name="qr" color="rgba(251,243,230,0.18)" size={130} strokeWidth={1.4} />
            ) : (
              <video ref={videoRef} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted playsInline />
            )}
          </div>
          <div
            style={{
              position: "absolute",
              left: "8%",
              right: "8%",
              height: 2.5,
              borderRadius: 3,
              top: "12%",
              background: `linear-gradient(90deg, rgba(226,160,74,0), ${AMBER}, rgba(226,160,74,0))`,
              boxShadow: "0 0 14px rgba(226,160,74,0.8)",
              animation: "scanSweep 2.4s ease-in-out infinite alternate",
            }}
          />
        </div>
        <div style={{ maxWidth: 250, textAlign: "center", fontSize: 15, lineHeight: 1.5, color: "rgba(251,243,230,0.72)" }}>
          {error ? `${error} Vnesi kodo ročno spodaj.` : "Poravnaj QR z dna računa v okvir. Žig se doda samodejno."}
        </div>
      </div>

      {/* spodaj */}
      {demo ? (
        <div style={{ background: "rgba(251,243,230,0.06)", border: "1px dashed rgba(251,243,230,0.26)", borderRadius: 18, padding: 14 }}>
          <div style={{ fontSize: 10.5, letterSpacing: "0.12em", fontWeight: 800, color: AMBER, marginBottom: 10 }}>DEMO · SIMULIRAJ REZULTAT</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {simBtn("Veljaven račun", "DEMO_OK", true)}
            {simBtn("Že skeniran", "DEMO_DUP")}
            {simBtn("Tuj lokal", "DEMO_FOREIGN")}
            {simBtn("Prestar račun", "DEMO_OLD")}
          </div>
        </div>
      ) : showManual ? (
        <div style={{ background: "rgba(251,243,230,0.06)", border: "1px dashed rgba(251,243,230,0.26)", borderRadius: 18, padding: 14 }}>
          <div style={{ fontSize: 10.5, letterSpacing: "0.12em", fontWeight: 800, color: AMBER, marginBottom: 10 }}>ROČNI VNOS · ŠTEVILKA IZ QR</div>
          <div className="flex" style={{ gap: 8 }}>
            <input
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              inputMode="numeric"
              placeholder="3312493755740614…"
              className="min-w-0 flex-1"
              style={{ borderRadius: 12, padding: "10px 12px", fontSize: 13.5, outline: "none", border: "none", background: "rgba(251,243,230,0.1)", color: PAPER, fontFamily: JAK }}
            />
            <button onClick={() => manual.trim() && onResult(manual.trim())} style={{ borderRadius: 12, padding: "0 16px", fontSize: 13.5, fontWeight: 700, border: "none", background: "#5E7F52", color: PAPER, cursor: "pointer", fontFamily: JAK }}>Potrdi</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowManual(true)} style={{ alignSelf: "center", background: "transparent", border: "none", color: "rgba(251,243,230,0.6)", fontFamily: JAK, fontSize: 13.5, fontWeight: 600, textDecoration: "underline", cursor: "pointer", padding: 8 }}>
          Kamera ne dela? Vnesi kodo ročno
        </button>
      )}
    </div>
  );
}
