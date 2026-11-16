"use client";

import Link from "next/link";
import { ArrowLeft, Printer } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/app/ui/Button";

/** Vrstica nad plakatom (na papirju se ne izpiše). */
export default function PrintBar({ back }: { back: string }) {
  return (
    <div className="flex items-center justify-between gap-4 bg-s1 px-6 py-4 text-fg print:hidden">
      <Link href={back} className="flex items-center gap-2 rounded-lg text-sm font-medium text-mute transition-all duration-700 ease-spring hover:text-fg">
        <ArrowLeft size={16} weight="bold" aria-hidden="true" />
        Nazaj
      </Link>
      <p className="hidden text-sm text-mute lg:block">V oknu za tiskanje izberi format A4 ali A5 in vključi tiskanje ozadja.</p>
      <Button type="button" size="sm" onClick={() => window.print()}>
        <Printer size={16} weight="bold" aria-hidden="true" />
        Natisni
      </Button>
    </div>
  );
}
