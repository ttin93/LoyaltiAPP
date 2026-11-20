// Ogrodje za preizkus od A do Ž na localhostu. Zažene se iz korena projekta.
// Prijava brez gesla: račun ustvari strežniški ključ, sejo dobimo z enkratno povezavo.
import fs from "fs"; import os from "os"; import path from "path";
import { createRequire } from "module";
import puppeteer from "puppeteer-core";
const require = createRequire(process.cwd() + "/");
const { createClient } = require("@supabase/supabase-js");
const { createServerClient } = require("@supabase/ssr");

export const DIR = import.meta.dirname;
export const SHOTS = path.join(DIR, "shots");
fs.mkdirSync(SHOTS, { recursive: true });
export const env = Object.fromEntries(fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; }));
export const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
export const BASE = process.env.BASE || "http://localhost:3000";
const exe = path.join(os.homedir(), ".cache/hyperframes/chrome/chrome-headless-shell/win64-152.0.7977.30/chrome-headless-shell-win64/chrome-headless-shell.exe");
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const STATE = path.join(DIR, "state.json");
export const state = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, "utf8")) : {};
export const save = () => fs.writeFileSync(STATE, JSON.stringify(state, null, 1));

// ── izidi ────────────────────────────────────────────────────────────────────
const RES = path.join(DIR, "results.jsonl");
let pass = 0, fail = 0;
export function check(name, ok, extra = "") {
  ok ? pass++ : fail++;
  const line = `${ok ? "OK  " : "FAIL"} ${name}${extra ? "  | " + String(extra).slice(0, 300) : ""}`;
  console.log(line);
  fs.appendFileSync(RES, JSON.stringify({ t: new Date().toISOString(), script: path.basename(process.argv[1]), ok: !!ok, name, extra: String(extra).slice(0, 400) }) + "\n");
  return !!ok;
}
export const note = (name, extra = "") => { console.log(`NOTE ${name}${extra ? "  | " + String(extra).slice(0, 400) : ""}`); fs.appendFileSync(RES, JSON.stringify({ t: new Date().toISOString(), script: path.basename(process.argv[1]), note: true, name, extra: String(extra).slice(0, 600) }) + "\n"); };
export const summary = () => console.log(`\n== ${path.basename(process.argv[1])}: uspešnih ${pass}, neuspešnih ${fail}`);

// ── računi ───────────────────────────────────────────────────────────────────
export async function ensureUser(email) {
  const { data, error } = await db.auth.admin.createUser({ email, email_confirm: true });
  if (!error) return data.user.id;
  // že obstaja: poišči ga
  for (let p = 1; p < 20; p++) {
    const { data: l } = await db.auth.admin.listUsers({ page: p, perPage: 200 });
    const u = l?.users?.find((x) => x.email === email);
    if (u) return u.id;
    if (!l?.users?.length) break;
  }
  throw new Error("createUser: " + error.message);
}
export async function cookiesFor(email) {
  const { data: link, error: le } = await db.auth.admin.generateLink({ type: "magiclink", email });
  if (le) throw new Error("generateLink: " + le.message);
  const jar = new Map();
  const ssr = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: { getAll: () => [...jar].map(([name, value]) => ({ name, value })), setAll: (list) => list.forEach((c) => (c.value ? jar.set(c.name, c.value) : jar.delete(c.name))) },
  });
  const { data: ver, error: ve } = await ssr.auth.verifyOtp({ token_hash: link.properties.hashed_token, type: "magiclink" });
  if (ve || !ver.user) throw new Error("verifyOtp: " + ve?.message);
  return [...jar].map(([name, value]) => ({ name, value, url: BASE }));
}

// ── fiskalna koda ────────────────────────────────────────────────────────────
export function receipt(dav, minutesAgo = 1) {
  let zoi = "1"; for (let k = 0; k < 38; k++) zoi += Math.floor(Math.random() * 10);
  const p = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Ljubljana", year: "2-digit", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).formatToParts(new Date(Date.now() - minutesAgo * 60000));
  const g = (t) => p.find((x) => x.type === t).value;
  const body = zoi + dav + g("year") + g("month") + g("day") + g("hour") + g("minute") + g("second");
  return body + (body.split("").reduce((a, c) => a + Number(c), 0) % 10);
}

// ── brskalnik ────────────────────────────────────────────────────────────────
/** profile: ime mape s piškotki (ostane med zagoni). email: če je podan in seje ni, se prijavi. */
export async function open(profile, { mobile = false, email = null, fresh = false, quiet = false } = {}) {
  const userDataDir = path.join(DIR, "profiles", profile);
  if (fresh) fs.rmSync(userDataDir, { recursive: true, force: true });
  const browser = await puppeteer.launch({ executablePath: exe, headless: "shell", userDataDir, args: ["--hide-scrollbars"] });
  const page = await browser.newPage();
  await page.setViewport(mobile ? { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { width: 1440, height: 900, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (e) => { errors.push("PAGEERROR " + e.message.slice(0, 300)); console.log("PAGEERROR", e.message.slice(0, 300)); });
  page.on("console", (m) => { if (m.type() === "error") { const t = m.text().slice(0, 300); if (/favicon|Download the React DevTools/.test(t)) return; errors.push("CONSOLE " + t); if (!quiet) console.log("CONSOLE", t); } });
  page.on("response", async (r) => {
    const u = r.url();
    if (u.startsWith(BASE) && r.status() >= 400 && !u.includes("/_next/")) console.log("HTTP", r.status(), r.request().method(), u.replace(BASE, "").slice(0, 120));
    if (u.includes("/api/") && u.startsWith(BASE)) { let b = ""; try { b = (await r.text()).slice(0, 260); } catch {} console.log("API", r.status(), u.replace(BASE, ""), b); }
  });
  if (email) {
    const has = (await page.cookies(BASE)).some((c) => c.name.includes("auth-token"));
    if (!has || fresh) await page.setCookie(...(await cookiesFor(email)));
  }
  const clean = () => page.evaluate(() => document.querySelectorAll("nextjs-portal").forEach((n) => n.remove())).catch(() => {});
  const go = async (p, wait = 1500) => { await page.goto(p.startsWith("http") ? p : BASE + p, { waitUntil: "domcontentloaded", timeout: 120000 }); await page.waitForNetworkIdle({ idleTime: 600, timeout: 60000 }).catch(() => {}); await sleep(wait); return page.url().replace(BASE, ""); };
  const shot = async (n, full = false) => { await clean(); await page.screenshot({ path: path.join(SHOTS, `${n}.png`), fullPage: full }); };
  /** Klik po vidnem besedilu ali aria-label; najprej v zadnjem odprtem dialogu. */
  const click = async (text, { sel = "button, a, [role=button], [role=radio], [role=switch], label", exact = false, nth = 0 } = {}) => {
    const ok = await page.evaluate((t, s, ex, n) => {
      const dialogs = [...document.querySelectorAll('[role="dialog"]')].filter((d) => d.offsetParent !== null || getComputedStyle(d).position === "fixed");
      const roots = dialogs.length ? [dialogs[dialogs.length - 1], document] : [document];
      for (const root of roots) {
        const els = [...root.querySelectorAll(s)].filter((e) => {
          const r = e.getBoundingClientRect(); if (!r.width || !r.height) return false;
          if (getComputedStyle(e).visibility === "hidden") return false;
          const txt = (e.textContent || "").replace(/\s+/g, " ").trim(); const al = e.getAttribute("aria-label") || "";
          return ex ? txt === t || al === t : txt.includes(t) || al.includes(t);
        });
        const el = els[n];
        if (el) { if (el.disabled) return "disabled"; el.scrollIntoView({ block: "center" }); setTimeout(() => el.click(), 0); return "ok"; }
      }
      return "none";
    }, text, sel, exact, nth).catch(() => "ok");
    if (ok !== "ok") console.log(`!! klik "${text}": ${ok}`);
    await sleep(350);
    return ok === "ok";
  };
  /** Polje poišče po oznaki (Field), aria-label ali placeholderju; počisti in vtipka. */
  const fill = async (label, value, { nth = 0 } = {}) => {
    const h = await page.evaluateHandle((l, n) => {
      const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      const out = [];
      for (const lab of document.querySelectorAll("label")) {
        const sp = lab.querySelector(":scope > span"); const t = (sp?.textContent || "").trim();
        if (t === l) { const f = lab.querySelector("input:not([type=hidden]), textarea, select"); if (f && vis(f)) out.push(f); }
      }
      for (const f of document.querySelectorAll("input:not([type=hidden]), textarea, select")) if ((f.getAttribute("aria-label") === l || f.getAttribute("placeholder") === l) && vis(f) && !out.includes(f)) out.push(f);
      return out[n] || null;
    }, label, nth);
    const el = h.asElement();
    if (!el) { console.log(`!! polje "${label}" ni najdeno`); return false; }
    const tag = await el.evaluate((e) => e.tagName);
    if (tag === "SELECT") { await el.select(String(value)); await sleep(150); return true; }
    await el.evaluate((e) => e.scrollIntoView({ block: "center" }));
    await el.click({ clickCount: 3 }).catch(() => {});
    await el.focus();
    await page.keyboard.down("Control"); await page.keyboard.press("KeyA"); await page.keyboard.up("Control");
    await page.keyboard.press("Backspace");
    if (String(value).length) await el.type(String(value), { delay: 2 });
    await sleep(120);
    return true;
  };
  const val = (label, nth = 0) => page.evaluate((l, n) => {
    const out = [];
    for (const lab of document.querySelectorAll("label")) { const sp = lab.querySelector(":scope > span"); if ((sp?.textContent || "").trim() === l) { const f = lab.querySelector("input:not([type=hidden]), textarea, select"); if (f) out.push(f); } }
    for (const f of document.querySelectorAll("input:not([type=hidden]), textarea, select")) if ((f.getAttribute("aria-label") === l || f.getAttribute("placeholder") === l) && !out.includes(f)) out.push(f);
    return out[n] ? out[n].value : null;
  }, label, nth);
  /** Počaka na obvestilo (toast) in ga vrne. */
  const toast = async (ms = 9000) => {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      const t = await page.evaluate(() => [...document.querySelectorAll('p[role="status"].animate-pop-in')].map((e) => e.textContent.trim()).pop() || "").catch(() => "");
      if (t) { console.log("TOAST:", t); return t; }
      await sleep(200);
    }
    console.log("TOAST: (ni)"); return "";
  };
  const toastGone = async () => { const t0 = Date.now(); while (Date.now() - t0 < 6000) { const t = await page.evaluate(() => !!document.querySelector('p[role="status"].animate-pop-in')).catch(() => false); if (!t) return; await sleep(200); } };
  const text = () => page.evaluate(() => (document.querySelector("main") || document.body).innerText).catch(() => "");
  const has = async (t) => (await page.evaluate(() => document.body.innerText).catch(() => "")).includes(t);
  /** Kratek popis strani: naslovi, opozorila, gumbi, polja. */
  const dump = async (label = "") => {
    const d = await page.evaluate(() => {
      const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== "hidden"; };
      const tx = (e) => (e.textContent || "").replace(/\s+/g, " ").trim().slice(0, 90);
      return {
        url: location.pathname + location.search,
        h: [...document.querySelectorAll("h1, h2, h3")].filter(vis).map((e) => `${e.tagName}:${tx(e)}`),
        alerts: [...document.querySelectorAll('[role="alert"], [role="status"]')].filter(vis).map(tx).filter(Boolean),
        dialogs: [...document.querySelectorAll('[role="dialog"]')].filter(vis).map((e) => e.getAttribute("aria-label") || tx(e).slice(0, 60)),
        buttons: [...document.querySelectorAll("button, [role=button]")].filter(vis).map((e) => `${e.disabled ? "(x)" : ""}${tx(e) || "[" + (e.getAttribute("aria-label") || "") + "]"}${e.getAttribute("aria-checked") ? "=" + e.getAttribute("aria-checked") : ""}${e.getAttribute("aria-pressed") === "true" ? "*" : ""}`),
        fields: [...document.querySelectorAll("input:not([type=hidden]), textarea, select")].filter((e) => vis(e) || e.type === "file").map((e) => { const lab = e.closest("label")?.querySelector(":scope > span")?.textContent?.trim() || e.getAttribute("aria-label") || e.getAttribute("placeholder") || e.name || "?"; return `${lab}[${e.type || e.tagName.toLowerCase()}]=${String(e.value).slice(0, 50)}`; }),
        links: [...document.querySelectorAll("a[href]")].filter(vis).map((e) => `${tx(e).slice(0, 40)}→${e.getAttribute("href").slice(0, 70)}`),
      };
    }).catch((e) => ({ err: String(e) }));
    console.log(`\n--- ${label} ${d.url || ""}`);
    for (const k of ["h", "alerts", "dialogs", "buttons", "fields", "links"]) if (d[k]?.length) console.log(` ${k}: ${d[k].join(" | ")}`);
    if (d.err) console.log(d.err);
    return d;
  };
  const post = (url, body) => page.evaluate(async (u, b) => { const r = await fetch(u, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) }); let j = {}; try { j = await r.json(); } catch {} return { status: r.status, ...j }; }, url, body);
  return { browser, page, errors, go, shot, click, fill, val, toast, toastGone, text, has, dump, post, clean, close: () => browser.close() };
}

export const venueRow = async () => (await db.from("venues").select("*").eq("id", state.venueId).single()).data;
export const metaOf = (v) => v?.automations?.__v2 ?? {};
