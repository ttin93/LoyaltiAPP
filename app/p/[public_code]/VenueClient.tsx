"use client";
/* eslint-disable react-hooks/set-state-in-effect -- stanje se uskladi z brskalnikom ali s svežimi podatki s strežnika; preverjeno z E2E */

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, CaretRight, Check, CircleNotch, Clock, ContactlessPayment, Copy, ForkKnife, Globe, InstagramLogo, Lock, MapPin, Phone, Plus,
  Receipt, Star, Warning, WifiHigh,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import type { VenueView } from "@/lib/venues";
import type { Coupon } from "@/lib/coupons";
import LoyaltyCard, { Stamps, VenueAvatar, inkOnWhite } from "@/app/ui/LoyaltyCard";
import { Wordmark } from "@/app/ui/Logo";
import { Button, ButtonLink } from "@/app/ui/Button";
import Sheet from "@/app/ui/Sheet";
import Scanner from "@/app/ui/Scanner";
import WheelSheet from "@/app/ui/WheelSheet";
import CouponSheet from "@/app/ui/CouponSheet";
import ReviewSheet from "@/app/ui/ReviewSheet";
import Icon3D, { categoryIcon3D } from "@/app/ui/Icon3D";
import LoyaviSignature from "@/app/ui/LoyaviSignature";
import { visitsLeft } from "@/lib/sl";
import { categoryLabel } from "@/lib/categories";
import { tint } from "@/lib/color";

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
  const [wifiOpen, setWifiOpen] = useState(false);
  const [copied, setCopied] = useState(false);
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
  const member_ = signedIn && isMember;
  // barva lokala: berljiva na beli podlagi in nežna podlaga za ikone
  const tone = { fg: inkOnWhite(venue.color), bg: tint(venue.color, 0.88) };
  const home = signedIn ? "/app" : "/";

  async function copyWifi() {
    try {
      await navigator.clipboard.writeText(venue.wifiPass);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* brez dostopa do odložišča: geslo je izpisano, gost ga prepiše */
    }
  }

  return (
    <div className="app-ui relative min-h-svh bg-canvas">
      {/* naslovnica: fotografija lokala ali barva lokala z grafiko vrste lokala */}
      <div className="relative mx-auto w-full max-w-2xl">
        <div className="relative h-56 w-full overflow-hidden sm:h-72 sm:rounded-b-3xl" style={{ background: `linear-gradient(160deg, ${tint(venue.color, 0.5)} 0%, ${venue.color} 100%)` }}>
          {venue.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={venue.coverUrl} alt="" className="size-full object-cover" />
          ) : (
            <Icon3D name={categoryIcon3D(venue.category)} size={176} className="absolute -bottom-6 right-4 rotate-6 drop-shadow-2xl" priority />
          )}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 to-transparent" aria-hidden="true" />
        </div>
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <Link
            href={home}
            aria-label={signedIn ? "Nazaj na moje kartice" : "Na začetno stran Loyavi"}
            className="flex size-10 items-center justify-center rounded-full bg-white/90 text-fg shadow-card backdrop-blur-xl transition-all duration-700 ease-spring hover:bg-white active:scale-[0.96]"
          >
            <ArrowLeft size={20} weight="bold" aria-hidden="true" />
          </Link>
          <Link href={home} aria-label="Loyavi" className="flex h-10 items-center rounded-full bg-white/90 px-4 shadow-card backdrop-blur-xl transition-all duration-700 ease-spring hover:bg-white">
            <Wordmark className="text-xl text-fg" />
          </Link>
        </div>
      </div>

      <main id="vsebina" className="relative mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 pb-12 sm:px-6">
        {/* identiteta lokala */}
        <div className="-mt-10 flex flex-col gap-3">
          <VenueAvatar name={venue.name} logoUrl={venue.logoUrl} color={venue.color} size={80} className="shadow-pop ring-4 ring-canvas" />
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-semibold tracking-tight text-fg">{venue.name}</h1>
            <p className="text-sm font-medium text-mute">
              {categoryLabel(venue.category)}
              {venue.city ? ` · ${venue.city}` : ""}
            </p>
            {venue.tagline && <p className="text-base text-mute">{venue.tagline}</p>}
          </div>
        </div>

        {error && (
          <p role="alert" className="flex items-start gap-3 rounded-3xl bg-card p-4 text-sm text-bad shadow-card">
            <Warning size={20} weight="bold" className="shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}

        <LoyaltyCard bare card={{ name: venue.name, category: venue.category, color: venue.color, logoUrl: venue.logoUrl, stamps, goal: venue.goal, reward: venue.reward }} />

        {/* glavno dejanje */}
        {!signedIn && (
          <div className="flex flex-col gap-3">
            <ButtonLink href={`/prijava?next=${encodeURIComponent(next)}`} size="lg" full className="py-4 text-lg">
              Začni zbirati žige
              <ArrowRight size={20} weight="bold" aria-hidden="true" />
            </ButtonLink>
            <p className="text-center text-sm text-mute">Brezplačno in brez nameščanja aplikacije. Račun ustvariš v manj kot minuti.</p>
          </div>
        )}

        {signedIn && !isMember && (
          <Button type="button" size="lg" full className="py-4 text-lg" onClick={() => join(false)} disabled={busy !== null}>
            {busy === "join" ? <CircleNotch size={20} weight="bold" className="animate-spin" aria-hidden="true" /> : <Plus size={20} weight="bold" aria-hidden="true" />}
            Dodaj kartico v denarnico
          </Button>
        )}

        {member_ &&
          (venue.live ? (
            <div className="flex flex-col gap-3">
              {canReceipt && (
                <Button
                  type="button"
                  size="lg"
                  full
                  className="py-4 text-lg"
                  onClick={() => {
                    setError(null);
                    setScanning(true);
                  }}
                  disabled={busy !== null}
                >
                  {busy === "stamp" ? <CircleNotch size={20} weight="bold" className="animate-spin" aria-hidden="true" /> : <Receipt size={20} weight="bold" aria-hidden="true" />}
                  Skeniraj račun
                </Button>
              )}
              {canStand && (
                <p className={`flex items-center gap-3 text-sm text-mute ${canReceipt ? "justify-center" : "rounded-3xl bg-card p-4 text-base shadow-card"}`}>
                  <ContactlessPayment size={20} weight="bold" className="shrink-0" style={{ color: tone.fg }} aria-hidden="true" />
                  {busy === "stamp" && !canReceipt ? "Beležim obisk." : canReceipt ? "ali približaj telefon stojalu ob blagajni" : "Za žig približaj telefon stojalu ob blagajni ali skeniraj kodo na njem."}
                </p>
              )}
            </div>
          ) : (
            <p className="rounded-3xl bg-card p-4 text-sm text-mute shadow-card">Lokal še pripravlja zbiranje žigov. Kartica te počaka v denarnici.</p>
          ))}

        {member_ && spinAvailable && (
          <button
            type="button"
            onClick={() => setSpinOpen(true)}
            className="group flex items-center gap-3 rounded-3xl p-3 pr-4 text-left transition-all duration-700 ease-spring hover:-translate-y-0.5 active:scale-[0.98]"
            style={{ background: tone.bg }}
          >
            <Icon3D name="kolo" size={56} className="shrink-0 transition-all duration-700 ease-spring group-hover:rotate-12" />
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-semibold tracking-tight text-fg">Zavrti kolo dobrodošlice</span>
              <span className="block text-sm text-mute">En poskus, vsako polje je nagrada.</span>
            </span>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-fg text-card">
              <ArrowRight size={16} weight="bold" aria-hidden="true" />
            </span>
          </button>
        )}

        {member_ && coupons.length > 0 && (
          <section aria-label="Kuponi" className="flex flex-col gap-3">
            <h2 className="px-1 pt-2 text-sm font-semibold text-mute">Kuponi</h2>
            {coupons.map((c) =>
              c.status === "pending" ? (
                <div key={c.id} className="flex items-center gap-3 rounded-3xl bg-card p-3 pr-4 shadow-card">
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-s1 text-dim">
                    <Lock size={24} weight="bold" aria-hidden="true" />
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
                  className="group flex items-center gap-3 rounded-3xl bg-fg p-3 pr-4 text-left text-card shadow-pop transition-all duration-700 ease-spring hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <Icon3D name="darilo" size={56} className="shrink-0 -rotate-6 transition-all duration-700 ease-spring group-hover:rotate-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-medium text-white/60">{c.status === "active" ? "Prevzem poteka" : "Pripravljen za prevzem"}</span>
                    <span className="block truncate text-lg font-semibold tracking-tight">{c.name}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-card px-4 py-2 text-sm font-semibold text-fg">{c.status === "active" ? "Odpri" : "Unovči"}</span>
                </button>
              ),
            )}
          </section>
        )}

        {/* vse o lokalu na enem mestu: meni, Wi-Fi, ocena, pot, povezave */}
        {(venue.menuUrl || venue.wifiName || member_ || mapsUrl || venue.instagram || venue.website || venue.phone) && (
          <section aria-label="Lokal" className="mt-2 divide-y divide-line/60 overflow-hidden rounded-3xl bg-card shadow-card">
            {venue.menuUrl && <Row tone={tone} icon={ForkKnife} title="Meni" value="Ponudba in cene" href={venue.menuUrl} external />}
            {venue.wifiName && <Row tone={tone} icon={WifiHigh} title="Wi-Fi" value={venue.wifiName} onClick={() => setWifiOpen(true)} />}
            {member_ && <Row tone={tone} icon={Star} title="Oceni obisk" value="Povej, kako je bilo" onClick={() => setReviewOpen(true)} />}
            {mapsUrl && <Row tone={tone} icon={MapPin} title="Pot do lokala" value={venue.address} href={mapsUrl} external />}
            {venue.instagram && <Row tone={tone} icon={InstagramLogo} title="Instagram" value={`@${venue.instagram}`} href={`https://www.instagram.com/${venue.instagram}/`} external />}
            {venue.website && <Row tone={tone} icon={Globe} title="Spletna stran" value={venue.website.replace(/^https?:\/\//, "").replace(/\/$/, "")} href={venue.website} external />}
            {venue.phone && <Row tone={tone} icon={Phone} title="Pokliči" value={venue.phone} href={`tel:${venue.phone.replace(/\s+/g, "")}`} />}
          </section>
        )}

        {(venue.about || venue.hours) && (
          <section className="flex flex-col gap-3 rounded-3xl bg-card p-6 shadow-card">
            <h2 className="text-sm font-semibold text-mute">O lokalu</h2>
            {venue.about && <p className="text-base text-fg">{venue.about}</p>}
            {venue.hours && (
              <p className="flex items-start gap-3 text-sm text-mute">
                <Clock size={20} weight="bold" className="shrink-0 text-dim" aria-hidden="true" />
                <span className="whitespace-pre-line">{venue.hours}</span>
              </p>
            )}
          </section>
        )}
      </main>

      {/* obvezen podpis Loyavi: del strani, lokal ga ne more skriti */}
      <LoyaviSignature className="relative" />

      {scanning && <Scanner onResult={onScan} onClose={() => setScanning(false)} />}

      <Sheet open={!!result} onClose={closeResult}>
        {result && (
          <div className="flex flex-col items-center gap-6 pt-6 text-center">
            {result.cardCompleted && <Icon3D name="darilo" size={104} className="animate-pop-in" />}
            <div className="flex w-full justify-center">
              <Stamps
                total={result.goal}
                filled={result.cardCompleted ? result.goal : result.stamps}
                category={venue.category}
                ink={tone.fg}
                paper="#ffffff"
                fresh={(result.cardCompleted ? result.goal : result.stamps) - 1}
                max={56}
              />
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
              <p className="w-full rounded-2xl bg-s1 p-4 text-sm text-fg">
                Odklenjeno: <span className="font-semibold">{result.unlocked.join(", ")}</span>. Kupon lahko zdaj unovčiš.
              </p>
            )}
            <Button type="button" size="lg" full className="py-4 text-lg" onClick={closeResult}>
              Super
            </Button>
          </div>
        )}
      </Sheet>

      <Sheet open={wifiOpen} onClose={() => setWifiOpen(false)} title="Wi-Fi za goste">
        <div className="flex flex-col gap-4">
          <dl className="divide-y divide-line/60 overflow-hidden rounded-2xl bg-s1">
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <dt className="text-sm text-mute">Omrežje</dt>
              <dd className="truncate text-base font-semibold text-fg">{venue.wifiName}</dd>
            </div>
            {venue.wifiPass && (
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <dt className="text-sm text-mute">Geslo</dt>
                <dd className="truncate font-mono text-base font-semibold text-fg">{venue.wifiPass}</dd>
              </div>
            )}
          </dl>
          {venue.wifiPass ? (
            <>
              <Button type="button" size="lg" full className="py-4 text-lg" onClick={copyWifi}>
                {copied ? <Check size={20} weight="bold" aria-hidden="true" /> : <Copy size={20} weight="bold" aria-hidden="true" />}
                {copied ? "Geslo je kopirano" : "Kopiraj geslo"}
              </Button>
              <p className="text-center text-sm text-mute">V nastavitvah telefona izberi omrežje in prilepi geslo.</p>
            </>
          ) : (
            <p className="text-sm text-mute">Omrežje je odprto, gesla ne potrebuješ.</p>
          )}
        </div>
      </Sheet>

      <WheelSheet
        open={spinOpen}
        venueCode={venue.code}
        venueName={venue.name}
        color={venue.color}
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

/** Vrstica v seznamu dejanj lokala (meni, Wi-Fi, pot …). */
function Row({ tone, icon: I, title, value, href, external, onClick }: { tone: { fg: string; bg: string }; icon: Icon; title: string; value?: string; href?: string; external?: boolean; onClick?: () => void }) {
  const cls = "group flex w-full items-center gap-4 px-4 py-3 text-left transition-all duration-700 ease-spring hover:bg-s1 active:scale-[0.99]";
  const inner = (
    <>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl" style={{ background: tone.bg, color: tone.fg }}>
        <I size={20} weight="bold" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-medium text-fg">{title}</span>
        {value && <span className="block truncate text-sm text-mute">{value}</span>}
      </span>
      <CaretRight size={16} weight="bold" className="shrink-0 text-dim transition-all duration-700 ease-spring group-hover:translate-x-0.5" aria-hidden="true" />
    </>
  );
  if (href) {
    return (
      <a href={href} className={cls} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
        {inner}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}
