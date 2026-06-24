-- 14-dnevni trial + paywall. trial_ends_at = do kdaj ima lokal dostop brez plačila.
-- Vir: signup grace, super-admin podaljšanje, ali Polar trial (current_period_end).
alter table venues add column if not exists trial_ends_at timestamptz;

-- Backfill obstoječih lokalov: +60 dni grace (da pilota/testov ob deployu ne zaklene).
update venues set trial_ends_at = now() + interval '60 days' where trial_ends_at is null;

notify pgrst, 'reload schema';
