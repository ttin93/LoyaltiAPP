import Link from "next/link";

// Demo hub — prodajni walkthrough: uokvirja "kaj dobiš" + vodi v oba pogleda.
export const dynamic = "force-static";

const OWNER_WINS = [
  "Tvoji redni gostje, zbrani na enem mestu",
  "Vidiš, kdo se vrača — in koga pripelješ nazaj",
  "Več Google ocen (kmalu) in win-back kampanje",
  "Postavim ti vse zastonj — ti ne narediš nič",
];

export default function DemoHub() {
  return (
    <main className="min-h-dvh bg-[#EAE2D3] px-5 py-12">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="font-display flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2B1D17] text-2xl font-extrabold text-[#F5EFE6]"><svg width="30" height="30" viewBox="0 0 24 24" style={{ display: "block", fill: "none", stroke: "#F5EFE6", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M5 9h10v5.5A4.5 4.5 0 0 1 10.5 19h-1A4.5 4.5 0 0 1 5 14.5V9Z" /><path d="M15 10.5h1.6a2.4 2.4 0 0 1 0 4.8H15" /></svg></div>
        <div className="mt-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[#8A7A66]">Loyavi · demo</div>
        <h1 className="font-display mt-2 text-[30px] font-extrabold leading-[1.1] text-[#2B1D17]">Poglej, kaj dobiš</h1>
        <p className="mt-2 max-w-[320px] text-[15px] leading-relaxed text-[#5C4C3E]">
          Več rednih gostov in več ocen — brez tvojega truda. Tukaj vidiš, kako izgleda za tvoje goste in zate.
        </p>

        {/* Kaj dobi lastnik */}
        <ul className="mt-5 w-full space-y-2 rounded-2xl border border-[#D9CDBA] bg-[#FFFCF6] p-4 text-left">
          {OWNER_WINS.map((w) => (
            <li key={w} className="flex items-start gap-2.5 text-[14px] text-[#41332A]">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#5E7F52] text-[11px] font-bold text-white">✓</span>
              {w}
            </li>
          ))}
        </ul>

        {/* Pogleda */}
        <div className="mt-5 grid w-full gap-3">
          <Link
            href="/p/demo/spin"
            className="group flex items-center gap-4 rounded-2xl border border-[#EFE6D4] bg-[#FFFCF6] p-4 text-left transition hover:border-[#2B1D17]"
          >
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#F1E7D2] text-2xl">📱</span>
            <span className="flex-1">
              <span className="font-display block text-[16px] font-bold text-[#2B1D17]">Pogled gosta</span>
              <span className="block text-[13px] text-[#8A7A66]">Zavrti kolo → nagrada → žigi → skeniranje računa</span>
            </span>
            <span className="text-[#A6967F]">→</span>
          </Link>

          <Link
            href="/demo/dashboard"
            className="group flex items-center gap-4 rounded-2xl border-2 border-[#E8A23D] bg-[#FFFCF6] p-4 text-left transition hover:bg-[#FBF4E8]"
          >
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#E8A23D] text-2xl">📊</span>
            <span className="flex-1">
              <span className="font-display block text-[16px] font-bold text-[#2B1D17]">Pogled lastnika</span>
              <span className="block text-[13px] text-[#8A7A66]">Tvoj dashboard: redni gostje, analitika, marketing</span>
            </span>
            <span className="text-[#A6967F]">→</span>
          </Link>
        </div>

        <p className="mt-6 text-[12px] text-[#A6967F]">Demo s testnimi podatki · brez prijave</p>
      </div>
    </main>
  );
}
