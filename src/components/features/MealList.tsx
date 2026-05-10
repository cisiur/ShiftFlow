import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Spacing, Palette } from '@/constants/theme';
import type { MealSuggestion } from '@/types';
import { formatTimeDisplay } from '@/utils/time';
import { useTimeFormat } from '@/hooks/useTimeFormat';
import { useTranslation } from '@/i18n';

interface MealListProps {
  meals: MealSuggestion[];
}

export function MealList({ meals }: MealListProps) {
  const { t } = useTranslation();
  const use12h = useTimeFormat();

  if (meals.length === 0) return null;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={{ fontSize: 18 }}>🍽️</Text>
        <Text variant="label" color="secondary">{t.features.meals.title}</Text>
      </View>
      {meals.map((meal, i) => (
        <View key={i} style={styles.meal}>
          <Text variant="caption" weight="semibold" style={{ color: Palette.primary, width: 70 }}>
            {formatTimeDisplay(meal.time, use12h)}
          </Text>
          <View style={{ flex: 1 }}>
            <Text variant="bodySmall" weight="medium">{meal.label}</Text>
            <Text variant="caption" color="tertiary" style={{ lineHeight: 16 }}>{meal.notes}</Text>
          </View>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  meal: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
});
