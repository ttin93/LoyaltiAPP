import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Logo from "@/app/ui/Logo";
import AuthCard from "@/app/ui/AuthCard";
import { getGuest } from "@/lib/guest";
import { googleEnabled, safeNext } from "@/lib/authSettings";

export const metadata: Metadata = { title: "Prijava", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Prijava({ searchParams }: { searchParams: Promise<{ next?: string; napaka?: string }> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  if (await getGuest()) redirect(next);
  const google = await googleEnabled();

  return (
    <main id="vsebina" className="app-ui mx-auto flex min-h-svh w-full max-w-md flex-col gap-12 px-6 py-8">
      <div className="flex items-center justify-between">
        <Logo />
        <Link href="/" className="flex items-center gap-2 rounded-lg text-sm font-medium text-mute transition-all duration-700 ease-spring hover:text-fg">
          <ArrowLeft size={16} weight="bold" aria-hidden="true" />
          Nazaj
        </Link>
      </div>
      <div className="flex flex-1 flex-col justify-center pb-16">
        {sp.napaka && <p role="alert" className="mb-6 rounded-xl border border-line bg-s2 px-4 py-3 text-sm text-bad">Prijava ni uspela. Poskusi znova.</p>}
        <AuthCard next={next} google={google} />
      </div>
    </main>
  );
}
