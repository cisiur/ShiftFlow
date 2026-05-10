import { useUserStore } from '@/store/userStore';

/** Returns true when the user has chosen 12-hour clock display. */
export function useTimeFormat(): boolean {
  return useUserStore(s => s.profile?.timeFormat === '12h') ?? false;
}
