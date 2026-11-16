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
