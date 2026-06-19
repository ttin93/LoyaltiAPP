import LegalShell, { Section } from "@/app/components/LegalShell";
import { BRAND, BRAND_EMAIL } from "@/lib/brand";

export const metadata = { title: `Politika zasebnosti — ${BRAND}` };

export default function Zasebnost() {
  return (
    <LegalShell title="Politika zasebnosti" updated="20. junij 2026">
      <Section h="1. Upravljavec">
        <p>Ta politika pojasnjuje, kako {BRAND} obdeluje osebne podatke. Glede podatkov gostov posameznega lokala je upravljavec lokal sam,
          {" "}{BRAND} pa nastopa kot obdelovalec po navodilih lokala. Glede podatkov lastnikov/uporabnikov platforme je upravljavec ponudnik {BRAND}.</p>
      </Section>
      <Section h="2. Kateri podatki se obdelujejo">
        <p><strong>Lastniki lokalov:</strong> ime, e-pošta, podatki o lokalu in naročnini.</p>
        <p><strong>Gostje lokala:</strong> kontaktni podatek (telefon ali e-pošta) ob registraciji, žigi/točke, zgodovina skeniranj in unovčenj, datum rojstva (če ga gost navede),
          podatki s fiskalnega računa (izdajatelj, čas izdaje, unikatna oznaka računa). Zneskov posameznih računov privzeto ne hranimo.</p>
      </Section>
      <Section h="3. Nameni in pravna podlaga">
        <p>Podatke obdelujemo za: izvajanje programa zvestobe, podeljevanje nagrad, analitiko obiskov za lokal ter (na podlagi privolitve oz. zakonitega interesa lokala)
          trženjska sporočila in povabila k oceni. Pravne podlage: izvajanje pogodbe, privolitev in zakoniti interes.</p>
      </Section>
      <Section h="4. Obdelovalci in podizvajalci">
        <p>Za delovanje storitve uporabljamo zaupanja vredne ponudnike infrastrukture: <strong>Supabase</strong> (baza podatkov in avtentikacija),
          <strong> Vercel</strong> (gostovanje). Za pošiljanje sporočil se uporabi izbrani ponudnik SMS oz. e-pošte. Ti obdelujejo podatke izključno za zagotavljanje storitve.</p>
      </Section>
      <Section h="5. Hramba">
        <p>Podatke hranimo, dokler traja namen oz. dokler je lokal aktiven uporabnik, oziroma do preklica privolitve. Po prenehanju jih izbrišemo ali anonimiziramo,
          razen kjer hrambo zahteva zakon.</p>
      </Section>
      <Section h="6. Pravice posameznika">
        <p>Imate pravico do dostopa, popravka, izbrisa (»pravica do pozabe«), omejitve obdelave, prenosljivosti in ugovora ter preklica privolitve.
          Zahtevo lahko podate na <a className="font-semibold underline" href={`mailto:${BRAND_EMAIL}`}>{BRAND_EMAIL}</a>. Pritožbo lahko vložite tudi pri Informacijskem pooblaščencu RS.</p>
      </Section>
      <Section h="7. Piškotki in varnost">
        <p>O piškotkih si preberite v ločeni <a className="font-semibold underline" href="/piskotki">politiki piškotkov</a>. Podatke varujemo z ustreznimi tehničnimi in organizacijskimi ukrepi
          (šifriranje občutljivih podatkov, omejen dostop). Nobeden ukrep ni 100 % zanesljiv.</p>
      </Section>
      <Section h="8. Kontakt">
        <p>Za vsa vprašanja o zasebnosti smo dosegljivi na <a className="font-semibold underline" href={`mailto:${BRAND_EMAIL}`}>{BRAND_EMAIL}</a>.</p>
      </Section>
    </LegalShell>
  );
}
