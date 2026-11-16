import { NextResponse, after } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { parseFiscalQR, FiscalQRError } from "@/lib/fiscalQr";
import { getGuest, ensureMembership } from "@/lib/guest";
import { venueByCode, venueHasAccess } from "@/lib/venues";
import { venueMeta } from "@/lib/venueMeta";
import { awardStamp, cooldownLeft, DuplicateStamp } from "@/lib/stamp";
import { notifyCouponEarned, notifyWelcome } from "@/lib/notify";
import { errMsg } from "@/lib/loyalty";

// POST /api/scan { venueCode, payload } — žig na podlagi fiskalnega računa (dokaz nakupa).
export async function POST(req: Request) {
  try {
    const guest = await getGuest();
    if (!guest) return NextResponse.json({ ok: false, error: "Prijavi se." }, { status: 401 });

    const { venueCode, payload } = await req.json();
    if (!venueCode || !payload) return NextResponse.json({ ok: false, error: "Manjkajo podatki." }, { status: 400 });

    let parsed;
    try {
      parsed = parseFiscalQR(String(payload));
    } catch (e) {
      return NextResponse.json({ ok: false, error: e instanceof FiscalQRError ? e.message : "Kode ni mogoče prebrati." });
    }

    const db = getServiceClient();
    const venue = await venueByCode(db, String(venueCode));
    if (!venue) return NextResponse.json({ ok: false, error: "Lokal ne obstaja." }, { status: 404 });

    if (venueMeta(venue).checkin === "stand") {
      return NextResponse.json({ ok: false, error: "Ta lokal beleži obiske na stojalu ob blagajni." });
    }
    if (!venue.davcna_stevilka) return NextResponse.json({ ok: false, error: "Lokal še ni vklopil skeniranja računov." });
    if (!(await venueHasAccess(db, venue))) return NextResponse.json({ ok: false, error: "Lokal trenutno ne sprejema žigov." });

    if (parsed.davcna !== venue.davcna_stevilka) return NextResponse.json({ ok: false, error: "Ta račun ni iz tega lokala." });
    const ageHours = (Date.now() - parsed.issuedAt.getTime()) / 36e5;
    if (ageHours > venue.scan_window_hours) return NextResponse.json({ ok: false, error: "Račun je prestar." });
    if (ageHours < -1) return NextResponse.json({ ok: false, error: "Datum na računu ni veljaven." });

    const { member, isNew } = await ensureMembership(db, venue.id, guest);
    if (isNew) after(() => notifyWelcome(venue, guest.email));

    const wait = await cooldownLeft(db, venue, member.id);
    if (wait > 0) return NextResponse.json({ ok: false, error: `Naslednji račun lahko skeniraš čez ${wait} min.` });

    let result;
    try {
      result = await awardStamp(db, venue, member, { zoi: parsed.zoiHex, davcna: parsed.davcna, issuedAt: parsed.issuedAt });
    } catch (e) {
      if (e instanceof DuplicateStamp) return NextResponse.json({ ok: false, error: "Ta račun je že bil uporabljen." });
      throw e;
    }
    if (result.cardCompleted) after(() => notifyCouponEarned(venue, guest.email, { rewardName: result.rewardName }));

    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errMsg(e) }, { status: 500 });
  }
}
