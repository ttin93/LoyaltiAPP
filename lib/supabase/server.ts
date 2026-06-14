import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Strežniški Supabase klient s service-role ključem.
 * OBVOZI Row-Level Security — uporabljaj SAMO v API rutah / server komponentah,
 * nikoli na klientu.
 */
let cached: SupabaseClient | null = null;

export function getServiceClient(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase ni nastavljen. Dodaj NEXT_PUBLIC_SUPABASE_URL in SUPABASE_SERVICE_ROLE_KEY v .env.local (glej SETUP.md).",
    );
  }
  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
