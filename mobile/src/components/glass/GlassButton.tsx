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
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, FONTS, RADIUS, SPACING, GLASS, ANIMATION } from '../../utils/constants';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface GlassButtonProps {
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
}

const SIZE_CONFIG: Record<ButtonSize, { height: number; paddingHorizontal: number; fontSize: number; iconSize: number }> = {
  sm: { height: 36, paddingHorizontal: SPACING.md, fontSize: 14, iconSize: 16 },
  md: { height: 44, paddingHorizontal: SPACING.lg, fontSize: 16, iconSize: 20 },
  lg: { height: 52, paddingHorizontal: SPACING.xl, fontSize: 18, iconSize: 24 },
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
}: GlassButtonProps) {
  const { isDark, colors } = useTheme();
  const scale = useSharedValue(1);
  const sizeConfig = SIZE_CONFIG[size];

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, {
      damping: ANIMATION.spring.damping,
      stiffness: ANIMATION.spring.stiffness,
    });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, {
      damping: ANIMATION.spring.damping,
      stiffness: ANIMATION.spring.stiffness,
    });
  }, [scale]);

  const handlePress = useCallback(() => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  }, [haptic, onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Get variant-specific styles
  const getVariantStyles = (): { bg: string; border: string; text: string; blurTint: 'dark' | 'light' } => {
    switch (variant) {
      case 'primary':
        return {
          bg: COLORS.primary,
          border: 'transparent',
          text: '#ffffff',
          blurTint: 'dark',
        };
      case 'secondary':
        return {
          bg: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          border: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
          text: colors.text,
          blurTint: isDark ? 'dark' : 'light',
        };
      case 'ghost':
        return {
          bg: 'transparent',
          border: 'transparent',
          text: colors.text,
          blurTint: isDark ? 'dark' : 'light',
        };
      case 'danger':
        return {
          bg: 'rgba(239, 68, 68, 0.15)',
          border: 'rgba(239, 68, 68, 0.3)',
          text: COLORS.danger,
          blurTint: isDark ? 'dark' : 'light',
        };
      case 'success':
        return {
          bg: 'rgba(16, 185, 129, 0.15)',
          border: 'rgba(16, 185, 129, 0.3)',
          text: COLORS.success,
          blurTint: isDark ? 'dark' : 'light',
        };
      default:
        return {
          bg: COLORS.primary,
          border: 'transparent',
          text: '#ffffff',
          blurTint: 'dark',
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

  // For ghost variant, don't use blur
  if (variant === 'ghost') {
    return (
      <AnimatedTouchable
        style={[buttonStyle, animatedStyle, style]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        {content}
      </AnimatedTouchable>
    );
  }

  // For primary variant, use solid background
  if (variant === 'primary') {
    return (
      <AnimatedTouchable
        style={[buttonStyle, animatedStyle, style]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={0.8}
      >
        {content}
      </AnimatedTouchable>
    );
  }

  // For other variants, use blur effect
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
    >
      <BlurView
        intensity={GLASS.materials.thin.blur}
        tint={variantStyles.blurTint}
        style={styles.blur}
      >
        <View
          style={[
            buttonStyle,
            { borderRadius: 0, overflow: 'visible' },
            style,
          ]}
        >
          {content}
        </View>
      </BlurView>
    </AnimatedTouchable>
  );
}

export default GlassButton;

const styles = StyleSheet.create({
  blur: {
    overflow: 'hidden',
  },
});
