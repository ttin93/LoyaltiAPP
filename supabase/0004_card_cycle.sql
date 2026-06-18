-- Migracija 0004: žigi-cikel v award_scan.
-- Za per_visit lokale: ko skeniranje doseže/preseže cilj kartončka (p_card_goal),
-- vrni card_completed=true in resetiraj točke z ostankom (carryover). Za per_euro pošlji
-- p_card_goal=0 → samo akumulira (brez reseta). Spremeni return na tabelo (total, card_completed).

drop function if exists award_scan(uuid, uuid, text, text, timestamptz, numeric, int);

create or replace function award_scan(
  p_venue_id uuid, p_customer_id uuid, p_zoi text, p_davcna text,
  p_issued_at timestamptz, p_amount numeric, p_points int, p_card_goal int default 0
) returns table(total int, card_completed boolean)
language plpgsql as $$
declare v_total int; v_completed boolean := false;
begin
  insert into scans (venue_id, customer_id, zoi, davcna, issued_at, amount, points_awarded)
  values (p_venue_id, p_customer_id, p_zoi, p_davcna, p_issued_at, p_amount, p_points);

  update customers set points = points + p_points
  where id = p_customer_id
  returning points into v_total;

  if p_card_goal is not null and p_card_goal > 0 and v_total >= p_card_goal then
    v_completed := true;
    update customers set points = points - p_card_goal
    where id = p_customer_id
    returning points into v_total;
  end if;

  return query select v_total, v_completed;
end; $$;
