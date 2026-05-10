import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  View,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Text } from './Text';
import { Palette, Spacing, Radius, FontSize, TouchTarget } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  variant?: Variant;
  size?: Size;
  label: string;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  label,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  onPress,
  style,
  ...props
}: ButtonProps) {
  const { colors } = useColorScheme();
  const isDisabled = disabled || loading;

  const handlePress: TouchableOpacityProps['onPress'] = (e) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  };

  const heights: Record<Size, number> = { sm: 36, md: 48, lg: 56 };
  const paddingH: Record<Size, number> = { sm: Spacing.md, md: Spacing.base, lg: Spacing.xl };
  const fontSize: Record<Size, number> = { sm: FontSize.sm, md: FontSize.base, lg: FontSize.md };

  const bgColors: Record<Variant, string> = {
    primary:     Palette.primary,
    secondary:   colors.surfaceSecondary,
    ghost:       'transparent',
    destructive: '#EF4444',
  };

  const textColors: Record<Variant, string> = {
    primary:     '#FFFFFF',
    secondary:   colors.text,
    ghost:       Palette.primary,
    destructive: '#FFFFFF',
  };

  const borderColors: Record<Variant, string | undefined> = {
    primary:     undefined,
    secondary:   colors.border,
    ghost:       undefined,
    destructive: undefined,
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        {
          height: heights[size],
          paddingHorizontal: paddingH[size],
          backgroundColor: bgColors[variant],
          borderColor: borderColors[variant],
          borderWidth: borderColors[variant] ? 1 : 0,
          opacity: isDisabled ? 0.5 : 1,
          alignSelf: fullWidth ? undefined : 'flex-start',
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColors[variant]} size="small" />
      ) : (
        <View style={styles.inner}>
          {leftIcon}
          <Text
            variant="label"
            weight="semibold"
            style={{ color: textColors[variant], fontSize: fontSize[size] }}
          >
            {label}
          </Text>
          {rightIcon}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TouchTarget.min,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
