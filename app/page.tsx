import Link from "next/link";
import { Icon } from "@/app/components/icons";
import { PRICING, DEMO_HOURS } from "@/lib/demo";

const ROTS = [-5, 3, -2, 6, -4, 2, -6, 4, -3, 5];

function StampGrid({ stamps, gap = 10 }: { stamps: number; gap?: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap }}>
      {Array.from({ length: 10 }).map((_, i) => {
        const filled = i < stamps;
        const isReward = i === 9;
        return (
          <div
            key={i}
            style={{ position: "relative", aspectRatio: "1", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: filled ? "2px solid transparent" : `2px dashed ${isReward ? "#E8A23D" : "#D9CDBA"}`, boxSizing: "border-box" }}
          >
            {filled ? (
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2.5px solid #C8512B", background: "rgba(200,81,43,0.07)", display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${ROTS[i]}deg)` }}>
                <Icon name="cup" color="#C8512B" size={22} />
              </div>
            ) : isReward ? (
              <span className="font-display" style={{ fontWeight: 700, fontSize: 9.5, letterSpacing: "0.05em", color: "#B97F1F" }}>KAVA</span>
            ) : (
              <span style={{ fontSize: 11, fontWeight: 600, color: "#C9BCA5" }}>{i + 1}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CupMark({ size = 36 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center rounded-full" style={{ width: size, height: size, border: "2.5px solid #C8512B", background: "rgba(200,81,43,0.07)", transform: "rotate(-6deg)" }}>
      <Icon name="cup" color="#C8512B" size={Math.round(size * 0.52)} />
    </div>
  );
}

const STEPS = [
  { n: "01", icon: "camera", bg: "#F1E7D2", color: "#2B1D17", rot: 0, title: "Skenira račun", text: "Gost odpre tvojo stran prek QR na mizi in poskenira fiskalni QR na dnu računa. Brez prenosa aplikacije." },
  { n: "02", icon: "cup", bg: "rgba(200,81,43,0.1)", color: "#C8512B", rot: -5, title: "Dobi žig", text: "Štampiljka tlesne na kartonček — kot nekoč na papirju, le da je tu trajno. Sistem zavrne podvojene in tuje račune." },
  { n: "03", icon: "star2", bg: "rgba(94,127,82,0.14)", color: "#5E7F52", rot: 0, title: "Unovči nagrado", text: "Poln kartonček = brezplačna kava. Gost pokaže kodo, osebje potrdi z dotikom. Vrne se hitreje, kot misliš." },
];

const DASH_FEATURES = [
  ["Analitika v živo", " — skeniranja, obiski po urah, pogostost vračanja."],
  ["QR plakat za mizo", " — prenesi PNG ali PDF in natisni v minuti."],
  ["Seznam strank", " — kdo je nov, kdo reden, koga si že dolgo ni videl."],
];

const FEATURES = [
  { icon: "star2", title: "Srečno kolo", text: "Novi obiskovalci zavrtijo kolo in osvojijo nagrado — pretvori mimoidoče v registrirane goste." },
  { icon: "mega", title: "Win-back kampanje", text: "Sistem ve, kdo dolgo ni bil. Avtomatsko pošlje »pogrešamo te« + bonus neaktivnim — brez tvojega dela." },
  { icon: "gift", title: "Rojstnodnevne nagrade", text: "Datum ob registraciji → samodejna ponudba za rojstni dan. Vleče goste nazaj ob pravem trenutku." },
  { icon: "send", title: "SMS + email kampanje", text: "Ciljana sporočila segmentom — aktivni, neaktivni, najboljši — s pregledom stroška pred pošiljanjem." },
  { icon: "ticket", title: "Kuponi z veljavnostjo", text: "Priloži kupon (npr. brezplačna kava) k sporočilu, z veljavnostjo in opomnikom pred potekom." },
  { icon: "chart", title: "Analitika + profili gostov", text: "Kdo se vrača, kdo pada stran, gneča po urah. Klikni gosta za celo zgodovino obiskov in porabe." },
];

// Google ocene — rast (mesečno novih ocen) za graf
const REVIEW_BARS = [6, 11, 18, 24, 33, 47];
const REVIEW_MONTHS = ["jan", "feb", "mar", "apr", "maj", "jun"];

const FAQS = [
  { q: "Mora gost naložiti aplikacijo?", a: "Ne. Stran se odpre v brskalniku prek QR kode na mizi. Registracija je en korak — Google ali telefonska številka, brez gesla." },
  { q: "Kako dobim več Google ocen?", a: "Samodejno. Ko gost dobi žig (torej zadovoljen), ga povabimo k oceni na Googlu. Slabe izkušnje prestrežemo zasebno, da popraviš, preden gre javno — tvoj profil tako dobi le dobre ocene." },
  { q: "Lahko pošljem sporočilo gostom, ki dolgo niso bili?", a: "Da. Vidiš segmente (aktivni, neaktivni 21+ dni, rojstni dnevi, najboljši) in jim z enim klikom pošlješ SMS ali email — ali pustiš, da gre samodejno (win-back, rojstni dan)." },
  { q: "Koliko stane pošiljanje sporočil?", a: "Email je praktično zastonj; SMS približno nekaj centov na kos — pred pošiljanjem ti pokažemo točen strošek (npr. 28 prejemnikov × 0,07 € = 1,96 €), da ni presenečenj." },
  { q: "Deluje z mojo blagajno?", a: "Da. Vsak slovenski fiskalni račun nosi QR kodo — sistem prebere izdajatelja in čas izdaje neposredno iz nje. Vsak račun šteje le enkrat." },
  { q: "Koliko časa traja postavitev?", a: "Okoli pet minut: vpišeš ime, logo in barvo, fotografiraš vzorčni račun za aktivacijo, natisneš QR. Gostje lahko zbirajo žige še isti dan." },
];

export default function Home() {
  const maxBar = Math.max(...DEMO_HOURS.map((h) => h[1]));

  return (
    <div style={{ background: "#EAE2D3", color: "#2B1D17", minHeight: "100vh", overflowX: "hidden" }}>
      {/* NAV */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(234,226,211,0.82)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderBottom: "1px solid rgba(43,29,23,0.08)" }}>
        <div className="mx-auto flex h-[68px] max-w-[1200px] items-center gap-3.5 px-6">
          <div className="flex items-center gap-2.5">
            <CupMark size={36} />
            <span className="font-display text-[21px] font-extrabold tracking-tight">Žig</span>
          </div>
          <div className="ml-6 hidden items-center gap-[26px] md:flex">
            <a href="#kako" className="text-[14.5px] font-medium text-[#5C4C3E]">Kako deluje</a>
            <a href="#funkcije" className="text-[14.5px] font-medium text-[#5C4C3E]">Funkcije</a>
            <a href="#lokal" className="text-[14.5px] font-medium text-[#5C4C3E]">Za lokale</a>
            <a href="#cene" className="text-[14.5px] font-medium text-[#5C4C3E]">Cene</a>
            <a href="#faq" className="text-[14.5px] font-medium text-[#5C4C3E]">Vprašanja</a>
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            <Link href="/p/demo" className="hidden h-[42px] items-center rounded-full border-[1.5px] border-[rgba(43,29,23,0.25)] px-[18px] text-[14.5px] font-semibold sm:flex">Poglej demo</Link>
            <a href="#cene" className="flex h-[42px] items-center rounded-full bg-[#2B1D17] px-5 text-[14.5px] font-semibold text-[#F5EFE6]">Ustvari stran</a>
          </div>
        </div>
      </div>

      {/* HERO */}
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-12 px-6 pb-10 pt-[72px]">
        <div className="flex flex-col gap-6" style={{ flex: "1.1", minWidth: 340 }}>
          <div className="flex h-[34px] items-center gap-2 self-start rounded-full px-3.5 text-[13px] font-bold" style={{ background: "rgba(232,162,61,0.18)", color: "#8A5B14" }}>
            <span className="h-[7px] w-[7px] rounded-full bg-[#E8A23D]" />
            Zvestoba · Google ocene · marketing — za slovenske lokale
          </div>
          <h1 className="font-display font-extrabold" style={{ fontSize: "clamp(40px,5.4vw,68px)", lineHeight: 1.02, letterSpacing: "-0.02em", margin: 0 }}>
            Stalni gosti se ne zgodijo.<br /><span style={{ color: "#C8512B" }}>Zgradiš jih.</span>
          </h1>
          <p className="text-[#5C4C3E]" style={{ fontSize: "clamp(16px,1.5vw,19px)", lineHeight: 1.55, maxWidth: 480, margin: 0 }}>
            Gost skenira QR z računa in nabira žige — brez aplikacije. Ti pa dobiš orodje, ki goste <strong>pripelje nazaj</strong> (rojstni dnevi, win-back, SMS/email) in ti <strong>prinese Google ocene</strong> — vse na enem mestu.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#cene" className="flex h-14 items-center gap-2.5 rounded-full bg-[#2B1D17] px-7 text-[16.5px] font-semibold text-[#F5EFE6]" style={{ boxShadow: "0 10px 24px rgba(43,29,23,0.22)" }}>
              Ustvari svojo stran <Icon name="arrowR" color="#F5EFE6" size={18} strokeWidth={2} />
            </a>
            <Link href="/p/demo" className="flex h-14 items-center gap-2.5 rounded-full border-[1.5px] border-[rgba(43,29,23,0.28)] px-6 text-[16.5px] font-semibold">Poglej demo v živo</Link>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-[18px]">
            <div className="flex items-center gap-2 text-[14px] text-[#5C4C3E]"><Icon name="check" color="#5E7F52" size={18} strokeWidth={2.2} />Postavljeno v 5 minutah</div>
            <div className="flex items-center gap-2 text-[14px] text-[#5C4C3E]"><Icon name="check" color="#5E7F52" size={18} strokeWidth={2.2} />Brez provizije na obisk</div>
          </div>
        </div>

        {/* hero visual */}
        <div className="relative flex justify-center" style={{ flex: 1, minWidth: 320 }}>
          <div className="relative" style={{ width: 340 }}>
            <div className="font-display absolute right-[-6px] top-[-18px] z-[3] flex h-[46px] items-center gap-[7px] rounded-full px-[18px] text-[19px] font-extrabold text-[#F5EFE6]" style={{ background: "#5E7F52", boxShadow: "0 12px 28px rgba(94,127,82,0.35)", animation: "floaty 5s ease-in-out infinite" }}>+15 točk</div>
            <div className="absolute bottom-[18px] left-[-26px] z-[3] flex h-[54px] items-center gap-2.5 rounded-[18px] border border-[#EFE6D4] bg-[#FFFCF6] pl-3 pr-4" style={{ boxShadow: "0 14px 30px rgba(43,29,23,0.16)", animation: "floaty2 6s ease-in-out infinite" }}>
              <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[#F1E7D2]"><Icon name="cup" color="#2B1D17" size={18} strokeWidth={1.8} /></div>
              <div className="flex flex-col leading-[1.1]"><span className="text-[12.5px] font-bold">Kava po izbiri</span><span className="text-[11.5px] text-[#8A7A66]">pri 10. žigu</span></div>
            </div>
            <div className="relative z-[2] rounded-[28px] border border-[#EFE6D4] bg-[#FFFCF6] px-6 py-[26px]" style={{ transform: "rotate(-3deg)", boxShadow: "0 30px 70px rgba(43,29,23,0.22), 0 4px 14px rgba(43,29,23,0.08)" }}>
              <div className="mb-[18px] flex items-center gap-[11px]">
                <div className="font-display flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#2B1D17] text-[21px] font-bold text-[#F5EFE6]">M</div>
                <div className="flex flex-col leading-[1.15]"><span className="font-display text-[18px] font-bold">Kavarna Moka</span><span className="text-[12.5px] text-[#8A7A66]">tvoj kartonček zvestobe</span></div>
                <div className="ml-auto text-right leading-none"><div className="font-display text-[30px] font-extrabold">7</div><div className="text-[11px] text-[#8A7A66]">/ 10 žigov</div></div>
              </div>
              <StampGrid stamps={7} />
              <div className="mt-[18px] h-[9px] overflow-hidden rounded-full bg-[#EFE6D4]"><div className="h-full rounded-full bg-[#E8A23D]" style={{ width: "70%" }} /></div>
              <div className="mt-2.5 text-[13.5px] text-[#5C4C3E]">Še <strong>3 obiski</strong> do brezplačne kave ☕</div>
            </div>
          </div>
        </div>
      </div>

      {/* TRUST STRIP */}
      <div style={{ marginTop: 24, borderTop: "1px solid rgba(43,29,23,0.1)", borderBottom: "1px solid rgba(43,29,23,0.1)", background: "rgba(255,252,246,0.5)" }}>
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-3.5 px-6 py-[18px]">
          <span className="text-[13px] font-semibold text-[#8A7A66]">Narejeno za:</span>
          {["Kavarne", "Bistroji", "Slaščičarne", "Picerije", "Pekarne"].map((w, i) => (
            <span key={w} className="flex items-center gap-3.5">
              <span className="font-display text-[17px] font-bold">{w}</span>
              {i < 4 && <span className="text-[#C9BCA5]">·</span>}
            </span>
          ))}
        </div>
      </div>

      {/* KAKO DELUJE */}
      <div id="kako" className="mx-auto max-w-[1200px] px-6 pb-10 pt-[88px]">
        <div className="mb-12 flex flex-col items-center gap-2.5 text-center">
          <div className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#C8512B]">Tako preprosto je</div>
          <h2 className="font-display font-extrabold" style={{ fontSize: "clamp(30px,3.6vw,44px)", lineHeight: 1.08, margin: 0 }}>Od računa do žiga v treh sekundah</h2>
          <p className="text-[17px] text-[#5C4C3E]" style={{ maxWidth: 540, margin: 0 }}>Vsak slovenski fiskalni račun nosi QR kodo. Gost jo skenira, sistem preveri izdajatelja in datum — žig je tu.</p>
        </div>
        <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
          {STEPS.map((s) => (
            <div key={s.n} className="flex flex-col gap-3.5 rounded-[24px] border border-[#EFE6D4] bg-[#FFFCF6] p-7">
              <div className="flex items-center justify-between">
                <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[16px]" style={{ background: s.bg, transform: s.rot ? `rotate(${s.rot}deg)` : undefined }}>
                  <Icon name={s.icon} color={s.color} size={26} strokeWidth={1.8} />
                </div>
                <span className="font-display text-[40px] font-extrabold" style={{ color: "#EBD9BE" }}>{s.n}</span>
              </div>
              <div className="font-display text-[21px] font-bold">{s.title}</div>
              <div className="text-[15px] leading-relaxed text-[#5C4C3E]">{s.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ZA LOKALE / DASHBOARD */}
      <div id="lokal" className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-12 px-6 pb-10 pt-16">
        <div className="flex flex-col gap-5" style={{ flex: 1, minWidth: 320 }}>
          <div className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#C8512B]">Tvoja nadzorna plošča</div>
          <h2 className="font-display font-extrabold" style={{ fontSize: "clamp(28px,3.4vw,42px)", lineHeight: 1.08, margin: 0 }}>Vidiš, kdo se vrača — in kdaj</h2>
          <p className="text-[16.5px] leading-relaxed text-[#5C4C3E]" style={{ maxWidth: 440, margin: 0 }}>Koliko skeniranj, koliko novih strank, ob katerih urah je gneča in kdo so tvoji najboljši gostje. Brez tabel v Excelu.</p>
          <div className="mt-1 flex flex-col gap-3.5">
            {DASH_FEATURES.map(([b, t], i) => (
              <div key={i} className="flex items-start gap-3.5">
                <div className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-[9px]" style={{ background: "rgba(94,127,82,0.14)" }}><Icon name="check" color="#5E7F52" size={16} strokeWidth={2.4} /></div>
                <div className="text-[15.5px] leading-snug text-[#41332A]"><strong>{b}</strong>{t}</div>
              </div>
            ))}
          </div>
          <Link href="/dashboard" className="mt-2 flex h-[50px] items-center gap-2 self-start rounded-full border-[1.5px] border-[#2B1D17] px-[22px] text-[15px] font-semibold">
            Razišči nadzorno ploščo <Icon name="arrowR" color="#2B1D17" size={16} strokeWidth={2} />
          </Link>
        </div>
        {/* mini dashboard */}
        <div className="rounded-[28px] bg-[#2B1D17] p-[26px]" style={{ flex: 1, minWidth: 320, boxShadow: "0 30px 70px rgba(43,29,23,0.28)" }}>
          <div className="mb-[18px] flex items-center justify-between">
            <div className="font-display text-[22px] font-extrabold text-[#F5EFE6]">Analitika</div>
            <div className="flex h-[30px] items-center rounded-full px-3.5 text-[12.5px] font-semibold" style={{ background: "rgba(245,239,230,0.12)", color: "#E8C99A" }}>Zadnjih 30 dni</div>
          </div>
          <div className="mb-3.5 grid grid-cols-2 gap-[11px]">
            {[["Skupaj skeniranj", "482", "+18 %"], ["Št. strank", "137", "+12 novih"]].map(([l, v, d]) => (
              <div key={l} className="rounded-[16px] p-3.5" style={{ background: "rgba(245,239,230,0.06)", border: "1px solid rgba(245,239,230,0.1)" }}>
                <div className="mb-0.5 text-[12px]" style={{ color: "#B7A488" }}>{l}</div>
                <div className="font-display text-[28px] font-extrabold text-[#F5EFE6]">{v}</div>
                <div className="text-[11.5px] font-semibold text-[#5E7F52]">{d}</div>
              </div>
            ))}
          </div>
          <div className="rounded-[16px] p-4" style={{ background: "rgba(245,239,230,0.06)", border: "1px solid rgba(245,239,230,0.1)" }}>
            <div className="mb-3.5 text-[12.5px] font-semibold" style={{ color: "#B7A488" }}>Obiski po urah</div>
            <div className="flex h-[96px] items-end gap-[5px]">
              {DEMO_HOURS.map(([, v, lbl], i) => (
                <div key={i} className="flex flex-1 flex-col items-center justify-end gap-[5px]" style={{ height: "100%" }}>
                  <div className="w-full rounded-[4px]" style={{ height: `${Math.round((v / maxBar) * 86)}px`, background: v === maxBar ? "#E8A23D" : "rgba(232,162,61,0.4)" }} />
                  <div className="text-[9px]" style={{ color: "#7C6B55", height: 11 }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SIGNATURE STAMP STORY */}
      <div className="mx-auto my-10 max-w-[1200px] px-6">
        <div className="flex flex-wrap items-center gap-10 overflow-hidden rounded-[32px]" style={{ background: "linear-gradient(135deg,#C8512B 0%,#A83E1F 100%)", padding: "clamp(36px,5vw,64px)" }}>
          <div className="flex flex-col gap-[18px]" style={{ flex: "1.2", minWidth: 300 }}>
            <div className="text-[13px] font-bold uppercase tracking-[0.12em]" style={{ color: "rgba(245,239,230,0.7)" }}>Naša ena zapomljiva stvar</div>
            <h2 className="font-display font-extrabold" style={{ fontSize: "clamp(28px,3.6vw,46px)", lineHeight: 1.05, color: "#F8F1E7", margin: 0 }}>Občutek pravega žiga,<br />brez papirja v žepu</h2>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: "rgba(248,241,231,0.88)", maxWidth: 460, margin: 0 }}>Kartončki zvestobe so delovali, ker so bili otipljivi. Ohranili smo točno ta moment — žig, ki tlesne ob skenu — le da ga ni mogoče izgubiti ali pozabiti doma.</p>
          </div>
          <div className="flex justify-center" style={{ flex: 1, minWidth: 280 }}>
            <div className="rounded-[22px] bg-[#FFFCF6] p-6" style={{ width: 280, boxShadow: "0 24px 50px rgba(0,0,0,0.25)", transform: "rotate(2deg)" }}>
              <StampGrid stamps={9} />
              <div className="mt-4 text-center text-[13.5px] text-[#8A7A66]">9 / 10 — še en obisk ☕</div>
            </div>
          </div>
        </div>
      </div>

      {/* FUNKCIJE */}
      <div id="funkcije" className="mx-auto max-w-[1200px] px-6 pb-10 pt-12">
        <div className="mb-9 flex flex-col items-center gap-2.5 text-center">
          <div className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#C8512B]">Več kot žigi</div>
          <h2 className="font-display font-extrabold" style={{ fontSize: "clamp(28px,3.6vw,44px)", lineHeight: 1.08, margin: 0 }}>Cel stroj za stalne goste</h2>
          <p className="text-[17px] text-[#5C4C3E]" style={{ maxWidth: 560, margin: 0 }}>Loyalty ujame tvoje redne goste in njihove kontakte. Vse ostalo jih pripelje nazaj — in ti prinese Google ocene.</p>
        </div>

        {/* Google ocene — highlight + graf */}
        <div className="mb-[18px] flex flex-wrap items-center gap-9 overflow-hidden rounded-[26px] border border-[#EFE6D4] bg-[#FFFCF6]" style={{ padding: "clamp(24px,4vw,40px)" }}>
          <div className="flex flex-col gap-3.5" style={{ flex: "1.1", minWidth: 280 }}>
            <div className="flex h-[34px] w-fit items-center gap-2 rounded-full px-3.5 text-[12.5px] font-bold" style={{ background: "rgba(232,162,61,0.18)", color: "#8A5B14" }}>⭐ Google ocene na avtopilotu</div>
            <h3 className="font-display font-extrabold" style={{ fontSize: "clamp(24px,2.6vw,32px)", lineHeight: 1.1, margin: 0 }}>Več zadovoljnih gostov = več ocen na Googlu</h3>
            <p className="text-[15.5px] leading-relaxed text-[#5C4C3E]" style={{ maxWidth: 440, margin: 0 }}>Ko gost dobi žig (zadovoljen!), ga samodejno povabimo k oceni. Slabe izkušnje prestrežemo zasebno — tvoj profil dobi <strong>le dobre ocene</strong>, ti pa višje v Google iskanju.</p>
            <div className="mt-1 flex items-center gap-7">
              <div><div className="font-display text-[34px] font-extrabold text-[#B97F1F]">4,8★</div><div className="text-[12.5px] text-[#8A7A66]">prej 3,9★</div></div>
              <div><div className="font-display text-[34px] font-extrabold text-[#5E7F52]">+86</div><div className="text-[12.5px] text-[#8A7A66]">novih ocen / 6 mes</div></div>
            </div>
          </div>
          <div className="rounded-[20px] bg-[#2B1D17] p-6" style={{ flex: 1, minWidth: 260 }}>
            <div className="mb-3.5 flex items-center justify-between">
              <div className="text-[12.5px] font-semibold" style={{ color: "#B7A488" }}>Nove Google ocene / mesec</div>
              <div className="text-[12.5px] font-bold text-[#5E7F52]">↑ rast</div>
            </div>
            <div className="flex h-[120px] items-end gap-2.5">
              {REVIEW_BARS.map((v, i) => {
                const max = Math.max(...REVIEW_BARS);
                return (
                  <div key={i} className="flex flex-1 flex-col items-center justify-end gap-2" style={{ height: "100%" }}>
                    <div className="font-display text-[11px] font-bold" style={{ color: "#E8C99A" }}>{v}</div>
                    <div className="w-full rounded-[5px]" style={{ height: `${Math.round((v / max) * 84)}px`, background: i === REVIEW_BARS.length - 1 ? "#E8A23D" : "rgba(232,162,61,0.4)" }} />
                    <div className="text-[10px]" style={{ color: "#7C6B55" }}>{REVIEW_MONTHS[i]}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ostali fičri */}
        <div className="grid gap-[18px]" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))" }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="flex flex-col gap-2.5 rounded-[20px] border border-[#EFE6D4] bg-[#FFFCF6] p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#F1E7D2]"><Icon name={f.icon} color="#2B1D17" size={22} strokeWidth={1.8} /></div>
              <div className="font-display text-[17px] font-bold">{f.title}</div>
              <div className="text-[14px] leading-snug text-[#5C4C3E]">{f.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CENE */}
      <div id="cene" className="mx-auto max-w-[1200px] px-6 pb-10 pt-20">
        <div className="mb-11 flex flex-col items-center gap-2.5 text-center">
          <div className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#C8512B]">Cene</div>
          <h2 className="font-display font-extrabold" style={{ fontSize: "clamp(30px,3.8vw,46px)", lineHeight: 1.05, margin: 0 }}>Izberi svojo skodelico</h2>
          <p className="text-[17px] text-[#5C4C3E]" style={{ maxWidth: 500, margin: 0 }}>Brez provizije na obisk, brez vezave. Začni zastonj, nadgradi, ko raste.</p>
        </div>
        <div className="grid items-stretch gap-[22px]" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))" }}>
          {PRICING.map((p) => (
            <div
              key={p.key}
              className="relative flex flex-col gap-5 rounded-[26px] p-[30px]"
              style={p.featured ? { background: "#2B1D17", boxShadow: "0 26px 60px rgba(43,29,23,0.3)", transform: "translateY(-8px)" } : { background: "#FFFCF6", border: "1px solid #EFE6D4" }}
            >
              {p.badge && <div className="absolute right-6 top-[22px] flex h-[30px] items-center rounded-full bg-[#E8A23D] px-3.5 text-[12px] font-extrabold text-[#2B1D17]">{p.badge}</div>}
              <div className="flex flex-col gap-1.5">
                <div className="font-display text-[22px] font-extrabold" style={{ color: p.featured ? "#F5EFE6" : "#2B1D17" }}>{p.name}</div>
                <div className="text-[14px]" style={{ color: p.featured ? "#B7A488" : "#8A7A66" }}>{p.tagline}</div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-[46px] font-extrabold" style={{ color: p.featured ? "#F5EFE6" : "#2B1D17" }}>{p.price}</span>
                {p.period && <span className="text-[15px]" style={{ color: p.featured ? "#B7A488" : "#8A7A66" }}>{p.period}</span>}
              </div>
              <Link
                href="/partner"
                className="flex h-[50px] items-center justify-center rounded-full text-[15px] font-semibold"
                style={p.featured ? { background: "#E8A23D", color: "#2B1D17", fontWeight: 700 } : { border: "1.5px solid #2B1D17", color: "#2B1D17" }}
              >
                {p.cta}
              </Link>
              <div className="flex flex-col gap-3 pt-[18px]" style={{ borderTop: p.featured ? "1px solid rgba(245,239,230,0.14)" : "1px solid #F1E7D2" }}>
                {p.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[14.5px] leading-snug" style={{ color: p.featured ? "#E9E0D2" : "#41332A" }}>
                    <span className="mt-px flex-shrink-0"><Icon name="check" color={p.featured ? "#E8A23D" : "#5E7F52"} size={18} strokeWidth={2.3} /></span>{f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-[22px] text-center text-[14px] text-[#8A7A66]">Vse cene brez DDV · prekličeš kadarkoli · 14 dni brezplačno na plačljivih paketih</div>
      </div>

      {/* FAQ */}
      <div id="faq" className="mx-auto max-w-[760px] px-6 pb-10 pt-16">
        <div className="mb-9 flex flex-col items-center gap-2 text-center">
          <div className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#C8512B]">Pogosta vprašanja</div>
          <h2 className="font-display font-extrabold" style={{ fontSize: "clamp(28px,3.4vw,40px)", margin: 0 }}>Še kaj ti ni jasno?</h2>
        </div>
        <div className="flex flex-col gap-3">
          {FAQS.map((q) => (
            <div key={q.q} className="flex flex-col gap-2 rounded-[18px] border border-[#EFE6D4] bg-[#FFFCF6] px-6 py-[22px]">
              <div className="font-display text-[17.5px] font-bold">{q.q}</div>
              <div className="text-[15px] leading-relaxed text-[#5C4C3E]">{q.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FINAL CTA */}
      <div className="mx-auto max-w-[1200px] px-6 pb-[72px] pt-12">
        <div className="relative flex flex-col items-center gap-[22px] overflow-hidden rounded-[32px] bg-[#2B1D17] text-center" style={{ padding: "clamp(40px,6vw,72px)" }}>
          <div className="absolute" style={{ top: -60, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(232,162,61,0.16)" }} />
          <div className="absolute" style={{ bottom: -70, left: -30, width: 180, height: 180, borderRadius: "50%", background: "rgba(200,81,43,0.18)" }} />
          <div className="relative flex flex-col items-center gap-[22px]">
            <h2 className="font-display font-extrabold" style={{ fontSize: "clamp(30px,4.2vw,52px)", lineHeight: 1.04, color: "#F8F1E7", maxWidth: 620, margin: 0 }}>Tvoja stalna kava se začne danes</h2>
            <p style={{ fontSize: 17.5, lineHeight: 1.55, color: "rgba(248,241,231,0.82)", maxWidth: 480, margin: 0 }}>Ustvari stran, natisni QR, postavi ga na mize. Prve žige lahko podariš že popoldne.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/partner" className="flex h-14 items-center gap-2.5 rounded-full bg-[#E8A23D] px-[30px] text-[16.5px] font-bold text-[#2B1D17]">Ustvari svojo stran <Icon name="arrowR" color="#2B1D17" size={18} strokeWidth={2.2} /></Link>
              <Link href="/p/demo" className="flex h-14 items-center rounded-full border-[1.5px] border-[rgba(245,239,230,0.3)] px-[26px] text-[16.5px] font-semibold text-[#F5EFE6]">Najprej poglej demo</Link>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: "1px solid rgba(43,29,23,0.1)" }}>
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-5 px-6 py-9">
          <div className="flex items-center gap-2.5">
            <CupMark size={32} />
            <span className="font-display text-[18px] font-extrabold">Žig</span>
            <span className="ml-1.5 text-[13px] text-[#8A7A66]">Loyalty na fiskalni račun</span>
          </div>
          <div className="flex flex-wrap gap-6">
            <a href="#kako" className="text-[14px] text-[#5C4C3E]">Kako deluje</a>
            <a href="#cene" className="text-[14px] text-[#5C4C3E]">Cene</a>
            <a href="#faq" className="text-[14px] text-[#5C4C3E]">Vprašanja</a>
            <Link href="/p/demo" className="text-[14px] text-[#5C4C3E]">Demo</Link>
          </div>
          <div className="text-[13px]" style={{ color: "#A6967F" }}>© 2026 Žig · Ljubljana</div>
        </div>
      </div>
    </div>
  );
}
