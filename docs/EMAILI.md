# Seznam vseh e-mailov (za redizajn)

Vse predloge so v [`lib/emailTemplate.ts`](../lib/emailTemplate.ts). Pošiljanje jih ovija [`lib/notify.ts`](../lib/notify.ts).
Dva ovoja (shell): **gostov** (barvna glava z inicialko lokala) in **lastnikov** (temna Loyavi glava).

## Živ predogled v brskalniku (brez pošiljanja)
```
https://loyavi.app/api/email-preview?type=<type>&venue=Kavarna%20Lipa&color=%23C4623D&name=Ana
```
Zamenjaj `type` s spodnjimi vrednostmi. Lokalno: `http://localhost:3000/api/email-preview?type=welcome`.

---

## GOST — transakcijski (sprožijo se sami)
| type | Naslov (subject) | Kdaj se pošlje | Ključna vsebina |
|---|---|---|---|
| `welcome` | Dobrodošel pri {lokal}! 👋 | ob registraciji gosta | pozdrav · 3 koraki (skeniraj/zberi/unovči) · prazna kartica žigov · seznam nagrad za točke · CTA |
| `points` | Dobil si točke za obisk! ⭐ | ob **mejniku** (1 žig do konca ALI odklenjena točkovna nagrada) | +X točk · skupaj/do nagrade · napredek žigov · CTA |
| `coupon_earned` | 🎉 Čestitke! Zaslužil si {nagrada}! | ko se kartonček napolni | polna kartica · kupon s kodo · rok · CTA unovči |
| `coupon_redeem` | ☕ Tvoj kupon čaka | opomnik za neunovčen kupon | kupon · rok/dnevi · CTA |

## GOST — po oceni
| type | Naslov | Kdaj | Vsebina |
|---|---|---|---|
| `review_thanks` | ⭐ Hvala za vašo oceno! | ko gost pusti oceno | zvezdice · komentar · bonus točke · CTA |

## GOST — avtomatizacije (cron, vklopi/nastavi lastnik)
| type | Naslov | Kdaj | Vsebina |
|---|---|---|---|
| `we_miss_you` | Pogrešamo te pri {lokal} 😔 | neaktiven N dni | dni od zadnjega obiska · ponudba (dvojne točke) · CTA |
| `anniversary` | 🎂 Že eno leto skupaj | 1 leto od registracije gosta | statistika (obiski/točke/nagrade) · obletniško darilo · CTA |
| `birthday_guest` | 🎂 Vse najboljše od {lokal}! | rojstni dan gosta | rojstnodnevni kupon (7 dni) · CTA |
| `birthday_venue` | 🎊 {lokal} praznuje! | obletnica lokala | velik banner ponudbe (npr. −20 %) · CTA |

## GOST — marketing
| type | Naslov | Kdaj | Vsebina |
|---|---|---|---|
| `campaign` | (lastnik napiše) | ročni blast iz Marketinga | naslov · sporočilo · opcijski kupon · opcijska opomba · CTA |

---

## LASTNIK / SaaS (temna Loyavi glava)
| type | Naslov | Kdaj | Vsebina |
|---|---|---|---|
| `owner_welcome` | 🏪 Dobrodošli v Loyavi! | ob registraciji lastnika | 3 koraki setupa · trial obvestilo · CTA |
| `admin_purchase` | ✅ Hvala za naročnino Loyavi | ob nakupu naročnine | podrobnosti (paket/znesek/datum/podaljšanje) · CTA |
| `admin_expiring` | ⏰ Naročnina kmalu poteče | opozorilo pred potekom | opozorilo · datum poteka · CTA podaljšaj |
| `admin_renewal` | 🔄 Samodejno podaljšanje | pred samodejnim podaljšanjem | podrobnosti podaljšanja · CTA |
| `owner_update` | (lastna) | novosti/update lastnikom | intro · seznam funkcij · outro · CTA |

**Brez preview-type (obstajata v kodi):**
- `emailOwnerMessage` — generično sporočilo super-admin → lastnikom
- `brandedEmail` — enostaven fallback ovoj

---

## LOČENO — Supabase Auth maili (NISO naše predloge)
Potrditev e-pošte, ponastavitev gesla, magic link, sprememba e-pošte.
Oblikujejo se v **Supabase Dashboard → Authentication → Email Templates** (ne v `emailTemplate.ts`).
Če želiš enak dizajn kot ostali maili, jih je treba prilagoditi tam posebej (HTML).

---

## Skupaj: 15 oblikovanih predlog + 2 pomožni + 4 Supabase Auth
Ko delaš nove dizajne, ohrani iste `type` ključe in ime funkcije v `emailTemplate.ts` — pošiljanje se ne rabi spreminjati.
