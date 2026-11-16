"use client";

import { useState } from "react";
import { CircleNotch, Plus, Trash } from "@phosphor-icons/react/dist/ssr";
import { saveWheel } from "@/app/actions";
import { Button } from "@/app/ui/Button";
import { Input, Toggle } from "@/app/ui/Field";
import { Wheel } from "@/app/ui/WheelSheet";
import type { DashVenue } from "../data";
import { Panel, SectionHead, useAct } from "../parts";

type Seg = { id: number; label: string; weight: number };

export default function WheelSection({ venue }: { venue: DashVenue }) {
  const [enabled, setEnabled] = useState(venue.wheel.enabled !== false);
  const [segs, setSegs] = useState<Seg[]>(() => venue.wheel.segments.map((s, i) => ({ id: i, label: s.label, weight: Math.max(1, Math.min(10, Math.round(s.weight) || 1)) })));
  const [dirty, setDirty] = useState(false);
  const save = useAct();

  const total = segs.reduce((a, s) => a + s.weight, 0) || 1;
  const valid = segs.filter((s) => s.label.trim()).length >= 2;
  const touch = () => setDirty(true);
  const patch = (id: number, p: Partial<Seg>) => {
    setSegs((list) => list.map((s) => (s.id === id ? { ...s, ...p } : s)));
    touch();
  };

  return (
    <>
      <SectionHead title="Kolo dobrodošlice" text="Nov gost kolo zavrti enkrat, takoj ko doda tvojo kartico. Nagrado prevzame ob prvem potrjenem obisku, zato vsak zadetek pomeni prihod v lokal." />

      <Panel
        title={enabled ? "Kolo je vključeno" : "Kolo je izključeno"}
        text={enabled ? "Če ga izključiš, novi gostje dobijo samo kartico." : "Novi gostje trenutno dobijo samo kartico."}
        action={
          <Toggle
            checked={enabled}
            onChange={(v) => {
              setEnabled(v);
              touch();
            }}
            label="Kolo dobrodošlice"
          />
        }
      >
        {null}
      </Panel>

      <div className={`grid items-start gap-8 lg:grid-cols-2 ${enabled ? "" : "opacity-40"}`}>
        <Panel title="Nagrade" text="Od 2 do 8 polj. Večja utež pomeni, da polje zadene pogosteje.">
          <ul className="flex flex-col gap-2">
            {segs.map((s) => (
              <li key={s.id} className="flex items-center gap-2 rounded-2xl bg-s2 p-2">
                <Input value={s.label} onChange={(e) => patch(s.id, { label: e.target.value })} maxLength={28} aria-label="Ime nagrade" placeholder="Ime nagrade" className="min-w-0 flex-1 border-transparent bg-transparent px-2 py-2" />
                <label className="flex shrink-0 items-center gap-2 text-xs text-mute">
                  <span className="sr-only">Utež</span>
                  <select
                    value={s.weight}
                    onChange={(e) => patch(s.id, { weight: Number(e.target.value) })}
                    className="rounded-lg border border-line bg-s3 px-2 py-2 font-mono text-sm text-fg outline-none transition-all duration-700 ease-spring focus:border-brand"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <span className="w-10 text-right font-mono">{Math.round((s.weight / total) * 100)} %</span>
                </label>
                <button
                  type="button"
                  aria-label={`Odstrani ${s.label || "polje"}`}
                  disabled={segs.length <= 2}
                  onClick={() => {
                    setSegs((list) => list.filter((x) => x.id !== s.id));
                    touch();
                  }}
                  className="flex size-10 shrink-0 items-center justify-center rounded-lg text-mute transition-all duration-700 ease-spring hover:bg-s3 hover:text-bad active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
                >
                  <Trash size={16} weight="bold" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={segs.length >= 8}
              onClick={() => {
                setSegs((list) => [...list, { id: Math.max(0, ...list.map((x) => x.id)) + 1, label: "", weight: 2 }]);
                touch();
              }}
            >
              <Plus size={16} weight="bold" aria-hidden="true" />
              Dodaj polje
            </Button>
            {!valid && <span className="text-sm text-bad">Kolo potrebuje vsaj dve poimenovani polji.</span>}
          </div>
        </Panel>

        <div className="flex flex-col gap-4 lg:sticky lg:top-12">
          <div className="rounded-3xl border border-line bg-s1 p-6">
            <Wheel labels={segs.map((s) => s.label.trim() || "Nagrada")} rotation={0} winner={null} />
          </div>
          <p className="text-sm text-mute">Predogled. Zmagovalno polje vedno izbere strežnik, zato izida ni mogoče ponoviti ali izsiliti.</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          size="lg"
          disabled={!dirty || !valid || save.pending}
          onClick={() =>
            save.run(
              () => saveWheel(venue.id, { enabled, mode: "weighted", winner: 0, segments: segs.filter((s) => s.label.trim()).map((s) => ({ label: s.label.trim(), weight: s.weight })) }),
              "Kolo je shranjeno.",
              () => setDirty(false),
            )
          }
        >
          {save.pending && <CircleNotch size={20} weight="bold" className="animate-spin" aria-hidden="true" />}
          Shrani kolo
        </Button>
        {dirty && <span className="text-sm text-mute">Imaš neshranjene spremembe.</span>}
      </div>
    </>
  );
}
