import type { Metadata } from "next";
import LegalShell, { Section } from "@/app/ui/LegalShell";
import { BRAND_EMAIL } from "@/lib/brand";

export const metadata: Metadata = { title: "Politika piškotkov", alternates: { canonical: "/piskotki" } };

export default function Piskotki() {
  return (
    <LegalShell title="Politika piškotkov" updated="16. november 2026">
      <Section h="1. Kaj so piškotki">
        <p>Piškotki so majhne datoteke, ki jih spletna stran shrani v vaš brskalnik. Omogočajo delovanje strani in pomnjenje prijave.</p>
      </Section>
      <Section h="2. Katere piškotke uporabljamo">
        <p>
          <strong>Nujni piškotki.</strong> Potrebni so za prijavo in varnost: piškotki seje, ki vas ohranijo prijavljene, in kratkotrajen piškotek, ki potrdi, da ste pravkar odprli kodo na stojalu
          v lokalu. Brez njih storitev ne deluje, zato zanje privolitev ni potrebna.
        </p>
        <p>
          <strong>Lokalna shramba.</strong> V brskalniku si zapomnimo manjše nastavitve, na primer da ste zaprli namig za dodajanje na začetni zaslon. Ti podatki ne zapustijo vaše naprave.
        </p>
        <p>Analitičnih, oglaševalskih in sledilnih piškotkov tretjih oseb ne uporabljamo.</p>
      </Section>
      <Section h="3. Upravljanje piškotkov">
        <p>Piškotke lahko kadar koli izbrišete ali blokirate v nastavitvah brskalnika. Če onemogočite nujne piškotke, prijava ne bo delovala.</p>
      </Section>
      <Section h="4. Kontakt">
        <p>
          Za vprašanja o piškotkih nam pišite na <a href={`mailto:${BRAND_EMAIL}`}>{BRAND_EMAIL}</a>. Več o obdelavi podatkov je v <a href="/zasebnost">politiki zasebnosti</a>.
        </p>
      </Section>
    </LegalShell>
  );
}
