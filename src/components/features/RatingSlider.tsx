import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Spacing, Palette, Radius, TouchTarget } from '@/constants/theme';
import type { CheckInRating } from '@/types';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '@/hooks/useColorScheme';

interface RatingSliderProps {
  label: string;
  value: CheckInRating;
  onChange: (v: CheckInRating) => void;
  lowLabel?: string;
  highLabel?: string;
}

export function RatingSlider({
  label,
  value,
  onChange,
  lowLabel = 'Low',
  highLabel = 'High',
}: RatingSliderProps) {
  const { colors } = useColorScheme();

  return (
    <View style={styles.container}>
      <Text variant="body" weight="medium">{label}</Text>
      <View style={styles.dots}>
        {([1, 2, 3, 4, 5] as CheckInRating[]).map((v) => (
          <TouchableOpacity
            key={v}
            onPress={() => {
              Haptics.selectionAsync();
              onChange(v);
            }}
            style={[
              styles.dot,
              {
                backgroundColor: value >= v ? Palette.primary : colors.surfaceSecondary,
                borderColor: value >= v ? Palette.primary : colors.border,
              },
            ]}
            accessibilityLabel={`${label}: ${v}`}
            accessibilityRole="radio"
            accessibilityState={{ selected: value === v }}
          >
            <Text
              variant="caption"
              weight="semibold"
              style={{ color: value >= v ? '#FFF' : colors.textTertiary }}
            >
              {v}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.labelRow}>
        <Text variant="caption" color="tertiary">{lowLabel}</Text>
        <Text variant="caption" color="tertiary">{highLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  dots: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dot: {
    flex: 1,
    height: TouchTarget.min,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
