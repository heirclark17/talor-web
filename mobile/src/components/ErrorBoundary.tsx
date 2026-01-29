import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, FONTS } from '../utils/constants';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <AlertTriangle color={COLORS.danger} size={64} />
            </View>

            <Text style={styles.title}>Something went wrong</Text>

            <Text style={styles.message}>
              We're sorry, but something unexpected happened. Please try restarting the app.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Error Details (Dev Only):</Text>
                <Text style={styles.errorText}>{this.state.error.toString()}</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={this.handleReset}
              accessibilityRole="button"
              accessibilityLabel="Try again"
              accessibilityHint="Resets the error state and attempts to reload the app"
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.dark.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  errorDetails: {
    backgroundColor: COLORS.dark.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xl,
    width: '100%',
  },
  errorTitle: {
    fontSize: 12,
    fontFamily: FONTS.semibold,
    color: COLORS.danger,
    marginBottom: SPACING.sm,
  },
  errorText: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textTertiary,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    minWidth: 120,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: FONTS.semibold,
    textAlign: 'center',
  },
});
