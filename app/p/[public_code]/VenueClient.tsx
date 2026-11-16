"use client";
/* eslint-disable react-hooks/set-state-in-effect -- stanje se uskladi z brskalnikom ali s svežimi podatki s strežnika; preverjeno z E2E */

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, CircleNotch, Clock, Globe, Lock, MapPin, Phone, Plus, Receipt, Warning,
} from "@phosphor-icons/react/dist/ssr";
import type { VenueView } from "@/lib/venues";
import type { Coupon } from "@/lib/coupons";
import LoyaltyCard, { StampDots } from "@/app/ui/LoyaltyCard";
import Logo from "@/app/ui/Logo";
import { Button, ButtonLink } from "@/app/ui/Button";
import Sheet from "@/app/ui/Sheet";
import Scanner from "@/app/ui/Scanner";
import WheelSheet from "@/app/ui/WheelSheet";
import CouponSheet from "@/app/ui/CouponSheet";
import ReviewSheet from "@/app/ui/ReviewSheet";
import Icon3D from "@/app/ui/Icon3D";
import { count, visitsLeft } from "@/lib/sl";

type StampResult = { stamps: number; goal: number; cardCompleted: boolean; rewardName: string; unlocked: string[]; askReview: boolean };

type Props = {
  venue: VenueView;
  signedIn: boolean;
  member: { stamps: number } | null;
  coupons: Coupon[];
  canSpin: boolean;
  flags: { join: boolean; stand: boolean; coupon: string | null };
};

export default function VenueClient({ venue, signedIn, member, coupons, canSpin, flags }: Props) {
  const router = useRouter();
  const [stamps, setStamps] = useState(member?.stamps ?? 0);
  const [isMember, setIsMember] = useState(!!member);
  const [spinOpen, setSpinOpen] = useState(false);
  const [spinAvailable, setSpinAvailable] = useState(canSpin && !!member);
  const [scanning, setScanning] = useState(false);
  const [busy, setBusy] = useState<"join" | "stamp" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StampResult | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  // Posnetek izbranega kupona: okno ostane odprto tudi, ko kupon po prevzemu izgine s seznama.
  const [selected, setSelected] = useState<Coupon | null>(() => coupons.find((c) => c.id === flags.coupon && c.status !== "pending") ?? null);
  const started = useRef(false);

  useEffect(() => setStamps(member?.stamps ?? 0), [member?.stamps]);
  useEffect(() => setIsMember(!!member), [member]);

  const refresh = useCallback(() => router.refresh(), [router]);

  const post = useCallback(async (path: string, body: Record<string, unknown>) => {
    try {
      const r = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      return (await r.json()) as { ok: boolean; error?: string } & Record<string, unknown>;
    } catch {
      return { ok: false, error: "Povezava ni uspela. Preveri internet in poskusi znova." };
    }
  }, []);

  const onStamped = useCallback(
    (j: StampResult) => {
      setStamps(j.cardCompleted ? j.goal : j.stamps);
      setResult(j);
      refresh();
    },
    [refresh],
  );

  const checkin = useCallback(async () => {
    setError(null);
    setBusy("stamp");
    const j = await post("/api/checkin", { venueCode: venue.code });
    setBusy(null);
    if (!j.ok) return setError(j.error || "Obiska ni bilo mogoče zabeležiti.");
    onStamped(j as unknown as StampResult);
  }, [post, venue.code, onStamped]);

  const join = useCallback(
    async (thenCheckin: boolean) => {
      setError(null);
      setBusy("join");
      const j = await post("/api/join", { venueCode: venue.code });
      setBusy(null);
      if (!j.ok) return setError(j.error || "Kartice ni bilo mogoče dodati.");
      setIsMember(true);
      setSpinAvailable(j.canSpin === true);
      refresh();
      if (thenCheckin) await checkin();
      else if (j.canSpin === true) setSpinOpen(true);
    },
    [post, venue.code, refresh, checkin],
  );

  // Prihod s povezave (po prijavi ali s stojala): samodejno dodaj kartico in zabeleži obisk.
  useEffect(() => {
    if (started.current || !signedIn) return;
    started.current = true;
    const standNow = flags.stand && venue.checkin !== "receipt";
    if (!member && (flags.join || standNow)) void join(standNow);
    else if (member && standNow) void checkin();
    if (flags.join || flags.stand) window.history.replaceState({}, "", window.location.pathname);
  }, [signedIn, member, flags.join, flags.stand, venue.checkin, join, checkin]);

  async function onScan(payload: string) {
    setScanning(false);
    setError(null);
    setBusy("stamp");
    const j = await post("/api/scan", { venueCode: venue.code, payload });
    setBusy(null);
    if (!j.ok) return setError(j.error || "Računa ni bilo mogoče potrditi.");
    onStamped(j as unknown as StampResult);
  }

  function closeResult() {
    const ask = result?.askReview;
    const completed = result?.cardCompleted;
    setResult(null);
    if (completed) setStamps(0);
    if (ask) setReviewOpen(true);
    else if (spinAvailable) setSpinOpen(true);
  }

  const next = `/p/${venue.code}?join=1${flags.stand ? "&stand=1" : ""}`;
  const mapsUrl = venue.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name} ${venue.address}`)}` : null;
  const canReceipt = venue.checkin !== "stand";
  const canStand = venue.checkin !== "receipt";

  return (
    <div className="relative min-h-svh bg-canvas">
      <div className="atmo-top pointer-events-none absolute inset-x-0 top-0 h-96" aria-hidden="true" />
      <header className="relative mx-auto flex max-w-4xl items-center justify-between px-6 pt-8">
        <Link
          href={signedIn ? "/app" : "/"}
          className="flex items-center gap-2 rounded-lg text-sm font-medium text-mute transition-all duration-700 ease-spring hover:text-fg"
        >
          <ArrowLeft size={16} weight="bold" aria-hidden="true" />
          {signedIn ? "Moje kartice" : "Loyavi"}
        </Link>
        <Logo href={signedIn ? "/app" : "/"} size={20} />
      </header>

      <main id="vsebina" className="relative mx-auto grid max-w-4xl gap-8 px-6 pb-24 pt-8 lg:grid-cols-2 lg:gap-12 lg:pt-16">
        <section className="flex flex-col gap-4">
          <LoyaltyCard card={{ name: venue.name, category: venue.category, color: venue.color, logoUrl: venue.logoUrl, stamps, goal: venue.goal, reward: venue.reward }} />
          <p className="px-2 text-base font-medium text-mute">
            {isMember ? visitsLeft(venue.goal - stamps) : `${count(venue.goal, "obisk")} do nagrade: ${venue.reward}`}
          </p>
        </section>

        <section className="flex flex-col gap-4">
          {error && (
            <p role="alert" className="flex items-start gap-3 rounded-3xl bg-card shadow-card p-4 text-sm text-bad">
              <Warning size={20} weight="bold" className="shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}

          {!signedIn && (
            <div className="flex flex-col gap-4 rounded-3xl bg-card shadow-card p-6">
              <h1 className="text-2xl font-semibold tracking-tight text-fg">Zbiraj žige pri lokalu {venue.name}</h1>
              <p className="text-base text-mute">Ustvari brezplačen račun in kartica se doda v tvojo denarnico. Traja manj kot minuto.</p>
              <ButtonLink href={`/prijava?next=${encodeURIComponent(next)}`} size="lg" full>
                Začni zbirati žige
                <ArrowRight size={16} weight="bold" aria-hidden="true" />
              </ButtonLink>
            </div>
          )}

          {signedIn && !isMember && (
            <div className="flex flex-col gap-4 rounded-3xl bg-card shadow-card p-6">
              <h1 className="text-2xl font-semibold tracking-tight text-fg">{venue.name}</h1>
              <p className="text-base text-mute">Dodaj kartico v denarnico in začni zbirati žige že ob naslednjem obisku.</p>
              <Button type="button" size="lg" full onClick={() => join(false)} disabled={busy !== null}>
                {busy === "join" ? <CircleNotch size={20} weight="bold" className="animate-spin" aria-hidden="true" /> : <Plus size={20} weight="bold" aria-hidden="true" />}
                Dodaj kartico v denarnico
              </Button>
            </div>
          )}

          {signedIn && isMember && (
            <>
              {!venue.live ? (
                <p className="rounded-3xl bg-card shadow-card p-4 text-sm text-mute">Lokal še pripravlja zbiranje žigov. Kartica te počaka v denarnici.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {canReceipt && (
                    <Button type="button" size="lg" full onClick={() => { setError(null); setScanning(true); }} disabled={busy !== null}>
                      {busy === "stamp" ? <CircleNotch size={20} weight="bold" className="animate-spin" aria-hidden="true" /> : <Receipt size={20} weight="bold" aria-hidden="true" />}
                      Skeniraj račun
                    </Button>
                  )}
                  {canStand && (
                    <p className="flex items-center gap-4 rounded-3xl bg-card p-4 text-sm text-mute shadow-card">
                      <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-tint">
                        <Icon3D name="telefon" size={44} />
                      </span>
                      {busy === "stamp" && !canReceipt ? "Beležim obisk." : "Za žig približaj telefon stojalu Loyavi ob blagajni ali skeniraj kodo na njem."}
                    </p>
                  )}
                </div>
              )}

              {spinAvailable && (
                <button
                  type="button"
                  onClick={() => setSpinOpen(true)}
                  className="atmo-brand group flex items-center gap-4 rounded-3xl p-4 text-left text-on-brand shadow-brand transition-all duration-700 ease-spring hover:-translate-y-1 active:scale-[0.98]"
                >
                  <span className="flex size-16 shrink-0 items-center justify-center">
                    <Icon3D name="kolo" size={64} className="drop-shadow-lg transition-all duration-700 ease-spring group-hover:rotate-12" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-lg font-semibold tracking-tight">Zavrti kolo dobrodošlice</span>
                    <span className="block text-sm font-medium opacity-80">En poskus, vsak segment je nagrada.</span>
                  </span>
                  <ArrowRight size={20} weight="bold" aria-hidden="true" />
                </button>
              )}

              {coupons.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h2 className="px-2 pt-2 text-sm font-semibold uppercase tracking-widest text-mute">Kuponi</h2>
                  {coupons.map((c) =>
                    c.status === "pending" ? (
                      <div key={c.id} className="flex items-center gap-4 rounded-3xl bg-card shadow-card p-4">
                        <span className="relative flex size-14 shrink-0 items-center justify-center rounded-2xl bg-s2">
                          <Icon3D name="kupon" size={44} className="opacity-60 grayscale" />
                          <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-fg text-card">
                            <Lock size={12} weight="bold" aria-hidden="true" />
                          </span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-base font-semibold text-fg">{c.name}</span>
                          <span className="block text-sm text-mute">Velja od naslednjega zabeleženega obiska.</span>
                        </span>
                      </div>
                    ) : (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelected(c)}
                        className="atmo-brand group flex items-center gap-4 rounded-3xl p-4 text-left text-on-brand shadow-brand transition-all duration-700 ease-spring hover:-translate-y-1 active:scale-[0.98]"
                      >
                        <span className="flex size-16 shrink-0 items-center justify-center">
                          <Icon3D name="darilo" size={60} className="-rotate-6 drop-shadow-lg transition-all duration-700 ease-spring group-hover:rotate-0" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-semibold uppercase tracking-widest opacity-80">{c.status === "active" ? "Prevzem poteka" : "Pripravljen za prevzem"}</span>
                          <span className="block text-lg font-semibold tracking-tight">{c.name}</span>
                        </span>
                        <span className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-ink">{c.status === "active" ? "Odpri" : "Unovči"}</span>
                      </button>
                    ),
                  )}
                </div>
              )}
            </>
          )}

          {(venue.about || venue.address || venue.hours || venue.phone || venue.website) && (
            <div className="flex flex-col gap-4 rounded-3xl bg-card shadow-card p-6">
              <h2 className="text-lg font-semibold tracking-tight text-fg">O lokalu</h2>
              {venue.about && <p className="text-base text-mute">{venue.about}</p>}
              <ul className="flex flex-col gap-3 text-sm">
                {venue.address && (
                  <li className="flex items-start gap-3 text-mute">
                    <MapPin size={20} weight="bold" className="shrink-0 text-dim" aria-hidden="true" />
                    {mapsUrl ? (
                      <a href={mapsUrl} target="_blank" rel="noreferrer" className="rounded-lg text-fg underline underline-offset-4 transition-all duration-700 ease-spring hover:text-brand-ink">
                        {venue.address}
                      </a>
                    ) : (
                      venue.address
                    )}
                  </li>
                )}
                {venue.hours && (
                  <li className="flex items-start gap-3 text-mute">
                    <Clock size={20} weight="bold" className="shrink-0 text-dim" aria-hidden="true" />
                    <span className="whitespace-pre-line">{venue.hours}</span>
                  </li>
                )}
                {venue.phone && (
                  <li className="flex items-start gap-3 text-mute">
                    <Phone size={20} weight="bold" className="shrink-0 text-dim" aria-hidden="true" />
                    <a href={`tel:${venue.phone.replace(/\s+/g, "")}`} className="rounded-lg text-fg underline underline-offset-4 transition-all duration-700 ease-spring hover:text-brand-ink">
                      {venue.phone}
                    </a>
                  </li>
                )}
                {venue.website && (
                  <li className="flex items-start gap-3 text-mute">
                    <Globe size={20} weight="bold" className="shrink-0 text-dim" aria-hidden="true" />
                    <a href={venue.website} target="_blank" rel="noreferrer" className="truncate rounded-lg text-fg underline underline-offset-4 transition-all duration-700 ease-spring hover:text-brand-ink">
                      {venue.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}
        </section>
      </main>

      {scanning && <Scanner onResult={onScan} onClose={() => setScanning(false)} />}

      <Sheet open={!!result} onClose={closeResult}>
        {result && (
          <div className="flex flex-col items-center gap-6 pt-4 text-center">
            <Icon3D name={result.cardCompleted ? "darilo" : "zig"} size={120} className="animate-pop-in drop-shadow-lg" />
            <div className="text-brand">
              <StampDots total={result.goal} filled={result.cardCompleted ? result.goal : result.stamps} size="lg" fresh={(result.cardCompleted ? result.goal : result.stamps) - 1} ink="#ffffff" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-semibold tracking-tight text-fg">{result.cardCompleted ? "Kartica je polna" : "Žig je tvoj"}</h2>
              <p className="text-base text-mute">
                {result.cardCompleted
                  ? `Nagrada je tvoja: ${result.rewardName}. Kupon te čaka med kuponi.`
                  : `${visitsLeft(result.goal - result.stamps)}: ${result.rewardName}.`}
              </p>
            </div>
            {result.unlocked.length > 0 && (
              <p className="w-full rounded-2xl bg-s2 p-4 text-sm text-fg">
                Odklenjeno: <span className="font-semibold text-brand-ink">{result.unlocked.join(", ")}</span>. Kupon lahko zdaj unovčiš.
              </p>
            )}
            <Button type="button" size="lg" full onClick={closeResult}>
              Super
            </Button>
          </div>
        )}
      </Sheet>

      <WheelSheet
        open={spinOpen}
        venueCode={venue.code}
        venueName={venue.name}
        labels={venue.wheel.segments}
        onClose={() => setSpinOpen(false)}
        onWon={() => {
          setSpinAvailable(false);
          refresh();
        }}
      />

      <CouponSheet coupon={selected} venueName={venue.name} minutes={venue.redemptionMinutes} onClose={() => setSelected(null)} onChanged={refresh} />

      <ReviewSheet open={reviewOpen} venueCode={venue.code} venueName={venue.name} reviewUrl={venue.reviewUrl} onClose={() => setReviewOpen(false)} />
    </div>
  );
}
