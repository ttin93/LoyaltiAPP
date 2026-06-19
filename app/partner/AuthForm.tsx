"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/ssrClient";
import { Icon } from "@/app/components/icons";
import { Mark } from "@/app/components/SiteHeader";
import { BRAND } from "@/lib/brand";

const ROTS = [-5, 4, -3, 6, -4, 3];

function MiniStamps() {
  return (
    <div className="flex gap-2.5">
      {Array.from({ length: 6 }).map((_, i) => {
        const filled = i < 4;
        return (
          <div key={i} className="flex h-[38px] w-[38px] items-center justify-center rounded-full" style={{ border: filled ? "2px solid transparent" : "2px dashed rgba(245,239,230,0.3)", background: filled ? "rgba(232,162,61,0.16)" : "transparent", transform: filled ? `rotate(${ROTS[i]}deg)` : undefined }}>
            {filled && <Icon name="cup" color="#E8A23D" size={18} />}
          </div>
        );
      })}
    </div>
  );
}

export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    const supabase = createBrowserSupabase();
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
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

  const inp =
    "h-[50px] w-full rounded-xl border border-[#D9CDBA] bg-[#FFFCF6] px-4 text-[15px] text-[#2B1D17] outline-none transition focus:border-[#2B1D17] focus:ring-2 focus:ring-[rgba(43,29,23,0.08)] placeholder:text-[#A6967F]";

  return (
    <main style={{ background: "#EAE2D3", color: "#2B1D17", minHeight: "100dvh", overflowX: "hidden" }}>
      {/* top bar */}
      <div className="mx-auto flex h-[64px] max-w-[1000px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Mark size={34} />
          <span className="font-display text-[20px] font-extrabold tracking-tight">{BRAND}</span>
        </Link>
        <Link href="/" className="text-[14px] font-semibold text-[#5C4C3E] hover:text-[#2B1D17]">← Nazaj na domov</Link>
      </div>

      {/* split card */}
      <div className="mx-auto flex min-h-[calc(100dvh-64px)] max-w-[1000px] items-center px-6 py-8">
        <div className="grid w-full overflow-hidden rounded-[28px] border border-[#EFE6D4] bg-[#FFFCF6] md:grid-cols-2" style={{ boxShadow: "0 30px 70px rgba(43,29,23,0.16)" }}>
          {/* left — brand panel */}
          <div className="relative hidden flex-col justify-between gap-8 p-9 md:flex" style={{ background: "linear-gradient(160deg,#2B1D17 0%,#3A2820 100%)" }}>
            <div className="absolute" style={{ top: -50, right: -40, width: 170, height: 170, borderRadius: "50%", background: "rgba(232,162,61,0.12)" }} />
            <div className="relative flex flex-col gap-5">
              <div className="flex h-[34px] w-fit items-center gap-2 rounded-full px-3.5 text-[12.5px] font-bold" style={{ background: "rgba(232,162,61,0.16)", color: "#E8C99A" }}>
                <span className="h-[7px] w-[7px] rounded-full bg-[#E8A23D]" /> Za lokale
              </div>
              <h2 className="font-display font-extrabold" style={{ fontSize: 28, lineHeight: 1.12, color: "#F8F1E7", margin: 0 }}>
                Tvoj program zvestobe<br />na enem mestu
              </h2>
              <div className="flex flex-col gap-3.5">
                {["Postavi stran v 5 minutah", "Baza rednih gostov in njihovih kontaktov", "Google ocene na avtopilotu"].map((b) => (
                  <div key={b} className="flex items-center gap-3 text-[14.5px]" style={{ color: "rgba(248,241,231,0.9)" }}>
                    <span className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-[8px]" style={{ background: "rgba(94,127,82,0.25)" }}><Icon name="check" color="#9BC48D" size={15} strokeWidth={2.4} /></span>{b}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative flex flex-col gap-3">
              <MiniStamps />
              <div className="text-[12.5px]" style={{ color: "rgba(248,241,231,0.55)" }}>4 / 6 — še 2 do nagrade ☕</div>
            </div>
          </div>

          {/* right — form */}
          <div className="flex flex-col justify-center p-9">
            {/* segmented toggle */}
            <div className="mb-6 flex w-fit rounded-full border border-[#E4D8C2] p-1" style={{ background: "#F3EADB" }}>
              {(["login", "signup"] as const).map((mm) => (
                <button
                  key={mm}
                  type="button"
                  onClick={() => { setMode(mm); setError(null); setInfo(null); }}
                  className="rounded-full px-4 py-2 text-[13.5px] font-semibold transition"
                  style={mode === mm ? { background: "#2B1D17", color: "#F5EFE6" } : { color: "#5C4C3E" }}
                >
                  {mm === "login" ? "Prijava" : "Registracija"}
                </button>
              ))}
            </div>

            <h1 className="font-display font-extrabold" style={{ fontSize: 27, lineHeight: 1.1, margin: 0 }}>
              {mode === "login" ? "Dobrodošel nazaj" : "Ustvari račun lokala"}
            </h1>
            <p className="mt-1.5 text-[14.5px] text-[#8A7A66]">
              {mode === "login" ? "Prijavi se in upravljaj svoj program zvestobe." : "Nekaj sekund — pa si v nadzorni plošči."}
            </p>

            <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-semibold text-[#5C4C3E]">Email</span>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@lokal.si" className={inp} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-semibold text-[#5C4C3E]">Geslo</span>
                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="min. 6 znakov" className={inp} />
              </label>

              {error && (
                <p className="flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium" style={{ background: "rgba(200,81,43,0.1)", color: "#A83E1F" }}>{error}</p>
              )}
              {info && (
                <p className="flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium" style={{ background: "rgba(94,127,82,0.12)", color: "#3E5536" }}>{info}</p>
              )}

              <button disabled={busy} className="mt-1 flex h-[52px] items-center justify-center gap-2 rounded-full text-[15.5px] font-semibold text-[#F5EFE6] transition disabled:opacity-60" style={{ background: "#2B1D17", boxShadow: "0 10px 24px rgba(43,29,23,0.2)" }}>
                {busy ? "…" : mode === "login" ? "Prijava" : "Ustvari račun"}
                {!busy && <Icon name="arrowR" color="#F5EFE6" size={17} strokeWidth={2} />}
              </button>
            </form>

            <div className="mt-5 text-center text-[13.5px] text-[#8A7A66]">
              {mode === "login" ? "Še nimaš računa? " : "Že imaš račun? "}
              <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); setInfo(null); }} className="font-semibold text-[#C8512B] underline">
                {mode === "login" ? "Registriraj lokal" : "Prijava"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
