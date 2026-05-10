import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Spacing, Palette } from '@/constants/theme';
import type { TimeWindow } from '@/types';
import { formatTimeDisplay, todayISO, offsetDate, formatDateLabel } from '@/utils/time';
import { useTimeFormat } from '@/hooks/useTimeFormat';
import { useTranslation } from '@/i18n';

interface SleepWindowCardProps {
  sleepWindow: TimeWindow | null;
}

export function SleepWindowCard({ sleepWindow }: SleepWindowCardProps) {
  const { t, language } = useTranslation();
  const use12h = useTimeFormat();
  const s = t.features.sleepWindow;

  if (!sleepWindow) {
    return (
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.icon}>😴</Text>
          <Text variant="label" color="secondary">{s.title}</Text>
        </View>
        <Text variant="h3" weight="semibold">{s.notCalculated}</Text>
        <Text variant="bodySmall" color="secondary">{s.addShiftsHint}</Text>
      </Card>
    );
  }

  // Determine a friendly date label for when the sleep falls
  const today    = todayISO();
  const tomorrow = offsetDate(today, 1);
  let dateLabel: string | null = null;
  if (sleepWindow.date) {
    if (sleepWindow.date === today) {
      dateLabel = s.tonight;
    } else if (sleepWindow.date === tomorrow) {
      dateLabel = s.tomorrow;
    } else {
      dateLabel = formatDateLabel(
        sleepWindow.date,
        language === 'pl' ? 'pl-PL' : 'en-US',
      );
    }
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.icon}>😴</Text>
        <Text variant="label" color="secondary">{s.recommended}</Text>
        {dateLabel && (
          <View style={styles.datePill}>
            <Text variant="caption" style={styles.dateText}>{dateLabel}</Text>
          </View>
        )}
      </View>
      <View style={styles.timeRow}>
        <View style={styles.timeBlock}>
          <Text variant="caption" color="tertiary" weight="medium">{s.bedtime}</Text>
          <Text variant="h2" weight="bold" style={{ color: Palette.primary }}>
            {formatTimeDisplay(sleepWindow.start, use12h)}
          </Text>
        </View>
        <View style={styles.arrowBlock}>
          <Text style={styles.arrow}>→</Text>
          <Text variant="caption" color="tertiary">{sleepWindow.durationHours}h</Text>
        </View>
        <View style={styles.timeBlock}>
          <Text variant="caption" color="tertiary" weight="medium">{s.wake}</Text>
          <Text variant="h2" weight="bold" style={{ color: Palette.primary }}>
            {formatTimeDisplay(sleepWindow.end, use12h)}
          </Text>
        </View>
      </View>
      {sleepWindow.crossesMidnight && (
        <Text variant="caption" color="tertiary" style={{ marginTop: Spacing.xs }}>
          {s.crossesMidnight}
        </Text>
      )}
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
  icon: { fontSize: 20 },
  datePill: {
    marginLeft: 'auto',
    backgroundColor: Palette.primary + '1A', // ~10% opacity
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  dateText: {
    color: Palette.primary,
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeBlock: {
    gap: 2,
  },
  arrowBlock: {
    alignItems: 'center',
    gap: 2,
  },
  arrow: {
    fontSize: 20,
    color: Palette.slate400,
  },
});
