// uporaba: node snap.mjs <url> <ime> [w=1440] [h=900] [--full] [--sel=#id ...]
// brez --sel: en posnetek vidnega zaslona; z --full: cela stran (hero ostane visok kot okno)
import puppeteer from "puppeteer-core";
import os from "os"; import path from "path";
const [url, name, w = "1440", h = "900", ...rest] = process.argv.slice(2);
const exe = path.join(os.homedir(), ".cache/hyperframes/chrome/chrome-headless-shell/win64-152.0.7977.30/chrome-headless-shell-win64/chrome-headless-shell.exe");
const out = (n) => path.join(import.meta.dirname, "shots", `${n}.png`);
const browser = await puppeteer.launch({ executablePath: exe, headless: "shell", args: ["--hide-scrollbars"] });
const page = await browser.newPage();
await page.setViewport({ width: +w, height: +h, deviceScaleFactor: 1, isMobile: +w < 600, hasTouch: +w < 600 });
page.on("pageerror", (e) => console.log("PAGEERROR", e.message));
page.on("console", (m) => { if (m.type() === "error") console.log("CONSOLE", m.text().slice(0, 300)); });
await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
await new Promise((r) => setTimeout(r, 1200));
const sels = rest.filter((a) => a.startsWith("--sel=")).map((a) => a.slice(6));
if (rest.includes("--full")) {
  // počasi podrsaj do dna, da se sprožijo vsi vstopi, nato zajemi celo stran
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += Math.round(+h * 0.6)) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await new Promise((r) => setTimeout(r, 350)); }
  await page.evaluate(() => window.scrollTo(0, 0)); await new Promise((r) => setTimeout(r, 900));
  await page.screenshot({ path: out(name), fullPage: true });
  console.log("saved", name, "height", total);
} else if (sels.length) {
  for (const s of sels) {
    await page.evaluate((sel) => document.querySelector(sel)?.scrollIntoView({ block: "start" }), s);
    await new Promise((r) => setTimeout(r, 1500));
    const n = `${name}-${s.replace(/[^a-z0-9]/gi, "")}`;
    await page.screenshot({ path: out(n) }); console.log("saved", n);
  }
} else { await page.screenshot({ path: out(name) }); console.log("saved", name); }
await browser.close();
