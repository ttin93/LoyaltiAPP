import LegalShell, { Section } from "@/app/components/LegalShell";
import { BRAND, BRAND_EMAIL } from "@/lib/brand";

export const metadata = { title: `Splošni pogoji — ${BRAND}` };

export default function Pogoji() {
  return (
    <LegalShell title="Splošni pogoji uporabe" updated="20. junij 2026">
      <Section h="1. Splošno">
        <p>Ti splošni pogoji urejajo uporabo storitve {BRAND} (»storitev«) — spletne platforme za zvestobo gostov,
          zbiranje Google ocen in trženje za gostinske in podobne lokale. Z registracijo ali uporabo storitve se strinjate s temi pogoji.</p>
        <p>Ponudnik storitve je upravljavec platforme {BRAND}. Podatki o ponudniku (naziv, sedež, matična in davčna številka) se dopolnijo ob registraciji dejavnosti.</p>
      </Section>
      <Section h="2. Opis storitve">
        <p>Storitev lokalom omogoča: stran za zbiranje žigov/točk prek QR kode na fiskalnem računu, kolo sreče za pridobivanje novih gostov,
          samodejno povabilo k Google oceni, marketinške kampanje (SMS in e-pošta), avtomatizacije (win-back, rojstnodnevne nagrade) ter analitiko in profile gostov.</p>
        <p>Funkcije se lahko razlikujejo glede na izbrani paket in se sčasoma razvijajo, nadgrajujejo ali spreminjajo.</p>
      </Section>
      <Section h="3. Račun in dostop">
        <p>Za uporabo lastniškega dela je potrebna registracija. Odgovorni ste za točnost podatkov in za varovanje dostopnih podatkov.
          Odgovorni ste za vse aktivnosti, izvedene prek vašega računa.</p>
      </Section>
      <Section h="4. Cene, preizkus in plačila">
        <p>Cene paketov so objavljene na strani s cenami in so brez DDV. Na voljo je 14-dnevni brezplačni preizkus, ki ne zahteva plačilne kartice.</p>
        <p>Po preizkusu se naročnina obnavlja mesečno, dokler je ne prekličete. Naročnino lahko prekličete kadarkoli; veljala bo do konca plačanega obdobja. Brez vezave.</p>
      </Section>
      <Section h="5. Obveznosti uporabnika">
        <p>Zavezujete se, da storitve ne boste uporabljali v nezakonite namene, za pošiljanje neželenih sporočil (spam) brez ustrezne pravne podlage ali privolitve prejemnikov,
          ter da boste pri trženju spoštovali veljavno zakonodajo (vključno z GDPR in pravili o e-komunikacijah).</p>
      </Section>
      <Section h="6. Podatki gostov">
        <p>V razmerju do podatkov vaših gostov ste vi upravljavec, {BRAND} pa obdelovalec, ki podatke obdeluje po vaših navodilih in v skladu s politiko zasebnosti.
          Sami ste odgovorni za zakonito zbiranje privolitev gostov za morebitno trženje.</p>
      </Section>
      <Section h="7. Razpoložljivost in podpora">
        <p>Prizadevamo si za visoko razpoložljivost storitve, vendar je ne moremo jamčiti brez prekinitev. Možne so načrtovane in nenačrtovane prekinitve zaradi vzdrževanja ali napak.</p>
      </Section>
      <Section h="8. Omejitev odgovornosti">
        <p>Storitev je na voljo »takšna, kot je«. V največjem z zakonom dopustnem obsegu ne odgovarjamo za posredno škodo, izgubljeni dobiček ali izgubo podatkov,
          ki bi nastala iz uporabe ali nezmožnosti uporabe storitve.</p>
      </Section>
      <Section h="9. Spremembe pogojev">
        <p>Pogoje lahko občasno posodobimo. O bistvenih spremembah vas obvestimo. Nadaljnja uporaba storitve po spremembi pomeni sprejem posodobljenih pogojev.</p>
      </Section>
      <Section h="10. Veljavno pravo in kontakt">
        <p>Za ta razmerja velja pravo Republike Slovenije; za morebitne spore je pristojno stvarno pristojno sodišče v Sloveniji.
          Za vprašanja smo dosegljivi na <a className="font-semibold underline" href={`mailto:${BRAND_EMAIL}`}>{BRAND_EMAIL}</a>.</p>
      </Section>
    </LegalShell>
  );
}
