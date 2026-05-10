import type { ShiftEntry, ShiftType } from '@/types';
import { SHIFT_DEFAULTS } from '@/constants/shifts';
import { offsetDate, todayISO } from '@/utils/time';
import { nanoid } from './nanoid';

export function createShiftEntry(
  date: string,
  type: ShiftType,
  overrides: Partial<Pick<ShiftEntry, 'startTime' | 'endTime' | 'notes'>> = {},
): ShiftEntry {
  const defaults = SHIFT_DEFAULTS[type];
  return {
    id: nanoid(),
    date,
    type,
    startTime: (overrides.startTime ?? defaults.startTime) || null,
    endTime: (overrides.endTime ?? defaults.endTime) || null,
    notes: overrides.notes,
  };
}

/** Returns the shift for a given date or null. */
export function findShiftForDate(shifts: ShiftEntry[], date: string): ShiftEntry | null {
  return shifts.find(s => s.date === date) ?? null;
}

/** Returns the next non-off shift after a date. */
export function findNextWorkingShift(shifts: ShiftEntry[], afterDate: string): ShiftEntry | null {
  return shifts
    .filter(s => s.date > afterDate && s.type !== 'off')
    .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null;
}

/** Fill gaps in shifts array with 'off' entries for a date range. */
export function fillShiftGaps(
  shifts: ShiftEntry[],
  startDate: string,
  days: number,
): ShiftEntry[] {
  const dates = Array.from({ length: days }, (_, i) => offsetDate(startDate, i));
  const existing = new Map(shifts.map(s => [s.date, s]));

  return dates.map(date => {
    return existing.get(date) ?? createShiftEntry(date, 'off');
  });
}

/** Returns true if the shift type involves night work. */
export function isNightShift(type: ShiftType): boolean {
  return type === 'night' || type === 'long_night';
}

/** Returns true if the shift involves early morning start (before 08:00). */
export function isEarlyShift(shift: ShiftEntry): boolean {
  if (!shift.startTime) return false;
  const [h] = shift.startTime.split(':').map(Number);
  return h < 8;
}

/** Formats a shift time range like "22:00 – 06:00". */
export function formatShiftHours(shift: ShiftEntry): string {
  if (shift.type === 'off') return 'Day off';
  if (shift.type === 'extended' && shift.durationHours) {
    const start = shift.startTime ?? '?';
    return `${start} · ${shift.durationHours}h continuous`;
  }
  if (!shift.startTime || !shift.endTime) return 'Times not set';
  return `${shift.startTime} – ${shift.endTime}`;
}

/** Returns the duration of a shift in hours. */
export function shiftDurationHours(shift: ShiftEntry): number {
  // Extended shifts store their duration explicitly
  if (shift.durationHours) return shift.durationHours;
  if (!shift.startTime || !shift.endTime || shift.type === 'off') return 0;
  const [sh, sm] = shift.startTime.split(':').map(Number);
  const [eh, em] = shift.endTime.split(':').map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  const diff = endMin >= startMin ? endMin - startMin : 1440 - startMin + endMin;
  return Math.round((diff / 60) * 10) / 10;
}
