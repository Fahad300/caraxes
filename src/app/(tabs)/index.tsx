import { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';

import { DurationTimer } from '../../components/DurationTimer';
import { ExerciseCard, type LoggedSet } from '../../components/ExerciseCard';
import { RestBanner } from '../../components/RestBanner';
import { WeekStrip } from '../../components/WeekStrip';
import { createSession, deleteSetLog, insertSetLog } from '../../lib/data';
import { PRE_SESSION_ITEMS, SESSION_BUDGET_MINUTES, getPostSessionItems } from '../../lib/program';
import { useActiveRoutine, type RoutineExercise } from '../../lib/routine';
import { functional, restSecondsByPhase, stopwatchColor } from '../../lib/theme';
import { formatDuration } from '../../lib/time';
import { useRestTimer } from '../../lib/useRestTimer';
import { useWeekProgress } from '../../lib/useWeekProgress';
import { todayWeekday } from '../../lib/week';

export default function WorkoutScreen() {
  const routine = useActiveRoutine().data;
  const week = useWeekProgress();
  const rest = useRestTimer();

  // Until the user taps a day, show whichever routine day is scheduled today.
  const [pickedDayId, setPickedDayId] = useState<string | null>(null);
  const days = routine?.days ?? [];
  const defaultDay = days.find((d) => d.weekday === todayWeekday());
  const day = days.find((d) => d.id === pickedDayId) ?? defaultDay;

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  // Keyed by the routine exercise id, so the same movement can appear twice.
  const [setsByExercise, setSetsByExercise] = useState<Record<string, LoggedSet[]>>({});
  const [weightInput, setWeightInput] = useState('');
  const [repsInput, setRepsInput] = useState('');
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const sessionInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (sessionStartedAt === null) return;
    sessionInterval.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - sessionStartedAt) / 1000));
    }, 1000);
    return () => {
      if (sessionInterval.current) clearInterval(sessionInterval.current);
    };
  }, [sessionStartedAt]);

  async function ensureSession(): Promise<string> {
    if (sessionId !== null) return sessionId;
    const session = await createSession({
      dayName: day?.name ?? 'Unknown',
      routineDayId: day?.id ?? null,
    });
    setSessionId(session.id);
    setSessionStartedAt(Date.parse(session.started_at));
    return session.id;
  }

  async function completeSet(exercise: RoutineExercise, isLastSet: boolean) {
    const weight = parseFloat(weightInput);
    const reps = parseInt(repsInput, 10);
    if (Number.isNaN(weight) || Number.isNaN(reps)) return;

    const existing = setsByExercise[exercise.id] ?? [];
    const setNumber = existing.length + 1;

    let id: string;
    try {
      const sid = await ensureSession();
      id = await insertSetLog({
        sessionId: sid,
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.name,
        setNumber,
        weight,
        reps,
      });
    } catch (e) {
      // Nothing is recorded locally on failure, so the inputs stay filled and
      // the user can retry the same set.
      Alert.alert("Couldn't save set", e instanceof Error ? e.message : 'Check your connection.');
      return;
    }

    setSetsByExercise((prev) => ({
      ...prev,
      [exercise.id]: [...existing, { id, setNumber, weight, reps }],
    }));
    setWeightInput('');
    setRepsInput('');
    setActiveExercise(null);
    week.reload();

    // The routine's own rest value wins; phase defaults cover older rows.
    const restSeconds = exercise.restSeconds ?? restSecondsByPhase[exercise.phase];
    if (!isLastSet && restSeconds) {
      rest.start(restSeconds);
    }
  }

  async function undoLastSet(exerciseKey: string) {
    const existing = setsByExercise[exerciseKey] ?? [];
    const last = existing[existing.length - 1];
    if (!last) return;
    try {
      await deleteSetLog(last.id);
    } catch (e) {
      Alert.alert("Couldn't undo set", e instanceof Error ? e.message : 'Check your connection.');
      return;
    }
    setSetsByExercise((prev) => ({
      ...prev,
      [exerciseKey]: existing.slice(0, -1),
    }));
    week.reload();
  }

  const stopwatchTextColor = stopwatchColor(elapsedSeconds, functional.text);

  return (
    <View style={styles.container}>
      <WeekStrip days={week.days} selectedDay={day?.id ?? null} onSelect={setPickedDayId} />

      {sessionStartedAt !== null && (
        <Text style={[styles.sessionTimer, { color: stopwatchTextColor }]}>
          {formatDuration(elapsedSeconds)} / {SESSION_BUDGET_MINUTES}:00
        </Text>
      )}

      <RestBanner
        secondsLeft={rest.secondsLeft}
        isActive={rest.isActive}
        onSkip={rest.skip}
        onExtend={() => rest.extend(15)}
      />

      {!routine && <Text style={styles.restDay}>No active routine yet.</Text>}

      {routine && !day && (
        <Text style={styles.restDay}>Rest day - nothing scheduled. Pick a day above to log anyway.</Text>
      )}

      {day && (
        <FlatList
          data={[...PRE_SESSION_ITEMS, ...day.exercises, ...getPostSessionItems(day)]}
          keyExtractor={(item) => ('key' in item ? item.key : item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            if ('label' in item) {
              return <DurationTimer label={item.label} phase={item.phase} targetMinutes={item.targetMinutes} />;
            }
            const logged = setsByExercise[item.id] ?? [];
            const isLastSet = logged.length === item.sets - 1;
            return (
              <ExerciseCard
                exercise={item}
                logged={logged}
                isEditing={activeExercise === item.id}
                weightInput={weightInput}
                repsInput={repsInput}
                onStartEdit={() => setActiveExercise(item.id)}
                onChangeWeight={setWeightInput}
                onChangeReps={setRepsInput}
                onCompleteSet={() => completeSet(item, isLastSet)}
                onUndoLast={() => undoLastSet(item.id)}
              />
            );
          }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={<Text style={styles.restDay}>No exercises on this day yet.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: functional.background, padding: 12 },
  sessionTimer: { fontSize: 22, fontWeight: '800', marginBottom: 8, fontVariant: ['tabular-nums'] },
  restDay: { marginTop: 20, color: functional.textDim, textAlign: 'center' },
  list: { paddingBottom: 24 },
});
