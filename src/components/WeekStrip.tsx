import { Pressable, StyleSheet, Text, View } from 'react-native';

import { functional, radius, spacing } from '../lib/theme';
import type { DayProgress } from '../lib/useWeekProgress';

interface Props {
  days: DayProgress[];
  selectedDay: string | null; // routine day id
  onSelect: (dayId: string) => void;
}

// Mon-Fri strip: weekday, date, and a check once the day's planned sets are
// all logged. Selected day is the inverted fill; today gets an outline.
export function WeekStrip({ days, selectedDay, onSelect }: Props) {
  return (
    <View style={styles.row}>
      {days.map((d) => {
        const selected = selectedDay === d.key;
        return (
          <Pressable
            key={d.key}
            accessibilityRole="button"
            accessibilityLabel={`${d.label} ${d.dateNumber}${d.done ? ', completed' : ''}${d.isToday ? ', today' : ''}`}
            accessibilityState={{ selected }}
            onPress={() => onSelect(d.key)}
            style={[styles.day, d.isToday && styles.today, selected && styles.selected]}
          >
            <Text style={[styles.weekday, selected && styles.selectedText]}>{d.shortLabel}</Text>
            <Text style={[styles.date, selected && styles.selectedText]}>{d.dateNumber}</Text>
            <Text style={[styles.check, selected && styles.selectedText, !d.done && styles.checkHidden]}>✓</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.sm },
  day: {
    flex: 1,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: functional.elevated,
  },
  today: { borderColor: functional.textDim },
  selected: { backgroundColor: functional.text, borderColor: functional.text },
  weekday: { color: functional.textDim, fontSize: 12, fontWeight: '600' },
  date: { color: functional.text, fontSize: 18, fontWeight: '800', fontVariant: ['tabular-nums'] },
  check: { color: functional.text, fontSize: 12, fontWeight: '800' },
  checkHidden: { opacity: 0 },
  selectedText: { color: functional.background },
});
