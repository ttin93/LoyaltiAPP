import { Ticket } from "@phosphor-icons/react/dist/ssr";
import LoyaltyCard, { type CardData } from "./LoyaltyCard";
import { LogoMark } from "./Logo";

// Ponazoritveni primeri kartic za prikaz aplikacije (niso resnični partnerji).
export const SAMPLE_CARDS: CardData[] = [
  { name: "Kavarna Lipa", category: "kavarna", color: "#1F8BF5", stamps: 5, goal: 8, reward: "Brezplačna kava" },
  { name: "Brivnica Karlo", category: "frizer", color: "#E63F26", stamps: 2, goal: 6, reward: "Brezplačno striženje" },
  { name: "Cvetličarna Vrtnica", category: "cvetlicarna", color: "#FFC533", stamps: 7, goal: 10, reward: "Brezplačen šopek" },
];

/** Statičen prikaz denarnice za okvir telefona na landingu. */
export default function WalletMock() {
  return (
    <div className="flex h-full flex-col gap-3 px-3 pb-3 pt-12">
      <div className="flex items-center justify-between px-1">
        <p className="text-base font-semibold tracking-tight text-fg">Moje kartice</p>
        <LogoMark size={16} />
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-s2 px-3 py-2">
        <Ticket size={16} weight="fill" className="text-brand-ink" aria-hidden="true" />
        <p className="text-xs font-medium text-fg">Nagrada te čaka pri Kavarni Lipa</p>
      </div>
      {SAMPLE_CARDS.map((c) => (
        <LoyaltyCard key={c.name} card={c} size="sm" className="shrink-0" />
      ))}
    </div>
  );
}
