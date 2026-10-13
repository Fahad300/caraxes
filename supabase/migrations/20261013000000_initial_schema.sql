-- Caraxes initial schema.
--
-- Every user-owned table carries user_id (defaults to auth.uid()) and is
-- protected by row-level security. Child rows reference their parent through
-- a composite (id, user_id) foreign key so a row can never point at another
-- user's parent. Catalog tables (exercises, foods) hold global rows with
-- user_id IS NULL that every signed-in user can read but not change.

create extension if not exists pg_trgm;

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  protein_target_low_g integer not null default 155 check (protein_target_low_g > 0),
  protein_target_high_g integer not null default 195 check (protein_target_high_g > 0),
  water_target_ml integer not null default 3000 check (water_target_ml > 0),
  seeded_at timestamptz,
  created_at timestamptz not null default now()
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- --------------------------------------------------------------- exercises
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade default auth.uid(),
  source text not null default 'custom',
  external_id text,
  name text not null check (length(trim(name)) > 0),
  category text,
  level text,
  force text,
  mechanic text,
  equipment text,
  primary_muscles text[] not null default '{}',
  secondary_muscles text[] not null default '{}',
  instructions text[] not null default '{}',
  images text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (source, external_id)
);
create index exercises_name_trgm on public.exercises using gin (name gin_trgm_ops);
create index exercises_user_idx on public.exercises (user_id);

-- ---------------------------------------------------------------- routines
create table public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  unique (id, user_id)
);
-- At most one active routine per user.
create unique index routines_one_active on public.routines (user_id) where is_active;

create table public.routine_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  routine_id uuid not null,
  name text not null check (length(trim(name)) > 0),
  weekday smallint check (weekday between 1 and 7), -- 1 = Monday; null = unscheduled
  focus text,
  cardio_finisher text,
  sort_order integer not null default 0,
  unique (id, user_id),
  foreign key (routine_id, user_id) references public.routines (id, user_id) on delete cascade
);
create index routine_days_routine_idx on public.routine_days (routine_id);

create table public.routine_day_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day_id uuid not null,
  exercise_id uuid not null references public.exercises (id),
  sort_order integer not null default 0,
  target_sets integer not null check (target_sets > 0),
  rep_low integer not null check (rep_low > 0),
  rep_high integer not null check (rep_high >= rep_low),
  rest_seconds integer check (rest_seconds >= 0),
  per_side boolean not null default false,
  phase text not null check (phase in ('activation', 'compound', 'accessory', 'isolation')),
  foreign key (day_id, user_id) references public.routine_days (id, user_id) on delete cascade
);
create index routine_day_exercises_day_idx on public.routine_day_exercises (day_id);

-- ---------------------------------------------------------------- sessions
-- day_name / exercise_name are snapshots so history survives routine edits.
create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  routine_day_id uuid references public.routine_days (id) on delete set null,
  day_name text not null,
  logged_on date not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  unique (id, user_id)
);
create index workout_sessions_user_day_idx on public.workout_sessions (user_id, logged_on);

create table public.set_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  session_id uuid not null,
  exercise_id uuid references public.exercises (id) on delete set null,
  exercise_name text not null,
  set_number integer not null check (set_number > 0),
  weight numeric check (weight >= 0),
  reps integer check (reps >= 0),
  logged_at timestamptz not null default now(),
  foreign key (session_id, user_id) references public.workout_sessions (id, user_id) on delete cascade
);
create index set_logs_session_idx on public.set_logs (session_id);
create index set_logs_exercise_idx on public.set_logs (user_id, exercise_name);

-- -------------------------------------------------------------------- diet
create table public.foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade default auth.uid(),
  source text not null default 'custom' check (source in ('usda', 'off', 'custom')),
  external_id text,
  name text not null check (length(trim(name)) > 0),
  serving_g numeric check (serving_g > 0),
  serving_label text,
  protein_g_per_100g numeric not null default 0 check (protein_g_per_100g >= 0),
  kcal_per_100g numeric check (kcal_per_100g >= 0),
  created_at timestamptz not null default now(),
  unique (source, external_id)
);
create index foods_name_trgm on public.foods using gin (name gin_trgm_ops);
create index foods_user_idx on public.foods (user_id);

create table public.meal_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  sort_order integer not null default 0,
  unique (id, user_id)
);

create table public.meal_template_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  template_id uuid not null,
  food_id uuid references public.foods (id) on delete set null,
  label text not null,
  quantity_g numeric check (quantity_g > 0),
  protein_g numeric not null default 0 check (protein_g >= 0),
  kcal numeric check (kcal >= 0),
  sort_order integer not null default 0,
  foreign key (template_id, user_id) references public.meal_templates (id, user_id) on delete cascade
);
create index meal_template_items_template_idx on public.meal_template_items (template_id);

create table public.food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  logged_on date not null,
  logged_at timestamptz not null default now(),
  meal_slot text,
  label text not null,
  quantity_g numeric check (quantity_g > 0),
  protein_g numeric not null default 0 check (protein_g >= 0),
  kcal numeric check (kcal >= 0),
  food_id uuid references public.foods (id) on delete set null,
  template_id uuid references public.meal_templates (id) on delete set null
);
create index food_logs_user_day_idx on public.food_logs (user_id, logged_on);

create table public.water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  logged_on date not null,
  logged_at timestamptz not null default now(),
  amount_ml integer not null check (amount_ml > 0)
);
create index water_logs_user_day_idx on public.water_logs (user_id, logged_on);

-- ---------------------------------------------------- weight / supplements
create table public.weight_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  logged_on date not null,
  weight_kg numeric not null check (weight_kg > 0),
  unique (user_id, logged_on)
);

create table public.supplements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  dose text,
  timing text,
  protein_g numeric not null default 0 check (protein_g >= 0), -- counted toward daily protein when taken
  sort_order integer not null default 0,
  is_active boolean not null default true,
  unique (id, user_id)
);

create table public.supplement_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  supplement_id uuid not null,
  taken_on date not null,
  logged_at timestamptz not null default now(),
  unique (supplement_id, taken_on),
  foreign key (supplement_id, user_id) references public.supplements (id, user_id) on delete cascade
);
create index supplement_logs_user_day_idx on public.supplement_logs (user_id, taken_on);

-- ------------------------------------------------------ row-level security
-- Plain per-user tables: full access to your own rows, nothing else.
do $$
declare
  t text;
begin
  foreach t in array array[
    'routines', 'routine_days', 'routine_day_exercises',
    'workout_sessions', 'set_logs',
    'meal_templates', 'meal_template_items', 'food_logs', 'water_logs',
    'weight_entries', 'supplements', 'supplement_logs'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "own rows" on public.%I for all to authenticated
         using (user_id = (select auth.uid()))
         with check (user_id = (select auth.uid()))',
      t
    );
  end loop;
end
$$;

-- profiles: keyed by id rather than user_id.
alter table public.profiles enable row level security;
create policy "own profile read" on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy "own profile insert" on public.profiles for insert to authenticated
  with check (id = (select auth.uid()));
create policy "own profile update" on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Catalog tables: read global rows + your own; write only your own.
do $$
declare
  t text;
begin
  foreach t in array array['exercises', 'foods']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "read catalog and own" on public.%I for select to authenticated
         using (user_id is null or user_id = (select auth.uid()))',
      t
    );
    execute format(
      'create policy "insert own" on public.%I for insert to authenticated
         with check (user_id = (select auth.uid()))',
      t
    );
    execute format(
      'create policy "update own" on public.%I for update to authenticated
         using (user_id = (select auth.uid()))
         with check (user_id = (select auth.uid()))',
      t
    );
    execute format(
      'create policy "delete own" on public.%I for delete to authenticated
         using (user_id = (select auth.uid()))',
      t
    );
  end loop;
end
$$;

-- ----------------------------------------------------------- seed default
-- Called once after a user's first sign-in with the app's default program
-- and supplement stack. Runs as the caller (RLS applies), is atomic, and is a
-- no-op if the account was already seeded.
create function public.seed_default_data(payload jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  v_routine_id uuid;
  v_day jsonb;
  v_ex jsonb;
  v_supp jsonb;
  v_day_id uuid;
  v_exercise_id uuid;
  v_day_sort integer := 0;
  v_ex_sort integer;
  v_supp_sort integer := 0;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  insert into profiles (id) values (uid) on conflict do nothing;
  if exists (select 1 from profiles where id = uid and seeded_at is not null) then
    return;
  end if;

  insert into routines (user_id, name, is_active)
  values (uid, coalesce(payload -> 'routine' ->> 'name', 'My routine'), true)
  returning id into v_routine_id;

  for v_day in select * from jsonb_array_elements(payload -> 'routine' -> 'days')
  loop
    v_day_sort := v_day_sort + 1;
    insert into routine_days (user_id, routine_id, name, weekday, focus, cardio_finisher, sort_order)
    values (
      uid, v_routine_id, v_day ->> 'name', (v_day ->> 'weekday')::smallint,
      v_day ->> 'focus', v_day ->> 'cardio_finisher', v_day_sort
    )
    returning id into v_day_id;

    v_ex_sort := 0;
    for v_ex in select * from jsonb_array_elements(v_day -> 'exercises')
    loop
      v_ex_sort := v_ex_sort + 1;

      -- Prefer a catalog/own exercise with the same name; otherwise create a
      -- custom one the user can later swap for a catalog exercise.
      v_exercise_id := null;
      select id into v_exercise_id
        from exercises
       where lower(name) = lower(v_ex ->> 'name')
         and (user_id is null or user_id = uid)
       order by user_id nulls first
       limit 1;
      if v_exercise_id is null then
        insert into exercises (user_id, source, name)
        values (uid, 'custom', v_ex ->> 'name')
        returning id into v_exercise_id;
      end if;

      insert into routine_day_exercises (
        user_id, day_id, exercise_id, sort_order, target_sets,
        rep_low, rep_high, rest_seconds, per_side, phase
      )
      values (
        uid, v_day_id, v_exercise_id, v_ex_sort, (v_ex ->> 'sets')::integer,
        (v_ex ->> 'rep_low')::integer, (v_ex ->> 'rep_high')::integer,
        (v_ex ->> 'rest_seconds')::integer,
        coalesce((v_ex ->> 'per_side')::boolean, false), v_ex ->> 'phase'
      );
    end loop;
  end loop;

  for v_supp in select * from jsonb_array_elements(coalesce(payload -> 'supplements', '[]'::jsonb))
  loop
    v_supp_sort := v_supp_sort + 1;
    insert into supplements (user_id, name, dose, timing, protein_g, sort_order)
    values (
      uid, v_supp ->> 'name', v_supp ->> 'dose', v_supp ->> 'timing',
      coalesce((v_supp ->> 'protein_g')::numeric, 0), v_supp_sort
    );
  end loop;

  update profiles set seeded_at = now() where id = uid;
end;
$$;

revoke all on function public.seed_default_data(jsonb) from public, anon;
grant execute on function public.seed_default_data(jsonb) to authenticated;
