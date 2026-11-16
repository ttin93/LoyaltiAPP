import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import { getServiceClient } from "@/lib/supabase/server";
import { getGuest, ensureMembership } from "@/lib/guest";
import { venueByCode, wheelOf } from "@/lib/venues";
import { grantCoupon, hasWelcome, SOURCE } from "@/lib/coupons";
import { errMsg } from "@/lib/loyalty";

// POST /api/wheel { venueCode } — kolo dobrodošlice. Zmagovalca izbere STREŽNIK,
// vsako članstvo lahko zavrti enkrat. Nagrada čaka do prvega potrjenega obiska.
export async function POST(req: Request) {
  try {
    const guest = await getGuest();
    if (!guest) return NextResponse.json({ ok: false, error: "Prijavi se." }, { status: 401 });

    const { venueCode } = await req.json();
    const db = getServiceClient();
    const venue = await venueByCode(db, String(venueCode || ""));
    if (!venue) return NextResponse.json({ ok: false, error: "Lokal ne obstaja." }, { status: 404 });

    const wheel = wheelOf(venue);
    if (wheel.enabled === false) return NextResponse.json({ ok: false, error: "Kolo pri tem lokalu ni vklopljeno." });

    const { member } = await ensureMembership(db, venue.id, guest);
    if (await hasWelcome(db, member.id)) return NextResponse.json({ ok: false, error: "Kolo je že zavrteno. Velja en poskus." });

    const n = wheel.segments.length;
    let index = Math.max(0, Math.min(wheel.winner ?? 0, n - 1));
    if (wheel.mode === "weighted") {
      const weights = wheel.segments.map((s) => Math.max(0, Math.round((Number(s.weight) || 0) * 100)));
      const total = weights.reduce((a, b) => a + b, 0);
      if (total > 0) {
        let x = randomInt(total);
        index = weights.findIndex((w) => (x -= w) < 0);
        if (index < 0) index = n - 1;
      }
    }
    const label = wheel.segments[index]?.label || "Nagrada";

    const coupon = await grantCoupon(db, { venueId: venue.id, customerId: member.id, name: label, source: "welcome", status: "pending" });

    // varovalo pred dvojnim klikom: obdrži najstarejšo nagrado dobrodošlice
    const { data: all } = await db
      .from("redemptions")
      .select("id, created_at")
      .eq("customer_id", member.id)
      .eq("points_spent", SOURCE.welcome)
      .order("created_at", { ascending: true });
    if ((all ?? []).length > 1 && all![0].id !== coupon.id) {
      await db.from("redemptions").delete().eq("id", coupon.id);
      return NextResponse.json({ ok: false, error: "Kolo je že zavrteno. Velja en poskus." });
    }

    return NextResponse.json({ ok: true, index, label });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errMsg(e) }, { status: 500 });
  }
}
