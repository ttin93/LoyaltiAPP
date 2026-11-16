"use client";
/* eslint-disable react-hooks/set-state-in-effect -- stanje se uskladi z brskalnikom ali s svežimi podatki s strežnika; preverjeno z E2E */

import { useEffect, useState } from "react";
import { X } from "@phosphor-icons/react/dist/ssr";
import Icon3D from "./Icon3D";

const KEY = "loyavi:install-hint";

/** Namig za namestitev na začetni zaslon. Pokaže se samo v brskalniku telefona, enkrat. */
export default function InstallHint() {
  const [show, setShow] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    try {
      const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
      const mobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent);
      if (standalone || !mobile || localStorage.getItem(KEY)) return;
      setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
      setShow(true);
    } catch {
      /* zasebni način: brez namiga */
    }
  }, []);

  if (!show) return null;
  return (
    <aside className="flex items-center gap-4 rounded-3xl bg-card p-4 shadow-card">
      <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-tint">
        <Icon3D name="telefon" size={52} />
      </span>
      <div className="flex-1">
        <p className="text-base font-semibold text-fg">Dodaj Loyavi na začetni zaslon</p>
        <p className="text-sm text-mute">
          {ios
            ? "V Safariju tapni gumb za deljenje in izberi Dodaj na začetni zaslon."
            : "V meniju brskalnika izberi Dodaj na začetni zaslon ali Namesti aplikacijo."}
        </p>
      </div>
      <button
        type="button"
        aria-label="Skrij namig"
        onClick={() => {
          try {
            localStorage.setItem(KEY, "1");
          } catch {
            /* ni shrambe */
          }
          setShow(false);
        }}
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-s2 text-mute transition-all duration-700 ease-spring hover:bg-s3 hover:text-fg"
      >
        <X size={16} weight="bold" aria-hidden="true" />
      </button>
    </aside>
  );
}
