import { getServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";
import SpinFlow from "@/app/components/SpinFlow";

export const dynamic = "force-dynamic";

export default async function SpinPage({
  params,
}: {
  params: Promise<{ public_code: string }>;
}) {
  const { public_code } = await params;
  let name = "Kavarna Moka";
  let brand = "#2B1D17";
  let wheelCfg: import("@/lib/types").WheelConfig | null = null;

  if (isSupabaseConfigured() && public_code !== "demo") {
    try {
      const db = getServiceClient();
      const { data: v } = await db
        .from("venues")
        .select("name, brand_color, wheel_config")
        .eq("public_code", public_code)
        .maybeSingle();
      if (v) {
        name = v.name;
        brand = v.brand_color;
        wheelCfg = (v.wheel_config ?? null) as import("@/lib/types").WheelConfig | null;
      }
    } catch {}
  }

  const initial = name.charAt(0).toUpperCase();
  // kolo rabi živo barvo; če je brand temna (espresso/zelena), vzemi jantar
  const wheelBrand = brand && !["#2B1D17", "#16a34a", "#000000"].includes(brand) ? brand : "#E8A23D";

  return (
    <main
      className="flex min-h-dvh flex-col items-center px-5 pb-10 pt-14"
      style={{ background: "radial-gradient(120% 80% at 50% 0%, #3A2A20 0%, #2B1D17 52%, #1F140E 100%)" }}
    >
      <div className="mb-[18px] flex flex-col items-center gap-3">
        <div
          className="font-display flex h-[60px] w-[60px] items-center justify-center rounded-[18px] bg-[#F5EFE6] text-[28px] font-bold text-[#2B1D17]"
          style={{ boxShadow: "0 8px 20px rgba(0,0,0,0.25)" }}
        >
          {initial}
        </div>
        <div className="text-center">
          <div className="font-display text-[24px] font-extrabold leading-tight text-[#F8F1E7]">Dobrodošel v {name}</div>
          <div className="mt-1 text-[14px] text-[rgba(245,239,230,0.7)]">Tvoj prvi obisk si zasluži nagrado 🎁</div>
        </div>
      </div>

      <SpinFlow
        code={public_code}
        venueName={name}
        venueInitial={initial}
        brandColor={wheelBrand}
        tagline="Zavrti kolo in osvoji nagrado za prvi obisk"
        wheel={wheelCfg}
      />

      <div className="mt-[18px] text-center text-[12px] text-[rgba(245,239,230,0.5)]">
        Brez prenosa aplikacije · velja samo v tem lokalu
      </div>
    </main>
  );
}
