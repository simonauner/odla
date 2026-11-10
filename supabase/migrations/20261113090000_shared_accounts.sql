-- Shared accounts (premium): an owner invites others by email. A member keeps their own login and profile
-- and works in the owner's account instead of their own: they see and change only the owner's places,
-- seasons, crops and logs, and what they add goes there. Their own places rest until they leave.
-- Rows keep user_id = the account owner; task_logs.logged_by records who did a step.

-- shortcut: users switch premium on themselves; revoke update (premium) once payments decide it.
alter table public.profiles add column premium boolean not null default false;

-- Members see each other's names, so everyone gets one: the email's local part until they change it.
update public.profiles p
set display_name = split_part(u.email, '@', 1)
from auth.users u
where u.id = p.id and p.display_name is null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name) values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

-- An invite (user_id null) or, once accepted, a membership.
create table public.account_members (
  account_id uuid not null references public.profiles (id) on delete cascade,
  email text not null check (email = lower(email) and email like '%_@_%'),
  user_id uuid references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (account_id, email)
);
-- A user is a member of at most one account.
create unique index account_members_user_id_key on public.account_members (user_id);

-- The account the signed-in user works in: the one they are a member of while its owner has premium, else their own.
create function public.active_account()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select m.account_id
      from public.account_members m
      join public.profiles p on p.id = m.account_id
      where m.user_id = (select auth.uid()) and p.premium
    ),
    (select auth.uid())
  );
$$;

-- Whether a user is a member of someone else's account. Invites cannot chain: members neither invite nor are joined.
create function public.has_membership(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.account_members where user_id = uid);
$$;

-- Whether others are members of a user's account.
create function public.has_members(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.account_members where account_id = uid and user_id is not null);
$$;

-- Whether a profile belongs to someone in one of the signed-in user's accounts, or to someone who invited them.
create function public.shares_account(other uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  with mine as (
    select (select auth.uid()) as id
    union
    select account_id from public.account_members
    where user_id = (select auth.uid()) or email = lower((select auth.jwt()) ->> 'email')
  )
  select exists (
    select 1 from mine
    where mine.id = other
      or exists (select 1 from public.account_members m where m.account_id = mine.id and m.user_id = other)
  );
$$;

revoke execute on function public.active_account(), public.has_membership(uuid), public.has_members(uuid), public.shares_account(uuid)
  from public, anon;
grant execute on function public.active_account(), public.has_membership(uuid), public.has_members(uuid), public.shares_account(uuid)
  to authenticated;

-- A new place goes to the account the user works in; any other row to the account that owns its parent.
-- Nothing moves to another account.
create function public.set_account_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Separate branches: plpgsql resolves every new.<column> in an expression, even in a case arm not taken.
  if tg_table_name = 'gardens' then
    -- The seed runs without a signed-in user and sets user_id itself.
    new.user_id := case when tg_op = 'INSERT' then coalesce(public.active_account(), new.user_id) else old.user_id end;
  elsif tg_table_name = 'seasons' then
    new.user_id := (select user_id from public.gardens where id = new.garden_id);
  elsif tg_table_name = 'plantings' then
    new.user_id := (select user_id from public.seasons where id = new.season_id);
  else
    new.user_id := (select user_id from public.plantings where id = new.planting_id);
  end if;
  if tg_op = 'UPDATE' and new.user_id is distinct from old.user_id then
    raise exception 'cannot move data to another account';
  end if;
  if tg_table_name = 'task_logs' then
    new.logged_by := coalesce((select auth.uid()), new.user_id);
  end if;
  return new;
end;
$$;

revoke execute on function public.set_account_owner() from public, anon, authenticated;

alter table public.task_logs add column logged_by uuid references public.profiles (id) on delete set null;
update public.task_logs set logged_by = user_id;
create index task_logs_logged_by_idx on public.task_logs (logged_by);

create trigger set_account_owner before insert or update on public.gardens
  for each row execute function public.set_account_owner();
create trigger set_account_owner before insert or update on public.seasons
  for each row execute function public.set_account_owner();
create trigger set_account_owner before insert or update on public.plantings
  for each row execute function public.set_account_owner();
create trigger set_account_owner before insert or update on public.task_logs
  for each row execute function public.set_account_owner();
create trigger set_account_owner before insert or update on public.photos
  for each row execute function public.set_account_owner();
create trigger set_account_owner before insert or update on public.evaluations
  for each row execute function public.set_account_owner();

-- The trigger checks the parent, so each policy only needs the row to be in the active account.
drop policy "own gardens" on public.gardens;
drop policy "own seasons" on public.seasons;
drop policy "own plantings" on public.plantings;
drop policy "own task logs" on public.task_logs;
drop policy "own photos" on public.photos;
drop policy "own evaluations" on public.evaluations;

create policy "account gardens" on public.gardens
  for all to authenticated
  using (user_id = (select public.active_account())) with check (user_id = (select public.active_account()));
create policy "account seasons" on public.seasons
  for all to authenticated
  using (user_id = (select public.active_account())) with check (user_id = (select public.active_account()));
create policy "account plantings" on public.plantings
  for all to authenticated
  using (user_id = (select public.active_account())) with check (user_id = (select public.active_account()));
create policy "account task logs" on public.task_logs
  for all to authenticated
  using (user_id = (select public.active_account())) with check (user_id = (select public.active_account()));
create policy "account photos" on public.photos
  for all to authenticated
  using (user_id = (select public.active_account())) with check (user_id = (select public.active_account()));
create policy "account evaluations" on public.evaluations
  for all to authenticated
  using (user_id = (select public.active_account())) with check (user_id = (select public.active_account()));

drop policy "own photo files" on storage.objects;
create policy "account photo files" on storage.objects
  for all to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select public.active_account())::text)
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = (select public.active_account())::text);

create policy "shared profiles" on public.profiles
  for select to authenticated using (public.shares_account(id));

grant update (premium) on public.profiles to authenticated;

alter table public.account_members enable row level security;

-- The owner sees their invites and members; a member or invitee sees their own row.
create policy "see memberships" on public.account_members
  for select to authenticated
  using (
    account_id = (select auth.uid())
    or user_id = (select auth.uid())
    or email = lower((select auth.jwt()) ->> 'email')
  );

-- Only a premium owner who is not a member elsewhere invites, and not themselves.
create policy "invite" on public.account_members
  for insert to authenticated
  with check (
    account_id = (select auth.uid())
    and user_id is null
    and email <> lower((select auth.jwt()) ->> 'email')
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.premium)
    and not public.has_membership((select auth.uid()))
  );

-- The invitee accepts by setting user_id to themselves, unless others are members of their own account
-- or the inviter has joined someone else's since.
create policy "accept invite" on public.account_members
  for update to authenticated
  using (
    user_id is null
    and email = lower((select auth.jwt()) ->> 'email')
    and not public.has_membership(account_id)
    and not public.has_members((select auth.uid()))
  )
  with check (user_id = (select auth.uid()));

-- The owner removes anyone; a member leaves, an invitee declines.
create policy "remove membership" on public.account_members
  for delete to authenticated
  using (
    account_id = (select auth.uid())
    or user_id = (select auth.uid())
    or email = lower((select auth.jwt()) ->> 'email')
  );

revoke all on public.account_members from anon, authenticated;
grant select, insert (account_id, email), update (user_id), delete on public.account_members to authenticated;
