"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/ssrClient";
import { BRAND } from "@/lib/brand";

const JAK = "var(--font-jakarta), sans-serif";
const INK = "#2A241D";
const AMBER = "#E2A04A";
const PAPER = "#FBF3E6";

function Cup({ stroke, size }: { stroke: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", fill: "none", stroke, strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round" }}>
      <path d="M5 9h10v5.5A4.5 4.5 0 0 1 10.5 19h-1A4.5 4.5 0 0 1 5 14.5V9Z" />
      <path d="M15 10.5h1.6a2.4 2.4 0 0 1 0 4.8H15" />
    </svg>
  );
}

function GoogleLogo({ size = 19 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M21.6 12.2c0-.7-.06-1.3-.18-1.9H12v3.6h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.2Z" fill="#4285F4" />
      <path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z" fill="#34A853" />
      <path d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1A10 10 0 0 0 2 12c0 1.6.4 3.2 1.1 4.6L6.4 14Z" fill="#FBBC05" />
      <path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 2.9 14.7 2 12 2A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.3 3-4.1 5.6-4.1Z" fill="#EA4335" />
    </svg>
  );
}

const inputStyle: React.CSSProperties = {
  height: 52,
  border: "1.5px solid #E4D9C7",
  borderRadius: 14,
  background: "#FBF7F0",
  padding: "0 15px",
  fontFamily: JAK,
  fontSize: 15,
  fontWeight: 600,
  color: INK,
  outline: "none",
};

export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const isReg = mode === "signup";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    const supabase = createBrowserSupabase();
    try {
      if (isReg) {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
        if (error) throw error;
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          setInfo("Račun ustvarjen. Preveri email za potrditev, nato se prijavi.");
          setMode("login");
          setBusy(false);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      router.refresh();
      router.push("/partner");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Napaka pri prijavi.");
    } finally {
      setBusy(false);
    }
  }

  async function withGoogle() {
    setError(null);
    setInfo(null);
    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/partner` } });
      if (error) throw error;
    } catch {
      setInfo("Google prijava bo kmalu — uporabi email in geslo.");
    }
  }

  const tab = (active: boolean): React.CSSProperties => ({
    flex: 1,
    height: 40,
    border: "none",
    borderRadius: 10,
    background: active ? "#FFFFFF" : "transparent",
    color: active ? INK : "#9A8F80",
    fontFamily: JAK,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all .15s",
  });

  return (
    <main style={{ minHeight: "100dvh", background: "#E9E2D6", fontFamily: JAK, color: INK, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, boxSizing: "border-box" }}>
      <div className="grid w-full md:grid-cols-[1.05fr_440px]" style={{ maxWidth: 980, background: "#fff", borderRadius: 24, overflow: "hidden", border: "1px solid #D9CDBA", boxShadow: "0 30px 70px rgba(34,28,22,0.18)" }}>
        {/* brand panel (desktop) */}
        <div className="relative hidden flex-col justify-center gap-6 md:flex" style={{ background: "radial-gradient(130% 100% at 0% 0%, #34281E 0%, #2A241D 60%)", padding: "54px 48px", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -50, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(226,160,74,0.16)" }} />
          <Link href="/" className="relative flex items-center gap-2.5">
            <div className="flex items-center justify-center" style={{ width: 38, height: 38, borderRadius: 11, background: AMBER, color: INK, fontWeight: 800, fontSize: 19 }}><Cup stroke={INK} size={21} /></div>
            <span style={{ fontWeight: 800, fontSize: 20, color: PAPER, letterSpacing: "-0.01em" }}>{BRAND}</span>
          </Link>
          <h2 style={{ position: "relative", margin: 0, fontWeight: 800, fontSize: 38, lineHeight: 1.05, letterSpacing: "-0.02em", color: "#F8F3EA" }}>Zvestoba na<br />fiskalni račun.</h2>
          <p style={{ position: "relative", margin: 0, fontSize: 16, lineHeight: 1.6, color: "rgba(248,243,234,0.74)", maxWidth: 360 }}>Gostje skenirajo QR z računa in zbirajo žige. Ti dobiš stalne stranke in vpogled — brez aplikacije, brez kartončkov.</p>
          <div className="relative flex flex-col gap-3" style={{ marginTop: 4 }}>
            {["Postavitev v 3 minute", "Vse besedila, barve in nagrade urejaš sam"].map((b) => (
              <div key={b} className="flex items-center gap-3" style={{ color: "rgba(248,243,234,0.9)", fontSize: 14.5 }}>
                <span className="flex items-center justify-center" style={{ width: 24, height: 24, borderRadius: 7, background: "rgba(248,243,234,0.12)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" style={{ fill: "none", stroke: AMBER, strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M5 12.5l4.2 4.2L19 7" /></svg>
                </span>{b}
              </div>
            ))}
          </div>
        </div>

        {/* form panel */}
        <div className="flex flex-col justify-center gap-5" style={{ padding: "44px 36px" }}>
          {/* mobilni logo */}
          <Link href="/" className="flex items-center gap-2.5 md:hidden">
            <div className="flex items-center justify-center" style={{ width: 36, height: 36, borderRadius: 10, background: AMBER, color: INK, fontWeight: 800, fontSize: 18 }}><Cup stroke={INK} size={20} /></div>
            <span style={{ fontWeight: 800, fontSize: 19 }}>{BRAND}</span>
          </Link>

          <div className="flex" style={{ background: "#F4ECDF", borderRadius: 14, padding: 4 }}>
            <button type="button" onClick={() => { setMode("login"); setError(null); setInfo(null); }} style={tab(!isReg)}>Prijava</button>
            <button type="button" onClick={() => { setMode("signup"); setError(null); setInfo(null); }} style={tab(isReg)}>Registracija</button>
          </div>

          <div className="flex flex-col gap-1">
            <div style={{ fontWeight: 800, fontSize: 24, letterSpacing: "-0.01em" }}>{isReg ? "Ustvari račun" : "Dobrodošel nazaj"}</div>
            <div style={{ fontSize: 14, color: "#9A8F80" }}>{isReg ? "Postavi loyalty za svoj lokal v par minutah." : "Prijavi se v nadzorno ploščo."}</div>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4">
            {isReg && (
              <div className="flex flex-col gap-1.5">
                <label style={{ fontSize: 13, fontWeight: 700, color: "#6E6253" }}>Ime in priimek</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ana Kovač" style={inputStyle} />
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: 13, fontWeight: 700, color: "#6E6253" }}>Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ime@lokal.si" style={inputStyle} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: 13, fontWeight: 700, color: "#6E6253" }}>Geslo</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="min. 6 znakov" style={inputStyle} />
            </div>

            {error && <p style={{ margin: 0, borderRadius: 12, padding: "10px 14px", fontSize: 13.5, fontWeight: 600, background: "rgba(200,81,43,0.1)", color: "#A83E1F" }}>{error}</p>}
            {info && <p style={{ margin: 0, borderRadius: 12, padding: "10px 14px", fontSize: 13.5, fontWeight: 600, background: "rgba(94,127,82,0.12)", color: "#3E5536" }}>{info}</p>}

            <button disabled={busy} style={{ width: "100%", height: 54, border: "none", borderRadius: 16, background: INK, color: PAPER, fontFamily: JAK, fontSize: 15.5, fontWeight: 700, cursor: "pointer", opacity: busy ? 0.6 : 1 }}>
              {busy ? "…" : isReg ? "Ustvari račun in nadaljuj" : "Prijava"}
            </button>
          </form>

          <button type="button" onClick={withGoogle} className="flex items-center justify-center gap-2.5" style={{ width: "100%", height: 50, border: "1.5px solid #E4D9C7", borderRadius: 14, background: "#FFFFFF", color: INK, fontFamily: JAK, fontSize: 14.5, fontWeight: 700, cursor: "pointer" }}>
            <GoogleLogo /> Nadaljuj z Googlom
          </button>
        </div>
      </div>
    </main>
  );
}
