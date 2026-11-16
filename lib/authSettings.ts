// Javne nastavitve prijave v Supabase (ali je Google vklopljen). Predpomnjeno 5 minut.
export async function googleEnabled(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return false;
  try {
    const r = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: anon }, next: { revalidate: 300 } });
    if (!r.ok) return false;
    const j = (await r.json()) as { external?: { google?: boolean } };
    return j.external?.google === true;
  } catch {
    return false;
  }
}

/** Dovoli samo notranje poti (prepreči preusmeritev na tuje strani). */
export function safeNext(raw: string | string[] | undefined, fallback = "/app"): string {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v && v.startsWith("/") && !v.startsWith("//") ? v : fallback;
}
