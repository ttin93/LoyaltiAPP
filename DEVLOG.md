# DEVLOG — kontekstni handoff (delo na večih PC-jih)

> **Zakaj obstaja:** delam na večih računalnikih. Claude seje in spomin (`~/.claude`) se NE
> prenašajo med PC-ji — ta datoteka (v repu) je edini prenosni kontekst.
>
> **NAVODILO ZA CLAUDE:** na ZAČETKU vsake seje preberi to datoteko, da veš, kje smo. PRED
> vsakim commitom dopiši nov vnos na vrh dnevnika (datum + kaj si naredil + trenutno stanje).

---

## Aplikacija
"Žig" — zvestobeni (loyalty) SaaS za slovenske kavarne / fast-food. Gost skenira fiskalni
račun (QR), dobi žige/točke, unovči nagrade. Lokal ima nadzorno ploščo. Topel "kartonček" dizajn.
Repo: **github.com/ttin93/LoyaltiAPP** (zaseben), branch **main**.

## Zagon
- Next.js 16 (App Router) + Tailwind v4. `npm install` → `npm run dev` → http://localhost:3000
- **Demo-mode: deluje BREZ baze** (mock podatki v `lib/demo.ts` + localStorage).
- Rute: `/` landing · `/cenik` · `/dashboard` (demo) · `/p/[code]` gost (npr. `/p/demo`)
  · `/embed/[code]` wheel widget · `/partner` (rabi Supabase).

## Kaj DELA (preverjeno, build čist, vse rute 200)
- **Gost** (`/p/[code]`): 🎡 wheel-spin pred prijavo (rigged na FREE KAVA, samo novi) →
  registracija → kuponi → kartonček (žigi) → skeniranje računa (QR: ZOI dedup + izdajatelj +
  časovno okno) → **2-step unovčenje + server-side 5-min časovnik** → success/error/poteklo.
- **Dashboard** (demo): Sistem (QR + embed koda za website), Analitika, Zgodovina, Marketing
  (SMS kampanje po segmentih), Nastavitve (per_visit⇄per_euro, urejevalnik nagrad, čas).
- **Cenik**: 3 paketi (Osnovni/Pro/Premium), mesečno/letno ×10.
- **Embed widget**: `/embed/[code]` + `public/widget.js` (lokal prilepi na svoj website → kolo).
- Design: Bricolage Grotesque + Instrument Sans; paleta espresso/krema/jantar/opeka/žajbelj.

## NI še / naslednji koraki
- Priklop **Supabase** (shema: `supabase/schema.sql`; `.env.local` prazen; navodila: `SETUP.md`;
  izklopi email-confirm v Auth nastavitvah).
- Pravi **znesek** za per_euro: QR NIMA cene → začasno OCR / kasneje **eBlagajna POS API**.
- **Stripe** plačila (cenik je zaenkrat samo prikaz).
- Pravi **SMS** provider (zdaj demo gumb).
- **Vercel deploy** (HTTPS → kamera dela na telefonu; localhost prek IP blokira kamero).

## Ključne odločitve / arhitektura
- **Anti-fraud:** NE zaupaj znesku iz strankine fotke. ZOI (kriptografski, unikaten) = dedup;
  davčna = izdajatelj; časovno okno. Fabrikacijo (naključen ZOI) ustavi SAMO ujemanje z
  evidenco lokala → zato je per_visit varen zdaj, per_euro rabi POS (eBlagajna) ali OCR+capi.
- **Redemption timer** je server-authoritative: `redemptions.expires_at` v bazi (v demu
  localStorage) → preživi zaprtje appa; ob ponovnem odprtju remaining = expires_at − now.
- **Konkurenca** truo.eu / tvojlajf.si: OCR natisnjenega zneska+št. računa, ignorira QR →
  trivialno ponaredljivo (cap 500 + dnevni limit kot krpa). Naš adut: ZOI + (kasneje) eBlagajna.
- **eBlagajna API** (api.eblagajna.com): `GET /invoice/{connection_id}` vrne `invoice.price`,
  `time_closed`, `additional.zoi`+`eor` → kasnejša integracija za zanesljiv znesek.

## Dnevnik (najnovejše na vrhu)

### 2026-06-13 — seja 1
Od nič zgrajen cel MVP v demo-mode: design system, gostova izkušnja (wheel, kartonček, skener,
2-step unovčenje + server timer, kuponi), demo dashboard (5 zavihkov), cenik, embed wheel widget
+ widget.js. Supabase shema + API rute pripravljene (še ne priklopljene). Build čist, vse rute 200.
Inicialni push na GitHub (main, 53 datotek). Dodan ta DEVLOG sistem.
