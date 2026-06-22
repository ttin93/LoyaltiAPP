# DEVLOG — kontekstni handoff (delo na večih PC-jih)

> **Zakaj obstaja:** delam na večih računalnikih. Claude seje in spomin (`~/.claude`) se NE
> prenašajo med PC-ji — ta datoteka (v repu) je edini prenosni kontekst.
>
> **NAVODILO ZA CLAUDE:** na ZAČETKU vsake seje preberi to datoteko, da veš, kje smo. PRED
> vsakim commitom dopiši nov vnos na vrh dnevnika (datum + kaj si naredil + trenutno stanje).

---

## Aplikacija
"Žig" — zvestobeni (loyalty) SaaS za slovenske kavarne / fast-food. Gost skenira fiskalni
račun (QR), dobi žige/točke, unovči nagrade. Lokal ima nadzorno ploščo. Topel "kartonček" dizajn.
Repo: **github.com/ttin93/LoyaltiAPP** (zaseben), branch **main**.

## Zagon
- Next.js 16 (App Router) + Tailwind v4. `npm install` → `npm run dev` → http://localhost:3000
- **Demo-mode: deluje BREZ baze** (mock podatki v `lib/demo.ts` + localStorage).
- Rute: `/` landing · `/cenik` · `/dashboard` (demo) · `/p/[code]` gost (npr. `/p/demo`)
  · `/embed/[code]` wheel widget · `/partner` (rabi Supabase).

## Kaj DELA (preverjeno, build čist, vse rute 200)
- **Gost** (`/p/[code]`): 🎡 wheel-spin pred prijavo (rigged na FREE KAVA, samo novi) →
  registracija → kuponi → kartonček (žigi) → skeniranje računa (QR: ZOI dedup + izdajatelj +
  časovno okno) → **2-step unovčenje + server-side 5-min časovnik** → success/error/poteklo.
- **Dashboard** (demo): Sistem (QR + embed koda za website), Analitika, Zgodovina, Marketing
  (SMS kampanje po segmentih), Nastavitve (per_visit⇄per_euro, urejevalnik nagrad, čas).
- **Cenik**: 3 paketi (Osnovni/Pro/Premium), mesečno/letno ×10.
- **Embed widget**: `/embed/[code]` + `public/widget.js` (lokal prilepi na svoj website → kolo).
- Design: Bricolage Grotesque + Instrument Sans; paleta espresso/krema/jantar/opeka/žajbelj.

## NI še / naslednji koraki
- ✅ **Supabase POVEZAN** (seja 3) — register/scan/dedup/točke delajo v živo; owner prijava (/partner) odklenjena.
- Pravi **znesek** za per_euro: QR NIMA cene → začasno OCR / kasneje **eBlagajna POS API**.
- **Stripe** plačila (cenik je zaenkrat samo prikaz).
- Pravi **SMS** provider (zdaj demo gumb).
- **Vercel deploy** (HTTPS → kamera dela na telefonu; localhost prek IP blokira kamero).

## Ključne odločitve / arhitektura
- **Anti-fraud:** NE zaupaj znesku iz strankine fotke. ZOI (kriptografski, unikaten) = dedup;
  davčna = izdajatelj; časovno okno. Fabrikacijo (naključen ZOI) ustavi SAMO ujemanje z
  evidenco lokala → zato je per_visit varen zdaj, per_euro rabi POS (eBlagajna) ali OCR+capi.
- **Redemption timer** je server-authoritative: `redemptions.expires_at` v bazi (v demu
  localStorage) → preživi zaprtje appa; ob ponovnem odprtju remaining = expires_at − now.
- **Konkurenca** truo.eu / tvojlajf.si: OCR natisnjenega zneska+št. računa, ignorira QR →
  trivialno ponaredljivo (cap 500 + dnevni limit kot krpa). Naš adut: ZOI + (kasneje) eBlagajna.
- **eBlagajna API** (api.eblagajna.com): `GET /invoice/{connection_id}` vrne `invoice.price`,
  `time_closed`, `additional.zoi`+`eor` → kasnejša integracija za zanesljiv znesek.

## Dnevnik (najnovejše na vrhu)

### 2026-06-22 — seja 43 (bugfix: skeniranje pravih računov — variabilna dolžina ZOI)
- **Bug**: `parseFiscalQR` je zahteval točno `^\d{60}$`. ZOI (MD5→decimalno) ima lahko vodilne ničle → nekateri POS-i paddajo na 39 mest (skupaj 60), drugi NE (38 → skupaj 59). Realni račun z 59 mesti je vrgel »pričakovano 60 števk«.
- **Fix**: parsiramo **od zadaj** (fiksni rep davčna(8)+datum(12)+kontrola(1)=21, ZOI je preostanek), tolerantna dolžina 40–60, najdaljši digit-run (prenese URL-ovit QR / predpono skenerja), datum kot varovalka. Dedup ostane konsistenten: `BigInt(zoiDec)` normalizira vodilne ničle → 59 in 60-mestni isti račun dasta isti `zoiHex` (preverjeno).
- Opomba za test: za žig/točke mora biti račun iste **davčne** kot ob aktivaciji + svež (znotraj časovnega okna). Aktivacijski račun NI porabljen (lahko ga skeniraš za prvi žig).

### 2026-06-22 — seja 42 (anti-zloraba welcome nagrade + gostov password)
- **Welcome kupon NE več zastonj za vsak random mail**: zadetek kolesa je zdaj **NA ČAKANJU** (`pending:true`) in se **aktivira šele ob 1. skeniranju pravega računa** lokala (ZOI unique + davčna + okno). To ubije zlorabo (brez resničnega računa = brez kave). Pokazano na: spin coupon zaslon (»Kupon te čaka… aktivira se ob prvem skeniranju«) + gostova domača stran (kupon z oznako »ČAKA«). GuestApp ob uspešnem skenu flipne vse pending kupone → aktivne.
- **Gostov račun = email + GESLO (brez potrditvene kode)**: nov `customers.pass_hash` + RPC `guest_auth` (pgcrypto bcrypt; register ALI login v enem klicu). `/api/register` sprejme `password` → guest_auth. **Prepreči prevzem računa z znanim mailom** (za obstoječ email rabiš pravo geslo). SpinFlow register ima zdaj email+geslo polji + napake. Google pot ostane brez gesla (OAuth-trusted). Migracija 0010.
- **Preverjeno v živo**: guest_auth (nov ok / napačno geslo zavrnjeno / pravo geslo login), cel spin→register(email+geslo)→pending kupon→home »ČAKA« tok, testni gostje počiščeni.
- Odločitev (lastnik): welcome se veže na 1. skeniranje računa (ne email-verifikacija); registracija email+geslo brez kode.
- Build čist, migracija 0010 v živo (201).

### 2026-06-22 — seja 41 (feedback 3: Kolo sreče konfiguracija, zgodovina kdo/kdaj, jezik, ročni dnevnik)
- **Kolo sreče — nov dashboard zavihek + konfiguracija**: `venues.wheel_config` (jsonb), `saveWheel` action. Lastnik nastavi: vklop/izklop, način (**fixed** = vedno isti zadetek / **weighted** = naključno po utežeh %), segmente (napis + utež), zmagovalca (fixed), z živim mini-predogledom (`WheelMini`). **SpinFlow prebere config**: N segmentov, pickWinner (fixed/weighted), pristane na pravem segmentu, WON/kupon kažejo dejansko osvojeno nagrado (ne več fiksne »kave«). Če disabled → preskoči kolo, gre naravnost v registracijo. Wired v GuestApp + /embed + /p/[code]/spin. **Preverjeno v živo**: /p/prtinu/spin prikaže custom 4 segmente iz baze.
- **Zgodovina kdo/kdaj/kaj**: skeni + redemptions zdaj kažejo **email** (prej »—« ker je telefon null). Ročno dodane točke (admin) se beležijo v novo tabelo `point_grants` in se kažejo v **Podarjene** z oznako »ročno«. (Migracija 0009.)
- **Jezik gostove strani**: `venues.language` + selektor v Nastavitvah (SLO/EN/HR/SR/BS/DE). Zaenkrat shrani nastavitev; prevodi celega gostovega flowa pridejo kasneje.
- **Pregled obogaten**: hitre akcije (skok na test/kolo/kampanjo/QR/ocene) + »Za dokončat« setup-checklist (skeniranje, nagrade, Google link, kolo).
- **Registracija (odgovor na vprašanje)**: priporočilo = NE dodajati gesla+2×+email-koda za loyalty goste (preveč friction, ubije signupe). Ostaja email-only; če bo treba verificirati email → passwordless magic-link, ne gesla. Forgot-password brez gesel ni potreben. (Ni grajeno — čaka potrditev.)
- Build čist, migracija 0009 v živo (201).

### 2026-06-22 — seja 40 (feedback po testu: onboarding + dashboard razširitve, Google-ocene statistika)
- **Test login**: ustvarjen potrjen owner (`tin.suklje93@gmail.com` / `123456`) prek admin API (registracija prek UI je čakala na email-potrditev).
- **Onboarding**: korak 1 = barvni picker (`<input type=color>` + hex polje) poleg presetov; korak 2 = točke na obisk lahko **0** (samo žigi); korak 3 = **pravo urejanje nagrad** (žig-nagrada + točkovne nagrade z imeni/točkami, add/remove) → `createVenue` bere `point_rewards` JSON + točke 0.
- **Dashboard – Nastavitve**: nagrade **ločene** na "za žige" / "za točke" (`saveReward` dobi `kind`); barvni picker + hex + swatchi (ne le # koda); polji **Žigov za kartonček** (`stamp_goal`) in **Google povezava** (`google_review_url`).
- **Nov zavihek Ocene**: Google-review statistika (skupaj, povprečje★, % poslano na Google, ≤3★ zasebni feedback s komentarji, razporeditev). Migracija **0008_reviews** + `POST /api/review` + GuestApp beleži oddajo ocene (4–5★→Google `to_google`, ≤3★ komentar).
- **Analitika**: časovni filter (7/30/90/leto), več KPI (skeniranja/nove stranke/unovčene/povp. obiski/segmenti), graf po dnevih, heatmap ur dneva, top unovčene nagrade.
- **Stranke**: iskalnik + klik na vrstico → modal s statistiko (točke/žigi/obiski + zadnji skeni + ročno dodaj točke).
- **Marketing**: e-pošta fokus (brez SMS-stroška), predloge kampanj (Pogrešamo te/Nagrada/Rojstni dan/Vikend), segment + "Vsi gostje". SMS/WhatsApp odloženo (zavestno).
- **Sistem**: "Testiraj račun" (nov `testReceipt` action — veljaven za lokal + unikaten, BREZ ur/datuma, ne dodeli točk) + **ročni vnos davčne** (alt. aktivacija) + predogled gostove strani.
- **Naročnina**: nov zavihek (paketi Espresso/Doppio/Palača + placeholder upravljanje) + upgrade CTA v sidebar nad odjavo. Plačila (Stripe) odložena.
- Odloženo (rabi providerja): dejansko pošiljanje e-pošte/SMS/WhatsApp, Stripe, urejanje pravil segmentov + ročni izbor prejemnikov, QR po meri, per-screen WYSIWYG editor gostovih zaslonov.
- Build čist, migracija 0008 aplicirana v živo (201).
- **Feedback round 2 (gostova stran)**: (a) odstranjen odvečni zeleni »X te čaka · aktiviraj pri osebju« banner — unovčljive nagrade so zdaj jasno označene **v meniju** (zelen okvir + gumb »Unovči«). (b) **Lastnikova barva tematizira CEL gostov site** (GuestApp): nov `brand`+tinti (`mix`/`hexA`), speljano skozi welcome gradient, žige (StampGrid `accent`), kartico, kupone, progress, časovnik, ActivateSheet. Preverjeno v živo na PrTinu (vijolična #8E5BA6 → gradient + žigi vijolični, ne več forsiran jantar). SpinFlow je barvo že imel.

### 2026-06-20 — seja 39 (avtonomni sprint #2: hibridni model + multi-venue + real analitika + kampanje)
- **Hibridni model nagrad**: kava = ŽIGI (kartonček), rogljiček 250t + torta 350t = TOČKE. Migracija 0007
  (customers.stamps, venues.stamp_goal, rewards.kind) + award_scan v2 (žige+točke ločeno, žige resetira pri goalu).
  Wired: api/scan, api/customer, createVenue (default 3 nagrade), GuestApp (kartonček + točkovne nagrade z unovčenjem).
  Demo venue posodobljen v bazi (25 t/obisk, stamp_goal 10).
- **Več lokalov na lastnika**: odstranjen single-venue guard; `/dashboard?v=<id>` switcher v sidebar + `/partner?new=1` za nov lokal.
- **Pravi Dashboard razširjen**: Analitika (prave KPI: unovčene/podarjene/segmenti + 14-dnevni graf) +
  Marketing (composer kampanje: sporočilo + segment + prejemniki + ocena stroška SMS; segmenti iz pravih obiskov).
- **Točke/unovčenje preverjeno**: `activate_reward` atomarno (FOR UPDATE) odšteje točke — odporno na več-account.
- **Google ocena**: že po vsakem skenu (success zaslon, 4–5★→Google / 1–3★ zasebno).
- ODLOŽENO (rabi providerja): dejansko pošiljanje SMS/email kampanj; logo upload; Google OAuth.

### 2026-06-20 — seja 38b (avtonomni Tally sprint — DOKONČANO: pravi dashboard + widget + ActivateSheet)
- **ActivateSheet** (unovčenje bottom-sheet) → Tally. Guest del 100% Tally.
- **Pravi `Dashboard.tsx`** (prijavljen lokal) → Tally sidebar (Pregled/Zgodovina/Stranke/Sistem/Nastavitve) s PRAVIMI
  podatki + vse akcije ohranjene (nastavitve, urejevalnik nagrad, ročne točke, aktivacija skena, QR).
- **`public/widget.js`** → Tally launcher (»Osvoji nagrado« + zlat krog z ikono kolesa, floaty) + lepši popup okvir;
  iframe še naprej kaže `/embed` (SpinFlow Tally).
- **STANJE: cel app je Tally** — landing v2, kolo+registracija, skener, gostov dom+rezultati+sheet, prijava+onboarding wizard,
  demo+pravi dashboard, widget. Ime = Tally.
- Ostane (napredne fore, ne nujne za test): detajlni urejevalniki gostovih besedil/kolesa (»Nastavitve - urejevalniki«),
  pravi logo upload, pošiljanje SMS/email kampanj (backend), Google OAuth nastavitev.

### 2026-06-20 — seja 38 (avtonomni Tally sprint: gost + onboarding + dashboard + skener anti-fraud)
- Uporabnik: delaj avtonomno brez vprašanj, prenovi VSE v Tally (za večerni test + outreach lokalov).
- **Gostov dom** prenovljen v Tally (desktop split + telefon full-bleed) + rezultati skena (uspeh/Google-ocena/napaka/časovnik/unovčeno) + StampGrid coral.
- **Skener**: odstranjen ročni vnos QR-številke (anti-fraud — vpis/deljenje znane številke); samo kamera + demo simulacija.
- **Onboarding wizard** (`Onboarding.tsx`): 4 koraki (znamka/pravila/nagrade/objava) + živi predogled kartice; piše stamp_goal+points_per_visit+reward v createVenue.
- **DashboardDemo** (`/demo/dashboard`) prepisan v Tally: sidebar nav (Pregled/Analitika/Zgodovina/Stranke/Marketing/Sistem/Nastavitve) + KPI/grafi/donut/tabela strank/profil modal/kampanje/QR/embed. Responsive (mobilni horizontalni nav). Preverjeno: nav preklop + profil modal + brez napak.
- **ŠE**: pravi `Dashboard.tsx` (s pravimi podatki), Nastavitve-urejevalniki, vgradni widget, ActivateSheet.

### 2026-06-20 — seja 37 (NOV LANDING v2 — fokus na fičrih, Tally tema)
- Iz handoff zipa »Landing v2.dc.html« (uporabnik prenovil landing). **`app/page.tsx` prepisan** v nov dizajn:
  Tally tema (cream #FBF7F0, coral #C4623D, amber #E2A04A, Plus Jakarta), samostojen nav + footer.
- Sekcije: hero (asset + plavajoči čipi +1 žig/nova ocena/kupon poslan + kartica), trust pills, stats band (4),
  »En sken sproži tri stvari« (3 koraki), **OCENE** (temna — review engine: popup + ≤3/4-5 veji + rating graf),
  **MARKETING** (compose + telefon mock + 4 kartice), **DASHBOARD** (temna — KPI + obiski/ure + retention donut),
  **CENE** (Espresso **49,99€** / Doppio **79,99€** / Palača po dogovoru — nove cene!), FAQ (6), final CTA, footer.
- **Opustil**: trilingv. preklopnik + promo banner + widget na landingu (v2 dizajn jih nima; SLO-only).
  i18n (SiteHeader/Footer) ostane v rabi za /kontakt + pravne (te še stara topla tema — za prenovit).
- Build čist (18/18); preverjeno na / (vse sekcije, cene, brez console napak, mobilni brez overflow, nav se zloži).
- Cene se razlikujejo od lib/demo PRICING (29,99/69,99) — landing zdaj inline 49,99/79,99 po dizajnu.

### 2026-06-20 — seja 36 (osnova: NASTAVLJIV žig-cilj 4–12)
- Odločitev uporabnika: žig-cilj naj bo nastavljiv (4–12). **Brez nove migracije** — št. žigov se izpelje:
  `stampGoal = round(reward.points_required / points_per_visit)`, vsak obisk = 1 žig (vreden `points_per_visit`).
- **GuestApp**: `StampGrid` parametriziran (`count`, 5/6 stolpcev), izračun žigov + vsi prikazi (`x/stampGoal`,
  visitsLeft, pct, completion) uporabljajo `stampGoal` namesto fiksne 10. Demo scan posodobljen.
- **`createVenue`**: sprejme `stamp_goal` (4–12) + `points_per_visit` + `reward_name`; shrani points_per_visit,
  glavna nagrada `points_required = stampGoal × pointsPerVisit`. (Onboarding wizard bo pošiljal te vrednosti.)
- `/api/scan` že pravilen (cardGoal = nagrada.points_required → award_scan reset). Preverjeno: /p/demo še /10 (brez regresije).
- **NASLEDNJE**: onboarding wizard UI (4 koraki + živi predogled, Tally dizajn) → na publish kliče createVenue.
  (Gated za prijavo — test prek registracije.)

### 2026-06-20 — seja 35 (ime → TALLY + prenovljena prijava lastnika)
- **Preimenovanje: `BRAND` = "Tally"** (vsi novi dizajni ga uporabljajo; Žig je bil začasen).
  Posodobi se povsod prek `lib/brand.ts` (header, footer, pravno, kontakt, SpinFlow »powered by«).
- **`AuthForm.tsx` (prijava lastnika) prepisan** v novi Tally dizajn (iz »Lastnik - prijava + onboarding.dc.html«):
  split kartica — temni brand panel (radial gradient + amber »T« logo + »Zvestoba na fiskalni račun« + bullets)
  na desktopu, desno forma z zavihki **Prijava/Registracija**, Plus Jakarta. Registracija doda polje »Ime in priimek«.
  Google gumb (graceful »kmalu« če OAuth ni nastavljen). Ohranjena Supabase login/signup logika. Responsive.
- Preverjeno /partner: brand panel, zavihki, Jakarta, ime-polje ob registraciji, brez napak. Build čist (18/18).
- **ŠE ZA PRENOVIT** (imam dizajne v zipu): onboarding wizard (4 koraki + živi predogled, rabi backend za
  nastavljiv žig-cilj), Dashboard, Nastavitve-urejevalniki, dom gosta + desktop, vgradni widget, uspeh/napaka skena.

### 2026-06-20 — seja 34 (skener računa prenovljen v novi dizajn)
- Uporabnik: skeniranje računa je grdo. **`Scanner.tsx` prepisan** v novi dizajn (iz
  »Gost - klikabilen flow.dc.html«): temno ozadje `#1C160F`, Plus Jakarta, zlati vogalni okvirji
  250×250 (`#E2A04A`), scanline, »Poravnaj QR z dna računa…«.
- **Ročni vnos zložljiv** (prej vedno odprt grd box) → »Kamera ne dela? Vnesi kodo ročno«.
  Ob napaki kamere se odpre samodejno.
- **Demo prop**: v demo-mode skener pokaže panel »SIMULIRAJ REZULTAT« (Veljaven/Že skeniran/Tuj/Prestar);
  `handleScan` v GuestApp prepozna `DEMO_OK/DUP/FOREIGN/OLD` sentinele.
  (Opomba: `/p/demo` je lokalno/prod **pravi venue** iz baze → skener zažene kamero; demo-panel le v pravi demo-mode brez baze.)
- Build čist (18/18); v predogledu potrjeno: nova tema, zlati vogali, Jakarta, ročni fallback, brez napak.
- Še staro (za prenovit naslednje): uspeh/napaka po skenu + Google-ocena gate + dom gosta.

### 2026-06-20 — seja 33 (NOV DIZAJN gostovega flowa iz Claude Design: kolo + registracija)
- Vir: handoff zip (»Gost - nov (kolo + registracija).dc.html«). MCP connector ni bilo mogoče
  avtorizirati (API-key seja, `/design-login` ni v tem okolju) → uporabnik je prinesel zip, prebral z diska.
- **Nov vizualni sistem**: pisava **Plus Jakarta Sans** (`--font-jakarta` v layoutu), paleta
  `#E9E2D6`/`#2A241D`/zlata `#E2A04A`, beli card, gradient ozadje, popIn animacije.
- **`SpinFlow.tsx` prepisan** v ta dizajn: kolo → zadetek → registracija (**email**) → kupon.
  Ohranjena logika (register `/api/register`, Google OAuth + return, kupon v localStorage) + dodan `demo` prop.
- **Nove goste na `/p/[koda]` zdaj poganja SpinFlow** (GuestApp render veji za kolo+registracijo
  zamenjani z `<SpinFlow demo .../>`); odstranjena mrtva onboarding koda (Wheel, WHEEL_SLOTS,
  INTRO_CHIPS, spun/pendingPrize/grantPending/register/email, `?prize` carry). **Poenotenje koles (SPEC §9) ✓.**
- **OTP/koda IZPUŠČENA**: dizajn je imel »Pošlji potrditveno kodo« → 4-mestna koda. Izpustil (rabi
  email-pošiljanje + doda trenje; dogovor je email-zajem brez kode). Gumb preimenovan »Prevzemi nagrado«.
- »powered by« še vedno **Žig** (dizajn je rabil »Tally« — odprto: ali je novo ime Tally?).
- Potrjeno v predogledu /p/demo: cel flow kolo→zadetek→registracija→kupon, brez console napak. Build čist (18/18).

### 2026-06-20 — seja 32 (RED: SPEC.md = vir resnice + audit + čiščenje smeti)
- Uporabnik: projekt se zdi razpršen, ne ve kaj je v uporabi/kaj smeti. Odločitev: **NE restart**,
  ampak zakleni koncept + počisti. Dizajn dela svež v Claude designu; koncept ostane.
- **`SPEC.md`** (NOV) — edini vir resnice o konceptu (gostova pot, model, anti-fraud, cenik, FIX-list).
  Ključna odločitev: **model = lastnik izbere žigi / točke / OBOJE** (»oboje« je še TODO v kodi).
- **Pobrisana mrtva/opuščena koda** (preverjeno z grep uvozov):
  - `app/embed/[public_code]/EmbedWheel.tsx` — mrtev (embed uporablja `SpinFlow`).
  - `app/p/[public_code]/Scanner.tsx` — mrtev (povsod se uvaža `app/components/Scanner`).
  - **POS/eBlagajna opuščen**: `lib/pos/*`, `app/api/pos/route.ts`, `app/dashboard/PosConnectCard.tsx`
    + odstranjen uvoz/uporaba v `Dashboard.tsx`.
- **Tech-debt zabeležen v SPEC §9** (ne brisano): dve kolesi (SpinFlow vs Wheel), demo vs real dashboard.
- Build čist po čiščenju.

### 2026-06-20 — seja 31 (gostov DOM prenovljen: responsive + nagrade + kuponi vidni)
- Prijavljeni gostov dom (`/p/[code]`) je bil pretemeljen (samo kartonček + skeniraj). Zdaj:
  - **Responsive**: telefon = 1 stolpec, **PC = 2 stolpca** (`lg:grid`, levo napredek+skeniraj+kuponi,
    desno meni nagrad). Potrjeno: mobile=flex, desktop=grid, brez prelivanja.
  - **Kuponi** sekcija je zdaj **vedno** vidna (prej skrita če prazna) — z empty-state
    (»Nimaš še kuponov…«).
  - **Nagrade** so zdaj vidne tudi v **stamp** načinu (prej samo točke): »Nagrade v lokalu« —
    prva = kartonček nagrada s progress (žigi/10), ostale »v meniju«. V točke načinu po starem
    (progress bar + unovči).

### 2026-06-20 — seja 30 (gost registracija: telefon → EMAIL + prenovljen zaslon)
- **Registracija gosta (`/p/[code]`) preklopljena s telefona na EMAIL** (uporabnik: SMS predrag za start).
  Opomba: telefon pri nama itak NI pošiljal SMS-a (zastonj), a email je za pošiljanje kampanj zastonj → boljši za start.
  `register()` zdaj pošlje `{ email }` na `/api/register` (ta že podpira email + dedup). Validacija `/.+@.+\..+/`.
  Potrjeno end-to-end v predogledu: vnos emaila → Pridruži se → kartonček.
- **Zaslon prenovljen** v isto temo kot wheel-intro: topla kartica + žarki v ozadju + trust vrstica
  (Brez gesla · Brez aplikacije · Zastonj) + responsive (na mobilcu se kartica prilega).
- **Google login** = TODO (rabi enkratno Google Cloud OAuth nastavitev na uporabnikovi strani; dodava kasneje).
- Stanje `phone`/`setPhone` v GuestApp odstranjeno (zamenjano z `email`).

### 2026-06-20 — seja 29 (BUGFIX onboarding loop + wheel-intro hero + onboarding polja)
- **BUG (kritičen): »Ustvari lokal« te je vrglo nazaj na Onboarding.** Vzrok: `maybeSingle()`
  na `venues` po `owner_user_id` **vrže napako, če lastnik ima >1 lokal**. Med testiranjem je
  nastalo več lokalov za istega userja → `/partner`, `/dashboard` in `ownerVenue()` so vsi crashali
  → neskončna zanka. **Fix:** povsod `order(created_at).limit(1)` namesto `maybeSingle()` +
  `createVenue` zdaj preveri obstoj in ne ustvari drugega (redirect na /dashboard).
  (Opomba: testni račun ima 2 lokala — »PrMaticku« + »a«; koda zdaj vzame najstarejšega.)
- **Onboarding razširjen** (seja prej): polja owner_name/phone/venue_type/city + model nagrajevanja
  (migracija 0006). Polepšan v topli temi (3 kartice).
- **Wheel-intro zaslon `/p/[code]` prenovljen** (bil prazen na PC-ju): osrednja topla kartica +
  topli žarki v ozadju + 4 plavajoči nagradni čipi okoli (samo ≥lg) + trust vrstica
  (Brez aplikacije · En vrtljaj · Nagrada takoj). Na telefonu čipi skriti, kartica se prilega.
- **Partner auth** (seja prej): prenovljen v topli temi (split kartica + brand panel + segmentni toggle).

### 2026-06-20 — seja 28 (TRIJEZIČNOST SLO/HR/ANG + skupni header/footer + marketinška bomba)
- **Trijezičnost** z gumbi za preklop (SLO/HR/EN v headerju, shranjeno v localStorage):
  - `lib/i18n.ts` — slovar za cel landing + nav + footer + kontakt v **sl/hr/en** (marketinško okrepljena kopija).
  - `app/components/LangContext.tsx` — `LangProvider` (v layoutu) + `useLang()` / `useT()`.
  - `app/page.tsx` prepisan kot **client** komponenta, bere slovar; mock-vizuali (kartonček, mini-dashboard)
    imajo lokalni `MISC` po jeziku.
  - Privzeto SLO (SSR), zato Google indeksira SLO; HR/EN prek gumba.
- **Enak header + footer na VSEH straneh** (zahteva uporabnika):
  - `app/components/SiteHeader.tsx` (logo + nav + jezikovni preklopnik + CTA) in `SiteFooter.tsx`.
  - Landing, **/kontakt** in **pravne strani** (prek `LegalShell`) zdaj uporabljajo iste.
- **Kontakt polepšan + trijezičen**: mini kartice »kaj ti postavimo« (stran / kolo sreče / QR plakat),
  badge »14 dni brezplačno«, vsa polja iz slovarja.
- Pravna **besedila** zaenkrat ostajajo SLO (chrome je trijezičen) — TODO: prevod HR/ANG.
- Build čist (19 strani), lokalni smoke-test: preklop EN/HR zamenja kopijo, header/footer 200 na vseh, brez console napak.

### 2026-06-20 — seja 27 (rename, cene, pravne strani, kontakt, widget)
- **Srečno kolo → Kolo sreče** povsod (landing, dashboard, widget label).
- **Cene 29,99 € / 69,99 € / po dogovoru**; trial **14 dni** + **promo trak** na vrhu landinga.
- **lib/brand.ts** — ime znamke centralizirano (`BRAND="Žig"` ZAČASNO; spremeniš na enem mestu →
  posodobi se v footer/pravne/kontakt/nav). Footer prenovljen (stolpci Produkt/Podjetje/Pravno + spodnja vrstica).
- **Pravne strani** (`/pogoji`, `/zasebnost`, `/piskotki`) prek `LegalShell` (topla tema, osnutek + opomba
  za pravni pregled).
- **Kontaktni obrazec** `/kontakt` (ime, lokal, email, telefon, tip lokala, mesto, št. gostov, kje slišal,
  sporočilo) → `/api/lead` → tabela **`leads`** (migracija `0005_leads.sql`, pognana v živo, RLS samo
  service-role). Demo fallback če ni baze.
- **Vgrajen Kolo-sreče widget na landingu** (`public/widget.js` prek next/script — plavajoči gumb
  »🎡 Zavrti kolo sreče« → iframe `/embed/demo`).
- Build čist (19 strani). Push → Vercel auto-deploy.

### 2026-06-20 — seja 26 (cene + funkcije fino)
Po uporabnikovem feedbacku: **cene** Espresso 30€ / Doppio 50€ / Veriga po dogovoru (ni več 0€ tier);
**30-dnevni brezplačni preizkus** (badge + CTA "Začni 30 dni brezplačno"). **Funkcije sekcija
prenovljena** — benefit naslovi ("Mimoidoče spremeni v stalne goste" …) + oznaka funkcije (chip) +
daljši, bolj marketinški opisi + lepše kartice (barvna ikona, 3-stolpčni grid). Build čist; push → deploy.

### 2026-06-20 — seja 25 (landing + paketi prenovljeni za nov produkt)
Landing zdaj odraža **cel produkt**, ne le žige:
- **Hero reframe:** badge "Zvestoba · Google ocene · marketing"; podnaslov poudari pripelji-nazaj
  (rojstni dnevi/win-back/SMS-email) + Google ocene.
- **Nova sekcija "Funkcije"** (id `#funkcije`, v navigaciji): srečno kolo, win-back kampanje,
  rojstnodnevne nagrade, SMS+email kampanje, kuponi z veljavnostjo, analitika+profili gostov.
- **Google-ocene highlight z GRAFOM** (mesečna rast novih ocen, 3,9★→4,8★, +86 ocen).
- **Anti-fraud sekcija ODSTRANJENA** (per [[loyalty-app-strategy]] — varnost ni wedge).
- **PRICING posodobljen:** Doppio (29€) zdaj = Google ocene autopilot + win-back/rojstni avtomatizacije
  + SMS/email segmenti + profili gostov; Veriga = + eBlagajna preverjanje + API.
- **FAQ reframe:** dodani Google ocene / win-back / strošek SMS; manj anti-fraud.
- Lokalni build čist (vse rute). Push → Vercel auto-deploy.

### 2026-06-18 — seja 24 (🚀 DEPLOY V ŽIVO + baza povezana)
**App je v živo na Vercelu.** Uporabnik importal repo prek Vercel dashboarda (git integration →
auto-deploy ob vsakem `git push`). Projekt `loyalti-app`, produkcijski URL
**https://loyalti-app-blond.vercel.app**.
- Vercel CLI nameščen; **VERCEL_TOKEN** shranjen v `.env.local` (gitignored). Projekt linkan.
- **3 Supabase env vari** nastavljeni v Vercel (Production, encrypted): `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` → `vercel deploy --prod` →
  **BAZA POVEZANA**: test register na produkciji vrne pravi UUID (potrjeno + počiščeno).
- HTTPS → **kamera/skener zdaj dela na telefonu** (prej blokiran na localhost/IP).
- `/demo`, `/demo/dashboard`, `/p/demo/spin` vse 200 v živo. Lokalni `next build` čist (14 strani).
- **Domena:** priporočeno **zigaj.si** (prosta, ~$25/leto). Kupi uporabnik → jaz povežem (Vercel
  Settings → Domains + DNS). Za zdaj `*.vercel.app`.

> **Handoff (PC #2):** `.env.local` zdaj poleg Supabase potrebuje tudi `VERCEL_TOKEN=vcp_…` (za CLI
> deploy/env). Vercel projekt že obstaja (`loyalti-app`); `vercel link --project loyalti-app`.

### 2026-06-18 — seja 23 (Nastavitve razdeljene na pod-sekcije)
Nastavitve so postale predolg seznam → **pod-navigacija** (chipi): **Osnovno** (aktivacija, gostova stran,
model nagrajevanja, nagrade, profil), **Kolo** (editor srečnega kolesa — svoja sekcija, kot želel user),
**Zasloni gostov** (zadetek / prijava / kupon / kartonček editorji). Preverjeno: preklop sekcij pokaže prave
kartice, ostale skrije. tsc čist (preostale napake le v generiranem `.next/dev/types`, se osvežijo ob buildu).

### 2026-06-18 — seja 22 (editor "Kartonček" — pregled 5. zaslona)
Dodan editor zaslona **"Kartonček"** (podnapis / besedilo skeniraj-gumba / naslov kuponov; ime-logo-žigi-
nagrade prihajajo iz Gostova-stran/Model/Nagrade editorjev). Skupaj **5 editorjev gostovih zaslonov**
(kolo, zadetek, prijava, kupon, kartonček). tsc čist; preverjeno v /demo/dashboard. Ostane pregled:
skeniranje → uspeh → Google-ocena gate → unovčenje (server timer).

### 2026-06-18 — seja 21 (editorja "Prijava" + "Kupon" — cel acquisition flow urejljiv)
Dodana editorja zaslonov **"Prijava"** (naslov/opis/Google gumb/telefon gumb/drobni tisk) in **"Kupon"**
(naslov/opis/veljavnost/navodilo/gumb). S tem ima **vseh 4 zaslonov acquisition flowa svoj editor**
(Srečno kolo → Zadetek → Prijava → Kupon) v Nastavitvah. Pregledani vsi 4 zasloni prek faithful
widgetov. tsc čist; 4 editorji preverjeni v /demo/dashboard. Naslednje: druga polovica gostove
izkušnje — kartonček zvestobe + skeniranje + unovčenje (po "Na mojo stran zvestobe").

### 2026-06-18 — seja 20 (editor zaslona "Zadetek")
Pregled gostove izkušnje 2. zaslon: dodan **editor zaslona "Zadetek"** v Nastavitvah (za "Srečno kolo"):
naslov / opis / naziv nagrade / vrednost-veljavnost / besedilo gumba + **živ predogled**. Vzorec: vsak
gostov zaslon dobi svoj editor besedil. tsc čist; preverjeno v /demo/dashboard.

### 2026-06-18 — seja 19 (editor prvega zaslona / srečnega kolesa)
Razširjen "Srečno kolo" → **editor prvega zaslona** (Nastavitve): besedila (naslov / podnapis / značka),
6 polj z izbiro **ZMAGOVALNEGA polja** (★ = na kaj kolo vedno pristane → "Vedno pristane na: X"), opomba
da se **barva/ime/logo vzamejo iz 'Gostova stran'** (en sam vir za celo gostovo izkušnjo). Začeli pregled
gostove izkušnje korak za korakom (prvi zaslon = SpinFlow); odprto vprašanje **poenotenja dveh koles**
(SpinFlow /spin vs starejše kolo v GuestApp /p/[code]). tsc čist; editor preverjen v /demo/dashboard.
Opomba: editor je zaenkrat demo-stanje — vezava na živi SpinFlow (venue shrani konfig kolesa, SpinFlow
bere) = naslednji korak pri pravem priklopu.

### 2026-06-18 — seja 18 (logo, kustomizacija, detajlna analitika, profil gosta)
- **Gostova stran:** logo upload (+ živ predogled kartice), pozdravno sporočilo, toggle "prikaži kolo" —
  več kustomizacije strani, ki jo gost vidi.
- **Analitika kampanj detajlna:** per kampanja poslano / vrnili / kupon uporabljen (+ povp. dni) / poteklo.
- **Profil gosta:** klik na stranko (Marketing) → modal: obiski/točke/poraba/povp. razmik/najraje +
  seznam vseh skeniranj + unovčenj + gumb "Pošlji osebno sporočilo". (DEMO_PROFILE)
- tsc čist; preverjeno v `/demo/dashboard` (logo/welcome/preview, detajli kampanj, profil-modal).

### 2026-06-18 — seja 17 (Marketing v3 — kuponi/kanali/analitika)
- **Kampanje: priloži kupon** (izbira nagrade + veljavnost dni) v composerju; shranjene kampanje
  hranijo tudi kupon+veljavnost (naloži/posodobi).
- **Avtomatizacije: kanal SMS/Email** per avtomatizacija (poleg dni/kupona/veljavnosti/opomnika/sporočila).
- **Google review link** nastavitev v "Gostova stran" + razlaga (gumb "Oceni na Googlu" odpre javno
  Google oceno lokala; link iz Google Business Profile → naravnost v okence za oceno).
- **Analitika: "Uspešnost kampanj"** kartica (stopnja vrnitve po kampanji, vrnitve/poslano).
- tsc čist; vse preverjeno v `/demo/dashboard`.

### 2026-06-18 — seja 16 (Marketing v2 + Google-ocene gate)
- **Google-ocene popup** nadgrajen na **5-zvezdični gate**: 4–5★ → Google ocena (pravi Google gumb),
  1–3★ → zasebno mnenje (review-gating, slabe prestrežemo). V GuestApp success ekranu. Uporabniku
  prikazan inline interaktiven mockup.
- **Avtomatizacije urejljive** ("Uredi"): dnevi sprožitve (npr. po 21 dneh / X dni pred rojstnim dnem),
  sporočilo, **priloži kupon** (izbira nagrade) + **veljavnost (dni)** + **opomnik pred potekom (dni)**.
- **Kampanje shranjene/poimenovane**: naloži (klik) / izbriši (×) / "Shrani" (novo ime = nova, isto =
  posodobi). Predloge → prave shranjene kampanje.
- tsc čist; preverjeno v `/demo/dashboard` (avtomatizacije editor + 4 shranjene kampanje + ime/Shrani).

### 2026-06-18 — seja 15 (#8 backend žigi-cikel — VSI QA taski #1–#8 končani)
`award_scan` posodobljen: dodan `p_card_goal` + vrača `(total, card_completed)`; ko skeniranje doseže
cilj kartončka, resetira točke z ostankom (carryover). `/api/scan` izračuna cilj (per_visit = najmanjša
nagrada; per_euro = 0), pošlje `p_card_goal`, prebere `card_completed`, vrne `cardCompleted` + `cardReward`.
`GuestApp` (real scan) ob `cardCompleted` podeli kupon v denarnico + completion ekran (kot demo).
Migracija `0004_card_cycle.sql` (drop+recreate, return type → tabela; pognana v živo). **Preverjeno prek
RPC:** scan1 = 15/false, scan2 = 0/true (reset z ostankom). tsc čist. → **Žigi zdaj delajo tudi v živo**,
ne le v demu. (Opomba: kuponi so še v localStorage = per-naprava; server-side coupon tabela = morebitna
kasnejša nadgradnja za multi-device.)

### 2026-06-18 — seja 14 (QA tasks #2–#7 — prenova demo dashboarda)
- **#2 Marketing v nulo:** avtomatizacije (Google ocene / win-back / rojstni dan, on/off), **nova
  kampanja** s kanalom **SMS/Email** + segmenti (število prejemnikov po kanalu) + predloge +
  **STROŠEK-ESTIMATOR** (X × 0,07 € = Y €, email zastonj) + zgodovina kampanj.
- **#3 pomoč-(?):** nova `HelpDot` komponenta + razlage na naslovih (model nagrad, QR, aktivacija,
  nagrade, kolo, obdobje, avtomatizacije).
- **#4 Zgodovina "Unovčene"** toggle zdaj dela (+ prava zgodovina unovčenj, DEMO_REDEMPTIONS).
- **#5 Analitika** izbirnik obdobja (1/7/30/Vse).
- **#6 wheel editor** (6 polj) v Nastavitvah.
- **#7 "Gostova stran"** urejanje (ime/podnapis/barva) v Nastavitvah.
- Vse v **demu** (prodajni pitch surface). tsc čist; vsi zavihki preverjeni v `/demo/dashboard`.
- Ostane **#8** (backend žigi-cikel v živo) + mirror v pravem owner Dashboardu (sledi).

### 2026-06-18 — seja 13 (QA: model nagrad razdeljen — task #1/7)
Po obsežnem QA uporabnika (cel seznam → task lista #1–#7). Najprej **#1: gostova stran ne meša več
modelov** — pokaže SAMO `venue.points_model`:
- **per_visit (žigi):** kartonček + žigi, BREZ menija točk; ob 10/10 → 🎉 animacija + kupon za nagrado
  v denarnico (stackable) + reset z ostankom točk.
- **per_euro (točke):** točke + meni nagrad (odštevanje ob unovčenju), BREZ kartončka.
- Preverjeno: `tsc` čist; `/p/demo` (per_visit) renderira kartonček "0/10 žigov" + "Še 10 obiskov do
  brezplačne kave", brez menija točk. ⚠️ **Real žigi-cikel (reset + auto-kupon ob 10/10) zaenkrat dela
  le v DEMO** — pravi `/api/scan` še akumulira točke brez reseta → rabi backend (RPC). Dodano kot task.
- Preostali QA tasks (pending): Marketing v nulo (SMS+email, cost estimator, avtomatizacije),
  pomoč-(?) povsod, Zgodovina "Unovčene" toggle, Analitika izbirnik obdobja, wheel editor, profil.

### 2026-06-17 — seja 12 (roadmap dodatki — demo-first)
Dodani 4 dodatki, **demo-first** (vidni v walkthroughu; pravo SMS/email pošiljanje ostane post-yes stikalo):
- **Google ocene autopilot — PRAVA:** na gostovem success ekranu "Kako ti je bilo?" → 😊 odpre Google
  oceno (`venue.google_review_url` ali fallback iskanje po imenu), 🙁 prestreže zasebno (review-gating).
  Dashboard Marketing: autopilot kartica (zaprošene / nove ocene / ocena ★).
- **Rojstni dnevi** — dashboard kartica (prihajajoči + avtomatska ponudba). Demo.
- **Win-back** — Marketing preset gumb (segment Neaktivni + template). Demo.
- **Analitika "Kdo pada stran"** (churn) kartica iz podatkov o obiskih. Demo.
- `Venue` tip dobil opcijski `google_review_url`. Demo podatki v `lib/demo.ts` (DEMO_REVIEW/BIRTHDAYS/CHURN).
- Preverjeno: `tsc` čist; vse 4 kartice renderirajo v `/demo/dashboard` (Analitika + Marketing).

### 2026-06-17 — seja 11 (demo walkthrough za prodajo)
Cel prodajni walkthrough, **dosegljiv BREZ prijave** (da ga lastniku odklikaš na telefonu):
- **`/demo`** — hub: uokvirja "kaj dobiš" (4 owner wins) + gumba **Pogled gosta** (`/p/demo/spin`) in
  **Pogled lastnika** (`/demo/dashboard`).
- **`/demo/dashboard`** — `DashboardDemo` brez prijave (prej `/dashboard` → `/partner` login, ker je
  Supabase vklopljen). Odpre na **Analitiki** (vrednost najprej). Dodan `initialTab` prop v DashboardDemo.
- Preverjeno: vse rute **200**, vsebina ok (hub naslov + oba gumba; dashboard 482 skeniranj / 137
  strank / top stranke). Screenshot tool timeout (znano okolje) → preverjeno prek snapshota/HTTP.
- Opomba: po menjavi rut spet trčil v zastarel `.next` (dinamične 404) → `rm .next` + čist restart rešil.
- v1 ostaja zaključen; brez novih featurjev — to je prodajno orodje. Naslednji korak = sporočilo sinu.

### 2026-06-17 — seja 10 (STRATEŠKI PREMIK)
Po ločeni Claude seji + premisleku uporabnika: **VARNOST NI wedge.** Konkurenca tudi dedupa;
pristnosti ZOI (resničen vs izmišljen) brez FURS/POS ne preveri nihče → v receipt-scan modelu
varnostne prednosti ni za nikogar. Črtamo pitch "mi preverjamo, oni ne".
- **Wedge = produkt + lokalna osebna prodaja.** Asset = ujeti redni gostje + kontakti + obiski.
- **Roadmap dodatki** (Google-ocene autopilot #1, win-back, rojstni dan, analitika) reuse-ajo isto
  bazo — **PITCH/roadmap, NE v1.** Gradi šele po prvem plačujočem "ja".
- **v1 = receipt-scan + dedup + davčna + čas + cap** (pariteta + kanček), ship + dobi prvi lokal.
- **POS/eBlagajna = post-yes opcija** (scaffold zgrajen, ostane parkiran; NI v1, NI prodajni argument).
- Pilotni pitch `docs/pilot-email-tiktak.md` **prepisan** z varnosti na IZID + zero-truda.
- **NASLEDNJI KORAK ni koda — je sporočilo sinu (TikTak, Črnomelj).** Prvi "ja" je edino, kar šteje.

### 2026-06-15 — seja 9
**"Poveži blagajno" UI + kupon-popust adapter (oboje neodvisno od ZOI-vprašanja).**
- `app/dashboard/PosConnectCard.tsx` — kartica v avtenticiranem Dashboardu (zavihek **Nastavitve**):
  3 polja (`bu_uid`, `client_id`, `client_secret`), GET stanje / POST poveži (kliče `testConnection`
  PRED shrambo) / DELETE prekliči. Varnostno sporočilo (ključ šifriran, samo strežnik, preklic
  kadarkoli, zahtevaj read-only). Vezano na varen `/api/pos` (owner-auth).
- Kupon-v-transakciji: dodan adapter stub `applyCouponDiscount` (predvideno `POST
  /orders/{id}/articles` z `discount`) — **ČAKA eBlagajna Q4**. Opomba: screen-record je **že
  preprečen** z obstoječim flowom (osebje potrdi + single-use + 5-min server iztek prek
  `confirm_redemption`); eBlagajna popust v transakciji je le nadgradnja.
- Preverjeno: `tsc --noEmit` čist; `/dashboard` → 307 na `/partner`; `/api/pos` 401 brez prijave.
  Živ connect rabi pravega ownerja (prijava na /partner) + prave eBlagajna creds.

### 2026-06-15 — seja 8
Pregledan **cel eBlagajna OpenAPI spec** (uporabnik prilepil). Ključne ugotovitve:
- **🔴 NI iskanja po ZOI.** `GET /invoice/{connection_id}` vrne `additional.zoi`+`eor`+`price`+
  `time_closed`+`cmp_data.taxnum`, a **samo po `connection_id`** — ni iskanja po ZOI/EOR ne seznama
  računov. `GET /orders` je paginated (samo `page`, ni datumskega filtra). → **"skeniraj račun →
  preveri po ZOI" ne mapira direktno na eBlagajno.** Odprto: ali GET /orders vključuje nedavne ZAPRTE
  račune sortirane po času (enumerate + match ZOI).
- **Varnost bolje kot mišljeno:** pravice so **per-credential** ("tied to this UID and your
  credentials") → eBlagajna **lahko izda omejen read-only ključ**. DELETE = **soft-delete**.
- **Kupon-v-transakciji izvedljiv:** `POST /orders/{id}/articles` ima `discount`; loyalty rule
  `rule_data{percent, apply_to:invoice}`; card balance `/customers_loyalty_status`.
- Posodobljen `docs/eblagajna-questions.md` (kaj vemo + 5 ostalih vprašanj; ZOI-resolucija = #1).
  `verifyReceipt` ostaja stub. **Strateški fork** (če ZOI-lookup ni mogoč): A) eBlagajna-native
  loyalty (gost prepoznan na blagajni — airtight, spremeni UX) vs B) scan + heuristike.

### 2026-06-15 — seja 7
**POS verifikacija — ogrodje + raziskava (pot do "ponaredek nemogoč").** Strateška odločitev: pravi
moat = preverjanje računov PRI VIRU (blagajna lokala), ne heuristike. Strict-mode (seja-6 ideja)
**opuščen na željo uporabnika** (parkiran, ne commitan).
- **Raziskava eBlagajna API** (api.eblagajna.com): OAuth2 `client_credentials` → Bearer (poteče 1h),
  dostop per `bu_uid`. `GET /invoice/{connection_id}` vrne ZOI+EOR+znesek+čas. Loyalty/popust
  endpointi (`loyalty_groups`, `rules`, card balance, popust scope `invoice`). **⚠️ KLJUČNO za varnost:
  javno NI granularnih (read-only) scope-ov** — en ključ odpre VSE endpointe BU (vključno
  `POST /invoice` fiskalizacija, `DELETE /orders`, `/users`). Zato varnostni poudarek + vprašanja.
- **Zgrajeno (provider-agnostično):** `lib/pos/` — `crypto.ts` (AES-256-GCM, ključ `POS_ENC_KEY`
  izven baze), `types.ts` (PosAdapter), `eblagajna.ts` (adapter: `getToken` dela, `verifyReceipt`
  STUB), `index.ts` (factory). Tabela **`pos_connections`** (`secret_enc` šifriran; RLS brez politik =
  samo service-role; migracija `0003_pos_connections.sql`, pognana v živo). API **`/api/pos`**
  (POST poveži / GET stanje / DELETE prekliči) z **owner-auth** (samo lastnik lokala; NIKOLI ne vrne
  secreta). Preverjeno: brez prijave 401, crypto round-trip OK (plaintext ni v zapisu).
- **ODPRTO (čaka eBlagajno):** `verifyReceipt` je stub — `GET` je po `connection_id`, ne vemo še, kako
  poiskati račun po skeniranem **ZOI**. Vprašanja: `docs/eblagajna-questions.md` (scope/read-only,
  OAuth-connect, iskanje po ZOI, kupon-v-transakciji, cena, sandbox).
- **Pilot:** TikTak Cafe **Črnomelj (SLO, NE Hrvaška)** → SLO ZOI velja. Osnutek emaila
  `docs/pilot-email-tiktak.md`; najprej preverit, ali uporabljajo eBlagajno.
- **Handoff:** `.env.local` zdaj rabi tudi `POS_ENC_KEY` (32-byte hex). Mora biti **konsistenten**, ko
  bodo realne POS povezave (sicer dešifriranje odpove); zaenkrat povezav še ni.

### 2026-06-15 — seja 6
**Prijava brez stroška na registracijo** (odločitev: SMS OTP @ ~7c/registracijo je predrag, ko je cilj
čim več prijav). Novo: **Google (pravi OAuth) + telefon BREZ kode**.
- **Odstranjen SMS OTP korak** v SpinFlow (state machine zdaj wheel→won→register→coupon). Telefon:
  vpiše številko → "Prevzemi nagrado" → naravnost kupon. Nič SMS-a, €0.
- **Google** = pravi Supabase OAuth (`signInWithOAuth`, redirect na `/p/[code]/spin?gwin=1`; ob vrnitvi
  `useEffect` vzpostavi sejo → `/api/register` po emailu → kupon). Brezplačen, neomejen. ⚠️ RABI še
  **enkraten setup**: Google Cloud OAuth Client ID/Secret + omogočiti Google provider v Supabase
  (Management API). Dokler ni: gumb pokaže "Google prijava še ni nastavljena. Uporabi telefonsko."
- **Dedupe**: `/api/register` poišče obstoječo stranko po telefonu, sicer po emailu (lowercase
  normaliziran). Migracija `supabase/0002_email_unique.sql` → `unique (venue_id, email)` (idempotentno).
- **Anti-fraud nagrade**: kupon dobrodošlice 1× na napravo (`loyalty:{code}:welcomeClaimed`) + 1× na
  identiteto (DB unique telefon/email). Pravi ščit = dedupe, ne OTP; unovči se v lokalu pred osebjem.
- **Preverjeno V ŽIVO** (preview): telefon flow → customer v Postgres (pravi UUID); dedupe telefon 2×
  → isti id; email case-insensitive → isti id. Testne stranke počiščene.
- **SMS** pustimo izključno za kasnejše marketing kampanje (plačaš samo ob pošiljanju ponudbe z ROI).

### 2026-06-15 — seja 5
**Fix: animacija vrtenja kolesa (SpinFlow) ni delovala.** Vzrok: rotacija je bila na SVG `transform`
**atributu** (`<g transform="rotate(...)">`) — CSS `transition` animira samo CSS *property-je*, NE SVG
atributov, zato je kolo preskočilo brez animacije. Popravek: rotacijo zdaj nosi **wrapper `<div>`
okoli SVG-ja** prek CSS `transform: rotate(Ndeg)` + `transition: transform 4.4s cubic-bezier(...)`
(zunanji obroč + pesto sta simetrična kroga → vrtenje neopazno; kazalec in ZAVRTI gumb sta zunaj
vrtečega diva). Mehanika preverjena: klik → div dobi `rotate(2127deg)` (5 obratov + pristanek na
"Brezplačna kava") → po 4.4s preklop na "Zadetek". Opomba: preview brskalnik globalno onemogoča CSS
prehode (tudi navaden div tam ne animira), zato vizualne animacije ni mogoče potrdit v orodju — dela
pa v pravem brskalniku.

### 2026-06-14 — seja 4
Implementiran **Spin Page** design (SpinFlow.dc.html). Nova komponenta `app/components/SpinFlow.tsx` —
5-koračni flow: 🎡 kolo (6 polj, rigged na "Brezplačna kava") → 🎉 zadetek → prijava (**Google ALI
telefon**) → **SMS OTP keypad** (4-mestna koda) → 🎟️ kupon ticket (QR + koda). Vezano na pravo
registracijo: OTP/Google → `/api/register` → customerId + kupon v localStorage → "Na mojo stran
zvestobe" (/p/[code]). Nova dedicated stran **`/p/[code]/spin`** (brendirano temno gradient ozadje).
Embed widget `/embed/[code]` zdaj uporablja SpinFlow; `EmbedWheel.tsx` odstranjen. Build čist, rute 200.
OTP in Google sta zaenkrat **mock** (pravi SMS ponudnik + Google OAuth = faza 2). Opomba: GuestApp ima
še starejše preprosto kolo pred registracijo — možno poenotiti (preusmeri na /spin).

### 2026-06-14 — seja 3
**Supabase POVEZAN v živo** (projekt ref `xlcmeaeiyapwblivqolo`, ime LoyaltyAPP). Prek Management API
(Personal Access Token shranjen v `.env.local`): pobrani API ključi → zapisani v `.env.local`,
pognana `supabase/schema.sql` (tabele/funkcije/RLS/seed), izklopljen email-confirm (autoconfirm),
demo lokal reseediran na topli design (Kavarna Moka, 15 točk, kava/rogljiček/torta). **Cel flow
PREVERJEN prek HTTP s pravim Meso Meso računom:** register → scan (+15, izdajatelj OK) → dedup
("že unovčen") → točke v Postgresu. Dodani skripti `scripts/sb-sql.mjs` (poženi poljuben SQL/migracijo
prek API; bere token iz .env.local) in `scripts/sb-autoconfirm.mjs`. Testni podatki počiščeni.

> **Priklop na drugem PC-ju:** `.env.local` je gitignored (NE gre na GitHub). Na PC #2 ustvari
> `.env.local` z `SUPABASE_ACCESS_TOKEN=sbp_...` (+ `NEXT_PUBLIC_SUPABASE_URL=https://xlcmeaeiyapwblivqolo.supabase.co`),
> nato Claude pobere ostale ključe sam (`node scripts/sb-sql.mjs` uporablja isti token). Migracije
> odslej: dopiši v `supabase/schema.sql` ali ločen .sql in poženi `node scripts/sb-sql.mjs pot.sql`.

### 2026-06-14 — seja 2
Implementiran NOV namenski **landing** (Landing.dc.html): desktop marketing stran — sticky nav z
blur, hero z nagnjeno kartico + plavajočimi chip-i (+15 točk, Kava po izbiri), "Kako deluje" 3
koraki, sekcija dashboard preview (temna), žig-story (opečnat gradient), anti-fraud 4 kartice, cene
(**Espresso 0€ / Doppio 29€ / Veriga po dogovoru**), FAQ (5), finalni CTA, footer. PRICING v
lib/demo.ts posodobljen na nove pakete; `/cenik` zdaj preusmeri na `/#cene` (cenik je sekcija
landinga). Dodane ikone (shield/home/arrowR/star2) + floaty animaciji. Build čist, `/` 200.
Opomba: preview screenshot tool je bil v tej seji nedelujoč (stran sicer renderira pravilno).

### 2026-06-13 — seja 1
Od nič zgrajen cel MVP v demo-mode: design system, gostova izkušnja (wheel, kartonček, skener,
2-step unovčenje + server timer, kuponi), demo dashboard (5 zavihkov), cenik, embed wheel widget
+ widget.js. Supabase shema + API rute pripravljene (še ne priklopljene). Build čist, vse rute 200.
Inicialni push na GitHub (main, 53 datotek). Dodan ta DEVLOG sistem.
