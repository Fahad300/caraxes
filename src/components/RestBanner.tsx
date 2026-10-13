import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { functional, REST_EXTEND_SECONDS } from '../lib/theme';
import { formatDuration } from '../lib/time';

interface Props {
  secondsLeft: number;
  isActive: boolean;
  onSkip: () => void;
  onExtend: () => void;
}

// Slide-up rest banner — the only state-driven transition in the functional
// UI (design doc: "no decorative motion — only state-driven transitions").
export function RestBanner({ secondsLeft, isActive, onSkip, onExtend }: Props) {
  const [translateY] = useState(() => new Animated.Value(80));

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: isActive ? 0 : 80,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isActive, translateY]);

  if (!isActive) return null;

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY }] }]}>
      <Text style={styles.time}>{formatDuration(secondsLeft)}</Text>
      <Text style={styles.label}>Rest</Text>
      <View style={styles.actions}>
        <Pressable style={styles.actionButton} onPress={onExtend}>
          <Text style={styles.actionText}>+{REST_EXTEND_SECONDS}s</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={onSkip}>
          <Text style={styles.actionText}>Skip</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: functional.elevated,
    borderWidth: 1,
    borderColor: functional.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  time: { color: functional.text, fontSize: 22, fontWeight: '800', fontVariant: ['tabular-nums'] },
  label: { color: functional.textDim, fontWeight: '600', flex: 1 },
  actions: { flexDirection: 'row', gap: 8 },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: functional.border,
  },
  actionText: { color: functional.text, fontWeight: '700' },
});
