import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useUserStore } from '@/store/userStore';

SplashScreen.preventAutoHideAsync();

export function useAppReady() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const isStoreLoaded = useUserStore(s => s.isLoaded);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if ((fontsLoaded || fontError) && isStoreLoaded) {
      setReady(true);
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, isStoreLoaded]);

  return { ready };
}
