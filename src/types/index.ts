// ─── Shift Domain ────────────────────────────────────────────────────────────

export type ShiftType =
  | 'morning'      // ~06:00–14:00
  | 'afternoon'    // ~14:00–22:00
  | 'night'        // ~22:00–06:00
  | 'long_day'     // ~07:00–19:00
  | 'long_night'   // ~19:00–07:00
  | 'extended'     // continuous shift ≥ 24 h (e.g. 36-hour on-call)
  | 'off'          // rest day
  | 'custom';      // user-defined hours

/** A planned rest/sleep window embedded inside an extended shift. */
export interface PlannedNap {
  id: string;
  startTime: string;                          // "04:00"
  durationMinutes: 20 | 30 | 60 | 90 | 120;
  type: 'power_nap' | 'recovery_sleep';
}

export interface ShiftEntry {
  id: string;
  date: string;               // ISO date: "2025-01-15"
  type: ShiftType;
  startTime: string | null;   // "06:00"
  endTime: string | null;     // "14:00"  (may be null for extended — use durationHours)
  /** Total hours for extended shifts (can exceed 24). Overrides endTime for duration calc. */
  durationHours?: number;
  /** Rest windows planned inside an extended shift. */
  plannedNaps?: PlannedNap[];
  notes?: string;
}

export type ShiftPattern =
  | 'rotating'       // cycles between morning/afternoon/night
  | 'fixed_nights'   // permanent nights
  | 'fixed_days'     // permanent days
  | 'fixed_afternoons'
  | 'irregular'      // no predictable pattern
  | 'split';         // split shifts

// ─── User Domain ─────────────────────────────────────────────────────────────

export type WorkRole =
  | 'nurse'
  | 'doctor'
  | 'paramedic'
  | 'factory_worker'
  | 'retail'
  | 'security'
  | 'driver'
  | 'hospitality'
  | 'warehouse'
  | 'other';

export type SleepDifficulty = 'easy' | 'moderate' | 'hard';

export type CaffeineSensitivity = 'low' | 'medium' | 'high';

export type Goal =
  | 'better_sleep'
  | 'less_fatigue'
  | 'shift_recovery'
  | 'stable_routine';

export type NotificationFrequency = 'minimal' | 'moderate' | 'full' | 'off';

export interface NotificationPreference {
  enabled: boolean;
  frequency: NotificationFrequency;
  sleepReminder: boolean;
  caffeineReminder: boolean;
  napReminder: boolean;
  shiftReminder: boolean;
  checkInReminder: boolean;
}

/** Per-shift-type overrides for the default start/end times. */
export type ShiftTimeDefaults = Partial<Record<ShiftType, { startTime: string; endTime: string }>>;

export interface UserProfile {
  id: string;
  name?: string;
  role: WorkRole;
  shiftPattern: ShiftPattern;
  sleepDifficulty: SleepDifficulty;
  caffeineSensitivity: CaffeineSensitivity;
  targetSleepHours: number;   // 6–9
  goals: Goal[];
  notifications: NotificationPreference;
  onboardingComplete: boolean;
  /** User-customised default times for each predefined shift type. */
  shiftTimeDefaults?: ShiftTimeDefaults;
  /** Whether the "Extended shift" option is shown in the schedule editor. */
  extendedShiftsEnabled?: boolean;
  /**
   * Minutes needed before a shift to prepare (commute, getting ready, etc.).
   * Used to guard sleep/nap windows so they end in time.
   * Default: 30.
   */
  prepTimeMinutes?: number;
  /** User's preferred time display format. Defaults to '24h'. */
  timeFormat?: '12h' | '24h';
  createdAt: string;
  updatedAt: string;
}

// ─── Plan Domain ─────────────────────────────────────────────────────────────

export interface TimeWindow {
  start: string;         // "07:30"
  end: string;           // "15:30"
  durationHours: number;
  crossesMidnight: boolean;
  /** ISO date the sleep window START falls on. May differ from the plan date
   *  (e.g. post-night shift sleep is on the following calendar day). */
  date?: string;
}

export interface NapSuggestion {
  recommended: boolean;
  startTime: string;   // "13:00"
  durationMinutes: 20 | 30 | 60 | 90;
  reason: string;
}

export type CaffeinePhase = 'free' | 'last_cup' | 'cutoff_approaching' | 'stop';

export interface CaffeineGuidance {
  cutoffTime: string;     // "15:30"
  currentPhase: CaffeinePhase;
  maxCupsToday: number;
  advice: string;
}

export type MealType = 'breakfast' | 'pre_shift' | 'shift_meal' | 'post_shift' | 'light_snack' | 'dinner';

export interface MealSuggestion {
  type: MealType;
  time: string;           // "06:30"
  label: string;
  notes: string;
}

export type ReadinessLevel = 'low' | 'medium' | 'high';

export interface DailyPlan {
  date: string;
  shift: ShiftEntry | null;
  nextShift: ShiftEntry | null;
  sleepWindow: TimeWindow | null;
  napSuggestion: NapSuggestion | null;
  caffeineGuidance: CaffeineGuidance;
  mealSuggestions: MealSuggestion[];
  recoveryTips: string[];
  explanationSummary: string;
  energyScore: number;       // 0–100
  readinessLevel: ReadinessLevel;
  generatedAt: string;
}

// ─── Check-In Domain ─────────────────────────────────────────────────────────

export type CheckInRating = 1 | 2 | 3 | 4 | 5;

export interface DailyCheckIn {
  id: string;
  date: string;
  fatigue: CheckInRating;
  sleepQuality: CheckInRating;
  stress: CheckInRating;
  alertness: CheckInRating;
  notes?: string;
  createdAt: string;
}

// ─── Premium Domain ──────────────────────────────────────────────────────────

export type PremiumTier = 'free' | 'premium';

export interface PremiumState {
  tier: PremiumTier;
  isPremium: boolean;
  expiresAt?: string;
  purchasedAt?: string;
}

export interface PremiumFeature {
  id: string;
  label: string;
  description: string;
  tier: PremiumTier;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, string | number | boolean>;
  timestamp?: string;
}

// ─── AI Service ──────────────────────────────────────────────────────────────

export interface AIExplanationRequest {
  plan: DailyPlan;
  profile: UserProfile;
  checkIn?: DailyCheckIn;
}

export interface AIExplanationResponse {
  summary: string;
  tips: string[];
  generated: boolean;
}

// ─── UI Helpers ──────────────────────────────────────────────────────────────

export interface SelectOption<T = string> {
  label: string;
  value: T;
  description?: string;
  icon?: string;
}
