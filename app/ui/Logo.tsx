import Link from "next/link";

/** Znak: pet pik v obliki črke L (žigi), zadnja pika je rdeča (nagrada). Pike prevzamejo barvo besedila. */
export function LogoMark({ size = 24, tile = false }: { size?: number; tile?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="shrink-0" style={tile ? { color: "#FFFFFF" } : undefined}>
      {tile && <rect width="64" height="64" rx="16" fill="#0B1826" />}
      <circle cx="16" cy="16" r="7" fill="currentColor" />
      <circle cx="16" cy="32" r="7" fill="currentColor" />
      <circle cx="16" cy="48" r="7" fill="currentColor" />
      <circle cx="32" cy="48" r="7" fill="currentColor" />
      <circle cx="48" cy="48" r="7" fill="var(--logo-dot, #E63F26)" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return <span className={`font-semibold tracking-tight ${className}`}>loyavi</span>;
}

export default function Logo({ href = "/", size = 24, className = "" }: { href?: string | null; size?: number; className?: string }) {
  const inner = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={size} />
      <Wordmark className="text-xl" />
    </span>
  );
  if (href === null) return inner;
  return (
    <Link href={href} aria-label="Loyavi, na začetno stran" className="inline-flex rounded-lg">
      {inner}
    </Link>
  );
}
