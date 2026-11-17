// Slika za deljenje 1200 × 630 z novim logotipom. node og.mjs
import puppeteer from "puppeteer-core";
import os from "os"; import path from "path"; import fs from "fs";
const root = "C:/Users/YouN/Documents/Ai Projekti/Loyalti App";
const BASE = "http://localhost:3000";
const exe = path.join(os.homedir(), ".cache/hyperframes/chrome/chrome-headless-shell/win64-152.0.7977.30/chrome-headless-shell-win64/chrome-headless-shell.exe");
const browser = await puppeteer.launch({ executablePath: exe, headless: "shell", args: ["--hide-scrollbars"] });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
const ph = (n, css) => `<div style="position:absolute;overflow:hidden;background:#0f7ae6;${css}"><img src="${BASE}/photos/${n}.jpg" style="width:100%;height:100%;object-fit:cover"></div>`;
await page.setContent(`<html><head><link href="https://fonts.googleapis.com/css2?family=Anton&family=Outfit:wght@700&display=block" rel="stylesheet"><style>
  body{margin:0;width:1200px;height:630px;background:#1F8BF5;color:#fff;font-family:Arial,sans-serif;position:relative;overflow:hidden}
  h1{font-family:'Anton',sans-serif;font-weight:400;text-transform:uppercase;font-size:132px;line-height:1.14;margin:0}
  .logo{display:flex;align-items:center;gap:16px;font-family:'Outfit',sans-serif;font-size:52px;font-weight:700;letter-spacing:-0.02em;line-height:1}
  .i{position:relative;display:inline-block}.i b{position:absolute;left:50%;top:0.09em;width:0.28em;height:0.28em;border-radius:50%;background:#E63F26;transform:translateX(-50%)}
  </style></head><body>
  <div style="position:absolute;left:72px;top:56px" class="logo">loyav<span class="i">ı<b></b></span></div>
  <div style="position:absolute;left:72px;top:176px"><h1>Žigi, ki se<br>ne izgubijo.</h1></div>
  <div style="position:absolute;left:72px;bottom:64px;font-size:32px;font-weight:700">Vse kartice zvestobe v telefonu.</div>
  ${ph("iced", "right:232px;bottom:0;width:232px;height:420px;border-radius:116px 116px 0 0")}
  ${ph("barista", "right:40px;top:96px;width:168px;height:168px;border-radius:50%")}
  ${ph("friends", "right:40px;bottom:0;width:168px;height:300px;border-radius:32px 32px 0 0")}
  </body></html>`, { waitUntil: "networkidle0" });
await page.evaluate(() => document.fonts.ready); await new Promise((r) => setTimeout(r, 800));
await page.screenshot({ path: path.join(root, "app/opengraph-image.png") });
fs.copyFileSync(path.join(root, "app/opengraph-image.png"), path.join(root, "app/twitter-image.png"));
await browser.close(); console.log("og ok");
