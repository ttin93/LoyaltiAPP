import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { nextRewardProgress, errMsg } from "@/lib/loyalty";

// GET /api/customer?venueCode=...&customerId=...
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const venueCode = url.searchParams.get("venueCode");
    const customerId = url.searchParams.get("customerId");
    if (!venueCode || !customerId) {
      return NextResponse.json({ ok: false, error: "Manjkajo podatki." }, { status: 400 });
    }

    const db = getServiceClient();
    const { data: venue } = await db
      .from("venues")
      .select("id")
      .eq("public_code", venueCode)
      .single();
    if (!venue) {
      return NextResponse.json({ ok: false, error: "Lokal ne obstaja." }, { status: 404 });
    }

    const { data: customer } = await db
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();
    if (!customer || customer.venue_id !== venue.id) {
      return NextResponse.json({ ok: false, error: "Neveljavna stranka." }, { status: 404 });
    }

    const { data: rewards } = await db.from("rewards").select("*").eq("venue_id", venue.id);
    return NextResponse.json({
      ok: true,
      points: customer.points,
      stamps: customer.stamps ?? 0,
      nextReward: nextRewardProgress(customer.points, (rewards ?? []).filter((r) => r.kind !== "stamp")),
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errMsg(e) }, { status: 500 });
  }
}
