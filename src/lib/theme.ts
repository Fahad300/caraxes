// Design tokens from docs/DESIGN_SYSTEM.md.
//
// Two layers, kept separate: BRAND (chrome — nav bar, icon, splash) and
// FUNCTIONAL (in-session screens). Brand red never appears inside an active
// workout session; functional screens never reach for brand red. See the
// doc for the reasoning.

export const brand = {
  red: '#9F1D24',
  redDeep: '#5C0F14',
  redBright: '#E23744',
  black: '#0C0A09',
} as const;

export const functionalLight = {
  background: '#FAFAF9',
  elevated: '#FFFFFF',
  border: '#E7E5E4',
  text: '#1C1917',
  textDim: '#78716C',
  textFaint: '#A8A29E',
} as const;

export const functionalDark = {
  background: '#17140F',
  elevated: '#221E18',
  border: '#35302A',
  text: '#F5F2EC',
  textDim: '#B0A99E',
  textFaint: '#7D766C',
} as const;

// Dark is the primary/default theme per the design doc.
export const functional = functionalDark;

export type Phase =
  | 'warmup'
  | 'dynamicStretch'
  | 'activation'
  | 'compound'
  | 'accessory'
  | 'isolation'
  | 'cardioFinisher'
  | 'postStretch';

export const phaseColors: Record<Phase, string> = {
  warmup: '#78716C',
  dynamicStretch: '#0891B2',
  activation: '#65A30D',
  compound: '#4338CA',
  accessory: '#6D28D9',
  isolation: '#9333EA',
  cardioFinisher: '#EA580C',
  postStretch: '#0D9488',
};

// Rest duration by phase, in seconds. Only activation/compound/accessory/
// isolation trigger an auto rest timer (warm-up, stretch, and cardio are
// themselves duration items, not sets).
export const restSecondsByPhase: Partial<Record<Phase, number>> = {
  activation: 30,
  compound: 120,
  accessory: 90,
  isolation: 60,
};

export const REST_EXTEND_SECONDS = 15;

export const SESSION_AMBER_MINUTES = 75;
export const SESSION_RED_MINUTES = 90;

export const stopwatchColor = (elapsedSeconds: number, textColor: string): string => {
  const minutes = elapsedSeconds / 60;
  if (minutes >= SESSION_RED_MINUTES) return '#DC2626';
  if (minutes >= SESSION_AMBER_MINUTES) return '#D97706';
  return textColor;
};
