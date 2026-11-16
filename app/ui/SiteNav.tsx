"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { buttonClass } from "./Button";

export type NavLink = { href: string; label: string };

/**
 * Lebdeča steklena kapsula. Na telefonu se hamburger preoblikuje v X in odpre
 * celozaslonski meni, povezave vstopijo z zamikom.
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
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-4">
        <nav
          aria-label="Glavna navigacija"
          className="pointer-events-auto mx-auto mt-6 flex w-max max-w-full items-center gap-6 rounded-full border border-line bg-base/80 py-2 pl-4 pr-2 backdrop-blur-xl"
        >
          <Logo size={20} />
          <ul className="hidden items-center gap-6 lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isCurrent(l.href) ? "page" : undefined}
                  className={`rounded-lg text-sm font-medium transition-all duration-700 ease-spring hover:text-fg ${isCurrent(l.href) ? "text-fg" : "text-mute"}`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <Link href={cta.href} className={buttonClass("primary", "sm", false, "rounded-full")}>
              {cta.label}
            </Link>
            <button
              type="button"
              aria-label={open ? "Zapri meni" : "Odpri meni"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="relative flex size-10 items-center justify-center rounded-full bg-s2 transition-all duration-700 ease-spring hover:bg-s3 active:scale-[0.98] lg:hidden"
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
