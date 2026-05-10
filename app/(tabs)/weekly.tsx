import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { WeekDayCard } from '@/components/features/WeekDayCard';
import { Spacing, Palette } from '@/constants/theme';
import { useWeeklyPlan } from '@/hooks/usePlan';
import { useUserStore } from '@/store/userStore';
import { todayISO, formatDateLabel } from '@/utils/time';
import { Analytics } from '@/services/analytics';
import { useTranslation } from '@/i18n';

export default function WeeklyScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { plans, isGenerating, refresh } = useWeeklyPlan();
  const profile = useUserStore(s => s.profile);
  const [weekAnchor] = useState(todayISO());

  React.useEffect(() => {
    Analytics.screen('weekly');
  }, []);

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  if (!profile?.onboardingComplete) return null;

  const weekStart = plans[0]?.date;
  const weekEnd = plans[6]?.date;

  // Summary stats
  const nightCount = plans.filter(p => p.shift?.type === 'night' || p.shift?.type === 'long_night').length;
  const offCount = plans.filter(p => !p.shift || p.shift.type === 'off').length;
  const avgEnergy = plans.length > 0
    ? Math.round(plans.reduce((s, p) => s + p.energyScore, 0) / plans.length)
    : 0;

  return (
    <ScreenContainer refreshing={isGenerating} onRefresh={handleRefresh}>
      <View style={styles.header}>
        <Text variant="h2" weight="bold">{t.weekly.title}</Text>
        {weekStart && weekEnd && (
          <Text variant="bodySmall" color="secondary">
            {formatDateLabel(weekStart, language === 'pl' ? 'pl-PL' : 'en-US')} – {formatDateLabel(weekEnd, language === 'pl' ? 'pl-PL' : 'en-US')}
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
          {/* Week summary */}
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

          {/* Day cards */}
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

const styles = StyleSheet.create({
  header: {
    marginTop: Spacing.base,
    marginBottom: Spacing.base,
    gap: 4,
  },
  summary: {
    marginBottom: Spacing.base,
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
});
