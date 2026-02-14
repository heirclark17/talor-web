import React, { ReactNode, useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp, Platform, InteractionManager } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { LiquidGlassView, isLiquidGlassSupported } from './LiquidGlassWrapper';
import { useTheme } from '../../context/ThemeContext';
import { GLASS, SHADOWS, RADIUS, SPACING, ANIMATION } from '../../utils/constants';

type GlassMaterial = keyof typeof GLASS.materials;
type ShadowType = keyof typeof SHADOWS;
type GlassCardVariant = 'standard' | 'elevated' | 'compact' | 'flat';

interface VariantDefaults {
  material: GlassMaterial;
  shadow: ShadowType;
  borderRadius: number;
  padding: number;
}

interface GlassCardProps {
  children: ReactNode;
  /** Preset variant with automatic defaults (from HeirclarkHealthApp) */
  variant?: GlassCardVariant;
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

/**
 * Get variant defaults (from HeirclarkHealthApp pattern)
 * Variants provide preset configurations for common use cases
 */
function getVariantDefaults(variant: GlassCardVariant): VariantDefaults {
  switch (variant) {
    case 'standard':
      return {
        material: 'regular',
        shadow: 'standard',
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
      };
    case 'elevated':
      return {
        material: 'thick',
        shadow: 'elevated',
        borderRadius: RADIUS.xl,
        padding: SPACING.md,
      };
    case 'compact':
      return {
        material: 'thin',
        shadow: 'subtle',
        borderRadius: RADIUS.md,
        padding: 12,
      };
    case 'flat':
      return {
        material: 'ultraThin',
        shadow: 'none',
        borderRadius: RADIUS.md,
        padding: SPACING.md,
      };
  }
}

export function GlassCard({
  children,
  variant,
  material: materialProp,
  shadow: shadowProp,
  borderRadius: borderRadiusProp,
  padding: paddingProp,
  style,
  useBlur = true,
  bordered = true,
  interactive = false,
  tintColor,
}: GlassCardProps) {
  // Apply variant defaults if variant is specified, otherwise use individual props or defaults
  const variantDefaults = variant ? getVariantDefaults(variant) : null;

  const material = materialProp ?? variantDefaults?.material ?? 'regular';
  const shadow = shadowProp ?? variantDefaults?.shadow ?? 'subtle';
  const borderRadius = borderRadiusProp ?? variantDefaults?.borderRadius ?? RADIUS.lg;
  const padding = paddingProp ?? variantDefaults?.padding ?? SPACING.lg;
  const { isDark, colors } = useTheme();
  const { blur, opacity } = GLASS.materials[material];
  const shadowStyle = SHADOWS[shadow];

  // iOS 26 Rendering Fix: Track when content is ready before rendering BlurView
  const [isContentReady, setIsContentReady] = useState(false);
  const blurOpacity = useSharedValue(0);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    // Delay BlurView rendering until after content loads (prevents iOS flicker)
    const handle = InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        setIsContentReady(true);
        // Fade in BlurView with glass spring animation
        blurOpacity.value = withSpring(1, ANIMATION.glassSpring);
      }, 50);
    });

    return () => handle.cancel();
  }, []);

  const animatedBlurStyle = useAnimatedStyle(() => ({
    opacity: blurOpacity.value,
  }));

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
  // iOS 26 Rendering Fix: 3-layer system
  // Layer 1 (z-index: 1): BlurView with fade-in animation
  // Layer 2 (z-index: 2): Content with background tint
  // Layer 3 (z-index: 3): Border layer on top
  if (useBlur && Platform.OS === 'ios') {
    return (
      <View style={[containerStyle, style]}>
        {/* Layer 1: BlurView - renders AFTER content is ready with fade-in */}
        {isContentReady && (
          <Animated.View
            style={[StyleSheet.absoluteFill, animatedBlurStyle]}
            pointerEvents="none"
          >
            <BlurView
              intensity={blur}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        )}

        {/* Layer 2: Content - renders FIRST with background tint */}
        <View style={[contentStyle, { backgroundColor }]}>
          {children}
        </View>

        {/* Layer 3: Border - renders LAST on top to ensure visibility */}
        {bordered && (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius,
                borderWidth: 1,
                borderColor,
              },
            ]}
            pointerEvents="none"
          />
        )}
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
