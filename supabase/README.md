# Supabase setup

Caraxes stores accounts and data in Supabase (Postgres + Auth). Only the
publishable key ships in the app; row-level security on every table is what
keeps one user's data away from another's.

## One-time setup

1. Create a free project at <https://supabase.com> (you create the account
   and project yourself).
2. **SQL editor -> New query**, paste
   `migrations/20261013000000_initial_schema.sql`, run it.
3. Run `tests/rls_isolation.sql` the same way. It should return
   `RLS isolation tests passed` and leaves nothing behind (it rolls back).
4. **Project Settings -> API**: copy the project URL and the publishable
   (anon) key into `.env.local` (see `.env.example`). Never use the
   service-role key in the app.
5. Optional for a personal app: **Authentication -> Providers -> Email**,
   turn off "Confirm email" so sign-up gives a session immediately. Leave it
   on if you want email verification.
6. Restart `npx expo start` so the new variables are picked up.

## Notes

- Free-tier projects have historically been paused after about a week of
  inactivity; resume from the dashboard if the app suddenly can't connect.
- The default routine and supplement stack are inserted by the app on first
  sign-in through the `seed_default_data` function (atomic, idempotent).

## Exercise catalog

`migrations/20261013010000_import_exercise_catalog.sql` imports ~870
exercises from [free-exercise-db](https://github.com/yuhonas/free-exercise-db)
(Unlicense) as shared rows (`user_id is null`, `source = 'free-exercise-db'`).
The database downloads the JSON itself via the `http` extension, which the
migration enables and then drops; re-running it updates rows in place.
Images are stored as relative paths; prefix with
`https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/`.
