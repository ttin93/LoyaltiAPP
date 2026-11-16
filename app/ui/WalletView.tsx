import Link from "next/link";
import { ArrowRight, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import LoyaltyCard, { type CardData } from "./LoyaltyCard";
import RewardTicket from "./RewardTicket";
import Icon3D, { categoryIcon3D, type Icon3DName } from "./Icon3D";
import { ButtonLink } from "./Button";
import { form, visitsLeft } from "@/lib/sl";

export type WalletCard = { id: string; href: string; card: CardData };
export type WalletReward = { id: string; href: string; name: string; venue: string; category: string; active: boolean };

function Tile({ href, icon, title, text }: { href: string; icon: Icon3DName; title: string; text: string }) {
  return (
    <Link href={href} className="group flex items-center gap-4 rounded-3xl bg-card p-4 shadow-card transition-all duration-700 ease-spring hover:-translate-y-1 hover:shadow-pop active:scale-[0.98]">
      <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-tint">
        <Icon3D name={icon} size={52} className="transition-all duration-700 ease-spring group-hover:scale-110" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold tracking-tight text-fg">{title}</span>
        <span className="block text-sm text-mute">{text}</span>
      </span>
      <ArrowRight size={20} weight="bold" className="shrink-0 text-dim transition-all duration-700 ease-spring group-hover:translate-x-1 group-hover:text-fg" aria-hidden="true" />
    </Link>
  );
}

/** Denarnica: nagrade, kartice in bližnjice. Samo prikaz, podatke pripravi stran. */
export default function WalletView({ name, cards, rewards, showBirthday, extra }: { name: string | null; cards: WalletCard[]; rewards: WalletReward[]; showBirthday: boolean; extra?: React.ReactNode }) {
  const initial = (name || "G").trim().charAt(0).toUpperCase();
  const stamps = cards.reduce((a, c) => a + c.card.stamps, 0);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      {/* pozdrav */}
      <header className="flex items-center gap-4 lg:col-start-1 lg:row-start-1">
        <Link href="/app/profil" aria-label="Profil" className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand text-xl font-semibold text-on-brand shadow-brand transition-all duration-700 ease-spring hover:scale-105 active:scale-[0.98]">
          {initial}
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-mute">{name ? `Živjo, ${name}` : "Živjo"}</p>
          <h1 className="text-3xl font-semibold tracking-tight text-fg lg:text-4xl">Moja denarnica</h1>
        </div>
        {cards.length > 0 && (
          <dl className="hidden items-center gap-2 sm:flex">
            {[
              [String(cards.length), form(cards.length, "kartica")],
              [String(stamps), form(stamps, "zig")],
              [String(rewards.length), form(rewards.length, "nagrada")],
            ].map(([v, l]) => (
              <div key={l} className="flex flex-col items-center rounded-2xl bg-card px-4 py-2 shadow-card">
                <dd className="font-mono text-xl font-semibold text-fg">{v}</dd>
                <dt className="text-xs text-mute">{l}</dt>
              </div>
            ))}
          </dl>
        )}
      </header>

      {/* nagrade: na telefonu vodoravni trak, na namizju desni stolpec */}
      {rewards.length > 0 && (
        <section aria-label="Nagrade, ki te čakajo" className="flex min-w-0 flex-col gap-3 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <h2 className="flex items-center justify-between text-lg font-semibold tracking-tight text-fg">
            Nagrade
            <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-xs font-semibold text-on-accent">{rewards.length}</span>
          </h2>
          <div className="-mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-4 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
            {rewards.map((r) => (
              <RewardTicket
                key={r.id}
                href={r.href}
                name={r.name}
                venue={r.venue}
                label={r.active ? "Prevzem poteka" : "Čaka te"}
                icon={r.active ? "darilo" : categoryIcon3D(r.category)}
                className={rewards.length > 1 ? "w-[88%] shrink-0 snap-center lg:w-auto" : "w-full shrink-0"}
              />
            ))}
          </div>
        </section>
      )}

      {/* kartice */}
      <section aria-label="Kartice" className="flex min-w-0 flex-col gap-4 lg:col-start-1 lg:row-span-2 lg:row-start-2">
        {cards.length === 0 ? (
          <div className="flex flex-col items-center gap-6 rounded-3xl bg-card p-8 text-center shadow-card">
            <Icon3D name="denarnica" size={120} className="drop-shadow-lg" />
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
            <h2 className="text-lg font-semibold tracking-tight text-fg">Kartice</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {cards.map(({ id, href, card }) => {
                const left = card.goal - card.stamps;
                return (
                  <Link key={id} href={href} className="group flex flex-col gap-3 rounded-3xl transition-all duration-700 ease-spring active:scale-[0.98]">
                    <LoyaltyCard card={card} className="transition-all duration-700 ease-spring group-hover:-translate-y-1" />
                    <span className="flex items-center gap-3 px-2">
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-s3" aria-hidden="true">
                        <span className="block h-full rounded-full bg-brand" style={{ width: `${Math.min(100, (card.stamps / card.goal) * 100)}%` }} />
                      </span>
                      <span className="shrink-0 text-sm font-medium text-mute">{left <= 0 ? "Kartica je polna" : visitsLeft(left).replace(" do nagrade", "")}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* bližnjice */}
      <section aria-label="Bližnjice" className="flex flex-col gap-3 lg:col-start-2 lg:row-start-3">
        <Tile href="/app/lokali" icon="drugo" title="Odkrij lokale" text="Poišči nove kartice v svojem kraju." />
        {showBirthday && <Tile href="/app/profil" icon="torta" title="Dodaj rojstni dan" text="Lokali te lahko takrat presenetijo z darilom." />}
        {extra}
      </section>
    </div>
  );
}
