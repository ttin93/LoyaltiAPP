import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Cake, Compass, Ticket } from "@phosphor-icons/react/dist/ssr";
import { getServiceClient } from "@/lib/supabase/server";
import { getGuest, memberships } from "@/lib/guest";
import { openCoupons } from "@/lib/coupons";
import { stampRewardNames, toVenueView } from "@/lib/venues";
import type { Venue } from "@/lib/types";
import LoyaltyCard from "@/app/ui/LoyaltyCard";
import { ButtonLink } from "@/app/ui/Button";
import InstallHint from "@/app/ui/InstallHint";
import { visitsLeft } from "@/lib/sl";

export const dynamic = "force-dynamic";

export default async function Wallet() {
  const guest = await getGuest();
  if (!guest) redirect("/prijava?next=/app");

  const db = getServiceClient();
  const ms = await memberships(db, guest.email);
  const venueIds = ms.map((m) => m.venue_id);
  const [{ data: venueRows }, rewards, coupons] = await Promise.all([
    venueIds.length ? db.from("venues").select("*").in("id", venueIds) : Promise.resolve({ data: [] as Venue[] }),
    stampRewardNames(db, venueIds),
    openCoupons(db, ms.map((m) => m.id)),
  ]);
  const venues = new Map(((venueRows ?? []) as Venue[]).map((v) => [v.id, toVenueView(v, rewards.get(v.id) ?? null)]));

  const ready = coupons.filter((c) => c.status === "ready" || c.status === "active");
  const readyVenues = new Set(ready.map((c) => c.venueId));
  const cards = ms
    .map((m) => ({ m, v: venues.get(m.venue_id) }))
    .filter((x): x is { m: (typeof ms)[number]; v: NonNullable<ReturnType<typeof venues.get>> } => !!x.v)
    .sort((a, b) => Number(readyVenues.has(b.v.id)) - Number(readyVenues.has(a.v.id)));
  const hasBirthday = !!guest.birthday || ms.some((m) => m.birthday);
  const first = guest.name?.split(" ")[0];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-mute">{first ? `Živjo, ${first}` : "Živjo"}</p>
        <h1 className="text-4xl font-semibold tracking-tight text-fg">Moje kartice</h1>
      </div>

      {ready.length > 0 && (
        <section aria-label="Nagrade, ki te čakajo" className="flex flex-col gap-3">
          {ready.map((c) => {
            const v = venues.get(c.venueId);
            if (!v) return null;
            return (
              <Link
                key={c.id}
                href={`/p/${v.code}?kupon=${c.id}`}
                className="flex items-center gap-4 rounded-2xl bg-brand p-4 text-on-brand transition-all duration-700 ease-spring hover:bg-brand-deep active:scale-[0.98]"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-tint text-brand-ink">
                  <Ticket size={24} weight="fill" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-lg font-semibold tracking-tight">{c.name}</span>
                  <span className="block truncate text-sm font-medium opacity-80">
                    {c.status === "active" ? "Unovčevanje poteka" : "Čaka te"} · {v.name}
                  </span>
                </span>
                <ArrowRight size={20} weight="bold" aria-hidden="true" />
              </Link>
            );
          })}
        </section>
      )}

      {cards.length === 0 ? (
        <section className="flex flex-col items-center gap-6 rounded-3xl border border-line bg-s1 p-8 text-center">
          <div className="w-64 opacity-60" aria-hidden="true">
            <LoyaltyCard card={{ name: "Tvoj lokal", category: "kavarna", color: "#DDE5EE", stamps: 0, goal: 8, reward: "Prva nagrada" }} size="sm" />
          </div>
          <div className="flex max-w-sm flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-fg">Denarnica je še prazna</h2>
            <p className="text-base text-mute">Ko si v lokalu, skeniraj kodo na stojalu Loyavi in kartica se doda sama. Lahko pa lokal poiščeš na seznamu.</p>
          </div>
          <ButtonLink href="/app/lokali">
            <Compass size={20} weight="bold" aria-hidden="true" />
            Poišči lokale
          </ButtonLink>
        </section>
      ) : (
        <section aria-label="Kartice" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ m, v }) => (
            <Link key={m.id} href={`/p/${v.code}`} className="group flex flex-col gap-3 rounded-3xl transition-all duration-700 ease-spring active:scale-[0.98]">
              <LoyaltyCard
                card={{ name: v.name, category: v.category, color: v.color, logoUrl: v.logoUrl, stamps: m.stamps ?? 0, goal: v.goal, reward: v.reward }}
                className="transition-all duration-700 ease-spring group-hover:-translate-y-1"
              />
              <span className="px-2 text-sm font-medium text-mute">{visitsLeft(v.goal - (m.stamps ?? 0))}</span>
            </Link>
          ))}
        </section>
      )}

      {cards.length > 0 && !hasBirthday && (
        <Link
          href="/app/profil"
          className="flex items-center gap-4 rounded-2xl border border-line bg-s1 p-4 transition-all duration-700 ease-spring hover:bg-s2 active:scale-[0.98]"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-s3 text-brand-ink">
            <Cake size={24} weight="bold" aria-hidden="true" />
          </span>
          <span className="flex-1">
            <span className="block text-base font-semibold text-fg">Dodaj rojstni dan</span>
            <span className="block text-sm text-mute">Lokali te lahko takrat presenetijo z darilom.</span>
          </span>
          <ArrowRight size={20} weight="bold" className="text-mute" aria-hidden="true" />
        </Link>
      )}

      <InstallHint />
    </div>
  );
}
