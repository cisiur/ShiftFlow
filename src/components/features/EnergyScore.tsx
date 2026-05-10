import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { ReadinessBadge } from '@/components/ui/Badge';
import { Spacing, Palette } from '@/constants/theme';
import type { ReadinessLevel } from '@/types';
import { useTranslation } from '@/i18n';

interface EnergyScoreProps {
  score: number;
  readiness: ReadinessLevel;
}

const SCORE_COLOR: Record<ReadinessLevel, string> = {
  high:   Palette.success,
  medium: Palette.warning,
  low:    Palette.error,
};

export function EnergyScoreCard({ score, readiness }: EnergyScoreProps) {
  const { t } = useTranslation();
  const color = SCORE_COLOR[readiness];

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View>
          <Text variant="label" color="secondary">{t.features.energy.readiness}</Text>
          <ReadinessBadge level={readiness} />
        </View>
        <View style={styles.scoreCircle}>
          <Text variant="h2" weight="bold" style={{ color }}>
            {score}
          </Text>
          <Text variant="caption" color="tertiary">/100</Text>
        </View>
      </View>
      <View style={[styles.bar, { backgroundColor: `${color}20` }]}>
        <View style={[styles.fill, { width: `${score}%`, backgroundColor: color }]} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreCircle: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
    alignSelf: 'flex-end',
  },
  bar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
