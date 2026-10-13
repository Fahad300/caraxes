import { useQuery } from '@tanstack/react-query';

import { useAuth } from './auth';
import { PROGRAM } from './program';
import { SUPPLEMENT_STACK } from './supplements';
import { supabase } from './supabase';
import { restSecondsByPhase } from './theme';
import type { Json } from './database.types';

const WEEKDAY_BY_KEY = { mon: 1, tue: 2, wed: 3, thu: 4, fri: 5 } as const;

// The app's fixed program and supplement stack, in the shape the
// seed_default_data() SQL function expects. Day names are the program day
// labels, which is also how logged sessions are matched back to a day.
function buildSeedPayload(): Json {
  return {
    routine: {
      name: 'Upper / Lower split',
      days: PROGRAM.map((day) => ({
        name: day.label,
        weekday: WEEKDAY_BY_KEY[day.key],
        focus: day.focus,
        cardio_finisher: day.cardioFinisher,
        exercises: day.exercises.map((e) => ({
          name: e.name,
          phase: e.phase,
          sets: e.sets,
          rep_low: e.repRangeLow,
          rep_high: e.repRangeHigh,
          rest_seconds: restSecondsByPhase[e.phase] ?? null,
          per_side: e.perSide ?? false,
        })),
      })),
    },
    supplements: SUPPLEMENT_STACK.map((s) => ({
      name: s.name,
      dose: s.dose,
      timing: s.timing,
      protein_g: 0,
    })),
  };
}

const seededFlagKey = (userId: string) => `caraxes:seeded:${userId}`;

function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function writeFlag(key: string) {
  try {
    localStorage.setItem(key, '1');
  } catch {
    // The flag is only an offline shortcut; the server call is idempotent.
  }
}

// Ensures the signed-in account has its program and supplements. The server
// function is atomic and a no-op once seeded; the local flag just lets the app
// start offline after the first successful run.
export function useEnsureSeeded() {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ['seeded', userId],
    enabled: !!userId,
    staleTime: Infinity,
    queryFn: async () => {
      const flagKey = seededFlagKey(userId as string);
      if (readFlag(flagKey)) return true;
      const { error } = await supabase.rpc('seed_default_data', { payload: buildSeedPayload() });
      if (error) throw error;
      writeFlag(flagKey);
      return true;
    },
  });
}
