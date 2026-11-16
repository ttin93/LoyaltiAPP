import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { getGuest, memberships } from "@/lib/guest";
import { activateCoupon } from "@/lib/coupons";
import { errMsg } from "@/lib/loyalty";

// POST /api/coupons/activate { couponId } — gost aktivira kupon ob blagajni, steče časovnik.
export async function POST(req: Request) {
  try {
    const guest = await getGuest();
    if (!guest) return NextResponse.json({ ok: false, error: "Prijavi se." }, { status: 401 });
    const { couponId } = await req.json();
    if (!couponId) return NextResponse.json({ ok: false, error: "Manjkajo podatki." }, { status: 400 });

    const db = getServiceClient();
    const mine = (await memberships(db, guest.email)).map((m) => m.id);
    if (!mine.length) return NextResponse.json({ ok: false, error: "Kupon ne obstaja." }, { status: 404 });

    const { data: row } = await db.from("redemptions").select("venue_id").eq("id", couponId).in("customer_id", mine).maybeSingle();
    if (!row) return NextResponse.json({ ok: false, error: "Kupon ne obstaja." }, { status: 404 });
    const { data: venue } = await db.from("venues").select("redemption_minutes").eq("id", row.venue_id).single();
    const minutes = Math.max(1, Number(venue?.redemption_minutes) || 5);

    const coupon = await activateCoupon(db, String(couponId), mine, minutes);
    if (!coupon) return NextResponse.json({ ok: false, error: "Kupon ni več na voljo." });
    return NextResponse.json({ ok: true, coupon });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errMsg(e) }, { status: 500 });
  }
}
