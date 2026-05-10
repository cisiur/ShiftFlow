import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Spacing } from '@/constants/theme';

export function Divider({ style }: { style?: ViewStyle }) {
  const { colors } = useColorScheme();
  return (
    <View
      style={[
        { height: 1, backgroundColor: colors.border, marginVertical: Spacing.base },
        style,
      ]}
    />
  );
}
