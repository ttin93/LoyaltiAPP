-- Scale (Palača): lokal lahko poda SVOJ Resend ključ + pošiljatelja → maili iz njegove domene.
alter table venues add column if not exists resend_api_key text;
alter table venues add column if not exists email_from text;

notify pgrst, 'reload schema';
