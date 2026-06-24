import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/ssrServer";
import { getServiceClient } from "@/lib/supabase/server";
import { createCheckout, polarProductId, appOrigin } from "@/lib/polar";
import type { PlanKey, BillingCycle } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Nisi prijavljen." }, { status: 401 });

  let body: { venueId?: string; plan?: string; cycle?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Napačen zahtevek." }, { status: 400 });
  }

  const plan = (["espresso", "doppio"].includes(String(body.plan)) ? body.plan : "") as PlanKey;
  const cycle = (body.cycle === "yearly" ? "yearly" : "monthly") as BillingCycle;
  if (!plan) return NextResponse.json({ error: "Ta paket nima samopostrežnega plačila." }, { status: 400 });

  const db = getServiceClient();
  // lastnikov lokal (po venueId + preveri lastništvo, sicer prvi)
  const q = db.from("venues").select("id, owner_user_id, name, polar_customer_id").eq("owner_user_id", user.id);
  const { data: venues } = await (body.venueId ? q.eq("id", body.venueId) : q).order("created_at", { ascending: true }).limit(1);
  const venue = venues?.[0];
  if (!venue) return NextResponse.json({ error: "Nimaš lokala." }, { status: 404 });

  const productId = polarProductId(plan, cycle);
  if (!productId) {
    return NextResponse.json(
      { error: "Plačila trenutno niso nastavljena. (Manjka Polar produkt za ta paket.)" },
      { status: 503 },
    );
  }

  const result = await createCheckout({
    productId,
    customerEmail: user.email ?? undefined,
    successUrl: `${appOrigin(req)}/dashboard?billing=success`,
    metadata: { venueId: venue.id as string, plan, cycle, ownerId: user.id },
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 502 });
  return NextResponse.json({ url: result.url });
}
