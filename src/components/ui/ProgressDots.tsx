import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Palette } from '@/constants/theme';

interface ProgressDotsProps {
  total: number;
  current: number;
}

export function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === current ? styles.active : styles.inactive,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  active: {
    width: 20,
    backgroundColor: Palette.primary,
  },
  inactive: {
    width: 6,
    backgroundColor: Palette.slate300,
  },
});
