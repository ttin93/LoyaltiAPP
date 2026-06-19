"use client";

import { useState } from "react";
import Link from "next/link";
import { createVenue, signOut } from "@/app/actions";
import { Icon } from "@/app/components/icons";
import { Mark } from "@/app/components/SiteHeader";
import { BRAND } from "@/lib/brand";

const VENUE_TYPES = ["Kavarna", "Bistro / restavracija", "Picerija", "Pekarna", "Slaščičarna", "Bar", "Drugo"];
const SWATCHES = ["#C8512B", "#E8A23D", "#5E7F52", "#2B6E8A", "#8A4FA3", "#2B1D17"];

const inp =
  "h-[48px] w-full rounded-xl border border-[#D9CDBA] bg-[#FFFCF6] px-3.5 text-[15px] text-[#2B1D17] outline-none transition focus:border-[#2B1D17] focus:ring-2 focus:ring-[rgba(43,29,23,0.08)] placeholder:text-[#A6967F]";
const lbl = "mb-1.5 block text-[13px] font-semibold text-[#5C4C3E]";

export default function Onboarding() {
  const [color, setColor] = useState("#C8512B");
  const [model, setModel] = useState<"per_visit" | "per_euro">("per_visit");
  const [busy, setBusy] = useState(false);

  return (
    <main style={{ background: "#EAE2D3", color: "#2B1D17", minHeight: "100dvh", overflowX: "hidden" }}>
      {/* top bar */}
      <div className="mx-auto flex h-[64px] max-w-[640px] items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <Mark size={34} />
          <span className="font-display text-[20px] font-extrabold tracking-tight">{BRAND}</span>
        </div>
        <form action={signOut}><button className="text-[13.5px] font-medium text-[#8A7A66] hover:text-[#2B1D17]">Odjava</button></form>
      </div>

      <div className="mx-auto max-w-[640px] px-6 pb-16 pt-4">
        {/* progress hint */}
        <div className="mb-4 flex items-center gap-2 text-[12.5px] font-semibold uppercase tracking-[0.1em] text-[#C8512B]">
          <span className="flex h-[22px] items-center rounded-full px-2.5" style={{ background: "rgba(200,81,43,0.12)" }}>Korak 2 / 2</span>
          <span className="text-[#A6967F]">· približno minuta</span>
        </div>

        <h1 className="font-display font-extrabold" style={{ fontSize: "clamp(28px,4vw,38px)", lineHeight: 1.08, margin: 0 }}>Postavimo tvoj lokal</h1>
        <p className="mt-2 text-[15.5px] leading-relaxed text-[#5C4C3E]">Nekaj osnovnih podatkov — nagrade in stran za goste dodamo samodejno (vse lahko kasneje spremeniš v nastavitvah).</p>

        <form action={createVenue} onSubmit={() => setBusy(true)} className="mt-7 flex flex-col gap-6">
          {/* O lokalu */}
          <div className="rounded-[22px] border border-[#EFE6D4] bg-[#FFFCF6] p-6" style={{ boxShadow: "0 14px 36px rgba(43,29,23,0.07)" }}>
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px]" style={{ background: "rgba(232,162,61,0.16)" }}><Icon name="cup" color="#B97F1F" size={18} strokeWidth={1.8} /></span>
              <span className="font-display text-[17px] font-bold">O lokalu</span>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className={lbl}>Ime lokala *</label>
                <input name="name" required placeholder="npr. Kavarna Central" className={inp} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className={lbl}>Tvoje ime</label><input name="owner_name" placeholder="Ime in priimek" className={inp} /></div>
                <div><label className={lbl}>Telefon</label><input name="phone" inputMode="tel" placeholder="+386 …" className={inp} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={lbl}>Tip lokala</label>
                  <select name="venue_type" defaultValue="" className={inp}><option value="">Izberi …</option>{VENUE_TYPES.map((v) => <option key={v} value={v}>{v}</option>)}</select>
                </div>
                <div><label className={lbl}>Mesto</label><input name="city" placeholder="npr. Ljubljana" className={inp} /></div>
              </div>
            </div>
          </div>

          {/* Program zvestobe */}
          <div className="rounded-[22px] border border-[#EFE6D4] bg-[#FFFCF6] p-6" style={{ boxShadow: "0 14px 36px rgba(43,29,23,0.07)" }}>
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px]" style={{ background: "rgba(94,127,82,0.16)" }}><Icon name="star2" color="#5E7F52" size={18} strokeWidth={1.8} /></span>
              <span className="font-display text-[17px] font-bold">Program zvestobe</span>
            </div>
            <input type="hidden" name="points_model" value={model} />
            <div className="grid gap-3 sm:grid-cols-2">
              {([
                { v: "per_visit", t: "Žigi za obiske", d: "Vsak obisk = 1 žig. Nagrada pri polni kartici." },
                { v: "per_euro", t: "Točke za €", d: "Točke glede na porabo, nagrade po pragu." },
              ] as const).map((o) => {
                const on = model === o.v;
                return (
                  <button type="button" key={o.v} onClick={() => setModel(o.v)} className="flex flex-col gap-1 rounded-[16px] border-2 p-4 text-left transition" style={on ? { borderColor: "#2B1D17", background: "rgba(43,29,23,0.03)" } : { borderColor: "#EFE6D4", background: "#FFFCF6" }}>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-[15.5px] font-bold">{o.t}</span>
                      <span className="flex h-[20px] w-[20px] items-center justify-center rounded-full border-2" style={on ? { borderColor: "#2B1D17", background: "#2B1D17" } : { borderColor: "#D9CDBA" }}>{on && <Icon name="check" color="#F5EFE6" size={12} strokeWidth={3} />}</span>
                    </div>
                    <span className="text-[12.5px] leading-snug text-[#8A7A66]">{o.d}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Izgled */}
          <div className="rounded-[22px] border border-[#EFE6D4] bg-[#FFFCF6] p-6" style={{ boxShadow: "0 14px 36px rgba(43,29,23,0.07)" }}>
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px]" style={{ background: "rgba(43,110,138,0.14)" }}><Icon name="chart" color="#2B6E8A" size={18} strokeWidth={1.8} /></span>
              <span className="font-display text-[17px] font-bold">Barva znamke</span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              {SWATCHES.map((c) => (
                <button type="button" key={c} onClick={() => setColor(c)} aria-label={c} className="h-[38px] w-[38px] rounded-full transition" style={{ background: c, outline: color.toLowerCase() === c.toLowerCase() ? "3px solid #2B1D17" : "2px solid rgba(43,29,23,0.12)", outlineOffset: 2 }} />
              ))}
              <label className="flex h-[38px] cursor-pointer items-center gap-2 rounded-full border border-[#D9CDBA] px-3 text-[13px] font-semibold text-[#5C4C3E]">
                <input type="color" name="brand_color" value={color} onChange={(e) => setColor(e.target.value)} className="h-[22px] w-[22px] cursor-pointer rounded border-0 bg-transparent p-0" />
                Po meri
              </label>
            </div>
          </div>

          <button disabled={busy} className="flex h-[56px] items-center justify-center gap-2.5 rounded-full text-[16.5px] font-bold text-[#F5EFE6] transition disabled:opacity-60" style={{ background: "#2B1D17", boxShadow: "0 12px 28px rgba(43,29,23,0.22)" }}>
            {busy ? "Ustvarjam…" : "Ustvari lokal"} {!busy && <Icon name="arrowR" color="#F5EFE6" size={18} strokeWidth={2.2} />}
          </button>
          <p className="text-center text-[13px] text-[#8A7A66]">Takoj zatem dobiš QR plakat in stran za goste. <Link href="/" className="underline">Predčasno nazaj</Link></p>
        </form>
      </div>
    </main>
  );
}
