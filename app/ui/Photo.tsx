import Image from "next/image";

type Shape = "rect" | "rise" | "arch" | "circle" | "pill";

const SHAPE: Record<Shape, string> = {
  rect: "rounded-3xl",
  rise: "rounded-t-3xl", // pravokotnik, ki raste iz spodnjega roba sekcije
  arch: "rounded-t-full", // lok, ki raste iz spodnjega roba sekcije
  circle: "rounded-full",
  pill: "rounded-full",
};

/** Fotografija v eni od oblik kolaža. Razmerje stranic določi klicatelj (aspect-*). */
export default function Photo({ src, alt, shape = "rect", sizes = "(min-width: 1024px) 25vw, 50vw", priority = false, top = false, className = "" }: { src: string; alt: string; shape?: Shape; sizes?: string; priority?: boolean; /** poravnaj izrez na vrh slike (obrazi ostanejo vidni) */ top?: boolean; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-s2 ${SHAPE[shape]} ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={`object-cover ${top ? "object-top" : ""}`} />
    </div>
  );
}
