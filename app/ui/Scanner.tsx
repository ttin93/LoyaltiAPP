"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { CameraSlash, Keyboard, X } from "@phosphor-icons/react/dist/ssr";
import { Button } from "./Button";
import { Input } from "./Field";

/** Celozaslonski skener kode QR (fiskalni račun). Če kamera ni na voljo, ponudi ročni vnos. */
export default function Scanner({ onResult, onClose, title = "Skeniraj račun" }: { onResult: (text: string) => void; onClose: () => void; title?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [camError, setCamError] = useState(false);
  const [manual, setManual] = useState(false);
  const [code, setCode] = useState("");

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
        if (!active) controls.stop();
        else controlsRef.current = controls;
      })
      .catch(() => {
        setCamError(true);
        setManual(true);
      });
    return () => {
      active = false;
      controlsRef.current?.stop();
    };
  }, [onResult]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex flex-col bg-base" role="dialog" aria-modal="true" aria-label={title}>
      <div className="mx-auto flex w-full max-w-md items-center justify-between px-6 pt-8">
        <h2 className="text-lg font-semibold tracking-tight text-fg">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Zapri skener"
          className="flex size-10 items-center justify-center rounded-full bg-s2 text-fg transition-all duration-700 ease-spring hover:bg-s3 active:scale-[0.98]"
        >
          <X size={20} weight="bold" aria-hidden="true" />
        </button>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-6">
        <div className="relative aspect-square w-full max-w-xs overflow-hidden rounded-3xl border border-line bg-s1">
          {camError ? (
            <div className="flex size-full flex-col items-center justify-center gap-3 p-6 text-center">
              <CameraSlash size={32} weight="bold" className="text-dim" aria-hidden="true" />
              <p className="text-sm text-mute">Kamera ni na voljo. Dovoli dostop do kamere v nastavitvah brskalnika ali vnesi kodo ročno.</p>
            </div>
          ) : (
            <>
              <video ref={videoRef} className="size-full object-cover" muted playsInline />
              <div className="pointer-events-none absolute inset-6 rounded-2xl border-2 border-brand" aria-hidden="true" />
              <div className="pointer-events-none absolute inset-x-8 h-0.5 animate-[scan-sweep_2.2s_ease-in-out_infinite_alternate] rounded-full bg-brand" aria-hidden="true" />
            </>
          )}
        </div>
        <p className="max-w-xs text-center text-sm text-mute">Usmeri kamero v kodo QR na dnu fiskalnega računa. Prebere se sama.</p>
      </div>

      <div className="mx-auto w-full max-w-md px-6 pb-8">
        {manual ? (
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (code.trim()) onResult(code.trim());
            }}
          >
            <Input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" autoFocus placeholder="Številka iz kode QR" aria-label="Številka iz kode QR" />
            <Button type="submit" size="lg" full disabled={!code.trim()}>
              Potrdi kodo
            </Button>
          </form>
        ) : (
          <Button type="button" variant="ghost" size="lg" full onClick={() => setManual(true)}>
            <Keyboard size={20} weight="bold" aria-hidden="true" />
            Vnesi kodo ročno
          </Button>
        )}
      </div>
    </div>
  );
}
