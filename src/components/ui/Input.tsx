import React, { forwardRef } from 'react';
import { TextInput, TextInputProps, View, StyleSheet, Text } from 'react-native';
import { Spacing, Radius, FontSize, TouchTarget } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, hint, leftElement, rightElement, style, ...props },
  ref,
) {
  const { colors } = useColorScheme();

  return (
    <View>
      {label && (
        <Text
          style={{
            fontSize: FontSize.sm,
            fontFamily: 'Inter_500Medium',
            color: colors.textSecondary,
            marginBottom: Spacing.xs,
          }}
        >
          {label}
        </Text>
      )}
      <View
        style={[
          styles.wrapper,
          {
            backgroundColor: colors.surfaceSecondary,
            borderColor: error ? '#EF4444' : colors.border,
          },
        ]}
      >
        {leftElement && <View style={styles.side}>{leftElement}</View>}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textTertiary}
          style={[
            styles.input,
            {
              color: colors.text,
              fontFamily: 'Inter_400Regular',
              fontSize: FontSize.base,
              flex: 1,
            },
            style,
          ]}
          {...props}
        />
        {rightElement && <View style={styles.side}>{rightElement}</View>}
      </View>
      {error && (
        <Text style={{ fontSize: FontSize.xs, color: '#EF4444', marginTop: Spacing.xs }}>
          {error}
        </Text>
      )}
      {!error && hint && (
        <Text style={{ fontSize: FontSize.xs, color: colors.textTertiary, marginTop: Spacing.xs }}>
          {hint}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.md,
    minHeight: TouchTarget.min,
    paddingHorizontal: Spacing.md,
  },
  input: {
    paddingVertical: Spacing.sm,
  },
  side: {
    paddingHorizontal: Spacing.xs,
  },
});
