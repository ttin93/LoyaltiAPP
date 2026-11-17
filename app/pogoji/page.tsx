import type { Metadata } from "next";
import LegalShell, { Section } from "@/app/ui/LegalShell";
import { BRAND, BRAND_EMAIL } from "@/lib/brand";
import { DEMO } from "@/lib/demo";

export const metadata: Metadata = { title: "Splošni pogoji uporabe", alternates: { canonical: "/pogoji" } };

export default function Pogoji() {
  return (
    <LegalShell title="Splošni pogoji uporabe" updated={DEMO ? "17. november 2026" : "16. november 2026"}>
      <Section h="1. Splošno">
        <p>
          Ti splošni pogoji urejajo uporabo storitve {BRAND}, spletne platforme za digitalne kartice zvestobe. Gostje jo uporabljajo brezplačno, lokali pa{" "}
          {DEMO ? "v demo obdobju prav tako brezplačno, pozneje na podlagi naročnine" : "na podlagi naročnine"}. Z ustvarjanjem računa ali uporabo storitve se strinjate s temi pogoji.
        </p>
        <p>Ponudnik storitve je upravljavec platforme {BRAND}. Podatki o ponudniku (naziv, sedež, matična in davčna številka) se dopolnijo ob registraciji dejavnosti.</p>
      </Section>
      <Section h="2. Opis storitve">
        <p>
          <strong>Gostje</strong> z enim računom zbirajo žige pri sodelujočih lokalih. Obisk zabeležijo s kodo QR na fiskalnem računu ali na stojalu ob blagajni, odvisno od izbire lokala. Polna
          kartica se spremeni v kupon, ki ga gost prevzame v lokalu.
        </p>
        <p>
          <strong>Lokali</strong> dobijo svojo digitalno kartico zvestobe, kolo dobrodošlice za nove goste, povabilo gostov k oceni, sporočila gostom po elektronski pošti in nadzorno ploščo s
          pregledom gostov in obiskov. Funkcije se sčasoma razvijajo in se lahko spremenijo.
        </p>
      </Section>
      <Section h="3. Račun in dostop">
        <p>Za uporabo je potreben račun z elektronskim naslovom in geslom. Odgovorni ste za točnost podatkov, za varovanje gesla in za vse dejavnosti, izvedene prek vašega računa.</p>
      </Section>
      {DEMO ? (
        <Section h="4. Demo obdobje in cene">
          <p>
            Za goste je storitev brezplačna. Storitev je v demo obdobju: v tem času jo lokali uporabljajo brezplačno, z vsemi funkcijami in brez vpisa plačilne kartice. Plačilnih podatkov ne
            zbiramo, zato se lokalu v demo obdobju nič ne zaračuna.
          </p>
          <p>
            V demo obdobju veljajo te omejitve: en račun pomeni en lokal, več lokalov je mogoče urediti po dogovoru. Na strani gosta, v sporočilih gostom in na plakatu je podpis {BRAND}, ki ga
            lokal ne sme prekriti ali odstraniti. Pri pošiljanju sporočil gostom veljajo razumne količinske omejitve.
          </p>
          <p>
            Demo obdobje lahko podaljšamo ali končamo. O koncu in o cenah, ki bodo veljale po njem, lokale vnaprej obvestimo po elektronski pošti. Plačljiva uporaba se začne samo, če jo lokal
            izrecno potrdi. Če je ne potrdi, se zbiranje žigov ustavi, podatki pa ostanejo shranjeni v skladu s politiko zasebnosti.
          </p>
        </Section>
      ) : (
        <Section h="4. Cene, preizkus in plačila">
          <p>
            Za goste je storitev brezplačna. Cene paketov za lokale so objavljene na strani <a href="/partnerji#cenik">cenik</a> in so brez DDV. Na voljo je 30 dnevni brezplačni preizkus, za
            katerega plačilna kartica ni potrebna.
          </p>
          <p>
            Po preizkusu se naročnina obračunava mesečno ali letno, dokler je ne prekličete. Preklic je mogoč kadar koli in velja do konca že plačanega obdobja. Plačila v našem imenu izvaja
            plačilni partner Polar, ki izda tudi račun.
          </p>
        </Section>
      )}
      <Section h="5. Žigi, kuponi in nagrade">
        <p>
          Vsak fiskalni račun prinese en žig in velja samo enkrat. Na stojalu je mogoč en žig na dan. Nagrade določi in zagotovi lokal, zato {BRAND} ne odgovarja za njihovo vsebino, razpoložljivost
          ali kakovost.
        </p>
        <p>Ob sumu zlorabe (na primer uporaba tujih računov ali ponarejenih kod) lahko lokal ali ponudnik žige in kupone razveljavi, račun pa omeji ali zapre.</p>
      </Section>
      <Section h="6. Obveznosti lokala">
        <p>
          Lokal se zavezuje, da storitve ne bo uporabljal v nezakonite namene in da bo pri pošiljanju sporočil gostom spoštoval veljavno zakonodajo, vključno s Splošno uredbo o varstvu podatkov
          in pravili o elektronskih komunikacijah. Vsako tržno sporočilo vsebuje povezavo za odjavo, ki jo mora lokal spoštovati.
        </p>
      </Section>
      <Section h="7. Podatki gostov">
        <p>
          Glede podatkov o obiskih in nagradah pri posameznem lokalu je upravljavec lokal, {BRAND} pa obdelovalec, ki podatke obdeluje po navodilih lokala. Glede uporabniškega računa gosta je
          upravljavec ponudnik {BRAND}. Podrobnosti so v <a href="/zasebnost">politiki zasebnosti</a>.
        </p>
      </Section>
      <Section h="8. Razpoložljivost in podpora">
        <p>Prizadevamo si za visoko razpoložljivost storitve, vendar je ne moremo jamčiti brez prekinitev. Mogoče so načrtovane in nenačrtovane prekinitve zaradi vzdrževanja ali napak.</p>
      </Section>
      <Section h="9. Omejitev odgovornosti">
        <p>
          Storitev je na voljo takšna, kot je. V največjem obsegu, ki ga dopušča zakon, ne odgovarjamo za posredno škodo, izgubljeni dobiček ali izgubo podatkov, ki bi nastala zaradi uporabe ali
          nezmožnosti uporabe storitve.
        </p>
      </Section>
      <Section h="10. Spremembe pogojev">
        <p>Pogoje lahko občasno posodobimo. O bistvenih spremembah vas obvestimo. Nadaljnja uporaba storitve po spremembi pomeni, da posodobljene pogoje sprejemate.</p>
      </Section>
      <Section h="11. Veljavno pravo in kontakt">
        <p>
          Za ta razmerja velja pravo Republike Slovenije, za spore je pristojno stvarno pristojno sodišče v Sloveniji. Za vprašanja smo dosegljivi na{" "}
          <a href={`mailto:${BRAND_EMAIL}`}>{BRAND_EMAIL}</a>.
        </p>
      </Section>
    </LegalShell>
  );
}
