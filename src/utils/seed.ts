// Demo seed data — used in development to populate a realistic schedule.
import type { UserProfile, ShiftEntry } from '@/types';
import { createShiftEntry } from '@/domain/schedule/helpers';
import { offsetDate, todayISO } from './time';
import { nanoid } from '@/domain/schedule/nanoid';

export function createDemoProfile(): UserProfile {
  const now = new Date().toISOString();
  return {
    id: nanoid(12),
    name: 'Alex',
    role: 'nurse',
    shiftPattern: 'rotating',
    sleepDifficulty: 'moderate',
    caffeineSensitivity: 'medium',
    targetSleepHours: 8,
    goals: ['better_sleep', 'shift_recovery'],
    notifications: {
      enabled: true,
      frequency: 'moderate',
      sleepReminder: true,
      caffeineReminder: true,
      napReminder: true,
      shiftReminder: true,
      checkInReminder: true,
    },
    onboardingComplete: true,
    createdAt: now,
    updatedAt: now,
  };
}

export function createDemoSchedule(): ShiftEntry[] {
  const today = todayISO();
  const pattern = [
    'morning', 'morning', 'off',
    'night', 'night', 'night', 'off',
    'afternoon', 'afternoon', 'morning', 'off', 'off',
    'long_night', 'long_night', 'off',
  ] as const;

  return pattern.map((type, i) => createShiftEntry(offsetDate(today, i - 2), type));
}
