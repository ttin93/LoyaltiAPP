"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserSupabase } from "@/lib/supabase/ssrClient";

// 14-dnevni trial popup (dizajn iz Landing.dc.html). Prikaže se ob VSAKEM obisku
// (brez shranjevanja) — a SAMO neprijavljenim. Prijavljeni ga ne vidijo.
const JAK = "var(--font-jakarta), sans-serif";

export default function TrialPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    createBrowserSupabase()
      .auth.getUser()
      .then(({ data }) => {
        if (!active) return;
        if (data.user) return; // prijavljen → nikoli ne pokaži
        timer = setTimeout(() => { if (active) setShow(true); }, 900);
      })
      .catch(() => {});
    return () => { active = false; if (timer) clearTimeout(timer); };
  }, []);

  if (!show) return null;
  const close = () => setShow(false);

  return (
    <div
      onClick={close}
      style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "rgba(43,29,23,0.55)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", animation: "loyaviPopfade 0.25s ease", fontFamily: JAK }}
    >
      <style>{`@keyframes loyaviPopfade{from{opacity:0}to{opacity:1}}@keyframes loyaviPoprise{from{opacity:0;transform:translateY(18px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ position: "relative", width: "100%", maxWidth: 420, background: "#FFFCF6", border: "1px solid #EFE6D4", borderRadius: 28, padding: "38px 34px 34px", boxShadow: "0 40px 90px rgba(43,29,23,0.35)", animation: "loyaviPoprise 0.32s cubic-bezier(0.22,1,0.36,1)", textAlign: "center" }}
      >
        <button onClick={close} aria-label="Zapri" style={{ position: "absolute", top: 16, right: 16, width: 34, height: 34, borderRadius: "50%", border: "none", background: "rgba(43,29,23,0.06)", color: "#5C4C3E", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" style={{ fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 32, padding: "0 14px", borderRadius: 999, background: "rgba(232,162,61,0.18)", color: "#8A5B14", fontSize: 12.5, fontWeight: 700, marginBottom: 18 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#E8A23D" }} />
          Brezplačen preizkus
        </div>
        <div style={{ width: 66, height: 66, margin: "0 auto 18px", borderRadius: 20, background: "#F1E7D2", display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-5deg)" }}>
          <span className="font-display" style={{ fontWeight: 800, fontSize: 30, color: "#C8512B" }}>14</span>
        </div>
        <h3 className="font-display" style={{ margin: "0 0 10px", fontWeight: 800, fontSize: 27, lineHeight: 1.08, letterSpacing: "-0.01em", color: "#2A241D" }}>14 dni brezplačno</h3>
        <p style={{ margin: "0 0 22px", fontSize: 15.5, lineHeight: 1.55, color: "#5C4C3E" }}>Preizkusi vse funkcije paketa Grow dva tedna zastonj. Brez kartice, prekličeš kadarkoli.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Link href="/partner" onClick={close} style={{ height: 52, borderRadius: 999, background: "#2B1D17", color: "#F5EFE6", fontSize: 15.5, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none" }}>
            Začni brezplačni preizkus
            <svg width="17" height="17" viewBox="0 0 24 24" style={{ fill: "none", stroke: "#F5EFE6", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </Link>
          <button onClick={close} style={{ height: 44, borderRadius: 999, border: "none", background: "transparent", color: "#8A7A66", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: JAK }}>Mogoče kasneje</button>
        </div>
      </div>
    </div>
  );
}
