// Posnetki predstavitvenih zaslonov za pristajalno stran → public/screens/*.webp
import puppeteer from "puppeteer-core";
import os from "os"; import path from "path"; import fs from "fs";
import { execFileSync } from "child_process";
const root = "C:/Users/YouN/Documents/Ai Projekti/Loyalti App";
const exe = path.join(os.homedir(), ".cache/hyperframes/chrome/chrome-headless-shell/win64-152.0.7977.30/chrome-headless-shell-win64/chrome-headless-shell.exe");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = path.join(root, "public/screens"); fs.mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: exe, headless: "shell", args: ["--hide-scrollbars"] });
const page = await browser.newPage();
page.on("pageerror", (e) => console.log("PAGEERROR", e.message.slice(0, 200)));
const only = process.argv[2] ? process.argv[2].split(",") : ["denarnica", "lokal", "kupon", "kolo", "zig", "lokali"];
for (const s of only) {
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(`http://localhost:3000/predstavitev/${s}`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await sleep(s === "kupon" ? 5000 : 3500);
  // skrij razvojno značko Next.js
  await page.evaluate(() => document.querySelectorAll("nextjs-portal").forEach((n) => n.remove()));
  await page.screenshot({ path: path.join(out, `${s}.png`) });
  console.log("shot", s);
}
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto("http://localhost:3000/predstavitev/denarnica", { waitUntil: "domcontentloaded", timeout: 90000 }); await sleep(3500);
await page.evaluate(() => { document.querySelectorAll("nextjs-portal").forEach((n) => n.remove()); document.querySelector("nav[aria-hidden]")?.remove(); });
await page.screenshot({ path: path.join(out, "denarnica-namizje.png") });
for (const s of ["plosca", "plosca-gostje"]) {
  await page.goto(`http://localhost:3000/predstavitev/${s}`, { waitUntil: "domcontentloaded", timeout: 90000 }); await sleep(4000);
  await page.evaluate(() => document.querySelectorAll("nextjs-portal").forEach((n) => n.remove()));
  await page.screenshot({ path: path.join(out, `${s}.png`) }); console.log("shot", s);
}
await browser.close();
execFileSync("python", ["-P", "-c", `
import os
from PIL import Image
d = r"${out}"
for f in os.listdir(d):
    if f.endswith(".png"):
        im = Image.open(os.path.join(d, f)).convert("RGB")
        im.save(os.path.join(d, f[:-4] + ".webp"), "WEBP", quality=88, method=6)
        os.remove(os.path.join(d, f))
        print(f[:-4], im.size, os.path.getsize(os.path.join(d, f[:-4] + ".webp")) // 1024, "KB")
`], { stdio: "inherit" });
