// AI service — clean provider abstraction.
// MVP uses mock provider. Swap to 'anthropic' by setting EXPO_PUBLIC_AI_PROVIDER=anthropic.

import { Config } from '@/constants/config';
import type { AIExplanationRequest, AIExplanationResponse, DailyPlan, UserProfile } from '@/types';

// ─── Provider Interface ───────────────────────────────────────────────────────

interface AIProvider {
  generateExplanation(req: AIExplanationRequest): Promise<AIExplanationResponse>;
  generateWeeklySummary(plans: DailyPlan[], profile: UserProfile): Promise<string>;
}

// ─── Mock Provider ────────────────────────────────────────────────────────────

const mockProvider: AIProvider = {
  async generateExplanation(req): Promise<AIExplanationResponse> {
    const { plan, profile } = req;
    const shiftLabel = plan.shift ? plan.shift.type.replace('_', ' ') : 'rest day';

    const templates = [
      `Based on your ${shiftLabel} and ${profile.caffeineSensitivity} caffeine sensitivity, ` +
      `your sleep window of ${plan.sleepWindow?.start ?? 'late evening'} gives your body the full recovery it needs. ` +
      `The caffeine cutoff at ${plan.caffeineGuidance.cutoffTime} leaves enough time for adenosine to rebuild before sleep.`,

      `Your ${plan.readinessLevel} readiness today reflects your recent sleep patterns. ` +
      `The plan prioritises ${plan.readinessLevel === 'low' ? 'recovery and reduced load' : 'consistent timing'} ` +
      `to build towards a more stable routine.`,

      `Today's recommendations account for your ${profile.shiftPattern.replace('_', ' ')} shift pattern. ` +
      `Meal timing is offset to avoid heavy digestion close to your target sleep window.`,
    ];

    const summary = templates[Math.floor(Math.random() * templates.length)];

    return {
      summary,
      tips: plan.recoveryTips,
      generated: false, // mark as mock-generated
    };
  },

  async generateWeeklySummary(plans, profile): Promise<string> {
    const nightCount = plans.filter(p => p.shift?.type === 'night' || p.shift?.type === 'long_night').length;
    const avgEnergy = Math.round(plans.reduce((s, p) => s + p.energyScore, 0) / plans.length);

    if (nightCount >= 3) {
      return `A heavy night-shift week. Focus on consistent recovery sleep windows and protecting daytime sleep from disruptions.`;
    }
    if (avgEnergy < 45) {
      return `Energy looks low across the week. Prioritise sleep duration and limit caffeine to the morning window.`;
    }
    return `A manageable week for a ${profile.shiftPattern.replace('_', ' ')} schedule. Keep sleep timing as consistent as possible even on off days.`;
  },
};

// ─── Real Anthropic Provider (stub — implement when ready) ───────────────────

const anthropicProvider: AIProvider = {
  async generateExplanation(req): Promise<AIExplanationResponse> {
    // TODO: implement real Claude API call
    // const client = new Anthropic({ apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY });
    // const message = await client.messages.create({ ... });
    console.warn('[AI] Anthropic provider not yet implemented — falling back to mock');
    return mockProvider.generateExplanation(req);
  },

  async generateWeeklySummary(plans, profile): Promise<string> {
    console.warn('[AI] Anthropic provider not yet implemented — falling back to mock');
    return mockProvider.generateWeeklySummary(plans, profile);
  },
};

// ─── Active Provider ──────────────────────────────────────────────────────────

function getProvider(): AIProvider {
  if (Config.aiProvider === 'anthropic') return anthropicProvider;
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
