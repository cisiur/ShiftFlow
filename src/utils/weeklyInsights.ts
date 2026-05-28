/**
 * Deterministic weekly insights computed from the last 7 days of check-ins.
 * Uses only confirmed DailyCheckIn fields: alertness, sleepQuality, fatigue, stress.
 * No backend, no LLM — fully deterministic.
 */

import { subDays } from 'date-fns';
import { toDateKey } from './streak';
import type { DailyCheckIn } from '@/types';

export type Trend = 'improving' | 'stable' | 'declining';

/** All insight strings are keyed so the UI resolves them via i18n. */
export type InsightKey =
  | 'consistent'
  | 'improveSleep'
  | 'highAlertness'
  | 'trending_up'
  | 'rest_needed';

export interface WeeklyInsightsData {
  /** Average alertness (1–5) over the last 7 days with a check-in. */
  avgAlertness: number;
  /** Average sleep quality (1–5) over the last 7 days with a check-in. */
  avgSleepQuality: number;
  /** How many check-ins exist in the last 7 calendar days. */
  checkInsCount: number;
  /** Direction of alertness: compare last 3 days vs days 4–7. */
  trend: Trend;
  /** Deterministic key for a contextual one-line insight string. */
  insightKey: InsightKey;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Returns the last N calendar-day keys, index 0 = today. */
function lastNDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => toDateKey(subDays(new Date(), i)));
}

export function getWeeklyInsights(checkIns: DailyCheckIn[]): WeeklyInsightsData {
  const last7  = lastNDays(7);
  const byDate = new Map(checkIns.map(c => [c.date, c]));

  const getEntries = (keys: string[]) =>
    keys.map(d => byDate.get(d)).filter((c): c is DailyCheckIn => c !== undefined);

  const all7   = getEntries(last7);
  const last3  = getEntries(last7.slice(0, 3));  // today, yesterday, day-2
  const days47 = getEntries(last7.slice(3, 7));  // days 3–6

  const avgAlertness    = round1(average(all7.map(c => c.alertness)));
  const avgSleepQuality = round1(average(all7.map(c => c.sleepQuality)));
  const checkInsCount   = all7.length;

  // Trend: compare alertness over last 3 vs days 4–7
  let trend: Trend = 'stable';
  if (last3.length > 0 && days47.length > 0) {
    const avg3  = average(last3.map(c => c.alertness));
    const avg47 = average(days47.map(c => c.alertness));
    if (avg3 - avg47 > 0.5)  trend = 'improving';
    else if (avg47 - avg3 > 0.5) trend = 'declining';
  }

  // Pick a single deterministic insight
  let insightKey: InsightKey = 'consistent';
  if (avgSleepQuality > 0 && avgSleepQuality < 2.5)   insightKey = 'improveSleep';
  else if (avgAlertness >= 4)                          insightKey = 'highAlertness';
  else if (trend === 'improving')                      insightKey = 'trending_up';
  else if (trend === 'declining')                      insightKey = 'rest_needed';

  return { avgAlertness, avgSleepQuality, checkInsCount, trend, insightKey };
}
