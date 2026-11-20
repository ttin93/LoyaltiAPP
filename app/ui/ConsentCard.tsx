"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CircleNotch } from "@phosphor-icons/react/dist/ssr";
import { createBrowserSupabase } from "@/lib/supabase/ssrClient";
import { Button } from "./Button";
import { Checkbox } from "./Field";

const link = "font-medium text-fg underline underline-offset-4 transition-all duration-700 ease-spring hover:text-brand-ink";

/**
 * Korak po prvi prijavi: gost sprejme pogoje (obvezno) in izbere, ali želi ponudbe lokalov (po želji).
 * Polji sta ločeni in privzeto prazni, ker privolitev v ponudbe ne sme biti pogoj za uporabo kartice.
 */
export default function ConsentCard({ next, email }: { next: string; email: string }) {
  const router = useRouter();
  const [terms, setTerms] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [busy, setBusy] = useState<"save" | "leave" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function post(body: Record<string, unknown>) {
    const r = await fetch("/api/consent", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    return (await r.json()) as { ok: boolean; error?: string };
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!terms) return setError("Za nadaljevanje označi prvo polje.");
    setBusy("save");
    try {
      const j = await post({ accept: true, marketing });
      if (!j.ok) return setError(j.error || "Shranjevanje ni uspelo. Poskusi znova.");
      router.replace(next);
      router.refresh();
    } catch {
      setError("Povezava ni uspela. Preveri internet in poskusi znova.");
    } finally {
      setBusy(null);
    }
  }

  async function leave() {
    setError(null);
    setBusy("leave");
    try {
      await post({ decline: true });
      await createBrowserSupabase().auth.signOut();
      router.replace("/");
      router.refresh();
    } catch {
      setError("Odjava ni uspela. Poskusi znova.");
      setBusy(null);
    }
  }

  return (
    <form onSubmit={save} className="flex w-full flex-col gap-6" noValidate>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-fg">Še zadnji korak</h1>
        <p className="text-base text-mute">
          Prijava je uspela za naslov <span className="font-medium text-fg">{email}</span>. Preden začneš zbirati žige, potrdi spodnje.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Checkbox
          checked={terms}
          onChange={(v) => {
            setTerms(v);
            if (v) setError(null); // opozorilo o obveznem polju ni več potrebno
          }}
          tag="Obvezno"
        >
          <span className="text-base text-fg">
            Imam vsaj 15 let, sprejemam{" "}
            <a href="/pogoji" target="_blank" rel="noreferrer" className={link}>
              pogoje uporabe
            </a>{" "}
            in poznam{" "}
            <a href="/zasebnost" target="_blank" rel="noreferrer" className={link}>
              politiko zasebnosti
            </a>
            .
          </span>
        </Checkbox>
        <Checkbox checked={marketing} onChange={setMarketing} tag="Po želji">
          <span className="text-base text-fg">Želim ponudbe, novosti in darilo za rojstni dan od lokalov, pri katerih zbiram žige.</span>
          <span>Pošljejo jih po elektronski pošti prek Loyavi. Odjaviš se lahko kadar koli, v vsakem sporočilu ali v profilu.</span>
        </Checkbox>
      </div>

      {error && <p role="alert" className="rounded-xl border border-line bg-s2 px-4 py-3 text-sm text-bad">{error}</p>}

      <div className="flex flex-col gap-3">
        <Button type="submit" size="lg" full disabled={busy !== null}>
          {busy === "save" ? <CircleNotch size={20} weight="bold" className="animate-spin" aria-hidden="true" /> : null}
          Potrdi in nadaljuj
          {busy !== "save" && <ArrowRight size={16} weight="bold" aria-hidden="true" />}
        </Button>
        <Button type="button" variant="ghost" size="lg" full onClick={leave} disabled={busy !== null}>
          Ne strinjam se, odjavi me
        </Button>
      </div>

      <p className="text-sm text-dim">Obvestilo, da je kartica polna in te čaka nagrada, dobiš v vsakem primeru, ker je del kartice.</p>
    </form>
  );
}
