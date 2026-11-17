import type { ReactNode } from "react";
import { Info } from "@phosphor-icons/react/dist/ssr";
import SiteNav from "./SiteNav";
import SiteFooter from "./SiteFooter";
import { DEMO } from "@/lib/demo";

export const SITE_NAV = [
  { href: "/", label: "Za goste" },
  { href: "/partnerji", label: "Za lokale" },
  DEMO ? { href: "/partnerji#demo", label: "Demo" } : { href: "/partnerji#cenik", label: "Cenik" },
  { href: "/kontakt", label: "Kontakt" },
];
export const SITE_CTA = { href: "/app", label: "Odpri denarnico" };

export function Section({ h, children }: { h: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold tracking-tight text-fg">{h}</h2>
      <div className="flex flex-col gap-3 text-base text-mute [&_a]:font-medium [&_a]:text-brand-ink [&_a]:underline [&_a]:underline-offset-4 [&_strong]:font-semibold [&_strong]:text-fg">{children}</div>
    </section>
  );
}

/** Ovoj za pravna besedila (pogoji, zasebnost, piškotki). */
export default function LegalShell({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <>
      <SiteNav links={SITE_NAV} cta={SITE_CTA} />
      <main id="vsebina" className="mx-auto flex max-w-3xl flex-col gap-8 px-6 pb-24 pt-32">
        <header className="flex flex-col gap-3">
          <h1 className="display text-5xl text-fg lg:text-6xl">{title}</h1>
          <p className="text-sm text-dim">Zadnja posodobitev: {updated}</p>
        </header>
        <p className="flex items-start gap-3 rounded-2xl bg-s1 p-4 text-sm text-mute">
          <Info size={20} weight="fill" className="mt-0.5 shrink-0 text-brand-ink" aria-hidden="true" />
          Osnutek za informativne namene. Pred javno objavo naj dokument pregleda pravnik in dopolni podatke o ponudniku.
        </p>
        <div className="flex flex-col gap-8">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}
