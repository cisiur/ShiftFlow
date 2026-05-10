import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { Spacing, Radius, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as Haptics from 'expo-haptics';

interface SelectOptionProps {
  label: string;
  description?: string;
  icon?: string;
  selected?: boolean;
  onPress: () => void;
}

export function SelectOption({ label, description, icon, selected, onPress }: SelectOptionProps) {
  const { colors } = useColorScheme();

  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.75}
      style={[
        styles.option,
        {
          backgroundColor: selected ? `${Palette.primary}15` : colors.surface,
          borderColor: selected ? Palette.primary : colors.border,
        },
      ]}
    >
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <View style={styles.content}>
        <Text variant="body" weight={selected ? 'semibold' : 'regular'} color={selected ? 'primary' : 'primary'}
          style={{ color: selected ? Palette.primary : colors.text }}>
          {label}
        </Text>
        {description && (
          <Text variant="bodySmall" color="secondary">{description}</Text>
        )}
      </View>
      {selected && (
        <View style={[styles.check, { backgroundColor: Palette.primary }]}>
          <Text style={{ color: '#FFF', fontSize: 10, fontFamily: 'Inter_700Bold' }}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    gap: Spacing.md,
    minHeight: 56,
  },
  icon: {
    fontSize: 22,
    width: 30,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  check: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
