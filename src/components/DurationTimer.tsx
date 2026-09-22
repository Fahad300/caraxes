import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { functional, phaseColors, type Phase } from '../lib/theme';
import { formatDuration } from '../lib/time';

interface Props {
  label: string;
  phase: Phase;
  targetMinutes?: number;
}

// Separate start/pause/reset timer for duration-based session items
// (warm-up, dynamic stretch, cardio finisher, post-stretch) — distinct from
// the per-set rest timer, per PRD 5.1 and the design doc's interaction
// patterns.
export function DurationTimer({ label, phase, targetMinutes }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    interval.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, [running]);

  const targetSeconds = targetMinutes ? targetMinutes * 60 : null;
  const overTarget = targetSeconds !== null && elapsed > targetSeconds;

  return (
    <View style={[styles.card, { borderLeftColor: phaseColors[phase] }]}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        {targetMinutes ? <Text style={styles.target}>target {targetMinutes} min</Text> : null}
      </View>
      <Text style={[styles.time, overTarget && styles.timeOver]}>{formatDuration(elapsed)}</Text>
      <View style={styles.controls}>
        <Pressable style={styles.button} onPress={() => setRunning((r) => !r)}>
          <Text style={styles.buttonText}>{running ? 'Pause' : elapsed > 0 ? 'Resume' : 'Start'}</Text>
        </Pressable>
        <Pressable
          style={styles.buttonSecondary}
          onPress={() => {
            setRunning(false);
            setElapsed(0);
          }}
        >
          <Text style={styles.buttonSecondaryText}>Reset</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: functional.elevated,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    marginBottom: 10,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { color: functional.text, fontWeight: '600', fontSize: 15 },
  target: { color: functional.textDim, fontSize: 12 },
  time: { color: functional.text, fontSize: 28, fontWeight: '800', fontVariant: ['tabular-nums'], marginBottom: 8 },
  timeOver: { color: '#D97706' },
  controls: { flexDirection: 'row', gap: 8 },
  button: { backgroundColor: functional.text, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6 },
  buttonText: { color: functional.background, fontWeight: '700' },
  buttonSecondary: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: functional.border,
  },
  buttonSecondaryText: { color: functional.textDim, fontWeight: '600' },
});
