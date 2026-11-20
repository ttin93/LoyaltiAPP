import { NextResponse, after } from "next/server";
import { cookies } from "next/headers";
import { getServiceClient } from "@/lib/supabase/server";
import { getGuest, ensureMembership, localDay, NEEDS_CONSENT } from "@/lib/guest";
import { venueByCode, venueHasAccess } from "@/lib/venues";
import { venueMeta } from "@/lib/venueMeta";
import { ALREADY_TODAY, awardStamp, cooldownLeft, DuplicateStamp, STAND_COOKIE, standCookieValid, stampedToday } from "@/lib/stamp";
import { notifyCouponEarned, notifyWelcome } from "@/lib/notify";
import { errMsg } from "@/lib/loyalty";

// POST /api/checkin { venueCode } — žig s stojala (QR/NFC na pultu). Največ en na dan.
// Zahteva svež piškotek stojala: gost je moral pravkar odpreti povezavo s stojala.
export async function POST(req: Request) {
  try {
    const guest = await getGuest();
    if (!guest) return NextResponse.json({ ok: false, error: "Prijavi se." }, { status: 401 });
    if (!guest.termsOk) return NextResponse.json(NEEDS_CONSENT, { status: 403 });

    const { venueCode } = await req.json();
    const db = getServiceClient();
    const venue = await venueByCode(db, String(venueCode || ""));
    if (!venue) return NextResponse.json({ ok: false, error: "Lokal ne obstaja." }, { status: 404 });

    const meta = venueMeta(venue);
    if (meta.checkin === "receipt" || !meta.standKey) {
      return NextResponse.json({ ok: false, error: "Ta lokal beleži obiske s skeniranjem računa." });
    }
    const jar = await cookies();
    if (!standCookieValid(jar.get(STAND_COOKIE)?.value, venue.id)) {
      return NextResponse.json({ ok: false, error: "Približaj telefon stojalu ali skeniraj kodo na njem in poskusi znova." });
    }
    if (!(await venueHasAccess(db, venue))) return NextResponse.json({ ok: false, error: "Lokal trenutno ne sprejema žigov." });

    const { member, isNew } = await ensureMembership(db, venue.id, guest);
    if (isNew) after(() => notifyWelcome(venue, guest.email));

    if (meta.dailyLimit && (await stampedToday(db, venue.id, member.id))) return NextResponse.json({ ok: false, today: true, error: ALREADY_TODAY });
    const wait = await cooldownLeft(db, venue, member.id);
    if (wait > 0) return NextResponse.json({ ok: false, error: `Naslednji obisk lahko zabeležiš čez ${wait} min.` });

    let result;
    try {
      // umetni ključ: en žig na gosta na dan (unikatnost zagotovi baza)
      result = await awardStamp(db, venue, member, { zoi: `stand:${member.id}:${localDay()}`, davcna: null, issuedAt: new Date() });
    } catch (e) {
      if (e instanceof DuplicateStamp) return NextResponse.json({ ok: false, today: true, error: ALREADY_TODAY });
      throw e;
    }
    if (result.cardCompleted) after(() => notifyCouponEarned(venue, guest.email, { rewardName: result.rewardName }));

    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errMsg(e) }, { status: 500 });
  }
}
