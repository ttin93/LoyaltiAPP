import Link from "next/link";
import { Icon } from "@/app/components/icons";

function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        border: "2.5px solid #C8512B",
        background: "rgba(200,81,43,0.07)",
        transform: "rotate(-6deg)",
      }}
    >
      <Icon name="cup" color="#C8512B" size={Math.round(size * 0.55)} strokeWidth={1.9} />
    </div>
  );
}

const STEPS = [
  { icon: "camera", title: "Skeniraj račun", text: "Poskeniraj QR na dnu fiskalnega računa. Brez aplikacije." },
  { icon: "cup", title: "Dobi žig", text: "Vsak obisk = žig na tvojem digitalnem kartončku." },
  { icon: "check", title: "Unovči nagrado", text: "Poln kartonček — brezplačna kava te čaka pri osebju." },
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-md px-6 pb-16 pt-10">
      {/* Nav */}
      <nav className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <BrandMark size={30} />
          <span className="font-display text-[20px] font-extrabold">Žig</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/cenik" className="text-[14px] font-semibold text-[#5C4C3E]">Cenik</Link>
          <Link href="/partner" className="text-[14px] font-semibold text-[#5C4C3E] underline">Za lokale</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mt-14 flex flex-col items-start gap-5">
        <div className="flex items-center gap-2 rounded-full bg-[rgba(232,162,61,0.18)] px-3 py-1.5 text-[12px] font-bold uppercase tracking-[0.1em] text-[#8A5B14]">
          Zvestoba na fiskalni račun
        </div>
        <h1 className="font-display text-[44px] font-extrabold leading-[1.05] tracking-tight">
          Tvoja stalna kava.
        </h1>
        <p className="text-[17px] leading-relaxed text-[#5C4C3E]">
          Poskeniraj QR na dnu računa in žig je tvoj. Brez aplikacije, brez gesla — zvestoba, kot
          mora biti.
        </p>
        <div className="mt-2 flex w-full flex-col gap-3">
          <Link
            href="/p/demo"
            className="flex h-14 items-center justify-center gap-2.5 rounded-full bg-[#2B1D17] text-[16.5px] font-semibold text-[#F5EFE6] shadow-[0_10px_24px_rgba(43,29,23,0.22)]"
          >
            <Icon name="camera" color="#F5EFE6" size={20} strokeWidth={1.8} />
            Poglej demo
          </Link>
          <Link
            href="/partner"
            className="flex h-14 items-center justify-center rounded-full border-[1.5px] border-[#2B1D17] text-[16px] font-semibold text-[#2B1D17]"
          >
            Postavi za svoj lokal →
          </Link>
        </div>
      </section>

      {/* Mini kartonček preview */}
      <section className="mt-12 rounded-3xl border border-[#EFE6D4] bg-[#FFFCF6] p-6 shadow-[0_2px_10px_rgba(43,29,23,0.05),0_14px_34px_rgba(43,29,23,0.07)]">
        <div className="mb-4 text-[12px] font-bold uppercase tracking-[0.09em] text-[#8A7A66]">
          Digitalni kartonček
        </div>
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => {
            const filled = i < 7;
            const rots = [-5, 3, -2, 6, -4, 2, -6, 4, -3, 5];
            const isReward = i === 9;
            return (
              <div
                key={i}
                className="relative flex aspect-square items-center justify-center rounded-full"
                style={{
                  boxSizing: "border-box",
                  border: filled ? "2px solid transparent" : `2px dashed ${isReward ? "#E8A23D" : "#D9CDBA"}`,
                }}
              >
                {filled ? (
                  <div
                    className="absolute inset-0 flex items-center justify-center rounded-full"
                    style={{ border: "2.5px solid #C8512B", background: "rgba(200,81,43,0.07)", transform: `rotate(${rots[i]}deg)` }}
                  >
                    <Icon name="cup" color="#C8512B" size={22} />
                  </div>
                ) : isReward ? (
                  <span className="font-display text-[10px] font-bold tracking-[0.05em] text-[#B97F1F]">KAVA</span>
                ) : (
                  <span className="text-[12px] font-semibold text-[#C9BCA5]">{i + 1}</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 border-t border-dashed border-[#E2D7C2] pt-3.5 text-[14px] text-[#5C4C3E]">
          Še 3 obiski do brezplačne kave.
        </div>
      </section>

      {/* Kako deluje */}
      <section className="mt-12">
        <h2 className="font-display text-[26px] font-bold">Kako deluje</h2>
        <div className="mt-5 flex flex-col gap-4">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#F1E7D2]">
                <Icon name={s.icon} color="#2B1D17" size={22} />
              </div>
              <div className="flex flex-col gap-1 pt-1">
                <div className="font-display text-[17px] font-bold">{s.title}</div>
                <div className="text-[14.5px] leading-relaxed text-[#5C4C3E]">{s.text}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Za lokale */}
      <section className="mt-12 rounded-3xl bg-[#2B1D17] p-7 text-[#F5EFE6]">
        <h2 className="font-display text-[24px] font-extrabold leading-tight">Imaš lokal?</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-[rgba(245,239,230,0.8)]">
          Postavi svoj program zvestobe v par minutah. Gostje zbirajo žige, ti vidiš, kdo se vrača —
          neponaredljivo, vezano na fiskalni račun.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/cenik" className="inline-flex h-12 items-center justify-center rounded-full bg-[#E8A23D] px-6 text-[15px] font-bold text-[#2B1D17]">Poglej cenik</Link>
          <Link href="/dashboard" className="inline-flex h-12 items-center justify-center rounded-full border border-[rgba(245,239,230,0.4)] px-6 text-[15px] font-semibold text-[#F5EFE6]">Demo nadzorna plošča →</Link>
        </div>
      </section>

      <footer className="mt-12 text-center text-[12.5px] text-[#A6967F]">Žig · MVP · zvestoba na fiskalni račun</footer>
    </main>
  );
}
