import { Gift } from "@phosphor-icons/react/dist/ssr";
import { onColor, safeHex } from "@/lib/color";
import { categoryLabel } from "@/lib/categories";
import CategoryIcon from "./CategoryIcon";

/** Vrsta žigov. Zadnje mesto je nagrada. `fresh` = indeks pravkar dodanega žiga (animacija). */
export function StampDots({ total, filled, size = "md", fresh }: { total: number; filled: number; size?: "sm" | "md" | "lg"; fresh?: number }) {
  const dot = size === "lg" ? "size-10" : size === "md" ? "size-6" : "size-3";
  const gap = size === "lg" ? "gap-3" : size === "md" ? "gap-2" : "gap-1";
  const icon = size === "lg" ? 20 : 12;
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
            className={`${dot} flex items-center justify-center rounded-full border-2 border-current ${on ? "bg-current" : "opacity-30"} ${fresh === i ? "animate-stamp-in" : ""}`}
          >
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

/** Kartica zvestobe lokala. Ploska barva, ki jo izbere lokal; besedilo se samo prilagodi. */
export default function LoyaltyCard({ card, size = "md", fresh, className = "" }: { card: CardData; size?: "sm" | "md"; fresh?: number; className?: string }) {
  const bg = safeHex(card.color);
  const fg = onColor(bg);
  const sm = size === "sm";
  return (
    <div
      className={`relative flex aspect-[1.586] w-full flex-col justify-between overflow-hidden ${sm ? "rounded-2xl p-4" : "rounded-3xl p-6"} ${className}`}
      style={{ background: bg, color: fg }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`${sm ? "text-xs" : "text-xs"} font-medium uppercase tracking-widest opacity-70`}>{categoryLabel(card.category)}</p>
          <p className={`${sm ? "text-lg" : "text-2xl"} truncate font-semibold tracking-tight`}>{card.name}</p>
        </div>
        <span
          className={`${sm ? "size-8" : "size-12"} flex shrink-0 items-center justify-center overflow-hidden rounded-full`}
          style={{ background: fg === "#FFFFFF" ? "rgba(255,255,255,0.16)" : "rgba(11,24,38,0.1)" }}
        >
          {card.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={card.logoUrl} alt="" className="size-full object-cover" />
          ) : (
            <CategoryIcon category={card.category} size={sm ? 16 : 24} weight="bold" />
          )}
        </span>
      </div>
      <div className={`flex flex-col ${sm ? "gap-2" : "gap-3"}`}>
        <StampDots total={card.goal} filled={card.stamps} size={sm ? "sm" : "md"} fresh={fresh} />
        <div className="flex items-end justify-between gap-3">
          <p className={`${sm ? "text-xs" : "text-sm"} truncate font-medium opacity-80`}>{card.reward}</p>
          <p className={`${sm ? "text-xs" : "text-sm"} shrink-0 font-mono font-medium`}>
            {Math.min(card.stamps, card.goal)}/{card.goal}
          </p>
        </div>
      </div>
    </div>
  );
}
