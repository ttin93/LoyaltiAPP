# Tehnična vprašanja za eBlagajno (integracija Žig)

Kontekst: gradimo loyalty platformo "Žig" za gostinske lokale. Lokal poveže svojo eBlagajno,
mi pa **preverjamo pristnost računov pri viru** (proti ponaredbam) in želimo **kupone unovčevati
neposredno v transakciji**. Spodaj so vprašanja, da postavimo varno in pravilno integracijo.

## 1. Dostop / poverilnice
1. Kako lokal (oz. mi v njegovem imenu) pridobi `client_id`, `client_secret` in `bu_uid`?
   Kakšen je postopek za **partnerja, ki integrira več lokalov**?
2. **Ali obstajajo omejeni (scoped) dostopi / vloge?** Npr. ključ samo za **branje računov** in
   **loyalty/kupone**, brez možnosti fiskalizacije (`POST /invoice`), brisanja naročil (`DELETE
   /orders`) ali upravljanja uporabnikov? To je za nas varnostno ključno.
3. Ali obstaja **OAuth "connect"/authorization-code** tok, kjer lokal *avtorizira* našo aplikacijo
   in mi dobimo **preklicljiv žeton** (namesto da hranimo njegov `client_secret`)?
   Lahko lokal dostop **kadarkoli prekliče**?
4. Rate limiti? IP allowlist? Možnost vezave ključa na našo strežniško domeno?

## 2. Verifikacija računa (jedro)
5. `GET /invoice/{connection_id}` vrne `ZOI`, `EOR`, znesek, čas. **Kako pa najdemo račun iz
   skeniranega ZOI** (iz QR na računu)? Je možno:
   - (a) iskanje po **ZOI** ali **EOR**, ali
   - (b) seznam računov v **časovnem oknu** za `bu_uid` + ujemanje po ZOI?
6. Je podatek dostopen **takoj** po izdaji računa (real-time), ali z zamikom?
7. Kaj točno je `connection_id` in kako ga povežemo z gostovim računom?

## 3. Kuponi / unovčenje v transakciji (proti ponaredbi unovčenja)
8. Lahko prek API-ja **apliciramo popust/kupon na konkreten odprt račun/naročilo** (`scope: invoice`),
   da se kupon **porabi v sami transakciji na blagajni**? Kateri endpoint + tok?
9. So `loyalty_groups` / `rules` / `card balance` primerni, da **mi vodimo točke**, eBlagajna pa samo
   uveljavi popust ob plačilu? Ali priporočate, da točke vodi eBlagajna?
10. Je unovčenje **idempotentno / enkratno** (da istega kupona ni mogoče porabiti dvakrat)?

## 4. Komercialno
11. Cena API dostopa za partnerja? Je vključen v lokalove pakete (19–55 €/mes) ali ločeno?
12. Testno/sandbox okolje za razvoj?
13. Pogodba o obdelavi podatkov (GDPR) — kdo je obdelovalec?
