import { getServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";
import SpinFlow from "@/app/components/SpinFlow";
import EmbedFrame from "./EmbedFrame";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ public_code: string }> }) {
  const { public_code } = await params;
  let name = "Kavarna Moka";
  let brand = "#2B1D17";

  if (isSupabaseConfigured() && public_code !== "demo") {
    try {
      const db = getServiceClient();
      const { data: v } = await db
        .from("venues")
        .select("name, brand_color")
        .eq("public_code", public_code)
        .maybeSingle();
      if (v) {
        name = v.name;
        brand = v.brand_color;
      }
    } catch {}
  }

  const initial = name.charAt(0).toUpperCase();
  const wheelBrand = brand && !["#2B1D17", "#16a34a", "#000000"].includes(brand) ? brand : "#E8A23D";

  return (
    <EmbedFrame>
      <SpinFlow
        code={public_code}
        venueName={name}
        venueInitial={initial}
        brandColor={wheelBrand}
        tagline="Pozdrav! Zavrti kolo za nagrado dobrodošlice"
      />
    </EmbedFrame>
  );
}
