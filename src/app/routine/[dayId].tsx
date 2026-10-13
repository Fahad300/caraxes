import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Stepper } from '../../components/Stepper';
import { TextField } from '../../components/TextField';
import {
  PHASES,
  WEEKDAY_SHORT,
  useActiveRoutine,
  useDeleteDay,
  useRemoveRoutineExercise,
  useReorderRoutineExercises,
  useUpdateDay,
  useUpdateRoutineExercise,
  type ExercisePatch,
  type RoutineExercise,
} from '../../lib/routine';
import { dangerText, functional, radius, spacing } from '../../lib/theme';

const onError = (title: string) => (e: Error) => Alert.alert(title, e.message);

export default function EditDayScreen() {
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
  const routine = useActiveRoutine().data;
  const day = routine?.days.find((d) => d.id === dayId);

  const updateDay = useUpdateDay();
  const deleteDay = useDeleteDay();
  const updateExercise = useUpdateRoutineExercise();
  const removeExercise = useRemoveRoutineExercise();
  const reorder = useReorderRoutineExercises();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!day) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>This day no longer exists.</Text>
      </View>
    );
  }

  const saveText = (field: 'name' | 'focus' | 'cardio_finisher', raw: string) => {
    const value = raw.trim();
    if (field === 'name') {
      // The name is required (and is how past sessions are labelled).
      if (!value || value === day.name) return;
      updateDay.mutate({ dayId: day.id, patch: { name: value } }, { onError: onError("Couldn't rename day") });
      return;
    }
    const current = field === 'focus' ? day.focus : day.cardioFinisher;
    if (value === (current ?? '')) return;
    updateDay.mutate(
      { dayId: day.id, patch: { [field]: value || null } },
      { onError: onError("Couldn't save day") }
    );
  };

  const setWeekday = (weekday: number) =>
    updateDay.mutate(
      // Tapping the selected weekday again unschedules the day.
      { dayId: day.id, patch: { weekday: day.weekday === weekday ? null : weekday } },
      { onError: onError("Couldn't set weekday") }
    );

  const patchExercise = (id: string, patch: ExercisePatch) =>
    updateExercise.mutate({ id, patch }, { onError: onError("Couldn't save exercise") });

  const move = (index: number, delta: -1 | 1) => {
    const ids = day.exercises.map((e) => e.id);
    const target = index + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    reorder.mutate(ids, { onError: onError("Couldn't reorder") });
  };

  const confirmRemove = (exercise: RoutineExercise) =>
    Alert.alert('Remove exercise?', `${exercise.name} will be removed from ${day.name}. Logged history is kept.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeExercise.mutate(exercise.id, { onError: onError("Couldn't remove exercise") }),
      },
    ]);

  const confirmDeleteDay = () =>
    Alert.alert('Delete day?', `${day.name} and its exercises will be removed. Logged sessions are kept.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          deleteDay.mutate(day.id, {
            onSuccess: () => router.back(),
            onError: onError("Couldn't delete day"),
          }),
      },
    ]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* key = day.id remounts the uncontrolled fields when switching days */}
      <View key={day.id} style={styles.section}>
        <TextField
          label="Name"
          defaultValue={day.name}
          onEndEditing={(e) => saveText('name', e.nativeEvent.text)}
          returnKeyType="done"
        />
        <TextField
          label="Focus"
          defaultValue={day.focus ?? ''}
          placeholder="e.g. Upper push (chest, shoulders, triceps)"
          onEndEditing={(e) => saveText('focus', e.nativeEvent.text)}
          returnKeyType="done"
        />
        <TextField
          label="Cardio finisher"
          defaultValue={day.cardioFinisher ?? ''}
          placeholder="e.g. Incline treadmill"
          onEndEditing={(e) => saveText('cardio_finisher', e.nativeEvent.text)}
          returnKeyType="done"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekday</Text>
        <View style={styles.chips}>
          {WEEKDAY_SHORT.map((label, i) => (
            <Chip key={label} label={label} selected={day.weekday === i + 1} onPress={() => setWeekday(i + 1)} />
          ))}
        </View>
        <Text style={styles.hint}>Tap the selected day again to unschedule.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Exercises</Text>

        {day.exercises.length === 0 && <Text style={styles.muted}>No exercises yet.</Text>}

        {day.exercises.map((exercise, index) => {
          const expanded = expandedId === exercise.id;
          return (
            <View key={exercise.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded }}
                  onPress={() => setExpandedId(expanded ? null : exercise.id)}
                  style={styles.cardTitle}
                >
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.meta}>
                    {exercise.sets} × {exercise.repRangeLow}-{exercise.repRangeHigh}
                    {exercise.perSide ? '/side' : ''} · {exercise.restSeconds ?? 0}s rest · {exercise.phase}
                  </Text>
                </Pressable>
                <View style={styles.moveButtons}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Move ${exercise.name} up`}
                    disabled={index === 0}
                    onPress={() => move(index, -1)}
                    hitSlop={6}
                    style={[styles.iconButton, index === 0 && styles.disabled]}
                  >
                    <Text style={styles.iconText}>▲</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Move ${exercise.name} down`}
                    disabled={index === day.exercises.length - 1}
                    onPress={() => move(index, 1)}
                    hitSlop={6}
                    style={[styles.iconButton, index === day.exercises.length - 1 && styles.disabled]}
                  >
                    <Text style={styles.iconText}>▼</Text>
                  </Pressable>
                </View>
              </View>

              {expanded && (
                <View style={styles.editor}>
                  <Stepper
                    label="Sets"
                    value={exercise.sets}
                    min={1}
                    max={10}
                    onChange={(v) => patchExercise(exercise.id, { target_sets: v })}
                  />
                  <Stepper
                    label="Reps from"
                    value={exercise.repRangeLow}
                    min={1}
                    max={50}
                    onChange={(v) =>
                      patchExercise(exercise.id, { rep_low: v, rep_high: Math.max(v, exercise.repRangeHigh) })
                    }
                  />
                  <Stepper
                    label="Reps to"
                    value={exercise.repRangeHigh}
                    min={exercise.repRangeLow}
                    max={60}
                    onChange={(v) => patchExercise(exercise.id, { rep_high: v })}
                  />
                  <Stepper
                    label="Rest"
                    value={exercise.restSeconds ?? 0}
                    min={0}
                    max={600}
                    step={15}
                    format={(v) => `${v}s`}
                    onChange={(v) => patchExercise(exercise.id, { rest_seconds: v })}
                  />
                  <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Per side</Text>
                    <Switch
                      value={exercise.perSide}
                      onValueChange={(v) => patchExercise(exercise.id, { per_side: v })}
                    />
                  </View>
                  <View style={styles.chips}>
                    {PHASES.map((phase) => (
                      <Chip
                        key={phase}
                        label={phase}
                        selected={exercise.phase === phase}
                        onPress={() => patchExercise(exercise.id, { phase })}
                      />
                    ))}
                  </View>
                  <View style={styles.actions}>
                    <View style={styles.actionHalf}>
                      <Button
                        label="Swap exercise"
                        variant="secondary"
                        onPress={() =>
                          router.push({
                            pathname: '/routine/pick-exercise',
                            params: { dayId: day.id, replaceId: exercise.id },
                          })
                        }
                      />
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => confirmRemove(exercise)}
                      style={styles.removeButton}
                    >
                      <Text style={styles.removeText}>Remove</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          );
        })}

        <Button
          label="Add exercise"
          onPress={() => router.push({ pathname: '/routine/pick-exercise', params: { dayId: day.id } })}
        />
      </View>

      <Pressable accessibilityRole="button" onPress={confirmDeleteDay} style={styles.deleteDay}>
        <Text style={styles.removeText}>Delete day</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: functional.background },
  content: { padding: spacing.md, gap: spacing.xl, paddingBottom: spacing.xxl * 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: functional.background },
  muted: { color: functional.textDim },
  section: { gap: spacing.md },
  sectionTitle: { color: functional.text, fontSize: 16, fontWeight: '800' },
  hint: { color: functional.textFaint, fontSize: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  card: { backgroundColor: functional.elevated, borderRadius: radius.md, padding: spacing.md, gap: spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardTitle: { flex: 1, minHeight: 44, justifyContent: 'center', gap: 2 },
  exerciseName: { color: functional.text, fontSize: 16, fontWeight: '700' },
  meta: { color: functional.textDim, fontSize: 12 },
  moveButtons: { flexDirection: 'row', gap: spacing.xs },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: functional.background,
  },
  iconText: { color: functional.text, fontSize: 12 },
  disabled: { opacity: 0.3 },
  editor: { gap: spacing.md, borderTopWidth: 1, borderTopColor: functional.border, paddingTop: spacing.md },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  switchLabel: { color: functional.textDim, fontSize: 14, fontWeight: '600' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  actionHalf: { flex: 1 },
  removeButton: { minHeight: 52, paddingHorizontal: spacing.lg, justifyContent: 'center' },
  removeText: { color: dangerText, fontSize: 15, fontWeight: '700' },
  deleteDay: { minHeight: 52, alignItems: 'center', justifyContent: 'center' },
});
