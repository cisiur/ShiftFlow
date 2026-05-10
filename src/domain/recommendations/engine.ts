// Recommendation engine — orchestrates rules into a complete DailyPlan.

import type {
  UserProfile,
  ShiftEntry,
  ShiftType,
  DailyCheckIn,
  DailyPlan,
} from '@/types';
import { getEffectiveShiftTimes } from '@/constants/shifts';
import { shiftDurationHours } from '@/domain/schedule/helpers';
import {
  calculateSleepWindow,
  calculateCaffeineGuidance,
  calculateNapSuggestion,
  calculateMealSuggestions,
  generateRecoveryTips,
  calculateEnergyScore,
  energyScoreToReadiness,
  generateExplanationSummary,
} from './rules';
import type { RulesStrings } from '@/i18n/rulesStrings';

// ─── Multi-shift merging ──────────────────────────────────────────────────────

/**
 * Priority order for choosing the "dominant" type when multiple shifts are
 * present on the same day.  Night work requires the most recovery, so it wins.
 */
const TYPE_PRIORITY: Record<ShiftType, number> = {
  night:      7,
  long_night: 6,
  extended:   5,
  long_day:   4,
  afternoon:  3,
  morning:    2,
  custom:     2,
  off:        0,
};

/**
 * Merge an array of ShiftEntry objects for the same date into a single
 * "effective" entry that the rules layer can reason about.
 *
 * - If there are no real (non-off) shifts → return null.
 * - If there is exactly one real shift → return it as-is (no wrapping).
 * - For multiple shifts → synthesise a combined entry:
 *     type      = most demanding type present
 *     startTime = earliest start time
 *     endTime   = latest end time (last shift's endTime)
 *     durationHours = sum of all individual durations
 */
function mergeShifts(
  shifts: ShiftEntry[],
  profile: UserProfile,
): ShiftEntry | null {
  // Filter out 'off' placeholders
  const real = shifts.filter(s => s.type !== 'off');
  if (real.length === 0) return null;

  // Apply user's effective times for predefined types before merging
  const resolved = real.map(s => withEffectiveTimes(s, profile));

  if (resolved.length === 1) return resolved[0];

  // Sort by start time so first/last are meaningful
  const sorted = [...resolved].sort(
    (a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''),
  );

  const dominantType = sorted.reduce<ShiftType>((best, s) =>
    (TYPE_PRIORITY[s.type] ?? 0) > (TYPE_PRIORITY[best] ?? 0) ? s.type : best,
    sorted[0].type,
  );

  const totalHours = sorted.reduce((sum, s) => sum + shiftDurationHours(s), 0);

  return {
    ...sorted[sorted.length - 1],           // inherit id / date from last
    type:          dominantType,
    startTime:     sorted[0].startTime,
    endTime:       sorted[sorted.length - 1].endTime,
    durationHours: Math.round(totalHours * 10) / 10,
  };
}

/**
 * Returns a copy of the shift with startTime/endTime replaced by the user's
 * current effective defaults.  Custom / extended / off shifts are returned as-is.
 */
function withEffectiveTimes(
  shift: ShiftEntry,
  profile: UserProfile,
): ShiftEntry {
  if (shift.type === 'custom' || shift.type === 'extended' || shift.type === 'off') {
    return shift;
  }
  const times = getEffectiveShiftTimes(shift.type, profile.shiftTimeDefaults);
  return {
    ...shift,
    startTime: times.startTime || shift.startTime,
    endTime:   times.endTime   || shift.endTime,
  };
}

// ─── Plan generation ──────────────────────────────────────────────────────────

interface GeneratePlanOptions {
  date: string;
  profile: UserProfile;
  /** All shifts for today (may be multiple). */
  todayShifts: ShiftEntry[];
  /** All shifts for tomorrow (may be multiple). */
  tomorrowShifts: ShiftEntry[];
  recentCheckIns: DailyCheckIn[];
  currentTime?: string;
  strings: RulesStrings;
}

export function generateDailyPlan(opts: GeneratePlanOptions): DailyPlan {
  const {
    date,
    profile,
    recentCheckIns,
    strings,
    currentTime = getCurrentHHMM(),
  } = opts;

  // Merge multiple shifts into one effective entry for the rules layer
  const todayShift    = mergeShifts(opts.todayShifts,    profile);
  const tomorrowShift = mergeShifts(opts.tomorrowShifts, profile);

  const energyScore   = calculateEnergyScore(recentCheckIns);
  const latestCheckIn = recentCheckIns.length > 0 ? recentCheckIns[0] : undefined;
  const fatigue       = latestCheckIn?.fatigue ?? 3;

  const sleepWindow = calculateSleepWindow({
    todayShift,
    tomorrowShift,
    profile,
    fatigue,
    shiftDate: date,
  });

  const caffeineGuidance = calculateCaffeineGuidance(sleepWindow, profile, currentTime, strings);
  const napSuggestion    = calculateNapSuggestion(todayShift, tomorrowShift, energyScore, currentTime, profile, strings);
  const mealSuggestions  = calculateMealSuggestions(todayShift, currentTime, strings);
  const recoveryTips     = generateRecoveryTips(todayShift, tomorrowShift, energyScore, profile, strings);
  const explanationSummary = generateExplanationSummary(
    todayShift, tomorrowShift, sleepWindow, energyScore, strings,
    opts.todayShifts.filter(s => s.type !== 'off').length,
  );

  return {
    date,
    shift:            todayShift,
    nextShift:        tomorrowShift,
    sleepWindow,
    napSuggestion,
    caffeineGuidance,
    mealSuggestions,
    recoveryTips,
    explanationSummary,
    energyScore,
    readinessLevel:  energyScoreToReadiness(energyScore),
    generatedAt:     new Date().toISOString(),
  };
}

/** Generate plans for a full week. */
export function generateWeeklyPlans(
  profile: UserProfile,
  shiftsByDate: Map<string, ShiftEntry[]>,
  recentCheckIns: DailyCheckIn[],
  dates: string[],
  strings: RulesStrings,
): DailyPlan[] {
  return dates.map((date, i) => {
    const todayShifts    = shiftsByDate.get(date)         ?? [];
    const tomorrowDate   = dates[i + 1];
    const tomorrowShifts = tomorrowDate ? (shiftsByDate.get(tomorrowDate) ?? []) : [];

    return generateDailyPlan({
      date,
      profile,
      todayShifts,
      tomorrowShifts,
      recentCheckIns,
      currentTime: '00:01',
      strings,
    });
  });
}

function getCurrentHHMM(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}
