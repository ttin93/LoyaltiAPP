import { Gift } from "@phosphor-icons/react/dist/ssr";
import { luminance, onColor, safeHex, shade, tint, withAlpha } from "@/lib/color";
import { categoryLabel } from "@/lib/categories";
import { visitsLeft } from "@/lib/sl";
import CategoryIcon from "./CategoryIcon";

/** Zasuk odtisa je stalen za vsako mesto, da je kartica videti ročno žigosana. */
const TILT = [-9, 6, -4, 10, -7, 5, -11, 8, -5, 9, -8, 4];

/**
 * Žigi kot odtisi štampiljke. `ink` je barva odtisa, `paper` barva podlage (izrez znaka v odtisu).
 * Prazna mesta so oštevilčena kot na papirnati kartici, zadnje mesto je nagrada.
 * `fresh` je indeks pravkar dodanega žiga (animacija odtisa).
 */
export function Stamps({ total, filled, category, ink, paper, fresh, max = 64 }: { total: number; filled: number; category?: string | null; ink: string; paper: string; fresh?: number; max?: number }) {
  const cols = total > 6 ? Math.ceil(total / 2) : total;
  return (
    <div
      className="grid w-full gap-2"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, maxWidth: cols * max + (cols - 1) * 8, color: ink }}
      role="img"
      aria-label={`${Math.min(filled, total)} od ${total} žigov`}
    >
      {Array.from({ length: total }).map((_, i) => {
        const on = i < filled;
        const last = i === total - 1;
        if (on) {
          return (
            <span
              key={i}
              className={`relative flex aspect-square items-center justify-center rounded-full ${fresh === i ? "animate-stamp-in" : ""}`}
              style={{ background: ink, color: paper, rotate: `${TILT[i % TILT.length]}deg` }}
            >
              <span className="absolute inset-1 rounded-full border border-dashed" style={{ borderColor: withAlpha(paper, 0.55) }} aria-hidden="true" />
              {last ? <Gift weight="fill" className="size-1/2" aria-hidden="true" /> : <CategoryIcon category={category} weight="fill" className="size-1/2" />}
            </span>
          );
        }
        return (
          <span key={i} className="flex aspect-square items-center justify-center rounded-full border-2 border-dashed" style={{ borderColor: withAlpha(ink, 0.32), color: withAlpha(ink, 0.55) }}>
            {last ? <Gift weight="bold" className="size-2/5" aria-hidden="true" /> : <span className="font-mono text-xs font-semibold">{i + 1}</span>}
          </span>
        );
      })}
    </div>
  );
}

/** Barva lokala, ki je berljiva na beli podlagi (svetle barve potemni). */
export function inkOnWhite(color: string | null | undefined): string {
  const c = safeHex(color);
  return luminance(c) > 0.45 ? shade(c, 0.45) : c;
}

/** Logotip lokala ali začetnici imena v krogu. */
export function VenueAvatar({ name, logoUrl, color, size = 44, className = "" }: { name: string; logoUrl?: string | null; color?: string | null; size?: number; className?: string }) {
  const bg = safeHex(color);
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logoUrl} alt="" width={size} height={size} className={`shrink-0 rounded-full bg-white object-cover ${className}`} style={{ width: size, height: size }} />;
  }
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-full font-semibold tracking-tight ${className}`} style={{ width: size, height: size, background: bg, color: onColor(bg), fontSize: size * 0.36 }} aria-hidden="true">
      {initials}
    </span>
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

function surface(bg: string) {
  return {
    background: `radial-gradient(120% 90% at 0% 0%, ${withAlpha("#ffffff", 0.2)} 0%, ${withAlpha("#ffffff", 0)} 55%), linear-gradient(160deg, ${tint(bg, 0.06)} 0%, ${bg} 50%, ${shade(bg, 0.14)} 100%)`,
    boxShadow: `inset 0 1px 0 ${withAlpha("#ffffff", 0.28)}, 0 22px 40px -24px ${withAlpha(shade(bg, 0.4), 0.8)}`,
  };
}

/**
 * Kartica zvestobe: predmet v barvi lokala z odtisi žigov, kot papirnata kartica, ki je ne izgubiš.
 * `bare`: brez imena in logotipa (na strani lokala, kjer sta že nad kartico).
 */
export default function LoyaltyCard({ card, fresh, bare = false, className = "" }: { card: CardData; fresh?: number; bare?: boolean; className?: string }) {
  const bg = safeHex(card.color);
  const fg = onColor(bg);
  const done = Math.min(card.stamps, card.goal);
  const left = card.goal - done;
  return (
    <div className={`relative flex w-full flex-col gap-6 overflow-hidden rounded-3xl p-6 ${className}`} style={{ ...surface(bg), color: fg }}>
      <div className="flex items-center gap-3">
        {!bare && <VenueAvatar name={card.name} logoUrl={card.logoUrl} color={fg === "#FFFFFF" ? "#FFFFFF" : "#0B1826"} size={44} className={card.logoUrl ? "ring-2 ring-white/40" : ""} />}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xl font-semibold tracking-tight">{bare ? "Kartica zvestobe" : card.name}</p>
          <p className="truncate text-sm font-medium opacity-75">{bare ? (left <= 0 ? "Vsi žigi so zbrani" : visitsLeft(left)) : `Kartica zvestobe · ${categoryLabel(card.category)}`}</p>
        </div>
        <p className="shrink-0 rounded-full px-3 py-1 font-mono text-sm font-semibold" style={{ background: withAlpha(fg, 0.14) }}>
          {done}/{card.goal}
        </p>
      </div>

      <Stamps total={card.goal} filled={done} category={card.category} ink={fg} paper={bg} fresh={fresh} />

      <div className="flex items-end justify-between gap-4 border-t border-dashed pt-4" style={{ borderColor: withAlpha(fg, 0.28) }}>
        <div className="min-w-0">
          <p className="text-xs font-medium opacity-70">Nagrada</p>
          <p className="truncate text-base font-semibold">{card.reward}</p>
        </div>
        {bare ? <Gift size={24} weight="fill" className="shrink-0 opacity-90" aria-hidden="true" /> : <p className="shrink-0 text-sm font-medium opacity-90">{left <= 0 ? "Kartica je polna" : visitsLeft(left).replace(" do nagrade", "")}</p>}
      </div>
    </div>
  );
}

/** Strnjena kartica za denarnico: ime, nagrada in napredek, en trak na žig. */
export function MiniPass({ card, ready = false, className = "" }: { card: CardData; ready?: boolean; className?: string }) {
  const bg = safeHex(card.color);
  const fg = onColor(bg);
  const done = Math.min(card.stamps, card.goal);
  const left = card.goal - done;
  return (
    <div className={`relative flex w-full flex-col gap-4 overflow-hidden rounded-3xl p-4 ${className}`} style={{ ...surface(bg), color: fg }}>
      <div className="flex items-center gap-3">
        <VenueAvatar name={card.name} logoUrl={card.logoUrl} color={fg === "#FFFFFF" ? "#FFFFFF" : "#0B1826"} size={44} className={card.logoUrl ? "ring-2 ring-white/40" : ""} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold tracking-tight">{card.name}</p>
          <p className="truncate text-sm font-medium opacity-80">{card.reward}</p>
        </div>
        {ready ? (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-fg">
            <Gift size={12} weight="fill" aria-hidden="true" />
            Nagrada čaka
          </span>
        ) : (
          <span className="shrink-0 font-mono text-sm font-semibold opacity-90">
            {done}/{card.goal}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="flex flex-1 gap-1" aria-hidden="true">
          {Array.from({ length: card.goal }).map((_, i) => (
            <span key={i} className="h-2 flex-1 rounded-full" style={{ background: i < done ? fg : withAlpha(fg, 0.24) }} />
          ))}
        </span>
        <span className="shrink-0 text-xs font-medium opacity-85">{left <= 0 ? "Kartica je polna" : visitsLeft(left).replace(" do nagrade", "")}</span>
      </div>
    </div>
  );
}
