import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Text } from '@/components/ui/Text';
import { Palette, Spacing, Radius } from '@/constants/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error:    Error | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  handleRestart = () => {
    // Clear error state — if the root cause is gone the app will recover;
    // if not, this screen reappears rather than hanging on white.
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const message = this.state.error?.message ?? 'Unknown error';

    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>💥</Text>

        <Text variant="h2" weight="bold" center style={styles.title}>
          Something went wrong
        </Text>

        <Text variant="body" color="secondary" center style={styles.subtitle}>
          ShiftFlow ran into an unexpected problem. Try restarting the app.
        </Text>

        {__DEV__ && (
          <ScrollView style={styles.devBox} contentContainerStyle={{ padding: Spacing.md }}>
            <Text variant="caption" style={styles.devText}>{message}</Text>
            {this.state.error?.stack ? (
              <Text variant="caption" style={[styles.devText, { opacity: 0.6, marginTop: Spacing.sm }]}>
                {this.state.error.stack}
              </Text>
            ) : null}
          </ScrollView>
        )}

        <TouchableOpacity style={styles.btn} onPress={this.handleRestart} activeOpacity={0.8}>
          <Text variant="body" weight="semibold" style={{ color: '#fff' }}>
            Restart app
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1623',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  emoji: {
    fontSize: 56,
    lineHeight: 70,
    textAlign: 'center',
  },
  title: {
    color: '#FFFFFF',
    marginTop: Spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
  },
  devBox: {
    maxHeight: 220,
    width: '100%',
    backgroundColor: '#1A2130',
    borderRadius: Radius.md,
    marginTop: Spacing.md,
  },
  devText: {
    fontFamily: 'monospace',
    color: '#FF6B6B',
    fontSize: 11,
  },
  btn: {
    marginTop: Spacing.lg,
    backgroundColor: Palette.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },
});
