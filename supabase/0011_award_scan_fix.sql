-- BUGFIX: award_scan je vrgel "column reference \"stamps\" is ambiguous", ker se OUT
-- stolpec `stamps` (iz returns table) zaleti s customers.stamps v UPDATE. Posledica:
-- skeniranje računov NIKOLI ni delalo (vrnilo je 500 "Prišlo je do napake").
-- Fix: aliasiraj tabelo (customers c) in kvalificiraj stolpce (c.points, c.stamps).

create or replace function award_scan(
  p_venue_id uuid, p_customer_id uuid, p_zoi text, p_davcna text,
  p_issued_at timestamptz, p_amount numeric, p_points int, p_stamp_goal int default 10
) returns table(total int, stamps int, card_completed boolean)
language plpgsql as $$
declare v_total int; v_stamps int; v_completed boolean := false;
begin
  insert into scans (venue_id, customer_id, zoi, davcna, issued_at, amount, points_awarded)
  values (p_venue_id, p_customer_id, p_zoi, p_davcna, p_issued_at, p_amount, p_points);

  update customers c set points = c.points + p_points, stamps = c.stamps + 1
  where c.id = p_customer_id
  returning c.points, c.stamps into v_total, v_stamps;

  if p_stamp_goal is not null and p_stamp_goal > 0 and v_stamps >= p_stamp_goal then
    v_completed := true;
    update customers c set stamps = c.stamps - p_stamp_goal
    where c.id = p_customer_id
    returning c.stamps into v_stamps;
  end if;

  return query select v_total, v_stamps, v_completed;
end; $$;
