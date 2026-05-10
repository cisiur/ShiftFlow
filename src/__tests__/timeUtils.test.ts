import {
  parseTime,
  formatTime,
  formatTimeAmPm,
  addMinutes,
  subtractMinutes,
  sleepDurationHours,
  isTimeBetween,
  offsetDate,
  weekDates,
} from '../utils/time';

describe('parseTime', () => {
  test('parses midnight', () => expect(parseTime('00:00')).toBe(0));
  test('parses noon', () => expect(parseTime('12:00')).toBe(720));
  test('parses 23:59', () => expect(parseTime('23:59')).toBe(1439));
  test('parses 06:30', () => expect(parseTime('06:30')).toBe(390));
});

describe('formatTime', () => {
  test('formats 0 as 00:00', () => expect(formatTime(0)).toBe('00:00'));
  test('formats 720 as 12:00', () => expect(formatTime(720)).toBe('12:00'));
  test('wraps values > 1440', () => expect(formatTime(1500)).toBe('01:00'));
  test('wraps negative values', () => expect(formatTime(-60)).toBe('23:00'));
});

describe('formatTimeAmPm', () => {
  test('midnight → 12:00 AM', () => expect(formatTimeAmPm('00:00')).toBe('12:00 AM'));
  test('noon → 12:00 PM', () => expect(formatTimeAmPm('12:00')).toBe('12:00 PM'));
  test('14:30 → 2:30 PM', () => expect(formatTimeAmPm('14:30')).toBe('2:30 PM'));
  test('06:00 → 6:00 AM', () => expect(formatTimeAmPm('06:00')).toBe('6:00 AM'));
});

describe('addMinutes / subtractMinutes', () => {
  test('add 60 to 22:00 wraps to 23:00', () => expect(addMinutes('22:00', 60)).toBe('23:00'));
  test('add 120 to 23:00 wraps past midnight', () => expect(addMinutes('23:00', 120)).toBe('01:00'));
  test('subtract 30 from 06:00', () => expect(subtractMinutes('06:00', 30)).toBe('05:30'));
});

describe('sleepDurationHours', () => {
  test('same-day window', () => expect(sleepDurationHours('08:00', '16:00')).toBe(8));
  test('overnight window 22:30 to 06:30', () => expect(sleepDurationHours('22:30', '06:30')).toBe(8));
  test('overnight window 23:00 to 07:00', () => expect(sleepDurationHours('23:00', '07:00')).toBe(8));
});

describe('isTimeBetween', () => {
  test('normal range', () => expect(isTimeBetween('10:00', '08:00', '18:00')).toBe(true));
  test('outside range', () => expect(isTimeBetween('06:00', '08:00', '18:00')).toBe(false));
  test('midnight-crossing range contains time', () => expect(isTimeBetween('01:00', '22:00', '06:00')).toBe(true));
  test('midnight-crossing range excludes daytime', () => expect(isTimeBetween('12:00', '22:00', '06:00')).toBe(false));
});

describe('offsetDate', () => {
  test('+1 day', () => expect(offsetDate('2025-01-15', 1)).toBe('2025-01-16'));
  test('-1 day', () => expect(offsetDate('2025-01-01', -1)).toBe('2024-12-31'));
  test('month boundary', () => expect(offsetDate('2025-01-31', 1)).toBe('2025-02-01'));
});

describe('weekDates', () => {
  test('returns 7 dates', () => {
    const dates = weekDates('2025-01-15');
    expect(dates).toHaveLength(7);
  });

  test('starts on Monday', () => {
    // 2025-01-13 is a Monday
    const dates = weekDates('2025-01-15');
    const startDay = new Date(dates[0] + 'T12:00:00').getDay();
    expect(startDay).toBe(1); // Monday = 1
  });

  test('consecutive dates', () => {
    const dates = weekDates('2025-01-15');
    for (let i = 1; i < dates.length; i++) {
      expect(offsetDate(dates[i - 1], 1)).toBe(dates[i]);
    }
  });
});
