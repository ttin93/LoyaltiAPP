# Polar naročnine — setup (kar moraš narediti ti)

Koda je **že narejena** (checkout, webhook, kupčev portal, billing tab v dashboardu).
Da gre v živo, je treba enkratno nastaviti Polar. ~15 min.

## 1. Polar račun + organizacija
1. Naredi račun na <https://polar.sh> in organizacijo (npr. "Tally").
2. Začni v **Sandbox** načinu za test, kasneje preklopi na produkcijo.

## 2. Ustvari 4 naročninske produkte (recurring)
Polar dashboard → **Products** → New → tip **Subscription**.
Naredi štiri (cena = brez DDV; Polar kot MoR davek doda sam):

| Produkt              | Interval | Cena      |
|----------------------|----------|-----------|
| Tally Espresso (mes) | monthly  | 49,99 €   |
| Tally Espresso (let) | yearly   | 479,90 €  |
| Tally Doppio (mes)   | monthly  | 79,99 €   |
| Tally Doppio (let)   | yearly   | 767,90 €  |

> Letne cene = mesečna × 12 × 0,8 (−20 %). Če v `lib/plans.ts` spremeniš
> `YEARLY_DISCOUNT`, prilagodi tudi tu. Palača je "po dogovoru" → brez produkta
> (gumb pelje na /kontakt).

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
