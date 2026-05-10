import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { SelectOption } from '@/components/ui/SelectOption';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { Spacing } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from '@/i18n';
import type { ShiftPattern } from '@/types';
import { Analytics } from '@/services/analytics';

export default function ShiftPatternScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { colors } = useColorScheme();
  const { t } = useTranslation();
  const updateProfile = useUserStore(s => s.updateProfile);
  const profile = useUserStore(s => s.profile);
  const [selected, setSelected] = useState<ShiftPattern | null>(profile?.shiftPattern ?? null);

  const handleNext = () => {
    if (!selected) return;
    updateProfile({ shiftPattern: selected });
    Analytics.onboardingStep('shift_pattern_selected');
    router.push('/onboarding/sleep-profile');
  };

  // Build options from translations
  const patternOptions = (Object.keys(t.patterns) as ShiftPattern[]).map(key => ({
    value: key,
    label: t.patterns[key].label,
    description: t.patterns[key].description,
  }));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <ProgressDots total={6} current={1} />
        <Text variant="h2" weight="bold" style={{ marginTop: Spacing.xl }}>
          {t.shiftPattern.title}
        </Text>
        <Text variant="body" color="secondary" style={{ marginTop: Spacing.xs }}>
          {t.shiftPattern.subtitle}
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {patternOptions.map(opt => (
          <SelectOption
            key={opt.value}
            label={opt.label}
            description={opt.description}
            selected={selected === opt.value}
            onPress={() => setSelected(opt.value)}
          />
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background, paddingBottom: Math.max(insets.bottom, Spacing.base) + Spacing.base }]}>
        <Button
          label={t.common.continue}
          fullWidth
          size="lg"
          disabled={!selected}
          onPress={handleNext}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: Spacing.base, paddingTop: Spacing.xl, paddingBottom: Spacing.base },
  list: { paddingHorizontal: Spacing.base, gap: Spacing.sm },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    borderTopWidth: 1,
  },
});
