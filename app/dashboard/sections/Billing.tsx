"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CheckCircle, CircleNotch, PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr";
import { requestMoreVenues } from "@/app/actions";
import { Button } from "@/app/ui/Button";
import { Field, Textarea } from "@/app/ui/Field";
import Icon3D, { type Icon3DName } from "@/app/ui/Icon3D";
import { PLANS, YEARLY_FREE_MONTHS, YEARLY_MONTHS } from "@/lib/plans";
import { count, dateShort } from "@/lib/sl";
import type { Billing as BillingData } from "../data";
import { Badge, Panel, SectionHead, Stepper, useAct, useToast } from "../parts";

const eur = (n: number) => n.toLocaleString("sl-SI", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const TIERS = [
  { key: "start" as const, desc: "Za en lokal.", points: ["1 lokacija", "Vse funkcije brez omejitev", "Neomejeno gostov in obiskov"] },
  { key: "grow" as const, desc: "Za več lokalov pod enim računom.", points: ["Do 5 lokacij", "Vse funkcije brez omejitev", "Ena naročnina za vse lokale"] },
];

// ── Demo obdobje: vse brezplačno, brez plačila (lib/demo.ts) ──────────────────
const DEMO_INCLUDED = [
  "Digitalna kartica zvestobe z nagradami",
  "Beleženje obiskov z računom ali stojalom",
  "Kolo dobrodošlice za nove goste",
  "Povabilo k oceni na Googlu",
  "Samodejna sporočila in kampanje",
  "Gostje, obiski in ocene na enem mestu",
];

const DEMO_RULES: { icon: Icon3DName; title: string; text: string }[] = [
  { icon: "veriga", title: "En račun, en lokal", text: "Več lokalov uredimo po dogovoru. Povpraševanje pošlješ spodaj." },
  { icon: "znacka", title: "Podpis Loyavi", text: "Na strani gosta, v sporočilih in na plakatu piše, da kartica teče prek Loyavi. Podpisa ni mogoče odstraniti." },
  { icon: "megafon", title: "Dve kampanji na teden", text: "Ena kampanja doseže do 400 gostov. Samodejna sporočila niso omejena." },
];

function DemoPlan({ billing }: { billing: BillingData }) {
  const { pending, run } = useAct();
  const [locations, setLocations] = useState(Math.max(2, billing.venueCount + 1));
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const approved = billing.maxVenues > 1;

  return (
    <>
      <SectionHead title="Demo paket" text="Loyavi je v demo obdobju. Vse funkcije so odprte in brezplačne, plačilne kartice ni treba vpisati." />

      <section className="on-brand atmo-brand relative flex flex-col gap-6 overflow-hidden rounded-3xl p-8 text-on-brand shadow-brand">
        <Icon3D name="paket" size={256} className="absolute -right-6 -top-6 size-36 drop-shadow-2xl sm:size-52 lg:size-64" />
        <p className="flex w-max items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-semibold text-brand-ink">
          <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
          Tvoj paket
        </p>
        <div className="flex flex-col gap-2">
          <p className="text-7xl font-semibold tracking-tight lg:text-8xl">0 €</p>
          <p className="text-base font-medium text-white/85">na mesec, dokler traja demo</p>
        </div>
        <ul className="grid gap-3 sm:max-w-md sm:grid-cols-1 lg:max-w-xl lg:grid-cols-2">
          {DEMO_INCLUDED.map((item) => (
            <li key={item} className="flex items-start gap-3 text-base font-medium">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-brand-ink">
                <Check size={12} weight="bold" aria-hidden="true" />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Kaj velja med demom">
          <ul className="flex flex-col gap-4">
            {DEMO_RULES.map((r) => (
              <li key={r.title} className="flex items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-tint">
                  <Icon3D name={r.icon} size={40} />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="text-base font-semibold text-fg">{r.title}</span>
                  <span className="text-sm text-mute">{r.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Kaj sledi po demu">
          <ul className="flex flex-col gap-4">
            {[
              { icon: "koledar" as Icon3DName, title: "Obvestilo vnaprej", text: "Datum konca dema in cenik ti sporočimo po elektronski pošti." },
              { icon: "scit" as Icon3DName, title: "Nič se ne zaračuna samodejno", text: "Plačilnih podatkov ne zbiramo. Plačljivo uporabo potrdiš sam." },
              { icon: "kartice" as Icon3DName, title: "Podatki ostanejo", text: "Gostje, žigi in kuponi so shranjeni, tudi če se za nadaljevanje ne odločiš takoj." },
            ].map((r) => (
              <li key={r.title} className="flex items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-tint">
                  <Icon3D name={r.icon} size={40} />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="text-base font-semibold text-fg">{r.title}</span>
                  <span className="text-sm text-mute">{r.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel
        title="Več lokalov ali veriga"
        text={
          approved
            ? `Tvoj račun ima odobrenih do ${billing.maxVenues} lokalov. Nov lokal dodaš v meniju z gumbom Dodaj lokal.`
            : "V demo obdobju ima en račun en lokal. Če jih imaš več, povej, koliko, in dostop uredimo po dogovoru."
        }
      >
        <p className="text-sm text-mute">
          Lokali na tvojem računu: <span className="font-mono text-fg">{billing.venueCount}</span>
          {approved ? ` od ${billing.maxVenues}` : ""}.
        </p>
        {sent ? (
          <p role="status" className="flex items-start gap-3 rounded-2xl bg-tint p-4 text-base text-fg">
            <CheckCircle size={24} weight="fill" className="shrink-0 text-brand-ink" aria-hidden="true" />
            Povpraševanje je poslano. Odgovorimo ti po elektronski pošti, običajno v enem delovnem dnevu.
          </p>
        ) : (
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              run(() => requestMoreVenues(billing.venueId, { locations, message }), "Povpraševanje je poslano.", () => setSent(true));
            }}
          >
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-mute">Koliko lokalov imaš skupaj</span>
              <Stepper value={locations} min={2} max={50} onChange={setLocations} label="Število lokalov" />
            </div>
            <Field label="Sporočilo (neobvezno)" hint="Na primer kraji lokalov ali kdaj bi želel začeti.">
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1000} />
            </Field>
            <div>
              <Button type="submit" size="lg" disabled={pending}>
                {pending ? <CircleNotch size={20} weight="bold" className="animate-spin" aria-hidden="true" /> : <PaperPlaneTilt size={20} weight="bold" aria-hidden="true" />}
                Pošlji povpraševanje
              </Button>
            </div>
          </form>
        )}
      </Panel>
    </>
  );
}

export default function Billing(props: { billing: BillingData; success: boolean }) {
  // demo obdobje: namesto cenika in plačila pokaži demo paket
  if (props.billing.access.state === "demo") return <DemoPlan billing={props.billing} />;
  return <PaidPlans {...props} />;
}

function PaidPlans({ billing, success }: { billing: BillingData; success: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [yearly, setYearly] = useState(billing.cycle === "yearly");
  const [busy, setBusy] = useState<string | null>(null);
  const { access, plan } = billing;
  const paid = access.state === "active" || access.state === "trialing";

  async function post(path: string, body: Record<string, string>, key: string) {
    setBusy(key);
    try {
      const r = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json();
      if (j.url) {
        window.location.href = j.url;
        return;
      }
      if (j.changed) {
        toast("Paket je spremenjen.");
        router.refresh();
      } else toast(j.error || "Ni uspelo. Poskusi znova.", "bad");
    } catch {
      toast("Povezava ni uspela. Poskusi znova.", "bad");
    }
    setBusy(null);
  }

  const status =
    access.state === "active"
      ? { title: `Paket ${PLANS[plan].label}`, text: billing.cancelAtPeriodEnd ? `Naročnina je preklicana in velja do ${access.until ? dateShort(access.until) : "konca obdobja"}.` : access.until ? `Naslednji obračun: ${dateShort(access.until)}.` : "Naročnina je aktivna." }
      : access.state === "trialing"
        ? { title: `Paket ${PLANS[plan].label}`, text: `Preizkusno obdobje traja še ${count(access.daysLeft, "dan")}.` }
        : access.state === "trial"
          ? { title: "Brezplačni preizkus", text: `Še ${count(access.daysLeft, "dan")}${access.until ? `, do ${dateShort(access.until)}` : ""}. Kartice ni treba vpisati, dokler ne izbereš paketa.` }
          : { title: "Preizkus se je iztekel", text: "Izberi paket, da gostje spet zbirajo žige. Vsi podatki so shranjeni." };

  return (
    <>
      <SectionHead title="Naročnina" text="Vsak paket vključuje vse funkcije, razlika je le v številu lokalov. Plačilo varno izvede naš partner Polar, račun prejmeš po elektronski pošti." />

      {success && (
        <p role="status" className="flex items-start gap-3 rounded-3xl bg-card shadow-card p-6 text-base text-fg">
          <CheckCircle size={24} weight="fill" className="shrink-0 text-brand-ink" aria-hidden="true" />
          Hvala. Plačilo je sprejeto, naročnina se aktivira v nekaj trenutkih.
        </p>
      )}

      <Panel
        title={status.title}
        text={status.text}
        action={
          billing.hasSubscription ? (
            <Button type="button" variant="secondary" size="sm" disabled={busy !== null} onClick={() => post("/api/billing/portal", { venueId: billing.venueId }, "portal")}>
              {busy === "portal" && <CircleNotch size={16} weight="bold" className="animate-spin" aria-hidden="true" />}
              Računi in plačilno sredstvo
            </Button>
          ) : undefined
        }
      >
        <p className="text-sm text-mute">
          Lokali na tvojem računu: <span className="font-mono text-fg">{billing.venueCount}</span>
          {paid && billing.maxVenues < 99 ? ` od ${billing.maxVenues}` : ""}.
        </p>
      </Panel>

      <div className="flex w-max max-w-full items-center gap-1 rounded-full border border-line bg-s1 p-1" role="group" aria-label="Obračun">
        {[
          { v: false, label: "Mesečno" },
          { v: true, label: `Letno, ${YEARLY_FREE_MONTHS} meseca brezplačno` },
        ].map((o) => (
          <button
            key={o.label}
            type="button"
            aria-pressed={yearly === o.v}
            onClick={() => setYearly(o.v)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-700 ease-spring ${yearly === o.v ? "bg-brand text-on-brand" : "text-mute hover:text-fg"}`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {TIERS.map((t) => {
          const monthly = PLANS[t.key].monthly ?? 0;
          const price = yearly ? (monthly * YEARLY_MONTHS) / 12 : monthly;
          const current = paid && plan === t.key && (billing.cycle === "yearly") === yearly;
          const tooSmall = t.key === "start" && billing.venueCount > 1;
          return (
            <div key={t.key} className={`flex flex-col gap-6 rounded-3xl border p-6 ${current ? "border-brand bg-tint" : "border-line bg-s1"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-semibold tracking-tight text-fg">{PLANS[t.key].label}</h2>
                  <p className="text-sm text-mute">{t.desc}</p>
                </div>
                {current && <Badge tone="brand">Trenutni paket</Badge>}
              </div>
              <div className="flex flex-col gap-1">
                <p className="flex items-baseline gap-2">
                  <span className="font-mono text-4xl font-semibold tracking-tight text-fg">{eur(price)} €</span>
                  <span className="text-sm text-mute">na mesec</span>
                </p>
                <p className="text-sm text-dim">{yearly ? `Obračun enkrat letno: ${eur(monthly * YEARLY_MONTHS)} €.` : "Obračun mesečno, brez vezave."}</p>
              </div>
              <ul className="flex flex-col gap-2">
                {t.points.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-sm text-fg">
                    <Check size={16} weight="bold" className="mt-0.5 shrink-0 text-brand-ink" aria-hidden="true" />
                    {p}
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                variant={current ? "secondary" : "primary"}
                size="lg"
                full
                className="mt-auto"
                disabled={current || tooSmall || busy !== null}
                onClick={() => post("/api/billing/checkout", { venueId: billing.venueId, plan: t.key, cycle: yearly ? "yearly" : "monthly" }, t.key)}
              >
                {busy === t.key && <CircleNotch size={20} weight="bold" className="animate-spin" aria-hidden="true" />}
                {current ? "Izbrano" : paid ? "Preklopi na ta paket" : "Izberi paket"}
              </Button>
              {tooSmall && <p className="text-sm text-dim">Imaš več lokalov, zato potrebuješ paket Veriga.</p>}
            </div>
          );
        })}
      </div>
      <p className="text-sm text-mute">Cene so brez DDV. Naročnino lahko kadar koli prekličeš, dostop ostane do konca plačanega obdobja. Več kot 5 lokacij? Piši nam na info@loyavi.app.</p>
    </>
  );
}
