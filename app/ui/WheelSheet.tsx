"use client";

import { useState } from "react";
import { CircleNotch } from "@phosphor-icons/react/dist/ssr";
import Sheet from "./Sheet";
import { Button } from "./Button";
import { LogoMark } from "./Logo";

const r2 = (n: number) => Math.round(n * 100) / 100;

export function Wheel({ labels, rotation, winner }: { labels: string[]; rotation: number; winner: number | null }) {
  const n = labels.length;
  const cx = 100, cy = 100, r = 94, seg = 360 / n;
  const polar = (deg: number, rad = r) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [r2(cx + rad * Math.cos(a)), r2(cy + rad * Math.sin(a))];
  };
  const split = (s: string): string[] => {
    const words = s.trim().split(/\s+/);
    if (words.length < 2 || s.length <= 11) return [s];
    let best = 1, diff = Infinity;
    for (let k = 1; k < words.length; k++) {
      const d = Math.abs(words.slice(0, k).join(" ").length - words.slice(k).join(" ").length);
      if (d < diff) { diff = d; best = k; }
    }
    return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
  };
  return (
    <div className="relative mx-auto aspect-square w-full max-w-xs">
      <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1" aria-hidden="true">
        <svg width="28" height="24" viewBox="0 0 28 24"><path d="M14 23 L2 3 Q14 9 26 3 Z" fill="#E63F26" stroke="#FDFDFE" strokeWidth="2" /></svg>
      </div>
      <div style={{ transform: `rotate(${rotation}deg)`, transition: "transform 4600ms cubic-bezier(0.16,0.7,0.18,1)" }}>
        <svg viewBox="0 0 200 200" className="block w-full" role="img" aria-label="Kolo dobrodošlice">
          {labels.map((label, i) => {
            const [x0, y0] = polar(i * seg);
            const [x1, y1] = polar((i + 1) * seg);
            const mid = i * seg + seg / 2;
            const [lx, ly] = polar(mid, r * 0.62);
            const win = winner === i;
            const lines = split(label);
            return (
              <g key={i}>
                <path d={`M${cx} ${cy} L${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1} Z`} fill={win ? "#E63F26" : i % 2 ? "#E3F1FF" : "#1F8BF5"} stroke="#FDFDFE" strokeWidth="1.5" />
                <text x={lx} y={ly} transform={`rotate(${mid} ${lx} ${ly})`} textAnchor="middle" dominantBaseline="middle" fontSize={n > 6 ? 7.5 : 8.5} fontWeight="600" fill={win || i % 2 === 0 ? "#FFFFFF" : "#0B1826"} style={{ fontFamily: "var(--font-sans)" }}>
                  {lines.length === 1 ? lines[0] : (<><tspan x={lx} dy="-0.5em">{lines[0]}</tspan><tspan x={lx} dy="1.1em">{lines[1]}</tspan></>)}
                </text>
              </g>
            );
          })}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#D7DFE9" strokeWidth="2" />
        </svg>
      </div>
      <div className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-base bg-tint" aria-hidden="true">
        <LogoMark size={24} />
      </div>
    </div>
  );
}

/** Kolo dobrodošlice. Zmagovalni segment izbere strežnik, tu ga samo zavrtimo do njega. */
export default function WheelSheet({ open, venueCode, venueName, labels, onClose, onWon }: { open: boolean; venueCode: string; venueName: string; labels: string[]; onClose: () => void; onWon: () => void }) {
  const [phase, setPhase] = useState<"idle" | "loading" | "spinning" | "won">("idle");
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function spin() {
    setError(null);
    setPhase("loading");
    try {
      const r = await fetch("/api/wheel", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ venueCode }) });
      const j = await r.json();
      if (!j.ok) {
        setError(j.error || "Kolesa ni bilo mogoče zavrteti.");
        setPhase("idle");
        return;
      }
      const seg = 360 / labels.length;
      setPhase("spinning");
      setRotation(360 * 6 + (360 - (j.index * seg + seg / 2)));
      setTimeout(() => {
        setWinner(j.index);
        setPhase("won");
        onWon();
      }, 4800);
    } catch {
      setError("Povezava ni uspela. Poskusi znova.");
      setPhase("idle");
    }
  }

  return (
    <Sheet open={open} onClose={onClose} dismissable={phase === "idle" || phase === "won"} title={phase === "won" ? "Čestitke" : "Kolo dobrodošlice"}>
      <div className="flex flex-col gap-6">
        <p className="text-base text-mute">
          {phase === "won" && winner !== null
            ? `Tvoja nagrada pri lokalu ${venueName}:`
            : `Ker si nov gost lokala ${venueName}, imaš en poskus. Vsak segment je nagrada.`}
        </p>
        {phase === "won" && winner !== null && <p className="animate-pop-in rounded-2xl bg-brand p-6 text-center text-2xl font-semibold tracking-tight text-on-brand">{labels[winner]}</p>}
        <Wheel labels={labels} rotation={rotation} winner={winner} />
        {error && <p role="alert" className="rounded-xl border border-line bg-s2 px-4 py-3 text-sm text-bad">{error}</p>}
        {phase === "won" ? (
          <>
            <p className="text-sm text-mute">Kupon je shranjen v tvoji denarnici. Uporabiš ga lahko, ko zabeležiš naslednji obisk.</p>
            <Button type="button" size="lg" full onClick={onClose}>Odlično</Button>
          </>
        ) : (
          <Button type="button" size="lg" full onClick={spin} disabled={phase !== "idle"}>
            {phase === "loading" && <CircleNotch size={20} weight="bold" className="animate-spin" aria-hidden="true" />}
            {phase === "spinning" ? "Vrtim" : "Zavrti kolo"}
          </Button>
        )}
      </div>
    </Sheet>
  );
}
