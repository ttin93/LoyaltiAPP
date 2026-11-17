import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Wordmark } from "./Logo";
import { DEMO } from "@/lib/demo";

/**
 * Podpis Loyavi na strani gosta. Je obvezen del vsake kartice: stran izriše Loyavi, zato ga lokal
 * ne more skriti ali odstraniti (ni nastavitve zanj). Hkrati pripelje nove lokale: gost, ki ima
 * svoj lokal, vidi, da je kartica narejena z Loyavi.
 */
export default function LoyaviSignature({ className = "" }: { className?: string }) {
  return (
    <footer className={`mx-auto flex w-full max-w-4xl flex-col items-center gap-3 px-6 pb-12 text-center ${className}`}>
      <Link href="/" aria-label="Loyavi, na začetno stran" className="flex items-center gap-2 rounded-lg text-sm font-medium text-mute transition-all duration-700 ease-spring hover:text-fg">
        Kartica zvestobe prek
        <Wordmark className="text-xl text-fg" />
      </Link>
      <Link href="/partnerji" className="group flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-semibold text-brand-ink shadow-card transition-all duration-700 ease-spring hover:-translate-y-0.5 hover:shadow-pop active:scale-[0.98]">
        {DEMO ? "Imaš lokal? V demo obdobju je Loyavi brezplačen" : "Imaš lokal? Ustvari svojo kartico zvestobe"}
        <ArrowRight size={12} weight="bold" className="transition-all duration-700 ease-spring group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>
    </footer>
  );
}
