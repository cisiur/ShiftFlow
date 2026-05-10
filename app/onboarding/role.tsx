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
import type { WorkRole } from '@/types';
import { Analytics } from '@/services/analytics';

export default function RoleScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { colors } = useColorScheme();
  const { t } = useTranslation();
  const initProfile = useUserStore(s => s.initProfile);
  const updateProfile = useUserStore(s => s.updateProfile);
  const profile = useUserStore(s => s.profile);
  const [selected, setSelected] = useState<WorkRole | null>(profile?.role ?? null);

  const handleNext = () => {
    if (!selected) return;
    if (!profile) {
      initProfile({ role: selected });
    } else {
      updateProfile({ role: selected });
    }
    Analytics.onboardingStep('role_selected');
    router.push('/onboarding/shift-pattern');
  };

  // Build options from translations
  const roleOptions = (Object.keys(t.roles) as WorkRole[]).map(key => ({
    value: key,
    label: t.roles[key].label,
    icon: getRoleIcon(key),
  }));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <ProgressDots total={6} current={0} />
        <Text variant="h2" weight="bold" style={{ marginTop: Spacing.xl }}>
          {t.role.title}
        </Text>
        <Text variant="body" color="secondary" style={{ marginTop: Spacing.xs }}>
          {t.role.subtitle}
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {roleOptions.map(opt => (
          <SelectOption
            key={opt.value}
            label={opt.label}
            icon={opt.icon}
            selected={selected === opt.value}
            onPress={() => setSelected(opt.value)}
          />
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
      {/* Only render footer when something is selected */}
      {selected && (
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background, paddingBottom: Math.max(insets.bottom, Spacing.base) + Spacing.base }]}>
          <Button
            label={t.common.continue}
            fullWidth
            size="lg"
            onPress={handleNext}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

function getRoleIcon(role: WorkRole): string {
  const icons: Record<WorkRole, string> = {
    nurse:          '🏥',
    doctor:         '⚕️',
    paramedic:      '🚑',
    factory_worker: '🏭',
    retail:         '🛒',
    security:       '🔐',
    driver:         '🚛',
    hospitality:    '🏨',
    warehouse:      '📦',
    other:          '💼',
  };
  return icons[role];
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
