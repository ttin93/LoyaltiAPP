"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, Gift, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import Icon3D, { categoryIcon3D } from "./Icon3D";
import { VenueAvatar, inkOnWhite } from "./LoyaltyCard";
import { categoryLabel, CATEGORIES } from "@/lib/categories";
import { tint } from "@/lib/color";

export type DirectoryVenue = { code: string; name: string; category: string; city: string | null; color: string; logoUrl?: string | null; coverUrl?: string; reward: string; goal: number; mine: boolean };

const chip = (on: boolean) =>
  `shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-700 ease-spring active:scale-[0.98] ${on ? "bg-fg text-card" : "bg-card text-mute shadow-card hover:text-fg"}`;

export default function VenueDirectory({ venues }: { venues: DirectoryVenue[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  const cats = useMemo(() => {
    const present = new Set(venues.map((v) => v.category));
    return CATEGORIES.filter((c) => present.has(c.key));
  }, [venues]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return venues.filter(
      (v) => (!cat || v.category === cat) && (!needle || `${v.name} ${v.city ?? ""}`.toLowerCase().includes(needle)),
    );
  }, [venues, q, cat]);

  if (venues.length === 0) {
    return (
      <div className="flex flex-col gap-2 rounded-3xl bg-card p-8 shadow-card">
        <h2 className="text-2xl font-semibold tracking-tight text-fg">Prvi lokali se pravkar pridružujejo</h2>
        <p className="max-w-md text-base text-mute">
          Seznam se dopolnjuje z vsakim novim partnerjem. Če v lokalu opaziš stojalo Loyavi, skeniraj kodo na njem in kartica se doda v tvojo denarnico.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <MagnifyingGlass size={20} weight="bold" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-dim" aria-hidden="true" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Išči po imenu ali kraju"
          aria-label="Išči lokale"
          className="w-full rounded-2xl bg-card py-4 pl-12 pr-4 text-base text-fg shadow-card outline-none transition-all duration-700 ease-spring placeholder:text-dim focus:shadow-pop"
        />
      </div>

      {cats.length > 1 && (
        <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button type="button" onClick={() => setCat(null)} aria-pressed={cat === null} className={chip(cat === null)}>
            Vse
          </button>
          {cats.map((c) => (
            <button key={c.key} type="button" onClick={() => setCat(cat === c.key ? null : c.key)} aria-pressed={cat === c.key} className={chip(cat === c.key)}>
              {c.plural}
            </button>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <p className="rounded-3xl bg-card p-6 text-base text-mute shadow-card">Za ta iskalni niz ni zadetkov.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((v) => (
            <li key={v.code}>
              <Link href={`/p/${v.code}`} className="group block overflow-hidden rounded-3xl bg-card shadow-card transition-all duration-700 ease-spring hover:-translate-y-1 hover:shadow-pop active:scale-[0.98]">
                <div className="relative aspect-[2/1] overflow-hidden" style={{ background: `linear-gradient(160deg, ${tint(v.color, 0.5)} 0%, ${v.color} 100%)` }}>
                  {v.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.coverUrl} alt="" loading="lazy" className="size-full object-cover transition-all duration-700 ease-spring group-hover:scale-105" />
                  ) : (
                    <Icon3D name={categoryIcon3D(v.category)} size={120} className="absolute -bottom-5 right-3 rotate-6 drop-shadow-xl transition-all duration-700 ease-spring group-hover:scale-110" />
                  )}
                  {v.mine && (
                    <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-fg backdrop-blur-xl">
                      <Check size={12} weight="bold" aria-hidden="true" />V denarnici
                    </span>
                  )}
                </div>
                <div className="relative flex flex-col gap-2 p-4 pt-8">
                  <VenueAvatar name={v.name} logoUrl={v.logoUrl} color={v.color} size={48} className="absolute -top-6 left-4 shadow-card ring-4 ring-card" />
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold tracking-tight text-fg">{v.name}</p>
                    <p className="truncate text-sm text-mute">
                      {categoryLabel(v.category)}
                      {v.city ? ` · ${v.city}` : ""}
                    </p>
                  </div>
                  <p className="flex w-max max-w-full items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: tint(v.color, 0.88), color: inkOnWhite(v.color) }}>
                    <Gift size={12} weight="fill" className="shrink-0" aria-hidden="true" />
                    <span className="truncate">
                      {v.reward} po {v.goal} obiskih
                    </span>
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
