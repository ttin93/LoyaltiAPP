import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";

export function Section({ h, children }: { h: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="font-display text-[20px] font-bold">{h}</h2>
      <div className="flex flex-col gap-2.5 text-[15.5px] leading-relaxed text-[#41332A]">{children}</div>
    </section>
  );
}

export default function LegalShell({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#EAE2D3", color: "#2B1D17", minHeight: "100vh", overflowX: "hidden" }}>
      <SiteHeader />
      <div className="mx-auto max-w-[820px] px-6 py-12">
        <h1 className="font-display font-extrabold" style={{ fontSize: "clamp(30px,4vw,44px)", lineHeight: 1.1, margin: 0 }}>{title}</h1>
        <div className="mt-2 text-[14px] text-[#8A7A66]">Zadnja posodobitev: {updated}</div>
        <div className="mt-3 rounded-xl border border-[#E2C9A8] px-4 py-3 text-[13.5px] text-[#6E4F14]" style={{ background: "rgba(232,162,61,0.1)" }}>
          Osnutek za informativne namene — pred javno objavo naj dokument pregleda pravnik in dopolni podatke o ponudniku.
        </div>
        <div className="mt-8 flex flex-col gap-7">{children}</div>
      </div>
      <SiteFooter />
    </div>
  );
}
