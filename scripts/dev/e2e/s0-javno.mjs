// Korak 0: kar vidi neprijavljen obiskovalec (brez gesel) + ustvarjanje testnih računov.
import { open, check, note, summary, state, save, ensureUser, db, sleep } from "./lib.mjs";

const stamp = state.stamp || String(Date.now()).slice(-7);
state.stamp = stamp;
state.owner = state.owner || `delivered+az-lastnik-${stamp}@resend.dev`;
state.guest1 = state.guest1 || `delivered+az-gost1-${stamp}@resend.dev`;
state.guest2 = state.guest2 || `delivered+az-gost2-${stamp}@resend.dev`;
save();

const o = await open("anon", { fresh: true });
try {
  // javne strani
  for (const p of ["/", "/partnerji", "/kontakt", "/pogoji", "/zasebnost", "/piskotki", "/prijava", "/partner"]) {
    const r = await o.page.goto("http://localhost:3000" + p, { waitUntil: "domcontentloaded", timeout: 120000 });
    check(`stran ${p} se odpre`, r.status() === 200, r.status());
  }
  // zaščitene strani preusmerijo
  check("nadzorna plošča brez prijave preusmeri na prijavo", (await o.go("/dashboard")).startsWith("/partner"), o.page.url());
  check("denarnica brez prijave preusmeri na prijavo", (await o.go("/app")).startsWith("/prijava"), o.page.url());
  check("superadmin brez prijave ni dostopen", !(await o.go("/superadmin")).startsWith("/superadmin") || !(await o.has("Lokali")), o.page.url());

  // obrazec za lastnike: preverjanje vnosa (brez gesla)
  await o.go("/partner");
  await o.dump("prijava za lokale");
  await o.shot("a01-partner-prijava");
  await o.click("Nadaljuj", { sel: "button" });
  let err = await o.page.evaluate(() => document.querySelector('[role="alert"]')?.textContent ?? "");
  check("prazen obrazec pokaže napako", err.includes("veljaven elektronski naslov"), err);
  await o.fill("Elektronski naslov", "ni-naslov");
  await o.click("Nadaljuj", { sel: "button" });
  err = await o.page.evaluate(() => document.querySelector('[role="alert"]')?.textContent ?? "");
  check("neveljaven naslov pokaže napako", err.includes("veljaven elektronski naslov"), err);
  await o.fill("Elektronski naslov", state.owner);
  await o.click("Nadaljuj", { sel: "button" });
  err = await o.page.evaluate(() => document.querySelector('[role="alert"]')?.textContent ?? "");
  check("brez gesla pokaže napako o geslu", err.includes("vsaj 6 znakov"), err);

  // pozabljeno geslo: zahtevek za povezavo (račun mora obstajati)
  state.ownerId = await ensureUser(state.owner);
  state.guest1Id = await ensureUser(state.guest1);
  state.guest2Id = await ensureUser(state.guest2);
  save();
  await o.click("Pozabljeno geslo", { sel: "button" });
  await o.fill("Elektronski naslov", state.owner);
  await o.click("Pošlji povezavo", { sel: "button" });
  await sleep(5000);
  const msg = await o.page.evaluate(() => [...document.querySelectorAll('[role="alert"], [role="status"]')].map((e) => e.textContent).join(" | "));
  await o.shot("a02-pozabljeno-geslo");
  check("zahtevek za novo geslo je sprejet", msg.includes("poslali povezavo"), msg);
  note("odgovor na pozabljeno geslo", msg);

  // kontaktni obrazec: samo popis (oddaja sledi posebej)
  await o.go("/kontakt");
  await o.dump("kontakt");
} finally {
  await o.close();
  summary();
}
