import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { SelectOption } from '@/components/ui/SelectOption';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { Card } from '@/components/ui/Card';
import { Spacing, Palette } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from '@/i18n';
import type { CaffeineSensitivity } from '@/types';
import { Analytics } from '@/services/analytics';

export default function CaffeineScreen() {
  const router = useRouter();
  const { colors } = useColorScheme();
  const { t } = useTranslation();
  const updateProfile = useUserStore(s => s.updateProfile);
  const profile = useUserStore(s => s.profile);
  const [selected, setSelected] = useState<CaffeineSensitivity>(profile?.caffeineSensitivity ?? 'medium');

  const handleNext = () => {
    updateProfile({ caffeineSensitivity: selected });
    Analytics.onboardingStep('caffeine_set');
    router.push('/onboarding/notifications');
  };

  const options: { value: CaffeineSensitivity; label: string; description: string; icon: string; cutoff: string }[] = [
    { value: 'low',    icon: '😎', ...t.caffeine.options.low },
    { value: 'medium', icon: '😊', ...t.caffeine.options.medium },
    { value: 'high',   icon: '😬', ...t.caffeine.options.high },
  ];

  const selectedOption = options.find(o => o.value === selected);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <View>
          <ProgressDots total={6} current={3} />
          <Text variant="h2" weight="bold" style={{ marginTop: Spacing.xl }}>
            {t.caffeine.title}
          </Text>
          <Text variant="body" color="secondary" style={{ marginTop: Spacing.xs, marginBottom: Spacing.xl }}>
            {t.caffeine.subtitle}
          </Text>

          <View style={{ gap: Spacing.sm, marginBottom: Spacing.xl }}>
            {options.map(opt => (
              <SelectOption
                key={opt.value}
                label={opt.label}
                description={opt.description}
                icon={opt.icon}
                selected={selected === opt.value}
                onPress={() => setSelected(opt.value)}
              />
            ))}
          </View>

          {selectedOption && (
            <Card style={styles.info}>
              <Text style={{ fontSize: 18 }}>☕</Text>
              <Text variant="bodySmall" color="secondary" style={{ flex: 1 }}>
                {t.caffeine.cutoffNote}{' '}
                <Text variant="bodySmall" weight="semibold" style={{ color: Palette.primary }}>
                  {selectedOption.cutoff}
                </Text>
                {' '}{t.caffeine.cutoffSuffix}
              </Text>
            </Card>
          )}
        </View>

        <Button
          label={t.common.continue}
          fullWidth
          size="lg"
          onPress={handleNext}
          style={{ marginTop: Spacing.xl }}
        />
      </View>
    </SafeAreaView>
  );
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
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
});
