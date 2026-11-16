"use client";

import { createContext, useCallback, useContext, useRef, useState, useTransition, type ReactNode } from "react";
import { Check, CheckCircle, Copy, Warning } from "@phosphor-icons/react/dist/ssr";

// ── Obvestila (toast) ────────────────────────────────────────────────────────
type ToastKind = "ok" | "bad";
type ToastFn = (text: string, kind?: ToastKind) => void;
const ToastCtx = createContext<ToastFn>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ text: string; kind: ToastKind; n: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback<ToastFn>((text, kind = "ok") => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ text, kind, n: Date.now() });
    timer.current = setTimeout(() => setToast(null), 3600);
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
        {toast && (
          <p key={toast.n} role="status" className="animate-pop-in pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl border border-line bg-s2 px-4 py-3 text-sm font-medium text-fg">
            {toast.kind === "ok" ? <CheckCircle size={20} weight="fill" className="shrink-0 text-brand-ink" aria-hidden="true" /> : <Warning size={20} weight="fill" className="shrink-0 text-bad" aria-hidden="true" />}
            {toast.text}
          </p>
        )}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);

type ActResult = { ok: true } | { ok: false; error: string };

/** Zažene strežniško akcijo, pokaže izid in vrne stanje »v teku«. */
export function useAct() {
  const toast = useToast();
  const [pending, start] = useTransition();
  const run = useCallback(
    (fn: () => Promise<ActResult>, okText = "Shranjeno.", after?: () => void) =>
      start(async () => {
        try {
          const r = await fn();
          if (r.ok) {
            toast(okText);
            after?.();
          } else toast(r.error, "bad");
        } catch {
          toast("Povezava ni uspela. Poskusi znova.", "bad");
        }
      }),
    [toast],
  );
  return { pending, run };
}

// ── Gradniki ─────────────────────────────────────────────────────────────────
export function SectionHead({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex max-w-2xl flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-fg lg:text-4xl">{title}</h1>
        {text && <p className="text-base text-mute">{text}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({ title, text, action, children, className = "" }: { title?: string; text?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`flex flex-col gap-6 rounded-3xl border border-line bg-s1 p-6 ${className}`}>
      {(title || action) && (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            {title && <h2 className="text-xl font-semibold tracking-tight text-fg">{title}</h2>}
            {text && <p className="max-w-xl text-sm text-mute">{text}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-3xl border border-line bg-s1 p-6">
      <p className="text-sm font-medium text-mute">{label}</p>
      <p className="font-mono text-4xl font-semibold tracking-tight text-fg">{value}</p>
      {note && <p className="text-sm text-dim">{note}</p>}
    </div>
  );
}

export function Empty({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl bg-s2 px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-s3 text-mute">{icon}</span>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="text-lg font-semibold tracking-tight text-fg">{title}</p>
        <p className="text-sm text-mute">{text}</p>
      </div>
      {action}
    </div>
  );
}

export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full px-3 py-2 text-sm font-semibold whitespace-nowrap transition-all duration-700 ease-spring active:scale-[0.98] ${active ? "bg-brand text-on-brand" : "bg-s2 text-mute hover:bg-s3 hover:text-fg"}`}
    >
      {children}
    </button>
  );
}

export function Badge({ tone = "mute", children }: { tone?: "brand" | "mute" | "warn" | "bad"; children: ReactNode }) {
  const cls = { brand: "bg-brand text-on-brand", mute: "bg-s3 text-mute", warn: "bg-s3 text-warn", bad: "bg-s3 text-bad" }[tone];
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold whitespace-nowrap ${cls}`}>{children}</span>;
}

/** Polje s povezavo in gumbom za kopiranje. */
export function CopyField({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false);
  const toast = useToast();
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {
      toast("Kopiranje ni uspelo. Označi povezavo in jo kopiraj ročno.", "bad");
    }
  }
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-line bg-s2 p-2">
      <input readOnly value={value} aria-label={label} onFocus={(e) => e.currentTarget.select()} className="min-w-0 flex-1 bg-transparent px-2 font-mono text-sm text-fg outline-none" />
      <button
        type="button"
        onClick={copy}
        className="flex shrink-0 items-center gap-2 rounded-lg bg-s3 px-3 py-2 text-sm font-semibold text-fg transition-all duration-700 ease-spring hover:bg-line active:scale-[0.98]"
      >
        {done ? <Check size={16} weight="bold" className="text-brand-ink" aria-hidden="true" /> : <Copy size={16} weight="bold" aria-hidden="true" />}
        {done ? "Kopirano" : "Kopiraj"}
      </button>
    </div>
  );
}

/** Števec s plus in minus (npr. število žigov). */
export function Stepper({ value, min, max, onChange, label, unit }: { value: number; min: number; max: number; onChange: (n: number) => void; label: string; unit?: string }) {
  const btn = "flex size-10 items-center justify-center rounded-xl bg-s2 text-lg font-semibold text-fg transition-all duration-700 ease-spring hover:bg-s3 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none";
  return (
    <div className="flex w-max items-center gap-4 rounded-2xl border border-line bg-s1 p-2" role="group" aria-label={label}>
      <button type="button" aria-label="Manj" disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))} className={btn}>
        −
      </button>
      <span className="min-w-12 text-center font-mono text-2xl font-semibold text-fg" aria-live="polite">
        {value}
        {unit && <span className="ml-1 text-sm font-medium text-mute">{unit}</span>}
      </span>
      <button type="button" aria-label="Več" disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))} className={btn}>
        +
      </button>
    </div>
  );
}
