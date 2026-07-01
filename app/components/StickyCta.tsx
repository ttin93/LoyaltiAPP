"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Lepljiva CTA vrstica — samo mobilno, prikaže se ob scrollanju mimo heroja.
const JAK = "var(--font-jakarta), sans-serif";

export default function StickyCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 640);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="sm:hidden"
      style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 150,
        transform: show ? "translateY(0)" : "translateY(130%)",
        transition: "transform .3s cubic-bezier(0.22,1,0.36,1)",
        padding: "10px 14px calc(10px + env(safe-area-inset-bottom))",
        background: "rgba(251,247,240,0.94)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
        borderTop: "1px solid rgba(42,36,29,0.1)", boxShadow: "0 -8px 24px rgba(42,36,29,0.1)",
      }}
    >
      <Link href="/partner" style={{ height: 52, borderRadius: 14, background: "#2A241D", color: "#FBF3E6", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none", fontFamily: JAK }}>
        Začni brezplačno — brez kartice
        <svg width="17" height="17" viewBox="0 0 24 24" style={{ fill: "none", stroke: "#FBF3E6", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </Link>
    </div>
  );
}
