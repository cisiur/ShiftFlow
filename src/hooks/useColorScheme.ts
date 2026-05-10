import { useColorScheme as useRNColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import type { ThemeColors } from '@/constants/theme';

export function useColorScheme() {
  const scheme = useRNColorScheme() ?? 'light';
  const colors: ThemeColors = Colors[scheme] ?? Colors.light;
  return { scheme, colors, isDark: scheme === 'dark' };
}
