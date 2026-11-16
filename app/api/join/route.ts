import { NextResponse, after } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { getGuest, ensureMembership } from "@/lib/guest";
import { venueByCode, wheelOf } from "@/lib/venues";
import { hasWelcome } from "@/lib/coupons";
import { notifyWelcome } from "@/lib/notify";
import { errMsg } from "@/lib/loyalty";

// POST /api/join { venueCode } — doda kartico lokala v gostovo denarnico.
export async function POST(req: Request) {
  try {
    const guest = await getGuest();
    if (!guest) return NextResponse.json({ ok: false, error: "Prijavi se." }, { status: 401 });
    const { venueCode } = await req.json();
    const db = getServiceClient();
    const venue = await venueByCode(db, String(venueCode || ""));
    if (!venue) return NextResponse.json({ ok: false, error: "Lokal ne obstaja." }, { status: 404 });

    const { member, isNew } = await ensureMembership(db, venue.id, guest);
    if (isNew) after(() => notifyWelcome(venue, guest.email));

    const wheel = wheelOf(venue);
    const canSpin = wheel.enabled !== false && !(await hasWelcome(db, member.id));
    return NextResponse.json({ ok: true, isNew, canSpin });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errMsg(e) }, { status: 500 });
  }
}
