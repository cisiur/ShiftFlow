/**
 * Export check-in history as CSV using the native share sheet.
 *
 * expo-file-system is not installed in this project, so we use
 * React Native's built-in Share API to share the CSV as text —
 * no new native dependencies required.
 *
 * Columns: date, fatigue, sleepQuality, stress, alertness, notes
 * (only confirmed DailyCheckIn fields)
 */

import { Share } from 'react-native';
import type { DailyCheckIn } from '@/types';

const CSV_HEADER = 'date,fatigue,sleepQuality,stress,alertness,notes';

function sanitiseNotes(notes: string | undefined): string {
  if (!notes) return '';
  // Remove characters that break CSV parsing
  return notes.replace(/[\r\n,]/g, ' ').trim();
}

function toCSVRow(c: DailyCheckIn): string {
  return [
    c.date,
    c.fatigue,
    c.sleepQuality,
    c.stress,
    c.alertness,
    sanitiseNotes(c.notes),
  ].join(',');
}

/**
 * Generates a CSV string from the full check-in array and opens the
 * native share sheet. Throws if Share is unavailable.
 */
export async function exportCheckInsAsCSV(checkIns: DailyCheckIn[]): Promise<void> {
  const rows = [...checkIns]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(toCSVRow);

  const csv = [CSV_HEADER, ...rows].join('\n');

  await Share.share({
    title: 'ShiftFlow Check-in History',
    message: csv,
  });
}
