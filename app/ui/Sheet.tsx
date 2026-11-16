"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "@phosphor-icons/react/dist/ssr";

/** Pola od spodaj na telefonu, sredinsko okno na namizju. Zapre se s klikom na ozadje ali tipko Esc. */
export default function Sheet({ open, onClose, title, children, dismissable = true }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; dismissable?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissable) onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, dismissable]);

  if (!open) return null;
  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center bg-scrim backdrop-blur-sm lg:items-center lg:p-6"
      onClick={() => dismissable && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="animate-sheet-up lg:animate-pop-in relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-line bg-s1 p-6 lg:max-w-md lg:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {dismissable && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Zapri"
            className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-s2 text-mute transition-all duration-700 ease-spring hover:bg-s3 hover:text-fg active:scale-[0.98]"
          >
            <X size={16} weight="bold" />
          </button>
        )}
        {title && <h2 className="mb-4 pr-10 text-xl font-semibold tracking-tight">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
