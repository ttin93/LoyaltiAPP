"use client";
/* eslint-disable react-hooks/set-state-in-effect -- stanje se uskladi z brskalnikom ali s svežimi podatki s strežnika; preverjeno z E2E */

import { useEffect, useState } from "react";
import { CheckCircle, CircleNotch, Clock, Ticket } from "@phosphor-icons/react/dist/ssr";
import Sheet from "./Sheet";
import { Button } from "./Button";
import type { Coupon } from "@/lib/coupons";
import { count } from "@/lib/sl";

function mmss(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

type Phase = "intro" | "active" | "redeemed" | "expired";

/**
 * Unovčenje kupona v dveh korakih: gost ga aktivira ob blagajni (steče časovnik),
 * osebje na njegovem telefonu potrdi prevzem.
 */
export default function CouponSheet({ coupon, venueName, minutes, onClose, onChanged }: { coupon: Coupon | null; venueName: string; minutes: number; onClose: () => void; onChanged: () => void }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!coupon) return;
    setError(null);
    if (coupon.status === "active" && coupon.expiresAt) {
      setExpiresAt(new Date(coupon.expiresAt).getTime());
      setPhase("active");
    } else {
      setExpiresAt(null);
      setPhase("intro");
    }
  }, [coupon]);

  useEffect(() => {
    if (phase !== "active") return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [phase]);

  const left = expiresAt ? expiresAt - now : 0;
  useEffect(() => {
    if (phase === "active" && expiresAt && left <= 0) {
      setPhase("expired");
      onChanged();
    }
  }, [phase, expiresAt, left, onChanged]);

  if (!coupon) return null;
  const code = coupon.id.replace(/-/g, "").slice(0, 6).toUpperCase();

  async function call(path: string) {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ couponId: coupon!.id }) });
      return await r.json();
    } catch {
      return { ok: false, error: "Povezava ni uspela. Poskusi znova." };
    } finally {
      setBusy(false);
    }
  }

  async function activate() {
    const j = await call("/api/coupons/activate");
    if (!j.ok) return setError(j.error || "Kupona ni bilo mogoče aktivirati.");
    setExpiresAt(new Date(j.coupon.expiresAt).getTime());
    setPhase("active");
    onChanged();
  }

  async function confirm() {
    const j = await call("/api/coupons/confirm");
    if (!j.ok) return setError(j.error || "Potrditev ni uspela.");
    setPhase(j.status === "redeemed" ? "redeemed" : "expired");
    onChanged();
  }

  return (
    <Sheet open onClose={onClose} dismissable={phase !== "active" || !busy}>
      <div className="flex flex-col items-center gap-6 pt-4 text-center">
        {phase === "intro" && (
          <>
            <span className="flex size-16 items-center justify-center rounded-2xl bg-brand text-on-brand">
              <Ticket size={32} weight="fill" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold tracking-tight text-fg">{coupon.name}</h2>
              <p className="text-sm font-medium text-mute">{venueName}</p>
            </div>
            <p className="rounded-2xl bg-s2 p-4 text-left text-sm text-mute">
              Kupon aktiviraj šele, ko si ob blagajni. Po aktivaciji ima osebje {count(minutes, "minuta")} časa, da potrdi prevzem. Nato kupon poteče.
            </p>
            {error && <p role="alert" className="w-full rounded-xl border border-line bg-s2 px-4 py-3 text-sm text-bad">{error}</p>}
            <div className="flex w-full flex-col gap-2">
              <Button type="button" size="lg" full onClick={activate} disabled={busy}>
                {busy && <CircleNotch size={20} weight="bold" className="animate-spin" aria-hidden="true" />}
                Aktiviraj zdaj
              </Button>
              <Button type="button" variant="ghost" size="lg" full onClick={onClose} disabled={busy}>
                Ne še
              </Button>
            </div>
          </>
        )}

        {phase === "active" && (
          <>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-ink">Pokaži osebju</p>
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-semibold tracking-tight text-fg">{coupon.name}</h2>
              <p className="text-sm font-medium text-mute">{venueName}</p>
            </div>
            <div className="flex w-full flex-col items-center gap-2 rounded-3xl bg-s2 p-6">
              <p className={`font-mono text-6xl font-semibold tracking-tighter tabular-nums ${left < 60000 ? "text-warn" : "text-fg"}`} aria-live="polite">{mmss(left)}</p>
              <p className="flex items-center gap-2 text-sm text-mute">
                <Clock size={16} weight="bold" aria-hidden="true" />
                Koda <span className="font-mono font-semibold text-fg">{code}</span>
              </p>
            </div>
            {error && <p role="alert" className="w-full rounded-xl border border-line bg-s2 px-4 py-3 text-sm text-bad">{error}</p>}
            <Button type="button" size="lg" full onClick={confirm} disabled={busy}>
              {busy && <CircleNotch size={20} weight="bold" className="animate-spin" aria-hidden="true" />}
              Osebje potrdi prevzem
            </Button>
            <p className="text-sm text-dim">Gumb pritisne osebje, ko ti izroči nagrado.</p>
          </>
        )}

        {phase === "redeemed" && (
          <>
            <span className="animate-pop-in flex size-16 items-center justify-center rounded-full bg-brand text-on-brand">
              <CheckCircle size={32} weight="fill" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold tracking-tight text-fg">Nagrada je prevzeta</h2>
              <p className="text-base text-mute">{coupon.name} pri lokalu {venueName}. Naj tekne.</p>
            </div>
            <Button type="button" size="lg" full onClick={onClose}>Zapri</Button>
          </>
        )}

        {phase === "expired" && (
          <>
            <span className="flex size-16 items-center justify-center rounded-full bg-s3 text-warn">
              <Clock size={32} weight="bold" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold tracking-tight text-fg">Čas je potekel</h2>
              <p className="text-base text-mute">Prevzem ni bil potrjen pravočasno, zato kupon ni več veljaven.</p>
            </div>
            <Button type="button" variant="secondary" size="lg" full onClick={onClose}>Zapri</Button>
          </>
        )}
      </div>
    </Sheet>
  );
}
