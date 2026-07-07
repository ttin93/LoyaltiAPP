import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { errMsg } from "@/lib/loyalty";

// POST /api/guest-birthday  { venueCode, customerId, birthday: "MM-DD" }
// Gost neobvezno doda rojstni dan na svoji kartici (dan + mesec, brez leta).
export async function POST(req: Request) {
  try {
    const { venueCode, customerId, birthday } = await req.json();
    if (!venueCode || !customerId || !birthday) {
      return NextResponse.json({ ok: false, error: "Manjkajo podatki." }, { status: 400 });
    }
    if (!/^\d{2}-\d{2}$/.test(String(birthday))) {
      return NextResponse.json({ ok: false, error: "Neveljaven datum." }, { status: 400 });
    }
    const [mm, dd] = String(birthday).split("-").map(Number);
    if (mm < 1 || mm > 12 || dd < 1 || dd > 31) {
      return NextResponse.json({ ok: false, error: "Neveljaven datum." }, { status: 400 });
    }
    const db = getServiceClient();
    const { data: venue } = await db.from("venues").select("id").eq("public_code", venueCode).single();
    if (!venue) return NextResponse.json({ ok: false, error: "Lokal ne obstaja." }, { status: 404 });
    // write-once: če je rojstni dan že vpisan, ga NE spreminjamo (gost lahko vpiše samo enkrat)
    const { data: c } = await db.from("customers").select("birthday, venue_id").eq("id", customerId).single();
    if (!c || c.venue_id !== venue.id) return NextResponse.json({ ok: false, error: "Neveljavna stranka." }, { status: 404 });
    if (c.birthday) return NextResponse.json({ ok: false, error: "Rojstni dan je že vpisan." }, { status: 409 });
    const { error } = await db.from("customers").update({ birthday }).eq("id", customerId).eq("venue_id", venue.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errMsg(e) }, { status: 500 });
  }
}
