import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/ssrServer";
import { getServiceClient } from "@/lib/supabase/server";
import { createCustomerPortal } from "@/lib/polar";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Nisi prijavljen." }, { status: 401 });

  let body: { venueId?: string };
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const db = getServiceClient();
  const q = db.from("venues").select("id, owner_user_id, polar_customer_id").eq("owner_user_id", user.id);
  const { data: venues } = await (body.venueId ? q.eq("id", body.venueId) : q).order("created_at", { ascending: true }).limit(1);
  const venue = venues?.[0];
  if (!venue) return NextResponse.json({ error: "Nimaš lokala." }, { status: 404 });

  const customerId = venue.polar_customer_id as string | null;
  if (!customerId) {
    return NextResponse.json({ error: "Za ta lokal še ni naročnine." }, { status: 400 });
  }

  const result = await createCustomerPortal(customerId);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 502 });
  return NextResponse.json({ url: result.url });
}
