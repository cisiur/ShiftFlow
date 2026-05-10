/**
 * Notifications service — wraps expo-notifications.
 *
 * expo-notifications removed Android remote push from Expo Go in SDK 53.
 * To stay compatible with Expo Go (for development) we:
 *   1. Detect Expo Go via Constants.appOwnership
 *   2. Never call setNotificationHandler at module level (Expo Router imports
 *      every route module at start-up; top-level side-effects crash the app)
 *   3. Wrap every API call in try/catch so a permissions denial or a missing
 *      native module never crashes the JS thread
 */

import * as Device from 'expo-device';
import Constants from 'expo-constants';
import type { DailyPlan, NotificationPreference } from '@/types';

// ─── Environment detection ────────────────────────────────────────────────────

/** True when running inside Expo Go (SDK 53+ has no remote push there). */
const IS_EXPO_GO: boolean = Constants.appOwnership === 'expo';

// ─── Lazy initialiser ────────────────────────────────────────────────────────

let _handlerSet = false;

function ensureHandler(): void {
  if (_handlerSet || IS_EXPO_GO) return;
  try {
    // Dynamic require keeps this off the critical module-load path
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const N = require('expo-notifications') as typeof import('expo-notifications');
    N.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    _handlerSet = true;
  } catch {
    // Silently ignore — local notifications are best-effort
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function requestNotificationPermissions(): Promise<boolean> {
  if (IS_EXPO_GO || !Device.isDevice) return false;
  ensureHandler();
  try {
    const N = require('expo-notifications') as typeof import('expo-notifications');
    const { status: existing } = await N.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await N.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function schedulePlanNotifications(
  plan: DailyPlan,
  prefs: NotificationPreference,
): Promise<void> {
  if (!prefs.enabled || IS_EXPO_GO || !Device.isDevice) return;
  ensureHandler();

  try {
    const N = require('expo-notifications') as typeof import('expo-notifications');
    await N.cancelAllScheduledNotificationsAsync();

    const baseDate = new Date(plan.date + 'T00:00:00');
    const jobs: Promise<string>[] = [];

    if (prefs.caffeineReminder) {
      const [h, m] = plan.caffeineGuidance.cutoffTime.split(':').map(Number);
      const trigger = new Date(baseDate);
      trigger.setHours(h, m - 15, 0, 0);
      if (trigger > new Date()) {
        jobs.push(
          N.scheduleNotificationAsync({
            content: {
              title: 'Caffeine cutoff soon',
              body: `Last call — cutoff in 15 min at ${plan.caffeineGuidance.cutoffTime}.`,
              data: { type: 'caffeine_cutoff' },
            },
            trigger: { date: trigger },
          }),
        );
      }
    }

    if (prefs.sleepReminder && plan.sleepWindow) {
      const [h, m] = plan.sleepWindow.start.split(':').map(Number);
      const trigger = new Date(baseDate);
      trigger.setHours(h, m - 30, 0, 0);
      if (h < 6) trigger.setDate(trigger.getDate() + 1);
      if (trigger > new Date()) {
        jobs.push(
          N.scheduleNotificationAsync({
            content: {
              title: 'Wind down time',
              body: `Your sleep window starts at ${plan.sleepWindow.start}. Time to wind down.`,
              data: { type: 'sleep_reminder' },
            },
            trigger: { date: trigger },
          }),
        );
      }
    }

    if (prefs.napReminder && plan.napSuggestion?.recommended) {
      const [h, m] = plan.napSuggestion.startTime.split(':').map(Number);
      const trigger = new Date(baseDate);
      trigger.setHours(h, m, 0, 0);
      if (trigger > new Date()) {
        jobs.push(
          N.scheduleNotificationAsync({
            content: {
              title: 'Nap window open',
              body: `${plan.napSuggestion.durationMinutes}-min nap recommended now. ${plan.napSuggestion.reason.split('.')[0]}.`,
              data: { type: 'nap_reminder' },
            },
            trigger: { date: trigger },
          }),
        );
      }
    }

    if (prefs.checkInReminder) {
      const trigger = new Date(baseDate);
      trigger.setHours(20, 0, 0, 0);
      if (trigger > new Date()) {
        jobs.push(
          N.scheduleNotificationAsync({
            content: {
              title: 'Quick check-in',
              body: 'How are you feeling today? 30 seconds to log your energy.',
              data: { type: 'check_in' },
            },
            trigger: { date: trigger },
          }),
        );
      }
    }

    await Promise.allSettled(jobs);
  } catch {
    // Silently ignore — notifications are best-effort
  }
}

export async function cancelAllNotifications(): Promise<void> {
  if (IS_EXPO_GO || !Device.isDevice) return;
  try {
    const N = require('expo-notifications') as typeof import('expo-notifications');
    await N.cancelAllScheduledNotificationsAsync();
  } catch {
    // Silently ignore
  }
}
