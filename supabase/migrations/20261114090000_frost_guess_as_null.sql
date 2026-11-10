-- Setup used to store the guessed last frost date, so it did not follow a later change of the place's
-- zone or kind. A stored date equal to today's guess for the place is a guess: store null instead.
-- The guess per zone is shared/zones.ts (ZONES.lastFrost, GREENHOUSE_FROST_HEAD_START = 21 days).
update public.seasons s
set last_frost = null
from public.gardens g, (values (1, 5, 10), (2, 5, 10), (3, 5, 20), (4, 5, 30), (5, 5, 30), (6, 5, 30), (7, 5, 30), (8, 6, 15))
  as z (zone, month, day)
where g.id = s.garden_id
  and z.zone = g.zone
  and s.last_frost = make_date(s.year, z.month, z.day) - case when g.kind = 'greenhouse' then 21 else 0 end;
