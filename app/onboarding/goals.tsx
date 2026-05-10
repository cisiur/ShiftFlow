import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { SelectOption } from '@/components/ui/SelectOption';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { Spacing } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from '@/i18n';
import type { Goal } from '@/types';
import { Analytics } from '@/services/analytics';

export default function GoalsScreen() {
  const router = useRouter();
  const { colors } = useColorScheme();
  const { t } = useTranslation();
  const updateProfile = useUserStore(s => s.updateProfile);
  const completeOnboarding = useUserStore(s => s.completeOnboarding);
  const profile = useUserStore(s => s.profile);
  const [selected, setSelected] = useState<Set<Goal>>(new Set(profile?.goals ?? []));

  const toggle = (goal: Goal) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(goal)) next.delete(goal);
      else next.add(goal);
      return next;
    });
  };

  const handleFinish = () => {
    const goals = Array.from(selected) as Goal[];
    updateProfile({ goals: goals.length > 0 ? goals : ['better_sleep'] });
    completeOnboarding();
    Analytics.onboardingStep('goals_complete');
    router.replace('/(tabs)');
  };

  const goalOptions = (Object.keys(t.goalOptions) as Goal[]).map(key => ({
    value: key,
    label: t.goalOptions[key].label,
    description: t.goalOptions[key].description,
    icon: getGoalIcon(key),
  }));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <View>
          <ProgressDots total={6} current={5} />
          <Text variant="h2" weight="bold" style={{ marginTop: Spacing.xl }}>
            {t.goals.title}
          </Text>
          <Text variant="body" color="secondary" style={{ marginTop: Spacing.xs, marginBottom: Spacing.xl }}>
            {t.goals.subtitle}
          </Text>
          <View style={{ gap: Spacing.sm }}>
            {goalOptions.map(opt => (
              <SelectOption
                key={opt.value}
                label={opt.label}
                description={opt.description}
                icon={opt.icon}
                selected={selected.has(opt.value)}
                onPress={() => toggle(opt.value)}
              />
            ))}
          </View>
        </View>

        <View style={styles.bottom}>
          <Button
            label={selected.size > 0 ? t.goals.buildPlan : t.goals.startWithDefaults}
            fullWidth
            size="lg"
            onPress={handleFinish}
          />
          <Text variant="caption" color="tertiary" center style={{ marginTop: Spacing.sm }}>
            {t.goals.caption}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function getGoalIcon(goal: Goal): string {
  const icons: Record<Goal, string> = {
    better_sleep:   '😴',
    less_fatigue:   '⚡',
    shift_recovery: '🔄',
    stable_routine: '📅',
  };
  return icons[goal];
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    justifyContent: 'space-between',
  },
  bottom: {},
});
