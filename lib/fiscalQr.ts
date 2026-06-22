// Parser za slovenski fiskalni QR (davčno potrjeni račun).
//
// Vsebina QR kode je 60-mestni numerični niz:
//   ZOI(39, decimalno) + davčna(8) + datum-čas(12, YYMMDDHHMMSS) + kontrolni znak(1)
//
// ZNESEK NI v QR kodi — če ga rabiš (per_euro model), gre prek OCR-ja ali POS API-ja.
//
// Pomembno: kontrolni algoritem (vsota števk % 10) je sklepan iz enega vzorca,
// zato ga NE uporabljamo kot razlog za zavrnitev — samo ga izračunamo in vrnemo.
// Pristnost se zagotavlja prek: format(60) + izdajatelj + dedup(ZOI unique) + časovno okno.

export interface ParsedFiscalQR {
  /** ZOI kot 39-mestno decimalno število (kot je v QR kodi) */
  zoiDec: string;
  /** ZOI kot 32-mestni hex (kot je natisnjen na računu) — uporabljamo za dedup */
  zoiHex: string;
  /** Davčna številka izdajatelja (8 mest) */
  davcna: string;
  /** Datum in čas izdaje */
  issuedAt: Date;
  /** Ali se kontrolni znak ujema (informativno, NE za zavrnitev) */
  controlValid: boolean;
}

export class FiscalQRError extends Error {}

/** Pretvori 39-mestni decimalni ZOI nazaj v 32-mestni hex (MD5) zapis. */
export function zoiDecToHex(zoiDec: string): string {
  return BigInt(zoiDec).toString(16).padStart(32, "0");
}

export function parseFiscalQR(payload: string): ParsedFiscalQR {
  // Nekateri skenerji/POS-i dodajo predpono ali URL ovoj — vzemi najdaljši niz samih števk.
  const runs = (payload || "").trim().match(/\d+/g) || [];
  const clean = runs.sort((a, b) => b.length - a.length)[0] || "";

  // Struktura (od ZADAJ): ZOI(spremenljivo, ~38–39) + davčna(8) + datum(12) + kontrola(1).
  // ZOI je MD5 v decimalni obliki → ima lahko vodilne ničle, zato POS-i različno paddajo
  // in skupna dolžina niha (59 ali 60). Zato parsiramo fiksni 21-mestni rep od zadaj.
  if (clean.length < 40 || clean.length > 60) {
    throw new FiscalQRError("To ni QR koda davčno potrjenega računa. Skeniraj fiskalni QR z računa.");
  }

  const control = clean.slice(-1);
  const dt = clean.slice(-13, -1); // YYMMDDHHMMSS
  const davcna = clean.slice(-21, -13);
  const zoiDec = clean.slice(0, -21);

  const Y = 2000 + Number(dt.slice(0, 2));
  const MO = Number(dt.slice(2, 4));
  const DD = Number(dt.slice(4, 6));
  const HH = Number(dt.slice(6, 8));
  const MI = Number(dt.slice(8, 10));
  const SS = Number(dt.slice(10, 12));
  if (MO < 1 || MO > 12 || DD < 1 || DD > 31 || HH > 23 || MI > 59 || SS > 59) {
    throw new FiscalQRError("Neveljaven datum v fiskalnem QR — verjetno ni račun.");
  }
  // Datum je v SLOVENSKEM lokalnem času (CET/CEST). Brez TZ bi ga brali kot UTC, kar bi
  // svež račun naredilo videti ~1–2h v prihodnosti → napačna zavrnitev. Interpretiraj kot Europe/Ljubljana.
  const naiveUTC = Date.UTC(Y, MO - 1, DD, HH, MI, SS);
  let offMin = 60; // privzeto CET (+1)
  try {
    const nm = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Ljubljana", timeZoneName: "longOffset" })
      .formatToParts(new Date(naiveUTC))
      .find((p) => p.type === "timeZoneName")?.value;
    const m = nm?.match(/([+-])(\d{2}):?(\d{2})?/);
    if (m) offMin = (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] || 0));
  } catch {
    /* fallback CET */
  }
  const issuedAt = new Date(naiveUTC - offMin * 60000);

  // kontrolni znak = vsota vseh števk razen zadnje, po modulu 10 (informativno)
  const sum = clean
    .slice(0, -1)
    .split("")
    .reduce((a, c) => a + Number(c), 0);
  const controlValid = sum % 10 === Number(control);

  // dedup ključ: za veljaven MD5 (≤2^128) uporabi hex (= natisnjena ZOI), sicer surovi decimalni
  // niz (nekateri POS-i imajo nestandarden ZOI del). Vedno unikaten in stabilen za isti račun.
  const big = BigInt(zoiDec);
  const max = BigInt("340282366920938463463374607431768211456"); // 2^128
  const zoiHex = big < max ? big.toString(16).padStart(32, "0") : zoiDec;

  return { zoiDec, zoiHex, davcna, issuedAt, controlValid };
}
