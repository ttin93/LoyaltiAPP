-- Strežniška agregacija skenov (PostgREST caplja na 1000 vrstic → KPI-ji + grafi
-- so bili napačni za prometne lokale). RPC vrne štetja, brez nalaganja vrstic.

create or replace function venue_daily_scans(p_venue_id uuid, p_days int default 365)
returns table(day text, cnt bigint)
language sql stable as $$
  select to_char((created_at at time zone 'Europe/Ljubljana')::date, 'YYYY-MM-DD') as day, count(*)::bigint as cnt
  from scans
  where venue_id = p_venue_id and created_at >= (now() - make_interval(days => p_days))
  group by 1 order by 1;
$$;

create or replace function venue_hourly_scans(p_venue_id uuid, p_days int default 365)
returns table(hour int, cnt bigint)
language sql stable as $$
  select extract(hour from (created_at at time zone 'Europe/Ljubljana'))::int as hour, count(*)::bigint as cnt
  from scans
  where venue_id = p_venue_id and created_at >= (now() - make_interval(days => p_days))
  group by 1 order by 1;
$$;

notify pgrst, 'reload schema';
