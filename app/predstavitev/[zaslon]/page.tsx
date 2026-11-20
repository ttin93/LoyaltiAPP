import { notFound } from "next/navigation";
import { Cards, Compass, User } from "@phosphor-icons/react/dist/ssr";
import type { VenueView } from "@/lib/venues";
import type { Coupon } from "@/lib/coupons";
import Logo from "@/app/ui/Logo";
import WalletView from "@/app/ui/WalletView";
import VenueDirectory from "@/app/ui/VenueDirectory";
import VenueClient from "@/app/p/[public_code]/VenueClient";
import WheelSheet from "@/app/ui/WheelSheet";
import ReviewSheet from "@/app/ui/ReviewSheet";
import ConsentCard from "@/app/ui/ConsentCard";
import { Stamps } from "@/app/ui/LoyaltyCard";
import Dashboard from "@/app/dashboard/Dashboard";
import { sampleDash } from "../sampleDash";

// Predstavitveni zasloni s primeri podatkov (lokali niso resnični partnerji).
// Namen: posnetki zaslona za pristajalno stran. Na produkciji strani ni.
export const dynamic = "force-dynamic";

const LIPA: VenueView = {
  id: "demo-lipa", code: "kavarna-lipa", name: "Kavarna Lipa", category: "kavarna", city: "Ljubljana", color: "#1F8BF5", logoUrl: "/vzorec/logo-lipa.webp",
  goal: 10, reward: "Brezplačna kava", phone: null, address: "Trubarjeva cesta 21, Ljubljana", website: "", hours: "Vsak dan od 7.00 do 20.00",
  about: "Sveže pražena kava in domače pecivo v središču mesta.", tagline: "Sveže pražena kava in domače pecivo.", coverUrl: "/vzorec/lipa-cover.jpg",
  wifiName: "Lipa gostje", wifiPass: "kava2026", menuUrl: "#", instagram: "kavarnalipa", checkin: "both", dailyLimit: true, live: true,
  wheel: { enabled: true, segments: ["Brezplačna kava", "Popust 10 %", "Sladko presenečenje", "Popust 15 %", "Brezplačen dodatek", "Popust 5 %"] },
  redemptionMinutes: 5, reviewUrl: "#",
};
const coupon = (status: Coupon["status"]): Coupon => ({
  id: "c1", venueId: LIPA.id, customerId: "m1", name: "Brezplačna kava", source: "card", status,
  expiresAt: status === "active" ? new Date(Date.now() + 5 * 60000 - 1000).toISOString() : null, createdAt: new Date().toISOString(),
});

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-ui relative min-h-svh bg-canvas">
      <header className="relative mx-auto flex max-w-6xl items-center px-6 pt-8">
        <Logo href={null} />
      </header>
      <main className="relative mx-auto max-w-6xl px-6 pb-32 pt-8">{children}</main>
      <nav className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-4" aria-hidden="true">
        <ul className="flex items-center gap-1 rounded-full border border-line bg-card/90 p-2 shadow-pop backdrop-blur-xl">
          {[
            { label: "Kartice", icon: Cards, on: true },
            { label: "Lokali", icon: Compass, on: false },
            { label: "Profil", icon: User, on: false },
          ].map((t) => (
            <li key={t.label} className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${t.on ? "bg-fg text-card" : "text-mute"}`}>
              <t.icon size={20} weight={t.on ? "fill" : "bold"} />
              {t.label}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default async function Showcase({ params }: { params: Promise<{ zaslon: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { zaslon } = await params;

  if (zaslon.startsWith("plosca")) {
    // plosca, plosca-gostje, plosca-demo, plosca-nastavitve, plosca-kolo …
    const section =
      (
        {
          plosca: "pregled",
          "plosca-gostje": "gostje",
          "plosca-demo": "narocnina",
          "plosca-nastavitve": "nastavitve",
          "plosca-kolo": "kolo",
          "plosca-kartica": "kartica",
          "plosca-marketing": "marketing",
          "plosca-ocene": "ocene",
        } as const
      )[zaslon] ?? "pregled";
    return <Dashboard data={sampleDash()} initialSection={section} isNew={false} billingSuccess={false} />;
  }

  if (zaslon === "denarnica") {
    return (
      <Shell>
        <WalletView
          name="Maja"
          showBirthday
          rewards={[
            { id: "r2", href: "#", name: "Brezplačen rogljiček", venue: "Pekarna Zrno", category: "pekarna", active: false },
          ]}
          cards={[
            { id: "1", href: "#", card: { name: "Kavarna Lipa", category: "kavarna", color: "#1F8BF5", logoUrl: "/vzorec/logo-lipa.webp", stamps: 7, goal: 10, reward: "Brezplačna kava" } },
            { id: "2", href: "#", card: { name: "Pekarna Zrno", category: "pekarna", color: "#F59A23", logoUrl: "/vzorec/logo-zrno.webp", stamps: 8, goal: 8, reward: "Brezplačen rogljiček" } },
            { id: "3", href: "#", card: { name: "Brivnica Karlo", category: "frizer", color: "#0B1826", logoUrl: "/vzorec/logo-karlo.webp", stamps: 4, goal: 6, reward: "Brezplačno striženje" } },
            { id: "4", href: "#", card: { name: "Cvetličarna Vrtnica", category: "cvetlicarna", color: "#E63F26", logoUrl: "/vzorec/logo-vrtnica.webp", stamps: 2, goal: 5, reward: "Brezplačen šopek" } },
          ]}
        />
      </Shell>
    );
  }

  if (zaslon === "lokali") {
    return (
      <Shell>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-semibold tracking-tight text-fg">Lokali</h1>
            <p className="text-base text-mute">Kjer zbiraš žige z Loyavi.</p>
          </div>
          <VenueDirectory
            venues={[
              { code: "a", name: "Kavarna Lipa", category: "kavarna", city: "Ljubljana", color: "#1F8BF5", logoUrl: "/vzorec/logo-lipa.webp", coverUrl: "/vzorec/lipa-cover.jpg", reward: "Brezplačna kava", goal: 10, mine: true },
              { code: "b", name: "Pekarna Zrno", category: "pekarna", city: "Ljubljana", color: "#F59A23", logoUrl: "/vzorec/logo-zrno.webp", coverUrl: "/photos/bakery.jpg", reward: "Brezplačen rogljiček", goal: 8, mine: true },
              { code: "c", name: "Brivnica Karlo", category: "frizer", city: "Maribor", color: "#0B1826", logoUrl: "/vzorec/logo-karlo.webp", coverUrl: "/photos/salon.jpg", reward: "Brezplačno striženje", goal: 6, mine: false },
              { code: "d", name: "Cvetličarna Vrtnica", category: "cvetlicarna", city: "Kranj", color: "#E63F26", logoUrl: "/vzorec/logo-vrtnica.webp", coverUrl: "/photos/florist.jpg", reward: "Brezplačen šopek", goal: 5, mine: false },
              { code: "e", name: "Sladoledarna Luna", category: "slascicarna", city: "Koper", color: "#FF7FB2", logoUrl: "/vzorec/logo-luna.webp", coverUrl: "/photos/icecream.jpg", reward: "Brezplačna kepica", goal: 6, mine: false },
              { code: "f", name: "Burger Hiša", category: "hitra-hrana", city: "Celje", color: "#FFC533", logoUrl: "/vzorec/logo-burger.webp", coverUrl: "", reward: "Brezplačen obrok", goal: 8, mine: false },
            ]}
          />
        </div>
      </Shell>
    );
  }

  const flags = { join: false, stand: false, coupon: zaslon === "kupon" ? "c1" : null };
  if (zaslon === "lokal" || zaslon === "kupon") {
    return <VenueClient venue={LIPA} signedIn member={{ stamps: 7 }} coupons={[coupon(zaslon === "kupon" ? "active" : "ready")]} canSpin={false} doneToday={false} flags={flags} />;
  }

  if (zaslon === "ocena") {
    return (
      <div className="app-ui">
        <VenueClient venue={LIPA} signedIn member={{ stamps: 8 }} coupons={[]} canSpin={false} doneToday={false} flags={flags} />
        <ReviewSheet open venueCode={LIPA.code} venueName={LIPA.name} reviewUrl="#" onClose={noop} initialStars={5} />
      </div>
    );
  }

  if (zaslon === "soglasje") {
    return (
      <main className="app-ui mx-auto flex min-h-svh w-full max-w-md flex-col gap-12 px-6 py-8">
        <Logo href={null} />
        <div className="flex flex-1 flex-col justify-center pb-16">
          <ConsentCard next="/app" email="maja@primer.si" />
        </div>
      </main>
    );
  }

  if (zaslon === "kolo") {
    return (
      <div className="app-ui">
        <VenueClient venue={LIPA} signedIn member={{ stamps: 0 }} coupons={[]} canSpin doneToday={false} flags={flags} />
        <WheelSheet open venueCode={LIPA.code} venueName={LIPA.name} color={LIPA.color} labels={LIPA.wheel.segments} onClose={noop} onWon={noop} />
      </div>
    );
  }

  if (zaslon === "zig") {
    return (
      <>
        <VenueClient venue={LIPA} signedIn member={{ stamps: 8 }} coupons={[]} canSpin={false} doneToday={false} flags={flags} />
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-scrim backdrop-blur-sm">
          <div className="flex w-full flex-col items-center gap-6 rounded-t-3xl bg-card p-6 pt-10 text-center shadow-pop">
            <div className="flex w-full justify-center pt-2">
              <Stamps total={10} filled={8} category="kavarna" ink="#1F8BF5" paper="#ffffff" max={56} />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-semibold tracking-tight text-fg">Žig je tvoj</h2>
              <p className="text-base text-mute">Še 2 obiska do nagrade: Brezplačna kava.</p>
            </div>
            <span className="w-full rounded-2xl bg-fg px-4 py-4 text-lg font-semibold text-card">Super</span>
          </div>
        </div>
      </>
    );
  }

  notFound();
}

async function noop() {
  "use server";
}
