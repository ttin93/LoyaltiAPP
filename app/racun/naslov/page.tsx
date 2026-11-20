import type { Metadata } from "next";
import Logo from "@/app/ui/Logo";
import { Button, ButtonLink } from "@/app/ui/Button";
import { readEmailChangeToken } from "@/lib/emailChange";
import { confirmEmailChange } from "./actions";

export const metadata: Metadata = { title: "Potrditev novega naslova", robots: { index: false } };
export const dynamic = "force-dynamic";

const ERRORS: Record<string, { title: string; text: string }> = {
  invalid: { title: "Povezava ni veljavna", text: "Povezava je potekla ali je bila že uporabljena. V profilu zahtevaj novo, velja eno uro." },
  stale: { title: "Povezava ni več veljavna", text: "Naslov tega računa je bil medtem že spremenjen. Če želiš drug naslov, v profilu zahtevaj novo povezavo." },
  taken: { title: "Naslov je že v uporabi", text: "Ta elektronski naslov že uporablja drug račun. V profilu izberi drugega." },
  failed: { title: "Menjava ni uspela", text: "Naslov je ostal nespremenjen. Poskusi znova ali nam piši na info@loyavi.app." },
};

export default async function EmailChangePage({ searchParams }: { searchParams: Promise<{ t?: string; ok?: string; e?: string }> }) {
  const sp = await searchParams;
  const pending = sp?.ok || sp?.e ? null : readEmailChangeToken(sp?.t);
  const err = sp?.e ? (ERRORS[sp.e] ?? ERRORS.failed) : !sp?.ok && !pending ? ERRORS.invalid : null;

  return (
    <main id="vsebina" className="mx-auto flex min-h-svh w-full max-w-md flex-col gap-12 px-6 py-8">
      <Logo />
      <div className="flex flex-1 flex-col justify-center gap-6 pb-16">
        {sp?.ok ? (
          <>
            <h1 className="text-3xl font-semibold tracking-tight text-fg">Naslov je spremenjen</h1>
            <p className="text-base text-mute">Od zdaj se prijavljaš z novim naslovom, geslo ostane isto. Kartice, žigi in kuponi so ostali, kot so bili.</p>
            <div className="flex flex-col gap-3">
              <ButtonLink href="/app" size="lg" full>
                Odpri denarnico
              </ButtonLink>
              <ButtonLink href="/partner" variant="secondary" size="lg" full>
                Nadzorna plošča za lokale
              </ButtonLink>
            </div>
          </>
        ) : err ? (
          <>
            <h1 className="text-3xl font-semibold tracking-tight text-fg">{err.title}</h1>
            <p className="text-base text-mute">{err.text}</p>
            <ButtonLink href="/app/profil" variant="secondary" size="lg" full>
              Odpri profil
            </ButtonLink>
          </>
        ) : (
          pending && (
            <>
              <h1 className="text-3xl font-semibold tracking-tight text-fg">Potrdi nov naslov</h1>
              <p className="text-base text-mute">
                Račun z naslovom <span className="font-medium text-fg">{pending.oldEmail}</span> bo odslej uporabljal naslov <span className="font-medium text-fg">{pending.newEmail}</span>. Na novi naslov bodo prihajala tudi sporočila lokalov.
              </p>
              <form action={confirmEmailChange.bind(null, sp?.t ?? "")} className="flex flex-col gap-3">
                <Button type="submit" size="lg" full>
                  Potrdi nov naslov
                </Button>
                <ButtonLink href="/" variant="ghost" size="lg" full>
                  Tega nisem zahteval
                </ButtonLink>
              </form>
            </>
          )
        )}
      </div>
    </main>
  );
}
