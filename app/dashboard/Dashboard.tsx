"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowSquareOut, Cards, CreditCard, GearSix, Gift, LockKey, Megaphone, Pinwheel, Plus, QrCode, SignOut, SquaresFour, Star, Users,
} from "@phosphor-icons/react/dist/ssr";
import { DEMO } from "@/lib/demo";
import type { Icon } from "@phosphor-icons/react";
import { signOut } from "@/app/actions";
import Logo, { LogoMark } from "@/app/ui/Logo";
import { Select } from "@/app/ui/Field";
import Icon3D from "@/app/ui/Icon3D";
import { count } from "@/lib/sl";
import type { DashData } from "./data";
import { SECTION_KEYS, SECTION_LABEL, type SectionKey } from "./keys";
import { ToastProvider } from "./parts";
import Overview from "./sections/Overview";
import CardSection from "./sections/CardSection";
import Guests from "./sections/Guests";
import Marketing from "./sections/Marketing";
import Reviews from "./sections/Reviews";
import WheelSection from "./sections/WheelSection";
import Checkin from "./sections/Checkin";
import Settings from "./sections/Settings";
import Billing from "./sections/Billing";

const ICON: Record<SectionKey, Icon> = {
  pregled: SquaresFour,
  kartica: Cards,
  gostje: Users,
  marketing: Megaphone,
  ocene: Star,
  kolo: Pinwheel,
  obiski: QrCode,
  nastavitve: GearSix,
  narocnina: DEMO ? Gift : CreditCard,
};

export default function Dashboard({ data, initialSection, isNew, billingSuccess }: { data: DashData; initialSection: SectionKey; isNew: boolean; billingSuccess: boolean }) {
  const router = useRouter();
  const [section, setSection] = useState<SectionKey>(initialSection);
  const [menu, setMenu] = useState(false);
  const { venue, billing } = data;
  const locked = !billing.access.ok;

  const go = useCallback(
    (s: SectionKey) => {
      const next = locked ? "narocnina" : s;
      setSection(next);
      setMenu(false);
      window.history.replaceState(null, "", `/dashboard?v=${venue.id}&s=${next}`);
      window.scrollTo({ top: 0 });
    },
    [locked, venue.id],
  );

  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menu]);

  const canAdd = billing.venueCount < billing.maxVenues;
  const demo = billing.access.state === "demo";

  const navItems = (stagger: boolean) =>
    SECTION_KEYS.map((k, i) => {
      const I = ICON[k];
      const on = section === k;
      const off = locked && k !== "narocnina";
      return (
        <li key={k} className={stagger ? `transition-all duration-700 ease-spring ${menu ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}` : ""} style={stagger ? { transitionDelay: menu ? `${80 + i * 40}ms` : "0ms" } : undefined}>
          <button
            type="button"
            onClick={() => go(k)}
            disabled={off}
            aria-current={on ? "page" : undefined}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left font-medium transition-all duration-700 ease-spring active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 ${stagger ? "text-2xl" : "text-sm"} ${on ? "bg-s3 text-fg" : "text-mute hover:bg-s2 hover:text-fg"}`}
          >
            <I size={stagger ? 24 : 20} weight={on ? "fill" : "regular"} className={on ? "text-brand-ink" : ""} aria-hidden="true" />
            <span className="flex-1">{SECTION_LABEL[k]}</span>
            {off && <LockKey size={16} aria-hidden="true" />}
          </button>
        </li>
      );
    });

  const venuePicker = (
    <div className="flex flex-col gap-2">
      {data.venues.length > 1 ? (
        <Select aria-label="Izberi lokal" value={venue.id} onChange={(e) => router.push(`/dashboard?v=${e.target.value}`)} className="py-2 text-sm">
          {data.venues.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </Select>
      ) : (
        <p className="truncate px-3 text-sm font-semibold text-fg">{venue.name}</p>
      )}
      {canAdd ? (
        <Link href="/partner?new=1" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-mute transition-all duration-700 ease-spring hover:bg-s2 hover:text-fg">
          <Plus size={20} aria-hidden="true" />
          Dodaj lokal
        </Link>
      ) : demo ? (
        <button type="button" onClick={() => go("narocnina")} className="flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-mute transition-all duration-700 ease-spring hover:bg-s2 hover:text-fg">
          <Plus size={20} aria-hidden="true" />
          Več lokalov
        </button>
      ) : null}
    </div>
  );

  const trial = billing.access.state === "trial" || billing.access.state === "trialing";
  const footer = (
    <div className="flex flex-col gap-2">
      {demo && (
        <button type="button" onClick={() => go("narocnina")} className="flex items-center gap-3 rounded-2xl bg-tint p-3 text-left transition-all duration-700 ease-spring hover:bg-s3 active:scale-[0.98]">
          <Icon3D name="paket" size={44} className="shrink-0" />
          <span className="flex flex-col">
            <span className="text-sm font-semibold text-fg">Demo paket</span>
            <span className="text-xs text-mute">Vse je brezplačno.</span>
          </span>
        </button>
      )}
      {trial && (
        <button type="button" onClick={() => go("narocnina")} className="flex flex-col gap-1 rounded-2xl bg-tint p-4 text-left transition-all duration-700 ease-spring hover:bg-s3 active:scale-[0.98]">
          <span className="text-sm font-semibold text-fg">Brezplačni preizkus</span>
          <span className="text-sm text-mute">Še {count(billing.access.daysLeft, "dan")}. Izberi paket, ko boš pripravljen.</span>
        </button>
      )}
      <a href={`/p/${venue.code}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-mute transition-all duration-700 ease-spring hover:bg-s2 hover:text-fg">
        <ArrowSquareOut size={20} aria-hidden="true" />
        Poglej kot gost
      </a>
      {data.isAdmin && (
        <Link href="/superadmin" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-mute transition-all duration-700 ease-spring hover:bg-s2 hover:text-fg">
          <LockKey size={20} aria-hidden="true" />
          Superadmin
        </Link>
      )}
      <form action={signOut}>
        <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-mute transition-all duration-700 ease-spring hover:bg-s2 hover:text-fg">
          <SignOut size={20} aria-hidden="true" />
          Odjava
        </button>
      </form>
      <p className="truncate px-3 text-xs text-dim">{data.ownerEmail}</p>
    </div>
  );

  return (
    <ToastProvider>
      {/* Namizje: lebdeča stranska vrstica */}
      <aside className="fixed bottom-4 left-4 top-4 z-30 hidden w-60 flex-col gap-6 overflow-y-auto rounded-3xl bg-card shadow-card p-4 lg:flex">
        <div className="px-3 pt-2">
          <Logo href="/dashboard" size={20} />
        </div>
        {venuePicker}
        <nav aria-label="Nadzorna plošča" className="flex-1">
          <ul className="flex flex-col gap-1">{navItems(false)}</ul>
        </nav>
        {footer}
      </aside>

      {/* Telefon: lebdeča kapsula in celozaslonski meni */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 lg:hidden">
        <div className="pointer-events-auto mt-4 flex w-full max-w-md items-center justify-between gap-4 rounded-full border border-line bg-base/80 py-2 pl-4 pr-2 backdrop-blur-xl">
          <span className="flex min-w-0 items-center gap-3">
            <LogoMark size={20} />
            <span className="truncate text-sm font-semibold text-fg">{SECTION_LABEL[section]}</span>
          </span>
          <button
            type="button"
            aria-label={menu ? "Zapri meni" : "Odpri meni"}
            aria-expanded={menu}
            onClick={() => setMenu((v) => !v)}
            className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-s2 transition-all duration-700 ease-spring hover:bg-s3 active:scale-[0.98]"
          >
            <span className={`absolute h-0.5 w-4 rounded-full bg-fg transition-all duration-700 ease-spring ${menu ? "rotate-45" : "-translate-y-1"}`} />
            <span className={`absolute h-0.5 w-4 rounded-full bg-fg transition-all duration-700 ease-spring ${menu ? "-rotate-45" : "translate-y-1"}`} />
          </button>
        </div>
      </header>
      <div
        className={`fixed inset-0 z-40 flex flex-col gap-8 overflow-y-auto bg-base/90 px-6 pb-8 pt-24 backdrop-blur-3xl transition-all duration-700 ease-spring lg:hidden ${menu ? "visible opacity-100" : "invisible opacity-0"}`}
        aria-hidden={!menu}
      >
        {venuePicker}
        <nav aria-label="Nadzorna plošča">
          <ul className="flex flex-col gap-1">{navItems(true)}</ul>
        </nav>
        {footer}
      </div>

      <main id="vsebina" className="min-h-svh bg-canvas px-4 pb-24 pt-24 lg:pb-16 lg:pl-72 lg:pr-8 lg:pt-12">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
          {locked && (
            <div role="alert" className="flex flex-col gap-1 rounded-3xl bg-card shadow-card p-6">
              <p className="text-lg font-semibold tracking-tight text-fg">Brezplačni preizkus se je iztekel</p>
              <p className="text-sm text-mute">Tvoji podatki in gostje so shranjeni. Izberi paket in nadaljuj tam, kjer si ostal.</p>
            </div>
          )}
          {section === "pregled" && <Overview data={data} isNew={isNew} go={go} />}
          {section === "kartica" && <CardSection venue={venue} />}
          {section === "gostje" && <Guests data={data} />}
          {section === "marketing" && <Marketing data={data} />}
          {section === "ocene" && <Reviews data={data} />}
          {section === "kolo" && <WheelSection venue={venue} />}
          {section === "obiski" && <Checkin venue={venue} />}
          {section === "nastavitve" && <Settings venue={venue} />}
          {section === "narocnina" && <Billing billing={data.billing} success={billingSuccess} />}
        </div>
      </main>
    </ToastProvider>
  );
}
