import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import * as SystemUI from 'expo-system-ui';
import { useAppReady } from '@/hooks/useAppReady';
import { useUserStore } from '@/store/userStore';
import { useColorScheme } from '@/hooks/useColorScheme';
import { initialisePurchases, checkPremiumEntitlement, isRCInitialised } from '@/services/purchases';
import { usePremiumStore } from '@/store/premiumStore';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function NavigationGuard() {
  const segments = useSegments();
  const router = useRouter();
  const profile = useUserStore(s => s.profile);
  const isLoaded = useUserStore(s => s.isLoaded);

  useEffect(() => {
    if (!isLoaded) return;

    const inOnboarding = segments[0] === 'onboarding';
    const onboardingDone = profile?.onboardingComplete === true;

    if (!onboardingDone && !inOnboarding) {
      router.replace('/onboarding');
    } else if (onboardingDone && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [isLoaded, profile?.onboardingComplete, segments]);

  return null;
}

export default function RootLayout() {
  const { ready } = useAppReady();
  const { scheme, colors } = useColorScheme();
  const activatePremium   = usePremiumStore(s => s.activatePremium);
  const deactivatePremium = usePremiumStore(s => s.deactivatePremium);

  // Initialise RevenueCat then sync entitlement with local store.
  // Only syncs when RC is actually running (real key) so mock/dev mode is unaffected.
  useEffect(() => {
    (async () => {
      await initialisePurchases();
      if (isRCInitialised()) {
        const hasPremium = await checkPremiumEntitlement();
        if (hasPremium) {
          activatePremium();
        } else {
          deactivatePremium();
        }
      }
    })();
  }, []);

  // Keep the Android system navigation bar background in sync with app theme
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);

  if (!ready) return null;

  return (
    <ErrorBoundary>
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <NavigationGuard />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="checkin" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="plan-explanation" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="paywall" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="roster-import" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
