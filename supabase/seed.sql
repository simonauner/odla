-- Test data for local Supabase (`npm run db:start` / `npm run db:reset`). Never run against production.
-- Login: agent@odla.test / odla-test-123

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new
) values (
  '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated', 'agent@odla.test', extensions.crypt('odla-test-123', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{}', now(), now(),
  '', '', '', ''
);

insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
values (
  gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'email',
  '{"sub":"11111111-1111-1111-1111-111111111111","email":"agent@odla.test","email_verified":true}', now(), now(), now()
);

-- The profile is created by the on_auth_user_created trigger.
update public.profiles set display_name = 'Testagent' where id = '11111111-1111-1111-1111-111111111111';

insert into public.gardens (id, user_id, name, zone, kind) values
  ('44444444-4444-4444-4444-444444444441', '11111111-1111-1111-1111-111111111111', 'Hemma', 3, 'open'),
  ('44444444-4444-4444-4444-444444444442', '11111111-1111-1111-1111-111111111111', 'Lantstället', 6, 'open');

-- Season for the current growing year (same rule as currentSeasonYear: from October it is next year).
-- Only "Hemma" has a season, so "Lantstället" can be picked when adding a new one.
insert into public.seasons (id, user_id, garden_id, year)
values (
  '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444441',
  extract(year from now())::smallint + (case when extract(month from now()) >= 10 then 1 else 0 end)
);

insert into public.plantings (id, season_id, user_id, crop_id) values
  ('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'tomato'),
  ('33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'lettuce');

-- step_key = "<stepId>:<index>" (see shared/season.ts). Tomatoes sown indoors on 25 March.
insert into public.task_logs (planting_id, user_id, step_key, status, done_on)
select '33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', 'sow:0', 'done', make_date(year, 3, 25)
from public.seasons where id = '22222222-2222-2222-2222-222222222222';

-- Last year's season at "Lantstället", still open: the plan asks whether to close it, and the
-- setup flow prefills its crops and frost date when planning this year there.
insert into public.seasons (id, user_id, garden_id, year, last_frost)
select '22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444442',
  year - 1, make_date(year - 1, 6, 5)
from public.seasons where id = '22222222-2222-2222-2222-222222222222';

insert into public.plantings (id, season_id, user_id, crop_id) values
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'lettuce'),
  ('33333333-3333-3333-3333-333333333334', '22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'potato');
