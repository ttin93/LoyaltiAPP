"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Venue, Reward } from "@/lib/types";
import { parseFiscalQR, FiscalQRError } from "@/lib/fiscalQr";
import { Icon, FakeQr } from "@/app/components/icons";
import Scanner from "@/app/components/Scanner";
import SpinFlow from "@/app/components/SpinFlow";
import { gt } from "@/lib/guestI18n";

const ROTS = [-5, 3, -2, 6, -4, 2, -6, 4, -3, 5];
const REWARD_ICONS = ["cup", "croissant", "cake"];

// Loyavi tema
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
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", fill: "none", stroke, strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" }}>
      {/* para */}
      <path d="M9.4 3c-.7.8-.7 1.6 0 2.4" strokeWidth={1.5} opacity={0.85} />
      <path d="M12.4 2.5c-.8.9-.8 1.9 0 2.8" strokeWidth={1.5} opacity={0.85} />
      {/* skodelica */}
      <path d="M5.5 8h9.6v3.7a4.8 4.8 0 0 1-4.8 4.8h0a4.8 4.8 0 0 1-4.8-4.8V8Z" />
      {/* ročaj */}
      <path d="M15.1 9.3h1.5a2.4 2.4 0 0 1 0 4.8h-1.5" />
      {/* krožniček */}
      <path d="M4.4 19.3c1.6 1.2 11 1.2 12.6 0" strokeWidth={1.5} />
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

// barvni helperji — lastnikova barva tematizira cel gostov site
function mix(a: string, b: string, t: number) {
  const p = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const [r1, g1, b1] = p(a), [r2, g2, b2] = p(b);
  const m = [r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t].map((x) => Math.round(x).toString(16).padStart(2, "0"));
  return `#${m.join("")}`;
}
function hexA(hex: string, a: number) {
  const h = hex.replace("#", "");
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
}

function StampGrid({ stamps, count = 10, animateNew, accent = CORAL }: { stamps: number; count?: number; animateNew?: boolean; goalLabel?: string; accent?: string }) {
  const cols = count <= 10 ? 5 : 6;
  return (
    <div className="grid gap-2.5" style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}>
      {Array.from({ length: count }).map((_, i) => {
        const filled = i < stamps;
        const isNew = animateNew && filled && i === stamps - 1;
        const isReward = i === count - 1;
        const cupSize = count <= 10 ? 38 : 28; // velike kavice
        return (
          <div
            key={i}
            className="flex items-center justify-center"
            style={{
              aspectRatio: "1",
              borderRadius: "50%",
              boxSizing: "border-box",
              border: filled ? `2px solid ${accent}` : isReward ? "none" : "2px solid #EFE4D2",
              background: filled ? hexA(accent, 0.1) : isReward ? hexA(accent, 0.16) : CREAM,
              transform: filled ? `rotate(${ROTS[i % ROTS.length]}deg)` : undefined,
              animation: isNew ? "stampIn 0.55s cubic-bezier(0.2,1.4,0.5,1) both 0.3s" : undefined,
            }}
          >
            <Cup stroke={filled || isReward ? accent : "#CFC2AC"} size={cupSize} />
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
  // lastnikova barva → akcent + svetli odtenki, ki obarvajo cel gostov site
  const brand = venue.brand_color && /^#[0-9a-fA-F]{6}$/.test(venue.brand_color) && venue.brand_color.toLowerCase() !== "#16a34a" ? venue.brand_color : AMBER;
  const tintLight = mix(brand, CREAM, 0.88);
  const tintMed = mix(brand, CREAM, 0.76);
  const accentDeep = mix(brand, INK, 0.42);
  const reviewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t = gt((venue as { language?: string }).language);
  const lang = (venue as { language?: string }).language;

  const [customerId, setCustomerId] = useState<string | null>(null);
  const [points, setPoints] = useState(0);
  const [stamps, setStamps] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<"home" | "success" | "error">("home");
  const [scanning, setScanning] = useState(false);
  const [awarded, setAwarded] = useState(0);
  const [errText, setErrText] = useState<{ t: string; h: string }>({ t: "", h: "" });
  const [busy, setBusy] = useState(false);
  const [stars, setStars] = useState(0);
  const [fb, setFb] = useState("");
  const [reviewDone, setReviewDone] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [cardCompleted, setCardCompleted] = useState(false);
  const [completedReward, setCompletedReward] = useState("");
  const demoZois = useRef<Set<string>>(new Set());

  const googleReviewUrl =
    venue.google_review_url || `https://www.google.com/search?q=${encodeURIComponent(venue.name)}`;

  function logReview(s: number, toGoogle: boolean, comment?: string) {
    if (demo) return;
    fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ venueCode: venue.public_code, customerId, stars: s, comment: comment || "", toGoogle }),
    }).catch(() => {});
  }

  // Google-review popup se odpre po uspešnem skenu (sproži se v handleScan prek refa, da ga
  // re-renderi ne počistijo). Pri POLNEM kartončku bolj zakasnjeno (proslava-animacija).
  function scheduleReview(completed: boolean) {
    setStars(0);
    setFb("");
    setReviewDone(false);
    setReviewOpen(false);
    if (reviewTimer.current) clearTimeout(reviewTimer.current);
    reviewTimer.current = setTimeout(() => setReviewOpen(true), completed ? 2300 : 750);
  }
  // zapri popup, ko zapustiš success zaslon
  useEffect(() => {
    if (view !== "success") {
      setReviewOpen(false);
      if (reviewTimer.current) { clearTimeout(reviewTimer.current); reviewTimer.current = null; }
    }
  }, [view]);

  const couponsKey = `loyalty:${venue.public_code}:coupons`;
  const [coupons, setCoupons] = useState<{ id: string; name: string; pending?: boolean }[]>([]);

  const [redeemReward, setRedeemReward] = useState<Reward | null>(null);
  const [sheetStep, setSheetStep] = useState<1 | 2>(1);
  const [activation, setActivation] = useState<Activation | null>(null);
  const [redeemedName, setRedeemedName] = useState<string | null>(null);
  const [now, setNow] = useState(0);

  // hibridni model: kava = ŽIGI (kartonček), druge nagrade = TOČKE
  const stampGoal = (venue as { stamp_goal?: number }).stamp_goal || 10;
  const stampReward = sorted.find((r) => (r as { kind?: string }).kind === "stamp") || null;
  const pointRewards = sorted.filter((r) => (r as { kind?: string }).kind !== "stamp");
  const visitsLeft = Math.max(0, stampGoal - stamps);
  const nextPR = pointRewards.find((r) => r.points_required > points) || null;
  const left = nextPR ? nextPR.points_required - points : 0;
  const rewardReady = pointRewards.some((r) => points >= r.points_required);

  const refresh = useCallback(
    async (id: string) => {
      try {
        const r = await fetch(`/api/customer?venueCode=${venue.public_code}&customerId=${id}`);
        const j = await r.json();
        if (j.ok) { setPoints(j.points); setStamps(j.stamps ?? 0); }
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
    // deep-link: ?c=<customerId> odpre to stranko (npr. magic link iz maila / demo na telefonu);
    // &coupon=<ime> doda aktiven kupon. Po obdelavi URL počistimo.
    let urlCoupon: string | null = null;
    try {
      const sp = new URLSearchParams(window.location.search);
      const c = sp.get("c");
      if (c) localStorage.setItem(storageKey, c);
      urlCoupon = sp.get("coupon");
      if (c || urlCoupon) {
        sp.delete("c");
        sp.delete("coupon");
        const qs = sp.toString();
        window.history.replaceState({}, "", window.location.pathname + (qs ? "?" + qs : ""));
      }
    } catch {}

    let saved: { id: string; name: string; pending?: boolean }[] = [];
    try {
      saved = JSON.parse(localStorage.getItem(couponsKey) || "[]");
    } catch {}
    if (urlCoupon && !saved.some((c) => c.name === urlCoupon)) {
      saved = [...saved, { id: "dl" + Date.now(), name: urlCoupon, pending: false }];
      try { localStorage.setItem(couponsKey, JSON.stringify(saved)); } catch {}
    }

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

  function activateCoupon(coupon: { id: string; name: string; pending?: boolean }) {
    if (coupon.pending) return; // na čakanju — aktivira se šele ob prvem skeniranju računa
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
        const afterPoints = points + venue.points_per_visit;
        const afterStamps = stamps + 1;
        setAwarded(venue.points_per_visit);
        setPoints(afterPoints);
        // 1. skeniran račun aktivira welcome kupon (ki je bil na čakanju)
        let nextCoupons = coupons.map((c) => ({ ...c, pending: false }));
        if (afterStamps >= stampGoal) {
          // kartonček poln → kava kupon v denarnico + reset žigov (točke ostanejo)
          const rewardName = stampReward?.name || "Brezplačna kava";
          nextCoupons = [...nextCoupons, { id: "s" + Date.now() + Math.random().toString(36).slice(2, 7), name: rewardName, pending: false }];
          setCompletedReward(rewardName);
          setCardCompleted(true);
          setStamps(afterStamps - stampGoal);
        } else {
          setCardCompleted(false);
          setStamps(afterStamps);
        }
        setCoupons(nextCoupons);
        localStorage.setItem(couponsKey, JSON.stringify(nextCoupons));
        setView("success");
        scheduleReview(afterStamps >= stampGoal);
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
        setStamps(j.stamps ?? 0);
        setAwarded(j.pointsAwarded);
        // 1. skeniran račun aktivira welcome kupon (ki je bil na čakanju)
        let nextCoupons = coupons.map((c) => ({ ...c, pending: false }));
        if (j.cardCompleted) {
          const rewardName = j.cardReward || stampReward?.name || "Brezplačna kava";
          nextCoupons = [...nextCoupons, { id: "s" + Date.now() + Math.random().toString(36).slice(2, 7), name: rewardName, pending: false }];
          setCompletedReward(rewardName);
          setCardCompleted(true);
        } else {
          setCardCompleted(false);
        }
        setCoupons(nextCoupons);
        localStorage.setItem(couponsKey, JSON.stringify(nextCoupons));
        setView("success");
        scheduleReview(!!j.cardCompleted);
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
        tagline={t.firstVisitReward}
        wheel={venue.wheel_config}
        lang={lang}
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
        <div className="text-center" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A8F80" }}>{t.showStaff}</div>
        <div className="text-center tabular-nums" style={{ marginTop: 4, fontSize: 52, fontWeight: 800, color: remaining < 60000 ? CORAL : INK }}>{mmss(remaining)}</div>
        <div className="text-center" style={{ marginTop: 4, fontSize: 14, color: "#9A8F80" }}>{t.validEvenClosed}</div>
        <div className="flex flex-1 flex-col items-center justify-center" style={{ marginTop: 28 }}>
          <div className="flex w-full flex-col items-center" style={{ gap: 16, borderRadius: 24, border: "1px solid #EFE6D6", background: "#fff", padding: "28px 32px", boxShadow: "0 2px 6px rgba(42,36,29,0.04),0 18px 40px rgba(42,36,29,0.08)" }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{activation.rewardName}</div>
            <div style={{ borderRadius: 16, border: "1px solid #EFE6D6", background: "#fff", padding: 14 }}><FakeQr px={132} seed={(activation.expiresAt % 900) + 7} /></div>
            <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "0.22em" }}>{code}</div>
          </div>
        </div>
        <button onClick={confirmActivation} disabled={busy} style={{ marginTop: 24, height: 56, width: "100%", borderRadius: 16, background: GREEN, color: "#F4F0E4", fontSize: 16.5, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: JAK, boxShadow: "0 10px 24px rgba(94,127,82,0.3)", opacity: busy ? 0.5 : 1 }}>Osebje potrdi</button>
        <button onClick={dismissActivation} style={{ marginTop: 8, height: 44, width: "100%", borderRadius: 16, background: "none", border: "none", fontSize: 14, fontWeight: 600, color: "#9A8F80", cursor: "pointer", fontFamily: JAK }}>{t.hide}</button>
      </main>
    );
  }

  // SUCCESS (po skeniranju)
  if (view === "success") {
    const displayStamps = cardCompleted ? stampGoal : stamps;
    const hasCard = !!stampReward;
    const successMsg = cardCompleted
      ? t.couponInWallet(completedReward.toLowerCase())
      : hasCard
        ? t.visitsLeft(visitsLeft, (stampReward?.name || "kave").toLowerCase())
        : rewardReady ? t.canRedeem : t.pointsToReward(left);
    return (
      <main className="flex min-h-dvh w-full flex-col items-center justify-center" style={{ background: BG, fontFamily: JAK, color: INK, padding: 20 }}>
        <div className="relative flex w-full max-w-md flex-col items-center overflow-hidden px-6 py-8 lg:max-w-[440px] lg:rounded-[30px] lg:border lg:border-[#E8DCC8] lg:bg-[#FBF7F0] lg:px-9 lg:py-12 lg:shadow-[0_30px_70px_rgba(34,28,22,0.18)]" style={{ gap: 22 }}>
          {/* PROSLAVA ob polnem kartončku — konfeti burst + kupon "odleti" v denarnico (navzdol) */}
          {cardCompleted && (
            <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 40 }}>
              {Array.from({ length: 16 }).map((_, i) => {
                const ang = (i / 16) * Math.PI * 2;
                const dist = 70 + (i % 4) * 30;
                const cols = [brand, AMBER, GREEN, CORAL, "#8E5BA6"];
                return (
                  <span
                    key={i}
                    style={{ position: "absolute", top: "46%", left: "50%", width: 9, height: 13, borderRadius: 2, background: cols[i % cols.length], "--cx": `${Math.round(Math.cos(ang) * dist)}px`, "--cy": `${Math.round(Math.sin(ang) * dist)}px`, "--cr": `${(i * 57) % 360}deg`, animation: `confettiPop 1.1s ease-out ${0.1 + (i % 5) * 0.04}s both` } as React.CSSProperties}
                  />
                );
              })}
              <div className="flex items-center justify-center" style={{ position: "absolute", top: "44%", left: "50%", marginLeft: -74, width: 148, height: 48, gap: 8, borderRadius: 13, background: "#fff", border: `2px solid ${brand}`, boxShadow: "0 14px 32px rgba(42,36,29,0.3)", fontFamily: JAK, fontWeight: 800, fontSize: 14.5, color: INK, animation: "flyToWallet 1.8s cubic-bezier(0.5,0,0.75,1) 0.5s both" }}>
                <Cup stroke={brand} size={18} /> Kupon
              </div>
            </div>
          )}
          {/* badge: logo lokala + »+1 žig« pill + pulse (telefon + desktop) */}
          <div style={{ position: "relative", animation: "popIn 0.5s cubic-bezier(0.2,1.5,0.4,1) both" }}>
            {!cardCompleted && <span aria-hidden style={{ position: "absolute", inset: -8, borderRadius: "50%", border: `2px solid ${brand}`, animation: "ringPulse 1.3s ease-out 0.35s both" }} />}
            <div className="flex items-center justify-center" style={{ width: 96, height: 96, borderRadius: 30, background: cardCompleted ? `linear-gradient(150deg,${mix(brand, CREAM, 0.3)},${brand})` : logoBg, color: PAPER, fontWeight: 800, fontSize: cardCompleted ? 44 : 38, boxShadow: "0 14px 34px rgba(42,36,29,0.2)" }}>
              {cardCompleted ? "🎉" : (venue.name.trim().charAt(0) || "M").toUpperCase()}
            </div>
            {!cardCompleted && (
              <div style={{ position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)", background: GREEN, color: "#F4F0E4", fontSize: 12.5, fontWeight: 800, padding: "5px 13px", borderRadius: 999, whiteSpace: "nowrap", boxShadow: "0 8px 18px rgba(94,127,82,0.4)", animation: "popIn 0.45s cubic-bezier(0.2,1.6,0.4,1) both 0.25s" }}>{t.oneStamp}</div>
            )}
          </div>
        {hasCard && (
          <div style={{ width: "100%", background: "#fff", borderRadius: 24, padding: "22px 20px", boxShadow: "0 2px 6px rgba(42,36,29,0.04),0 18px 40px rgba(42,36,29,0.08)", animation: cardCompleted ? "cardCelebrate 0.7s ease 0.15s both" : undefined }}>
            <StampGrid stamps={displayStamps} count={stampGoal} animateNew accent={brand} />
          </div>
        )}
        <div className="flex flex-col items-center text-center" style={{ gap: 8 }}>
          <div style={{ fontWeight: 800, fontSize: 26, letterSpacing: "-0.01em" }}>{cardCompleted ? t.cardFull : t.stampYours(awarded)}</div>
          <div style={{ maxWidth: 280, fontSize: 15, lineHeight: 1.5, color: MUTED }}>{successMsg}</div>
        </div>

        <button onClick={() => { setView("home"); setCardCompleted(false); }} style={{ height: 54, width: "100%", borderRadius: 16, background: INK, color: PAPER, fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: JAK }}>{t.backToCard}</button>
        </div>

        {/* Google-ocene POPUP — Variant C "Plavajoča kartica" (4–5★ → Google, 1–3★ → zasebno ekipi) */}
        {reviewOpen && (() => {
          const stage = reviewDone ? (stars >= 4 ? "doneHigh" : "doneLow") : stars === 0 ? "rate" : stars <= 3 ? "low" : "high";
          const copy = {
            rate: [t.rateTitle, t.rateSub],
            low: [t.thanksHonest, t.improveSub],
            high: [t.yayThanks, t.shareGoogleSub],
            doneLow: [t.feedbackSent, t.feedbackSentSub],
            doneHigh: [t.thanksSupport, t.openingGoogle],
          }[stage];
          return (
            <div onClick={() => setReviewOpen(false)} className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: "rgba(233,226,214,0.7)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)", padding: 18, animation: "scrimIn 0.3s both" }}>
              <div onClick={(e) => e.stopPropagation()} className="flex flex-col" style={{ width: "100%", maxWidth: 380, background: "#fff", borderRadius: 26, padding: "30px 24px", gap: 20, boxShadow: "0 24px 60px rgba(42,36,29,0.22)", animation: "popIn 0.42s cubic-bezier(0.2,1.2,0.35,1) both" }}>
                {reviewDone ? (
                  <div className="flex flex-col items-center text-center" style={{ gap: 15 }}>
                    <div className="flex items-center justify-center" style={{ width: 72, height: 72, borderRadius: "50%", background: stars >= 4 ? "rgba(226,160,74,0.16)" : "rgba(94,127,82,0.16)", border: `2.5px solid ${stars >= 4 ? AMBER : GREEN}`, animation: "popIn 0.45s cubic-bezier(0.2,1.5,0.4,1) both" }}>
                      {stars >= 4
                        ? <svg width="33" height="33" viewBox="0 0 24 24" style={{ fill: AMBER, stroke: AMBER, strokeWidth: 1.5, strokeLinejoin: "round" }}><path d="M12 20.5l-1.4-1.3C5.4 14.6 2 11.5 2 7.7 2 4.9 4.2 2.8 7 2.8c1.6 0 3.1.7 4 1.9.9-1.2 2.4-1.9 4-1.9 2.8 0 5 2.1 5 4.9 0 3.8-3.4 6.9-8.6 11.5L12 20.5z" /></svg>
                        : <svg width="33" height="33" viewBox="0 0 24 24" style={{ fill: "none", stroke: GREEN, strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M5 12.5l4.2 4.2L18.5 7.5" /></svg>}
                    </div>
                    <div><div style={{ fontWeight: 800, fontSize: 23, letterSpacing: "-0.015em" }}>{copy[0]}</div><div style={{ fontSize: 14.5, color: MUTED, lineHeight: 1.55, marginTop: 5 }}>{copy[1]}</div></div>
                    <button onClick={() => setReviewOpen(false)} style={{ height: 44, padding: "0 20px", border: "1.5px solid #E4D9C7", borderRadius: 14, background: "transparent", color: "#9A8F80", fontFamily: JAK, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{t.close}</button>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col text-center" style={{ gap: 7 }}>
                      <div style={{ fontWeight: 800, fontSize: 25, letterSpacing: "-0.02em", lineHeight: 1.1 }}>{copy[0]}</div>
                      <div style={{ fontSize: 14.5, color: MUTED, lineHeight: 1.5 }}>{copy[1]}</div>
                    </div>
                    <div className="flex justify-center" style={{ gap: 3 }}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} onClick={() => setStars(n)} aria-label={`${n} zvezdic`} className="transition-transform hover:scale-110 active:scale-90" style={{ width: 54, height: 54, border: "none", background: "transparent", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="46" height="46" viewBox="0 0 24 24"><path d="M12 2.4l2.95 6.3 6.85.72-5.1 4.66 1.43 6.78L12 17.9 5.87 21.56l1.43-6.78-5.1-4.66 6.85-.72z" fill={stars >= n ? AMBER : "none"} stroke={stars >= n ? AMBER : "#CDBFA8"} strokeWidth={1.5} strokeLinejoin="round" /></svg>
                        </button>
                      ))}
                    </div>
                    {stage === "rate" && <div style={{ fontSize: 13, color: "#A89878", textAlign: "center" }}>{t.tapToRate}</div>}
                    {stage === "low" && (
                      <div className="flex flex-col" style={{ gap: 13, animation: "fadeIn 0.3s both" }}>
                        <textarea value={fb} onChange={(e) => setFb(e.target.value)} placeholder={t.feedbackPlaceholder} style={{ width: "100%", boxSizing: "border-box", minHeight: 90, border: "1.5px solid #E4D9C7", borderRadius: 16, background: CREAM, padding: "13px 14px", fontFamily: JAK, fontSize: 15, color: INK, resize: "none", outline: "none", lineHeight: 1.5 }} />
                        <button onClick={() => { logReview(stars, false, fb); setReviewDone(true); }} style={{ width: "100%", height: 56, border: "none", borderRadius: 16, background: INK, color: PAPER, fontFamily: JAK, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>{t.sendTeam}</button>
                        <div style={{ fontSize: 12.5, color: "#9A8F80", textAlign: "center" }}>{t.privateNote}</div>
                      </div>
                    )}
                    {stage === "high" && (
                      <div className="flex flex-col" style={{ gap: 14, animation: "fadeIn 0.3s both" }}>
                        <a href={googleReviewUrl} target="_blank" rel="noreferrer" onClick={() => { logReview(stars, true); setReviewDone(true); }} className="flex items-center justify-center" style={{ width: "100%", boxSizing: "border-box", height: 58, border: "none", borderRadius: 16, background: INK, color: PAPER, fontFamily: JAK, fontSize: 16, fontWeight: 700, cursor: "pointer", gap: 12, textDecoration: "none" }}>
                          <span className="flex items-center justify-center" style={{ width: 32, height: 32, borderRadius: "50%", background: "#fff" }}><GoogleG /></span>{t.rateOnGoogle}
                        </a>
                        <div style={{ fontSize: 13, color: MUTED, textAlign: "center", lineHeight: 1.5 }}>{t.googleThanks}</div>
                        <button onClick={() => setReviewOpen(false)} style={{ background: "none", border: "none", color: "#9A8F80", fontFamily: JAK, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{t.maybeLater}</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })()}
      </main>
    );
  }

  // ERROR
  if (view === "error") {
    return (
      <main className="flex min-h-dvh w-full flex-col items-center justify-center" style={{ background: BG, fontFamily: JAK, color: INK, padding: 20 }}>
        <div className="flex w-full max-w-md flex-col items-center px-6 py-8 text-center lg:max-w-[440px] lg:rounded-[30px] lg:border lg:border-[#E8DCC8] lg:bg-[#FBF7F0] lg:px-9 lg:py-12 lg:shadow-[0_30px_70px_rgba(34,28,22,0.18)]" style={{ gap: 18 }}>
          <div className="flex items-center justify-center" style={{ width: 76, height: 76, borderRadius: "50%", border: `2.5px solid ${CORAL}`, background: "rgba(196,98,61,0.12)", transform: "rotate(-5deg)", animation: "popIn 0.45s cubic-bezier(0.2,1.5,0.4,1) both" }}>
            <Icon name="x" color={CORAL} size={30} strokeWidth={2.1} />
          </div>
          <div style={{ maxWidth: 300, fontSize: 24, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.01em" }}>{errText.t}</div>
          <div style={{ maxWidth: 280, fontSize: 15, lineHeight: 1.5, color: MUTED }}>{errText.h}</div>
          <div style={{ fontSize: 13.5, color: "#9A8F80" }}>{t.pointsStay(points)}</div>
          <div className="flex w-full flex-col" style={{ marginTop: 8, gap: 10 }}>
            <button onClick={() => { setView("home"); setScanning(true); }} style={{ height: 54, borderRadius: 16, background: INK, color: PAPER, fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: JAK }}>{t.scanOther}</button>
            <button onClick={() => setView("home")} style={{ height: 48, borderRadius: 16, background: "none", border: "none", fontSize: 15, fontWeight: 600, color: "#9A8F80", cursor: "pointer", fontFamily: JAK }}>{t.backToCard}</button>
          </div>
        </div>
      </main>
    );
  }

  // HOME — kava kartonček (žigi) + točkovne nagrade — responsive
  const hasCard = !!stampReward;
  const visitsNote = hasCard
    ? stamps >= stampGoal
      ? t.cardFullActivate
      : t.visitsLeft(visitsLeft, (stampReward?.name || "kave").toLowerCase())
    : rewardReady
      ? t.canRedeem
      : t.pointsToReward(left);

  const city = (venue as { city?: string | null }).city || null;
  return (
    <main style={{ background: BG, fontFamily: JAK, color: INK, minHeight: "100dvh", overflowX: "hidden" }}>
      <div className="mx-auto w-full pb-16 lg:max-w-[1040px] lg:px-8 lg:pt-11">
        {/* split: levo welcome+statistika, desno kartonček+skeniraj+kuponi — full-bleed na telefonu */}
        <div className="overflow-hidden lg:grid lg:rounded-[24px] lg:border lg:border-[#E4D9C7] lg:shadow-[0_26px_60px_rgba(34,28,22,0.16)]" style={{ gridTemplateColumns: "1fr 440px", background: "#fff" }}>
          {/* LEVO */}
          <div className="relative flex flex-col justify-center" style={{ background: `linear-gradient(160deg,${tintLight} 0%,${tintMed} 100%)`, padding: "clamp(28px,4vw,48px)", gap: 20, overflow: "hidden" }}>
            <div aria-hidden style={{ position: "absolute", bottom: -50, right: -30, width: 200, height: 200, borderRadius: "50%", background: hexA(brand, 0.22) }} />
            <div className="relative flex items-center" style={{ gap: 12 }}>
              <div className="flex items-center justify-center" style={{ width: 52, height: 52, borderRadius: 17, background: venue.logo_url ? "#fff" : logoBg, color: PAPER, fontWeight: 800, fontSize: 24, overflow: "hidden" }}>{venue.logo_url ? <img src={venue.logo_url} alt={venue.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : (venue.name.trim().charAt(0) || "M").toUpperCase()}</div>
              <div><div style={{ fontWeight: 800, fontSize: 21 }}>{venue.name}</div>{city && <div style={{ fontSize: 13, color: accentDeep }}>{city}</div>}</div>
            </div>
            <h2 className="relative" style={{ margin: 0, fontWeight: 800, fontSize: "clamp(28px,3vw,36px)", lineHeight: 1.08, letterSpacing: "-0.02em" }}>{t.everyCoffee}</h2>
            <p className="relative" style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: MUTED, maxWidth: 340 }}>{t.scanNote}</p>
            <div className="relative flex" style={{ gap: 26, borderTop: "1px solid rgba(42,36,29,0.1)", paddingTop: 18 }}>
              <div><div style={{ fontWeight: 800, fontSize: 24 }}>{points}</div><div style={{ fontSize: 12, color: "#9A8F80" }}>{t.points}</div></div>
              {hasCard && <div><div style={{ fontWeight: 800, fontSize: 24 }}>{stamps}/{stampGoal}</div><div style={{ fontSize: 12, color: "#9A8F80" }}>{t.stamps}</div></div>}
              <div><div style={{ fontWeight: 800, fontSize: 24, color: accentDeep }}>{coupons.length}</div><div style={{ fontSize: 12, color: "#9A8F80" }}>{t.coupons}</div></div>
            </div>
          </div>

          {/* DESNO */}
          <div className="flex flex-col justify-center" style={{ padding: "clamp(24px,3vw,36px)", gap: 16 }}>
            {/* kartonček / točke */}
            <div style={{ background: "#fff", borderRadius: 24, padding: "22px 22px", boxShadow: "0 2px 6px rgba(42,36,29,0.04),0 18px 40px rgba(42,36,29,0.08)", border: "1px solid #F1E8D9" }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#9A8F80" }}>{hasCard ? t.yourCard : t.yourPoints}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: accentDeep }}>{hasCard ? `${stamps} / ${stampGoal}` : `${points} ${t.points}`}</span>
              </div>
              {hasCard ? <StampGrid stamps={stamps} count={stampGoal} accent={brand} /> : <div style={{ fontWeight: 800, fontSize: 52, lineHeight: 1, letterSpacing: "-0.02em" }}>{points}<span style={{ fontSize: 16, fontWeight: 600, color: "#9A8F80", marginLeft: 8 }}>{t.points}</span></div>}
              <div style={{ marginTop: 16, background: CREAM, borderRadius: 16, padding: "13px 15px", fontSize: 13.5, lineHeight: 1.45, color: MUTED }}>{visitsNote}</div>
            </div>

            {/* skeniraj */}
            <button onClick={() => setScanning(true)} disabled={busy} className="flex items-center justify-center" style={{ width: "100%", height: 56, border: "none", borderRadius: 18, background: INK, color: PAPER, fontFamily: JAK, fontSize: 15.5, fontWeight: 700, gap: 10, cursor: "pointer", opacity: busy ? 0.5 : 1 }}>
              <svg width="19" height="19" viewBox="0 0 24 24" style={{ fill: "none", stroke: PAPER, strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M4 8.6A2.6 2.6 0 0 1 6.6 6h1.5l1.5-2h4.8l1.5 2h1.5A2.6 2.6 0 0 1 20 8.6v7.8A2.6 2.6 0 0 1 17.4 19H6.6A2.6 2.6 0 0 1 4 16.4V8.6Z" /><circle cx="12" cy="12.7" r="3.4" /></svg>
              {t.scanReceipt}
            </button>

            {/* kuponi */}
            {coupons.length > 0 ? (
              coupons.map((c) =>
                c.pending ? (
                  <div key={c.id} className="flex items-center" style={{ gap: 13, background: CREAM, border: "1.5px dashed #E0D2BC", borderRadius: 18, padding: 15 }}>
                    <div className="flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: 13, background: "#fff", flexShrink: 0, opacity: 0.7 }}><Cup stroke={brand} size={22} /></div>
                    <div className="min-w-0 flex-1"><div style={{ fontWeight: 800, fontSize: 14.5 }}>{c.name}</div><div style={{ fontSize: 12, fontWeight: 600, color: accentDeep }}>{t.pendingCoupon}</div></div>
                    <span className="flex items-center" style={{ height: 26, padding: "0 11px", borderRadius: 999, background: "#FCEFD8", color: "#B4781E", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{t.waits}</span>
                  </div>
                ) : (
                  <div key={c.id} className="flex items-center" style={{ gap: 13, background: `linear-gradient(135deg,${tintLight},${tintMed})`, borderRadius: 18, padding: 15 }}>
                    <div className="flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: 13, background: "#fff", flexShrink: 0 }}><Cup stroke={brand} size={22} /></div>
                    <div className="min-w-0 flex-1"><div style={{ fontWeight: 800, fontSize: 14.5 }}>{c.name}</div><div style={{ fontSize: 12, fontWeight: 600, color: accentDeep }}>{t.validDays}</div></div>
                    <button onClick={() => activateCoupon(c)} style={{ height: 38, padding: "0 15px", border: "none", borderRadius: 11, background: INK, color: PAPER, fontFamily: JAK, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{t.activate}</button>
                  </div>
                ),
              )
            ) : (
              <div className="flex items-center" style={{ gap: 13, borderRadius: 18, border: "1px dashed #E0D2BC", background: CREAM, padding: 15 }}>
                <div className="flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: 13, background: tintLight, flexShrink: 0 }}><Cup stroke={brand} size={22} /></div>
                <div style={{ fontSize: 13.5, lineHeight: 1.4, color: "#9A8F80" }}>{t.noCouponsYet}</div>
              </div>
            )}
          </div>
        </div>

        {/* MENI NAGRAD (za točke) */}
        {pointRewards.length > 0 && (
          <div className="px-4 lg:px-0" style={{ marginTop: 28 }}>
            <div className="flex items-baseline justify-between" style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.01em" }}>{t.pointRewards}</div>
              <div style={{ fontSize: 13, color: "#9A8F80" }}>{points} {t.points} · +{venue.points_per_visit}</div>
            </div>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
              {pointRewards.map((r, idx) => {
                const ready = points >= r.points_required;
                const pct = Math.min(100, Math.round((points / r.points_required) * 100));
                return (
                  <div key={r.id} className="flex items-center" style={{ gap: 14, borderRadius: 18, border: ready ? `1.5px solid ${GREEN}` : "1px solid #EFE6D6", background: ready ? "rgba(94,127,82,0.07)" : "#fff", padding: 14 }}>
                    <div className="flex items-center justify-center" style={{ width: 50, height: 50, borderRadius: 14, background: ready ? "rgba(94,127,82,0.14)" : tintLight, flexShrink: 0 }}><Icon name={REWARD_ICONS[idx % REWARD_ICONS.length]} color={ready ? GREEN : accentDeep} size={24} /></div>
                    <div className="flex min-w-0 flex-1 flex-col" style={{ gap: 7 }}>
                      <div className="flex items-center justify-between" style={{ gap: 8 }}>
                        <span style={{ fontSize: 15, fontWeight: 700 }}>{r.name}</span>
                        {ready ? (
                          <button onClick={() => openRedeem(r)} style={{ whiteSpace: "nowrap", height: 32, padding: "0 14px", fontSize: 12.5, fontWeight: 800, color: "#fff", background: GREEN, border: "none", borderRadius: 10, cursor: "pointer", fontFamily: JAK }}>{t.redeem}</button>
                        ) : (
                          <span style={{ whiteSpace: "nowrap", fontSize: 12.5, color: "#9A8F80" }}>{points} / {r.points_required} {t.points}</span>
                        )}
                      </div>
                      <div style={{ height: 7, overflow: "hidden", borderRadius: 999, background: "#EFE4D2" }}><div style={{ height: "100%", borderRadius: 999, width: `${pct}%`, background: ready ? GREEN : brand }} /></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {scanning && <Scanner demo={demo} lang={lang} onResult={handleScan} onClose={() => setScanning(false)} />}
      {redeemReward && (
        <ActivateSheet
          reward={redeemReward}
          step={sheetStep}
          minutes={minutes}
          busy={busy}
          accent={brand}
          lang={lang}
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
  accent = CORAL,
  lang,
  onNext,
  onActivate,
  onClose,
}: {
  reward: Reward;
  step: 1 | 2;
  minutes: number;
  busy: boolean;
  accent?: string;
  lang?: string;
  onNext: () => void;
  onActivate: () => void;
  onClose: () => void;
}) {
  const t = gt(lang);
  const cancelBtn: React.CSSProperties = { marginTop: 8, height: 44, width: "100%", borderRadius: 16, background: "none", border: "none", fontSize: 14, fontWeight: 600, color: "#9A8F80", cursor: "pointer", fontFamily: JAK };
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: "rgba(26,18,13,0.42)", fontFamily: JAK }} onClick={onClose}>
      <div style={{ background: CREAM, borderRadius: "28px 28px 0 0", padding: "24px 24px 36px" }} onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto" style={{ marginBottom: 20, height: 5, width: 44, borderRadius: 999, background: "#E0D2BC" }} />
        {step === 1 ? (
          <>
            <div className="flex flex-col items-center text-center" style={{ gap: 8 }}>
              <div className="flex items-center justify-center" style={{ width: 64, height: 64, borderRadius: 18, background: hexA(accent, 0.16) }}><Cup stroke={accent} size={28} /></div>
              <div style={{ fontWeight: 800, fontSize: 24, letterSpacing: "-0.01em" }}>{reward.name}</div>
              <div style={{ fontSize: 14.5, color: "#9A8F80" }}>{t.forPoints(reward.points_required)}</div>
            </div>
            <button onClick={onNext} style={{ marginTop: 24, height: 54, width: "100%", borderRadius: 16, background: INK, color: PAPER, fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: JAK }}>{t.activateRewardBtn}</button>
            <button onClick={onClose} style={cancelBtn}>{t.cancel}</button>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center text-center" style={{ gap: 8 }}>
              <div className="flex items-center justify-center" style={{ width: 64, height: 64, borderRadius: "50%", border: `2.5px solid ${accent}`, background: hexA(accent, 0.14) }}><Icon name="clock" color={mix(accent, INK, 0.42)} size={28} strokeWidth={2} /></div>
              <div style={{ fontWeight: 800, fontSize: 22, lineHeight: 1.1 }}>{t.activateNow}</div>
              <div style={{ maxWidth: 300, fontSize: 14.5, lineHeight: 1.5, color: MUTED }}>{t.activateNote(reward.points_required, minutes)}</div>
            </div>
            <button onClick={onActivate} disabled={busy} style={{ marginTop: 24, height: 54, width: "100%", borderRadius: 16, background: GREEN, color: "#F4F0E4", fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: JAK, opacity: busy ? 0.5 : 1 }}>{t.yesActivate}</button>
            <button onClick={onClose} style={cancelBtn}>{t.noBack}</button>
          </>
        )}
      </div>
    </div>
  );
}
