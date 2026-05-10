// AI service — clean provider abstraction.
// Set EXPO_PUBLIC_AI_PROVIDER=anthropic (and EXPO_PUBLIC_ANTHROPIC_API_KEY) to use real Claude.
// Falls back to mock provider when the key is absent.

import { Config } from '@/constants/config';
import { useLanguageStore } from '@/store/languageStore';
import type { AIExplanationRequest, AIExplanationResponse, DailyPlan, UserProfile } from '@/types';

// ─── Provider Interface ───────────────────────────────────────────────────────

interface AIProvider {
  generateExplanation(req: AIExplanationRequest): Promise<AIExplanationResponse>;
  generateWeeklySummary(plans: DailyPlan[], profile: UserProfile): Promise<string>;
}

// ─── Anthropic API types ──────────────────────────────────────────────────────

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_MODEL   = 'claude-3-5-haiku-20241022';
const ANTHROPIC_VERSION = '2023-06-01';

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AnthropicRequest {
  model: string;
  max_tokens: number;
  system: Array<{ type: 'text'; text: string; cache_control?: { type: 'ephemeral' } }>;
  messages: AnthropicMessage[];
}

interface AnthropicResponse {
  content: Array<{ type: string; text: string }>;
}

async function callAnthropic(payload: AnthropicRequest): Promise<string> {
  const apiKey = Config.anthropicApiKey;
  if (!apiKey) throw new Error('EXPO_PUBLIC_ANTHROPIC_API_KEY is not set');

  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'anthropic-beta': 'prompt-caching-2024-07-31',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${errText}`);
  }

  const data = (await res.json()) as AnthropicResponse;
  const block = data.content.find(b => b.type === 'text');
  if (!block) throw new Error('No text content in Anthropic response');
  return block.text.trim();
}

// ─── System prompts (cached — static content only) ───────────────────────────

const SYSTEM_EN = `You are ShiftFlow's recovery AI — a concise, empathetic health coach for shift workers.
Your role: explain why today's personalised plan (sleep timing, caffeine cutoff, meal windows, nap suggestion) makes physiological sense for this specific person and shift type.

Rules:
- Write in plain English. No bullet lists — flowing prose only.
- Maximum 3 sentences per response (80–120 words total).
- Focus on circadian science, adenosine, cortisol rhythms — explained simply.
- Never give medical diagnoses. Avoid "should" — prefer "helps", "supports", "protects".
- If the plan data looks unusual (e.g. very short sleep), acknowledge it honestly and explain the trade-off.`;

const SYSTEM_PL = `Jesteś AI regeneracji ShiftFlow — zwięzłym, empatycznym coachem zdrowotnym dla pracowników zmianowych.
Twoja rola: wyjaśnij, dlaczego dzisiejszy spersonalizowany plan (czas snu, limit kofeiny, okna posiłków, sugestia drzemki) ma fizjologiczny sens dla tej konkretnej osoby i typu zmiany.

Zasady:
- Pisz prostą polszczyzną. Bez punktorów — tylko płynna proza.
- Maksymalnie 3 zdania na odpowiedź (80–120 słów łącznie).
- Skupiaj się na rytmach dobowych, adenozynie, kortyzolu — wyjaśnionych prosto.
- Nigdy nie stawiaj diagnoz medycznych. Unikaj "powinien" — preferuj "pomaga", "wspiera", "chroni".
- Jeśli dane planu wyglądają nietypowo (np. bardzo krótki sen), przyznaj to szczerze i wyjaśnij kompromis.`;

// ─── Real Anthropic Provider ──────────────────────────────────────────────────

const anthropicProvider: AIProvider = {
  async generateExplanation(req): Promise<AIExplanationResponse> {
    const { plan, profile } = req;
    const lang = useLanguageStore.getState().language;
    const isPL = lang === 'pl';

    const shiftLabel = plan.shift
      ? plan.shift.type.replace(/_/g, ' ')
      : (isPL ? 'dzień wolny' : 'rest day');

    const userPrompt = isPL
      ? `Profil pracownika: ${profile.role.replace(/_/g, ' ')}, wzorzec zmian: ${profile.shiftPattern.replace(/_/g, ' ')}, ` +
        `wrażliwość na kofeinę: ${profile.caffeineSensitivity}, trudności ze snem: ${profile.sleepDifficulty}, ` +
        `cel snu: ${profile.targetSleepHours}h.\n` +
        `Dzisiaj: zmiana ${shiftLabel}. ` +
        `${plan.sleepWindow ? `Okno snu: ${plan.sleepWindow.start}–${plan.sleepWindow.end} (${plan.sleepWindow.durationHours}h). ` : ''}` +
        `Limit kofeiny: ${plan.caffeineGuidance.cutoffTime}. ` +
        `Wynik energii: ${plan.energyScore}/100. ` +
        `Poziom gotowości: ${plan.readinessLevel}.\n` +
        `Wyjaśnij plan regeneracji w 2–3 zdaniach po polsku.`
      : `Worker profile: ${profile.role.replace(/_/g, ' ')}, shift pattern: ${profile.shiftPattern.replace(/_/g, ' ')}, ` +
        `caffeine sensitivity: ${profile.caffeineSensitivity}, sleep difficulty: ${profile.sleepDifficulty}, ` +
        `sleep goal: ${profile.targetSleepHours}h.\n` +
        `Today: ${shiftLabel} shift. ` +
        `${plan.sleepWindow ? `Sleep window: ${plan.sleepWindow.start}–${plan.sleepWindow.end} (${plan.sleepWindow.durationHours}h). ` : ''}` +
        `Caffeine cutoff: ${plan.caffeineGuidance.cutoffTime}. ` +
        `Energy score: ${plan.energyScore}/100. ` +
        `Readiness: ${plan.readinessLevel}.\n` +
        `Explain the recovery plan in 2–3 sentences.`;

    const text = await callAnthropic({
      model:      ANTHROPIC_MODEL,
      max_tokens: 200,
      system: [{
        type: 'text',
        text: isPL ? SYSTEM_PL : SYSTEM_EN,
        cache_control: { type: 'ephemeral' },   // cache the large static system prompt
      }],
      messages: [{ role: 'user', content: userPrompt }],
    });

    return { summary: text, tips: plan.recoveryTips, generated: true };
  },

  async generateWeeklySummary(plans, profile): Promise<string> {
    const lang = useLanguageStore.getState().language;
    const isPL = lang === 'pl';

    const nightCount = plans.filter(p =>
      p.shift?.type === 'night' || p.shift?.type === 'long_night',
    ).length;
    const avgEnergy = Math.round(
      plans.reduce((s, p) => s + p.energyScore, 0) / plans.length,
    );
    const shiftTypes = plans
      .map(p => p.shift?.type ?? 'off')
      .filter(t => t !== 'off')
      .join(', ');

    const userPrompt = isPL
      ? `Pracownik: ${profile.role.replace(/_/g, ' ')}, wzorzec: ${profile.shiftPattern.replace(/_/g, ' ')}.\n` +
        `Ten tydzień: ${nightCount} nocnych zmian, średnia energia ${avgEnergy}/100, typy: ${shiftTypes || 'brak zmian'}.\n` +
        `Napisz 1–2 zdania po polsku z kluczową wskazówką na ten tydzień.`
      : `Worker: ${profile.role.replace(/_/g, ' ')}, pattern: ${profile.shiftPattern.replace(/_/g, ' ')}.\n` +
        `This week: ${nightCount} night shifts, average energy ${avgEnergy}/100, shift types: ${shiftTypes || 'none'}.\n` +
        `Write 1–2 sentences with a key insight for the week.`;

    return callAnthropic({
      model:      ANTHROPIC_MODEL,
      max_tokens: 120,
      system: [{
        type: 'text',
        text: isPL ? SYSTEM_PL : SYSTEM_EN,
        cache_control: { type: 'ephemeral' },
      }],
      messages: [{ role: 'user', content: userPrompt }],
    });
  },
};

// ─── Mock Provider ────────────────────────────────────────────────────────────

const mockProvider: AIProvider = {
  async generateExplanation(req): Promise<AIExplanationResponse> {
    const { plan, profile } = req;
    const shiftLabel = plan.shift ? plan.shift.type.replace(/_/g, ' ') : 'rest day';

    const templates = [
      `Based on your ${shiftLabel} and ${profile.caffeineSensitivity} caffeine sensitivity, ` +
      `your sleep window of ${plan.sleepWindow?.start ?? 'late evening'} gives your body the full recovery it needs. ` +
      `The caffeine cutoff at ${plan.caffeineGuidance.cutoffTime} leaves enough time for adenosine to rebuild before sleep.`,

      `Your ${plan.readinessLevel} readiness today reflects your recent sleep patterns. ` +
      `The plan prioritises ${plan.readinessLevel === 'low' ? 'recovery and reduced load' : 'consistent timing'} ` +
      `to build towards a more stable routine.`,

      `Today's recommendations account for your ${profile.shiftPattern.replace(/_/g, ' ')} shift pattern. ` +
      `Meal timing is offset to avoid heavy digestion close to your target sleep window.`,
    ];

    const summary = templates[Math.floor(Math.random() * templates.length)];
    return { summary, tips: plan.recoveryTips, generated: false };
  },

  async generateWeeklySummary(plans, profile): Promise<string> {
    const nightCount = plans.filter(p =>
      p.shift?.type === 'night' || p.shift?.type === 'long_night',
    ).length;
    const avgEnergy = Math.round(
      plans.reduce((s, p) => s + p.energyScore, 0) / plans.length,
    );

    if (nightCount >= 3) {
      return `A heavy night-shift week. Focus on consistent recovery sleep windows and protecting daytime sleep from disruptions.`;
    }
    if (avgEnergy < 45) {
      return `Energy looks low across the week. Prioritise sleep duration and limit caffeine to the morning window.`;
    }
    return `A manageable week for a ${profile.shiftPattern.replace(/_/g, ' ')} schedule. Keep sleep timing as consistent as possible even on off days.`;
  },
};

// ─── Active Provider ──────────────────────────────────────────────────────────

function getProvider(): AIProvider {
  // Use Anthropic if explicitly configured OR if key is present
  if (Config.aiProvider === 'anthropic' || Config.anthropicApiKey) {
    return anthropicProvider;
  }
  return mockProvider;
}

export const AIService = {
  async generateExplanation(req: AIExplanationRequest): Promise<AIExplanationResponse> {
    try {
      return await getProvider().generateExplanation(req);
    } catch (err) {
      console.error('[AI] generateExplanation failed:', err);
      return { summary: req.plan.explanationSummary, tips: req.plan.recoveryTips, generated: false };
    }
  },

  async generateWeeklySummary(plans: DailyPlan[], profile: UserProfile): Promise<string> {
    try {
      return await getProvider().generateWeeklySummary(plans, profile);
    } catch (err) {
      console.error('[AI] generateWeeklySummary failed:', err);
      return 'Your weekly plan is ready. Tap any day to see detailed guidance.';
    }
  },
};
