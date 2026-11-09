-- A season stays in the plan until the user closes it, even after the year has turned.
-- closed_at: when the user closed it. remind_on: when to ask about closing again ("remind me in 2 weeks");
-- null means 1 October of the season's year.
alter table public.seasons
  add column closed_at timestamptz,
  add column remind_on date;
