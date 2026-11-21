// Pregled baze (samo branje): lokali z lastniki, računi in povpraševanja. Za odločitev, kaj je testno.
// node scripts/dev/e2e/pregled-baze.mjs
import fs from "fs";
import { createRequire } from "module";
const require = createRequire(process.cwd() + "/");
const { createClient } = require("@supabase/supabase-js");
const env = Object.fromEntries(fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; }));
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
// zasebnih naslovov ne izpisujemo v celoti
const mask = (e) => (!e ? "(brez)" : /@resend\.dev$/.test(e) ? e : e.replace(/^(.{2}).*(@.*)$/, "$1***$2"));

const users = [];
for (let p = 1; p < 30; p++) { const { data } = await db.auth.admin.listUsers({ page: p, perPage: 200 }); if (!data?.users?.length) break; users.push(...data.users); }
const emailOf = new Map(users.map((u) => [u.id, u.email]));
const { data: venues } = await db.from("venues").select("id, name, public_code, owner_user_id, created_at, automations").order("created_at");
// kartice beremo po straneh (PostgREST vrne največ 1000 vrstic), žige samo preštejemo
const custs = [];
for (let from = 0; from < 50000; from += 1000) { const { data } = await db.from("customers").select("id, venue_id, email").range(from, from + 999); custs.push(...(data ?? [])); if ((data ?? []).length < 1000) break; }
const cnt = (rows, id) => rows.filter((r) => r.venue_id === id).length;
const scanCount = async (id) => (await db.from("scans").select("id", { count: "exact", head: true }).eq("venue_id", id)).count ?? 0;

console.log("LOKALI");
for (const v of venues) {
  console.log(` ${v.created_at.slice(0, 10)}  ${v.name.padEnd(24)} ${v.public_code.padEnd(34)} lastnik: ${mask(emailOf.get(v.owner_user_id)).padEnd(46)} gostov ${String(cnt(custs, v.id)).padStart(3)}  žigov ${String(await scanCount(v.id)).padStart(4)}  imenik: ${v.automations?.__v2?.listed === true ? "da" : "ne"}  id ${v.id.slice(0, 8)}`);
}
console.log("\nRAČUNI");
const owners = new Set(venues.map((v) => v.owner_user_id));
for (const u of users.sort((a, b) => a.created_at.localeCompare(b.created_at))) {
  const cards = custs.filter((c) => c.email === u.email);
  const where = [...new Set(cards.map((c) => venues.find((v) => v.id === c.venue_id)?.public_code))].join(", ");
  console.log(` ${u.created_at.slice(0, 10)}  ${mask(u.email).padEnd(48)} ${owners.has(u.id) ? "LASTNIK" : "       "} kartic ${cards.length}${where ? "  (" + where + ")" : ""}  zadnja prijava ${u.last_sign_in_at?.slice(0, 10) ?? "nikoli"}`);
}
const orphans = [...new Set(custs.filter((c) => c.email && !users.some((u) => u.email === c.email)).map((c) => c.email))];
console.log("\nKARTICE BREZ RAČUNA:", orphans.length, orphans.slice(0, 12).map(mask).join(", "));
const { data: leads } = await db.from("leads").select("id, name, venue, email, heard, created_at").order("created_at");
console.log("\nPOVPRAŠEVANJA");
for (const l of leads) console.log(` ${l.created_at.slice(0, 10)}  ${(l.venue || l.name || "").padEnd(24)} ${mask(l.email).padEnd(46)} ${l.heard ?? "kontakt"}  id ${l.id.slice(0, 8)}`);
