-- Imports the free-exercise-db catalog (yuhonas/free-exercise-db, Unlicense /
-- public domain) as global exercise rows (user_id null) that every signed-in
-- user can read and search.
--
-- The database fetches the JSON itself with the `http` extension so the data
-- doesn't have to be pasted into this file. It is idempotent: re-running
-- updates rows by (source, external_id). Images are stored as the dataset's
-- relative paths (e.g. "Air_Bike/0.jpg"); the app prefixes the base URL
--   https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/

create extension if not exists http with schema extensions;

do $$
declare
  body text;
  doc jsonb;
begin
  perform extensions.http_set_curlopt('CURLOPT_TIMEOUT', '60');

  select content into body
    from extensions.http_get(
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'
    );
  doc := body::jsonb;

  if jsonb_typeof(doc) <> 'array' or jsonb_array_length(doc) < 100 then
    raise exception 'unexpected exercise catalog payload';
  end if;

  insert into public.exercises (
    user_id, source, external_id, name, category, level, force, mechanic,
    equipment, primary_muscles, secondary_muscles, instructions, images
  )
  select
    null,
    'free-exercise-db',
    e ->> 'id',
    e ->> 'name',
    e ->> 'category',
    e ->> 'level',
    e ->> 'force',
    e ->> 'mechanic',
    e ->> 'equipment',
    array(select jsonb_array_elements_text(coalesce(e -> 'primaryMuscles', '[]'::jsonb))),
    array(select jsonb_array_elements_text(coalesce(e -> 'secondaryMuscles', '[]'::jsonb))),
    array(select jsonb_array_elements_text(coalesce(e -> 'instructions', '[]'::jsonb))),
    array(select jsonb_array_elements_text(coalesce(e -> 'images', '[]'::jsonb)))
  from jsonb_array_elements(doc) as e
  where coalesce(e ->> 'id', '') <> '' and coalesce(trim(e ->> 'name'), '') <> ''
  on conflict (source, external_id) do update set
    name = excluded.name,
    category = excluded.category,
    level = excluded.level,
    force = excluded.force,
    mechanic = excluded.mechanic,
    equipment = excluded.equipment,
    primary_muscles = excluded.primary_muscles,
    secondary_muscles = excluded.secondary_muscles,
    instructions = excluded.instructions,
    images = excluded.images;
end
$$;

-- The extension was only needed for the import.
drop extension if exists http;
