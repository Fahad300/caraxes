import { Pressable, StyleSheet, Text, View } from 'react-native';

import { functional, radius, spacing } from '../lib/theme';

interface Props {
  label: string;
  value: number;
  onChange: (next: number) => void;
  min: number;
  max: number;
  step?: number;
  format?: (value: number) => string;
}

// Minus / value / plus. Buttons are 44pt so they stay tappable mid-edit.
export function Stepper({ label, value, onChange, min, max, step = 1, format }: Props) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label}`}
          disabled={value <= min}
          onPress={() => onChange(clamp(value - step))}
          style={[styles.button, value <= min && styles.disabled]}
        >
          <Text style={styles.buttonText}>−</Text>
        </Pressable>
        <Text style={styles.value} accessibilityLabel={`${label} ${value}`}>
          {format ? format(value) : value}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label}`}
          disabled={value >= max}
          onPress={() => onChange(clamp(value + step))}
          style={[styles.button, value >= max && styles.disabled]}
        >
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: functional.textDim, fontSize: 14, fontWeight: '600' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  button: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: functional.background,
    borderWidth: 1,
    borderColor: functional.border,
  },
  disabled: { opacity: 0.35 },
  buttonText: { color: functional.text, fontSize: 20, fontWeight: '700' },
  value: {
    minWidth: 56,
    textAlign: 'center',
    color: functional.text,
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
