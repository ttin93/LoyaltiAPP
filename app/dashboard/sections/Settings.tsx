"use client";

import { useState } from "react";
import { CircleNotch } from "@phosphor-icons/react/dist/ssr";
import { saveVenue } from "@/app/actions";
import { Button } from "@/app/ui/Button";
import { Field, Input, Select, Textarea, Toggle } from "@/app/ui/Field";
import { CATEGORIES } from "@/lib/categories";
import type { DashVenue } from "../data";
import { Panel, SectionHead, useAct } from "../parts";

export default function Settings({ venue }: { venue: DashVenue }) {
  const [f, setF] = useState({
    name: venue.name,
    category: venue.category,
    city: venue.city,
    address: venue.meta.address,
    phone: venue.phone,
    website: venue.meta.website,
    hours: venue.meta.hours,
    about: venue.meta.about,
    listed: venue.meta.listed,
  });
  const [r, setR] = useState({ scanWindowHours: venue.scanWindowHours, cooldownMinutes: venue.cooldownMinutes, redemptionMinutes: venue.redemptionMinutes });
  const profile = useAct();
  const rules = useAct();
  const up = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  return (
    <>
      <SectionHead title="Nastavitve" text="Podatki, ki jih gostje vidijo na tvoji strani in v imeniku lokalov." />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          profile.run(() => saveVenue(venue.id, f), "Podatki so shranjeni.");
        }}
      >
        <Panel title="Profil lokala">
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Ime lokala">
              <Input value={f.name} onChange={(e) => up("name", e.target.value)} maxLength={60} required minLength={2} />
            </Field>
            <Field label="Vrsta lokala">
              <Select value={f.category} onChange={(e) => up("category", e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Naslov">
              <Input value={f.address} onChange={(e) => up("address", e.target.value)} maxLength={120} placeholder="Trubarjeva cesta 21" />
            </Field>
            <Field label="Kraj">
              <Input value={f.city} onChange={(e) => up("city", e.target.value)} maxLength={60} placeholder="Ljubljana" />
            </Field>
            <Field label="Telefon">
              <Input type="tel" value={f.phone} onChange={(e) => up("phone", e.target.value)} maxLength={30} placeholder="041 234 567" />
            </Field>
            <Field label="Spletna stran">
              <Input value={f.website} onChange={(e) => up("website", e.target.value)} maxLength={200} placeholder="www.tvojlokal.si" inputMode="url" />
            </Field>
          </div>
          <Field label="Delovni čas">
            <Input value={f.hours} onChange={(e) => up("hours", e.target.value)} maxLength={200} placeholder="Od ponedeljka do petka od 7.00 do 20.00" />
          </Field>
          <Field label="Kratek opis" hint="En ali dva stavka o tem, kaj gosta čaka pri tebi.">
            <Textarea value={f.about} onChange={(e) => up("about", e.target.value)} maxLength={300} />
          </Field>
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-s2 p-4">
            <span>
              <span className="block text-sm font-semibold text-fg">Prikaži v imeniku lokalov</span>
              <span className="block text-sm text-mute">Gostje te najdejo v aplikaciji tudi brez kode QR.</span>
            </span>
            <Toggle checked={f.listed} onChange={(v) => up("listed", v)} label="Prikaži v imeniku lokalov" />
          </div>
          <div>
            <Button type="submit" size="lg" disabled={profile.pending}>
              {profile.pending && <CircleNotch size={20} weight="bold" className="animate-spin" aria-hidden="true" />}
              Shrani profil
            </Button>
          </div>
        </Panel>
      </form>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          rules.run(() => saveVenue(venue.id, r), "Pravila so shranjena.");
        }}
      >
        <Panel title="Pravila" text="Varovalke, ki preprečujejo zlorabe. Privzete vrednosti ustrezajo večini lokalov.">
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="Veljavnost računa (ure)" hint="Kako star račun še prinese žig.">
              <Input type="number" min={1} max={720} value={r.scanWindowHours} onChange={(e) => setR((p) => ({ ...p, scanWindowHours: Number(e.target.value) }))} className="font-mono" />
            </Field>
            <Field label="Premor med žigi (minute)" hint="0 pomeni brez premora.">
              <Input type="number" min={0} max={1440} value={r.cooldownMinutes} onChange={(e) => setR((p) => ({ ...p, cooldownMinutes: Number(e.target.value) }))} className="font-mono" />
            </Field>
            <Field label="Čas za prevzem (minute)" hint="Koliko časa ima gost, da pokaže kupon osebju.">
              <Input type="number" min={1} max={60} value={r.redemptionMinutes} onChange={(e) => setR((p) => ({ ...p, redemptionMinutes: Number(e.target.value) }))} className="font-mono" />
            </Field>
          </div>
          <div>
            <Button type="submit" size="lg" disabled={rules.pending}>
              {rules.pending && <CircleNotch size={20} weight="bold" className="animate-spin" aria-hidden="true" />}
              Shrani pravila
            </Button>
          </div>
        </Panel>
      </form>
    </>
  );
}
