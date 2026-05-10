import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Spacing, Palette } from '@/constants/theme';
import type { CaffeineGuidance } from '@/types';
import { formatTimeDisplay } from '@/utils/time';
import { useTimeFormat } from '@/hooks/useTimeFormat';
import { useTranslation } from '@/i18n';

interface CaffeineCardProps {
  guidance: CaffeineGuidance;
}

const PHASE_COLORS: Record<string, string> = {
  free:               Palette.success,
  last_cup:           Palette.warning,
  cutoff_approaching: '#F97316',
  stop:               Palette.error,
};

const PHASE_EMOJI: Record<string, string> = {
  free:               '☕',
  last_cup:           '☕',
  cutoff_approaching: '⚠️',
  stop:               '🚫',
};

export function CaffeineCard({ guidance }: CaffeineCardProps) {
  const { t } = useTranslation();
  const use12h = useTimeFormat();
  const c = t.features.caffeine;

  const color = PHASE_COLORS[guidance.currentPhase] ?? Palette.success;
  const emoji = PHASE_EMOJI[guidance.currentPhase] ?? '☕';
  const phaseLabel = c.phases[guidance.currentPhase as keyof typeof c.phases] ?? guidance.currentPhase;

  return (
    <Card style={[styles.card, { borderLeftColor: color, borderLeftWidth: 3 }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{emoji}</Text>
        <View>
          <Text variant="label" color="secondary">{c.title}</Text>
          <Text variant="body" weight="semibold" style={{ color }}>
            {phaseLabel}
          </Text>
        </View>
        <View style={styles.cutoffBadge}>
          <Text variant="caption" color="secondary">{c.cutoff}</Text>
          <Text variant="body" weight="bold" style={{ color: Palette.primary }}>
            {formatTimeDisplay(guidance.cutoffTime, use12h)}
          </Text>
        </View>
      </View>
      <Text variant="bodySmall" color="secondary">{guidance.advice}</Text>
      <View style={styles.cups}>
        <Text variant="caption" color="tertiary">
          {c.maxToday(guidance.maxCupsToday)}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.sm },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  icon: { fontSize: 22, width: 30, textAlign: 'center' },
  cutoffBadge: {
    marginLeft: 'auto',
    alignItems: 'flex-end',
  },
  cups: {
    marginTop: 2,
  },
});
