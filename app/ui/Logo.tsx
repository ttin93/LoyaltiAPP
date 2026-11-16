import Link from "next/link";

/**
 * Znak: dve kartici zvestobe z rdečim žigom. Zasnova je nastala z generatorjem slik,
 * tu je prerisana v vektorje, da ostane ostra v vseh velikostih.
 * `tile` = ikona aplikacije (modra ploščica, beli kartici).
 */
export function LogoMark({ size = 24, tile = false }: { size?: number; tile?: boolean }) {
  if (tile) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="shrink-0">
        <rect width="64" height="64" rx="15" fill="#1F8BF5" />
        <rect x="26" y="17" width="24" height="32" rx="6" transform="rotate(14 38 33)" fill="#FFFFFF" fillOpacity="0.45" />
        <rect x="15" y="13" width="26" height="35" rx="6.5" fill="#FFFFFF" />
        <circle cx="28" cy="27" r="7.5" fill="#E63F26" />
        <circle cx="28" cy="27" r="4.5" fill="none" stroke="#FFFFFF" strokeOpacity="0.65" strokeWidth="1.3" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="shrink-0">
      <rect x="24" y="13" width="30" height="40" rx="7.5" transform="rotate(14 39 33)" fill="#0F6FE0" />
      <rect x="8" y="7" width="34" height="45" rx="8.5" fill="#1F8BF5" stroke="var(--logo-gap, #FFFFFF)" strokeWidth="3" />
      <circle cx="25" cy="25" r="9.5" fill="#E63F26" />
      <circle cx="25" cy="25" r="5.8" fill="none" stroke="#FFFFFF" strokeOpacity="0.65" strokeWidth="1.6" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return <span className={`font-semibold tracking-tight ${className}`}>loyavi</span>;
}

export default function Logo({ href = "/", size = 28, className = "" }: { href?: string | null; size?: number; className?: string }) {
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
