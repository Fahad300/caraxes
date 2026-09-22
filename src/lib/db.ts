import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'caraxes.db';

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion < 1) {
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';

      CREATE TABLE sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        day TEXT NOT NULL,
        started_at TEXT NOT NULL,
        ended_at TEXT
      );

      CREATE TABLE logged_sets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL REFERENCES sessions(id),
        exercise_name TEXT NOT NULL,
        set_number INTEGER NOT NULL,
        weight REAL,
        reps INTEGER,
        logged_at TEXT NOT NULL
      );

      CREATE TABLE meals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        protein_grams REAL NOT NULL,
        note TEXT,
        logged_at TEXT NOT NULL
      );

      CREATE TABLE supplement_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        supplement_name TEXT NOT NULL,
        taken_on TEXT NOT NULL,
        logged_at TEXT NOT NULL
      );

      CREATE TABLE weight_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        weight_kg REAL NOT NULL,
        logged_on TEXT NOT NULL UNIQUE
      );

      CREATE INDEX idx_logged_sets_exercise ON logged_sets(exercise_name);
      CREATE INDEX idx_meals_logged_at ON meals(logged_at);
      CREATE INDEX idx_supplement_logs_taken_on ON supplement_logs(taken_on);
    `);
    await db.execAsync('PRAGMA user_version = 1');
  }
}
