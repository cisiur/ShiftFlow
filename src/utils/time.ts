// Pure time utilities — no side effects, fully testable.

/** Parse "HH:MM" into total minutes since midnight. */
export function parseTime(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** Format total minutes since midnight as "HH:MM". */
export function formatTime(minutes: number): string {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Format "HH:MM" to "h:mm AM/PM". */
export function formatTimeAmPm(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

/** Format "HH:MM" for display, respecting the user's 12h/24h preference. */
export function formatTimeDisplay(hhmm: string, use12h: boolean): string {
  return use12h ? formatTimeAmPm(hhmm) : hhmm;
}

/** Add minutes to a "HH:MM" time, wrapping past midnight. */
export function addMinutes(hhmm: string, minutes: number): string {
  return formatTime(parseTime(hhmm) + minutes);
}

/** Subtract minutes from a "HH:MM" time. */
export function subtractMinutes(hhmm: string, minutes: number): string {
  return addMinutes(hhmm, -minutes);
}

/**
 * Calculate sleep duration in hours between sleepStart and sleepEnd.
 * Handles overnight windows correctly.
 */
export function sleepDurationHours(start: string, end: string): number {
  const startMin = parseTime(start);
  const endMin = parseTime(end);
  const diff = endMin >= startMin ? endMin - startMin : 1440 - startMin + endMin;
  return Math.round((diff / 60) * 10) / 10;
}

/** Returns true if a "HH:MM" time is between from and to (handles midnight wrap). */
export function isTimeBetween(time: string, from: string, to: string): boolean {
  const t = parseTime(time);
  const f = parseTime(from);
  const e = parseTime(to);
  if (f <= e) return t >= f && t <= e;
  return t >= f || t <= e; // crosses midnight
}

/** Returns ISO date string for today in "YYYY-MM-DD" format. */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/** Offset today's date by N days, returns "YYYY-MM-DD". */
export function offsetDate(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

/** Get day-of-week index (0=Sun) for an ISO date. */
export function dayOfWeek(isoDate: string): number {
  return new Date(isoDate).getDay();
}

/** Format ISO date "YYYY-MM-DD" as a human label like "Mon, 15 Jan". */
export function formatDateLabel(isoDate: string, locale = 'en-US'): string {
  const d = new Date(isoDate + 'T12:00:00');
  return d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });
}

/** Returns true if the ISO date is today. */
export function isToday(isoDate: string): boolean {
  return isoDate === todayISO();
}

/** Returns true if ISO date is in the past (before today). */
export function isPast(isoDate: string): boolean {
  return isoDate < todayISO();
}

/** Get the Monday of the ISO week containing the given date. */
export function weekStart(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00');
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

/** Generate an array of 7 ISO dates starting from Monday of the given date's week. */
export function weekDates(anchorISO: string): string[] {
  const monday = weekStart(anchorISO);
  return Array.from({ length: 7 }, (_, i) => offsetDate(monday, i));
}

/** Human-readable "Today", "Tomorrow", "Yesterday", or day name. */
interface RelativeDayOptions {
  locale?: string;
  today?: string;
  tomorrow?: string;
  yesterday?: string;
}

export function relativeDayLabel(isoDate: string, opts: RelativeDayOptions = {}): string {
  const {
    locale = 'en-US',
    today: todayLabel = 'Today',
    tomorrow: tomorrowLabel = 'Tomorrow',
    yesterday: yesterdayLabel = 'Yesterday',
  } = opts;
  const today = todayISO();
  if (isoDate === today) return todayLabel;
  if (isoDate === offsetDate(today, 1)) return tomorrowLabel;
  if (isoDate === offsetDate(today, -1)) return yesterdayLabel;
  const d = new Date(isoDate + 'T12:00:00');
  return d.toLocaleDateString(locale, { weekday: 'long' });
}
