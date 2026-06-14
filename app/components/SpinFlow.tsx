"use client";

import { useState } from "react";
import { Icon, FakeQr } from "@/app/components/icons";

const SEGS = ["Brezplačna kava", "−10 %", "+30 točk", "Piškot gratis", "−15 %", "Sirup gratis"];
const r2 = (n: number) => Math.round(n * 100) / 100;

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path d="M21.6 12.2c0-.7-.06-1.3-.18-1.9H12v3.6h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.2Z" fill="#4285F4" />
      <path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z" fill="#34A853" />
      <path d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1A10 10 0 0 0 2 12c0 1.6.4 3.2 1.1 4.6L6.4 14Z" fill="#FBBC05" />
      <path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 2.9 14.7 2 12 2A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.3 3-4.1 5.6-4.1Z" fill="#EA4335" />
    </svg>
  );
}

export default function SpinFlow({
  code,
  venueName,
  venueInitial,
  brandColor = "#E8A23D",
  tagline = "Zavrti kolo in osvoji nagrado za prvi obisk",
}: {
  code: string;
  venueName: string;
  venueInitial: string;
  brandColor?: string;
  tagline?: string;
}) {
  const [step, setStep] = useState<"wheel" | "won" | "register" | "otp" | "coupon">("wheel");
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [method, setMethod] = useState<"phone" | "google">("phone");
  const [couponCode, setCouponCode] = useState("");
  const [busy, setBusy] = useState(false);

  function spin() {
    if (spinning || step !== "wheel") return;
    setSpinning(true);
    const cur = ((rotation % 360) + 360) % 360;
    const jitter = Math.round(Math.random() * 30 - 15);
    const delta = (330 - cur + 360) % 360;
    setRotation(rotation + 360 * 5 + delta + jitter);
    setTimeout(() => {
      setSpinning(false);
      setStep("won");
    }, 4400);
  }

  async function doRegister(payload: { phone?: string; email?: string }) {
    setBusy(true);
    try {
      const r = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venueCode: code, ...payload }),
      });
      const j = await r.json();
      if (j.ok) localStorage.setItem(`loyalty:${code}:customerId`, j.customerId);
    } catch {
      /* best-effort */
    } finally {
      // podeli kupon (lokalno — pobere ga glavna stran /p/[code])
      const ck = `loyalty:${code}:coupons`;
      let coupons: { id: string; name: string }[] = [];
      try {
        coupons = JSON.parse(localStorage.getItem(ck) || "[]");
      } catch {}
      coupons.push({ id: "c" + coupons.length, name: "Brezplačna kava" });
      localStorage.setItem(ck, JSON.stringify(coupons));
      setCouponCode(`${code.slice(0, 4).toUpperCase()}-${Math.random().toString(16).slice(2, 6).toUpperCase()}`);
      setBusy(false);
      setStep("coupon");
    }
  }

  function pressKey(d: string) {
    if (d === "del") return setOtp((o) => o.slice(0, -1));
    if (d === "ok") {
      if (otp.length === 4) doRegister({ phone: "+386 " + phone });
      return;
    }
    if (otp.length >= 4) return;
    const next = otp + d;
    setOtp(next);
    if (next.length === 4) setTimeout(() => doRegister({ phone: "+386 " + phone }), 480);
  }

  const wheel = (() => {
    const cx = 100, cy = 100, r = 92;
    const polar = (deg: number) => {
      const a = ((deg - 90) * Math.PI) / 180;
      return [r2(cx + r * Math.cos(a)), r2(cy + r * Math.sin(a))];
    };
    const fills = [brandColor, "#FBF4E8", "#F3E9D6", "#FBF4E8", "#F3E9D6", "#FBF4E8"];
    const paths = [];
    const labels = [];
    for (let i = 0; i < 6; i++) {
      const [x0, y0] = polar(i * 60);
      const [x1, y1] = polar((i + 1) * 60);
      paths.push(<path key={"p" + i} d={`M${cx} ${cy} L${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1} Z`} fill={fills[i]} stroke="#E7D6BA" strokeWidth={1} />);
      const mid = i * 60 + 30;
      const a = ((mid - 90) * Math.PI) / 180;
      const lx = r2(cx + r * 0.62 * Math.cos(a));
      const ly = r2(cy + r * 0.62 * Math.sin(a));
      const win = i === 0;
      labels.push(
        <text key={"t" + i} x={lx} y={ly} transform={`rotate(${mid} ${lx} ${ly})`} textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: '"Bricolage Grotesque",sans-serif', fontWeight: win ? 800 : 600, fontSize: win ? 9.5 : 8.5, fill: win ? "#2B1D17" : "#6B5546", letterSpacing: "0.01em" }}>
          {SEGS[i]}
        </text>,
      );
    }
    return (
      <div
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: "transform 4.4s cubic-bezier(0.16,0.7,0.18,1)",
          willChange: "transform",
        }}
      >
        <svg width="286" height="286" viewBox="0 0 200 200" style={{ display: "block", filter: "drop-shadow(0 10px 24px rgba(43,29,23,0.16))" }}>
          <g>
            {paths}
            {labels}
          </g>
          <circle cx={cx} cy={cy} r={r + 2} fill="none" stroke="#2B1D17" strokeWidth={4} />
          <circle cx={cx} cy={cy} r={27} fill="#2B1D17" stroke="#FFFCF6" strokeWidth={3} />
        </svg>
      </div>
    );
  })();

  return (
    <div style={{ ["--brand" as string]: brandColor, width: "100%", color: "#2B1D17", display: "flex", justifyContent: "center" }}>
      <div className="flex w-full max-w-[392px] flex-col overflow-hidden rounded-[28px] border border-[#EFE6D4] bg-[#FFFCF6]" style={{ boxShadow: "0 2px 10px rgba(43,29,23,0.05), 0 22px 50px rgba(43,29,23,0.12)" }}>
        {/* brand header */}
        <div className="flex items-center gap-[11px] px-6 pt-[22px]">
          <div className="font-display flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[12px] bg-[#2B1D17] text-[20px] font-bold text-[#F5EFE6]">{venueInitial}</div>
          <div className="flex min-w-0 flex-col leading-[1.2]">
            <span className="font-display text-[17px] font-bold">{venueName}</span>
            <span className="text-[12px] text-[#8A7A66]">samo za nove goste</span>
          </div>
          <div className="ml-auto flex h-[26px] items-center rounded-full px-2.5 text-[11px] font-extrabold tracking-[0.02em] text-[#2B1D17]" style={{ background: "var(--brand)" }}>1 VRTLJAJ</div>
        </div>

        <div className="px-6 pb-6 pt-[18px]">
          {/* WHEEL */}
          {step === "wheel" && (
            <div className="flex flex-col items-center gap-1.5">
              <div className="font-display text-center text-[25px] font-extrabold leading-[1.1]">Zavrti in osvoji</div>
              <div className="max-w-[280px] text-center text-[14.5px] leading-snug text-[#5C4C3E]">{tagline}</div>
              <div className="relative mt-3 h-[286px] w-[286px]">
                <div className="absolute left-1/2 top-[-7px] z-[3] -translate-x-1/2" style={{ filter: "drop-shadow(0 3px 4px rgba(43,29,23,0.25))" }}>
                  <svg width="30" height="26" viewBox="0 0 30 26"><path d="M15 24 L4 4 Q15 10 26 4 Z" fill="#2B1D17" /></svg>
                </div>
                {wheel}
                <button onClick={spin} aria-label="Zavrti kolo" className="font-display absolute left-1/2 top-1/2 flex h-[70px] w-[70px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-none bg-transparent text-[13px] font-extrabold tracking-[0.04em] text-[#F5EFE6]">
                  {spinning ? "···" : "ZAVRTI"}
                </button>
              </div>
              <div className="mt-0.5 text-[13px] text-[#A6967F]">Zadetek prevzameš ob prijavi</div>
            </div>
          )}

          {/* WON */}
          {step === "won" && (
            <div className="flex flex-col items-center gap-4 pb-1 pt-2 text-center">
              <div style={{ animation: "popIn 0.5s cubic-bezier(0.2,1.5,0.4,1) both" }}>
                <div className="flex h-[92px] w-[92px] items-center justify-center rounded-full" style={{ background: "var(--brand)", boxShadow: "0 12px 30px rgba(232,162,61,0.4)" }}>
                  <Icon name="cup" color="#2B1D17" size={44} strokeWidth={1.7} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="font-display text-[28px] font-extrabold">Zadetek! 🎉</div>
                <div className="max-w-[280px] text-[15.5px] leading-snug text-[#5C4C3E]">Osvojil si <strong>brezplačno kavo</strong> za svoj prvi obisk.</div>
              </div>
              <div className="flex w-full items-center gap-3 rounded-[16px] border-[1.5px] border-dashed p-3.5" style={{ background: "#FBF4E8", borderColor: "var(--brand)" }}>
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[11px]" style={{ background: "var(--brand)" }}><Icon name="cup" color="#2B1D17" size={22} strokeWidth={1.8} /></div>
                <div className="text-left leading-tight">
                  <div className="font-display text-[16px] font-bold">Brezplačna kava</div>
                  <div className="text-[12.5px] text-[#8A7A66]">vrednost 2,20 € · velja 14 dni</div>
                </div>
              </div>
              <button onClick={() => setStep("register")} className="flex h-[54px] w-full items-center justify-center gap-2 rounded-full bg-[#2B1D17] text-[16px] font-semibold text-[#F5EFE6]">
                Prevzemi nagrado <Icon name="arrowR" color="#F5EFE6" size={17} strokeWidth={2} />
              </button>
            </div>
          )}

          {/* REGISTER */}
          {step === "register" && (
            <div className="flex flex-col gap-4">
              <button onClick={() => setStep("won")} aria-label="Nazaj" className="flex h-9 w-9 items-center justify-center self-start rounded-full" style={{ background: "rgba(43,29,23,0.06)" }}><Icon name="chevronL" color="#2B1D17" size={16} strokeWidth={2} /></button>
              <div className="flex flex-col gap-1.5">
                <div className="font-display text-[24px] font-extrabold leading-[1.1]">Skoraj tvoje ☕</div>
                <div className="text-[14.5px] leading-snug text-[#5C4C3E]">Prijavi se, da shranimo tvoj kupon in ti pošljemo nagrado.</div>
              </div>
              <button onClick={() => { setMethod("google"); doRegister({ email: `gost-${Math.random().toString(36).slice(2, 8)}@gmail.com` }); }} disabled={busy} className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-[14px] border-[1.5px] border-[#DDD2C0] bg-white text-[15px] font-semibold text-[#2B1D17] disabled:opacity-50">
                <GoogleLogo /> Nadaljuj z Googlom
              </button>
              <div className="flex items-center gap-3"><div className="h-px flex-1 bg-[#E6DCC9]" /><span className="text-[12.5px] text-[#A6967F]">ali s telefonsko</span><div className="h-px flex-1 bg-[#E6DCC9]" /></div>
              <div className="flex flex-col gap-2.5">
                <div className="flex h-[52px] items-center overflow-hidden rounded-[14px] border-[1.5px] border-[#2B1D17] bg-white">
                  <div className="flex h-full items-center bg-[#F1E7D2] px-3.5 text-[15px] font-semibold text-[#5C4C3E]">🇸🇮 +386</div>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="31 204 412" className="h-full min-w-0 flex-1 bg-transparent px-3.5 text-[17px] font-semibold text-[#2B1D17] outline-none" />
                </div>
                <button onClick={() => phone.trim() && setStep("otp")} className="h-[52px] w-full rounded-[14px] text-[15px] font-bold text-[#2B1D17]" style={{ background: "var(--brand)" }}>Pošlji kodo na telefon</button>
              </div>
              <div className="text-center text-[12px] leading-snug text-[#A6967F]">S prijavo se strinjaš s pogoji. Brez gesla, brez spama.</div>
            </div>
          )}

          {/* OTP */}
          {step === "otp" && (
            <div className="flex flex-col items-center gap-4">
              <button onClick={() => setStep("register")} aria-label="Nazaj" className="flex h-9 w-9 items-center justify-center self-start rounded-full" style={{ background: "rgba(43,29,23,0.06)" }}><Icon name="chevronL" color="#2B1D17" size={16} strokeWidth={2} /></button>
              <div className="flex flex-col items-center gap-1.5 text-center">
                <div className="font-display text-[24px] font-extrabold leading-[1.1]">Vnesi kodo</div>
                <div className="max-w-[260px] text-[14px] leading-snug text-[#5C4C3E]">Poslali smo 4-mestno kodo na <strong>+386 {phone}</strong></div>
              </div>
              <div className="flex gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="font-display flex h-[62px] w-[54px] items-center justify-center rounded-[14px] border-2 bg-white text-[26px] font-bold text-[#2B1D17]" style={{ borderColor: i === otp.length ? "var(--brand)" : otp[i] ? "#2B1D17" : "#E0D4BF" }}>{otp[i] || ""}</div>
                ))}
              </div>
              <div className="mt-1 grid w-full max-w-[280px] grid-cols-3 gap-[9px]">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "del", "0", "ok"].map((k) => {
                  const isOk = k === "ok", isDel = k === "del";
                  return (
                    <button key={k} onClick={() => pressKey(k)} disabled={busy} className="font-display flex h-[52px] items-center justify-center rounded-[14px] border border-[#EEE3D0] text-[21px] font-bold" style={{ background: isOk ? "var(--brand)" : "#FFFFFF", color: isOk ? "#2B1D17" : isDel ? "#8A7A66" : "#2B1D17" }}>
                      {isOk ? "✓" : isDel ? "⌫" : k}
                    </button>
                  );
                })}
              </div>
              <div className="mt-0.5 text-[13px] text-[#8A7A66]">Nisi prejel kode? <span className="font-semibold text-[#2B1D17] underline">Pošlji znova</span></div>
            </div>
          )}

          {/* COUPON */}
          {step === "coupon" && (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-[62px] w-[62px] items-center justify-center rounded-full border-[2.5px] border-[#5E7F52]" style={{ background: "rgba(94,127,82,0.14)", animation: "popIn 0.5s cubic-bezier(0.2,1.5,0.4,1) both" }}><Icon name="check" color="#5E7F52" size={28} strokeWidth={2.4} /></div>
              <div className="flex flex-col gap-1">
                <div className="font-display text-[24px] font-extrabold">Kupon je tvoj!</div>
                <div className="max-w-[280px] text-[14px] leading-snug text-[#5C4C3E]">{method === "google" ? "Shranili smo ga na tvoj račun in poslali na e-pošto." : "Poslali smo ga tudi kot SMS na tvoj telefon."}</div>
              </div>
              <div className="relative w-full rounded-[20px] bg-[#2B1D17] px-5 py-[22px] text-[#F5EFE6]">
                <div className="absolute left-[-10px] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-[#FFFCF6]" />
                <div className="absolute right-[-10px] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-[#FFFCF6]" />
                <div className="mb-1 flex items-center justify-center gap-2.5">
                  <span className="h-[7px] w-[7px] rounded-full" style={{ background: "var(--brand)" }} />
                  <span className="text-[11.5px] font-bold tracking-[0.16em]" style={{ color: "var(--brand)" }}>{venueName}</span>
                </div>
                <div className="font-display text-center text-[24px] font-extrabold">Brezplačna kava</div>
                <div className="my-3.5 border-t-[1.5px] border-dashed" style={{ borderColor: "rgba(245,239,230,0.28)" }} />
                <div className="flex items-center gap-4">
                  <div className="rounded-[10px] bg-white p-2"><FakeQr px={70} seed={7} /></div>
                  <div className="flex flex-col gap-[3px] text-left">
                    <div className="text-[11px] text-[#B7A488]">Koda kupona</div>
                    <div className="font-display whitespace-nowrap text-[20px] font-extrabold tracking-[0.08em]">{couponCode || "MOKA-7C4D"}</div>
                    <div className="mt-0.5 text-[12px] text-[#B7A488]">Velja 14 dni · ob prvem obisku</div>
                  </div>
                </div>
              </div>
              <div className="text-[13px] leading-snug text-[#5C4C3E]">Pokaži kodo osebju ob naročilu.</div>
              <a href={`/p/${code}`} className="flex h-12 w-full items-center justify-center rounded-full bg-[#2B1D17] text-[15px] font-semibold text-[#F5EFE6]">Na mojo stran zvestobe →</a>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5 border-t border-[#F1E7D2] px-6 pb-4 pt-2.5">
          <span className="text-[11px] text-[#B6A78F]">powered by</span>
          <span className="flex items-center gap-1">
            <span className="h-[14px] w-[14px] rounded-full border-[1.6px] border-[#C8512B]" style={{ background: "rgba(200,81,43,0.07)" }} />
            <span className="font-display text-[12.5px] font-extrabold text-[#2B1D17]">Žig</span>
          </span>
        </div>
      </div>
    </div>
  );
}
