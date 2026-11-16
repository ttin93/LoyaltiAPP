"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CaretRight, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import Icon3D, { categoryIcon3D } from "./Icon3D";
import { inputClass } from "./Field";
import { categoryLabel, CATEGORIES } from "@/lib/categories";
import { withAlpha } from "@/lib/color";

export type DirectoryVenue = { code: string; name: string; category: string; city: string | null; color: string; reward: string; goal: number; mine: boolean };

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
      <div className="flex flex-col gap-2 rounded-3xl bg-card shadow-card p-8">
        <h2 className="text-2xl font-semibold tracking-tight text-fg">Prvi lokali se pravkar pridružujejo</h2>
        <p className="max-w-md text-base text-mute">
          Seznam se dopolnjuje z vsakim novim partnerjem. Če v lokalu opaziš stojalo Loyavi, skeniraj kodo na njem in kartica se doda v tvojo denarnico.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <MagnifyingGlass size={20} weight="bold" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-dim" aria-hidden="true" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Išči po imenu ali kraju"
          aria-label="Išči lokale"
          className={`${inputClass} pl-12`}
        />
      </div>

      {cats.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCat(null)}
            aria-pressed={cat === null}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-700 ease-spring active:scale-[0.98] ${cat === null ? "bg-fg text-card" : "bg-card text-mute shadow-card hover:text-fg"}`}
          >
            Vse
          </button>
          {cats.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCat(cat === c.key ? null : c.key)}
              aria-pressed={cat === c.key}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-700 ease-spring active:scale-[0.98] ${cat === c.key ? "bg-fg text-card" : "bg-card text-mute shadow-card hover:text-fg"}`}
            >
              {c.plural}
            </button>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <p className="rounded-3xl bg-card shadow-card p-6 text-base text-mute">Za ta iskalni niz ni zadetkov.</p>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {shown.map((v) => (
            <li key={v.code}>
              <Link
                href={`/p/${v.code}`}
                className="group flex items-center gap-4 rounded-3xl bg-card p-4 shadow-card transition-all duration-700 ease-spring hover:-translate-y-1 hover:shadow-pop active:scale-[0.98]"
              >
                <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl" style={{ background: withAlpha(v.color, 0.16) }}>
                  <Icon3D name={categoryIcon3D(v.category)} size={52} className="transition-all duration-700 ease-spring group-hover:scale-110" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-lg font-semibold tracking-tight text-fg">{v.name}</span>
                    {v.mine && <span className="shrink-0 rounded-full bg-tint px-2 py-0.5 text-xs font-semibold text-brand-ink">V denarnici</span>}
                  </span>
                  <span className="block truncate text-sm text-mute">
                    {categoryLabel(v.category)}
                    {v.city ? ` · ${v.city}` : ""} · {v.reward}
                  </span>
                </span>
                <CaretRight size={20} weight="bold" className="shrink-0 text-dim" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
