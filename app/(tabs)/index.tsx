import React, { useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ShiftCard } from '@/components/features/ShiftCard';
import { SleepWindowCard } from '@/components/features/SleepWindowCard';
import { CaffeineCard } from '@/components/features/CaffeineCard';
import { NapCard } from '@/components/features/NapCard';
import { RecoveryTips } from '@/components/features/RecoveryTips';
import { MealList } from '@/components/features/MealList';
import { EnergyScoreCard } from '@/components/features/EnergyScore';
import { Spacing, Palette } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import { useCheckInStore } from '@/store/checkInStore';
import { useTodayPlan } from '@/hooks/usePlan';
import { todayISO } from '@/utils/time';
import { Analytics } from '@/services/analytics';
import { useTranslation } from '@/i18n';
import { getCurrentStreak, getLongestStreak } from '@/utils/streak';
import type { DailyCheckIn } from '@/types';
import type { Translations } from '@/i18n/en';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const profile = useUserStore(s => s.profile);
  const hasCheckedIn = useCheckInStore(s => s.hasCheckedInToday());
  const checkIns     = useCheckInStore(s => s.checkIns);
  const { plan, isGenerating, error, refresh } = useTodayPlan();

  React.useEffect(() => {
    Analytics.screen('home');
  }, []);

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  if (!profile?.onboardingComplete) return null;

  if (isGenerating && !plan) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Palette.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <EmptyState
          emoji="⚠️"
          title={t.today.error.title}
          description={error}
          actionLabel={t.today.error.action}
          onAction={handleRefresh}
        />
      </ScreenContainer>
    );
  }

  if (!plan) {
    return (
      <ScreenContainer>
        <EmptyState
          emoji="📅"
          title={t.today.noPlan.title}
          description={t.today.noPlan.description}
          actionLabel={t.today.noPlan.action}
          onAction={() => router.push('/schedule')}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer refreshing={isGenerating} onRefresh={handleRefresh}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text variant="caption" color="tertiary" weight="medium">
            {t.days.today.toUpperCase()}
          </Text>
          <Text variant="h2" weight="bold">
            {profile.name ? t.today.hiName(profile.name) : t.today.yourDay}
          </Text>
        </View>
        {!hasCheckedIn && (
          <Button
            label={t.today.checkIn}
            variant="secondary"
            size="sm"
            onPress={() => router.push('/checkin')}
          />
        )}
      </View>

      {/* Streak card */}
      <StreakCard checkIns={checkIns} t={t} />

      {/* Energy score */}
      <EnergyScoreCard score={plan.energyScore} readiness={plan.readinessLevel} />

      {/* Shift */}
      <ShiftCard shift={plan.shift} />

      {/* Sleep */}
      <SleepWindowCard sleepWindow={plan.sleepWindow} />

      {/* Caffeine */}
      <CaffeineCard guidance={plan.caffeineGuidance} />

      {/* Nap */}
      <NapCard nap={plan.napSuggestion} />

      {/* Meals */}
      <MealList meals={plan.mealSuggestions} />

      {/* Recovery tips */}
      <RecoveryTips tips={plan.recoveryTips} />

      {/* Plan explanation link */}
      <Button
        label={t.today.whyRecommendations}
        variant="ghost"
        size="sm"
        onPress={() => router.push('/plan-explanation')}
        style={{ alignSelf: 'center', marginTop: Spacing.sm }}
      />
    </ScreenContainer>
  );
}

// ─── StreakCard ───────────────────────────────────────────────────────────────

function StreakCard({
  checkIns,
  t,
}: {
  checkIns: DailyCheckIn[];
  t: Translations;
}) {
  const current = getCurrentStreak(checkIns);
  const longest  = getLongestStreak(checkIns);
  if (current === 0 && longest === 0) return null;

  return (
    <Card style={styles.streakCard}>
      <View style={styles.streakRow}>
        <Text style={{ fontSize: 20 }}>🔥</Text>
        <View style={{ flex: 1 }}>
          <Text variant="caption" color="secondary">{t.streak.current}</Text>
          <Text variant="body" weight="semibold" style={{ color: Palette.primary }}>
            {t.streak.days(current)}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text variant="caption" color="secondary">{t.streak.longest}</Text>
          <Text variant="bodySmall" weight="semibold" color="secondary">
            {t.streak.days(longest)}
          </Text>
        </View>
      </View>
    </Card>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.base,
    marginBottom: Spacing.base,
  },
  streakCard: {
    marginBottom: Spacing.sm,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
});
