import type { ComponentProps, ReactNode } from "react";

export const inputClass =
  "w-full rounded-xl border border-line bg-s2 px-4 py-3 text-base text-fg placeholder:text-dim outline-none " +
  "transition-all duration-700 ease-spring hover:border-dim focus:border-brand disabled:opacity-50";

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string | null; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-mute">{label}</span>
      {children}
      {error ? <span className="text-sm text-bad">{error}</span> : hint ? <span className="text-sm text-dim">{hint}</span> : null}
    </label>
  );
}

export function Input(props: ComponentProps<"input">) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function Textarea(props: ComponentProps<"textarea">) {
  return <textarea {...props} className={`${inputClass} min-h-24 resize-y ${props.className ?? ""}`} />;
}

export function Select(props: ComponentProps<"select">) {
  return <select {...props} className={`${inputClass} appearance-none ${props.className ?? ""}`} />;
}

/** Stikalo (vklop/izklop). */
export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-12 shrink-0 rounded-full transition-all duration-700 ease-spring ${checked ? "bg-brand" : "bg-s3"}`}
    >
      <span className={`absolute top-0.5 size-5 rounded-full transition-all duration-700 ease-spring ${checked ? "left-6 bg-base" : "left-0.5 bg-base"}`} />
    </button>
  );
}
