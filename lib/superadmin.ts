/**
 * Super-admin (platform owner) dostop.
 * Privzeto samo Tin; dodatne emaile dodaš prek env SUPERADMIN_EMAILS (z vejico ločeno)
 * BREZ deploya kode — npr. SUPERADMIN_EMAILS="tin@x.com,partner@x.com".
 */
const DEFAULT_SUPERADMINS = ["tin.suklje93@gmail.com", "tin.suklje@gmail.com"];

export function superadminEmails(): string[] {
  const fromEnv = (process.env.SUPERADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const all = [...DEFAULT_SUPERADMINS.map((e) => e.toLowerCase()), ...fromEnv];
  return Array.from(new Set(all));
}

export function isSuperadmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return superadminEmails().includes(email.toLowerCase());
}
