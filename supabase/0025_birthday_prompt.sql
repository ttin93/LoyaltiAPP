-- Rojstni-dan popup: lastnik ga vklopi (opt-in) + nastavi prag skeniranih računov,
-- da se popup gostu sploh prikaže (privzeto 5). Sam datum (customers.birthday, MM-DD)
-- je iz migracije 0024. Write-once vpis se uveljavlja v /api/guest-birthday.
alter table venues add column if not exists birthday_prompt_enabled boolean not null default false;
alter table venues add column if not exists birthday_prompt_min_scans int not null default 5;

notify pgrst, 'reload schema';
