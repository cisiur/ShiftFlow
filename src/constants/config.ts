import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

// Metro inlines process.env.EXPO_PUBLIC_* ONLY with literal dot-notation access.
// Dynamic bracket access (process.env[key]) is NOT replaced at build time.
// Always use literal property names here.
export const Config = {
  // @ts-ignore
  aiProvider:           (process.env.EXPO_PUBLIC_AI_PROVIDER           as string | undefined) ?? (extra.EXPO_PUBLIC_AI_PROVIDER           as string | undefined) ?? 'mock',
  // @ts-ignore
  analyticsProvider:    (process.env.EXPO_PUBLIC_ANALYTICS_PROVIDER    as string | undefined) ?? (extra.EXPO_PUBLIC_ANALYTICS_PROVIDER    as string | undefined) ?? 'mock',
  // @ts-ignore
  enableAIExplanations: (process.env.EXPO_PUBLIC_ENABLE_AI_EXPLANATIONS as string | undefined) === 'true',
  // @ts-ignore
  enableScheduleOCR:    (process.env.EXPO_PUBLIC_ENABLE_SCHEDULE_OCR   as string | undefined) === 'true',
  // @ts-ignore
  appEnv:               (process.env.EXPO_PUBLIC_APP_ENV               as string | undefined) ?? (extra.EXPO_PUBLIC_APP_ENV               as string | undefined) ?? 'development',
  // @ts-ignore
  anthropicApiKey:      (process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY     as string | undefined) ?? (extra.EXPO_PUBLIC_ANTHROPIC_API_KEY     as string | undefined),
  // @ts-ignore
  revenueCatApiKey:     (process.env.EXPO_PUBLIC_REVENUECAT_API_KEY    as string | undefined) ?? (extra.EXPO_PUBLIC_REVENUECAT_API_KEY    as string | undefined),
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
