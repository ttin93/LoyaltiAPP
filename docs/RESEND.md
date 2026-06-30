# Resend setup — da maili dejansko letijo (in NE v spam)

Koda je narejena (16 predlog + sprožilci + cron). Manjka samo Resend + domena.
**~30 min dela + DNS propagacija.** Naredi danes (petek), da je do ponedeljka verificirano.

## 1. Račun
Naredi račun na <https://resend.com>.

## 2. DOMENA — ključno (brez nje ne moreš pošiljati realnim ljudem)
Resend brez verificirane domene pošilja **SAMO na tvoj lasten email** (sandbox).
Za pošiljanje kavarnam in gostom rabiš **svojo domeno**.

1. Resend → **Domains → Add Domain** → vpiši domeno (npr. `loyavi.app`, karkoli imaš).
2. Resend ti pokaže DNS zapise:
   - **SPF** (TXT)
   - **DKIM** (3× CNAME ali TXT)
   - **DMARC** (TXT, npr. `v=DMARC1; p=none;`)
3. Te zapise dodaš **pri registrarju domene** (kjer si jo kupil — npr. Domovanje, GoDaddy, Cloudflare).
4. V Resend klikni **Verify**. Propagacija: par minut do nekaj ur.

> Nimaš domene? Kupi jo danes (~10–15 €/leto). Cloudflare/Namecheap → DNS se vidi v minutah.
> Brez domene maili ne morejo do pravih kavarn — to je edini pravi bloker.

## 3. API ključ
Resend → **API Keys → Create API Key** → kopiraj (`re_...`).

## 4. Env spremenljivke (Vercel → Settings → Environment Variables → Production)
```
RESEND_API_KEY=re_...
RESEND_FROM="Loyavi <pozdrav@loyavi.app>"   ← from MORA biti na verificirani domeni
RESEND_REPLY_TO=tin.suklje93@gmail.com      ← kam pridejo odgovori (from nima inboxa)
NEXT_PUBLIC_SITE_URL=https://<tvoja-domena ali vercel url>
CRON_SECRET=<poljuben dolg niz>                 ← za dnevne avtomatizacije (pogrešamo te ipd.)
```
Redeploy.

## 5. Test
- Super-admin → **Sporočila** → pošlji sebi (segment "Vsi") → preveri da pride (in NE v spam).
- Izgled brez pošiljanja: `/api/email-preview?type=welcome&venue=...`

## Deliverability (da ne gre v spam)
- Začni z DMARC `p=none` (samo opazuj), kasneje `p=quarantine`.
- Pošiljaj iz iste domene kot landing.
- Topel start: malo mailov naenkrat, ne 1000 takoj.
- Resend → Logs vidiš dostavo/bounce.

## Kaj se zgodi, ko je nastavljeno
Brez sprememb kode: dobrodošlica gosta/lastnika, točke, kupon, hvala-za-oceno
(takoj), + dnevni cron (pogrešamo te, obletnica, rojstni dan lokala, potek naročnine).
