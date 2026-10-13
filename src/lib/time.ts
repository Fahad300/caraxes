import type { DayKey } from './program';

const JS_DAY_TO_KEY: Record<number, DayKey | null> = {
  0: null, // Sunday - rest
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: null, // Saturday - rest
};

export function todayProgramDay(): DayKey | null {
  return JS_DAY_TO_KEY[new Date().getDay()];
}

export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// HH:MM in the device's local time zone.
export function clockTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
