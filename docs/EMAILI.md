# Elektronska sporočila (v2)

Predloge so v [`lib/emailTemplate.ts`](../lib/emailTemplate.ts), pošiljanje v [`lib/notify.ts`](../lib/notify.ts),
samodejna sporočila sproži dnevni cron [`app/api/cron/daily/route.ts`](../app/api/cron/daily/route.ts).
Videz: svetla podlaga, bela kartica, moder poudarek, rdeč gumb. Brez izmišljenih kod: kupon je vedno resničen
zapis v gostovi denarnici, sporočilo nanj samo pokaže.

## Predogled v brskalniku (brez pošiljanja)
`http://localhost:3000/api/email-preview?type=<type>&venue=Kavarna%20Lipa&color=%231F8BF5`
Na produkciji je predogled dostopen samo superadminu.

| type | Kdaj se pošlje | Komu | Odjava |
|---|---|---|---|
| `welcome` | gost prvič doda kartico lokala | gost | ne (del storitve) |
| `coupon_earned` | kartica je polna, nastane kupon | gost | ne (del storitve) |
| `we_miss_you` | N dni brez obiska (lastnik vklopi in nastavi) | gost | da |
| `birthday_guest` | rojstni dan gosta (lastnik vklopi) | gost | da |
| `anniversary` | eno leto od dodane kartice (lastnik vklopi) | gost | da |
| `birthday_venue` | praznik lokala na izbrani datum (lastnik vklopi) | vsi gostje lokala | da |
| `campaign` | enkratno sporočilo iz nadzorne plošče | izbrana skupina gostov | da |
| `owner_welcome` | lastnik ustvari lokal | lastnik | ne |
| `admin_purchase` | naročnina je aktivirana (Polar webhook) | lastnik | ne |
| `admin_expiring` | preizkus ali preklicana naročnina se izteče čez približno 3 dni | lastnik | ne |
| `owner_message` | sporočilo ekipe Loyavi lastnikom (superadmin) | lastniki | ne |

## Pravila
- Pošiljatelj za goste je »Ime lokala prek Loyavi« na naslovu platforme (`RESEND_FROM`).
- Odjava (`/odjava?c=…&t=…`) velja za posamezen lokal in se zapiše v `email_log` (`kind = 'unsubscribe'`).
  Odjavljeni gostje ne prejmejo samodejnih sporočil in kampanj, osnovna sporočila o kartici pa še vedno.
- Samodejna sporočila s kuponom dodajo kupon v denarnico šele, ko je sporočilo uspešno oddano. Kupon velja 30 dni.
- Lokal brez veljavnega dostopa (iztekel preizkus) ne pošilja samodejnih sporočil.
