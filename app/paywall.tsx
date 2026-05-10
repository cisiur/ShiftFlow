import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spacing, Palette } from '@/constants/theme';
import { usePremiumStore } from '@/store/premiumStore';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Analytics } from '@/services/analytics';
import * as Haptics from 'expo-haptics';

const PREMIUM_FEATURES = [
  { icon: '🤖', label: 'AI-powered plan explanations', desc: 'Personalised reasons behind every recommendation' },
  { icon: '📊', label: 'Adaptive recovery plans', desc: 'Plans that learn from your daily check-ins' },
  { icon: '📥', label: 'Schedule import', desc: 'Upload a photo or document of your roster' },
  { icon: '📈', label: 'Trend insights', desc: 'See your sleep, energy, and fatigue over time' },
  { icon: '🔔', label: 'Smart reminders', desc: 'Context-aware alerts based on your shift type' },
];

const FREE_FEATURES = [
  'Manual schedule entry',
  'Today\'s energy plan',
  'Basic weekly overview',
  'Standard reminders',
  'Daily check-ins',
];

export default function PaywallScreen() {
  const router = useRouter();
  const { colors } = useColorScheme();
  const { activatePremium, isPremium } = usePremiumStore();
  const [purchasing, setPurchasing] = useState(false);

  React.useEffect(() => {
    Analytics.screen('paywall');
  }, []);

  const handlePurchase = async () => {
    setPurchasing(true);
    // TODO: Replace with real IAP (expo-in-app-purchases or RevenueCat)
    await new Promise(r => setTimeout(r, 1200)); // simulate network
    activatePremium();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Analytics.premiumPurchased('premium');
    setPurchasing(false);
    router.back();
  };

  if (isPremium()) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Button label="Close" variant="ghost" size="sm" onPress={() => router.back()} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl }}>
          <Text style={{ fontSize: 56, textAlign: 'center' }}>⭐</Text>
          <Text variant="h2" weight="bold" center style={{ marginTop: Spacing.md }}>
            You're on Premium
          </Text>
          <Text variant="body" color="secondary" center>
            All features are unlocked. Thank you for supporting ShiftFlow.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View />
        <Button label="Close" variant="ghost" size="sm" onPress={() => router.back()} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={{ fontSize: 56, textAlign: 'center' }}>⭐</Text>
          <Text variant="h2" weight="bold" center style={{ marginTop: Spacing.md }}>
            ShiftFlow Premium
          </Text>
          <Text variant="body" color="secondary" center>
            Everything you need to recover better, sleep smarter, and thrive on any shift.
          </Text>
        </View>

        {/* Premium features */}
        <Card style={styles.featureCard}>
          <Text variant="label" weight="semibold" style={{ color: Palette.primary, marginBottom: Spacing.sm }}>
            PREMIUM INCLUDES
          </Text>
          {PREMIUM_FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={{ fontSize: 22, width: 32 }}>{f.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text variant="body" weight="semibold">{f.label}</Text>
                <Text variant="caption" color="secondary">{f.desc}</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Free tier reminder */}
        <Card style={styles.freeCard}>
          <Text variant="label" color="secondary" style={{ marginBottom: Spacing.sm }}>FREE TIER INCLUDES</Text>
          {FREE_FEATURES.map((f, i) => (
            <View key={i} style={styles.freeRow}>
              <Text style={{ color: Palette.success, fontSize: 14, fontFamily: 'Inter_700Bold' }}>✓</Text>
              <Text variant="bodySmall" color="secondary">{f}</Text>
            </View>
          ))}
        </Card>

        {/* Pricing */}
        <Card style={[styles.pricingCard, { borderColor: Palette.primary }]}>
          <View style={styles.priceRow}>
            <View>
              <Text variant="h2" weight="bold" style={{ color: Palette.primary }}>$4.99</Text>
              <Text variant="caption" color="secondary">per month</Text>
            </View>
            <View style={styles.priceAlt}>
              <Text variant="body" weight="bold">$39.99</Text>
              <Text variant="caption" color="secondary">per year  · save 33%</Text>
            </View>
          </View>
        </Card>

        <Text variant="caption" color="tertiary" center style={{ marginTop: Spacing.sm }}>
          Cancel anytime. No hidden fees. Payments are handled securely.
        </Text>
        <Text variant="caption" color="tertiary" center>
          {/* DEV note */}
          {__DEV__ ? '⚙️ DEV: Purchase is mocked — no real payment.' : ''}
        </Text>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <Button
          label="Start Premium — $4.99/mo"
          fullWidth
          size="lg"
          loading={purchasing}
          onPress={handlePurchase}
        />
        <Button
          label="Restore purchase"
          variant="ghost"
          fullWidth
          size="sm"
          onPress={() => {}} // TODO: implement restore
          style={{ marginTop: Spacing.xs }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: Spacing.base,
    paddingTop: Spacing.xl,
  },
  content: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
    paddingBottom: 20,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  featureCard: { gap: Spacing.md },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  freeCard: { gap: Spacing.sm },
  freeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  pricingCard: {
    borderWidth: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceAlt: {
    alignItems: 'flex-end',
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
});
