/**
 * Pure helpers for daily check-in streak calculation.
 * No store imports, no side effects — fully testable.
 */

import { format, subDays, differenceInCalendarDays, parseISO } from 'date-fns';
import type { DailyCheckIn } from '@/types';

/** Normalises a Date to a "yyyy-MM-dd" calendar-day key. */
export function toDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Current streak = consecutive days ending on:
 *   - today, if today has at least one check-in
 *   - yesterday, as a grace period when today has none yet
 * Multiple check-ins on the same day count once.
 */
export function getCurrentStreak(checkIns: DailyCheckIn[]): number {
  if (checkIns.length === 0) return 0;

  const days = new Set(checkIns.map(c => c.date));
  const today     = toDateKey(new Date());
  const yesterday = toDateKey(subDays(new Date(), 1));

  let anchor: Date;
  if (days.has(today)) {
    anchor = new Date();
  } else if (days.has(yesterday)) {
    anchor = subDays(new Date(), 1);
  } else {
    return 0;
  }

  let streak = 0;
  let cursor = anchor;
  while (days.has(toDateKey(cursor))) {
    streak++;
    cursor = subDays(cursor, 1);
  }
  return streak;
}

/**
 * Longest ever consecutive-day streak across all stored check-ins.
 * Multiple check-ins on the same day count once.
 */
export function getLongestStreak(checkIns: DailyCheckIn[]): number {
  if (checkIns.length === 0) return 0;

  const days = [...new Set(checkIns.map(c => c.date))].sort();
  let longest = 1;
  let current = 1;

  for (let i = 1; i < days.length; i++) {
    const diff = differenceInCalendarDays(parseISO(days[i]), parseISO(days[i - 1]));
    if (diff === 1) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }
  return longest;
}

/** Returns true if at least one check-in exists on the given calendar day. */
export function hasCheckInForDate(checkIns: DailyCheckIn[], date: string): boolean {
  return checkIns.some(c => c.date === date);
}

/** Weekly Insights unlock gate — requires a 7-day consecutive streak. */
export function isWeeklyInsightsUnlocked(checkIns: DailyCheckIn[]): boolean {
  return getCurrentStreak(checkIns) >= 7;
}
