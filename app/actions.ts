"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSSRClient, getCurrentUser } from "@/lib/supabase/ssrServer";
import { getServiceClient } from "@/lib/supabase/server";
import { parseFiscalQR } from "@/lib/fiscalQr";

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

async function ownerVenue() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Nisi prijavljen.");
  const db = getServiceClient();
  // limit(1) namesto maybeSingle: maybeSingle vrže napako, če je lastnik nekoč ustvaril >1 lokal
  const { data: venues } = await db
    .from("venues")
    .select("*")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1);
  return { user, db, venue: venues?.[0] ?? null };
}

export async function createVenue(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Nisi prijavljen.");
  const db = getServiceClient();

  // če lokal že obstaja, ne ustvarjaj drugega — pelji na dashboard
  const { data: already } = await db.from("venues").select("id").eq("owner_user_id", user.id).limit(1);
  if (already && already.length) redirect("/dashboard");

  const name = String(formData.get("name") || "").trim();
  const brand = String(formData.get("brand_color") || "#16a34a");
  if (!name) throw new Error("Vpiši ime lokala.");

  const owner_name = String(formData.get("owner_name") || "").trim() || null;
  const phone = String(formData.get("phone") || "").trim() || null;
  const venue_type = String(formData.get("venue_type") || "").trim() || null;
  const city = String(formData.get("city") || "").trim() || null;
  const points_model = formData.get("points_model") === "per_euro" ? "per_euro" : "per_visit";

  // nastavljiv žig-cilj (4–12) + točk na obisk; glavna nagrada = stampGoal × pointsPerVisit
  const pointsPerVisit = Math.min(50, Math.max(1, Number(formData.get("points_per_visit")) || 10));
  const stampGoal = Math.min(12, Math.max(4, Number(formData.get("stamp_goal")) || 10));
  const rewardName = String(formData.get("reward_name") || "").trim() || "Brezplačna kava";

  // unikaten public_code
  const base = slugify(name);
  let code = base;
  for (let i = 0; i < 6; i++) {
    const { data: existing } = await db
      .from("venues")
      .select("id")
      .eq("public_code", code)
      .maybeSingle();
    if (!existing) break;
    code = `${base}-${Math.floor(Math.random() * 9000 + 1000)}`;
  }

  const { data: venue, error } = await db
    .from("venues")
    .insert({ owner_user_id: user.id, name, brand_color: brand, public_code: code, owner_name, phone, venue_type, city, points_model, points_per_visit: pointsPerVisit, stamp_goal: stampGoal })
    .select("*")
    .single();
  if (error) throw error;

  // kava = ŽIGI (poln kartonček = stampGoal žigov); druge nagrade = TOČKE
  await db.from("rewards").insert([
    { venue_id: venue.id, name: rewardName, points_required: stampGoal, sort_order: 1, kind: "stamp" },
    { venue_id: venue.id, name: "Domač rogljiček", points_required: 250, sort_order: 2, kind: "points" },
    { venue_id: venue.id, name: "Kos torte", points_required: 350, sort_order: 3, kind: "points" },
  ]);

  redirect("/dashboard");
}

export async function updateVenueSettings(formData: FormData) {
  const { db, venue } = await ownerVenue();
  if (!venue) throw new Error("Nimaš lokala.");
  const patch: Record<string, unknown> = {};
  if (formData.has("name")) patch.name = String(formData.get("name")).trim();
  if (formData.has("brand_color")) patch.brand_color = String(formData.get("brand_color"));
  if (formData.has("points_per_visit"))
    patch.points_per_visit = Number(formData.get("points_per_visit"));
  if (formData.has("scan_window_hours"))
    patch.scan_window_hours = Number(formData.get("scan_window_hours"));
  await db.from("venues").update(patch).eq("id", venue.id);
  revalidatePath("/dashboard");
}

/** Aktiviraj skeniranje: iz vzorčnega fiskalnega QR preberi davčno izdajatelja. */
export async function activateScanning(payload: string): Promise<string> {
  const { db, venue } = await ownerVenue();
  if (!venue) throw new Error("Nimaš lokala.");
  const parsed = parseFiscalQR(payload); // vrže, če neveljaven
  await db.from("venues").update({ davcna_stevilka: parsed.davcna }).eq("id", venue.id);
  revalidatePath("/dashboard");
  return parsed.davcna;
}

export async function saveReward(formData: FormData) {
  const { db, venue } = await ownerVenue();
  if (!venue) throw new Error("Nimaš lokala.");
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const points = Number(formData.get("points_required"));
  if (!name || !points) throw new Error("Vpiši ime in točke.");
  if (id) {
    await db
      .from("rewards")
      .update({ name, points_required: points })
      .eq("id", id)
      .eq("venue_id", venue.id);
  } else {
    await db
      .from("rewards")
      .insert({ venue_id: venue.id, name, points_required: points, sort_order: 99 });
  }
  revalidatePath("/dashboard");
}

export async function deleteReward(id: string) {
  const { db, venue } = await ownerVenue();
  if (!venue) throw new Error("Nimaš lokala.");
  await db.from("rewards").delete().eq("id", id).eq("venue_id", venue.id);
  revalidatePath("/dashboard");
}

export async function addManualPoints(customerId: string, points: number) {
  const { db, venue } = await ownerVenue();
  if (!venue) throw new Error("Nimaš lokala.");
  const { data: c } = await db
    .from("customers")
    .select("id, venue_id, points")
    .eq("id", customerId)
    .single();
  if (!c || c.venue_id !== venue.id) throw new Error("Neveljavna stranka.");
  await db
    .from("customers")
    .update({ points: c.points + points })
    .eq("id", customerId);
  revalidatePath("/dashboard");
}

export async function signOut() {
  const supabase = await createSSRClient();
  await supabase.auth.signOut();
  redirect("/partner");
}
