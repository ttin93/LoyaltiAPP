-- Migracija 0002: dedupe strank po emailu (Google prijava)
-- Idempotentno: doda unique (venue_id, email) samo če še ne obstaja.
-- NULL email je dovoljen večkrat (telefonske stranke), unique velja le za dejanske emaile.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'customers_venue_id_email_key'
  ) then
    alter table customers add constraint customers_venue_id_email_key unique (venue_id, email);
  end if;
end $$;
