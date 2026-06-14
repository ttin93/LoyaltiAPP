# Zagon MVP-ja (5 minut)

## 1. Ustvari Supabase projekt

- Pojdi na [supabase.com](https://supabase.com) → New project (brezplačni tier zadošča).
- Počakaj, da se projekt ustvari.

## 2. Naloži shemo

- V Supabase: **SQL Editor → New query** → prilepi celotno vsebino datoteke
  [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
- To ustvari tabele, funkcije, RLS in **seedira demo lokal "Meso Meso"** (`public_code = demo`,
  davčna `97384933`).

## 3. Nastavi ključe

- V Supabase: **Project Settings → API**.
- Kopiraj v `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://<tvoj>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public ključ>
SUPABASE_SERVICE_ROLE_KEY=<service_role ključ — TAJEN, nikoli na klient>
```

## 4. Zaženi

```
npm run dev
```

Odpri **http://localhost:3000/p/demo**

## 5. Testiraj zanko

1. Vpiši telefon → **Pridruži se**.
2. Klikni **Skeniraj račun za točke**.
3. Skeniraj QR z računa Meso Meso — **ali** (za test na računalniku) v polje "prilepi 60-mestno
   številko" vnesi pravi payload:
   ```
   331249375574061481977389643882881383163973849332605221503404
   ```
4. Dobiš **+10 točk**. Ponovi z istim računom → **"Ta račun je bil že unovčen."**
5. Račun drugega lokala (druga davčna) → **"Ta račun ni iz tega lokala."**

> Demo lokal ima veliko časovno okno (9000 h), da deluje tudi s starejšim testnim računom.
> Pravi lokali bodo imeli npr. 24 h.

## 6. Lastniški del (onboarding + nadzorna plošča)

1. Odpri **http://localhost:3000/partner** → **Registriraj se** (email + geslo).
2. Ustvari lokal (ime + barva) → samodejno dobiš privzete nagrade + nadzorno ploščo.
3. **Nadzorna plošča** (`/dashboard`):
   - **Sistem** — QR koda lokala + povezava (prenos PNG).
   - **Nastavitve → Aktiviraj skeniranje** — skeniraj/prilepi vzorčni račun → preberemo davčno.
   - **Analitika / Zgodovina / Marketing** — števci, graf, zgodovina, seznam strank (+ ročno dodajanje točk).

> **Pomembno (dev):** Supabase privzeto zahteva potrditev emaila ob registraciji. Za hiter razvoj
> to izklopi: **Supabase → Authentication → Sign In / Providers → Email → izklopi "Confirm email"**.
> Potem je registracija takojšnja.

