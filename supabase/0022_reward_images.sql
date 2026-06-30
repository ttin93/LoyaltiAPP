-- Slike nagrad: zagotovi stolpec image_url na rewards (idempotentno) + reload PostgREST.
-- (V schema.sql že obstaja; ta migracija poskrbi, da je tudi na obstoječi živi bazi.)
alter table rewards add column if not exists image_url text;

notify pgrst, 'reload schema';
