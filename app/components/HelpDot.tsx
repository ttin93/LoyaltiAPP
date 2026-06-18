"use client";

import { useState } from "react";

/** Mali "?" v krogu; klik odpre razlago. Uporabi povsod ob naslovih/nastavitvah. */
export default function HelpDot({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label="Pomoč"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        className="flex h-[18px] w-[18px] items-center justify-center rounded-full border border-[#C9BCA5] text-[11px] font-bold leading-none text-[#8A7A66] hover:border-[#8A7A66]"
      >
        ?
      </button>
      {open && (
        <span className="absolute left-1/2 top-[26px] z-40 w-60 -translate-x-1/2 rounded-xl bg-[#2B1D17] px-3 py-2.5 text-left text-[12px] font-normal normal-case leading-snug tracking-normal text-[#F5EFE6] shadow-[0_10px_30px_rgba(43,29,23,0.35)]">
          {text}
        </span>
      )}
    </span>
  );
}
