import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Spacing, Palette, Radius } from '@/constants/theme';
import type { DailyPlan } from '@/types';
import { shiftEmoji } from '@/utils/format';
import { formatTimeDisplay } from '@/utils/time';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTimeFormat } from '@/hooks/useTimeFormat';
import { isToday } from '@/utils/time';
import { useTranslation } from '@/i18n';

interface WeekDayCardProps {
  plan: DailyPlan;
  onPress?: () => void;
}

const SHIFT_ACCENT: Record<string, string> = {
  morning:    Palette.shiftMorning,
  afternoon:  Palette.shiftAfternoon,
  night:      Palette.shiftNight,
  long_day:   Palette.shiftLongDay,
  long_night: Palette.shiftLongNight,
  off:        Palette.shiftOff,
  custom:     Palette.shiftCustom,
};

const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  pl: 'pl-PL',
};

export function WeekDayCard({ plan, onPress }: WeekDayCardProps) {
  const { colors } = useColorScheme();
  const { t, language } = useTranslation();
  const use12h = useTimeFormat();
  const wdc = t.features.weekDayCard;

  const todayFlag = isToday(plan.date);
  const shiftType = plan.shift?.type ?? 'off';
  const accent = SHIFT_ACCENT[shiftType];
  const dateObj = new Date(plan.date + 'T12:00:00');
  const locale = LOCALE_MAP[language] ?? 'en-US';
  const dayName = dateObj.toLocaleDateString(locale, { weekday: 'short' });
  const dayNum = dateObj.getDate();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: todayFlag ? Palette.primary : colors.border,
          borderWidth: todayFlag ? 1.5 : 1,
        },
      ]}
    >
      {/* Date column */}
      <View style={[styles.dateCol, { backgroundColor: todayFlag ? Palette.primaryLight : colors.surfaceSecondary }]}>
        <Text variant="caption" weight="semibold" style={{ color: todayFlag ? Palette.primary : colors.textSecondary }}>
          {dayName.toUpperCase()}
        </Text>
        <Text variant="h3" weight="bold" style={{ color: todayFlag ? Palette.primary : colors.text }}>
          {dayNum}
        </Text>
        {todayFlag && (
          <Text variant="caption" style={{ color: Palette.primary, fontFamily: 'Inter_700Bold' }}>
            {wdc.today}
          </Text>
        )}
      </View>

      {/* Shift + plan info */}
      <View style={styles.content}>
        <View style={styles.shiftRow}>
          <Text style={{ fontSize: 16 }}>{shiftEmoji(shiftType)}</Text>
          <Text variant="body" weight="semibold" style={{ color: accent }}>
            {t.shiftTypes[shiftType as keyof typeof t.shiftTypes]?.label ?? shiftType}
          </Text>
          {plan.shift?.startTime && plan.shift?.endTime && (
            <Text variant="bodySmall" color="secondary">
              {plan.shift.startTime}–{plan.shift.endTime}
            </Text>
          )}
        </View>
        <View style={styles.details}>
          {plan.sleepWindow && (
            <View style={styles.pill}>
              <Text style={{ fontSize: 11 }}>😴</Text>
              <Text variant="caption" color="secondary">
                {formatTimeDisplay(plan.sleepWindow.start, use12h)}
              </Text>
            </View>
          )}
          {plan.caffeineGuidance && (
            <View style={styles.pill}>
              <Text style={{ fontSize: 11 }}>☕</Text>
              <Text variant="caption" color="secondary">
                {wdc.cut} {formatTimeDisplay(plan.caffeineGuidance.cutoffTime, use12h)}
              </Text>
            </View>
          )}
          {plan.napSuggestion?.recommended && (
            <View style={styles.pill}>
              <Text style={{ fontSize: 11 }}>💤</Text>
              <Text variant="caption" color="secondary">
                {wdc.nap} {formatTimeDisplay(plan.napSuggestion.startTime, use12h)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Energy indicator */}
      <View style={styles.score}>
        <View
          style={[
            styles.energyDot,
            {
              backgroundColor:
                plan.readinessLevel === 'high'
                  ? Palette.success
                  : plan.readinessLevel === 'medium'
                  ? Palette.warning
                  : Palette.error,
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  dateCol: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: 1,
  },
  content: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  shiftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  score: {
    paddingRight: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  energyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
