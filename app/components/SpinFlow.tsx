"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/ssrClient";
import { BRAND } from "@/lib/brand";
import type { WheelConfig } from "@/lib/types";
import { gt } from "@/lib/guestI18n";

// Nova design paleta (Plus Jakarta Sans)
const INK = "#2A241D";
const CREAM = "#FBF7F0";
const MUTED = "#6E6253";
const SEGS = ["Brezplačna kava", "−10 %", "+30 točk", "Piškot", "−15 %", "Sirup"];
const r2 = (n: number) => Math.round(n * 100) / 100;

function CoffeeIcon({ size = 44, stroke = "#fff", w = 1.7 }: { size?: number; stroke?: string; w?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ fill: "none", stroke, strokeWidth: w, strokeLinecap: "round", strokeLinejoin: "round" }}>
      <path d="M5 9h10v5.5A4.5 4.5 0 0 1 10.5 19h-1A4.5 4.5 0 0 1 5 14.5V9Z" />
      <path d="M15 10.5h1.6a2.4 2.4 0 0 1 0 4.8H15" />
      <path d="M7.6 6c0-1 .9-1 .9-2M11 6c0-1 .9-1 .9-2" />
    </svg>
  );
}

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path d="M21.6 12.2c0-.7-.06-1.3-.18-1.9H12v3.6h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.2Z" fill="#4285F4" />
      <path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z" fill="#34A853" />
      <path d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1A10 10 0 0 0 2 12c0 1.6.4 3.2 1.1 4.6L6.4 14Z" fill="#FBBC05" />
      <path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 2.9 14.7 2 12 2A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.3 3-4.1 5.6-4.1Z" fill="#EA4335" />
    </svg>
  );
}

function FakeQr({ px = 70, seed = 7 }: { px?: number; seed?: number }) {
  const n = 19;
  let s = seed;
  const rnd = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const inF = (r < 6 && c < 6) || (r < 6 && c >= n - 6) || (r >= n - 6 && c < 6);
      let on: boolean;
      if (inF) {
        const rr = r >= n - 6 ? r - (n - 6) : r;
        const cc = c >= n - 6 ? c - (n - 6) : c;
        on = rr === 0 || rr === 5 || cc === 0 || cc === 5 || (rr >= 2 && rr <= 3 && cc >= 2 && cc <= 3);
      } else on = rnd() > 0.5;
      cells.push(<div key={r + "-" + c} style={{ background: on ? INK : "transparent" }} />);
    }
  }
  return <div style={{ width: px, height: px, display: "grid", gridTemplateColumns: "repeat(19,1fr)", gridTemplateRows: "repeat(19,1fr)" }}>{cells}</div>;
}

export default function SpinFlow({
  code,
  venueName,
  venueInitial,
  brandColor = "#E2A04A",
  tagline,
  wheel,
  demo = false,
  lang,
}: {
  code: string;
  venueName: string;
  venueInitial: string;
  brandColor?: string;
  tagline?: string;
  wheel?: WheelConfig | null;
  demo?: boolean;
  lang?: string;
}) {
  const t = gt(lang);
  // lastnikova barva tematizira CEL spin flow (kot gostova domača stran)
  const brand = /^#[0-9a-fA-F]{6}$/.test(brandColor) ? brandColor : "#C4623D";
  const hx = (c: string) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const hexA = (c: string, al: number) => { const [r, g, b] = hx(c); return `rgba(${r},${g},${b},${al})`; };
  const mixc = (c1: string, c2: string, tt: number) => { const a = hx(c1), b = hx(c2); return `#${a.map((v, i) => Math.round(v + (b[i] - v) * tt).toString(16).padStart(2, "0")).join("")}`; };
  const brandDeep = mixc(brand, INK, 0.45);
  // konfiguracija kolesa (lastnik jo nastavi v dashboardu); fallback = privzeti segmenti
  const cfg = wheel && Array.isArray(wheel.segments) && wheel.segments.length >= 2 ? wheel : null;
  const enabled = cfg ? cfg.enabled !== false : true;
  const segs = cfg ? cfg.segments.map((s) => s.label || "—") : SEGS;
  const N = segs.length;

  function pickWinner(): number {
    if (!cfg) return 0;
    if (cfg.mode === "weighted") {
      const total = cfg.segments.reduce((a, s) => a + (Number(s.weight) || 0), 0);
      if (total <= 0) return 0;
      let x = Math.random() * total;
      for (let i = 0; i < cfg.segments.length; i++) { x -= Number(cfg.segments[i].weight) || 0; if (x <= 0) return i; }
      return cfg.segments.length - 1;
    }
    return Math.max(0, Math.min(cfg.winner ?? 0, N - 1));
  }

  const [step, setStep] = useState<"wheel" | "won" | "register" | "coupon">(enabled ? "wheel" : "register");
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [wonIndex, setWonIndex] = useState(cfg && cfg.mode === "fixed" ? Math.max(0, Math.min(cfg.winner ?? 0, N - 1)) : 0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [regErr, setRegErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [gErr, setGErr] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const wonLabel = segs[wonIndex] || segs[0] || "Nagrada";

  function spin() {
    if (spinning || step !== "wheel") return;
    setSpinning(true);
    const seg = 360 / N;
    const w = pickWinner();
    setWonIndex(w);
    const cur = ((rotation % 360) + 360) % 360;
    const target = (360 - (w * seg + seg / 2) + 360) % 360; // sredina zmagovalnega segmenta na kazalec (vrh)
    const jMax = Math.max(2, seg / 2 - 8);
    const jitter = Math.round((Math.random() * 2 - 1) * jMax);
    const delta = (target - cur + 360) % 360;
    setRotation(rotation + 360 * 5 + delta + jitter);
    setTimeout(() => {
      setSpinning(false);
      setStep("won");
    }, 4400);
  }

  // welcome kupon je NA ČAKANJU — aktivira se šele ob prvem skeniranju pravega računa
  function grantWelcomeCoupon(label: string) {
    const ck = `loyalty:${code}:coupons`;
    const already = localStorage.getItem(`loyalty:${code}:welcomeClaimed`) === "1";
    if (!already) {
      let coupons: { id: string; name: string; pending?: boolean }[] = [];
      try { coupons = JSON.parse(localStorage.getItem(ck) || "[]"); } catch {}
      coupons.push({ id: "w" + Date.now() + Math.random().toString(36).slice(2, 7), name: label, pending: true });
      localStorage.setItem(ck, JSON.stringify(coupons));
      localStorage.setItem(`loyalty:${code}:welcomeClaimed`, "1");
    }
    setCouponCode(`${code.slice(0, 4).toUpperCase()}-${Math.random().toString(16).slice(2, 6).toUpperCase()}`);
  }

  async function doRegister(payload: { email?: string; password?: string }) {
    if (demo) {
      localStorage.setItem(`loyalty:${code}:customerId`, "demo");
      if (!enabled) { window.location.href = `/p/${code}`; return; }
      grantWelcomeCoupon(wonLabel);
      setStep("coupon");
      return;
    }
    setBusy(true);
    setRegErr("");
    try {
      const r = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venueCode: code, ...payload }),
      });
      const j = await r.json();
      if (!j.ok) { setBusy(false); setRegErr(j.error || "Napaka pri prijavi."); return; }
      localStorage.setItem(`loyalty:${code}:customerId`, j.customerId);
    } catch {
      setBusy(false); setRegErr("Napaka povezave. Poskusi znova."); return;
    }
    setBusy(false);
    if (!enabled) { window.location.href = `/p/${code}`; return; }
    grantWelcomeCoupon(wonLabel);
    setStep("coupon");
  }

  function submitRegister() {
    const mail = email.trim();
    setRegErr("");
    if (!mail || !/.+@.+\..+/.test(mail)) { setRegErr("Vpiši veljaven email."); return; }
    if (password.length < 4) { setRegErr("Geslo naj ima vsaj 4 znake."); return; }
    doRegister({ email: mail, password });
  }

  // Google: pravi OAuth prek Supabase (brezplačen). V demu samo nadaljuj.
  async function googleSignIn() {
    if (demo) { doRegister({}); return; }
    setGErr("");
    setBusy(true);
    try {
      const sb = createBrowserSupabase();
      localStorage.setItem(`loyalty:${code}:pendingGoogle`, "1");
      const { error } = await sb.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/p/${code}/spin?gwin=1` },
      });
      if (error) throw error;
    } catch {
      localStorage.removeItem(`loyalty:${code}:pendingGoogle`);
      setBusy(false);
      setGErr(t.googleNotSet);
    }
  }

  // vrnitev z Googla
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const pending = localStorage.getItem(`loyalty:${code}:pendingGoogle`) === "1";
    if (url.searchParams.get("gwin") !== "1" && !pending) return;
    (async () => {
      try {
        const sb = createBrowserSupabase();
        const { data } = await sb.auth.getSession();
        const mail = data.session?.user?.email;
        if (!mail) return;
        localStorage.removeItem(`loyalty:${code}:pendingGoogle`);
        url.searchParams.delete("gwin");
        window.history.replaceState({}, "", url.pathname + (url.search || ""));
        setStep("won");
        await doRegister({ email: mail });
      } catch {
        localStorage.removeItem(`loyalty:${code}:pendingGoogle`);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- WHEEL SVG (rotacija na ovojnem divu — CSS prehod) ----
  const wheelEl = (() => {
    const cx = 100, cy = 100, r = 92, segA = 360 / N;
    const polar = (deg: number) => { const a = ((deg - 90) * Math.PI) / 180; return [r2(cx + r * Math.cos(a)), r2(cy + r * Math.sin(a))]; };
    const hi = cfg && cfg.mode === "weighted" ? -1 : wonIndex; // ne razkrij zmagovalca pri naključnem
    const paths: React.ReactNode[] = [];
    const labels: React.ReactNode[] = [];
    // dolg label razdeli v ≤2 vrstici po besedah (npr. "Brezplačna kava" → "Brezplačna" / "kava")
    const wrapLabel = (s: string): string[] => {
      const txt = (s || "").trim();
      const words = txt.split(/\s+/);
      if (words.length <= 1 || txt.length <= 12) return [txt.slice(0, 13)]; // kratki ostanejo 1 vrstica
      let best = 1, bestDiff = Infinity;
      for (let k = 1; k < words.length; k++) {
        const l1 = words.slice(0, k).join(" ").length;
        const diff = Math.abs(l1 - (txt.length - l1));
        if (diff < bestDiff) { bestDiff = diff; best = k; }
      }
      return [words.slice(0, best).join(" ").slice(0, 13), words.slice(best).join(" ").slice(0, 13)];
    };
    for (let i = 0; i < N; i++) {
      const [x0, y0] = polar(i * segA);
      const [x1, y1] = polar((i + 1) * segA);
      const win = i === hi;
      const fill = win ? brandColor : i % 2 === 0 ? "#FFFFFF" : "#F6EAD6";
      paths.push(<path key={"p" + i} d={`M${cx} ${cy} L${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1} Z`} fill={fill} stroke="#EAD9BC" strokeWidth={1} />);
      const mid = i * segA + segA / 2;
      const a = ((mid - 90) * Math.PI) / 180;
      const lx = r2(cx + r * 0.62 * Math.cos(a));
      const ly = r2(cy + r * 0.62 * Math.sin(a));
      const lines = wrapLabel(segs[i] || "");
      labels.push(
        <text key={"t" + i} x={lx} y={ly} transform={`rotate(${mid} ${lx} ${ly})`} textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: "var(--font-jakarta), sans-serif", fontWeight: win ? 800 : 700, fontSize: N > 7 ? 7.5 : N > 6 ? 8 : 9, fill: win ? "#FFFFFF" : "#7A6A50" }}>
          {lines.length === 1 ? lines[0] : (
            <>
              <tspan x={lx} dy="-0.42em">{lines[0]}</tspan>
              <tspan x={lx} dy="0.95em">{lines[1]}</tspan>
            </>
          )}
        </text>,
      );
    }
    return (
      <div style={{ transform: `rotate(${rotation}deg)`, transition: "transform 4.4s cubic-bezier(0.16,0.7,0.18,1)", willChange: "transform" }}>
        <svg width="288" height="288" viewBox="0 0 200 200" style={{ display: "block", filter: "drop-shadow(0 12px 26px rgba(42,36,29,0.16))" }}>
          <g>{paths}{labels}</g>
          <circle cx={cx} cy={cy} r={r + 2} fill="none" stroke={INK} strokeWidth={4} />
          <circle cx={cx} cy={cy} r={28} fill={INK} stroke="#FFFFFF" strokeWidth={3} />
        </svg>
      </div>
    );
  })();

  const kicker = t.kicker[step];

  return (
    <main
      style={{
        minHeight: "100dvh",
        fontFamily: "var(--font-jakarta), sans-serif",
        color: INK,
        background: `linear-gradient(170deg,${hexA(brand, 0.20)} 0%,${hexA(brand, 0.34)} 42%,#FBF7F0 42%,#FBF7F0 100%)`,
        boxSizing: "border-box",
        padding: "44px 18px 32px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* brand header */}
      <div className="flex flex-col items-center gap-2.5" style={{ marginBottom: 16 }}>
        <div className="flex items-center justify-center" style={{ width: 58, height: 58, borderRadius: 18, background: brand, color: "#FFFFFF", fontWeight: 800, fontSize: 26, boxShadow: `0 10px 24px ${hexA(brand, 0.32)}` }}>{venueInitial}</div>
        <div className="text-center">
          <div style={{ fontWeight: 800, fontSize: 21, letterSpacing: "-0.01em" }}>{t.welcomeTo(venueName)}</div>
          <div style={{ fontSize: 13.5, color: brandDeep, marginTop: 2 }}>{tagline || t.firstVisitReward}</div>
        </div>
      </div>

      {/* card */}
      <div style={{ width: "100%", maxWidth: 404, background: "#FFFFFF", borderRadius: 28, boxShadow: "0 2px 8px rgba(42,36,29,0.05),0 24px 50px rgba(42,36,29,0.12)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div className="flex items-center justify-between" style={{ padding: "22px 22px 0" }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9A8F80" }}>{kicker}</span>
          <span className="flex items-center" style={{ height: 26, padding: "0 11px", borderRadius: 999, background: hexA(brand, 0.16), color: brandDeep, fontSize: 11, fontWeight: 800 }}>{t.oneSpin}</span>
        </div>

        <div style={{ padding: "14px 22px 24px" }}>
          {/* WHEEL */}
          {step === "wheel" && (
            <div className="flex flex-col items-center" style={{ gap: 8 }}>
              <div style={{ fontWeight: 800, fontSize: 24, lineHeight: 1.1, textAlign: "center", letterSpacing: "-0.01em" }}>{t.spinAndWin}</div>
              <div style={{ fontSize: 14, color: MUTED, textAlign: "center", lineHeight: 1.45, maxWidth: 270 }}>{t.everyGuestReward}</div>
              <div style={{ position: "relative", width: 288, height: 288, marginTop: 10 }}>
                <div style={{ position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)", zIndex: 3, filter: "drop-shadow(0 3px 4px rgba(42,36,29,0.3))" }}>
                  <svg width="30" height="26" viewBox="0 0 30 26"><path d="M15 24 L4 4 Q15 10 26 4 Z" fill={INK} /></svg>
                </div>
                {wheelEl}
                <button onClick={spin} aria-label="Zavrti" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 72, height: 72, borderRadius: "50%", border: "none", background: "transparent", color: CREAM, fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: "0.04em", cursor: "pointer" }}>{spinning ? "···" : t.spin}</button>
              </div>
              <div style={{ fontSize: 12.5, color: "#9A8F80", marginTop: 4 }}>{t.claimAfterRegister}</div>
            </div>
          )}

          {/* WON */}
          {step === "won" && (
            <div className="flex flex-col items-center text-center" style={{ gap: 16, padding: "6px 0" }}>
              <div className="flex items-center justify-center" style={{ width: 92, height: 92, borderRadius: 28, background: `linear-gradient(150deg,${mixc(brand, "#FFFFFF", 0.32)},${brand})`, boxShadow: `0 14px 30px ${hexA(brand, 0.4)}`, animation: "popIn 0.5s cubic-bezier(0.2,1.5,0.4,1) both" }}>
                <CoffeeIcon size={44} />
              </div>
              <div className="flex flex-col" style={{ gap: 6 }}>
                <div style={{ fontWeight: 800, fontSize: 27, letterSpacing: "-0.01em" }}>{t.hit}</div>
                <div style={{ fontSize: 15, color: MUTED, lineHeight: 1.5, maxWidth: 270 }}>{t.youWon(wonLabel)}</div>
              </div>
              <div className="flex items-center" style={{ width: "100%", background: `linear-gradient(135deg,${hexA(brand, 0.13)},${hexA(brand, 0.22)})`, borderRadius: 16, padding: 14, gap: 12 }}>
                <div className="flex items-center justify-center" style={{ width: 42, height: 42, borderRadius: 12, background: "#FFFFFF", flexShrink: 0 }}><CoffeeIcon size={22} stroke={brandColor} w={1.8} /></div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{wonLabel}</div>
                  <div style={{ fontSize: 12, color: brandDeep, fontWeight: 600 }}>{t.validDaysFirst}</div>
                </div>
              </div>
              <button onClick={() => setStep("register")} className="flex items-center justify-center" style={{ width: "100%", height: 56, border: "none", borderRadius: 18, background: INK, color: CREAM, fontFamily: "var(--font-jakarta), sans-serif", fontSize: 16, fontWeight: 700, cursor: "pointer", gap: 8 }}>
                {t.claimReward}
                <svg width="17" height="17" viewBox="0 0 24 24" style={{ fill: "none", stroke: CREAM, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
            </div>
          )}

          {/* REGISTER (email) */}
          {step === "register" && (
            <div className="flex flex-col" style={{ gap: 16 }}>
              <button onClick={() => setStep("won")} aria-label="Nazaj" className="flex items-center justify-center" style={{ alignSelf: "flex-start", width: 38, height: 38, borderRadius: 12, border: "none", background: CREAM, cursor: "pointer" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" style={{ fill: "none", stroke: INK, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M14.5 5.5 8 12l6.5 6.5" /></svg>
              </button>
              <div className="flex flex-col" style={{ gap: 6 }}>
                <div style={{ fontWeight: 800, fontSize: 23, lineHeight: 1.1, letterSpacing: "-0.01em" }}>{t.almostYours}</div>
                <div style={{ fontSize: 14.5, color: MUTED, lineHeight: 1.5 }}>{t.emailPassNote}</div>
              </div>
              <div className="flex flex-col" style={{ gap: 8 }}>
                <label htmlFor="reg-email" style={{ fontSize: 13, fontWeight: 700, color: MUTED }}>{t.email}</label>
                <input
                  id="reg-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="tvoj@email.com"
                  style={{ height: 54, border: "1.5px solid #E4D9C7", borderRadius: 16, background: CREAM, padding: "0 16px", fontFamily: "var(--font-jakarta), sans-serif", fontSize: 16, fontWeight: 600, color: INK, outline: "none" }}
                />
              </div>
              <div className="flex flex-col" style={{ gap: 8 }}>
                <label htmlFor="reg-pass" style={{ fontSize: 13, fontWeight: 700, color: MUTED }}>{t.password}</label>
                <input
                  id="reg-pass"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") submitRegister(); }}
                  type="password"
                  autoComplete="current-password"
                  placeholder={t.min4}
                  style={{ height: 54, border: "1.5px solid #E4D9C7", borderRadius: 16, background: CREAM, padding: "0 16px", fontFamily: "var(--font-jakarta), sans-serif", fontSize: 16, fontWeight: 600, color: INK, outline: "none" }}
                />
              </div>
              {regErr && <div style={{ fontSize: 12.5, color: "#C8512B", fontWeight: 600 }}>{regErr}</div>}
              <button onClick={submitRegister} disabled={busy} style={{ width: "100%", height: 56, border: "none", borderRadius: 18, background: brandColor, color: INK, fontFamily: "var(--font-jakarta), sans-serif", fontSize: 16, fontWeight: 800, cursor: "pointer", opacity: busy ? 0.6 : 1 }}>{busy ? "…" : t.claimReward}</button>
              <div className="flex items-center" style={{ gap: 12 }}>
                <div style={{ flex: 1, height: 1, background: "#EBE1D1" }} />
                <span style={{ fontSize: 12.5, color: "#9A8F80" }}>{t.or}</span>
                <div style={{ flex: 1, height: 1, background: "#EBE1D1" }} />
              </div>
              <button onClick={googleSignIn} disabled={busy} className="flex items-center justify-center" style={{ width: "100%", height: 52, border: "1.5px solid #E4D9C7", borderRadius: 16, background: "#FFFFFF", color: INK, fontFamily: "var(--font-jakarta), sans-serif", fontSize: 15, fontWeight: 700, cursor: "pointer", gap: 10, opacity: busy ? 0.6 : 1 }}>
                <GoogleLogo /> {t.continueGoogle}
              </button>
              {gErr && <div style={{ fontSize: 12.5, color: "#C8512B", fontWeight: 600, textAlign: "center" }}>{gErr}</div>}
              <div style={{ fontSize: 12, color: "#9A8F80", lineHeight: 1.45, textAlign: "center" }}>{t.termsNote}</div>
            </div>
          )}

          {/* COUPON */}
          {step === "coupon" && (
            <div className="flex flex-col items-center text-center" style={{ gap: 16 }}>
              <div className="flex items-center justify-center" style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(94,127,82,0.14)", border: "2.5px solid #5E7F52", animation: "popIn 0.5s cubic-bezier(0.2,1.5,0.4,1) both" }}>
                <svg width="30" height="30" viewBox="0 0 24 24" style={{ fill: "none", stroke: "#5E7F52", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M5 12.5l4.2 4.2L18.5 7.5" /></svg>
              </div>
              <div className="flex flex-col" style={{ gap: 4 }}>
                <div style={{ fontWeight: 800, fontSize: 23, letterSpacing: "-0.01em" }}>{t.couponWaits}</div>
                <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.5, maxWidth: 290 }}>{t.couponSavedNote}</div>
              </div>
              <div style={{ width: "100%", background: INK, borderRadius: 20, padding: "22px 20px", position: "relative", color: CREAM }}>
                <div style={{ position: "absolute", top: "50%", left: -10, width: 20, height: 20, borderRadius: "50%", background: CREAM, transform: "translateY(-50%)" }} />
                <div style={{ position: "absolute", top: "50%", right: -10, width: 20, height: 20, borderRadius: "50%", background: CREAM, transform: "translateY(-50%)" }} />
                <div className="flex items-center justify-center" style={{ gap: 8, marginBottom: 4 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: brandColor }} />
                  <span style={{ fontSize: 11, letterSpacing: "0.16em", fontWeight: 800, color: brandColor }}>{venueName.toUpperCase()}</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 23, textAlign: "center", letterSpacing: "-0.01em" }}>{wonLabel}</div>
                <div style={{ margin: "14px 0", borderTop: "1.5px dashed rgba(251,243,230,0.26)" }} />
                <div className="flex items-center" style={{ gap: 16 }}>
                  <div style={{ background: "#FFFFFF", borderRadius: 10, padding: 8 }}><FakeQr px={70} seed={7} /></div>
                  <div className="flex flex-col" style={{ gap: 3, textAlign: "left" }}>
                    <div style={{ fontSize: 11, color: "#A89878" }}>{t.couponCode}</div>
                    <div style={{ fontWeight: 800, fontSize: 19, letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{couponCode || "MORA-7C4D"}</div>
                    <div style={{ fontSize: 12, color: "#A89878", marginTop: 2 }}>{t.activatesOnFirstScan}</div>
                  </div>
                </div>
              </div>
              <a href={`/p/${code}`} className="flex items-center justify-center" style={{ width: "100%", height: 54, borderRadius: 16, background: INK, color: CREAM, fontFamily: "var(--font-jakarta), sans-serif", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>{t.toMyLoyalty}</a>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center" style={{ padding: "12px 22px 16px", borderTop: "1px solid #F1E8D9", gap: 6 }}>
          <span style={{ fontSize: 11, color: "#B7AB97" }}>{t.poweredBy}</span>
          <span style={{ fontWeight: 800, fontSize: 12, color: INK }}>{BRAND}</span>
        </div>
      </div>

      <div style={{ marginTop: 14, textAlign: "center", fontSize: 12, color: "#9A8F80" }}>{t.noAppNote}</div>
    </main>
  );
}
