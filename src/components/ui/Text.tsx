import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { FontSize, FontWeight, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';

type Variant = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' | 'caption' | 'label';
type Weight = 'regular' | 'medium' | 'semibold' | 'bold';
type ColorKey = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'error' | 'success' | 'warning';

interface SFTextProps extends TextProps {
  variant?: Variant;
  weight?: Weight;
  color?: ColorKey;
  center?: boolean;
}

const variantStyles: Record<Variant, { fontSize: number; lineHeight: number }> = {
  display:   { fontSize: FontSize['4xl'], lineHeight: FontSize['4xl'] * 1.2 },
  h1:        { fontSize: FontSize['3xl'], lineHeight: FontSize['3xl'] * 1.25 },
  h2:        { fontSize: FontSize['2xl'], lineHeight: FontSize['2xl'] * 1.3 },
  h3:        { fontSize: FontSize.xl,    lineHeight: FontSize.xl * 1.35 },
  body:      { fontSize: FontSize.base,  lineHeight: FontSize.base * 1.55 },
  bodySmall: { fontSize: FontSize.sm,    lineHeight: FontSize.sm * 1.55 },
  caption:   { fontSize: FontSize.xs,    lineHeight: FontSize.xs * 1.5 },
  label:     { fontSize: FontSize.sm,    lineHeight: FontSize.sm * 1.4 },
};

const fontFamilyMap: Record<Weight, string> = {
  regular:  'Inter_400Regular',
  medium:   'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold:     'Inter_700Bold',
};

const defaultWeightByVariant: Record<Variant, Weight> = {
  display:   'bold',
  h1:        'bold',
  h2:        'semibold',
  h3:        'semibold',
  body:      'regular',
  bodySmall: 'regular',
  caption:   'regular',
  label:     'medium',
};

export function Text({
  variant = 'body',
  weight,
  color = 'primary',
  center,
  style,
  ...props
}: SFTextProps) {
  const { colors } = useColorScheme();

  const colorMap: Record<ColorKey, string> = {
    primary:   colors.text,
    secondary: colors.textSecondary,
    tertiary:  colors.textTertiary,
    inverse:   colors.textInverse,
    error:     '#EF4444',
    success:   '#22C55E',
    warning:   '#F59E0B',
  };

  const resolvedWeight = weight ?? defaultWeightByVariant[variant];

  return (
    <RNText
      style={[
        variantStyles[variant],
        {
          fontFamily: fontFamilyMap[resolvedWeight],
          color: colorMap[color],
          textAlign: center ? 'center' : undefined,
        },
        style,
      ]}
      {...props}
    />
  );
}
