import { NextResponse, after } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/ssrServer";
import { errMsg } from "@/lib/loyalty";
import { notifyWelcome } from "@/lib/notify";

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
      .select("*")
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
      if (r.is_new) after(() => notifyWelcome(venue, normalizedEmail));
      return NextResponse.json({ ok: true, customerId: r.customer_id, isNew: r.is_new });
    }

    // VARNOST: email BREZ gesla ni dovoljen — sicer bi kdorkoli z znanim emailom dobil
    // tuj račun (customerId = token) + sprožil welcome-spam. Email gre VEDNO prek guest_auth
    // (geslo) zgoraj; passwordless spodaj velja samo za telefon.
    if (normalizedEmail && !password) {
      return NextResponse.json({ ok: false, error: "Za prijavo z emailom vpiši geslo." }, { status: 400 });
    }

    // poišči obstoječo stranko po telefonu (telefonski model, brez gesla)
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
    // VARNOST: zaščitenega računa (email + geslo) NI dovoljeno prevzeti brez gesla.
    // Izjema: preverjena Supabase seja (Google OAuth) z istim emailom.
    if (customer?.pass_hash) {
      const authed = await getCurrentUser().catch(() => null);
      const verified = !!authed?.email && !!normalizedEmail && authed.email.toLowerCase() === normalizedEmail;
      if (!verified) {
        return NextResponse.json(
          { ok: false, error: "Ta email je zaščiten z geslom — vpiši geslo za prijavo.", needPassword: true },
          { status: 401 },
        );
      }
    }

    let created = false;
    if (!customer) {
      const { data, error } = await db
        .from("customers")
        .insert({ venue_id: venue.id, phone: normalizedPhone, email: normalizedEmail })
        .select("*")
        .single();
      if (error) throw error;
      customer = data;
      created = true;
    }
    if (created) after(() => notifyWelcome(venue, normalizedEmail));

    // isNew = stranka je bila ravnokar USTVARJENA. (Prej: points === 0, kar je bilo napačno —
    // obstoječa stranka brez točk se je štela za novo in je spet dobila welcome nagrado.)
    return NextResponse.json({
      ok: true,
      customerId: customer.id,
      isNew: created,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errMsg(e) }, { status: 500 });
  }
}
