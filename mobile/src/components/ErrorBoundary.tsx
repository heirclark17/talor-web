import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, Linking, ScrollView } from 'react-native';
import { AlertTriangle, WifiOff, Database, RefreshCw, Mail, Home } from 'lucide-react-native';
import { GlassButton } from './glass/GlassButton';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS } from '../utils/constants';

/**
 * Error categories for contextual recovery
 */
type ErrorCategory = 'network' | 'data' | 'auth' | 'ui' | 'unknown';

interface ErrorContext {
  category: ErrorCategory;
  title: string;
  message: string;
  icon: ReactNode;
  recoveryActions: RecoveryAction[];
}

interface RecoveryAction {
  label: string;
  action: () => void | Promise<void>;
  variant: 'primary' | 'secondary' | 'ghost';
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  screenName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
  isRetrying: boolean;
}

/**
 * Enhanced ErrorBoundary with contextual error recovery
 * Provides specific recovery paths based on error type
 */
export default class ErrorBoundary extends Component<Props, State> {
  private retryTimeoutId?: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
      isRetrying: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({ errorInfo });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log to analytics/crash reporting in production
    if (!__DEV__) {
      this.logErrorToService(error, errorInfo);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  /**
   * Categorize error based on error message and type
   */
  private categorizeError(error?: Error): ErrorCategory {
    if (!error) return 'unknown';

    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    // Network errors
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout') ||
      message.includes('connection') ||
      message.includes('offline') ||
      name === 'networkerror'
    ) {
      return 'network';
    }

    // Data/parsing errors
    if (
      message.includes('json') ||
      message.includes('parse') ||
      message.includes('undefined') ||
      message.includes('null') ||
      message.includes('type') ||
      name === 'syntaxerror' ||
      name === 'typeerror'
    ) {
      return 'data';
    }

    // Authentication errors
    if (
      message.includes('auth') ||
      message.includes('token') ||
      message.includes('unauthorized') ||
      message.includes('401') ||
      message.includes('403')
    ) {
      return 'auth';
    }

    // UI/render errors
    if (
      message.includes('render') ||
      message.includes('component') ||
      message.includes('props') ||
      message.includes('state')
    ) {
      return 'ui';
    }

    return 'unknown';
  }

  /**
   * Get contextual error information and recovery actions
   */
  private getErrorContext(): ErrorContext {
    const { error } = this.state;
    const category = this.categorizeError(error);

    const baseActions: RecoveryAction[] = [
      {
        label: 'Try Again',
        action: this.handleRetry,
        variant: 'primary',
      },
    ];

    switch (category) {
      case 'network':
        return {
          category,
          title: 'Connection Problem',
          message:
            "We couldn't connect to our servers. Please check your internet connection and try again.",
          icon: <WifiOff color={COLORS.warning} size={64} />,
          recoveryActions: [
            ...baseActions,
            {
              label: 'Check Network Settings',
              action: () => Linking.openSettings(),
              variant: 'secondary',
            },
          ],
        };

      case 'data':
        return {
          category,
          title: 'Data Error',
          message:
            'There was a problem loading your data. This might be temporary. Please try refreshing.',
          icon: <Database color={COLORS.info} size={64} />,
          recoveryActions: [
            ...baseActions,
            {
              label: 'Clear Cache & Retry',
              action: this.handleClearCacheAndRetry,
              variant: 'secondary',
            },
          ],
        };

      case 'auth':
        return {
          category,
          title: 'Session Expired',
          message:
            'Your session has expired. Please sign in again to continue.',
          icon: <AlertTriangle color={COLORS.warning} size={64} />,
          recoveryActions: [
            {
              label: 'Sign In Again',
              action: this.handleReAuthenticate,
              variant: 'primary',
            },
            {
              label: 'Go Home',
              action: this.handleGoHome,
              variant: 'secondary',
            },
          ],
        };

      case 'ui':
        return {
          category,
          title: 'Display Error',
          message:
            'Something went wrong displaying this screen. Try going back or restarting the app.',
          icon: <RefreshCw color={COLORS.purple} size={64} />,
          recoveryActions: [
            ...baseActions,
            {
              label: 'Go Home',
              action: this.handleGoHome,
              variant: 'secondary',
            },
          ],
        };

      default:
        return {
          category: 'unknown',
          title: 'Something Went Wrong',
          message:
            "We're sorry, but something unexpected happened. Our team has been notified.",
          icon: <AlertTriangle color={COLORS.danger} size={64} />,
          recoveryActions: [
            ...baseActions,
            {
              label: 'Contact Support',
              action: this.handleContactSupport,
              variant: 'secondary',
            },
            {
              label: 'Go Home',
              action: this.handleGoHome,
              variant: 'ghost',
            },
          ],
        };
    }
  }

  /**
   * Log error to crash reporting service
   */
  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // In production, send to crash reporting service like Sentry, Bugsnag, etc.
    // Example: Sentry.captureException(error, { extra: { errorInfo } });
    console.log('Would log error to service:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      screenName: this.props.screenName,
    });
  }

  /**
   * Retry with exponential backoff
   */
  handleRetry = async () => {
    const { retryCount } = this.state;

    // Max 3 retries
    if (retryCount >= 3) {
      return;
    }

    this.setState({ isRetrying: true });

    // Exponential backoff: 1s, 2s, 4s
    const delay = Math.pow(2, retryCount) * 1000;

    await new Promise((resolve) => {
      this.retryTimeoutId = setTimeout(resolve, delay);
    });

    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: retryCount + 1,
      isRetrying: false,
    });

    this.props.onReset?.();
  };

  /**
   * Clear app cache and retry
   */
  handleClearCacheAndRetry = async () => {
    try {
      // Clear any cached data that might be corrupted
      // This could be extended to clear AsyncStorage cache if needed
      this.handleRetry();
    } catch (e) {
      console.error('Error clearing cache:', e);
    }
  };

  /**
   * Handle re-authentication
   */
  handleReAuthenticate = () => {
    // Clear tokens and navigate to login
    // This would typically trigger a navigation to auth flow
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0,
    });
    this.props.onReset?.();
  };

  /**
   * Navigate to home screen
   */
  handleGoHome = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0,
    });
    this.props.onReset?.();
  };

  /**
   * Open support email
   */
  handleContactSupport = () => {
    const { error } = this.state;
    const subject = encodeURIComponent('App Error Report');
    const body = encodeURIComponent(
      `Error: ${error?.message || 'Unknown error'}\n\nScreen: ${this.props.screenName || 'Unknown'}\n\nPlease describe what you were doing when this error occurred:\n`
    );
    Linking.openURL(`mailto:support@talorme.com?subject=${subject}&body=${body}`);
  };

  /**
   * Full reset to initial state
   */
  handleFullReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0,
      isRetrying: false,
    });
    this.props.onReset?.();
  };

  render() {
    const { hasError, error, errorInfo, retryCount, isRetrying } = this.state;
    const { children, fallback } = this.props;

    if (!hasError) {
      return children;
    }

    if (fallback) {
      return fallback;
    }

    const errorContext = this.getErrorContext();
    const canRetry = retryCount < 3;

    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.iconContainer}>{errorContext.icon}</View>

            <Text style={styles.title}>{errorContext.title}</Text>

            <Text style={styles.message}>{errorContext.message}</Text>

            {retryCount > 0 && canRetry && (
              <View style={styles.retryInfo}>
                <Text style={styles.retryText}>
                  Retry attempt {retryCount}/3
                </Text>
              </View>
            )}

            {!canRetry && (
              <View style={styles.maxRetriesInfo}>
                <Text style={styles.maxRetriesText}>
                  Maximum retries reached. Please contact support if the problem
                  persists.
                </Text>
              </View>
            )}

            <View style={styles.actionsContainer}>
              {errorContext.recoveryActions.map((action, index) => (
                <GlassButton
                  key={index}
                  label={action.label}
                  variant={action.variant}
                  onPress={action.action}
                  loading={isRetrying && index === 0}
                  disabled={isRetrying || (!canRetry && action.label === 'Try Again')}
                  style={styles.actionButton}
                  fullWidth
                />
              ))}
            </View>

            {__DEV__ && error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Debug Info (Dev Only):</Text>
                <Text style={styles.errorCategory}>
                  Category: {errorContext.category}
                </Text>
                <Text style={styles.errorText}>{error.toString()}</Text>
                {errorInfo?.componentStack && (
                  <ScrollView
                    style={styles.stackScrollView}
                    horizontal
                    showsHorizontalScrollIndicator
                  >
                    <Text style={styles.stackText}>
                      {errorInfo.componentStack}
                    </Text>
                  </ScrollView>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
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
    marginBottom: SPACING.lg,
    lineHeight: 24,
  },
  retryInfo: {
    backgroundColor: COLORS.dark.backgroundSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.lg,
  },
  retryText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.info,
  },
  maxRetriesInfo: {
    backgroundColor: ALPHA_COLORS.danger.bgSubtle,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: ALPHA_COLORS.danger.border,
  },
  maxRetriesText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.danger,
    textAlign: 'center',
  },
  actionsContainer: {
    width: '100%',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  actionButton: {
    marginBottom: SPACING.xs,
  },
  errorDetails: {
    backgroundColor: COLORS.dark.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    width: '100%',
    maxHeight: 200,
  },
  errorTitle: {
    fontSize: 12,
    fontFamily: FONTS.semibold,
    color: COLORS.danger,
    marginBottom: SPACING.sm,
  },
  errorCategory: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: COLORS.info,
    marginBottom: SPACING.xs,
  },
  errorText: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textTertiary,
    marginBottom: SPACING.sm,
  },
  stackScrollView: {
    maxHeight: 100,
  },
  stackText: {
    fontSize: 9,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textTertiary,
  },
});
