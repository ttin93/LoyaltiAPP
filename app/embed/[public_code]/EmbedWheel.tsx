"use client";

import { useState } from "react";
import Wheel from "@/app/components/Wheel";
import { WHEEL_SLOTS, WHEEL_TARGET } from "@/lib/demo";

export default function EmbedWheel({ code, venueName }: { code: string; venueName: string }) {
  const [won, setWon] = useState<string | null>(null);

  function onResult(i: number) {
    const slot = WHEEL_SLOTS[i];
    const prize = slot.prize || "Nagrada";
    setWon(prize);
    try {
      window.parent?.postMessage({ type: "zig-win", prize }, "*");
    } catch {}
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-5">
      <div className="w-full max-w-sm rounded-3xl border border-[#E6DCC9] bg-[#FFFCF6] p-7 text-center shadow-[0_14px_40px_rgba(43,29,23,0.18)]">
        {!won ? (
          <>
            <div className="font-display text-[22px] font-extrabold">{venueName}</div>
            <p className="mb-6 mt-1 text-[14px] text-[#8A7A66]">Zavrti kolo in osvoji nagrado! 🎁</p>
            <div className="flex justify-center">
              <Wheel slots={WHEEL_SLOTS} target={WHEEL_TARGET} onResult={onResult} />
            </div>
            <p className="mt-5 text-[12px] text-[#A6967F]">1 vrtljaj na obiskovalca</p>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="text-6xl" style={{ animation: "popIn 0.5s cubic-bezier(0.2,1.4,0.5,1) both" }}>🎉</div>
            <div className="font-display text-[28px] font-extrabold">{won}!</div>
            <p className="max-w-[260px] text-[14.5px] leading-relaxed text-[#5C4C3E]">
              Registriraj se v {venueName}, da nagrado prevzameš in začneš zbirati žige.
            </p>
            <a
              href={`/p/${code}?prize=${encodeURIComponent(won)}`}
              target="_top"
              className="mt-3 flex h-13 w-full items-center justify-center rounded-full bg-[#2B1D17] px-6 py-3.5 text-[16px] font-semibold text-[#F5EFE6]"
            >
              Prevzemi nagrado
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
