import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Spacing, Palette } from '@/constants/theme';
import { useTranslation } from '@/i18n';

interface RecoveryTipsProps {
  tips: string[];
}

export function RecoveryTips({ tips }: RecoveryTipsProps) {
  const { t } = useTranslation();

  if (tips.length === 0) return null;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={{ fontSize: 18 }}>🔄</Text>
        <Text variant="label" color="secondary">{t.features.recoveryTips.title}</Text>
      </View>
      {tips.map((tip, i) => (
        <View key={i} style={styles.tip}>
          <View style={styles.dot} />
          <Text variant="bodySmall" color="secondary" style={{ flex: 1, lineHeight: 20 }}>
            {tip}
          </Text>
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
  tip: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Palette.primary,
    marginTop: 7,
  },
});
