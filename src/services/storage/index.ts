import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/config';
import type { UserProfile, ShiftEntry, DailyCheckIn, PremiumState, DailyPlan } from '@/types';

// Thin wrapper around AsyncStorage with typed read/write helpers.
// Swap this out for a cloud backend later without changing callers.

async function get<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function set(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

async function remove(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

async function clearAll(): Promise<void> {
  const keys = Object.values(STORAGE_KEYS);
  await AsyncStorage.multiRemove(keys);
}

// ─── Typed helpers ────────────────────────────────────────────────────────────

export const StorageService = {
  // User Profile
  async getUserProfile(): Promise<UserProfile | null> {
    return get<UserProfile>(STORAGE_KEYS.USER_PROFILE);
  },
  async saveUserProfile(profile: UserProfile): Promise<void> {
    await set(STORAGE_KEYS.USER_PROFILE, profile);
  },

  // Schedule
  async getSchedule(): Promise<ShiftEntry[]> {
    return (await get<ShiftEntry[]>(STORAGE_KEYS.SCHEDULE)) ?? [];
  },
  async saveSchedule(shifts: ShiftEntry[]): Promise<void> {
    await set(STORAGE_KEYS.SCHEDULE, shifts);
  },

  // Check-ins
  async getCheckIns(): Promise<DailyCheckIn[]> {
    return (await get<DailyCheckIn[]>(STORAGE_KEYS.CHECK_INS)) ?? [];
  },
  async saveCheckIns(checkIns: DailyCheckIn[]): Promise<void> {
    await set(STORAGE_KEYS.CHECK_INS, checkIns);
  },

  // Premium
  async getPremium(): Promise<PremiumState | null> {
    return get<PremiumState>(STORAGE_KEYS.PREMIUM);
  },
  async savePremium(premium: PremiumState): Promise<void> {
    await set(STORAGE_KEYS.PREMIUM, premium);
  },

  // Plan cache (avoid re-running expensive engine on every render)
  async getPlanCache(): Promise<{ date: string; plan: DailyPlan } | null> {
    return get(STORAGE_KEYS.PLAN_CACHE);
  },
  async savePlanCache(date: string, plan: DailyPlan): Promise<void> {
    await set(STORAGE_KEYS.PLAN_CACHE, { date, plan });
  },

  // Wipe everything (used in Settings > Reset data)
  clearAll,
};
