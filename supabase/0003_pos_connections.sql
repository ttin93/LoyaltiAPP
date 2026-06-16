-- Migracija 0003: povezave z blagajno (POS) lokala — za verifikacijo računov pri viru.
-- client_secret je SIFRIRAN (AES-256-GCM, ključ izven baze). RLS brez politik =
-- dostop SAMO prek service-role ključa (server-side); klient nikoli ne vidi poverilnic.

create table if not exists pos_connections (
  venue_id      uuid primary key references venues(id) on delete cascade,
  provider      text not null default 'eblagajna',
  bu_uid        text not null,                 -- ID poslovne enote (izolacija per-lokal)
  client_id     text not null,
  secret_enc    text not null,                 -- client_secret, šifriran (iv:tag:ciphertext)
  status        text not null default 'connected',  -- 'connected' | 'error'
  last_check_at timestamptz,
  last_error    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table pos_connections enable row level security;
-- namenoma BREZ select/insert politik => samo service-role (API rute z owner-auth) dostopa.
