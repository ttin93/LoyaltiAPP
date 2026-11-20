// Korak 4: gost 2 sprejme samo obvezno (brez ponudb), gost 4 zavrne pogoje (račun se izbriše),
// stojalo brez piškotka, profil gosta 3 (ime, rojstni dan), odjava s podpisano povezavo.
import crypto from "crypto";
import { open, check, note, summary, state, save, db, env, sleep, receipt } from "./lib.mjs";
const code = state.code, dav = state.dav;

// ── gost 2: samo obvezno ──────────────────────────────────────────────────
const g = await open("guest2", { mobile: true, email: state.guest2, fresh: true });
try {
  let url = await g.go(`/p/${code}`, 3000);
  check("obstoječ račun brez pogojev: stran lokala preusmeri na soglasja", url.startsWith("/prijava/soglasje"), url);
  await g.page.evaluate(() => document.querySelectorAll("label")[0].click());
  await g.click("Potrdi in nadaljuj", { sel: "button" });
  await g.page.waitForFunction((c) => location.pathname === `/p/${c}`, { timeout: 90000 }, code).catch(() => {});
  await sleep(3500);
  await g.dump("gost 2 po soglasju");
  check("gost brez kartice vidi Dodaj kartico v denarnico", await g.has("Dodaj kartico v denarnico"));
  const direct = await g.post("/api/checkin", { venueCode: code });
  check("žig s stojala brez skeniranja stojala je zavrnjen", !direct.ok, JSON.stringify(direct));
  await g.click("Dodaj kartico v denarnico", { sel: "button" });
  await sleep(4000);
  await g.click("Zapri", { sel: "button" }); await sleep(500); // kolo pustimo za pozneje
  const { data: c2 } = await db.from("customers").select("id, stamps").eq("venue_id", state.venueId).eq("email", state.guest2).maybeSingle();
  check("gost 2 ima kartico", !!c2, JSON.stringify(c2));
  state.c2 = c2?.id; save();
  const { data: rows } = await db.from("email_log").select("kind").eq("customer_id", c2?.id ?? "-").in("kind", ["marketing_optin", "unsubscribe"]);
  check("brez dovoljenja ni zapisa marketing_optin", (rows ?? []).every((r) => r.kind !== "marketing_optin"), JSON.stringify(rows));
  const r = await g.post("/api/scan", { venueCode: code, payload: receipt(dav, 4) });
  check("gost 2 dobi žig z računom", r.ok === true, JSON.stringify(r));
} finally { await g.close(); }

// ── gost 4: zavrne pogoje → račun se izbriše ─────────────────────────────
state.guest4 = `delivered+az-gost4-${state.stamp}@resend.dev`; save();
const d = await open("guest4", { mobile: true, fresh: true });
try {
  await d.go(`/prijava?next=${encodeURIComponent("/app")}`);
  await d.fill("Elektronski naslov", state.guest4);
  await d.fill("Geslo", crypto.randomBytes(9).toString("base64url"));
  await d.click("Nadaljuj", { sel: "button" });
  await d.page.waitForFunction(() => location.pathname.startsWith("/prijava/soglasje"), { timeout: 90000 }).catch(() => {});
  await sleep(2500);
  check("gost 4 pride na soglasja", d.page.url().includes("/prijava/soglasje"), d.page.url());
  await d.click("Ne strinjam se, odjavi me", { sel: "button" });
  await d.page.waitForFunction(() => location.pathname === "/", { timeout: 60000 }).catch(() => {});
  await sleep(3000);
  check("zavrnitev odjavi in vrne na naslovnico", new URL(d.page.url()).pathname === "/", d.page.url());
  let gone = true;
  for (let p = 1; p < 30; p++) { const { data: l } = await db.auth.admin.listUsers({ page: p, perPage: 200 }); if (!l?.users?.length) break; if (l.users.some((u) => u.email === state.guest4)) { gone = false; break; } }
  check("prazen račun po zavrnitvi je izbrisan", gone);
  const url = await d.go("/app");
  check("po zavrnitvi denarnica zahteva prijavo", url.startsWith("/prijava"), url);
} finally { await d.close(); }

// ── gost 3: profil in odjava ──────────────────────────────────────────────
const p = await open("guest3", { mobile: true });
try {
  await p.go("/app/profil", 2000);
  await p.fill("Ime", "Ana Testna");
  await p.click("Shrani ime", { sel: "button" });
  await sleep(2500);
  await p.fill("Dan", "21"); await p.fill("Mesec", "11");
  await p.click("Shrani rojstni dan", { sel: "button" });
  await sleep(2500);
  await p.go("/app/profil", 2000);
  const vals = { ime: await p.val("Ime"), dan: await p.val("Dan"), mesec: await p.val("Mesec") };
  check("ime in rojstni dan ostaneta po osvežitvi", vals.ime === "Ana Testna" && vals.dan === "21" && vals.mesec === "11", JSON.stringify(vals));
  await p.shot("e01-profil", true);
  const { data: c3 } = await db.from("customers").select("id, birthday, name").eq("venue_id", state.venueId).eq("email", state.guest3).maybeSingle();
  note("kartica gosta 3 v bazi", JSON.stringify(c3));
  state.c3 = c3.id; save();

  // podpisana povezava za odjavo (enako kot v sporočilu)
  const secret = crypto.createHmac("sha256", env.SUPABASE_SERVICE_ROLE_KEY).update("loyavi-unsub-v1").digest("hex");
  const tok = crypto.createHmac("sha256", secret).update(c3.id).digest("hex").slice(0, 32);
  const bad = await p.go(`/odjava?c=${c3.id}&t=${"0".repeat(32)}`);
  check("odjava z napačnim podpisom ne deluje", !(await p.has("Ponudb ne prejemaš")), await p.text().then((t) => t.slice(0, 120)));
  await p.go(`/odjava?c=${c3.id}&t=${tok}`, 2000);
  await p.dump("odjava");
  await p.shot("e02-odjava");
  note("odjava stran", (await p.text()).replace(/\s+/g, " ").slice(0, 300));
} finally {
  await p.close();
  summary();
}
