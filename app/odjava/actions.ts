"use server";

import { revalidatePath } from "next/cache";
import { getServiceClient } from "@/lib/supabase/server";
import { unsubValid } from "@/lib/unsub";
import { setVenueMarketing } from "@/lib/consent";

/** Odjava ali ponovna prijava na sporočila lokala. Povezava je podpisana, prijava ni potrebna. */
export async function setMarketing(customerId: string, token: string, off: boolean): Promise<void> {
  if (!unsubValid(customerId, token)) return;
  const db = getServiceClient();
  const { data } = await db.from("customers").select("id, venue_id").eq("id", customerId).maybeSingle();
  if (!data) return;
  // ponovna prijava je izrecno dejanje gosta, zato velja kot privolitev za ta lokal
  await setVenueMarketing(db, data.venue_id as string, customerId, !off, "odjava");
  revalidatePath("/odjava");
}
