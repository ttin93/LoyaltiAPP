# Pilotni dogovor — TikTak Cafe (Črnomelj)

Osnutek sporočila prijatelju. Cilj: prvi pilotni lokal za test verifikacije računov prek blagajne.
Najprej preveri **eno stvar**: katero blagajno/POS uporabljajo (idealno **eBlagajna**) — od tega je
odvisno, kako hitro gre.

---

## Sporočilo (prilagodi po občutku)

Živjo [ime]! 👋

Razvijam loyalty sistem za lokale — gost skenira QR z računa, nabira žige/točke in dobi nagrade
(brezplačna kava ipd.). Glavna fora, s katero prekašamo konkurenco: **računov se ne da ponarediti**,
ker jih **preverimo direkt pri blagajni** (ne iz fotke kot drugi).

Iščem prvi lokal za pilot in pomislil sem na vaju s TikTakom. Ideja:

- **Vama postavim vse zastonj** (vajin lokal je prvi/showcase),
- midva skupaj testirava cel flow v živo,
- kasneje, ko dela, drugim lokalom zaračunavam ~50 €/mes.

Da vidim, kako hitro gre, me zanima samo:
1. **Katero blagajno uporabljata?** (npr. eBlagajna, mBlagajnaPRO, druga …)
2. Bi bila za, da par tednov testirava skupaj?

Hvala! Če te zanima, ti razložim več. 🍻

---

## Interna opomba (ne pošiljaj)
- Če uporabljajo **eBlagajno** → gremo po `docs/eblagajna-questions.md` poti (verifikacija pri viru).
- Če uporabljajo **drug POS** → preveri, ali ima API; sicer pilot teče na zastonj slojih
  (ZOI dedup + izdajatelj + časovno okno + per-obisk), POS verifikacija pride, ko dodamo njihov POS.
- TikTak je v **Sloveniji** (Črnomelj) → SLO fiskalni QR/ZOI velja. ✅
