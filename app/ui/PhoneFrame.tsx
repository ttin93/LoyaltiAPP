import type { ReactNode } from "react";

/** Ploski okvir telefona za prikaz aplikacije na landingu. */
export default function PhoneFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-4xl bg-fg p-2 ${className}`}>
      <div className="relative aspect-[9/19] overflow-hidden rounded-3xl bg-base text-left text-fg">
        <div className="absolute left-1/2 top-2 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-fg" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}
