-- Beleženje ocen gostov (Google-ocene autopilot).
-- stars 4–5 => gost preusmerjen na Google (to_google=true).
-- stars 1–3 => zasebni feedback lokalu (comment).
create table if not exists reviews (
  id          uuid primary key default gen_random_uuid(),
  venue_id    uuid not null references venues(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  stars       int  not null check (stars between 1 and 5),
  comment     text,
  to_google   boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists reviews_venue_idx on reviews (venue_id, created_at desc);

-- RLS: pisanje gre prek service-role (API), branje prek service-role (dashboard).
alter table reviews enable row level security;
