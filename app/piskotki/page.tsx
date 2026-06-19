import LegalShell, { Section } from "@/app/components/LegalShell";
import { BRAND, BRAND_EMAIL } from "@/lib/brand";

export const metadata = { title: `Piškotki — ${BRAND}` };

export default function Piskotki() {
  return (
    <LegalShell title="Politika piškotkov" updated="20. junij 2026">
      <Section h="1. Kaj so piškotki">
        <p>Piškotki so majhne datoteke, ki jih spletna stran shrani v vaš brskalnik. Omogočajo delovanje strani, pomnjenje seje in razumevanje uporabe.</p>
      </Section>
      <Section h="2. Katere piškotke uporabljamo">
        <p><strong>Nujni piškotki</strong> — potrebni za delovanje (prijava lastnika, varnost, ohranjanje seje). Brez njih storitev ne deluje; ne zahtevajo privolitve.</p>
        <p><strong>Funkcijski (lokalna shramba)</strong> — na napravi gosta hranimo njegov ID, kupone in stanje žigov, da kartonček ostane med obiski. Ti podatki ostanejo v brskalniku gosta.</p>
        <p><strong>Analitični</strong> — če so vključeni, nam pomagajo razumeti uporabo (anonimizirano). Uporabimo jih le z vašo privolitvijo, kjer je ta potrebna.</p>
        <p>Trženjskih in sledilnih piškotkov tretjih oseb privzeto <strong>ne</strong> uporabljamo.</p>
      </Section>
      <Section h="3. Upravljanje piškotkov">
        <p>Piškotke lahko kadarkoli izbrišete ali blokirate v nastavitvah brskalnika. Onemogočanje nujnih piškotkov lahko vpliva na delovanje storitve.</p>
      </Section>
      <Section h="4. Kontakt">
        <p>Za vprašanja o piškotkih nas kontaktirajte na <a className="font-semibold underline" href={`mailto:${BRAND_EMAIL}`}>{BRAND_EMAIL}</a>.
          Več o obdelavi podatkov v <a className="font-semibold underline" href="/zasebnost">politiki zasebnosti</a>.</p>
      </Section>
    </LegalShell>
  );
}
