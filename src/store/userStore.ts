import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/config';
import type { UserProfile, WorkRole, ShiftPattern, SleepDifficulty, CaffeineSensitivity, Goal, NotificationPreference } from '@/types';
import { nanoid } from '@/domain/schedule/nanoid';

const DEFAULT_NOTIFICATIONS: NotificationPreference = {
  enabled: true,
  frequency: 'moderate',
  sleepReminder: true,
  caffeineReminder: true,
  napReminder: true,
  shiftReminder: true,
  checkInReminder: true,
};

interface UserState {
  profile: UserProfile | null;
  isLoaded: boolean;

  // Actions
  setProfile(profile: UserProfile): void;
  updateProfile(updates: Partial<UserProfile>): void;
  initProfile(partial: Partial<UserProfile>): void;
  completeOnboarding(): void;
  reset(): void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      isLoaded: false,

      setProfile(profile) {
        set({ profile });
      },

      updateProfile(updates) {
        const current = get().profile;
        if (!current) return;
        set({ profile: { ...current, ...updates, updatedAt: new Date().toISOString() } });
      },

      initProfile(partial) {
        const now = new Date().toISOString();
        const profile: UserProfile = {
          id: nanoid(12),
          role: 'other',
          shiftPattern: 'rotating',
          sleepDifficulty: 'moderate',
          caffeineSensitivity: 'medium',
          targetSleepHours: 8,
          goals: ['better_sleep'],
          notifications: DEFAULT_NOTIFICATIONS,
          prepTimeMinutes: 30,
          timeFormat: '24h',
          onboardingComplete: false,
          createdAt: now,
          updatedAt: now,
          ...partial,
        };
        set({ profile });
      },

      completeOnboarding() {
        const current = get().profile;
        if (!current) return;
        set({ profile: { ...current, onboardingComplete: true, updatedAt: new Date().toISOString() } });
      },

      reset() {
        set({ profile: null });
      },
    }),
    {
      name: STORAGE_KEYS.USER_PROFILE,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.isLoaded = true;
      },
    },
  ),
);
