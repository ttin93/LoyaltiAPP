-- Rojstni dan gosta (postopno zbiranje na kartici, NE ob prijavi). Format 'MM-DD' (brez leta).
alter table customers add column if not exists birthday text;

notify pgrst, 'reload schema';
