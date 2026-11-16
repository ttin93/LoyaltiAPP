# Loyavi v2 — načrt in dogovori (veja `v2`)

> Odločitev lastnika (2026-11-16): vse na novo po vzoru Feedel (feedel.ro), premium, pripravljeno za
> prodajo v Sloveniji. Nov logo, nova tema, staro vizualno pozabimo. Odločitve prepuščene Claudu.
> Ta dokument je vir resnice za v2. Če se seja prekine, nadaljuj po kontrolnem seznamu spodaj.

## Produkt (model Feedel, prilagojen SLO)
- **Gost:** en račun, vse kartice zvestobe na enem mestu (denarnica), imenik lokalov. Brezplačno.
- **Check-in po izbiri lokala:** `receipt` (QR s fiskalnega računa = dokaz nakupa, privzeto),
  `stand` (QR/NFC stojalo na pultu, 1 žig na dan), `both`.
- **Samo žigi** (točke umaknjene iz UI). Polna kartica → kupon → unovčenje s potrditvijo osebja + časovnik.
- **Dodatki:** kolo sreče (dobrodošlica), Google ocene (4–5★ → Google, 1–3★ zasebno), maili/avtomatizacije/kampanje, rojstni dan.
- **Lastnik:** `/partnerji` (B2B landing + cenik), `/partner` (prijava + onboarding), `/dashboard`.
- **PWA** (namestljiva spletna aplikacija). Native iOS/Android in Wallet pass = kasneje (rabi razvijalske račune lastnika).

## Arhitektura — BREZ sprememb sheme (Supabase access token je potekel)
- **Gostov račun = Supabase Auth** (isti sistem kot lastniki; `mailer_autoconfirm=true`, Google še ni vklopljen).
  Prijava/registracija na klientu (`supabase.auth`), seja v piškotkih (`proxy.ts` jo osvežuje).
- **Članstvo** = vrstica `customers` (venue_id + email). Povezava z računom po `lower(email)`.
- **Kuponi = tabela `redemptions`** (ledger), skrito za `lib/coupons.ts`:
  - `status`: `pending` (čaka na 1. potrjen obisk) | `ready` | `active` (časovnik teče) | `redeemed` | `expired`
  - `points_spent` = koda vira: `0` kartica, `-1` dobrodošlica/kolo, `-2` rojstni dan, `-3` kampanja/win-back, `-4` ročno
  - `reward_id` → `rewards` (za nagrade s kolesa se samodejno ustvari vrstica `kind='prize'`)
  - `expires_at`: veljavnost kupona, ob aktivaciji se prepiše s časovnikom (now + redemption_minutes)
- **Dodatne nastavitve lokala** = `venues.automations.__v2` (jsonb), skrito za `lib/venueMeta.ts`:
  `{ checkin: 'receipt'|'stand'|'both', address, website, hours, listed, about }`
  Kategorija = obstoječi stolpec `venue_type`, mesto = `city`, telefon = `phone`.
- **Žig s stojala** = `award_scan` z umetnim `zoi = stand:<customerId>:<YYYY-MM-DD>` (unique → 1/dan).
- **Profil gosta** (ime, rojstni dan) = `user_metadata` v Supabase Auth; rojstni dan se zrcali v `customers.birthday`.
- Ko bo token zamenjan: čistilna migracija (prave tabele/stolpci) — dotakne se samo `lib/coupons.ts` in `lib/venueMeta.ts`.

## Rute
`/` landing za goste · `/partnerji` B2B + cenik · `/prijava` · `/app` denarnica (Kartice / Lokali / Profil)
· `/p/[code]` kartica lokala · `/s/[code]` stojalo (QR/NFC vstop) · `/partner` · `/dashboard` · `/superadmin`
· pravne: `/pogoji` `/zasebnost` `/piskotki` `/kontakt`
API: `/api/me` `/api/join` `/api/scan` `/api/checkin` `/api/wheel` `/api/coupons/activate` `/api/coupons/confirm`
`/api/review` `/api/profile` + obstoječe billing/webhooks/cron/lead.

## Dizajn sistem (posodobljeno 2026-11-16 po Tinovi referenci)
Tin je sredi gradnje zamenjal smer: **svetla podoba, ne temna**; referenca = »dve mirni barvi in ena glasna«
(nebesno modra + skoraj bela, rdeča samo za glavna dejanja), velik zgoščen naslov, kolaž fotografij.
Kompozicija je naša, tuje predloge ne kopiramo.
- **Barve (žetoni v `app/globals.css`, zrcalo v `lib/brand.ts`):** podlaga `#FDFDFE`, površine `#F3F6FA` / `#E9EEF4` / `#DDE5EE`,
  črta `#D7DFE9`, besedilo `#0B1826`, utišano `#4F5D70` / `#6B7889`.
  **Znamka (mirna):** modra `#1F8BF5`, za besedilo in ikone na beli `#0B6BD0`, nežna podlaga `#E3F1FF`.
  **Glasna:** rdeča `#E63F26` (samo `Button` primary). Razredi: `bg-brand`, `text-brand-ink`, `bg-tint`, `bg-accent`, `text-on-brand` …
- **Pisave:** Geist za vse (UI in besedilo), Geist Mono za številke, **Anton** (razred `.display`, velike črke) samo za velike
  naslove na marketinških straneh. Razmik vrstic 1.18 zaradi strešic (Č Š Ž).
- **Fotografije:** `public/photos/*.jpg` (10 kosov, ustvarjene z Gemini 3 Pro Image prek trega, enoten slog: sonce, modro nebo,
  rdeči poudarki). Komponenta `app/ui/Photo.tsx` (oblike rect / rise / arch / circle / pill). Ko bodo na voljo prave
  fotografije partnerjev, se zamenjajo datoteke.
- **Pravila iz skilla landing-page-design, ki še veljajo:** razmiki samo 0,2,4,8,12,16,24,32,40,48,64,80,96 px; Tailwind lestvica
  pisave; ploska ozadja brez gradientov; Phosphor ikone; gibanje `cubic-bezier(0.32,0.72,0,1)` 700 ms; reveal z
  IntersectionObserver; lebdeča kapsula za navigacijo; razkritje slogana po besedah; stanja; 404; alt; meta.
  Odstopanja po Tinovi želji: naslov hero je bel na modri (brez gradienta na besedilu), dodatna pisava za naslove.
- **Besedila:** brez vezajev in pomišljajev v stavkih, brez klišejev, brez izmišljenih številk ali strank, tikanje,
  spolno nevtralno (brez »prejel si«, »rad«), brezhibna slovenščina.
- **Logo:** pet pik v obliki črke L (žigi), zadnja pika rdeča = nagrada. Ikona: temno modra ploščica z belimi pikami.
  Ikone in slika za deljenje se izdelajo s skripto (puppeteer), izvorni SVG je `public/icon.svg`.

## Kontrolni seznam
- [x] A. Temelj: odvisnosti, fonti, žetoni, UI komponente, logo
- [x] B. Landing `/` (svetla podoba, fotografije) + nav + footer + 404 + pravne strani + kontakt
- [x] C. `/partnerji` + cenik (Lokal 49,99 €, Veriga 79,99 €, letno ×10, 30 dni preizkusa)
- [x] D. Gost (E2E 2026-11-16, tudi v svetli podobi): `/prijava`, `/app`, `/p/[code]`, `/s/[code]`, skener, kolo, kuponi, ocena, profil
- [x] E. Lastnik (E2E 2026-11-16): `/partner` (prijava + onboarding), `/dashboard` na novo (9 razdelkov), plakat za tisk
- [x] F. Maili v novi podobi, pravi kuponi, odjava od sporočil (`/odjava`, zapis v `email_log`), cron prepisan
- [x] G. Čiščenje starega, PWA manifest, ikone, slika za deljenje, sitemap, preusmeritve starih poti
- [x] H. tsc, eslint, `next build`, E2E gost + lastnik, mobilno + namizje
- [ ] I. **Merge `v2` → `main` šele po Tinovi potrditvi** (zamenja živo stran)

## Odprto po v2 (ni blokada za merge)
- `/superadmin` je še v starem videzu (deluje, se prevede). Prenova pozneje.
- Supabase access token je potekel → ko ga Tin zamenja v `.env.local`, naredimo čistilno migracijo
  (prave tabele za kupone, nastavitve lokala, odjave), dotakne se samo `lib/coupons.ts`, `lib/venueMeta.ts`, `lib/unsub.ts`.
- Google prijava (`docs/GOOGLE-LOGIN.md`) in lasten SMTP v Supabase (ponastavitev gesla) čakata na Tinovo nastavitev.
- Testni podatki v produkcijski bazi: lokal »Test E2E Pekarna« (ni v imeniku) in gostje `delivered+loyavi…@resend.dev`
  na lokalu `demo`. Izbris po Tinovi potrditvi.
- Sredina strani `/partnerji` je še pretežno besedilna; dodati fotografije ali posnetke plošče.
- Lint: v treh datotekah je utišano pravilo `react-hooks/set-state-in-effect` (vzorci delujejo, preverjeno z E2E).

## Orodja za preverjanje (v začasni mapi seje, ne v repu)
- `snap.mjs` (puppeteer-core + chrome-headless-shell iz ~/.cache/hyperframes) za posnetke zaslonov.
- `e2e-guest.mjs` cel gostov tok na lokalu `demo` (davčna 97384933, sintetični računi, stojalo `/s/demo?k=demostand2026`).
- Testni gostje: `delivered+loyavi<ts>@resend.dev` (Resendov testni naslov, ne škodi ugledu pošiljatelja).
- POZOR: med tekom dev strežnika NE briši map s potmi (Turbopack se sesuje) → ustavi, `rm -rf .next`, zaženi.
