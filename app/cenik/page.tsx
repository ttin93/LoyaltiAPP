"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/app/components/icons";
import { PRICING } from "@/lib/demo";

export default function Cenik() {
  const [yearly, setYearly] = useState(false);

  return (
    <main className="mx-auto w-full max-w-md px-6 pb-16 pt-10">
      <nav className="mb-10 flex items-center justify-between">
        <Link href="/" className="font-display text-[20px] font-extrabold">Žig</Link>
        <Link href="/partner" className="text-[14px] font-semibold text-[#5C4C3E] underline">Prijava</Link>
      </nav>

      <h1 className="font-display text-[36px] font-extrabold leading-[1.05]">Izberi svoj paket</h1>
      <p className="mt-2 text-[16px] leading-relaxed text-[#5C4C3E]">Brez vezave. Začni z osnovnim, nadgradi kadarkoli.</p>

      {/* preklop */}
      <div className="mt-6 flex items-center justify-center">
        <div className="flex items-center rounded-full bg-[#EDE3D0] p-1 text-[14px] font-semibold">
          <button onClick={() => setYearly(false)} className={`rounded-full px-5 py-2 ${!yearly ? "bg-[#2B1D17] text-[#F5EFE6]" : "text-[#5C4C3E]"}`}>Mesečno</button>
          <button onClick={() => setYearly(true)} className={`rounded-full px-5 py-2 ${yearly ? "bg-[#2B1D17] text-[#F5EFE6]" : "text-[#5C4C3E]"}`}>Letno</button>
        </div>
      </div>
      {yearly && <div className="mt-2 text-center text-[13px] font-semibold text-[#5E7F52]">2 meseca gratis (plačaš 10 namesto 12)</div>}

      <div className="mt-7 flex flex-col gap-4">
        {PRICING.map((p) => {
          const price = yearly ? p.monthly * 10 : p.monthly;
          return (
            <div
              key={p.key}
              className="relative rounded-3xl border bg-[#FFFCF6] p-6"
              style={{ borderColor: p.popular ? "#E8A23D" : "#E6DCC9", borderWidth: p.popular ? 2 : 1 }}
            >
              {p.popular && (
                <div className="absolute -top-3 left-6 rounded-full bg-[#E8A23D] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#2B1D17]">Najbolj priljubljen</div>
              )}
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="font-display text-[24px] font-extrabold">{p.name}</div>
                  <div className="text-[13.5px] text-[#8A7A66]">{p.tagline}</div>
                </div>
                <div className="text-right">
                  <span className="font-display text-[32px] font-extrabold">{price}€</span>
                  <div className="text-[12px] text-[#8A7A66]">{yearly ? "/leto" : "/mesec"}</div>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2.5">
                {p.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[14px] text-[#41332A]">
                    <span className="mt-0.5 flex-shrink-0" style={{ color: p.accent }}><Icon name="check" color={p.accent} size={18} strokeWidth={2.2} /></span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/partner"
                className="mt-5 flex h-12 items-center justify-center rounded-full text-[15px] font-semibold"
                style={{ background: p.popular ? "#2B1D17" : "transparent", color: p.popular ? "#F5EFE6" : "#2B1D17", border: p.popular ? "none" : "1.5px solid #2B1D17" }}
              >
                Izberi {p.name}
              </Link>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-[13px] text-[#A6967F]">Vse cene brez DDV · plačila prek Stripe (pride) · prekličeš kadarkoli</p>
      <div className="mt-6 text-center">
        <Link href="/p/demo" className="text-[14px] font-semibold text-[#2B1D17] underline">Najprej poglej demo →</Link>
      </div>
    </main>
  );
}
