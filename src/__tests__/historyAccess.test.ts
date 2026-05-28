import { format, subDays } from 'date-fns';
import {
  getVisibleCheckIns,
  getLockedHistoryCount,
  canAccessCheckInDate,
  HISTORY_LIMIT_DAYS,
} from '../utils/historyAccess';
import type { DailyCheckIn } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dateStr(offsetFromToday: number): string {
  return format(subDays(new Date(), offsetFromToday), 'yyyy-MM-dd');
}

function makeCheckIn(daysAgo: number): DailyCheckIn {
  const date = dateStr(daysAgo);
  return {
    id:           date,
    date,
    fatigue:      3,
    sleepQuality: 3,
    stress:       3,
    alertness:    3,
    createdAt:    new Date().toISOString(),
  };
}

// 5 recent + 3 old check-ins
const RECENT = [0, 3, 7, 10, 13].map(makeCheckIn);                 // all within 14 days
const OLD     = [15, 20, 30].map(makeCheckIn);                      // older than 14 days
const MIXED   = [...RECENT, ...OLD];

// ─── getVisibleCheckIns ───────────────────────────────────────────────────────

describe('getVisibleCheckIns', () => {
  test('Pro user sees all check-ins', () => {
    expect(getVisibleCheckIns(MIXED, true)).toHaveLength(MIXED.length);
  });

  test('Free user with all check-ins within 14 days sees all', () => {
    expect(getVisibleCheckIns(RECENT, false)).toHaveLength(RECENT.length);
  });

  test('Free user with older check-ins sees only recent ones', () => {
    const visible = getVisibleCheckIns(MIXED, false);
    expect(visible).toHaveLength(RECENT.length);
    visible.forEach(c => {
      expect(c.date >= dateStr(HISTORY_LIMIT_DAYS)).toBe(true);
    });
  });

  test('does not mutate the original array', () => {
    const copy = [...MIXED];
    getVisibleCheckIns(MIXED, false);
    expect(MIXED).toEqual(copy);
  });

  test('returns empty array when all are old and user is free', () => {
    expect(getVisibleCheckIns(OLD, false)).toHaveLength(0);
  });
});

// ─── getLockedHistoryCount ────────────────────────────────────────────────────

describe('getLockedHistoryCount', () => {
  test('returns 0 for Pro user regardless of data', () => {
    expect(getLockedHistoryCount(MIXED, true)).toBe(0);
  });

  test('returns 0 when all check-ins are within 14 days (free)', () => {
    expect(getLockedHistoryCount(RECENT, false)).toBe(0);
  });

  test('returns correct count of older entries for free user', () => {
    expect(getLockedHistoryCount(MIXED, false)).toBe(OLD.length);
  });

  test('returns total count when all are old (free)', () => {
    expect(getLockedHistoryCount(OLD, false)).toBe(OLD.length);
  });

  test('returns 0 for empty array', () => {
    expect(getLockedHistoryCount([], false)).toBe(0);
  });
});

// ─── canAccessCheckInDate ─────────────────────────────────────────────────────

describe('canAccessCheckInDate', () => {
  test('Pro user can access any date', () => {
    expect(canAccessCheckInDate(dateStr(365), true)).toBe(true);
    expect(canAccessCheckInDate(dateStr(0), true)).toBe(true);
  });

  test('Free user can access today', () => {
    expect(canAccessCheckInDate(dateStr(0), false)).toBe(true);
  });

  test('Free user can access a date within 14 days', () => {
    expect(canAccessCheckInDate(dateStr(13), false)).toBe(true);
  });

  test('Free user cannot access a date older than 14 days', () => {
    expect(canAccessCheckInDate(dateStr(15), false)).toBe(false);
  });

  test('Free user cannot access a date from last year', () => {
    expect(canAccessCheckInDate(dateStr(100), false)).toBe(false);
  });
});
