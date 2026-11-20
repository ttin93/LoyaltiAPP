// Korak 8: preverba popravkov.
import path from "path";
import { open, check, note, summary, state, sleep, venueRow, metaOf, DIR } from "./lib.mjs";
const V = state.venueId;
const o = await open("owner", { email: state.owner });
try {
  await o.go(`/dashboard?v=${V}&s=nastavitve`, 1500);
  await o.fill("Meni ali cenik", "");
  const el = await o.page.$('input[type=file][aria-label="Naloži meni"]');
  await el.uploadFile(path.join(DIR, "files", "meni.pdf"));
  let t = await o.toast(30000);
  const uploaded = metaOf(await venueRow()).menuUrl;
  await sleep(1500);
  check("po nalaganju polje pokaže naloženi meni", (await o.val("Meni ali cenik")) === uploaded, await o.val("Meni ali cenik"));
  await o.toastGone();
  await o.fill("Kratek slogan", "Kosilo kot pri mami, kava kot v Trstu.");
  await o.click("Shrani stran lokala", { sel: "button" });
  t = await o.toast();
  check("naloži meni, nato shrani stran: meni ostane", metaOf(await venueRow()).menuUrl === uploaded, metaOf(await venueRow()).menuUrl.slice(-40));
  await o.go(`/dashboard?v=${V}&s=pregled`, 2500);
  const dup = o.errors.filter((e) => e.includes("same key"));
  check("graf obiskov brez podvojenih dni", dup.length === 0, dup.join(" ").slice(0, 120));
  const days = await o.page.evaluate(() => [...document.querySelectorAll("[data-day], [title]")].length);
  note("elementi grafa", days);
} finally { await o.close(); }

const g = await open("guest2", { mobile: true, email: state.guest2 });
try {
  await g.go(`/p/${state.code}`, 2500);
  const lines = await g.page.evaluate(() => { const s = [...document.querySelectorAll("button span")].find((e) => e.textContent === "Kava za potrpežljivost"); if (!s) return null; const lh = parseFloat(getComputedStyle(s).lineHeight); return { h: s.getBoundingClientRect().height, lh, overflow: s.scrollHeight > s.clientHeight + 1 }; });
  check("ime kupona se ne odreže", lines && !lines.overflow, JSON.stringify(lines));
  await g.page.evaluate(() => [...document.querySelectorAll("h2")].find((h) => h.textContent === "Kuponi")?.scrollIntoView({ block: "start" }));
  await sleep(500);
  await g.shot("i01-kupon-ime");
} finally { await g.close(); summary(); }
