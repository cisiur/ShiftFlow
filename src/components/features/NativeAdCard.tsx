/**
 * NativeAdCard — Native Advanced ad from AdMob (react-native-google-mobile-ads v16).
 * Placed on the Today screen between the sleep window and caffeine cards.
 * Hidden automatically for premium users.
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text as RNText } from 'react-native';
import {
  NativeAd,
  NativeAdView,
  NativeAsset,
  NativeAssetType,
} from 'react-native-google-mobile-ads';
import { Text } from '@/components/ui/Text';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { usePremiumStore } from '@/store/premiumStore';

// ─── Local error boundary — ad failure must never crash the parent screen ─────

interface EBState { crashed: boolean }
class AdErrorBoundary extends React.Component<{ children: React.ReactNode }, EBState> {
  state: EBState = { crashed: false };
  static getDerivedStateFromError() { return { crashed: true }; }
  componentDidCatch(e: Error) { console.warn('[NativeAdCard] ad render error, hiding ad:', e.message); }
  render() { return this.state.crashed ? null : this.props.children; }
}

// ─── Ad unit IDs ──────────────────────────────────────────────────────────────

const AD_UNIT_ID_TEST = 'ca-app-pub-3940256099942544/2247696110'; // Google test ID
const AD_UNIT_ID_PROD = 'ca-app-pub-2378155255627809/8333535174'; // real ID

const AD_UNIT_ID = __DEV__ ? AD_UNIT_ID_TEST : AD_UNIT_ID_PROD;

// ─── Component ────────────────────────────────────────────────────────────────

export function NativeAdCard() {
  return <AdErrorBoundary><NativeAdCardInner /></AdErrorBoundary>;
}

function NativeAdCardInner() {
  const { colors } = useColorScheme();
  const { isPremium } = usePremiumStore();
  const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);
  const adRef = useRef<NativeAd | null>(null);
  const premium = isPremium();

  useEffect(() => {
    if (premium) return;

    let cancelled = false;

    const timer = setTimeout(() => {
      console.log('[NativeAdCard] requesting ad, unit:', AD_UNIT_ID);
      NativeAd.createForAdRequest(AD_UNIT_ID)
        .then(ad => {
          if (cancelled) { ad.destroy(); return; }
          console.log('[NativeAdCard] ad loaded ✓');
          adRef.current = ad;
          setNativeAd(ad);
        })
        .catch(err => {
          console.warn('[NativeAdCard] ad request failed:', err?.message ?? err);
        });
    }, 1000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      adRef.current?.destroy();
      adRef.current = null;
    };
  }, [premium]);

  if (premium || !nativeAd) return null;

  return (
    <NativeAdView
      nativeAd={nativeAd}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      {/* "Ad" disclosure badge — required by Google policy */}
      <View style={styles.adBadge}>
        <Text style={styles.adBadgeText}>Ad</Text>
      </View>

      {/* Icon + headline row */}
      <View style={styles.headerRow}>
        {nativeAd.icon?.url ? (
          <NativeAsset assetType={NativeAssetType.ICON}>
            <Image source={{ uri: nativeAd.icon.url }} style={styles.icon} />
          </NativeAsset>
        ) : null}

        <View style={styles.headlineBlock}>
          <NativeAsset assetType={NativeAssetType.HEADLINE}>
            <RNText style={[styles.headline, { color: colors.text }]} numberOfLines={2}>
              {nativeAd.headline}
            </RNText>
          </NativeAsset>

          {nativeAd.advertiser ? (
            <NativeAsset assetType={NativeAssetType.ADVERTISER}>
              <RNText style={[styles.advertiser, { color: colors.textSecondary }]} numberOfLines={1}>
                {nativeAd.advertiser}
              </RNText>
            </NativeAsset>
          ) : null}
        </View>
      </View>

      {/* Body */}
      {nativeAd.body ? (
        <NativeAsset assetType={NativeAssetType.BODY}>
          <RNText style={[styles.body, { color: colors.textSecondary }]} numberOfLines={3}>
            {nativeAd.body}
          </RNText>
        </NativeAsset>
      ) : null}

      {/* Call-to-action */}
      <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
        <TouchableOpacity style={styles.cta} activeOpacity={0.85}>
          <RNText style={styles.ctaText}>{nativeAd.callToAction}</RNText>
        </TouchableOpacity>
      </NativeAsset>
    </NativeAdView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.base,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  adBadge: {
    alignSelf: 'flex-end',
    backgroundColor: `${Palette.primary}22`,
    borderRadius: Radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  adBadgeText: {
    fontSize: 10,
    color: Palette.primary,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
  },
  headlineBlock: {
    flex: 1,
    gap: 2,
  },
  headline: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    lineHeight: 20,
  },
  advertiser: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  body: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 19,
  },
  cta: {
    backgroundColor: Palette.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  ctaText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
});
