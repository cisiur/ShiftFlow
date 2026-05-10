import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

// Expo SDK 49+ supports process.env.EXPO_PUBLIC_* embedded at build time.
// Fall back to Constants.expoConfig.extra for EAS Build / OTA updates.
function env(key: string): string | undefined {
  // @ts-ignore — process.env is available via Metro bundler
  return (process.env[key] as string | undefined) || (extra[key] as string | undefined);
}

export const Config = {
  aiProvider:            env('EXPO_PUBLIC_AI_PROVIDER')            ?? 'mock',
  analyticsProvider:     env('EXPO_PUBLIC_ANALYTICS_PROVIDER')     ?? 'mock',
  enableAIExplanations:  env('EXPO_PUBLIC_ENABLE_AI_EXPLANATIONS') === 'true',
  enableScheduleOCR:     env('EXPO_PUBLIC_ENABLE_SCHEDULE_OCR')    === 'true',
  appEnv:                env('EXPO_PUBLIC_APP_ENV')                ?? 'development',
  anthropicApiKey:       env('EXPO_PUBLIC_ANTHROPIC_API_KEY'),
  revenueCatApiKey:      env('EXPO_PUBLIC_REVENUECAT_API_KEY'),
  isDev: __DEV__,
} as const;

export const PREMIUM_FEATURES = {
  AI_EXPLANATIONS: 'ai_explanations',
  ADAPTIVE_PLANS: 'adaptive_plans',
  SCHEDULE_IMPORT: 'schedule_import',
  TREND_INSIGHTS: 'trend_insights',
  ADVANCED_REMINDERS: 'advanced_reminders',
} as const;

export const FREE_FEATURES = {
  MANUAL_SCHEDULE: 'manual_schedule',
  TODAY_VIEW: 'today_view',
  BASIC_WEEKLY_PLAN: 'basic_weekly_plan',
  BASIC_REMINDERS: 'basic_reminders',
  CHECK_IN: 'check_in',
} as const;

export const STORAGE_KEYS = {
  USER_PROFILE: '@shiftflow/user_profile',
  SCHEDULE: '@shiftflow/schedule',
  CHECK_INS: '@shiftflow/check_ins',
  PREMIUM: '@shiftflow/premium',
  PLAN_CACHE: '@shiftflow/plan_cache',
  ONBOARDING_COMPLETE: '@shiftflow/onboarding_complete',
} as const;

export const PLAN_CACHE_TTL_HOURS = 4;

export const CHECK_IN_HISTORY_DAYS = 14;

export const MAX_SCHEDULE_WEEKS = 4;
