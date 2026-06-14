import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Supabase klient z anon ključem + sejo iz piškotkov (za auth v server komponentah / akcijah). */
export async function createSSRClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // klicano iz Server Componente — middleware osveži sejo
          }
        },
      },
    },
  );
}

/** Vrne trenutno prijavljenega uporabnika (ali null). */
export async function getCurrentUser() {
  try {
    const supabase = await createSSRClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}
