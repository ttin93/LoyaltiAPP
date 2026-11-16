"use client";

import { useState } from "react";
import { Plus } from "@phosphor-icons/react/dist/ssr";

export type FaqItem = { q: string; a: string };

export default function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <ul className="flex flex-col gap-3">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <li key={it.q} className="rounded-2xl bg-card shadow-card">
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 rounded-2xl p-6 text-left text-lg font-medium text-fg transition-all duration-700 ease-spring hover:bg-s2"
              >
                {it.q}
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-full bg-s3 text-fg transition-all duration-700 ease-spring ${isOpen ? "rotate-45 bg-brand text-on-brand" : ""}`}>
                  <Plus size={16} weight="bold" aria-hidden="true" />
                </span>
              </button>
            </h3>
            <div
              id={`faq-${i}`}
              className={`grid transition-all duration-700 ease-spring ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
              <div className="overflow-hidden">
                <p className="max-w-2xl px-6 pb-6 text-base text-mute">{it.a}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
