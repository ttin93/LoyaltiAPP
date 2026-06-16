import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// AES-256-GCM šifriranje POS skrivnosti (client_secret).
// Ključ (POS_ENC_KEY = 32-byte hex) živi v env / secret-store, NIKOLI v bazi.
// => DB dump sam po sebi NE razkrije uporabnih poverilnic.

const ALGO = "aes-256-gcm";

function key(): Buffer {
  const k = process.env.POS_ENC_KEY;
  if (!k || k.length !== 64) {
    throw new Error("POS_ENC_KEY manjka ali ni 32-byte hex (64 znakov).");
  }
  return Buffer.from(k, "hex");
}

/** Vrne "iv:tag:ciphertext" (vse base64). */
export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), tag.toString("base64"), enc.toString("base64")].join(":");
}

export function decryptSecret(blob: string): string {
  const [ivB, tagB, encB] = blob.split(":");
  if (!ivB || !tagB || !encB) throw new Error("Neveljaven šifriran zapis.");
  const decipher = createDecipheriv(ALGO, key(), Buffer.from(ivB, "base64"));
  decipher.setAuthTag(Buffer.from(tagB, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(encB, "base64")), decipher.final()]).toString("utf8");
}
