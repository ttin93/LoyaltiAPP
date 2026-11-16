"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cards, Compass, User } from "@phosphor-icons/react/dist/ssr";

const TABS = [
  { href: "/app", label: "Kartice", icon: Cards },
  { href: "/app/lokali", label: "Lokali", icon: Compass },
  { href: "/app/profil", label: "Profil", icon: User },
];

/** Lebdeča kapsula z zavihki: spodaj na telefonu, zgoraj na namizju. */
export default function AppTabs() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Denarnica"
      className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-4 lg:bottom-auto lg:top-6"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex items-center gap-1 rounded-full border border-line bg-s1/80 p-2 backdrop-blur-xl">
        {TABS.map((t) => {
          const on = pathname === t.href;
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={on ? "page" : undefined}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-700 ease-spring active:scale-[0.98] ${on ? "bg-brand text-on-brand" : "text-mute hover:bg-s2 hover:text-fg"}`}
              >
                <t.icon size={20} weight={on ? "fill" : "bold"} aria-hidden="true" />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
