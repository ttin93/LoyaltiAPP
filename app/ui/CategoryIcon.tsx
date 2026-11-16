import {
  Coffee, ForkKnife, Martini, IceCream, Bread, Hamburger, Scissors, Sparkle, Flower,
  Car, Storefront, Barbell, PawPrint, MapPin,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon, IconWeight } from "@phosphor-icons/react";
import { categoryKey, type CategoryKey } from "@/lib/categories";

const ICONS: Record<CategoryKey, Icon> = {
  kavarna: Coffee,
  restavracija: ForkKnife,
  bar: Martini,
  slascicarna: IceCream,
  pekarna: Bread,
  "hitra-hrana": Hamburger,
  frizer: Scissors,
  lepota: Sparkle,
  cvetlicarna: Flower,
  avtopralnica: Car,
  trgovina: Storefront,
  fitnes: Barbell,
  "hisni-ljubljencki": PawPrint,
  drugo: MapPin,
};

export default function CategoryIcon({ category, size = 20, weight = "regular", className }: { category: string | null | undefined; size?: number; weight?: IconWeight; className?: string }) {
  const Cmp = ICONS[categoryKey(category)];
  return <Cmp size={size} weight={weight} className={className} aria-hidden="true" />;
}
