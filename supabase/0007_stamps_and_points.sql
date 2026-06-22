-- Žigi (kartonček) LOČENO od točk: kava = žigi (vsak N-ti), druge nagrade = točke.
alter table customers add column if not exists stamps int not null default 0;
alter table venues    add column if not exists stamp_goal int not null default 10;
alter table rewards   add column if not exists kind text not null default 'points';  -- 'stamp' | 'points'

-- award_scan v2: prišteje točke IN žig; žige resetira pri stamp_goal (→ kava kupon). Točke OSTANEJO.
drop function if exists award_scan(uuid, uuid, text, text, timestamptz, numeric, int, int);
create or replace function award_scan(
  p_venue_id uuid, p_customer_id uuid, p_zoi text, p_davcna text,
  p_issued_at timestamptz, p_amount numeric, p_points int, p_stamp_goal int default 10
) returns table(total int, stamps int, card_completed boolean)
language plpgsql as $$
declare v_total int; v_stamps int; v_completed boolean := false;
begin
  insert into scans (venue_id, customer_id, zoi, davcna, issued_at, amount, points_awarded)
  values (p_venue_id, p_customer_id, p_zoi, p_davcna, p_issued_at, p_amount, p_points);

  update customers set points = points + p_points, stamps = stamps + 1
  where id = p_customer_id
  returning points, stamps into v_total, v_stamps;

  if p_stamp_goal is not null and p_stamp_goal > 0 and v_stamps >= p_stamp_goal then
    v_completed := true;
    update customers set stamps = stamps - p_stamp_goal
    where id = p_customer_id
    returning stamps into v_stamps;
  end if;

  return query select v_total, v_stamps, v_completed;
end; $$;
