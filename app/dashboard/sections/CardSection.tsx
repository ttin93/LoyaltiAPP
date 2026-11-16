"use client";

import { useRef, useState } from "react";
import { CircleNotch, Plus, Trash, UploadSimple } from "@phosphor-icons/react/dist/ssr";
import { removeLogo, saveCard, uploadLogo } from "@/app/actions";
import { Button } from "@/app/ui/Button";
import { Field, Input } from "@/app/ui/Field";
import LoyaltyCard from "@/app/ui/LoyaltyCard";
import { CARD_COLORS } from "@/app/partner/Onboarding";
import type { DashVenue } from "../data";
import { Panel, SectionHead, Stepper, useAct } from "../parts";

export default function CardSection({ venue }: { venue: DashVenue }) {
  const [color, setColor] = useState(venue.color);
  const [goal, setGoal] = useState(venue.goal);
  const [reward, setReward] = useState(venue.reward);
  const file = useRef<HTMLInputElement>(null);
  const save = useAct();
  const logo = useAct();

  const dirty = color !== venue.color || goal !== venue.goal || reward.trim() !== venue.reward;

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const fd = new FormData();
    fd.set("file", f);
    logo.run(() => uploadLogo(venue.id, fd), "Logotip je naložen.");
    e.target.value = "";
  }

  return (
    <>
      <SectionHead title="Kartica" text="Tako je tvoja kartica videti v telefonu gosta. Spremembe veljajo takoj za vse goste." />
      <div className="grid items-start gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-4 lg:sticky lg:top-12">
          <LoyaltyCard card={{ name: venue.name, category: venue.category, color, logoUrl: venue.logoUrl, stamps: Math.min(3, goal), goal, reward: reward.trim() || venue.reward }} />
          <p className="text-sm text-mute">Predogled po treh obiskih. Barva besedila se sama prilagodi podlagi.</p>
        </div>

        <div className="flex flex-col gap-4">
          <Panel title="Videz">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-mute">Barva kartice</span>
              <div className="flex flex-wrap items-center gap-3">
                {CARD_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`Barva ${c}`}
                    aria-pressed={color.toLowerCase() === c.toLowerCase()}
                    onClick={() => setColor(c)}
                    className={`size-10 rounded-full border-2 transition-all duration-700 ease-spring active:scale-[0.98] ${color.toLowerCase() === c.toLowerCase() ? "border-fg" : "border-line"}`}
                    style={{ background: c }}
                  />
                ))}
                <label className="relative flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-line bg-s2 text-mute transition-all duration-700 ease-spring hover:bg-s3" title="Lastna barva">
                  <Plus size={16} weight="bold" aria-hidden="true" />
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} aria-label="Lastna barva" className="absolute inset-0 size-full cursor-pointer opacity-0" />
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-mute">Logotip</span>
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex size-12 items-center justify-center overflow-hidden rounded-full bg-s3 text-xs text-dim">
                  {venue.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={venue.logoUrl} alt={`Logotip lokala ${venue.name}`} className="size-full object-cover" />
                  ) : (
                    "Ni"
                  )}
                </span>
                <input ref={file} type="file" accept="image/png,image/jpeg,image/webp" onChange={onFile} className="sr-only" aria-label="Naloži logotip" tabIndex={-1} />
                <Button type="button" variant="secondary" size="sm" onClick={() => file.current?.click()} disabled={logo.pending}>
                  {logo.pending ? <CircleNotch size={16} weight="bold" className="animate-spin" aria-hidden="true" /> : <UploadSimple size={16} weight="bold" aria-hidden="true" />}
                  {venue.logoUrl ? "Zamenjaj" : "Naloži"}
                </Button>
                {venue.logoUrl && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => logo.run(() => removeLogo(venue.id), "Logotip je odstranjen.")} disabled={logo.pending}>
                    <Trash size={16} weight="bold" aria-hidden="true" />
                    Odstrani
                  </Button>
                )}
              </div>
              <span className="text-sm text-dim">PNG, JPG ali WEBP do 2 MB. Najbolje deluje kvadratna slika.</span>
            </div>
          </Panel>

          <Panel title="Pravila kartice">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-mute">Obiskov do nagrade</span>
              <Stepper value={goal} min={4} max={12} onChange={setGoal} label="Obiskov do nagrade" />
            </div>
            <Field label="Nagrada za polno kartico" hint="Na primer: Brezplačna kava ali Popust 20 %.">
              <Input value={reward} onChange={(e) => setReward(e.target.value)} maxLength={60} />
            </Field>
          </Panel>

          <div className="flex items-center gap-3">
            <Button type="button" size="lg" disabled={!dirty || save.pending || !reward.trim()} onClick={() => save.run(() => saveCard(venue.id, { goal, reward, color }), "Kartica je shranjena.")}>
              {save.pending && <CircleNotch size={20} weight="bold" className="animate-spin" aria-hidden="true" />}
              Shrani kartico
            </Button>
            {dirty && <span className="text-sm text-mute">Imaš neshranjene spremembe.</span>}
          </div>
        </div>
      </div>
    </>
  );
}
