import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../context/ThemeContext';
import { GLASS, RADIUS } from '../../utils/constants';

type GlassMaterial = keyof typeof GLASS.materials;

interface GlassContainerProps {
  children: ReactNode;
  material?: GlassMaterial;
  style?: StyleProp<ViewStyle>;
  /** Use blur effect */
  useBlur?: boolean;
  /** Disable border radius */
  square?: boolean;
}

export function GlassContainer({
  children,
  material = 'thin',
  style,
  useBlur = true,
  square = false,
}: GlassContainerProps) {
  const { isDark } = useTheme();
  const { blur, opacity } = GLASS.materials[material];

  const backgroundColor = isDark
    ? `rgba(255, 255, 255, ${opacity * 0.2})`
    : `rgba(255, 255, 255, ${opacity * 1.2})`;

  const borderColor = isDark
    ? `rgba(255, 255, 255, ${opacity * 0.3})`
    : `rgba(0, 0, 0, ${opacity * 0.1})`;

  const containerStyle: ViewStyle = {
    overflow: 'hidden',
    ...(!square && { borderRadius: RADIUS.lg }),
    borderWidth: 1,
    borderColor,
  };

  if (useBlur) {
    return (
      <View style={[containerStyle, style]}>
        <BlurView
          intensity={blur}
          tint={isDark ? 'dark' : 'light'}
          style={styles.blur}
        >
          <View style={[styles.content, { backgroundColor }]}>
            {children}
          </View>
        </BlurView>
      </View>
    );
  }

  return (
    <View style={[containerStyle, { backgroundColor }, style]}>
      {children}
    </View>
  );
}

export default GlassContainer;

const styles = StyleSheet.create({
  blur: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
