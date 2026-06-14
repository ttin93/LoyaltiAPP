import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { errMsg } from "@/lib/loyalty";

// GET /api/activation?venueCode=...&customerId=...
// Vrne trenutno AKTIVNO unovčenje (da časovnik preživi zaprtje appa). null če ga ni.
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const venueCode = url.searchParams.get("venueCode");
    const customerId = url.searchParams.get("customerId");
    if (!venueCode || !customerId) {
      return NextResponse.json({ ok: false, error: "Manjkajo podatki." }, { status: 400 });
    }
    const db = getServiceClient();
    const { data: venue } = await db
      .from("venues")
      .select("id")
      .eq("public_code", venueCode)
      .single();
    if (!venue) return NextResponse.json({ ok: false, error: "Lokal ne obstaja." }, { status: 404 });

    const { data: red } = await db
      .from("redemptions")
      .select("id, expires_at, status, rewards(name)")
      .eq("venue_id", venue.id)
      .eq("customer_id", customerId)
      .eq("status", "active")
      .order("activated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!red) return NextResponse.json({ ok: true, activation: null });

    if (new Date(red.expires_at).getTime() < Date.now()) {
      await db.from("redemptions").update({ status: "expired" }).eq("id", red.id);
      return NextResponse.json({ ok: true, activation: null });
    }

    const rf = red.rewards as unknown;
    const reward = (Array.isArray(rf) ? rf[0] : rf) as { name?: string } | null;
    return NextResponse.json({
      ok: true,
      activation: {
        redemption_id: red.id,
        reward_name: reward?.name ?? "Nagrada",
        expires_at: red.expires_at,
        status: "active",
      },
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errMsg(e) }, { status: 500 });
  }
}
