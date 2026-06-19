"use client";

import Link from "next/link";
import { useState } from "react";
import { BRAND, BRAND_EMAIL } from "@/lib/brand";

const VENUE_TYPES = ["Kavarna", "Bistro / restavracija", "Picerija", "Pekarna", "Slaščičarna", "Bar", "Frizer / salon", "Drugo"];
const GUESTS = ["Do 50 / dan", "50–150 / dan", "150–300 / dan", "Več kot 300 / dan"];
const HEARD = ["Google", "Priporočilo znanca", "Instagram / Facebook", "Drugje"];

const inp = "h-[46px] w-full rounded-xl border border-[#D9CDBA] bg-[#FFFCF6] px-3.5 text-[15px] text-[#2B1D17] outline-none focus:border-[#2B1D17]";

export default function Kontakt() {
  const [f, setF] = useState({ name: "", venue: "", email: "", phone: "", venueType: "", city: "", guestsEst: "", heard: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [err, setErr] = useState("");
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.email && !f.phone) return setErr("Vpiši vsaj email ali telefon, da te lahko kontaktiramo.");
    setErr("");
    setStatus("sending");
    try {
      const r = await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const j = await r.json();
      if (j.ok) setStatus("done");
      else { setErr(j.error || "Napaka."); setStatus("error"); }
    } catch {
      setErr("Napaka pri pošiljanju. Poskusi znova.");
      setStatus("error");
    }
  }

  return (
    <div style={{ background: "#EAE2D3", color: "#2B1D17", minHeight: "100vh" }}>
      <div className="border-b border-[rgba(43,29,23,0.08)]">
        <div className="mx-auto flex h-[64px] max-w-[1100px] items-center justify-between px-6">
          <Link href="/" className="font-display text-[19px] font-extrabold">{BRAND}</Link>
          <Link href="/" className="text-[14px] font-semibold text-[#5C4C3E]">← Nazaj na domov</Link>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1100px] flex-wrap gap-12 px-6 py-12">
        {/* pitch */}
        <div className="flex flex-col gap-5" style={{ flex: "1", minWidth: 300 }}>
          <div className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#C8512B]">Postavimo ti vse</div>
          <h1 className="font-display font-extrabold" style={{ fontSize: "clamp(30px,3.8vw,46px)", lineHeight: 1.06, margin: 0 }}>Pridobimo ti več rednih gostov</h1>
          <p className="text-[16.5px] leading-relaxed text-[#5C4C3E]" style={{ maxWidth: 440 }}>Pusti podatke in ti v enem dnevu vse postavimo — stran, kolo sreče, QR plakat. <strong>14 dni brezplačno, brez kartice.</strong> Brez tveganja zate.</p>
          <div className="flex flex-col gap-3">
            {["Vse postavimo namesto tebe", "Pokažemo demo na tvojem lokalu", "Brez vezave — odpoveš kadarkoli"].map((b) => (
              <div key={b} className="flex items-center gap-3 text-[15.5px] text-[#41332A]">
                <span className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-[8px] text-[14px] font-bold text-white" style={{ background: "#5E7F52" }}>✓</span>{b}
              </div>
            ))}
          </div>
          <div className="mt-1 text-[14px] text-[#8A7A66]">Ali nam piši na <a className="font-semibold underline" href={`mailto:${BRAND_EMAIL}`}>{BRAND_EMAIL}</a></div>
        </div>

        {/* form */}
        <div className="rounded-[26px] border border-[#EFE6D4] bg-[#FFFCF6] p-7" style={{ flex: "1.1", minWidth: 320, boxShadow: "0 24px 50px rgba(43,29,23,0.1)" }}>
          {status === "done" ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full text-[30px]" style={{ background: "rgba(94,127,82,0.14)" }}>🎉</div>
              <div className="font-display text-[24px] font-extrabold">Hvala! Javimo se ti.</div>
              <div className="max-w-[300px] text-[15px] text-[#5C4C3E]">Tvoje povpraševanje smo prejeli. Kmalu te kontaktiramo in dogovorimo demo.</div>
              <Link href="/" className="mt-2 flex h-12 items-center rounded-full bg-[#2B1D17] px-6 text-[15px] font-semibold text-[#F5EFE6]">Nazaj na domov</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-3.5">
              <div className="font-display text-[20px] font-extrabold">Pusti povpraševanje</div>
              <div className="grid gap-3.5 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5"><span className="text-[13px] font-semibold text-[#5C4C3E]">Ime in priimek</span><input className={inp} value={f.name} onChange={(e) => set("name", e.target.value)} /></label>
                <label className="flex flex-col gap-1.5"><span className="text-[13px] font-semibold text-[#5C4C3E]">Ime lokala</span><input className={inp} value={f.venue} onChange={(e) => set("venue", e.target.value)} placeholder="npr. Kavarna Moka" /></label>
                <label className="flex flex-col gap-1.5"><span className="text-[13px] font-semibold text-[#5C4C3E]">Email</span><input className={inp} type="email" value={f.email} onChange={(e) => set("email", e.target.value)} /></label>
                <label className="flex flex-col gap-1.5"><span className="text-[13px] font-semibold text-[#5C4C3E]">Telefon</span><input className={inp} inputMode="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+386 …" /></label>
                <label className="flex flex-col gap-1.5"><span className="text-[13px] font-semibold text-[#5C4C3E]">Tip lokala</span>
                  <select className={inp} value={f.venueType} onChange={(e) => set("venueType", e.target.value)}><option value="">Izberi …</option>{VENUE_TYPES.map((v) => <option key={v} value={v}>{v}</option>)}</select>
                </label>
                <label className="flex flex-col gap-1.5"><span className="text-[13px] font-semibold text-[#5C4C3E]">Mesto</span><input className={inp} value={f.city} onChange={(e) => set("city", e.target.value)} /></label>
                <label className="flex flex-col gap-1.5"><span className="text-[13px] font-semibold text-[#5C4C3E]">Št. gostov</span>
                  <select className={inp} value={f.guestsEst} onChange={(e) => set("guestsEst", e.target.value)}><option value="">Izberi …</option>{GUESTS.map((v) => <option key={v} value={v}>{v}</option>)}</select>
                </label>
                <label className="flex flex-col gap-1.5"><span className="text-[13px] font-semibold text-[#5C4C3E]">Kje si izvedel za nas?</span>
                  <select className={inp} value={f.heard} onChange={(e) => set("heard", e.target.value)}><option value="">Izberi …</option>{HEARD.map((v) => <option key={v} value={v}>{v}</option>)}</select>
                </label>
              </div>
              <label className="flex flex-col gap-1.5"><span className="text-[13px] font-semibold text-[#5C4C3E]">Sporočilo (neobvezno)</span>
                <textarea rows={3} className="w-full rounded-xl border border-[#D9CDBA] bg-[#FFFCF6] p-3 text-[15px] outline-none focus:border-[#2B1D17]" value={f.message} onChange={(e) => set("message", e.target.value)} placeholder="Kaj te najbolj zanima?" />
              </label>
              {err && <div className="text-[14px] font-medium text-[#C8512B]">{err}</div>}
              <button disabled={status === "sending"} className="mt-1 flex h-[54px] items-center justify-center rounded-full bg-[#2B1D17] text-[16px] font-semibold text-[#F5EFE6] disabled:opacity-60">{status === "sending" ? "Pošiljam …" : "Pošlji povpraševanje"}</button>
              <div className="text-center text-[12.5px] text-[#A6967F]">S pošiljanjem se strinjaš s <Link href="/zasebnost" className="underline">politiko zasebnosti</Link>.</div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
