import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Logo from "@/app/ui/Logo";
import ConsentCard from "@/app/ui/ConsentCard";
import { getGuest } from "@/lib/guest";
import { safeNext } from "@/lib/authSettings";

export const metadata: Metadata = { title: "Pogoji in soglasja", robots: { index: false } };
export const dynamic = "force-dynamic";

// Korak po prvi prijavi (geslo, Google ali povezava iz pošte): brez sprejetih pogojev gost ne zbira žigov.
export default async function Soglasje({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  const guest = await getGuest();
  if (!guest) redirect(`/prijava?next=${encodeURIComponent(next)}`);
  if (guest.termsOk) redirect(next);

  return (
    <main id="vsebina" className="app-ui mx-auto flex min-h-svh w-full max-w-md flex-col gap-12 px-6 py-8">
      <Logo href={null} />
      <div className="flex flex-1 flex-col justify-center pb-16">
        <ConsentCard next={next} email={guest.email} />
      </div>
    </main>
  );
}
