"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserSupabase } from "@/lib/supabase/ssrClient";

const INK = "#2A241D";
const PAPER = "#FBF3E6";
const MUTED = "#6E6253";
const BORDER = "#EFE6D6";

export default function NavAuth() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const sb = createBrowserSupabase();
    sb.auth
      .getUser()
      .then(({ data }) => { if (active) setEmail(data.user?.email ?? null); })
      .catch(() => {})
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  async function logout() {
    try { await createBrowserSupabase().auth.signOut(); } catch { /* ignore */ }
    setOpen(false);
    window.location.href = "/";
  }

  // Dokler ne vemo (ali ni prijavljen) → privzeti gumbi (landing ostane statičen, brez utripanja CTA)
  if (!ready || !email) {
    return (
      <>
        <Link href="/partner" className="hidden sm:flex" style={{ height: 42, padding: "0 16px", borderRadius: 12, color: INK, fontSize: 14.5, fontWeight: 700, alignItems: "center" }}>Prijava</Link>
        <Link href="/partner" style={{ height: 42, padding: "0 20px", borderRadius: 12, background: INK, color: PAPER, fontSize: 14.5, fontWeight: 700, display: "flex", alignItems: "center" }}>Začni brezplačno</Link>
      </>
    );
  }

  const name = email.split("@")[0];
  const initial = (name[0] || "U").toUpperCase();

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center"
        style={{ gap: 9, height: 42, padding: "0 8px 0 8px", borderRadius: 12, border: `1px solid ${BORDER}`, background: "#fff", cursor: "pointer", fontFamily: "var(--font-jakarta), sans-serif" }}
      >
        <span className="flex items-center justify-center" style={{ width: 28, height: 28, borderRadius: "50%", background: INK, color: PAPER, fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{initial}</span>
        <span className="hidden sm:block max-w-[140px] truncate" style={{ fontSize: 14, fontWeight: 700, color: INK }}>{name}</span>
        <svg width="15" height="15" viewBox="0 0 24 24" style={{ fill: "none", stroke: "#B5AB9C", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round", marginRight: 4, transition: "transform .15s", transform: open ? "rotate(180deg)" : "none" }}><path d="M6 9l6 6 6-6" /></svg>
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 60 }} />
          <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 240, background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, boxShadow: "0 16px 40px rgba(42,36,29,0.18)", zIndex: 61, overflow: "hidden", fontFamily: "var(--font-jakarta), sans-serif" }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid #F1E8D9" }}>
              <div style={{ fontSize: 11.5, color: "#9A8F80", fontWeight: 600 }}>Prijavljen kot</div>
              <div className="truncate" style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>{email}</div>
            </div>
            <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center" style={{ gap: 10, height: 44, padding: "0 14px", fontSize: 14, fontWeight: 600, color: INK, textDecoration: "none" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" style={{ fill: "none", stroke: INK, strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" /></svg>
              Nadzorna plošča
            </Link>
            <button onClick={logout} className="flex w-full items-center" style={{ gap: 10, height: 44, padding: "0 14px", fontSize: 14, fontWeight: 600, color: "#C4623D", background: "none", border: "none", borderTop: "1px solid #F1E8D9", cursor: "pointer", fontFamily: "var(--font-jakarta), sans-serif", textAlign: "left" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" style={{ fill: "none", stroke: "#C4623D", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
              Odjava
            </button>
          </div>
        </>
      )}
    </div>
  );
}
