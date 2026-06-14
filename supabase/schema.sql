-- ============================================================
-- Loyalty MVP — Supabase / Postgres shema
-- Zaženi v Supabase: Project → SQL Editor → prilepi → Run.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Tabele ----------
create table if not exists venues (
  id               uuid primary key default gen_random_uuid(),
  owner_user_id    uuid,
  name             text not null,
  public_code      text unique not null,
  logo_url         text,
  brand_color      text not null default '#16a34a',
  davcna_stevilka  text,                       -- izdajatelj; iz vzorčnega računa
  points_model     text not null default 'per_visit',  -- 'per_visit' | 'per_euro'
  points_per_visit int  not null default 10,
  points_per_euro  int  not null default 50,           -- per_euro: 1 € = X točk
  scan_window_hours int not null default 24,
  redemption_minutes int not null default 5,           -- koliko časa velja aktivirana nagrada
  daily_scan_cap   int,                                -- max skeniranj/24h na stranko (null = brez)
  created_at       timestamptz not null default now()
);

create table if not exists rewards (
  id              uuid primary key default gen_random_uuid(),
  venue_id        uuid not null references venues(id) on delete cascade,
  name            text not null,
  image_url       text,
  points_required int  not null,
  sort_order      int  not null default 0,
  unique (venue_id, name)
);

create table if not exists customers (
  id          uuid primary key default gen_random_uuid(),
  venue_id    uuid not null references venues(id) on delete cascade,
  phone       text,
  email       text,
  points      int  not null default 0,
  created_at  timestamptz not null default now(),
  unique (venue_id, phone)
);

create table if not exists scans (        -- srce anti-fraud
  id             uuid primary key default gen_random_uuid(),
  venue_id       uuid not null references venues(id) on delete cascade,
  customer_id    uuid not null references customers(id) on delete cascade,
  zoi            text not null unique,     -- globalno unikaten => dedup
  davcna         text,
  issued_at      timestamptz,
  amount         numeric,
  points_awarded int  not null,
  created_at     timestamptz not null default now()
);

create table if not exists redemptions (
  id           uuid primary key default gen_random_uuid(),
  venue_id     uuid not null references venues(id) on delete cascade,
  customer_id  uuid not null references customers(id) on delete cascade,
  reward_id    uuid not null references rewards(id) on delete cascade,
  points_spent int  not null,
  activated_at timestamptz not null default now(),
  expires_at   timestamptz,
  status       text not null default 'active',   -- 'active' | 'redeemed' | 'expired'
  created_at   timestamptz not null default now()
);

create table if not exists subscriptions (
  venue_id               uuid primary key references venues(id) on delete cascade,
  stripe_customer_id     text,
  stripe_subscription_id text,
  plan                   text,
  status                 text
);

-- ---------- Atomarne operacije ----------

-- Dodeli skeniranje: vstavi scan (unique zoi = dedup) + prišteje točke.
-- Ob podvojenem ZOI vrže unique_violation (23505) -> aplikacija to prevede v "že unovčen".
create or replace function award_scan(
  p_venue_id uuid, p_customer_id uuid, p_zoi text, p_davcna text,
  p_issued_at timestamptz, p_amount numeric, p_points int
) returns int
language plpgsql as $$
declare v_total int;
begin
  insert into scans (venue_id, customer_id, zoi, davcna, issued_at, amount, points_awarded)
  values (p_venue_id, p_customer_id, p_zoi, p_davcna, p_issued_at, p_amount, p_points);

  update customers set points = points + p_points
  where id = p_customer_id
  returning points into v_total;

  return v_total;
end; $$;

-- Aktiviraj nagrado: preveri točke, ODŠTEJE točke takoj, ustvari aktiven redemption z
-- expires_at = now + minute (server-side iztek — preživi zaprtje appa). Atomarno.
create or replace function activate_reward(
  p_venue_id uuid, p_customer_id uuid, p_reward_id uuid, p_minutes int
) returns table(redemption_id uuid, expires_at timestamptz)
language plpgsql as $$
declare v_required int; v_points int; v_id uuid; v_exp timestamptz;
begin
  select points_required into v_required
  from rewards where id = p_reward_id and venue_id = p_venue_id;
  if v_required is null then raise exception 'reward_not_found'; end if;

  select points into v_points from customers where id = p_customer_id for update;
  if v_points < v_required then raise exception 'insufficient_points'; end if;

  v_exp := now() + (p_minutes || ' minutes')::interval;

  insert into redemptions (venue_id, customer_id, reward_id, points_spent, activated_at, expires_at, status)
  values (p_venue_id, p_customer_id, p_reward_id, v_required, now(), v_exp, 'active')
  returning id into v_id;

  update customers set points = points - v_required where id = p_customer_id;

  return query select v_id, v_exp;
end; $$;

-- Osebje potrdi unovčenje (pred iztekom). Po izteku → 'expired'. Točke so že odbite.
create or replace function confirm_redemption(p_redemption_id uuid, p_venue_id uuid)
returns text language plpgsql as $$
declare v_status text; v_exp timestamptz;
begin
  select status, expires_at into v_status, v_exp
  from redemptions where id = p_redemption_id and venue_id = p_venue_id for update;
  if v_status is null then raise exception 'not_found'; end if;
  if v_status <> 'active' then return v_status; end if;
  if now() > v_exp then
    update redemptions set status = 'expired' where id = p_redemption_id;
    return 'expired';
  end if;
  update redemptions set status = 'redeemed' where id = p_redemption_id;
  return 'redeemed';
end; $$;

-- ---------- Row-Level Security ----------
-- Pisanje gre izključno prek service-role ključa v API rutah (obvozi RLS).
-- Javno dovolimo samo branje javnih podatkov lokala (venues, rewards).
alter table venues       enable row level security;
alter table rewards      enable row level security;
alter table customers    enable row level security;
alter table scans        enable row level security;
alter table redemptions  enable row level security;
alter table subscriptions enable row level security;

drop policy if exists "venues public read" on venues;
create policy "venues public read" on venues for select using (true);

drop policy if exists "rewards public read" on rewards;
create policy "rewards public read" on rewards for select using (true);

-- ---------- Seed: demo lokal, ujema se s pravim računom Meso Meso ----------
-- davčna 97384933 = Ivanetič d.o.o.; veliko časovno okno za testiranje s starim računom.
insert into venues (name, public_code, davcna_stevilka, brand_color, points_model, points_per_visit, scan_window_hours)
values ('Meso Meso (demo)', 'demo', '97384933', '#16a34a', 'per_visit', 10, 9000)
on conflict (public_code) do nothing;

insert into rewards (venue_id, name, points_required, sort_order)
select id, 'Brezplačna kava', 50, 1 from venues where public_code = 'demo'
on conflict (venue_id, name) do nothing;

insert into rewards (venue_id, name, points_required, sort_order)
select id, 'Brezplačna pijača', 80, 2 from venues where public_code = 'demo'
on conflict (venue_id, name) do nothing;

insert into rewards (venue_id, name, points_required, sort_order)
select id, 'Brezplačen burger', 200, 3 from venues where public_code = 'demo'
on conflict (venue_id, name) do nothing;
