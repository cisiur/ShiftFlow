import type { ShiftType, ReadinessLevel, CaffeinePhase, MealType } from '@/types';

export function shiftTypeLabel(type: ShiftType): string {
  const map: Record<ShiftType, string> = {
    morning:    'Morning',
    afternoon:  'Afternoon',
    night:      'Night',
    long_day:   'Long Day',
    long_night: 'Long Night',
    extended:   'Extended',
    off:        'Day Off',
    custom:     'Custom',
  };
  return map[type] ?? type;
}

export function shiftEmoji(type: ShiftType): string {
  const map: Record<ShiftType, string> = {
    morning:    '🌅',
    afternoon:  '🌆',
    night:      '🌙',
    long_day:   '☀️',
    long_night: '🌃',
    extended:   '🔄',
    off:        '🏖️',
    custom:     '⚙️',
  };
  return map[type] ?? '📋';
}

export function readinessLabel(level: ReadinessLevel): string {
  const map: Record<ReadinessLevel, string> = {
    high: 'Good to go',
    medium: 'Moderate',
    low: 'Rest priority',
  };
  return map[level];
}

export function mealTypeLabel(type: MealType): string {
  const map: Record<MealType, string> = {
    breakfast: 'Breakfast',
    pre_shift: 'Pre-shift meal',
    shift_meal: 'Shift meal',
    post_shift: 'Post-shift meal',
    light_snack: 'Light snack',
    dinner: 'Dinner',
  };
  return map[type] ?? type;
}

export function ratingLabel(value: number): string {
  if (value <= 1) return 'Very low';
  if (value <= 2) return 'Low';
  if (value <= 3) return 'Moderate';
  if (value <= 4) return 'Good';
  return 'Great';
}
