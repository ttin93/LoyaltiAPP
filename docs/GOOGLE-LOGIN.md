# Google prijava — nastavitev (koda je že narejena)

Gumbi »Nadaljuj z Googlom« so že v appu (lastnik `/partner` + gost pri registraciji).
Uporabljajo Supabase OAuth. Manjka SAMO konfiguracija — ~15 min, brez kode.

## 1. Google Cloud — OAuth client
1. <https://console.cloud.google.com> → nov projekt (npr. "Loyavi").
2. **APIs & Services → OAuth consent screen**:
   - Tip: **External** → Create.
   - App name: `Loyavi`, support email: tvoj, developer email: tvoj.
   - Scopes: pusti privzeto (email, profile) → Save.
   - Za javno rabo klikni **Publish app** (sicer dodaj svoje maile pod Test users).
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**.
   - Name: `Loyavi web`.
   - **Authorized redirect URIs** → dodaj TOČNO:
     ```
     https://xlcmeaeiyapwblivqolo.supabase.co/auth/v1/callback
     ```
   - Create → kopiraj **Client ID** in **Client secret**.

## 2. Supabase — vklop Google providerja
1. Supabase Dashboard → projekt → **Authentication → Providers → Google**.
2. **Enable** → prilepi **Client ID** in **Client secret** → Save.

## 3. Supabase — dovoljeni preusmeritveni URL-ji
Supabase → **Authentication → URL Configuration**:
- **Site URL**: `https://loyavi.app`
- **Redirect URLs** (dodaj vse):
  ```
  https://loyavi.app/**
  http://localhost:3000/**
  ```
  (`/partner` za lastnika, `/p/<koda>/spin` za gosta — `**` pokrije oboje.)

## 4. Test
- Lastnik: `loyavi.app/partner` → »Nadaljuj z Googlom« → Google → nazaj v dashboard.
- Gost: `loyavi.app/p/<koda>` → registracija → »Nadaljuj z Googlom«.

## Kako je povezano (koda)
- Lastnik: `app/partner/AuthForm.tsx` → `withGoogle()` → `signInWithOAuth({ provider: "google" })`, redirect `/partner`.
- Gost: `app/components/SpinFlow.tsx` → `googleSignIn()` → OAuth, redirect `/p/<koda>/spin?gwin=1`, ob vrnitvi ustvari/najde stranko.
- Brez konfiguracije gumb pokaže »Google prijava bo kmalu« (fail-safe, nič se ne podre).

## Opomba o geslu (že v kodi)
- Gost: geslo min **6** znakov.
- Lastnik (registracija): min **8** znakov + vsaj ena številka.
