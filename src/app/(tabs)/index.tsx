import { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';

import { DurationTimer } from '../../components/DurationTimer';
import { ExerciseCard, type LoggedSet } from '../../components/ExerciseCard';
import { RestBanner } from '../../components/RestBanner';
import { WeekStrip } from '../../components/WeekStrip';
import {
  DayKey,
  PRE_SESSION_ITEMS,
  SESSION_BUDGET_MINUTES,
  getPostSessionItems,
  getProgramDay,
} from '../../lib/program';
import { createSession, deleteSetLog, insertSetLog, useRoutineDays } from '../../lib/data';
import { functional, restSecondsByPhase, stopwatchColor } from '../../lib/theme';
import { formatDuration, todayProgramDay } from '../../lib/time';
import { useRestTimer } from '../../lib/useRestTimer';
import { useWeekProgress } from '../../lib/useWeekProgress';

export default function WorkoutScreen() {
  const [selectedDay, setSelectedDay] = useState<DayKey | null>(todayProgramDay());
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [setsByExercise, setSetsByExercise] = useState<Record<string, LoggedSet[]>>({});
  const [weightInput, setWeightInput] = useState('');
  const [repsInput, setRepsInput] = useState('');
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const sessionInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const rest = useRestTimer();
  const week = useWeekProgress();
  const routineDays = useRoutineDays();

  const day = selectedDay ? getProgramDay(selectedDay) : undefined;

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
    const dayName = day?.label ?? 'Unknown';
    const routineDayId = routineDays.data?.find((d) => d.name === dayName)?.id ?? null;
    const session = await createSession({ dayName, routineDayId });
    setSessionId(session.id);
    setSessionStartedAt(Date.parse(session.started_at));
    return session.id;
  }

  async function completeSet(exerciseName: string, isLastSet: boolean, phase: keyof typeof restSecondsByPhase) {
    const weight = parseFloat(weightInput);
    const reps = parseInt(repsInput, 10);
    if (Number.isNaN(weight) || Number.isNaN(reps)) return;

    const existing = setsByExercise[exerciseName] ?? [];
    const setNumber = existing.length + 1;

    let id: string;
    try {
      const sid = await ensureSession();
      id = await insertSetLog({ sessionId: sid, exerciseName, setNumber, weight, reps });
    } catch (e) {
      // Nothing is recorded locally on failure, so the inputs stay filled and
      // the user can retry the same set.
      Alert.alert("Couldn't save set", e instanceof Error ? e.message : 'Check your connection.');
      return;
    }

    setSetsByExercise((prev) => ({
      ...prev,
      [exerciseName]: [...existing, { id, setNumber, weight, reps }],
    }));
    setWeightInput('');
    setRepsInput('');
    setActiveExercise(null);
    week.reload();

    const restSeconds = restSecondsByPhase[phase];
    if (!isLastSet && restSeconds) {
      rest.start(restSeconds);
    }
  }

  async function undoLastSet(exerciseName: string) {
    const existing = setsByExercise[exerciseName] ?? [];
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
      [exerciseName]: existing.slice(0, -1),
    }));
    week.reload();
  }

  const stopwatchTextColor = stopwatchColor(elapsedSeconds, functional.text);

  return (
    <View style={styles.container}>
      <WeekStrip days={week.days} selectedDay={selectedDay} onSelect={setSelectedDay} />

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

      {!day && (
        <Text style={styles.restDay}>Rest day - no program scheduled. Pick a day above to log anyway.</Text>
      )}

      {day && (
        <FlatList
          data={[...PRE_SESSION_ITEMS, ...day.exercises, ...getPostSessionItems(day)]}
          keyExtractor={(item) => ('key' in item ? item.key : item.name)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            if ('label' in item) {
              return <DurationTimer label={item.label} phase={item.phase} targetMinutes={item.targetMinutes} />;
            }
            const logged = setsByExercise[item.name] ?? [];
            const isLastSet = logged.length === item.sets - 1;
            return (
              <ExerciseCard
                exercise={item}
                logged={logged}
                isEditing={activeExercise === item.name}
                weightInput={weightInput}
                repsInput={repsInput}
                onStartEdit={() => setActiveExercise(item.name)}
                onChangeWeight={setWeightInput}
                onChangeReps={setRepsInput}
                onCompleteSet={() => completeSet(item.name, isLastSet, item.phase)}
                onUndoLast={() => undoLastSet(item.name)}
              />
            );
          }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
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
