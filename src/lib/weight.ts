// Trend messaging is based on averages, never a day-to-day delta (see the
// note in app/(tabs)/weight.tsx).
export function average(entries: { weight_kg: number }[]): number | null {
  if (entries.length === 0) return null;
  return entries.reduce((sum, e) => sum + e.weight_kg, 0) / entries.length;
}
