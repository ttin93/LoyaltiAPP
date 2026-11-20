// Korak 5: lastnik upravlja goste, vidi oceno, pošlje kampanjo (demo omejitev), pošlje povpraševanje za več lokalov.
import fs from "fs"; import path from "path";
import { open, check, note, summary, state, save, db, sleep, DIR } from "./lib.mjs";
const V = state.venueId;
const o = await open("owner", { email: state.owner });
const sec = (s) => o.go(`/dashboard?v=${V}&s=${s}`, 1500);
const dl = path.join(DIR, "downloads"); fs.rmSync(dl, { recursive: true, force: true }); fs.mkdirSync(dl, { recursive: true });

try {
  // ── PREGLED ───────────────────────────────────────────────────────────────
  await sec("pregled");
  await o.dump("pregled z gosti");
  await o.shot("f01-pregled", true);
  const tx = (await o.text()).replace(/\s+/g, " ");
  note("pregled številke", tx.slice(0, 600));

  // ── GOSTJE ────────────────────────────────────────────────────────────────
  await sec("gostje");
  await o.dump("gostje");
  await o.shot("f02-gostje", true);
  check("seznam ima oba gosta", (await o.has(state.guest2)) && (await o.has(state.guest3)));
  await o.fill("Išči goste", "gost2");
  await sleep(500);
  check("iskanje filtrira", (await o.has(state.guest2)) && !(await o.has(state.guest3)));
  await o.fill("Išči goste", "");
  // izvoz CSV
  const cdp = await o.page.createCDPSession();
  await cdp.send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: dl });
  await o.click("Izvozi CSV", { sel: "button" });
  await sleep(3000);
  const files = fs.readdirSync(dl);
  const csv = files.length ? fs.readFileSync(path.join(dl, files[0]), "utf8") : "";
  check("izvoz CSV vsebuje goste", files[0]?.endsWith(".csv") && csv.includes(state.guest3) && csv.includes("Elektronski naslov"), `${files.join(",")} ${csv.split("\n").length} vrstic`);
  note("CSV glava", csv.split("\n")[0]);
  // gost 2: ročni žig in darilo
  await o.click(state.guest2, { sel: "button" });
  await sleep(1000);
  await o.shot("f03-gost-okno");
  check("okno gosta pove, da ponudb ni dovolil", await o.has("ni dovolil"));
  const before = (await db.from("customers").select("stamps").eq("id", state.c2).single()).data.stamps;
  await o.click("Dodaj žig ročno", { sel: "button" });
  let t = await o.toast();
  const after = (await db.from("customers").select("stamps").eq("id", state.c2).single()).data.stamps;
  check("ročni žig doda žig", t.includes("dodan") && after === before + 1, `${before} → ${after}`);
  await o.toastGone();
  await o.fill("Podari kupon", "Kava za potrpežljivost");
  await o.click("Podari", { sel: "button", exact: true });
  t = await o.toast();
  const { data: gc } = await db.from("redemptions").select("status, source, rewards(name)").eq("customer_id", state.c2);
  check("podarjen kupon je v gostovi denarnici", t.includes("podarjen") && (gc ?? []).some((x) => x.rewards?.name === "Kava za potrpežljivost" && x.status === "ready"), JSON.stringify(gc?.map((x) => [x.rewards?.name, x.status, x.source])));
  await sleep(1500);
  await o.shot("f04-gost-kupon");
  await o.page.keyboard.press("Escape"); await sleep(600);

  // ── OCENE ─────────────────────────────────────────────────────────────────
  await sec("ocene");
  await o.shot("f05-ocene", true);
  check("lastnik vidi oceno in zasebno sporočilo", (await o.has("Juha je bila hladna")) && (await o.has(state.guest3)));

  // ── MARKETING: kampanja ──────────────────────────────────────────────────
  await sec("marketing");
  await o.click("Novo sporočilo", { sel: "button" }); await sleep(800);
  const mtx = (await o.text()).replace(/\s+/g, " ");
  const m = mtx.match(/dovolili: (\d+) od (\d+)/);
  check("kampanja: 1 od 2 gostov je dovolil ponudbe", m && m[1] === "1" && m[2] === "2", m?.[0]);
  await o.fill("Zadeva", "Ta petek domači njoki");
  await o.fill("Sporočilo", "Pridi v petek na domače njoke z žajbljem. Pokaži kupon in dobiš kavo zraven. Test A do Ž.");
  await o.fill("Kupon (neobvezno)", "Kava zraven");
  await o.shot("f06-kampanja", true);
  await o.click("Nadaljuj", { sel: "button", exact: true }); await sleep(1000);
  await o.shot("f07-kampanja-potrdi");
  await o.click("Pošlji zdaj", { sel: "button" });
  await o.page.waitForFunction(() => document.body.innerText.includes("Poslano:") || !!document.querySelector('p[role="status"].animate-pop-in'), { timeout: 60000 }).catch(() => {});
  await sleep(1000);
  const res1 = (await o.text()).match(/Poslano: \d+\.[^.]*\./)?.[0] ?? (await o.toast(2000));
  check("prva kampanja je poslana enemu gostu", /Poslano: 1\./.test(res1), res1);
  const { data: camp } = await db.from("email_log").select("customer_id").eq("venue_id", V).eq("kind", "campaign");
  check("kampanja je šla samo gostu z dovoljenjem", camp?.length === 1 && camp[0].customer_id === state.c3, JSON.stringify(camp));
  const { data: cc } = await db.from("redemptions").select("customer_id, rewards(name)").eq("venue_id", V);
  const kava = (cc ?? []).filter((x) => x.rewards?.name === "Kava zraven");
  check("kupon iz kampanje dobi samo prejemnik", kava.length === 1 && kava[0].customer_id === state.c3, JSON.stringify(kava));
  await o.shot("f08-kampanja-poslano", true);
  // druga in tretja kampanja (demo: 2 na teden, štejejo različne minute)
  await sleep(61000);
  await o.fill("Zadeva", "Druga novica"); await o.fill("Sporočilo", "Druga testna novica.");
  await o.click("Nadaljuj", { sel: "button", exact: true }); await sleep(800);
  await o.click("Pošlji zdaj", { sel: "button" }); await sleep(6000);
  note("druga kampanja", ((await o.text()).match(/Poslano: \d+\.[^.]*\./)?.[0]) ?? "");
  await sleep(61000);
  await o.fill("Zadeva", "Tretja novica"); await o.fill("Sporočilo", "Tretja testna novica.");
  await o.click("Nadaljuj", { sel: "button", exact: true }); await sleep(800);
  await o.click("Pošlji zdaj", { sel: "button" });
  t = await o.toast(20000);
  check("tretja kampanja v istem tednu je zavrnjena (demo)", t.includes("2 kampanji na teden"), t);
  await o.page.keyboard.press("Escape"); await sleep(500);
  await o.click("Dnevnik", { sel: "button" }); await sleep(800);
  await o.shot("f09-dnevnik", true);
  const log = (await o.text()).replace(/\s+/g, " ");
  check("dnevnik kaže dobrodošlico in kampanje", log.includes("Dobrodošlica") && log.includes("Sporočilo gostom"), log.slice(0, 300));

  // ── DEMO PAKET: povpraševanje za več lokalov ─────────────────────────────
  await sec("narocnina");
  await o.dump("demo paket");
  await o.click("+", { sel: "button", exact: true });
  await o.fill("Sporočilo (neobvezno)", "Imamo še en bistro v Krškem. Test A do Ž, prosim prezri.");
  await o.click("Pošlji povpraševanje", { sel: "button" });
  t = await o.toast();
  check("povpraševanje za več lokalov je oddano", t.length > 0 && !/ni bilo mogoče|Napaka/.test(t), t);
  const { data: lead } = await db.from("leads").select("id, email, heard, message, created_at").eq("email", state.owner);
  check("povpraševanje je v bazi (leads)", lead?.length === 1 && lead[0].heard === "veriga" && lead[0].message.includes("Število lokalov: 3"), JSON.stringify(lead));
  state.leadIds = (lead ?? []).map((l) => l.id); save();
  await o.toastGone();
  await o.click("Pošlji povpraševanje", { sel: "button" });
  t = await o.toast();
  check("drugo povpraševanje isti dan je zavrnjeno", t.includes("že poslal"), t);
  await o.shot("f10-demo-paket", true);

  // ── TELEFON: nadzorna plošča ─────────────────────────────────────────────
  await o.page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await sec("pregled"); await o.shot("f11-m-pregled", true);
  await o.click("Odpri meni", { sel: "button" }); await sleep(1300); await o.shot("f12-m-meni");
  await o.click("Gostje", { sel: "button", exact: true }); await sleep(1200); await o.shot("f13-m-gostje", true);
  await sec("nastavitve"); await o.shot("f14-m-nastavitve", true);
  await sec("marketing"); await o.shot("f15-m-marketing", true);
  const overflow = await o.page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  check("nadzorna plošča na telefonu nima vodoravnega drsenja", !overflow);
  // odjava lastnika
  await o.page.setViewport({ width: 1440, height: 900 });
  await sec("pregled");
  await o.click("Odjava", { sel: "button" });
  await o.page.waitForFunction(() => location.pathname === "/", { timeout: 60000 }).catch(() => {});
  await sleep(1500);
  const u = await o.go("/dashboard");
  check("po odjavi lastnika nadzorna plošča zahteva prijavo", u.startsWith("/partner"), u);
  if (o.errors.length) note("napake v konzoli (lastnik)", o.errors.join(" || "));
} finally {
  await o.close();
  summary();
}
