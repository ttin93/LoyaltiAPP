"use client";

import { useState } from "react";
import { CheckCircle, CircleNotch, PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/app/ui/Button";
import { Field, Input, Textarea } from "@/app/ui/Field";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactForm() {
  const [f, setF] = useState({ name: "", venue: "", email: "", phone: "", message: "" });
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const up = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL.test(f.email.trim())) return setError("Vpiši veljaven elektronski naslov, da ti lahko odgovorimo.");
    if (f.message.trim().length < 5) return setError("Napiši nam, kako ti lahko pomagamo.");
    setError(null);
    setState("sending");
    try {
      const r = await fetch("/api/lead", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...f, email: f.email.trim() }) });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error);
      setState("done");
    } catch {
      setError("Sporočila ni bilo mogoče poslati. Poskusi znova ali nam piši neposredno.");
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div role="status" className="flex flex-col items-start gap-4 rounded-3xl bg-s1 p-8">
        <CheckCircle size={40} weight="fill" className="text-brand-ink" aria-hidden="true" />
        <h2 className="text-2xl font-semibold tracking-tight text-fg">Sporočilo je poslano</h2>
        <p className="text-base text-mute">Hvala. Odgovorimo ti po elektronski pošti, običajno v enem delovnem dnevu.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4 rounded-3xl bg-s1 p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ime">
          <Input value={f.name} onChange={up("name")} autoComplete="name" maxLength={80} />
        </Field>
        <Field label="Lokal (neobvezno)">
          <Input value={f.venue} onChange={up("venue")} maxLength={80} />
        </Field>
        <Field label="Elektronski naslov">
          <Input type="email" value={f.email} onChange={up("email")} autoComplete="email" inputMode="email" required maxLength={120} />
        </Field>
        <Field label="Telefon (neobvezno)">
          <Input type="tel" value={f.phone} onChange={up("phone")} autoComplete="tel" maxLength={30} />
        </Field>
      </div>
      <Field label="Sporočilo">
        <Textarea value={f.message} onChange={up("message")} required maxLength={2000} className="min-h-32" />
      </Field>
      {error && (
        <p role="alert" className="rounded-xl border border-line bg-s2 px-4 py-3 text-sm text-bad">
          {error}
        </p>
      )}
      <div>
        <Button type="submit" size="lg" disabled={state === "sending"}>
          {state === "sending" ? <CircleNotch size={20} weight="bold" className="animate-spin" aria-hidden="true" /> : <PaperPlaneTilt size={20} weight="bold" aria-hidden="true" />}
          Pošlji sporočilo
        </Button>
      </div>
    </form>
  );
}
