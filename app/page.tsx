import type { Metadata } from "next";
import { ArrowRight, Check, X, Cards, Lightning, Gift, DeviceMobile, Wallet } from "@phosphor-icons/react/dist/ssr";
import SiteNav from "@/app/ui/SiteNav";
import SiteFooter from "@/app/ui/SiteFooter";
import { ButtonLink } from "@/app/ui/Button";
import { Reveal, WordReveal } from "@/app/ui/Reveal";
import PhoneFrame from "@/app/ui/PhoneFrame";
import WalletMock from "@/app/ui/WalletMock";
import Photo from "@/app/ui/Photo";
import CategoryIcon from "@/app/ui/CategoryIcon";
import Faq, { type FaqItem } from "@/app/ui/Faq";
import { CATEGORIES } from "@/lib/categories";

export const metadata: Metadata = {
  title: { absolute: "Loyavi: vse kartice zvestobe v telefonu" },
  description:
    "Zbiraj žige v najljubših lokalih in prevzemi nagrade. Vse kartice zvestobe na enem mestu, brezplačno in brez nameščanja aplikacije.",
  alternates: { canonical: "/" },
};

const NAV = [
  { href: "/#kako", label: "Kako deluje" },
  { href: "/#kje", label: "Kje deluje" },
  { href: "/#vprasanja", label: "Vprašanja" },
  { href: "/partnerji", label: "Za lokale" },
];
const CTA = { href: "/app", label: "Odpri denarnico" };

const BENEFITS = [
  { icon: Cards, title: "Vse kartice na enem mestu", text: "Kavarna, brivec in cvetličarna v isti denarnici. Pri vsakem lokalu takoj vidiš, koliko obiskov te še loči od nagrade." },
  { icon: Lightning, title: "Žig v nekaj sekundah", text: "Skeniraš kodo QR z računa ali približaš telefon stojalu ob blagajni. Obisk je zabeležen, še preden pospraviš denarnico." },
  { icon: Gift, title: "Nagrade določi lokal", text: "Brezplačna kava, popust ali darilo. Ko je kartica polna, kupon pokažeš ob blagajni." },
  { icon: DeviceMobile, title: "Brez nameščanja", text: "Deluje v brskalniku telefona. Če želiš, jo dodaš na začetni zaslon in odpreš kot aplikacijo." },
  { icon: Wallet, title: "0 € za goste", text: "Brez naročnine in brez skritih stroškov. Nagrade ti podarijo lokali." },
];

const STEPS = [
  { title: "Ustvari račun", text: "Vpišeš elektronski naslov in geslo. Traja manj kot minuto." },
  { title: "Zabeleži obisk", text: "Skeniraj kodo QR z računa ali približaj telefon stojalu Loyavi." },
  { title: "Prevzemi nagrado", text: "Polno kartico zamenjaš za nagrado, ki jo je določil lokal." },
];

const FAQ: FaqItem[] = [
  { q: "Je Loyavi za goste res brezplačen?", a: "Da. Za goste ni naročnine in ni skritih stroškov. Nagrade podarijo lokali, ki sodelujejo." },
  { q: "Moram namestiti aplikacijo?", a: "Ne. Loyavi deluje v brskalniku telefona. Za hitrejši dostop ga lahko dodaš na začetni zaslon, kjer se odpre kot običajna aplikacija." },
  { q: "Kako zabeležim obisk?", a: "Odvisno od lokala. Pri nekaterih skeniraš kodo QR s fiskalnega računa, pri drugih približaš telefon stojalu ob blagajni ali skeniraš kodo na njem." },
  { q: "Zakaj skeniram račun?", a: "Koda QR na fiskalnem računu potrdi, da je bil nakup res opravljen v tem lokalu. Vsak račun šteje samo enkrat, zato so žigi pošteni za vse." },
  { q: "Kako prevzamem nagrado?", a: "Ko zbereš vse žige, se v denarnici pojavi kupon. Aktiviraš ga ob blagajni, osebje ga potrdi in nagrada je tvoja." },
  { q: "Kaj se zgodi, če zamenjam telefon?", a: "Nič. Kartice so shranjene v tvojem računu. Na novem telefonu se prijaviš in vse te čaka tam." },
  { q: "V katerih lokalih deluje?", a: "V vseh, ki so se pridružili. Seznam najdeš v denarnici pod zavihkom Lokali in se dopolnjuje z vsakim novim partnerjem." },
  { q: "Kaj se zgodi z mojimi podatki?", a: "Lokal vidi tvoj elektronski naslov in obiske pri njem, da te lahko nagradi. Podatkov ne prodajamo. Podrobnosti so v politiki zasebnosti." },
  { q: "Deluje na iPhonu in na Androidu?", a: "Da. Potrebuješ samo telefon s kamero in sodoben brskalnik." },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

function SectionHead({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <Reveal className="flex max-w-3xl flex-col gap-4">
      <p className="font-mono text-sm font-medium uppercase tracking-widest text-brand-ink">{eyebrow}</p>
      <h2 className="display text-5xl text-fg lg:text-7xl">{title}</h2>
      {text && <p className="max-w-2xl text-lg text-mute">{text}</p>}
    </Reveal>
  );
}

export default function Home() {
  return (
    <>
      <SiteNav links={NAV} cta={CTA} />
      <main id="vsebina">
        {/* HERO: modra podlaga, velik naslov, rdeč gumb, kolaž raste iz spodnjega roba */}
        <section className="on-brand overflow-hidden bg-brand text-on-brand">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 pt-32 text-center">
            <Reveal className="flex flex-col items-center gap-6">
              <p className="flex items-center gap-2 rounded-full bg-base/20 px-3 py-2 text-sm font-medium">
                <span className="size-2 rounded-full bg-base" aria-hidden="true" />
                Digitalne kartice zvestobe za Slovenijo
              </p>
              <h1 className="display text-6xl sm:text-8xl lg:text-9xl">
                Žigi, ki se
                <br />
                ne izgubijo.
              </h1>
              <p className="max-w-[680px] text-lg font-medium lg:text-xl">
                Vse kartice zvestobe iz tvojih najljubših lokalov na enem mestu. Skeniraj račun ali približaj telefon stojalu in žig je tvoj.
              </p>
              <ButtonLink href={CTA.href} size="lg">
                Odpri svojo denarnico
                <ArrowRight size={16} weight="bold" aria-hidden="true" />
              </ButtonLink>
              <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium">
                {["Brezplačno za goste", "Brez nameščanja iz trgovine", "Deluje na vsakem telefonu"].map((t) => (
                  <li key={t} className="flex items-center gap-2 whitespace-nowrap">
                    <Check size={16} weight="bold" aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>

            {/* namizje: pet oblik v vrsti */}
            <Reveal delay={150} className="mt-8 hidden w-full grid-cols-[1fr_1fr_1.25fr_1fr_1fr] items-end gap-4 lg:grid">
              <Photo src="/photos/friends.jpg" alt="Prijatelja se smejita s kavo v rokah pod modrim nebom" shape="rise" priority className="aspect-[3/4]" />
              <Photo src="/photos/iced.jpg" alt="Dekle s sončnimi očali pije ledeno kavo" shape="arch" priority className="aspect-[3/5]" />
              <div className="h-96 overflow-hidden" aria-hidden="true">
                <PhoneFrame>
                  <WalletMock />
                </PhoneFrame>
              </div>
              <Photo src="/photos/barista.jpg" alt="Natakarica čez pult podaja kapučino" shape="circle" priority className="mb-12 aspect-square" />
              <Photo src="/photos/tap.jpg" alt="Gost približa telefon stojalu ob blagajni" shape="rise" priority className="aspect-[3/4]" />
            </Reveal>

            {/* telefon: aplikacija v sredini, fotografiji ob straneh */}
            <Reveal delay={150} className="relative mt-8 flex h-80 w-full max-w-sm items-end justify-center lg:hidden">
              <div className="absolute bottom-0 left-0 w-28">
                <Photo src="/photos/iced.jpg" alt="Dekle s sončnimi očali pije ledeno kavo" shape="arch" priority sizes="30vw" className="aspect-[3/5]" />
              </div>
              <div className="absolute bottom-16 right-0 w-28">
                <Photo src="/photos/barista.jpg" alt="Natakarica čez pult podaja kapučino" shape="circle" priority sizes="30vw" className="aspect-square" />
              </div>
              <div className="relative z-10 h-72 w-48 overflow-hidden" aria-hidden="true">
                <PhoneFrame>
                  <WalletMock />
                </PhoneFrame>
              </div>
            </Reveal>
          </div>
        </section>

        {/* KATEGORIJE: tekoči trak */}
        <section aria-label="Vrste lokalov" className="overflow-hidden py-8">
          <div className="flex w-max animate-[marquee_48s_linear_infinite] gap-3">
            {[0, 1].map((copy) => (
              <ul key={copy} className="flex gap-3" aria-hidden={copy === 1}>
                {CATEGORIES.map((c) => (
                  <li key={c.key} className="flex items-center gap-2 rounded-full bg-s1 px-4 py-3 text-base font-medium whitespace-nowrap text-fg">
                    <CategoryIcon category={c.key} size={20} weight="bold" className="text-brand-ink" />
                    {c.plural}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </section>

        {/* PROBLEM → REŠITEV */}
        <section id="zakaj" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
          <SectionHead eyebrow="Zakaj" title="Kartonček ostane doma. Telefon je vedno s tabo." />
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            <Reveal>
              <Photo src="/photos/flatlay.jpg" alt="Kapučino in rogljiček na modri mizi" className="aspect-square lg:aspect-auto lg:h-full" sizes="(min-width: 1024px) 33vw, 100vw" />
            </Reveal>
            <Reveal delay={100} className="flex flex-col gap-6 rounded-3xl bg-s1 p-8">
              <p className="text-2xl font-semibold tracking-tight text-mute">Papirnat kartonček</p>
              <ul className="flex flex-col gap-4">
                {["Ostane doma ravno takrat, ko ga potrebuješ.", "Se zmoči, strga ali izgubi skupaj z žigi.", "Vsak lokal ima svojega, denarnica pa je vse debelejša."].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-lg text-mute">
                    <X size={24} weight="bold" className="mt-0.5 shrink-0 text-dim" aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={200} className="flex flex-col gap-6 rounded-3xl bg-brand p-8 text-on-brand">
              <p className="text-2xl font-semibold tracking-tight">Kartica v Loyavi</p>
              <ul className="flex flex-col gap-4">
                {["Vedno v telefonu, ki ga imaš pri sebi.", "Žigi so varno shranjeni v tvojem računu.", "Vsi lokali v eni denarnici, brez iskanja."].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-lg font-medium">
                    <Check size={24} weight="bold" className="mt-0.5 shrink-0" aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* SLOGAN */}
        <section id="slogan" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
          <WordReveal className="display max-w-4xl text-5xl sm:text-7xl lg:text-8xl" lines={["Vsak obisk šteje.", "Tudi tisti, ko kartonček ostane doma."]} />
        </section>

        {/* PREDNOSTI: besedilo in fotografije v isti mreži */}
        <section id="prednosti" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
          <SectionHead eyebrow="Prednosti" title="Manj kartončkov, več nagrad." text="Loyavi zamenja kup papirnatih kartic z eno denarnico, ki jo imaš vedno pri sebi." />
          <div className="mt-12 grid gap-4 lg:grid-cols-6">
            {BENEFITS.slice(0, 2).map((b, i) => (
              <Reveal key={b.title} delay={i * 80} className="flex flex-col gap-4 rounded-3xl bg-s1 p-8 lg:col-span-3">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-tint text-brand-ink">
                  <b.icon size={24} weight="bold" aria-hidden="true" />
                </span>
                <h3 className="text-2xl font-semibold tracking-tight text-fg">{b.title}</h3>
                <p className="text-base text-mute">{b.text}</p>
              </Reveal>
            ))}
            <Reveal className="flex flex-col gap-4 rounded-3xl bg-s1 p-8 lg:col-span-2">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-tint text-brand-ink">
                <Gift size={24} weight="bold" aria-hidden="true" />
              </span>
              <h3 className="text-2xl font-semibold tracking-tight text-fg">{BENEFITS[2].title}</h3>
              <p className="text-base text-mute">{BENEFITS[2].text}</p>
            </Reveal>
            <Reveal delay={80} className="lg:col-span-2">
              <Photo src="/photos/icecream.jpg" alt="Prijatelja s sladoledom pod modrim nebom" shape="circle" className="mx-auto aspect-square w-full max-w-sm" sizes="(min-width: 1024px) 33vw, 100vw" />
            </Reveal>
            <Reveal delay={160} className="flex flex-col gap-4 rounded-3xl bg-s1 p-8 lg:col-span-2">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-tint text-brand-ink">
                <DeviceMobile size={24} weight="bold" aria-hidden="true" />
              </span>
              <h3 className="text-2xl font-semibold tracking-tight text-fg">{BENEFITS[3].title}</h3>
              <p className="text-base text-mute">{BENEFITS[3].text}</p>
            </Reveal>
            <Reveal className="lg:col-span-4">
              <Photo src="/photos/terrace.jpg" alt="Družba nazdravlja s kavo na sončni terasi" className="aspect-video lg:aspect-auto lg:h-full" sizes="(min-width: 1024px) 66vw, 100vw" />
            </Reveal>
            <Reveal delay={80} className="flex flex-col gap-4 rounded-3xl bg-brand p-8 text-on-brand lg:col-span-2">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-base/20">
                <Wallet size={24} weight="bold" aria-hidden="true" />
              </span>
              <h3 className="display text-6xl">{BENEFITS[4].title}</h3>
              <p className="text-base font-medium">{BENEFITS[4].text}</p>
            </Reveal>
          </div>
        </section>

        {/* KAKO DELUJE */}
        <section id="kako" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
          <SectionHead eyebrow="Kako deluje" title="Trije koraki do prve nagrade." />
          <ol className="mt-12 grid gap-4 lg:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 100}>
                <li className="flex h-full flex-col gap-4 rounded-3xl bg-s1 p-8">
                  <span className="display text-8xl text-brand" aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3 className="text-2xl font-semibold tracking-tight text-fg">{s.title}</h3>
                  <p className="text-base text-mute">{s.text}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* KJE DELUJE */}
        <section id="kje" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
          <SectionHead eyebrow="Kje deluje" title="Povsod, kamor se vračaš." text="Loyavi je narejen za lokalne ponudnike vseh vrst. Seznam lokalov raste z vsakim novim partnerjem." />
          <div className="mt-12 grid grid-cols-2 items-end gap-4 lg:grid-cols-4">
            <Reveal className="col-span-2">
              <Photo src="/photos/salon.jpg" alt="Frizerka in stranka se smejita v svetlem salonu" className="aspect-[4/3]" sizes="(min-width: 1024px) 50vw, 100vw" />
            </Reveal>
            <Reveal delay={100}>
              <Photo src="/photos/florist.jpg" alt="Cvetličarka stranki podaja šopek" shape="pill" className="aspect-[3/5]" />
            </Reveal>
            <Reveal delay={200}>
              <Photo src="/photos/bakery.jpg" alt="Lastnica pekarne za pultom s svežim pecivom" className="aspect-[3/4]" />
            </Reveal>
          </div>
        </section>

        {/* ZA LOKALE */}
        <section id="lokali" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
          <Reveal className="flex flex-col items-start gap-8 rounded-3xl bg-tint p-8 lg:flex-row lg:items-center lg:justify-between lg:p-16">
            <div className="flex max-w-xl flex-col gap-4">
              <p className="font-mono text-sm font-medium uppercase tracking-widest text-brand-ink">Za lokale</p>
              <h2 className="display text-5xl text-fg lg:text-6xl">Imaš lokal? Gostje se bodo vračali pogosteje.</h2>
              <p className="text-lg text-mute">Zamenjaj kartončke z digitalno kartico zvestobe. Postaviš jo v nekaj minutah, nagrade določiš sam.</p>
            </div>
            <ButtonLink href="/partnerji" size="lg">
              Loyavi za lokale
              <ArrowRight size={16} weight="bold" aria-hidden="true" />
            </ButtonLink>
          </Reveal>
        </section>

        {/* VPRAŠANJA */}
        <section id="vprasanja" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
            <SectionHead eyebrow="Vprašanja" title="Preden začneš." text="Če odgovora ne najdeš, nam piši na info@loyavi.app." />
            <Reveal delay={100}>
              <Faq items={FAQ} />
            </Reveal>
          </div>
        </section>

        {/* ZAKLJUČNI POZIV */}
        <section id="zacni" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-24 pt-12">
          <Reveal className="on-brand flex flex-col items-center gap-6 overflow-hidden rounded-3xl bg-brand px-8 pt-16 text-center text-on-brand lg:px-16 lg:pt-24">
            <h2 className="display max-w-4xl text-6xl sm:text-7xl lg:text-8xl">Naslednja kava naj šteje.</h2>
            <p className="max-w-xl text-lg font-medium">Ustvari račun v manj kot minuti in začni zbirati žige že ob naslednjem obisku.</p>
            <ButtonLink href={CTA.href} size="lg">
              Odpri svojo denarnico
              <ArrowRight size={16} weight="bold" aria-hidden="true" />
            </ButtonLink>
            <div className="mt-8 grid w-full max-w-3xl grid-cols-3 items-end gap-4">
              <Photo src="/photos/iced.jpg" alt="" shape="arch" className="aspect-[3/4]" sizes="25vw" />
              <Photo src="/photos/friends.jpg" alt="" shape="rise" className="aspect-[3/5]" sizes="25vw" />
              <Photo src="/photos/icecream.jpg" alt="" shape="arch" className="aspect-[3/4]" sizes="25vw" />
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </>
  );
}
