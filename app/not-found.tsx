import type { Metadata } from "next";
import Logo from "@/app/ui/Logo";
import { ButtonLink } from "@/app/ui/Button";

export const metadata: Metadata = { title: "Stran ne obstaja", robots: { index: false } };

export default function NotFound() {
  return (
    <main id="vsebina" className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-12 px-6 py-8">
      <Logo />
      <div className="flex flex-1 flex-col items-start justify-center gap-6 pb-24">
        <p className="display text-9xl text-brand" aria-hidden="true">
          404
        </p>
        <h1 className="display text-5xl text-fg lg:text-6xl">Te strani ni na kartici.</h1>
        <p className="max-w-xl text-lg text-mute">Povezava je napačna ali pa je bila stran prestavljena. Žigi in kartice so na varnem v tvoji denarnici.</p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/app" size="lg">
            Odpri denarnico
          </ButtonLink>
          <ButtonLink href="/" variant="secondary" size="lg">
            Na začetno stran
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
