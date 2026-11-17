"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Logo from "./Logo";
import { DEMO } from "@/lib/demo";

export type NavLink = { href: string; label: string };

/**
 * Glava strani: široka bela lebdeča vrstica z logotipom levo, povezavami v sredini in gumbom desno.
 * Na telefonu se hamburger preoblikuje v X in odpre celozaslonski meni, povezave vstopijo z zamikom.
 */
export default function SiteNav({ links, cta }: { links: NavLink[]; cta: NavLink }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isCurrent = (href: string) => !href.includes("#") && href === pathname;

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-4">
        <nav aria-label="Glavna navigacija" className="pointer-events-auto mx-auto mt-4 flex w-full max-w-5xl items-center justify-between gap-4 rounded-full bg-card/95 py-2 pl-4 pr-2 shadow-pop backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Logo size={36} />
            {DEMO && (
              <Link
                href="/partnerji#demo"
                title="Loyavi je v demo obdobju: za lokale je brezplačen"
                className="hidden items-center gap-2 rounded-full bg-tint px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand-ink transition-all duration-700 ease-spring hover:bg-s2 sm:flex"
              >
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" aria-hidden="true" />
                  <span className="relative inline-flex size-2 rounded-full bg-accent" aria-hidden="true" />
                </span>
                Demo
              </Link>
            )}
          </div>
          <ul className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isCurrent(l.href) ? "page" : undefined}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-700 ease-spring hover:bg-s1 hover:text-fg ${isCurrent(l.href) ? "bg-s1 text-fg" : "text-mute"}`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <Link
              href={cta.href}
              className="group flex items-center gap-2 rounded-full bg-accent py-2 pl-4 pr-2 text-sm font-semibold text-on-accent transition-all duration-700 ease-spring hover:bg-accent-deep active:scale-[0.98]"
            >
              {cta.label}
              <span className="flex size-6 items-center justify-center rounded-full bg-white/20 transition-all duration-700 ease-spring group-hover:translate-x-0.5">
                <ArrowRight size={12} weight="bold" aria-hidden="true" />
              </span>
            </Link>
            <button
              type="button"
              aria-label={open ? "Zapri meni" : "Odpri meni"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="relative flex size-10 items-center justify-center rounded-full bg-s1 transition-all duration-700 ease-spring hover:bg-s2 active:scale-[0.98] lg:hidden"
            >
              <span className={`absolute h-0.5 w-4 rounded-full bg-fg transition-all duration-700 ease-spring ${open ? "rotate-45" : "-translate-y-1"}`} />
              <span className={`absolute h-0.5 w-4 rounded-full bg-fg transition-all duration-700 ease-spring ${open ? "-rotate-45" : "translate-y-1"}`} />
            </button>
          </div>
        </nav>
      </header>

      <div
        className={`fixed inset-0 z-30 flex flex-col justify-center bg-base/90 px-6 backdrop-blur-3xl transition-all duration-700 ease-spring lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        aria-hidden={!open}
      >
        <ul className="flex flex-col gap-6">
          {[...links, cta].map((l, i) => (
            <li key={l.href} className="overflow-hidden">
              <Link
                href={l.href}
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
                style={{ transitionDelay: open ? `${100 + i * 50}ms` : "0ms" }}
                className={`block text-4xl font-semibold tracking-tight text-fg transition-all duration-700 ease-spring ${open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
