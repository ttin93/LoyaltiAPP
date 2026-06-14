import fs from "fs";
import zlib from "zlib";

const binPath =
  String.raw`C:\Users\YouN\.claude\projects\C--Users-YouN-Documents-Ai-Projekti-Loyalti-App\c6d0c33d-5eeb-425e-ad86-755b642f2d77\tool-results\webfetch-1781450601825-2rjgxj.bin`;

const buf = fs.readFileSync(binPath);
let out;
try {
  out = zlib.gunzipSync(buf);
} catch (e) {
  console.log("gunzip failed:", e.message);
  out = buf;
}

const isTar = out.length > 262 && out.slice(257, 262).toString("latin1") === "ustar";
console.log("decompressed bytes:", out.length, "| isTar:", isTar);

if (isTar) {
  // razčleni tar
  let off = 0;
  const files = [];
  while (off + 512 <= out.length) {
    const name = out.slice(off, off + 100).toString("utf8").replace(/\0.*$/, "");
    if (!name) break;
    const sizeStr = out.slice(off + 124, off + 136).toString("utf8").replace(/\0.*$/, "").trim();
    const size = parseInt(sizeStr, 8) || 0;
    const content = out.slice(off + 512, off + 512 + size);
    files.push({ name, size });
    const safe = name.replace(/[^a-zA-Z0-9._-]/g, "_");
    fs.writeFileSync(`design_${safe}`, content);
    off += 512 + Math.ceil(size / 512) * 512;
  }
  console.log("tar files:", JSON.stringify(files, null, 2));
} else {
  fs.writeFileSync("design-decompressed.html", out);
  console.log("wrote design-decompressed.html");
  console.log("first 400 chars:\n", out.slice(0, 400).toString("utf8"));
}
