"use client";

import { useEffect, useRef } from "react";

/** Ovije vsebino in starševskemu oknu (widgetu) sporoča svojo višino, da se iframe
 *  prilega kartici — brez scrolla in brez dodatnega overlaya. */
export default function EmbedFrame({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // v iframe želimo samo kartico — odstrani globalno ozadje strani
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
    document.body.style.margin = "0";
    const post = () => {
      const h = ref.current?.offsetHeight || document.documentElement.scrollHeight;
      try {
        window.parent?.postMessage({ type: "zig-wheel-height", height: h }, "*");
      } catch {}
    };
    post();
    const ro = new ResizeObserver(post);
    if (ref.current) ro.observe(ref.current);
    const t = setInterval(post, 600); // varovalka za animacije/prehode
    return () => {
      ro.disconnect();
      clearInterval(t);
    };
  }, []);
  return (
    <div ref={ref} style={{ width: "100%" }}>
      {children}
    </div>
  );
}
