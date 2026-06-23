-- BUGFIX: stolpec je bil v tipu + kodi, a nikoli dodan v bazo → updateVenueSettings je
-- (zaradi neobstoječega stolpca) tiho padel in NIČ iz forme Nastavitve se ni shranilo.
alter table venues add column if not exists google_review_url text;
