// Posnetki za sekcijo »Funkcije« na strani za lokale → public/screens/{ocena,sporocilo,kampanja}.webp
import puppeteer from "puppeteer-core";
import os from "os"; import path from "path"; import fs from "fs";
import { execFileSync } from "child_process";
const root = "C:/Users/YouN/Documents/Ai Projekti/Loyalti App";
const exe = path.join(os.homedir(), ".cache/hyperframes/chrome/chrome-headless-shell/win64-152.0.7977.30/chrome-headless-shell-win64/chrome-headless-shell.exe");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = path.join(root, "public/screens");
const browser = await puppeteer.launch({ executablePath: exe, headless: "shell", args: ["--hide-scrollbars"] });
const page = await browser.newPage();
page.on("pageerror", (e) => console.log("PAGEERROR", e.message.slice(0, 200)));
const clean = () => page.evaluate(() => document.querySelectorAll("nextjs-portal").forEach((n) => n.remove()));

// telefon: ocena obiska
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.goto("http://localhost:3000/predstavitev/ocena", { waitUntil: "domcontentloaded", timeout: 90000 }); await sleep(4000); await clean();
await page.screenshot({ path: path.join(out, "ocena.png") }); console.log("shot ocena");

// telefon: samodejno sporočilo za rojstni dan
await page.goto("http://localhost:3000/api/email-preview?type=birthday_guest&venue=Kavarna%20Lipa&color=%231F8BF5", { waitUntil: "domcontentloaded", timeout: 90000 }); await sleep(2500);
await page.screenshot({ path: path.join(out, "sporocilo.png") }); console.log("shot sporocilo");

// namizje: obrazec za novo sporočilo (kampanja), izrez same kartice v razmerju 5:4
await page.setViewport({ width: 1100, height: 1000, deviceScaleFactor: 2 });
await page.goto("http://localhost:3000/predstavitev/plosca-marketing", { waitUntil: "domcontentloaded", timeout: 90000 }); await sleep(4500);
await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Novo sporočilo")?.click());
await sleep(1200);
const box = await page.evaluate(() => {
  const set = (el, v) => {
    const proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : el.tagName === "SELECT" ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(el, v);
    el.dispatchEvent(new Event(el.tagName === "SELECT" ? "change" : "input", { bubbles: true }));
  };
  const sel = document.querySelector("main select"); if (sel) set(sel, "inactive");
  const inputs = [...document.querySelectorAll("main input")].filter((i) => i.type !== "file" && !i.disabled);
  if (inputs[0]) set(inputs[0], "V soboto odpiramo teraso");
  const ta = document.querySelector("main textarea"); if (ta) set(ta, ["Od sobote naprej nas najdeš tudi zunaj.", "", "Prvi dan vse limonade postrežemo s presenečenjem. Pridi, veseli te bomo."].join(String.fromCharCode(10)));
  if (inputs[1]) set(inputs[1], "Brezplačna limonada");
  const h = [...document.querySelectorAll("main h2, main h3")].find((e) => e.textContent.trim() === "Novo sporočilo");
  let el = h; while (el && !String(el.className).includes("rounded-3xl")) el = el.parentElement;
  window.scrollTo(0, 0);
  const r = (el || document.querySelector("main")).getBoundingClientRect();
  return { x: r.x, y: r.y + window.scrollY, width: r.width, height: r.height };
});
await sleep(800); await clean();
console.log("kartica", JSON.stringify(box));
await page.screenshot({ path: path.join(out, "kampanja.png"), clip: { x: box.x, y: box.y, width: box.width, height: Math.round(box.width * 0.8) } }); console.log("shot kampanja");
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
