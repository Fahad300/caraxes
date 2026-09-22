import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { ProgramExercise } from '../lib/program';
import { functional, phaseColors } from '../lib/theme';

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

  return (
    <View style={[styles.card, { borderLeftColor: phaseColors[exercise.phase] }]}>
      <Text style={styles.name}>{exercise.name}</Text>
      <Text style={styles.meta}>
        {exercise.phase} - {logged.length}/{exercise.sets} sets - {exercise.repRangeLow}-{exercise.repRangeHigh} reps
        {exercise.perSide ? '/side' : ''}
      </Text>

      {logged.map((s, i) => (
        <View key={s.id} style={styles.loggedRow}>
          <Text style={styles.loggedText}>
            Set {s.setNumber}: {s.weight} x {s.reps}
          </Text>
          {i === logged.length - 1 && (
            <Pressable onPress={onUndoLast} hitSlop={8}>
              <Text style={styles.undo}>Undo</Text>
            </Pressable>
          )}
        </View>
      ))}

      {!isComplete && !isEditing && (
        <Pressable style={styles.completeButton} onPress={onStartEdit}>
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
          <Pressable style={styles.completeButton} onPress={onCompleteSet}>
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
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
  },
  name: { color: functional.text, fontSize: 16, fontWeight: '700' },
  meta: { color: functional.textDim, fontSize: 12, marginBottom: 6 },
  loggedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  loggedText: { color: functional.text, fontSize: 13, fontVariant: ['tabular-nums'] },
  undo: { color: functional.textDim, fontSize: 12, fontWeight: '600', textDecorationLine: 'underline' },
  completeButton: {
    backgroundColor: functional.text,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 6,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  completeButtonText: { color: functional.background, fontWeight: '700' },
  editRow: { flexDirection: 'row', gap: 6, marginTop: 6, alignItems: 'center' },
  input: {
    borderWidth: 1,
    borderColor: functional.border,
    borderRadius: 6,
    padding: 8,
    width: 64,
    color: functional.text,
    minHeight: 44,
  },
});
