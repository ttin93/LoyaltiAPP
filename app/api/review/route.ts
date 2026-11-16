import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { getGuest, membership } from "@/lib/guest";
import { venueByCode } from "@/lib/venues";
import { errMsg } from "@/lib/loyalty";

// POST /api/review { venueCode, stars, comment?, toGoogle? }
// 4–5 zvezdic: gost gre na Google. 1–3: zasebno sporočilo lokalu.
export async function POST(req: Request) {
  try {
    const guest = await getGuest();
    if (!guest) return NextResponse.json({ ok: false, error: "Prijavi se." }, { status: 401 });

    const body = await req.json();
    const stars = Number(body.stars);
    if (!body.venueCode || !(stars >= 1 && stars <= 5)) {
      return NextResponse.json({ ok: false, error: "Manjkajo podatki." }, { status: 400 });
    }
    const db = getServiceClient();
    const venue = await venueByCode(db, String(body.venueCode));
    if (!venue) return NextResponse.json({ ok: false, error: "Lokal ne obstaja." }, { status: 404 });

    const member = await membership(db, venue.id, guest.email);
    if (!member) return NextResponse.json({ ok: false, error: "Oceno lahko odda samo gost lokala." }, { status: 403 });

    const comment = String(body.comment || "").trim().slice(0, 1000) || null;
    await db.from("reviews").insert({ venue_id: venue.id, customer_id: member.id, stars: Math.round(stars), comment, to_google: !!body.toGoogle });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errMsg(e) }, { status: 500 });
  }
}
