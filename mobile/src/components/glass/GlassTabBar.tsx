import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, FONTS, RADIUS, SPACING, GLASS } from '../../utils/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 70;
const TAB_BAR_MARGIN = SPACING.md;

export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { isDark, colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom > 0 ? insets.bottom : SPACING.md },
      ]}
    >
      <BlurView
        intensity={GLASS.materials.regular.blur}
        tint={isDark ? 'dark' : 'light'}
        style={styles.blurContainer}
      >
        <View
          style={[
            styles.tabBar,
            {
              backgroundColor: isDark
                ? 'rgba(30, 30, 30, 0.7)'
                : 'rgba(255, 255, 255, 0.8)',
              borderColor: isDark
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.08)',
            },
          ]}
        >
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            const isFocused = state.index === index;

            const onPress = () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            // Get the icon from options
            const icon = options.tabBarIcon?.({
              focused: isFocused,
              color: isFocused ? COLORS.primary : colors.textTertiary,
              size: 24,
            });

            return (
              <TabButton
                key={route.key}
                label={typeof label === 'string' ? label : route.name}
                icon={icon}
                isFocused={isFocused}
                onPress={onPress}
                onLongPress={onLongPress}
                isDark={isDark}
                colors={colors}
              />
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

interface TabButtonProps {
  label: string;
  icon: React.ReactNode;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  isDark: boolean;
  colors: typeof COLORS.dark;
}

function TabButton({
  label,
  icon,
  isFocused,
  onPress,
  onLongPress,
  isDark,
  colors,
}: TabButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={label}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}
      activeOpacity={1}
    >
      <Animated.View style={[styles.tabContent, animatedStyle]}>
        {/* Active indicator background */}
        {isFocused && (
          <View
            style={[
              styles.activeIndicator,
              {
                backgroundColor: isDark
                  ? 'rgba(59, 130, 246, 0.15)'
                  : 'rgba(59, 130, 246, 0.1)',
              },
            ]}
          />
        )}
        <View style={styles.iconContainer}>{icon}</View>
        <Text
          style={[
            styles.label,
            {
              color: isFocused ? COLORS.primary : colors.textTertiary,
              fontFamily: isFocused ? FONTS.semibold : FONTS.medium,
            },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default GlassTabBar;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: TAB_BAR_MARGIN,
  },
  blurContainer: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  tabBar: {
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    position: 'relative',
    minWidth: 60,
  },
  activeIndicator: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS.lg,
  },
  iconContainer: {
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
});
