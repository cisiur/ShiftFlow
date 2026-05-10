import { useEffect, useCallback } from 'react';
import { usePlanStore } from '@/store/planStore';
import { useUserStore } from '@/store/userStore';
import { useScheduleStore } from '@/store/scheduleStore';
import { useLanguageStore } from '@/store/languageStore';
import { todayISO } from '@/utils/time';
import { Analytics } from '@/services/analytics';

export function useTodayPlan() {
  const { todayPlan, isGenerating, error, generateToday, lastGeneratedDate } = usePlanStore();
  const profile = useUserStore(s => s.profile);
  const scheduleLastUpdated = useScheduleStore(s => s.lastUpdatedAt);
  // Wait for AsyncStorage rehydration before generating — without this, the store
  // returns empty shifts on first render and the plan is stale until the next trigger.
  const scheduleIsLoaded = useScheduleStore(s => s.isLoaded);
  // The plan bakes translated strings at generation time (meal labels, nap reasons,
  // recovery tips). Regenerate whenever the language changes so text is always in
  // the user's current language.
  const language = useLanguageStore(s => s.language);

  const refresh = useCallback(() => {
    if (!profile?.onboardingComplete) return null;
    const plan = generateToday();
    if (plan) {
      Analytics.planGenerated(plan.shift?.type ?? 'off', plan.energyScore);
    }
    return plan;
  }, [profile, generateToday]);

  // Generate plan once the schedule store is rehydrated (or if already loaded on mount).
  // scheduleIsLoaded goes false → true after AsyncStorage hydration, triggering a fresh
  // plan with the real shift data instead of the empty-store snapshot.
  useEffect(() => {
    if (!profile?.onboardingComplete || !scheduleIsLoaded) return;
    const today = todayISO();
    if (lastGeneratedDate !== today || !todayPlan) {
      refresh();
    }
  }, [profile?.onboardingComplete, lastGeneratedDate, scheduleIsLoaded]);

  // Regenerate whenever the user modifies their schedule (store is already loaded here)
  useEffect(() => {
    if (!profile?.onboardingComplete || !scheduleIsLoaded) return;
    refresh();
  }, [scheduleLastUpdated]);

  // Regenerate when language changes — strings (meals, nap reasons, tips) are baked
  // into the plan at generation time, so stale plans keep the old language's text.
  useEffect(() => {
    if (!profile?.onboardingComplete || !scheduleIsLoaded) return;
    refresh();
  }, [language]);

  return { plan: todayPlan, isGenerating, error, refresh };
}

export function useWeeklyPlan() {
  const { weeklyPlans, isGenerating, error, generateWeek } = usePlanStore();
  const profile = useUserStore(s => s.profile);
  const scheduleIsLoaded = useScheduleStore(s => s.isLoaded);
  const language = useLanguageStore(s => s.language);

  const refresh = useCallback(() => {
    if (!profile?.onboardingComplete) return;
    generateWeek();
  }, [profile, generateWeek]);

  useEffect(() => {
    if (!profile?.onboardingComplete || !scheduleIsLoaded) return;
    if (weeklyPlans.length === 0) refresh();
  }, [profile?.onboardingComplete, scheduleIsLoaded]);

  // Regenerate weekly plans on language change (same reason as daily plan)
  useEffect(() => {
    if (!profile?.onboardingComplete || !scheduleIsLoaded) return;
    refresh();
  }, [language]);

  return { plans: weeklyPlans, isGenerating, error, refresh };
}
