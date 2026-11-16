"use client";

import { useActionState, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CircleNotch, ContactlessPayment, Minus, Plus, Receipt } from "@phosphor-icons/react/dist/ssr";
import { createVenue, type CreateVenueState } from "./actions";
import Logo from "@/app/ui/Logo";
import { Button } from "@/app/ui/Button";
import { Field, Input, Select } from "@/app/ui/Field";
import LoyaltyCard from "@/app/ui/LoyaltyCard";
import { CATEGORIES, categoryDefaultReward, type CategoryKey } from "@/lib/categories";
import type { CheckinMode } from "@/lib/venueMeta";

export const CARD_COLORS = ["#1F8BF5", "#E63F26", "#FFC533", "#18B56B", "#7B5CFF", "#FF7FB2", "#0B1826", "#F1ECE2"];

const MODES: { key: CheckinMode; icon: typeof Receipt; title: string; text: string }[] = [
  { key: "receipt", icon: Receipt, title: "Fiskalni račun", text: "Gost skenira kodo QR na računu. Žig samo ob resničnem nakupu." },
  { key: "stand", icon: ContactlessPayment, title: "Stojalo ob blagajni", text: "Gost približa telefon ali skenira kodo na pultu. En žig na dan." },
  { key: "both", icon: Check, title: "Oboje", text: "Gost izbere, kar mu je lažje. Priporočamo za začetek." },
];

const STEPS = ["Lokal", "Kartica", "Obiski"];

export default function Onboarding({ signOut }: { signOut: () => Promise<void> }) {
  const [state, action, pending] = useActionState<CreateVenueState, FormData>(createVenue, { error: null });
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<CategoryKey>("kavarna");
  const [city, setCity] = useState("");
  const [color, setColor] = useState(CARD_COLORS[0]);
  const [goal, setGoal] = useState(8);
  const [reward, setReward] = useState("");
  const [checkin, setCheckin] = useState<CheckinMode>("both");

  const rewardShown = reward.trim() || categoryDefaultReward(category);
  const canNext = step === 0 ? name.trim().length >= 2 : true;

  return (
    <main id="vsebina" className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-12 px-6 py-8">
      <div className="flex items-center justify-between">
        <Logo href={null} />
        <form action={signOut}>
          <button type="submit" className="rounded-lg text-sm font-medium text-mute transition-all duration-700 ease-spring hover:text-fg">
            Odjava
          </button>
        </form>
      </div>

      <div className="grid flex-1 items-start gap-12 lg:grid-cols-2">
        <form action={action} className="flex flex-col gap-8">
          {/* vse vrednosti gredo v obrazec ne glede na trenutni korak */}
          <input type="hidden" name="name" value={name} />
          <input type="hidden" name="category" value={category} />
          <input type="hidden" name="city" value={city} />
          <input type="hidden" name="brand_color" value={color} />
          <input type="hidden" name="stamp_goal" value={goal} />
          <input type="hidden" name="reward_name" value={rewardShown} />
          <input type="hidden" name="checkin" value={checkin} />

          <ol className="flex items-center gap-2" aria-label="Koraki">
            {STEPS.map((s, i) => (
              <li key={s} className="flex items-center gap-2">
                <span
                  aria-current={i === step ? "step" : undefined}
                  className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-all duration-700 ease-spring ${i === step ? "bg-brand text-on-brand" : i < step ? "bg-s2 text-fg" : "bg-s1 text-dim"}`}
                >
                  <span className="font-mono">{i + 1}</span>
                  {s}
                </span>
              </li>
            ))}
          </ol>

          {step === 0 && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-semibold tracking-tight text-fg">Predstavi svoj lokal</h1>
                <p className="text-base text-mute">Tako ga bodo videli gostje v svoji denarnici. Vse lahko pozneje spremeniš.</p>
              </div>
              <Field label="Ime lokala">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Kavarna Lipa" maxLength={60} autoFocus />
              </Field>
              <Field label="Vrsta lokala">
                <Select value={category} onChange={(e) => setCategory(e.target.value as CategoryKey)}>
                  {CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Kraj" hint="Neobvezno, pomaga gostom pri iskanju.">
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ljubljana" maxLength={60} />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-semibold tracking-tight text-fg">Oblikuj kartico</h1>
                <p className="text-base text-mute">Izberi barvo, število obiskov do nagrade in nagrado.</p>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-mute">Barva kartice</span>
                <div className="flex flex-wrap items-center gap-3">
                  {CARD_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Barva ${c}`}
                      aria-pressed={color === c}
                      onClick={() => setColor(c)}
                      className={`size-10 rounded-full border-2 transition-all duration-700 ease-spring active:scale-[0.98] ${color === c ? "border-fg" : "border-line"}`}
                      style={{ background: c }}
                    />
                  ))}
                  <label className="relative flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-line bg-s2 text-mute" title="Lastna barva">
                    <Plus size={16} weight="bold" aria-hidden="true" />
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} aria-label="Lastna barva" className="absolute inset-0 size-full cursor-pointer opacity-0" />
                  </label>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-mute">Obiskov do nagrade</span>
                <div className="flex w-max items-center gap-4 rounded-3xl bg-card shadow-card p-2">
                  <button type="button" aria-label="Manj" onClick={() => setGoal((g) => Math.max(4, g - 1))} className="flex size-10 items-center justify-center rounded-xl bg-s2 text-fg transition-all duration-700 ease-spring hover:bg-s3 active:scale-[0.98]">
                    <Minus size={16} weight="bold" aria-hidden="true" />
                  </button>
                  <span className="w-8 text-center font-mono text-2xl font-semibold text-fg" aria-live="polite">{goal}</span>
                  <button type="button" aria-label="Več" onClick={() => setGoal((g) => Math.min(12, g + 1))} className="flex size-10 items-center justify-center rounded-xl bg-s2 text-fg transition-all duration-700 ease-spring hover:bg-s3 active:scale-[0.98]">
                    <Plus size={16} weight="bold" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <Field label="Nagrada za polno kartico">
                <Input value={reward} onChange={(e) => setReward(e.target.value)} placeholder={categoryDefaultReward(category)} maxLength={60} />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-semibold tracking-tight text-fg">Kako gostje zabeležijo obisk</h1>
                <p className="text-base text-mute">Izbiro lahko kadar koli spremeniš v nastavitvah.</p>
              </div>
              <div className="flex flex-col gap-3" role="radiogroup" aria-label="Način beleženja obiskov">
                {MODES.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    role="radio"
                    aria-checked={checkin === m.key}
                    onClick={() => setCheckin(m.key)}
                    className={`flex items-start gap-4 rounded-2xl border p-4 text-left transition-all duration-700 ease-spring active:scale-[0.98] ${checkin === m.key ? "border-brand bg-tint" : "border-line bg-s1 hover:bg-s2"}`}
                  >
                    <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${checkin === m.key ? "bg-brand text-on-brand" : "bg-s3 text-mute"}`}>
                      <m.icon size={24} weight="bold" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-lg font-semibold tracking-tight text-fg">{m.title}</span>
                      <span className="block text-sm text-mute">{m.text}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {state.error && <p role="alert" className="rounded-xl border border-line bg-s2 px-4 py-3 text-sm text-bad">{state.error}</p>}

          <div className="flex items-center gap-3">
            {step > 0 && (
              <Button type="button" variant="secondary" size="lg" onClick={() => setStep((s) => s - 1)} disabled={pending}>
                <ArrowLeft size={16} weight="bold" aria-hidden="true" />
                Nazaj
              </Button>
            )}
            {step < 2 ? (
              <Button type="button" size="lg" onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
                Naprej
                <ArrowRight size={16} weight="bold" aria-hidden="true" />
              </Button>
            ) : (
              <Button type="submit" size="lg" disabled={pending}>
                {pending && <CircleNotch size={20} weight="bold" className="animate-spin" aria-hidden="true" />}
                Ustvari lokal
              </Button>
            )}
          </div>
        </form>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-8">
          <p className="font-mono text-sm font-medium uppercase tracking-widest text-brand-ink">Predogled</p>
          <div className="w-full max-w-sm">
            <LoyaltyCard card={{ name: name.trim() || "Tvoj lokal", category, color, stamps: Math.min(3, goal), goal, reward: rewardShown }} />
          </div>
          <p className="max-w-sm text-sm text-mute">Tako je videti kartica v telefonu gosta po treh obiskih.</p>
        </aside>
      </div>
    </main>
  );
}
