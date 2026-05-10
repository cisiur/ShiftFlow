import {
  calculateSleepWindow,
  calculateCaffeineGuidance,
  calculateNapSuggestion,
  calculateEnergyScore,
  energyScoreToReadiness,
} from '../domain/recommendations/rules';
import type { UserProfile, ShiftEntry, DailyCheckIn } from '../types';
import { nanoid } from '../domain/schedule/nanoid';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const baseProfile: UserProfile = {
  id: 'test',
  role: 'nurse',
  shiftPattern: 'rotating',
  sleepDifficulty: 'moderate',
  caffeineSensitivity: 'medium',
  targetSleepHours: 8,
  goals: ['better_sleep'],
  notifications: {
    enabled: false,
    frequency: 'minimal',
    sleepReminder: false,
    caffeineReminder: false,
    napReminder: false,
    shiftReminder: false,
    checkInReminder: false,
  },
  onboardingComplete: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

function makeShift(
  date: string,
  type: ShiftEntry['type'],
  startTime?: string,
  endTime?: string,
): ShiftEntry {
  return {
    id: nanoid(),
    date,
    type,
    startTime: startTime ?? null,
    endTime: endTime ?? null,
  };
}

function makeCheckIn(
  date: string,
  fatigue: DailyCheckIn['fatigue'],
  sleepQuality: DailyCheckIn['sleepQuality'],
): DailyCheckIn {
  return {
    id: nanoid(),
    date,
    fatigue,
    sleepQuality,
    stress: 3,
    alertness: 3,
    createdAt: date + 'T20:00:00Z',
  };
}

// ─── Sleep Window Tests ───────────────────────────────────────────────────────

describe('calculateSleepWindow', () => {
  test('morning shift: sleep around 22:30', () => {
    const shift = makeShift('2025-01-01', 'morning', '06:00', '14:00');
    const result = calculateSleepWindow({ todayShift: shift, tomorrowShift: null, profile: baseProfile, fatigue: 3 });
    expect(result.start).toBe('22:30');
    expect(result.durationHours).toBe(8);
    expect(result.crossesMidnight).toBe(true);
  });

  test('afternoon shift: sleep starts after commute + wind-down', () => {
    const shift = makeShift('2025-01-01', 'afternoon', '14:00', '22:00');
    const result = calculateSleepWindow({ todayShift: shift, tomorrowShift: null, profile: baseProfile, fatigue: 3 });
    // 22:00 + 30 (commute) + 30 (wind-down) = 23:00
    expect(result.start).toBe('23:00');
  });

  test('night shift: sleep shortly after shift ends', () => {
    const shift = makeShift('2025-01-01', 'night', '22:00', '06:00');
    const result = calculateSleepWindow({ todayShift: shift, tomorrowShift: null, profile: baseProfile, fatigue: 3 });
    // 06:00 + 30 (commute) = 06:30
    expect(result.start).toBe('06:30');
  });

  test('off day with no tomorrow shift: default 23:00', () => {
    const result = calculateSleepWindow({ todayShift: null, tomorrowShift: null, profile: baseProfile, fatigue: 3 });
    expect(result.start).toBe('23:00');
  });

  test('off day before morning shift: earlier bedtime', () => {
    const tomorrowShift = makeShift('2025-01-02', 'morning', '06:00', '14:00');
    const result = calculateSleepWindow({ todayShift: null, tomorrowShift, profile: baseProfile, fatigue: 3 });
    expect(result.start).toBe('22:00');
  });

  test('high fatigue adds 30 minutes to sleep duration', () => {
    const shift = makeShift('2025-01-01', 'morning', '06:00', '14:00');
    const normalResult = calculateSleepWindow({ todayShift: shift, tomorrowShift: null, profile: baseProfile, fatigue: 3 });
    const tiredResult = calculateSleepWindow({ todayShift: shift, tomorrowShift: null, profile: baseProfile, fatigue: 5 });
    expect(tiredResult.durationHours).toBe(normalResult.durationHours + 0.5);
  });
});

// ─── Caffeine Guidance Tests ──────────────────────────────────────────────────

describe('calculateCaffeineGuidance', () => {
  const sleepWindow = { start: '23:00', end: '07:00', durationHours: 8, crossesMidnight: true };

  test('medium sensitivity: cutoff is 6h before sleep', () => {
    const result = calculateCaffeineGuidance(sleepWindow, baseProfile, '10:00');
    expect(result.cutoffTime).toBe('17:00'); // 23:00 - 6h
  });

  test('high sensitivity: cutoff is 8h before sleep', () => {
    const highSensProfile = { ...baseProfile, caffeineSensitivity: 'high' as const };
    const result = calculateCaffeineGuidance(sleepWindow, highSensProfile, '10:00');
    expect(result.cutoffTime).toBe('15:00'); // 23:00 - 8h
  });

  test('low sensitivity: cutoff is 4h before sleep', () => {
    const lowSensProfile = { ...baseProfile, caffeineSensitivity: 'low' as const };
    const result = calculateCaffeineGuidance(sleepWindow, lowSensProfile, '10:00');
    expect(result.cutoffTime).toBe('19:00'); // 23:00 - 4h
  });

  test('before cutoff: phase is free', () => {
    const result = calculateCaffeineGuidance(sleepWindow, baseProfile, '10:00');
    expect(result.currentPhase).toBe('free');
  });

  test('max cups: high sensitivity = 1', () => {
    const highSensProfile = { ...baseProfile, caffeineSensitivity: 'high' as const };
    const result = calculateCaffeineGuidance(sleepWindow, highSensProfile, '10:00');
    expect(result.maxCupsToday).toBe(1);
  });

  test('max cups: low sensitivity = 4', () => {
    const lowSensProfile = { ...baseProfile, caffeineSensitivity: 'low' as const };
    const result = calculateCaffeineGuidance(sleepWindow, lowSensProfile, '10:00');
    expect(result.maxCupsToday).toBe(4);
  });
});

// ─── Nap Suggestion Tests ─────────────────────────────────────────────────────

describe('calculateNapSuggestion', () => {
  test('post-night shift: recommends recovery nap', () => {
    const shift = makeShift('2025-01-01', 'night', '22:00', '06:00');
    const result = calculateNapSuggestion(shift, null, 50, '07:00');
    expect(result.recommended).toBe(true);
    expect(result.durationMinutes).toBe(90);
    expect(result.startTime).toBe('06:30'); // end + 30min commute
  });

  test('before night shift tomorrow: suggests preparatory nap', () => {
    const tomorrow = makeShift('2025-01-02', 'night', '22:00', '06:00');
    const result = calculateNapSuggestion(null, tomorrow, 60, '10:00');
    expect(result.recommended).toBe(true);
    expect(result.durationMinutes).toBe(90);
  });

  test('low energy + daytime: suggests power nap', () => {
    const result = calculateNapSuggestion(null, null, 25, '11:00');
    expect(result.recommended).toBe(true);
    expect(result.durationMinutes).toBe(20);
  });

  test('normal energy: no nap suggested', () => {
    const result = calculateNapSuggestion(null, null, 70, '10:00');
    expect(result.recommended).toBe(false);
  });
});

// ─── Energy Score Tests ───────────────────────────────────────────────────────

describe('calculateEnergyScore', () => {
  test('empty check-ins: returns neutral 65', () => {
    expect(calculateEnergyScore([])).toBe(65);
  });

  test('perfect check-ins: returns high score', () => {
    const checkIns = [
      makeCheckIn('2025-01-07', 1, 5),  // low fatigue, high sleep
      makeCheckIn('2025-01-06', 1, 5),
      makeCheckIn('2025-01-05', 1, 5),
    ].map(c => ({ ...c, stress: 1 as const, alertness: 5 as const }));
    const score = calculateEnergyScore(checkIns);
    expect(score).toBeGreaterThan(70);
  });

  test('exhausted check-ins: returns low score', () => {
    const checkIns = [
      makeCheckIn('2025-01-07', 5, 1),
      makeCheckIn('2025-01-06', 5, 1),
      makeCheckIn('2025-01-05', 5, 1),
    ].map(c => ({ ...c, stress: 5 as const, alertness: 1 as const }));
    const score = calculateEnergyScore(checkIns);
    expect(score).toBeLessThan(40);
  });

  test('recent check-ins are weighted more', () => {
    const goodRecent = [
      { ...makeCheckIn('2025-01-07', 1, 5), stress: 1 as const, alertness: 5 as const },
      { ...makeCheckIn('2025-01-01', 5, 1), stress: 5 as const, alertness: 1 as const },
    ];
    const badRecent = [
      { ...makeCheckIn('2025-01-07', 5, 1), stress: 5 as const, alertness: 1 as const },
      { ...makeCheckIn('2025-01-01', 1, 5), stress: 1 as const, alertness: 5 as const },
    ];
    expect(calculateEnergyScore(goodRecent)).toBeGreaterThan(calculateEnergyScore(badRecent));
  });
});

// ─── Readiness Tests ──────────────────────────────────────────────────────────

describe('energyScoreToReadiness', () => {
  test('>=65 → high', () => expect(energyScoreToReadiness(65)).toBe('high'));
  test('>=40 <65 → medium', () => expect(energyScoreToReadiness(50)).toBe('medium'));
  test('<40 → low', () => expect(energyScoreToReadiness(30)).toBe('low'));
  test('edge 40 → medium', () => expect(energyScoreToReadiness(40)).toBe('medium'));
  test('edge 64 → medium', () => expect(energyScoreToReadiness(64)).toBe('medium'));
});
