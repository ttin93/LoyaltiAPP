-- Preimenovanje internih plan ključev, da se ujemajo z imeni: Start/Grow/Scale.
-- plan je navaden text brez CHECK constrainta → varen UPDATE.
update venues set plan = 'start' where plan = 'espresso';
update venues set plan = 'grow'  where plan = 'doppio';
update venues set plan = 'scale' where plan = 'palaca';
