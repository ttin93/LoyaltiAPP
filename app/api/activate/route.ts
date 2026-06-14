import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { errMsg } from "@/lib/loyalty";

// POST /api/activate  { venueCode, customerId, rewardId }
// Odšteje točke + ustvari aktiven redemption s server-side iztekom.
export async function POST(req: Request) {
  try {
    const { venueCode, customerId, rewardId } = await req.json();
    if (!venueCode || !customerId || !rewardId) {
      return NextResponse.json({ ok: false, error: "Manjkajo podatki." }, { status: 400 });
    }
    const db = getServiceClient();
    const { data: venue } = await db
      .from("venues")
      .select("id, redemption_minutes")
      .eq("public_code", venueCode)
      .single();
    if (!venue) return NextResponse.json({ ok: false, error: "Lokal ne obstaja." }, { status: 404 });

    const { data: reward } = await db.from("rewards").select("name").eq("id", rewardId).single();

    const { data, error } = await db.rpc("activate_reward", {
      p_venue_id: venue.id,
      p_customer_id: customerId,
      p_reward_id: rewardId,
      p_minutes: venue.redemption_minutes,
    });
    if (error) {
      if (error.message?.includes("insufficient_points"))
        return NextResponse.json({ ok: false, error: "Premalo točk." });
      if (error.message?.includes("reward_not_found"))
        return NextResponse.json({ ok: false, error: "Nagrada ne obstaja." });
      throw error;
    }
    const row = Array.isArray(data) ? data[0] : data;
    return NextResponse.json({
      ok: true,
      redemptionId: row.redemption_id,
      expiresAt: row.expires_at,
      rewardName: reward?.name ?? "Nagrada",
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errMsg(e) }, { status: 500 });
  }
}
