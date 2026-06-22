"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Venue, Reward } from "@/lib/types";
import { parseFiscalQR, FiscalQRError } from "@/lib/fiscalQr";
import { Icon, FakeQr } from "@/app/components/icons";
import Scanner from "@/app/components/Scanner";
import SpinFlow from "@/app/components/SpinFlow";

const ROTS = [-5, 3, -2, 6, -4, 2, -6, 4, -3, 5];
const REWARD_ICONS = ["cup", "croissant", "cake"];

// Tally tema
const INK = "#2A241D";
const CREAM = "#FBF7F0";
const PAPER = "#FBF3E6";
const CORAL = "#C4623D";
const AMBER = "#E2A04A";
const GREEN = "#5E7F52";
const MUTED = "#6E6253";
const BG = "#E9E2D6";
const JAK = "var(--font-jakarta), sans-serif";

function Cup({ stroke, size }: { stroke: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", fill: "none", stroke, strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round" }}>
      <path d="M5 9h10v5.5A4.5 4.5 0 0 1 10.5 19h-1A4.5 4.5 0 0 1 5 14.5V9Z" />
      <path d="M15 10.5h1.6a2.4 2.4 0 0 1 0 4.8H15" />
    </svg>
  );
}

function shortLabel(name: string): string {
  const w = name.split(/\s+/).filter((x) => !/^brezpla/i.test(x));
  return (w[0] || name).toUpperCase().slice(0, 6);
}

function mmss(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function StampGrid({ stamps, count = 10, animateNew }: { stamps: number; count?: number; animateNew?: boolean; goalLabel?: string }) {
  const cols = count <= 10 ? 5 : 6;
  return (
    <div className="grid gap-2.5" style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}>
      {Array.from({ length: count }).map((_, i) => {
        const filled = i < stamps;
        const isNew = animateNew && filled && i === stamps - 1;
        const isReward = i === count - 1;
        return (
          <div
            key={i}
            className="flex items-center justify-center"
            style={{
              aspectRatio: "1",
              borderRadius: "50%",
              boxSizing: "border-box",
              border: filled ? `2px solid ${CORAL}` : isReward ? "none" : "2px solid #EFE4D2",
              background: filled ? "rgba(196,98,61,0.09)" : isReward ? "#FCEFD8" : CREAM,
              transform: filled ? `rotate(${ROTS[i % ROTS.length]}deg)` : undefined,
              animation: isNew ? "stampIn 0.55s cubic-bezier(0.2,1.4,0.5,1) both 0.3s" : undefined,
            }}
          >
            {filled ? <Cup stroke={CORAL} size={count <= 10 ? 15 : 13} /> : isReward ? <Cup stroke={AMBER} size={count <= 10 ? 15 : 13} /> : null}
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

  const [redeemReward, setRedeemReward] = useState<Reward | null>(null);
  const [sheetStep, setSheetStep] = useState<1 | 2>(1);
  const [activation, setActivation] = useState<Activation | null>(null);
  const [redeemedName, setRedeemedName] = useState<string | null>(null);
  const [now, setNow] = useState(0);

  const pv = venue.points_per_visit || 10;
  const goal = sorted.length ? sorted[0].points_required : pv * 10;
  const stampGoal = Math.max(1, Math.round(goal / pv)); // št. žigov do nagrade (nastavljivo)
  const stamps = Math.min(stampGoal, Math.floor(points / pv));
  const goalLabel = sorted.length ? shortLabel(sorted[0].name) : "KAVA";
  const rewardReady = sorted.length > 0 && points >= goal;
  const left = Math.max(0, goal - points);
  const visitsLeft = Math.max(0, stampGoal - stamps);
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
      setCoupons(saved);
    } else {
      setLoaded(true);
      setCoupons(saved);
    }
  }, [storageKey, activationKey, couponsKey, refresh, loadActivation, demo]);

  // tik časovnika
  useEffect(() => {
    if (!activation) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [activation]);

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
      if (payload === "DEMO_DUP") return fail("Ta račun je že skeniran.", "Vsak račun prinese žig samo enkrat.");
      if (payload === "DEMO_FOREIGN") return fail("Ta račun ni iz tega lokala.", "Žig dobiš za račune, izdane v tem lokalu.");
      if (payload === "DEMO_OLD") return fail("Račun je prestar.", "Računi se lahko unovčijo v 24 urah po izdaji.");
      try {
        if (payload !== "DEMO_OK") {
          const parsed = parseFiscalQR(payload);
          if (parsed.davcna !== venue.davcna_stevilka) return fail("Ta račun ni iz tega lokala.", "Točke dobiš za račune, izdane v tem lokalu.");
          if (demoZois.current.has(parsed.zoiHex)) return fail("Ta račun je bil že unovčen.", "Vsak račun prinese točke samo enkrat.");
          demoZois.current.add(parsed.zoiHex);
        }
        const after = points + venue.points_per_visit;
        setAwarded(venue.points_per_visit);
        if (isStampMode && Math.floor(after / pv) >= stampGoal) {
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
  if (!loaded) return <div className="flex min-h-dvh items-center justify-center" style={{ background: BG, color: "#9A8F80", fontFamily: JAK }}>…</div>;

  // NOV GOST — kolo + registracija (nov dizajn) prek SpinFlow
  if (!customerId) {
    return (
      <SpinFlow
        demo={demo}
        code={venue.public_code}
        venueName={venue.name}
        venueInitial={(venue.name.trim().charAt(0) || "M").toUpperCase()}
        brandColor={venue.brand_color && venue.brand_color !== "#16a34a" ? venue.brand_color : "#E2A04A"}
        tagline="Tvoj prvi obisk si zasluži nagrado"
      />
    );
  }

  // UNOVČENO (po potrditvi osebja)
  if (redeemedName) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center text-center" style={{ background: BG, fontFamily: JAK, color: INK, padding: "48px 24px", gap: 18 }}>
        <div className="flex items-center justify-center" style={{ width: 84, height: 84, borderRadius: "50%", border: `2.5px solid ${GREEN}`, background: "rgba(94,127,82,0.14)", animation: "popIn 0.5s cubic-bezier(0.2,1.4,0.5,1) both" }}>
          <Icon name="check" color={GREEN} size={36} strokeWidth={1.9} />
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.01em" }}>{redeemedName} unovčeno</div>
        <div style={{ maxWidth: 260, fontSize: 15.5, lineHeight: 1.5, color: MUTED }}>Dober tek! Kartica se začne polniti znova.</div>
        <button onClick={() => setRedeemedName(null)} style={{ marginTop: 8, height: 54, width: "100%", borderRadius: 16, background: INK, color: PAPER, fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: JAK }}>Nazaj na kartico</button>
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
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col" style={{ background: BG, fontFamily: JAK, color: INK, padding: "56px 24px 40px" }}>
        <div className="text-center" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A8F80" }}>Pokaži natakarju</div>
        <div className="text-center tabular-nums" style={{ marginTop: 4, fontSize: 52, fontWeight: 800, color: remaining < 60000 ? CORAL : INK }}>{mmss(remaining)}</div>
        <div className="text-center" style={{ marginTop: 4, fontSize: 14, color: "#9A8F80" }}>Velja še, tudi če zapreš aplikacijo.</div>
        <div className="flex flex-1 flex-col items-center justify-center" style={{ marginTop: 28 }}>
          <div className="flex w-full flex-col items-center" style={{ gap: 16, borderRadius: 24, border: "1px solid #EFE6D6", background: "#fff", padding: "28px 32px", boxShadow: "0 2px 6px rgba(42,36,29,0.04),0 18px 40px rgba(42,36,29,0.08)" }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{activation.rewardName}</div>
            <div style={{ borderRadius: 16, border: "1px solid #EFE6D6", background: "#fff", padding: 14 }}><FakeQr px={132} seed={(activation.expiresAt % 900) + 7} /></div>
            <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "0.22em" }}>{code}</div>
          </div>
        </div>
        <button onClick={confirmActivation} disabled={busy} style={{ marginTop: 24, height: 56, width: "100%", borderRadius: 16, background: GREEN, color: "#F4F0E4", fontSize: 16.5, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: JAK, boxShadow: "0 10px 24px rgba(94,127,82,0.3)", opacity: busy ? 0.5 : 1 }}>Osebje potrdi</button>
        <button onClick={dismissActivation} style={{ marginTop: 8, height: 44, width: "100%", borderRadius: 16, background: "none", border: "none", fontSize: 14, fontWeight: 600, color: "#9A8F80", cursor: "pointer", fontFamily: JAK }}>Skrij (časovnik še teče)</button>
      </main>
    );
  }

  // SUCCESS (po skeniranju)
  if (view === "success") {
    const displayStamps = cardCompleted ? stampGoal : stamps;
    const successMsg = cardCompleted
      ? `Kupon za ${completedReward.toLowerCase()} je v tvoji denarnici 🎟️`
      : isStampMode
        ? `Še ${visitsLeft} ${visitWord} do brezplačne ${(sorted[0]?.name || "kave").toLowerCase()}.`
        : rewardReady ? "Lahko unovčiš nagrado pri osebju." : `Še ${left} točk do nagrade.`;
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center" style={{ background: BG, fontFamily: JAK, color: INK, padding: "48px 24px", gap: 22 }}>
        <div className="flex items-center justify-center" style={{ minWidth: 92, height: 92, borderRadius: 26, padding: "0 18px", background: cardCompleted ? `linear-gradient(150deg,#EBB05F,${AMBER})` : "rgba(94,127,82,0.14)", border: cardCompleted ? "none" : `2.5px solid ${GREEN}`, animation: "popIn 0.5s cubic-bezier(0.2,1.5,0.4,1) both" }}>
          <span style={{ fontWeight: 800, fontSize: cardCompleted ? 40 : 24, color: cardCompleted ? "#fff" : GREEN }}>{cardCompleted ? "🎉" : isStampMode ? "+1 žig" : `+${awarded}`}</span>
        </div>
        {isStampMode && (
          <div style={{ width: "100%", background: "#fff", borderRadius: 24, padding: "22px 20px", boxShadow: "0 2px 6px rgba(42,36,29,0.04),0 18px 40px rgba(42,36,29,0.08)" }}>
            <StampGrid stamps={displayStamps} count={stampGoal} animateNew />
          </div>
        )}
        <div className="flex flex-col items-center text-center" style={{ gap: 8 }}>
          <div style={{ fontWeight: 800, fontSize: 26, letterSpacing: "-0.01em" }}>{cardCompleted ? "Kartonček je poln!" : isStampMode ? `Žig št. ${displayStamps} je tvoj` : `+${awarded} točk`}</div>
          <div style={{ maxWidth: 280, fontSize: 15, lineHeight: 1.5, color: MUTED }}>{successMsg}</div>
        </div>

        {/* Google-ocene autopilot — 4–5★ → Google, 1–3★ → zasebno */}
        <div style={{ width: "100%", borderRadius: 20, border: "1px solid #EFE6D6", background: "#fff", padding: 20, textAlign: "center" }}>
          {!reviewDone ? (
            <>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Kako ti je bilo danes?</div>
              <div className="flex justify-center" style={{ marginTop: 12, gap: 6 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setStars(n)} aria-label={`${n} zvezdic`} className="leading-none transition-transform active:scale-90" style={{ fontSize: 34, background: "none", border: "none", cursor: "pointer", color: n <= stars ? AMBER : "#E4D9C7" }}>★</button>
                ))}
              </div>
              {stars >= 4 && (
                <div className="flex flex-col items-center" style={{ marginTop: 16, gap: 10 }}>
                  <div style={{ fontSize: 14, lineHeight: 1.4, color: MUTED }}>Juhu! 🎉 Nam pomagaš z oceno na Googlu? Traja 10 sekund.</div>
                  <a href={googleReviewUrl} target="_blank" rel="noreferrer" onClick={() => setReviewDone(true)} className="flex items-center justify-center" style={{ height: 48, width: "100%", gap: 10, borderRadius: 14, background: "#fff", fontSize: 15, fontWeight: 700, color: INK, border: "1.5px solid #E4D9C7", textDecoration: "none" }}>
                    <GoogleG /> Oceni na Googlu
                  </a>
                </div>
              )}
              {stars >= 1 && stars <= 3 && (
                <div className="flex flex-col" style={{ marginTop: 16, gap: 10 }}>
                  <div style={{ fontSize: 14, lineHeight: 1.4, color: MUTED }}>Žal nam je. Kaj naj popravimo? <span style={{ color: "#A89B88" }}>(vidi samo lokal)</span></div>
                  <textarea value={fb} onChange={(e) => setFb(e.target.value)} rows={3} placeholder="Tvoje mnenje…" style={{ width: "100%", borderRadius: 12, border: "1.5px solid #E4D9C7", background: CREAM, padding: 12, textAlign: "left", fontSize: 14, fontFamily: JAK, outline: "none", boxSizing: "border-box" }} />
                  <button onClick={() => setReviewDone(true)} style={{ height: 48, width: "100%", borderRadius: 14, background: INK, color: PAPER, fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: JAK }}>Pošlji lokalu</button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center" style={{ gap: 6 }}>
              <div style={{ fontSize: 28 }}>🙏</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{stars >= 4 ? "Najlepša hvala!" : "Hvala za iskrenost!"}</div>
              <div style={{ fontSize: 13, color: "#9A8F80" }}>{stars >= 4 ? "Tvoja ocena ogromno pomeni." : "Sporočili bomo lokalu, da izboljša."}</div>
            </div>
          )}
        </div>

        <button onClick={() => { setView("home"); setStars(0); setFb(""); setReviewDone(false); setCardCompleted(false); }} style={{ height: 54, width: "100%", borderRadius: 16, background: INK, color: PAPER, fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: JAK }}>Super, nazaj na kartico</button>
      </main>
    );
  }

  // ERROR
  if (view === "error") {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center text-center" style={{ background: BG, fontFamily: JAK, color: INK, padding: "48px 24px", gap: 18 }}>
        <div className="flex items-center justify-center" style={{ width: 76, height: 76, borderRadius: "50%", border: `2.5px solid ${CORAL}`, background: "rgba(196,98,61,0.12)", transform: "rotate(-5deg)" }}>
          <Icon name="x" color={CORAL} size={30} strokeWidth={2.1} />
        </div>
        <div style={{ maxWidth: 300, fontSize: 24, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.01em" }}>{errText.t}</div>
        <div style={{ maxWidth: 280, fontSize: 15, lineHeight: 1.5, color: MUTED }}>{errText.h}</div>
        <div style={{ fontSize: 13.5, color: "#9A8F80" }}>Tvoje točke ostajajo: <strong>{points}</strong></div>
        <div className="flex w-full flex-col" style={{ marginTop: 8, gap: 10 }}>
          <button onClick={() => { setView("home"); setScanning(true); }} style={{ height: 54, borderRadius: 16, background: INK, color: PAPER, fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: JAK }}>Skeniraj drug račun</button>
          <button onClick={() => setView("home")} style={{ height: 48, borderRadius: 16, background: "none", border: "none", fontSize: 15, fontWeight: 600, color: "#9A8F80", cursor: "pointer", fontFamily: JAK }}>Nazaj na kartico</button>
        </div>
      </main>
    );
  }

  // HOME (kartonček / točke + nagrade + kuponi) — responsive 1-stolpec (telefon) / 2-stolpca (PC)
  const visitsNote = isStampMode
    ? stamps >= stampGoal
      ? "Kartonček je poln — aktiviraj kupon."
      : `Še ${visitsLeft} ${visitWord} do brezplačne ${(sorted[0]?.name || "kave").toLowerCase()}.`
    : rewardReady
      ? "Imaš dovolj točk — unovči nagrado."
      : `Še ${left} točk do nagrade.`;

  const city = (venue as { city?: string | null }).city || null;
  return (
    <main style={{ background: BG, fontFamily: JAK, color: INK, minHeight: "100dvh", overflowX: "hidden" }}>
      <div className="mx-auto w-full pb-16 lg:max-w-[1040px] lg:px-8 lg:pt-11">
        {/* split: levo welcome+statistika, desno kartonček+skeniraj+kuponi — full-bleed na telefonu */}
        <div className="overflow-hidden lg:grid lg:rounded-[24px] lg:border lg:border-[#E4D9C7] lg:shadow-[0_26px_60px_rgba(34,28,22,0.16)]" style={{ gridTemplateColumns: "1fr 440px", background: "#fff" }}>
          {/* LEVO */}
          <div className="relative flex flex-col justify-center" style={{ background: "linear-gradient(160deg,#FCEFD8 0%,#F6E3C5 100%)", padding: "clamp(28px,4vw,48px)", gap: 20, overflow: "hidden" }}>
            <div aria-hidden style={{ position: "absolute", bottom: -50, right: -30, width: 200, height: 200, borderRadius: "50%", background: "rgba(226,160,74,0.22)" }} />
            <div className="relative flex items-center" style={{ gap: 12 }}>
              <div className="flex items-center justify-center" style={{ width: 52, height: 52, borderRadius: 17, background: INK, color: PAPER, fontWeight: 800, fontSize: 24 }}>{(venue.name.trim().charAt(0) || "M").toUpperCase()}</div>
              <div><div style={{ fontWeight: 800, fontSize: 21 }}>{venue.name}</div>{city && <div style={{ fontSize: 13, color: "#9A7A3A" }}>{city}</div>}</div>
            </div>
            <h2 className="relative" style={{ margin: 0, fontWeight: 800, fontSize: "clamp(28px,3vw,36px)", lineHeight: 1.08, letterSpacing: "-0.02em" }}>{isStampMode ? <>Vsaka kava<br />te približa nagradi.</> : <>Zbiraj točke,<br />prejmi nagrade.</>}</h2>
            <p className="relative" style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: MUTED, maxWidth: 340 }}>Skeniraj račun ob obisku in glej, kako se kartica polni. Preprosto, toplo, tvoje.</p>
            <div className="relative flex" style={{ gap: 26, borderTop: "1px solid rgba(42,36,29,0.1)", paddingTop: 18 }}>
              <div><div style={{ fontWeight: 800, fontSize: 24 }}>{points}</div><div style={{ fontSize: 12, color: "#9A8F80" }}>točk</div></div>
              {isStampMode && <div><div style={{ fontWeight: 800, fontSize: 24 }}>{stamps}/{stampGoal}</div><div style={{ fontSize: 12, color: "#9A8F80" }}>žigov</div></div>}
              <div><div style={{ fontWeight: 800, fontSize: 24, color: "#B4862F" }}>{coupons.length}</div><div style={{ fontSize: 12, color: "#9A8F80" }}>kuponov</div></div>
            </div>
          </div>

          {/* DESNO */}
          <div className="flex flex-col justify-center" style={{ padding: "clamp(24px,3vw,36px)", gap: 16 }}>
            {/* kartonček / točke */}
            <div style={{ background: "#fff", borderRadius: 24, padding: "22px 22px", boxShadow: "0 2px 6px rgba(42,36,29,0.04),0 18px 40px rgba(42,36,29,0.08)", border: "1px solid #F1E8D9" }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#9A8F80" }}>{isStampMode ? "Tvoja kartica" : "Tvoje točke"}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: AMBER }}>{isStampMode ? `${stamps} / ${stampGoal}` : points}</span>
              </div>
              {isStampMode ? <StampGrid stamps={stamps} count={stampGoal} /> : <div style={{ fontWeight: 800, fontSize: 52, lineHeight: 1, letterSpacing: "-0.02em" }}>{points}<span style={{ fontSize: 16, fontWeight: 600, color: "#9A8F80", marginLeft: 8 }}>točk</span></div>}
              <div style={{ marginTop: 16, background: CREAM, borderRadius: 16, padding: "13px 15px", fontSize: 13.5, lineHeight: 1.45, color: MUTED }}>{visitsNote}</div>
            </div>

            {/* nagrada pripravljena (točke) */}
            {!isStampMode && rewardReady && (
              <div className="flex items-center" style={{ gap: 13, background: GREEN, borderRadius: 18, padding: "14px 16px", color: "#F4F0E4" }}>
                <div className="flex-1"><div style={{ fontWeight: 800, fontSize: 15 }}>{sorted[0].name} te čaka</div><div style={{ fontSize: 12.5, opacity: 0.85 }}>Aktiviraj in pokaži kodo osebju.</div></div>
                <button onClick={() => openRedeem(sorted[0])} style={{ height: 38, padding: "0 15px", borderRadius: 11, background: "#F4F0E4", color: "#3E5536", fontSize: 13, fontWeight: 700, fontFamily: JAK, border: "none", cursor: "pointer" }}>Unovči</button>
              </div>
            )}

            {/* skeniraj */}
            <button onClick={() => setScanning(true)} disabled={busy} className="flex items-center justify-center" style={{ width: "100%", height: 56, border: "none", borderRadius: 18, background: INK, color: PAPER, fontFamily: JAK, fontSize: 15.5, fontWeight: 700, gap: 10, cursor: "pointer", opacity: busy ? 0.5 : 1 }}>
              <svg width="19" height="19" viewBox="0 0 24 24" style={{ fill: "none", stroke: PAPER, strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M4 8.6A2.6 2.6 0 0 1 6.6 6h1.5l1.5-2h4.8l1.5 2h1.5A2.6 2.6 0 0 1 20 8.6v7.8A2.6 2.6 0 0 1 17.4 19H6.6A2.6 2.6 0 0 1 4 16.4V8.6Z" /><circle cx="12" cy="12.7" r="3.4" /></svg>
              Skeniraj račun
            </button>

            {/* kuponi */}
            {coupons.length > 0 ? (
              coupons.map((c) => (
                <div key={c.id} className="flex items-center" style={{ gap: 13, background: "linear-gradient(135deg,#FCEFD8,#F8E3C2)", borderRadius: 18, padding: 15 }}>
                  <div className="flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: 13, background: "#fff", flexShrink: 0 }}><Cup stroke={AMBER} size={22} /></div>
                  <div className="min-w-0 flex-1"><div style={{ fontWeight: 800, fontSize: 14.5 }}>{c.name}</div><div style={{ fontSize: 12, fontWeight: 600, color: "#B4862F" }}>Velja še 12 dni</div></div>
                  <button onClick={() => activateCoupon(c)} style={{ height: 38, padding: "0 15px", border: "none", borderRadius: 11, background: INK, color: PAPER, fontFamily: JAK, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Aktiviraj</button>
                </div>
              ))
            ) : (
              <div className="flex items-center" style={{ gap: 13, borderRadius: 18, border: "1px dashed #E0D2BC", background: CREAM, padding: 15 }}>
                <div className="flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: 13, background: "#FCEFD8", flexShrink: 0 }}><Cup stroke={AMBER} size={22} /></div>
                <div style={{ fontSize: 13.5, lineHeight: 1.4, color: "#9A8F80" }}>Nimaš še kuponov. Napolni kartico za nagrado.</div>
              </div>
            )}
          </div>
        </div>

        {/* MENI NAGRAD */}
        <div className="px-4 lg:px-0" style={{ marginTop: 28 }}>
          <div className="flex items-baseline justify-between" style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.01em" }}>{isStampMode ? "Nagrade v lokalu" : "Nagrade"}</div>
            <div style={{ fontSize: 13, color: "#9A8F80" }}>{isStampMode ? "poln kartonček = nagrada" : `1 € = ${venue.points_per_euro} točk`}</div>
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
            {sorted.map((r, idx) => {
              const primary = idx === 0;
              const ready = !isStampMode && points >= r.points_required;
              const pct = isStampMode ? (primary ? Math.round((stamps / stampGoal) * 100) : 0) : Math.min(100, Math.round((points / r.points_required) * 100));
              return (
                <div key={r.id} className="flex items-center" style={{ gap: 14, borderRadius: 18, border: `1px solid ${"#EFE6D6"}`, background: "#fff", padding: 14 }}>
                  <div className="flex items-center justify-center" style={{ width: 50, height: 50, borderRadius: 14, background: CREAM, flexShrink: 0 }}><Icon name={REWARD_ICONS[idx % REWARD_ICONS.length]} color={INK} size={24} /></div>
                  <div className="flex min-w-0 flex-1 flex-col" style={{ gap: 7 }}>
                    <div className="flex items-baseline justify-between" style={{ gap: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 700 }}>{r.name}</span>
                      {isStampMode ? (
                        primary ? <span style={{ whiteSpace: "nowrap", borderRadius: 999, background: "#FCEFD8", padding: "2px 9px", fontSize: 11, fontWeight: 800, color: "#B4781E" }}>kartonček</span> : <span style={{ whiteSpace: "nowrap", fontSize: 12, color: "#A89B88" }}>v meniju</span>
                      ) : ready ? (
                        <button onClick={() => openRedeem(r)} style={{ whiteSpace: "nowrap", fontSize: 12.5, fontWeight: 800, color: GREEN, background: "none", border: "none", cursor: "pointer", fontFamily: JAK }}>unovči</button>
                      ) : (
                        <span style={{ whiteSpace: "nowrap", fontSize: 12.5, color: "#9A8F80" }}>{points} / {r.points_required} točk</span>
                      )}
                    </div>
                    {(!isStampMode || primary) && (
                      <>
                        <div style={{ height: 7, overflow: "hidden", borderRadius: 999, background: "#EFE4D2" }}><div style={{ height: "100%", borderRadius: 999, width: `${pct}%`, background: ready || (isStampMode && stamps >= stampGoal) ? GREEN : AMBER }} /></div>
                        {isStampMode && primary && <div style={{ fontSize: 12, color: "#9A8F80" }}>{stamps >= stampGoal ? "Pripravljeno — kupon v denarnici" : `${stamps}/${stampGoal} žigov`}</div>}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {scanning && <Scanner demo={demo} onResult={handleScan} onClose={() => setScanning(false)} />}
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
