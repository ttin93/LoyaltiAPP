-- Marketing avtomatizacije (sprožilci): konfiguracija po lokalu.
-- jsonb objekt, ključ = tip (welcome/inactive/anniversary/guest_birthday/venue_birthday/card_complete).
alter table venues add column if not exists automations jsonb;
