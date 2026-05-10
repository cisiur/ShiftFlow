import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RatingSlider } from '@/components/features/RatingSlider';
import { Spacing, Palette } from '@/constants/theme';
import { useCheckInStore } from '@/store/checkInStore';
import { usePlanStore } from '@/store/planStore';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from '@/i18n';
import type { CheckInRating } from '@/types';
import { Analytics } from '@/services/analytics';
import * as Haptics from 'expo-haptics';

export default function CheckInScreen() {
  const router = useRouter();
  const { colors } = useColorScheme();
  const { t } = useTranslation();
  const { submitCheckIn, hasCheckedInToday, getTodayCheckIn } = useCheckInStore();
  const { generateToday } = usePlanStore();

  const existing = getTodayCheckIn();
  const [fatigue, setFatigue] = useState<CheckInRating>(existing?.fatigue ?? 3);
  const [sleepQuality, setSleepQuality] = useState<CheckInRating>(existing?.sleepQuality ?? 3);
  const [stress, setStress] = useState<CheckInRating>(existing?.stress ?? 3);
  const [alertness, setAlerter] = useState<CheckInRating>(existing?.alertness ?? 3);
  const [submitted, setSubmitted] = useState(false);

  React.useEffect(() => {
    Analytics.screen('check_in');
  }, []);

  const handleSubmit = () => {
    submitCheckIn({ fatigue, sleepQuality, stress, alertness });
    generateToday(); // Regenerate plan with new check-in data
    const avg = Math.round((fatigue + sleepQuality + stress + alertness) / 4);
    Analytics.checkInSubmitted(avg);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitted(true);
  };

  const ci = t.checkIn;

  if (submitted) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.success}>
          <Text style={{ fontSize: 56, textAlign: 'center' }}>✅</Text>
          <Text variant="h2" weight="bold" center style={{ marginTop: Spacing.md }}>
            {ci.saved}
          </Text>
          <Text variant="body" color="secondary" center>
            {ci.savedDesc}
          </Text>
          <Button
            label={ci.backToToday}
            fullWidth
            size="lg"
            onPress={() => router.back()}
            style={{ marginTop: Spacing.xl }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text variant="h2" weight="bold">{ci.title}</Text>
        <Button label={ci.cancel} variant="ghost" size="sm" onPress={() => router.back()} />
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <Text variant="body" color="secondary" style={{ marginBottom: Spacing.xl }}>
          {ci.subtitle}
        </Text>

        <Card style={{ gap: Spacing.xl }}>
          <RatingSlider
            label={ci.fatigue.label}
            value={fatigue}
            onChange={setFatigue}
            lowLabel={ci.fatigue.low}
            highLabel={ci.fatigue.high}
          />
          <RatingSlider
            label={ci.sleepQuality.label}
            value={sleepQuality}
            onChange={setSleepQuality}
            lowLabel={ci.sleepQuality.low}
            highLabel={ci.sleepQuality.high}
          />
          <RatingSlider
            label={ci.stress.label}
            value={stress}
            onChange={setStress}
            lowLabel={ci.stress.low}
            highLabel={ci.stress.high}
          />
          <RatingSlider
            label={ci.alertness.label}
            value={alertness}
            onChange={setAlerter}
            lowLabel={ci.alertness.low}
            highLabel={ci.alertness.high}
          />
        </Card>

        <Text variant="caption" color="tertiary" center style={{ marginTop: Spacing.md }}>
          {ci.privacy}
        </Text>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <Button
          label={ci.save}
          fullWidth
          size="lg"
          onPress={handleSubmit}
        />
      </View>
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
  form: {
    paddingHorizontal: Spacing.base,
    paddingBottom: 120,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.base,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
  },
  success: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['3xl'],
    gap: Spacing.md,
  },
});
