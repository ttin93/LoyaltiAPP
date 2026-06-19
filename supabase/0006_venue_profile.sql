-- Profilni / kontaktni podatki lokala (zbrani ob onboardingu)
alter table venues add column if not exists owner_name text;
alter table venues add column if not exists phone      text;
alter table venues add column if not exists venue_type text;
alter table venues add column if not exists city       text;
