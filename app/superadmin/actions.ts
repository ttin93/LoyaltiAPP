"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/supabase/ssrServer";
import { getServiceClient } from "@/lib/supabase/server";
import { isSuperadmin } from "@/lib/superadmin";

async function assertSuperadmin() {
  const user = await getCurrentUser();
  if (!user || !isSuperadmin(user.email)) throw new Error("Nimaš dostopa.");
  return getServiceClient();
}

/** Superadmin lahko ureja KATERIKOLI lokal (ne le svojega). */
export async function adminUpdateVenue(formData: FormData) {
  const db = await assertSuperadmin();
  const venueId = String(formData.get("venue_id") || "");
  if (!venueId) throw new Error("Manjka lokal.");

  const patch: Record<string, unknown> = {};
  if (formData.has("name")) patch.name = String(formData.get("name")).trim();
  if (formData.has("brand_color")) patch.brand_color = String(formData.get("brand_color"));
  if (formData.has("points_per_visit"))
    patch.points_per_visit = Math.max(0, Number(formData.get("points_per_visit")) || 0);
  if (formData.has("stamp_goal"))
    patch.stamp_goal = Math.min(12, Math.max(4, Number(formData.get("stamp_goal")) || 10));
  if (formData.has("scan_window_hours"))
    patch.scan_window_hours = Math.max(1, Number(formData.get("scan_window_hours")) || 24);
  if (formData.has("scan_cooldown_minutes"))
    patch.scan_cooldown_minutes = Math.max(0, Number(formData.get("scan_cooldown_minutes")) || 0);
  if (formData.has("google_review_url"))
    patch.google_review_url = String(formData.get("google_review_url")).trim() || null;
  if (formData.has("language")) patch.language = String(formData.get("language")) || "sl";
  if (formData.has("davcna_stevilka")) {
    const dav = String(formData.get("davcna_stevilka")).replace(/\D/g, "").slice(0, 8);
    patch.davcna_stevilka = dav.length === 8 ? dav : null;
  }

  const { error } = await db.from("venues").update(patch).eq("id", venueId);
  if (error) throw error;
  revalidatePath("/superadmin");
}
