"use client";

import { useState } from "react";

type Slot = { label: string; color: string; win?: boolean; prize?: string; big?: boolean };

export default function Wheel({
  slots,
  target,
  onResult,
  size = 260,
}: {
  slots: Slot[];
  target: number;
  onResult: (i: number) => void;
  size?: number;
}) {
  const [rot, setRot] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const n = slots.length;
  const seg = 360 / n;
  const C = 130;
  const R = 126;

  const rnd = (n: number) => Math.round(n * 100) / 100;
  const pt = (deg: number): [number, number] => {
    const r = (deg * Math.PI) / 180;
    return [rnd(C + R * Math.sin(r)), rnd(C - R * Math.cos(r))];
  };

  function spin() {
    if (spinning) return;
    setSpinning(true);
    const base = -(target * seg + seg / 2);
    const targetMod = ((base % 360) + 360) % 360;
    const curMod = ((rot % 360) + 360) % 360;
    let delta = targetMod - curMod;
    if (delta < 0) delta += 360;
    const jitter = (Math.random() - 0.5) * seg * 0.5;
    const next = rot + 360 * 5 + delta + jitter;
    setRot(next);
    setTimeout(() => {
      setSpinning(false);
      onResult(target);
    }, 4300);
  }

  return (
    <div className="relative flex flex-col items-center" style={{ width: size }}>
      {/* kazalec */}
      <div
        className="absolute z-10"
        style={{ top: -2, width: 0, height: 0, borderLeft: "13px solid transparent", borderRight: "13px solid transparent", borderTop: "20px solid #2B1D17" }}
      />
      <svg
        viewBox="0 0 260 260"
        width={size}
        height={size}
        style={{ transform: `rotate(${rot}deg)`, transition: "transform 4.2s cubic-bezier(0.16,1,0.3,1)" }}
      >
        <circle cx={C} cy={C} r={R + 3} fill="#2B1D17" />
        {slots.map((s, i) => {
          const a0 = i * seg;
          const a1 = (i + 1) * seg;
          const [x0, y0] = pt(a0);
          const [x1, y1] = pt(a1);
          const [lx, ly] = (() => {
            const r = ((a0 + seg / 2) * Math.PI) / 180;
            return [rnd(C + R * 0.62 * Math.sin(r)), rnd(C - R * 0.62 * Math.cos(r))];
          })();
          return (
            <g key={i}>
              <path d={`M${C} ${C} L${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1} Z`} fill={s.color} stroke="#FFFCF6" strokeWidth={1.5} />
              <text
                x={lx}
                y={ly}
                fontSize={s.big ? 13 : 11}
                fontWeight={s.big ? 800 : 600}
                fill={s.big ? "#2B1D17" : "#5C4C3E"}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${a0 + seg / 2} ${lx} ${ly})`}
                style={{ fontFamily: s.big ? "var(--font-display)" : "var(--font-sans)" }}
              >
                {s.label}
              </text>
            </g>
          );
        })}
        <circle cx={C} cy={C} r={26} fill="#FFFCF6" stroke="#2B1D17" strokeWidth={2} />
      </svg>
      <button
        onClick={spin}
        disabled={spinning}
        className="absolute flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#2B1D17] text-[11px] font-bold text-[#F5EFE6] disabled:opacity-70"
        style={{ top: size / 2 - 26, left: size / 2 - 26 }}
      >
        {spinning ? "…" : "ZAVRTI"}
      </button>
    </div>
  );
}
