"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Venue, Reward } from "@/lib/types";
import { parseFiscalQR, FiscalQRError } from "@/lib/fiscalQr";
import { Icon, FakeQr } from "@/app/components/icons";
import Scanner from "@/app/components/Scanner";
import Wheel from "@/app/components/Wheel";
import { WHEEL_SLOTS, WHEEL_TARGET } from "@/lib/demo";

const ROTS = [-5, 3, -2, 6, -4, 2, -6, 4, -3, 5];
const REWARD_ICONS = ["cup", "croissant", "cake"];

// Okrasni plavajoči nagradni čipi okoli kolesa (samo desktop) — da PC zaslon ni prazen
const INTRO_CHIPS: { e: string; t: string; pos: React.CSSProperties; anim: string }[] = [
  { e: "☕", t: "Brezplačna kava", pos: { top: "20%", left: "9%" }, anim: "floaty 5s ease-in-out infinite" },
  { e: "🎯", t: "+30 točk", pos: { top: "14%", right: "8%" }, anim: "floaty2 6s ease-in-out infinite" },
  { e: "🏷️", t: "−10 % popust", pos: { bottom: "22%", left: "11%" }, anim: "floaty2 6.6s ease-in-out infinite" },
  { e: "🎁", t: "Nagrada ob prijavi", pos: { bottom: "16%", right: "7%" }, anim: "floaty 5.4s ease-in-out infinite" },
];

function shortLabel(name: string): string {
  const w = name.split(/\s+/).filter((x) => !/^brezpla/i.test(x));
  return (w[0] || name).toUpperCase().slice(0, 6);
}

function mmss(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function StampGrid({ stamps, animateNew, goalLabel }: { stamps: number; animateNew?: boolean; goalLabel: string }) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {Array.from({ length: 10 }).map((_, i) => {
        const filled = i < stamps;
        const isNew = animateNew && filled && i === stamps - 1;
        const isReward = i === 9;
        return (
          <div
            key={i}
            className="relative flex aspect-square items-center justify-center rounded-full"
            style={{ boxSizing: "border-box", border: filled ? "2px solid transparent" : `2px dashed ${isReward ? "#E8A23D" : "#D9CDBA"}` }}
          >
            {filled ? (
              <div style={{ position: "absolute", inset: 0, animation: isNew ? "stampIn 0.55s cubic-bezier(0.2,1.4,0.5,1) both 0.3s" : "none" }}>
                <div
                  style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2.5px solid #C8512B", background: "rgba(200,81,43,0.07)", display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${ROTS[i]}deg)` }}
                >
                  <Icon name="cup" color="#C8512B" size={24} />
                </div>
              </div>
            ) : isReward ? (
              <span className="font-display" style={{ fontWeight: 700, fontSize: 10, letterSpacing: "0.05em", color: "#B97F1F" }}>{goalLabel}</span>
            ) : (
              <span style={{ fontSize: 12, fontWeight: 600, color: "#C9BCA5" }}>{i + 1}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

type Activation = { redemptionId: string | null; rewardName: string; pointsSpent: number; expiresAt: number };

export default function GuestApp({ venue, rewards, demo = false }: { venue: Venue; rewards: Reward[]; demo?: boolean }) {
  const storageKey = `loyalty:${venue.public_code}:customerId`;
  const activationKey = `loyalty:${venue.public_code}:activation`;
  const minutes = venue.redemption_minutes || 5;
  const sorted = [...rewards].sort((a, b) => a.points_required - b.points_required);
  const logoBg = venue.brand_color && venue.brand_color !== "#16a34a" ? venue.brand_color : "#2B1D17";

  const [customerId, setCustomerId] = useState<string | null>(null);
  const [points, setPoints] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<"home" | "success" | "error">("home");
  const [scanning, setScanning] = useState(false);
  const [awarded, setAwarded] = useState(0);
  const [errText, setErrText] = useState<{ t: string; h: string }>({ t: "", h: "" });
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [stars, setStars] = useState(0);
  const [fb, setFb] = useState("");
  const [reviewDone, setReviewDone] = useState(false);
  const [cardCompleted, setCardCompleted] = useState(false);
  const [completedReward, setCompletedReward] = useState("");
  const demoZois = useRef<Set<string>>(new Set());

  const googleReviewUrl =
    venue.google_review_url || `https://www.google.com/search?q=${encodeURIComponent(venue.name)}`;

  const couponsKey = `loyalty:${venue.public_code}:coupons`;
  const [coupons, setCoupons] = useState<{ id: string; name: string }[]>([]);
  const [pendingPrize, setPendingPrize] = useState<string | null>(null);
  const [spun, setSpun] = useState(false);

  const [redeemReward, setRedeemReward] = useState<Reward | null>(null);
  const [sheetStep, setSheetStep] = useState<1 | 2>(1);
  const [activation, setActivation] = useState<Activation | null>(null);
  const [redeemedName, setRedeemedName] = useState<string | null>(null);
  const [now, setNow] = useState(0);

  const goal = sorted.length ? sorted[0].points_required : venue.points_per_visit * 10;
  const stampValue = goal / 10;
  const stamps = Math.min(10, Math.floor(points / stampValue));
  const goalLabel = sorted.length ? shortLabel(sorted[0].name) : "KAVA";
  const rewardReady = sorted.length > 0 && points >= goal;
  const left = Math.max(0, goal - points);
  const visitsLeft = Math.max(0, 10 - stamps);
  const visitWord = visitsLeft === 1 ? "obisk" : visitsLeft === 2 ? "obiska" : visitsLeft <= 4 ? "obiske" : "obiskov";
  const isStampMode = venue.points_model === "per_visit";

  const refresh = useCallback(
    async (id: string) => {
      try {
        const r = await fetch(`/api/customer?venueCode=${venue.public_code}&customerId=${id}`);
        const j = await r.json();
        if (j.ok) setPoints(j.points);
        else {
          localStorage.removeItem(storageKey);
          setCustomerId(null);
        }
      } finally {
        setLoaded(true);
      }
    },
    [venue.public_code, storageKey],
  );

  const loadActivation = useCallback(
    async (id: string) => {
      try {
        const r = await fetch(`/api/activation?venueCode=${venue.public_code}&customerId=${id}`);
        const j = await r.json();
        if (j.ok && j.activation) {
          setActivation({ redemptionId: j.activation.redemption_id, rewardName: j.activation.reward_name, pointsSpent: 0, expiresAt: Date.parse(j.activation.expires_at) });
        }
      } catch {}
    },
    [venue.public_code],
  );

  useEffect(() => {
    const prize = new URLSearchParams(window.location.search).get("prize");
    let saved: { id: string; name: string }[] = [];
    try {
      saved = JSON.parse(localStorage.getItem(couponsKey) || "[]");
    } catch {}

    const rawA = localStorage.getItem(activationKey);
    if (rawA) {
      try {
        const a = JSON.parse(rawA);
        if (a.expiresAt > Date.now()) setActivation(a);
        else localStorage.removeItem(activationKey);
      } catch {}
    }

    const id = localStorage.getItem(storageKey);
    if (id) {
      setCustomerId(id);
      if (demo) setLoaded(true);
      else {
        refresh(id);
        loadActivation(id);
      }
      if (prize) {
        saved = [...saved, { id: "c" + prize.length + saved.length, name: prize }];
        localStorage.setItem(couponsKey, JSON.stringify(saved));
      }
      setCoupons(saved);
    } else {
      setLoaded(true);
      setCoupons(saved);
      if (prize) {
        setPendingPrize(prize);
        setSpun(true);
      }
    }
  }, [storageKey, activationKey, couponsKey, refresh, loadActivation, demo]);

  // tik časovnika
  useEffect(() => {
    if (!activation) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [activation]);

  function grantPending() {
    if (!pendingPrize) return;
    const next = [...coupons, { id: "c" + pendingPrize.length + coupons.length, name: pendingPrize }];
    setCoupons(next);
    localStorage.setItem(couponsKey, JSON.stringify(next));
    setPendingPrize(null);
  }

  async function register(e: React.FormEvent) {
    e.preventDefault();
    const mail = email.trim();
    if (!mail || !/.+@.+\..+/.test(mail)) return;
    if (demo) {
      localStorage.setItem(storageKey, "demo");
      setCustomerId("demo");
      setPoints(0);
      grantPending();
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venueCode: venue.public_code, email: mail }),
      });
      const j = await r.json();
      if (j.ok) {
        localStorage.setItem(storageKey, j.customerId);
        setCustomerId(j.customerId);
        setPoints(j.points);
        grantPending();
      } else fail("Napaka", j.error);
    } finally {
      setBusy(false);
    }
  }

  function activateCoupon(coupon: { id: string; name: string }) {
    const a: Activation = { redemptionId: null, rewardName: coupon.name, pointsSpent: 0, expiresAt: Date.now() + minutes * 60000 };
    setActivation(a);
    localStorage.setItem(activationKey, JSON.stringify(a));
    const next = coupons.filter((c) => c.id !== coupon.id);
    setCoupons(next);
    localStorage.setItem(couponsKey, JSON.stringify(next));
  }

  function fail(t: string, h: string) {
    setErrText({ t, h });
    setView("error");
  }

  async function handleScan(payload: string) {
    setScanning(false);
    if (demo) {
      try {
        const parsed = parseFiscalQR(payload);
        if (parsed.davcna !== venue.davcna_stevilka) return fail("Ta račun ni iz tega lokala.", "Točke dobiš za račune, izdane v tem lokalu.");
        if (demoZois.current.has(parsed.zoiHex)) return fail("Ta račun je bil že unovčen.", "Vsak račun prinese točke samo enkrat.");
        demoZois.current.add(parsed.zoiHex);
        const after = points + venue.points_per_visit;
        setAwarded(venue.points_per_visit);
        if (isStampMode && Math.floor(after / stampValue) >= 10) {
          // kartonček poln → kupon v denarnico (stackable) + reset z ostankom
          const rewardName = sorted[0]?.name || "Brezplačna kava";
          const next = [...coupons, { id: "c" + Date.now(), name: rewardName }];
          setCoupons(next);
          localStorage.setItem(couponsKey, JSON.stringify(next));
          setCompletedReward(rewardName);
          setCardCompleted(true);
          setPoints(after - goal);
        } else {
          setCardCompleted(false);
          setPoints(after);
        }
        setView("success");
      } catch (e) {
        fail(e instanceof FiscalQRError ? e.message : "Neveljaven QR.", "Poskusi znova.");
      }
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venueCode: venue.public_code, payload, customerId }),
      });
      const j = await r.json();
      if (j.ok) {
        setPoints(j.totalPoints);
        setAwarded(j.pointsAwarded);
        if (j.cardCompleted) {
          const rewardName = j.cardReward || sorted[0]?.name || "Brezplačna kava";
          const next = [...coupons, { id: "c" + Date.now(), name: rewardName }];
          setCoupons(next);
          localStorage.setItem(couponsKey, JSON.stringify(next));
          setCompletedReward(rewardName);
          setCardCompleted(true);
        } else {
          setCardCompleted(false);
        }
        setView("success");
      } else fail(j.error, "Vsak račun prinese točke samo enkrat.");
    } catch {
      fail("Napaka pri skeniranju.", "Preveri povezavo in poskusi znova.");
    } finally {
      setBusy(false);
    }
  }

  function openRedeem(reward: Reward) {
    setRedeemReward(reward);
    setSheetStep(1);
  }

  async function activate(reward: Reward) {
    if (points < reward.points_required) return;
    if (demo) {
      const a: Activation = { redemptionId: null, rewardName: reward.name, pointsSpent: reward.points_required, expiresAt: Date.now() + minutes * 60000 };
      setPoints((p) => p - reward.points_required);
      setActivation(a);
      localStorage.setItem(activationKey, JSON.stringify(a));
      setRedeemReward(null);
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venueCode: venue.public_code, customerId, rewardId: reward.id }),
      });
      const j = await r.json();
      if (j.ok) {
        setPoints((p) => p - reward.points_required);
        setActivation({ redemptionId: j.redemptionId, rewardName: j.rewardName, pointsSpent: reward.points_required, expiresAt: Date.parse(j.expiresAt) });
        setRedeemReward(null);
      } else {
        setRedeemReward(null);
        fail(j.error, "Poskusi znova.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function confirmActivation() {
    if (!activation) return;
    const name = activation.rewardName;
    if (!demo && activation.redemptionId) {
      setBusy(true);
      try {
        await fetch("/api/confirm-redemption", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ venueCode: venue.public_code, redemptionId: activation.redemptionId }),
        });
      } finally {
        setBusy(false);
      }
    }
    localStorage.removeItem(activationKey);
    setActivation(null);
    setRedeemedName(name);
  }

  function dismissActivation() {
    localStorage.removeItem(activationKey);
    setActivation(null);
  }

  // ---------- render ----------
  if (!loaded) return <div className="flex min-h-dvh items-center justify-center text-[#8A7A66]">…</div>;

  // WHEEL-SPIN za nove obiskovalce (pred prijavo)
  if (!customerId && !spun && !pendingPrize) {
    return (
      <main className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden px-5 py-10" style={{ background: "#EAE2D3" }}>
        {/* topli žarki v ozadju */}
        <div aria-hidden className="pointer-events-none absolute" style={{ top: -130, left: -110, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,162,61,0.24), transparent 70%)" }} />
        <div aria-hidden className="pointer-events-none absolute" style={{ bottom: -150, right: -120, width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,81,43,0.16), transparent 70%)" }} />

        {/* plavajoči nagradni čipi — samo na širših zaslonih, da PC ni prazen */}
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
          {INTRO_CHIPS.map((c, i) => (
            <div key={i} className="absolute flex items-center gap-2 rounded-[14px] border border-[#EFE6D4] bg-[#FFFCF6] py-2 pl-2.5 pr-3.5" style={{ ...c.pos, boxShadow: "0 14px 30px rgba(43,29,23,0.12)", animation: c.anim }}>
              <span className="text-[18px]">{c.e}</span>
              <span className="text-[13px] font-bold text-[#2B1D17]">{c.t}</span>
            </div>
          ))}
        </div>

        {/* osrednja kartica */}
        <div className="relative z-[2] flex w-full max-w-[460px] flex-col items-center rounded-[32px] border border-[#EFE6D4] bg-[#FFFCF6] px-6 pb-8 pt-9" style={{ boxShadow: "0 2px 10px rgba(43,29,23,0.05), 0 30px 70px rgba(43,29,23,0.16)" }}>
          <div className="flex items-center gap-3">
            <Logo bg={logoBg} name={venue.name} />
            <div className="font-display text-lg font-bold">{venue.name}</div>
          </div>
          <div className="mt-4 flex h-[28px] items-center gap-1.5 rounded-full px-3 text-[12px] font-extrabold" style={{ background: "rgba(232,162,61,0.2)", color: "#8A5B14" }}>🎉 1 brezplačen vrtljaj</div>
          <h1 className="mt-3 text-center font-display text-[30px] font-extrabold leading-tight">Zavrti in osvoji!</h1>
          <p className="mb-6 mt-2 max-w-[320px] text-center text-[15px] leading-relaxed text-[#5C4C3E]">Vsak nov gost dobi en vrtljaj. Kaj boš osvojil?</p>
          <Wheel
            slots={WHEEL_SLOTS}
            target={WHEEL_TARGET}
            onResult={(i) => {
              setPendingPrize(WHEEL_SLOTS[i].prize || "Nagrada");
              setSpun(true);
            }}
          />
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
            {["Brez aplikacije", "En vrtljaj", "Nagrada takoj"].map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[#8A7A66]"><Icon name="check" color="#5E7F52" size={14} strokeWidth={2.4} />{t}</span>
            ))}
          </div>
          <button onClick={() => setSpun(true)} className="mt-5 text-[14px] font-semibold text-[#8A7A66] underline">Preskoči — samo zbiram žige</button>
        </div>
      </main>
    );
  }

  // REGISTRACIJA
  if (!customerId) {
    return (
      <main className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden px-5 py-10" style={{ background: "#EAE2D3" }}>
        {/* topli žarki v ozadju */}
        <div aria-hidden className="pointer-events-none absolute" style={{ top: -130, left: -110, width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,162,61,0.22), transparent 70%)" }} />
        <div aria-hidden className="pointer-events-none absolute" style={{ bottom: -150, right: -120, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,81,43,0.15), transparent 70%)" }} />

        <div className="relative z-[2] w-full max-w-[460px] rounded-[32px] border border-[#EFE6D4] bg-[#FFFCF6] px-6 py-8 sm:px-8" style={{ boxShadow: "0 2px 10px rgba(43,29,23,0.05), 0 30px 70px rgba(43,29,23,0.16)" }}>
          <div className="mb-5 flex items-center gap-3">
            <Logo bg={logoBg} name={venue.name} />
            <div className="font-display text-lg font-bold">{venue.name}</div>
          </div>
          {pendingPrize && (
            <div className="mb-5 flex items-center gap-3 rounded-2xl bg-[#5E7F52] px-4 py-3.5 text-[#F5EFE6]">
              <span className="text-2xl">🎉</span>
              <div>
                <div className="font-display text-[15.5px] font-bold">Osvojil si: {pendingPrize}</div>
                <div className="text-[12.5px] opacity-85">Registriraj se, da nagrado prevzameš.</div>
              </div>
            </div>
          )}
          <h1 className="font-display text-[28px] font-extrabold leading-tight sm:text-[31px]">Shrani svoje žige</h1>
          <p className="mb-6 mt-2 text-[15px] leading-relaxed text-[#5C4C3E]">Pusti email, da žigi in nagrade ostanejo tvoji. Brez gesla, brez aplikacije.</p>
          <form onSubmit={register} className="flex flex-col gap-3">
            <label className="text-[13px] font-semibold text-[#5C4C3E]">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="ime@email.com"
              className="h-14 w-full rounded-2xl border-[1.5px] border-[#D9CDBA] bg-[#FFFCF6] px-4 text-[16px] font-semibold text-[#2B1D17] outline-none transition focus:border-[#2B1D17] focus:ring-2 focus:ring-[rgba(43,29,23,0.08)] placeholder:font-normal placeholder:text-[#A6967F]"
            />
            <button disabled={busy} className="mt-1 h-14 rounded-full bg-[#2B1D17] text-[16.5px] font-semibold text-[#F5EFE6] disabled:opacity-50">{busy ? "…" : "Pridruži se"}</button>
          </form>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
            {["Brez gesla", "Brez aplikacije", "Zastonj"].map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[#8A7A66]"><Icon name="check" color="#5E7F52" size={14} strokeWidth={2.4} />{t}</span>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // UNOVČENO (po potrditvi osebja)
  if (redeemedName) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-[18px] px-6 py-12 text-center">
        <div className="flex h-[84px] w-[84px] items-center justify-center rounded-full border-[2.5px] border-[#5E7F52]" style={{ background: "rgba(94,127,82,0.14)", animation: "popIn 0.5s cubic-bezier(0.2,1.4,0.5,1) both" }}>
          <Icon name="check" color="#5E7F52" size={36} strokeWidth={1.9} />
        </div>
        <div className="font-display text-[28px] font-extrabold">{redeemedName} unovčeno</div>
        <div className="max-w-[260px] text-[15.5px] leading-relaxed text-[#5C4C3E]">Dober tek! Kartonček se začne polniti znova.</div>
        <button onClick={() => setRedeemedName(null)} className="mt-2 h-14 w-full rounded-full bg-[#2B1D17] text-[16px] font-semibold text-[#F5EFE6]">Nazaj na kartonček</button>
      </main>
    );
  }

  // AKTIVNO UNOVČENJE — server-side časovnik
  if (activation) {
    const remaining = activation.expiresAt - now;
    const code = `${venue.public_code.slice(0, 4).toUpperCase()}-${(activation.expiresAt % 9000) + 1000}`;
    if (remaining <= 0) {
      return (
        <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-4 px-6 py-12 text-center">
          <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full border-[2.5px] border-[#C8512B]" style={{ background: "rgba(200,81,43,0.12)", transform: "rotate(-4deg)" }}>
            <Icon name="clock" color="#C8512B" size={32} strokeWidth={2} />
          </div>
          <div className="font-display text-[24px] font-extrabold">Čas je potekel</div>
          <div className="max-w-[280px] text-[15px] leading-relaxed text-[#5C4C3E]">Nagrada ni bila prevzeta v {minutes} min, zato je potekla. Točke so že bile porabljene.</div>
          <button onClick={dismissActivation} className="mt-2 h-14 w-full rounded-full bg-[#2B1D17] text-[16px] font-semibold text-[#F5EFE6]">Nazaj na kartonček</button>
        </main>
      );
    }
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-10 pt-14">
        <div className="text-center text-[12px] font-bold uppercase tracking-[0.1em] text-[#8A7A66]">Pokaži natakarju</div>
        <div className="mt-1 text-center font-display text-[52px] font-extrabold tabular-nums" style={{ color: remaining < 60000 ? "#C8512B" : "#2B1D17" }}>{mmss(remaining)}</div>
        <div className="mt-1 text-center text-[14px] text-[#8A7A66]">Velja še, tudi če zapreš aplikacijo.</div>

        <div className="mt-7 flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full flex-col items-center gap-4 rounded-3xl border border-[#EFE6D4] bg-[#FFFCF6] px-8 py-7 shadow-[0_2px_10px_rgba(43,29,23,0.05),0_14px_34px_rgba(43,29,23,0.08)]">
            <div className="font-display text-[22px] font-extrabold">{activation.rewardName}</div>
            <div className="rounded-2xl border border-[#EFE6D4] bg-white p-3.5">
              <FakeQr px={132} seed={(activation.expiresAt % 900) + 7} />
            </div>
            <div className="font-display text-[19px] font-bold tracking-[0.22em]">{code}</div>
          </div>
        </div>

        <button onClick={confirmActivation} disabled={busy} className="mt-6 h-14 w-full rounded-full bg-[#5E7F52] text-[16.5px] font-bold text-[#F5EFE6] shadow-[0_10px_24px_rgba(94,127,82,0.3)] disabled:opacity-50">Osebje potrdi</button>
        <button onClick={dismissActivation} className="mt-2 h-11 w-full rounded-full text-[14px] font-semibold text-[#8A7A66]">Skrij (časovnik še teče)</button>
      </main>
    );
  }

  // SUCCESS (po skeniranju)
  if (view === "success") {
    const displayStamps = cardCompleted ? 10 : stamps;
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-6 px-6 py-12">
        <div className="font-display text-[42px] font-extrabold text-[#5E7F52]" style={{ animation: "popIn 0.5s cubic-bezier(0.2,1.4,0.5,1) both" }}>
          {cardCompleted ? "🎉" : isStampMode ? "+1 žig" : `+${awarded} točk`}
        </div>
        {isStampMode && (
          <div className="w-full rounded-3xl border border-[#EFE6D4] bg-[#FFFCF6] p-5 shadow-[0_2px_10px_rgba(43,29,23,0.05),0_14px_34px_rgba(43,29,23,0.08)]">
            <StampGrid stamps={displayStamps} animateNew goalLabel={goalLabel} />
          </div>
        )}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="font-display text-[28px] font-extrabold">
            {cardCompleted ? "Kartonček je poln!" : isStampMode ? `Žig št. ${displayStamps} je tvoj` : `+${awarded} točk`}
          </div>
          <div className="max-w-[280px] text-[15.5px] leading-relaxed text-[#5C4C3E]">
            {cardCompleted
              ? `Kupon za ${completedReward.toLowerCase()} je v tvoji denarnici 🎟️`
              : isStampMode
                ? `Še ${visitsLeft} ${visitWord} do brezplačne ${(sorted[0]?.name || "kave").toLowerCase()}.`
                : rewardReady
                  ? "Lahko unovčiš nagrado pri osebju."
                  : `Še ${left} točk do nagrade.`}
          </div>
        </div>

        {/* Google-ocene autopilot — 5-zvezdični gate: 4–5★ → Google, 1–3★ → zasebno */}
        <div className="w-full rounded-2xl border border-[#EFE6D4] bg-[#FFFCF6] p-5 text-center">
          {!reviewDone ? (
            <>
              <div className="text-[15px] font-semibold">Kako ti je bilo danes?</div>
              <div className="mt-3 flex justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setStars(n)} aria-label={`${n} zvezdic`} className="text-[34px] leading-none transition-transform active:scale-90" style={{ color: n <= stars ? "#E8A23D" : "#E0D4BF" }}>★</button>
                ))}
              </div>
              {stars >= 4 && (
                <div className="mt-4 flex flex-col items-center gap-2.5">
                  <div className="text-[14px] leading-snug text-[#5C4C3E]">Juhu! 🎉 Nam pomagaš z oceno na Googlu? Traja 10 sekund.</div>
                  <a href={googleReviewUrl} target="_blank" rel="noreferrer" onClick={() => setReviewDone(true)} className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-white text-[15px] font-semibold text-[#2B1D17]" style={{ border: "1.5px solid #DDD2C0" }}>
                    <GoogleG /> Oceni na Googlu
                  </a>
                </div>
              )}
              {stars >= 1 && stars <= 3 && (
                <div className="mt-4 flex flex-col gap-2.5">
                  <div className="text-[14px] leading-snug text-[#5C4C3E]">Žal nam je. Kaj naj popravimo? <span className="text-[#A6967F]">(vidi samo lokal)</span></div>
                  <textarea value={fb} onChange={(e) => setFb(e.target.value)} rows={3} placeholder="Tvoje mnenje…" className="w-full rounded-xl border border-[#D9CDBA] bg-white p-3 text-left text-[14px] outline-none focus:border-[#2B1D17]" />
                  <button onClick={() => setReviewDone(true)} className="h-12 w-full rounded-full bg-[#2B1D17] text-[15px] font-semibold text-[#F5EFE6]">Pošlji lokalu</button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <div className="text-[28px]">🙏</div>
              <div className="text-[15px] font-semibold">{stars >= 4 ? "Najlepša hvala!" : "Hvala za iskrenost!"}</div>
              <div className="text-[13px] text-[#8A7A66]">{stars >= 4 ? "Tvoja ocena ogromno pomeni." : "Sporočili bomo lokalu, da izboljša."}</div>
            </div>
          )}
        </div>

        <button onClick={() => { setView("home"); setStars(0); setFb(""); setReviewDone(false); setCardCompleted(false); }} className="h-14 w-full rounded-full bg-[#2B1D17] text-[16.5px] font-semibold text-[#F5EFE6]">Super, nazaj na kartonček</button>
      </main>
    );
  }

  // ERROR
  if (view === "error") {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-[18px] px-6 py-12 text-center">
        <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full border-[2.5px] border-[#C8512B]" style={{ background: "rgba(200,81,43,0.12)", transform: "rotate(-5deg)" }}>
          <Icon name="x" color="#C8512B" size={30} strokeWidth={2.1} />
        </div>
        <div className="font-display max-w-[300px] text-[24px] font-extrabold leading-tight">{errText.t}</div>
        <div className="max-w-[280px] text-[15px] leading-relaxed text-[#5C4C3E]">{errText.h}</div>
        <div className="text-[13.5px] text-[#8A7A66]">Tvoje točke ostajajo: <strong>{points}</strong></div>
        <div className="mt-2 flex w-full flex-col gap-2.5">
          <button onClick={() => { setView("home"); setScanning(true); }} className="h-14 rounded-full bg-[#2B1D17] text-[16px] font-semibold text-[#F5EFE6]">Skeniraj drug račun</button>
          <button onClick={() => setView("home")} className="h-12 rounded-full text-[15px] font-semibold text-[#8A7A66]">Nazaj na kartonček</button>
        </div>
      </main>
    );
  }

  // HOME (kartonček / točke + nagrade + kuponi) — responsive 1-stolpec (telefon) / 2-stolpca (PC)
  const visitsNote = isStampMode
    ? stamps >= 10
      ? "Kartonček je poln — aktiviraj kupon."
      : `Še ${visitsLeft} ${visitWord} do brezplačne ${(sorted[0]?.name || "kave").toLowerCase()}.`
    : rewardReady
      ? "Imaš dovolj točk — unovči nagrado."
      : `Še ${left} točk do nagrade.`;

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md px-5 pb-14 pt-10 lg:max-w-[960px] lg:pt-14" style={{ background: "#EAE2D3" }}>
      {/* header */}
      <div className="mb-5 flex items-center gap-3">
        <Logo bg={logoBg} name={venue.name} />
        <div className="flex flex-col">
          <div className="font-display text-[19px] font-bold leading-tight">{venue.name}</div>
          <div className="text-[13px] text-[#8A7A66]">Zbiraj žige, prejmi nagrade</div>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start lg:gap-6">
        {/* LEVO: napredek + skeniraj + kuponi */}
        <div className="flex flex-col gap-4">
          {/* napredek */}
          <div className="rounded-3xl border border-[#EFE6D4] bg-[#FFFCF6] p-5 shadow-[0_2px_10px_rgba(43,29,23,0.05),0_14px_34px_rgba(43,29,23,0.08)]">
            <div className="mb-1 text-[12px] font-bold uppercase tracking-[0.09em] text-[#8A7A66]">{isStampMode ? "Tvoj kartonček" : "Tvoje točke"}</div>
            <div className="mb-[18px] flex items-baseline gap-2">
              <span className="font-display text-[54px] font-extrabold leading-none">{isStampMode ? `${stamps}/10` : points}</span>
              <span className="text-[16px] font-medium text-[#8A7A66]">{isStampMode ? "žigov" : "točk"}</span>
            </div>
            {isStampMode && <StampGrid stamps={stamps} goalLabel={goalLabel} />}
            <div className="mt-4 border-t border-dashed border-[#E2D7C2] pt-3.5 text-[14px] leading-snug text-[#5C4C3E]">{visitsNote}</div>
          </div>

          {/* nagrada-pripravljena (točke) */}
          {!isStampMode && rewardReady && (
            <div className="flex items-center gap-3.5 rounded-[20px] bg-[#5E7F52] px-[18px] py-4 text-[#F5EFE6]">
              <div className="flex flex-1 flex-col gap-0.5">
                <div className="font-display text-[17px] font-bold">{sorted[0].name} te čaka</div>
                <div className="text-[13px] opacity-85">Aktiviraj in pokaži kodo osebju.</div>
              </div>
              <button onClick={() => openRedeem(sorted[0])} className="h-[42px] flex-shrink-0 rounded-full bg-[#F5EFE6] px-[18px] text-[14px] font-bold text-[#3E5536]">Unovči</button>
            </div>
          )}

          {/* skeniraj */}
          <button onClick={() => setScanning(true)} disabled={busy} className="flex h-[58px] w-full items-center justify-center gap-2.5 rounded-full bg-[#2B1D17] text-[17px] font-semibold text-[#F5EFE6] shadow-[0_10px_24px_rgba(43,29,23,0.22)] disabled:opacity-50">
            <Icon name="camera" color="#F5EFE6" size={21} strokeWidth={1.8} />
            <span>Skeniraj račun</span>
          </button>

          {/* kuponi — vedno (z empty-state) */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="font-display text-[18px] font-bold">Tvoji kuponi 🎟️</div>
              {coupons.length > 0 && <span className="rounded-full bg-[#F1E7D2] px-2.5 py-0.5 text-[12px] font-bold text-[#8A5B14]">{coupons.length}</span>}
            </div>
            {coupons.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {coupons.map((c) => (
                  <div key={c.id} className="flex items-center gap-3.5 rounded-[18px] border-2 border-dashed border-[#E8A23D] p-3.5" style={{ background: "rgba(232,162,61,0.08)" }}>
                    <div className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-[14px] bg-[#F1E7D2]"><Icon name="ticket" color="#B97F1F" size={24} /></div>
                    <div className="flex-1 text-[15px] font-semibold">{c.name}</div>
                    <button onClick={() => activateCoupon(c)} className="flex-shrink-0 rounded-full bg-[#E8A23D] px-4 py-2 text-[13px] font-bold text-[#2B1D17]">Aktiviraj</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3.5 rounded-[18px] border border-dashed border-[#E2D7C2] bg-[#FBF6EC] p-4">
                <div className="flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-[12px] bg-[#F1E7D2]"><Icon name="ticket" color="#B97F1F" size={22} /></div>
                <div className="text-[13.5px] leading-snug text-[#8A7A66]">Nimaš še kuponov. Napolni kartonček ali zavrti kolo za nagrado.</div>
              </div>
            )}
          </div>
        </div>

        {/* DESNO: nagrade */}
        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <div className="font-display text-[20px] font-bold">{isStampMode ? "Nagrade v lokalu" : "Nagrade"}</div>
            <div className="text-[13px] text-[#8A7A66]">{isStampMode ? "poln kartonček = nagrada" : `1 € = ${venue.points_per_euro} točk`}</div>
          </div>
          <div className="flex flex-col gap-2.5">
            {sorted.map((r, idx) => {
              const primary = idx === 0;
              const ready = !isStampMode && points >= r.points_required;
              const pct = isStampMode ? (primary ? stamps * 10 : 0) : Math.min(100, Math.round((points / r.points_required) * 100));
              return (
                <div key={r.id} className="flex items-center gap-3.5 rounded-[18px] border border-[#EFE6D4] bg-[#FFFCF6] p-3.5">
                  <div className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-[14px] bg-[#F1E7D2]">
                    <Icon name={REWARD_ICONS[idx % REWARD_ICONS.length]} color="#2B1D17" size={24} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-[7px]">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[15px] font-semibold">{r.name}</span>
                      {isStampMode ? (
                        primary ? (
                          <span className="whitespace-nowrap rounded-full bg-[#F1E7D2] px-2 py-0.5 text-[11px] font-bold text-[#8A5B14]">kartonček</span>
                        ) : (
                          <span className="whitespace-nowrap text-[12px] text-[#A6967F]">v meniju</span>
                        )
                      ) : ready ? (
                        <button onClick={() => openRedeem(r)} className="whitespace-nowrap text-[12.5px] font-bold text-[#5E7F52]">unovči</button>
                      ) : (
                        <span className="whitespace-nowrap text-[12.5px] text-[#8A7A66]">{points} / {r.points_required} točk</span>
                      )}
                    </div>
                    {(!isStampMode || primary) && (
                      <>
                        <div className="h-[7px] overflow-hidden rounded-full bg-[#EFE6D4]">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: ready || (isStampMode && stamps >= 10) ? "#5E7F52" : "#E8A23D" }} />
                        </div>
                        {isStampMode && primary && (
                          <div className="text-[12px] text-[#8A7A66]">{stamps >= 10 ? "Pripravljeno — kupon v denarnici" : `${stamps}/10 žigov`}</div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {scanning && <Scanner onResult={handleScan} onClose={() => setScanning(false)} />}
      {redeemReward && (
        <ActivateSheet
          reward={redeemReward}
          step={sheetStep}
          minutes={minutes}
          busy={busy}
          onNext={() => setSheetStep(2)}
          onActivate={() => activate(redeemReward)}
          onClose={() => setRedeemReward(null)}
        />
      )}
    </main>
  );
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path d="M21.6 12.2c0-.7-.06-1.3-.18-1.9H12v3.6h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.2Z" fill="#4285F4" />
      <path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z" fill="#34A853" />
      <path d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1A10 10 0 0 0 2 12c0 1.6.4 3.2 1.1 4.6L6.4 14Z" fill="#FBBC05" />
      <path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 2.9 14.7 2 12 2A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.3 3-4.1 5.6-4.1Z" fill="#EA4335" />
    </svg>
  );
}

function Logo({ bg, name }: { bg: string; name: string }) {
  return (
    <div className="font-display flex h-11 w-11 items-center justify-center rounded-full text-[20px] font-bold text-[#F5EFE6]" style={{ background: bg }}>
      {name.charAt(0)}
    </div>
  );
}

function ActivateSheet({
  reward,
  step,
  minutes,
  busy,
  onNext,
  onActivate,
  onClose,
}: {
  reward: Reward;
  step: 1 | 2;
  minutes: number;
  busy: boolean;
  onNext: () => void;
  onActivate: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40" onClick={onClose}>
      <div className="rounded-t-3xl bg-[#F5EFE6] px-6 pb-10 pt-6" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-[#D9CDBA]" />
        {step === 1 ? (
          <>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F1E7D2]">
                <Icon name="cup" color="#2B1D17" size={28} />
              </div>
              <div className="font-display text-[24px] font-extrabold">{reward.name}</div>
              <div className="text-[14.5px] text-[#8A7A66]">Za {reward.points_required} točk</div>
            </div>
            <button onClick={onNext} className="mt-6 h-14 w-full rounded-full bg-[#2B1D17] text-[16.5px] font-semibold text-[#F5EFE6]">Aktiviraj nagrado</button>
            <button onClick={onClose} className="mt-2 h-11 w-full rounded-full text-[14px] font-semibold text-[#8A7A66]">Prekliči</button>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-[2.5px] border-[#E8A23D]" style={{ background: "rgba(232,162,61,0.14)" }}>
                <Icon name="clock" color="#B97F1F" size={28} strokeWidth={2} />
              </div>
              <div className="font-display text-[22px] font-extrabold leading-tight">Aktiviraj zdaj?</div>
              <div className="max-w-[300px] text-[14.5px] leading-relaxed text-[#5C4C3E]">
                Točke ({reward.points_required}) se <strong>takoj porabijo</strong> in imaš <strong>{minutes} min</strong>, da kodo pokažeš natakarju. Časovnik teče, tudi če zapreš aplikacijo.
              </div>
            </div>
            <button onClick={onActivate} disabled={busy} className="mt-6 h-14 w-full rounded-full bg-[#5E7F52] text-[16.5px] font-bold text-[#F5EFE6] disabled:opacity-50">Da, aktiviraj</button>
            <button onClick={onClose} className="mt-2 h-11 w-full rounded-full text-[14px] font-semibold text-[#8A7A66]">Ne, nazaj</button>
          </>
        )}
      </div>
    </div>
  );
}
