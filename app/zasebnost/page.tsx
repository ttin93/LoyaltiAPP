import type { Metadata } from "next";
import LegalShell, { Section } from "@/app/ui/LegalShell";
import { BRAND, BRAND_EMAIL } from "@/lib/brand";

export const metadata: Metadata = { title: "Politika zasebnosti", alternates: { canonical: "/zasebnost" } };

export default function Zasebnost() {
  return (
    <LegalShell title="Politika zasebnosti" updated="20. november 2026">
      <Section h="1. Upravljavec">
        <p>
          Ta politika pojasnjuje, kako {BRAND} obdeluje osebne podatke. Glede uporabniških računov gostov in lastnikov lokalov je upravljavec ponudnik {BRAND}. Glede podatkov o obiskih, kuponih in
          ocenah pri posameznem lokalu je upravljavec ta lokal, {BRAND} pa nastopa kot obdelovalec po njegovih navodilih.
        </p>
      </Section>
      <Section h="2. Kateri podatki se obdelujejo">
        <p>
          <strong>Gostje:</strong> elektronski naslov in geslo (shranjeno v zgoščeni obliki), po želji ime ter dan in mesec rojstva, kartice pri lokalih, zabeleženi obiski, kuponi in oddane ocene.
          Iz fiskalnega računa preberemo izdajatelja, čas izdaje in enolično oznako računa. Zneskov in vsebine računov ne hranimo.
        </p>
        <p>
          <strong>Lastniki lokalov:</strong> elektronski naslov, podatki o lokalu, ki jih vpišejo sami, in podatki o naročnini. Podatke o plačilni kartici obdeluje plačilni partner, mi jih ne
          vidimo.
        </p>
      </Section>
      <Section h="3. Nameni in pravna podlaga">
        <p>
          Podatke obdelujemo za delovanje kartic zvestobe, podeljevanje nagrad in pregled obiskov za lokal (izvajanje pogodbe). Sem spadajo tudi obvestila o kartici, na primer da je kartica
          polna in vas čaka nagrada.
        </p>
        <p>
          <strong>Ponudbe in novice lokalov</strong> pošiljamo samo na podlagi vaše privolitve. Privolitev daste ob prvi prijavi ali kasneje v profilu, ločeno od sprejema pogojev uporabe, in ni
          pogoj za uporabo kartic. Velja za lokale, pri katerih imate kartico. Sporočila pošlje {BRAND} v imenu lokala. Hranimo zapis o tem, kdaj ste privolitev dali.
        </p>
        <p>
          Privolitev lahko kadar koli prekličete: v profilu za vse lokale hkrati ali s povezavo za odjavo v vsakem sporočilu za posamezen lokal. Preklic ne vpliva na kartice, žige in kupone.
        </p>
        <p>Storitev je namenjena osebam, ki so dopolnile 15 let.</p>
      </Section>
      <Section h="4. Kdo vidi vaše podatke">
        <p>Lokal vidi elektronski naslov gosta, njegove obiske, kupone in ocene pri tem lokalu. Drugi lokali teh podatkov ne vidijo. Osebnih podatkov ne prodajamo.</p>
      </Section>
      <Section h="5. Obdelovalci">
        <p>
          Za delovanje storitve uporabljamo ponudnike infrastrukture: <strong>Supabase</strong> (baza podatkov in prijava), <strong>Vercel</strong> (gostovanje), <strong>Resend</strong> (pošiljanje
          elektronske pošte) in <strong>Polar</strong> (plačila naročnin za lokale). Podatke obdelujejo izključno za zagotavljanje storitve.
        </p>
      </Section>
      <Section h="6. Hramba">
        <p>
          Podatke hranimo, dokler je račun aktiven oziroma dokler obstaja namen obdelave. Po izbrisu računa jih izbrišemo ali anonimiziramo, razen kadar daljšo hrambo zahteva zakon.
        </p>
      </Section>
      <Section h="7. Pravice posameznika">
        <p>
          Imate pravico do dostopa, popravka, izbrisa, omejitve obdelave, prenosljivosti in ugovora ter do preklica privolitve. Zahtevo pošljite na{" "}
          <a href={`mailto:${BRAND_EMAIL}`}>{BRAND_EMAIL}</a>. Pritožbo lahko vložite tudi pri Informacijskem pooblaščencu Republike Slovenije.
        </p>
      </Section>
      <Section h="8. Piškotki in varnost">
        <p>
          O piškotkih pišemo v ločeni <a href="/piskotki">politiki piškotkov</a>. Podatke varujemo z ustreznimi tehničnimi in organizacijskimi ukrepi, kot sta šifrirana povezava in omejen dostop.
          Noben ukrep ni popolnoma zanesljiv.
        </p>
      </Section>
      <Section h="9. Kontakt">
        <p>
          Za vsa vprašanja o zasebnosti smo dosegljivi na <a href={`mailto:${BRAND_EMAIL}`}>{BRAND_EMAIL}</a>.
        </p>
      </Section>
    </LegalShell>
  );
}
