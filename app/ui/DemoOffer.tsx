import Link from "next/link";
import { ArrowRight, Check } from "@phosphor-icons/react/dist/ssr";
import { ButtonLink } from "./Button";
import { Reveal } from "./Reveal";
import Icon3D, { type Icon3DName } from "./Icon3D";
import Photo from "./Photo";

// Ponudba v demo obdobju (lib/demo.ts). Nadomešča cenik, dokler je DEMO vklopljen.
const INCLUDED = [
  "Digitalna kartica zvestobe s tvojimi nagradami",
  "Beleženje obiskov z računom ali stojalom",
  "Kolo dobrodošlice za nove goste",
  "Povabilo k oceni na Googlu po obisku",
  "Samodejna sporočila in kampanje po elektronski pošti",
  "Nadzorna plošča z gosti, obiski in ocenami",
];

const RULES: { icon: Icon3DName; title: string; text: string }[] = [
  { icon: "scit", title: "Brez kartice in brez pogodbe", text: "Plačilnih podatkov ne zbiramo, zato se ne more nič zaračunati samodejno." },
  { icon: "znacka", title: "Podpis Loyavi je del kartice", text: "Na strani gosta, v sporočilih in na plakatu piše, da kartica teče prek Loyavi. Podpisa ni mogoče odstraniti." },
];

const TIMELINE: { icon: Icon3DName; when: string; title: string; text: string }[] = [
  { icon: "raketa", when: "Danes", title: "Ustvariš račun lokala", text: "Vpišeš lokal, izbereš barvo kartice in nagrado. Prvi žigi lahko padejo še isti dan." },
  { icon: "odklenjeno", when: "Med demom", title: "Uporabljaš vse funkcije", text: "Brez paketov in doplačil. Tvoji odzivi nam povedo, kaj izboljšati najprej." },
  { icon: "koledar", when: "Pred koncem dema", title: "Dobiš obvestilo in cenik", text: "Po elektronski pošti ti sporočimo datum in ceno. Ali nadaljuješ, odločiš sam." },
];

export default function DemoOffer({ cta = "/partner" }: { cta?: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        {/* glavna kartica: cena nič in vse, kar je vključeno */}
        <Reveal className="on-brand atmo-brand relative flex flex-col gap-8 overflow-hidden rounded-3xl p-8 text-on-brand shadow-brand lg:p-12">
          <Icon3D name="paket" size={320} className="absolute -right-6 -top-6 size-32 drop-shadow-2xl sm:size-56 lg:-right-12 lg:top-1/2 lg:size-80 lg:-translate-y-1/2" />
          <p className="flex w-max items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-semibold text-brand-ink">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" aria-hidden="true" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" aria-hidden="true" />
            </span>
            Demo paket
          </p>
          <div className="flex flex-col gap-2">
            <p className="text-8xl font-semibold tracking-tight lg:text-9xl">0 €</p>
            <p className="text-base font-medium text-white/85">na mesec, dokler traja demo</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:max-w-xs lg:grid-cols-1">
            {INCLUDED.map((item) => (
              <li key={item} className="flex items-start gap-3 text-base font-medium">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-brand-ink">
                  <Check size={12} weight="bold" aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-wrap items-center gap-4">
            <ButtonLink href={cta} size="lg">
              Ustvari račun lokala
              <ArrowRight size={16} weight="bold" aria-hidden="true" />
            </ButtonLink>
            <p className="text-sm font-medium text-white/85">En račun, en lokal, vse funkcije.</p>
          </div>
        </Reveal>

        {/* pravila dema in pot za verige */}
        <div className="flex flex-col gap-4">
          {RULES.map((r, i) => (
            <Reveal key={r.title} delay={100 + i * 80} className="flex items-start gap-4 rounded-3xl bg-card p-6 shadow-card">
              <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-tint">
                <Icon3D name={r.icon} size={52} />
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold tracking-tight text-fg">{r.title}</h3>
                <p className="text-sm text-mute">{r.text}</p>
              </div>
            </Reveal>
          ))}
          <Reveal delay={260} className="flex flex-1 flex-col overflow-hidden rounded-3xl bg-card shadow-card">
            <div className="relative">
              <Photo src="/photos/team.jpg" alt="Natakarja si za pultom dasta petko" shape="rect" className="aspect-[16/9] rounded-none" sizes="(min-width: 1024px) 40vw, 100vw" />
              <Icon3D name="veriga" size={96} className="absolute -bottom-8 right-6 drop-shadow-lg" />
            </div>
            <div className="flex flex-1 flex-col items-start gap-2 p-6">
              <h3 className="text-lg font-semibold tracking-tight text-fg">Več lokalov ali veriga?</h3>
              <p className="text-sm text-mute">V demu ima en račun en lokal. Če jih imaš več, nam piši in dostop uredimo po dogovoru.</p>
              <Link href="/kontakt?tema=veriga" className="group mt-auto flex items-center gap-2 rounded-lg pt-2 text-sm font-semibold text-brand-ink transition-all duration-700 ease-spring hover:text-brand-deep">
                Pošlji povpraševanje
                <ArrowRight size={12} weight="bold" className="transition-all duration-700 ease-spring group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>

      {/* kaj sledi */}
      <ol className="grid gap-4 lg:grid-cols-3">
        {TIMELINE.map((t, i) => (
          <Reveal key={t.title} delay={i * 100}>
            <li className="flex h-full items-start gap-4 rounded-3xl bg-card p-6 shadow-card">
              <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-tint">
                <Icon3D name={t.icon} size={52} />
              </span>
              <div className="flex flex-col gap-1">
                <p className="font-mono text-xs font-medium uppercase tracking-widest text-brand-ink">{t.when}</p>
                <h3 className="text-lg font-semibold tracking-tight text-fg">{t.title}</h3>
                <p className="text-sm text-mute">{t.text}</p>
              </div>
            </li>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}
