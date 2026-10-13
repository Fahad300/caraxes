import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from './supabase';
import type { ExercisePhase } from './program';

// The user's active routine, normalised for the app. Everything that used to
// read the fixed PROGRAM constant (workout, today, week strip) reads this.

export interface RoutineExercise {
  id: string; // routine_day_exercises.id
  exerciseId: string; // exercises.id (catalog or custom)
  name: string;
  phase: ExercisePhase;
  sets: number;
  repRangeLow: number;
  repRangeHigh: number;
  restSeconds: number | null;
  perSide: boolean;
  sortOrder: number;
}

export interface RoutineDay {
  id: string;
  name: string;
  weekday: number | null; // 1 = Monday ... 7 = Sunday
  focus: string | null;
  cardioFinisher: string | null;
  sortOrder: number;
  exercises: RoutineExercise[];
}

export interface Routine {
  id: string;
  name: string;
  days: RoutineDay[];
}

export const WEEKDAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export const WEEKDAY_LONG = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export const PHASES: ExercisePhase[] = ['activation', 'compound', 'accessory', 'isolation'];

const asPhase = (value: string): ExercisePhase =>
  (PHASES as string[]).includes(value) ? (value as ExercisePhase) : 'accessory';

export function useActiveRoutine() {
  return useQuery({
    queryKey: ['routine'],
    queryFn: async (): Promise<Routine | null> => {
      const { data, error } = await supabase
        .from('routines')
        .select(
          `id, name,
           routine_days (
             id, name, weekday, focus, cardio_finisher, sort_order,
             routine_day_exercises (
               id, exercise_id, sort_order, target_sets, rep_low, rep_high,
               rest_seconds, per_side, phase,
               exercises ( name )
             )
           )`
        )
        .eq('is_active', true)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;

      const days = data.routine_days
        .map<RoutineDay>((d) => ({
          id: d.id,
          name: d.name,
          weekday: d.weekday,
          focus: d.focus,
          cardioFinisher: d.cardio_finisher,
          sortOrder: d.sort_order,
          exercises: d.routine_day_exercises
            .map<RoutineExercise>((e) => ({
              id: e.id,
              exerciseId: e.exercise_id,
              name: e.exercises?.name ?? 'Unknown exercise',
              phase: asPhase(e.phase),
              sets: e.target_sets,
              repRangeLow: e.rep_low,
              repRangeHigh: e.rep_high,
              restSeconds: e.rest_seconds,
              perSide: e.per_side,
              sortOrder: e.sort_order,
            }))
            .sort((a, b) => a.sortOrder - b.sortOrder),
        }))
        .sort((a, b) => (a.weekday ?? 99) - (b.weekday ?? 99) || a.sortOrder - b.sortOrder);

      return { id: data.id, name: data.name, days };
    },
  });
}

// Anything that changes the routine also changes what the week strip counts
// against, so both caches go together.
function useRoutineInvalidation() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['routine'] }),
      queryClient.invalidateQueries({ queryKey: ['weekProgress'] }),
    ]);
}

// ------------------------------------------------------------- day mutations
export function useAddDay() {
  const invalidate = useRoutineInvalidation();
  return useMutation({
    mutationFn: async (input: { routineId: string; sortOrder: number; weekday: number | null }) => {
      const { data, error } = await supabase
        .from('routine_days')
        .insert({
          routine_id: input.routineId,
          name: 'New day',
          weekday: input.weekday,
          sort_order: input.sortOrder,
        })
        .select('id')
        .single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: invalidate,
  });
}

export function useUpdateDay() {
  const invalidate = useRoutineInvalidation();
  return useMutation({
    mutationFn: async (input: {
      dayId: string;
      patch: { name?: string; weekday?: number | null; focus?: string | null; cardio_finisher?: string | null };
    }) => {
      const { error } = await supabase.from('routine_days').update(input.patch).eq('id', input.dayId);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteDay() {
  const invalidate = useRoutineInvalidation();
  return useMutation({
    mutationFn: async (dayId: string) => {
      // Logged sessions keep their rows (routine_day_id is set null) and the
      // day_name snapshot; only the plan is removed.
      const { error } = await supabase.from('routine_days').delete().eq('id', dayId);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

// ------------------------------------------------------- exercise mutations
export type ExercisePatch = Partial<{
  target_sets: number;
  rep_low: number;
  rep_high: number;
  rest_seconds: number | null;
  per_side: boolean;
  phase: ExercisePhase;
  exercise_id: string;
}>;

export function useAddRoutineExercise() {
  const invalidate = useRoutineInvalidation();
  return useMutation({
    mutationFn: async (input: {
      dayId: string;
      exerciseId: string;
      sortOrder: number;
      phase: ExercisePhase;
    }) => {
      const { error } = await supabase.from('routine_day_exercises').insert({
        day_id: input.dayId,
        exercise_id: input.exerciseId,
        sort_order: input.sortOrder,
        phase: input.phase,
        target_sets: 3,
        rep_low: 8,
        rep_high: 12,
        rest_seconds: input.phase === 'compound' ? 120 : input.phase === 'isolation' ? 60 : 90,
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useUpdateRoutineExercise() {
  const invalidate = useRoutineInvalidation();
  return useMutation({
    mutationFn: async (input: { id: string; patch: ExercisePatch }) => {
      const { error } = await supabase
        .from('routine_day_exercises')
        .update(input.patch)
        .eq('id', input.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useRemoveRoutineExercise() {
  const invalidate = useRoutineInvalidation();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('routine_day_exercises').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

// Rewrites sort_order for a day's exercises to match the given id order.
export function useReorderRoutineExercises() {
  const invalidate = useRoutineInvalidation();
  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const results = await Promise.all(
        orderedIds.map((id, index) =>
          supabase.from('routine_day_exercises').update({ sort_order: index + 1 }).eq('id', id)
        )
      );
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
    },
    onSuccess: invalidate,
  });
}

// ----------------------------------------------------------------- catalog
export const MUSCLE_GROUPS = [
  'chest',
  'shoulders',
  'triceps',
  'biceps',
  'lats',
  'middle back',
  'lower back',
  'traps',
  'quadriceps',
  'hamstrings',
  'glutes',
  'calves',
  'abdominals',
  'forearms',
  'abductors',
  'adductors',
  'neck',
] as const;

export const EXERCISE_IMAGE_BASE =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

export interface ExerciseResult {
  id: string;
  name: string;
  equipment: string | null;
  level: string | null;
  mechanic: string | null;
  primary_muscles: string[];
  user_id: string | null;
}

// ilike treats % and _ as wildcards; escape them so a search for "50%" is literal.
const escapeLike = (value: string) => value.replace(/[\\%_]/g, (c) => `\\${c}`);

export function useExerciseSearch(query: string, muscle: string | null) {
  const trimmed = query.trim();
  const enabled = trimmed.length >= 2 || muscle !== null;

  return useQuery({
    queryKey: ['exerciseSearch', trimmed.toLowerCase(), muscle],
    enabled,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<ExerciseResult[]> => {
      let request = supabase
        .from('exercises')
        .select('id, name, equipment, level, mechanic, primary_muscles, user_id')
        .order('user_id', { ascending: false, nullsFirst: false }) // your own exercises first
        .order('name', { ascending: true })
        .limit(40);
      if (trimmed.length >= 2) request = request.ilike('name', `%${escapeLike(trimmed)}%`);
      if (muscle) request = request.contains('primary_muscles', [muscle]);
      const { data, error } = await request;
      if (error) throw error;
      return data;
    },
  });
}

export async function createCustomExercise(name: string): Promise<string> {
  const { data, error } = await supabase
    .from('exercises')
    .insert({ source: 'custom', name: name.trim() })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}
