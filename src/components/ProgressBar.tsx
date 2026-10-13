import { StyleSheet, View } from 'react-native';

import { functional } from '../lib/theme';

interface Props {
  // 0..1; values outside the range are clamped.
  fraction: number;
}

export function ProgressBar({ fraction }: Props) {
  const clamped = Math.min(1, Math.max(0, fraction));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={styles.track}
    >
      <View style={[styles.fill, { width: `${clamped * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 10, borderRadius: 5, backgroundColor: functional.border, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5, backgroundColor: functional.text },
});
