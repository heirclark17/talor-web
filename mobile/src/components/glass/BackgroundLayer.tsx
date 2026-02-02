import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Dimensions,
  AccessibilityInfo,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { PatternBackground } from '../patterns/PatternBackground';
import { getBackgroundById, DEFAULT_BACKGROUND_ID } from '../../constants/backgrounds';
import { useTheme } from '../../context/ThemeContext';
import { ALPHA_COLORS } from '../../utils/constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BackgroundLayerProps {
  children: React.ReactNode;
}

export function BackgroundLayer({ children }: BackgroundLayerProps) {
  const { backgroundId, customBackgroundUri, isDark, colors } = useTheme();
  const background = getBackgroundById(backgroundId) || getBackgroundById(DEFAULT_BACKGROUND_ID)!;

  // Animation values for animated backgrounds
  const animationProgress = useSharedValue(0);
  const isReduceMotionEnabled = useRef(false);

  // Check for reduce motion preference
  useEffect(() => {
    const checkReduceMotion = async () => {
      isReduceMotionEnabled.current = await AccessibilityInfo.isReduceMotionEnabled();
    };
    checkReduceMotion();

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (reduceMotionEnabled) => {
        isReduceMotionEnabled.current = reduceMotionEnabled;
        if (reduceMotionEnabled) {
          cancelAnimation(animationProgress);
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  // Start animation for animated backgrounds
  useEffect(() => {
    if (background.type === 'animated' && !isReduceMotionEnabled.current) {
      animationProgress.value = 0;
      animationProgress.value = withRepeat(
        withTiming(1, {
          duration: 10000,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else {
      cancelAnimation(animationProgress);
    }

    return () => {
      cancelAnimation(animationProgress);
    };
  }, [background.type, background.id]);

  // Animated gradient style
  const animatedGradientStyle = useAnimatedStyle(() => {
    if (background.type !== 'animated') return {};

    return {
      transform: [
        {
          translateX: animationProgress.value * SCREEN_WIDTH * 0.3,
        },
        {
          translateY: animationProgress.value * SCREEN_HEIGHT * 0.1,
        },
      ],
    };
  });

  const themeColors = isDark ? background.colors.dark : background.colors.light;

  const renderBackground = () => {
    // Custom photo background
    if (customBackgroundUri) {
      return (
        <>
          <Image
            source={{ uri: customBackgroundUri }}
            style={styles.customImage}
            resizeMode="cover"
          />
          {/* Theme-aware overlay for readability */}
          <View
            style={[
              styles.overlay,
              {
                backgroundColor: isDark
                  ? ALPHA_COLORS.black[50]
                  : ALPHA_COLORS.white[30],
              },
            ]}
          />
        </>
      );
    }

    // Solid background
    if (background.type === 'solid') {
      return (
        <View
          style={[styles.solidBackground, { backgroundColor: themeColors[0] }]}
        />
      );
    }

    // Gradient background
    if (background.type === 'gradient') {
      return (
        <LinearGradient
          colors={themeColors as [string, string, ...string[]]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      );
    }

    // Animated background
    if (background.type === 'animated') {
      return (
        <>
          <View
            style={[styles.solidBackground, { backgroundColor: themeColors[0] }]}
          />
          <Animated.View style={[styles.animatedLayer, animatedGradientStyle]}>
            <LinearGradient
              colors={[
                themeColors[0],
                themeColors[1] || themeColors[0],
                themeColors[2] || themeColors[1] || themeColors[0],
                themeColors[0],
              ] as [string, string, ...string[]]}
              style={styles.animatedGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>
          {/* Subtle overlay to smooth animation */}
          <LinearGradient
            colors={[
              'transparent',
              isDark ? ALPHA_COLORS.black[20] : ALPHA_COLORS.white[20],
            ] as [string, string]}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        </>
      );
    }

    // Pattern background
    if (background.type === 'pattern' && background.patternType) {
      return (
        <PatternBackground
          patternType={background.patternType}
          colors={themeColors}
          isDark={isDark}
        />
      );
    }

    // Fallback
    return (
      <View
        style={[styles.solidBackground, { backgroundColor: colors.background }]}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundContainer}>{renderBackground()}</View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

export default BackgroundLayer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
  solidBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  customImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  animatedLayer: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH * 1.5,
    height: SCREEN_HEIGHT * 1.5,
    top: -SCREEN_HEIGHT * 0.25,
    left: -SCREEN_WIDTH * 0.25,
  },
  animatedGradient: {
    flex: 1,
  },
});
