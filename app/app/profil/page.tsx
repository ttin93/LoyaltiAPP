import Link from "next/link";
import { redirect } from "next/navigation";
import { getServiceClient } from "@/lib/supabase/server";
import { getGuest, memberships } from "@/lib/guest";
import { consentPath } from "@/lib/consent";
import ProfileForm from "@/app/ui/ProfileForm";
import { BRAND_EMAIL } from "@/lib/brand";

export const dynamic = "force-dynamic";

export default async function Profil() {
  const guest = await getGuest();
  if (!guest) redirect("/prijava?next=/app/profil");
  if (!guest.termsOk) redirect(consentPath("/app/profil"));
  const ms = await memberships(getServiceClient(), guest.email);
  const birthday = ms.find((m) => m.birthday)?.birthday ?? guest.birthday;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8">
      <h1 className="text-4xl font-semibold tracking-tight text-fg">Profil</h1>
      <ProfileForm email={guest.email} name={guest.name} birthday={birthday} marketing={guest.marketing} />
      <div className="flex flex-col gap-3 text-sm text-mute">
        <p>
          Imaš lokal?{" "}
          <Link href="/partnerji" className="font-medium text-fg underline underline-offset-4 transition-all duration-700 ease-spring hover:text-brand-ink">
            Poglej Loyavi za lokale
          </Link>
        </p>
        <p>
          Za izbris računa in podatkov nam piši na{" "}
          <a href={`mailto:${BRAND_EMAIL}`} className="font-medium text-fg underline underline-offset-4 transition-all duration-700 ease-spring hover:text-brand-ink">
            {BRAND_EMAIL}
          </a>
          .
        </p>
        <p className="flex gap-4">
          <Link href="/pogoji" className="rounded-lg transition-all duration-700 ease-spring hover:text-fg">Pogoji uporabe</Link>
          <Link href="/zasebnost" className="rounded-lg transition-all duration-700 ease-spring hover:text-fg">Zasebnost</Link>
        </p>
      </div>
    </div>
  );
}
