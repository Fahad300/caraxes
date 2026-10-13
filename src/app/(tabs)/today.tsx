import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { ProgressBar } from '../../components/ProgressBar';
import { StatCard } from '../../components/StatCard';
import { todayKey, useFoodLogs, useSupplementLogs, useSupplements, useWeights } from '../../lib/data';
import { PROTEIN_TARGET_HIGH_G, PROTEIN_TARGET_LOW_G } from '../../lib/program';
import { useActiveRoutine } from '../../lib/routine';
import { functional, spacing } from '../../lib/theme';
import { useWeekProgress } from '../../lib/useWeekProgress';
import { todayWeekday } from '../../lib/week';
import { average } from '../../lib/weight';

// Read-only overview. Every figure comes from data the other tabs already
// log; tapping a card opens the tab that owns it.
export default function TodayScreen() {
  const week = useWeekProgress();
  const dateKey = todayKey();
  const meals = useFoodLogs(dateKey).data ?? [];
  const supplementCount = useSupplements().data?.length ?? 0;
  const supplementsTaken = useSupplementLogs(dateKey).data?.size ?? 0;
  const recentWeights = (useWeights().data ?? []).slice(0, 7);

  const snapshot = {
    proteinGrams: meals.reduce((sum, m) => sum + m.protein_g, 0),
    supplementsTaken,
    latestWeight: recentWeights[0]?.weight_kg ?? null,
    weekAvgWeight: average(recentWeights),
  };

  const todayDay = useActiveRoutine().data?.days.find((d) => d.weekday === todayWeekday());
  const todayProgress = week.days.find((d) => d.key === todayDay?.id);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatCard
        title={todayProgress ? `Today - ${todayProgress.label}` : 'Today'}
        value={todayProgress ? `${todayProgress.loggedSets}/${todayProgress.plannedSets} sets` : 'Rest day'}
        caption={todayDay?.focus ?? 'No program scheduled'}
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
          value={`${snapshot.supplementsTaken}/${supplementCount}`}
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
