import { Pressable, StyleSheet, Text } from 'react-native';

import { functional, radius, spacing } from '../lib/theme';

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function Chip({ label, selected, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}
    >
      <Text style={[styles.text, selected && styles.selectedText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: functional.border,
    backgroundColor: functional.elevated,
  },
  selected: { backgroundColor: functional.text, borderColor: functional.text },
  text: { color: functional.textDim, fontSize: 14, fontWeight: '600' },
  selectedText: { color: functional.background },
});
