-- Odla: grundschema.
-- Planen räknas fram i koden från grödmall + zon + år; databasen lagrar bara
-- användarens val och det som faktiskt hände (utförda steg, foton, utvärdering).

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  zone smallint check (zone between 1 and 8),
  created_at timestamptz not null default now()
);

create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  year smallint not null check (year between 2000 and 2100),
  zone smallint not null check (zone between 1 and 8),
  created_at timestamptz not null default now(),
  unique (user_id, year)
);

create table public.plantings (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  crop_id text not null,
  variety text,
  quantity integer check (quantity > 0),
  location text,
  notes text,
  created_at timestamptz not null default now()
);
create index plantings_season_id_idx on public.plantings (season_id);
create index plantings_user_id_idx on public.plantings (user_id);

-- Ett utfört (eller överhoppat) steg i planen. step_key = "<stepId>:<löpnummer>" från planmotorn.
create table public.task_logs (
  id uuid primary key default gen_random_uuid(),
  planting_id uuid not null references public.plantings (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  step_key text not null,
  status text not null default 'done' check (status in ('done', 'skipped')),
  done_on date not null,
  note text,
  created_at timestamptz not null default now(),
  unique (planting_id, step_key)
);
create index task_logs_user_id_idx on public.task_logs (user_id);

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  planting_id uuid not null references public.plantings (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  storage_path text not null unique,
  taken_on date not null default current_date,
  caption text,
  created_at timestamptz not null default now()
);
create index photos_planting_id_idx on public.photos (planting_id);
create index photos_user_id_idx on public.photos (user_id);

create table public.evaluations (
  planting_id uuid primary key references public.plantings (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  rating smallint check (rating between 1 and 5),
  harvest_kg numeric(7, 2) check (harvest_kg >= 0),
  went_well text,
  do_differently text,
  updated_at timestamptz not null default now()
);
create index evaluations_user_id_idx on public.evaluations (user_id);

-- Radnivåsäkerhet: varje användare ser och ändrar bara sina egna rader.
alter table public.profiles enable row level security;
alter table public.seasons enable row level security;
alter table public.plantings enable row level security;
alter table public.task_logs enable row level security;
alter table public.photos enable row level security;
alter table public.evaluations enable row level security;

create policy "own profile" on public.profiles
  for all to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "own seasons" on public.seasons
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "own plantings" on public.plantings
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.seasons s where s.id = season_id and s.user_id = (select auth.uid()))
  );

create policy "own task logs" on public.task_logs
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.plantings p where p.id = planting_id and p.user_id = (select auth.uid()))
  );

create policy "own photos" on public.photos
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.plantings p where p.id = planting_id and p.user_id = (select auth.uid()))
  );

create policy "own evaluations" on public.evaluations
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.plantings p where p.id = planting_id and p.user_id = (select auth.uid()))
  );

-- Data API: tabellerna exponeras uttryckligen (automatisk exponering är avslagen).
-- Bara inloggade användare, aldrig anon; RLS ovan begränsar till egna rader.
revoke all on public.profiles, public.seasons, public.plantings, public.task_logs, public.photos, public.evaluations from anon, authenticated;
grant select, update (display_name, zone) on public.profiles to authenticated;
grant select, insert, update, delete on public.seasons, public.plantings, public.task_logs, public.photos, public.evaluations to authenticated;

-- Profil skapas automatiskt vid registrering.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Privat bucket för foton. Sökväg: <user_id>/<planting_id>/<fil>.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/heic']);

create policy "own photo files" on storage.objects
  for all to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
