// Fixed 5-day upper/lower split. Order and content come directly from the
// PRD (Section 6) and reflect compound-before-isolation sequencing — do not
// reorder or "clean up" this data without updating the source requirements.
// Program changes are reviewed in 8-12 week cycles, not altered ad hoc.

// Kept as a subset of lib/theme's Phase union (activation/compound/accessory/
// isolation are the only phases that apply to logged exercises — warm-up,
// stretch, and cardio finisher are duration items, not exercises).
export type ExercisePhase = 'activation' | 'compound' | 'accessory' | 'isolation';

export interface ProgramExercise {
  name: string;
  phase: ExercisePhase;
  sets: number;
  repRangeLow: number;
  repRangeHigh: number;
  perSide?: boolean;
}

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri';

export interface ProgramDay {
  key: DayKey;
  label: string;
  focus: string;
  cardioFinisher: string;
  exercises: ProgramExercise[];
}

export const PROGRAM: ProgramDay[] = [
  {
    key: 'mon',
    label: 'Monday',
    focus: 'Upper Push-dominant (chest, front/side delts, triceps)',
    cardioFinisher: 'Incline treadmill',
    exercises: [
      { name: 'Pec fly (light)', phase: 'activation', sets: 2, repRangeLow: 15, repRangeHigh: 20 },
      { name: 'Bench press', phase: 'compound', sets: 4, repRangeLow: 6, repRangeHigh: 10 },
      { name: 'Incline DB press', phase: 'accessory', sets: 3, repRangeLow: 6, repRangeHigh: 10 },
      { name: 'Standing shoulder press (straight bar)', phase: 'accessory', sets: 3, repRangeLow: 8, repRangeHigh: 10 },
      { name: 'Pec fly (isolation)', phase: 'isolation', sets: 3, repRangeLow: 12, repRangeHigh: 15 },
      { name: 'Lateral + front raise combo', phase: 'isolation', sets: 3, repRangeLow: 12, repRangeHigh: 15 },
      { name: 'Rope pushdown', phase: 'isolation', sets: 3, repRangeLow: 12, repRangeHigh: 15 },
    ],
  },
  {
    key: 'tue',
    label: 'Tuesday',
    focus: 'Lower A - Quad-dominant',
    cardioFinisher: 'Cycle',
    exercises: [
      { name: 'Leg extension / BW squat', phase: 'activation', sets: 2, repRangeLow: 15, repRangeHigh: 20 },
      { name: 'Leg press', phase: 'compound', sets: 4, repRangeLow: 6, repRangeHigh: 10 },
      { name: 'Hack/Smith squat', phase: 'accessory', sets: 3, repRangeLow: 8, repRangeHigh: 10 },
      { name: 'Leg extension (isolation)', phase: 'isolation', sets: 3, repRangeLow: 12, repRangeHigh: 15 },
      { name: 'DB side-lying hip abduction', phase: 'isolation', sets: 3, repRangeLow: 15, repRangeHigh: 20, perSide: true },
      { name: 'Calf raise', phase: 'isolation', sets: 3, repRangeLow: 12, repRangeHigh: 20 },
    ],
  },
  {
    key: 'wed',
    label: 'Wednesday',
    focus: 'Upper Pull + Rear Delt/Posture + Core',
    cardioFinisher: 'Incline treadmill',
    exercises: [
      { name: 'Scap retraction / wall slides', phase: 'activation', sets: 2, repRangeLow: 15, repRangeHigh: 20 },
      { name: 'Lat pulldown', phase: 'compound', sets: 4, repRangeLow: 6, repRangeHigh: 10 },
      { name: 'Seated row', phase: 'accessory', sets: 3, repRangeLow: 8, repRangeHigh: 10 },
      { name: 'DB reverse fly', phase: 'isolation', sets: 3, repRangeLow: 10, repRangeHigh: 12 },
      { name: 'Face pull', phase: 'isolation', sets: 3, repRangeLow: 12, repRangeHigh: 15 },
      { name: 'DB incline curl', phase: 'isolation', sets: 3, repRangeLow: 10, repRangeHigh: 12 },
      { name: 'Cable/machine crunch', phase: 'isolation', sets: 3, repRangeLow: 12, repRangeHigh: 15 },
    ],
  },
  {
    key: 'thu',
    label: 'Thursday',
    focus: 'Lower B - Hinge/Hamstring + Glute-dominant',
    cardioFinisher: 'Cycle',
    exercises: [
      { name: 'Glute bridge / pull-through', phase: 'activation', sets: 2, repRangeLow: 15, repRangeHigh: 20 },
      { name: 'Machine/Smith RDL or hip thrust', phase: 'compound', sets: 4, repRangeLow: 6, repRangeHigh: 10 },
      { name: 'Seated leg curl', phase: 'accessory', sets: 3, repRangeLow: 8, repRangeHigh: 10 },
      { name: 'Bodyweight quadruped kickback', phase: 'isolation', sets: 3, repRangeLow: 15, repRangeHigh: 20, perSide: true },
      { name: 'DB sumo squat', phase: 'isolation', sets: 3, repRangeLow: 12, repRangeHigh: 15 },
      { name: 'Cable Pallof press', phase: 'isolation', sets: 3, repRangeLow: 12, repRangeHigh: 15, perSide: true },
    ],
  },
  {
    key: 'fri',
    label: 'Friday',
    focus: 'Full Body - 2nd exposure (chest, back, delts, biceps, triceps, core)',
    cardioFinisher: 'TBD (open question)',
    exercises: [
      { name: 'Light arm circles', phase: 'activation', sets: 2, repRangeLow: 15, repRangeHigh: 20 },
      { name: 'Incline DB press or machine chest press (moderate)', phase: 'accessory', sets: 3, repRangeLow: 10, repRangeHigh: 12 },
      { name: 'Seated row or lat pulldown (moderate)', phase: 'accessory', sets: 3, repRangeLow: 10, repRangeHigh: 12 },
      { name: 'Machine/DB lateral raise', phase: 'isolation', sets: 3, repRangeLow: 12, repRangeHigh: 15 },
      { name: 'EZ bar curl', phase: 'isolation', sets: 3, repRangeLow: 10, repRangeHigh: 12 },
      { name: 'Cable overhead tricep extension', phase: 'isolation', sets: 3, repRangeLow: 10, repRangeHigh: 12 },
      { name: 'Hanging leg raise', phase: 'isolation', sets: 3, repRangeLow: 12, repRangeHigh: 15 },
    ],
  },
];

export const SESSION_BUDGET_MINUTES = 90;
export const PROTEIN_TARGET_LOW_G = 155;
export const PROTEIN_TARGET_HIGH_G = 195;

export const WARMUP_MINUTES = 10;
export const CARDIO_FINISHER_MINUTES = 15;

export function getProgramDay(key: DayKey): ProgramDay | undefined {
  return PROGRAM.find((d) => d.key === key);
}

// Duration-based items that bookend every session (PRD 6.2). These are
// tracked with their own start/pause/reset timer, not the per-set logger.
export type DurationPhase = 'warmup' | 'dynamicStretch' | 'cardioFinisher' | 'postStretch';

export interface SessionDurationItem {
  key: string;
  label: string;
  phase: DurationPhase;
  targetMinutes?: number;
}

export const PRE_SESSION_ITEMS: SessionDurationItem[] = [
  { key: 'warmup', label: 'Treadmill Warm-up', phase: 'warmup', targetMinutes: WARMUP_MINUTES },
  { key: 'dynamic-stretch', label: 'Dynamic Stretch', phase: 'dynamicStretch' },
];

export function getPostSessionItems(day: ProgramDay): SessionDurationItem[] {
  return [
    { key: 'cardio-finisher', label: `Cardio Finisher (${day.cardioFinisher})`, phase: 'cardioFinisher', targetMinutes: CARDIO_FINISHER_MINUTES },
    { key: 'post-stretch', label: 'Post-Stretch', phase: 'postStretch' },
  ];
}
