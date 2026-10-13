import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { ProgressBar } from '../../components/ProgressBar';
import { StatCard } from '../../components/StatCard';
import { getProgramDay, PROTEIN_TARGET_HIGH_G, PROTEIN_TARGET_LOW_G } from '../../lib/program';
import { SUPPLEMENT_STACK } from '../../lib/supplements';
import { functional, spacing } from '../../lib/theme';
import { todayDateKey, todayProgramDay } from '../../lib/time';
import { useWeekProgress } from '../../lib/useWeekProgress';
import { average } from '../../lib/weight';

interface Snapshot {
  proteinGrams: number;
  supplementsTaken: number;
  latestWeight: number | null;
  weekAvgWeight: number | null;
}

const EMPTY: Snapshot = { proteinGrams: 0, supplementsTaken: 0, latestWeight: null, weekAvgWeight: null };

// Read-only overview. Every figure comes from data the other tabs already
// log; tapping a card opens the tab that owns it.
export default function TodayScreen() {
  const db = useSQLiteContext();
  const week = useWeekProgress();
  const [snapshot, setSnapshot] = useState<Snapshot>(EMPTY);

  const load = useCallback(async () => {
    const today = todayDateKey();
    const [protein, supplements, weights] = await Promise.all([
      db.getFirstAsync<{ total: number }>(
        'SELECT COALESCE(SUM(protein_grams), 0) AS total FROM meals WHERE date(logged_at) = ?',
        today
      ),
      db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM supplement_logs WHERE taken_on = ?', today),
      db.getAllAsync<{ weight_kg: number }>('SELECT weight_kg FROM weight_entries ORDER BY logged_on DESC LIMIT 7'),
    ]);
    setSnapshot({
      proteinGrams: protein?.total ?? 0,
      supplementsTaken: supplements?.n ?? 0,
      latestWeight: weights[0]?.weight_kg ?? null,
      weekAvgWeight: average(weights),
    });
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const todayKey = todayProgramDay();
  const todayProgress = week.days.find((d) => d.key === todayKey);
  const todayProgram = todayKey ? getProgramDay(todayKey) : undefined;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatCard
        title={todayProgress ? `Today - ${todayProgress.label}` : 'Today'}
        value={todayProgress ? `${todayProgress.loggedSets}/${todayProgress.plannedSets} sets` : 'Rest day'}
        caption={todayProgram?.focus ?? 'No program scheduled'}
        onPress={() => router.navigate('/')}
      />

      <StatCard title="This week" value={`${week.loggedSets}/${week.plannedSets} sets`}>
        <View style={styles.bar}>
          <ProgressBar fraction={week.fraction} />
        </View>
      </StatCard>

      <View style={styles.grid}>
        <StatCard
          style={styles.half}
          title="Protein"
          value={`${snapshot.proteinGrams.toFixed(0)}g`}
          caption={`Target ${PROTEIN_TARGET_LOW_G}-${PROTEIN_TARGET_HIGH_G}g`}
          onPress={() => router.navigate('/diet')}
        />
        <StatCard
          style={styles.half}
          title="Supplements"
          value={`${snapshot.supplementsTaken}/${SUPPLEMENT_STACK.length}`}
          caption="taken today"
          onPress={() => router.navigate('/supplements')}
        />
      </View>

      <StatCard
        title="Body weight"
        value={snapshot.latestWeight === null ? '-' : `${snapshot.latestWeight.toFixed(1)} kg`}
        caption={
          snapshot.weekAvgWeight === null ? 'No entries yet' : `7-day average ${snapshot.weekAvgWeight.toFixed(1)} kg`
        }
        onPress={() => router.navigate('/weight')}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: functional.background },
  content: { padding: spacing.md, gap: spacing.md },
  bar: { marginTop: spacing.sm },
  grid: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
});
