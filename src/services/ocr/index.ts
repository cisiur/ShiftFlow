/**
 * Roster OCR service — sends a base64 image to Claude Vision
 * and returns a structured list of shift entries.
 *
 * Uses: claude-haiku-4-5-20251001
 * Requires: EXPO_PUBLIC_ANTHROPIC_API_KEY
 */

import { Config } from '@/constants/config';
import type { ShiftType } from '@/types';

// ─── Output types ─────────────────────────────────────────────────────────────

export interface ExtractedShift {
  date:      string;      // ISO "YYYY-MM-DD"
  type:      ShiftType;
  startTime: string | null; // "06:00"
  endTime:   string | null; // "14:00"
  confidence: 'high' | 'medium' | 'low';
}

export interface OCRResult {
  shifts: ExtractedShift[];
  notes:  string;   // any caveats from Claude (e.g. "could not read row 3")
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const VISION_MODEL      = 'claude-sonnet-4-6';
const ANTHROPIC_VERSION = '2023-06-01';

const SYSTEM_PROMPT = `You are a shift-roster parser specialised in reading Excel/spreadsheet work schedules. Extract every shift and return JSON only — no prose.

━━━ DATE FORMAT ━━━
Dates are ALWAYS European: DD/MM, DD/MM/YY, or DD/MM/YYYY (day comes first).
NEVER treat them as US format. "12/05" = 12th May. "01/06" = 1st June.
Output dates as YYYY-MM-DD ISO strings. Infer the year from context (column headers, nearby years).

━━━ TIME FORMAT ━━━
Times in Excel rosters are often written WITHOUT colons and WITHOUT leading zeros:
  "7-19"   means start 07:00, end 19:00
  "19-7"   means start 19:00, end 07:00 (next day)
  "6-14"   means start 06:00, end 14:00
  "22-6"   means start 22:00, end 06:00 (next day)
Always convert to "HH:MM" format with leading zeros (e.g. "07:00", "19:00").
If no time is visible, use null.

━━━ SHIFT TYPE MAPPING ━━━
Classify by start–end time:
  06:00–14:00  → "morning"
  14:00–22:00  → "afternoon"
  22:00–06:00  → "night"
  07:00–19:00  → "long_day"
  19:00–07:00  → "long_night"
  Day off / rest / "-" / empty → "off"
  Anything else → "custom"

━━━ MULTIPLE SHIFTS PER DAY ━━━
A single table cell may contain TWO shifts separated by a newline, slash, or listed one below the other.
Examples of double-shift cells:
  "7-19 / 19-7"   → two shifts same date
  "7-19\n19-7"    → two shifts same date
  A cell showing "7-19" AND the cell directly below (same date column) showing "19-7" → two shifts
For EVERY shift found on a day, emit a SEPARATE JSON object with the same "date". Never merge two shifts into one.

━━━ MIDNIGHT-CROSSING SHIFTS ━━━
A shift like "19-7" or "22-6" crosses midnight. The "date" field = the START date of that shift.
The endTime is on the following calendar day, but keep the start date in the output.

━━━ OUTPUT SCHEMA ━━━
Return exactly this structure — nothing else:
{
  "shifts": [
    { "date": "2025-06-02", "type": "long_day",   "startTime": "07:00", "endTime": "19:00", "confidence": "high" },
    { "date": "2025-06-02", "type": "long_night",  "startTime": "19:00", "endTime": "07:00", "confidence": "high" },
    { "date": "2025-06-03", "type": "off",          "startTime": null,    "endTime": null,    "confidence": "high" }
  ],
  "notes": "Brief note about anything ambiguous or unreadable. Empty string if all clear."
}`;

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Extract shifts from a base64-encoded image (JPEG or PNG).
 * @param base64Image  Pure base64 string (no data-URI prefix)
 * @param mediaType    'image/jpeg' | 'image/png'
 */
export async function extractShiftsFromImage(
  base64Image: string,
  mediaType: 'image/jpeg' | 'image/png' = 'image/jpeg',
): Promise<OCRResult> {
  const apiKey = Config.anthropicApiKey;
  if (!apiKey) {
    throw new Error('EXPO_PUBLIC_ANTHROPIC_API_KEY is not set. Cannot use roster import.');
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method:  'POST',
    headers: {
      'content-type':     'application/json',
      'x-api-key':        apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model:      VISION_MODEL,
      max_tokens: 2048,
      system:     SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type:   'image',
              source: {
                type:       'base64',
                media_type: mediaType,
                data:       base64Image,
              },
            },
            {
              type: 'text',
              text: 'Extract all shift entries visible in this roster image. Return JSON only.',
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic Vision API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const rawText: string = data.content?.find((b: any) => b.type === 'text')?.text ?? '';

  // Parse — Claude should return pure JSON but sometimes wraps in ```json ```
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/, '')
    .trim();

  const parsed = JSON.parse(cleaned) as OCRResult;

  // Basic validation / sanitisation
  const validTypes = new Set<ShiftType>([
    'morning', 'afternoon', 'night', 'long_day', 'long_night', 'extended', 'off', 'custom',
  ]);

  const shifts: ExtractedShift[] = (parsed.shifts ?? [])
    .filter((s: any) => s.date && /^\d{4}-\d{2}-\d{2}$/.test(s.date))
    .map((s: any): ExtractedShift => ({
      date:       s.date,
      type:       validTypes.has(s.type) ? s.type : 'custom',
      startTime:  s.startTime ?? null,
      endTime:    s.endTime   ?? null,
      confidence: ['high', 'medium', 'low'].includes(s.confidence) ? s.confidence : 'low',
    }));

  return { shifts, notes: parsed.notes ?? '' };
}
