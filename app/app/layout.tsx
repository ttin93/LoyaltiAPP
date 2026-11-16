import type { Metadata } from "next";
import Logo from "@/app/ui/Logo";
import AppTabs from "@/app/ui/AppTabs";

export const metadata: Metadata = { title: "Moja denarnica", robots: { index: false } };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-svh bg-canvas">
      {/* mehka barvna atmosfera na vrhu */}
      <div className="atmo-top pointer-events-none absolute inset-x-0 top-0 h-96" aria-hidden="true" />
      <header className="relative mx-auto flex max-w-6xl items-center px-6 pt-8">
        <Logo href="/app" />
      </header>
      <main id="vsebina" className="relative mx-auto max-w-6xl px-6 pb-32 pt-8 lg:pt-12">
        {children}
      </main>
      <AppTabs />
    </div>
  );
}
