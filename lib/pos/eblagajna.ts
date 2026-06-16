import type { PosAdapter, PosCredentials, ReceiptVerification } from "./types";

// eBlagajna REST API (https://api.eblagajna.com/).
// Auth: OAuth2 client_credentials -> Bearer token (poteče po 1h). Dostop per bu_uid.

const BASE = "https://api.eblagajna.com";

async function getToken(creds: PosCredentials): Promise<string> {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: creds.client_id,
    client_secret: creds.client_secret,
  });
  const r = await fetch(`${BASE}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!r.ok) throw new Error(`eBlagajna token: HTTP ${r.status}`);
  const j = (await r.json()) as { access_token?: string };
  if (!j.access_token) throw new Error("eBlagajna: manjka access_token");
  return j.access_token;
}

export const eblagajnaAdapter: PosAdapter = {
  provider: "eblagajna",

  async testConnection(creds) {
    try {
      await getToken(creds);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "napaka" };
    }
  },

  async verifyReceipt(creds): Promise<ReceiptVerification> {
    // Dokaže, da poverilnice delujejo:
    const token = await getToken(creds);
    void token;
    // UGOTOVITEV iz OpenAPI spec-a: NI iskanja po ZOI. GET /invoice je po `connection_id`,
    // ZOI je le v odgovoru (additional.zoi). Ni endpointa za seznam računov / iskanje po ZOI.
    // => verifikacija po skeniranem ZOI ni direktno mogoča. Možna pot (čaka potrditev eBlagajne,
    //    glej docs/eblagajna-questions.md): enumerirati nedavne račune prek GET /orders +
    //    GET /invoice in ujeti additional.zoi. Dokler ni potrjeno, ne trdimo, da je preverjeno:
    return { found: false, error: "verifyReceipt: eBlagajna nima iskanja po ZOI — glej docs/eblagajna-questions.md" };
  },

  async applyCouponDiscount() {
    // Predvideno: POST /orders/{orderId}/articles z `discount` (popust na odprto naročilo) ali loyalty rule.
    // ČAKA potrditev eBlagajne (Q4) + povezavo na konkretno odprto naročilo na blagajni.
    return { ok: false, error: "applyCouponDiscount: čaka potrditev eBlagajne (docs/eblagajna-questions.md Q4)" };
  },
};
