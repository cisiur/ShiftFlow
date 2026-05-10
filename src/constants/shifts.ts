import type { ShiftType, WorkRole, ShiftPattern, Goal, ShiftTimeDefaults } from '@/types';
import type { SelectOption } from '@/types';

export const SHIFT_DEFAULTS: Record<ShiftType, { startTime: string; endTime: string; label: string; emoji: string }> = {
  morning:    { startTime: '06:00', endTime: '14:00', label: 'Morning',     emoji: '🌅' },
  afternoon:  { startTime: '14:00', endTime: '22:00', label: 'Afternoon',   emoji: '🌆' },
  night:      { startTime: '22:00', endTime: '06:00', label: 'Night',       emoji: '🌙' },
  long_day:   { startTime: '07:00', endTime: '19:00', label: 'Long Day',    emoji: '☀️' },
  long_night: { startTime: '19:00', endTime: '07:00', label: 'Long Night',  emoji: '🌃' },
  extended:   { startTime: '08:00', endTime: '08:00', label: 'Extended',    emoji: '🔄' },
  off:        { startTime: '',      endTime: '',      label: 'Day Off',     emoji: '🏖️' },
  custom:     { startTime: '',      endTime: '',      label: 'Custom',      emoji: '⚙️' },
};

/**
 * Returns the effective start/end times for a shift type,
 * applying any user-configured overrides from their profile.
 */
export function getEffectiveShiftTimes(
  type: ShiftType,
  userDefaults?: ShiftTimeDefaults,
): { startTime: string; endTime: string } {
  const base = SHIFT_DEFAULTS[type];
  const override = userDefaults?.[type];
  if (override?.startTime || override?.endTime) {
    return {
      startTime: override.startTime ?? base.startTime,
      endTime:   override.endTime   ?? base.endTime,
    };
  }
  return { startTime: base.startTime, endTime: base.endTime };
}

/** Shift types that have user-editable default times (excludes off/custom/extended). */
export const EDITABLE_SHIFT_TYPES: ShiftType[] = [
  'morning', 'afternoon', 'night', 'long_day', 'long_night',
];

/** Duration options (hours) for extended / continuous shifts. */
export const EXTENDED_DURATION_OPTIONS = [24, 28, 30, 36, 40, 48] as const;
export type ExtendedDuration = typeof EXTENDED_DURATION_OPTIONS[number];

export const SHIFT_TYPE_OPTIONS: SelectOption<ShiftType>[] = [
  { value: 'morning',    label: 'Morning',    description: '~06:00 – 14:00',      icon: '🌅' },
  { value: 'afternoon',  label: 'Afternoon',  description: '~14:00 – 22:00',      icon: '🌆' },
  { value: 'night',      label: 'Night',      description: '~22:00 – 06:00',      icon: '🌙' },
  { value: 'long_day',   label: 'Long Day',   description: '~07:00 – 19:00',      icon: '☀️' },
  { value: 'long_night', label: 'Long Night', description: '~19:00 – 07:00',      icon: '🌃' },
  { value: 'extended',   label: 'Extended',   description: '24 h+ continuous',    icon: '🔄' },
  { value: 'off',        label: 'Day Off',    description: 'Rest & recovery',     icon: '🏖️' },
  { value: 'custom',     label: 'Custom',     description: 'Set your own hours',  icon: '⚙️' },
];

export const WORK_ROLE_OPTIONS: SelectOption<WorkRole>[] = [
  { value: 'nurse',           label: 'Nurse / Midwife',      icon: '🏥' },
  { value: 'doctor',          label: 'Doctor / Clinician',   icon: '⚕️' },
  { value: 'paramedic',       label: 'Paramedic / EMT',      icon: '🚑' },
  { value: 'factory_worker',  label: 'Factory / Production', icon: '🏭' },
  { value: 'retail',          label: 'Retail / Store',       icon: '🛒' },
  { value: 'security',        label: 'Security / Guard',     icon: '🔐' },
  { value: 'driver',          label: 'Driver / Transport',   icon: '🚛' },
  { value: 'hospitality',     label: 'Hospitality / Hotel',  icon: '🏨' },
  { value: 'warehouse',       label: 'Warehouse / Logistics',icon: '📦' },
  { value: 'other',           label: 'Other',                icon: '💼' },
];

export const SHIFT_PATTERN_OPTIONS: SelectOption<ShiftPattern>[] = [
  { value: 'rotating',         label: 'Rotating shifts',       description: 'Cycles between morning, afternoon, and night' },
  { value: 'fixed_nights',     label: 'Fixed nights',          description: 'Permanent night shifts' },
  { value: 'fixed_days',       label: 'Fixed days',            description: 'Permanent morning/day shifts' },
  { value: 'fixed_afternoons', label: 'Fixed afternoons',      description: 'Permanent afternoon/evening shifts' },
  { value: 'irregular',        label: 'Irregular',             description: 'No consistent pattern' },
  { value: 'split',            label: 'Split shifts',          description: 'Two or more periods per day' },
];

export const GOAL_OPTIONS: SelectOption<Goal>[] = [
  { value: 'better_sleep',    label: 'Sleep better',          description: 'Improve sleep timing and quality', icon: '😴' },
  { value: 'less_fatigue',    label: 'Reduce fatigue',        description: 'Feel more alert during your shift', icon: '⚡' },
  { value: 'shift_recovery',  label: 'Recover faster',        description: 'Bounce back after hard shifts', icon: '🔄' },
  { value: 'stable_routine',  label: 'Build a routine',       description: 'Create structure around shifting schedules', icon: '📅' },
];

export const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
