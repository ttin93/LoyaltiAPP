-- Gostov račun = email + geslo (brez potrditvene kode).
-- Prepreči prevzem računa z znanim emailom: za obstoječ email rabiš pravo geslo.
create extension if not exists pgcrypto;
alter table customers add column if not exists pass_hash text;

-- Registracija ALI prijava gosta v enem klicu (geslo se nikoli ne shrani v cistopisu).
create or replace function guest_auth(p_venue_id uuid, p_email text, p_password text)
returns table(customer_id uuid, is_new boolean, ok boolean)
language plpgsql security definer as $$
declare c customers%rowtype;
begin
  select * into c from customers
    where venue_id = p_venue_id and lower(email) = lower(p_email)
    limit 1;

  if c.id is null then
    -- nov gost
    insert into customers (venue_id, email, pass_hash)
      values (p_venue_id, lower(p_email), crypt(p_password, gen_salt('bf')))
      returning id into customer_id;
    is_new := true; ok := true; return next; return;
  end if;

  if c.pass_hash is null then
    -- star račun brez gesla → nastavi geslo ob prvi prijavi
    update customers set pass_hash = crypt(p_password, gen_salt('bf')) where id = c.id;
    customer_id := c.id; is_new := false; ok := true; return next; return;
  end if;

  if c.pass_hash = crypt(p_password, c.pass_hash) then
    customer_id := c.id; is_new := false; ok := true; return next;   -- prijava ok
  else
    customer_id := null; is_new := false; ok := false; return next;  -- napačno geslo
  end if;
end $$;
