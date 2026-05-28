import { format, subDays } from 'date-fns';
import {
  getCurrentStreak,
  getLongestStreak,
  hasCheckInForDate,
  isWeeklyInsightsUnlocked,
  toDateKey,
} from '../utils/streak';
import type { DailyCheckIn } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function day(offsetFromToday: number): string {
  return toDateKey(subDays(new Date(), offsetFromToday));
}

function makeCheckIn(date: string, id = date): DailyCheckIn {
  return {
    id,
    date,
    fatigue:      3,
    sleepQuality: 3,
    stress:       3,
    alertness:    3,
    createdAt:    new Date().toISOString(),
  };
}

function makeCheckIns(offsets: number[]): DailyCheckIn[] {
  return offsets.map(o => makeCheckIn(day(o)));
}

// ─── getCurrentStreak ─────────────────────────────────────────────────────────

describe('getCurrentStreak', () => {
  test('returns 0 for empty array', () => {
    expect(getCurrentStreak([])).toBe(0);
  });

  test('returns 1 for a single check-in today', () => {
    expect(getCurrentStreak(makeCheckIns([0]))).toBe(1);
  });

  test('returns N for N consecutive days ending today', () => {
    expect(getCurrentStreak(makeCheckIns([0, 1, 2, 3]))).toBe(4);
  });

  test('two check-ins on the same day count as 1', () => {
    const checkIns = [
      makeCheckIn(day(0), 'a'),
      makeCheckIn(day(0), 'b'), // duplicate date
      makeCheckIn(day(1), 'c'),
    ];
    expect(getCurrentStreak(checkIns)).toBe(2);
  });

  test('resets after a missed day (gap of 2+)', () => {
    // today + 2 days ago — yesterday is missing
    expect(getCurrentStreak(makeCheckIns([0, 2]))).toBe(1);
  });

  test('no check-in today but yesterday exists → grace period, streak = days ending yesterday', () => {
    // yesterday + 2 days ago: streak = 2, no check-in today
    expect(getCurrentStreak(makeCheckIns([1, 2]))).toBe(2);
  });

  test('returns 0 when newest check-in is 2+ days old', () => {
    expect(getCurrentStreak(makeCheckIns([2, 3, 4]))).toBe(0);
  });

  test('handles a long streak of 7 consecutive days ending today', () => {
    expect(getCurrentStreak(makeCheckIns([0, 1, 2, 3, 4, 5, 6]))).toBe(7);
  });
});

// ─── getLongestStreak ─────────────────────────────────────────────────────────

describe('getLongestStreak', () => {
  test('returns 0 for empty array', () => {
    expect(getLongestStreak([])).toBe(0);
  });

  test('returns 1 for a single check-in', () => {
    expect(getLongestStreak(makeCheckIns([5]))).toBe(1);
  });

  test('counts max consecutive run across multiple runs', () => {
    // Run 1: days 10-8 (3 days), gap, Run 2: days 5-3 (3 days), gap, today (1 day)
    const checkIns = makeCheckIns([10, 9, 8, 5, 4, 3, 0]);
    expect(getLongestStreak(checkIns)).toBe(3);
  });

  test('same day duplicates do not inflate longest streak', () => {
    const checkIns = [
      makeCheckIn(day(2), 'a'),
      makeCheckIn(day(2), 'b'),
      makeCheckIn(day(1), 'c'),
      makeCheckIn(day(0), 'd'),
    ];
    expect(getLongestStreak(checkIns)).toBe(3);
  });

  test('returns the longer of two non-overlapping runs', () => {
    // run of 5, then gap, then run of 3
    const checkIns = makeCheckIns([20, 19, 18, 17, 16,  10, 9, 8]);
    expect(getLongestStreak(checkIns)).toBe(5);
  });
});

// ─── hasCheckInForDate ────────────────────────────────────────────────────────

describe('hasCheckInForDate', () => {
  test('returns true when the date exists', () => {
    const checkIns = makeCheckIns([0, 1]);
    expect(hasCheckInForDate(checkIns, day(0))).toBe(true);
  });

  test('returns false when the date is absent', () => {
    const checkIns = makeCheckIns([1]);
    expect(hasCheckInForDate(checkIns, day(0))).toBe(false);
  });

  test('returns false for empty array', () => {
    expect(hasCheckInForDate([], day(0))).toBe(false);
  });
});

// ─── isWeeklyInsightsUnlocked ─────────────────────────────────────────────────

describe('isWeeklyInsightsUnlocked', () => {
  test('returns false for empty array', () => {
    expect(isWeeklyInsightsUnlocked([])).toBe(false);
  });

  test('returns false for 6-day streak', () => {
    expect(isWeeklyInsightsUnlocked(makeCheckIns([0, 1, 2, 3, 4, 5]))).toBe(false);
  });

  test('returns true for exactly 7-day streak', () => {
    expect(isWeeklyInsightsUnlocked(makeCheckIns([0, 1, 2, 3, 4, 5, 6]))).toBe(true);
  });

  test('returns true for streak > 7', () => {
    expect(isWeeklyInsightsUnlocked(makeCheckIns([0, 1, 2, 3, 4, 5, 6, 7, 8]))).toBe(true);
  });
});
