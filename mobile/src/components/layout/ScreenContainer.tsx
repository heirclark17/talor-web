import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { TAB_BAR_HEIGHT, SPACING } from '../../utils/constants';
import { ScreenStyles } from '../../constants/SharedStyles';

interface ScreenContainerProps {
  /**
   * Children elements to render
   */
  children: React.ReactNode;

  /**
   * Whether the screen should be scrollable
   * @default false
   */
  scrollable?: boolean;

  /**
   * Whether the screen has a tab bar (adds bottom padding)
   * @default false
   */
  withTabBar?: boolean;

  /**
   * Whether to add horizontal padding
   * @default false
   */
  withPadding?: boolean;

  /**
   * Custom safe area edges
   * @default ['top', 'bottom']
   */
  edges?: Edge[];

  /**
   * Container style
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Content container style (for ScrollView)
   */
  contentContainerStyle?: StyleProp<ViewStyle>;

  /**
   * Custom background color (overrides theme)
   */
  backgroundColor?: string;
}

/**
 * ScreenContainer Component
 *
 * Consistent screen wrapper with SafeAreaView, optional ScrollView, and tab bar padding.
 * Provides standard layout structure for all screens in the app.
 *
 * @example
 * ```tsx
 * // Basic scrollable screen
 * <ScreenContainer scrollable withTabBar>
 *   <Text>Content here</Text>
 * </ScreenContainer>
 *
 * // Non-scrollable screen with padding
 * <ScreenContainer withPadding>
 *   <View>Content here</View>
 * </ScreenContainer>
 * ```
 */
export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scrollable = false,
  withTabBar = false,
  withPadding = false,
  edges = ['top', 'bottom'],
  style,
  contentContainerStyle,
  backgroundColor,
}) => {
  const { colors } = useTheme();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: backgroundColor || colors.background,
  };

  const contentStyle: ViewStyle = {
    ...(withPadding && ScreenStyles.contentWithPadding),
    ...(withTabBar && { paddingBottom: TAB_BAR_HEIGHT }),
  };

  if (scrollable) {
    return (
      <SafeAreaView edges={edges} style={[containerStyle, style]}>
        <ScrollView
          contentContainerStyle={[
            ScreenStyles.scrollContent,
            contentStyle,
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={false}
          bounces={true}
          overScrollMode="never"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={edges} style={[containerStyle, style]}>
      <View style={[ScreenStyles.container, contentStyle, contentContainerStyle]}>
        {children}
      </View>
    </SafeAreaView>
  );
};
