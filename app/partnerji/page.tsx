import type { Metadata } from "next";
import { ArrowRight, Check } from "@phosphor-icons/react/dist/ssr";
import SiteNav from "@/app/ui/SiteNav";
import SiteFooter from "@/app/ui/SiteFooter";
import { ButtonLink } from "@/app/ui/Button";
import { Reveal, WordReveal } from "@/app/ui/Reveal";
import { StandMock } from "@/app/ui/PartnerVisuals";
import Phone, { BrowserFrame } from "@/app/ui/Phone";
import Icon3D, { type Icon3DName } from "@/app/ui/Icon3D";
import Photo from "@/app/ui/Photo";
import PricingPlans from "@/app/ui/PricingPlans";
import DemoOffer from "@/app/ui/DemoOffer";
import { DEMO } from "@/lib/demo";
import type { FaqItem } from "@/app/ui/Faq";
import FaqBlock from "@/app/ui/FaqBlock";

export const metadata: Metadata = {
  title: "Loyavi za lokale: digitalna kartica zvestobe",
  description:
    DEMO
      ? "Digitalna kartica zvestobe za kavarne, lokale in storitve. Gostje zbirajo žige z računom ali na stojalu, ti določiš nagrade. V demo obdobju brezplačno za vse lokale, brez kartice."
      : "Digitalna kartica zvestobe za kavarne, lokale in storitve. Gostje zbirajo žige z računom ali na stojalu, ti določiš nagrade. Prvih 30 dni brezplačno, brez kartice.",
  alternates: { canonical: "/partnerji" },
};

const NAV = [
  { href: "/partnerji#funkcije", label: "Funkcije" },
  { href: "/partnerji#kako", label: "Kako deluje" },
  DEMO ? { href: "/partnerji#demo", label: "Demo" } : { href: "/partnerji#cenik", label: "Cenik" },
  { href: "/", label: "Za goste" },
];
const CTA = { href: "/partner", label: DEMO ? "Začni brezplačno" : "Preizkusi brezplačno" };
// besedila, ki se med demo obdobjem razlikujejo od rednega cenika
const HERO_CTA = DEMO ? "Ustvari račun lokala" : "Preizkusi 30 dni brezplačno";
const HERO_PILL = DEMO ? "Demo obdobje: brezplačno za vse lokale" : "Za kavarne, lokale in storitve";
const HERO_TRUST = DEMO ? ["0 € v demo obdobju", "Brez vpisa kartice", "Vse funkcije vključene"] : ["Brez vpisa kartice", "Brez vezave", "Postavitev v nekaj minutah"];

type Point = [Icon3DName, string];

// Tri funkcije, ki lokalu prinesejo največ: ocene, samodejna sporočila in kampanje.
const REVIEWS: Point[] = [
  ["zvezda", "Povabilo pride takoj po obisku, ne teden pozneje"],
  ["pismo", "Pripombe prejmeš ti, v nadzorni plošči"],
  ["koledar", "Istega gosta vprašamo največ enkrat na dva meseca"],
];
const AUTOMATIONS: Point[] = [
  ["torta", "Rojstni dan gosta z darilom"],
  ["zvonec", "Povabilo, ko gosta ni bilo več tednov"],
  ["koledar", "Obletnica kartice in praznik tvojega lokala"],
];
const CAMPAIGNS: Point[] = [
  ["megafon", "Skupine: vsi, aktivni, neaktivni in tik pred nagrado"],
  ["kupon", "Kupon dodaš z enim poljem"],
  ["scit", "Prejmejo jih gostje, ki so ponudbe dovolili. Odjava je v vsakem sporočilu."],
];

const BENEFITS = [
  { icon: "srce" as Icon3DName, title: "Gostje se vračajo pogosteje", text: "Kartica je vedno v telefonu in napredek do nagrade vedno na očeh. Pozabljen kartonček ni več izgovor.", wide: true },
  { icon: "kartice" as Icon3DName, title: "Veš, kdo so tvoji stalni gostje", text: "Vidiš obiske, zadnji obisk in koga loči en sam žig do nagrade. Prvič imaš seznam svojih gostov.", wide: true },
  { icon: "kolo" as Icon3DName, title: "Kolo dobrodošlice", text: "Nov gost enkrat zavrti kolo. Nagrado odklene prvi zabeležen obisk, zato ima razlog, da pride." },
  { icon: "kavarna" as Icon3DName, title: "Stran lokala z menijem", text: "Gost na tvoji strani najde meni, geslo za Wi-Fi, Instagram in pot do tebe. Odpre jo ob vsakem obisku." },
  { icon: "telefon" as Icon3DName, title: "Brez nove opreme", text: "Deluje z računom, ki ga že izdajaš, ali s kodo na pultu. Blagajne ne menjaš." },
];

const STEPS = [
  { title: "Ustvari račun lokala", text: "Vpišeš ime, vrsto in kraj lokala. Dve minuti, brez plačilne kartice." },
  { title: "Določi kartico in nagrado", text: "Izbereš barvo, število žigov in nagrado, na primer brezplačno kavo po osmih obiskih." },
  { title: "Povabi goste", text: "Natisneš kodo za pult ali prilepiš nalepko NFC. Gostje začnejo zbirati še isti dan." },
];

const FAQ_PAID: FaqItem[] = [
  { q: "Koliko stane Loyavi?", a: "Paket Lokal stane 49,99 € na mesec za eno lokacijo, paket Veriga 79,99 € na mesec za do pet lokacij. Ob letnem plačilu sta dva meseca brezplačna. Prvih 30 dni je brezplačnih in brez vpisa kartice." },
  { q: "Ali potrebujem novo blagajno ali opremo?", a: "Ne. Gost lahko obisk zabeleži s kodo QR na fiskalnem računu, ki ga tvoja blagajna že izda. Če želiš hitrejšo pot, natisneš kodo za pult ali uporabiš nalepko NFC." },
  { q: "V čem je razlika med računom in stojalom?", a: "Račun je dokaz nakupa: vsak račun šteje enkrat in samo pri tvojem lokalu. Stojalo je hitrejše, saj gost samo približa telefon, vendar nakupa ne preverja, zato je omejeno na en žig na dan. Izbereš enega ali oba načina." },
  { q: "Kaj je stojalo in kje ga dobim?", a: "Stojalo je koda QR, ki jo natisneš iz nadzorne plošče in postaviš ob blagajno. Dodaš lahko nalepko NFC, ki jo gost samo približa s telefonom. Navodila za oboje so v nadzorni plošči." },
  { q: "Morajo gostje namestiti aplikacijo?", a: "Ne. Loyavi deluje v brskalniku telefona. Gost ustvari račun z elektronskim naslovom in geslom v manj kot minuti." },
  { q: "Kaj se zgodi po 30 dneh?", a: "Izbereš paket in nadaljuješ brez prekinitve. Če se ne odločiš, se zbiranje žigov ustavi, kartice in podatki pa ostanejo shranjeni." },
  { q: "Ali lahko kadar koli prekinem?", a: "Da. Mesečna naročnina nima vezave. Prekineš jo v nadzorni plošči in velja do konca plačanega obdobja." },
  { q: "Ali smem gostom pošiljati ponudbe?", a: "Da, tistim, ki so to dovolili. Gost ob prvi prijavi sam označi, ali želi ponudbe lokalov, pri katerih zbira žige. Čas privolitve shranimo, vsako sporočilo ima povezavo za odjavo. Obvestilo o polni kartici dobijo vsi gostje, ker je del kartice." },
  { q: "Kdo vidi podatke o mojih gostih?", a: "Podatke o gostih svojega lokala vidiš samo ti. Drugi lokali jih ne vidijo in jih ne prodajamo." },
];

const FAQ_DEMO: FaqItem[] = [
  { q: "Koliko stane Loyavi?", a: "V demo obdobju nič. Vsak lokal dobi vse funkcije brezplačno in brez vpisa kartice. Po koncu dema bo Loyavi plačljiv. Ceno objavimo vnaprej, ali nadaljuješ, pa odločiš sam." },
  { q: "Zakaj je brezplačno?", a: "Loyavi je nov. V demo obdobju zbiramo prve lokale in njihove odzive, da izdelek izpilimo skupaj z uporabniki. V zameno je na kartici, v sporočilih in na plakatu podpis Loyavi." },
  { q: "Kako dolgo traja demo?", a: "Predvidoma še mesec ali dva. Datum konca sporočimo vnaprej po elektronski pošti, da te nič ne preseneti." },
  { q: "Kaj se zgodi po koncu dema?", a: "Dobiš obvestilo z datumom in cenikom. Če želiš nadaljevati, izbereš paket. Če ne, se zbiranje žigov ustavi, kartice in podatki pa ostanejo shranjeni. Brez tvoje potrditve se nič ne zaračuna, saj plačilnih podatkov ne zbiramo." },
  { q: "Kakšne so omejitve dema?", a: "En račun pomeni en lokal. Za verige in več lokalov nam pošlji povpraševanje in dostop uredimo po dogovoru. Podpisa Loyavi na strani gosta, v sporočilih in na plakatu ni mogoče odstraniti." },
  { q: "Ali potrebujem novo blagajno ali opremo?", a: "Ne. Gost lahko obisk zabeleži s kodo QR na fiskalnem računu, ki ga tvoja blagajna že izda. Če želiš hitrejšo pot, natisneš kodo za pult ali uporabiš nalepko NFC." },
  { q: "V čem je razlika med računom in stojalom?", a: "Račun je dokaz nakupa: vsak račun šteje enkrat in samo pri tvojem lokalu. Stojalo je hitrejše, saj gost samo približa telefon, vendar nakupa ne preverja, zato je omejeno na en žig na dan. Izbereš enega ali oba načina." },
  { q: "Morajo gostje namestiti aplikacijo?", a: "Ne. Loyavi deluje v brskalniku telefona. Gost ustvari račun z elektronskim naslovom in geslom v manj kot minuti." },
  { q: "Ali lahko kadar koli preneham?", a: "Da. Vezave ni. Če Loyavi ne želiš več uporabljati, nam piši in račun lokala s podatki izbrišemo." },
  { q: "Ali smem gostom pošiljati ponudbe?", a: "Da, tistim, ki so to dovolili. Gost ob prvi prijavi sam označi, ali želi ponudbe lokalov, pri katerih zbira žige. Čas privolitve shranimo, vsako sporočilo ima povezavo za odjavo. Obvestilo o polni kartici dobijo vsi gostje, ker je del kartice." },
  { q: "Kdo vidi podatke o mojih gostih?", a: "Podatke o gostih svojega lokala vidiš samo ti. Drugi lokali jih ne vidijo in jih ne prodajamo." },
];

const FAQ = DEMO ? FAQ_DEMO : FAQ_PAID;

function SectionHead({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
      <p className="rounded-full bg-tint px-3 py-1 text-sm font-semibold text-brand-ink">{eyebrow}</p>
      <h2 className="text-4xl font-semibold tracking-tight text-fg lg:text-5xl">{title}</h2>
      {text && <p className="text-lg text-mute">{text}</p>}
    </Reveal>
  );
}

/** Funkcija s pravim zaslonom: besedilo in točke na eni strani, posnetek na drugi. */
function FeatureRow({ pill, title, text, points, flip = false, children }: { pill: string; title: string; text: string; points: Point[]; flip?: boolean; children: React.ReactNode }) {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
      <Reveal className={`flex flex-col items-start gap-6 ${flip ? "lg:order-2" : ""}`}>
        <p className="rounded-full bg-tint px-3 py-1 text-sm font-semibold text-brand-ink">{pill}</p>
        <h3 className="text-3xl font-semibold tracking-tight text-fg lg:text-4xl">{title}</h3>
        <p className="text-lg text-mute">{text}</p>
        <ul className="flex w-full flex-col gap-3">
          {points.map(([icon, t]) => (
            <li key={t} className="flex items-center gap-4 rounded-2xl bg-card p-3 pr-6 shadow-card">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-tint">
                <Icon3D name={icon} size={40} />
              </span>
              <span className="text-base font-medium text-fg">{t}</span>
            </li>
          ))}
        </ul>
      </Reveal>
      <Reveal delay={150} className={`relative mx-auto w-full ${flip ? "lg:order-1" : ""}`}>
        {children}
      </Reveal>
    </div>
  );
}

export default function Partnerji() {
  return (
    <>
      <SiteNav links={NAV} cta={CTA} />
      <main id="vsebina">
        {/* HERO: modra podlaga, velik naslov, rdeč gumb */}
        <section className="on-brand flex min-h-svh flex-col overflow-hidden bg-brand text-on-brand">
          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-12 px-6 pb-16 pt-28 lg:flex-row lg:items-end lg:gap-12 lg:pb-0">
            <Reveal className="flex flex-1 flex-col items-start gap-6 lg:self-center lg:pb-12">
              <p className="flex items-center gap-2 rounded-full bg-base px-3 py-2 text-sm font-semibold text-brand-ink">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" aria-hidden="true" />
                  <span className="relative inline-flex size-2 rounded-full bg-accent" aria-hidden="true" />
                </span>
                {HERO_PILL}
              </p>
              {/* večji razmik vrstic: vejica v prvi vrstici se sicer dotakne strešice na Č v drugi */}
              <h1 className="display text-6xl sm:text-8xl lg:text-9xl" style={{ lineHeight: 1.3 }}>
                Gostje, ki
                <br />
                se vračajo.
              </h1>
              <p className="max-w-[680px] text-lg font-medium lg:text-xl">
                Digitalna kartica zvestobe za tvoj lokal. Gost zabeleži obisk z računom ali na stojalu ob blagajni, ti določiš nagrade in vidiš, kdo se vrača.
              </p>
              <ButtonLink href={CTA.href} size="lg">
                {HERO_CTA}
                <ArrowRight size={16} weight="bold" aria-hidden="true" />
              </ButtonLink>
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
                {HERO_TRUST.map((t) => (
                  <li key={t} className="flex items-center gap-2 whitespace-nowrap">
                    <Check size={16} weight="bold" aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={150} className="relative w-full max-w-sm flex-1 lg:max-w-md">
              <Photo src="/photos/owner.jpg" alt="Lastnica kavarne z nasmehom stoji med modrimi vrati svojega lokala" shape="arch" priority className="aspect-[3/4]" sizes="(min-width: 1024px) 40vw, 90vw" />
              <StandMock className="absolute -left-8 bottom-16 hidden w-40 animate-[float-b_8s_ease-in-out_infinite] lg:flex" />
            </Reveal>
          </div>
        </section>

        {/* NADZORNA PLOŠČA: pravi posnetek z vzorčnimi podatki */}
        <section className="atmo px-6 py-24">
          <div className="mx-auto flex max-w-6xl flex-col gap-12">
            <SectionHead eyebrow="Nadzorna plošča" title="Vidiš, kdo se vrača." text="Gostje, obiski, nagrade in ocene na enem zaslonu. Brez tabel in brez ugibanja, katera akcija je delovala." />
            <Reveal delay={100} className="relative mx-auto w-full max-w-5xl">
              <BrowserFrame src="/screens/plosca.webp" alt="Nadzorna plošča Loyavi s pregledom gostov, obiskov in nagrad" />
              <div className="absolute -bottom-12 -right-8 hidden w-52 lg:block">
                <Phone src="/screens/denarnica.webp" alt="Denarnica gosta s karticami zvestobe" />
              </div>
              <p className="mt-4 text-center text-sm text-dim">Primer prikaza z vzorčnimi podatki.</p>
            </Reveal>
          </div>
        </section>

        {/* FUNKCIJE: kaj Loyavi dela za lokal, ko ima gost kartico */}
        <section id="funkcije" className="scroll-mt-24 px-6 py-24">
          <div className="mx-auto flex max-w-6xl flex-col gap-24">
            <SectionHead
              eyebrow="Funkcije"
              title="Žig je šele začetek."
              text="Ko gost doda tvojo kartico, Loyavi dela naprej. Prosi za oceno, čestita za rojstni dan in povabi nazaj goste, ki jih dolgo ni bilo."
            />

            <FeatureRow
              pill="Ocene na Googlu"
              title="Zadovoljen gost te oceni, dokler je še pri tebi."
              text="Ko gost zabeleži obisk, ga vprašamo, kako je bilo. Zadovoljen gost z enim dotikom odpre tvojo stran na Googlu. Kdor ni bil zadovoljen, lahko najprej piše tebi."
              points={REVIEWS}
            >
              <div className="relative mx-auto flex h-96 w-full justify-center overflow-hidden rounded-3xl bg-tint px-12 lg:h-auto lg:max-w-xs lg:overflow-visible lg:rounded-none lg:bg-transparent lg:p-0 items-end pb-8">
                <Phone src="/screens/ocena.webp" alt="Gost po obisku oceni lokal s petimi zvezdicami in odpre oceno na Googlu" className="w-full max-w-56 shrink-0 lg:max-w-none" />
                <Icon3D name="zvezda" size={120} className="absolute -right-16 top-24 hidden rotate-12 drop-shadow-lg lg:block" />
                <Icon3D name="srce" size={96} className="absolute -left-20 bottom-48 hidden -rotate-12 drop-shadow-lg lg:block" />
              </div>
            </FeatureRow>

            <FeatureRow
              flip
              pill="Samodejna sporočila"
              title="Nastaviš enkrat. Potem se pošilja samo."
              text="Loyavi gostu čestita za rojstni dan, ga povabi nazaj, ko ga dolgo ni bilo, in se mu zahvali ob obletnici. Vsakemu sporočilu lahko dodaš kupon, ki se shrani v gostovo denarnico."
              points={AUTOMATIONS}
            >
              <div className="relative mx-auto flex h-96 w-full justify-center overflow-hidden rounded-3xl bg-tint px-12 lg:h-auto lg:max-w-xs lg:overflow-visible lg:rounded-none lg:bg-transparent lg:p-0 items-start pt-8">
                <Phone src="/screens/sporocilo.webp" alt="Sporočilo lokala gostu za rojstni dan s kuponom za kos torte" className="w-full max-w-56 shrink-0 lg:max-w-none" />
                <Icon3D name="torta" size={120} className="absolute -left-24 top-16 hidden -rotate-12 drop-shadow-lg lg:block" />
                <Icon3D name="darilo" size={104} className="absolute -right-20 bottom-24 hidden rotate-6 drop-shadow-lg lg:block" />
              </div>
            </FeatureRow>

            <FeatureRow
              pill="Kampanje"
              title="Novica ali ponudba vsem gostom v nekaj minutah."
              text="Napišeš sporočilo, izbereš skupino in pošlješ. Na primer vsem, ki jih ni bilo mesec dni, ali tistim, ki jim do nagrade manjkata dva žiga."
              points={CAMPAIGNS}
            >
              <div className="relative">
                <BrowserFrame src="/screens/kampanja.webp" alt="Nadzorna plošča Loyavi z obrazcem za novo sporočilo gostom" aspect="aspect-[5/4]" />
                <Icon3D name="megafon" size={112} className="absolute -right-8 -top-12 hidden rotate-6 drop-shadow-lg lg:block" />
              </div>
              <p className="mt-4 text-center text-sm text-dim">Primer prikaza z vzorčnimi podatki.</p>
            </FeatureRow>
          </div>
        </section>

        {/* SLOGAN */}
        <section id="slogan" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
          <WordReveal
            className="display mx-auto max-w-4xl text-balance text-center text-5xl sm:text-7xl lg:text-8xl"
            lines={["Kartonček se izgubi.", "Gost s kartico v telefonu se vrne."]}
          />
        </section>

        {/* PREDNOSTI */}
        <section id="prednosti" className="atmo scroll-mt-24 px-6 py-24">
          <div className="mx-auto flex max-w-6xl flex-col gap-12">
            <SectionHead eyebrow="Prednosti" title="Kaj še dobi tvoj lokal." />
            <div className="grid gap-4 lg:grid-cols-6">
              {BENEFITS.map((b, i) => (
                <Reveal key={b.title} delay={i * 80} className={`group flex flex-col gap-4 rounded-3xl bg-card p-8 shadow-card transition-all duration-700 ease-spring hover:-translate-y-1 hover:shadow-pop ${b.wide ? "lg:col-span-3" : "lg:col-span-2"}`}>
                  <span className="flex size-16 items-center justify-center rounded-2xl bg-tint">
                    <Icon3D name={b.icon} size={52} className="transition-all duration-700 ease-spring group-hover:scale-110" />
                  </span>
                  <h3 className="text-xl font-semibold tracking-tight text-fg">{b.title}</h3>
                  <p className="text-base text-mute">{b.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* FOTOGRAFIJE: gostje in lokali */}
        <section aria-label="Utrinki iz lokalov" className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid grid-cols-2 items-end gap-4 lg:grid-cols-4">
            <Reveal className="col-span-2">
              <Photo src="/photos/terrace.jpg" alt="Družba nazdravlja s kavo na sončni terasi" className="aspect-video" sizes="(min-width: 1024px) 50vw, 100vw" />
            </Reveal>
            <Reveal delay={100}>
              <Photo src="/photos/tap.jpg" alt="Gost približa telefon stojalu ob blagajni" shape="pill" className="aspect-[3/5]" />
            </Reveal>
            <Reveal delay={200}>
              <Photo src="/photos/barista.jpg" alt="Natakarica čez pult podaja kapučino" shape="circle" className="aspect-square" />
            </Reveal>
          </div>
        </section>

        {/* NAČINA BELEŽENJA */}
        <section className="mx-auto max-w-6xl px-6 py-24">
          <SectionHead eyebrow="Beleženje obiskov" title="Račun, stojalo ali oboje." text="Sam izbereš, kako gostje zabeležijo obisk. Način lahko kadar koli zamenjaš." />
          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            {[
              { icon: "zig" as Icon3DName, title: "Fiskalni račun", text: "Gost skenira kodo QR na računu. Sistem preveri, da je račun tvoj, da je svež in da še ni bil uporabljen.", points: ["Žig samo ob resničnem nakupu", "Vsak račun šteje enkrat", "Nič dodatne opreme"] },
              { icon: "telefon" as Icon3DName, title: "Stojalo ob blagajni", text: "Gost približa telefon nalepki NFC ali skenira kodo na pultu. Obisk je zabeležen v sekundi.", points: ["Najhitrejša pot do žiga", "En žig na gosta na dan", "Kodo natisneš sam"] },
            ].map((m, i) => (
              <Reveal key={m.title} delay={i * 120} className="group flex items-start gap-6 rounded-3xl bg-card p-8 shadow-card transition-all duration-700 ease-spring hover:-translate-y-1 hover:shadow-pop">
                <span className="flex size-24 shrink-0 items-center justify-center rounded-3xl bg-tint">
                  <Icon3D name={m.icon} size={80} className="transition-all duration-700 ease-spring group-hover:scale-110" />
                </span>
                <div className="flex flex-col gap-4">
                  <h3 className="text-2xl font-semibold tracking-tight text-fg">{m.title}</h3>
                  <p className="text-base text-mute">{m.text}</p>
                  <ul className="flex flex-col gap-2 text-sm text-fg">
                    {m.points.map((t) => (
                      <li key={t} className="flex items-center gap-2">
                        <span className="flex size-5 items-center justify-center rounded-full bg-tint text-brand-ink">
                          <Check size={12} weight="bold" aria-hidden="true" />
                        </span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* KAKO DELUJE */}
        <section id="kako" className="atmo scroll-mt-24 px-6 py-24">
          <div className="mx-auto flex max-w-6xl flex-col gap-12">
            <SectionHead eyebrow="Kako deluje" title="Od prijave do prvega žiga v enem popoldnevu." />
            <ol className="grid gap-4 lg:grid-cols-3">
              {STEPS.map((s, i) => (
                <Reveal key={s.title} delay={i * 100}>
                  <li className="flex h-full flex-col gap-4 rounded-3xl bg-card p-8 shadow-card">
                    <span className="flex size-10 items-center justify-center rounded-full bg-fg font-mono text-base font-semibold text-card">{i + 1}</span>
                    <h3 className="text-2xl font-semibold tracking-tight text-fg">{s.title}</h3>
                    <p className="text-base text-mute">{s.text}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* DEMO PONUDBA (med demo obdobjem namesto cenika) */}
        {DEMO ? (
          <section id="demo" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
            <SectionHead eyebrow="Demo obdobje" title="Vse funkcije. Nič evrov." text="Loyavi je nov. Dokler traja demo, ga vsak lokal uporablja brezplačno in brez vpisa kartice." />
            <div className="mt-12">
              <DemoOffer cta={CTA.href} />
            </div>
          </section>
        ) : (
          <section id="cenik" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
            <SectionHead eyebrow="Cenik" title="Vse vključeno v vsakem paketu." text="Brez doplačil za posamezne funkcije in brez provizij na obisk." />
            <Reveal className="mt-12">
              <PricingPlans />
            </Reveal>
          </section>
        )}

        {/* VPRAŠANJA */}
        <FaqBlock title="Preden se odločiš." text="Odgovori na vprašanja, ki jih lastniki lokalov postavijo najprej." items={FAQ} />

        {/* ZAKLJUČNI POZIV */}
        <section className="mx-auto max-w-6xl px-6 py-24">
          <Reveal className="on-brand flex flex-col items-center gap-6 overflow-hidden rounded-3xl bg-brand px-8 pt-16 text-center text-on-brand lg:px-16 lg:pt-24">
            <h2 className="display max-w-4xl text-6xl sm:text-7xl lg:text-8xl">Prvi žigi lahko padejo že danes.</h2>
            <p className="max-w-xl text-lg font-medium">Ustvari račun lokala, določi nagrado in povabi goste. {DEMO ? "V demo obdobju brezplačno, brez vpisa kartice." : "30 dni brezplačno, brez vpisa kartice."}</p>
            <ButtonLink href={CTA.href} size="lg">
              {HERO_CTA}
              <ArrowRight size={16} weight="bold" aria-hidden="true" />
            </ButtonLink>
            <div className="mt-8 grid w-full max-w-3xl grid-cols-3 items-end gap-4">
              <Photo src="/photos/barista.jpg" alt="" shape="arch" className="aspect-[3/4]" sizes="25vw" />
              <Photo src="/photos/tap.jpg" alt="" shape="rise" className="aspect-[3/5]" sizes="25vw" />
              <Photo src="/photos/salon.jpg" alt="" shape="arch" className="aspect-[3/4]" sizes="25vw" />
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
