"use client";

import Link from "next/link";
import { Icon } from "@/app/components/icons";
import { Mark } from "@/app/components/SiteHeader";
import { BRAND, BRAND_EMAIL, BRAND_CITY } from "@/lib/brand";
import { useT } from "@/app/components/LangContext";

const PRODUCT_HREFS = ["/#funkcije", "/#cene", "/#kako", "/p/demo", "/demo/dashboard"];
const COMPANY_HREFS = ["/kontakt", "/#faq", "/partner"];
const LEGAL_HREFS = ["/pogoji", "/zasebnost", "/piskotki"];

export default function SiteFooter() {
  const t = useT();
  const col = (title: string, labels: string[], hrefs: string[]) => (
    <div className="flex flex-col gap-2.5">
      <div className="mb-1 text-[12px] font-bold uppercase tracking-wide text-[#A6967F]">{title}</div>
      {labels.map((l, i) => (
        <Link key={l} href={hrefs[i]} className="text-[14px] text-[#5C4C3E]">{l}</Link>
      ))}
    </div>
  );
  return (
    <div style={{ borderTop: "1px solid rgba(43,29,23,0.1)", background: "rgba(255,252,246,0.4)" }}>
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <div className="flex flex-wrap justify-between gap-10">
          <div className="flex max-w-[300px] flex-col gap-3.5">
            <div className="flex items-center gap-2.5">
              <Mark size={34} />
              <span className="font-display text-[20px] font-extrabold">{BRAND}</span>
            </div>
            <p className="text-[14px] leading-relaxed text-[#5C4C3E]">{t.footer.tagline}</p>
            <a href={`mailto:${BRAND_EMAIL}`} className="flex items-center gap-2 text-[14px] font-semibold text-[#2B1D17]"><Icon name="send" color="#2B1D17" size={15} strokeWidth={1.9} />{BRAND_EMAIL}</a>
          </div>
          <div className="flex flex-wrap gap-x-14 gap-y-8">
            {col(t.footer.product, t.footer.lProdukt, PRODUCT_HREFS)}
            {col(t.footer.company, t.footer.lPodjetje, COMPANY_HREFS)}
            {col(t.footer.legal, t.footer.lPravno, LEGAL_HREFS)}
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(43,29,23,0.1)] pt-6">
          <div className="text-[13px]" style={{ color: "#A6967F" }}>© 2026 {BRAND} · {BRAND_CITY} · {t.footer.rights}</div>
          <div className="flex gap-5">
            {t.footer.lPravno.map((l, i) => (
              <Link key={l} href={LEGAL_HREFS[i]} className="text-[13px]" style={{ color: "#A6967F" }}>{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
