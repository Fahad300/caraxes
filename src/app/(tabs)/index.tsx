import { useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

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
import { functional, restSecondsByPhase, stopwatchColor } from '../../lib/theme';
import { formatDuration, isoNow, todayProgramDay } from '../../lib/time';
import { useRestTimer } from '../../lib/useRestTimer';
import { useWeekProgress } from '../../lib/useWeekProgress';

export default function WorkoutScreen() {
  const db = useSQLiteContext();
  const [selectedDay, setSelectedDay] = useState<DayKey | null>(todayProgramDay());
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [setsByExercise, setSetsByExercise] = useState<Record<string, LoggedSet[]>>({});
  const [weightInput, setWeightInput] = useState('');
  const [repsInput, setRepsInput] = useState('');
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const sessionInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const rest = useRestTimer();
  const week = useWeekProgress();

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

  async function ensureSession(): Promise<number> {
    if (sessionId !== null) return sessionId;
    const startedAt = isoNow();
    const result = await db.runAsync(
      'INSERT INTO sessions (day, started_at) VALUES (?, ?)',
      selectedDay ?? 'unknown',
      startedAt
    );
    setSessionId(result.lastInsertRowId);
    setSessionStartedAt(Date.parse(startedAt));
    return result.lastInsertRowId;
  }

  async function completeSet(exerciseName: string, isLastSet: boolean, phase: keyof typeof restSecondsByPhase) {
    const weight = parseFloat(weightInput);
    const reps = parseInt(repsInput, 10);
    if (Number.isNaN(weight) || Number.isNaN(reps)) return;

    const sid = await ensureSession();
    const existing = setsByExercise[exerciseName] ?? [];
    const setNumber = existing.length + 1;

    const result = await db.runAsync(
      'INSERT INTO logged_sets (session_id, exercise_name, set_number, weight, reps, logged_at) VALUES (?, ?, ?, ?, ?, ?)',
      sid,
      exerciseName,
      setNumber,
      weight,
      reps,
      isoNow()
    );

    setSetsByExercise((prev) => ({
      ...prev,
      [exerciseName]: [...existing, { id: result.lastInsertRowId, setNumber, weight, reps }],
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
    await db.runAsync('DELETE FROM logged_sets WHERE id = ?', last.id);
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
