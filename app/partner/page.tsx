import { redirect } from "next/navigation";
import { isSupabaseConfigured, getServiceClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/ssrServer";
import SetupNotice from "@/app/components/SetupNotice";
import AuthForm from "./AuthForm";
import Onboarding from "./Onboarding";

export const dynamic = "force-dynamic";

export default async function Partner() {
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const user = await getCurrentUser();
  if (!user) return <AuthForm />;

  const db = getServiceClient();
  const { data: venue } = await db
    .from("venues")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (venue) redirect("/dashboard");
  return <Onboarding />;
}
