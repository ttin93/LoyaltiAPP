import Link from "next/link";
import Logo from "./Logo";
import { BRAND_EMAIL, BRAND_TAGLINE } from "@/lib/brand";

const COLS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Loyavi",
    links: [
      { href: "/", label: "Za goste" },
      { href: "/partnerji", label: "Za lokale" },
      { href: "/partnerji#cenik", label: "Cenik" },
      { href: "/app", label: "Moja denarnica" },
    ],
  },
  {
    title: "Pomoč",
    links: [
      { href: "/#vprasanja", label: "Pogosta vprašanja" },
      { href: "/kontakt", label: "Kontakt" },
      { href: "/partner", label: "Prijava za lokale" },
    ],
  },
  {
    title: "Pravno",
    links: [
      { href: "/pogoji", label: "Pogoji uporabe" },
      { href: "/zasebnost", label: "Zasebnost" },
      { href: "/piskotki", label: "Piškotki" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="bg-fg text-white [--logo-gap:#0B1826]">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16 lg:flex-row lg:justify-between">
        <div className="flex max-w-xs flex-col gap-4">
          <Logo />
          <p className="text-sm text-white/60">{BRAND_TAGLINE} Kartice zvestobe iz tvojih najljubših lokalov na enem mestu.</p>
          <a href={`mailto:${BRAND_EMAIL}`} className="w-max rounded-lg text-sm font-medium text-white transition-all duration-700 ease-spring hover:text-white/70">
            {BRAND_EMAIL}
          </a>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:gap-16">
          {COLS.map((c) => (
            <nav key={c.title} aria-label={c.title} className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-white">{c.title}</p>
              {c.links.map((l) => (
                <Link key={l.href} href={l.href} className="w-max rounded-lg text-sm text-white/60 transition-all duration-700 ease-spring hover:text-white">
                  {l.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6 pb-8">
        <p className="text-xs text-white/40">© {new Date().getFullYear()} Loyavi. Narejeno v Sloveniji.</p>
      </div>
    </footer>
  );
}
