import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card, PressableCard } from '@/components/ui/Card';
import { Spacing, Palette, Radius } from '@/constants/theme';
import { usePremiumStore } from '@/store/premiumStore';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Analytics } from '@/services/analytics';
import {
  getOfferings,
  purchaseProduct,
  restorePurchases,
  type ProductInfo,
  type ProductPeriod,
} from '@/services/purchases';
import * as Haptics from 'expo-haptics';

// ─── Feature lists ────────────────────────────────────────────────────────────

const PREMIUM_FEATURES = [
  { icon: '🤖', label: 'AI-powered plan explanations', desc: 'Personalised reasons behind every recommendation' },
  { icon: '📊', label: 'Adaptive recovery plans',      desc: 'Plans that learn from your daily check-ins' },
  { icon: '📥', label: 'Schedule import',              desc: 'Upload a photo of your roster — AI reads it for you' },
  { icon: '📈', label: 'Trend insights',               desc: 'See your sleep, energy, and fatigue over time' },
  { icon: '🔔', label: 'Smart reminders',              desc: 'Context-aware alerts based on your shift type' },
];

const FREE_FEATURES = [
  'Manual schedule entry',
  "Today's energy plan",
  'Basic weekly overview',
  'Standard reminders',
  'Daily check-ins',
];

// ─── Period display helpers ───────────────────────────────────────────────────

function periodLabel(period: ProductPeriod): string {
  if (period === 'monthly')  return 'per month';
  if (period === 'yearly')   return 'per year';
  return 'one-time';
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PaywallScreen() {
  const router = useRouter();
  const { colors } = useColorScheme();
  const { activatePremium, deactivatePremium, isPremium } = usePremiumStore();
  const insets = useSafeAreaInsets();

  const [products,     setProducts]     = useState<ProductInfo[]>([]);
  const [selected,     setSelected]     = useState<string | null>(null);
  const [purchasing,   setPurchasing]   = useState(false);
  const [restoring,    setRestoring]    = useState(false);
  const [loadingOffer, setLoadingOffer] = useState(true);

  useEffect(() => {
    Analytics.screen('paywall');
    getOfferings().then(prods => {
      setProducts(prods);
      // pre-select monthly
      const monthly = prods.find(p => p.period === 'monthly');
      if (monthly) setSelected(monthly.identifier);
      setLoadingOffer(false);
    });
  }, []);

  const monthly  = products.find(p => p.period === 'monthly');
  const yearly   = products.find(p => p.period === 'yearly');

  const savingsPct = monthly && yearly
    ? Math.round((1 - yearly.price / (monthly.price * 12)) * 100)
    : 33;

  const selectedProduct = products.find(p => p.identifier === selected);

  // ── Purchase ──

  const handlePurchase = async () => {
    if (!selectedProduct) return;
    setPurchasing(true);
    try {
      const result = await purchaseProduct(selectedProduct.identifier);
      if (result.success && result.isPremium) {
        activatePremium();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Analytics.premiumPurchased(selectedProduct.identifier);
        router.back();
      } else if (result.error) {
        Alert.alert('Purchase failed', result.error);
      }
    } catch (err: any) {
      Alert.alert('Purchase error', err?.message ?? 'Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  // ── Restore ──

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const result = await restorePurchases();
      if (result.isPremium) {
        activatePremium();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Restored', 'Your premium access has been restored.');
        router.back();
      } else {
        deactivatePremium();
        Alert.alert('Nothing to restore', 'No active subscription found for this account.');
      }
    } catch (err: any) {
      Alert.alert('Restore failed', err?.message ?? 'Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  // ── Already premium ──

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

  // ── Paywall ──

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View />
        <Button label="Close" variant="ghost" size="sm" onPress={() => router.back()} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 140 + insets.bottom }]} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={{ fontSize: 56, textAlign: 'center' }}>⭐</Text>
          <Text variant="h2" weight="bold" center style={{ marginTop: Spacing.md }}>
            ShiftFlow Pro
          </Text>
          <Text variant="body" color="secondary" center>
            Everything you need to recover better, sleep smarter, and thrive on any shift.
          </Text>
        </View>

        {/* Premium feature list */}
        <Card style={styles.featureCard}>
          <Text variant="label" weight="semibold" style={{ color: Palette.primary, marginBottom: Spacing.sm }}>
            PRO INCLUDES
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

        {/* Free tier */}
        <Card style={styles.freeCard}>
          <Text variant="label" color="secondary" style={{ marginBottom: Spacing.sm }}>FREE TIER INCLUDES</Text>
          {FREE_FEATURES.map((f, i) => (
            <View key={i} style={styles.freeRow}>
              <Text style={{ color: Palette.success, fontSize: 14, fontFamily: 'Inter_700Bold' }}>✓</Text>
              <Text variant="bodySmall" color="secondary">{f}</Text>
            </View>
          ))}
        </Card>

        {/* Plan selector */}
        {loadingOffer ? (
          <Card><Text variant="body" color="secondary" center>Loading prices…</Text></Card>
        ) : (
          <>
            {/* Subscription row (monthly + yearly side by side) */}
            <View style={styles.planRow}>
              {monthly && (
                <PlanCard
                  product={monthly}
                  selected={selected === monthly.identifier}
                  onSelect={() => setSelected(monthly.identifier)}
                  colors={colors}
                />
              )}
              {yearly && (
                <PlanCard
                  product={yearly}
                  selected={selected === yearly.identifier}
                  badge={`Save ${savingsPct}%`}
                  onSelect={() => setSelected(yearly.identifier)}
                  colors={colors}
                />
              )}
            </View>

          </>
        )}

        <Text variant="caption" color="tertiary" center style={{ marginTop: Spacing.sm }}>
          Cancel anytime. Payments handled securely via Google Play.
        </Text>
        {__DEV__ && (
          <Text variant="caption" color="tertiary" center>
            ⚙️ DEV: {products[0]?.priceString ? 'prices loaded' : 'mock prices'}
          </Text>
        )}

      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background, paddingBottom: insets.bottom + Spacing.md }]}>
        <Button
          label={
            purchasing ? 'Processing…'
              : selectedProduct
                ? `Get Pro — ${selectedProduct.priceString}${selectedProduct.period !== 'lifetime' ? `/${selectedProduct.period === 'monthly' ? 'mo' : 'yr'}` : ''}`
                : 'Select a plan'
          }
          fullWidth
          size="lg"
          loading={purchasing}
          disabled={!selectedProduct || loadingOffer}
          onPress={handlePurchase}
        />
        <Button
          label={restoring ? 'Restoring…' : 'Restore purchase'}
          variant="ghost"
          fullWidth
          size="sm"
          loading={restoring}
          onPress={handleRestore}
          style={{ marginTop: Spacing.xs }}
        />
      </View>
    </SafeAreaView>
  );
}

// ─── PlanCard ─────────────────────────────────────────────────────────────────

interface PlanCardProps {
  product:  ProductInfo;
  selected: boolean;
  badge?:   string;
  onSelect: () => void;
  colors:   ReturnType<typeof import('@/hooks/useColorScheme').useColorScheme>['colors'];
}

function PlanCard({ product, selected, badge, onSelect, colors }: PlanCardProps) {
  const borderColor = selected ? Palette.primary : colors.border;
  const bg          = selected ? Palette.primaryLight : colors.surface;

  return (
    <PressableCard
      onPress={onSelect}
      style={[
        styles.planCard,
        { borderColor, backgroundColor: bg, borderWidth: selected ? 2 : 1 },
      ]}
    >
      {badge && (
        <View style={[styles.badge, { backgroundColor: Palette.primary }]}>
          <Text variant="caption" weight="bold" style={{ color: '#fff' }}>{badge}</Text>
        </View>
      )}
      <Text variant="h2" weight="bold" style={{ color: selected ? Palette.primary : colors.text }}>
        {product.priceString}
      </Text>
      <Text variant="caption" color="secondary">{periodLabel(product.period)}</Text>
    </PressableCard>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:    { flex: 1 },
  header:  { flexDirection: 'row', justifyContent: 'flex-end', padding: Spacing.base, paddingTop: Spacing.xl },
  content: { paddingHorizontal: Spacing.base, gap: Spacing.md, paddingTop: Spacing.md, paddingBottom: 20 },
  hero:    { alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.sm },
  featureCard: { gap: Spacing.md },
  featureRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  freeCard:    { gap: Spacing.sm },
  freeRow:     { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  planRow:     { flexDirection: 'row', gap: Spacing.md },
  planCard: {
    flex: 1,
    alignItems:     'center',
    paddingVertical: Spacing.lg,
    gap:             Spacing.xs,
    position:        'relative',
    overflow:        'visible',
  },
  badge: {
    position:        'absolute',
    top: -10, right: -6,
    paddingHorizontal: 8,
    paddingVertical:   2,
    borderRadius:      8,
  },
  footer: {
    position:       'absolute',
    bottom: 0, left: 0, right: 0,
    padding:        Spacing.base,
    paddingTop:     Spacing.md,
    borderTopWidth: 1,
  },
});
