import Image from "next/image";
import { categoryKey } from "@/lib/categories";

// 3D grafike (public/3d/*.webp, prosojno ozadje). Ustvarjene z generatorjem slik v enotnem slogu.
export type Icon3DName =
  | "kavarna" | "restavracija" | "bar" | "slascicarna" | "pekarna" | "hitra-hrana" | "frizer" | "lepota"
  | "cvetlicarna" | "avtopralnica" | "trgovina" | "fitnes" | "hisni-ljubljencki" | "drugo"
  | "darilo" | "zvezda" | "kupon" | "kolo" | "torta" | "zig" | "telefon" | "denarnica" | "konfeti"
  | "megafon" | "zvonec" | "srce" | "pokal" | "kartice";

/** Okrasna 3D grafika. Velikost v slikovnih pikah, razred lahko doda zasuk ali senco. */
export default function Icon3D({ name, size = 64, className = "", priority = false }: { name: Icon3DName; size?: number; className?: string; priority?: boolean }) {
  return <Image src={`/3d/${name}.webp`} alt="" aria-hidden="true" width={size} height={size} priority={priority} className={`pointer-events-none select-none ${className}`} />;
}

/** Grafika, ki pripada vrsti lokala. */
export function categoryIcon3D(category: string | null | undefined): Icon3DName {
  return categoryKey(category) as Icon3DName;
}
