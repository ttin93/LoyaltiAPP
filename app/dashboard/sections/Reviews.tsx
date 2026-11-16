"use client";

import { useState } from "react";
import { ChatCircleText, CircleNotch, Star } from "@phosphor-icons/react/dist/ssr";
import { saveVenue } from "@/app/actions";
import { Button } from "@/app/ui/Button";
import { Field, Input } from "@/app/ui/Field";
import { count, dateShort } from "@/lib/sl";
import type { DashData } from "../data";
import { Badge, Empty, Panel, SectionHead, Stat, useAct } from "../parts";

function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5" role="img" aria-label={`${n} od 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={16} weight="fill" className={i <= n ? "text-brand-ink" : "text-s3"} aria-hidden="true" />
      ))}
    </span>
  );
}

export default function Reviews({ data }: { data: DashData }) {
  const { venue, reviews, stats } = data;
  const [url, setUrl] = useState(venue.googleReviewUrl);
  const save = useAct();

  const dist = [5, 4, 3, 2, 1].map((s) => ({ stars: s, n: reviews.filter((r) => r.stars === s).length }));
  const max = Math.max(1, ...dist.map((d) => d.n));
  const toGoogle = reviews.filter((r) => r.toGoogle).length;
  const withComment = reviews.filter((r) => r.comment);

  return (
    <>
      <SectionHead title="Ocene" text="Po potrjenem obisku gosta povabimo k oceni. Vsak lahko nadaljuje na Google, pri nižji oceni pa mu najprej ponudimo, da sporočilo pošlje neposredno tebi." />

      <Panel title="Povezava do ocen na Googlu" text="V Google Zemljevidih odpri svoj lokal, izberi Deli in kopiraj povezavo. Brez povezave gosta usmerimo na iskanje tvojega lokala.">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            save.run(() => saveVenue(venue.id, { googleReviewUrl: url }), "Povezava je shranjena.");
          }}
        >
          <Field label="Povezava">
            <Input type="url" inputMode="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://g.page/r/..." maxLength={300} />
          </Field>
          <div>
            <Button type="submit" size="lg" disabled={save.pending || url.trim() === venue.googleReviewUrl}>
              {save.pending && <CircleNotch size={20} weight="bold" className="animate-spin" aria-hidden="true" />}
              Shrani povezavo
            </Button>
          </div>
        </form>
      </Panel>

      {reviews.length === 0 ? (
        <Empty icon={<Star size={24} aria-hidden="true" />} title="Še ni ocen" text="Prva ocena se pojavi, ko gost po obisku odgovori na povabilo." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <Stat label="Povprečna ocena" value={(stats.ratingAvg ?? 0).toLocaleString("sl-SI", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} note={`Skupaj ${count(stats.ratingCount, "ocena")}`} />
            <Stat label="Nadaljevali na Google" value={String(toGoogle)} note="Gostje, ki so odprli tvojo stran na Googlu" />
            <div className="col-span-2 lg:col-span-1">
              <Stat label="Zasebna sporočila" value={String(withComment.length)} note="Povratne informacije samo zate" />
            </div>
          </div>

          <Panel title="Razporeditev ocen">
            <ul className="flex flex-col gap-2">
              {dist.map((d) => (
                <li key={d.stars} className="flex items-center gap-3">
                  <span className="flex w-8 shrink-0 items-center gap-1 font-mono text-sm text-mute">
                    {d.stars}
                    <Star size={12} weight="fill" aria-hidden="true" />
                  </span>
                  <span className="h-3 flex-1 overflow-hidden rounded-full bg-s2">
                    <span className="block h-full rounded-full bg-brand" style={{ width: d.n ? `max(4px, ${(d.n / max) * 100}%)` : 0 }} />
                  </span>
                  <span className="w-8 shrink-0 text-right font-mono text-sm text-fg">{d.n}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Sporočila gostov" text="Vidiš jih samo ti. Na vsako se lahko odzoveš po elektronski pošti.">
            {withComment.length === 0 ? (
              <Empty icon={<ChatCircleText size={24} aria-hidden="true" />} title="Brez sporočil" text="Gostje so do zdaj oddali samo ocene z zvezdicami." />
            ) : (
              <ul className="flex flex-col gap-2">
                {withComment.map((r) => (
                  <li key={r.id} className="flex flex-col gap-3 rounded-2xl bg-s2 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Stars n={r.stars} />
                      <span className="text-xs text-dim">{dateShort(r.createdAt)}</span>
                    </div>
                    <p className="text-sm whitespace-pre-line text-fg">{r.comment}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {r.email ? (
                        <a href={`mailto:${r.email}`} className="rounded-lg text-sm font-medium text-mute underline underline-offset-4 transition-all duration-700 ease-spring hover:text-fg">
                          {r.email}
                        </a>
                      ) : (
                        <span className="text-sm text-dim">Gost</span>
                      )}
                      {r.toGoogle && <Badge>Odprl tudi Google</Badge>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </>
      )}
    </>
  );
}
