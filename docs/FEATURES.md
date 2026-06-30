# Loyavi — popoln seznam funkcij (za razdelitev po paketih)

Legenda statusa: ✅ dela danes · 🟡 UI je, dejansko pošiljanje/izvedba rabi še provider/gradnjo · 🔢 stvar limita (število) · 🚧 še ni, treba zgraditi

> **Cilj:** odloči, kaj gre v **Espresso (49,99 €)**, kaj v **Doppio (79,99 €)**, kaj **Palača (po dogovoru)**.
> Spodaj je predlog v oklepaju — povozi ga. Ko poveš končno razdelitev, jo zaklenem v `lib/plans.ts` in dejansko gate-am v aplikaciji.

---

## A. Gostova izkušnja (kar vidi gost) — večinoma OSNOVA, povsod
- ✅ Digitalni kartonček z žigi + napredek
- ✅ Točke + točkovne nagrade
- ✅ Kuponi (denarnica, welcome kupon, kartončni kuponi)
- ✅ Skeniranje fiskalnega QR računa → žig + točke
- ✅ 2-koračno unovčenje + strežniški 5-min časovnik
- ✅ Brez aplikacije (deluje v brskalniku)
- ✅ Registracija email+geslo / Google
- ✅ **Večjezičnost gostovega vmesnika** (SL/EN/HR/SR/BS/DE)  *(predlog: Espresso+ ali Doppio+)*

## B. Lojalnostna mehanika (nastavljivo) — OSNOVA, povsod
- ✅ Žig-cilj 4–12, točke/obisk 0–50, per_visit / per_euro
- ✅ Hibridni model (kava=žigi, ostalo=točke)
- ✅ Anti-fraud: ZOI dedup, časovno okno svežine, cooldown med skeni, davčna izdajatelja
- ✅ Ročno dodajanje točk + urejanje nagrad

## C. Google ocene
- ✅ **Review autopilot** — popup po skenu (4–5★ → Google, ≤3★ → zasebno k tebi)  *(predlog: Espresso+)*
- ✅ **Statistika ocen** (povprečje, # ocen, Google vs zasebne)  *(predlog: Espresso+)*

## D. Kolo sreče
- ✅ **Kolo sreče** ob prvem obisku (welcome nagrada)  *(predlog: Doppio+, ali povsod)*
- ✅ **Embed widget** za na lasten website (`/embed`)  *(predlog: Doppio+)*

## E. Marketing
- ✅ **E-pošta kampanje** (segmenti, prejemniki, priloži kupon)  *(predlog: Espresso = osnovno, Doppio = napredno)*
- ✅ **Segment editor** (po meri, min. točke)  *(predlog: Doppio+)*
- 🟡 **SMS kampanje** (UI + cenilka; pošiljanje rabi SMS provider)  *(predlog: Doppio+)*
- 🟡 **WhatsApp** (načrtovano)  *(predlog: Doppio+)*
- ✅ **Marketing avtomatizacije** (6: dobrodošlica, neaktivni, obletnica, rojstni dan gosta, rojstni dan lokala, polna kartica)  *(predlog: Doppio+)*

## F. Analitika
- ✅ Osnovni KPI (skeni, stranke, ocene, kuponi)  *(predlog: Espresso+)*
- ✅ Skeni po dnevih (graf) + najbolj obiskane ure  *(predlog: Espresso = osnovno)*
- ✅ **Časovni filtri (7/30/90 dni)**  *(predlog: Doppio = napredno)*
- 🚧 **Izvoz podatkov (CSV)**  *(predlog: Doppio+)*

## G. Stranke
- ✅ Seznam + iskanje + detajl (točke/žigi/obiski/zadnji obiski)  *(predlog: Espresso+)*

## H. Zgodovina
- ✅ Dnevnik dodeljenih/unovčenih/ročnih + filtri (ime, dan, ura)  *(predlog: Espresso+)*

## I. Nastavitve / branding
- ✅ Ime, **barva znamke** (tema cele gostove strani)  *(predlog: povsod)*
- 🚧 **Logo lokala** — TRENUTNO NE OBSTAJA (gostova stran kaže začetnico). Rabi Supabase Storage + nalaganje. *(treba zgraditi; predlog: povsod ali Espresso+)*
- ✅ QR koda + tisk (Sistem) + embed koda
- ✅ Test računa, aktivacija skeniranja

## J. Več lokalov 🔢
- ✅ Več lokalov na lastnika + preklop med njimi
- **Limit št. lokalov** *(predlog: Espresso = 1, Doppio = do 5, Palača = neomejeno)*

## K. Podpora
- *(predlog: Espresso = e-pošta, Doppio = prioritetna, Palača = namenski skrbnik)*

## L. Palača (enterprise, po dogovoru)
- POS / API integracija 🚧, zasloni gosta po meri 🚧, veriga lokalov, namenski skrbnik

---

## Predlagana razdelitev na hitro (povozi po želji)

| Zmožnost                         | Espresso | Doppio | Palača |
|----------------------------------|:--------:|:------:|:------:|
| Žigi, točke, kuponi, skeni       | ✅       | ✅     | ✅     |
| Google ocene + statistika        | ✅       | ✅     | ✅     |
| Osnovna analitika                | ✅       | ✅     | ✅     |
| Stranke + zgodovina + filtri     | ✅       | ✅     | ✅     |
| Večjezičnost                     | ✅       | ✅     | ✅     |
| Barva znamke                     | ✅       | ✅     | ✅     |
| Logo lokala (ko zgrajen)         | ✅       | ✅     | ✅     |
| Št. lokalov                      | 1        | do 5   | ∞      |
| E-pošta kampanje                 | osnovno  | polno  | polno  |
| Segment editor                   | —        | ✅     | ✅     |
| SMS + WhatsApp                   | —        | ✅     | ✅     |
| Marketing avtomatizacije         | —        | ✅     | ✅     |
| Kolo sreče + embed widget        | —        | ✅     | ✅     |
| Napredna analitika + izvoz       | —        | ✅     | ✅     |
| POS / API / custom zasloni       | —        | —      | ✅     |
| Podpora                          | e-pošta  | prioritetna | skrbnik |

**Načelo (fer za ceno):** Espresso = vse za odlično vodenje **enega** lokala + ocene.
Doppio (+60 %) = **rast in avtomatizacija** (več lokalov, SMS/WhatsApp, avtomatizacije,
kolo, izvoz). Palača = veriga + integracije.

> Ko potrdiš (ali popraviš) zgornjo tabelo, naredim:
> 1. `PLAN_FEATURES` + `PLAN_LIMITS` v `lib/plans.ts` (en vir resnice).
> 2. Dejanski gate v aplikaciji (zaklenjeni tabi/funkcije + lep "nadgradi" poziv).
> 3. Limit št. lokalov ob ustvarjanju.
