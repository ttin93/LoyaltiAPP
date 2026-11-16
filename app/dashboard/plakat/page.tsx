import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServiceClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/ssrServer";
import type { Venue } from "@/lib/types";
import { LogoMark } from "@/app/ui/Logo";
import { toDashVenue } from "../data";
import PrintBar from "./PrintBar";

export const metadata: Metadata = { title: "Plakat za tisk", robots: { index: false } };
export const dynamic = "force-dynamic";

// Plakat je tiskovina: bela podlaga in črno besedilo, da ne porabi tiskalniške barve.
export default async function Poster({ searchParams }: { searchParams: Promise<{ v?: string; t?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/partner");
  const sp = await searchParams;
  const db = getServiceClient();
  const { data } = await db.from("venues").select("*").eq("owner_user_id", user.id).eq("id", sp?.v ?? "").maybeSingle();
  if (!data) redirect("/dashboard");
  const venue = await toDashVenue(db, data as Venue);
  const stand = sp?.t === "stojalo";

  const steps = stand
    ? ["Odpri kamero na telefonu", "Skeniraj kodo", "Žig je na tvoji kartici"]
    : ["Odpri kamero na telefonu", "Skeniraj kodo", "Kartica je v tvojem telefonu"];

  return (
    <div className="min-h-svh bg-white text-black">
      <style>{`@page{size:auto;margin:0} html,body{background:#fff!important} .poster{-webkit-print-color-adjust:exact;print-color-adjust:exact}`}</style>
      <PrintBar back={`/dashboard?v=${venue.id}&s=obiski`} />
      <main id="vsebina" className="poster mx-auto flex aspect-[210/297] w-full max-w-3xl flex-col items-center justify-between gap-8 p-12 text-center print:max-w-none print:h-svh print:aspect-auto">
        <header className="flex flex-col items-center gap-3">
          <p className="text-2xl font-semibold tracking-tight">{venue.name}</p>
          <h1 className="max-w-xl text-5xl font-semibold tracking-tight text-balance lg:text-6xl">{stand ? "Skeniraj in zabeleži obisk" : "Zbiraj žige v telefonu"}</h1>
        </header>

        <div className="flex flex-col items-center gap-6">
          <div role="img" aria-label="Koda QR" className="size-64 lg:size-80 [&>svg]:block [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: stand ? venue.standQr : venue.pageQr }} />
          <p className="rounded-2xl px-6 py-4 text-2xl font-semibold tracking-tight" style={{ background: "#1F8BF5", color: "#FFFFFF" }}>
            Po {venue.goal} obiskih te čaka: {venue.reward}
          </p>
        </div>

        <ol className="grid w-full grid-cols-3 gap-4">
          {steps.map((s, i) => (
            <li key={s} className="flex flex-col items-center gap-2">
              <span className="flex size-10 items-center justify-center rounded-full bg-black font-mono text-lg font-semibold text-white">{i + 1}</span>
              <span className="text-base font-medium">{s}</span>
            </li>
          ))}
        </ol>

        <footer className="flex items-center gap-3">
          <LogoMark size={32} tile />
          <span className="text-xl font-semibold tracking-tight">loyavi</span>
          <span className="text-base text-neutral-600">Brezplačno, brez nameščanja aplikacije.</span>
        </footer>
      </main>
    </div>
  );
}
