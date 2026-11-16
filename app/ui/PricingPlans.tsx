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
  { key: "start" as const, name: "Lokal", desc: "Za en lokal.", locations: "1 lokacija" },
  { key: "grow" as const, name: "Veriga", desc: "Za več lokalov pod enim računom.", locations: "Do 5 lokacij" },
];

export default function PricingPlans({ cta = "/partner" }: { cta?: string }) {
  const [yearly, setYearly] = useState(false);
  return (
    <div className="flex flex-col gap-8">
      <div className="flex w-max items-center gap-1 rounded-full border border-line bg-s1 p-1" role="group" aria-label="Obračun">
        {[
          { v: false, label: "Mesečno" },
          { v: true, label: `Letno, ${YEARLY_FREE_MONTHS} meseca brezplačno` },
        ].map((o) => (
          <button
            key={o.label}
            type="button"
            aria-pressed={yearly === o.v}
            onClick={() => setYearly(o.v)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-700 ease-spring ${yearly === o.v ? "bg-brand text-on-brand" : "text-mute hover:text-fg"}`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {TIERS.map((t, i) => {
          const monthly = PLANS[t.key].monthly ?? 0;
          const price = yearly ? (monthly * YEARLY_MONTHS) / 12 : monthly;
          return (
            <div key={t.key} className={`flex flex-col gap-6 rounded-3xl border p-8 ${i === 0 ? "border-brand bg-tint" : "border-line bg-s1"}`}>
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-semibold tracking-tight text-fg">{t.name}</h3>
                <p className="text-base text-mute">{t.desc}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="flex items-baseline gap-2">
                  <span className="font-mono text-5xl font-semibold tracking-tight text-fg">{eur(price)} €</span>
                  <span className="text-base text-mute">na mesec</span>
                </p>
                <p className="text-sm text-dim">{yearly ? `Obračun enkrat letno: ${eur(monthly * YEARLY_MONTHS)} €.` : "Obračun mesečno, brez vezave."}</p>
              </div>
              <ul className="flex flex-col gap-3">
                {[t.locations, ...INCLUDED].map((f) => (
                  <li key={f} className="flex items-start gap-3 text-base text-fg">
                    <Check size={20} weight="bold" className="mt-0.5 shrink-0 text-brand-ink" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              <ButtonLink href={cta} variant={i === 0 ? "primary" : "secondary"} size="lg" full className="mt-auto">
                Preizkusi 30 dni brezplačno
                <ArrowRight size={16} weight="bold" aria-hidden="true" />
              </ButtonLink>
            </div>
          );
        })}
      </div>
      <p className="text-sm text-mute">
        Prvih 30 dni je brezplačnih in brez vpisa kartice. Cene so brez DDV. Več kot 5 lokacij? Piši nam na info@loyavi.app in pripravimo ponudbo.
      </p>
    </div>
  );
}
