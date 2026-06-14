"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import { Icon } from "@/app/components/icons";

export default function Scanner({
  onResult,
  onClose,
  title = "Skeniraj račun",
}: {
  onResult: (text: string) => void;
  onClose: () => void;
  title?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState("");

  useEffect(() => {
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
      .catch((e) => setError(e?.message ?? "Kamera ni dostopna."));
    return () => {
      active = false;
      controlsRef.current?.stop();
    };
  }, [onResult]);

  const corner = (pos: string) =>
    ({
      position: "absolute" as const,
      width: 40,
      height: 40,
      ...(pos.includes("t") ? { top: 0 } : { bottom: 0 }),
      ...(pos.includes("l") ? { left: 0 } : { right: 0 }),
      [pos.includes("t") ? "borderTop" : "borderBottom"]: "3px solid #E8A23D",
      [pos.includes("l") ? "borderLeft" : "borderRight"]: "3px solid #E8A23D",
      borderRadius: pos === "tl" ? "10px 0 0 0" : pos === "tr" ? "0 10px 0 0" : pos === "bl" ? "0 0 0 10px" : "0 0 10px 0",
    }) as React.CSSProperties;

  return (
    <div
      className="fixed inset-0 z-50 mx-auto flex w-full max-w-md flex-col px-5 pb-9 pt-16"
      style={{ background: "#1A120D", color: "#F5EFE6" }}
    >
      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          aria-label="Zapri"
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ background: "rgba(245,239,230,0.12)" }}
        >
          <Icon name="x" color="#F5EFE6" size={16} strokeWidth={2} />
        </button>
        <span className="text-[16px] font-semibold">{title}</span>
        <div className="w-10" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <div className="relative" style={{ width: 248, height: 248 }}>
          <video
            ref={videoRef}
            className="absolute rounded-lg object-cover"
            style={{ inset: 14, width: "calc(100% - 28px)", height: "calc(100% - 28px)", background: "rgba(245,239,230,0.04)" }}
            muted
            playsInline
          />
          <div style={corner("tl")} />
          <div style={corner("tr")} />
          <div style={corner("bl")} />
          <div style={corner("br")} />
          <div
            style={{
              position: "absolute",
              left: "7%",
              right: "7%",
              height: 2.5,
              borderRadius: 3,
              top: "10%",
              background: "linear-gradient(90deg, rgba(232,162,61,0), #E8A23D, rgba(232,162,61,0))",
              boxShadow: "0 0 14px rgba(232,162,61,0.8)",
              animation: "scanSweep 2.4s ease-in-out infinite alternate",
            }}
          />
        </div>
        <div className="max-w-[260px] text-center text-[15px] leading-relaxed" style={{ color: "rgba(245,239,230,0.75)" }}>
          {error ? `${error} Uporabi ročni vnos spodaj.` : "Poišči QR kodo na dnu računa in jo poravnaj v okvir."}
        </div>
      </div>

      <div className="rounded-[18px] p-3.5" style={{ background: "rgba(245,239,230,0.07)", border: "1px dashed rgba(245,239,230,0.28)" }}>
        <div className="mb-2.5 text-[10.5px] font-bold tracking-[0.12em]" style={{ color: "#E8A23D" }}>
          ROČNI VNOS · 60-MESTNA ŠTEVILKA IZ QR
        </div>
        <div className="flex gap-2">
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            inputMode="numeric"
            placeholder="3312493755740614…"
            className="min-w-0 flex-1 rounded-[12px] px-3 py-2.5 text-[13.5px] outline-none"
            style={{ background: "rgba(245,239,230,0.1)", color: "#F5EFE6" }}
          />
          <button
            onClick={() => manual.trim() && onResult(manual.trim())}
            className="rounded-[12px] px-4 text-[13.5px] font-bold"
            style={{ background: "#5E7F52", color: "#F5EFE6" }}
          >
            Potrdi
          </button>
        </div>
      </div>
    </div>
  );
}
