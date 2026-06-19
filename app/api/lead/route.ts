import { NextResponse } from "next/server";
import { getServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { errMsg } from "@/lib/loyalty";

// POST /api/lead — zajem povpraševanja iz kontaktnega obrazca
export async function POST(req: Request) {
  try {
    const b = await req.json();
    if (!b.email && !b.phone) {
      return NextResponse.json({ ok: false, error: "Vpiši vsaj email ali telefon." }, { status: 400 });
    }
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ ok: true, demo: true });
    }
    const db = getServiceClient();
    const { error } = await db.from("leads").insert({
      name: b.name ?? null,
      venue: b.venue ?? null,
      email: b.email ?? null,
      phone: b.phone ?? null,
      venue_type: b.venueType ?? null,
      city: b.city ?? null,
      guests_est: b.guestsEst ?? null,
      heard: b.heard ?? null,
      message: b.message ?? null,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errMsg(e) }, { status: 500 });
  }
}
