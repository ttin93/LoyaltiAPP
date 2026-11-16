import type { Metadata, Viewport } from "next";
import { Anton, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BRAND_DESCRIPTION, siteOrigin } from "@/lib/brand";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

// Zgoščena pisava za velike naslove na marketinških straneh.
const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const TITLE = "Loyavi: vse kartice zvestobe v telefonu";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: { default: TITLE, template: "%s | Loyavi" },
  description: BRAND_DESCRIPTION,
  icons: { icon: "/icon.svg?v=4", apple: "/apple-icon.png?v=4" },
  appleWebApp: { capable: true, title: "Loyavi", statusBarStyle: "default" },
  openGraph: {
    type: "website",
    siteName: "Loyavi",
    title: TITLE,
    description: BRAND_DESCRIPTION,
    locale: "sl_SI",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: BRAND_DESCRIPTION },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FDFDFE",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sl" className={`${geist.variable} ${geistMono.variable} ${anton.variable} h-full antialiased`}>
      <body className="min-h-full">
        <a
          href="#vsebina"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-brand focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-brand"
        >
          Skoči na vsebino
        </a>
        {children}
      </body>
    </html>
  );
}
