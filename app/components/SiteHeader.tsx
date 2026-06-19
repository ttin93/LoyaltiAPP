"use client";

import Link from "next/link";
import { Icon } from "@/app/components/icons";
import { BRAND } from "@/lib/brand";
import { LANGS } from "@/lib/i18n";
import { useLang, useT } from "@/app/components/LangContext";

export function Mark({ size = 34 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center rounded-full" style={{ width: size, height: size, border: "2.5px solid #C8512B", background: "rgba(200,81,43,0.07)", transform: "rotate(-6deg)" }}>
      <Icon name="cup" color="#C8512B" size={Math.round(size * 0.52)} />
    </div>
  );
}

export function LangSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center rounded-full border border-[rgba(43,29,23,0.15)] p-0.5">
      {LANGS.map((l) => (
        <button key={l.code} onClick={() => setLang(l.code)} aria-label={l.label} className={`rounded-full px-2.5 py-1 text-[12.5px] font-bold transition ${lang === l.code ? "bg-[#2B1D17] text-[#F5EFE6]" : "text-[#5C4C3E]"}`}>
          {l.label}
        </button>
      ))}
    </div>
  );
}

export default function SiteHeader() {
  const t = useT();
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(234,226,211,0.82)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderBottom: "1px solid rgba(43,29,23,0.08)" }}>
      <div className="mx-auto flex h-[68px] max-w-[1200px] items-center gap-3.5 px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Mark size={36} />
          <span className="font-display text-[21px] font-extrabold tracking-tight">{BRAND}</span>
        </Link>
        <div className="ml-6 hidden items-center gap-[26px] md:flex">
          <a href="/#kako" className="text-[14.5px] font-medium text-[#5C4C3E]">{t.nav.kako}</a>
          <a href="/#funkcije" className="text-[14.5px] font-medium text-[#5C4C3E]">{t.nav.funkcije}</a>
          <a href="/#cene" className="text-[14.5px] font-medium text-[#5C4C3E]">{t.nav.cene}</a>
          <Link href="/kontakt" className="text-[14.5px] font-medium text-[#5C4C3E]">{t.nav.kontakt}</Link>
        </div>
        <div className="ml-auto flex items-center gap-2.5">
          <LangSwitcher />
          <Link href="/p/demo" className="hidden h-[42px] items-center rounded-full border-[1.5px] border-[rgba(43,29,23,0.25)] px-[18px] text-[14.5px] font-semibold sm:flex">{t.nav.demo}</Link>
          <a href="/#cene" className="flex h-[42px] items-center rounded-full bg-[#2B1D17] px-5 text-[14.5px] font-semibold text-[#F5EFE6]">{t.nav.cta}</a>
        </div>
      </div>
    </div>
  );
}
