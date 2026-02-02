import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { WifiOff, RefreshCw, X, CloudOff } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetwork } from '../hooks/useNetwork';
import { useTheme } from '../context/ThemeContext';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS } from '../utils/constants';

interface OfflineIndicatorProps {
  /**
   * Show expanded view with queue info
   */
  showDetails?: boolean;
  /**
   * Position of the banner
   */
  position?: 'top' | 'bottom';
  /**
   * Callback when retry is pressed
   */
  onRetry?: () => void;
  /**
   * Whether the indicator can be dismissed
   */
  dismissible?: boolean;
}

/**
 * Offline status indicator component
 * Shows when the device is offline and displays pending request count
 */
export function OfflineIndicator({
  showDetails = false,
  position = 'top',
  onRetry,
  dismissible = false,
}: OfflineIndicatorProps) {
  const { colors, isDark } = useTheme();
  const { isOffline, queueStats, processQueue, hasPendingRequests } = useNetwork();
  const insets = useSafeAreaInsets();

  const slideAnim = useRef(new Animated.Value(-100)).current;
  const [isDismissed, setIsDismissed] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);

  useEffect(() => {
    if (isOffline && !isDismissed) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: position === 'top' ? -100 : 100,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isOffline, isDismissed, position, slideAnim]);

  // Reset dismissed state when coming back online
  useEffect(() => {
    if (!isOffline) {
      setIsDismissed(false);
    }
  }, [isOffline]);

  const handleRetry = async () => {
    setIsProcessing(true);
    try {
      await processQueue();
      onRetry?.();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  if (!isOffline && !hasPendingRequests) {
    return null;
  }

  const containerStyle = [
    styles.container,
    position === 'top'
      ? { top: 0, paddingTop: insets.top }
      : { bottom: 0, paddingBottom: insets.bottom },
    {
      backgroundColor: isDark
        ? 'rgba(239, 68, 68, 0.95)'
        : 'rgba(220, 38, 38, 0.95)',
      transform: [{ translateY: slideAnim }],
    },
  ];

  return (
    <Animated.View style={containerStyle}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {isOffline ? (
            <WifiOff color="#ffffff" size={20} />
          ) : (
            <CloudOff color="#ffffff" size={20} />
          )}
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {isOffline ? 'No Internet Connection' : 'Syncing Pending Changes'}
          </Text>
          {showDetails && hasPendingRequests && (
            <Text style={styles.subtitle}>
              {queueStats.total} pending {queueStats.total === 1 ? 'request' : 'requests'}
              {queueStats.byPriority.high > 0 && ` (${queueStats.byPriority.high} high priority)`}
            </Text>
          )}
        </View>

        <View style={styles.actions}>
          {hasPendingRequests && !isOffline && (
            <TouchableOpacity
              onPress={handleRetry}
              disabled={isProcessing}
              style={styles.retryButton}
              accessibilityRole="button"
              accessibilityLabel="Retry pending requests"
            >
              <RefreshCw
                color="#ffffff"
                size={18}
                style={isProcessing ? styles.spinning : undefined}
              />
            </TouchableOpacity>
          )}

          {dismissible && (
            <TouchableOpacity
              onPress={handleDismiss}
              style={styles.dismissButton}
              accessibilityRole="button"
              accessibilityLabel="Dismiss offline notification"
            >
              <X color="#ffffff" size={18} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

/**
 * Compact offline dot indicator
 * Shows in navigation bars or headers
 */
export function OfflineDot() {
  const { isOffline } = useNetwork();

  if (!isOffline) {
    return null;
  }

  return (
    <View style={styles.dot} accessibilityLabel="Offline">
      <View style={styles.dotInner} />
    </View>
  );
}

/**
 * Full-screen offline overlay
 * Use when the entire screen requires network
 */
export function OfflineOverlay({
  message = 'This feature requires an internet connection',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  const { colors, isDark } = useTheme();
  const { isOffline } = useNetwork();

  if (!isOffline) {
    return null;
  }

  return (
    <View
      style={[
        styles.overlay,
        { backgroundColor: isDark ? ALPHA_COLORS.black[80] : ALPHA_COLORS.white[90] },
      ]}
    >
      <WifiOff color={colors.textSecondary} size={64} />
      <Text style={[styles.overlayTitle, { color: colors.text }]}>
        You're Offline
      </Text>
      <Text style={[styles.overlayMessage, { color: colors.textSecondary }]}>
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          style={[styles.overlayButton, { backgroundColor: COLORS.primary }]}
          accessibilityRole="button"
          accessibilityLabel="Try again"
        >
          <RefreshCw color="#ffffff" size={18} />
          <Text style={styles.overlayButtonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default OfflineIndicator;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 48,
  },
  iconContainer: {
    marginRight: SPACING.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: FONTS.semibold,
  },
  subtitle: {
    color: ALPHA_COLORS.white[80],
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  retryButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ALPHA_COLORS.white[20],
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinning: {
    // Note: For actual spinning animation, use react-native-reanimated
    opacity: 0.7,
  },

  // Dot styles
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },

  // Overlay styles
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    zIndex: 9999,
  },
  overlayTitle: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  overlayMessage: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  overlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  overlayButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: FONTS.semibold,
  },
});
