import { NextResponse, after } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { parseFiscalQR, FiscalQRError } from "@/lib/fiscalQr";
import { nextRewardProgress, errMsg } from "@/lib/loyalty";
import { notifyPoints, notifyCouponEarned } from "@/lib/notify";

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
      .select("id, venue_id, email")
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

    // 3b) Razmik med skeniranji (anti-zloraba: ne moreš poskenirati kupa računov naenkrat)
    const cooldown = venue.scan_cooldown_minutes || 0;
    if (cooldown > 0) {
      const { data: last } = await db
        .from("scans")
        .select("created_at")
        .eq("venue_id", venue.id)
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (last) {
        const minsSince = (Date.now() - new Date(last.created_at).getTime()) / 60000;
        if (minsSince < cooldown) {
          const wait = Math.max(1, Math.ceil(cooldown - minsSince));
          return NextResponse.json({ ok: false, error: `Naslednji račun lahko skeniraš čez ${wait} min.` });
        }
      }
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

    // best-effort e-pošta (no-op brez RESEND); ne blokira odgovora.
    // VARČEVANJE + boljša izkušnja: "napredek" mail pošljemo SAMO ob mejnikih
    // (1 žig do polne kartice ALI ravnokar odklenjena točkovna nagrada), NE ob vsakem skenu.
    const cardRewardName = stampReward?.name ?? "Brezplačna kava";
    const next = nextRewardProgress(Number(total), pointRewards);
    const oneStampAway = Number(stamps) === stampGoal - 1;
    const unlockedPointReward = pointRewards.some((r) => {
      const req = Number((r as { points_required?: number }).points_required ?? 0);
      return req > 0 && req > Number(total) - points && req <= Number(total);
    });
    after(async () => {
      if (oneStampAway || unlockedPointReward) {
        await notifyPoints(venue, customer.email, { points, total: Number(total), toReward: next?.remaining ?? 0, stampsFilled: Number(stamps), rewardName: cardRewardName });
      }
      if (cardCompleted) await notifyCouponEarned(venue, customer.email, { rewardName: cardRewardName });
    });

    return NextResponse.json({
      ok: true,
      pointsAwarded: points,
      totalPoints: total,
      stamps,
      stampGoal,
      cardCompleted,
      cardReward: cardCompleted ? stampReward?.name ?? "Brezplačna kava" : null,
      nextReward: next,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errMsg(e) }, { status: 500 });
  }
}
