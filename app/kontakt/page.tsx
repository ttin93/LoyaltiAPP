import type { Metadata } from "next";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import SiteNav from "@/app/ui/SiteNav";
import SiteFooter from "@/app/ui/SiteFooter";
import Photo from "@/app/ui/Photo";
import { SITE_CTA, SITE_NAV } from "@/app/ui/LegalShell";
import { BRAND_EMAIL } from "@/lib/brand";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Vprašanje o Loyavi, pomoč pri postavitvi ali ponudba za več lokalov. Piši nam, odgovorimo osebno.",
  alternates: { canonical: "/kontakt" },
};

export default async function Kontakt({ searchParams }: { searchParams: Promise<{ tema?: string }> }) {
  const chain = (await searchParams)?.tema === "veriga";
  return (
    <>
      <SiteNav links={SITE_NAV} cta={SITE_CTA} />
      <main id="vsebina" className="mx-auto grid max-w-6xl items-start gap-12 px-6 pb-24 pt-32 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <p className="font-mono text-sm font-medium uppercase tracking-widest text-brand-ink">Kontakt</p>
          <h1 className="display text-6xl text-fg lg:text-7xl">{chain ? "Več lokalov? Uredimo." : "Piši nam. Odgovori človek."}</h1>
          <p className="max-w-xl text-lg text-mute">
            {chain
              ? "V demo obdobju ima en račun en lokal. Napiši, koliko lokalov imaš in kje, pa ti dostop za vse uredimo po dogovoru."
              : "Vprašanje o kartici, pomoč pri postavitvi ali ponudba za več lokalov. Napiši nekaj vrstic in se oglasimo po elektronski pošti."}
          </p>
          <a href={`mailto:${BRAND_EMAIL}`} className="flex w-max items-center gap-3 rounded-2xl bg-tint px-4 py-3 text-base font-semibold text-brand-ink transition-all duration-700 ease-spring hover:bg-s2">
            <EnvelopeSimple size={20} weight="bold" aria-hidden="true" />
            {BRAND_EMAIL}
          </a>
          {chain ? (
            <Photo src="/photos/team.jpg" alt="Natakarja si za pultom dasta petko" className="hidden aspect-[4/3] lg:block" sizes="50vw" />
          ) : (
            <Photo src="/photos/florist.jpg" alt="Cvetličarka stranki podaja šopek" className="hidden aspect-[4/3] lg:block" sizes="50vw" />
          )}
        </div>
        <ContactForm chain={chain} />
      </main>
      <SiteFooter />
    </>
  );
}
