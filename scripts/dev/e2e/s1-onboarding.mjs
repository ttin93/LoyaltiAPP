// Korak 1: nov lastnik (prijavljen, brez lokala) gre skozi čarovnik in ustvari lokal.
import { open, check, note, summary, state, save, db, sleep } from "./lib.mjs";

const o = await open("owner", { email: state.owner, fresh: true });
try {
  let url = await o.go("/partner");
  check("prijavljen lastnik brez lokala vidi čarovnik", await o.has("Predstavi svoj lokal"), url);
  await o.shot("b01-carovnik-1");
  // brez imena ne gre naprej
  const nextDisabled = await o.page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Naprej"))?.disabled);
  check("brez imena je gumb Naprej onemogočen", nextDisabled === true);

  await o.fill("Ime lokala", "Bistro Pod Lipo AZ");
  await o.fill("Vrsta lokala", "bistro").catch(() => {});
  const cats = await o.page.evaluate(() => [...document.querySelectorAll("select option")].map((x) => x.value));
  note("vrste lokala", cats.join(","));
  if (!cats.includes("bistro")) await o.fill("Vrsta lokala", cats.includes("restavracija") ? "restavracija" : cats[1]);
  await o.fill("Kraj", "Novo mesto");
  await o.click("Naprej", { sel: "button" });
  await sleep(600);
  check("drugi korak: oblikuj kartico", await o.has("Oblikuj kartico"));
  await o.click("Barva #18B56B", { sel: "button" });
  for (let i = 0; i < 4; i++) await o.click("Manj", { sel: "button" }); // 8 → 4 (spodnja meja)
  const goalShown = await o.page.evaluate(() => document.querySelector('[aria-live="polite"]')?.textContent);
  check("spodnja meja žigov je 4", goalShown === "4", goalShown);
  await o.click("Več", { sel: "button" }); // 5
  await o.fill("Nagrada za polno kartico", "Brezplačno kosilo dneva");
  await sleep(300);
  await o.shot("b02-carovnik-2");
  const preview = await o.text();
  check("predogled kartice kaže ime in nagrado", preview.includes("Bistro Pod Lipo AZ") && preview.includes("Brezplačno kosilo dneva"));
  await o.click("Naprej", { sel: "button" });
  await sleep(600);
  check("tretji korak: način beleženja", await o.has("Kako gostje zabeležijo obisk"));
  await o.click("Oboje", { sel: "[role=radio]" });
  await o.shot("b03-carovnik-3");
  // nazaj in naprej ohrani vnos
  await o.click("Nazaj", { sel: "button" }); await sleep(400);
  check("korak nazaj ohrani nagrado", (await o.val("Nagrada za polno kartico")) === "Brezplačno kosilo dneva");
  await o.click("Naprej", { sel: "button" }); await sleep(400);
  await o.click("Ustvari lokal", { sel: "button" });
  await o.page.waitForFunction(() => location.pathname === "/dashboard", { timeout: 120000 });
  await o.page.waitForNetworkIdle({ idleTime: 800, timeout: 60000 }).catch(() => {});
  await sleep(2000);
  const u = new URL(o.page.url());
  state.venueId = u.searchParams.get("v");
  save();
  check("po ustvarjanju pristane v nadzorni plošči z ?novo=1", !!state.venueId && u.searchParams.get("novo") === "1", o.page.url());
  await o.dump("pregled po ustvarjanju");
  await o.shot("b04-pregled-novo", true);

  const { data: v } = await db.from("venues").select("*").eq("id", state.venueId).single();
  const { data: rw } = await db.from("rewards").select("name, points_required, kind").eq("venue_id", state.venueId);
  state.code = v.public_code; save();
  check("lokal je v bazi s pravimi podatki", v.name === "Bistro Pod Lipo AZ" && v.city === "Novo mesto" && v.stamp_goal === 5 && v.brand_color?.toLowerCase() === "#18b56b", JSON.stringify({ name: v.name, city: v.city, goal: v.stamp_goal, color: v.brand_color, type: v.venue_type }));
  check("nagrada je v bazi", rw?.length === 1 && rw[0].name === "Brezplačno kosilo dneva" && rw[0].points_required === 5, JSON.stringify(rw));
  check("način beleženja je Oboje in ključ stojala obstaja", v.automations?.__v2?.checkin === "both" && !!v.automations?.__v2?.standKey, JSON.stringify(v.automations?.__v2));
  note("javna koda lokala", v.public_code);
  note("lokal je privzeto v imeniku", String(v.automations?.__v2?.listed));

  // drugi lokal v demu ni mogoč
  url = await o.go("/partner?new=1");
  check("drugi lokal v demu preusmeri na Demo paket", url.includes("/dashboard") && url.includes("narocnina"), url);
  await o.dump("demo paket");
  await o.shot("b05-demo-paket", true);
} finally {
  await o.close();
  summary();
}
