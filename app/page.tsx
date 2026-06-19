"use client";

import Link from "next/link";
import Script from "next/script";
import { Icon } from "@/app/components/icons";
import { DEMO_HOURS } from "@/lib/demo";
import { useLang, useT } from "@/app/components/LangContext";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";

const ROTS = [-5, 3, -2, 6, -4, 2, -6, 4, -3, 5];

// jezikovno odvisne oznake na mock-vizualih (kartonček, mini-dashboard)
const MISC = {
  sl: { sub: "tvoj kartonček zvestobe", pts: "+15 točk", choice: "Kava po izbiri", at: "pri 10. žigu", left: "Še 3 obiski do brezplačne kave ☕", ofStamps: "/ 10 žigov", scans: "Skupaj skeniranj", scansD: "+18 %", custs: "Št. strank", custsD: "+12 novih", visits: "obiskov", brand: "Kavarna Moka", kava: "KAVA", analytics: "Analitika" },
  hr: { sub: "tvoja kartica vjernosti", pts: "+15 bodova", choice: "Kava po izboru", at: "kod 10. pečata", left: "Još 3 dolaska do besplatne kave ☕", ofStamps: "/ 10 pečata", scans: "Ukupno skeniranja", scansD: "+18 %", custs: "Broj gostiju", custsD: "+12 novih", visits: "dolazaka", brand: "Kafić Moka", kava: "KAVA", analytics: "Analitika" },
  en: { sub: "your loyalty card", pts: "+15 points", choice: "Coffee of choice", at: "at the 10th stamp", left: "3 more visits to a free coffee ☕", ofStamps: "/ 10 stamps", scans: "Total scans", scansD: "+18 %", custs: "Guests", custsD: "+12 new", visits: "visits", brand: "Café Moka", kava: "COFFEE", analytics: "Analytics" },
} as const;

const STEP_STYLE = [
  { n: "01", icon: "camera", bg: "#F1E7D2", color: "#2B1D17", rot: 0 },
  { n: "02", icon: "cup", bg: "rgba(200,81,43,0.1)", color: "#C8512B", rot: -5 },
  { n: "03", icon: "star2", bg: "rgba(94,127,82,0.14)", color: "#5E7F52", rot: 0 },
];

const FEATURE_ICONS = ["star2", "mega", "gift", "send", "ticket", "chart"];

const REVIEW_BARS = [6, 11, 18, 24, 33, 47];
const REVIEW_MONTHS = ["jan", "feb", "mar", "apr", "maj", "jun"];

function StampGrid({ stamps, gap = 10, kava = "KAVA" }: { stamps: number; gap?: number; kava?: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap }}>
      {Array.from({ length: 10 }).map((_, i) => {
        const filled = i < stamps;
        const isReward = i === 9;
        return (
          <div key={i} style={{ position: "relative", aspectRatio: "1", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: filled ? "2px solid transparent" : `2px dashed ${isReward ? "#E8A23D" : "#D9CDBA"}`, boxSizing: "border-box" }}>
            {filled ? (
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2.5px solid #C8512B", background: "rgba(200,81,43,0.07)", display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${ROTS[i]}deg)` }}>
                <Icon name="cup" color="#C8512B" size={22} />
              </div>
            ) : isReward ? (
              <span className="font-display" style={{ fontWeight: 700, fontSize: 8.5, letterSpacing: "0.04em", color: "#B97F1F" }}>{kava}</span>
            ) : (
              <span style={{ fontSize: 11, fontWeight: 600, color: "#C9BCA5" }}>{i + 1}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Home() {
  const t = useT();
  const { lang } = useLang();
  const m = MISC[lang];
  const maxBar = Math.max(...DEMO_HOURS.map((h) => h[1]));

  return (
    <div style={{ background: "#EAE2D3", color: "#2B1D17", minHeight: "100vh", overflowX: "hidden" }}>
      {/* PROMO */}
      <a href="#cene" className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-center text-[13.5px] font-semibold text-[#F5EFE6]" style={{ background: "#C8512B" }}>
        {t.promo}
      </a>

      <SiteHeader />

      {/* HERO */}
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-12 px-6 pb-10 pt-[72px]">
        <div className="flex flex-col gap-6" style={{ flex: "1.1", minWidth: 340 }}>
          <div className="flex h-[34px] items-center gap-2 self-start rounded-full px-3.5 text-[13px] font-bold" style={{ background: "rgba(232,162,61,0.18)", color: "#8A5B14" }}>
            <span className="h-[7px] w-[7px] rounded-full bg-[#E8A23D]" />
            {t.hero.badge}
          </div>
          <h1 className="font-display font-extrabold" style={{ fontSize: "clamp(40px,5.4vw,68px)", lineHeight: 1.02, letterSpacing: "-0.02em", margin: 0 }}>
            {t.hero.h1a}<br /><span style={{ color: "#C8512B" }}>{t.hero.h1b}</span>
          </h1>
          <p className="text-[#5C4C3E]" style={{ fontSize: "clamp(16px,1.5vw,19px)", lineHeight: 1.55, maxWidth: 480, margin: 0 }}>{t.hero.sub}</p>
          <div className="flex flex-wrap gap-3">
            <a href="#cene" className="flex h-14 items-center gap-2.5 rounded-full bg-[#2B1D17] px-7 text-[16.5px] font-semibold text-[#F5EFE6]" style={{ boxShadow: "0 10px 24px rgba(43,29,23,0.22)" }}>
              {t.hero.cta1} <Icon name="arrowR" color="#F5EFE6" size={18} strokeWidth={2} />
            </a>
            <Link href="/p/demo" className="flex h-14 items-center gap-2.5 rounded-full border-[1.5px] border-[rgba(43,29,23,0.28)] px-6 text-[16.5px] font-semibold">{t.hero.cta2}</Link>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-[18px]">
            <div className="flex items-center gap-2 text-[14px] text-[#5C4C3E]"><Icon name="check" color="#5E7F52" size={18} strokeWidth={2.2} />{t.hero.c1}</div>
            <div className="flex items-center gap-2 text-[14px] text-[#5C4C3E]"><Icon name="check" color="#5E7F52" size={18} strokeWidth={2.2} />{t.hero.c2}</div>
          </div>
        </div>

        {/* hero visual */}
        <div className="relative flex justify-center" style={{ flex: 1, minWidth: 320 }}>
          <div className="relative" style={{ width: 340 }}>
            <div className="font-display absolute right-[-6px] top-[-18px] z-[3] flex h-[46px] items-center gap-[7px] rounded-full px-[18px] text-[19px] font-extrabold text-[#F5EFE6]" style={{ background: "#5E7F52", boxShadow: "0 12px 28px rgba(94,127,82,0.35)", animation: "floaty 5s ease-in-out infinite" }}>{m.pts}</div>
            <div className="absolute bottom-[18px] left-[-26px] z-[3] flex h-[54px] items-center gap-2.5 rounded-[18px] border border-[#EFE6D4] bg-[#FFFCF6] pl-3 pr-4" style={{ boxShadow: "0 14px 30px rgba(43,29,23,0.16)", animation: "floaty2 6s ease-in-out infinite" }}>
              <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[#F1E7D2]"><Icon name="cup" color="#2B1D17" size={18} strokeWidth={1.8} /></div>
              <div className="flex flex-col leading-[1.1]"><span className="text-[12.5px] font-bold">{m.choice}</span><span className="text-[11.5px] text-[#8A7A66]">{m.at}</span></div>
            </div>
            <div className="relative z-[2] rounded-[28px] border border-[#EFE6D4] bg-[#FFFCF6] px-6 py-[26px]" style={{ transform: "rotate(-3deg)", boxShadow: "0 30px 70px rgba(43,29,23,0.22), 0 4px 14px rgba(43,29,23,0.08)" }}>
              <div className="mb-[18px] flex items-center gap-[11px]">
                <div className="font-display flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#2B1D17] text-[21px] font-bold text-[#F5EFE6]">M</div>
                <div className="flex flex-col leading-[1.15]"><span className="font-display text-[18px] font-bold">{m.brand}</span><span className="text-[12.5px] text-[#8A7A66]">{m.sub}</span></div>
                <div className="ml-auto text-right leading-none"><div className="font-display text-[30px] font-extrabold">7</div><div className="text-[11px] text-[#8A7A66]">{m.ofStamps}</div></div>
              </div>
              <StampGrid stamps={7} kava={m.kava} />
              <div className="mt-[18px] h-[9px] overflow-hidden rounded-full bg-[#EFE6D4]"><div className="h-full rounded-full bg-[#E8A23D]" style={{ width: "70%" }} /></div>
              <div className="mt-2.5 text-[13.5px] text-[#5C4C3E]">{m.left}</div>
            </div>
          </div>
        </div>
      </div>

      {/* TRUST STRIP */}
      <div style={{ marginTop: 24, borderTop: "1px solid rgba(43,29,23,0.1)", borderBottom: "1px solid rgba(43,29,23,0.1)", background: "rgba(255,252,246,0.5)" }}>
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-3.5 px-6 py-[18px]">
          <span className="text-[13px] font-semibold text-[#8A7A66]">{t.trust.label}</span>
          {t.trust.words.map((w, i) => (
            <span key={w} className="flex items-center gap-3.5">
              <span className="font-display text-[17px] font-bold">{w}</span>
              {i < t.trust.words.length - 1 && <span className="text-[#C9BCA5]">·</span>}
            </span>
          ))}
        </div>
      </div>

      {/* KAKO DELUJE */}
      <div id="kako" className="mx-auto max-w-[1200px] px-6 pb-10 pt-[88px]">
        <div className="mb-12 flex flex-col items-center gap-2.5 text-center">
          <div className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#C8512B]">{t.kako.eyebrow}</div>
          <h2 className="font-display font-extrabold" style={{ fontSize: "clamp(30px,3.6vw,44px)", lineHeight: 1.08, margin: 0 }}>{t.kako.h2}</h2>
          <p className="text-[17px] text-[#5C4C3E]" style={{ maxWidth: 540, margin: 0 }}>{t.kako.p}</p>
        </div>
        <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
          {STEP_STYLE.map((s, i) => (
            <div key={s.n} className="flex flex-col gap-3.5 rounded-[24px] border border-[#EFE6D4] bg-[#FFFCF6] p-7">
              <div className="flex items-center justify-between">
                <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[16px]" style={{ background: s.bg, transform: s.rot ? `rotate(${s.rot}deg)` : undefined }}>
                  <Icon name={s.icon} color={s.color} size={26} strokeWidth={1.8} />
                </div>
                <span className="font-display text-[40px] font-extrabold" style={{ color: "#EBD9BE" }}>{s.n}</span>
              </div>
              <div className="font-display text-[21px] font-bold">{t.kako.steps[i].title}</div>
              <div className="text-[15px] leading-relaxed text-[#5C4C3E]">{t.kako.steps[i].text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ZA LOKALE / DASHBOARD */}
      <div id="lokal" className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-12 px-6 pb-10 pt-16">
        <div className="flex flex-col gap-5" style={{ flex: 1, minWidth: 320 }}>
          <div className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#C8512B]">{t.dash.eyebrow}</div>
          <h2 className="font-display font-extrabold" style={{ fontSize: "clamp(28px,3.4vw,42px)", lineHeight: 1.08, margin: 0 }}>{t.dash.h2}</h2>
          <p className="text-[16.5px] leading-relaxed text-[#5C4C3E]" style={{ maxWidth: 440, margin: 0 }}>{t.dash.p}</p>
          <div className="mt-1 flex flex-col gap-3.5">
            {t.dash.feats.map(([b, rest], i) => (
              <div key={i} className="flex items-start gap-3.5">
                <div className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-[9px]" style={{ background: "rgba(94,127,82,0.14)" }}><Icon name="check" color="#5E7F52" size={16} strokeWidth={2.4} /></div>
                <div className="text-[15.5px] leading-snug text-[#41332A]"><strong>{b}</strong>{rest}</div>
              </div>
            ))}
          </div>
          <Link href="/dashboard" className="mt-2 flex h-[50px] items-center gap-2 self-start rounded-full border-[1.5px] border-[#2B1D17] px-[22px] text-[15px] font-semibold">
            {t.dash.cta} <Icon name="arrowR" color="#2B1D17" size={16} strokeWidth={2} />
          </Link>
        </div>
        {/* mini dashboard */}
        <div className="rounded-[28px] bg-[#2B1D17] p-[26px]" style={{ flex: 1, minWidth: 320, boxShadow: "0 30px 70px rgba(43,29,23,0.28)" }}>
          <div className="mb-[18px] flex items-center justify-between">
            <div className="font-display text-[22px] font-extrabold text-[#F5EFE6]">{m.analytics}</div>
            <div className="flex h-[30px] items-center rounded-full px-3.5 text-[12.5px] font-semibold" style={{ background: "rgba(245,239,230,0.12)", color: "#E8C99A" }}>{t.dash.range}</div>
          </div>
          <div className="mb-3.5 grid grid-cols-2 gap-[11px]">
            {[[m.scans, "482", m.scansD], [m.custs, "137", m.custsD]].map(([l, v, d]) => (
              <div key={l} className="rounded-[16px] p-3.5" style={{ background: "rgba(245,239,230,0.06)", border: "1px solid rgba(245,239,230,0.1)" }}>
                <div className="mb-0.5 text-[12px]" style={{ color: "#B7A488" }}>{l}</div>
                <div className="font-display text-[28px] font-extrabold text-[#F5EFE6]">{v}</div>
                <div className="text-[11.5px] font-semibold text-[#5E7F52]">{d}</div>
              </div>
            ))}
          </div>
          <div className="rounded-[16px] p-4" style={{ background: "rgba(245,239,230,0.06)", border: "1px solid rgba(245,239,230,0.1)" }}>
            <div className="mb-3.5 text-[12.5px] font-semibold" style={{ color: "#B7A488" }}>{t.dash.hours}</div>
            <div className="flex h-[96px] items-end gap-[5px]">
              {DEMO_HOURS.map(([, v, lbl], i) => (
                <div key={i} className="flex flex-1 flex-col items-center justify-end gap-[5px]" style={{ height: "100%" }}>
                  <div className="w-full rounded-[4px]" style={{ height: `${Math.round((v / maxBar) * 86)}px`, background: v === maxBar ? "#E8A23D" : "rgba(232,162,61,0.4)" }} />
                  <div className="text-[9px]" style={{ color: "#7C6B55", height: 11 }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SIGNATURE STAMP STORY */}
      <div className="mx-auto my-10 max-w-[1200px] px-6">
        <div className="flex flex-wrap items-center gap-10 overflow-hidden rounded-[32px]" style={{ background: "linear-gradient(135deg,#C8512B 0%,#A83E1F 100%)", padding: "clamp(36px,5vw,64px)" }}>
          <div className="flex flex-col gap-[18px]" style={{ flex: "1.2", minWidth: 300 }}>
            <div className="text-[13px] font-bold uppercase tracking-[0.12em]" style={{ color: "rgba(245,239,230,0.7)" }}>{t.story.eyebrow}</div>
            <h2 className="font-display font-extrabold" style={{ fontSize: "clamp(28px,3.6vw,46px)", lineHeight: 1.05, color: "#F8F1E7", margin: 0 }}>{t.story.h2a}<br />{t.story.h2b}</h2>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: "rgba(248,241,231,0.88)", maxWidth: 460, margin: 0 }}>{t.story.p}</p>
          </div>
          <div className="flex justify-center" style={{ flex: 1, minWidth: 280 }}>
            <div className="rounded-[22px] bg-[#FFFCF6] p-6" style={{ width: 280, boxShadow: "0 24px 50px rgba(0,0,0,0.25)", transform: "rotate(2deg)" }}>
              <StampGrid stamps={9} kava={m.kava} />
              <div className="mt-4 text-center text-[13.5px] text-[#8A7A66]">{t.story.left}</div>
            </div>
          </div>
        </div>
      </div>

      {/* BAZA GOSTOV (asset) */}
      <div className="mx-auto max-w-[1200px] px-6 pb-4 pt-14">
        <div className="flex flex-wrap items-center gap-10 overflow-hidden rounded-[28px] border border-[#EFE6D4] bg-[#FFFCF6]" style={{ padding: "clamp(28px,4vw,48px)" }}>
          <div className="flex flex-col gap-4" style={{ flex: "1.1", minWidth: 300 }}>
            <div className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#C8512B]">{t.asset.eyebrow}</div>
            <h2 className="font-display font-extrabold" style={{ fontSize: "clamp(26px,3.2vw,40px)", lineHeight: 1.08, margin: 0 }}>{t.asset.h2a}<span style={{ color: "#C8512B" }}>{t.asset.h2accent}</span>{t.asset.h2b}</h2>
            <p className="text-[16.5px] leading-relaxed text-[#5C4C3E]" style={{ maxWidth: 460, margin: 0 }}>{t.asset.p}</p>
            <div className="flex flex-col gap-2.5">
              {t.asset.bullets.map((b) => (
                <div key={b} className="flex items-center gap-3 text-[15.5px] text-[#41332A]">
                  <span className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-[8px]" style={{ background: "rgba(94,127,82,0.14)" }}><Icon name="check" color="#5E7F52" size={15} strokeWidth={2.4} /></span>{b}
                </div>
              ))}
            </div>
            <p className="text-[14.5px] text-[#8A7A66]" style={{ margin: 0 }}>{t.asset.note}</p>
          </div>
          <div className="rounded-[24px] bg-[#2B1D17] p-6" style={{ flex: 1, minWidth: 300, boxShadow: "0 24px 50px rgba(43,29,23,0.25)" }}>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <div className="font-display text-[40px] font-extrabold leading-none text-[#F5EFE6]">137</div>
                <div className="text-[12.5px]" style={{ color: "#B7A488" }}>{t.asset.count}</div>
              </div>
              <div className="flex h-[30px] items-center gap-1.5 rounded-full px-3 text-[12px] font-bold" style={{ background: "rgba(94,127,82,0.2)", color: "#9BC48D" }}>{t.asset.grows}</div>
            </div>
            <div className="flex flex-col gap-1 rounded-[14px] p-2" style={{ background: "rgba(245,239,230,0.06)" }}>
              {[["+386 31 ··· 412", "24"], ["+386 40 ··· 198", "19"], ["ana.k@···.com", "12"], ["+386 68 ··· 904", "9"]].map(([n, v], i) => (
                <div key={i} className="flex items-center justify-between rounded-[10px] px-3 py-2.5" style={{ background: "rgba(245,239,230,0.04)" }}>
                  <span className="text-[13.5px] font-semibold text-[#F5EFE6]">{n}</span>
                  <span className="text-[12.5px]" style={{ color: "#B7A488" }}>{v} {m.visits}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex h-[46px] items-center justify-center gap-2 rounded-full text-[14.5px] font-bold" style={{ background: "#E8A23D", color: "#2B1D17" }}>
              <Icon name="send" color="#2B1D17" size={17} strokeWidth={2} /> {t.asset.sendAll}
            </div>
          </div>
        </div>
      </div>

      {/* FUNKCIJE */}
      <div id="funkcije" className="mx-auto max-w-[1200px] px-6 pb-10 pt-12">
        <div className="mb-9 flex flex-col items-center gap-2.5 text-center">
          <div className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#C8512B]">{t.feat.eyebrow}</div>
          <h2 className="font-display font-extrabold" style={{ fontSize: "clamp(28px,3.6vw,44px)", lineHeight: 1.08, margin: 0 }}>{t.feat.h2}</h2>
          <p className="text-[17px] text-[#5C4C3E]" style={{ maxWidth: 560, margin: 0 }}>{t.feat.p}</p>
        </div>

        {/* Google ocene — highlight + graf */}
        <div className="mb-[18px] flex flex-wrap items-center gap-9 overflow-hidden rounded-[26px] border border-[#EFE6D4] bg-[#FFFCF6]" style={{ padding: "clamp(24px,4vw,40px)" }}>
          <div className="flex flex-col gap-3.5" style={{ flex: "1.1", minWidth: 280 }}>
            <div className="flex h-[34px] w-fit items-center gap-2 rounded-full px-3.5 text-[12.5px] font-bold" style={{ background: "rgba(232,162,61,0.18)", color: "#8A5B14" }}>{t.feat.gBadge}</div>
            <h3 className="font-display font-extrabold" style={{ fontSize: "clamp(24px,2.6vw,32px)", lineHeight: 1.1, margin: 0 }}>{t.feat.gH3}</h3>
            <p className="text-[15.5px] leading-relaxed text-[#5C4C3E]" style={{ maxWidth: 440, margin: 0 }}>{t.feat.gP}</p>
            <div className="mt-1 flex items-center gap-7">
              <div><div className="font-display text-[34px] font-extrabold text-[#B97F1F]">4,8★</div><div className="text-[12.5px] text-[#8A7A66]">{t.feat.gWas}</div></div>
              <div><div className="font-display text-[34px] font-extrabold text-[#5E7F52]">+86</div><div className="text-[12.5px] text-[#8A7A66]">{t.feat.gNew}</div></div>
            </div>
          </div>
          <div className="rounded-[20px] bg-[#2B1D17] p-6" style={{ flex: 1, minWidth: 260 }}>
            <div className="mb-3.5 flex items-center justify-between">
              <div className="text-[12.5px] font-semibold" style={{ color: "#B7A488" }}>{t.feat.gChart}</div>
            </div>
            <div className="flex h-[120px] items-end gap-2.5">
              {REVIEW_BARS.map((v, i) => {
                const max = Math.max(...REVIEW_BARS);
                return (
                  <div key={i} className="flex flex-1 flex-col items-center justify-end gap-2" style={{ height: "100%" }}>
                    <div className="font-display text-[11px] font-bold" style={{ color: "#E8C99A" }}>{v}</div>
                    <div className="w-full rounded-[5px]" style={{ height: `${Math.round((v / max) * 84)}px`, background: i === REVIEW_BARS.length - 1 ? "#E8A23D" : "rgba(232,162,61,0.4)" }} />
                    <div className="text-[10px]" style={{ color: "#7C6B55" }}>{REVIEW_MONTHS[i]}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ostali fičri */}
        <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))" }}>
          {t.feat.items.map((f, i) => (
            <div key={f.title} className="flex flex-col gap-3.5 rounded-[22px] border border-[#EFE6D4] bg-[#FFFCF6] p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[14px]" style={{ background: "rgba(232,162,61,0.16)" }}><Icon name={FEATURE_ICONS[i]} color="#B97F1F" size={24} strokeWidth={1.8} /></div>
                <span className="rounded-full px-3 py-1 text-[11.5px] font-bold uppercase tracking-wide" style={{ background: "#F1E7D2", color: "#8A5B14" }}>{f.label}</span>
              </div>
              <div className="font-display text-[20px] font-extrabold leading-tight">{f.title}</div>
              <div className="text-[14.5px] leading-relaxed text-[#5C4C3E]">{f.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CENE */}
      <div id="cene" className="mx-auto max-w-[1200px] px-6 pb-10 pt-20">
        <div className="mb-11 flex flex-col items-center gap-2.5 text-center">
          <div className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#C8512B]">{t.cene.eyebrow}</div>
          <h2 className="font-display font-extrabold" style={{ fontSize: "clamp(30px,3.8vw,46px)", lineHeight: 1.05, margin: 0 }}>{t.cene.h2}</h2>
          <p className="text-[17px] text-[#5C4C3E]" style={{ maxWidth: 500, margin: 0 }}>{t.cene.p}</p>
          <div className="mt-1 flex h-[32px] items-center gap-2 rounded-full px-4 text-[13px] font-bold" style={{ background: "rgba(94,127,82,0.14)", color: "#3E5536" }}>{t.cene.trial}</div>
        </div>
        <div className="grid items-stretch gap-[22px]" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))" }}>
          {t.cene.plans.map((p, i) => {
            const featured = i === 1;
            return (
              <div key={p.name} className="relative flex flex-col gap-5 rounded-[26px] p-[30px]" style={featured ? { background: "#2B1D17", boxShadow: "0 26px 60px rgba(43,29,23,0.3)", transform: "translateY(-8px)" } : { background: "#FFFCF6", border: "1px solid #EFE6D4" }}>
                {featured && <div className="absolute right-6 top-[22px] flex h-[30px] items-center rounded-full bg-[#E8A23D] px-3.5 text-[12px] font-extrabold text-[#2B1D17]">{t.cene.popular}</div>}
                <div className="flex flex-col gap-1.5">
                  <div className="font-display text-[22px] font-extrabold" style={{ color: featured ? "#F5EFE6" : "#2B1D17" }}>{p.name}</div>
                  <div className="text-[14px]" style={{ color: featured ? "#B7A488" : "#8A7A66" }}>{p.tagline}</div>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-[46px] font-extrabold" style={{ color: featured ? "#F5EFE6" : "#2B1D17" }}>{p.price}</span>
                  {p.period && <span className="text-[15px]" style={{ color: featured ? "#B7A488" : "#8A7A66" }}>{p.period}</span>}
                </div>
                <Link href={i === 2 ? "/kontakt" : "/partner"} className="flex h-[50px] items-center justify-center rounded-full text-[15px] font-semibold" style={featured ? { background: "#E8A23D", color: "#2B1D17", fontWeight: 700 } : { border: "1.5px solid #2B1D17", color: "#2B1D17" }}>
                  {p.cta}
                </Link>
                <div className="flex flex-col gap-3 pt-[18px]" style={{ borderTop: featured ? "1px solid rgba(245,239,230,0.14)" : "1px solid #F1E7D2" }}>
                  {p.features.map((f, j) => (
                    <div key={j} className="flex items-start gap-2.5 text-[14.5px] leading-snug" style={{ color: featured ? "#E9E0D2" : "#41332A" }}>
                      <span className="mt-px flex-shrink-0"><Icon name="check" color={featured ? "#E8A23D" : "#5E7F52"} size={18} strokeWidth={2.3} /></span>{f}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-[22px] text-center text-[14px] text-[#8A7A66]">{t.cene.note}</div>
      </div>

      {/* FAQ */}
      <div id="faq" className="mx-auto max-w-[760px] px-6 pb-10 pt-16">
        <div className="mb-9 flex flex-col items-center gap-2 text-center">
          <div className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#C8512B]">{t.faq.eyebrow}</div>
          <h2 className="font-display font-extrabold" style={{ fontSize: "clamp(28px,3.4vw,40px)", margin: 0 }}>{t.faq.h2}</h2>
        </div>
        <div className="flex flex-col gap-3">
          {t.faq.items.map((q) => (
            <div key={q.q} className="flex flex-col gap-2 rounded-[18px] border border-[#EFE6D4] bg-[#FFFCF6] px-6 py-[22px]">
              <div className="font-display text-[17.5px] font-bold">{q.q}</div>
              <div className="text-[15px] leading-relaxed text-[#5C4C3E]">{q.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FINAL CTA */}
      <div className="mx-auto max-w-[1200px] px-6 pb-[72px] pt-12">
        <div className="relative flex flex-col items-center gap-[22px] overflow-hidden rounded-[32px] bg-[#2B1D17] text-center" style={{ padding: "clamp(40px,6vw,72px)" }}>
          <div className="absolute" style={{ top: -60, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(232,162,61,0.16)" }} />
          <div className="absolute" style={{ bottom: -70, left: -30, width: 180, height: 180, borderRadius: "50%", background: "rgba(200,81,43,0.18)" }} />
          <div className="relative flex flex-col items-center gap-[22px]">
            <h2 className="font-display font-extrabold" style={{ fontSize: "clamp(30px,4.2vw,52px)", lineHeight: 1.04, color: "#F8F1E7", maxWidth: 620, margin: 0 }}>{t.finalCta.h2}</h2>
            <p style={{ fontSize: 17.5, lineHeight: 1.55, color: "rgba(248,241,231,0.82)", maxWidth: 480, margin: 0 }}>{t.finalCta.p}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/partner" className="flex h-14 items-center gap-2.5 rounded-full bg-[#E8A23D] px-[30px] text-[16.5px] font-bold text-[#2B1D17]">{t.finalCta.cta1} <Icon name="arrowR" color="#2B1D17" size={18} strokeWidth={2.2} /></Link>
              <Link href="/p/demo" className="flex h-14 items-center rounded-full border-[1.5px] border-[rgba(245,239,230,0.3)] px-[26px] text-[16.5px] font-semibold text-[#F5EFE6]">{t.finalCta.cta2}</Link>
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />

      {/* Vgrajen widget — plavajoči gumb, ki odpre kolo sreče (demo) */}
      <Script src="/widget.js" strategy="afterInteractive" />
    </div>
  );
}
