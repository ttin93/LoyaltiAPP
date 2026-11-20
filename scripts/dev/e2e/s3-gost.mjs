// Korak 3: nov gost na telefonu. Pravi vpis z obrazcem (testni račun na localhostu), soglasja, kolo,
// žigi z računom in stojalom, pravila proti zlorabam, ocena, polna kartica, unovčenje kupona, denarnica, profil.
import crypto from "crypto";
import { open, check, note, summary, state, save, db, sleep, receipt, venueRow, metaOf } from "./lib.mjs";

state.guest3 = state.guest3 || `delivered+az-gost3-${state.stamp}@resend.dev`;
state.g3pass = state.g3pass || crypto.randomBytes(9).toString("base64url"); // samo za ta testni račun
save();
const code = state.code, dav = state.dav;
const v0 = await venueRow();
const standUrl = `/s/${code}?k=${metaOf(v0).standKey}`;

const g = await open("guest3", { mobile: true, fresh: true });
const scanUI = async (payload) => {
  await g.click("Skeniraj račun", { sel: "button" });
  await sleep(2500);
  if (!(await g.page.$('input[aria-label="Številka iz kode QR"]'))) await g.click("Vnesi kodo ročno", { sel: "button" });
  await sleep(400);
  await g.fill("Številka iz kode QR", payload);
  await g.click("Potrdi kodo", { sel: "button" });
  await sleep(3500);
};
const apiScan = (payload) => g.post("/api/scan", { venueCode: code, payload });
const stamps = async () => (await db.from("customers").select("id, stamps").eq("venue_id", state.venueId).eq("email", state.guest3).maybeSingle()).data;

try {
  // 1) stran lokala brez prijave
  await g.go(`/p/${code}`);
  await g.dump("stran lokala, neprijavljen");
  await g.shot("d01-lokal-neprijavljen", true);
  const t0 = await g.text();
  check("stran lokala kaže ime, slogan, kraj", t0.includes("Bistro Pod Lipo AZ") && t0.includes("Kosilo kot pri mami") && t0.includes("Novo mesto"));
  check("stran lokala kaže Wi-Fi, meni, Instagram, telefon, naslov, čas", ["Wi-Fi", "Meni", "Instagram", "Pokliči", "Glavni trg", "Pon do pet"].every((x) => t0.includes(x)), ["Wi-Fi", "Meni", "Instagram", "Pokliči", "Glavni trg", "Pon do pet"].filter((x) => !t0.includes(x)).join(","));
  const img = await g.page.evaluate(() => [...document.images].map((i) => ({ src: i.currentSrc || i.src, ok: i.complete && i.naturalWidth > 0 })).filter((i) => i.src.includes("supabase") || i.src.includes("_next/image")));
  check("naslovna in logotip se naložita", img.length >= 2 && img.every((i) => i.ok), JSON.stringify(img.map((i) => i.ok)));
  // Wi-Fi okno
  await g.click("Wi-Fi", { sel: "button" }); await sleep(800);
  check("Wi-Fi okno kaže geslo", await g.has("kosilo2026"));
  await g.shot("d02-wifi");
  await g.click("Zapri", { sel: "button" }); await sleep(500);
  await g.page.keyboard.press("Escape"); await sleep(400);

  // 2) vpis
  await g.click("Začni zbirati žige");
  await g.page.waitForFunction(() => location.pathname === "/prijava", { timeout: 60000 }); await sleep(1500);
  await g.shot("d03-prijava");
  await g.fill("Elektronski naslov", state.guest3);
  await g.fill("Geslo", state.g3pass);
  await g.click("Nadaljuj", { sel: "button" });
  await g.page.waitForFunction(() => location.pathname.startsWith("/prijava/soglasje"), { timeout: 90000 }).catch(() => {});
  await sleep(2500);
  check("nov gost pride na korak s soglasji", g.page.url().includes("/prijava/soglasje"), g.page.url());
  check("korak ohrani pot nazaj na lokal", decodeURIComponent(g.page.url()).includes(`/p/${code}?join=1`), decodeURIComponent(g.page.url()));
  await g.shot("d04-soglasje");
  await g.page.evaluate(() => document.querySelectorAll("label")[0].click());
  await g.page.evaluate(() => document.querySelectorAll("label")[1].click());
  await sleep(300);
  await g.click("Potrdi in nadaljuj", { sel: "button" });
  await g.page.waitForFunction((c) => location.pathname === `/p/${c}`, { timeout: 90000 }, code).catch(() => {});
  await sleep(5000);
  check("po soglasju nazaj na stran lokala", g.page.url().includes(`/p/${code}`), g.page.url());
  let c = await stamps();
  check("gost je samodejno dodal kartico (join=1)", !!c, JSON.stringify(c));
  await g.dump("po pridružitvi");
  await g.shot("d05-pridruzen", true);
  const { data: optin } = await db.from("email_log").select("kind, ref").eq("customer_id", c?.id ?? "-").eq("kind", "marketing_optin");
  check("dovoljenje za ponudbe je zapisano za ta lokal", optin?.length === 1 && String(optin[0].ref).endsWith(":pridruzitev"), JSON.stringify(optin));

  // 3) kolo dobrodošlice
  if (!(await g.has("Vrtim")) && !(await g.page.$('[role="dialog"]'))) await g.click("Zavrti kolo dobrodošlice", { sel: "button" });
  await sleep(1200);
  await g.click("Zavrti kolo", { sel: "button", exact: true });
  await sleep(7000);
  await g.shot("d06-kolo-zadetek");
  const wheelTxt = await g.page.evaluate(() => [...document.querySelectorAll('[role="dialog"]')].map((d) => d.innerText).join(" ").replace(/\s+/g, " "));
  note("kolo: izid", wheelTxt.slice(0, 200));
  await g.click("Odlično", { sel: "button" }); await sleep(800);
  const r2 = await g.post("/api/wheel", { venueCode: code });
  check("kolo se ne da zavrteti drugič", r2.status >= 400 || r2.ok === false, JSON.stringify(r2));
  const { data: wc } = await db.from("redemptions").select("status, rewards(name)").eq("customer_id", c.id);
  note("kuponi po kolesu", JSON.stringify(wc?.map((x) => ({ name: x.rewards?.name, status: x.status }))));

  // 4) prvi žig z računom prek zaslona
  await g.go(`/p/${code}`, 2500);
  await scanUI(receipt(dav, 2));
  await g.shot("d07-zig-1");
  const after1 = await g.page.evaluate(() => [...document.querySelectorAll('[role="dialog"]')].map((d) => d.innerText).join(" ").replace(/\s+/g, " "));
  note("po prvem žigu", after1.slice(0, 220));
  c = await stamps();
  check("prvi račun prinese žig", c.stamps === 1, c.stamps);
  await g.click("Super", { sel: "button" }); await sleep(1500);
  // povabilo k oceni
  const reviewOpen = await g.has("Oceni obisk") || await g.has("Kako je bilo");
  note("povabilo k oceni po obisku", String(reviewOpen));
  await g.shot("d08-ocena");
  if (await g.page.$('[aria-label="2 od 5"]')) {
    await g.page.evaluate(() => document.querySelector('[aria-label="2 od 5"]').click()); await sleep(600);
    await g.shot("d09-ocena-2");
    if (await g.page.$('textarea[aria-label="Sporočilo lokalu"]')) {
      await g.fill("Sporočilo lokalu", "Juha je bila hladna, sicer prijazno osebje. Test A do Ž.");
      await g.click("Pošlji lokalu", { sel: "button" }); await sleep(2500);
    }
    await g.shot("d10-ocena-poslano");
    await g.click("Zapri", { sel: "button" }); await sleep(500);
  }
  const { data: rev } = await db.from("reviews").select("stars, comment, to_google").eq("venue_id", state.venueId);
  check("ocena je zapisana za lastnika", rev?.some((r) => r.stars === 2 && String(r.comment).includes("Juha")), JSON.stringify(rev));

  // 5) pravila proti zlorabam (prek API, kot bi jih poslala aplikacija)
  const same = receipt(dav, 3);
  const a1 = await apiScan(same); const a2 = await apiScan(same);
  check("isti račun drugič ne prinese žiga", a1.ok && !a2.ok, `${a1.ok} / ${a2.error}`);
  const other = await apiScan(receipt("12345678", 1));
  check("račun drugega lokala je zavrnjen", !other.ok, other.error);
  const old = await apiScan(receipt(dav, 49 * 60));
  check("račun starejši od 48 ur je zavrnjen", !old.ok, old.error);
  const future = await apiScan(receipt(dav, -120));
  note("račun iz prihodnosti (2 uri)", `${future.ok} ${future.error ?? ""}`);
  const junk = await apiScan("to ni koda");
  check("nesmiselna koda je zavrnjena", !junk.ok, junk.error);
  c = await stamps();
  note("žigi po preizkusu pravil", c.stamps);

  // 6) stojalo
  await g.go(standUrl, 4500);
  await g.shot("d11-stojalo");
  const st1 = await g.page.evaluate(() => [...document.querySelectorAll('[role="dialog"], [role="alert"]')].map((d) => d.innerText).join(" ").replace(/\s+/g, " "));
  const cS = await stamps();
  note("stojalo isti dan po računu", `${st1.slice(0, 160)} | žigov ${cS.stamps}`);
  check("stojalo zabeleži obisk (način Oboje)", cS.stamps === c.stamps + 1, `${c.stamps} → ${cS.stamps}`);
  await g.click("Super", { sel: "button" }); await sleep(800);
  await g.go(standUrl, 4500);
  const st2 = await g.page.evaluate(() => [...document.querySelectorAll('[role="dialog"], [role="alert"]')].map((d) => d.innerText).join(" ").replace(/\s+/g, " "));
  const cS2 = await stamps();
  check("stojalo drugič isti dan ne da žiga", cS2.stamps === cS.stamps, `${st2.slice(0, 160)} | žigov ${cS2.stamps}`);
  await g.go(`/s/${code}?k=napacenkljuc`, 3500);
  const cS3 = await stamps();
  check("napačen ključ stojala ne da žiga", cS3.stamps === cS2.stamps, g.page.url());
  const direct = await g.post("/api/checkin", { venueCode: code });
  check("žig s stojala brez obiska stojala (neposredno) je zavrnjen", !direct.ok, JSON.stringify(direct));

  // 7) napolni kartico do 6 in čez
  for (let i = (await stamps()).stamps; i < 6; i++) { const r = await apiScan(receipt(dav, 5 + i)); if (!r.ok) note("dodatni račun zavrnjen", r.error); }
  await g.go(`/p/${code}`, 2500);
  c = await stamps();
  const { data: cps } = await db.from("redemptions").select("status, rewards(name)").eq("customer_id", c.id);
  note("kuponi", JSON.stringify(cps?.map((x) => ({ n: x.rewards?.name, s: x.status }))));
  check("polna kartica: žigi se ponastavijo in nastane kupon", c.stamps < 6 && (cps ?? []).some((x) => String(x.rewards?.name ?? "").includes("kosilo")), `žigov ${c.stamps}`);
  await g.dump("kuponi");
  await g.shot("d12-kuponi", true);

  // 8) unovči kupon za nagrado
  const btns = await g.page.evaluate(() => [...document.querySelectorAll("button")].map((b) => b.innerText.replace(/\s+/g, " ")).filter((t) => t.includes("Unovči")));
  note("gumbi Unovči", btns.join(" / "));
  await g.click("Brezplačno kosilo dneva", { sel: "button" }); await sleep(1000);
  await g.shot("d13-kupon-uvod");
  await g.click("Aktiviraj zdaj", { sel: "button" }); await sleep(2500);
  await g.shot("d14-kupon-aktiven");
  const timer = await g.page.evaluate(() => [...document.querySelectorAll('[role="dialog"]')].map((d) => d.innerText).join(" ").replace(/\s+/g, " "));
  note("aktiven kupon", timer.slice(0, 200));
  check("aktiven kupon kaže odštevanje do 10 minut", /(9|10):\d\d/.test(timer), timer.slice(0, 120));
  await g.click("Osebje potrdi prevzem", { sel: "button" }); await sleep(2500);
  await g.shot("d15-kupon-prevzet");
  check("kupon je prevzet", await g.has("Nagrada je prevzeta"));
  await g.click("Zapri", { sel: "button" }); await sleep(600);

  // 9) denarnica, imenik, profil
  await g.go("/app", 2000); await g.shot("d16-denarnica", true);
  check("denarnica kaže kartico lokala", await g.has("Bistro Pod Lipo AZ"));
  await g.go("/app/lokali", 2000); await g.shot("d17-imenik", true);
  check("lokal z izklopljenim imenikom ni v imeniku", !(await g.has("Bistro Pod Lipo AZ")));
  await g.go("/app/profil", 2000);
  await g.dump("profil");
  await g.shot("d18-profil", true);
  const p404 = await g.page.goto("http://localhost:3000/p/ta-lokal-ne-obstaja", { waitUntil: "domcontentloaded" });
  check("neobstoječ lokal vrne 404", p404.status() === 404, p404.status());
  if (g.errors.length) note("napake v konzoli (gost)", g.errors.join(" || "));
} finally {
  await g.close();
  summary();
}
