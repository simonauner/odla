-- Growing places (gardens). A season is now one place's to-do list for one year, so a user
-- can grow in an open bed and a greenhouse in zone IV and at a summer house in zone VI.
-- Existing seasons and everything under them are dropped: there is no data worth migrating yet.
truncate public.seasons cascade;

create table public.gardens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  zone smallint not null check (zone between 1 and 8),
  kind text not null default 'open' check (kind in ('open', 'greenhouse')),
  created_at timestamptz not null default now()
);
create index gardens_user_id_idx on public.gardens (user_id);

alter table public.seasons
  drop constraint seasons_user_id_year_key,
  drop column zone,
  add column garden_id uuid not null references public.gardens (id) on delete cascade,
  add constraint seasons_garden_id_year_key unique (garden_id, year);
create index seasons_user_id_idx on public.seasons (user_id);

-- The zone belongs to each garden now.
alter table public.profiles drop column zone;

alter table public.gardens enable row level security;

create policy "own gardens" on public.gardens
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy "own seasons" on public.seasons;
create policy "own seasons" on public.seasons
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.gardens g where g.id = garden_id and g.user_id = (select auth.uid()))
  );

revoke all on public.gardens from anon, authenticated;
grant select, insert, update, delete on public.gardens to authenticated;
