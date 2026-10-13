import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { brand, functional, radius, spacing } from '../lib/theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
};

// Chrome button (welcome / sign-in). Primary is the brand-red fill, which the
// design system allows for the primary CTA in onboarding; in-session screens
// use the functional phase colors instead and don't use this component.
export function Button({ label, onPress, variant = 'primary', loading, disabled }: Props) {
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.secondary,
        pressed && styles.pressed,
        disabled && !loading && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={functional.text} />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: brand.red },
  secondary: { borderWidth: 1, borderColor: functional.border, backgroundColor: 'transparent' },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
  label: { color: functional.text, fontSize: 16, fontWeight: '700' },
});
