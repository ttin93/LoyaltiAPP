// Korak 10: zavihek Povpraševanja v superadminu. Testni lastnik dobi skrbniški dostop SAMO lokalno
// (vrstica v .env.local, ki jo skript na koncu odstrani); produkcija ostane nedotaknjena.
import fs from "fs";
import { open, check, note, summary, state, db, env, sleep, BASE } from "./lib.mjs";
const ENV = ".env.local";
const original = fs.readFileSync(ENV, "utf8");
const sink = `delivered+az-leadi-${state.stamp}@resend.dev`;
const status = (o) => o.page.evaluate(() => [...document.querySelectorAll('[role="status"]')].map((e) => e.textContent).join(" "));
let o;
try {
  fs.writeFileSync(ENV, original.replace(/\s*$/, "\n") + `SUPERADMIN_EMAILS=${state.owner}\n`);
  await sleep(6000);
  o = await open("owner", { email: state.owner });
  let res = await o.page.goto(BASE + "/superadmin?t=povprasevanja", { waitUntil: "domcontentloaded", timeout: 120000 });
  if (res.status() !== 200) { await sleep(8000); res = await o.page.goto(BASE + "/superadmin?t=povprasevanja", { waitUntil: "domcontentloaded", timeout: 120000 }); }
  await sleep(3000);
  check("superadmin se odpre na zavihku Povpraševanja", res.status() === 200 && (await o.has("Kam pridejo obvestila")), res.status());
  const body = (await o.page.evaluate(() => document.body.innerText)).replace(/\s+/g, " ");
  check("seznam kaže testna povpraševanja z naslovom in sporočilom", body.includes("Tester A do Ž") && body.includes("Več lokalov") && body.includes("Testno sporočilo s kontaktnega obrazca"), body.slice(body.indexOf("Tester"), body.indexOf("Tester") + 120));
  const def = await o.val("Elektronski naslov za povpraševanja");
  check("privzeto je vpisan en sam naslov", !!def && !def.includes(","), def ? "en naslov" : "prazno");

  await o.fill("Elektronski naslov za povpraševanja", "to ni naslov");
  await o.click("Shrani naslov", { sel: "button" }); await sleep(3000);
  check("neveljaven naslov se ne shrani", (await status(o)).includes("veljaven elektronski naslov"), await status(o));

  await o.fill("Elektronski naslov za povpraševanja", sink);
  await o.click("Shrani naslov", { sel: "button" }); await sleep(4000);
  const { data: row } = await db.from("email_log").select("ref").eq("kind", "platform_setting");
  check("nov naslov se shrani", (await status(o)).includes("Shranjeno") && row?.length === 1 && row[0].ref === `lead_email=${sink}`, `${await status(o)} | ${JSON.stringify(row)}`);

  const t0 = Date.now() - 5000;
  await o.click("Pošlji testno obvestilo", { sel: "button" }); await sleep(7000);
  check("testno obvestilo javi prejemnika", (await status(o)).includes("Testno obvestilo je poslano na") && (await status(o)).includes("az-leadi"), await status(o));
  const r = await fetch("https://api.resend.com/emails?limit=10", { headers: { authorization: `Bearer ${env.RESEND_API_KEY}` } });
  const mails = ((await r.json()).data ?? []).filter((e) => e.subject === "Loyavi: Testno obvestilo" && new Date(String(e.created_at).replace(" ", "T").replace(/\+00(:00)?$/, "Z")).getTime() >= t0);
  check("testno obvestilo je prišlo samo na novi naslov", mails.length === 1 && String(mails[0].to).includes("az-leadi"), mails.map((m) => `${m.last_event} ${String(m.to).replace(/[a-z.0-9]+@gmail\.com/g, "<tin>")}`).join(" | "));

  await o.go("/superadmin?t=povprasevanja", 2500);
  check("po osvežitvi je vpisan shranjeni naslov", (await o.val("Elektronski naslov za povpraševanja")) === sink);
  await o.shot("k01-superadmin-povprasevanja", false);
  // drugi zavihki se še odprejo
  for (const t of ["Pregled", "Naročnine", "Sporočila"]) { await o.click(t, { sel: "button", exact: t !== "Pregled" ? true : true }); await sleep(600); }
  check("ostali zavihki delujejo", !o.errors.some((e) => e.startsWith("PAGEERROR")), o.errors.filter((e) => e.startsWith("PAGEERROR")).join(" ").slice(0, 200));
  // nadzorna plošča lastnika: dnevnik pošte ne kaže vrstice nastavitve
  await o.go(`/dashboard?v=${state.venueId}&s=marketing`, 1500);
  await o.click("Dnevnik", { sel: "button" }); await sleep(600);
  check("dnevnik pošte lokala ne kaže nastavitev platforme", !(await o.has("lead_email")));
} finally {
  await db.from("email_log").delete().eq("kind", "platform_setting"); // nazaj na privzeti naslov
  fs.writeFileSync(ENV, original);
  if (o) await o.close();
  const clean = fs.readFileSync(ENV, "utf8") === original && !fs.readFileSync(ENV, "utf8").includes("SUPERADMIN_EMAILS");
  check(".env.local je vrnjen v prvotno stanje", clean);
  const { count } = await db.from("email_log").select("id", { count: "exact", head: true }).eq("kind", "platform_setting");
  check("testna nastavitev naslova je odstranjena", (count ?? 0) === 0, count);
  summary();
}
