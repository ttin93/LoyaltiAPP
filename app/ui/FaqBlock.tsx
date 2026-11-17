import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import Faq, { type FaqItem } from "./Faq";
import { Reveal } from "./Reveal";
import Icon3D from "./Icon3D";
import { BRAND_EMAIL } from "@/lib/brand";

/** Sekcija z vprašanji: levo naslov in kartica za stik (na namizju obstane med drsenjem), desno harmonika. */
export default function FaqBlock({ title, text, items, id = "vprasanja" }: { title: string; text: string; items: FaqItem[]; id?: string }) {
  return (
    <section id={id} className="atmo scroll-mt-24 px-6 py-24">
      <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[1fr_1.5fr]">
        <Reveal className="flex flex-col items-start gap-6 lg:sticky lg:top-32">
          <p className="rounded-full bg-card px-3 py-1 text-sm font-semibold text-brand-ink shadow-card">Vprašanja</p>
          <h2 className="text-4xl font-semibold tracking-tight text-fg lg:text-5xl">{title}</h2>
          <p className="text-lg text-mute">{text}</p>
          <div className="atmo-brand relative mt-2 flex w-full flex-col items-start gap-4 overflow-hidden rounded-3xl p-6 text-on-brand shadow-brand">
            <Icon3D name="vprasanje" size={112} className="absolute -right-2 -top-2 rotate-6 drop-shadow-lg" />
            <p className="max-w-48 text-2xl font-semibold tracking-tight">Odgovora ni na seznamu?</p>
            <p className="max-w-64 text-base font-medium opacity-90">Piši nam. Odgovorimo osebno, običajno v enem delovnem dnevu.</p>
            <a
              href={`mailto:${BRAND_EMAIL}`}
              className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-ink transition-all duration-700 ease-spring hover:bg-tint active:scale-[0.98]"
            >
              <EnvelopeSimple size={16} weight="bold" aria-hidden="true" />
              {BRAND_EMAIL}
            </a>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <Faq items={items} />
        </Reveal>
      </div>
    </section>
  );
}
