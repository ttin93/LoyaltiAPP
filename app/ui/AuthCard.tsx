"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CircleNotch, GoogleLogo } from "@phosphor-icons/react/dist/ssr";
import { createBrowserSupabase } from "@/lib/supabase/ssrClient";
import { Button } from "./Button";
import { Field, Input } from "./Field";

const legal = "font-medium text-mute underline underline-offset-4 transition-all duration-700 ease-spring hover:text-fg";

type Mode = "auth" | "reset";

/**
 * Prijava in registracija v enem koraku: če račun obstaja, se prijaviš,
 * sicer ga ustvarimo. `owner` prilagodi besedila za lastnike lokalov.
 */
export default function AuthCard({ next, google, owner = false }: { next: string; google: boolean; owner?: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const mail = email.trim().toLowerCase();
    if (!emailOk) return setError("Vpiši veljaven elektronski naslov.");
    const supabase = createBrowserSupabase();

    if (mode === "reset") {
      setBusy(true);
      const { error: err } = await supabase.auth.resetPasswordForEmail(mail, {
        redirectTo: `${window.location.origin}/prijava/povratek?next=${encodeURIComponent("/prijava/novo-geslo")}`,
      });
      setBusy(false);
      if (err) return setError("Povezave ni bilo mogoče poslati. Poskusi znova čez nekaj minut.");
      return setInfo("Če račun s tem naslovom obstaja, smo nanj poslali povezavo za novo geslo.");
    }

    if (password.length < 6) return setError("Geslo naj ima vsaj 6 znakov.");
    setBusy(true);
    try {
      let created = false;
      const signIn = await supabase.auth.signInWithPassword({ email: mail, password });
      if (signIn.error) {
        // računa ni ali je geslo napačno → poskusi ustvariti račun
        const signUp = await supabase.auth.signUp({ email: mail, password });
        if (signUp.error) {
          const exists = /already|registered|exists/i.test(signUp.error.message);
          setError(exists ? "Geslo ni pravilno. Poskusi znova ali nastavi novo geslo." : "Prijava ni uspela. Poskusi znova.");
          return;
        }
        if (!signUp.data.session) {
          setInfo("Račun je ustvarjen. Potrdi ga s povezavo, ki smo jo poslali na tvoj naslov, nato se prijavi.");
          return;
        }
        created = true;
      }
      // nov gost najprej potrdi pogoje; obstoječega po potrebi tja usmeri stran sama
      router.replace(created && !owner ? `/prijava/soglasje?next=${encodeURIComponent(next)}` : next);
      router.refresh();
    } catch {
      setError("Povezava ni uspela. Preveri internet in poskusi znova.");
    } finally {
      setBusy(false);
    }
  }

  async function withGoogle() {
    setError(null);
    const supabase = createBrowserSupabase();
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/prijava/povratek?next=${encodeURIComponent(next)}` },
    });
    if (err) setError("Prijava z Googlom trenutno ni na voljo.");
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-fg">
          {mode === "reset" ? "Novo geslo" : owner ? "Prijava za lokale" : "Tvoja denarnica"}
        </h1>
        <p className="text-base text-mute">
          {mode === "reset"
            ? "Vpiši elektronski naslov in poslali ti bomo povezavo za nastavitev novega gesla."
            : "Vpiši elektronski naslov in geslo. Če računa še nimaš, ga ustvarimo v istem koraku."}
        </p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <Field label="Elektronski naslov">
          <Input type="email" inputMode="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ime@primer.si" />
        </Field>
        {mode === "auth" && (
          <Field label="Geslo" hint="Vsaj 6 znakov.">
            <Input type="password" autoComplete="current-password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Tvoje geslo" />
          </Field>
        )}

        {error && <p role="alert" className="rounded-xl border border-line bg-s2 px-4 py-3 text-sm text-bad">{error}</p>}
        {info && <p role="status" className="rounded-xl border border-line bg-s2 px-4 py-3 text-sm text-brand-ink">{info}</p>}

        <Button type="submit" size="lg" full disabled={busy}>
          {busy ? <CircleNotch size={20} weight="bold" className="animate-spin" aria-hidden="true" /> : null}
          {mode === "reset" ? "Pošlji povezavo" : "Nadaljuj"}
          {!busy && <ArrowRight size={16} weight="bold" aria-hidden="true" />}
        </Button>
      </form>

      {mode === "auth" && google && (
        <Button type="button" variant="secondary" size="lg" full onClick={withGoogle}>
          <GoogleLogo size={20} weight="bold" aria-hidden="true" />
          Nadaljuj z Googlom
        </Button>
      )}

      {mode === "auth" && (
        <p className="text-center text-sm text-dim">
          {owner ? "Z ustvarjanjem računa sprejemaš " : "Nov račun v naslednjem koraku potrdi "}
          <a href="/pogoji" target="_blank" rel="noreferrer" className={legal}>
            pogoje uporabe
          </a>
          . Kako ravnamo s podatki, piše v{" "}
          <a href="/zasebnost" target="_blank" rel="noreferrer" className={legal}>
            politiki zasebnosti
          </a>
          .
        </p>
      )}

      <button
        type="button"
        onClick={() => {
          setMode(mode === "auth" ? "reset" : "auth");
          setError(null);
          setInfo(null);
        }}
        className="w-max self-center rounded-lg text-sm font-medium text-mute transition-all duration-700 ease-spring hover:text-fg"
      >
        {mode === "auth" ? "Pozabljeno geslo" : "Nazaj na prijavo"}
      </button>
    </div>
  );
}
