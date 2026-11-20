import { redirect } from "next/navigation";
import { getServiceClient } from "@/lib/supabase/server";
import { getGuest, memberships } from "@/lib/guest";
import { stampRewardNames, toVenueView } from "@/lib/venues";
import { venueMeta } from "@/lib/venueMeta";
import type { Venue } from "@/lib/types";
import VenueDirectory, { type DirectoryVenue } from "@/app/ui/VenueDirectory";

export const dynamic = "force-dynamic";

export default async function Lokali() {
  const guest = await getGuest();
  if (!guest) redirect("/prijava?next=/app/lokali");

  const db = getServiceClient();
  const [{ data }, ms] = await Promise.all([db.from("venues").select("*").order("name").limit(1000), memberships(db, guest.email)]);
  const listed = ((data ?? []) as Venue[]).filter((v) => venueMeta(v).listed);
  const rewards = await stampRewardNames(db, listed.map((v) => v.id));
  const mine = new Set(ms.map((m) => m.venue_id));

  const venues: DirectoryVenue[] = listed
    .map((v) => toVenueView(v, rewards.get(v.id) ?? null))
    .filter((v) => v.live)
    .map((v) => ({ code: v.code, name: v.name, category: v.category, city: v.city, color: v.color, logoUrl: v.logoUrl, coverUrl: v.coverUrl, reward: v.reward, goal: v.goal, mine: mine.has(v.id) }));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-semibold tracking-tight text-fg">Lokali</h1>
        <p className="text-base text-mute">Kjer zbiraš žige z Loyavi.</p>
      </div>
      <VenueDirectory venues={venues} />
    </div>
  );
}
