# Loyavi — Masterplan / Produktni brief
> Temeljni dokument za Claude projekt. Preberi tega PRVEGA, preden karkoli graditi.
> Namen: jasnost o tem, kaj gradimo, zakaj, kje smo šibki in kaj je naslednji pravi korak.
> Zadnja posodobitev: 2026-08 (seja 71).

---

## 0. Najprej: kaj »iz 0« RES pomeni (preberi to prvo)

Tin, imaš delujoč, deployan, funkcijsko bogat produkt. »Začeti iz 0« **NE pomeni brisati kode in pisati na novo.** To bi bila napaka — vrgel bi mesece dela in si podaljšal pot do prve stranke za pol leta.

»Iz 0« pomeni **iz 0 v razmišljanju**: jasen produktni brief, ena jasna obljuba, premišljen vrstni red. Koda ostane — jo samo namensko čistimo tam, kjer je res treba (glej šibke točke).

**Največje tveganje zate zdaj ni koda. Je to, da »redizajn od začetka« postane eleganten način, kako se izogniti strašnemu koraku: prodaji.** Produkt je dovolj dober za pilot z eno kavarno. Vsak dan grajenja namesto prodajanja te oddaljuje od resnice (ali to sploh kdo hoče).

Zato je ta dokument hkrati vizija IN varovalo pred over-buildingom.

---

## 1. Kaj je Loyavi (v enem stavku)

**Digitalna kartica zvestobe za kavarne in fast-food, ki dela iz fiskalnega računa, ki ga lokal itak že natisne — brez aplikacije za goste in brez kartončkov.**

---

## 2. Ideja / vpogled (zakaj sploh obstaja)

Klasične kartice zvestobe imajo tri probleme: gost mora nositi kartonček (izgubi ga), lokal mora tiskati/žigosati (delo), in nihče nima podatkov (kdo, kdaj, kolikokrat).

**Ključni vpogled (naš »aha«):** Vsak lokal v Sloveniji po zakonu natisne fiskalni račun z QR-kodo. Ta QR je kriptografsko unikaten (ZOI) in vsebuje davčno izdajatelja. To pomeni:
- Gostu ni treba nositi ničesar — samo skenira račun, ki ga tako ali tako dobi.
- Vsak račun šteje **natanko enkrat** (ZOI = dedup) → ni goljufanja.
- Lokal ne rabi novega POS-a, nove strojne opreme, ničesar. Deluje z obstoječo blagajno.

To je pravi wedge: **nič novega ni treba postaviti, izkoriščamo nekaj, kar že obstaja.** To je težko kopirati in enostavno razložiti.

---

## 3. Komu je namenjeno (ICP — idealna prva stranka)

- **Neodvisna kavarna / mali gostinski lokal** v Sloveniji, kjer je lastnik pogosto prisoten in odloča sam (ni korporativne verige).
- Ima ponovne goste (kava je ponoven nakup — idealno).
- Lastniku je mar za **Google ocene** (ker od tam pridejo novi gostje).
- 1 lokacija za start; verige so kasneje (Scale).

Prva stranka = lokal, kamor Tin že hodi in kjer ga lastnik pozna. Ne hladni klici.

---

## 4. Ena obljuba (the ONE promise) — TO je pozicioniranje

Trenutno app dela veliko stvari (žigi, točke, kolo, ocene, rojstni dnevi, kampanje). Za lastnika je to lahko **zmeda = ne**. Za trg potrebujemo EN stavek, ki ga lastnik takoj razume:

> **»Loyavi ti pripelje več ponovnih gostov in več ocen na Googlu — samodejno, iz računa, ki ga že natisneš.«**

Vse ostalo (kolo, kampanje, rojstni dnevi) so **dokazi in dodatki**, ne glavno sporočilo. Na predstavitvi vodi z **Google ocenami** (najbolj otipljiv ROI za lokal) → nato pokaži zvestobo → nato »in še vse to zraven«.

---

## 5. Kaj smo zgradili (inventar — stanje 2026-08)

### Gost (`/p/<koda>`)
- 🎡 Kolo sreče pred prijavo (novi gost dobi nagrado; rigged na privlačno nagrado).
- Registracija (email+geslo prek `guest_auth` / Google OAuth koda pripravljena).
- Kartonček z žigi + točkovne nagrade (hibridni model: kava = žigi, ostalo = točke).
- Skeniranje fiskalnega QR: ZOI dedup + preverjanje izdajatelja + časovno okno + cooldown.
- 2-koračno unovčenje + **strežniški 5-min časovnik** (osebje potrdi).
- Google-ocene popup: 4–5★ → Google profil, 1–3★ → zasebno ekipi (avtopilot).
- Rojstni dan (opt-in; lastnik vklopi + prag skeniranih računov + write-once).

### Lastnik (`/dashboard`)
- Pregled, Analitika (skeni po dnevih/urah), Ocene, Zgodovina, Stranke.
- Marketing: kampanje po segmentih + avtomatizacije + dnevnik pošiljanja.
- Avtomatizacije: welcome, točke (ob mejniku), poln kartonček, hvala za oceno, pogrešamo te, obletnica, rojstni dan.
- Kolo sreče (urejevalnik segmentov/uteži).
- Sistem: QR koda + **custom QR editor** (oblike/barve/logo) + branded plakat + embed widget.
- Nastavitve: barve, žigi, točke, cooldown, jezik, rojstni dan.
- Naročnina: paketi + Polar plačila + trial.
- ROI kartica (kaj ti je Loyavi prinesel).

### Platforma
- Superadmin panel + email tracker/statistika.
- Maili prek Resend (15 oblikovanih predlog; glej `docs/EMAILI.md`).
- Cene: Start/Grow/Scale, mesečno/letno ×10, Polar (Merchant of Record), 14-dnevni trial.
- SEO: OG slika, robots, sitemap.
- i18n: SL/EN/HR/DE (v praksi zares dokončan samo SL).
- Prodajni paket: PDF (SL+EN) + pitchi/ugovori v `marketing/`.

### Tehnični temelji
- Next.js 16 (App Router), Supabase (Postgres/Auth/RLS + service-role), Tailwind.
- Deploy: Vercel (auto na push v main), domena loyavi.app.
- Tabele: venues, customers, rewards, scans, redemptions, reviews, point_grants, email_log; automations + wheel_config kot jsonb.
- Migracije prek `node scripts/sb-sql.mjs <file.sql>`.

---

## 6. Šibke točke (iskreno — tech + produkt + posel)

### Tehnične
1. 🔴 **Kuponi/nagrade živijo SAMO v localStorage brskalnika.** Ni strežniškega ledgerja. Posledice: (a) gost si jih lahko sfabricira/pomnoži z urejanjem brskalnika, (b) lastnik jih v dashboardu **sploh ne vidi**, (c) izgubijo se ob menjavi telefona. **To je največja strukturna luknja.** (Kolo-farming smo že zaprli, ampak to je globlji problem.)
2. 🟠 Model zaupanja sloni na tem, da **osebje potrdi** unovčenje. OK za pilot, šibko pri več lokalih.
3. 🟠 `per_euro` (točke na porabo): fiskalni QR **nima cene** → točk na znesek ne moremo zanesljivo. Rabi OCR računa ali eBlagajna/POS API.
4. 🟡 i18n: zares dodelan samo SL; ostali jeziki polovični.
5. 🟡 Logika je ponekod na klientu (SpinFlow/GuestApp), ne na strežniku → server naj bo edini vir resnice.
6. 🟡 Ni avtomatskih testov / monitoringa.

### Produktne
7. **Feature sprawl vs. jasnost.** App dela veliko; lastnik rabi eno jasno obljubo (glej §4).
8. Onboarding gosta ima trenje (registracija z geslom). Manj korakov = več prijav.
9. Ni socialnega dokaza (chicken-egg; reši prvi pilot).

### Poslovne
10. 🔴 **Pravi ozko grlo je prva »DA«, ne funkcije.** Produkt je preveč zgrajen za 0 strank.
11. 50 €/mesec rabi neizpodbitno ROI zgodbo na lokal.
12. Solo founder — ne moreš graditi vsega; brutalno sekvenciraj.

---

## 7. Kaj bi jaz inovativno naredil (ideje, po prioriteti)

### Tier 1 — reši strukturno luknjo + največ vrednosti
- **Strežniški wallet/ledger** (nagrade, točke, unovčenja v bazi, en vir resnice). Zapre farming, da lastniku vpogled, odklene pravo analitiko. To je #1 tehnični dolg. **Naredi pred 2. lokalom.**
- **Apple/Google Wallet pass** — kartica zvestobe živi v **domači denarnici telefona** (ne v localStorage). Ogromen skok: obstojna, push posodobitve (»še 1 žig!«), zaupanje, in **reši localStorage problem hkrati**. Velika »wow« razlika proti kartončkom in konkurenci.

### Tier 2 — rastne zanke (izkoristi bazo gostov)
- **Referral zanka**: gost povabi prijatelja, oba dobita nagrado. Vgrajena viralna rast — najvišji vzvod za rast, poceni.
- **Pametni win-back timing**: namesto fiksnih 30 dni se nauči ritma vsakega gosta in ga nagovori, ko je RES čas. Boljša konverzija + manj mailov (nižji Resend strošek).
- **»Ta teden« gumb za lastnika**: dashboard sam predlaga ENO akcijo (»18 gostov ni bilo 3 tedne — pošljem kupon?«) z enim klikom. Pasiven dashboard → aktivno orodje za prihodek.

### Tier 3 — izostri wedge / pozicioniranje
- **Vodi z ocenami**: naredi »pridobljene Google ocene« za glavno metriko na dashboardu in glavno obljubo v prodaji.
- **per-euro prek zneska**: reši zajem zneska (OCR total ali eBlagajna API) → točke na porabo + boljše ciljanje. (Težje, kasneje.)
- **Benchmarki**: ko bo dovolj podatkov — »lokali kot tvoj vidijo X«.

---

## 8. Kaj NE delati zdaj (anti-cilji)

- ❌ **Ne piši aplikacije na novo.** Deluje. Refaktoriraj namensko.
- ❌ Ne dodajaj novih velikih funkcij pred prvo stranko.
- ❌ Ne loti se POS integracije zdaj (to je post-»da«).
- ❌ Ne prevajaj vseh jezikov zdaj (SL je dovolj za slovenski pilot).
- ❌ Ne izmišljaj lažnih ocen/števila lokalov (že dogovorjeno).

---

## 9. Predlagana pot (pilot-first, po vrsti)

**Faza A — pripravi na eno stranko (dnevi, ne tedni)**
1. Izostri EN stavek obljube (§4) + posodobi landing/PDF, da vodi z ocenami.
2. Zapri kupon-ledger ali vsaj minimalni strežniški zapis unovčenj (da lastnik vidi in ni farmanja). *Za en pilot lahko celo brez — osebje itak potrdi — ampak vedi, da je to dolg.*
3. Testiraj cel gostov flow enkrat sam do konca (registracija → sken → unovčenje).

**Faza B — dobi prvo »DA« (to je pravi cilj)**
4. Ena kavarna, kjer te poznajo. Pokaži demo na telefonu. Prvi mesec zastonj.
5. Postavi ji lokal v 5 minutah. Bodi tam ob prvih skenih.

**Faza C — uči se iz pilota, šele nato gradi**
6. Kaj gostje res delajo? Kje odpadejo? Kaj lastnik gleda?
7. Šele zdaj: wallet pass, ledger, referral — po pravi bolečini, ne po ugibanju.

---

## 10. Kako uporabiti ta dokument v Claude projektu

- Daj ga v **Project knowledge / custom instructions** novega Claude projekta za Loyavi.
- Dodaj še: `AGENTS.md` (pravila kode), `DEVLOG.md` (dnevnik), `docs/EMAILI.md` (maili), `SPEC.md`.
- Pravilo za vsako sejo: **preberi ta masterplan + DEVLOG na začetku; pred vsakim commitom dopiši DEVLOG.**
- Ko predlagaš nov feature, se vprašaj: »Ali to pripelje bližje prvi/naslednji stranki, ali je to beg pred prodajo?«

---

## 11. Severna zvezda (na kratko)

> Loyavi = več ponovnih gostov + več Google ocen, samodejno, iz fiskalnega računa.
> Produkt je pripravljen za pilot. Naslednji pravi korak ni koda — je prva stranka.
> Gradimo naprej po pravi bolečini pilota, ne po ugibanju.
