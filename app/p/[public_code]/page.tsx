import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServiceClient } from "@/lib/supabase/server";
import { getGuest, membership } from "@/lib/guest";
import { hasWelcome, openCoupons } from "@/lib/coupons";
import { stampRewardName, toVenueView, venueByCode } from "@/lib/venues";
import { categoryLabel } from "@/lib/categories";
import VenueClient from "./VenueClient";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ public_code: string }>; searchParams: Promise<{ join?: string; stand?: string; kupon?: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { public_code } = await params;
  const venue = await venueByCode(getServiceClient(), public_code);
  if (!venue) return { title: "Lokal ne obstaja" };
  return {
    title: `${venue.name}: kartica zvestobe`,
    description: `Zbiraj žige pri lokalu ${venue.name} (${categoryLabel(venue.venue_type).toLowerCase()}${venue.city ? `, ${venue.city}` : ""}) in prevzemi nagrado. Brezplačno z Loyavi.`,
  };
}

export default async function VenuePage({ params, searchParams }: Params) {
  const [{ public_code }, sp] = await Promise.all([params, searchParams]);
  const db = getServiceClient();
  const venue = await venueByCode(db, public_code);
  if (!venue) notFound();

  const [guest, reward] = await Promise.all([getGuest(), stampRewardName(db, venue.id)]);
  const view = toVenueView(venue, reward);
  const member = guest ? await membership(db, venue.id, guest.email) : null;
  const [coupons, spun] = member ? await Promise.all([openCoupons(db, [member.id]), hasWelcome(db, member.id)]) : [[], true];

  return (
    <VenueClient
      venue={view}
      signedIn={!!guest}
      member={member ? { stamps: member.stamps ?? 0 } : null}
      coupons={coupons}
      canSpin={view.wheel.enabled && !spun}
      flags={{ join: sp.join === "1", stand: sp.stand === "1", coupon: sp.kupon ?? null }}
    />
  );
}
