import React, { useState } from 'react';
import { View, Switch, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { Divider } from '@/components/ui/Divider';
import { Spacing, Palette } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from '@/i18n';
import { requestNotificationPermissions } from '@/services/notifications';
import { Analytics } from '@/services/analytics';
import type { NotificationPreference } from '@/types';

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors } = useColorScheme();
  const { t } = useTranslation();
  const updateProfile = useUserStore(s => s.updateProfile);
  const profile = useUserStore(s => s.profile);

  const [prefs, setPrefs] = useState<NotificationPreference>(
    profile?.notifications ?? {
      enabled: true,
      frequency: 'moderate',
      sleepReminder: true,
      caffeineReminder: true,
      napReminder: true,
      shiftReminder: true,
      checkInReminder: true,
    },
  );

  const toggle = (key: keyof NotificationPreference) => {
    setPrefs(p => ({ ...p, [key]: !p[key] }));
  };

  const handleNext = async () => {
    if (prefs.enabled) {
      await requestNotificationPermissions();
    }
    updateProfile({ notifications: prefs });
    Analytics.onboardingStep('notifications_set');
    router.push('/onboarding/goals');
  };

  type ToggleKey = 'sleepReminder' | 'caffeineReminder' | 'napReminder' | 'shiftReminder' | 'checkInReminder';

  const TOGGLES: { key: ToggleKey; label: string; desc: string }[] = [
    { key: 'sleepReminder',    ...t.notifications.toggles.sleepReminder },
    { key: 'caffeineReminder', ...t.notifications.toggles.caffeineReminder },
    { key: 'napReminder',      ...t.notifications.toggles.napReminder },
    { key: 'shiftReminder',    ...t.notifications.toggles.shiftReminder },
    { key: 'checkInReminder',  ...t.notifications.toggles.checkInReminder },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <View>
          <ProgressDots total={6} current={4} />
          <Text variant="h2" weight="bold" style={{ marginTop: Spacing.xl }}>
            {t.notifications.title}
          </Text>
          <Text variant="body" color="secondary" style={{ marginTop: Spacing.xs, marginBottom: Spacing.xl }}>
            {t.notifications.subtitle}
          </Text>

          <Card style={styles.masterToggle}>
            <Text variant="body" weight="semibold">{t.notifications.enableLabel}</Text>
            <Switch
              value={prefs.enabled}
              onValueChange={() => toggle('enabled')}
              trackColor={{ false: colors.border, true: Palette.primary }}
              thumbColor="#FFF"
            />
          </Card>

          {prefs.enabled && (
            <Card style={styles.toggleList}>
              {TOGGLES.map((item, i) => (
                <View key={item.key}>
                  {i > 0 && <Divider style={{ marginVertical: 0 }} />}
                  <View style={styles.toggleRow}>
                    <View style={{ flex: 1 }}>
                      <Text variant="body" weight="medium">{item.label}</Text>
                      <Text variant="caption" color="tertiary">{item.desc}</Text>
                    </View>
                    <Switch
                      value={prefs[item.key] as boolean}
                      onValueChange={() => toggle(item.key)}
                      trackColor={{ false: colors.border, true: Palette.primary }}
                      thumbColor="#FFF"
                    />
                  </View>
                </View>
              ))}
            </Card>
          )}
        </View>

        <View style={styles.bottom}>
          <Button
            label={t.common.continue}
            fullWidth
            size="lg"
            onPress={handleNext}
          />
          <Button
            label={t.notifications.skipButton}
            variant="ghost"
            fullWidth
            size="md"
            onPress={() => {
              updateProfile({ notifications: { ...prefs, enabled: false } });
              router.push('/onboarding/goals');
            }}
            style={{ marginTop: Spacing.sm }}
          />
        </View>
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
  masterToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  toggleList: {
    gap: 0,
    padding: 0,
    overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  bottom: {},
});
