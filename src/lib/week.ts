import { PROGRAM, type DayKey } from './program';

export interface WeekDay {
  key: DayKey;
  label: string;
  shortLabel: string;
  dateKey: string;
  dateNumber: number;
  plannedSets: number;
  isToday: boolean;
}

// Local calendar date (YYYY-MM-DD). Deliberately not todayDateKey(), which is
// the UTC date: the week strip has to roll over at the user's midnight.
export function localDateKey(d: Date): string {
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

function mondayOf(now: Date): Date {
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sinceMonday = (monday.getDay() + 6) % 7; // Mon = 0 ... Sun = 6
  monday.setDate(monday.getDate() - sinceMonday);
  return monday;
}

// Inclusive local-date bounds of the Monday-Sunday week containing `now`.
export function weekBounds(now: Date = new Date()): { start: string; end: string } {
  const monday = mondayOf(now);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: localDateKey(monday), end: localDateKey(sunday) };
}

// The five program days of the current week, in PROGRAM order (Mon-Fri).
export function currentWeek(now: Date = new Date()): WeekDay[] {
  const monday = mondayOf(now);
  const todayKey = localDateKey(now);
  return PROGRAM.map((day, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dateKey = localDateKey(date);
    return {
      key: day.key,
      label: day.label,
      shortLabel: day.label.slice(0, 3),
      dateKey,
      dateNumber: date.getDate(),
      plannedSets: day.exercises.reduce((sum, e) => sum + e.sets, 0),
      isToday: dateKey === todayKey,
    };
  });
}
