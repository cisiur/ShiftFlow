import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Palette, FontSize, Radius } from '@/constants/theme';
import type { ShiftType, ReadinessLevel } from '@/types';
import { useTranslation } from '@/i18n';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'premium'
  | `shift_${ShiftType}`;

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const VARIANT_STYLES: Record<string, { bg: string; text: string }> = {
  default:           { bg: Palette.slate200,       text: Palette.slate700 },
  success:           { bg: Palette.successLight,   text: '#15803D' },
  warning:           { bg: Palette.warningLight,   text: '#B45309' },
  error:             { bg: Palette.errorLight,     text: '#B91C1C' },
  info:              { bg: Palette.infoLight,      text: '#1D4ED8' },
  premium:           { bg: '#FEF3C7',              text: '#92400E' },
  shift_morning:     { bg: Palette.shiftMorningBg,    text: Palette.shiftMorning },
  shift_afternoon:   { bg: Palette.shiftAfternoonBg,  text: Palette.shiftAfternoon },
  shift_night:       { bg: Palette.shiftNightBg,      text: Palette.shiftNight },
  shift_long_day:    { bg: Palette.shiftLongDayBg,    text: Palette.shiftLongDay },
  shift_long_night:  { bg: Palette.shiftLongNightBg,  text: Palette.shiftLongNight },
  shift_off:         { bg: Palette.shiftOffBg,        text: Palette.shiftOff },
  shift_custom:      { bg: Palette.shiftCustomBg,     text: Palette.shiftCustom },
};

export function Badge({ label, variant = 'default', size = 'sm' }: BadgeProps) {
  const vs = VARIANT_STYLES[variant] ?? VARIANT_STYLES.default;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: vs.bg,
          paddingHorizontal: size === 'md' ? 10 : 7,
          paddingVertical: size === 'md' ? 4 : 3,
        },
      ]}
    >
      <Text
        style={{
          color: vs.text,
          fontSize: size === 'md' ? FontSize.sm : FontSize.xs,
          fontFamily: 'Inter_600SemiBold',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export function ReadinessBadge({ level }: { level: ReadinessLevel }) {
  const { t } = useTranslation();
  const variantMap: Record<ReadinessLevel, BadgeVariant> = {
    high:   'success',
    medium: 'warning',
    low:    'error',
  };
  return <Badge label={t.features.energy.levels[level]} variant={variantMap[level]} size="sm" />;
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
});
