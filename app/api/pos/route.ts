import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/ssrServer";
import { encryptSecret } from "@/lib/pos/crypto";
import { getPosAdapter } from "@/lib/pos";
import type { PosProvider } from "@/lib/pos/types";
import { errMsg } from "@/lib/loyalty";

// Owner-auth: prijavljen uporabnik mora BITI lastnik lokala. Vrne venue ali NextResponse (napaka).
async function authVenue(venueCode: string) {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ ok: false, error: "Prijava potrebna." }, { status: 401 }) };
  const db = getServiceClient();
  const { data: venue } = await db
    .from("venues")
    .select("id, owner_user_id")
    .eq("public_code", venueCode)
    .single();
  if (!venue) return { error: NextResponse.json({ ok: false, error: "Lokal ne obstaja." }, { status: 404 }) };
  if (venue.owner_user_id !== user.id) {
    return { error: NextResponse.json({ ok: false, error: "Ni dovoljenja." }, { status: 403 }) };
  }
  return { venue, db };
}

// POST /api/pos  { venueCode, provider?, bu_uid, client_id, client_secret } -> poveži blagajno
export async function POST(req: Request) {
  try {
    const { venueCode, provider = "eblagajna", bu_uid, client_id, client_secret } = await req.json();
    if (!venueCode || !bu_uid || !client_id || !client_secret) {
      return NextResponse.json({ ok: false, error: "Manjkajo polja (bu_uid, client_id, client_secret)." }, { status: 400 });
    }
    const a = await authVenue(venueCode);
    if (a.error) return a.error;

    // 1) Preveri poverilnice pri viru (da ne shranimo neveljavnih).
    const adapter = getPosAdapter(provider as PosProvider);
    const test = await adapter.testConnection({ bu_uid, client_id, client_secret });
    if (!test.ok) {
      return NextResponse.json({ ok: false, error: `Poverilnice ne delujejo: ${test.error}` });
    }

    // 2) Šifriraj secret in shrani (upsert per venue).
    const { error } = await a.db.from("pos_connections").upsert(
      {
        venue_id: a.venue.id,
        provider,
        bu_uid,
        client_id,
        secret_enc: encryptSecret(client_secret),
        status: "connected",
        last_check_at: new Date().toISOString(),
        last_error: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "venue_id" },
    );
    if (error) throw error;

    return NextResponse.json({ ok: true, status: "connected", provider });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errMsg(e) }, { status: 500 });
  }
}

// GET /api/pos?venueCode=... -> stanje povezave (NIKOLI ne vrne secreta)
export async function GET(req: Request) {
  try {
    const venueCode = new URL(req.url).searchParams.get("venueCode") ?? "";
    const a = await authVenue(venueCode);
    if (a.error) return a.error;
    const { data } = await a.db
      .from("pos_connections")
      .select("provider, bu_uid, status, last_check_at, last_error")
      .eq("venue_id", a.venue.id)
      .maybeSingle();
    if (!data) return NextResponse.json({ ok: true, connected: false });
    const masked = data.bu_uid.length > 4 ? "••••" + data.bu_uid.slice(-4) : "••••";
    return NextResponse.json({
      ok: true,
      connected: data.status === "connected",
      provider: data.provider,
      bu_uid: masked,
      status: data.status,
      last_check_at: data.last_check_at,
      last_error: data.last_error,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errMsg(e) }, { status: 500 });
  }
}

// DELETE /api/pos  { venueCode } -> prekliči povezavo (lokal lahko kadarkoli)
export async function DELETE(req: Request) {
  try {
    const { venueCode } = await req.json();
    const a = await authVenue(venueCode);
    if (a.error) return a.error;
    const { error } = await a.db.from("pos_connections").delete().eq("venue_id", a.venue.id);
    if (error) throw error;
    return NextResponse.json({ ok: true, connected: false });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errMsg(e) }, { status: 500 });
  }
}
