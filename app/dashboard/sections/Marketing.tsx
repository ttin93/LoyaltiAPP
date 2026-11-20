"use client";

import { useMemo, useState } from "react";
import { CheckCircle, CircleNotch, ClockCounterClockwise, PaperPlaneTilt, Warning } from "@phosphor-icons/react/dist/ssr";
import { saveAutomations, sendCampaign, type Segment } from "@/app/actions";
import { Button } from "@/app/ui/Button";
import { Field, Input, Select, Textarea, Toggle } from "@/app/ui/Field";
import Sheet from "@/app/ui/Sheet";
import { MONTHS, count, dateTimeShort, daysAgo } from "@/lib/sl";
import type { Automation, Automations } from "@/lib/types";
import type { DashData } from "../data";
import { Badge, Chip, Empty, Panel, SectionHead, useAct, useToast } from "../parts";

type AutoKey = "inactive" | "guest_birthday" | "anniversary" | "venue_birthday";

const AUTOS: { key: AutoKey; title: string; text: string; message: string; couponName: string; days?: number; date?: boolean }[] = [
  { key: "inactive", title: "Pogrešamo te", text: "Gost, ki ga nekaj časa ni bilo, dobi povabilo nazaj.", message: "Nekaj časa te ni bilo pri nas. Pridi spet, ob naslednjem obisku te čaka presenečenje.", couponName: "Popust 10 %", days: 30 },
  { key: "guest_birthday", title: "Rojstni dan gosta", text: "Na rojstni dan gost prejme voščilo. Datum vpiše sam v svojem profilu.", message: "Vse najboljše. Ob prazniku te pri nas čaka darilo.", couponName: "Darilo za rojstni dan" },
  { key: "anniversary", title: "Obletnica", text: "Eno leto po tem, ko je gost dodal tvojo kartico, se mu zahvališ.", message: "Minilo je eno leto, odkar zbiraš žige pri nas. Hvala, da se vračaš.", couponName: "Darilo ob obletnici" },
  { key: "venue_birthday", title: "Praznik lokala", text: "Na izbrani datum vsi gostje prejmejo tvojo posebno ponudbo.", message: "Danes praznujemo in to želimo deliti s tabo.", couponName: "Praznična ponudba", date: true },
];

const KIND_LABEL: Record<string, string> = {
  welcome: "Dobrodošlica",
  points: "Potrjen obisk",
  coupon_earned: "Polna kartica",
  review_thanks: "Zahvala za oceno",
  we_miss_you: "Pogrešamo te",
  anniversary: "Obletnica",
  birthday_guest: "Rojstni dan gosta",
  birthday_venue: "Praznik lokala",
  campaign: "Sporočilo gostom",
  admin_expiring: "Opomnik o naročnini",
};

function defaults(saved: Automations): Record<AutoKey, Automation> {
  const out = {} as Record<AutoKey, Automation>;
  for (const a of AUTOS) {
    const s = saved[a.key];
    out[a.key] = {
      enabled: !!s?.enabled,
      message: s?.message || a.message,
      coupon: s ? !!s.coupon : true,
      couponName: s?.couponName || a.couponName,
      ...(a.days ? { days: s?.days || a.days } : {}),
      ...(a.date ? { date: s?.date || "" } : {}),
    };
  }
  return out;
}

function Automatic({ data }: { data: DashData }) {
  const { venue } = data;
  const [autos, setAutos] = useState(() => defaults(venue.automations));
  const [dirty, setDirty] = useState(false);
  const save = useAct();
  const set = (k: AutoKey, patch: Partial<Automation>) => {
    setAutos((p) => ({ ...p, [k]: { ...p[k], ...patch } }));
    setDirty(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <Panel title="Vedno vključeno" text="Ta sporočila pošljemo samodejno, ker so del osnovne izkušnje.">
        <ul className="grid gap-2 lg:grid-cols-2">
          {[
            ["Dobrodošlica", "Ko gost prvič doda tvojo kartico."],
            ["Polna kartica", "Ko gost zbere vse žige in dobi kupon."],
          ].map(([t, d]) => (
            <li key={t} className="flex items-start gap-3 rounded-2xl bg-s2 p-4">
              <CheckCircle size={20} weight="fill" className="mt-0.5 shrink-0 text-brand-ink" aria-hidden="true" />
              <span>
                <span className="block text-sm font-semibold text-fg">{t}</span>
                <span className="block text-sm text-mute">{d}</span>
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      {AUTOS.map((a) => {
        const v = autos[a.key];
        const [mm, dd] = (v.date || "").split("-");
        return (
          <Panel key={a.key} title={a.title} text={a.text} action={<Toggle checked={v.enabled} onChange={(on) => set(a.key, { enabled: on })} label={a.title} />}>
            {v.enabled && (
              <div className="flex flex-col gap-4">
                {a.days !== undefined && (
                  <Field label="Po koliko dneh brez obiska" hint="Med 7 in 365 dni. Vsak gost prejme sporočilo največ enkrat na 30 dni.">
                    <Input type="number" min={7} max={365} value={v.days ?? a.days} onChange={(e) => set(a.key, { days: Number(e.target.value) })} className="max-w-32 font-mono" />
                  </Field>
                )}
                {a.date && (
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-mute">Datum praznika</span>
                    <div className="grid max-w-sm grid-cols-2 gap-2">
                      <Select aria-label="Dan" value={dd || ""} onChange={(e) => set(a.key, { date: `${mm || "01"}-${e.target.value || "01"}` })}>
                        <option value="">Dan</option>
                        {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0")).map((d) => (
                          <option key={d} value={d}>
                            {Number(d)}.
                          </option>
                        ))}
                      </Select>
                      <Select aria-label="Mesec" value={mm || ""} onChange={(e) => set(a.key, { date: `${e.target.value || "01"}-${dd || "01"}` })}>
                        <option value="">Mesec</option>
                        {MONTHS.map((m, i) => (
                          <option key={m} value={String(i + 1).padStart(2, "0")}>
                            {m}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                )}
                <Field label="Sporočilo">
                  <Textarea value={v.message} onChange={(e) => set(a.key, { message: e.target.value })} maxLength={600} />
                </Field>
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-s2 p-4">
                  <span>
                    <span className="block text-sm font-semibold text-fg">Priloži kupon</span>
                    <span className="block text-sm text-mute">Gost ga dobi v denarnico in prevzame ob obisku. Velja 30 dni.</span>
                  </span>
                  <Toggle checked={v.coupon} onChange={(on) => set(a.key, { coupon: on })} label="Priloži kupon" />
                </div>
                {v.coupon && (
                  <Field label="Kaj gost dobi">
                    <Input value={v.couponName} onChange={(e) => set(a.key, { couponName: e.target.value })} maxLength={60} />
                  </Field>
                )}
              </div>
            )}
          </Panel>
        );
      })}

      <div className="flex items-center gap-3">
        <Button type="button" size="lg" disabled={!dirty || save.pending} onClick={() => save.run(() => saveAutomations(venue.id, autos), "Samodejna sporočila so shranjena.", () => setDirty(false))}>
          {save.pending && <CircleNotch size={20} weight="bold" className="animate-spin" aria-hidden="true" />}
          Shrani
        </Button>
        {dirty && <span className="text-sm text-mute">Imaš neshranjene spremembe.</span>}
      </div>
    </div>
  );
}

function Campaign({ data }: { data: DashData }) {
  const { venue, guests } = data;
  const toast = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [segment, setSegment] = useState<Segment>("all");
  const [couponName, setCouponName] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<{ sent: number; failed: number } | null>(null);

  const sizes = useMemo(() => {
    const list = guests.filter((g) => g.marketing); // samo gostje, ki so dovolili ponudbe
    const active = list.filter((g) => g.lastVisit && daysAgo(g.lastVisit) <= 30).length;
    return { all: list.length, active, inactive: list.length - active, close: list.filter((g) => venue.goal - g.stamps <= 2).length };
  }, [guests, venue.goal]);
  const size = sizes[segment];
  const ready = subject.trim() && message.trim() && size > 0 && data.emailReady;

  async function send() {
    setSending(true);
    try {
      const r = await sendCampaign(venue.id, { subject, message, segment, couponName });
      if (r.ok) {
        setDone({ sent: r.sent, failed: r.failed });
        setSubject("");
        setMessage("");
        setCouponName("");
      } else toast(r.error, "bad");
    } catch {
      toast("Povezava ni uspela. Poskusi znova.", "bad");
    }
    setSending(false);
    setConfirm(false);
  }

  return (
    <Panel title="Novo sporočilo" text="Enkratno sporočilo po elektronski pošti. Pošlji novico, vabilo na dogodek ali ponudbo.">
      {!data.emailReady && (
        <p role="alert" className="flex items-start gap-3 rounded-2xl bg-s2 p-4 text-sm text-mute">
          <Warning size={20} weight="fill" className="mt-0.5 shrink-0 text-warn" aria-hidden="true" />
          Pošiljanje pošte še ni nastavljeno. Piši nam na info@loyavi.app in ga vklopimo.
        </p>
      )}
      {done && (
        <p role="status" className="flex items-start gap-3 rounded-2xl bg-s2 p-4 text-sm text-fg">
          <CheckCircle size={20} weight="fill" className="mt-0.5 shrink-0 text-brand-ink" aria-hidden="true" />
          Poslano: {done.sent}. {done.failed ? `Neuspelo: ${done.failed}.` : "Vsa sporočila so bila oddana."}
        </p>
      )}
      <p className="rounded-2xl bg-s2 p-4 text-sm text-mute">
        Ponudbe prejmejo samo gostje, ki so jih ob prijavi dovolili: <span className="font-semibold text-fg">{sizes.all} od {guests.length}</span>. Tako zahteva zakon, vsako sporočilo pa ima tudi povezavo za odjavo.
      </p>
      <Field label="Komu">
        <Select value={segment} onChange={(e) => setSegment(e.target.value as Segment)}>
          <option value="all">Vsi gostje ({sizes.all})</option>
          <option value="active">Aktivni v zadnjih 30 dneh ({sizes.active})</option>
          <option value="inactive">Neaktivni več kot 30 dni ({sizes.inactive})</option>
          <option value="close">Blizu nagrade ({sizes.close})</option>
        </Select>
      </Field>
      <Field label="Zadeva">
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={120} placeholder="V soboto odpiramo teraso" />
      </Field>
      <Field label="Sporočilo">
        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} className="min-h-40" placeholder="Napiši, kot bi gostu povedal osebno." />
      </Field>
      <Field label="Kupon (neobvezno)" hint="Če vpišeš ime, vsak prejemnik dobi kupon v denarnico. Velja 30 dni.">
        <Input value={couponName} onChange={(e) => setCouponName(e.target.value)} maxLength={60} placeholder="Brezplačna kava" />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" size="lg" disabled={!ready} onClick={() => setConfirm(true)}>
          <PaperPlaneTilt size={20} weight="bold" aria-hidden="true" />
          Nadaljuj
        </Button>
        <span className="text-sm text-mute">{size > 0 ? `Sporočilo prejme ${count(size, "gost")}.` : "V izbrani skupini ni gostov."}</span>
      </div>

      <Sheet open={confirm} onClose={() => !sending && setConfirm(false)} title="Pošljem sporočilo?" dismissable={!sending}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 rounded-2xl bg-s2 p-4">
            <p className="text-sm font-semibold text-fg">{subject}</p>
            <p className="line-clamp-4 text-sm whitespace-pre-line text-mute">{message}</p>
            {couponName.trim() && <Badge tone="brand">Kupon: {couponName.trim()}</Badge>}
          </div>
          <p className="text-sm text-mute">Sporočilo prejme {count(size, "gost")}. Pošiljanja ni mogoče preklicati.</p>
          <div className="flex flex-col gap-3">
            <Button type="button" size="lg" full onClick={send} disabled={sending}>
              {sending && <CircleNotch size={20} weight="bold" className="animate-spin" aria-hidden="true" />}
              {sending ? "Pošiljam" : "Pošlji zdaj"}
            </Button>
            <Button type="button" variant="secondary" size="lg" full onClick={() => setConfirm(false)} disabled={sending}>
              Nazaj na urejanje
            </Button>
          </div>
        </div>
      </Sheet>
    </Panel>
  );
}

function Log({ data }: { data: DashData }) {
  return (
    <Panel title="Dnevnik" text="Zadnjih 100 poslanih sporočil.">
      {data.emailLog.length === 0 ? (
        <Empty icon={<ClockCounterClockwise size={24} aria-hidden="true" />} title="Še ni poslanih sporočil" text="Ko gost prejme prvo sporočilo, se zapis pojavi tukaj." />
      ) : (
        <ul className="flex flex-col gap-2">
          {data.emailLog.map((l) => (
            <li key={l.id} className="flex items-center justify-between gap-4 rounded-2xl bg-s2 p-3">
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-fg">{KIND_LABEL[l.kind] ?? "Sporočilo"}</span>
                <span className="block truncate text-xs text-dim">{l.email ?? "Več prejemnikov"}</span>
              </span>
              <span className="shrink-0 font-mono text-xs text-mute">{dateTimeShort(l.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export default function Marketing({ data }: { data: DashData }) {
  const [tab, setTab] = useState<"auto" | "new" | "log">("auto");
  return (
    <>
      <SectionHead title="Marketing" text="Sporočila, ki goste pripeljejo nazaj. Samodejna nastaviš enkrat, enkratna pošlješ po potrebi." />
      <div className="flex gap-2 overflow-x-auto" role="group" aria-label="Pogled">
        <Chip active={tab === "auto"} onClick={() => setTab("auto")}>
          Samodejna sporočila
        </Chip>
        <Chip active={tab === "new"} onClick={() => setTab("new")}>
          Novo sporočilo
        </Chip>
        <Chip active={tab === "log"} onClick={() => setTab("log")}>
          Dnevnik
        </Chip>
      </div>
      {tab === "auto" && <Automatic data={data} />}
      {tab === "new" && <Campaign data={data} />}
      {tab === "log" && <Log data={data} />}
    </>
  );
}
