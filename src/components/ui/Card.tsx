import React from 'react';
import { View, ViewProps, StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { Spacing, Radius, Shadow } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';

interface CardProps extends ViewProps {
  elevated?: boolean;
  padding?: keyof typeof Spacing | number;
}

export function Card({ elevated = false, padding = 'base', style, children, ...props }: CardProps) {
  const { colors } = useColorScheme();
  const paddingValue = typeof padding === 'number' ? padding : Spacing[padding];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          padding: paddingValue,
        },
        elevated && Shadow.sm,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

interface PressableCardProps extends TouchableOpacityProps {
  elevated?: boolean;
  padding?: keyof typeof Spacing | number;
}

export function PressableCard({ elevated = false, padding = 'base', style, children, ...props }: PressableCardProps) {
  const { colors } = useColorScheme();
  const paddingValue = typeof padding === 'number' ? padding : Spacing[padding];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          padding: paddingValue,
        },
        elevated && Shadow.sm,
        style,
      ]}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
