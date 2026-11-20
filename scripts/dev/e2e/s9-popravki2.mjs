// Korak 9: preverba drugega sklopa popravkov (žig na dan, vsebina datotek, leadi, menjava naslova, dnevna sporočila).
import crypto from "crypto"; import fs from "fs"; import path from "path";
import { open, check, note, summary, state, save, db, env, sleep, receipt, venueRow, metaOf, DIR, BASE, ensureUser } from "./lib.mjs";
const V = state.venueId, code = state.code, dav = state.dav;
const only = process.argv[2] || "all";
const run = (k) => only === "all" || only.split(",").includes(k);
const F = path.join(DIR, "files");

// ═══ A) EN ŽIG NA DAN ═══════════════════════════════════════════════════════
if (run("zig")) {
  state.guest5 = state.guest5 || `delivered+az-gost5-${state.stamp}@resend.dev`; save();
  await ensureUser(state.guest5);
  const v0 = await venueRow();
  check("privzeto je dnevna omejitev vklopljena (lokal brez nastavitve)", metaOf(v0).dailyLimit !== false, JSON.stringify(metaOf(v0).dailyLimit));
  const g = await open("guest5", { mobile: true, email: state.guest5, fresh: true });
  try {
    await g.go(`/p/${code}`, 2500);
    if (g.page.url().includes("/prijava/soglasje")) {
      await g.page.evaluate(() => document.querySelectorAll("label")[0].click());
      await g.click("Potrdi in nadaljuj", { sel: "button" });
      await g.page.waitForFunction((c) => location.pathname === `/p/${c}`, { timeout: 90000 }, code).catch(() => {});
      await sleep(3000);
    }
    await g.post("/api/join", { venueCode: code });
    const a = await g.post("/api/scan", { venueCode: code, payload: receipt(dav, 2) });
    const b = await g.post("/api/scan", { venueCode: code, payload: receipt(dav, 1) });
    check("drugi račun isti dan ne prinese žiga", a.ok === true && b.ok === false && b.today === true, `${a.ok} / ${b.error}`);
    await g.go(`/s/${code}?k=${metaOf(v0).standKey}`, 4500);
    const c1 = (await db.from("customers").select("stamps").eq("venue_id", V).eq("email", state.guest5).single()).data;
    check("stojalo po računu isti dan ne da drugega žiga", c1.stamps === 1, `žigov ${c1.stamps}`);
    const txt = (await g.text()).replace(/\s+/g, " ");
    check("gost vidi mirno obvestilo namesto gumba", txt.includes("Današnji obisk je zabeležen") && !txt.includes("Skeniraj račun"), txt.slice(140, 330));
    const errShown = await g.page.evaluate(() => !!document.querySelector('[role="alert"]'));
    check("ob stojalu se ne pokaže napaka", !errShown);
    await g.shot("j01-zig-danes", true);

    // lastnik izklopi omejitev v nastavitvah
    const o = await open("owner", { email: state.owner });
    try {
      await o.go(`/dashboard?v=${V}&s=nastavitve`, 1500);
      check("ob vklopljeni omejitvi polja Premor ni", (await o.val("Premor med žigi (minute)")) === null);
      await o.click("Največ en žig na dan", { sel: "[role=switch]" });
      check("ob izklopu se pokaže polje Premor", (await o.val("Premor med žigi (minute)")) !== null);
      await o.page.evaluate(() => document.querySelector('[role=switch][aria-label="Največ en žig na dan"]').scrollIntoView({ block: "center" }));
      await o.shot("j02-pravila");
      await o.click("Shrani pravila", { sel: "button" });
      const t = await o.toast();
      check("izklop omejitve se shrani", t.includes("shranjena") && metaOf(await venueRow()).dailyLimit === false, t);
      const c = await g.post("/api/scan", { venueCode: code, payload: receipt(dav, 3) });
      check("brez omejitve drugi račun isti dan prinese žig", c.ok === true, JSON.stringify(c).slice(0, 120));
      await o.toastGone();
      await o.click("Največ en žig na dan", { sel: "[role=switch]" });
      await o.click("Shrani pravila", { sel: "button" });
      await o.toast();
      check("omejitev je spet vklopljena", metaOf(await venueRow()).dailyLimit === true);
      await o.go(`/dashboard?v=${V}&s=obiski`, 1200);
      check("razdelek Obiski omeni en žig na dan", await o.has("Gost dobi največ en žig na dan."));
    } finally { await o.close(); }
  } finally { await g.close(); }
}

// ═══ G) VSEBINA DATOTEK ═════════════════════════════════════════════════════
if (run("datoteke")) {
  const o = await open("owner", { email: state.owner });
  try {
    await o.go(`/dashboard?v=${V}&s=nastavitve`, 1500);
    const before = metaOf(await venueRow()).coverUrl;
    const fakePng = path.join(F, "ponaredek.png"); fs.writeFileSync(fakePng, Buffer.alloc(300 * 1024, 7));
    await (await o.page.$('input[type=file][aria-label="Naloži naslovno fotografijo"]')).uploadFile(fakePng);
    let t = await o.toast(20000);
    check("datoteka .png brez slike je zavrnjena", t.includes("Dovoljene so slike") && metaOf(await venueRow()).coverUrl === before, t);
    await o.toastGone();
    const fakePdf = path.join(F, "ponaredek.pdf"); fs.writeFileSync(fakePdf, "to ni pdf");
    await (await o.page.$('input[type=file][aria-label="Naloži meni"]')).uploadFile(fakePdf);
    t = await o.toast(20000);
    check("datoteka .pdf brez vsebine PDF je zavrnjena", t.includes("Dovoljene so"), t);
    await o.toastGone();
    await (await o.page.$('input[type=file][aria-label="Naloži naslovno fotografijo"]')).uploadFile(path.join(process.cwd(), "public", "vzorec", "lipa-cover.jpg"));
    t = await o.toast(30000);
    const url = metaOf(await venueRow()).coverUrl;
    const r = await fetch(url);
    check("prava fotografija se še vedno naloži", t.includes("naložena") && url !== before && r.headers.get("content-type") === "image/jpeg", `${t} ${r.headers.get("content-type")}`);
    await o.go(`/dashboard?v=${V}&s=kartica`, 1200);
    await (await o.page.$('input[type=file][aria-label="Naloži logotip"]')).uploadFile(path.join(process.cwd(), "public", "vzorec", "logo-lipa.webp"));
    t = await o.toast(30000);
    check("logotip WEBP se še vedno naloži", t.includes("naložen"), t);
    await o.go(`/dashboard?v=${V}&s=obiski`, 1200);
    const links = await o.page.evaluate(() => [...document.querySelectorAll("input[readonly]")].map((i) => i.value));
    check("povezave za QR in NFC kažejo na www", links.length === 2 && links.every((l) => l.startsWith("https://www.loyavi.app/")), links.join(" "));
  } finally { await o.close(); }
}

// ═══ B) LEADI: en naslov ════════════════════════════════════════════════════
if (run("leadi")) {
  const sentTo = async (subject, sinceMs) => {
    const r = await fetch("https://api.resend.com/emails?limit=40", { headers: { authorization: `Bearer ${env.RESEND_API_KEY}` } });
    const j = await r.json();
    return (j.data ?? []).filter((e) => String(e.subject) === subject && new Date(String(e.created_at).replace(" ", "T").replace(/\+00(:00)?$/, "Z")).getTime() >= sinceMs).map((e) => String(e.to));
  };
  const a = await open("anon3", { fresh: true });
  try {
    const t0 = Date.now() - 5000;
    await a.go("/kontakt");
    await a.fill("Ime", "Tester en naslov");
    await a.fill("Elektronski naslov", state.owner);
    await a.fill("Sporočilo", "Drugi test kontaktnega obrazca (en prejemnik). Prosim prezri.");
    await a.click("Pošlji sporočilo", { sel: "button" });
    await sleep(9000);
    const to = await sentTo("Loyavi: Sporočilo s kontaktnega obrazca", t0);
    check("obvestilo o povpraševanju pride enkrat (en naslov)", to.length === 1, `${to.length} sporočil`);
    const { data: lead } = await db.from("leads").select("id").eq("email", state.owner);
    state.leadIds = (lead ?? []).map((l) => l.id); save();
  } finally { await a.close(); }
  // nastavitev v bazi (kot jo shrani superadmin) preusmeri obvestila
  const sink = `delivered+az-leadi-${state.stamp}@resend.dev`;
  const ins = await db.from("email_log").insert({ kind: "platform_setting", ref: `lead_email=${sink}` }).select("id").single();
  check("nastavitev se zapiše brez lokala in gosta", !ins.error, ins.error?.message);
  const b = await open("anon3", {});
  try {
    const t0 = Date.now() - 5000;
    await b.go("/kontakt");
    await b.fill("Ime", "Tester nov naslov");
    await b.fill("Elektronski naslov", state.owner);
    await b.fill("Sporočilo", "Tretji test: obvestilo mora priti na zamenjani naslov. Prosim prezri.");
    await b.click("Pošlji sporočilo", { sel: "button" });
    await sleep(9000);
    const to = await sentTo("Loyavi: Sporočilo s kontaktnega obrazca", t0);
    check("po menjavi naslova obvestilo pride samo na novi naslov", to.length === 1 && to[0].includes("az-leadi"), to.join(" ").replace(/[a-z.0-9]+@gmail\.com/g, "<tin>"));
  } finally {
    await b.close();
    await db.from("email_log").delete().eq("kind", "platform_setting"); // nazaj na privzeti naslov
    const { data: lead } = await db.from("leads").select("id").eq("email", state.owner);
    state.leadIds = (lead ?? []).map((l) => l.id); save();
  }
  const { count } = await db.from("email_log").select("id", { count: "exact", head: true }).eq("kind", "platform_setting");
  check("testna nastavitev je odstranjena", (count ?? 0) === 0, count);
  // dnevnik pošte lastnika ne kaže vrstic nastavitev (kind je izločen)
  const an = await open("anon3", {});
  try { check("superadmin brez prijave ostane nedostopen", (await an.page.goto(BASE + "/superadmin?t=povprasevanja")).status() === 404); } finally { await an.close(); }
}

// ═══ C) MENJAVA NASLOVA ═════════════════════════════════════════════════════
if (run("naslov")) {
  const oldEmail = state.guest3, newEmail = `delivered+az-gost3b-${state.stamp}@resend.dev`;
  let userId = state.guest3Id;
  if (!userId) { for (let p = 1; p < 20; p++) { const { data: l } = await db.auth.admin.listUsers({ page: p, perPage: 200 }); const u = l?.users?.find((x) => x.email === oldEmail || x.email === newEmail); if (u) { userId = u.id; break; } if (!l?.users?.length) break; } state.guest3Id = userId; save(); }
  const cur = (await db.auth.admin.getUserById(userId)).data.user.email;
  note("gost 3 trenutno", cur);
  if (cur === oldEmail) {
    const p = await open("guest3", { mobile: true, email: oldEmail });
    try {
      await p.go("/app/profil", 2000);
      await p.click("Spremeni elektronski naslov", { sel: "button" });
      await p.fill("Nov elektronski naslov", "ni-naslov");
      await p.click("Pošlji potrditev", { sel: "button" });
      let err = await p.page.evaluate(() => document.querySelector('[role="alert"]')?.textContent ?? "");
      check("neveljaven nov naslov: napaka", err.includes("veljaven elektronski naslov"), err);
      await p.fill("Nov elektronski naslov", state.guest2);
      await p.click("Pošlji potrditev", { sel: "button" }); await sleep(3500);
      err = await p.page.evaluate(() => document.querySelector('[role="alert"]')?.textContent ?? "");
      check("naslov drugega računa: zavrnjeno", err.includes("že uporablja drug račun"), err);
      await p.fill("Nov elektronski naslov", newEmail);
      await p.click("Pošlji potrditev", { sel: "button" }); await sleep(6000);
      const info = await p.page.evaluate(() => [...document.querySelectorAll('[role="status"]')].map((e) => e.textContent).join(" "));
      check("zahteva je poslana, stari naslov še velja", info.includes("poslali povezavo") && (await db.auth.admin.getUserById(userId)).data.user.email === oldEmail, info.slice(0, 90));
      await p.shot("j03-naslov-zahteva", true);
      // napačen in pravi žeton (enak kot v sporočilu)
      const secret = crypto.createHmac("sha256", env.SUPABASE_SERVICE_ROLE_KEY).update("loyavi-email-change-v1").digest("hex");
      const enc = (s) => Buffer.from(s, "utf8").toString("base64url");
      const payload = `${userId}.${enc(oldEmail)}.${enc(newEmail)}.${Date.now() + 3600000}`;
      const token = `${payload}.${crypto.createHmac("sha256", secret).update(payload).digest("base64url")}`;
      const forged = `${userId}.${enc(oldEmail)}.${enc("delivered+napadalec@resend.dev")}.${Date.now() + 3600000}.${token.split(".")[4]}`;
      await p.go(`/racun/naslov?t=${encodeURIComponent(forged)}`, 1200);
      check("ponarejena povezava ne velja", await p.has("Povezava ni veljavna"));
      await p.go(`/racun/naslov?t=${encodeURIComponent(token)}`, 1200);
      check("stran za potrditev kaže stari in novi naslov", (await p.has(oldEmail)) && (await p.has(newEmail)));
      await p.shot("j04-naslov-potrdi");
      check("samo ogled povezave naslova ne spremeni", (await db.auth.admin.getUserById(userId)).data.user.email === oldEmail);
      await p.click("Potrdi nov naslov", { sel: "button" });
      await p.page.waitForFunction(() => location.search.includes("ok=1") || location.search.includes("e="), { timeout: 60000 }).catch(() => {});
      await sleep(1500);
      check("potrditev uspe", p.page.url().includes("ok=1") && (await p.has("Naslov je spremenjen")), p.page.url());
      await p.shot("j05-naslov-spremenjen");
      const after = (await db.auth.admin.getUserById(userId)).data.user.email;
      const { data: cards } = await db.from("customers").select("id, email, stamps").in("email", [oldEmail, newEmail]);
      check("račun in kartica imata novi naslov", after === newEmail && cards.length >= 1 && cards.every((c) => c.email === newEmail) && cards.some((c) => c.id === state.c3), JSON.stringify({ after, cards: cards.map((c) => c.email) }));
      await p.go(`/racun/naslov?t=${encodeURIComponent(token)}`, 1200);
      await p.click("Potrdi nov naslov", { sel: "button" }); await sleep(3500);
      check("ista povezava drugič ne velja več", p.page.url().includes("e=stale"), p.page.url());
      // obstoječa seja deluje naprej z novim naslovom
      await p.go("/app/profil", 2000);
      check("profil kaže novi naslov brez ponovne prijave", (await p.val("Elektronski naslov")) === newEmail, await p.val("Elektronski naslov"));
      await p.go(`/p/${code}`, 2500);
      check("kartica, žigi in kuponi so ostali", (await p.has("Sladica gratis")) || (await p.has("Kava zraven")), (await p.text()).replace(/\s+/g, " ").slice(120, 260));
      state.guest3 = newEmail; state.guest3Old = oldEmail; save();
    } finally { await p.close(); }
    // prijava z novim naslovom in istim geslom (testni račun, localhost)
    const q = await open("guest3b", { mobile: true, fresh: true });
    try {
      await q.go("/prijava?next=%2Fapp");
      await q.fill("Elektronski naslov", newEmail); await q.fill("Geslo", state.g3pass);
      await q.click("Nadaljuj", { sel: "button" });
      await q.page.waitForFunction(() => location.pathname === "/app", { timeout: 60000 }).catch(() => {});
      await sleep(2000);
      check("prijava z novim naslovom in starim geslom deluje", new URL(q.page.url()).pathname === "/app" && (await q.has("Bistro Pod Lipo AZ")), q.page.url());
    } finally { await q.close(); }
    await sleep(4000);
    const r = await fetch("https://api.resend.com/emails?limit=20", { headers: { authorization: `Bearer ${env.RESEND_API_KEY}` } });
    const mails = ((await r.json()).data ?? []).filter((e) => /nov elektronski naslov|je spremenjen/.test(String(e.subject)));
    for (const e of mails.slice(0, 4)) note("pošta", `${e.last_event} → ${String(e.to).replace(/delivered\+|@resend\.dev/g, "")} | ${e.subject}`);
    check("potrditev je šla na novi, obvestilo na stari naslov", mails.some((e) => String(e.to).includes("gost3b") && String(e.subject).startsWith("Potrdi")) && mails.some((e) => String(e.to).includes(`gost3-${state.stamp}`) && String(e.subject).includes("spremenjen")), mails.length);
  }
  // lastnik: panel Račun
  const o = await open("owner", { email: state.owner });
  try {
    await o.go(`/dashboard?v=${V}&s=nastavitve`, 1500);
    check("nastavitve lastnika imajo razdelek Račun z naslovom", (await o.has("Račun")) && (await o.val("Elektronski naslov")) === state.owner);
    await o.click("Spremeni elektronski naslov", { sel: "button" });
    await o.fill("Nov elektronski naslov", state.owner);
    await o.click("Pošlji potrditev", { sel: "button" });
    const err = await o.page.evaluate(() => document.querySelector('[role="alert"]')?.textContent ?? "");
    check("lastnik: isti naslov je zavrnjen", err.includes("že tvoj naslov"), err);
    await o.page.evaluate(() => [...document.querySelectorAll("h2")].find((h) => h.textContent === "Račun")?.scrollIntoView({ block: "start" }));
    await o.shot("j06-lastnik-racun");
  } finally { await o.close(); }
}

// ═══ D) DNEVNA SAMODEJNA SPOROČILA (samo testni lokal) ═════════════════════
if (run("cron")) {
  const cron = async () => { const r = await fetch(`${BASE}/api/cron/daily?venue=${V}`, { headers: { authorization: `Bearer ${env.CRON_SECRET}` } }); return { status: r.status, ...(await r.json()) }; };
  const noAuth = await fetch(`${BASE}/api/cron/daily?venue=${V}`);
  check("dnevni zagon brez ključa je zavrnjen", noAuth.status === 401, noAuth.status);
  const c3 = (await db.from("customers").select("id, email, birthday").eq("id", state.c3).single()).data;
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Ljubljana" }).format(new Date()).slice(5);
  note("gost 3", `${c3.email} rojstni dan ${c3.birthday}, danes ${today}`);
  if (c3.birthday !== today) await db.from("customers").update({ birthday: today }).eq("id", state.c3);
  await db.from("email_log").delete().eq("venue_id", V).eq("customer_id", state.c3).eq("kind", "birthday_guest");
  // 1) gost je odjavljen od ponudb → nič
  const { data: st } = await db.from("email_log").select("kind").eq("customer_id", state.c3).in("kind", ["marketing_optin", "unsubscribe"]);
  note("stanje soglasja gosta 3", JSON.stringify(st.map((x) => x.kind)));
  if (!st.some((x) => x.kind === "unsubscribe")) await db.from("email_log").insert({ kind: "unsubscribe", venue_id: V, customer_id: state.c3 });
  const r1 = await cron();
  check("odjavljen gost ne dobi voščila", r1.ok && r1.venues === 1 && r1.sent === 0, JSON.stringify(r1));
  // 2) gost si premisli na strani za odjavo → dobi voščilo in kupon
  const secret = crypto.createHmac("sha256", env.SUPABASE_SERVICE_ROLE_KEY).update("loyavi-unsub-v1").digest("hex");
  const tok = crypto.createHmac("sha256", secret).update(state.c3).digest("hex").slice(0, 32);
  const p = await open("guest3", { mobile: true, email: state.guest3 });
  try {
    await p.go(`/odjava?c=${state.c3}&t=${tok}`, 1500);
    await p.click("Želim spet prejemati sporočila", { sel: "button" }); await sleep(3000);
    check("gost spet prejema ponudbe", await p.has("Odjavi me"), (await p.text()).replace(/\s+/g, " ").slice(0, 120));
  } finally { await p.close(); }
  const r2 = await cron();
  check("gost z rojstnim dnem danes dobi eno voščilo", r2.ok && r2.sent === 1, JSON.stringify(r2));
  const { data: cp } = await db.from("redemptions").select("status, expires_at, rewards(name)").eq("customer_id", state.c3).eq("status", "ready");
  check("voščilu je priložen kupon za 30 dni", (cp ?? []).some((x) => x.rewards?.name === "Darilo za rojstni dan" && x.expires_at), JSON.stringify(cp?.map((x) => x.rewards?.name)));
  const r3 = await cron();
  check("ponoven zagon isti dan ne pošlje drugič", r3.ok && r3.sent === 0, JSON.stringify(r3));
  await sleep(4000);
  const r = await fetch("https://api.resend.com/emails?limit=10", { headers: { authorization: `Bearer ${env.RESEND_API_KEY}` } });
  const m = ((await r.json()).data ?? []).find((e) => String(e.to).includes("gost3"));
  note("zadnja pošta gostu 3", m ? `${m.last_event} | ${m.subject}` : "ni");
  check("voščilo je oddano gostu 3", !!m && /najboljše|rojstn/i.test(m.subject), m?.subject);
}
summary();
