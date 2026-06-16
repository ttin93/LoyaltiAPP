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

## 🔴 KRITIČNO — kako iz skeniranega ZOI pridemo do računa
Gostov QR da **samo ZOI** (globalno unikaten), NE `connection_id`. `GET /invoice` je pa PO
`connection_id`. Rešitev ni nujno iskanje po ZOI na njihovi strani — lahko **ZRCALIMO** račune lokala
v našo bazo in gradimo **lasten ZOI-index** (skeniranje = takojšen točen ZOI-match pri nas, brez
časovne dvoumnosti, tudi pri več računih v isti sekundi). Za to rabimo le, da račune **naštejemo**.
Konkretna vprašanja (po prioriteti):
1. **Lahko inkrementalno povlečemo IZDANE (zaprte/fiskalizirane) račune za `bu_uid`?** (npr.
   `GET /orders` vključuje zaprte + paginacija, ali "since"/časovni filter) — da gradimo lasten
   ZOI-index. **To je glavno vprašanje.**
2. Lahko `GET /invoice/{connection_id}` sprejme **ZOI ali EOR** namesto `connection_id`?
3. Obstaja (morda nedokumentirano) **iskanje po ZOI / EOR**?
4. Kaj točno je `connection_id` in kako se navezuje na izdan račun?

> Bonus: zrcaljenje da tudi **znesek** (`invoice.price`) → zanesljive **per-euro** (po porabi) nagrade.

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
