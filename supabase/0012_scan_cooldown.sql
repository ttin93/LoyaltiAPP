-- Minimalni razmik med skeniranji za isto stranko (anti-zloraba: prepreči,
-- da nekdo poskenira kup računov naenkrat). 0 = brez omejitve.
alter table venues add column if not exists scan_cooldown_minutes int not null default 0;
