-- Jezik gostovega flowa (prevodi pridejo kasneje), konfiguracija kolesa sreče,
-- in dnevnik ročno dodanih točk (da se vidi kdo/kdaj/kaj v Zgodovini).

alter table venues add column if not exists language text not null default 'sl';
alter table venues add column if not exists wheel_config jsonb;

create table if not exists point_grants (
  id          uuid primary key default gen_random_uuid(),
  venue_id    uuid not null references venues(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  points      int  not null,
  note        text,
  created_at  timestamptz not null default now()
);
create index if not exists point_grants_venue_idx on point_grants (venue_id, created_at desc);
alter table point_grants enable row level security;
