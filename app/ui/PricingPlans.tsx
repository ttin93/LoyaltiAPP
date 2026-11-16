"use client";

import { useState } from "react";
import { ArrowRight, Check } from "@phosphor-icons/react/dist/ssr";
import { ButtonLink } from "./Button";
import { PLANS, YEARLY_MONTHS, YEARLY_FREE_MONTHS } from "@/lib/plans";

const eur = (n: number) => n.toLocaleString("sl-SI", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const INCLUDED = [
  "Digitalna kartica zvestobe z tvojimi nagradami",
  "Beleženje obiskov z računom ali stojalom",
  "Kolo dobrodošlice za nove goste",
  "Povabilo k oceni na Googlu po obisku",
  "Samodejna sporočila in kampanje po elektronski pošti",
  "Nadzorna plošča z gosti, obiski in ocenami",
];

const TIERS = [
  { key: "start" as const, name: "Lokal", desc: "Za en lokal.", locations: "1 lokacija", featured: true },
  { key: "grow" as const, name: "Veriga", desc: "Za več lokalov pod enim računom.", locations: "Do 5 lokacij", featured: false },
];

export default function PricingPlans({ cta = "/partner" }: { cta?: string }) {
  const [yearly, setYearly] = useState(false);
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex w-max max-w-full items-center gap-1 rounded-full bg-card p-1 shadow-card" role="group" aria-label="Obračun">
        {[
          { v: false, label: "Mesečno" },
          { v: true, label: `Letno, ${YEARLY_FREE_MONTHS} meseca brezplačno` },
        ].map((o) => (
          <button
            key={o.label}
            type="button"
            aria-pressed={yearly === o.v}
            onClick={() => setYearly(o.v)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-700 ease-spring ${yearly === o.v ? "bg-fg text-card" : "text-mute hover:text-fg"}`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="grid w-full max-w-4xl gap-4 lg:grid-cols-2">
        {TIERS.map((t) => {
          const monthly = PLANS[t.key].monthly ?? 0;
          const price = yearly ? (monthly * YEARLY_MONTHS) / 12 : monthly;
          const f = t.featured;
          return (
            <div key={t.key} className={`flex flex-col gap-6 rounded-3xl p-8 ${f ? "atmo-brand text-on-brand shadow-brand" : "bg-card text-fg shadow-card"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-2">
                  <h3 className="text-2xl font-semibold tracking-tight">{t.name}</h3>
                  <p className={`text-base ${f ? "text-white/85" : "text-mute"}`}>{t.desc}</p>
                </div>
                {f && <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-ink">Najpogostejša izbira</span>}
              </div>
              <div className="flex flex-col gap-1">
                <p className="flex items-baseline gap-2">
                  <span className="font-mono text-5xl font-semibold tracking-tight">{eur(price)} €</span>
                  <span className={`text-base ${f ? "text-white/85" : "text-mute"}`}>na mesec</span>
                </p>
                <p className={`text-sm ${f ? "text-white/75" : "text-dim"}`}>{yearly ? `Obračun enkrat letno: ${eur(monthly * YEARLY_MONTHS)} €.` : "Obračun mesečno, brez vezave."}</p>
              </div>
              <ul className="flex flex-col gap-3">
                {[t.locations, ...INCLUDED].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-base">
                    <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${f ? "bg-white text-brand-ink" : "bg-tint text-brand-ink"}`}>
                      <Check size={12} weight="bold" aria-hidden="true" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <ButtonLink href={cta} variant={f ? "dark" : "primary"} size="lg" full className="mt-auto">
                Preizkusi 30 dni brezplačno
                <ArrowRight size={16} weight="bold" aria-hidden="true" />
              </ButtonLink>
            </div>
          );
        })}
      </div>
      <p className="max-w-2xl text-center text-sm text-mute">
        Prvih 30 dni je brezplačnih in brez vpisa kartice. Cene so brez DDV. Več kot 5 lokacij? Piši nam na info@loyavi.app in pripravimo ponudbo.
      </p>
    </div>
  );
}
