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

## Dizajn sistem (tretja različica, 2026-11-17)
Zgodovina: temna podoba (zavrnjena) → svetla modra, bela, rdeča (paleta in hero sprejeta kot »ajde«) → Tin je ploski
UI in stran ocenil kot poceni (»brez grafik«) in poslal referenco pristajalne strani za aplikacijo: mehki prelivi, pravi
zasloni aplikacije v telefonih, bele kartice z mehko senco, bento, poudarjen paket v ceniku, blok s kodo QR, temna noga.
Zdaj velja:
- **Barve (žetoni v `app/globals.css`):** podlaga `#FDFDFE`, platno aplikacije `canvas #F2F6FC`, kartice `card #FFFFFF`,
  površine `s1 s2 s3`, besedilo `#0B1826`. Znamka: modra `#1F8BF5` (`brand`, `brand-ink`, `tint`), glasna rdeča `#E63F26`
  samo za glavne gumbe. Sence `shadow-card`, `shadow-pop`, `shadow-brand`. Prelivi samo kot atmosfera: `.atmo`,
  `.atmo-top`, `.atmo-brand`.
- **Pisave:** Geist povsod, Geist Mono za številke. Anton (`.display`) samo v heroju in zaključnem pozivu.
- **3D grafike:** `public/3d/*.webp` (28 kosov, prosojno ozadje): 14 vrst lokalov + darilo, kupon, kolo, torta, žig,
  telefon, denarnica, konfeti, megafon, zvonec, srce, pokal, kartice, zvezda. Ustvarjene kot dva lista z Gemini 3 Pro
  Image prek trega in razrezane s skripto. Komponenta `app/ui/Icon3D.tsx`. Kartica lokala samodejno dobi grafiko svoje vrste.
- **Zasloni aplikacije na strani:** `public/screens/*.webp` so pravi posnetki predstavitvenih zaslonov
  `/predstavitev/[zaslon]` (samo v razvoju, primeri podatkov, lokali niso resnični partnerji). Okvir: `app/ui/Phone.tsx`.
  Ko se UI aplikacije spremeni, je treba posnetke zajeti znova.
- **Aplikacija:** `WalletView` (pozdrav, nagrade kot vstopnice `RewardTicket`, kartice `LoyaltyCard` s prelivom barve
  lokala, 3D grafiko in žigi s kljukico, bližnjice), pravi namizni razpored v dveh stolpcih.
- **Logo (potrjen 2026-11-17):** samo besedni znak »loyavi« v pisavi Outfit (krepko), pika na črki i je rdeč krog.
  Brez ikone ob napisu. Ikona aplikacije je modra ploščica s črko l in rdečo piko (`scripts/dev/icons.mjs`).
  Zavrnjeno: pet pik v obliki črke L, dve kartici z žigom, 3D ikona ob napisu.
- **Glava strani:** široka bela lebdeča vrstica (logo levo, povezave v sredini, rdeč gumb desno).
- **FAQ:** `FaqBlock` (levo naslov in kartica za stik, desno harmonika v eni kartici).
- **Fotografije:** `public/photos/*.jpg` (12 kosov, generator), komponenta `Photo`.
- **Besedila:** brez vezajev in pomišljajev v stavkih, brez klišejev, brez izmišljenih številk, strank ali mnenj, tikanje,
  spolno nevtralno, brezhibna slovenščina.

## Kontrolni seznam
- [x] A. Temelj: odvisnosti, fonti, žetoni, UI komponente, logo
- [x] B. Landing `/` (svetla podoba, fotografije) + nav + footer + 404 + pravne strani + kontakt
- [x] C. `/partnerji` + cenik (Lokal 49,99 €, Veriga 79,99 €, letno ×10, 30 dni preizkusa)
- [x] D. Gost (E2E 2026-11-16, tudi v svetli podobi): `/prijava`, `/app`, `/p/[code]`, `/s/[code]`, skener, kolo, kuponi, ocena, profil
- [x] E. Lastnik (E2E 2026-11-16): `/partner` (prijava + onboarding), `/dashboard` na novo (9 razdelkov), plakat za tisk
- [x] F. Maili v novi podobi, pravi kuponi, odjava od sporočil (`/odjava`, zapis v `email_log`), cron prepisan
- [x] G. Čiščenje starega, PWA manifest, ikone, slika za deljenje, sitemap, preusmeritve starih poti
- [x] H. tsc, eslint, `next build`, E2E gost + lastnik, mobilno + namizje
- [x] I. `v2` je na `main` in objavljen na loyavi.app (2026-11-17, po Tinovi potrditvi)

## Demo obdobje (od 2026-11-17, stikalo `DEMO` v `lib/demo.ts`)
Tinova odločitev: dokler traja demo (predvidoma mesec ali dva), je Loyavi za lokale brezplačen. Cilj je zbrati bazo lokalov.
- **Dostop:** `ownerAccess` vrne stanje `demo` (brez izteka, brez plačila). Cenik, preizkus in Polar so skriti, koda ostane.
- **Omejitve:** en račun = en lokal (`DEMO_MAX_VENUES`), dve kampanji na teden na lokal (`DEMO_CAMPAIGNS_PER_WEEK`).
  Več lokalov: lastnik pošlje povpraševanje (nadzorna plošča, razdelek Demo paket, ali `/kontakt?tema=veriga`), Tin ga odobri
  v `/superadmin` tako, da lokalu dodeli paket Veriga (do 5) ali Po meri. Povpraševanje se zapiše v `leads` in pride po pošti.
- **Obvezen podpis:** `LoyaviSignature` na strani gosta, noga v vsakem sporočilu gostom, noga plakata. Vse izriše Loyavi,
  lokal nima nastavitve, s katero bi podpis skril. Vgradnega gradnika (embed) v v2 ni, zato ni kode, ki bi jo lokal lahko spremenil.
- **Stran:** značka »Demo« v glavi, hero in zaključek `/partnerji`, razdelek `#demo` (`DemoOffer`) namesto cenika, nova vprašanja.
- **Izklop:** `DEMO = false`. Pred tem vsem lokalom podaljšaj `trial_ends_at`, sicer se plošče zaklenejo isti dan.

## Odprto po v2 (ni blokada za merge)
- `/superadmin` je še v starem videzu (deluje, se prevede). Prenova pozneje.
- Supabase access token je potekel → ko ga Tin zamenja v `.env.local`, naredimo čistilno migracijo
  (prave tabele za kupone, nastavitve lokala, odjave), dotakne se samo `lib/coupons.ts`, `lib/venueMeta.ts`, `lib/unsub.ts`.
- Google prijava (`docs/GOOGLE-LOGIN.md`) in lasten SMTP v Supabase (ponastavitev gesla) čakata na Tinovo nastavitev.
- Testni podatki v produkcijski bazi: lokal »Test E2E Pekarna« (ni v imeniku) in gostje `delivered+loyavi…@resend.dev`
  na lokalu `demo`. Izbris po Tinovi potrditvi.
- `/partnerji` in nadzorna plošča sta dobila nove kartice, sence in cenik, nista pa še predelana tako temeljito kot naslovnica in gostova aplikacija (bento, 3D grafike, zasloni plošče).
- Lint: v treh datotekah je utišano pravilo `react-hooks/set-state-in-effect` (vzorci delujejo, preverjeno z E2E).

## Orodja za preverjanje (v začasni mapi seje, ne v repu)
- `snap.mjs` (puppeteer-core + chrome-headless-shell iz ~/.cache/hyperframes) za posnetke zaslonov.
- `e2e-guest.mjs` cel gostov tok na lokalu `demo` (davčna 97384933, sintetični računi, stojalo `/s/demo?k=demostand2026`).
- Testni gostje: `delivered+loyavi<ts>@resend.dev` (Resendov testni naslov, ne škodi ugledu pošiljatelja).
- POZOR: med tekom dev strežnika NE briši map s potmi (Turbopack se sesuje) → ustavi, `rm -rf .next`, zaženi.
