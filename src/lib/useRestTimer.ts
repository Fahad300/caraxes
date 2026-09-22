import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { cancelScheduledNotification, scheduleRestEndNotification } from './notifications';

// Rest timers are tracked by absolute end-time, not a decrementing counter,
// so they stay correct across backgrounding/screen lock. A local
// notification covers the case where the app is fully backgrounded and JS
// timers are suspended.
export function useRestTimer() {
  const [endAt, setEndAt] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const endAtRef = useRef<number | null>(null);
  const notificationId = useRef<string | null>(null);

  const recompute = useCallback((end: number | null) => {
    setSecondsLeft(end === null ? 0 : Math.max(0, Math.ceil((end - Date.now()) / 1000)));
  }, []);

  useEffect(() => {
    endAtRef.current = endAt;
    recompute(endAt);
    if (endAt === null) return;
    const interval = setInterval(() => recompute(endAt), 1000);
    return () => clearInterval(interval);
  }, [endAt, recompute]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') recompute(endAtRef.current);
    });
    return () => sub.remove();
  }, [recompute]);

  useEffect(() => {
    if (endAt !== null && secondsLeft === 0) {
      setEndAt(null);
      notificationId.current = null;
    }
  }, [secondsLeft, endAt]);

  const start = useCallback(async (seconds: number) => {
    const end = Date.now() + seconds * 1000;
    setEndAt(end);
    notificationId.current = await scheduleRestEndNotification(seconds);
  }, []);

  const extend = useCallback(async (seconds: number) => {
    const base = endAtRef.current ?? Date.now();
    const next = base + seconds * 1000;
    setEndAt(next);
    await cancelScheduledNotification(notificationId.current);
    notificationId.current = await scheduleRestEndNotification(Math.max(0, Math.ceil((next - Date.now()) / 1000)));
  }, []);

  const skip = useCallback(async () => {
    await cancelScheduledNotification(notificationId.current);
    notificationId.current = null;
    setEndAt(null);
  }, []);

  return { secondsLeft, isActive: endAt !== null, start, extend, skip };
}
