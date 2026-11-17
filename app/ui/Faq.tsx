"use client";

import { useState } from "react";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";

export type FaqItem = { q: string; a: string };

/** Harmonika z vprašanji: ena bela kartica, vrstice ločene s tanko črto, odprta vrstica je poudarjena. */
export default function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-3xl bg-card shadow-card">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <li key={it.q} className={`transition-all duration-700 ease-spring ${isOpen ? "bg-tint/40" : ""}`}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group flex w-full items-center gap-4 px-6 py-5 text-left"
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold transition-all duration-700 ease-spring ${isOpen ? "bg-brand text-on-brand" : "bg-tint text-brand-ink group-hover:bg-brand group-hover:text-on-brand"}`}
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={`flex-1 text-lg font-semibold tracking-tight transition-all duration-700 ease-spring ${isOpen ? "text-brand-ink" : "text-fg"}`}>{it.q}</span>
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-all duration-700 ease-spring ${isOpen ? "rotate-180 bg-brand text-on-brand" : "bg-s2 text-mute group-hover:bg-s3"}`}>
                  <CaretDown size={16} weight="bold" aria-hidden="true" />
                </span>
              </button>
            </h3>
            <div id={`faq-${i}`} className={`grid transition-all duration-700 ease-spring ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
              <div className="overflow-hidden">
                <p className="max-w-2xl pb-6 pl-18 pr-6 text-base text-mute">{it.a}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
