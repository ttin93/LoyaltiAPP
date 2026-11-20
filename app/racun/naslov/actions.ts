"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { applyEmailChange, maskEmail } from "@/lib/emailChange";
import { notifyEmailChanged } from "@/lib/notify";

/** Potrditev menjave naslova s povezave v sporočilu. */
export async function confirmEmailChange(token: string): Promise<void> {
  const r = await applyEmailChange(getServiceClient(), token);
  if (!r.ok) redirect(`/racun/naslov?e=${r.code}`);
  // stari naslov izve za spremembo, da lastnik računa opazi, če je ni naredil sam
  after(() => notifyEmailChanged(r.oldEmail, maskEmail(r.newEmail)));
  redirect("/racun/naslov?ok=1");
}
