import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from './auth';
import { supabase } from './supabase';
import { localDateKey } from './week';

// All reads and writes go through React Query so a log on one tab shows up on
// the others (mutations invalidate by key prefix). user_id is never sent on
// inserts: the column defaults to auth.uid() and row-level security enforces
// ownership.

export const todayKey = () => localDateKey(new Date());

// ------------------------------------------------------------------- meals
export function useFoodLogs(dateKey: string) {
  return useQuery({
    queryKey: ['foodLogs', dateKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_logs')
        .select('id, label, protein_g, logged_at')
        .eq('logged_on', dateKey)
        .order('logged_at', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useAddFoodLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { proteinG: number; label: string }) => {
      const { error } = await supabase.from('food_logs').insert({
        logged_on: todayKey(),
        label: input.label,
        protein_g: input.proteinG,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['foodLogs'] }),
  });
}

// ------------------------------------------------------------ supplements
export function useSupplements() {
  return useQuery({
    queryKey: ['supplements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplements')
        .select('id, name, dose, timing, protein_g')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useSupplementLogs(dateKey: string) {
  return useQuery({
    queryKey: ['supplementLogs', dateKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplement_logs')
        .select('supplement_id')
        .eq('taken_on', dateKey);
      if (error) throw error;
      return new Set(data.map((r) => r.supplement_id));
    },
  });
}

export function useToggleSupplement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { supplementId: string; taken: boolean; dateKey: string }) => {
      if (input.taken) {
        const { error } = await supabase
          .from('supplement_logs')
          .delete()
          .eq('supplement_id', input.supplementId)
          .eq('taken_on', input.dateKey);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('supplement_logs')
          .insert({ supplement_id: input.supplementId, taken_on: input.dateKey });
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['supplementLogs'] }),
  });
}

// ------------------------------------------------------------------ weight
export function useWeights(limit = 60) {
  return useQuery({
    queryKey: ['weights', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weight_entries')
        .select('id, logged_on, weight_kg')
        .order('logged_on', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
  });
}

export function useLogWeight() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  return useMutation({
    mutationFn: async (weightKg: number) => {
      const userId = session?.user.id;
      if (!userId) throw new Error('Not signed in');
      // One entry per day: logging again the same day replaces it.
      const { error } = await supabase
        .from('weight_entries')
        .upsert(
          { user_id: userId, logged_on: todayKey(), weight_kg: weightKg },
          { onConflict: 'user_id,logged_on' }
        );
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['weights'] }),
  });
}

// ----------------------------------------------------------------- workout
export async function createSession(input: { dayName: string; routineDayId: string | null }) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({
      day_name: input.dayName,
      routine_day_id: input.routineDayId,
      logged_on: todayKey(),
    })
    .select('id, started_at')
    .single();
  if (error) throw error;
  return data;
}

export async function insertSetLog(input: {
  sessionId: string;
  exerciseId: string | null;
  exerciseName: string;
  setNumber: number;
  weight: number;
  reps: number;
}) {
  const { data, error } = await supabase
    .from('set_logs')
    .insert({
      session_id: input.sessionId,
      exercise_id: input.exerciseId,
      exercise_name: input.exerciseName,
      set_number: input.setNumber,
      weight: input.weight,
      reps: input.reps,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function deleteSetLog(id: string) {
  const { error } = await supabase.from('set_logs').delete().eq('id', id);
  if (error) throw error;
}
