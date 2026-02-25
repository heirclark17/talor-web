import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  LiquidGlassView,
  LiquidGlassContainerView,
  isLiquidGlassSupported,
} from './LiquidGlassWrapper';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, FONTS, RADIUS, SPACING, GLASS, ALPHA_COLORS } from '../../utils/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 65;
const TAB_BAR_MARGIN = SPACING.sm;
const MIN_TAB_WIDTH = 70;

export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { isDark, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const tabCount = state.routes.length;
  const needsScroll = tabCount > 5;

  const renderTabs = () => (
    <>
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
          size: 22,
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
            compact={needsScroll}
          />
        );
      })}
    </>
  );

  const containerStyle = [
    styles.container,
    { paddingBottom: insets.bottom > 0 ? insets.bottom : SPACING.sm },
  ];

  // Use native Liquid Glass on iOS 26+
  if (Platform.OS === 'ios' && isLiquidGlassSupported) {
    return (
      <View style={containerStyle}>
        <LiquidGlassContainerView spacing={8} style={styles.liquidGlassContainer}>
          <LiquidGlassView
            style={styles.liquidTabBar}
            effect="regular"
            tintColor={isDark ? 'rgba(30, 30, 30, 0.5)' : 'rgba(255, 255, 255, 0.6)'}
            colorScheme={isDark ? 'dark' : 'light'}
          >
            {needsScroll ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {renderTabs()}
              </ScrollView>
            ) : (
              <View style={styles.tabsContainer}>
                {renderTabs()}
              </View>
            )}
          </LiquidGlassView>
        </LiquidGlassContainerView>
      </View>
    );
  }

  // Fallback: expo-blur for older iOS / Android
  return (
    <View style={containerStyle}>
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
                ? ALPHA_COLORS.black[70]
                : ALPHA_COLORS.white[80],
              borderColor: isDark
                ? ALPHA_COLORS.white[10]
                : 'transparent',
            },
          ]}
        >
          {needsScroll ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {renderTabs()}
            </ScrollView>
          ) : (
            renderTabs()
          )}
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
  compact?: boolean;
}

function TabButton({
  label,
  icon,
  isFocused,
  onPress,
  onLongPress,
  isDark,
  colors,
  compact = false,
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
      style={[styles.tabButton, compact && styles.tabButtonCompact]}
      activeOpacity={1}
    >
      <Animated.View style={[styles.tabContent, compact && styles.tabContentCompact, animatedStyle]}>
        {/* Active indicator background */}
        {isFocused && (
          <View
            style={[
              styles.activeIndicator,
              {
                backgroundColor: isDark
                  ? ALPHA_COLORS.primary.bg
                  : ALPHA_COLORS.primary.bgSubtle,
              },
            ]}
          />
        )}
        <View style={styles.iconContainer}>{icon}</View>
        <Text
          style={[
            styles.label,
            compact && styles.labelCompact,
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
    zIndex: 100,
    elevation: 100,
  },
  blurContainer: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  liquidGlassContainer: {
    borderRadius: RADIUS.xl,
  },
  liquidTabBar: {
    height: TAB_BAR_HEIGHT,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.xs,
  },
  tabsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    paddingHorizontal: SPACING.xs,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonCompact: {
    flex: 0,
    minWidth: MIN_TAB_WIDTH,
    paddingHorizontal: SPACING.xs,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    position: 'relative',
    minWidth: 56,
  },
  tabContentCompact: {
    paddingHorizontal: SPACING.xs,
    minWidth: 50,
  },
  activeIndicator: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS.md,
  },
  iconContainer: {
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.1,
  },
  labelCompact: {
    fontSize: 9,
  },
});
