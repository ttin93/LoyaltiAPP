import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/ssrServer";
import { emailConfigured } from "@/lib/email";
import { siteOrigin } from "@/lib/brand";
import { localDay } from "@/lib/guest";
import { EMAIL_CHANGES_PER_DAY, emailChangeToken, emailTaken, validEmail } from "@/lib/emailChange";
import { notifyEmailChangeRequest } from "@/lib/notify";
import { errMsg } from "@/lib/loyalty";

// POST /api/account/email { email } — zahteva za menjavo naslova računa (gost ali lastnik).
// Na novi naslov pošlje povezavo za potrditev; naslov se spremeni šele po potrditvi.
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.email) return NextResponse.json({ ok: false, error: "Prijavi se." }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const next = String(body?.email ?? "").trim().toLowerCase();
    const old = user.email.toLowerCase();
    if (!validEmail(next)) return NextResponse.json({ ok: false, error: "Vpiši veljaven elektronski naslov." }, { status: 400 });
    if (next === old) return NextResponse.json({ ok: false, error: "To je že tvoj naslov." }, { status: 400 });
    if (!emailConfigured()) return NextResponse.json({ ok: false, error: "Menjava naslova trenutno ni na voljo. Piši nam na info@loyavi.app." }, { status: 503 });

    // največ nekaj zahtev na dan, da obrazca ni mogoče uporabiti za pošiljanje pošte tujim naslovom
    const meta = { ...((user.app_metadata ?? {}) as Record<string, unknown>) };
    const day = localDay();
    const prev = meta.email_change as { day?: string; n?: number } | undefined;
    const n = prev?.day === day ? Number(prev.n) || 0 : 0;
    if (n >= EMAIL_CHANGES_PER_DAY) return NextResponse.json({ ok: false, error: "Danes si zahteval že preveč menjav. Poskusi jutri." }, { status: 429 });

    const db = getServiceClient();
    if (await emailTaken(db, next)) return NextResponse.json({ ok: false, error: "Ta naslov že uporablja drug račun." }, { status: 409 });

    // v razvoju povezava kaže na razvojni strežnik, v produkciji na kanonični naslov
    const origin = process.env.NODE_ENV === "production" ? siteOrigin() : new URL(req.url).origin;
    const url = `${origin}/racun/naslov?t=${encodeURIComponent(emailChangeToken(user.id, old, next))}`;
    if (!(await notifyEmailChangeRequest(next, old, url))) {
      return NextResponse.json({ ok: false, error: "Sporočila ni bilo mogoče poslati. Preveri naslov in poskusi znova." }, { status: 502 });
    }
    await db.auth.admin.updateUserById(user.id, { app_metadata: { ...meta, email_change: { day, n: n + 1 } } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errMsg(e) }, { status: 500 });
  }
}
