"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserSupabase } from "@/lib/supabase/ssrClient";

// Exit-intent popup — sproži se, ko miška zapusti okno zgoraj (namera odhoda).
// Samo neprijavljenim, ENKRAT na sejo (sessionStorage). Desktop (mouseleave).
const JAK = "var(--font-jakarta), sans-serif";

export default function ExitIntentPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let active = true;
    let allowed = false;
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem("loyavi_exit_shown")) return;

    createBrowserSupabase().auth.getUser().then(({ data }) => {
      if (active && !data.user) allowed = true; // samo neprijavljeni
    }).catch(() => {});

    const onLeave = (e: MouseEvent) => {
      if (!allowed || e.clientY > 0) return;
      allowed = false;
      try { sessionStorage.setItem("loyavi_exit_shown", "1"); } catch { /* ignore */ }
      setShow(true);
    };
    // majhen zamik, da ne ujame nakey premika ob nalaganju
    const t = setTimeout(() => document.addEventListener("mouseleave", onLeave), 3000);
    return () => { active = false; clearTimeout(t); document.removeEventListener("mouseleave", onLeave); };
  }, []);

  if (!show) return null;
  const close = () => setShow(false);

  return (
    <div onClick={close} style={{ position: "fixed", inset: 0, zIndex: 210, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "rgba(43,29,23,0.55)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", animation: "loyaviPopfade 0.25s ease", fontFamily: JAK }}>
      <style>{`@keyframes loyaviPopfade{from{opacity:0}to{opacity:1}}@keyframes loyaviPoprise{from{opacity:0;transform:translateY(18px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
      <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", width: "100%", maxWidth: 430, background: "#FFFCF6", border: "1px solid #EFE6D4", borderRadius: 28, padding: "38px 34px 34px", boxShadow: "0 40px 90px rgba(43,29,23,0.35)", animation: "loyaviPoprise 0.32s cubic-bezier(0.22,1,0.36,1)", textAlign: "center" }}>
        <button onClick={close} aria-label="Zapri" style={{ position: "absolute", top: 16, right: 16, width: 34, height: 34, borderRadius: "50%", border: "none", background: "rgba(43,29,23,0.06)", color: "#5C4C3E", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" style={{ fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 32, padding: "0 14px", borderRadius: 999, background: "rgba(196,98,61,0.16)", color: "#9B3F1E", fontSize: 12.5, fontWeight: 700, marginBottom: 18 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#C4623D" }} />
          Preden odideš
        </div>
        <h3 className="font-display" style={{ margin: "0 0 10px", fontWeight: 800, fontSize: 27, lineHeight: 1.08, letterSpacing: "-0.01em", color: "#2A241D" }}>Poskusi 14 dni brezplačno</h3>
        <p style={{ margin: "0 0 22px", fontSize: 15.5, lineHeight: 1.55, color: "#5C4C3E" }}>Postaviš v 5 minut, brez kartice, prekličeš kadarkoli. Prvi žigi lahko padejo že danes.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Link href="/partner" onClick={close} style={{ height: 52, borderRadius: 999, background: "#2B1D17", color: "#F5EFE6", fontSize: 15.5, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none" }}>
            Začni brezplačni preizkus
            <svg width="17" height="17" viewBox="0 0 24 24" style={{ fill: "none", stroke: "#F5EFE6", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </Link>
          <button onClick={close} style={{ height: 44, borderRadius: 999, border: "none", background: "transparent", color: "#8A7A66", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: JAK }}>Ne, hvala</button>
        </div>
      </div>
    </div>
  );
}
