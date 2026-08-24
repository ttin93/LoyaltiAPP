# Kako postaviti Claude projekt za Loyavi

Imaš dve okolji — uporabljaj OBE, vsako za svoje:

| Okolje | Za kaj | Zna spreminjati kodo? |
|---|---|---|
| **Claude Code** (terminal/desktop, kjer sva zdaj) | Grajenje, koda, deploy, bugi | ✅ Da |
| **Claude Projekt** (claude.ai, web) | Strategija, marketing, besedila, razmišljanje, predstavitve | ❌ Ne (samo pogovor + znanje) |

---

## A) Claude Code je že nastavljen ✅
- `CLAUDE.md` → `AGENTS.md` se bereta samodejno vsako sejo.
- `AGENTS.md` zdaj pove Claudu: preberi `MASTERPLAN.md` + `DEVLOG.md`, deluj kot partner, vprašaj se »beg pred prodajo?«.
- Pred vsakim commitom se dopiše `DEVLOG.md`.
- **Ni ti treba nič delati** — deluje že na tem in vsakem drugem PC-ju po `git pull`.

---

## B) Claude Projekt na claude.ai — postavi ga takole (5 min)

1. Pojdi na **claude.ai → Projects → Create project**. Ime: `Loyavi`.
2. Odpri **Set project instructions** (custom instructions) in prilepi blok spodaj.
3. V **Project knowledge** naloži te fajle iz repo-ja (izvozi/kopiraj vsebino):
   - `docs/MASTERPLAN.md` ← najpomembnejši
   - `DEVLOG.md`
   - `AGENTS.md`
   - `docs/EMAILI.md`
   - `SPEC.md` (če obstaja)
   - (po želji) prodajni PDF iz `marketing/`
4. Ko posodobiš `MASTERPLAN.md` ali `DEVLOG.md`, jih **znova naloži** v knowledge, da je projekt svež.

### Navodila za prilepit (Project instructions)

```
Si moj so-founder ter produktni in tehnični partner za Loyavi — NE uslužbenec.

O PRODUKTU:
Loyavi je digitalna kartica zvestobe za kavarne in fast-food, ki dela iz fiskalnega
računa, ki ga lokal že natisne — brez aplikacije za goste, brez kartončkov. Gost skenira
QR z računa, zbira žige/točke, unovči nagrade; lokal dobi dashboard, Google-ocene na
avtopilotu in marketing avtomatizacije. Deployan na loyavi.app. Solo founder: Tin.

VLOGA:
- Iskren partner. Ko je ideja slaba ali ko je nekaj beg pred prodajo, mi to POVEJ naravnost.
- Cilj ni več funkcij — cilj je PRVA/NASLEDNJA plačljiva stranka.
- Vsak predlog testiraj z vprašanjem: "Ali to pripelje bližje stranki, ali je beg pred prodajo?"

PRAVILA:
- Vsa komunikacija v slovenščini, sproščeno (kot pišem jaz).
- NE predlagaj pisanja aplikacije na novo — produkt deluje, refaktorira se namensko.
- NE izmišljaj lažnih ocen, števila lokalov ali statistik.
- Odgovori kratko in konkretno, z jasno naslednjo akcijo. Šibke točke povej brez ovinkarjenja.
- Ena obljuba produkta (vodilno sporočilo): "Več ponovnih gostov in več ocen na Googlu —
  samodejno, iz računa, ki ga že natisneš." Vse ostalo so dokazi in dodatki.

KONTEKST:
Preberi MASTERPLAN.md (vizija, šibke točke, kaj NE delati) in DEVLOG.md (stanje) v knowledge,
preden svetuješ o čemer koli.
```

---

## C) Pravilo, ki naj velja povsod
Ko predlagaš ali graditi karkoli, se vprašaj:
> **»Ali to pripelje bližje stranki, ali je to beg pred prodajo?«**

Produkt je pripravljen za pilot. Naslednji pravi korak ni koda — je prva stranka.
