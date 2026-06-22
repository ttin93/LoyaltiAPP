import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { parseFiscalQR, FiscalQRError } from "@/lib/fiscalQr";
import { nextRewardProgress, errMsg } from "@/lib/loyalty";

// POST /api/scan  { venueCode, payload, customerId }
export async function POST(req: Request) {
  try {
    const { venueCode, payload, customerId } = await req.json();
    if (!venueCode || !payload || !customerId) {
      return NextResponse.json({ ok: false, error: "Manjkajo podatki." }, { status: 400 });
    }

    // 1) Parsiraj fiskalni QR
    let parsed;
    try {
      parsed = parseFiscalQR(payload);
    } catch (e) {
      const msg = e instanceof FiscalQRError ? e.message : "Neveljaven QR.";
      return NextResponse.json({ ok: false, error: msg });
    }

    const db = getServiceClient();

    const { data: venue } = await db
      .from("venues")
      .select("*")
      .eq("public_code", venueCode)
      .single();
    if (!venue) {
      return NextResponse.json({ ok: false, error: "Lokal ne obstaja." }, { status: 404 });
    }
    if (!venue.davcna_stevilka) {
      return NextResponse.json({
        ok: false,
        error: "Lokal še ni aktiviral skeniranja računov.",
      });
    }

    // stranka mora pripadati temu lokalu
    const { data: customer } = await db
      .from("customers")
      .select("id, venue_id")
      .eq("id", customerId)
      .single();
    if (!customer || customer.venue_id !== venue.id) {
      return NextResponse.json({ ok: false, error: "Neveljavna stranka." });
    }

    // 2) Izdajatelj
    if (parsed.davcna !== venue.davcna_stevilka) {
      return NextResponse.json({ ok: false, error: "Ta račun ni iz tega lokala." });
    }

    // 3) Časovno okno
    const ageHours = (Date.now() - parsed.issuedAt.getTime()) / 36e5;
    if (ageHours > venue.scan_window_hours) {
      return NextResponse.json({ ok: false, error: "Račun je prestar." });
    }
    if (ageHours < -1) {
      return NextResponse.json({ ok: false, error: "Neveljaven datum računa." });
    }

    // 4) Točke na obisk + žig (žigi ločeno od točk)
    const points = venue.points_per_visit;
    const stampGoal = venue.stamp_goal || 10;

    const { data: rewards } = await db.from("rewards").select("*").eq("venue_id", venue.id);
    const stampReward = (rewards ?? []).find((r) => r.kind === "stamp") || null;
    const pointRewards = (rewards ?? []).filter((r) => r.kind !== "stamp");

    // 5) Dodeli točke + žig (+ dedup po unique zoi); žige resetira pri stamp_goal → kava kupon
    const { data, error } = await db.rpc("award_scan", {
      p_venue_id: venue.id,
      p_customer_id: customerId,
      p_zoi: parsed.zoiHex,
      p_davcna: parsed.davcna,
      p_issued_at: parsed.issuedAt.toISOString(),
      p_amount: null,
      p_points: points,
      p_stamp_goal: stampGoal,
    });
    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ ok: false, error: "Ta račun je bil že unovčen." });
      }
      throw error;
    }
    const row = (Array.isArray(data) ? data[0] : data) as { total: number; stamps: number; card_completed: boolean } | null;
    const total = row?.total ?? 0;
    const stamps = row?.stamps ?? 0;
    const cardCompleted = !!row?.card_completed;

    return NextResponse.json({
      ok: true,
      pointsAwarded: points,
      totalPoints: total,
      stamps,
      stampGoal,
      cardCompleted,
      cardReward: cardCompleted ? stampReward?.name ?? "Brezplačna kava" : null,
      nextReward: nextRewardProgress(Number(total), pointRewards),
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errMsg(e) }, { status: 500 });
  }
}
