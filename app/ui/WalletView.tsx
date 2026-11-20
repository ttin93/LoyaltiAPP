import Link from "next/link";
import { Cake, CaretRight, Compass, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { MiniPass, type CardData } from "./LoyaltyCard";
import Icon3D from "./Icon3D";
import { ButtonLink } from "./Button";

export type WalletCard = { id: string; href: string; card: CardData };
export type WalletReward = { id: string; href: string; name: string; venue: string; category: string; active: boolean };

function Row({ href, icon: I, title, text }: { href: string; icon: Icon; title: string; text: string }) {
  return (
    <Link href={href} className="group flex items-center gap-4 px-4 py-3 transition-all duration-700 ease-spring hover:bg-s1 active:scale-[0.99]">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-s1 text-fg">
        <I size={20} weight="bold" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-medium text-fg">{title}</span>
        <span className="block truncate text-sm text-mute">{text}</span>
      </span>
      <CaretRight size={16} weight="bold" className="shrink-0 text-dim transition-all duration-700 ease-spring group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
}

/** Denarnica: nagrade, ki čakajo, in kartice lokalov. Samo prikaz, podatke pripravi stran. */
export default function WalletView({ name, cards, rewards, showBirthday, extra }: { name: string | null; cards: WalletCard[]; rewards: WalletReward[]; showBirthday: boolean; extra?: React.ReactNode }) {
  const initial = (name || "G").trim().charAt(0).toUpperCase();
  const readyVenues = new Set(rewards.map((r) => r.venue));

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <header className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-mute">{name ? `Živjo, ${name}` : "Živjo"}</p>
          <h1 className="text-4xl font-semibold tracking-tight text-fg">Moje kartice</h1>
        </div>
        <Link href="/app/profil" aria-label="Profil" className="flex size-12 shrink-0 items-center justify-center rounded-full bg-fg text-lg font-semibold text-card transition-all duration-700 ease-spring hover:scale-105 active:scale-[0.98]">
          {initial}
        </Link>
      </header>

      {/* nagrade, ki čakajo na prevzem */}
      {rewards.length > 0 && (
        <section aria-label="Nagrade, ki te čakajo" className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-mute">{rewards.length === 1 ? "Nagrada te čaka" : "Nagrade te čakajo"}</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {rewards.map((r) => (
              <li key={r.id}>
                <Link href={r.href} className="group flex items-center gap-3 rounded-3xl bg-fg p-3 pr-4 text-card shadow-pop transition-all duration-700 ease-spring hover:-translate-y-0.5 active:scale-[0.98]">
                  <Icon3D name="darilo" size={56} className="shrink-0 -rotate-6 transition-all duration-700 ease-spring group-hover:rotate-0" />
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-balance text-lg font-semibold tracking-tight">{r.name}</span>
                    <span className="block truncate text-sm text-white/60">{r.venue}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-card px-4 py-2 text-sm font-semibold text-fg">{r.active ? "Odpri" : "Unovči"}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* kartice */}
      <section aria-label="Kartice" className="flex flex-col gap-3">
        {cards.length === 0 ? (
          <div className="flex flex-col items-center gap-6 rounded-3xl bg-card p-8 text-center shadow-card">
            <Icon3D name="denarnica" size={112} />
            <div className="flex max-w-sm flex-col gap-2">
              <h2 className="text-2xl font-semibold tracking-tight text-fg">Denarnica je še prazna</h2>
              <p className="text-base text-mute">Ko si v lokalu, skeniraj kodo na stojalu Loyavi in kartica se doda sama. Lahko pa lokal poiščeš na seznamu.</p>
            </div>
            <ButtonLink href="/app/lokali" size="lg">
              <MagnifyingGlass size={20} weight="bold" aria-hidden="true" />
              Poišči lokale
            </ButtonLink>
          </div>
        ) : (
          <>
            {rewards.length > 0 && <h2 className="text-sm font-semibold text-mute">Kartice</h2>}
            <ul className="grid gap-3 sm:grid-cols-2">
              {cards.map(({ id, href, card }) => (
                <li key={id}>
                  <Link href={href} className="block rounded-3xl transition-all duration-700 ease-spring hover:-translate-y-0.5 active:scale-[0.98]">
                    <MiniPass card={card} ready={readyVenues.has(card.name)} />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {/* bližnjice */}
      <section aria-label="Bližnjice" className="flex flex-col gap-3">
        <div className="divide-y divide-line/60 overflow-hidden rounded-3xl bg-card shadow-card">
          <Row href="/app/lokali" icon={Compass} title="Odkrij lokale" text="Poišči nove kartice v svojem kraju." />
          {showBirthday && <Row href="/app/profil" icon={Cake} title="Dodaj rojstni dan" text="Lokali te lahko takrat presenetijo z darilom." />}
        </div>
        {extra}
      </section>
    </div>
  );
}
