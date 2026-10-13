import type { Ref } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { functional, radius, spacing } from '../lib/theme';

type Props = TextInputProps & { label: string; ref?: Ref<TextInput> };

export function TextField({ label, ref, style, ...input }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor={functional.textFaint}
        selectionColor={functional.text}
        style={[styles.input, style]}
        {...input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { color: functional.textDim, fontSize: 13, fontWeight: '600' },
  input: {
    minHeight: 52,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: functional.border,
    backgroundColor: functional.elevated,
    paddingHorizontal: spacing.lg,
    color: functional.text,
    fontSize: 16,
  },
});
