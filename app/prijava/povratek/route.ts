import { NextResponse } from "next/server";
import { createSSRClient } from "@/lib/supabase/ssrServer";

// GET /prijava/povratek?code=...&next=/app — zaključek prijave (Google ali povezava iz e-pošte).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const nextRaw = url.searchParams.get("next") || "/app";
  const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/app";
  if (code) {
    const supabase = await createSSRClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(new URL(`/prijava?napaka=1&next=${encodeURIComponent(next)}`, url.origin));
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
