import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { venueByCode } from "@/lib/venues";
import { venueMeta } from "@/lib/venueMeta";
import { standCookie } from "@/lib/stamp";

// GET /s/<koda>?k=<ključ> — vstop s stojala (QR ali NFC nalepka na pultu).
// Če se ključ ujema, nastavi kratkotrajen piškotek (dokaz, da je gost pri stojalu)
// in preusmeri na kartico lokala, kjer se obisk zabeleži.
export async function GET(req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const url = new URL(req.url);
  const db = getServiceClient();
  const venue = await venueByCode(db, code);
  if (!venue) return NextResponse.redirect(new URL("/", url.origin));

  const meta = venueMeta(venue);
  const key = url.searchParams.get("k") || "";
  const ok = !!meta.standKey && key === meta.standKey && meta.checkin !== "receipt";

  const res = NextResponse.redirect(new URL(`/p/${venue.public_code}?join=1${ok ? "&stand=1" : ""}`, url.origin));
  if (ok) {
    const c = standCookie(venue.id);
    res.cookies.set(c.name, c.value, { httpOnly: true, sameSite: "lax", secure: url.protocol === "https:", maxAge: c.maxAge, path: "/" });
  }
  return res;
}
