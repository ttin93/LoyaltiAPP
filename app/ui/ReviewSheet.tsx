"use client";

import { useState } from "react";
import { ArrowUpRight, CheckCircle, GoogleLogo, Star } from "@phosphor-icons/react/dist/ssr";
import Sheet from "./Sheet";
import { Button, buttonClass } from "./Button";
import { Textarea } from "./Field";

/**
 * Ocena obiska. Vsak gost lahko oceno odda na Googlu; pri nižji oceni najprej
 * ponudimo neposredno sporočilo lokalu, povezava do Googla pa ostane na voljo.
 */
export default function ReviewSheet({
  open,
  venueCode,
  venueName,
  reviewUrl,
  onClose,
  initialStars = 0,
}: {
  open: boolean;
  venueCode: string;
  venueName: string;
  reviewUrl: string;
  onClose: () => void;
  /** Samo za predstavitveni zaslon: vnaprej izbrana ocena. */
  initialStars?: number;
}) {
  const [stars, setStars] = useState(initialStars);
  const [comment, setComment] = useState("");
  const [done, setDone] = useState<"google" | "private" | null>(null);
  const [busy, setBusy] = useState(false);

  async function send(toGoogle: boolean) {
    setBusy(true);
    try {
      await fetch("/api/review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ venueCode, stars, comment, toGoogle }),
      });
    } catch {
      /* ocena je neobvezna; napake ne kažemo */
    } finally {
      setBusy(false);
      setDone(toGoogle ? "google" : "private");
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title={done ? undefined : "Kako je bilo?"}>
      {done ? (
        <div className="flex flex-col items-center gap-6 pt-4 text-center">
          <span className="animate-pop-in flex size-16 items-center justify-center rounded-full bg-brand text-on-brand">
            <CheckCircle size={32} weight="fill" aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-fg">Hvala za oceno</h2>
            <p className="text-base text-mute">
              {done === "google" ? `Odprli smo ti stran za oceno na Googlu. Lokalu ${venueName} to veliko pomeni.` : `Tvoje sporočilo je prejel samo lokal ${venueName}.`}
            </p>
          </div>
          <Button type="button" size="lg" full onClick={onClose}>Zapri</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <p className="text-base text-mute">Oceni svoj obisk pri lokalu {venueName}. Vzame ti nekaj sekund.</p>
          <div className="flex justify-center gap-2" role="radiogroup" aria-label="Ocena">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={stars === n}
                aria-label={`${n} od 5`}
                onClick={() => setStars(n)}
                className={`flex size-12 items-center justify-center rounded-xl transition-all duration-700 ease-spring hover:bg-s2 active:scale-[0.98] ${stars >= n ? "text-brand-ink" : "text-dim"}`}
              >
                <Star size={32} weight={stars >= n ? "fill" : "bold"} aria-hidden="true" />
              </button>
            ))}
          </div>

          {stars >= 4 && (
            <div className="flex flex-col gap-3">
              <p className="text-center text-sm text-mute">Veseli nas. Bi oceno delil tudi na Googlu?</p>
              <a href={reviewUrl} target="_blank" rel="noreferrer" onClick={() => send(true)} className={buttonClass("primary", "lg", true)}>
                <GoogleLogo size={20} weight="bold" aria-hidden="true" />
                Oceni na Googlu
                <ArrowUpRight size={16} weight="bold" aria-hidden="true" />
              </a>
              <Button type="button" variant="ghost" size="lg" full onClick={() => send(false)} disabled={busy}>
                Shrani samo oceno
              </Button>
            </div>
          )}

          {stars > 0 && stars < 4 && (
            <div className="flex flex-col gap-3">
              <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Kaj bi lahko izboljšali?" aria-label="Sporočilo lokalu" maxLength={1000} />
              <Button type="button" size="lg" full onClick={() => send(false)} disabled={busy}>
                Pošlji lokalu
              </Button>
              <a href={reviewUrl} target="_blank" rel="noreferrer" onClick={() => send(true)} className="self-center rounded-lg text-sm font-medium text-mute underline underline-offset-4 transition-all duration-700 ease-spring hover:text-fg">
                Oceno lahko oddaš tudi na Googlu
              </a>
            </div>
          )}
        </div>
      )}
    </Sheet>
  );
}
