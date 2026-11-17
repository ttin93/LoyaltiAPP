import type { Metadata } from "next";
import QRCode from "qrcode";
import { ArrowRight, Check } from "@phosphor-icons/react/dist/ssr";
import SiteNav from "@/app/ui/SiteNav";
import SiteFooter from "@/app/ui/SiteFooter";
import { ButtonLink } from "@/app/ui/Button";
import { Reveal, WordReveal } from "@/app/ui/Reveal";
import Phone from "@/app/ui/Phone";
import Photo from "@/app/ui/Photo";
import Icon3D, { type Icon3DName } from "@/app/ui/Icon3D";
import type { FaqItem } from "@/app/ui/Faq";
import FaqBlock from "@/app/ui/FaqBlock";
import { CATEGORIES } from "@/lib/categories";
import { siteOrigin } from "@/lib/brand";
import { DEMO } from "@/lib/demo";

export const metadata: Metadata = {
  title: { absolute: "Loyavi: vse kartice zvestobe v telefonu" },
  description:
    "Zbiraj žige v najljubših lokalih in prevzemi nagrade. Vse kartice zvestobe na enem mestu, brezplačno in brez nameščanja aplikacije.",
  alternates: { canonical: "/" },
};

const NAV = [
  { href: "/#prednosti", label: "Prednosti" },
  { href: "/#kako", label: "Kako deluje" },
  { href: "/#vprasanja", label: "Vprašanja" },
  { href: "/partnerji", label: "Za lokale" },
];
const CTA = { href: "/app", label: "Odpri denarnico" };

const FEATURES: { icon: Icon3DName; title: string; text: string }[] = [
  { icon: "kartice", title: "Vse kartice na enem mestu", text: "Kavarna, brivec in cvetličarna v isti denarnici. Takoj vidiš, koliko obiskov te še loči od nagrade." },
  { icon: "zig", title: "Žig v nekaj sekundah", text: "Skeniraš kodo QR z računa ali približaš telefon stojalu ob blagajni. Obisk je zabeležen." },
  { icon: "darilo", title: "Nagrade določi lokal", text: "Brezplačna kava, popust ali darilo. Ko je kartica polna, kupon pokažeš ob blagajni." },
  { icon: "denarnica", title: "0 € za goste", text: "Brez naročnine in brez skritih stroškov. Nagrade ti podarijo lokali." },
];

const STEPS = [
  { title: "Dodaj kartico", text: "Poišči lokal ali skeniraj kodo na pultu. Račun ustvariš v manj kot minuti.", src: "/screens/lokali.webp", alt: "Zaslon aplikacije s seznamom lokalov", bottom: false },
  { title: "Zabeleži obisk", text: "Skeniraj kodo QR z računa ali približaj telefon stojalu. Žig je na kartici.", src: "/screens/zig.webp", alt: "Zaslon aplikacije s potrjenim žigom", bottom: true },
  { title: "Prevzemi nagrado", text: "Polna kartica postane kupon. Pokažeš ga osebju in nagrada je tvoja.", src: "/screens/kupon.webp", alt: "Zaslon aplikacije s kuponom in časovnikom", bottom: true },
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

function Head({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
      <p className="rounded-full bg-tint px-3 py-1 text-sm font-semibold text-brand-ink">{eyebrow}</p>
      <h2 className="text-4xl font-semibold tracking-tight text-fg lg:text-5xl">{title}</h2>
      {text && <p className="text-lg text-mute">{text}</p>}
    </Reveal>
  );
}

function Feature({ icon, title, text, delay = 0 }: { icon: Icon3DName; title: string; text: string; delay?: number }) {
  return (
    <Reveal delay={delay} className="group flex h-full flex-col gap-4 rounded-3xl bg-card p-6 shadow-card transition-all duration-700 ease-spring hover:-translate-y-1 hover:shadow-pop">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-tint">
        <Icon3D name={icon} size={52} className="transition-all duration-700 ease-spring group-hover:scale-110" />
      </span>
      <h3 className="text-xl font-semibold tracking-tight text-fg">{title}</h3>
      <p className="text-base text-mute">{text}</p>
    </Reveal>
  );
}

export default async function Home() {
  const appUrl = `${siteOrigin()}/app`;
  const qr = await QRCode.toString(appUrl, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#0B1826", light: "#FFFFFF" } });

  return (
    <>
      <SiteNav links={NAV} cta={CTA} />
      <main id="vsebina">
        {/* HERO: ena višina zaslona. Levo naslov in gumb, desno velik kolaž celih slik. */}
        <section className="on-brand flex min-h-svh flex-col justify-center overflow-hidden bg-brand text-on-brand">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-6 pb-12 pt-28 lg:grid-cols-[1fr_1.2fr] lg:gap-8">
            <Reveal className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
              <p className="flex items-center gap-2 rounded-full bg-base/20 px-3 py-2 text-sm font-medium">
                <span className="size-2 rounded-full bg-base" aria-hidden="true" />
                Digitalne kartice zvestobe za Slovenijo
              </p>
              <h1 className="display text-6xl whitespace-nowrap sm:text-7xl lg:text-8xl">
                Žigi, ki se
                <br />
                ne izgubijo.
              </h1>
              <p className="max-w-xl text-lg font-medium lg:text-xl">
                Vse kartice zvestobe iz tvojih najljubših lokalov na enem mestu. Skeniraj račun ali približaj telefon stojalu in žig je tvoj.
              </p>
              <ButtonLink href={CTA.href} size="lg">
                Odpri svojo denarnico
                <ArrowRight size={16} weight="bold" aria-hidden="true" />
              </ButtonLink>
              <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium lg:justify-start">
                {["Brezplačno za goste", "Brez nameščanja iz trgovine", "Deluje na vsakem telefonu"].map((t) => (
                  <li key={t} className="flex items-center gap-2 whitespace-nowrap">
                    <Check size={16} weight="bold" aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>

            {/* kolaž: trije stolpci, vse slike cele */}
            <Reveal delay={150} className="mx-auto grid w-full max-w-2xl grid-cols-3 items-center gap-4">
              <div className="flex flex-col gap-4">
                <Photo src="/photos/friends.jpg" alt="Prijatelja se smejita s kavo v rokah pod modrim nebom" priority className="aspect-[3/4]" sizes="(min-width: 1024px) 20vw, 33vw" />
                <Photo src="/photos/barista.jpg" alt="Natakarica čez pult podaja kapučino" shape="circle" priority className="aspect-square" sizes="(min-width: 1024px) 20vw, 33vw" />
              </div>
              <Phone src="/screens/denarnica.webp" alt="Denarnica Loyavi s karticami zvestobe in nagradami" priority sizes="(min-width: 1024px) 20vw, 33vw" />
              <div className="flex flex-col gap-4">
                <Photo src="/photos/iced.jpg" alt="Dekle s sončnimi očali pije ledeno kavo" shape="arch" priority className="aspect-[3/5] rounded-b-3xl" sizes="(min-width: 1024px) 20vw, 33vw" />
                <Photo src="/photos/tap.jpg" alt="Gost približa telefon stojalu ob blagajni" priority className="aspect-[4/3]" sizes="(min-width: 1024px) 20vw, 33vw" />
              </div>
            </Reveal>
          </div>
        </section>

        {/* PREDNOSTI: bento z zaslonom aplikacije v sredini */}
        <section id="prednosti" className="atmo scroll-mt-24 px-6 py-24">
          <div className="mx-auto flex max-w-6xl flex-col gap-12">
            <Head eyebrow="Prednosti" title="Manj kartončkov, več nagrad." text="Loyavi zamenja kup papirnatih kartic z eno denarnico, ki jo imaš vedno pri sebi." />
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="flex flex-col gap-4">
                <Feature {...FEATURES[0]} />
                <Feature {...FEATURES[1]} delay={80} />
              </div>
              <Reveal delay={120} className="atmo-brand flex flex-col items-center gap-6 overflow-hidden rounded-3xl px-8 pt-8 text-center text-on-brand shadow-brand">
                <div className="flex flex-col gap-2">
                  <h3 className="text-2xl font-semibold tracking-tight">Kartica vsakega lokala</h3>
                  <p className="text-base font-medium opacity-90">Žigi, nagrade in kuponi so vedno na dosegu roke.</p>
                </div>
                <div className="h-96 w-full max-w-64 overflow-hidden">
                  <Phone src="/screens/lokal.webp" alt="Kartica lokala z žigi, gumbom za skeniranje računa in kuponom" />
                </div>
              </Reveal>
              <div className="flex flex-col gap-4">
                <Feature {...FEATURES[2]} delay={160} />
                <Feature {...FEATURES[3]} delay={240} />
              </div>
            </div>
          </div>
        </section>

        {/* KAKO DELUJE: trije koraki, vsak s pravim zaslonom */}
        <section id="kako" className="scroll-mt-24 px-6 py-24">
          <div className="mx-auto flex max-w-6xl flex-col gap-12">
            <Head eyebrow="Kako deluje" title="Trije koraki do prve nagrade." />
            <ol className="grid gap-4 lg:grid-cols-3">
              {STEPS.map((s, i) => (
                <Reveal key={s.title} delay={i * 100}>
                  <li className="flex h-full flex-col overflow-hidden rounded-3xl bg-card shadow-card">
                    <div className="flex flex-col gap-3 p-6">
                      <span className="flex size-10 items-center justify-center rounded-full bg-fg font-mono text-base font-semibold text-card">{i + 1}</span>
                      <h3 className="text-2xl font-semibold tracking-tight text-fg">{s.title}</h3>
                      <p className="text-base text-mute">{s.text}</p>
                    </div>
                    <div className={`mt-auto flex h-80 justify-center overflow-hidden bg-tint px-12 ${s.bottom ? "items-end pb-8" : "items-start pt-8"}`}>
                      <Phone src={s.src} alt={s.alt} className="w-full max-w-56 shrink-0" />
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* SLOGAN */}
        <section id="slogan" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
          <WordReveal className="display max-w-4xl text-5xl sm:text-7xl lg:text-8xl" lines={["Vsak obisk šteje.", "Tudi tisti, ko kartonček ostane doma."]} />
        </section>

        {/* KOLO DOBRODOŠLICE */}
        <section className="atmo px-6 py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
            <Reveal className="flex flex-col items-start gap-6">
              <p className="rounded-full bg-card px-3 py-1 text-sm font-semibold text-brand-ink shadow-card">Dobrodošlica</p>
              <h2 className="text-4xl font-semibold tracking-tight text-fg lg:text-5xl">Prvi obisk se začne z nagrado.</h2>
              <p className="text-lg text-mute">Ko dodaš kartico lokala, enkrat zavrtiš kolo dobrodošlice. Vsako polje je nagrada, prevzameš jo ob prvem obisku.</p>
              <ul className="flex flex-col gap-3">
                {[
                  ["kolo", "En poskus pri vsakem novem lokalu"],
                  ["kupon", "Kupon se shrani v tvojo denarnico"],
                  ["torta", "Ob rojstnem dnevu te lokal lahko preseneti z darilom"],
                ].map(([icon, text]) => (
                  <li key={text} className="flex items-center gap-4 rounded-2xl bg-card p-3 pr-6 shadow-card">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-tint">
                      <Icon3D name={icon as Icon3DName} size={40} />
                    </span>
                    <span className="text-base font-medium text-fg">{text}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={150} className="relative mx-auto w-full max-w-xs">
              <Phone src="/screens/kolo.webp" alt="Kolo dobrodošlice v aplikaciji" />
              <Icon3D name="konfeti" size={120} className="absolute -left-16 top-24 hidden -rotate-12 drop-shadow-lg lg:block" />
              <Icon3D name="darilo" size={112} className="absolute -right-12 bottom-24 hidden rotate-6 drop-shadow-lg lg:block" />
            </Reveal>
          </div>
        </section>

        {/* KJE DELUJE */}
        <section id="kje" className="scroll-mt-24 px-6 py-24">
          <div className="mx-auto flex max-w-6xl flex-col gap-12">
            <Head eyebrow="Kje deluje" title="Povsod, kamor se vračaš." text="Loyavi je narejen za lokalne ponudnike vseh vrst. Seznam lokalov raste z vsakim novim partnerjem." />
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
              {CATEGORIES.map((c, i) => (
                <Reveal key={c.key} delay={(i % 7) * 50}>
                  <li className="group flex h-full flex-col items-center gap-3 rounded-3xl bg-card p-4 text-center shadow-card transition-all duration-700 ease-spring hover:-translate-y-1 hover:shadow-pop">
                    <Icon3D name={c.key as Icon3DName} size={72} className="transition-all duration-700 ease-spring group-hover:scale-110" />
                    <span className="text-sm font-semibold text-fg">{c.plural}</span>
                  </li>
                </Reveal>
              ))}
            </ul>
            <div className="grid grid-cols-2 items-end gap-4 lg:grid-cols-4">
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
          </div>
        </section>

        {/* ZA LOKALE */}
        <section id="lokali" className="scroll-mt-24 px-6 py-12">
          <Reveal className="mx-auto grid max-w-6xl items-center gap-8 overflow-hidden rounded-3xl bg-fg p-8 text-card lg:grid-cols-[1.2fr_1fr] lg:p-16">
            <div className="flex flex-col items-start gap-6">
              {DEMO ? (
                <p className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-semibold text-brand-ink">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" aria-hidden="true" />
                    <span className="relative inline-flex size-2 rounded-full bg-accent" aria-hidden="true" />
                  </span>
                  Za lokale: demo je brezplačen
                </p>
              ) : (
                <p className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold">Za lokale</p>
              )}
              <h2 className="text-4xl font-semibold tracking-tight lg:text-5xl">Imaš lokal? Gostje se bodo vračali pogosteje.</h2>
              <p className="text-lg text-white/70">
                Zamenjaj kartončke z digitalno kartico zvestobe. Postaviš jo v nekaj minutah, nagrade določiš sam.{" "}
                {DEMO ? "V demo obdobju so vse funkcije brezplačne, brez vpisa kartice." : "Prvih 30 dni je brezplačnih."}
              </p>
              <ButtonLink href="/partnerji" size="lg">
                Loyavi za lokale
                <ArrowRight size={16} weight="bold" aria-hidden="true" />
              </ButtonLink>
            </div>
            <div className="relative mx-auto w-full max-w-sm">
              <Photo src="/photos/owner.jpg" alt="Lastnica kavarne z nasmehom stoji med modrimi vrati svojega lokala" shape="arch" className="aspect-[4/5]" sizes="(min-width: 1024px) 30vw, 80vw" />
              <Icon3D name={DEMO ? "paket" : "megafon"} size={DEMO ? 168 : 104} className={`absolute drop-shadow-lg ${DEMO ? "-left-12 bottom-4" : "-left-8 bottom-8 -rotate-12"}`} />
            </div>
          </Reveal>
        </section>

        {/* VPRAŠANJA */}
        <FaqBlock title="Preden začneš." text="Najpogostejša vprašanja gostov na enem mestu." items={FAQ} />

        {/* ZAKLJUČNI POZIV: odpri na telefonu */}
        <section id="zacni" className="scroll-mt-24 px-6 py-24">
          <Reveal className="on-brand atmo-brand mx-auto grid max-w-6xl items-center gap-8 overflow-hidden rounded-3xl px-8 pt-12 text-on-brand shadow-brand lg:grid-cols-[1.3fr_1fr] lg:px-16 lg:pt-16">
            <div className="flex flex-col items-start gap-6 pb-12 lg:pb-16">
              <h2 className="display text-6xl sm:text-7xl">Naslednja kava naj šteje.</h2>
              <p className="max-w-xl text-lg font-medium">Ustvari račun v manj kot minuti in začni zbirati žige že ob naslednjem obisku.</p>
              <div className="flex flex-wrap items-center gap-6">
                <ButtonLink href={CTA.href} size="lg">
                  Odpri svojo denarnico
                  <ArrowRight size={16} weight="bold" aria-hidden="true" />
                </ButtonLink>
                <div className="hidden items-center gap-4 lg:flex">
                  <div role="img" aria-label="Koda QR do denarnice Loyavi" className="size-24 rounded-2xl bg-white p-2 [&>svg]:block [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: qr }} />
                  <p className="max-w-40 text-sm font-medium">Skeniraj s telefonom in odpri denarnico.</p>
                </div>
              </div>
            </div>
            <div className="mx-auto h-80 w-full max-w-64 overflow-hidden lg:h-96">
              <Phone src="/screens/denarnica.webp" alt="Denarnica Loyavi s karticami zvestobe in nagradami" />
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </>
  );
}
