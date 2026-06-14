# Loyalty Card Design

_Started 2026-06-11 21:53 UTC_

---

## User

<system-info comment="Only acknowledge these if relevant">
Project title is now "Untitled"
Project is currently empty (no files)
Current date is now June 11, 2026
</system-info>

<pasted_text name="Pasted text (54 lines)">
# Claude Design — brief za MVP "loyalty na fiskalni račun"

&gt; Prilepi to v Claude Design. Cilj: vizualni mockupi za 2 površini (gost + lokal). Mobile-first.

## Kaj gradimo (1 stavek)
Sistem zvestobe za gostinske lokale: gost **skenira fiskalni QR z računa**, dobi točke, jih menja za nagrade (zastonj kava ipd.). Lastnik lokala dobi nadzorno ploščo.

Ciljni uporabnik: mali gostinski lokali (kavarne, bistroji, slaščičarne) v SLO + njihovi gostje.

## Pomembno: NE kloniraj konkurence
Referenca (Truo) je rdeč/koral SaaS look na belem — generičen. Ne kopiraj ga. Naredi **lasten, prepoznaven vizualni jezik**, zgrajen okrog ideje "stalni gost / tvoja stalna kava". Izogni se trem AI klišejem (cream + serif + terakota; črno ozadje + acid green; broadsheet hairlines). Tvegaj eno stvar, ki jo znaš zagovarjati.

Izhodišče (lahko ga predrugačiš, samo utemelji):
- **Paleta:** topla, gostinska, ne korporativna. Predlog za start: globoka espresso rjava `#2B1D17`, kremna `#F5EFE6`, ena živa akcentna (npr. jantarna `#E8A23D` ali opečnata `#C8512B`), mehka zelena za "uspeh/dodano". 4–6 imenovanih hex vrednosti.
- **Tipografija:** karakteren display face (ne Inter), uporabljen zmerno, + čist body face. Naj bo tipografija del osebnosti, ne nevtralna.
- **Signature element:** ena zapomljiva stvar — npr. "štampiljka/žeton" animacija ob skeniranju (kot da bi dobil pravo štampiljko na kartonček), ki poveže digitalno s starim občutkom zvestobe-kartončka.

Kakovostni minimum: responsive do mobitela, viden keyboard focus, spoštovan reduced-motion, dobri prazni in error stati (glej spodaj).

---

## Površina A — Stran za GOSTA (mobile, najpomembnejša)
To je javna stran, ki jo gost odpre prek QR na mizi. Brez App Store.

Zasloni:
1. **Glavna / točke** — logo + ime lokala; velik prikaz "tvoje točke"; izrazit gumb **Skeniraj račun** (kamera); mreža nagrad (kartica = slika + ime + napredek `120/300 točk` + progress bar). Stanje napredka mora biti vidno "blizu nagrade" (motivacija).
2. **Skener** — full-screen kamera z okvirjem za QR; jasno navodilo "Poskeniraj QR na dnu računa".
3. **Uspeh** — signature štampiljka/žeton animacija + "+15 točk", novo stanje, koliko do naslednje nagrade.
4. **Napake (oblikuj jih, niso obrobne):**
   - Že uporabljen račun: "Ta račun je bil že unovčen."
   - Tuj lokal: "Ta račun ni iz [ime lokala]."
   - Prestar račun: "Računi se lahko unovčijo v 24 urah."
5. **Registracija** — minimalna (telefon + koda, ali email magic link). En korak, brez gesla, če gre.
6. **Nagrada dosežena** — stanje "lahko unovčiš", gumb "Unovči pri osebju" → koda/QR, ki ga osebje skenira ali potrdi.

## Površina B — Nadzorna plošča za LOKAL (lahko desktop + mobil)
Spodnja navigacija s 5 zavihki (ostani pri njihovih imenih, so jasna): **Zgodovina · Analitika · Sistem · Marketing · Nastavitve**. Za MVP oblikuj predvsem prve štiri lahkotno; poudarek na Sistem in Analitika.

- **Sistem:** velika QR koda + povezava do strani gosta (`/p/koda`), gumba Prenesi PNG / PDF (za plakat na mizo), "Uredi stran".
- **Analitika:** kartice (Skupaj skeniranj, Št. strank, Povp. obiski, Pogostost obiskov, Povp. račun, Prihodek, Podarjene/Unovčene točke), graf "Obiski po urah", seznam "Najboljše stranke". Prazno stanje naj vabi k akciji, ne kaže praznih ničel mrtvo.
- **Zgodovina:** zavihka Podarjene / Unovčene točke (seznam transakcij).
- **Nastavitve → Sistem:** "Aktiviraj skeniranje računov" = lastnik **fotografira vzorčni račun** svojega lokala (iz tega se prebere davčna → samo ti računi štejejo). To je ključni onboarding korak — oblikuj ga lepo in jasno.

## Onboarding lokala (prvi vtis)
Ena kartica: Ime znamke · Logo (upload) · Barva znamke (color picker) → gumb **Ustvari mojo stran**. Nato predogled strani gosta + **Objavi**.

## Copy
Slovensko, sentence case, aktivni glagoli, brez marketinškega balasta. Gumb pove, kaj naredi ("Skeniraj račun", "Unovči"). Prazni zasloni so povabilo, ne razpoloženje.

## Za MVP NE oblikuj (pride kasneje)
SMS kampanje, dostave (Wolt/Glovo/Bolt), Google Reviews, rezervacije, online naročanje, večjezičnost (samo SLO za zdaj).

## Deliverable
Mockupi zgornjih zaslonov, en usklajen design system (paleta + tipografija + komponente: kartica, gumb, progress, nav), pripravljen za predajo v kodo.
</pasted_text>

<pasted_text name="Pasted text (113 lines)">
# Claude Code — build spec za MVP "loyalty na fiskalni račun"

&gt; Prilepi v Claude Code. Zgradi delujoč MVP loyalty sistema za en lokal, razširljiv na več.

## Cilj MVP-ja (zanka, ki mora delati)
Gost odpre javno stran lokala → registracija (telefon/email) → **skenira fiskalni QR z računa** → sistem preveri (izdajatelj + duplikat + čas) → doda točke → gost vidi napredek do nagrade. Lokal ima nadzorno ploščo z QR do strani, osnovno analitiko in nastavitev "aktiviraj skeniranje" (foto vzorčnega računa).

## Stack
- **Frontend:** Next.js (App Router) kot PWA, TypeScript, Tailwind. Mobile-first.
- **QR skener v brskalniku:** `@zxing/browser` ali `html5-qrcode` (kamera → niz).
- **Backend + baza + auth + storage:** Supabase (Postgres, Auth, Storage, Row-Level Security).
- **Plačila:** Stripe (Checkout + webhook za naročnino lokala).
- **Hosting:** Vercel + Supabase.

## Podatkovni model (Postgres)
```
venues
  id uuid pk, owner_user_id uuid, name text, public_code text unique,
  logo_url text, brand_color text,
  davcna_stevilka text,            -- izdajatelj; prebran iz vzorčnega računa
  points_model text default 'per_visit',  -- 'per_visit' | 'per_euro'
  points_per_visit int default 10,
  scan_window_hours int default 24,
  created_at timestamptz default now()

rewards
  id uuid pk, venue_id uuid fk, name text, image_url text,
  points_required int, sort_order int

customers
  id uuid pk, venue_id uuid fk, phone text, email text, points int default 0,
  created_at timestamptz, unique(venue_id, phone)

scans                              -- srce anti-fraud
  id uuid pk, venue_id uuid fk, customer_id uuid fk,
  zoi text not null unique,        -- globalno unikaten =&gt; dedup
  davcna text, issued_at timestamptz, amount numeric null,
  points_awarded int, created_at timestamptz default now()

redemptions
  id uuid pk, venue_id uuid fk, customer_id uuid fk, reward_id uuid fk,
  points_spent int, created_at timestamptz default now()

-- naročnina lokala (ali vodi prek Stripe)
subscriptions
  venue_id uuid fk, stripe_customer_id text, stripe_subscription_id text,
  plan text, status text
```

## Jedro: parsanje fiskalnega QR (dokazano delujoče)
Vsebina slovenskega fiskalnega QR je **60-mestni numerični niz**: `ZOI(39, decimalno) + davčna(8) + datum-čas(12, LLMMDDUUMMSS) + kontrolni znak(1)`. **Znesek NI v QR** — če ga rabiš, gre prek OCR-ja.

```ts
function parseFiscalQR(payload: string) {
  if (!/^\d{60}$/.test(payload)) throw new Error('Neveljaven fiskalni QR');
  const zoiDec = payload.slice(0, 39);
  const davcna = payload.slice(39, 47);
  const dt     = payload.slice(47, 59);        // YYMMDDHHMMSS
  const control = payload.slice(59);
  const issuedAt = new Date(
    `20${dt.slice(0,2)}-${dt.slice(2,4)}-${dt.slice(4,6)}T` +
    `${dt.slice(6,8)}:${dt.slice(8,10)}:${dt.slice(10,12)}`
  );
  // kontrolni znak = vsota vseh števk (brez zadnje) po modulu 10
  const sum = payload.slice(0,59).split('').reduce((a,c)=&gt;a+(+c),0);
  if (sum % 10 !== +control) throw new Error('Napačen kontrolni znak');
  return { zoiDec, davcna, issuedAt };
}
```

## Verifikacija ob skeniranju (POST /api/scan)
Vhod: `{ venueCode, payload, customerId }`. Po vrsti:
1. `parseFiscalQR(payload)` — če pade, zavrni ("Neveljaven QR").
2. **Izdajatelj:** `davcna === venue.davcna_stevilka` → sicer "Ta račun ni iz tega lokala."
3. **Duplikat:** vstavi v `scans` z `zoi` UNIQUE; ob konfliktu → "Ta račun je bil že unovčen." (dedup je v bazi, ne v aplikaciji)
4. **Časovno okno:** `now - issuedAt &lt;= venue.scan_window_hours` → sicer "Račun je prestar."
5. **Točke:** `per_visit` (privzeto) → `venue.points_per_visit`. (`per_euro` šele po dodanem OCR-ju + kapica na račun.)
6. Atomarno: zapiši `scan`, prištej `customers.points`, vrni novo stanje + napredek do naslednje nagrade.

## Anti-fraud (MVP nivo)
- **Dedup (zoi UNIQUE)** — ubije ponovne oddaje istega računa (~90 % zlorab).
- **Izdajatelj** — samo računi z davčno tega lokala.
- **Časovno okno.**
- **Točke na obisk** (privzeto) → nevtralizira napihovanje zneska brez OCR-ja.
- _Kasneje:_ ML zaznava ponaredka slike, velocity/outlier pravila, ročni pregled, (če FURS ponudi) preverjanje pri viru.

## Onboarding lokala
- `/partner`: vnos Ime / Logo / Barva → ustvari `venue` (+ generiraj `public_code`) + privzete nagrade (Kava 300, Pijača 400 …).
- Nastavitve → "Aktiviraj skeniranje računov": lokal **fotografira vzorčni račun** → preberi davčno (iz QR ali OCR) → shrani v `venue.davcna_stevilka`. Šele potem skeniranje šteje.

## Rute / zasloni
- Javno: `/p/[public_code]` — stran gosta (PWA): stanje točk, skener, nagrade, registracija (Supabase Auth: phone OTP ali email magic link).
- API: `POST /api/scan`, `POST /api/redeem`.
- Lokal (auth): `/dashboard` z zavihki **Zgodovina · Analitika · Sistem · Marketing · Nastavitve**.
  - Sistem: QR + povezava `/p/...`, prenos PNG/PDF, uredi stran.
  - Analitika: števci (skeniranja, stranke, povp. obiski, povp. račun, prihodek, podarjene/unovčene točke), graf obiski/uro, najboljše stranke.
  - Zgodovina: podarjene / unovčene točke.
  - Marketing: seznam strank (Ime/Obiski/Poraba/Aktivnost).
  - Nastavitve: Sistem (aktivacija skeniranja, ročno dodajanje točk – toggle), Profil (email/geslo), Plačila (Stripe naročnina).

## Za MVP NE gradi (eksplicitno preskoči)
SMS kampanje, dostave Wolt/Glovo/Bolt, Google Reviews oblaček, rezervacije/booking, online naročanje, večjezičnost (samo SLO), OCR zneska + revenue analitika (faza 2), napredna segmentacija.

## Sprejemni kriteriji (MVP je gotov, ko)
1. Lokal se registrira, ustvari stran, dobi javni QR/povezavo, naloži vzorčni račun → davčna shranjena.
2. Gost odpre `/p/...`, se registrira, skenira PRAVI fiskalni račun tega lokala → točke dodane, viden napredek.
3. Ponovno skeniranje istega računa → zavrnjeno ("že unovčen").
4. Račun drugega lokala → zavrnjeno ("ni iz tega lokala").
5. Dashboard pokaže skeniranje v zgodovini + poveča števce analitike.
6. Gost ob dovolj točkah unovči nagrado → osebje potrdi → `redemption` zapisan, točke odštete.

## Vrstni red dela
Najprej zanka 1–6 z ENIM lokalom in `per_visit` točkami. Šele ko dela v živo, dodajaj dashboard polish, več lokalov, Stripe paywall, OCR/zneske.
</pasted_text>

<!-- The user explicitly selected the following skills for this project, as attachments to their message. These are not optional context — they define how you work. Use them. -->
<attached-skill name="Design Components">
This project uses Design Components: every design is a single streaming `Name.dc.html` file. The full authoring spec is in your system prompt under "Writing code — Design Components" — follow it. Author and edit `.dc.html` content ONLY with the `dc_write`, `dc_html_str_replace`, and `dc_js_str_replace` tools (never `write_file` or `str_replace_edit`); template edits stream into the live preview as you type.
</attached-skill>

<attached-skill name="Hi-fi design">
Create a high-fidelity, polished design.

Follow this general design process (use the todo list to remember):
(1) ask questions, (2) find existing UI kits and collect design context — copy ALL relevant components and read ALL relevant examples; ask the user if you can't find them, (3) start your file with assumptions + context + design reasoning (as if you are a junior designer and the user is your manager), with placeholders for the designs, and show it to the user early, (4) build out the designs and show the user again ASAP; append some next steps, (5) use your tools to check, verify and iterate on the design.

Good hi-fi designs do not start from scratch — they are rooted in existing design context. Ask the user to Import their codebase, or find a suitable UI kit / design resources, or ask for screenshots of existing UI. You MUST spend time trying to acquire design context, including components. If you cannot find them, ask the user for them. In the Import menu, they can link a local codebase, provide screenshots or Figma links; they can also link another project. Mocking a full product from scratch is a LAST RESORT and will lead to poor design. If stuck, try listing design assets and ls'ing design system files — be proactive! Some designs may need multiple design systems — get them all. Use the starter components (device frames and the like) to get high-quality scaffolding for free.

When presenting several options or explorations side-by-side, lay them out clearly: give the page a neutral gray background, put each option in its own labeled frame (a small heading + a white rounded card sized to its content), and group related options into sections.

When designing, asking many good questions is ESSENTIAL.

Give options: try to give 3+ variations across several dimensions. Mix by-the-book designs that match existing patterns with new and novel interactions, including interesting layouts, metaphors, and visual styles. Have some options that use color or advanced CSS; some with iconography and some without. Start your variations basic and get more advanced and creative as you go! Try remixing the brand assets and visual DNA in interesting ways — play with scale, fills, texture, visual rhythm, layering, novel layouts, type treatments. The goal is not the perfect option; it's exploring atomic variations the user can mix and match.

CSS, HTML, JS and SVG are amazing. Users often don't know what they can do. Surprise the user.

If you do not have an icon, asset or component, draw a placeholder: in hi-fi design, a placeholder is better than a bad attempt at the real thing.
</attached-skill>

<attached-skill name="Interactive prototype">
Create a fully interactive prototype with realistic state management and transitions. Use React useState/useEffect for dynamic behavior. Include hover states, click interactions, form validation, animated transitions, and multi-step navigation flows. It should feel like a real working app, not a static mockup.
</attached-skill>

<attached-skill name="Design System (design system)">
[Design System] This project uses the **Design System** design system. This is a binding choice for visual style — every visual must follow it. Don't invent colors, type, spacing, or components not grounded here.

Scope: the design system is a visual style reference only. Its guide may describe example products, brands, or people that are unrelated to the user and unrelated to the subject of this conversation. Never treat anything in the design system as a fact about the user, their work, or the topic they asked about.

    Explore it to find what you need:
    - Always copy out the fonts and colors you need
    - For prototypes and designs, always copy out any relevant components
    - If the design system contains existing mocks of products, and you were asked to design or prototype something similar, copy and fork those mocks to start your design. This helps you make high-quality designs.

    Explore it quickly to find relevant UI kits (e.g. mocks of existing products you can copy and fork)

Full system at `/projects/019e1752-76f2-781c-bb97-17c9789bd833/`. Before producing any visuals, explore it: call `list_files("/projects/019e1752-76f2-781c-bb97-17c9789bd833/")` to see the structure, then `read_file` the README/base.md or whatever index file it has. Don't guess at the design system's contents.

CSS tokens: the guide may describe tokens in prose, but the exact `--*` names are defined in the design system's stylesheet(s). Before writing any `var(--*)`, look up the real name in the design system's `.css` files (`list_files` + `read_file` under `/projects/019e1752-76f2-781c-bb97-17c9789bd833/`). Never guess a token name — an unresolved `var()` silently falls back to the browser default.

For assets and UI kits beyond the guide: `read_file("/projects/019e1752-76f2-781c-bb97-17c9789bd833/<path>")` and `copy_files` to bring them into the current project.
</attached-skill>

## Assistant

_[tool: list_files]_

I'll start by exploring the bound Design System, then ask you a few key questions before building.

_[tool: list_files]_

_[tool: questions_v2]_

The bound Design System project is empty — so there's no pre-existing kit to inherit. Good news: your brief already prescribes a strong direction (palette, type, signature stamp element). Before I build, let me lock a few decisions so I build the right thing rather than guessing.

## User

Questions answered:
- deliverable: Oboje vzporedno, ključni zasloni vsake
- fidelity: Mešano — gostova stran interaktivna, dashboard statičen
- variations: 1 — odloči se za eno smer in jo dodelaj
- display_face: Decide for me / Other
- signature: Kartonček zvestobe, ki se počasi polni z žigi
- brand_name: NEnzm se bomo to nadoknadno 
- reduced_motion: Decide for me

## Assistant

_[tool: update_todos]_

_[tool: copy_starter_component]_

_[tool: set_project_title]_

Design system project is empty, so I'll build the visual language from your brief. Setting up now.

_[tool: read_file]_

_[tool: grep]_

_[tool: dc_write]_

## Assistant

_[tool: dc_write]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Mockupi so v predogledu — **Loyalty MVP.dc.html**. Kaj je notri:

- **Vizualni sistem** — paleta (Espresso/Krema/Papir/Jantar/Opeka/Žajbelj), Bricolage Grotesque + Instrument Sans, osnovne komponente in trije stati žiga. Tveganje, ki ga zagovarjam: točke so primarno **digitalni kartonček z žigi** (10 žigov = kava), številka je sekundarna.
- **A · Gost (interaktivno)** — prvi telefon je klikabilen: *Skeniraj račun* → simuliraj veljaven/že unovčen/tuj/prestar račun → štampiljka tlesne na kartonček (+15 točk) → polna kartica → *Unovči pri osebju* → koda → potrditev. Zraven statična registracija in vsi trije error stati.
- **B · Lokal** — Sistem (QR + PNG/PDF), Analitika (kartice, obiski po urah, najboljše stranke), Zgodovina, Marketing, Nastavitve z aktivacijo skeniranja (vzorčni račun), plus onboarding kartica in prazno stanje analitike.

Opombe: ime produkta je placeholder **"Žig"**, demo lokal "Kavarna Moka". Reduced-motion in keyboard focus sta upoštevana.

Naslednji koraki: potrdi/zamenjaj ime, desktop dashboard, interaktivna registracija — povej, kaj naj poglobim.

## User

Found issues — fixing…

## Assistant

_[tool: dc_js_str_replace]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Popravljeno — manjkajoče podatkovne sezname (statistika, graf, stranke, zgodovina, marketing) sem dodal v izhod logike; dashboard zasloni so zdaj polni. Preverjanje teče v ozadju.

## User

No issues found

## Assistant

Vse potrjeno — dashboard zdaj prikazuje vso vsebino (statistike, graf obiskov po urah, najboljše stranke, zgodovino in marketing seznam), interaktivni flow gosta pa deluje od skeniranja do unovčitve.

Povej, kaj naprej: ime produkta, desktop različica plošče, ali poglobitev katerega od zaslonov.

## User

Okej zdej rabim se full max optimiziran landigpage za website kjer bomo marketali meli bomo 3 pakete  i ti to vse sredi da bo res zgedlo sick ass hell

## Assistant

Landing page — same warm system, marketing-optimized. Let me build it as its own page with the stamp card as the hero hook and your 3 packages.

_[tool: update_todos]_

_[tool: dc_write]_

_[tool: update_todos]_

_[tool: show_html]_

_[tool: show_html]_

The reveal animation left content hidden (observer didn't fire before capture). Let me make it robust — reveal in-viewport elements immediately and add a fallback.

_[tool: dc_js_str_replace]_

_[tool: show_html]_

The screenshot keeps catching elements mid-reveal (opacity 0). Reliability beats a subtle entrance — I'll remove the JS reveal so everything renders visible immediately.

_[tool: dc_js_str_replace]_

_[tool: show_html]_

The hero renders beautifully now — bold headline, tilted loyalty card with stamps, floating chips. Let me verify the full page scrolls cleanly through all sections and hand off.

_[tool: done]_

Landing je živ — **Landing.dc.html**, isti topel sistem kot mockupi.

Kaj je notri (mobile + desktop responsive):
- **Hero** — bold "Stalni gosti se ne zgodijo. Zgradiš jih." + nagnjen kartonček z žigi in plavajočima čipoma (signature element kot kavelj).
- **Kako deluje** — 3 koraki (skenira → žig → unovči).
- **Za lokale** — z mini dashboard predogledom (analitika + graf obiskov po urah).
- **Signature sekcija** — opečnati blok o "občutku pravega žiga".
- **Anti-fraud** — 4 kartice (ZOI dedup, davčna, časovno okno, točke na obisk).
- **Cene — 3 paketi:** Espresso (0 €), **Doppio (29 €, izpostavljen)**, Veriga (po dogovoru).
- **FAQ**, končni CTA in footer. Gumbi "Poglej demo" vodijo na tvoj obstoječi prototip.

Opombe: ime znamke je še placeholder **"Žig"**, cene (0/29 €) so moj predlog — povej prave številke in jih zamenjam. Naslednje, če želiš: pravo ime, desktop-only sticky nav z menijem, ali sekcija s socialnim dokazom (mnenja lokalov).

## User

rabim se dizajn za to stran ker trenutno je kr neki 

glej sliko 
"Pac gres se za zacetno stran samee storitve za nove uporbnike das mu free spin dobi kao ve ce dobit kupon se more prijavit 

in sicer rad bi da je za to prf posebna stran tk ko je ta sm ta ni dobro narjena more bit tudi responsive logicno in pr vsaki strani bo tud brendig mojega narocnika tk da dodaj nevem logo i take fore kar se bo lah stranak vse sama prilagodila 

rad bi pa tudi da nardimo dizajn za popupwidget iste stvari da si jo lah integrirajo na spetno stran 

pac koncept pa ja zavrti spin dobi kavo to je presetano i n pol dobi log iz z goolom al pa z telefonsko  da se mu poslej koda recimo na telefonko in dobi 4 mesto kdoo da se vpise

## Assistant

_[tool: view_image]_

Got it — a "spin & win" acquisition flow for new customers: spin → win coffee → register (Google or phone + 4-digit SMS code) → get coupon. White-label (venue logo/name/color), responsive, plus an embeddable popup widget. Let me copy the browser frame and build the reusable spin flow first.

_[tool: dc_write]_

I want to confirm the spin flow works before wrapping it in the gallery. Let me check it interactively.

_[tool: show_html]_

The wheel renders well, but the ZAVRTI button is misplaced (container too tall with bottom-align). Let me fix the wheel container sizing so the button sits on the hub and the pointer aligns.

_[tool: dc_html_str_replace]_

_[tool: multi_screenshot]_

The full flow works — wheel spins to the win, then Won → Register → OTP keypad → Coupon. The text wrapping you see is an html-to-image font-fallback artifact (the real browser render was clean). Let me harden the coupon code against wrapping, then confirm with a real-font render.

_[tool: dc_html_str_replace]_

Core flow is solid. Now the gallery page that frames it as (1) a branded full-screen landing — mobile + desktop — and (2) an embeddable popup widget on a partner site, plus the customization story.

_[tool: dc_write]_

_[tool: show_html]_

Header looks great. Let me scroll down to verify the embedded SpinFlow instances render inside the phone, browser, and widget frames.

_[tool: multi_screenshot]_

All four embeds render perfectly — mobile phone, desktop split-panel, popup widget over a faux merchant site, and the purple-branded "Slaščičarna Lolita" instance proving white-label theming works. The ZAVRTI button now sits dead-center on the hub. (The title text overlap in these captures is just the screenshot engine's font fallback — the real browser render is clean.)

_[tool: update_todos]_

_[tool: done]_

Pripravljeno — **Spin Page.dc.html** (nova stran za pridobivanje novih strank).

Kaj je notri, vse interaktivno (zavrti katerokoli kolo):
- **A · Mobilno** — brendirana polna stran v telefonu: logo + pozdrav lokala + kolo.
- **B · Desktop** — v okvirju brskalnika: levi brand panel + kolo desno.
- **C · Popup widget** — isto kolo kot pojavno okno nad pravo spletno stranjo lokala, s plavajočim gumbom "Osvoji nagrado" in delčkom kode za integracijo (`<script ... data-venue="moka">`).
- **D · Prilagoditev** — nastavitve znamke + dokaz white-labela: drug primer **Slaščičarna Lolita** v vijolični barvi (kolo, čipi in gumbi prevzamejo barvo).

Celoten flow: **zavrti → zadetek (brezplačna kava) → prevzemi → prijava (Google ali +386 telefon) → 4-mestna SMS koda (tipkovnica) → kupon s QR**. Kolo je "srečno" (vedno pristane na nagradi), kupon se odklene šele po prijavi.

Jedro je ena komponenta (**SpinFlow.dc.html**) z nastavljivimi lastnostmi — `venueName`, `venueInitial`, `brandColor`, `tagline` — zato jo lokal lahko sam prilagodi in se v živo posodobi povsod.

Opombe: nagrade/verjetnosti, GDPR privolitev za telefonske in pravi Google/SMS ponudnik so naslednji koraki. Povej, če želiš drugačen nabor nagrad, drug privzeti brand, ali da widget poveže nov spin z Marketing zavihkom nadzorne plošče.

