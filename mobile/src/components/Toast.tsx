/**
 * Toast Notification Component
 * Provides non-blocking feedback for success/error/info states
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONTS, COLORS } from '../utils/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  visible: boolean;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
  onDismiss: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

const TOAST_CONFIG: Record<ToastType, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  success: { icon: 'checkmark-circle', color: COLORS.success },
  error: { icon: 'close-circle', color: COLORS.danger },
  warning: { icon: 'warning', color: COLORS.warning },
  info: { icon: 'information-circle', color: COLORS.info },
};

export function Toast({
  visible,
  type,
  message,
  description,
  duration = 4000,
  onDismiss,
  action,
}: ToastProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const config = TOAST_CONFIG[type];

  useEffect(() => {
    if (visible) {
      // Haptic feedback based on type
      if (type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (type === 'error') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else if (type === 'warning') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Slide in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 15,
          stiffness: 150,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      if (duration > 0) {
        const timer = setTimeout(() => {
          dismiss();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      // Slide out
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, duration, translateY, opacity, type]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + SPACING.sm,
          backgroundColor: isDark ? colors.backgroundSecondary : colors.background,
          borderLeftColor: config.color,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={dismiss}
        activeOpacity={0.9}
      >
        <Ionicons name={config.icon} size={24} color={config.color} />

        <View style={styles.textContainer}>
          <Text style={[styles.message, { color: colors.text }]} numberOfLines={2}>
            {message}
          </Text>
          {description && (
            <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
              {description}
            </Text>
          )}
        </View>

        {action && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: config.color }]}
            onPress={() => {
              action.onPress();
              dismiss();
            }}
          >
            <Text style={styles.actionText}>{action.label}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Dismiss notification" style={styles.closeButton} onPress={dismiss}>
          <Ionicons name="close" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

/**
 * Toast Manager Hook
 * Use this hook to manage toast state
 */
export interface ToastState {
  visible: boolean;
  type: ToastType;
  message: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function useToast() {
  const [toast, setToast] = React.useState<ToastState>({
    visible: false,
    type: 'info',
    message: '',
  });

  const show = (
    type: ToastType,
    message: string,
    options?: {
      description?: string;
      action?: { label: string; onPress: () => void };
    }
  ) => {
    setToast({
      visible: true,
      type,
      message,
      description: options?.description,
      action: options?.action,
    });
  };

  const hide = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  const success = (message: string, options?: { description?: string }) => {
    show('success', message, options);
  };

  const error = (message: string, options?: { description?: string; action?: { label: string; onPress: () => void } }) => {
    show('error', message, options);
  };

  const warning = (message: string, options?: { description?: string }) => {
    show('warning', message, options);
  };

  const info = (message: string, options?: { description?: string }) => {
    show('info', message, options);
  };

  return {
    toast,
    show,
    hide,
    success,
    error,
    warning,
    info,
  };
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: SPACING.md,
    right: SPACING.md,
    maxWidth: SCREEN_WIDTH - SPACING.md * 2,
    borderRadius: RADIUS.md,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  textContainer: {
    flex: 1,
    marginLeft: SPACING.sm,
    marginRight: SPACING.sm,
  },
  message: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
  },
  description: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  actionButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    marginRight: SPACING.sm,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 13,
    fontFamily: FONTS.semibold,
  },
  closeButton: {
    padding: SPACING.xs,
  },
});

export default Toast;
