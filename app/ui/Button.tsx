import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "dark";
type Size = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap select-none " +
  "transition-all duration-700 ease-spring active:scale-[0.98] " +
  "disabled:opacity-40 disabled:pointer-events-none aria-disabled:opacity-40 aria-disabled:pointer-events-none";

const VARIANT: Record<Variant, string> = {
  primary: "bg-accent text-on-accent hover:bg-accent-deep",
  secondary: "bg-s2 text-fg border border-line hover:bg-s3",
  ghost: "text-mute hover:text-fg hover:bg-s2",
  danger: "bg-s2 text-bad border border-line hover:bg-s3",
  dark: "bg-base text-fg hover:bg-s2", // na modri podlagi
};

// md = glavni gumb (8 px / 12 px), sm = gumb v glavi, lg = polna širina v aplikaciji (lažji dotik)
const SIZE: Record<Size, string> = {
  sm: "text-sm px-3 py-2 rounded-xl",
  md: "text-base px-3 py-2 rounded-xl",
  lg: "text-base px-4 py-3 rounded-2xl",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", full = false, extra = ""): string {
  return `${BASE} ${VARIANT[variant]} ${SIZE[size]} ${full ? "w-full" : ""} ${extra}`;
}

type Common = { variant?: Variant; size?: Size; full?: boolean; children: ReactNode; className?: string };

export function Button({ variant, size, full, className, children, ...rest }: Common & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button className={buttonClass(variant, size, full, className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({ variant, size, full, className, children, href, ...rest }: Common & { href: string } & Omit<ComponentProps<typeof Link>, "className" | "children" | "href">) {
  return (
    <Link href={href} className={buttonClass(variant, size, full, className)} {...rest}>
      {children}
    </Link>
  );
}
