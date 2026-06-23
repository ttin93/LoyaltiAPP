-- Naročninski podatki na lokal (za super-admin statistiko plačil/naročnin).
-- Pravega plačilnega procesorja (Stripe) še NI — superadmin paket ročno dodeli;
-- prihodek se izračuna iz aktivnih naročnin.
alter table venues add column if not exists plan text not null default 'free';
alter table venues add column if not exists billing_cycle text not null default 'monthly';   -- monthly | yearly
alter table venues add column if not exists subscription_status text not null default 'active'; -- trialing | active | past_due | canceled
alter table venues add column if not exists commitment_months int not null default 0;          -- vezava (0 = brez)
alter table venues add column if not exists subscribed_at timestamptz;
alter table venues add column if not exists custom_price_eur numeric;                            -- za "Palača / po dogovoru" ali popust po meri

notify pgrst, 'reload schema';
