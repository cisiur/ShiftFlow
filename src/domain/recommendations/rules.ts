// Pure, deterministic rules. No imports from React or stores — fully testable.

import type {
  ShiftEntry,
  ShiftType,
  UserProfile,
  TimeWindow,
  NapSuggestion,
  CaffeineGuidance,
  MealSuggestion,
  DailyCheckIn,
  ReadinessLevel,
  PlannedNap,
} from '@/types';
import { parseTime, formatTime, addMinutes, subtractMinutes, offsetDate } from '@/utils/time';
import type { RulesStrings } from '@/i18n/rulesStrings';

// ─── Constants ───────────────────────────────────────────────────────────────

const WIND_DOWN_MINUTES = 30;
// Cutoff hours encode the caffeine half-life math for each sensitivity level
const SLEEP_QUALITY_THRESHOLD = 3;

// How many hours before sleep caffeine becomes problematic at each sensitivity level.
const CAFFEINE_CUTOFF_HOURS: Record<UserProfile['caffeineSensitivity'], number> = {
  low: 4,
  medium: 6,
  high: 8,
};

// ─── Sleep Window ────────────────────────────────────────────────────────────

interface SleepContext {
  todayShift: ShiftEntry | null;
  tomorrowShift: ShiftEntry | null;
  profile: UserProfile;
  fatigue: number; // 1-5, higher = more tired
  /** ISO date of the plan day — used to compute which calendar date the sleep falls on. */
  shiftDate?: string;
}

export function calculateSleepWindow(ctx: SleepContext): TimeWindow {
  const { todayShift, tomorrowShift, profile, fatigue, shiftDate } = ctx;
  const prepTime       = profile.prepTimeMinutes ?? 30;
  const targetDuration = profile.targetSleepHours * 60; // in minutes

  // High fatigue adds 30 minutes to target
  const adjustedDuration = fatigue >= 4 ? targetDuration + 30 : targetDuration;

  let sleepStartMin: number;

  if (!todayShift || todayShift.type === 'off') {
    sleepStartMin = deriveSleepStartForOffDay(tomorrowShift);
  } else {
    sleepStartMin = deriveSleepStartForShiftDay(todayShift, prepTime);
  }

  // If tomorrow is an early shift, ensure wake-up is early enough
  if (tomorrowShift && tomorrowShift.startTime && tomorrowShift.type !== 'off') {
    const gettingReadyMin = 60; // fixed buffer to shower/eat before leaving
    const requiredWakeMin = parseTime(tomorrowShift.startTime) - prepTime - gettingReadyMin;
    const requiredSleepStartMin = requiredWakeMin - adjustedDuration;
    if (requiredSleepStartMin < sleepStartMin) {
      sleepStartMin = requiredSleepStartMin;
    }
  }

  const sleepEndMin = sleepStartMin + adjustedDuration;
  const start = formatTime(sleepStartMin);
  const end = formatTime(sleepEndMin);
  const durationHours = Math.round((adjustedDuration / 60) * 10) / 10;
  const crossesMidnight = sleepEndMin > 1440 || sleepStartMin >= 22 * 60;

  // Determine which calendar date the sleep actually starts on
  const date = shiftDate ? computeSleepDate(shiftDate, todayShift) : undefined;

  return { start, end, durationHours, crossesMidnight, date };
}

/**
 * Returns the ISO calendar date on which the recommended sleep START falls.
 * Night / long-night shifts end after midnight so sleep is the following morning.
 * Extended shifts can end 2+ days later.
 */
function computeSleepDate(shiftDate: string, todayShift: ShiftEntry | null): string {
  if (!todayShift || todayShift.type === 'off') return shiftDate;

  if (todayShift.type === 'night' || todayShift.type === 'long_night') {
    // Shift crosses midnight — post-shift sleep is on the next calendar day
    return offsetDate(shiftDate, 1);
  }

  if (todayShift.type === 'extended') {
    const startMin   = parseTime(todayShift.startTime ?? '08:00');
    const durationH  = todayShift.durationHours ?? 36;
    const endMin     = startMin + durationH * 60;
    const daysOver   = Math.floor(endMin / 1440);
    return daysOver > 0 ? offsetDate(shiftDate, daysOver) : shiftDate;
  }

  // morning / afternoon / long_day / custom — sleep is same calendar day (late evening)
  return shiftDate;
}

function deriveSleepStartForOffDay(tomorrowShift: ShiftEntry | null): number {
  if (!tomorrowShift || tomorrowShift.type === 'off') {
    return parseTime('23:00'); // default off-day bedtime
  }
  switch (tomorrowShift.type) {
    case 'morning':
    case 'long_day':
      return parseTime('22:00');
    case 'afternoon':
    case 'long_night':
      return parseTime('00:00'); // stay up a bit later
    case 'night':
      return parseTime('01:00'); // sleep late before night shift
    case 'extended':
      return parseTime('22:00'); // treat like a long day for pre-shift sleep
    default:
      return parseTime('23:00');
  }
}

function deriveSleepStartForShiftDay(shift: ShiftEntry, prepTime: number): number {
  // Extended shifts: sleep begins after the shift ends (could be next day)
  if (shift.type === 'extended') {
    if (shift.startTime && shift.durationHours) {
      const startMin = parseTime(shift.startTime);
      const endMin   = (startMin + shift.durationHours * 60) % 1440;
      return (endMin + prepTime) % 1440;
    }
    return parseTime('08:00'); // fallback: assume morning after a long on-call
  }

  if (!shift.endTime) {
    return parseTime('23:00');
  }
  const shiftEndMin = parseTime(shift.endTime);

  switch (shift.type) {
    case 'morning':
      // Shift ends ~14:00, wind down by ~22:30
      return parseTime('22:30');
    case 'afternoon':
      // Shift ends ~22:00, add commute + wind-down
      return shiftEndMin + prepTime + WIND_DOWN_MINUTES;
    case 'night':
    case 'long_night':
      // Post-night: sleep as soon as home (crosses into next morning)
      return shiftEndMin + prepTime;
    case 'long_day':
      // Shift ends ~19:00, tired — earlier bedtime
      return parseTime('22:00');
    case 'custom':
      return shiftEndMin + prepTime + WIND_DOWN_MINUTES;
    default:
      return parseTime('23:00');
  }
}

// ─── Caffeine Guidance ───────────────────────────────────────────────────────

export function calculateCaffeineGuidance(
  sleepWindow: TimeWindow,
  profile: UserProfile,
  currentTimeHHMM: string,
  strings: RulesStrings,
): CaffeineGuidance {
  const cutoffHours = CAFFEINE_CUTOFF_HOURS[profile.caffeineSensitivity];
  const cutoffMin = parseTime(sleepWindow.start) - cutoffHours * 60;
  const cutoffTime = formatTime(cutoffMin);

  const nowMin = parseTime(currentTimeHHMM);
  const minutesUntilCutoff = ((cutoffMin - nowMin) + 1440) % 1440;

  let maxCups = 3;
  if (profile.caffeineSensitivity === 'high') maxCups = 1;
  if (profile.caffeineSensitivity === 'low') maxCups = 4;

  let currentPhase: CaffeineGuidance['currentPhase'];
  let advice: string;

  if (minutesUntilCutoff <= 0 || isTimePast(currentTimeHHMM, cutoffTime, sleepWindow.start)) {
    currentPhase = 'stop';
    advice = strings.caffeineAdvice.stop(cutoffTime);
  } else if (minutesUntilCutoff <= 60) {
    currentPhase = 'cutoff_approaching';
    advice = strings.caffeineAdvice.approaching(cutoffTime);
  } else if (minutesUntilCutoff <= 120) {
    currentPhase = 'last_cup';
    advice = strings.caffeineAdvice.lastCup(cutoffTime);
  } else {
    currentPhase = 'free';
    advice = strings.caffeineAdvice.free(cutoffTime, maxCups);
  }

  return { cutoffTime, currentPhase, maxCupsToday: maxCups, advice };
}

function isTimePast(now: string, cutoff: string, sleepStart: string): boolean {
  const nowMin = parseTime(now);
  const cutoffMin = parseTime(cutoff);
  const sleepMin = parseTime(sleepStart);
  // Handles cases where cutoff or sleep may be past midnight
  return nowMin >= cutoffMin && nowMin < sleepMin;
}

// ─── Nap Suggestion ──────────────────────────────────────────────────────────

export function calculateNapSuggestion(
  todayShift: ShiftEntry | null,
  tomorrowShift: ShiftEntry | null,
  energyScore: number,
  currentTimeHHMM: string,
  profile: UserProfile,
  strings: RulesStrings,
): NapSuggestion {
  const noNap: NapSuggestion = { recommended: false, startTime: '', durationMinutes: 20, reason: '' };
  const prepTime = profile.prepTimeMinutes ?? 30;

  /**
   * Returns true if a nap of `durationMinutes` starting at `napStartHHMM`
   * would end too close to `nextShiftStartHHMM` (i.e. within prepTime).
   */
  function conflictsWithNextShift(napStartHHMM: string, durationMinutes: number): boolean {
    if (!tomorrowShift?.startTime || tomorrowShift.type === 'off') return false;
    const napEndMin   = parseTime(napStartHHMM) + durationMinutes;
    const shiftDeadline = parseTime(tomorrowShift.startTime) - prepTime;
    return napEndMin > shiftDeadline;
  }

  /** Also check today's shift if we're before it (e.g. pre-shift nap today). */
  function conflictsWithTodayShift(napStartHHMM: string, durationMinutes: number): boolean {
    if (!todayShift?.startTime || todayShift.type === 'off') return false;
    const napEndMin     = parseTime(napStartHHMM) + durationMinutes;
    const shiftDeadline = parseTime(todayShift.startTime) - prepTime;
    return napEndMin > shiftDeadline;
  }

  const nowMin = parseTime(currentTimeHHMM);

  // Dynamic evening cutoff: stop suggesting naps within prepTime + 3h of next shift start
  const eveningCutoffMin = tomorrowShift?.startTime && tomorrowShift.type !== 'off'
    ? parseTime(tomorrowShift.startTime) - prepTime - 3 * 60
    : parseTime('15:30');

  // Post-night shift: recovery nap as soon as home
  if (todayShift && (todayShift.type === 'night' || todayShift.type === 'long_night') && todayShift.endTime) {
    const shiftEndMin = parseTime(todayShift.endTime);
    const napStart    = formatTime(shiftEndMin + prepTime);
    if (!conflictsWithNextShift(napStart, 90)) {
      return {
        recommended: true,
        startTime: napStart,
        durationMinutes: 90,
        reason: strings.napReasons.postNight,
      };
    }
  }

  // Pre-night-shift nap: if next shift is night and nap ends in time
  if (tomorrowShift && (tomorrowShift.type === 'night' || tomorrowShift.type === 'long_night')) {
    if (!conflictsWithNextShift('13:00', 90)) {
      return {
        recommended: true,
        startTime: '13:00',
        durationMinutes: 90,
        reason: strings.napReasons.preNight,
      };
    }
  }

  // Low energy score + early enough in day + nap won't clash with any shift
  if (energyScore <= 35 && nowMin < eveningCutoffMin) {
    const napStart = nowMin < parseTime('13:00') ? '13:00' : currentTimeHHMM;
    if (!conflictsWithNextShift(napStart, 20) && !conflictsWithTodayShift(napStart, 20)) {
      return {
        recommended: true,
        startTime: napStart,
        durationMinutes: 20,
        reason: strings.napReasons.lowEnergy,
      };
    }
  }

  // Off day with tired signals + nap ends in time
  if ((!todayShift || todayShift.type === 'off') && energyScore <= 45 && nowMin < parseTime('14:00')) {
    if (!conflictsWithNextShift('13:00', 30)) {
      return {
        recommended: true,
        startTime: '13:00',
        durationMinutes: 30,
        reason: strings.napReasons.offDay,
      };
    }
  }

  return noNap;
}

// ─── Meal Suggestions ────────────────────────────────────────────────────────

export function calculateMealSuggestions(
  todayShift: ShiftEntry | null,
  _currentTimeHHMM: string,
  strings: RulesStrings,
): MealSuggestion[] {
  if (!todayShift || todayShift.type === 'off') {
    return defaultOffDayMeals(strings);
  }

  const { type, startTime, endTime } = todayShift;

  if (!startTime) return defaultOffDayMeals(strings);

  // Extended shifts: use start + computed end based on durationHours
  if (type === 'extended') {
    const durationH = todayShift.durationHours ?? 36;
    const startMin  = parseTime(startTime);
    const endMin    = (startMin + durationH * 60) % 1440;
    const computedEnd = formatTime(endMin);
    return extendedShiftMeals(startTime, computedEnd, durationH, todayShift.plannedNaps ?? [], strings);
  }

  if (!endTime) return defaultOffDayMeals(strings);

  switch (type) {
    case 'morning':
      return morningShiftMeals(startTime, endTime, strings);
    case 'afternoon':
      return afternoonShiftMeals(startTime, endTime, strings);
    case 'night':
    case 'long_night':
      return nightShiftMeals(startTime, endTime, strings);
    case 'long_day':
      return longDayMeals(startTime, endTime, strings);
    default:
      return customShiftMeals(startTime, endTime, strings);
  }
}

function defaultOffDayMeals(strings: RulesStrings): MealSuggestion[] {
  const m = strings.meals.offDay;
  return [
    { type: 'breakfast',   time: '08:00', label: m[0].label, notes: m[0].notes },
    { type: 'light_snack', time: '11:00', label: m[1].label, notes: m[1].notes },
    { type: 'dinner',      time: '13:00', label: m[2].label, notes: m[2].notes },
    { type: 'light_snack', time: '16:00', label: m[3].label, notes: m[3].notes },
    { type: 'dinner',      time: '19:00', label: m[4].label, notes: m[4].notes },
  ];
}

function morningShiftMeals(start: string, end: string, strings: RulesStrings): MealSuggestion[] {
  const m = strings.meals.morningShift;
  const preShift = subtractMinutes(start, 60);
  const midShift = formatTime((parseTime(start) + parseTime(end)) / 2);
  const postShift = addMinutes(end, 60);
  return [
    { type: 'pre_shift',  time: preShift,  label: m.preShift.label,  notes: m.preShift.notes },
    { type: 'shift_meal', time: midShift,  label: m.midShift.label,  notes: m.midShift.notes },
    { type: 'post_shift', time: postShift, label: m.postShift.label, notes: m.postShift.notes },
    { type: 'dinner',     time: '19:00',   label: m.evening.label,   notes: m.evening.notes },
  ];
}

function afternoonShiftMeals(start: string, end: string, strings: RulesStrings): MealSuggestion[] {
  const m = strings.meals.afternoonShift;
  const preShift = subtractMinutes(start, 90);
  const midShift = formatTime((parseTime(start) + parseTime(end)) / 2);
  const postShift = addMinutes(end, 45);
  return [
    { type: 'breakfast',  time: '08:30',  label: m.breakfast.label, notes: m.breakfast.notes },
    { type: 'pre_shift',  time: preShift, label: m.preShift.label,  notes: m.preShift.notes },
    { type: 'shift_meal', time: midShift, label: m.midShift.label,  notes: m.midShift.notes },
    { type: 'post_shift', time: postShift,label: m.postShift.label, notes: m.postShift.notes },
  ];
}

function nightShiftMeals(start: string, end: string, strings: RulesStrings): MealSuggestion[] {
  const m = strings.meals.nightShift;
  const preShift = subtractMinutes(start, 90);
  const earlyShift = addMinutes(start, 90);
  const lateShift = subtractMinutes(end, 120);
  return [
    { type: 'pre_shift',   time: '18:00',             label: m.preShiftDinner.label, notes: m.preShiftDinner.notes },
    { type: 'pre_shift',   time: preShift,             label: m.preShiftSnack.label,  notes: m.preShiftSnack.notes },
    { type: 'shift_meal',  time: earlyShift,           label: m.earlyShift.label,     notes: m.earlyShift.notes },
    { type: 'light_snack', time: lateShift,            label: m.lateShift.label,      notes: m.lateShift.notes },
    { type: 'post_shift',  time: addMinutes(end, 45),  label: m.postShift.label,      notes: m.postShift.notes },
  ];
}

function longDayMeals(start: string, end: string, strings: RulesStrings): MealSuggestion[] {
  const m = strings.meals.longDay;
  const preShift = subtractMinutes(start, 60);
  const midShift = formatTime((parseTime(start) + parseTime(end)) / 2);
  const lateShift = subtractMinutes(end, 120);
  return [
    { type: 'pre_shift',  time: preShift,             label: m.preShift.label,  notes: m.preShift.notes },
    { type: 'shift_meal', time: midShift,              label: m.midShift.label,  notes: m.midShift.notes },
    { type: 'shift_meal', time: lateShift,             label: m.lateShift.label, notes: m.lateShift.notes },
    { type: 'post_shift', time: addMinutes(end, 60),   label: m.postShift.label, notes: m.postShift.notes },
  ];
}

function extendedShiftMeals(
  start: string,
  _end: string,
  durationH: number,
  plannedNaps: PlannedNap[],
  strings: RulesStrings,
): MealSuggestion[] {
  const m = strings.meals.extendedShift;
  const startMin = parseTime(start);
  const quarter  = formatTime((startMin + (durationH / 4) * 60) % 1440);
  const midpoint = formatTime((startMin + (durationH / 2) * 60) % 1440);
  const threeQ   = formatTime((startMin + (durationH * 0.75) * 60) % 1440);

  const meals: MealSuggestion[] = [
    { type: 'pre_shift',   time: subtractMinutes(start, 60), label: m.preShift.label,   notes: m.preShift.notes },
    { type: 'shift_meal',  time: quarter,                    label: m.earlyShift.label, notes: m.earlyShift.notes },
    { type: 'shift_meal',  time: midpoint,                   label: m.midShift.label,   notes: m.midShift.notes },
    { type: 'light_snack', time: threeQ,                     label: m.lateShift.label,  notes: m.lateShift.notes },
  ];

  // Add a light snack after each planned nap (if any)
  for (const nap of plannedNaps) {
    const postNap = addMinutes(nap.startTime, nap.durationMinutes + 15);
    meals.push({
      type: 'light_snack', time: postNap,
      label: m.postNap.label,
      notes: m.postNap.notes,
    });
  }

  return meals.sort((a, b) => {
    const ta = parseTime(a.time);
    const tb = parseTime(b.time);
    return ta - tb;
  });
}

function customShiftMeals(start: string, end: string, strings: RulesStrings): MealSuggestion[] {
  const m = strings.meals.customShift;
  const preShift = subtractMinutes(start, 60);
  const midShift = formatTime((parseTime(start) + parseTime(end)) / 2);
  const postShift = addMinutes(end, 60);
  return [
    { type: 'pre_shift',  time: preShift,  label: m.preShift.label,  notes: m.preShift.notes },
    { type: 'shift_meal', time: midShift,  label: m.midShift.label,  notes: m.midShift.notes },
    { type: 'post_shift', time: postShift, label: m.postShift.label, notes: m.postShift.notes },
  ];
}

// ─── Recovery Tips ────────────────────────────────────────────────────────────

export function generateRecoveryTips(
  todayShift: ShiftEntry | null,
  tomorrowShift: ShiftEntry | null,
  energyScore: number,
  profile: UserProfile,
  strings: RulesStrings,
): string[] {
  const tips: string[] = [];
  const r = strings.recoveryTips;

  if (!todayShift || todayShift.type === 'off') {
    tips.push(...randomPick(r.off_day, 2));
  } else if (todayShift.type === 'night' || todayShift.type === 'long_night') {
    tips.push(...randomPick(r.night_shift, 2));
    if (tomorrowShift && tomorrowShift.type !== 'night' && tomorrowShift.type !== 'long_night') {
      tips.push(randomPick(r.post_night_transition, 1)[0]);
    }
  } else if (todayShift.type === 'morning') {
    tips.push(...randomPick(r.morning_shift, 2));
  } else if (todayShift.type === 'afternoon') {
    tips.push(...randomPick(r.afternoon_shift, 2));
  } else if (todayShift.type === 'long_day' || todayShift.type === 'extended') {
    tips.push(...randomPick(r.long_shift, 2));
    if (todayShift.type === 'extended' && todayShift.plannedNaps && todayShift.plannedNaps.length > 0) {
      tips.push(r.extendedNapTip);
    }
  }

  if (energyScore <= 30) {
    tips.push(randomPick(r.high_fatigue, 1)[0]);
  }

  if (profile.shiftPattern === 'rotating') {
    tips.push(randomPick(r.rotating_shifts, 1)[0]);
  }

  // Deduplicate and cap at 3 tips for readability
  return [...new Set(tips)].slice(0, 3);
}

// ─── Energy Score ─────────────────────────────────────────────────────────────

export function calculateEnergyScore(recentCheckIns: DailyCheckIn[]): number {
  if (recentCheckIns.length === 0) return 65; // neutral default

  // Weight recent check-ins more heavily (exponential decay)
  const sorted = [...recentCheckIns].sort((a, b) => b.date.localeCompare(a.date));
  const latest = sorted.slice(0, 7);

  let weightedSum = 0;
  let totalWeight = 0;

  latest.forEach((c, i) => {
    const weight = Math.pow(0.75, i); // recent = higher weight
    // Invert fatigue and stress (higher fatigue = lower score)
    const score =
      ((6 - c.fatigue) + (6 - c.stress) + c.sleepQuality + c.alertness) / 4;
    weightedSum += score * weight * 25; // scale 1–5 → 25–100
    totalWeight += weight;
  });

  return Math.round(Math.min(100, Math.max(0, weightedSum / totalWeight)));
}

export function energyScoreToReadiness(score: number): ReadinessLevel {
  if (score >= 65) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

// ─── Explanation Summary ─────────────────────────────────────────────────────

export function generateExplanationSummary(
  todayShift: ShiftEntry | null,
  tomorrowShift: ShiftEntry | null,
  sleepWindow: TimeWindow | null,
  energyScore: number,
  strings: RulesStrings,
  totalShiftCount = 1,
): string {
  if (!todayShift || todayShift.type === 'off') {
    if (tomorrowShift && tomorrowShift.type !== 'off') {
      const label = strings.shiftLabels[tomorrowShift.type] ?? tomorrowShift.type;
      return strings.explanation.restDayBefore(label);
    }
    return strings.explanation.fullRestDay;
  }

  const shiftLabel = strings.shiftLabels[todayShift.type] ?? todayShift.type;
  const sleepNote  = sleepWindow ? strings.explanation.sleepAround(sleepWindow.start) : '';
  const energyNote = energyScore <= 35 ? strings.explanation.lowEnergyNote : '';

  // Multiple shifts on one day
  if (totalShiftCount > 1) {
    const dur = todayShift.durationHours ?? 0;
    const durNote = dur > 0 ? strings.explanation.durationNote(dur) : '';
    return strings.explanation.multipleShifts(totalShiftCount, shiftLabel, durNote, sleepNote, energyNote);
  }

  if (todayShift.type === 'night' || todayShift.type === 'long_night') {
    return strings.explanation.nightShiftDay(sleepNote, energyNote);
  }

  const timeRange = (todayShift.startTime && todayShift.endTime)
    ? ` ${todayShift.startTime}–${todayShift.endTime}`
    : '';
  return strings.explanation.regularShiftDay(shiftLabel, timeRange, sleepNote, energyNote);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomPick<T>(arr: T[], n: number): T[] {
  // Deterministic-ish: seed on current date to keep consistent within a day
  const today = new Date().toISOString().split('T')[0];
  const seed = today.split('-').reduce((acc, v) => acc + parseInt(v), 0);
  const shuffled = [...arr].sort((a, b) => {
    const ha = simpleHash(String(a) + seed);
    const hb = simpleHash(String(b) + seed);
    return ha - hb;
  });
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
