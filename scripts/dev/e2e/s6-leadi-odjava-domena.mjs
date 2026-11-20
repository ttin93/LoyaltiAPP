// Korak 6: kontaktni obrazec (lead), podarjen kupon pri gostu 2, odjava gosta 3, domena v produkciji, pošta v Resend.
import crypto from "crypto";
import { open, check, note, summary, state, save, db, env, sleep } from "./lib.mjs";

// podarjen kupon (ponovna preverba z obstoječimi stolpci)
const { data: gc } = await db.from("redemptions").select("status, rewards(name)").eq("customer_id", state.c2);
check("podarjen kupon je v bazi pri gostu 2", (gc ?? []).some((x) => x.rewards?.name === "Kava za potrpežljivost" && x.status === "ready"), JSON.stringify(gc?.map((x) => [x.rewards?.name, x.status])));

const g2 = await open("guest2", { mobile: true });
try {
  await g2.go(`/p/${state.code}`, 2500);
  check("gost 2 vidi podarjen kupon na strani lokala", await g2.has("Kava za potrpežljivost"));
  await g2.go("/app", 2000);
  await g2.shot("g01-gost2-denarnica", true);
} finally { await g2.close(); }

// kontaktni obrazec (neprijavljen obiskovalec)
const a = await open("anon2", { fresh: true });
try {
  await a.go("/kontakt");
  await a.click("Pošlji sporočilo", { sel: "button" });
  await sleep(800);
  const emptyErr = await a.page.evaluate(() => [...document.querySelectorAll('[role="alert"]')].map((e) => e.textContent).join(" | ") || [...document.querySelectorAll("input, textarea")].filter((i) => !i.checkValidity()).length);
  note("prazen kontaktni obrazec", String(emptyErr));
  await a.fill("Ime", "Tester A do Ž");
  await a.fill("Lokal (neobvezno)", "Bistro Pod Lipo AZ");
  await a.fill("Elektronski naslov", state.owner);
  await a.fill("Telefon (neobvezno)", "041 555 019");
  await a.fill("Sporočilo", "Testno sporočilo s kontaktnega obrazca (preizkus od A do Ž). Prosim prezri.");
  await a.click("Pošlji sporočilo", { sel: "button" });
  await sleep(5000);
  await a.shot("g02-kontakt-poslano");
  note("kontakt po oddaji", (await a.text()).replace(/\s+/g, " ").slice(0, 200));
  const { data: lead } = await db.from("leads").select("id, name, heard").eq("email", state.owner).order("created_at", { ascending: true });
  check("kontaktni obrazec zapiše lead", (lead ?? []).some((l) => l.name === "Tester A do Ž"), JSON.stringify(lead));
  state.leadIds = (lead ?? []).map((l) => l.id); save();
} finally { await a.close(); }

// odjava gosta 3 prek podpisane povezave iz sporočila
const p = await open("guest3", { mobile: true });
try {
  const secret = crypto.createHmac("sha256", env.SUPABASE_SERVICE_ROLE_KEY).update("loyavi-unsub-v1").digest("hex");
  const tok = crypto.createHmac("sha256", secret).update(state.c3).digest("hex").slice(0, 32);
  await p.go(`/odjava?c=${state.c3}&t=${tok}`, 1500);
  await p.click("Odjavi me", { sel: "button" });
  await sleep(3000);
  await p.shot("g03-odjava-potrjena");
  check("odjava potrdi stanje", await p.has("Ponudb ne prejemaš"), (await p.text()).replace(/\s+/g, " ").slice(0, 160));
  const { data: rows } = await db.from("email_log").select("kind").eq("customer_id", state.c3).in("kind", ["marketing_optin", "unsubscribe"]);
  check("odjava je zapisana", (rows ?? []).some((r) => r.kind === "unsubscribe"), JSON.stringify(rows));
  await p.go("/app/profil", 2000);
  const sw = await p.page.evaluate(() => document.querySelector("[role=switch]")?.getAttribute("aria-checked"));
  note("stikalo v profilu po odjavi enega lokala", sw);
} finally { await p.close(); }

// domena (produkcija, samo branje)
const head = async (u) => { const r = await fetch(u, { redirect: "manual" }); return `${r.status} ${r.headers.get("location") ?? ""}`; };
const h1 = await head("https://loyavi.app/s/demo?k=x");
check("loyavi.app preusmeri na www in ohrani pot in parametre", /^30[178] https:\/\/www\.loyavi\.app\/s\/demo\?k=x$/.test(h1), h1);
const h2 = await head("http://www.loyavi.app/partnerji");
check("http preusmeri na https", /^30[178] https:\/\/www\.loyavi\.app\/partnerji/.test(h2), h2);
const h3 = await fetch("https://www.loyavi.app/"); check("www.loyavi.app odgovori 200", h3.ok, h3.status);
const h4 = await head("https://www.loyavi.app/p/demo"); check("javna stran demo lokala v produkciji", h4.startsWith("200"), h4);
note("povezave v nadzorni plošči kažejo na", "https://loyavi.app (brez www): vsak dotik NFC naredi eno preusmeritev več");

// pošta: kaj je Resend prejel
try {
  const r = await fetch("https://api.resend.com/emails?limit=30", { headers: { authorization: `Bearer ${env.RESEND_API_KEY}` } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) note("Resend seznam ni na voljo", `${r.status} ${JSON.stringify(j).slice(0, 200)}`);
  else {
    const mine = (j.data ?? []).filter((e) => (e.to ?? []).some((t) => String(t).includes(state.stamp)) || String(e.subject).includes("Loyavi:"));
    for (const e of mine) note("pošta", `${e.created_at?.slice(11, 19)} ${e.last_event ?? ""} → ${String(e.to).replace(/delivered\+|@resend\.dev/g, "")} | ${e.subject}`);
    check("Resend je sprejel sporočila testa", mine.length > 0, mine.length);
  }
} catch (e) { note("Resend napaka", String(e)); }
summary();
