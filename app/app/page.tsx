import { redirect } from "next/navigation";
import { getServiceClient } from "@/lib/supabase/server";
import { getGuest, memberships } from "@/lib/guest";
import { consentPath } from "@/lib/consent";
import { openCoupons } from "@/lib/coupons";
import { stampRewardNames, toVenueView } from "@/lib/venues";
import type { Venue } from "@/lib/types";
import WalletView from "@/app/ui/WalletView";
import InstallHint from "@/app/ui/InstallHint";

export const dynamic = "force-dynamic";

export default async function Wallet() {
  const guest = await getGuest();
  if (!guest) redirect("/prijava?next=/app");
  if (!guest.termsOk) redirect(consentPath("/app"));

  const db = getServiceClient();
  const ms = await memberships(db, guest.email);
  const venueIds = ms.map((m) => m.venue_id);
  const [{ data: venueRows }, rewards, coupons] = await Promise.all([
    venueIds.length ? db.from("venues").select("*").in("id", venueIds) : Promise.resolve({ data: [] as Venue[] }),
    stampRewardNames(db, venueIds),
    openCoupons(db, ms.map((m) => m.id)),
  ]);
  const venues = new Map(((venueRows ?? []) as Venue[]).map((v) => [v.id, toVenueView(v, rewards.get(v.id) ?? null)]));

  const ready = coupons.filter((c) => c.status === "ready" || c.status === "active");
  const readyVenues = new Set(ready.map((c) => c.venueId));
  const cards = ms
    .map((m) => ({ m, v: venues.get(m.venue_id) }))
    .filter((x): x is { m: (typeof ms)[number]; v: NonNullable<ReturnType<typeof venues.get>> } => !!x.v)
    .sort((a, b) => Number(readyVenues.has(b.v.id)) - Number(readyVenues.has(a.v.id)));
  const hasBirthday = !!guest.birthday || ms.some((m) => m.birthday);
  const first = guest.name?.split(" ")[0];

  return (
    <WalletView
      name={first ?? null}
      showBirthday={cards.length > 0 && !hasBirthday}
      rewards={ready.flatMap((c) => {
        const v = venues.get(c.venueId);
        return v ? [{ id: c.id, href: `/p/${v.code}?kupon=${c.id}`, name: c.name, venue: v.name, category: v.category, active: c.status === "active" }] : [];
      })}
      cards={cards.map(({ m, v }) => ({
        id: m.id,
        href: `/p/${v.code}`,
        card: { name: v.name, category: v.category, color: v.color, logoUrl: v.logoUrl, stamps: m.stamps ?? 0, goal: v.goal, reward: v.reward },
      }))}
      extra={<InstallHint />}
    />
  );
}
