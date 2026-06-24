-- Polar (Merchant of Record) naročninski podatki na lokal.
-- Webhook (app/api/webhooks/polar) jih sinhronizira ob vsakem dogodku naročnine.
alter table venues add column if not exists polar_customer_id text;
alter table venues add column if not exists polar_subscription_id text;
alter table venues add column if not exists current_period_end timestamptz;       -- kdaj se naslednjič obračuna / do kdaj velja
alter table venues add column if not exists cancel_at_period_end boolean not null default false; -- preklicano, a aktivno do konca obdobja

notify pgrst, 'reload schema';
