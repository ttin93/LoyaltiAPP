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

  const issuedAt = new Date(
    `20${dt.slice(0, 2)}-${dt.slice(2, 4)}-${dt.slice(4, 6)}T` +
      `${dt.slice(6, 8)}:${dt.slice(8, 10)}:${dt.slice(10, 12)}`,
  );
  if (isNaN(issuedAt.getTime())) {
    throw new FiscalQRError("Neveljaven datum v fiskalnem QR — verjetno ni račun.");
  }

  // kontrolni znak = vsota vseh števk razen zadnje, po modulu 10 (informativno)
  const sum = clean
    .slice(0, -1)
    .split("")
    .reduce((a, c) => a + Number(c), 0);
  const controlValid = sum % 10 === Number(control);

  return { zoiDec, zoiHex: zoiDecToHex(zoiDec), davcna, issuedAt, controlValid };
}
