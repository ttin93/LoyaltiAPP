import type { Metadata } from "next";
import Logo from "@/app/ui/Logo";
import AppTabs from "@/app/ui/AppTabs";

export const metadata: Metadata = { title: "Moja denarnica", robots: { index: false } };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-base">
      <header className="mx-auto flex max-w-5xl items-center px-6 pt-8">
        <Logo href="/app" />
      </header>
      <main id="vsebina" className="mx-auto max-w-5xl px-6 pb-32 pt-8 lg:pt-16">
        {children}
      </main>
      <AppTabs />
    </div>
  );
}
