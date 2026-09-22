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

export function isoNow(): string {
  return new Date().toISOString();
}

export function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}
