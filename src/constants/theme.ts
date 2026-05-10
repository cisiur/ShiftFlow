// Design tokens for ShiftFlow.
// Keep all visual constants here — never hard-code values in components.

export const Palette = {
  // Brand
  primary: '#4F6EF7',
  primaryDark: '#3B55D4',
  primaryLight: '#EEF2FF',

  // Shift type indicators
  shiftMorning: '#F59E0B',
  shiftMorningBg: '#FFFBEB',
  shiftAfternoon: '#3B82F6',
  shiftAfternoonBg: '#EFF6FF',
  shiftNight: '#7C3AED',
  shiftNightBg: '#F5F3FF',
  shiftLongDay: '#F97316',
  shiftLongDayBg: '#FFF7ED',
  shiftLongNight: '#9333EA',
  shiftLongNightBg: '#FAF5FF',
  shiftOff: '#22C55E',
  shiftOffBg: '#F0FDF4',
  shiftCustom: '#64748B',
  shiftCustomBg: '#F8FAFC',

  // Semantic
  success: '#22C55E',
  successLight: '#F0FDF4',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  error: '#EF4444',
  errorLight: '#FEF2F2',
  info: '#3B82F6',
  infoLight: '#EFF6FF',

  // Readiness
  readinessHigh: '#22C55E',
  readinessMedium: '#F59E0B',
  readinessLow: '#EF4444',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',

  // Dark theme surfaces
  dark900: '#0F1623',
  dark800: '#141D2E',
  dark700: '#1A2235',
  dark600: '#202C42',
  dark500: '#2D3A50',
  dark400: '#3A4A63',
} as const;

export const Colors = {
  light: {
    background: Palette.slate50,
    surface: Palette.white,
    surfaceSecondary: Palette.slate100,
    surfaceElevated: Palette.white,
    border: Palette.slate200,
    borderLight: Palette.slate100,
    text: Palette.slate800,
    textSecondary: Palette.slate500,
    textTertiary: Palette.slate400,
    textInverse: Palette.white,
    tabBar: Palette.white,
    tabBarBorder: Palette.slate200,
    tabBarActive: Palette.primary,
    tabBarInactive: Palette.slate400,
    headerBg: Palette.white,
    shadow: 'rgba(15,22,35,0.08)',
  },
  dark: {
    background: Palette.dark900,
    surface: Palette.dark700,
    surfaceSecondary: Palette.dark800,
    surfaceElevated: Palette.dark600,
    border: Palette.dark500,
    borderLight: Palette.dark600,
    text: Palette.slate100,
    textSecondary: Palette.slate400,
    textTertiary: Palette.slate500,
    textInverse: Palette.slate900,
    tabBar: Palette.dark800,
    tabBarBorder: Palette.dark500,
    tabBarActive: Palette.primary,
    tabBarInactive: Palette.slate500,
    headerBg: Palette.dark800,
    shadow: 'rgba(0,0,0,0.4)',
  },
} as const;

export type ColorScheme = keyof typeof Colors;
export type ThemeColors = typeof Colors.light;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const;

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 19,
  xl: 22,
  '2xl': 26,
  '3xl': 32,
  '4xl': 40,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const LineHeight = {
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.65,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export const TouchTarget = {
  min: 44,   // Apple HIG / WCAG minimum
  comfortable: 52,
} as const;

export const BOTTOM_TAB_HEIGHT = 60;
export const HEADER_HEIGHT = 56;
