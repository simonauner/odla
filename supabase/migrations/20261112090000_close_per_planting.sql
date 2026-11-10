-- Close each crop on its own instead of the whole season: garlic is done in July while kale grows into winter.
-- A season is now just a place's year and frost date; it is over when all its plantings are closed.
alter table public.plantings
  add column closed_at timestamptz,
  add column remind_on date;

update public.plantings p
set closed_at = s.closed_at, remind_on = s.remind_on
from public.seasons s
where s.id = p.season_id;

alter table public.seasons
  drop column closed_at,
  drop column remind_on;
