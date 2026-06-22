import { redirect } from "next/navigation";
import { isSupabaseConfigured, getServiceClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/ssrServer";
import SetupNotice from "@/app/components/SetupNotice";
import AuthForm from "./AuthForm";
import Onboarding from "./Onboarding";

export const dynamic = "force-dynamic";

export default async function Partner({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const user = await getCurrentUser();
  if (!user) return <AuthForm />;

  // ?new=1 → dodaj nov lokal (lastnik ima lahko več lokalov)
  const sp = await searchParams;
  if (sp?.new === "1") return <Onboarding />;

  const db = getServiceClient();
  const { data: venues } = await db
    .from("venues")
    .select("id")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1);

  if (venues && venues.length) redirect("/dashboard");
  return <Onboarding />;
}
