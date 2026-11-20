"use client";

import { useCallback, useState } from "react";
import { ArrowsClockwise, Camera, Check, CheckCircle, CircleNotch, ContactlessPayment, DownloadSimple, Printer, Receipt, Warning } from "@phosphor-icons/react/dist/ssr";
import { activateScanning, regenerateStandKey, saveVenue, setDavcna } from "@/app/actions";
import { Button, buttonClass } from "@/app/ui/Button";
import { Field, Input } from "@/app/ui/Field";
import Scanner from "@/app/ui/Scanner";
import Sheet from "@/app/ui/Sheet";
import type { CheckinMode } from "@/lib/venueMeta";
import type { DashVenue } from "../data";
import { CopyField, Panel, SectionHead, useAct, useToast } from "../parts";

const MODES: { key: CheckinMode; icon: typeof Receipt; title: string; text: string }[] = [
  { key: "receipt", icon: Receipt, title: "Fiskalni račun", text: "Gost skenira kodo QR na računu. Žig samo ob resničnem nakupu." },
  { key: "stand", icon: ContactlessPayment, title: "Stojalo ob blagajni", text: "Gost skenira kodo na pultu ali približa telefon. En žig na dan." },
  { key: "both", icon: Check, title: "Oboje", text: "Gost izbere, kar mu je lažje." },
];

function Qr({ svg, label }: { svg: string; label: string }) {
  return <div role="img" aria-label={label} className="size-40 shrink-0 rounded-2xl bg-white p-4 [&>svg]:block [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: svg }} />;
}

function QrActions({ url, file, poster }: { url: string; file: string; poster: string }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  async function download() {
    setBusy(true);
    try {
      const QRCode = (await import("qrcode")).default;
      const data = await QRCode.toDataURL(url, { width: 1024, margin: 2, errorCorrectionLevel: "M" });
      const a = document.createElement("a");
      a.href = data;
      a.download = `${file}.png`;
      a.click();
    } catch {
      toast("Slike ni bilo mogoče pripraviti. Poskusi znova.", "bad");
    }
    setBusy(false);
  }
  return (
    <div className="flex flex-wrap gap-2">
      <a href={poster} target="_blank" rel="noreferrer" className={buttonClass("primary", "sm")}>
        <Printer size={16} weight="bold" aria-hidden="true" />
        Natisni plakat
      </a>
      <Button type="button" variant="secondary" size="sm" onClick={download} disabled={busy}>
        {busy ? <CircleNotch size={16} weight="bold" className="animate-spin" aria-hidden="true" /> : <DownloadSimple size={16} weight="bold" aria-hidden="true" />}
        Prenesi PNG
      </Button>
    </div>
  );
}

export default function Checkin({ venue }: { venue: DashVenue }) {
  const mode = venue.meta.checkin;
  const toast = useToast();
  const modeAct = useAct();
  const dav = useAct();
  const regen = useAct();
  const [scanning, setScanning] = useState(false);
  const [manual, setManual] = useState(venue.davcna ?? "");
  const [confirmRegen, setConfirmRegen] = useState(false);

  const onScan = useCallback(
    async (text: string) => {
      setScanning(false);
      try {
        const r = await activateScanning(venue.id, text);
        toast(r.ok ? `Skeniranje je vključeno. Davčna številka: ${r.davcna}.` : r.error, r.ok ? "ok" : "bad");
      } catch {
        toast("Povezava ni uspela. Poskusi znova.", "bad");
      }
    },
    [venue.id, toast],
  );

  return (
    <>
      <SectionHead title="Obiski in koda QR" text="Izberi, kako gostje zabeležijo obisk, in pripravi kode za svoj lokal." />

      <Panel title="Način beleženja obiskov">
        <div className="grid gap-3 lg:grid-cols-3" role="radiogroup" aria-label="Način beleženja obiskov">
          {MODES.map((m) => {
            const on = mode === m.key;
            return (
              <button
                key={m.key}
                type="button"
                role="radio"
                aria-checked={on}
                disabled={modeAct.pending}
                onClick={() => !on && modeAct.run(() => saveVenue(venue.id, { checkin: m.key }), "Način je shranjen.")}
                className={`flex flex-col gap-3 rounded-2xl border p-4 text-left transition-all duration-700 ease-spring active:scale-[0.98] ${on ? "border-brand bg-tint" : "border-line bg-s2 hover:bg-s3"}`}
              >
                <span className={`flex size-12 items-center justify-center rounded-xl ${on ? "bg-brand text-on-brand" : "bg-s3 text-mute"}`}>
                  <m.icon size={24} weight="bold" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-lg font-semibold tracking-tight text-fg">{m.title}</span>
                  <span className="block text-sm text-mute">{m.text}</span>
                </span>
              </button>
            );
          })}
        </div>
      </Panel>

      {mode !== "stand" && (
        <Panel title="Skeniranje računov" text={`Žig velja samo za račun tvojega lokala, ki ni starejši od ${venue.scanWindowHours} ur. Vsak račun šteje enkrat.${venue.meta.dailyLimit ? " Gost dobi največ en žig na dan." : ""}`}>
          {venue.davcna ? (
            <p className="flex items-start gap-3 rounded-2xl bg-s2 p-4 text-sm text-fg">
              <CheckCircle size={20} weight="fill" className="mt-0.5 shrink-0 text-brand-ink" aria-hidden="true" />
              <span>
                Skeniranje je vključeno. Sprejemamo račune z davčno številko <span className="font-mono font-semibold">{venue.davcna}</span>.
              </span>
            </p>
          ) : (
            <p role="alert" className="flex items-start gap-3 rounded-2xl bg-s2 p-4 text-sm text-fg">
              <Warning size={20} weight="fill" className="mt-0.5 shrink-0 text-warn" aria-hidden="true" />
              Skeniranje še ni vključeno. Skeniraj kateri koli račun iz svoje blagajne, da prepoznamo tvojo davčno številko.
            </p>
          )}
          <div>
            <Button type="button" size="lg" onClick={() => setScanning(true)}>
              <Camera size={20} weight="bold" aria-hidden="true" />
              {venue.davcna ? "Skeniraj drug račun" : "Skeniraj svoj račun"}
            </Button>
          </div>
          <form
            className="flex max-w-xs flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              dav.run(() => setDavcna(venue.id, manual), "Davčna številka je shranjena.");
            }}
          >
            <Field label="Ali vpiši davčno številko ročno" hint="8 števk, brez predpone SI.">
              <Input value={manual} onChange={(e) => setManual(e.target.value.replace(/\D/g, "").slice(0, 8))} inputMode="numeric" placeholder="12345678" className="font-mono" />
            </Field>
            <div>
              <Button type="submit" variant="secondary" size="sm" disabled={dav.pending || manual === (venue.davcna ?? "") || (manual.length !== 8 && manual.length !== 0)}>
                {dav.pending && <CircleNotch size={16} weight="bold" className="animate-spin" aria-hidden="true" />}
                Shrani številko
              </Button>
            </div>
          </form>
        </Panel>
      )}

      {mode !== "receipt" && (
        <Panel title="Stojalo ob blagajni" text="Kodo postavi tja, kjer gost plača. Kdor jo skenira ali približa telefon nalepki NFC, dobi žig, največ enkrat na dan.">
          <div className="flex flex-col gap-6 lg:flex-row">
            <Qr svg={venue.standQr} label="Koda QR za stojalo" />
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <QrActions url={venue.standUrl} file={`loyavi-stojalo-${venue.code}`} poster={`/dashboard/plakat?v=${venue.id}&t=stojalo`} />
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-mute">Povezava za nalepko NFC</span>
                <CopyField value={venue.standUrl} label="Povezava za nalepko NFC" />
                <span className="text-sm text-dim">Na nalepko jo zapišeš z brezplačno aplikacijo, na primer NFC Tools. Izberi zapis vrste URL.</span>
              </div>
              <div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmRegen(true)}>
                  <ArrowsClockwise size={16} weight="bold" aria-hidden="true" />
                  Zamenjaj kodo stojala
                </Button>
              </div>
            </div>
          </div>
        </Panel>
      )}

      <Panel title="Povezava do tvoje kartice" text="Deli jo na družbenih omrežjih, v opisu profila ali na vratih. Gost s to povezavo doda kartico, obisk pa zabeleži v lokalu.">
        <div className="flex flex-col gap-6 lg:flex-row">
          <Qr svg={venue.pageQr} label="Koda QR do kartice lokala" />
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <QrActions url={venue.pageUrl} file={`loyavi-kartica-${venue.code}`} poster={`/dashboard/plakat?v=${venue.id}&t=kartica`} />
            <CopyField value={venue.pageUrl} label="Povezava do kartice" />
          </div>
        </div>
      </Panel>

      {scanning && <Scanner title="Skeniraj svoj račun" onResult={onScan} onClose={() => setScanning(false)} />}

      <Sheet open={confirmRegen} onClose={() => setConfirmRegen(false)} title="Zamenjam kodo stojala?">
        <div className="flex flex-col gap-6">
          <p className="text-base text-mute">Stare natisnjene kode in nalepke NFC bodo prenehale delovati. To naredi, če sumiš, da kodo nekdo uporablja zunaj lokala.</p>
          <div className="flex flex-col gap-3">
            <Button type="button" variant="danger" size="lg" full disabled={regen.pending} onClick={() => regen.run(() => regenerateStandKey(venue.id), "Koda je zamenjana. Natisni novo.", () => setConfirmRegen(false))}>
              {regen.pending && <CircleNotch size={20} weight="bold" className="animate-spin" aria-hidden="true" />}
              Zamenjaj kodo
            </Button>
            <Button type="button" variant="secondary" size="lg" full onClick={() => setConfirmRegen(false)}>
              Prekliči
            </Button>
          </div>
        </div>
      </Sheet>
    </>
  );
}
