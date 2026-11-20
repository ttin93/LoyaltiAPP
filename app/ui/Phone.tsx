import Image from "next/image";

/** Telefon s pravim posnetkom zaslona aplikacije (public/screens/*.webp). */
export default function Phone({ src, alt, priority = false, sizes = "(min-width: 1024px) 280px, 60vw", className = "" }: { src: string; alt: string; priority?: boolean; sizes?: string; className?: string }) {
  return (
    <div className={`rounded-4xl bg-fg p-2 shadow-pop ${className}`}>
      <div className="relative aspect-[390/844] overflow-hidden rounded-3xl bg-canvas">
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover object-top" />
        <span className="absolute left-1/2 top-2 h-5 w-20 -translate-x-1/2 rounded-full bg-fg" aria-hidden="true" />
      </div>
    </div>
  );
}

/** Okno brskalnika s posnetkom nadzorne plošče. `aspect` naj ustreza razmerju posnetka. */
export function BrowserFrame({ src, alt, priority = false, className = "", aspect = "aspect-[16/10]" }: { src: string; alt: string; priority?: boolean; className?: string; aspect?: string }) {
  return (
    <div className={`overflow-hidden rounded-3xl bg-card shadow-pop ${className}`}>
      <div className="flex items-center gap-2 bg-s2 px-4 py-3" aria-hidden="true">
        <span className="size-3 rounded-full bg-s3" />
        <span className="size-3 rounded-full bg-s3" />
        <span className="size-3 rounded-full bg-s3" />
        <span className="ml-2 rounded-full bg-card px-3 py-1 font-mono text-xs text-dim">loyavi.app/dashboard</span>
      </div>
      <div className={`relative ${aspect}`}>
        <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 1100px, 100vw" priority={priority} className="object-cover object-top" />
      </div>
    </div>
  );
}
