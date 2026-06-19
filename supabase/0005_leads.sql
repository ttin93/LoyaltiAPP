-- Migracija 0005: zajem povpraševanj iz kontaktnega obrazca.
-- RLS brez politik => samo service-role (API z owner-less vpisom). Javnost ne bere.
create table if not exists leads (
  id          uuid primary key default gen_random_uuid(),
  name        text,
  venue       text,
  email       text,
  phone       text,
  venue_type  text,
  city        text,
  guests_est  text,
  heard       text,
  message     text,
  source      text not null default 'kontakt',
  created_at  timestamptz not null default now()
);
alter table leads enable row level security;
