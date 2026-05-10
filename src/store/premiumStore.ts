import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, PREMIUM_FEATURES } from '@/constants/config';
import type { PremiumState, PremiumTier } from '@/types';

interface PremiumStoreState {
  premium: PremiumState;
  isLoaded: boolean;

  isPremium(): boolean;
  canAccess(feature: string): boolean;

  // Mocked purchase flow — replace with real IAP later
  activatePremium(tier?: PremiumTier): void;
  deactivatePremium(): void;
  reset(): void;
}

const FREE_STATE: PremiumState = {
  tier: 'free',
  isPremium: false,
};

// Features accessible on the free tier
const FREE_ACCESS = new Set([
  'manual_schedule',
  'today_view',
  'basic_weekly_plan',
  'basic_reminders',
  'check_in',
]);

export const usePremiumStore = create<PremiumStoreState>()(
  persist(
    (set, get) => ({
      premium: FREE_STATE,
      isLoaded: false,

      isPremium() {
        return get().premium.isPremium;
      },

      canAccess(feature: string) {
        if (get().premium.isPremium) return true;
        return FREE_ACCESS.has(feature);
      },

      activatePremium(tier = 'premium') {
        set({
          premium: {
            tier,
            isPremium: true,
            purchasedAt: new Date().toISOString(),
          },
        });
      },

      deactivatePremium() {
        set({ premium: FREE_STATE });
      },

      reset() {
        set({ premium: FREE_STATE });
      },
    }),
    {
      name: STORAGE_KEYS.PREMIUM,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.isLoaded = true;
      },
    },
  ),
);
