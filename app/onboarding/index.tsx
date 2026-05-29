import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Spacing, Palette, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Analytics } from '@/services/analytics';
import { useTranslation } from '@/i18n';
import type { AppLanguage } from '@/store/languageStore';

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors } = useColorScheme();
  const { t, language, setLanguage } = useTranslation();

  React.useEffect(() => {
    Analytics.screen('onboarding_welcome');
  }, []);

  const FEATURES = [
    { emoji: '📅', text: t.welcome.features.sleep },
    { emoji: '☕', text: t.welcome.features.caffeine },
    { emoji: '⚡', text: t.welcome.features.energy },
    { emoji: '🔄', text: t.welcome.features.recovery },
  ];

  const LANGUAGES: { code: AppLanguage; label: string; flag: string }[] = [
    { code: 'en', label: 'EN', flag: '🇬🇧' },
    { code: 'pl', label: 'PL', flag: '🇵🇱' },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        {/* Language picker */}
        <View style={styles.langRow}>
          {LANGUAGES.map(lang => {
            const active = language === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                onPress={() => setLanguage(lang.code)}
                style={[
                  styles.langChip,
                  {
                    backgroundColor: active ? Palette.primary : colors.surfaceSecondary,
                    borderColor: active ? Palette.primary : colors.border,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text style={styles.langFlag}>{lang.flag}</Text>
                <Text
                  variant="bodySmall"
                  weight={active ? 'semibold' : 'regular'}
                  style={{ color: active ? '#fff' : colors.text }}
                >
                  {lang.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.top}>
          <Text style={styles.logo}>⚡</Text>
          <Text variant="h1" weight="bold" center style={{ marginTop: Spacing.md }}>
            {t.welcome.title}
          </Text>
          <Text variant="body" color="secondary" center style={styles.tagline}>
            {t.welcome.tagline}
          </Text>
        </View>

        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={{ fontSize: 22, width: 32 }}>{f.emoji}</Text>
              <Text variant="body" color="secondary" style={{ flex: 1 }}>{f.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.bottom}>
          <Button
            label={t.welcome.getStarted}
            fullWidth
            size="lg"
            onPress={() => {
              Analytics.onboardingStep('welcome_next');
              router.push('/onboarding/role');
            }}
          />
          <Text variant="caption" color="tertiary" center style={{ marginTop: Spacing.md }}>
            {t.welcome.noSignUp}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'space-between',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  langRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  langChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  langFlag: { fontSize: 14 },
  top: { alignItems: 'center' },
  logo: { fontSize: 56, lineHeight: 70 },
  tagline: {
    marginTop: Spacing.sm,
    lineHeight: 24,
  },
  features: {
    gap: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  bottom: {},
});
