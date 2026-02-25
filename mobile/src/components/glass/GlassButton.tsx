import React, { ReactNode, useCallback } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LiquidGlassView, isLiquidGlassSupported } from './LiquidGlassWrapper';
import { lightImpact } from '../../utils/haptics';
import { useReduceMotion } from '../../hooks/useReduceMotion';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, FONTS, RADIUS, SPACING, GLASS, ANIMATION, ALPHA_COLORS } from '../../utils/constants';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'accent' | 'warning';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface GlassButtonProps {
  children?: ReactNode;
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  haptic?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

// Standardized button sizes (matches web design system)
const SIZE_CONFIG: Record<ButtonSize, { height: number; paddingHorizontal: number; fontSize: number; iconSize: number }> = {
  sm: { height: 40, paddingHorizontal: 16, fontSize: 14, iconSize: 20 },  // Small: 40px
  md: { height: 48, paddingHorizontal: 24, fontSize: 16, iconSize: 24 },  // Standard: 48px (iOS touch target)
  lg: { height: 56, paddingHorizontal: 32, fontSize: 18, iconSize: 28 },  // Large: 56px
};

export function GlassButton({
  children,
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  onPress,
  style,
  textStyle,
  haptic = true,
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
}: GlassButtonProps) {
  const { isDark, colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const scale = useSharedValue(1);
  const sizeConfig = SIZE_CONFIG[size];

  const handlePressIn = useCallback(() => {
    // Only animate on non-liquid glass (liquid glass handles its own animation)
    if (!isLiquidGlassSupported || Platform.OS !== 'ios') {
      if (reduceMotion) {
        // Instant animation when Reduce Motion is enabled
        scale.value = withTiming(0.97, { duration: 0 });
      } else {
        // Spring animation for normal users
        scale.value = withSpring(0.97, {
          damping: ANIMATION.spring.damping,
          stiffness: ANIMATION.spring.stiffness,
        });
      }
    }
  }, [scale, reduceMotion]);

  const handlePressOut = useCallback(() => {
    if (!isLiquidGlassSupported || Platform.OS !== 'ios') {
      if (reduceMotion) {
        // Instant animation when Reduce Motion is enabled
        scale.value = withTiming(1, { duration: 0 });
      } else {
        // Spring animation for normal users
        scale.value = withSpring(1, {
          damping: ANIMATION.spring.damping,
          stiffness: ANIMATION.spring.stiffness,
        });
      }
    }
  }, [scale, reduceMotion]);

  const handlePress = useCallback(() => {
    if (haptic) {
      lightImpact();
    }
    onPress?.();
  }, [haptic, onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Get variant-specific styles
  const getVariantStyles = (): { bg: string; border: string; text: string; blurTint: 'dark' | 'light'; tintColor: string } => {
    switch (variant) {
      case 'primary':
        return {
          bg: COLORS.primary,
          border: 'transparent',
          text: '#ffffff',
          blurTint: 'dark',
          tintColor: 'rgba(59, 130, 246, 0.4)',
        };
      case 'secondary':
        return {
          bg: isDark ? ALPHA_COLORS.white[10] : ALPHA_COLORS.black[5],
          border: isDark ? ALPHA_COLORS.white[15] : 'transparent',
          text: colors.text,
          blurTint: isDark ? 'dark' : 'light',
          tintColor: isDark ? ALPHA_COLORS.white[10] : ALPHA_COLORS.black[5],
        };
      case 'ghost':
        return {
          bg: 'transparent',
          border: 'transparent',
          text: colors.text,
          blurTint: isDark ? 'dark' : 'light',
          tintColor: 'transparent',
        };
      case 'danger':
        return {
          bg: ALPHA_COLORS.danger.bg,
          border: ALPHA_COLORS.danger.border,
          text: COLORS.danger,
          blurTint: isDark ? 'dark' : 'light',
          tintColor: ALPHA_COLORS.danger.bg,
        };
      case 'success':
        return {
          bg: ALPHA_COLORS.success.bg,
          border: ALPHA_COLORS.success.border,
          text: COLORS.success,
          blurTint: isDark ? 'dark' : 'light',
          tintColor: ALPHA_COLORS.success.bg,
        };
      case 'accent':
        return {
          bg: ALPHA_COLORS.primary.bg,
          border: ALPHA_COLORS.primary.border,
          text: colors.accent,
          blurTint: isDark ? 'dark' : 'light',
          tintColor: ALPHA_COLORS.primary.bg,
        };
      case 'warning':
        return {
          bg: ALPHA_COLORS.warning.bg,
          border: ALPHA_COLORS.warning.border,
          text: COLORS.warning,
          blurTint: isDark ? 'dark' : 'light',
          tintColor: ALPHA_COLORS.warning.bg,
        };
      default:
        return {
          bg: COLORS.primary,
          border: 'transparent',
          text: '#ffffff',
          blurTint: 'dark',
          tintColor: 'rgba(59, 130, 246, 0.4)',
        };
    }
  };

  const variantStyles = getVariantStyles();
  const isDisabled = disabled || loading;

  const buttonStyle: ViewStyle = {
    height: sizeConfig.height,
    paddingHorizontal: sizeConfig.paddingHorizontal,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: variantStyles.bg,
    borderWidth: variantStyles.border !== 'transparent' ? 1 : 0,
    borderColor: variantStyles.border,
    opacity: isDisabled ? 0.5 : 1,
    ...(fullWidth && { width: '100%' }),
  };

  const labelStyle: TextStyle = {
    fontSize: sizeConfig.fontSize,
    fontFamily: FONTS.semibold,
    color: variantStyles.text,
  };

  const content = (
    <>
      {loading ? (
        <ActivityIndicator size="small" color={variantStyles.text} />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          {(label || children) && (
            <Text style={[labelStyle, textStyle]}>
              {label || children}
            </Text>
          )}
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </>
  );

  const a11yProps = { accessibilityLabel, accessibilityHint };

  // For ghost variant, don't use glass effect
  if (variant === 'ghost') {
    return (
      <AnimatedTouchable
        style={[buttonStyle, animatedStyle, style]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={0.7}
        {...a11yProps}
      >
        {content}
      </AnimatedTouchable>
    );
  }

  // For primary variant, use solid background (no glass)
  if (variant === 'primary') {
    return (
      <AnimatedTouchable
        style={[buttonStyle, animatedStyle, style]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={0.8}
        {...a11yProps}
      >
        {content}
      </AnimatedTouchable>
    );
  }

  // Use native Liquid Glass on iOS 26+ for secondary/danger/success variants
  if (Platform.OS === 'ios' && isLiquidGlassSupported) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={isDisabled}
        activeOpacity={1}
        style={[fullWidth && { width: '100%' }, style]}
        {...a11yProps}
      >
        <LiquidGlassView
          style={[
            buttonStyle,
            { borderWidth: 0 }, // Liquid glass handles its own borders
          ]}
          effect="clear"
          interactive={true}
          tintColor={variantStyles.tintColor}
          colorScheme={isDark ? 'dark' : 'light'}
        >
          {content}
        </LiquidGlassView>
      </TouchableOpacity>
    );
  }

  // Fallback: expo-blur for older iOS / Android
  return (
    <AnimatedTouchable
      style={[
        { borderRadius: RADIUS.md, overflow: 'hidden', opacity: isDisabled ? 0.5 : 1 },
        animatedStyle,
        fullWidth && { width: '100%' },
        style,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...a11yProps}
    >
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={GLASS.materials.thin.blur}
          tint={variantStyles.blurTint}
          style={styles.blur}
        >
          <View
            style={[
              buttonStyle,
              { borderRadius: 0, overflow: 'visible' },
            ]}
          >
            {content}
          </View>
        </BlurView>
      ) : (
        <View style={buttonStyle}>
          {content}
        </View>
      )}
    </AnimatedTouchable>
  );
}

export default GlassButton;

const styles = StyleSheet.create({
  blur: {
    overflow: 'hidden',
  },
});
