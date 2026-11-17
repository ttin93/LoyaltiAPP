// Posnetki gostove aplikacije s testnim računom: node gshots.mjs <prefix> <pot1,pot2> [desktop]
import puppeteer from "puppeteer-core";
import os from "os"; import path from "path"; import fs from "fs";
const BASE = "http://localhost:3000";
const [prefix = "g3", list = "/app", mode = "both"] = process.argv.slice(2);
const exe = path.join(os.homedir(), ".cache/hyperframes/chrome/chrome-headless-shell/win64-152.0.7977.30/chrome-headless-shell-win64/chrome-headless-shell.exe");
const cred = fs.readFileSync("C:/Users/YouN/Documents/Ai Projekti/Loyalti App/docs/TESTNI-RACUN.local.md", "utf8");
const email = cred.match(/Elektronski naslov: (\S+)/)[1], pass = cred.match(/Geslo: (\S+)/)[1];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: exe, headless: "shell", args: ["--hide-scrollbars"] });
const page = await browser.newPage();
page.on("pageerror", (e) => console.log("PAGEERROR", e.message.slice(0, 200)));
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.goto(BASE + "/prijava?next=/app", { waitUntil: "domcontentloaded", timeout: 90000 }); await sleep(2500);
await page.type('input[type="email"]', email); await page.type('input[type="password"]', pass);
await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Nadaljuj"))?.click());
await page.waitForFunction(() => location.pathname === "/app", { timeout: 90000 }); await sleep(1500);
for (const u of list.split(",")) {
  const n = u.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home";
  if (mode !== "desktop") { await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); await page.goto(BASE + u, { waitUntil: "domcontentloaded", timeout: 90000 }); await sleep(3500); await page.screenshot({ path: path.join(import.meta.dirname, "shots", `${prefix}-m-${n}.png`), fullPage: true }); console.log("shot m", n); }
  if (mode !== "mobile") { await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 }); await page.goto(BASE + u, { waitUntil: "domcontentloaded", timeout: 90000 }); await sleep(3500); await page.screenshot({ path: path.join(import.meta.dirname, "shots", `${prefix}-d-${n}.png`), fullPage: true }); console.log("shot d", n); }
}
await browser.close();
