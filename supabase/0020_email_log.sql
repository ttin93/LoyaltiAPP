-- Dnevnik poslanih (avtomatiziranih) mailov — dedup, da cron ne pošilja isto večkrat.
create table if not exists email_log (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references venues(id) on delete cascade,
  customer_id uuid references customers(id) on delete cascade,
  kind text not null,
  ref text,
  created_at timestamptz not null default now()
);
create index if not exists email_log_lookup on email_log (kind, venue_id, customer_id, created_at desc);

notify pgrst, 'reload schema';
