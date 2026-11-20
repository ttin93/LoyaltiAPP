// Korak 2: lastnik nastavi vse, kar se nastaviti da, in preveri, da se shrani (baza + ponovno nalaganje).
import fs from "fs"; import path from "path";
import { open, check, note, summary, state, db, sleep, venueRow, metaOf, DIR } from "./lib.mjs";

// testne datoteke
const F = path.join(DIR, "files"); fs.mkdirSync(F, { recursive: true });
const pub = path.join(process.cwd(), "public", "vzorec");
const cover = path.join(pub, "lipa-cover.jpg"), logo = path.join(pub, "logo-lipa.webp");
const big = path.join(F, "velik.png"); if (!fs.existsSync(big)) fs.writeFileSync(big, Buffer.alloc(2.5 * 1024 * 1024, 7));
const gif = path.join(F, "slika.gif"); fs.writeFileSync(gif, Buffer.from("GIF89a\x01\x00\x01\x00\x00\x00\x00;", "binary"));
const pdf = path.join(F, "meni.pdf");
fs.writeFileSync(pdf, "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 300]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n");

const V = state.venueId;
const o = await open("owner", { email: state.owner });
const sec = (s) => o.go(`/dashboard?v=${V}&s=${s}`, 1200);
const upload = async (ariaLabel, file) => { const el = await o.page.$(`input[type=file][aria-label="${ariaLabel}"]`); if (!el) { console.log("!! ni polja", ariaLabel); return false; } await el.uploadFile(file); return true; };

try {
  // ── NASTAVITVE: profil ──────────────────────────────────────────────────
  await sec("nastavitve");
  await o.shot("c01-nastavitve-prej", true);
  await o.fill("Ime lokala", "B");
  await o.click("Shrani profil", { sel: "button" });
  await sleep(1500);
  const invalid = await o.page.evaluate(() => { const i = [...document.querySelectorAll("label")].find((l) => l.textContent.startsWith("Ime lokala"))?.querySelector("input"); return i ? !i.checkValidity() : null; });
  check("ime z enim znakom brskalnik zavrne (minLength)", invalid === true);
  await o.fill("Ime lokala", "Bistro Pod Lipo AZ");
  await o.fill("Vrsta lokala", "restavracija");
  await o.fill("Naslov", "Glavni trg 7");
  await o.fill("Kraj", "Novo mesto");
  await o.fill("Telefon", "041 555 019");
  await o.fill("Spletna stran", "www.bistro-az-test.si");
  await o.fill("Delovni čas", "Pon do pet 7.00 do 16.00, sob 8.00 do 13.00");
  await o.fill("Kratek opis", "Domača kosila in kava. Testni lokal za preizkus od A do Ž.");
  // izklop imenika: testni lokal ne sme biti viden v javnem imeniku produkcije
  const listedBefore = await o.page.evaluate(() => document.querySelector('[role=switch][aria-label="Prikaži v imeniku lokalov"]')?.getAttribute("aria-checked"));
  if (listedBefore === "true") await o.click("Prikaži v imeniku lokalov", { sel: "[role=switch]" });
  await o.click("Shrani profil", { sel: "button" });
  let t = await o.toast();
  check("profil: obvestilo o shranjevanju", t.includes("shranjeni"), t);
  let v = await venueRow(), m = metaOf(v);
  check("profil je v bazi", v.phone === "041 555 019" && m.address === "Glavni trg 7" && m.hours.startsWith("Pon do pet") && m.about.startsWith("Domača") && m.listed === false, JSON.stringify({ phone: v.phone, address: m.address, listed: m.listed }));
  check("spletna stran dobi https://", m.website === "https://www.bistro-az-test.si", m.website);

  // ── NASTAVITVE: stran lokala ────────────────────────────────────────────
  await o.toastGone();
  await o.fill("Kratek slogan", "Kosilo kot pri mami, kava kot v Trstu.");
  await o.fill("Wi-Fi: ime omrežja", "PodLipo Gostje");
  await o.fill("Wi-Fi: geslo", "kosilo2026");
  await o.fill("Meni ali cenik", "bistro-az-test.si/meni");
  await o.fill("Instagram", "neveljavno ime!");
  await o.click("Shrani stran lokala", { sel: "button" });
  t = await o.toast();
  check("neveljaven Instagram vrne napako", t.includes("uporabniško ime na Instagramu"), t);
  await o.toastGone();
  await o.fill("Instagram", "https://www.instagram.com/bistro.podlipo/?hl=sl");
  await o.click("Shrani stran lokala", { sel: "button" });
  t = await o.toast();
  check("stran lokala: obvestilo", t.includes("shranjena"), t);
  v = await venueRow(); m = metaOf(v);
  check("Instagram povezava se očisti v ime", m.instagram === "bistro.podlipo", m.instagram);
  check("meni dobi https://", m.menuUrl === "https://bistro-az-test.si/meni", m.menuUrl);
  check("slogan in Wi-Fi sta v bazi", m.tagline.startsWith("Kosilo kot") && m.wifiName === "PodLipo Gostje" && m.wifiPass === "kosilo2026");

  // naslovna fotografija
  await o.toastGone();
  await upload("Naloži naslovno fotografijo", big);
  t = await o.toast(20000);
  note("prevelika naslovna (2,5 MB smeti) odziv", t);
  await o.toastGone();
  await upload("Naloži naslovno fotografijo", cover);
  t = await o.toast(30000);
  check("naslovna fotografija se naloži", t.includes("naložena"), t);
  v = await venueRow(); m = metaOf(v);
  const coverUrl = m.coverUrl;
  check("naslovna je v shrambi", /supabase\.co\/storage\/v1\/object\/public\/logos\//.test(coverUrl), coverUrl);
  const cr = await fetch(coverUrl); check("naslovna je javno dostopna", cr.ok && (cr.headers.get("content-type") || "").startsWith("image/"), `${cr.status} ${cr.headers.get("content-type")} ${cr.headers.get("content-length")}`);

  // meni kot PDF
  await o.toastGone();
  await upload("Naloži meni", gif);
  t = await o.toast(20000);
  check("meni: GIF je zavrnjen", t.includes("Dovoljene so"), t);
  await o.toastGone();
  await upload("Naloži meni", pdf);
  t = await o.toast(30000);
  check("meni: PDF se naloži", t.includes("naložen"), t);
  v = await venueRow(); m = metaOf(v);
  const mr = await fetch(m.menuUrl); check("PDF menija je javno dostopen", mr.ok && (mr.headers.get("content-type") || "").includes("pdf"), `${m.menuUrl.slice(-40)} ${mr.status} ${mr.headers.get("content-type")}`);
  await sleep(1500);
  const menuField = await o.val("Meni ali cenik");
  check("polje Meni po nalaganju kaže novo povezavo (brez osvežitve)", menuField === m.menuUrl, menuField);

  // ── NASTAVITVE: pravila ──────────────────────────────────────────────────
  await sec("nastavitve");
  await o.fill("Veljavnost računa (ure)", "48");
  await o.fill("Premor med žigi (minute)", "0");
  await o.fill("Čas za prevzem (minute)", "99");
  await o.click("Shrani pravila", { sel: "button" });
  await sleep(1200);
  const prevzemInvalid = await o.page.evaluate(() => { const i = [...document.querySelectorAll("label")].find((l) => l.textContent.startsWith("Čas za prevzem"))?.querySelector("input"); return i ? !i.checkValidity() : null; });
  check("čas za prevzem 99 brskalnik zavrne (max 60)", prevzemInvalid === true);
  await o.fill("Čas za prevzem (minute)", "10");
  await o.click("Shrani pravila", { sel: "button" });
  t = await o.toast();
  check("pravila: obvestilo", t.includes("shranjena"), t);
  v = await venueRow();
  check("pravila so v bazi", v.scan_window_hours === 48 && v.scan_cooldown_minutes === 0 && v.redemption_minutes === 10, JSON.stringify({ w: v.scan_window_hours, c: v.scan_cooldown_minutes, r: v.redemption_minutes }));

  // ponovno nalaganje ohrani vse
  await sec("nastavitve");
  const kept = { tel: await o.val("Telefon"), ig: await o.val("Instagram"), wifi: await o.val("Wi-Fi: geslo"), ure: await o.val("Veljavnost računa (ure)") };
  check("po osvežitvi so vrednosti v obrazcu", kept.tel === "041 555 019" && kept.ig === "bistro.podlipo" && kept.wifi === "kosilo2026" && kept.ure === "48", JSON.stringify(kept));
  await o.shot("c02-nastavitve-potem", true);

  // ── KARTICA ───────────────────────────────────────────────────────────────
  await sec("kartica");
  const saveDisabled = await o.page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Shrani kartico"))?.disabled);
  check("Shrani kartico je onemogočen brez sprememb", saveDisabled === true);
  await upload("Naloži logotip", gif);
  t = await o.toast(20000);
  check("logotip: GIF je zavrnjen", t.includes("Dovoljene so"), t);
  await o.toastGone();
  await upload("Naloži logotip", big);
  t = await o.toast(20000);
  check("logotip: več kot 2 MB je zavrnjen", t.includes("2 MB"), t);
  await o.toastGone();
  await upload("Naloži logotip", logo);
  t = await o.toast(30000);
  check("logotip se naloži", t.includes("naložen"), t);
  await o.toastGone();
  await o.click("Barva #E63F26", { sel: "button" });
  await o.click("Več", { sel: "button" }); // 5 → 6
  await o.fill("Nagrada za polno kartico", "Brezplačno kosilo dneva");
  await o.click("Shrani kartico", { sel: "button" });
  t = await o.toast();
  check("kartica: obvestilo", t.includes("shranjena"), t);
  v = await venueRow();
  const { data: rw } = await db.from("rewards").select("name, points_required").eq("venue_id", V).eq("kind", "stamp");
  check("kartica je v bazi (6 žigov, rdeča, logotip)", v.stamp_goal === 6 && v.brand_color?.toLowerCase() === "#e63f26" && !!v.logo_url && rw?.[0]?.points_required === 6, JSON.stringify({ goal: v.stamp_goal, color: v.brand_color, logo: !!v.logo_url, rw }));
  await sleep(1500);
  await o.shot("c03-kartica", true);

  // ── KOLO ──────────────────────────────────────────────────────────────────
  await sec("kolo");
  await o.dump("kolo");
  const segBefore = await o.page.evaluate(() => [...document.querySelectorAll('input[aria-label="Ime nagrade"]')].map((i) => i.value));
  note("privzeta polja kolesa", segBefore.join(" / "));
  await o.click("Dodaj polje", { sel: "button" });
  const n = segBefore.length;
  await o.fill("Ime nagrade", "Sladica gratis", { nth: n });
  await o.page.evaluate((i) => { const s = document.querySelectorAll("li select")[i]; s.value = "5"; s.dispatchEvent(new Event("change", { bubbles: true })); }, n);
  // izprazni prvo polje: tako ostane manj kot 2 poimenovani? samo če sta bili 2
  await o.click("Shrani kolo", { sel: "button" });
  t = await o.toast();
  check("kolo: obvestilo", t.includes("shranjeno"), t);
  v = await venueRow();
  check("kolo je v bazi z novim poljem", v.wheel_config?.segments?.some((s) => s.label === "Sladica gratis" && s.weight === 5) && v.wheel_config.enabled !== false, JSON.stringify(v.wheel_config?.segments));
  await o.shot("c04-kolo", true);

  // ── OBISKI IN KODA QR ────────────────────────────────────────────────────
  await sec("obiski");
  await o.dump("obiski");
  await o.fill("Ali vpiši davčno številko ročno", "1234567");
  let davDisabled = await o.page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Shrani številko"))?.disabled);
  check("davčna s 7 števkami: gumb onemogočen", davDisabled === true);
  await o.fill("Ali vpiši davčno številko ročno", "SI 9124 5678"); // vnos s predpono in presledki
  const davVal = await o.val("Ali vpiši davčno številko ročno");
  check("polje očisti predpono in presledke", davVal === "91245678", davVal);
  await o.click("Shrani številko", { sel: "button" });
  t = await o.toast();
  check("davčna: obvestilo", t.includes("shranjena"), t);
  v = await venueRow();
  check("davčna je v bazi", v.davcna_stevilka === "91245678", v.davcna_stevilka);
  state.dav = v.davcna_stevilka;
  // povezave in plakat
  const links = await o.page.evaluate(() => [...document.querySelectorAll('input[readonly]')].map((i) => i.value));
  note("povezave", links.join("  "));
  state.standUrl = links.find((l) => l.includes("/s/")); state.pageUrl = links.find((l) => l.includes("/p/"));
  check("povezava stojala in kartice obstajata", !!state.standUrl && !!state.pageUrl, links.join(" "));
  const qrCount = await o.page.evaluate(() => document.querySelectorAll('[role=img][aria-label*="Koda QR"] svg').length);
  check("kodi QR sta izrisani", qrCount === 2, qrCount);
  await o.shot("c05-obiski", true);
  for (const tip of ["stojalo", "kartica"]) {
    const p2 = await o.browser.newPage();
    const r = await p2.goto(`http://localhost:3000/dashboard/plakat?v=${V}&t=${tip}`, { waitUntil: "networkidle0", timeout: 120000 });
    await sleep(1200);
    const txt = await p2.evaluate(() => document.body.innerText);
    check(`plakat ${tip} se odpre`, r.status() === 200 && txt.length > 20, txt.replace(/\s+/g, " ").slice(0, 120));
    await p2.setViewport({ width: 900, height: 1200 });
    await p2.screenshot({ path: path.join(DIR, "shots", `c06-plakat-${tip}.png`), fullPage: true });
    await p2.close();
  }
  // način: samo račun skrije stojalo
  await o.click("Fiskalni račun", { sel: "[role=radio]" });
  t = await o.toast();
  await sleep(1500);
  check("način Račun: stojalo se skrije", t.includes("shranjen") && !(await o.has("Povezava za nalepko NFC")), t);
  await o.toastGone();
  await o.click("Oboje", { sel: "[role=radio]" });
  t = await o.toast(); await sleep(1500);
  check("način Oboje: oba razdelka", t.includes("shranjen") && (await o.has("Povezava za nalepko NFC")) && (await o.has("Skeniranje računov")), t);

  // ── OCENE ─────────────────────────────────────────────────────────────────
  await sec("ocene");
  await o.fill("Povezava", "g.page/r/test");
  await o.click("Shrani povezavo", { sel: "button" });
  await sleep(1000);
  const urlInvalid = await o.page.evaluate(() => { const i = document.querySelector('input[type=url]'); return i ? !i.checkValidity() : null; });
  check("povezava brez https: brskalnik zavrne", urlInvalid === true);
  await o.fill("Povezava", "https://g.page/r/CTestAZ/review");
  await o.click("Shrani povezavo", { sel: "button" });
  t = await o.toast();
  check("Google povezava: obvestilo", t.includes("shranjena"), t);
  v = await venueRow();
  check("Google povezava je v bazi", v.google_review_url === "https://g.page/r/CTestAZ/review", v.google_review_url);

  // ── MARKETING: samodejna sporočila ──────────────────────────────────────
  await sec("marketing");
  await o.click("Pogrešamo te", { sel: "[role=switch]" });
  await o.fill("Po koliko dneh brez obiska", "21");
  await o.click("Rojstni dan gosta", { sel: "[role=switch]" });
  await o.click("Praznik lokala", { sel: "[role=switch]" });
  await o.fill("Dan", "14"); await o.fill("Mesec", "03");
  await o.click("Shrani", { sel: "button", exact: true });
  t = await o.toast();
  check("samodejna sporočila: obvestilo", t.includes("shranjena"), t);
  v = await venueRow();
  const a = v.automations || {};
  check("samodejna so v bazi, nastavitve lokala ostanejo", a.inactive?.enabled && a.inactive?.days === 21 && a.guest_birthday?.enabled && a.venue_birthday?.date === "03-14" && a.__v2?.instagram === "bistro.podlipo", JSON.stringify({ inactive: a.inactive?.days, bday: a.guest_birthday?.enabled, feast: a.venue_birthday?.date, v2: !!a.__v2 }));
  await o.shot("c07-marketing", true);
  await o.click("Novo sporočilo", { sel: "button" });
  await sleep(600);
  await o.fill("Zadeva", "Test"); await o.fill("Sporočilo", "Test");
  const sendDisabled = await o.page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Nadaljuj")?.disabled);
  check("kampanja brez gostov z dovoljenjem je onemogočena", sendDisabled === true);
  await o.shot("c08-kampanja-prazna", true);

  // ── PREGLED: prvi koraki ─────────────────────────────────────────────────
  await sec("pregled");
  await o.dump("pregled po nastavitvah");
  await o.shot("c09-pregled", true);
  if (o.errors.length) note("napake v konzoli", o.errors.join(" || "));
} finally {
  const fsState = await import("./lib.mjs");
  fsState.save();
  await o.close();
  summary();
}
