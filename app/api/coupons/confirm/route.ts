import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { getGuest, memberships } from "@/lib/guest";
import { confirmCoupon } from "@/lib/coupons";
import { errMsg } from "@/lib/loyalty";

// POST /api/coupons/confirm { couponId } — osebje na gostovem telefonu potrdi prevzem nagrade.
export async function POST(req: Request) {
  try {
    const guest = await getGuest();
    if (!guest) return NextResponse.json({ ok: false, error: "Prijavi se." }, { status: 401 });
    const { couponId } = await req.json();
    if (!couponId) return NextResponse.json({ ok: false, error: "Manjkajo podatki." }, { status: 400 });

    const db = getServiceClient();
    const mine = (await memberships(db, guest.email)).map((m) => m.id);
    const status = mine.length ? await confirmCoupon(db, String(couponId), mine) : "invalid";
    if (status === "invalid") return NextResponse.json({ ok: false, error: "Kupon ni aktiven." });
    return NextResponse.json({ ok: true, status });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errMsg(e) }, { status: 500 });
  }
}
