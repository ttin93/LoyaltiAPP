// Korak 2b: kartica (ponovno, pravi gumb) + ali shranjevanje strani povozi naloženi meni.
import path from "path";
import { open, check, note, summary, state, db, sleep, venueRow, metaOf, DIR } from "./lib.mjs";
const V = state.venueId;
const o = await open("owner", { email: state.owner });
const sec = (s) => o.go(`/dashboard?v=${V}&s=${s}`, 1200);
try {
  await sec("kartica");
  await o.click("Barva #E63F26", { sel: "button" });
  await o.click("Več", { sel: "button", exact: true }); // 5 → 6
  await o.fill("Nagrada za polno kartico", "Brezplačno kosilo dneva");
  await o.click("Shrani kartico", { sel: "button" });
  let t = await o.toast();
  check("kartica: obvestilo", t.includes("shranjena"), t);
  let v = await venueRow();
  const { data: rw } = await db.from("rewards").select("name, points_required").eq("venue_id", V).eq("kind", "stamp");
  check("kartica je v bazi (6 žigov, rdeča, logotip)", v.stamp_goal === 6 && v.brand_color?.toLowerCase() === "#e63f26" && !!v.logo_url && rw?.[0]?.points_required === 6, JSON.stringify({ goal: v.stamp_goal, color: v.brand_color, logo: !!v.logo_url, rw }));
  await sleep(1500);
  await o.shot("c03-kartica", true);
  // prazna nagrada
  await o.fill("Nagrada za polno kartico", "");
  const dis = await o.page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Shrani kartico"))?.disabled);
  check("prazna nagrada: gumb onemogočen", dis === true);

  // meni: naloži PDF, nato brez osvežitve shrani stran lokala (npr. popravi slogan)
  await sec("nastavitve");
  const pdfUrl = metaOf(await venueRow()).menuUrl;
  note("meni pred preizkusom", pdfUrl);
  await o.fill("Kratek slogan", "Kosilo kot pri mami, kava kot v Trstu");
  await o.click("Shrani stran lokala", { sel: "button" });
  t = await o.toast();
  const after = metaOf(await venueRow()).menuUrl;
  check("shranjevanje strani ne povozi naloženega menija (stran odprta po nalaganju)", after === pdfUrl, after);
  // isti primer brez osvežitve: naloži in takoj shrani
  await o.toastGone();
  const el = await o.page.$('input[type=file][aria-label="Naloži meni"]');
  await el.uploadFile(path.join(DIR, "files", "meni.pdf"));
  t = await o.toast(30000);
  const uploaded = metaOf(await venueRow()).menuUrl;
  await o.toastGone();
  await o.fill("Kratek slogan", "Kosilo kot pri mami, kava kot v Trstu.");
  await o.click("Shrani stran lokala", { sel: "button" });
  t = await o.toast();
  const after2 = metaOf(await venueRow()).menuUrl;
  check("naloži meni in takoj shrani stran: meni ostane PDF", after2 === uploaded, `naloženo ${uploaded.slice(-30)} → po shranjevanju ${after2}`);
} finally {
  await o.close();
  summary();
}
