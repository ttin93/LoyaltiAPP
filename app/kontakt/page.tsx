"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/app/components/icons";
import { BRAND_EMAIL } from "@/lib/brand";
import { useLang, useT } from "@/app/components/LangContext";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";

const inp = "h-[46px] w-full rounded-xl border border-[#D9CDBA] bg-[#FFFCF6] px-3.5 text-[15px] text-[#2B1D17] outline-none focus:border-[#2B1D17]";

const SETUP_ICONS = ["star2", "cup", "qr"];
const SETUP = {
  sl: { cards: ["Spletna stran", "Kolo sreče", "QR plakat"], badge: "14 dni brezplačno", ph: "npr. Moka" },
  hr: { cards: ["Web stranica", "Kolo sreće", "QR plakat"], badge: "14 dana besplatno", ph: "npr. Moka" },
  en: { cards: ["Web page", "Lucky wheel", "QR poster"], badge: "14 days free", ph: "e.g. Moka" },
} as const;

export default function Kontakt() {
  const t = useT();
  const { lang } = useLang();
  const k = t.kontakt;
  const s = SETUP[lang];
  const [f, setF] = useState({ name: "", venue: "", email: "", phone: "", venueType: "", city: "", guestsEst: "", heard: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [err, setErr] = useState("");
  const set = (key: string, v: string) => setF((p) => ({ ...p, [key]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.email && !f.phone) return setErr(k.errBoth);
    setErr("");
    setStatus("sending");
    try {
      const r = await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const j = await r.json();
      if (j.ok) setStatus("done");
      else { setErr(j.error || "Error."); setStatus("error"); }
    } catch {
      setErr("Error.");
      setStatus("error");
    }
  }

  return (
    <div style={{ background: "#EAE2D3", color: "#2B1D17", minHeight: "100vh", overflowX: "hidden" }}>
      <SiteHeader />

      <div className="mx-auto flex max-w-[1120px] flex-wrap gap-12 px-6 py-14">
        {/* pitch */}
        <div className="flex flex-col gap-5" style={{ flex: "1", minWidth: 300 }}>
          <div className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#C8512B]">{k.eyebrow}</div>
          <h1 className="font-display font-extrabold" style={{ fontSize: "clamp(30px,3.8vw,46px)", lineHeight: 1.06, margin: 0 }}>{k.h1}</h1>
          <p className="text-[16.5px] leading-relaxed text-[#5C4C3E]" style={{ maxWidth: 440 }}>{k.p}</p>
          <div className="flex flex-col gap-3">
            {k.bullets.map((b) => (
              <div key={b} className="flex items-center gap-3 text-[15.5px] text-[#41332A]">
                <span className="flex h-[28px] w-[28px] flex-shrink-0 items-center justify-center rounded-[8px]" style={{ background: "rgba(94,127,82,0.14)" }}><Icon name="check" color="#5E7F52" size={16} strokeWidth={2.4} /></span>{b}
              </div>
            ))}
          </div>

          {/* "kaj postavimo" mini kartice */}
          <div className="mt-2 grid grid-cols-3 gap-2.5" style={{ maxWidth: 420 }}>
            {s.cards.map((label, i) => (
              <div key={i} className="flex flex-col items-center gap-2 rounded-[16px] border border-[#EFE6D4] bg-[#FFFCF6] px-2 py-4 text-center">
                <div className="flex h-[40px] w-[40px] items-center justify-center rounded-[12px]" style={{ background: "rgba(232,162,61,0.16)" }}><Icon name={SETUP_ICONS[i]} color="#B97F1F" size={20} strokeWidth={1.8} /></div>
                <span className="text-[12px] font-semibold leading-tight text-[#5C4C3E]">{label}</span>
              </div>
            ))}
          </div>

          <div className="mt-1 text-[14px] text-[#8A7A66]">{k.or} <a className="font-semibold underline" href={`mailto:${BRAND_EMAIL}`}>{BRAND_EMAIL}</a></div>
        </div>

        {/* form */}
        <div className="rounded-[26px] border border-[#EFE6D4] bg-[#FFFCF6] p-7" style={{ flex: "1.1", minWidth: 320, boxShadow: "0 24px 50px rgba(43,29,23,0.1)" }}>
          {status === "done" ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full text-[30px]" style={{ background: "rgba(94,127,82,0.14)" }}>🎉</div>
              <div className="font-display text-[24px] font-extrabold">{k.doneH}</div>
              <div className="max-w-[300px] text-[15px] text-[#5C4C3E]">{k.doneP}</div>
              <Link href="/" className="mt-2 flex h-12 items-center rounded-full bg-[#2B1D17] px-6 text-[15px] font-semibold text-[#F5EFE6]">{k.doneCta}</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between gap-3">
                <div className="font-display text-[20px] font-extrabold">{k.formTitle}</div>
                <span className="flex h-[28px] items-center rounded-full px-3 text-[12px] font-bold" style={{ background: "rgba(94,127,82,0.14)", color: "#3E5536" }}>✓ {s.badge}</span>
              </div>
              <div className="grid gap-3.5 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5"><span className="text-[13px] font-semibold text-[#5C4C3E]">{k.fName}</span><input className={inp} value={f.name} onChange={(e) => set("name", e.target.value)} /></label>
                <label className="flex flex-col gap-1.5"><span className="text-[13px] font-semibold text-[#5C4C3E]">{k.fVenue}</span><input className={inp} value={f.venue} onChange={(e) => set("venue", e.target.value)} placeholder={s.ph} /></label>
                <label className="flex flex-col gap-1.5"><span className="text-[13px] font-semibold text-[#5C4C3E]">{k.fEmail}</span><input className={inp} type="email" value={f.email} onChange={(e) => set("email", e.target.value)} /></label>
                <label className="flex flex-col gap-1.5"><span className="text-[13px] font-semibold text-[#5C4C3E]">{k.fPhone}</span><input className={inp} inputMode="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+386 …" /></label>
                <label className="flex flex-col gap-1.5"><span className="text-[13px] font-semibold text-[#5C4C3E]">{k.fType}</span>
                  <select className={inp} value={f.venueType} onChange={(e) => set("venueType", e.target.value)}><option value="">{k.choose}</option>{k.types.map((v) => <option key={v} value={v}>{v}</option>)}</select>
                </label>
                <label className="flex flex-col gap-1.5"><span className="text-[13px] font-semibold text-[#5C4C3E]">{k.fCity}</span><input className={inp} value={f.city} onChange={(e) => set("city", e.target.value)} /></label>
                <label className="flex flex-col gap-1.5"><span className="text-[13px] font-semibold text-[#5C4C3E]">{k.fGuests}</span>
                  <select className={inp} value={f.guestsEst} onChange={(e) => set("guestsEst", e.target.value)}><option value="">{k.choose}</option>{k.guests.map((v) => <option key={v} value={v}>{v}</option>)}</select>
                </label>
                <label className="flex flex-col gap-1.5"><span className="text-[13px] font-semibold text-[#5C4C3E]">{k.fHeard}</span>
                  <select className={inp} value={f.heard} onChange={(e) => set("heard", e.target.value)}><option value="">{k.choose}</option>{k.heard.map((v) => <option key={v} value={v}>{v}</option>)}</select>
                </label>
              </div>
              <label className="flex flex-col gap-1.5"><span className="text-[13px] font-semibold text-[#5C4C3E]">{k.fMsg}</span>
                <textarea rows={3} className="w-full rounded-xl border border-[#D9CDBA] bg-[#FFFCF6] p-3 text-[15px] outline-none focus:border-[#2B1D17]" value={f.message} onChange={(e) => set("message", e.target.value)} placeholder={k.fMsgPh} />
              </label>
              {err && <div className="text-[14px] font-medium text-[#C8512B]">{err}</div>}
              <button disabled={status === "sending"} className="mt-1 flex h-[54px] items-center justify-center rounded-full bg-[#2B1D17] text-[16px] font-semibold text-[#F5EFE6] disabled:opacity-60">{status === "sending" ? k.sending : k.send}</button>
              <div className="text-center text-[12.5px] text-[#A6967F]">{k.consent}</div>
            </form>
          )}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
