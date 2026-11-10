-- Who sees what in a shared account. Runs against the seed data: `npx supabase test db`.
begin;
select plan(7);

create function pg_temp.sign_in(uid uuid, email text) returns void language sql as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claims', json_build_object('sub', uid, 'email', email, 'role', 'authenticated')::text, true);
$$;

-- Two users with no ties to the seed account: an invitee (vän@odla.test is invited in the seed) and a stranger.
insert into auth.users (id, email) values
  ('66666666-6666-6666-6666-666666666666', 'vän@odla.test'),
  ('77777777-7777-7777-7777-777777777777', 'stranger@odla.test');
update public.profiles set premium = true where id = '55555555-5555-5555-5555-555555555555';

select pg_temp.sign_in('55555555-5555-5555-5555-555555555555', 'partner@odla.test');
select results_eq(
  'select name from public.gardens order by name',
  array['Hemma', 'Lantstället'],
  'a member sees the owner''s places, not their own'
);
select throws_ok(
  $$insert into public.account_members (account_id, email) values ('55555555-5555-5555-5555-555555555555', 'x@odla.test')$$,
  '42501', null, 'a member cannot invite, even with premium'
);

select pg_temp.sign_in('77777777-7777-7777-7777-777777777777', 'stranger@odla.test');
select is_empty('select 1 from public.gardens', 'a stranger sees no places');
update public.account_members set user_id = '77777777-7777-7777-7777-777777777777' where email = 'vän@odla.test';
select is_empty(
  $$select 1 from public.account_members where user_id = '77777777-7777-7777-7777-777777777777'$$,
  'a stranger cannot accept someone else''s invite'
);

select pg_temp.sign_in('66666666-6666-6666-6666-666666666666', 'vän@odla.test');
update public.account_members set user_id = '66666666-6666-6666-6666-666666666666' where email = 'vän@odla.test';
select results_eq(
  'select count(*) from public.gardens', array[2::bigint], 'the invitee who accepts sees the owner''s places'
);

reset role;
update public.profiles set premium = false where id = '11111111-1111-1111-1111-111111111111';
select pg_temp.sign_in('55555555-5555-5555-5555-555555555555', 'partner@odla.test');
select results_eq(
  'select name from public.gardens', array['Balkongen'], 'without the owner''s premium a member is back in their own places'
);
select throws_ok(
  $$insert into public.seasons (garden_id, year) values ('44444444-4444-4444-4444-444444444441', 2030)$$,
  '42501', null, 'and cannot add to the owner''s places'
);

select * from finish();
rollback;
