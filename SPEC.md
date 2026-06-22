# ŽIG — SPEC (vir resnice)

> Ta dokument je **edini vir resnice o konceptu**. Če je koda v nasprotju s tem, se moti koda.
> Dizajn (videz) se lahko prosto spreminja; **koncept spodaj je fiksen**, dokler ga tu ne spremenimo.
> Zgodovina sprememb kode je v [`DEVLOG.md`](DEVLOG.md).

---

## 1. Kaj je Žig
Zvestobeni (loyalty) SaaS za lokale (kavarne, fast-food, slaščičarne …). Gost skenira **fiskalni
QR z računa** → nabira žige/točke → dobiva nagrade. Brez aplikacije, brez gesla. Lokal dobi
**bazo rednih gostov + njihove kontakte** in orodja za marketing + Google ocene.

## 2. Akterja
- **Lokal** (naša plačljiva stranka) — postavi in upravlja svoj loyalty.
- **Gost** (stranka lokala) — skenira račune, zbira nagrade.

## 3. Gostova pot (kar doživi stranka)
1. **QR na mizi / pultu** → odpre lokalovo loyalty stran (`/p/[koda]`).
2. **Prvi obisk = brezplačen vrtljaj kolesa.** Pristane na **vnaprej določeni** nagradi (lokal nastavi).
   - Kupon dobi **SAMO če se registrira**.
   - Že registriran gost ob ponovni prijavi vrtljaja **ne dobi** (enkratno, že izkoriščeno).
3. **Registracija = email** (brez gesla, brez SMS). Email je kontakt za bazo + zastonj marketing.
4. **Skeniranje računa:**
   - Takoj **popup “+1 obisk”** (žig/točke glede na model lokala).
   - Nato **poziv za Google oceno**: zadovoljne (4–5★) **preusmeri na Google**, nezadovoljne (1–3★)
     **prestreže zasebno** (lokal jih vidi, ne gredo javno).
5. **Dom gosta:** napredek (žigi/točke), **denarnica kuponov**, **meni nagrad**, gumb skeniraj.
6. **Unovčenje:** gost aktivira nagrado → **5-min strežniški odštevalnik** → osebje potrdi.

## 4. Model nagrajevanja — LASTNIK IZBERE
Pri postavitvi lokal izbere enega od treh:
- **Žigi** — kartonček; vsak obisk = 1 žig; poln kartonček (npr. 10) = nagrada.
- **Točke** — vsak obisk/€ = X točk; pragovi (npr. 100 = nagrada).
- **Oboje hkrati** — ob skenu gost dobi **žig IN točke**; teče kartonček + točkovni pragovi vzporedno.

Lokal sam določi **nagrade in pragove** (uredi v nastavitvah).
> Stanje kode: trenutno je `points_model` = `per_visit` **ALI** `per_euro`. **»Oboje« je FIX (TODO).**

## 5. Anti-fraud (princip, brez POS)
- Ne zaupamo znesku iz fotke. **ZOI** (kriptografsko unikaten) = dedup računa; **davčna** = izdajatelj;
  **časovno okno**. En račun šteje 1×.
- **POS / eBlagajna verifikacija zneska NI v obsegu** (opuščeno — ZOI ni 3rd-party preverljiv).

## 6. Vrednost za lokal
- **Baza gostov** (email kontakti) — samo njegova.
- **Marketing**: nove ponudbe, promocija dogodkov, win-back neaktivnih, rojstni dnevi (segmenti).
- **Google ocene na avtopilotu** (točka 4) — več dobrih ocen, višje v iskanju.

## 7. Cenik (3 paketi)
- **~30 €/mes**, **~70 €/mes**, **po dogovoru**. *(Vsebina paketov še ni dokončno razdeljena — TODO.)*
- Razlikovanje (predlog): št. kontaktov/sporočil, avtomatizacije (winback/rojstni dan), več lokacij,
  globina analitike.

## 8. Tehnika (na kratko)
- Next.js 16 (App Router) + Tailwind v4 + Supabase (Postgres/Auth/RLS) + Vercel.
- Trijezično (SLO/HR/EN) na javnih straneh.
- Demo-mode (`/p/demo`, `/demo/dashboard`) dela brez baze (mock v `lib/demo.ts`) — prodajni pitch.

## 9. Odprto / FIX (proti konceptu)
- [ ] **Model »oboje«** (žigi + točke hkrati) — koda zdaj ali-ali.
- [ ] **Urejevalnik nagrad/pragov** za lastnika (kaj, koliko žigov/točk).
- [ ] **Prvi-spin-le-ob-registraciji** — dosledno uveljaviti na strežniku.
- [ ] **Poenotenje dveh koles** (`SpinFlow` /embed,/spin vs `Wheel` v GuestApp `/p/[koda]`).
- [ ] **Demo vs real dashboard** (`DashboardDemo` vs `Dashboard`) — dolgoročno ena komponenta z `demo` zastavico.
