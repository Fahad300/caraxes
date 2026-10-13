import { router } from 'expo-router';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { useActiveRoutine, useAddDay, WEEKDAY_LONG } from '../../lib/routine';
import { dangerText, functional, radius, spacing } from '../../lib/theme';

export default function RoutineScreen() {
  const { data: routine, isPending, error, refetch } = useActiveRoutine();
  const addDay = useAddDay();

  function onAddDay() {
    if (!routine) return;
    const used = new Set(routine.days.map((d) => d.weekday));
    const free = [1, 2, 3, 4, 5, 6, 7].find((w) => !used.has(w)) ?? null;
    const sortOrder = Math.max(0, ...routine.days.map((d) => d.sortOrder)) + 1;
    addDay.mutate(
      { routineId: routine.id, sortOrder, weekday: free },
      {
        onSuccess: (dayId) => router.push({ pathname: '/routine/[dayId]', params: { dayId } }),
        onError: (e) => Alert.alert("Couldn't add day", e.message),
      }
    );
  }

  if (isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={functional.text} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error.message}</Text>
        <Button label="Try again" onPress={() => refetch()} />
      </View>
    );
  }

  if (!routine) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>No active routine on this account.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.routineName}>{routine.name}</Text>
      <FlatList
        data={routine.days}
        keyExtractor={(d) => d.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No days yet. Add one below.</Text>}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/routine/[dayId]', params: { dayId: item.id } })}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <View style={styles.rowText}>
              <Text style={styles.dayName}>{item.name}</Text>
              <Text style={styles.meta}>
                {item.weekday ? WEEKDAY_LONG[item.weekday - 1] : 'Not scheduled'} · {item.exercises.length}{' '}
                {item.exercises.length === 1 ? 'exercise' : 'exercises'}
              </Text>
              {item.focus ? (
                <Text style={styles.focus} numberOfLines={1}>
                  {item.focus}
                </Text>
              ) : null}
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        )}
      />
      <View style={styles.footer}>
        <Button label="Add day" onPress={onAddDay} loading={addDay.isPending} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: functional.background },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: functional.background,
    padding: spacing.xxl,
    gap: spacing.lg,
  },
  routineName: {
    color: functional.textDim,
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  list: { padding: spacing.md, gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: functional.elevated,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 64,
  },
  pressed: { opacity: 0.8 },
  rowText: { flex: 1, gap: 2 },
  dayName: { color: functional.text, fontSize: 17, fontWeight: '700' },
  meta: { color: functional.textDim, fontSize: 13 },
  focus: { color: functional.textFaint, fontSize: 12 },
  chevron: { color: functional.textFaint, fontSize: 24, paddingLeft: spacing.md },
  empty: { color: functional.textDim, textAlign: 'center' },
  error: { color: dangerText, textAlign: 'center' },
  footer: { padding: spacing.md },
});
