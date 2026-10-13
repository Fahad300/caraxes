import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { cancelScheduledNotification, scheduleRestEndNotification } from './notifications';

// Rest timers are tracked by absolute end-time, not a decrementing counter,
// so they stay correct across backgrounding/screen lock. A local
// notification covers the case where the app is fully backgrounded and JS
// timers are suspended.
export function useRestTimer() {
  const [endAt, setEndAt] = useState<number | null>(null);
  // Wall-clock reading used to derive secondsLeft; refreshed by the interval
  // and on foregrounding so render never has to call Date.now().
  const [now, setNow] = useState(0);
  const endAtRef = useRef<number | null>(null);
  const notificationId = useRef<string | null>(null);

  const secondsLeft = endAt === null ? 0 : Math.max(0, Math.ceil((endAt - now) / 1000));

  useEffect(() => {
    if (endAt === null) return;

    const tick = () => {
      const t = Date.now();
      if (t >= endAt) {
        endAtRef.current = null;
        notificationId.current = null;
        setEndAt(null);
      } else {
        setNow(t);
      }
    };

    const interval = setInterval(tick, 1000);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') tick();
    });
    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [endAt]);

  const start = useCallback(async (seconds: number) => {
    const t = Date.now();
    const end = t + seconds * 1000;
    endAtRef.current = end;
    setNow(t);
    setEndAt(end);
    notificationId.current = await scheduleRestEndNotification(seconds);
  }, []);

  const extend = useCallback(async (seconds: number) => {
    const t = Date.now();
    const next = (endAtRef.current ?? t) + seconds * 1000;
    endAtRef.current = next;
    setNow(t);
    setEndAt(next);
    await cancelScheduledNotification(notificationId.current);
    notificationId.current = await scheduleRestEndNotification(Math.max(0, Math.ceil((next - t) / 1000)));
  }, []);

  const skip = useCallback(async () => {
    endAtRef.current = null;
    setEndAt(null);
    await cancelScheduledNotification(notificationId.current);
    notificationId.current = null;
  }, []);

  return { secondsLeft, isActive: endAt !== null, start, extend, skip };
}
