-- The user's own last spring frost date for the season. Null means use the zone's date.
alter table public.seasons
  add column last_frost date,
  add constraint seasons_last_frost_in_year check (extract(year from last_frost) = year);
