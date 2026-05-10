import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/Badge';
import { Spacing, Palette } from '@/constants/theme';
import type { ShiftEntry } from '@/types';
import { shiftEmoji } from '@/utils/format';
import { formatShiftHours, shiftDurationHours } from '@/domain/schedule/helpers';
import { useTranslation } from '@/i18n';

interface ShiftCardProps {
  shift: ShiftEntry | null;
  label?: string;
}

const SHIFT_COLORS: Record<string, string> = {
  morning:    Palette.shiftMorning,
  afternoon:  Palette.shiftAfternoon,
  night:      Palette.shiftNight,
  long_day:   Palette.shiftLongDay,
  long_night: Palette.shiftLongNight,
  off:        Palette.shiftOff,
  custom:     Palette.shiftCustom,
};

export function ShiftCard({ shift, label }: ShiftCardProps) {
  const { t } = useTranslation();
  const cardLabel = label ?? t.features.shiftCard.todaysShift;

  if (!shift) {
    return (
      <Card style={styles.card}>
        <Text variant="label" color="secondary">{cardLabel}</Text>
        <Text variant="h3" weight="semibold" style={{ marginTop: Spacing.xs }}>
          {t.features.shiftCard.noShift}
        </Text>
        <Text variant="bodySmall" color="secondary">{t.features.shiftCard.addShiftHint}</Text>
      </Card>
    );
  }

  const accent = SHIFT_COLORS[shift.type] ?? Palette.shiftCustom;
  const duration = shiftDurationHours(shift);

  return (
    <Card style={[styles.card, { borderLeftColor: accent, borderLeftWidth: 3 }]}>
      <Text variant="label" color="secondary">{cardLabel}</Text>
      <View style={styles.row}>
        <Text style={styles.emoji}>{shiftEmoji(shift.type)}</Text>
        <View style={{ flex: 1 }}>
          <Text variant="h3" weight="semibold" style={{ color: accent }}>
            {t.shiftTypes[shift.type as keyof typeof t.shiftTypes]?.label ?? shift.type}
          </Text>
          <Text variant="bodySmall" color="secondary">
            {formatShiftHours(shift)}
            {duration > 0 ? ` · ${duration}h` : ''}
          </Text>
        </View>
        <Badge
          label={shift.type === 'off' ? t.schedule.off : `${duration}h`}
          variant={`shift_${shift.type}` as any}
        />
      </View>
      {shift.notes && (
        <Text variant="bodySmall" color="secondary" style={{ marginTop: Spacing.sm }}>
          {shift.notes}
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  emoji: {
    fontSize: 28,
    width: 36,
    textAlign: 'center',
  },
});
