import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { errMsg } from "@/lib/loyalty";

// POST /api/review  { venueCode, customerId?, stars, comment?, toGoogle? }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const venueCode = String(body.venueCode || "");
    const stars = Number(body.stars);
    if (!venueCode || !(stars >= 1 && stars <= 5)) {
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

    // customer_id le, če pripada temu lokalu (sicer null)
    let customerId: string | null = null;
    const cid = String(body.customerId || "");
    if (cid) {
      const { data: c } = await db.from("customers").select("id, venue_id").eq("id", cid).maybeSingle();
      if (c && c.venue_id === venue.id) customerId = c.id;
    }

    await db.from("reviews").insert({
      venue_id: venue.id,
      customer_id: customerId,
      stars,
      comment: String(body.comment || "").trim().slice(0, 1000) || null,
      to_google: !!body.toGoogle,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errMsg(e) }, { status: 500 });
  }
}
