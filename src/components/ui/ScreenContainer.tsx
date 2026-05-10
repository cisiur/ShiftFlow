import React from 'react';
import { ScrollView, View, StyleSheet, RefreshControl, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  padded?: boolean;
  style?: ViewStyle;
}

export function ScreenContainer({
  children,
  scrollable = true,
  refreshing = false,
  onRefresh,
  padded = true,
  style,
}: ScreenContainerProps) {
  const { colors } = useColorScheme();

  const inner = padded
    ? <View style={[styles.padded, style]}>{children}</View>
    : <View style={[{ flex: 1 }, style]}>{children}</View>;

  if (!scrollable) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        {inner}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.scroll, padded && styles.scrollPadded]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.textSecondary}
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  padded: {
    flex: 1,
    paddingHorizontal: Spacing.base,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: Spacing['3xl'],
  },
  scrollPadded: {
    paddingHorizontal: Spacing.base,
  },
});
