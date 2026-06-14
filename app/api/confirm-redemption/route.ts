import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { errMsg } from "@/lib/loyalty";

// POST /api/confirm-redemption  { venueCode, redemptionId }
// Osebje potrdi unovčenje (pred iztekom). Vrne status: redeemed | expired | ...
export async function POST(req: Request) {
  try {
    const { venueCode, redemptionId } = await req.json();
    if (!venueCode || !redemptionId) {
      return NextResponse.json({ ok: false, error: "Manjkajo podatki." }, { status: 400 });
    }
    const db = getServiceClient();
    const { data: venue } = await db
      .from("venues")
      .select("id")
      .eq("public_code", venueCode)
      .single();
    if (!venue) return NextResponse.json({ ok: false, error: "Lokal ne obstaja." }, { status: 404 });

    const { data: status, error } = await db.rpc("confirm_redemption", {
      p_redemption_id: redemptionId,
      p_venue_id: venue.id,
    });
    if (error) throw error;

    return NextResponse.json({ ok: true, status });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errMsg(e) }, { status: 500 });
  }
}
