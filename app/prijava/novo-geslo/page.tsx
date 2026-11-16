"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/ssrClient";
import Logo from "@/app/ui/Logo";
import { Button } from "@/app/ui/Button";
import { Field, Input } from "@/app/ui/Field";

// Sem pripelje povezava iz e-pošte (seja za obnovo je že vzpostavljena v /prijava/povratek).
export default function NovoGeslo() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) return setError("Geslo naj ima vsaj 6 znakov.");
    setBusy(true);
    const supabase = createBrowserSupabase();
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) return setError("Gesla ni bilo mogoče shraniti. Povezava je morda potekla, zahtevaj novo.");
    router.replace("/app");
    router.refresh();
  }

  return (
    <main id="vsebina" className="mx-auto flex min-h-svh w-full max-w-md flex-col gap-12 px-6 py-8">
      <Logo />
      <form onSubmit={submit} className="flex flex-1 flex-col justify-center gap-6 pb-16" noValidate>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-fg">Nastavi novo geslo</h1>
          <p className="text-base text-mute">Izberi geslo, ki ga boš uporabljal za prijavo v Loyavi.</p>
        </div>
        <Field label="Novo geslo" hint="Vsaj 6 znakov." error={error}>
          <Input type="password" autoComplete="new-password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Button type="submit" size="lg" full disabled={busy}>
          Shrani geslo
        </Button>
      </form>
    </main>
  );
}
