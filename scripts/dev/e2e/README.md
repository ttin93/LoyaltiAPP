# Preizkus od A do Ž (lastnik in gost)

Skripti, s katerimi je bil 2026-11-21 preklikan celoten Loyavi na localhostu (207 preverb).
Poženejo se po vrsti iz korena projekta, ob zagnanem `npm run dev`:

    node scripts/dev/e2e/s0-javno.mjs
    node scripts/dev/e2e/s1-onboarding.mjs
    ...

- Potrebujejo `puppeteer-core` in `chrome-headless-shell` (pot je v `lib.mjs`), ki nista odvisnosti projekta.
- Pišejo v bazo iz `.env.local` (trenutno produkcijska): ustvarijo testni lokal in račune `delivered+az-*@resend.dev`.
  Stanje med koraki je v `state.json` poleg skriptov (ni v gitu, vsebuje testno geslo).
- Prijava lastnika je brez gesla: račun ustvari strežniški ključ, sejo da enkratna povezava.
- `s10-superadmin.mjs` za čas preizkusa doda `SUPERADMIN_EMAILS` v `.env.local` in ga na koncu odstrani.
