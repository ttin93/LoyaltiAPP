# Test avtomatizacij — checklist (pred oglaševanjem)

> Cilj: preveriti, da vsak avtomatski mail dejansko pride, preden gredo pravi gostje noter.
> Vse teste delaš s SVOJIM mailom (tin.suklje93@gmail.com) kot testni gost.

## Predpogoji (enkratno)
- [ ] Na Vercelu so env: `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_REPLY_TO`, `CRON_SECRET` (že so).
- [ ] V dashboardu → Marketing → **Avtomatizacije**: vklopi »pogrešamo te« (npr. 21 dni), obletnico, rojstni dan lokala.
- [ ] Vercel cron teče vsak dan ob 8:00 (`vercel.json`) — za test ga sprožiš ročno (spodaj).

## Ročni zagon crona (namesto čakanja na 8:00)
```
curl -H "Authorization: Bearer <CRON_SECRET>" https://loyavi.app/api/cron/daily
```
Odgovor: `{"ok":true,"venues":N,"sent":M}` — `sent` = koliko mailov je šlo ven.
(Claude to lahko sproži sam — ključ ima v `.env.local`.)

## Takojšnji sprožilci (brez crona)
| # | Test | Kako | Pričakovan mail |
|---|------|------|-----------------|
| 1 | Dobrodošlica gosta | registriraj se s svojim mailom na `/p/<koda>` (kolo → prijava) | »Dobrodošel pri …« + točkovne nagrade |
| 2 | Točke za obisk | skeniraj testni račun | »Dobil si točke …« |
| 3 | Kupon zaslužen | napolni kartonček (ali ročno dodaj točke) | »Čestitke! Zaslužil si …« |
| 4 | Hvala za oceno | oddaj oceno po skenu | »Hvala za vašo oceno« |
| 5 | Dobrodošlica lastnika | ustvari testni lokal z novim mailom | »Dobrodošli v Loyavi« |

## Cron sprožilci (rabijo pripravo podatkov — Claude jih nastavi v bazi)
| # | Test | Priprava (Claude prek sb-sql) | Potem |
|---|------|-------------------------------|-------|
| 6 | Pogrešamo te | zadnji sken testnega gosta backdatan točno N dni nazaj | sproži cron → mail |
| 7 | Rojstni dan gosta | `customers.birthday` = današnji `MM-DD` | sproži cron → mail |
| 8 | Obletnica | `customers.created_at` ~365 dni nazaj | sproži cron → mail |
| 9 | Potek naročnine/triala | `venues.trial_ends_at` čez ~3 dni | sproži cron → mail lastniku |
| 10 | Rojstni dan lokala | avtomatizacija z datumom = danes | sproži cron → mail vsem gostom lokala (pazi: testni lokal!) |

## Dedup test (pomembno!)
- [ ] Cron sproži **2× zapored** → drugi zagon mora vrniti `sent: 0` (email_log dedup deluje).

## Opozorila
- Teste 6–10 delaj na **testnem lokalu s samo tvojim mailom** med gosti — cron pošilja zares!
- Po testih Claude počisti backdatane podatke.

## Kako začneš jutri
V Claude seji samo reci: **»testiramo avtomatizacije«** → Claude: pripravi testne podatke (6–9),
sproži cron, preveri odgovor + email_log, ti pa samo potrdiš, da so maili prišli v inbox.
