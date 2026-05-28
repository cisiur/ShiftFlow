import React, { useCallback, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { WeekDayCard } from '@/components/features/WeekDayCard';
import { Spacing, Palette, Radius } from '@/constants/theme';
import { useWeeklyPlan } from '@/hooks/usePlan';
import { useUserStore } from '@/store/userStore';
import { useCheckInStore } from '@/store/checkInStore';
import { usePremiumStore } from '@/store/premiumStore';
import { todayISO, formatDateLabel } from '@/utils/time';
import { getCurrentStreak, getLongestStreak } from '@/utils/streak';
import { getWeeklyInsights } from '@/utils/weeklyInsights';
import { getLockedHistoryCount } from '@/utils/historyAccess';
import { Analytics } from '@/services/analytics';
import { useTranslation } from '@/i18n';

export default function WeeklyScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { plans, isGenerating, refresh } = useWeeklyPlan();
  const profile    = useUserStore(s => s.profile);
  const checkIns   = useCheckInStore(s => s.checkIns);
  const { isPremium } = usePremiumStore();
  const [weekAnchor] = useState(todayISO());

  React.useEffect(() => {
    Analytics.screen('weekly');
  }, []);

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  if (!profile?.onboardingComplete) return null;

  const weekStart = plans[0]?.date;
  const weekEnd   = plans[6]?.date;

  // Summary stats
  const nightCount = plans.filter(p => p.shift?.type === 'night' || p.shift?.type === 'long_night').length;
  const offCount   = plans.filter(p => !p.shift || p.shift.type === 'off').length;
  const avgEnergy  = plans.length > 0
    ? Math.round(plans.reduce((s, p) => s + p.energyScore, 0) / plans.length)
    : 0;

  // Streak & insights
  const currentStreak  = getCurrentStreak(checkIns);
  const longestStreak  = getLongestStreak(checkIns);
  const insightsUnlocked = currentStreak >= 7;
  const insights       = insightsUnlocked ? getWeeklyInsights(checkIns) : null;
  const lockedCount    = getLockedHistoryCount(checkIns, isPremium());

  const locale = language === 'pl' ? 'pl-PL' : 'en-US';

  return (
    <ScreenContainer refreshing={isGenerating} onRefresh={handleRefresh}>
      <View style={styles.header}>
        <Text variant="h2" weight="bold">{t.weekly.title}</Text>
        {weekStart && weekEnd && (
          <Text variant="bodySmall" color="secondary">
            {formatDateLabel(weekStart, locale)} – {formatDateLabel(weekEnd, locale)}
          </Text>
        )}
      </View>

      {plans.length === 0 ? (
        <EmptyState
          emoji="📋"
          title={t.weekly.noPlan.title}
          description={t.weekly.noPlan.description}
          actionLabel={t.weekly.noPlan.action}
          onAction={() => router.push('/schedule')}
        />
      ) : (
        <>
          {/* ── Week summary ── */}
          <Card style={styles.summary}>
            <Text variant="label" color="secondary">{t.weekly.summary.glance}</Text>
            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text variant="h2" weight="bold" style={{ color: Palette.shiftNight }}>{nightCount}</Text>
                <Text variant="caption" color="tertiary">{t.weekly.summary.nightShifts}</Text>
              </View>
              <View style={[styles.stat, styles.statBorder]}>
                <Text variant="h2" weight="bold" style={{ color: Palette.shiftOff }}>{offCount}</Text>
                <Text variant="caption" color="tertiary">{t.weekly.summary.restDays}</Text>
              </View>
              <View style={styles.stat}>
                <Text
                  variant="h2"
                  weight="bold"
                  style={{
                    color:
                      avgEnergy >= 65 ? Palette.success
                      : avgEnergy >= 40 ? Palette.warning
                      : Palette.error,
                  }}
                >
                  {avgEnergy}
                </Text>
                <Text variant="caption" color="tertiary">{t.weekly.summary.avgEnergy}</Text>
              </View>
            </View>
          </Card>

          {/* ── Streak card ── */}
          {(currentStreak > 0 || longestStreak > 0) && (
            <Card style={styles.streakCard}>
              <View style={styles.streakRow}>
                <Text style={{ fontSize: 22 }}>🔥</Text>
                <View style={{ flex: 1 }}>
                  <Text variant="caption" color="secondary">{t.streak.current}</Text>
                  <Text variant="body" weight="bold" style={{ color: Palette.primary }}>
                    {t.streak.days(currentStreak)}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text variant="caption" color="secondary">{t.streak.longest}</Text>
                  <Text variant="bodySmall" weight="semibold" color="secondary">
                    {t.streak.days(longestStreak)}
                  </Text>
                </View>
              </View>
            </Card>
          )}

          {/* ── Weekly Insights ── */}
          {insightsUnlocked && insights ? (
            <Card style={styles.insightsCard}>
              <View style={styles.insightsHeader}>
                <Text variant="label" weight="semibold" style={{ color: Palette.primary }}>
                  📊 {t.weeklyInsights.title}
                </Text>
                <View style={[styles.trendBadge, { backgroundColor: trendColor(insights.trend) + '20' }]}>
                  <Text variant="caption" weight="semibold" style={{ color: trendColor(insights.trend) }}>
                    {t.weeklyInsights.trend[insights.trend]}
                  </Text>
                </View>
              </View>

              <View style={styles.insightsStats}>
                <View style={styles.insightsStat}>
                  <Text variant="h2" weight="bold" style={{ color: Palette.primary }}>
                    {t.weeklyInsights.outOf5(insights.avgAlertness)}
                  </Text>
                  <Text variant="caption" color="tertiary">{t.weeklyInsights.avgAlertness}</Text>
                </View>
                <View style={[styles.insightsStat, styles.statBorder]}>
                  <Text variant="h2" weight="bold" style={{ color: Palette.primary }}>
                    {t.weeklyInsights.outOf5(insights.avgSleepQuality)}
                  </Text>
                  <Text variant="caption" color="tertiary">{t.weeklyInsights.avgSleep}</Text>
                </View>
                <View style={styles.insightsStat}>
                  <Text variant="h2" weight="bold" style={{ color: Palette.primary }}>
                    {insights.checkInsCount}
                  </Text>
                  <Text variant="caption" color="tertiary">{t.weeklyInsights.checkInsCount}</Text>
                </View>
              </View>

              <Text variant="bodySmall" color="secondary" style={{ marginTop: Spacing.sm }}>
                💡 {t.weeklyInsights.insights[insights.insightKey]}
              </Text>
            </Card>
          ) : (
            /* Locked weekly insights with progress bar */
            <Card style={styles.insightsLockedCard}>
              <View style={styles.insightsLockedHeader}>
                <Text variant="label" weight="semibold" color="secondary">
                  📊 {t.weeklyInsights.title}
                </Text>
                <Text style={{ fontSize: 16 }}>🔒</Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min((currentStreak / 7) * 100, 100)}%` as any },
                  ]}
                />
              </View>
              <Text variant="caption" color="secondary" style={{ marginTop: Spacing.xs }}>
                {t.weeklyInsights.lockedProgress(currentStreak)}
                {'  ·  '}
                {t.weeklyInsights.lockedHint(Math.max(7 - currentStreak, 0))}
              </Text>
            </Card>
          )}

          {/* ── Locked history notice ── */}
          {lockedCount > 0 && (
            <TouchableOpacity
              onPress={() => { Analytics.premiumPaywallViewed('history_lock'); router.push('/paywall'); }}
              style={styles.lockedBanner}
              activeOpacity={0.8}
            >
              <Text variant="bodySmall" style={{ color: Palette.primary, flex: 1 }}>
                🔒 {t.history.lockedCount(lockedCount)}
              </Text>
              <Text variant="bodySmall" weight="semibold" style={{ color: Palette.primary }}>
                {t.history.upgradeCta} ›
              </Text>
            </TouchableOpacity>
          )}

          {/* ── Day cards ── */}
          <View style={{ gap: Spacing.xs }}>
            {plans.map(plan => (
              <WeekDayCard
                key={plan.date}
                plan={plan}
                onPress={() => {
                  Analytics.track('weekly_day_tapped', { date: plan.date });
                }}
              />
            ))}
          </View>

          <Text variant="caption" color="tertiary" center style={{ marginTop: Spacing.xl }}>
            {t.weekly.regenerateNote}
          </Text>
        </>
      )}
    </ScreenContainer>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function trendColor(trend: 'improving' | 'stable' | 'declining'): string {
  if (trend === 'improving') return Palette.success;
  if (trend === 'declining') return Palette.error;
  return Palette.warning;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    marginTop: Spacing.base,
    marginBottom: Spacing.base,
    gap: 4,
  },
  summary: {
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E2E8F0',
  },
  // Streak
  streakCard: {
    marginBottom: Spacing.sm,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  // Weekly insights (unlocked)
  insightsCard: {
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  insightsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.xs,
  },
  insightsStat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  trendBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  // Weekly insights (locked)
  insightsLockedCard: {
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  insightsLockedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Palette.primary,
    borderRadius: 3,
  },
  // Locked history banner
  lockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: `${Palette.primary}10`,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
  },
});
