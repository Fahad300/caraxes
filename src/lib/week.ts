import { WEEKDAY_SHORT, type RoutineDay } from './routine';

export interface WeekDay {
  key: string; // routine day id
  label: string;
  shortLabel: string;
  weekday: number; // 1 = Monday ... 7 = Sunday
  dateKey: string;
  dateNumber: number;
  plannedSets: number;
  isToday: boolean;
}

// Local calendar date (YYYY-MM-DD), not the UTC date from toISOString(): days
// (and the week strip) have to roll over at the user's midnight.
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

// 1 = Monday ... 7 = Sunday, matching routine_days.weekday.
export function todayWeekday(now: Date = new Date()): number {
  return ((now.getDay() + 6) % 7) + 1;
}

// The routine's scheduled days laid out on the current week, in weekday
// order. Days without a weekday aren't on the strip.
export function currentWeek(days: RoutineDay[], now: Date = new Date()): WeekDay[] {
  const monday = mondayOf(now);
  const todayKey = localDateKey(now);
  return days
    .filter((d): d is RoutineDay & { weekday: number } => d.weekday !== null)
    .map((day) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + day.weekday - 1);
      const dateKey = localDateKey(date);
      return {
        key: day.id,
        label: day.name,
        shortLabel: WEEKDAY_SHORT[day.weekday - 1],
        weekday: day.weekday,
        dateKey,
        dateNumber: date.getDate(),
        plannedSets: day.exercises.reduce((sum, e) => sum + e.sets, 0),
        isToday: dateKey === todayKey,
      };
    });
}
