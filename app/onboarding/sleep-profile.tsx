import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { SelectOption } from '@/components/ui/SelectOption';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { Card } from '@/components/ui/Card';
import { Spacing, Palette, Radius } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from '@/i18n';
import type { SleepDifficulty } from '@/types';
import { Analytics } from '@/services/analytics';

const SLEEP_HOURS_OPTIONS = [6, 7, 8, 9];

const SLEEP_ICONS: Record<SleepDifficulty, string> = {
  easy: '😌',
  moderate: '😐',
  hard: '😫',
};

export default function SleepProfileScreen() {
  const router       = useRouter();
  const insets       = useSafeAreaInsets();
  const { colors }   = useColorScheme();
  const { t }        = useTranslation();
  const updateProfile = useUserStore(s => s.updateProfile);
  const profile      = useUserStore(s => s.profile);

  const [difficulty,   setDifficulty]  = useState<SleepDifficulty>(profile?.sleepDifficulty ?? 'moderate');
  const [targetHours,  setTargetHours] = useState(profile?.targetSleepHours ?? 8);
  const [prepTime,     setPrepTime]    = useState(profile?.prepTimeMinutes ?? 30);
  const [timeFormat,   setTimeFormat]  = useState<'12h' | '24h'>(profile?.timeFormat ?? '24h');

  const handleNext = () => {
    updateProfile({ sleepDifficulty: difficulty, targetSleepHours: targetHours, prepTimeMinutes: prepTime, timeFormat });
    Analytics.onboardingStep('sleep_profile_set');
    router.push('/onboarding/caffeine');
  };

  const sleepOptions: { value: SleepDifficulty; label: string; description: string; icon: string }[] = [
    { value: 'easy',     ...t.sleepProfile.sleepOptions.easy,     icon: SLEEP_ICONS.easy },
    { value: 'moderate', ...t.sleepProfile.sleepOptions.moderate, icon: SLEEP_ICONS.moderate },
    { value: 'hard',     ...t.sleepProfile.sleepOptions.hard,     icon: SLEEP_ICONS.hard },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + Spacing.base }]}
        showsVerticalScrollIndicator={false}
      >
        <ProgressDots total={6} current={2} />
        <Text variant="h2" weight="bold" style={{ marginTop: Spacing.xl }}>{t.sleepProfile.title}</Text>
        <Text variant="body" color="secondary" style={{ marginTop: Spacing.xs, marginBottom: Spacing.xl }}>
          {t.sleepProfile.subtitle}
        </Text>

        {/* Sleep difficulty */}
        <View style={{ gap: Spacing.sm, marginBottom: Spacing.xl }}>
          {sleepOptions.map(opt => (
            <SelectOption
              key={opt.value}
              label={opt.label}
              description={opt.description}
              icon={opt.icon}
              selected={difficulty === opt.value}
              onPress={() => setDifficulty(opt.value)}
            />
          ))}
        </View>

        {/* Target sleep hours */}
        <Text variant="body" weight="medium" style={{ marginBottom: Spacing.md }}>
          {t.sleepProfile.targetSleepTitle}
        </Text>
        <Card style={styles.hoursRow}>
          {SLEEP_HOURS_OPTIONS.map(h => (
            <TouchableOpacity
              key={h}
              style={[
                styles.hourChip,
                {
                  backgroundColor: targetHours === h ? Palette.primary : colors.surfaceSecondary,
                  borderColor:     targetHours === h ? Palette.primary : colors.border,
                },
              ]}
              onPress={() => setTargetHours(h)}
              activeOpacity={0.7}
            >
              <Text
                variant="body"
                weight={targetHours === h ? 'semibold' : 'regular'}
                style={{ color: targetHours === h ? '#fff' : colors.text }}
              >
                {h}h
              </Text>
            </TouchableOpacity>
          ))}
        </Card>
        <Text variant="caption" color="tertiary" style={{ marginTop: Spacing.sm, marginBottom: Spacing.xl }}>
          {t.sleepProfile.targetSleepHint}
        </Text>

        {/* Prep / commute time */}
        <Text variant="body" weight="medium" style={{ marginBottom: Spacing.xs }}>
          {t.sleepProfile.prepTimeTitle}
        </Text>
        <Text variant="caption" color="secondary" style={{ marginBottom: Spacing.md }}>
          {t.sleepProfile.prepTimeSubtitle}
        </Text>
        <View style={{ gap: Spacing.sm }}>
          {t.prepTimeOptions.map(opt => (
            <SelectOption
              key={opt.value}
              label={opt.label}
              description={opt.desc}
              selected={prepTime === opt.value}
              onPress={() => setPrepTime(opt.value)}
            />
          ))}
        </View>

        {/* Time format */}
        <Text variant="body" weight="medium" style={{ marginTop: Spacing.xl, marginBottom: Spacing.md }}>
          {t.settings.timeFormat.label}
        </Text>
        <Card style={styles.hoursRow}>
          {(['24h', '12h'] as const).map(fmt => (
            <TouchableOpacity
              key={fmt}
              style={[
                styles.hourChip,
                {
                  backgroundColor: timeFormat === fmt ? Palette.primary : colors.surfaceSecondary,
                  borderColor:     timeFormat === fmt ? Palette.primary : colors.border,
                  flex: 1,
                },
              ]}
              onPress={() => setTimeFormat(fmt)}
              activeOpacity={0.7}
            >
              <Text
                variant="body"
                weight={timeFormat === fmt ? 'semibold' : 'regular'}
                style={{ color: timeFormat === fmt ? '#fff' : colors.text }}
              >
                {fmt === '24h' ? t.settings.timeFormat.h24 : t.settings.timeFormat.h12}
              </Text>
            </TouchableOpacity>
          ))}
        </Card>

        {/* Continue button */}
        <Button
          label={t.common.continue}
          fullWidth
          size="lg"
          onPress={handleNext}
          style={{ marginTop: Spacing.xl }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xl,
  },
  hoursRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'space-between',
    padding: Spacing.sm,
  },
  hourChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
});
