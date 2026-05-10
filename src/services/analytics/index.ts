// Analytics abstraction — mock by default, swap in PostHog / Amplitude later.
import { Config } from '@/constants/config';
import type { AnalyticsEvent } from '@/types';

function logEvent(event: AnalyticsEvent): void {
  if (Config.isDev) {
    console.log(`[Analytics] ${event.name}`, event.properties ?? {});
  }
  // TODO: forward to real provider when Config.analyticsProvider !== 'mock'
}

export const Analytics = {
  track(name: string, properties?: AnalyticsEvent['properties']): void {
    logEvent({ name, properties, timestamp: new Date().toISOString() });
  },

  screen(screenName: string): void {
    logEvent({ name: 'screen_view', properties: { screen: screenName } });
  },

  onboardingStep(step: string): void {
    logEvent({ name: 'onboarding_step', properties: { step } });
  },

  planGenerated(shiftType: string, energyScore: number): void {
    logEvent({ name: 'plan_generated', properties: { shiftType, energyScore } });
  },

  checkInSubmitted(avgScore: number): void {
    logEvent({ name: 'check_in_submitted', properties: { avgScore } });
  },

  premiumPaywallViewed(source: string): void {
    logEvent({ name: 'paywall_viewed', properties: { source } });
  },

  premiumPurchased(tier: string): void {
    logEvent({ name: 'premium_purchased', properties: { tier } });
  },
};
