"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Cake, Check, SignOut } from "@phosphor-icons/react/dist/ssr";
import { createBrowserSupabase } from "@/lib/supabase/ssrClient";
import { Button } from "./Button";
import { Field, Input, Select } from "./Field";
import { MONTHS, birthdayLabel } from "@/lib/sl";

export default function ProfileForm({ email, name, birthday }: { email: string; name: string | null; birthday: string | null }) {
  const router = useRouter();
  const [nm, setNm] = useState(name ?? "");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [busy, setBusy] = useState<"name" | "bday" | null>(null);
  const [saved, setSaved] = useState<"name" | "bday" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save(kind: "name" | "bday") {
    setError(null);
    setSaved(null);
    setBusy(kind);
    try {
      const body = kind === "name" ? { name: nm } : { birthday: `${month.padStart(2, "0")}-${day.padStart(2, "0")}` };
      const r = await fetch("/api/profile", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json();
      if (!j.ok) setError(j.error || "Shranjevanje ni uspelo.");
      else {
        setSaved(kind);
        router.refresh();
      }
    } catch {
      setError("Povezava ni uspela. Poskusi znova.");
    } finally {
      setBusy(null);
    }
  }

  async function signOut() {
    await createBrowserSupabase().auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-4 rounded-3xl bg-card shadow-card p-6">
        <Field label="Elektronski naslov">
          <Input value={email} disabled readOnly />
        </Field>
        <Field label="Ime" hint="Tako te bomo nagovorili v denarnici.">
          <Input value={nm} onChange={(e) => setNm(e.target.value)} placeholder="Tvoje ime" maxLength={60} autoComplete="given-name" />
        </Field>
        <div className="flex items-center gap-3">
          <Button type="button" variant="secondary" onClick={() => save("name")} disabled={busy !== null || nm.trim() === (name ?? "")}>
            Shrani ime
          </Button>
          {saved === "name" && (
            <span role="status" className="flex items-center gap-2 text-sm font-medium text-brand-ink">
              <Check size={16} weight="bold" aria-hidden="true" />
              Shranjeno
            </span>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-3xl bg-card shadow-card p-6">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-s3 text-brand-ink">
            <Cake size={24} weight="bold" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-fg">Rojstni dan</h2>
            <p className="text-sm text-mute">Potrebujemo samo dan in mesec. Lokali, ki to ponujajo, te takrat presenetijo z darilom.</p>
          </div>
        </div>
        {birthday ? (
          <p className="rounded-xl bg-s2 px-4 py-3 text-base font-medium text-fg">
            {birthdayLabel(birthday)} <span className="text-sm font-normal text-mute">· shranjeno, spremembe niso mogoče</span>
          </p>
        ) : (
          <>
            <div className="grid grid-cols-[1fr_2fr] gap-3">
              <Field label="Dan">
                <Select value={day} onChange={(e) => setDay(e.target.value)}>
                  <option value="">Dan</option>
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i} value={String(i + 1)}>
                      {i + 1}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Mesec">
                <Select value={month} onChange={(e) => setMonth(e.target.value)}>
                  <option value="">Mesec</option>
                  {MONTHS.map((m, i) => (
                    <option key={m} value={String(i + 1)}>
                      {m}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <p className="text-sm text-dim">Datum lahko vpišeš samo enkrat, zato ga preveri pred shranjevanjem.</p>
            <Button type="button" onClick={() => save("bday")} disabled={busy !== null || !day || !month} className="w-max">
              Shrani rojstni dan
            </Button>
          </>
        )}
      </section>

      {error && <p role="alert" className="rounded-xl border border-line bg-s2 px-4 py-3 text-sm text-bad">{error}</p>}

      <Button type="button" variant="secondary" onClick={signOut} className="w-max">
        <SignOut size={20} weight="bold" aria-hidden="true" />
        Odjava
      </Button>
    </div>
  );
}
