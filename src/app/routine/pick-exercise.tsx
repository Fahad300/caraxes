import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Chip } from '../../components/Chip';
import {
  MUSCLE_GROUPS,
  createCustomExercise,
  useActiveRoutine,
  useAddRoutineExercise,
  useExerciseSearch,
  useUpdateRoutineExercise,
  type ExerciseResult,
} from '../../lib/routine';
import type { ExercisePhase } from '../../lib/program';
import { dangerText, functional, radius, spacing } from '../../lib/theme';

function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return debounced;
}

// Compound lifts default to the compound phase, everything else to isolation;
// the user can change the phase afterwards in the day editor.
const defaultPhase = (e: Pick<ExerciseResult, 'mechanic'>): ExercisePhase =>
  e.mechanic === 'compound' ? 'compound' : 'isolation';

export default function PickExerciseScreen() {
  const { dayId, replaceId } = useLocalSearchParams<{ dayId: string; replaceId?: string }>();
  const routine = useActiveRoutine().data;
  const day = routine?.days.find((d) => d.id === dayId);

  const [query, setQuery] = useState('');
  const [muscle, setMuscle] = useState<string | null>(null);
  const debounced = useDebounced(query, 250);
  const search = useExerciseSearch(debounced, muscle);
  const addExercise = useAddRoutineExercise();
  const updateExercise = useUpdateRoutineExercise();
  const [creating, setCreating] = useState(false);

  const trimmed = query.trim();
  const results = search.data ?? [];
  const exactMatch = results.some((r) => r.name.toLowerCase() === trimmed.toLowerCase());
  const canCreate = trimmed.length >= 2 && !exactMatch && !search.isFetching;
  const isReplace = !!replaceId;

  function choose(exerciseId: string, phase: ExercisePhase) {
    if (!day) return;
    const done = { onSuccess: () => router.back(), onError: (e: Error) => Alert.alert("Couldn't save", e.message) };
    if (replaceId) {
      updateExercise.mutate({ id: replaceId, patch: { exercise_id: exerciseId } }, done);
    } else {
      const sortOrder = Math.max(0, ...day.exercises.map((e) => e.sortOrder)) + 1;
      addExercise.mutate({ dayId: day.id, exerciseId, sortOrder, phase }, done);
    }
  }

  async function createAndChoose() {
    setCreating(true);
    try {
      const id = await createCustomExercise(trimmed);
      choose(id, 'accessory');
    } catch (e) {
      Alert.alert("Couldn't create exercise", e instanceof Error ? e.message : 'Try again.');
    } finally {
      setCreating(false);
    }
  }

  const busy = addExercise.isPending || updateExercise.isPending || creating;

  return (
    <View style={styles.container}>
      <View style={styles.searchWrap}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search exercises (e.g. bench press)"
          placeholderTextColor={functional.textFaint}
          accessibilityLabel="Search exercises"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          style={styles.search}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipRow}
        keyboardShouldPersistTaps="handled"
      >
        {MUSCLE_GROUPS.map((m) => (
          <Chip key={m} label={m} selected={muscle === m} onPress={() => setMuscle(muscle === m ? null : m)} />
        ))}
      </ScrollView>

      {isReplace && <Text style={styles.banner}>Swapping keeps the sets, reps and rest you set.</Text>}

      <FlatList
        data={results}
        keyExtractor={(r) => r.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          canCreate ? (
            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={createAndChoose}
              style={({ pressed }) => [styles.row, styles.createRow, pressed && styles.pressed]}
            >
              <Text style={styles.name}>Create custom exercise “{trimmed}”</Text>
              <Text style={styles.meta}>Only visible to you</Text>
            </Pressable>
          ) : null
        }
        ListEmptyComponent={
          search.isFetching ? (
            <ActivityIndicator color={functional.text} style={styles.spinner} />
          ) : search.isError ? (
            <Text style={styles.error}>{search.error.message}</Text>
          ) : trimmed.length < 2 && !muscle ? (
            <Text style={styles.hint}>Type at least 2 letters, or pick a muscle group.</Text>
          ) : (
            <Text style={styles.hint}>No matches.</Text>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={() => choose(item.id, defaultPhase(item))}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <View style={styles.rowText}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {[item.equipment ?? 'bodyweight', item.primary_muscles.join(', '), item.level]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
            </View>
            {item.user_id ? <Text style={styles.badge}>custom</Text> : null}
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: functional.background },
  searchWrap: { padding: spacing.md, paddingBottom: spacing.sm },
  search: {
    minHeight: 48,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: functional.border,
    backgroundColor: functional.elevated,
    paddingHorizontal: spacing.lg,
    color: functional.text,
    fontSize: 16,
  },
  chipScroll: { flexGrow: 0 },
  chipRow: { paddingHorizontal: spacing.md, gap: spacing.sm, paddingBottom: spacing.sm },
  banner: { color: functional.textDim, fontSize: 12, paddingHorizontal: spacing.lg, paddingBottom: spacing.xs },
  list: { padding: spacing.md, gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: functional.elevated,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 56,
  },
  createRow: { borderWidth: 1, borderColor: functional.border, flexDirection: 'column', alignItems: 'flex-start' },
  pressed: { opacity: 0.8 },
  rowText: { flex: 1, gap: 2 },
  name: { color: functional.text, fontSize: 15, fontWeight: '700' },
  meta: { color: functional.textDim, fontSize: 12 },
  badge: { color: functional.textFaint, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  hint: { color: functional.textDim, textAlign: 'center', marginTop: spacing.xl },
  error: { color: dangerText, textAlign: 'center', marginTop: spacing.xl },
  spinner: { marginTop: spacing.xl },
});
