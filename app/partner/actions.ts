"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { getCurrentUser } from "@/lib/supabase/ssrServer";
import { getServiceClient } from "@/lib/supabase/server";
import { PLANS, bestOwnerPlan, planMaxVenues } from "@/lib/plans";
import { categoryDefaultReward, categoryKey } from "@/lib/categories";
import { safeHex } from "@/lib/color";
import { mergeVenueMeta, newStandKey, type CheckinMode } from "@/lib/venueMeta";
import { notifyOwnerWelcome } from "@/lib/notify";

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[čć]/g, "c")
      .replace(/š/g, "s")
      .replace(/ž/g, "z")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 24) || "lokal"
  );
}

export type CreateVenueState = { error: string | null };

/** Ustvari lokal (onboarding). Ob uspehu preusmeri v nadzorno ploščo. */
export async function createVenue(_prev: CreateVenueState, formData: FormData): Promise<CreateVenueState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Seja je potekla. Prijavi se znova." };
  const db = getServiceClient();

  const { data: owned } = await db.from("venues").select("plan, subscription_status").eq("owner_user_id", user.id);
  const ownerPlan = bestOwnerPlan(owned ?? []);
  const max = planMaxVenues(ownerPlan);
  if ((owned?.length ?? 0) >= max) {
    return { error: `Tvoj paket (${PLANS[ownerPlan].label}) omogoča ${max === 1 ? "en lokal" : `do ${max} lokalov`}. Za več lokalov izberi paket Veriga.` };
  }

  const name = String(formData.get("name") || "").trim().slice(0, 60);
  if (name.length < 2) return { error: "Vpiši ime lokala." };
  const category = categoryKey(String(formData.get("category") || ""));
  const city = String(formData.get("city") || "").trim().slice(0, 60) || null;
  const color = safeHex(String(formData.get("brand_color") || ""));
  const stampGoal = Math.min(12, Math.max(4, Number(formData.get("stamp_goal")) || 8));
  const rewardName = String(formData.get("reward_name") || "").trim().slice(0, 60) || categoryDefaultReward(category);
  const raw = String(formData.get("checkin") || "receipt");
  const checkin: CheckinMode = raw === "stand" || raw === "both" ? raw : "receipt";

  // unikatna javna koda: ime + 8 naključnih števk
  const base = slugify(name);
  const rand8 = () => String(Math.floor(Math.random() * 1e8)).padStart(8, "0");
  let code = `${base}-${rand8()}`;
  for (let i = 0; i < 6; i++) {
    const { data: existing } = await db.from("venues").select("id").eq("public_code", code).maybeSingle();
    if (!existing) break;
    code = `${base}-${rand8()}`;
  }

  const { data: venue, error } = await db
    .from("venues")
    .insert({
      owner_user_id: user.id,
      name,
      brand_color: color,
      public_code: code,
      venue_type: category,
      city,
      points_model: "per_visit",
      points_per_visit: 10,
      stamp_goal: stampGoal,
      trial_ends_at: new Date(Date.now() + 30 * 864e5).toISOString(),
      automations: mergeVenueMeta(null, { checkin, standKey: newStandKey(), listed: true }),
    })
    .select("id")
    .single();
  if (error || !venue) return { error: "Lokala ni bilo mogoče ustvariti. Poskusi znova." };

  await db.from("rewards").insert({ venue_id: venue.id, name: rewardName, points_required: stampGoal, sort_order: 1, kind: "stamp" });

  after(() => notifyOwnerWelcome(user.email, null, name));
  redirect(`/dashboard?v=${venue.id}&novo=1`);
}
