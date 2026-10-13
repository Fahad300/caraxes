import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { ProgramExercise } from '../lib/program';
import { functional, phaseColors, radius, spacing } from '../lib/theme';

export interface LoggedSet {
  id: number;
  setNumber: number;
  weight: number;
  reps: number;
}

interface Props {
  exercise: ProgramExercise;
  logged: LoggedSet[];
  isEditing: boolean;
  weightInput: string;
  repsInput: string;
  onStartEdit: () => void;
  onChangeWeight: (v: string) => void;
  onChangeReps: (v: string) => void;
  onCompleteSet: () => void;
  onUndoLast: () => void;
}

export function ExerciseCard({
  exercise,
  logged,
  isEditing,
  weightInput,
  repsInput,
  onStartEdit,
  onChangeWeight,
  onChangeReps,
  onCompleteSet,
  onUndoLast,
}: Props) {
  const isComplete = logged.length >= exercise.sets;
  const target = `${exercise.repRangeLow}-${exercise.repRangeHigh} reps${exercise.perSide ? '/side' : ''}`;

  return (
    <View style={[styles.card, { borderLeftColor: phaseColors[exercise.phase] }]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.name}>{exercise.name}</Text>
          <Text style={styles.meta}>
            {exercise.phase} - {target}
          </Text>
        </View>
        <Text
          accessibilityLabel={`${logged.length} of ${exercise.sets} sets done`}
          style={[styles.count, isComplete && styles.countComplete]}
        >
          {logged.length}/{exercise.sets}
        </Text>
      </View>

      {logged.map((s, i) => (
        <View key={s.id} style={styles.loggedRow}>
          <Text style={styles.loggedText}>
            Set {s.setNumber}: {s.weight} x {s.reps}
          </Text>
          {i === logged.length - 1 && (
            <Pressable accessibilityRole="button" accessibilityLabel="Undo last set" onPress={onUndoLast} hitSlop={8}>
              <Text style={styles.undo}>Undo</Text>
            </Pressable>
          )}
        </View>
      ))}

      {!isComplete && !isEditing && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Complete set for ${exercise.name}`}
          style={styles.completeButton}
          onPress={onStartEdit}
        >
          <Text style={styles.completeButtonText}>Complete set →</Text>
        </Pressable>
      )}

      {isEditing && (
        <View style={styles.editRow}>
          <TextInput
            style={styles.input}
            placeholder="Weight"
            placeholderTextColor={functional.textFaint}
            keyboardType="numeric"
            value={weightInput}
            onChangeText={onChangeWeight}
            autoFocus
          />
          <TextInput
            style={styles.input}
            placeholder="Reps"
            placeholderTextColor={functional.textFaint}
            keyboardType="numeric"
            value={repsInput}
            onChangeText={onChangeReps}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Complete set for ${exercise.name}`}
            style={styles.completeButton}
            onPress={onCompleteSet}
          >
            <Text style={styles.completeButtonText}>Complete set →</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: functional.elevated,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 4,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xs },
  headerText: { flex: 1 },
  name: { color: functional.text, fontSize: 16, fontWeight: '700' },
  meta: { color: functional.textDim, fontSize: 12 },
  count: { color: functional.textDim, fontSize: 18, fontWeight: '800', fontVariant: ['tabular-nums'] },
  countComplete: { color: functional.text },
  loggedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  loggedText: { color: functional.text, fontSize: 13, fontVariant: ['tabular-nums'] },
  undo: { color: functional.textDim, fontSize: 12, fontWeight: '600', textDecorationLine: 'underline' },
  completeButton: {
    backgroundColor: functional.text,
    paddingVertical: 10,
    borderRadius: radius.sm,
    marginTop: spacing.xs,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  completeButtonText: { color: functional.background, fontWeight: '700' },
  editRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs, alignItems: 'center' },
  input: {
    borderWidth: 1,
    borderColor: functional.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    width: 64,
    color: functional.text,
    minHeight: 44,
  },
});
