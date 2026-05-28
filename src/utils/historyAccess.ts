/**
 * Free-tier history access control.
 * Free users see only the last 14 days. Data is NEVER deleted.
 * Pro users see everything.
 */

import { format, subDays } from 'date-fns';
import type { DailyCheckIn } from '@/types';

export const HISTORY_LIMIT_DAYS = 14;

/** The oldest date a free user may access (inclusive). */
function freeCutoffDate(): string {
  return format(subDays(new Date(), HISTORY_LIMIT_DAYS), 'yyyy-MM-dd');
}

/** Returns the subset of check-ins accessible to the user. Never mutates the array. */
export function getVisibleCheckIns(checkIns: DailyCheckIn[], isPro: boolean): DailyCheckIn[] {
  if (isPro) return checkIns;
  const cutoff = freeCutoffDate();
  return checkIns.filter(c => c.date >= cutoff);
}

/** Returns how many check-ins are hidden from a free user. Always 0 for Pro. */
export function getLockedHistoryCount(checkIns: DailyCheckIn[], isPro: boolean): number {
  if (isPro) return 0;
  const cutoff = freeCutoffDate();
  return checkIns.filter(c => c.date < cutoff).length;
}

/** Returns whether the user can access a specific calendar-day entry. */
export function canAccessCheckInDate(dateStr: string, isPro: boolean): boolean {
  if (isPro) return true;
  return dateStr >= freeCutoffDate();
}
