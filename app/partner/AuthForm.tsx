"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/ssrClient";

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

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6">
      <h1 className="text-2xl font-bold">{mode === "login" ? "Prijava za lokale" : "Registracija lokala"}</h1>
      <p className="mt-1 text-sm text-neutral-500">Upravljaj svoj program zvestobe.</p>

      <form onSubmit={submit} className="mt-6 space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@lokal.si"
          className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
        />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="geslo (min. 6 znakov)"
          className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
        />
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {info && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{info}</p>}
        <button
          disabled={busy}
          className="w-full rounded-xl bg-neutral-900 py-3 font-semibold text-white disabled:opacity-50"
        >
          {busy ? "…" : mode === "login" ? "Prijava" : "Ustvari račun"}
        </button>
      </form>

      <button
        onClick={() => {
          setMode(mode === "login" ? "signup" : "login");
          setError(null);
          setInfo(null);
        }}
        className="mt-4 text-sm text-neutral-500 underline"
      >
        {mode === "login" ? "Nimaš računa? Registriraj se" : "Imaš račun? Prijava"}
      </button>
    </main>
  );
}
