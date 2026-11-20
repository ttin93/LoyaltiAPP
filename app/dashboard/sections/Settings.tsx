"use client";

import { useRef, useState } from "react";
import { CircleNotch, Trash, UploadSimple } from "@phosphor-icons/react/dist/ssr";
import { removeCover, saveVenue, uploadCover, uploadMenu } from "@/app/actions";
import { Button } from "@/app/ui/Button";
import { Field, Input, Select, Textarea, Toggle } from "@/app/ui/Field";
import { CATEGORIES } from "@/lib/categories";
import type { DashVenue } from "../data";
import { Panel, SectionHead, useAct, useToast } from "../parts";

/** Fotografijo pred nalaganjem pomanjša v brskalniku (telefonske slike imajo več megabajtov). */
async function downscale(file: File, max = 1600, quality = 0.82): Promise<File> {
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * k);
    canvas.height = Math.round(bmp.height * k);
    canvas.getContext("2d")?.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", quality));
    return blob ? new File([blob], "slika.jpg", { type: "image/jpeg" }) : file;
  } catch {
    return file; // brskalnik slike ne zna prebrati: pošljemo izvirnik, strežnik preveri velikost
  }
}

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
  const [g, setG] = useState({
    tagline: venue.meta.tagline,
    wifiName: venue.meta.wifiName,
    wifiPass: venue.meta.wifiPass,
    menuUrl: venue.meta.menuUrl,
    instagram: venue.meta.instagram,
  });
  const page = useAct();
  const cover = useAct();
  const menu = useAct();
  const toast = useToast();
  const coverInput = useRef<HTMLInputElement>(null);
  const menuInput = useRef<HTMLInputElement>(null);
  const upG = <K extends keyof typeof g>(k: K, v: (typeof g)[K]) => setG((p) => ({ ...p, [k]: v }));

  async function onCover(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    e.target.value = "";
    if (!picked) return;
    const fd = new FormData();
    fd.set("file", await downscale(picked));
    cover.run(() => uploadCover(venue.id, fd), "Naslovna fotografija je naložena.");
  }

  async function onMenu(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    e.target.value = "";
    if (!picked) return;
    if (picked.type === "application/pdf" && picked.size > 4 * 1024 * 1024) return toast("Dokument naj bo manjši od 4 MB.", "bad");
    const fd = new FormData();
    fd.set("file", picked.type === "application/pdf" ? picked : await downscale(picked, 2200, 0.85));
    menu.run(() => uploadMenu(venue.id, fd), "Meni je naložen.");
  }
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
          page.run(() => saveVenue(venue.id, g), "Stran lokala je shranjena.");
        }}
      >
        <Panel title="Stran lokala" text="Kar gost vidi, ko skenira kodo: fotografija, meni, Wi-Fi in povezave. Več kot ponudiš, več razlogov ima, da stran odpre.">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-mute">Naslovna fotografija</span>
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex h-24 w-40 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-s2 text-sm text-dim">
                {venue.meta.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={venue.meta.coverUrl} alt={`Naslovna fotografija lokala ${venue.name}`} className="size-full object-cover" />
                ) : (
                  "Ni fotografije"
                )}
              </span>
              <input ref={coverInput} type="file" accept="image/png,image/jpeg,image/webp" onChange={onCover} className="sr-only" aria-label="Naloži naslovno fotografijo" tabIndex={-1} />
              <Button type="button" variant="secondary" size="sm" onClick={() => coverInput.current?.click()} disabled={cover.pending}>
                {cover.pending ? <CircleNotch size={16} weight="bold" className="animate-spin" aria-hidden="true" /> : <UploadSimple size={16} weight="bold" aria-hidden="true" />}
                {venue.meta.coverUrl ? "Zamenjaj" : "Naloži"}
              </Button>
              {venue.meta.coverUrl && (
                <Button type="button" variant="ghost" size="sm" onClick={() => cover.run(() => removeCover(venue.id), "Fotografija je odstranjena.")} disabled={cover.pending}>
                  <Trash size={16} weight="bold" aria-hidden="true" />
                  Odstrani
                </Button>
              )}
            </div>
            <span className="text-sm text-dim">Ležeča fotografija lokala, pulta ali ponudbe. Brez nje pokažemo barvo kartice z grafiko.</span>
          </div>

          <Field label="Kratek slogan" hint="Ena vrstica pod imenom lokala.">
            <Input value={g.tagline} onChange={(e) => upG("tagline", e.target.value)} maxLength={80} placeholder="Sveže pražena kava in domače pecivo." />
          </Field>

          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Wi-Fi: ime omrežja">
              <Input value={g.wifiName} onChange={(e) => upG("wifiName", e.target.value)} maxLength={40} placeholder="Lipa gostje" />
            </Field>
            <Field label="Wi-Fi: geslo" hint="Vidi ga vsak, ki odpre stran lokala.">
              <Input value={g.wifiPass} onChange={(e) => upG("wifiPass", e.target.value)} maxLength={64} className="font-mono" autoComplete="off" />
            </Field>
            <Field label="Meni ali cenik" hint="Povezava do menija ali naložena slika oziroma PDF.">
              <Input value={g.menuUrl} onChange={(e) => upG("menuUrl", e.target.value)} maxLength={300} placeholder="www.tvojlokal.si/meni" inputMode="url" />
            </Field>
            <Field label="Instagram">
              <Input value={g.instagram} onChange={(e) => upG("instagram", e.target.value)} maxLength={120} placeholder="kavarnalipa" autoCapitalize="none" />
            </Field>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" size="lg" disabled={page.pending}>
              {page.pending && <CircleNotch size={20} weight="bold" className="animate-spin" aria-hidden="true" />}
              Shrani stran lokala
            </Button>
            <input ref={menuInput} type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={onMenu} className="sr-only" aria-label="Naloži meni" tabIndex={-1} />
            <Button type="button" variant="secondary" size="lg" onClick={() => menuInput.current?.click()} disabled={menu.pending}>
              {menu.pending ? <CircleNotch size={20} weight="bold" className="animate-spin" aria-hidden="true" /> : <UploadSimple size={20} weight="bold" aria-hidden="true" />}
              Naloži meni kot datoteko
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
