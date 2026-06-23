"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSSRClient, getCurrentUser } from "@/lib/supabase/ssrServer";
import { getServiceClient } from "@/lib/supabase/server";
import { parseFiscalQR } from "@/lib/fiscalQr";
import type { WheelConfig } from "@/lib/types";

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

  // lastnik ima lahko VEČ lokalov (vsak svoj loyalty + naročnina)
  const name = String(formData.get("name") || "").trim();
  const brand = String(formData.get("brand_color") || "#16a34a");
  if (!name) throw new Error("Vpiši ime lokala.");

  const owner_name = String(formData.get("owner_name") || "").trim() || null;
  const phone = String(formData.get("phone") || "").trim() || null;
  const venue_type = String(formData.get("venue_type") || "").trim() || null;
  const city = String(formData.get("city") || "").trim() || null;
  const points_model = formData.get("points_model") === "per_euro" ? "per_euro" : "per_visit";

  // nastavljiv žig-cilj (4–12) + točk na obisk (lahko 0 = samo žigi)
  const rawPts = Number(formData.get("points_per_visit"));
  const pointsPerVisit = Math.min(50, Math.max(0, Number.isFinite(rawPts) ? rawPts : 10));
  const stampGoal = Math.min(12, Math.max(4, Number(formData.get("stamp_goal")) || 10));
  const rewardName = String(formData.get("reward_name") || "").trim() || "Brezplačna kava";

  // točkovne nagrade (urejene v onboardingu); prazne/0 odpademo
  let extraRewards: { name: string; points: number }[] = [];
  try {
    const parsed = JSON.parse(String(formData.get("point_rewards") || "[]"));
    if (Array.isArray(parsed)) extraRewards = parsed;
  } catch {
    /* ignore */
  }
  const pointRewardRows = extraRewards
    .map((r) => ({ name: String(r?.name || "").trim(), points: Math.max(0, Number(r?.points) || 0) }))
    .filter((r) => r.name && r.points > 0)
    .map((r, i) => ({ name: r.name, points: r.points, sort: i + 2 }));

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
    ...pointRewardRows.map((r) => ({ venue_id: venue.id, name: r.name, points_required: r.points, sort_order: r.sort, kind: "points" })),
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
    patch.points_per_visit = Math.max(0, Number(formData.get("points_per_visit")) || 0);
  if (formData.has("stamp_goal"))
    patch.stamp_goal = Math.min(12, Math.max(4, Number(formData.get("stamp_goal")) || 10));
  if (formData.has("scan_window_hours"))
    patch.scan_window_hours = Number(formData.get("scan_window_hours"));
  if (formData.has("scan_cooldown_minutes"))
    patch.scan_cooldown_minutes = Math.max(0, Number(formData.get("scan_cooldown_minutes")) || 0);
  if (formData.has("google_review_url"))
    patch.google_review_url = String(formData.get("google_review_url")).trim() || null;
  if (formData.has("language")) patch.language = String(formData.get("language")) || "sl";
  if (formData.has("davcna_stevilka")) {
    const dav = String(formData.get("davcna_stevilka")).replace(/\D/g, "").slice(0, 8);
    patch.davcna_stevilka = dav.length === 8 ? dav : null;
  }
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
  const kind = formData.get("kind") === "stamp" ? "stamp" : "points";
  if (!name || !points) throw new Error("Vpiši ime in vrednost.");
  if (id) {
    await db
      .from("rewards")
      .update({ name, points_required: points })
      .eq("id", id)
      .eq("venue_id", venue.id);
  } else {
    await db
      .from("rewards")
      .insert({ venue_id: venue.id, name, points_required: points, sort_order: 99, kind });
  }
  revalidatePath("/dashboard");
}

/**
 * Testiraj fiskalni račun BREZ dodeljevanja točk: pove ali je veljaven za ta lokal
 * in ali je unikaten. (Ne gleda ure/datuma — samo struktura, davčna in ZOI.)
 */
export async function testReceipt(payload: string): Promise<{ ok: boolean; msg: string }> {
  const { db, venue } = await ownerVenue();
  if (!venue) throw new Error("Nimaš lokala.");
  let parsed;
  try {
    parsed = parseFiscalQR(payload);
  } catch (e) {
    return { ok: false, msg: e instanceof Error ? e.message : "QR ni veljaven fiskalni račun." };
  }
  if (venue.davcna_stevilka && parsed.davcna !== venue.davcna_stevilka) {
    return { ok: false, msg: `Račun ni tega lokala (davčna ${parsed.davcna}).` };
  }
  const { data: dup } = await db
    .from("scans")
    .select("id")
    .eq("zoi", parsed.zoiHex)
    .maybeSingle();
  if (dup) return { ok: false, msg: "Račun je že bil uporabljen — ni unikaten." };
  return { ok: true, msg: `Veljaven račun · davčna ${parsed.davcna}` };
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
  // dnevnik: kdo/kdaj/koliko (vidno v Zgodovini)
  await db.from("point_grants").insert({ venue_id: venue.id, customer_id: customerId, points });
  revalidatePath("/dashboard");
}

/** Shrani konfiguracijo kolesa sreče. */
export async function saveWheel(config: WheelConfig) {
  const { db, venue } = await ownerVenue();
  if (!venue) throw new Error("Nimaš lokala.");
  await db.from("venues").update({ wheel_config: config }).eq("id", venue.id);
  revalidatePath("/dashboard");
}

export async function signOut() {
  const supabase = await createSSRClient();
  await supabase.auth.signOut();
  redirect("/partner");
}
