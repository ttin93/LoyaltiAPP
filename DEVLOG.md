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
- ✅ **Supabase POVEZAN** (seja 3) — register/scan/dedup/točke delajo v živo; owner prijava (/partner) odklenjena.
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

### 2026-06-14 — seja 4
Implementiran **Spin Page** design (SpinFlow.dc.html). Nova komponenta `app/components/SpinFlow.tsx` —
5-koračni flow: 🎡 kolo (6 polj, rigged na "Brezplačna kava") → 🎉 zadetek → prijava (**Google ALI
telefon**) → **SMS OTP keypad** (4-mestna koda) → 🎟️ kupon ticket (QR + koda). Vezano na pravo
registracijo: OTP/Google → `/api/register` → customerId + kupon v localStorage → "Na mojo stran
zvestobe" (/p/[code]). Nova dedicated stran **`/p/[code]/spin`** (brendirano temno gradient ozadje).
Embed widget `/embed/[code]` zdaj uporablja SpinFlow; `EmbedWheel.tsx` odstranjen. Build čist, rute 200.
OTP in Google sta zaenkrat **mock** (pravi SMS ponudnik + Google OAuth = faza 2). Opomba: GuestApp ima
še starejše preprosto kolo pred registracijo — možno poenotiti (preusmeri na /spin).

### 2026-06-14 — seja 3
**Supabase POVEZAN v živo** (projekt ref `xlcmeaeiyapwblivqolo`, ime LoyaltyAPP). Prek Management API
(Personal Access Token shranjen v `.env.local`): pobrani API ključi → zapisani v `.env.local`,
pognana `supabase/schema.sql` (tabele/funkcije/RLS/seed), izklopljen email-confirm (autoconfirm),
demo lokal reseediran na topli design (Kavarna Moka, 15 točk, kava/rogljiček/torta). **Cel flow
PREVERJEN prek HTTP s pravim Meso Meso računom:** register → scan (+15, izdajatelj OK) → dedup
("že unovčen") → točke v Postgresu. Dodani skripti `scripts/sb-sql.mjs` (poženi poljuben SQL/migracijo
prek API; bere token iz .env.local) in `scripts/sb-autoconfirm.mjs`. Testni podatki počiščeni.

> **Priklop na drugem PC-ju:** `.env.local` je gitignored (NE gre na GitHub). Na PC #2 ustvari
> `.env.local` z `SUPABASE_ACCESS_TOKEN=sbp_...` (+ `NEXT_PUBLIC_SUPABASE_URL=https://xlcmeaeiyapwblivqolo.supabase.co`),
> nato Claude pobere ostale ključe sam (`node scripts/sb-sql.mjs` uporablja isti token). Migracije
> odslej: dopiši v `supabase/schema.sql` ali ločen .sql in poženi `node scripts/sb-sql.mjs pot.sql`.

### 2026-06-14 — seja 2
Implementiran NOV namenski **landing** (Landing.dc.html): desktop marketing stran — sticky nav z
blur, hero z nagnjeno kartico + plavajočimi chip-i (+15 točk, Kava po izbiri), "Kako deluje" 3
koraki, sekcija dashboard preview (temna), žig-story (opečnat gradient), anti-fraud 4 kartice, cene
(**Espresso 0€ / Doppio 29€ / Veriga po dogovoru**), FAQ (5), finalni CTA, footer. PRICING v
lib/demo.ts posodobljen na nove pakete; `/cenik` zdaj preusmeri na `/#cene` (cenik je sekcija
landinga). Dodane ikone (shield/home/arrowR/star2) + floaty animaciji. Build čist, `/` 200.
Opomba: preview screenshot tool je bil v tej seji nedelujoč (stran sicer renderira pravilno).

### 2026-06-13 — seja 1
Od nič zgrajen cel MVP v demo-mode: design system, gostova izkušnja (wheel, kartonček, skener,
2-step unovčenje + server timer, kuponi), demo dashboard (5 zavihkov), cenik, embed wheel widget
+ widget.js. Supabase shema + API rute pripravljene (še ne priklopljene). Build čist, vse rute 200.
Inicialni push na GitHub (main, 53 datotek). Dodan ta DEVLOG sistem.
