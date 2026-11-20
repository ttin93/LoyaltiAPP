import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/ssrServer";
import { consentOf, saveConsent } from "@/lib/consent";
import { errMsg } from "@/lib/loyalty";

// POST /api/consent
//   { accept: true, marketing }  → gost sprejme pogoje in izbere, ali želi ponudbe lokalov
//   { marketing }                → kasnejša sprememba izbire o ponudbah (profil)
//   { decline: true }            → gost pogojev ne sprejme; nov račun brez kartic se izbriše
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.email) return NextResponse.json({ ok: false, error: "Prijavi se." }, { status: 401 });
    const body = (await req.json().catch(() => ({}))) as { accept?: unknown; marketing?: unknown; decline?: unknown };
    const db = getServiceClient();
    const state = consentOf(user);

    if (body.decline === true) {
      if (state.termsOk) return NextResponse.json({ ok: false, error: "Pogoji so že potrjeni." }, { status: 400 });
      // Račun izbrišemo samo, če je prazen: brez kartic pri lokalih in brez lastnega lokala.
      const email = user.email.toLowerCase();
      const [cards, venues] = await Promise.all([
        db.from("customers").select("id", { count: "exact", head: true }).eq("email", email),
        db.from("venues").select("id", { count: "exact", head: true }).eq("owner_user_id", user.id),
      ]);
      const empty = !cards.error && !venues.error && (cards.count ?? 0) === 0 && (venues.count ?? 0) === 0;
      if (empty) await db.auth.admin.deleteUser(user.id);
      return NextResponse.json({ ok: true, deleted: empty });
    }

    if (!state.termsOk && body.accept !== true) {
      return NextResponse.json({ ok: false, error: "Za nadaljevanje potrdi pogoje uporabe." }, { status: 400 });
    }
    await saveConsent(db, user, { acceptTerms: body.accept === true, marketing: body.marketing === true });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errMsg(e) }, { status: 500 });
  }
}
