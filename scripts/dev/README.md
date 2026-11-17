# Razvojne skripte (posnetki zaslonov in grafike)

Niso del aplikacije. Potrebujejo `puppeteer-core` (`npm i puppeteer-core` v ločeni mapi ali začasno v projektu) in
Chrome ali chrome-headless-shell; pot do njega je zapisana na vrhu vsake skripte in jo je treba prilagoditi računalniku.
Razvojni strežnik mora teči na `http://localhost:3000`. Poti do projekta so v skriptah zapisane absolutno.

| Skripta | Kaj naredi |
|---|---|
| `screens.mjs` | Posname predstavitvene zaslone `/predstavitev/*` v `public/screens/*.webp` (telefoni in plošča na straneh). Poženi po vsaki spremembi videza aplikacije. |
| `icons.mjs` | Izdela ikone aplikacije (`public/brand`, `public/icon.png`, `public/apple-icon.png`) iz besednega znaka. |
| `og.mjs` | Izdela sliko za deljenje `app/opengraph-image.png`. |
| `slice.py`, `cut.py` | Razrežeta liste 3D grafik iz `docs/design-source` v prosojne sličice `public/3d/*.webp` (Python: numpy, opencv, scipy, Pillow). |
| `snap.mjs`, `pend.mjs` | Posnetek poljubne strani (cela stran ali izrez). |
| `gshots.mjs` | Posnetki gostove aplikacije s testnim računom iz `docs/TESTNI-RACUN.local.md`. |
