"use client";

import { useState } from "react";
import { CircleNotch } from "@phosphor-icons/react/dist/ssr";
import { Button } from "./Button";
import { Field, Input } from "./Field";

/**
 * Menjava elektronskega naslova računa (gost v profilu, lastnik v nastavitvah).
 * Naslov se spremeni šele, ko uporabnik odpre povezavo, poslano na novi naslov.
 */
export default function EmailChange({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const value = next.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return setError("Vpiši veljaven elektronski naslov.");
    if (value === email.toLowerCase()) return setError("To je že tvoj naslov.");
    setBusy(true);
    try {
      const r = await fetch("/api/account/email", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: value }) });
      const j = (await r.json()) as { ok: boolean; error?: string };
      if (!j.ok) setError(j.error || "Zahteve ni bilo mogoče poslati. Poskusi znova.");
      else setSentTo(value);
    } catch {
      setError("Povezava ni uspela. Preveri internet in poskusi znova.");
    } finally {
      setBusy(false);
    }
  }

  if (sentTo) {
    return (
      <p role="status" className="rounded-2xl bg-s2 p-4 text-sm text-fg">
        Na naslov <span className="font-semibold">{sentTo}</span> smo poslali povezavo za potrditev. Naslov se spremeni, ko jo odpreš. Povezava velja eno uro, do takrat velja stari naslov.
      </p>
    );
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="w-max rounded-lg text-sm font-medium text-mute underline underline-offset-4 transition-all duration-700 ease-spring hover:text-fg">
        Spremeni elektronski naslov
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
      <Field label="Nov elektronski naslov" hint="Nanj pošljemo povezavo za potrditev. Kartice in žigi ostanejo.">
        <Input type="email" inputMode="email" autoComplete="email" autoCapitalize="none" value={next} onChange={(e) => setNext(e.target.value)} placeholder="ime@primer.si" maxLength={120} autoFocus />
      </Field>
      {error && <p role="alert" className="rounded-xl border border-line bg-s2 px-4 py-3 text-sm text-bad">{error}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="secondary" disabled={busy || !next.trim()}>
          {busy && <CircleNotch size={16} weight="bold" className="animate-spin" aria-hidden="true" />}
          Pošlji potrditev
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={busy}
          onClick={() => {
            setOpen(false);
            setError(null);
            setNext("");
          }}
        >
          Prekliči
        </Button>
      </div>
    </form>
  );
}
