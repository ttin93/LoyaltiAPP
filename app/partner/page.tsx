import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { getServiceClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/ssrServer";
import { googleEnabled } from "@/lib/authSettings";
import { signOut } from "@/app/actions";
import Logo from "@/app/ui/Logo";
import AuthCard from "@/app/ui/AuthCard";
import Onboarding from "./Onboarding";

export const metadata: Metadata = { title: "Prijava za lokale", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Partner({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const user = await getCurrentUser();

  if (!user) {
    const google = await googleEnabled();
    return (
      <main id="vsebina" className="mx-auto flex min-h-svh w-full max-w-md flex-col gap-12 px-6 py-8">
        <div className="flex items-center justify-between">
          <Logo />
          <Link href="/partnerji" className="flex items-center gap-2 rounded-lg text-sm font-medium text-mute transition-all duration-700 ease-spring hover:text-fg">
            <ArrowLeft size={16} weight="bold" aria-hidden="true" />
            Nazaj
          </Link>
        </div>
        <div className="flex flex-1 flex-col justify-center pb-16">
          <AuthCard next="/partner" google={google} owner />
        </div>
      </main>
    );
  }

  // ?new=1 → dodaj nov lokal (lastnik ima lahko več lokalov)
  const sp = await searchParams;
  if (sp?.new !== "1") {
    const { data: venues } = await getServiceClient().from("venues").select("id").eq("owner_user_id", user.id).limit(1);
    if (venues?.length) redirect("/dashboard");
  }
  return <Onboarding signOut={signOut} />;
}
