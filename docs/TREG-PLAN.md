# Loyavi × treg — konkreten plan (ideje + prioritete)
> treg = marketplace živih podatkov + generativnih AI modelov (SEO/SERP, scraping, enrichment,
> generacija slik/videa/glasu, ads). Plačaš po klicu; treg sam usmeri na najcenejšega/najzanesljivejšega ponudnika.
> Vse cene spodaj so PRAVE (iz kataloga, 2026-09).

## Filter (severna zvezda)
Vsako idejo presoji z: **»Ali to pripelje bližje stranki, ali je nova igračka?«**
treg odpre full nabor bleščečih stvari (AI slike, videi, glas). Nevarnost: da se izgubiš v grajenju
namesto v prodaji. Zato je plan razdeljen: **Tier 0 = uporabi treg za PRODAJO zdaj. Tier 1 = v produkt, ampak PO prvem pilotu.**

---

## 🟢 TIER 0 — treg za PRODAJO (naredi ZDAJ, ~5 €, brez kode v appu)
**To je edina treg-uporaba, ki takoj napade tvoje ozko grlo (0 strank).**

### Lead engine: seznam vseh slovenskih kavarn + kontakti
1. **Google Maps scrape** — `treg.google.serp.maps` (**$0.00175/klic**, 99,4 % uspeh, 167k vzorcev):
   iščeš »kavarna Ljubljana«, »kavarna Maribor«, »coffee shop Koper«… → ime, naslov, telefon, spletna stran, ocena, št. ocen.
2. **Owner email** — `treg.people.email.find` (**$0.0048/klic**, routed čez 22 ponudnikov, ~99,98 % uspeh na quickenrich):
   iz imena lokala + domene dobiš poslovni email.
3. **Rezultat**: preglednica ~500 kavarn z emaili + ocenami + št. ocen.
   **Strošek ≈ 500 × ($0.00175 + $0.0048) ≈ 3,3 $.** Za cel slovenski trg.

**Bonus filtriranje**: sortiraj po »malo ocen / nizka ocena« → to so lokali, ki jim Google-ocene autopilot NAJBOLJ koristi = tvoj najboljši pitch (»dvignem ti oceno«).

⚠️ **GDPR/pravno**: B2B outreach na poslovne maile je v EU večinoma OK z jasno možnostjo odjave, a bodi spodoben (personaliziran, opt-out, ne spam). Ne kupuj/ne prodajaj seznamov naprej.

**Naslednji korak**: rečeš »naredi lead listo« → poženem scrape+enrich, dobiš .csv/.xlsx pripravljen za outreach (tega, ki se ga tako ali tako lotevamo).

---

## 🟡 TIER 1 — treg V PRODUKT (roadmap, PO prvih strankah)
Vse to nadgrajuje obstoječe stebre (marketing + ocene), ni novih. **Gradi šele, ko pilot pokaže, da ljudje to hočejo.**

### 1. AI Marketing Studio (največji diferenciator + upsell)
Lastnik klikne »naredi objavo / story / video« → Loyavi zgenerira **branded** vsebino (njegova barva, logo, trenutna ponudba/kupon) za Instagram/FB/story.
- Slike: `replicate.image-gen.flux-schnell` (**$0.012/sliko**) ali `reapi.image-gen.gemini-3-pro-image` = Nano Banana Pro (**$0.034/sliko**, 99,9 %).
- Video (promo): `minimax.video-gen.from_text` Hailuo (**$0.56**), `bytedance/seedance-1-lite` (**$0.86**), `google/veo-3.1-fast` (**$1.20**).
- **Zakaj killer**: kavarne NE znajo/nimajo časa delat marketinške vsebine. To je razlog za Grow/Scale plan.
- **Vez na to, kar že imava**: brag videi, ki jih delava zdaj, so seme tega — per-lokal avtomatski promo.

### 2. Reviews & Rank Intelligence (nadgradnja ocen-stebra)
Na dashboardu: živa Google ocena skozi čas, lokalni ranking, **primerjava s konkurenco** (»kavarne v okolici: povpr. 4,2★ — ti 4,5★«).
- `treg.google.serp.local` / `dataforseo…local-finder` (**$0.002/osvežitev**), `dataforseo…google-reviews` (**$0.0015**).
- Uresniči »benchmarke« iz MASTERPLAN.md (»lokali kot tvoj vidijo X«) s pravimi podatki.

### 3. Pametni marketing timing / trendi (lažje)
treg social/trends → predlogi tem in časa kampanj (sezona, lokalni dogodki) za avtomatizacije.

---

## ⚪ TIER 2 — kasneje / mogoče
- Glas (`voice`): rojstnodnevno glasovno sporočilo (gimmick — verjetno preskoči).
- Ads optimizacija za lokale; globlji enrichment (LinkedIn ipd.).

---

## 💸 Cenovni model (POMEMBNO — da ne krvavi denar)
treg klici so **variabilni strošek na lokal**. Zato:
- Tier 1 funkcije **zakleni na plačljive plane** (Grow/Scale), z mesečno kvoto (npr. 20 slik / 2 videa / mesec).
- NE ponujaj generacije na free trialu brez limita — sicer plačuješ AI iz svojega žepa za nekoga, ki ne plača.
- Video (~0,6–1,2 $/kos) je premium/redkejši; slike (~0,01–0,03 $) so poceni → lahko radodaren.

---

## Priporočen vrstni red
1. **ZDAJ**: Tier 0 lead lista (~5 $) → outreach → prva stranka. (To je cilj, ne funkcije.)
2. **Med pilotom**: nič treg-produkta — samo poslušaj, kaj lastnik res rabi.
3. **Po »da«**: Tier 1 #2 (Reviews Intelligence — poceni, krepi glavno obljubo), nato #1 (AI Marketing Studio — upsell).
4. **Skala**: #3 + Tier 2.

> Skratka: treg je bomba, ampak njegova PRVA vrednost zate ni funkcija — je **seznam kavarn, ki jim pišeš jutri.**
