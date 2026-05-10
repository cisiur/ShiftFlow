import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/config';
import type { ShiftEntry, ShiftType } from '@/types';
import { createShiftEntry, findShiftForDate } from '@/domain/schedule/helpers';

interface ScheduleState {
  shifts: ShiftEntry[];
  isLoaded: boolean;
  lastUpdatedAt: string | null;

  // Queries
  getShiftForDate(date: string): ShiftEntry | null;          // primary (first by start) shift
  getShiftsForDate(date: string): ShiftEntry[];              // all shifts for a date
  getShiftsForWeek(dates: string[]): ShiftEntry[];           // primary shift per date

  // Mutations
  upsertShift(entry: ShiftEntry): void;
  /** Replace ALL shifts for a date with one entry (used for 'off' or single-type days). */
  setShiftForDate(date: string, type: ShiftType, startTime?: string, endTime?: string): void;
  /** Add a shift to a date without removing existing ones. */
  addShiftForDate(date: string, type: ShiftType, startTime?: string, endTime?: string): void;
  removeShift(id: string): void;
  bulkSetShifts(entries: ShiftEntry[]): void;
  reset(): void;
}

function sortShifts(shifts: ShiftEntry[]): ShiftEntry[] {
  return [...shifts].sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    return d !== 0 ? d : (a.startTime ?? '').localeCompare(b.startTime ?? '');
  });
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      shifts: [],
      isLoaded: false,
      lastUpdatedAt: null,

      getShiftForDate(date) {
        return findShiftForDate(get().shifts, date);
      },

      getShiftsForDate(date) {
        return get().shifts
          .filter(s => s.date === date)
          .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''));
      },

      getShiftsForWeek(dates) {
        const { shifts } = get();
        return dates.map(date =>
          shifts.find(s => s.date === date) ?? createShiftEntry(date, 'off'),
        );
      },

      upsertShift(entry) {
        // Deduplicates by id only — allows multiple shifts per date
        set(state => ({
          shifts: sortShifts([...state.shifts.filter(s => s.id !== entry.id), entry]),
          lastUpdatedAt: new Date().toISOString(),
        }));
      },

      setShiftForDate(date, type, startTime, endTime) {
        // Replaces ALL shifts for the date with a single entry
        const entry = createShiftEntry(date, type, { startTime, endTime });
        set(state => ({
          shifts: sortShifts([...state.shifts.filter(s => s.date !== date), entry]),
          lastUpdatedAt: new Date().toISOString(),
        }));
      },

      addShiftForDate(date, type, startTime, endTime) {
        const entry = createShiftEntry(date, type, { startTime, endTime });
        get().upsertShift(entry);
      },

      removeShift(id) {
        set(state => ({ shifts: state.shifts.filter(s => s.id !== id), lastUpdatedAt: new Date().toISOString() }));
      },

      bulkSetShifts(entries) {
        set(state => {
          const entryDates = new Set(entries.map(e => e.date));
          const kept = state.shifts.filter(s => !entryDates.has(s.date));
          return { shifts: sortShifts([...kept, ...entries]), lastUpdatedAt: new Date().toISOString() };
        });
      },

      reset() {
        set({ shifts: [], lastUpdatedAt: new Date().toISOString() });
      },
    }),
    {
      name: STORAGE_KEYS.SCHEDULE,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.isLoaded = true;
      },
    },
  ),
);
