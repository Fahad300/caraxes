import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { functional } from '../../lib/theme';
import { todayDateKey } from '../../lib/time';
import { average } from '../../lib/weight';

interface WeightEntry {
  id: number;
  weight_kg: number;
  logged_on: string;
}

// Trend messaging is deliberately based on 7-day averages, never a
// day-to-day delta — the PRD calls out the known Monday-to-Friday
// water-retention/glycogen swing and requires the app not read normal
// weekly fluctuation as fat gain.
export default function WeightScreen() {
  const db = useSQLiteContext();
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [weightInput, setWeightInput] = useState('');

  const loadEntries = useCallback(async () => {
    const rows = await db.getAllAsync<WeightEntry>('SELECT * FROM weight_entries ORDER BY logged_on DESC LIMIT 60');
    setEntries(rows);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  async function logToday() {
    const weight = parseFloat(weightInput);
    if (Number.isNaN(weight)) return;
    const today = todayDateKey();
    await db.runAsync(
      `INSERT INTO weight_entries (weight_kg, logged_on) VALUES (?, ?)
       ON CONFLICT(logged_on) DO UPDATE SET weight_kg = excluded.weight_kg`,
      weight,
      today
    );
    setWeightInput('');
    loadEntries();
  }

  const { latest, thisWeekAvg, lastWeekAvg } = useMemo(() => {
    const sorted = entries; // already DESC by logged_on
    const thisWeek = sorted.slice(0, 7);
    const lastWeek = sorted.slice(7, 14);
    return {
      latest: sorted[0] ?? null,
      thisWeekAvg: average(thisWeek),
      lastWeekAvg: average(lastWeek),
    };
  }, [entries]);

  const weightRange = useMemo(() => {
    if (entries.length === 0) return { min: 0, max: 1 };
    const values = entries.map((e) => e.weight_kg);
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [entries]);

  let trendLabel = 'Not enough data yet';
  if (thisWeekAvg !== null && lastWeekAvg !== null) {
    const delta = thisWeekAvg - lastWeekAvg;
    const direction = delta > 0.2 ? 'up' : delta < -0.2 ? 'down' : 'flat';
    trendLabel = `Weekly avg trending ${direction} (${delta >= 0 ? '+' : ''}${delta.toFixed(1)}kg vs last week)`;
  } else if (thisWeekAvg !== null) {
    trendLabel = `This week's avg: ${thisWeekAvg.toFixed(1)}kg`;
  }

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.latestText}>{latest ? `${latest.weight_kg.toFixed(1)}kg` : '-'}</Text>
        <Text style={styles.latestDate}>{latest ? latest.logged_on : 'No entries yet'}</Text>
        <Text style={styles.trend}>{trendLabel}</Text>
        <Text style={styles.trendNote}>Trend is based on 7-day averages, not day-to-day change.</Text>
      </View>

      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="Weight (kg)"
          placeholderTextColor={functional.textFaint}
          keyboardType="numeric"
          value={weightInput}
          onChangeText={setWeightInput}
        />
        <Pressable style={styles.addButton} onPress={logToday}>
          <Text style={styles.addButtonText}>Log today</Text>
        </Pressable>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.logged_on}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const range = weightRange.max - weightRange.min || 1;
          const widthPct = 20 + ((item.weight_kg - weightRange.min) / range) * 80;
          return (
            <View style={styles.entryRow}>
              <Text style={styles.entryDate}>{item.logged_on}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.bar, { width: `${widthPct}%` }]} />
              </View>
              <Text style={styles.entryWeight}>{item.weight_kg.toFixed(1)}</Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: functional.background, padding: 12 },
  summary: { alignItems: 'center', marginBottom: 16 },
  latestText: { color: functional.text, fontSize: 36, fontWeight: '800', fontVariant: ['tabular-nums'] },
  latestDate: { color: functional.textDim, marginBottom: 8 },
  trend: { color: functional.text, fontWeight: '600' },
  trendNote: { color: functional.textFaint, fontSize: 11, marginTop: 2 },
  addRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  input: { borderWidth: 1, borderColor: functional.border, borderRadius: 6, padding: 8, flex: 1, color: functional.text, minHeight: 44 },
  addButton: { backgroundColor: functional.text, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, minHeight: 44, justifyContent: 'center' },
  addButtonText: { color: functional.background, fontWeight: '700' },
  list: { gap: 6 },
  entryRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  entryDate: { color: functional.textDim, width: 90, fontSize: 12 },
  barTrack: { flex: 1, height: 10, backgroundColor: functional.elevated, borderRadius: 5, overflow: 'hidden' },
  bar: { height: '100%', backgroundColor: functional.text, borderRadius: 5 },
  entryWeight: { color: functional.text, width: 44, textAlign: 'right', fontVariant: ['tabular-nums'] },
});
