/**
 * Roster OCR service — sends a base64 image to Claude Vision
 * and returns a structured list of shift entries.
 *
 * Uses: claude-3-5-sonnet-20241022 (best vision accuracy)
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
const VISION_MODEL      = 'claude-3-5-sonnet-20241022';
const ANTHROPIC_VERSION = '2023-06-01';

const SYSTEM_PROMPT = `You are a shift-roster parser. Given a photo or screenshot of a work schedule, extract shift data as JSON.

Rules:
- Return ONLY valid JSON. No prose before or after.
- Infer dates from visible calendar headers. Use ISO format YYYY-MM-DD.
- Map shift labels to types: morning (≈06–14), afternoon (≈14–22), night (≈22–06), long_day (≈07–19), long_night (≈19–07), off (rest/day off), custom (anything else).
- If start/end times are visible, include them as "HH:MM" strings; otherwise null.
- Set confidence: "high" if date+type clearly visible, "medium" if inferred, "low" if guessed.
- Include a short "notes" string for any issues (blank cells, illegible text, etc.).

Output schema (strict):
{
  "shifts": [
    { "date": "2025-06-02", "type": "night", "startTime": "22:00", "endTime": "06:00", "confidence": "high" }
  ],
  "notes": "Row 4 was partially cut off."
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
