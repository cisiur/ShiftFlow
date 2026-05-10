import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, CHECK_IN_HISTORY_DAYS } from '@/constants/config';
import type { DailyCheckIn, CheckInRating } from '@/types';
import { nanoid } from '@/domain/schedule/nanoid';
import { todayISO, offsetDate } from '@/utils/time';

interface CheckInState {
  checkIns: DailyCheckIn[];
  isLoaded: boolean;

  // Queries
  getTodayCheckIn(): DailyCheckIn | null;
  getRecentCheckIns(days?: number): DailyCheckIn[];
  hasCheckedInToday(): boolean;

  // Mutations
  submitCheckIn(data: {
    fatigue: CheckInRating;
    sleepQuality: CheckInRating;
    stress: CheckInRating;
    alertness: CheckInRating;
    notes?: string;
  }): void;
  reset(): void;
}

export const useCheckInStore = create<CheckInState>()(
  persist(
    (set, get) => ({
      checkIns: [],
      isLoaded: false,

      getTodayCheckIn() {
        const today = todayISO();
        return get().checkIns.find(c => c.date === today) ?? null;
      },

      getRecentCheckIns(days = CHECK_IN_HISTORY_DAYS) {
        const cutoff = offsetDate(todayISO(), -days);
        return get().checkIns
          .filter(c => c.date >= cutoff)
          .sort((a, b) => b.date.localeCompare(a.date));
      },

      hasCheckedInToday() {
        return get().getTodayCheckIn() !== null;
      },

      submitCheckIn({ fatigue, sleepQuality, stress, alertness, notes }) {
        const today = todayISO();
        const existing = get().checkIns.find(c => c.date === today);
        const entry: DailyCheckIn = {
          id: existing?.id ?? nanoid(),
          date: today,
          fatigue,
          sleepQuality,
          stress,
          alertness,
          notes,
          createdAt: new Date().toISOString(),
        };

        set(state => {
          const others = state.checkIns.filter(c => c.date !== today);
          // Trim to 90 days of history
          const trimmed = [...others, entry]
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 90);
          return { checkIns: trimmed };
        });
      },

      reset() {
        set({ checkIns: [] });
      },
    }),
    {
      name: STORAGE_KEYS.CHECK_INS,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.isLoaded = true;
      },
    },
  ),
);
