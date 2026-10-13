-- RLS isolation test. Paste into the Supabase SQL editor (runs as postgres).
-- Everything happens inside one transaction that is rolled back at the end,
-- so no test users or rows are left behind. Any failed check raises an
-- exception that starts with FAIL:.

begin;

insert into auth.users (id, email) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'rls-a@example.test'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'rls-b@example.test');

-- A global catalog row (user_id null).
insert into public.exercises (id, user_id, source, external_id, name)
values ('cccccccc-0000-0000-0000-000000000003', null, 'rls-test', 'rls-1', 'RLS Test Press');

-- ------------------------------------------------------------ user A
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"aaaaaaaa-0000-0000-0000-000000000001","role":"authenticated"}', true);

insert into public.weight_entries (logged_on, weight_kg) values (current_date, 80);

do $$
begin
  if (select count(*) from public.exercises where id = 'cccccccc-0000-0000-0000-000000000003') <> 1 then
    raise exception 'FAIL: A cannot read the global catalog exercise';
  end if;

  update public.exercises set name = 'hacked' where id = 'cccccccc-0000-0000-0000-000000000003';
  if (select name from public.exercises where id = 'cccccccc-0000-0000-0000-000000000003') <> 'RLS Test Press' then
    raise exception 'FAIL: A modified a global catalog row';
  end if;
end
$$;

-- Seeding is atomic and idempotent: calling it twice creates one routine.
select public.seed_default_data(
  '{"routine":{"name":"T","days":[{"name":"D","weekday":1,"exercises":[
     {"name":"RLS Test Press","phase":"compound","sets":3,"rep_low":6,"rep_high":10,"rest_seconds":120}]}]},
    "supplements":[{"name":"S","dose":"1","timing":"Daily"}]}'::jsonb);
select public.seed_default_data(
  '{"routine":{"name":"T2","days":[]},"supplements":[]}'::jsonb);

do $$
begin
  if (select count(*) from public.routines) <> 1 then
    raise exception 'FAIL: seed_default_data is not idempotent';
  end if;
  if (select count(*) from public.routine_day_exercises) <> 1 then
    raise exception 'FAIL: seeded day exercise missing';
  end if;
  if (select count(*) from public.exercises where user_id is not null) <> 0 then
    raise exception 'FAIL: seed should reuse the catalog exercise, not create a copy';
  end if;
end
$$;

-- ------------------------------------------------------------ user B
select set_config('request.jwt.claims',
  '{"sub":"bbbbbbbb-0000-0000-0000-000000000002","role":"authenticated"}', true);

do $$
declare
  n integer;
begin
  if (select count(*) from public.weight_entries) <> 0 then
    raise exception 'FAIL: B can read A''s weight entries';
  end if;
  if (select count(*) from public.routines) <> 0 then
    raise exception 'FAIL: B can read A''s routines';
  end if;
  if (select count(*) from public.supplements) <> 0 then
    raise exception 'FAIL: B can read A''s supplements';
  end if;

  delete from public.weight_entries;
  get diagnostics n = row_count;
  if n <> 0 then
    raise exception 'FAIL: B deleted A''s rows';
  end if;

  begin
    insert into public.weight_entries (user_id, logged_on, weight_kg)
    values ('aaaaaaaa-0000-0000-0000-000000000001', current_date - 1, 1);
    raise exception 'FAIL: B inserted a row owned by A';
  exception
    when insufficient_privilege then null; -- RLS violation (42501) is the expected outcome
  end;
end
$$;

-- --------------------------------------------------------- signed out
reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

do $$
begin
  begin
    if (select count(*) from public.weight_entries) <> 0 then
      raise exception 'FAIL: anon can read weight entries';
    end if;
  exception
    when insufficient_privilege then null; -- also acceptable: no table privilege at all
  end;
end
$$;

reset role;
select 'RLS isolation tests passed' as result;

rollback;
