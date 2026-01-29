import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
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

  const containerStyle: ViewStyle = {
    borderRadius,
    overflow: 'hidden',
    ...(bordered && {
      borderWidth: 1,
      borderColor,
    }),
    ...shadowStyle,
  };

  const contentStyle: ViewStyle = {
    padding,
  };

  if (useBlur) {
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

  // Fallback without blur (more performant)
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
