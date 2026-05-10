import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spacing, Palette } from '@/constants/theme';
import { usePlanStore } from '@/store/planStore';
import { useUserStore } from '@/store/userStore';
import { useCheckInStore } from '@/store/checkInStore';
import { usePremiumStore } from '@/store/premiumStore';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from '@/i18n';
import { AIService } from '@/services/ai';
import { Analytics } from '@/services/analytics';
import type { AIExplanationResponse } from '@/types';
import { formatTimeDisplay } from '@/utils/time';
import { useTimeFormat } from '@/hooks/useTimeFormat';

export default function PlanExplanationScreen() {
  const router = useRouter();
  const { colors } = useColorScheme();
  const { t } = useTranslation();
  const use12h = useTimeFormat();
  const plan = usePlanStore(s => s.todayPlan);
  const profile = useUserStore(s => s.profile);
  const latestCheckIn = useCheckInStore(s => s.getRecentCheckIns(1))[0];
  const { isPremium } = usePremiumStore();

  const [explanation, setExplanation] = useState<AIExplanationResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Analytics.screen('plan_explanation');
    if (!plan || !profile) return;
    setLoading(true);
    AIService.generateExplanation({ plan, profile, checkIn: latestCheckIn })
      .then(setExplanation)
      .finally(() => setLoading(false));
  }, []);

  const pe = t.planExplanation;

  if (!plan) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Button label={pe.close} variant="ghost" size="sm" onPress={() => router.back()} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="body" color="secondary">{pe.noPlan}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Resolve translated caffeine sensitivity label
  const sensitivityOption = t.caffeineOptions.find(o => o.value === profile?.caffeineSensitivity);
  const sensitivityLabel = sensitivityOption?.label?.toLowerCase() ?? (profile?.caffeineSensitivity ?? '');
  const cutoffHours = profile?.caffeineSensitivity === 'high' ? '8' : profile?.caffeineSensitivity === 'low' ? '4' : '6';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text variant="h3" weight="bold">{pe.title}</Text>
        <Button label={pe.close} variant="ghost" size="sm" onPress={() => router.back()} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary */}
        <Card style={styles.card}>
          <View style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' }}>
            <Text style={{ fontSize: 20 }}>📋</Text>
            <Text variant="label" color="secondary">{pe.summary}</Text>
          </View>
          {loading ? (
            <ActivityIndicator color={Palette.primary} style={{ marginTop: Spacing.md }} />
          ) : (
            <Text variant="body" color="secondary" style={{ lineHeight: 22 }}>
              {explanation?.summary ?? plan.explanationSummary}
            </Text>
          )}
        </Card>

        {/* Sleep explanation */}
        {plan.sleepWindow && (
          <Card style={styles.card}>
            <View style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' }}>
              <Text style={{ fontSize: 20 }}>😴</Text>
              <Text variant="label" color="secondary">{pe.sleepWindow}</Text>
            </View>
            <Text variant="h3" weight="semibold" style={{ color: Palette.primary }}>
              {formatTimeDisplay(plan.sleepWindow.start, use12h)} → {formatTimeDisplay(plan.sleepWindow.end, use12h)}
            </Text>
            <Text variant="bodySmall" color="secondary" style={{ lineHeight: 20 }}>
              {pe.sleepDesc}
              {plan.sleepWindow.durationHours < 7 && pe.sleepLow}
            </Text>
          </Card>
        )}

        {/* Caffeine explanation */}
        <Card style={styles.card}>
          <View style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' }}>
            <Text style={{ fontSize: 20 }}>☕</Text>
            <Text variant="label" color="secondary">{pe.caffeineTitle}</Text>
          </View>
          <Text variant="h3" weight="semibold" style={{ color: Palette.primary }}>
            {formatTimeDisplay(plan.caffeineGuidance.cutoffTime, use12h)}
          </Text>
          <Text variant="bodySmall" color="secondary" style={{ lineHeight: 20 }}>
            {pe.caffeineDesc(sensitivityLabel, cutoffHours)}
          </Text>
        </Card>

        {/* Nap explanation */}
        {plan.napSuggestion?.recommended && (
          <Card style={styles.card}>
            <View style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' }}>
              <Text style={{ fontSize: 20 }}>💤</Text>
              <Text variant="label" color="secondary">{pe.napTitle}</Text>
            </View>
            <Text variant="bodySmall" color="secondary" style={{ lineHeight: 20 }}>
              {plan.napSuggestion.reason}
            </Text>
          </Card>
        )}

        {/* Energy score */}
        <Card style={styles.card}>
          <View style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' }}>
            <Text style={{ fontSize: 20 }}>⚡</Text>
            <Text variant="label" color="secondary">{pe.energyTitle(plan.energyScore)}</Text>
          </View>
          <Text variant="bodySmall" color="secondary" style={{ lineHeight: 20 }}>
            {pe.energyDesc}
            {plan.energyScore <= 35 && pe.energyLow}
          </Text>
        </Card>

        {/* Premium upsell for AI tips */}
        {!isPremium() && (
          <Card style={[styles.card, { borderColor: Palette.primary }]}>
            <View style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' }}>
              <Text style={{ fontSize: 20 }}>⭐</Text>
              <Text variant="label" style={{ color: Palette.primary }}>{pe.premiumTitle}</Text>
            </View>
            <Text variant="bodySmall" color="secondary">
              {pe.premiumDesc}
            </Text>
            <Button
              label={pe.premiumCta}
              size="sm"
              onPress={() => router.push('/paywall')}
              style={{ marginTop: Spacing.sm }}
            />
          </Card>
        )}

        <Text variant="caption" color="tertiary" center style={{ marginTop: Spacing.md }}>
          {pe.disclaimer}
        </Text>

        <View style={{ height: Spacing['2xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
    paddingTop: Spacing.xl,
  },
  content: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
  },
  card: { gap: Spacing.sm },
});
