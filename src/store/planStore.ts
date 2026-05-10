import { create } from 'zustand';
import type { DailyPlan } from '@/types';
import { generateDailyPlan, generateWeeklyPlans } from '@/domain/recommendations/engine';
import { useUserStore } from './userStore';
import { useScheduleStore } from './scheduleStore';
import { useCheckInStore } from './checkInStore';
import { useLanguageStore } from './languageStore';
import { enRules, plRules } from '@/i18n/rulesStrings';
import { todayISO, offsetDate, weekDates } from '@/utils/time';

interface PlanState {
  todayPlan: DailyPlan | null;
  weeklyPlans: DailyPlan[];
  isGenerating: boolean;
  lastGeneratedDate: string | null;
  error: string | null;

  generateToday(): DailyPlan | null;
  generateWeek(anchorDate?: string): DailyPlan[];
  clearError(): void;
}

export const usePlanStore = create<PlanState>()((set, get) => ({
  todayPlan: null,
  weeklyPlans: [],
  isGenerating: false,
  lastGeneratedDate: null,
  error: null,

  generateToday() {
    const profile = useUserStore.getState().profile;
    if (!profile) return null;

    const today    = todayISO();
    const tomorrow = offsetDate(today, 1);
    const scheduleStore  = useScheduleStore.getState();
    const checkInStore   = useCheckInStore.getState();
    const language       = useLanguageStore.getState().language;
    const strings        = language === 'pl' ? plRules : enRules;

    const todayShifts    = scheduleStore.getShiftsForDate(today);
    const tomorrowShifts = scheduleStore.getShiftsForDate(tomorrow);
    const recentCheckIns = checkInStore.getRecentCheckIns(7);

    set({ isGenerating: true, error: null });
    try {
      const plan = generateDailyPlan({
        date: today,
        profile,
        todayShifts,
        tomorrowShifts,
        recentCheckIns,
        strings,
      });
      set({ todayPlan: plan, lastGeneratedDate: today, isGenerating: false });
      return plan;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Plan generation failed';
      set({ error: msg, isGenerating: false });
      return null;
    }
  },

  generateWeek(anchorDate = todayISO()) {
    const profile = useUserStore.getState().profile;
    if (!profile) return [];

    const dates = weekDates(anchorDate);
    const scheduleStore  = useScheduleStore.getState();
    const checkInStore   = useCheckInStore.getState();
    const language       = useLanguageStore.getState().language;
    const strings        = language === 'pl' ? plRules : enRules;

    // All shifts indexed by date for multi-shift support
    const shiftsByDate = new Map(
      dates.map(d => [d, scheduleStore.getShiftsForDate(d)]),
    );
    const recentCheckIns = checkInStore.getRecentCheckIns(14);

    set({ isGenerating: true, error: null });
    try {
      const plans = generateWeeklyPlans(profile, shiftsByDate, recentCheckIns, dates, strings);
      set({ weeklyPlans: plans, isGenerating: false });
      return plans;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Weekly plan generation failed';
      set({ error: msg, isGenerating: false });
      return [];
    }
  },

  clearError() {
    set({ error: null });
  },
}));
