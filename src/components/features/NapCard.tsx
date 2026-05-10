import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/Badge';
import { Spacing, Palette } from '@/constants/theme';
import type { NapSuggestion } from '@/types';
import { formatTimeDisplay } from '@/utils/time';
import { useTimeFormat } from '@/hooks/useTimeFormat';
import { useTranslation } from '@/i18n';

interface NapCardProps {
  nap: NapSuggestion | null;
}

export function NapCard({ nap }: NapCardProps) {
  const { t } = useTranslation();
  const use12h = useTimeFormat();

  if (!nap || !nap.recommended) return null;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.icon}>💤</Text>
        <View style={{ flex: 1 }}>
          <Text variant="label" color="secondary">{t.features.nap.title}</Text>
          <View style={styles.timeRow}>
            <Text variant="h3" weight="semibold" style={{ color: Palette.primary }}>
              {formatTimeDisplay(nap.startTime, use12h)}
            </Text>
            <Badge label={`${nap.durationMinutes} min`} variant="info" size="sm" />
          </View>
        </View>
      </View>
      <Text variant="bodySmall" color="secondary">{nap.reason}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.sm },
  header: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  icon: { fontSize: 22, width: 30, textAlign: 'center', marginTop: 2 },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 2,
  },
});
