import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { functional, radius, spacing } from '../lib/theme';

interface Props {
  title: string;
  value: string;
  caption?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

// Rounded summary card for the Today dashboard. Becomes a button when it has
// an onPress (navigates to the screen that owns the data).
export function StatCard({ title, value, caption, onPress, style, children }: Props) {
  const content = (
    <>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      {children}
    </>
  );

  if (!onPress) return <View style={[styles.card, style]}>{content}</View>;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${value}${caption ? `, ${caption}` : ''}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: functional.elevated,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.xxs,
  },
  pressed: { opacity: 0.7 },
  title: { color: functional.textDim, fontSize: 12, fontWeight: '600' },
  value: { color: functional.text, fontSize: 28, fontWeight: '800', fontVariant: ['tabular-nums'] },
  caption: { color: functional.textFaint, fontSize: 12 },
});
