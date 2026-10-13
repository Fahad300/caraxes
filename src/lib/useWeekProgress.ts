import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { currentWeek, weekBounds, type WeekDay } from './week';

export interface DayProgress extends WeekDay {
  loggedSets: number;
  done: boolean;
}

export interface WeekProgress {
  days: DayProgress[];
  loggedSets: number;
  plannedSets: number;
  fraction: number;
}

function build(days: WeekDay[], countsByDay: Record<string, number>): WeekProgress {
  const progress = days.map((d) => {
    // Clamp: a reloaded app starts a new session row for the same program
    // day, and extra sets beyond the plan shouldn't push the bar past 100%.
    const loggedSets = Math.min(countsByDay[d.key] ?? 0, d.plannedSets);
    return { ...d, loggedSets, done: d.plannedSets > 0 && loggedSets >= d.plannedSets };
  });
  const loggedSets = progress.reduce((sum, d) => sum + d.loggedSets, 0);
  const plannedSets = progress.reduce((sum, d) => sum + d.plannedSets, 0);
  return { days: progress, loggedSets, plannedSets, fraction: plannedSets === 0 ? 0 : loggedSets / plannedSets };
}

// Sets logged against the fixed program for the current week. Counted by the
// program day each session was started for (sessions.day), so doing Friday's
// workout on a Saturday still ticks off Friday.
export function useWeekProgress() {
  const db = useSQLiteContext();
  const [progress, setProgress] = useState<WeekProgress>(() => build(currentWeek(), {}));

  const reload = useCallback(async () => {
    const { start, end } = weekBounds();
    const rows = await db.getAllAsync<{ day_key: string; sets: number }>(
      `SELECT s.day AS day_key, COUNT(*) AS sets
         FROM logged_sets ls
         JOIN sessions s ON s.id = ls.session_id
        WHERE date(s.started_at, 'localtime') BETWEEN ? AND ?
        GROUP BY s.day`,
      start,
      end
    );
    const counts: Record<string, number> = {};
    for (const r of rows) counts[r.day_key] = r.sets;
    setProgress(build(currentWeek(), counts));
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  return { ...progress, reload };
}
