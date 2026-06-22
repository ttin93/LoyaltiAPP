import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { errMsg } from "@/lib/loyalty";

// POST /api/register  { venueCode, phone?, email?, password? }
export async function POST(req: Request) {
  try {
    const { venueCode, phone, email, password } = await req.json();
    if (!venueCode || (!phone && !email)) {
      return NextResponse.json(
        { ok: false, error: "Vpiši telefon ali email." },
        { status: 400 },
      );
    }

    const db = getServiceClient();
    const { data: venue } = await db
      .from("venues")
      .select("id")
      .eq("public_code", venueCode)
      .single();
    if (!venue) {
      return NextResponse.json({ ok: false, error: "Lokal ne obstaja." }, { status: 404 });
    }

    const normalizedPhone = phone ? String(phone).replace(/\s+/g, "") : null;
    const normalizedEmail = email ? String(email).trim().toLowerCase() : null;

    // email + geslo → registracija/prijava prek guest_auth (geslo zaščiti račun)
    if (normalizedEmail && password) {
      if (String(password).length < 4) {
        return NextResponse.json({ ok: false, error: "Geslo naj ima vsaj 4 znake." }, { status: 400 });
      }
      const { data: rows, error } = await db.rpc("guest_auth", {
        p_venue_id: venue.id,
        p_email: normalizedEmail,
        p_password: String(password),
      });
      if (error) throw error;
      const r = Array.isArray(rows) ? rows[0] : rows;
      if (!r || !r.ok) {
        return NextResponse.json({ ok: false, error: "Napačno geslo za ta email." }, { status: 401 });
      }
      return NextResponse.json({ ok: true, customerId: r.customer_id, isNew: r.is_new });
    }

    // poišči obstoječo stranko: najprej po telefonu, sicer po emailu (Google)
    let customer = null;
    if (normalizedPhone) {
      const { data } = await db
        .from("customers")
        .select("*")
        .eq("venue_id", venue.id)
        .eq("phone", normalizedPhone)
        .maybeSingle();
      customer = data;
    }
    if (!customer && normalizedEmail) {
      const { data } = await db
        .from("customers")
        .select("*")
        .eq("venue_id", venue.id)
        .eq("email", normalizedEmail)
        .maybeSingle();
      customer = data;
    }
    if (!customer) {
      const { data, error } = await db
        .from("customers")
        .insert({ venue_id: venue.id, phone: normalizedPhone, email: normalizedEmail })
        .select("*")
        .single();
      if (error) throw error;
      customer = data;
    }

    return NextResponse.json({
      ok: true,
      customerId: customer.id,
      points: customer.points,
      isNew: customer.points === 0,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errMsg(e) }, { status: 500 });
  }
}
