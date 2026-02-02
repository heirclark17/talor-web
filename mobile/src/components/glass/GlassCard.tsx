import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LiquidGlassView, isLiquidGlassSupported } from './LiquidGlassWrapper';
import { useTheme } from '../../context/ThemeContext';
import { GLASS, SHADOWS, RADIUS, SPACING } from '../../utils/constants';

type GlassMaterial = keyof typeof GLASS.materials;
type ShadowType = keyof typeof SHADOWS;

interface GlassCardProps {
  children: ReactNode;
  material?: GlassMaterial;
  shadow?: ShadowType;
  borderRadius?: number;
  padding?: number;
  style?: StyleProp<ViewStyle>;
  /** Use blur effect (more expensive but more authentic) */
  useBlur?: boolean;
  /** Add border */
  bordered?: boolean;
  /** Make interactive (grows on touch with shimmer) - iOS 26 only */
  interactive?: boolean;
  /** Tint color for liquid glass effect */
  tintColor?: string;
}

export function GlassCard({
  children,
  material = 'regular',
  shadow = 'subtle',
  borderRadius = RADIUS.lg,
  padding = SPACING.lg,
  style,
  useBlur = true,
  bordered = true,
  interactive = false,
  tintColor,
}: GlassCardProps) {
  const { isDark, colors } = useTheme();
  const { blur, opacity } = GLASS.materials[material];
  const shadowStyle = SHADOWS[shadow];

  // Calculate background color based on material and theme
  const backgroundColor = isDark
    ? `rgba(255, 255, 255, ${opacity * 0.25})`
    : `rgba(255, 255, 255, ${opacity * 1.5})`;

  const borderColor = isDark
    ? `rgba(255, 255, 255, ${opacity * 0.4})`
    : `rgba(0, 0, 0, ${opacity * 0.15})`;

  // Liquid glass tint color
  const glassTint = tintColor || (isDark
    ? `rgba(255, 255, 255, ${opacity * 0.15})`
    : `rgba(100, 150, 200, ${opacity * 0.2})`);

  // Map material to liquid glass effect
  const liquidGlassEffect = material === 'ultraThin' || material === 'thin' ? 'clear' : 'regular';

  const containerStyle: ViewStyle = {
    borderRadius,
    overflow: 'hidden',
    ...(bordered && !isLiquidGlassSupported && {
      borderWidth: 1,
      borderColor,
    }),
    ...shadowStyle,
  };

  const contentStyle: ViewStyle = {
    padding,
  };

  // Use native Liquid Glass on iOS 26+
  if (Platform.OS === 'ios' && isLiquidGlassSupported) {
    return (
      <LiquidGlassView
        style={[
          containerStyle,
          { padding },
          style,
        ]}
        effect={liquidGlassEffect}
        interactive={interactive}
        tintColor={glassTint}
        colorScheme={isDark ? 'dark' : 'light'}
      >
        {children}
      </LiquidGlassView>
    );
  }

  // Fallback: expo-blur for older iOS / Android
  if (useBlur && Platform.OS === 'ios') {
    return (
      <View style={[containerStyle, style]}>
        <BlurView
          intensity={blur}
          tint={isDark ? 'dark' : 'light'}
          style={styles.blur}
        >
          <View style={[styles.blurContent, contentStyle, { backgroundColor }]}>
            {children}
          </View>
        </BlurView>
      </View>
    );
  }

  // Fallback without blur (Android or performance mode)
  return (
    <View
      style={[
        containerStyle,
        { backgroundColor },
        style,
      ]}
    >
      <View style={contentStyle}>{children}</View>
    </View>
  );
}

export default GlassCard;

const styles = StyleSheet.create({
  blur: {
    flex: 1,
  },
  blurContent: {
    flex: 1,
  },
});
