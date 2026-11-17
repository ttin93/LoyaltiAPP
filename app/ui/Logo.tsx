import Image from "next/image";
import Link from "next/link";

/**
 * Logo je besedni znak: krepek zaobljen napis »loyavi«, pika na črki i je rdeč žig.
 * Zasnova je nastala z generatorjem slik (docs/predogled/12-logo-napis-predlogi.jpg), tu je postavljena
 * s pisavo Outfit, da ostane ostra v vseh velikostih. Tin ga je potrdil 2026-11-17 (brez ikone ob napisu).
 */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span role="img" aria-label="Loyavi" className={`font-bold leading-none tracking-tight ${className}`} style={{ fontFamily: "var(--font-outfit), var(--font-geist), sans-serif" }}>
      <span aria-hidden="true">
        loyav
        <span className="relative inline-block">
          ı
          <span className="absolute left-1/2 rounded-full bg-accent" style={{ top: "0.09em", width: "0.28em", height: "0.28em", transform: "translateX(-50%)" }} />
        </span>
      </span>
    </span>
  );
}

/** Kvadratna ikona (ikona aplikacije, kolo, plakat): modra ploščica s črko l in rdečo piko. */
export function LogoMark({ size = 32 }: { size?: number; tile?: boolean }) {
  return <Image src="/brand/icon-192.png" alt="" aria-hidden="true" width={size} height={size} className="shrink-0 select-none" />;
}

export default function Logo({ href = "/", className = "" }: { href?: string | null; size?: number; className?: string }) {
  const inner = <Wordmark className={`text-3xl ${className}`} />;
  if (href === null) return inner;
  return (
    <Link href={href} aria-label="Loyavi, na začetno stran" className="inline-flex rounded-lg">
      {inner}
    </Link>
  );
}
