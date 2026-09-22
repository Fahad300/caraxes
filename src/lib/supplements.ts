// Fixed 5-item supplement stack (PRD Section 6.5). Not user-editable in v1.

export interface Supplement {
  name: string;
  dose: string;
  timing: string;
}

export const SUPPLEMENT_STACK: Supplement[] = [
  { name: 'Whey protein', dose: '1 scoop', timing: 'Post-gym' },
  { name: 'Creatine monohydrate', dose: '5g', timing: 'Post-gym' },
  { name: 'Suncell 5000 (Vitamin D3)', dose: '5000 IU', timing: 'Daily' },
  { name: 'Normega 1000 (Fish oil)', dose: '1000mg', timing: 'Daily' },
  { name: 'Nutrifactor Magnesium Glycinate', dose: '~800mg (~120mg elemental)', timing: 'Daily' },
];

// Vitamin D was tested deficient ~July 2026; standard correction window is
// 8-12 weeks. Surface a retest reminder once that window has elapsed.
export const VITAMIN_D_TEST_DATE = '2026-07-01';
export const VITAMIN_D_RETEST_WINDOW_WEEKS_LOW = 8;
export const VITAMIN_D_RETEST_WINDOW_WEEKS_HIGH = 12;
