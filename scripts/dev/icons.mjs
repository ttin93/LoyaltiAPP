// Ikone aplikacije iz besednega znaka: modra ploščica, bela črka l, rdeča pika. node icons.mjs
import puppeteer from "puppeteer-core";
import os from "os"; import path from "path";
const root = "C:/Users/YouN/Documents/Ai Projekti/Loyalti App";
const exe = path.join(os.homedir(), ".cache/hyperframes/chrome/chrome-headless-shell/win64-152.0.7977.30/chrome-headless-shell-win64/chrome-headless-shell.exe");
const browser = await puppeteer.launch({ executablePath: exe, headless: "shell" });
const page = await browser.newPage();
async function icon(size, out, { radius = 0.23, scale = 1 } = {}) {
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent(`<html><head><link href="https://fonts.googleapis.com/css2?family=Outfit:wght@700&display=block" rel="stylesheet"><style>
    body{margin:0;background:transparent}
    .t{width:${size}px;height:${size}px;border-radius:${size * radius}px;background:#1F8BF5;position:relative;overflow:hidden}
    .l{position:absolute;left:50%;top:50%;transform:translate(-62%,-52%) scale(${scale});font-family:'Outfit',sans-serif;font-weight:700;font-size:${size * 0.82}px;line-height:1;color:#fff}
    .d{position:absolute;left:${size * (0.5 + 0.12 * scale)}px;top:${size * (0.5 - 0.3 * scale)}px;width:${size * 0.2 * scale}px;height:${size * 0.2 * scale}px;border-radius:50%;background:#E63F26;box-shadow:0 0 0 ${size * 0.03 * scale}px #1F8BF5}
  </style></head><body><div class="t"><span class="l">l</span><span class="d"></span></div></body></html>`, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready); await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: path.join(root, out), omitBackground: true }); console.log("icon", out);
}
await icon(512, "public/brand/icon-512.png");
await icon(192, "public/brand/icon-192.png");
await icon(128, "public/brand/mark.png");
await icon(96, "public/icon.png");
await icon(512, "public/brand/icon-maskable-512.png", { radius: 0, scale: 0.78 });
await icon(180, "public/apple-icon.png", { radius: 0, scale: 0.9 });
await browser.close();
