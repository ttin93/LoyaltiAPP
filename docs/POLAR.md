# Polar naročnine — setup (kar moraš narediti ti)

Koda je **že narejena** (checkout, webhook, kupčev portal, billing tab v dashboardu).
Da gre v živo, je treba enkratno nastaviti Polar. ~15 min.

## 1. Polar račun + organizacija
1. Naredi račun na <https://polar.sh> in organizacijo (npr. "Loyavi").
2. Začni v **Sandbox** načinu (<https://sandbox.polar.sh>) za test, kasneje produkcija.
   - Sandbox ima **ločen račun, organizacijo, produkte in token** od produkcije.
   - V kodi nastaviš `POLAR_API_BASE=https://sandbox-api.polar.sh` (glej točko 5).
   - Ko vse dela, ponoviš produkte v produkciji in odstraniš `POLAR_API_BASE`.

## 2. Ustvari 4 naročninske produkte (recurring) + 14-dnevni trial
Polar dashboard → **Products** → New → tip **Subscription**.
Naredi štiri (cena = brez DDV; Polar kot MoR davek doda sam):

| Produkt (ime je tvoje) | Interval | Cena      | Env var                              |
|------------------------|----------|-----------|--------------------------------------|
| Loyavi Start (mes)      | monthly  | 49,99 €   | `POLAR_PRODUCT_ESPRESSO_MONTHLY_ID`  |
| Loyavi Start (let)      | yearly   | 499,90 €  | `POLAR_PRODUCT_ESPRESSO_YEARLY_ID`   |
| Loyavi Grow (mes)       | monthly  | 79,99 €   | `POLAR_PRODUCT_DOPPIO_MONTHLY_ID`    |
| Loyavi Grow (let)       | yearly   | 799,90 €  | `POLAR_PRODUCT_DOPPIO_YEARLY_ID`     |

> Letno = **mesečna × 10** (2 meseca gratis). Imena paketov so Start/Grow/Scale,
> a env ključi ostajajo `ESPRESSO`/`DOPPIO` (notranji ključi). Scale = "po dogovoru"
> → brez produkta (gumb pelje na /kontakt).

### 14-dnevni FREE TRIAL (kartica vnaprej) — KLJUČNO
Pri **vsakem** produktu (ali na ceni/price) vklopi **Free trial = 14 dni**:
Polar → produkt → **Pricing / Trial** → "Free trial period" → **14 days**.

Kako to deluje (Polar uredi sam, mi imamo kodo že pripravljeno):
- Ob checkoutu Polar **zahteva kartico** (a je ne bremeni).
- 14 dni je brezplačno → naročnina je v stanju `trialing`. V dashboardu piše
  "**Brezplačno še N dni · potem se trga X dne Y**".
- Po 14 dneh Polar **samodejno bremeni** kartico → `subscription.active`.
- Če gost **prekliče med trialom** (prek "Upravljaj naročnino" → Polar portal) →
  ni bremenitve, dostop ugasne ob koncu triala.

Pri vsakem produktu kopiraj **Product ID**.

## 3. API token
Polar → Settings → **API tokens** → nov token z dostopom do checkouts,
subscriptions, customer sessions (in `refunds:write`, če želiš). Kopiraj.

## 4. Webhook
Polar → Settings → **Webhooks** → Add endpoint:
- URL: `https://<tvoja-domena>/api/webhooks/polar`
- Dogodki: vsi `subscription.*` (created, active, updated, canceled, uncanceled, revoked)
- Kopiraj **Webhook Secret**.

## 5. Env spremenljivke (Vercel → Project → Settings → Environment Variables, Production)
```
# Samo za SANDBOX testiranje (odstrani/zakomentiraj za produkcijo):
# POLAR_API_BASE=https://sandbox-api.polar.sh
POLAR_API_TOKEN=polar_oat_...
POLAR_WEBHOOK_SECRET=polar_whs_...
POLAR_PRODUCT_ESPRESSO_MONTHLY_ID=...
POLAR_PRODUCT_ESPRESSO_YEARLY_ID=...
POLAR_PRODUCT_DOPPIO_MONTHLY_ID=...
POLAR_PRODUCT_DOPPIO_YEARLY_ID=...
NEXT_PUBLIC_SITE_URL=https://<tvoja-domena>
```
Redeploy.

## 6. Test
1. Dashboard → **Naročnina** → izberi Espresso → odpre se Polar checkout.
2. Plačaj (sandbox test kartica) → vrne te na `/dashboard?billing=success`.
3. V par sekundah webhook posodobi lokal: paket Espresso, status Aktivna,
   "Naslednje plačilo: …".
4. **Upravljaj naročnino** → odpre Polar portal → tam preklic/kartica/računi.
5. Preklic → webhook nastavi `cancel_at_period_end` → v dashboardu piše
   "preklicana — aktivna do …". Ob koncu obdobja `subscription.revoked` →
   nazaj na Brezplačni.

## Kako je povezano (za razvijalca)
- `lib/polar.ts` — checkout, portal, podpis webhooka, mapiranje paket↔produkt.
- `app/api/billing/checkout` — owner izbere paket → Polar checkout URL.
- `app/api/billing/portal` — Polar customer portal (preklic/kartica/računi).
- `app/api/webhooks/polar` — `subscription.*` → `venues` (plan, status,
  `current_period_end`, `cancel_at_period_end`, polar id-ji).
- `venues` polja iz migracije `0016_polar_billing.sql`.
- Billing tab: dashboard → **Naročnina**. Superadmin → **Naročnine** vidi vse.
