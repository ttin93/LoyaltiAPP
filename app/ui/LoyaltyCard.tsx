import { Check, Gift } from "@phosphor-icons/react/dist/ssr";
import { onColor, safeHex, shade, tint, withAlpha } from "@/lib/color";
import { categoryLabel } from "@/lib/categories";
import Icon3D, { categoryIcon3D } from "./Icon3D";

/**
 * Vrsta žigov. Zadnje mesto je nagrada. `fresh` = indeks pravkar dodanega žiga (animacija).
 * `ink` je barva kljukice v polnem žigu (barva podlage, na kateri žigi stojijo).
 */
export function StampDots({ total, filled, size = "md", fresh, ink }: { total: number; filled: number; size?: "sm" | "md" | "lg"; fresh?: number; ink?: string }) {
  const dot = size === "lg" ? "size-10" : size === "md" ? "size-7" : "size-3";
  const gap = size === "lg" ? "gap-3" : size === "md" ? "gap-2" : "gap-1";
  const icon = size === "lg" ? 20 : 14;
  // Več kot 6 žigov: dve enaki vrsti (npr. 5 + 5), da zadnja pika ne ostane sama.
  const twoRows = total > 6;
  const cols = Math.ceil(total / 2);
  return (
    <div
      className={twoRows ? `grid w-max ${gap}` : `flex flex-wrap ${gap}`}
      style={twoRows ? { gridTemplateColumns: `repeat(${cols}, max-content)` } : undefined}
      role="img"
      aria-label={`${Math.min(filled, total)} od ${total} žigov`}
    >
      {Array.from({ length: total }).map((_, i) => {
        const on = i < filled;
        const last = i === total - 1;
        return (
          <span
            key={i}
            className={`${dot} flex items-center justify-center rounded-full ${on ? "bg-current" : "border-2 border-dashed border-current opacity-40"} ${fresh === i ? "animate-stamp-in" : ""}`}
          >
            {on && size !== "sm" && ink && <Check size={icon} weight="bold" style={{ color: ink }} aria-hidden="true" />}
            {last && !on && size !== "sm" && <Gift size={icon} weight="bold" aria-hidden="true" />}
          </span>
        );
      })}
    </div>
  );
}

export type CardData = {
  name: string;
  category?: string | null;
  color?: string | null;
  logoUrl?: string | null;
  stamps: number;
  goal: number;
  reward: string;
};

/** Kartica zvestobe lokala: barva lokala z globino, 3D grafika vrste lokala, žigi s kljukico. */
export default function LoyaltyCard({ card, size = "md", fresh, className = "" }: { card: CardData; size?: "sm" | "md"; fresh?: number; className?: string }) {
  const bg = safeHex(card.color);
  const fg = onColor(bg);
  const sm = size === "sm";
  return (
    <div
      className={`relative flex aspect-[1.586] w-full flex-col justify-between overflow-hidden ${sm ? "rounded-2xl p-4" : "rounded-3xl p-6"} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${tint(bg, 0.14)} 0%, ${bg} 42%, ${shade(bg, 0.24)} 100%)`,
        color: fg,
        boxShadow: `0 20px 40px -22px ${withAlpha(shade(bg, 0.35), 0.75)}`,
      }}
    >
      {/* okrasna kroga dajeta kartici globino */}
      <span className={`pointer-events-none absolute rounded-full ${sm ? "-right-8 -top-12 size-32" : "-right-12 -top-16 size-56"}`} style={{ background: withAlpha("#ffffff", 0.12) }} aria-hidden="true" />
      <span className={`pointer-events-none absolute rounded-full ${sm ? "-bottom-12 -left-8 size-24" : "-bottom-20 -left-12 size-48"}`} style={{ background: withAlpha("#ffffff", 0.07) }} aria-hidden="true" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {card.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={card.logoUrl} alt="" className={`${sm ? "size-8" : "size-12"} shrink-0 rounded-full bg-white object-cover`} />
          )}
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-widest opacity-75">{categoryLabel(card.category)}</p>
            <p className={`${sm ? "text-lg" : "text-2xl"} truncate font-semibold tracking-tight`}>{card.name}</p>
          </div>
        </div>
        <Icon3D name={categoryIcon3D(card.category)} size={sm ? 44 : 80} className={`shrink-0 -rotate-6 drop-shadow-lg ${sm ? "-mr-1 -mt-1" : "-mr-2 -mt-2"}`} />
      </div>

      <div className={`relative flex flex-col ${sm ? "gap-2" : "gap-3"}`}>
        <StampDots total={card.goal} filled={card.stamps} size={sm ? "sm" : "md"} fresh={fresh} ink={bg} />
        <div className="flex items-end justify-between gap-3">
          <p className={`${sm ? "text-xs" : "text-sm"} truncate font-medium opacity-90`}>{card.reward}</p>
          <p className={`${sm ? "text-xs" : "text-sm"} shrink-0 rounded-full px-2 py-0.5 font-mono font-semibold`} style={{ background: withAlpha(fg === "#FFFFFF" ? "#ffffff" : "#0b1826", 0.16) }}>
            {Math.min(card.stamps, card.goal)}/{card.goal}
          </p>
        </div>
      </div>
    </div>
  );
}
