import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { todayKey, useSupplementLogs, useSupplements, useToggleSupplement } from '../../lib/data';
import {
  VITAMIN_D_RETEST_WINDOW_WEEKS_HIGH,
  VITAMIN_D_RETEST_WINDOW_WEEKS_LOW,
  VITAMIN_D_TEST_DATE,
} from '../../lib/supplements';
import { functional } from '../../lib/theme';

function weeksSince(dateStr: string): number {
  const ms = Date.now() - new Date(dateStr).getTime();
  return ms / (1000 * 60 * 60 * 24 * 7);
}

export default function SupplementsScreen() {
  const dateKey = todayKey();
  const supplements = useSupplements().data ?? [];
  const takenToday = useSupplementLogs(dateKey).data ?? new Set<string>();
  const toggleSupplement = useToggleSupplement();

  function toggle(supplementId: string) {
    toggleSupplement.mutate(
      { supplementId, taken: takenToday.has(supplementId), dateKey },
      { onError: (e) => Alert.alert("Couldn't update supplement", e.message) }
    );
  }

  const weeksSinceTest = weeksSince(VITAMIN_D_TEST_DATE);
  const retestDue = weeksSinceTest >= VITAMIN_D_RETEST_WINDOW_WEEKS_LOW;
  const retestOverdue = weeksSinceTest >= VITAMIN_D_RETEST_WINDOW_WEEKS_HIGH;

  return (
    <View style={styles.container}>
      {retestDue && (
        <View style={[styles.reminder, retestOverdue && styles.reminderOverdue]}>
          <Text style={styles.reminderText}>
            {retestOverdue
              ? `Vitamin D retest overdue (${weeksSinceTest.toFixed(0)} weeks since last test)`
              : `Vitamin D retest window open (${weeksSinceTest.toFixed(0)} weeks since last test)`}
          </Text>
        </View>
      )}

      <FlatList
        data={supplements}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const taken = takenToday.has(item.id);
          return (
            <Pressable style={styles.row} onPress={() => toggle(item.id)}>
              <View style={[styles.checkbox, taken && styles.checkboxChecked]}>
                {taken && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.rowText}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>
                  {[item.dose, item.timing].filter(Boolean).join(' - ')}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: functional.background, padding: 12 },
  reminder: {
    backgroundColor: functional.elevated,
    borderLeftWidth: 4,
    borderLeftColor: '#D97706',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  reminderOverdue: { borderLeftColor: '#DC2626' },
  reminderText: { color: functional.text, fontWeight: '600' },
  list: { gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: functional.elevated,
    padding: 12,
    borderRadius: 8,
    minHeight: 44,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: functional.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: functional.text, borderColor: functional.text },
  checkmark: { color: functional.background, fontWeight: '800' },
  rowText: { flex: 1 },
  name: { color: functional.text, fontWeight: '600' },
  meta: { color: functional.textDim, fontSize: 12 },
});
