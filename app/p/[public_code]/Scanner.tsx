"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";

export default function Scanner({
  onResult,
  onClose,
}: {
  onResult: (text: string) => void;
  onClose: () => void;
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

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 p-4">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <div className="flex items-center justify-between py-2 text-white">
          <h2 className="text-lg font-semibold">Skeniraj QR z računa</h2>
          <button onClick={onClose} className="rounded-full bg-white/15 px-4 py-1.5 text-sm">
            Zapri
          </button>
        </div>

        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-black">
          <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
          <div className="pointer-events-none absolute inset-8 rounded-xl border-2 border-white/70" />
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-200">
            {error} Uporabi ročni vnos spodaj.
          </p>
        )}

        <p className="mt-4 text-center text-sm text-white/60">
          Usmeri kamero v QR kodo na dnu računa.
        </p>

        {/* Ročni vnos — za test na računalniku ali če kamera ne dela */}
        <div className="mt-auto pt-4">
          <label className="mb-1 block text-xs text-white/50">
            Ali prilepi 60-mestno številko iz QR (test)
          </label>
          <div className="flex gap-2">
            <input
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              inputMode="numeric"
              placeholder="3312493755740614…"
              className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none"
            />
            <button
              onClick={() => manual.trim() && onResult(manual.trim())}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black"
            >
              Preveri
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
