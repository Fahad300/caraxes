import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { PROGRAM } from './program';
import { supabase } from './supabase';
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
// program day each session was started for (workout_sessions.day_name), so
// doing Friday's workout on a Saturday still ticks off Friday.
export function useWeekProgress() {
  const queryClient = useQueryClient();
  const { start, end } = weekBounds();

  const query = useQuery({
    queryKey: ['weekProgress', start, end],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('day_name, set_logs(count)')
        .gte('logged_on', start)
        .lte('logged_on', end);
      if (error) throw error;

      const counts: Record<string, number> = {};
      for (const row of data) {
        const key = PROGRAM.find((d) => d.label === row.day_name)?.key;
        if (!key) continue;
        counts[key] = (counts[key] ?? 0) + (row.set_logs[0]?.count ?? 0);
      }
      return counts;
    },
  });

  const progress = useMemo(() => build(currentWeek(), query.data ?? {}), [query.data]);

  const reload = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['weekProgress'] }),
    [queryClient]
  );

  return { ...progress, reload };
}
