import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { PROTEIN_TARGET_HIGH_G, PROTEIN_TARGET_LOW_G } from '../../lib/program';
import { functional } from '../../lib/theme';
import { isoNow, todayDateKey } from '../../lib/time';

interface Meal {
  id: number;
  protein_grams: number;
  note: string | null;
  logged_at: string;
}

export default function DietScreen() {
  const db = useSQLiteContext();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [proteinInput, setProteinInput] = useState('');
  const [noteInput, setNoteInput] = useState('');

  const loadToday = useCallback(async () => {
    const today = todayDateKey();
    const rows = await db.getAllAsync<Meal>(
      "SELECT * FROM meals WHERE date(logged_at) = ? ORDER BY logged_at ASC",
      today
    );
    setMeals(rows);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadToday();
    }, [loadToday])
  );

  const totalProtein = meals.reduce((sum, m) => sum + m.protein_grams, 0);
  const remaining = Math.max(0, PROTEIN_TARGET_LOW_G - totalProtein);

  async function addMeal() {
    const grams = parseFloat(proteinInput);
    if (Number.isNaN(grams)) return;
    await db.runAsync(
      'INSERT INTO meals (protein_grams, note, logged_at) VALUES (?, ?, ?)',
      grams,
      noteInput || null,
      isoNow()
    );
    setProteinInput('');
    setNoteInput('');
    loadToday();
  }

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.totalText}>
          {totalProtein.toFixed(0)}g / {PROTEIN_TARGET_LOW_G}-{PROTEIN_TARGET_HIGH_G}g
        </Text>
        <Text style={styles.remainingText}>
          {remaining > 0 ? `${remaining.toFixed(0)}g to minimum target` : 'Minimum target met'}
        </Text>
      </View>

      <View style={styles.addRow}>
        <TextInput
          style={styles.inputProtein}
          placeholder="Protein (g)"
          placeholderTextColor={functional.textFaint}
          keyboardType="numeric"
          value={proteinInput}
          onChangeText={setProteinInput}
        />
        <TextInput
          style={styles.inputNote}
          placeholder="Meal (optional)"
          placeholderTextColor={functional.textFaint}
          value={noteInput}
          onChangeText={setNoteInput}
        />
        <Pressable style={styles.addButton} onPress={addMeal}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={meals}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.mealRow}>
            <Text style={styles.mealProtein}>{item.protein_grams}g</Text>
            <Text style={styles.mealNote}>{item.note ?? '-'}</Text>
            <Text style={styles.mealTime}>{item.logged_at.slice(11, 16)}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: functional.background, padding: 12 },
  summary: { marginBottom: 12, alignItems: 'center' },
  totalText: { color: functional.text, fontSize: 28, fontWeight: '800', fontVariant: ['tabular-nums'] },
  remainingText: { color: functional.textDim, marginTop: 2 },
  addRow: { flexDirection: 'row', gap: 6, marginBottom: 12, alignItems: 'center' },
  inputProtein: { borderWidth: 1, borderColor: functional.border, borderRadius: 6, padding: 8, width: 90, color: functional.text, minHeight: 44 },
  inputNote: { borderWidth: 1, borderColor: functional.border, borderRadius: 6, padding: 8, flex: 1, color: functional.text, minHeight: 44 },
  addButton: { backgroundColor: functional.text, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, minHeight: 44, justifyContent: 'center' },
  addButtonText: { color: functional.background, fontWeight: '700' },
  list: { gap: 6 },
  mealRow: { flexDirection: 'row', gap: 8, backgroundColor: functional.elevated, padding: 10, borderRadius: 6, alignItems: 'center' },
  mealProtein: { color: functional.text, fontWeight: '700', width: 50, fontVariant: ['tabular-nums'] },
  mealNote: { flex: 1, color: functional.textDim },
  mealTime: { color: functional.textFaint, fontSize: 12, fontVariant: ['tabular-nums'] },
});
