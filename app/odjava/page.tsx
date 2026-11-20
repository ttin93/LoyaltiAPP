import type { Metadata } from "next";
import { getServiceClient } from "@/lib/supabase/server";
import { unsubValid } from "@/lib/unsub";
import { venueMarketingOn } from "@/lib/consent";
import Logo from "@/app/ui/Logo";
import { Button, ButtonLink } from "@/app/ui/Button";
import { setMarketing } from "./actions";

export const metadata: Metadata = { title: "Odjava od sporočil", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Unsubscribe({ searchParams }: { searchParams: Promise<{ c?: string; t?: string }> }) {
  const sp = await searchParams;
  const id = sp?.c ?? "";
  const token = sp?.t ?? "";
  const db = getServiceClient();
  const ok = unsubValid(id, token);
  const { data: cust } = ok ? await db.from("customers").select("id, venue_id, venues(name, public_code)").eq("id", id).maybeSingle() : { data: null };
  const venue = cust ? ((Array.isArray(cust.venues) ? cust.venues[0] : cust.venues) as { name: string; public_code: string } | null) : null;
  const off = cust ? !(await venueMarketingOn(db, cust.venue_id as string, id)) : false;

  return (
    <main id="vsebina" className="mx-auto flex min-h-svh w-full max-w-md flex-col gap-12 px-6 py-8">
      <Logo />
      <div className="flex flex-1 flex-col justify-center gap-6 pb-16">
        {!cust || !venue ? (
          <>
            <h1 className="text-3xl font-semibold tracking-tight text-fg">Povezava ni veljavna</h1>
            <p className="text-base text-mute">Odpri povezavo iz zadnjega sporočila ali nam piši na info@loyavi.app in uredimo odjavo.</p>
            <ButtonLink href="/" variant="secondary" size="lg" full>
              Na začetno stran
            </ButtonLink>
          </>
        ) : off ? (
          <>
            <h1 className="text-3xl font-semibold tracking-tight text-fg">Ponudb ne prejemaš</h1>
            <p className="text-base text-mute">Lokal {venue.name} ti ne pošilja novic in ponudb. Kartica in žigi ostanejo, obvestilo o polni kartici še vedno prejmeš.</p>
            <form action={setMarketing.bind(null, id, token, false)}>
              <Button type="submit" variant="secondary" size="lg" full>
                Želim spet prejemati sporočila
              </Button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-semibold tracking-tight text-fg">Odjava od sporočil</h1>
            <p className="text-base text-mute">Lokal {venue.name} ti ne bo več pošiljal novic in ponudb. Kartica in žigi ostanejo takšni, kot so.</p>
            <form action={setMarketing.bind(null, id, token, true)} className="flex flex-col gap-3">
              <Button type="submit" size="lg" full>
                Odjavi me
              </Button>
              <ButtonLink href={`/p/${venue.public_code}`} variant="secondary" size="lg" full>
                Nazaj na kartico
              </ButtonLink>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
