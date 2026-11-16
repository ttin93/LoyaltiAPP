"use client";

import { ArrowRight, ChartBar, CheckCircle, Circle, Gift, Stamp, Star, UserPlus } from "@phosphor-icons/react/dist/ssr";
import { agoLabel, count, form, plural } from "@/lib/sl";
import type { DashData, Activity } from "../data";
import type { SectionKey } from "../keys";
import { Empty, Panel, SectionHead, Stat } from "../parts";

const dayLabel = (day: string) => {
  const [, m, d] = day.split("-").map(Number);
  return `${d}. ${m}.`;
};

/** Obiski po dnevih: en niz, zato brez legende. Lebdenje ali fokus pokaže točno vrednost. */
function VisitsChart({ daily }: { daily: { day: string; cnt: number }[] }) {
  const top = Math.max(1, ...daily.map((d) => d.cnt));
  const max = top > 1 && top % 2 ? top + 1 : top; // sodo, da je srednja oznaka osi točna
  const n = daily.length;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3">
        <div className="flex h-48 flex-col justify-between text-right font-mono text-xs text-dim" aria-hidden="true">
          <span>{max}</span>
          <span>{max > 1 ? max / 2 : ""}</span>
          <span>0</span>
        </div>
        <div className="relative h-48 flex-1">
          <div className="absolute inset-x-0 top-0 h-px bg-s3" aria-hidden="true" />
          <div className="absolute inset-x-0 top-1/2 h-px bg-s3" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-line" aria-hidden="true" />
          <div className="relative flex h-full items-end gap-0.5">
            {daily.map((d, i) => (
              <div key={d.day} tabIndex={0} aria-label={`${dayLabel(d.day)}: ${count(d.cnt, "obisk")}`} className="group relative flex h-full flex-1 items-end rounded outline-offset-0">
                <div
                  className={`w-full rounded-t transition-all duration-700 ease-spring ${d.cnt ? "bg-brand group-hover:bg-fg group-focus-visible:bg-fg" : "bg-s3"}`}
                  style={{ height: d.cnt ? `max(4px, ${(d.cnt / max) * 100}%)` : "2px" }}
                />
                <div
                  className={`pointer-events-none absolute bottom-full z-10 mb-2 hidden rounded-lg border border-line bg-s2 px-2 py-1 text-xs whitespace-nowrap text-fg group-hover:block group-focus-visible:block ${i < 4 ? "left-0" : i > n - 5 ? "right-0" : "left-1/2 -translate-x-1/2"}`}
                  role="tooltip"
                >
                  <span className="text-mute">{dayLabel(d.day)}</span> <span className="font-mono font-semibold">{d.cnt}</span> {form(d.cnt, "obisk")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-between pl-8 font-mono text-xs text-dim" aria-hidden="true">
        <span>{dayLabel(daily[0].day)}</span>
        <span>{dayLabel(daily[Math.floor(n / 2)].day)}</span>
        <span>danes</span>
      </div>
      <table className="sr-only">
        <caption>Obiski po dnevih v zadnjih 30 dneh</caption>
        <thead>
          <tr>
            <th>Dan</th>
            <th>Obiski</th>
          </tr>
        </thead>
        <tbody>
          {daily.map((d) => (
            <tr key={d.day}>
              <td>{dayLabel(d.day)}</td>
              <td>{d.cnt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const ACT_ICON = { visit: Stamp, coupon: Gift, review: Star, join: UserPlus } as const;

function ActivityList({ items }: { items: Activity[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((a) => {
        const I = ACT_ICON[a.kind];
        return (
          <li key={a.id} className="flex items-center gap-3 rounded-2xl bg-s2 p-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-s3 text-mute">
              <I size={16} weight="bold" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-fg">{a.title}</span>
              <span className="block truncate text-xs text-dim">{a.who}</span>
            </span>
            <span className="shrink-0 text-xs text-dim">{agoLabel(a.when)}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default function Overview({ data, isNew, go }: { data: DashData; isNew: boolean; go: (s: SectionKey) => void }) {
  const { venue, stats } = data;
  const needsReceipt = venue.meta.checkin !== "stand";
  const needsStand = venue.meta.checkin !== "receipt";

  const steps: { done: boolean; title: string; text: string; to: SectionKey }[] = [
    { done: true, title: "Kartica je pripravljena", text: `${venue.goal} obiskov za nagrado: ${venue.reward}.`, to: "kartica" },
    ...(needsReceipt
      ? [{ done: !!venue.davcna, title: "Vklopi skeniranje računov", text: "Skeniraj en svoj račun, da prepoznamo tvojo davčno številko.", to: "obiski" as SectionKey }]
      : []),
    ...(needsStand ? [{ done: stats.guests > 0, title: "Postavi kodo QR na pult", text: "Natisni plakat ali zapiši povezavo na nalepko NFC.", to: "obiski" as SectionKey }] : []),
    { done: !!venue.googleReviewUrl, title: "Dodaj povezavo do ocen na Googlu", text: "Zadovoljni gostje bodo po obisku povabljeni k oceni.", to: "ocene" },
    { done: stats.guests > 0, title: "Pridobi prvega gosta", text: "Odpri svojo stran kot gost in preizkusi celoten postopek.", to: "obiski" },
  ];
  const setupDone = steps.every((s) => s.done);

  const diff = stats.visits30 - stats.visitsPrev30;
  const visitsNote =
    stats.visits30 === 0 && stats.visitsPrev30 === 0 ? "Še brez obiskov" : diff > 0 ? `${diff} več kot v prejšnjih 30 dneh` : diff < 0 ? `${-diff} manj kot v prejšnjih 30 dneh` : "Enako kot v prejšnjih 30 dneh";
  const listed = data.guests.length;
  const returningPct = listed ? Math.round((stats.returning / listed) * 100) : 0;

  return (
    <>
      <SectionHead title={isNew ? "Lokal je ustvarjen" : venue.name} text={isNew ? "Še nekaj kratkih korakov in tvoji gostje lahko začnejo zbirati žige." : "Kaj se dogaja v tvojem lokalu v zadnjih 30 dneh."} />

      {!setupDone && (
        <Panel title="Prvi koraki" text="Ko so vsi koraki opravljeni, ta seznam izgine.">
          <ol className="flex flex-col gap-2">
            {steps.map((s) => (
              <li key={s.title}>
                <button
                  type="button"
                  onClick={() => go(s.to)}
                  className="group flex w-full items-center gap-4 rounded-2xl bg-s2 p-4 text-left transition-all duration-700 ease-spring hover:bg-s3 active:scale-[0.98]"
                >
                  {s.done ? <CheckCircle size={24} weight="fill" className="shrink-0 text-brand-ink" aria-hidden="true" /> : <Circle size={24} className="shrink-0 text-dim" aria-hidden="true" />}
                  <span className="min-w-0 flex-1">
                    <span className={`block text-base font-semibold tracking-tight ${s.done ? "text-mute" : "text-fg"}`}>{s.title}</span>
                    <span className="block text-sm text-mute">{s.text}</span>
                  </span>
                  <span className="sr-only">{s.done ? "Opravljeno" : "Odpri"}</span>
                  <ArrowRight size={16} weight="bold" className="shrink-0 text-dim transition-all duration-700 ease-spring group-hover:translate-x-1 group-hover:text-fg" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ol>
        </Panel>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Gostje" value={String(stats.guests)} note={stats.guestsNew30 ? `${stats.guestsNew30} ${plural(stats.guestsNew30, ["nov", "nova", "novi", "novih"])} v 30 dneh` : "Brez novih v 30 dneh"} />
        <Stat label="Obiski v 30 dneh" value={String(stats.visits30)} note={visitsNote} />
        <Stat label="Gostje, ki se vračajo" value={`${returningPct} %`} note={listed ? `${stats.returning} od ${listed} z vsaj dvema obiskoma` : "Še brez gostov"} />
        <Stat label="Prevzete nagrade" value={String(stats.redeemed)} note={stats.openCoupons ? `${count(stats.openCoupons, "kupon")} ${plural(stats.openCoupons, ["čaka", "čakata", "čakajo", "čaka"])} na prevzem` : "Noben kupon ne čaka"} />
      </div>

      <Panel title="Obiski po dnevih" text="Vsak stolpec je en dan. Šteje vsak potrjen obisk, z računom ali s stojalom.">
        {stats.visits30 > 0 ? (
          <VisitsChart daily={data.daily} />
        ) : (
          <Empty icon={<ChartBar size={24} aria-hidden="true" />} title="Tukaj bo graf obiskov" text="Prikaže se, ko prvi gost zabeleži obisk." />
        )}
      </Panel>

      <Panel title="Zadnje dogajanje">
        {data.activity.length ? <ActivityList items={data.activity} /> : <Empty icon={<Stamp size={24} aria-hidden="true" />} title="Še ni dogajanja" text="Novi gostje, obiski, nagrade in ocene se bodo izpisovali tukaj." />}
      </Panel>
    </>
  );
}
