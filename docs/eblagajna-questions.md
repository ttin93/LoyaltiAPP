# eBlagajna integracija — kaj vemo (iz OpenAPI spec) + odprta vprašanja

Posodobljeno po pregledu polnega OpenAPI spec-a (api.eblagajna.com). Kontakt: info@eblagajna.com.

## ✅ Kar je spec POTRDIL
- **Auth:** `POST /oauth2/token` (grant_type=client_credentials, client_id, client_secret) → Bearer
  token, velja **1h**. Vse poti pod `/v1/bu/{bu_uid}/…`.
- **Pravice per credential:** *"Access rights to specific endpoints are tied to this UID and your
  credentials."* → eBlagajna **lahko izda omejen ključ** (varnostno ključno za nas).
- **Brisanje je soft-delete** (samo onemogoči, nikoli trajno) → manjši blast-radius ob vdoru.
- **Račun:** `GET /invoice/{connection_id}` → `invoice.price`, `time_closed`, `additional.zoi` +
  `additional.eor`, postavke, izdajatelj (`cmp_data.taxnum`). Vse kar rabimo za verifikacijo — **ČE**
  poznamo `connection_id`.
- **Kupon/popust:** `POST /orders/{id}/articles` ima polje `discount`; loyalty `rule_data`
  (`percent`, `apply_to: invoice`, `min_value`, dnevi/ure). Card balance: `/customers_loyalty_status`.
  → popust v pravi transakciji je izvedljiv.

## 🔴 KRITIČNO odprto vprašanje (od tega je odvisen cel "skeniraj račun" model)
1. **Kako iz ZOI (s skeniranega QR) pridemo do računa?** `GET /invoice` je **po `connection_id`**,
   ZOI je le v ODGOVORU. V spec-u **ni** iskanja po ZOI/EOR ne seznama računov.
   - Ali `GET /orders` vrne tudi **nedavne zaprte/fiskalizirane** račune, **sortirane po času** (da
     potegnemo zadnjih N in ujamemo ZOI)? Ali ima časovni filter?
   - Obstaja **iskanje računa po ZOI / EOR** ali po časovnem oknu?
   - Kaj točno je `connection_id` in kako ga dobimo iz gostovega računa?

## 🛡️ Varnost
2. Prosimo za **omejen (read-only) credential** — samo branje (`/invoice`, `/loyalty*`,
   `/customers_loyalty_status`), **brez** `POST/PATCH/DELETE` in **brez** `/users`. Lahko to
   provisionirate vezano na naš `bu_uid`/credential?
3. Obstaja **OAuth-connect / preklicljiv žeton** (da ne hranimo `client_secret`), ali lahko lokal
   dostop **kadarkoli prekliče**?

## 🎟️ Kupon v transakciji (proti ponaredbi unovčenja)
4. Najboljši način, da **enkraten kupon** apliciramo kot popust na **konkretno odprto naročilo pred
   plačilom**? (`POST /orders/{id}/articles` z `discount`, loyalty rule, ali card balance?)
   Je idempotentno/enkratno?

## 💶 Komercialno
5. Cena API dostopa za partnerja (vključen v lokalove pakete?), **sandbox** okolje, GDPR obdelovalec.
