// Slovenske množinske oblike (1, 2, 3–4, 5+) in oblikovanje datumov.

type Forms = [one: string, two: string, few: string, many: string];

export function plural(n: number, f: Forms): string {
  const m = Math.abs(n) % 100;
  if (m === 1) return f[0];
  if (m === 2) return f[1];
  if (m === 3 || m === 4) return f[2];
  return f[3];
}

const W = {
  obisk: ["obisk", "obiska", "obiski", "obiskov"],
  zig: ["žig", "žiga", "žigi", "žigov"],
  gost: ["gost", "gosta", "gostje", "gostov"],
  kartica: ["kartica", "kartici", "kartice", "kartic"],
  nagrada: ["nagrada", "nagradi", "nagrade", "nagrad"],
  kupon: ["kupon", "kupona", "kuponi", "kuponov"],
  dan: ["dan", "dneva", "dni", "dni"],
  minuta: ["minuta", "minuti", "minute", "minut"],
  lokal: ["lokal", "lokala", "lokali", "lokalov"],
  ocena: ["ocena", "oceni", "ocene", "ocen"],
} satisfies Record<string, Forms>;

export type Word = keyof typeof W;

/** "3 obiski", "1 žig", "5 gostov" */
export function count(n: number, word: Word): string {
  return `${n} ${plural(n, W[word] as Forms)}`;
}

/** Samo beseda v pravi obliki (brez števila). */
export function form(n: number, word: Word): string {
  return plural(n, W[word] as Forms);
}

/** "Še 3 obiski do nagrade" / "Še 1 obisk do nagrade" */
export function visitsLeft(left: number): string {
  if (left <= 0) return "Kartica je polna";
  return `Še ${count(left, "obisk")} do nagrade`;
}

const MONTHS_GEN = ["januarja", "februarja", "marca", "aprila", "maja", "junija", "julija", "avgusta", "septembra", "oktobra", "novembra", "decembra"];
export const MONTHS = ["januar", "februar", "marec", "april", "maj", "junij", "julij", "avgust", "september", "oktober", "november", "december"];

/** "MM-DD" → "24. septembra" */
export function birthdayLabel(mmdd: string): string {
  const [mm, dd] = mmdd.split("-").map(Number);
  return `${dd}. ${MONTHS_GEN[mm - 1] ?? ""}`;
}

export function dateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("sl-SI", { day: "numeric", month: "numeric", year: "numeric", timeZone: "Europe/Ljubljana" });
}

export function dateTimeShort(iso: string): string {
  return new Date(iso).toLocaleString("sl-SI", { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Ljubljana" });
}

/** Koliko dni nazaj (0 = danes). */
export function daysAgo(iso: string, now = Date.now()): number {
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 864e5));
}

export function agoLabel(iso: string, now = Date.now()): string {
  const d = daysAgo(iso, now);
  if (d === 0) return "danes";
  if (d === 1) return "včeraj";
  return `pred ${d} dnevi`;
}
