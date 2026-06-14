import EmbedWheel from "./EmbedWheel";
import { getServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { DEMO_VENUE } from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ public_code: string }> }) {
  const { public_code } = await params;
  let name = DEMO_VENUE.name;

  if (isSupabaseConfigured() && public_code !== "demo") {
    try {
      const db = getServiceClient();
      const { data: v } = await db.from("venues").select("name").eq("public_code", public_code).maybeSingle();
      if (v) name = v.name;
    } catch {}
  }

  return <EmbedWheel code={public_code} venueName={name} />;
}
