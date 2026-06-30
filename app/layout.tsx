import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/app/components/LangContext";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const sans = Instrument_Sans({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Loyavi — kartica zvestobe za lokale",
  description: "Skeniraj QR z računa in zbiraj žige, točke in nagrade. Brez aplikacije, brez gesla.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg?v=2", apple: "/icon.svg?v=2" },
  appleWebApp: { capable: true, title: "Loyavi", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#F5EFE6",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sl" className={`${display.variable} ${sans.variable} ${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full">
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
