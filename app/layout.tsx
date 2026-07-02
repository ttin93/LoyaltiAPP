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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://loyavi.app"),
  title: "Loyavi — kartica zvestobe za lokale",
  description: "Digitalna kartica zvestobe za kavarne in lokale. Gost skenira QR z računa, zbira žige in nagrade — ti pa gradiš bazo stalnih gostov, Google ocene in marketing. Brez aplikacije.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg?v=2", apple: "/icon.svg?v=2" },
  appleWebApp: { capable: true, title: "Loyavi", statusBarStyle: "default" },
  openGraph: {
    type: "website",
    siteName: "Loyavi",
    title: "Loyavi — kartica zvestobe za lokale",
    description: "Žigi, Google ocene in marketing — na fiskalni račun. Postavljeno v 5 minutah, brez aplikacije za gosta.",
    locale: "sl_SI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Loyavi — kartica zvestobe za lokale",
    description: "Žigi, Google ocene in marketing — na fiskalni račun.",
  },
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
