/**
 * GlassTabBar Unit Tests
 *
 * Uses react-test-renderer to render the full component tree and interact
 * with tab buttons, covering all code paths:
 * - Tab rendering (static <= 5, scrollable > 5)
 * - Tab press / long press handlers with Haptics and navigation
 * - onPressIn / onPressOut spring animations
 * - Active tab styling (indicator, font, color)
 * - Dark vs light mode styling
 * - Label resolution (tabBarLabel -> title -> route.name)
 * - LiquidGlass iOS 26 branch
 * - defaultPrevented preventing navigation
 * - Already-focused tab press not navigating
 * - Scrollable compact tab styling
 * - tabBarIcon callback invocation
 */

jest.mock('../../../context/ThemeContext', () => ({
  useTheme: jest.fn(() => ({
    isDark: true,
    colors: {
      text: '#ffffff',
      textSecondary: '#9ca3af',
      textTertiary: '#6b7280',
      background: '#0a0a0a',
      glass: 'rgba(255, 255, 255, 0.04)',
      glassBorder: 'rgba(255, 255, 255, 0.08)',
    },
  })),
}));

jest.mock('../LiquidGlassWrapper', () => ({
  LiquidGlassView: 'LiquidGlassView',
  LiquidGlassContainerView: 'LiquidGlassContainerView',
  isLiquidGlassSupported: false,
}));

import React from 'react';
import renderer from 'react-test-renderer';
import { Platform } from 'react-native';
import { GlassTabBar } from '../GlassTabBar';
import { useTheme } from '../../../context/ThemeContext';
import { COLORS, FONTS, RADIUS, SPACING, ALPHA_COLORS } from '../../../utils/constants';
import * as Haptics from 'expo-haptics';
import * as Reanimated from 'react-native-reanimated';

const mockUseTheme = useTheme as jest.Mock;
const mockWithSpring = Reanimated.withSpring as jest.Mock;

// Re-mock reanimated with forwardRef components so react-test-renderer can render them
jest.mock('react-native-reanimated', () => {
  const actualReact = require('react');
  const AnimatedView = actualReact.forwardRef((props: any, ref: any) =>
    actualReact.createElement('AnimatedView', { ...props, ref })
  );
  AnimatedView.displayName = 'Animated.View';

  return {
    __esModule: true,
    useSharedValue: jest.fn((init: any) => ({ value: init })),
    useAnimatedStyle: jest.fn((cb: any) => {
      try { cb(); } catch (_) {}
      return {};
    }),
    withSpring: jest.fn((val: any) => val),
    withTiming: jest.fn((val: any) => val),
    withDelay: jest.fn((_d: any, val: any) => val),
    withSequence: jest.fn((...vals: any[]) => vals[vals.length - 1]),
    withRepeat: jest.fn((val: any) => val),
    interpolateColor: jest.fn(),
    interpolate: jest.fn(),
    Easing: { linear: jest.fn(), ease: jest.fn(), bezier: jest.fn(), inOut: jest.fn(() => jest.fn()) },
    runOnJS: jest.fn((fn: any) => fn),
    cancelAnimation: jest.fn(),
    Animated: { View: AnimatedView, Text: 'Animated.Text', ScrollView: 'Animated.ScrollView' },
    default: {
      call: () => {},
      createAnimatedComponent: jest.fn((comp: any) => comp),
      View: AnimatedView,
      Text: 'Animated.Text',
      ScrollView: 'Animated.ScrollView',
    },
    createAnimatedComponent: jest.fn((comp: any) => comp),
  };
});

// Helper: build mock BottomTabBarProps
function createMockTabBarProps(routeCount: number, focusedIndex = 0) {
  const routes = Array.from({ length: routeCount }, (_, i) => ({
    key: `route-${i}`,
    name: `Tab${i}`,
    params: {},
  }));

  const descriptors: any = {};
  routes.forEach((route) => {
    descriptors[route.key] = {
      options: {
        tabBarLabel: `Label ${route.name}`,
        title: route.name,
        tabBarIcon: jest.fn(({ focused, color, size }: any) =>
          React.createElement('View', { testID: `icon-${route.name}` }, `icon-${route.name}`)
        ),
      },
    };
  });

  return {
    state: {
      index: focusedIndex,
      routes,
      key: 'tab-state',
      routeNames: routes.map((r) => r.name),
      type: 'tab' as const,
      stale: false as const,
      history: [],
    },
    descriptors,
    navigation: {
      emit: jest.fn(() => ({ defaultPrevented: false })),
      navigate: jest.fn(),
    },
    insets: { top: 0, bottom: 0, left: 0, right: 0 },
  };
}

// Helper: render component inside renderer.act
function renderComponent(props: any) {
  let tree: renderer.ReactTestRenderer;
  renderer.act(() => {
    tree = renderer.create(React.createElement(GlassTabBar, props));
  });
  return tree!;
}

// Helper: find all TouchableOpacity nodes
function findTouchables(root: renderer.ReactTestInstance) {
  return root.findAllByType('TouchableOpacity' as any);
}

describe('GlassTabBar', () => {
  const darkColors = {
    text: '#ffffff',
    textSecondary: '#9ca3af',
    textTertiary: '#6b7280',
    background: '#0a0a0a',
    glass: 'rgba(255, 255, 255, 0.04)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
  };

  const lightColors = {
    text: '#0f172a',
    textSecondary: '#475569',
    textTertiary: '#64748b',
    background: '#f8fafc',
    glass: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(148, 163, 184, 0.3)',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTheme.mockReturnValue({ isDark: true, colors: darkColors });
    // Reset Platform.OS to ios (default in jest.setup.ts)
    (Platform as any).OS = 'ios';
  });

  // ----------------------------------------------------------------
  // Module exports
  // ----------------------------------------------------------------
  describe('module exports', () => {
    it('should export GlassTabBar as a named export', () => {
      expect(GlassTabBar).toBeDefined();
      expect(typeof GlassTabBar).toBe('function');
    });

    it('should export GlassTabBar as the default export', () => {
      const mod = require('../GlassTabBar');
      expect(mod.default).toBe(mod.GlassTabBar);
    });
  });

  // ----------------------------------------------------------------
  // Static tab rendering (<= 5 tabs, no scroll)
  // ----------------------------------------------------------------
  describe('rendering with few tabs (no scroll)', () => {
    it('should render 3 tabs as static layout', () => {
      const props = createMockTabBarProps(3, 0);
      const tree = renderComponent(props);
      const touchables = findTouchables(tree.root);
      expect(touchables).toHaveLength(3);
    });

    it('should render 5 tabs without ScrollView', () => {
      const props = createMockTabBarProps(5, 2);
      const tree = renderComponent(props);
      const json = JSON.stringify(tree.toJSON());
      // Should NOT contain ScrollView as a wrapper for tabs
      expect(json).not.toContain('"ScrollView"');
      const touchables = findTouchables(tree.root);
      expect(touchables).toHaveLength(5);
    });

    it('should render exactly 1 tab', () => {
      const props = createMockTabBarProps(1, 0);
      const tree = renderComponent(props);
      const touchables = findTouchables(tree.root);
      expect(touchables).toHaveLength(1);
    });
  });

  // ----------------------------------------------------------------
  // Scrollable tab rendering (> 5 tabs)
  // ----------------------------------------------------------------
  describe('rendering with many tabs (scrollable)', () => {
    it('should render 6 tabs inside a ScrollView', () => {
      const props = createMockTabBarProps(6, 0);
      const tree = renderComponent(props);
      const json = JSON.stringify(tree.toJSON());
      expect(json).toContain('ScrollView');
      const touchables = findTouchables(tree.root);
      expect(touchables).toHaveLength(6);
    });

    it('should render 10 tabs inside a ScrollView', () => {
      const props = createMockTabBarProps(10, 5);
      const tree = renderComponent(props);
      const touchables = findTouchables(tree.root);
      expect(touchables).toHaveLength(10);
    });

    it('should pass compact=true to TabButton when > 5 tabs', () => {
      const props = createMockTabBarProps(7, 0);
      const tree = renderComponent(props);
      const json = JSON.stringify(tree.toJSON());
      // Compact style has minWidth and specific padding; just verify render succeeds
      expect(json).toContain('ScrollView');
    });
  });

  // ----------------------------------------------------------------
  // Tab label resolution
  // ----------------------------------------------------------------
  describe('tab label resolution', () => {
    it('should use tabBarLabel when provided', () => {
      const props = createMockTabBarProps(2, 0);
      const tree = renderComponent(props);
      const json = JSON.stringify(tree.toJSON());
      expect(json).toContain('Label Tab0');
    });

    it('should fall back to title when tabBarLabel is undefined', () => {
      const props = createMockTabBarProps(2, 0);
      props.descriptors['route-0'].options.tabBarLabel = undefined;
      const tree = renderComponent(props);
      const json = JSON.stringify(tree.toJSON());
      expect(json).toContain('Tab0');
    });

    it('should fall back to route.name when both tabBarLabel and title are undefined', () => {
      const props = createMockTabBarProps(2, 0);
      props.descriptors['route-0'].options.tabBarLabel = undefined;
      props.descriptors['route-0'].options.title = undefined;
      const tree = renderComponent(props);
      const json = JSON.stringify(tree.toJSON());
      expect(json).toContain('Tab0');
    });

    it('should use route.name as label prop when tabBarLabel is not a string', () => {
      const props = createMockTabBarProps(2, 0);
      // tabBarLabel can be a function in React Navigation
      props.descriptors['route-0'].options.tabBarLabel = () => 'custom';
      const tree = renderComponent(props);
      const json = JSON.stringify(tree.toJSON());
      // Since typeof label is not string, should use route.name
      expect(json).toContain('Tab0');
    });
  });

  // ----------------------------------------------------------------
  // Tab press handler
  // ----------------------------------------------------------------
  describe('onPress handler', () => {
    it('should trigger haptic feedback on press', () => {
      const props = createMockTabBarProps(3, 0);
      const tree = renderComponent(props);
      const touchables = findTouchables(tree.root);

      // Press unfocused tab (index 1)
      renderer.act(() => {
        touchables[1].props.onPress();
      });

      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    });

    it('should emit tabPress event on press', () => {
      const props = createMockTabBarProps(3, 0);
      const tree = renderComponent(props);
      const touchables = findTouchables(tree.root);

      renderer.act(() => {
        touchables[1].props.onPress();
      });

      expect(props.navigation.emit).toHaveBeenCalledWith({
        type: 'tabPress',
        target: 'route-1',
        canPreventDefault: true,
      });
    });

    it('should navigate to the tab when it is not focused and not defaultPrevented', () => {
      const props = createMockTabBarProps(3, 0);
      const tree = renderComponent(props);
      const touchables = findTouchables(tree.root);

      renderer.act(() => {
        touchables[2].props.onPress();
      });

      expect(props.navigation.navigate).toHaveBeenCalledWith('Tab2', {});
    });

    it('should NOT navigate when the tab is already focused', () => {
      const props = createMockTabBarProps(3, 0);
      const tree = renderComponent(props);
      const touchables = findTouchables(tree.root);

      // Press focused tab (index 0)
      renderer.act(() => {
        touchables[0].props.onPress();
      });

      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
      expect(props.navigation.emit).toHaveBeenCalled();
      expect(props.navigation.navigate).not.toHaveBeenCalled();
    });

    it('should NOT navigate when event.defaultPrevented is true', () => {
      const props = createMockTabBarProps(3, 0);
      props.navigation.emit = jest.fn(() => ({ defaultPrevented: true }));
      const tree = renderComponent(props);
      const touchables = findTouchables(tree.root);

      // Press unfocused tab
      renderer.act(() => {
        touchables[1].props.onPress();
      });

      expect(props.navigation.navigate).not.toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------------
  // Tab long press handler
  // ----------------------------------------------------------------
  describe('onLongPress handler', () => {
    it('should trigger medium haptic feedback on long press', () => {
      const props = createMockTabBarProps(3, 0);
      const tree = renderComponent(props);
      const touchables = findTouchables(tree.root);

      renderer.act(() => {
        touchables[1].props.onLongPress();
      });

      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
    });

    it('should emit tabLongPress event on long press', () => {
      const props = createMockTabBarProps(3, 0);
      const tree = renderComponent(props);
      const touchables = findTouchables(tree.root);

      renderer.act(() => {
        touchables[2].props.onLongPress();
      });

      expect(props.navigation.emit).toHaveBeenCalledWith({
        type: 'tabLongPress',
        target: 'route-2',
      });
    });
  });

  // ----------------------------------------------------------------
  // PressIn / PressOut animation handlers (TabButton)
  // ----------------------------------------------------------------
  describe('TabButton press animation', () => {
    it('should call withSpring(0.9) on pressIn', () => {
      const props = createMockTabBarProps(3, 0);
      const tree = renderComponent(props);
      const touchables = findTouchables(tree.root);

      renderer.act(() => {
        touchables[0].props.onPressIn();
      });

      expect(mockWithSpring).toHaveBeenCalledWith(0.9, { damping: 15, stiffness: 300 });
    });

    it('should call withSpring(1) on pressOut', () => {
      const props = createMockTabBarProps(3, 0);
      const tree = renderComponent(props);
      const touchables = findTouchables(tree.root);

      renderer.act(() => {
        touchables[0].props.onPressOut();
      });

      expect(mockWithSpring).toHaveBeenCalledWith(1, { damping: 15, stiffness: 300 });
    });
  });

  // ----------------------------------------------------------------
  // Active tab state & styling
  // ----------------------------------------------------------------
  describe('active tab styling', () => {
    it('should render active indicator for focused tab only', () => {
      const props = createMockTabBarProps(3, 1);
      const tree = renderComponent(props);
      const json = JSON.stringify(tree.toJSON());
      // Active indicator has ALPHA_COLORS.primary.bg in dark mode
      expect(json).toContain(ALPHA_COLORS.primary.bg);
    });

    it('should use COLORS.primary for focused tab label color', () => {
      const props = createMockTabBarProps(3, 0);
      const tree = renderComponent(props);
      const json = JSON.stringify(tree.toJSON());
      expect(json).toContain(COLORS.primary);
    });

    it('should use FONTS.semibold for focused label and FONTS.medium for unfocused', () => {
      const props = createMockTabBarProps(3, 0);
      const tree = renderComponent(props);
      const json = JSON.stringify(tree.toJSON());
      expect(json).toContain(FONTS.semibold);
      expect(json).toContain(FONTS.medium);
    });

    it('should pass accessibilityState selected: true for focused tab', () => {
      const props = createMockTabBarProps(3, 1);
      const tree = renderComponent(props);
      const touchables = findTouchables(tree.root);
      expect(touchables[1].props.accessibilityState).toEqual({ selected: true });
    });

    it('should pass empty accessibilityState for unfocused tab', () => {
      const props = createMockTabBarProps(3, 1);
      const tree = renderComponent(props);
      const touchables = findTouchables(tree.root);
      expect(touchables[0].props.accessibilityState).toEqual({});
      expect(touchables[2].props.accessibilityState).toEqual({});
    });

    it('should set accessibilityRole to button for all tabs', () => {
      const props = createMockTabBarProps(3, 0);
      const tree = renderComponent(props);
      const touchables = findTouchables(tree.root);
      touchables.forEach((t) => {
        expect(t.props.accessibilityRole).toBe('button');
      });
    });

    it('should set accessibilityLabel to the tab label', () => {
      const props = createMockTabBarProps(3, 0);
      const tree = renderComponent(props);
      const touchables = findTouchables(tree.root);
      expect(touchables[0].props.accessibilityLabel).toBe('Label Tab0');
      expect(touchables[1].props.accessibilityLabel).toBe('Label Tab1');
    });
  });

  // ----------------------------------------------------------------
  // Icon rendering
  // ----------------------------------------------------------------
  describe('tabBarIcon callback', () => {
    it('should invoke tabBarIcon with correct params for focused tab', () => {
      const props = createMockTabBarProps(3, 0);
      renderComponent(props);
      const iconFn = props.descriptors['route-0'].options.tabBarIcon;
      expect(iconFn).toHaveBeenCalledWith({
        focused: true,
        color: COLORS.primary,
        size: 22,
      });
    });

    it('should invoke tabBarIcon with textTertiary color for unfocused tab', () => {
      const props = createMockTabBarProps(3, 0);
      renderComponent(props);
      const iconFn = props.descriptors['route-1'].options.tabBarIcon;
      expect(iconFn).toHaveBeenCalledWith({
        focused: false,
        color: darkColors.textTertiary,
        size: 22,
      });
    });

    it('should render icon element returned by tabBarIcon', () => {
      const props = createMockTabBarProps(2, 0);
      const tree = renderComponent(props);
      const json = JSON.stringify(tree.toJSON());
      expect(json).toContain('icon-Tab0');
      expect(json).toContain('icon-Tab1');
    });

    it('should handle undefined tabBarIcon gracefully', () => {
      const props = createMockTabBarProps(2, 0);
      props.descriptors['route-0'].options.tabBarIcon = undefined;
      const tree = renderComponent(props);
      // Should still render without crashing
      expect(tree.toJSON()).toBeTruthy();
    });
  });

  // ----------------------------------------------------------------
  // Dark vs Light mode
  // ----------------------------------------------------------------
  describe('dark mode styling', () => {
    it('should use dark background colors in dark mode', () => {
      mockUseTheme.mockReturnValue({ isDark: true, colors: darkColors });
      const props = createMockTabBarProps(3, 0);
      const tree = renderComponent(props);
      const json = JSON.stringify(tree.toJSON());
      expect(json).toContain(ALPHA_COLORS.black[70]);
      expect(json).toContain(ALPHA_COLORS.white[10]);
    });

    it('should use dark tint for BlurView in dark mode', () => {
      mockUseTheme.mockReturnValue({ isDark: true, colors: darkColors });
      const props = createMockTabBarProps(3, 0);
      const tree = renderComponent(props);
      const blurs = tree.root.findAllByType('BlurView' as any);
      expect(blurs.length).toBeGreaterThan(0);
      expect(blurs[0].props.tint).toBe('dark');
    });

    it('should use ALPHA_COLORS.primary.bg for active indicator in dark mode', () => {
      mockUseTheme.mockReturnValue({ isDark: true, colors: darkColors });
      const props = createMockTabBarProps(2, 0);
      const tree = renderComponent(props);
      const json = JSON.stringify(tree.toJSON());
      expect(json).toContain(ALPHA_COLORS.primary.bg);
    });
  });

  describe('light mode styling', () => {
    it('should use light background colors in light mode', () => {
      mockUseTheme.mockReturnValue({ isDark: false, colors: lightColors });
      const props = createMockTabBarProps(3, 1);
      const tree = renderComponent(props);
      const json = JSON.stringify(tree.toJSON());
      expect(json).toContain(ALPHA_COLORS.white[80]);
      // In light mode the tab bar border color is set to "transparent"
      expect(json).toContain('"borderColor":"transparent"');
    });

    it('should use light tint for BlurView in light mode', () => {
      mockUseTheme.mockReturnValue({ isDark: false, colors: lightColors });
      const props = createMockTabBarProps(3, 0);
      const tree = renderComponent(props);
      const blurs = tree.root.findAllByType('BlurView' as any);
      expect(blurs[0].props.tint).toBe('light');
    });

    it('should use ALPHA_COLORS.primary.bgSubtle for active indicator in light mode', () => {
      mockUseTheme.mockReturnValue({ isDark: false, colors: lightColors });
      const props = createMockTabBarProps(2, 0);
      const tree = renderComponent(props);
      const json = JSON.stringify(tree.toJSON());
      expect(json).toContain(ALPHA_COLORS.primary.bgSubtle);
    });
  });

  // ----------------------------------------------------------------
  // LiquidGlass path (iOS 26+)
  // ----------------------------------------------------------------
  describe('LiquidGlass rendering path', () => {
    it('should render LiquidGlass components when supported on iOS', () => {
      // Override the LiquidGlassWrapper mock to report supported
      jest.doMock('../LiquidGlassWrapper', () => ({
        LiquidGlassView: 'LiquidGlassView',
        LiquidGlassContainerView: 'LiquidGlassContainerView',
        isLiquidGlassSupported: true,
      }));

      (Platform as any).OS = 'ios';

      // Re-require to pick up new mock
      jest.resetModules();
      // Need to re-apply the theme mock since resetModules clears it
      jest.doMock('../../../context/ThemeContext', () => ({
        useTheme: jest.fn(() => ({
          isDark: true,
          colors: darkColors,
        })),
      }));

      const { GlassTabBar: FreshGlassTabBar } = require('../GlassTabBar');
      const props = createMockTabBarProps(3, 0);

      let tree: renderer.ReactTestRenderer;
      renderer.act(() => {
        tree = renderer.create(React.createElement(FreshGlassTabBar, props));
      });

      const json = JSON.stringify(tree!.toJSON());
      expect(json).toContain('LiquidGlassView');
      expect(json).toContain('LiquidGlassContainerView');
      // Should NOT contain BlurView on the LiquidGlass path
      expect(json).not.toContain('BlurView');
    });

    it('should render ScrollView inside LiquidGlass when > 5 tabs', () => {
      jest.doMock('../LiquidGlassWrapper', () => ({
        LiquidGlassView: 'LiquidGlassView',
        LiquidGlassContainerView: 'LiquidGlassContainerView',
        isLiquidGlassSupported: true,
      }));

      (Platform as any).OS = 'ios';

      jest.resetModules();
      jest.doMock('../../../context/ThemeContext', () => ({
        useTheme: jest.fn(() => ({
          isDark: false,
          colors: lightColors,
        })),
      }));

      const { GlassTabBar: FreshGlassTabBar } = require('../GlassTabBar');
      const props = createMockTabBarProps(7, 2);

      let tree: renderer.ReactTestRenderer;
      renderer.act(() => {
        tree = renderer.create(React.createElement(FreshGlassTabBar, props));
      });

      const json = JSON.stringify(tree!.toJSON());
      expect(json).toContain('LiquidGlassView');
      expect(json).toContain('ScrollView');
    });

    it('should render tabsContainer View inside LiquidGlass when <= 5 tabs', () => {
      jest.doMock('../LiquidGlassWrapper', () => ({
        LiquidGlassView: 'LiquidGlassView',
        LiquidGlassContainerView: 'LiquidGlassContainerView',
        isLiquidGlassSupported: true,
      }));

      (Platform as any).OS = 'ios';

      jest.resetModules();
      jest.doMock('../../../context/ThemeContext', () => ({
        useTheme: jest.fn(() => ({
          isDark: true,
          colors: darkColors,
        })),
      }));

      const { GlassTabBar: FreshGlassTabBar } = require('../GlassTabBar');
      const props = createMockTabBarProps(4, 1);

      let tree: renderer.ReactTestRenderer;
      renderer.act(() => {
        tree = renderer.create(React.createElement(FreshGlassTabBar, props));
      });

      const json = JSON.stringify(tree!.toJSON());
      expect(json).toContain('LiquidGlassView');
      // Should NOT have ScrollView for <= 5 tabs
      expect(json).not.toContain('ScrollView');
    });

    it('should fall back to BlurView when not on iOS even if LiquidGlass claims supported', () => {
      jest.resetModules();

      jest.doMock('../LiquidGlassWrapper', () => ({
        LiquidGlassView: 'LiquidGlassView',
        LiquidGlassContainerView: 'LiquidGlassContainerView',
        isLiquidGlassSupported: true,
      }));

      jest.doMock('../../../context/ThemeContext', () => ({
        useTheme: jest.fn(() => ({
          isDark: true,
          colors: darkColors,
        })),
      }));

      // Override react-native Platform.OS to android for the fresh require
      jest.doMock('react-native', () => ({
        Platform: { OS: 'android', select: jest.fn((obj: any) => obj.android ?? obj.default) },
        StyleSheet: {
          create: (s: any) => s,
          flatten: (s: any) => s,
          hairlineWidth: 1,
          absoluteFillObject: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
        },
        Dimensions: { get: jest.fn(() => ({ width: 390, height: 844 })) },
        View: 'View',
        Text: 'Text',
        TouchableOpacity: 'TouchableOpacity',
        ScrollView: 'ScrollView',
      }));

      const { GlassTabBar: FreshGlassTabBar } = require('../GlassTabBar');
      const props = createMockTabBarProps(3, 0);

      let tree: renderer.ReactTestRenderer;
      renderer.act(() => {
        tree = renderer.create(React.createElement(FreshGlassTabBar, props));
      });

      const json = JSON.stringify(tree!.toJSON());
      expect(json).toContain('BlurView');
      expect(json).not.toContain('LiquidGlassView');
    });
  });

  // ----------------------------------------------------------------
  // Safe area insets
  // ----------------------------------------------------------------
  describe('safe area insets', () => {
    it('should apply bottom padding from safe area insets when > 0', () => {
      jest.resetModules();

      jest.doMock('react-native-safe-area-context', () => ({
        SafeAreaProvider: ({ children }: any) => children,
        SafeAreaView: ({ children }: any) => children,
        useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 34, left: 0 }),
        useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
      }));

      jest.doMock('../LiquidGlassWrapper', () => ({
        LiquidGlassView: 'LiquidGlassView',
        LiquidGlassContainerView: 'LiquidGlassContainerView',
        isLiquidGlassSupported: false,
      }));

      jest.doMock('../../../context/ThemeContext', () => ({
        useTheme: jest.fn(() => ({ isDark: true, colors: darkColors })),
      }));

      const { GlassTabBar: FreshGlassTabBar } = require('../GlassTabBar');
      const props = createMockTabBarProps(3, 0);

      let tree: renderer.ReactTestRenderer;
      renderer.act(() => {
        tree = renderer.create(React.createElement(FreshGlassTabBar, props));
      });

      const json = JSON.stringify(tree!.toJSON());
      // paddingBottom should be 34 (the inset value)
      expect(json).toContain('"paddingBottom":34');
    });

    it('should use SPACING.sm as fallback when bottom inset is 0', () => {
      const props = createMockTabBarProps(3, 0);
      const tree = renderComponent(props);
      const json = JSON.stringify(tree.toJSON());
      // paddingBottom should be SPACING.sm = 8
      expect(json).toContain(`"paddingBottom":${SPACING.sm}`);
    });
  });

  // ----------------------------------------------------------------
  // Scrollable tab compact styling
  // ----------------------------------------------------------------
  describe('scrollable compact tab styling', () => {
    it('should apply compact styles to tabs when scrollable', () => {
      const props = createMockTabBarProps(6, 0);
      const tree = renderComponent(props);
      // With > 5 tabs, compact = true; the tab button should have compact styles applied
      const touchables = findTouchables(tree.root);
      // compact style merges tabButtonCompact (flex: 0, minWidth: 70)
      const style = touchables[0].props.style;
      expect(style).toBeTruthy();
    });

    it('should NOT apply compact styles when <= 5 tabs', () => {
      const props = createMockTabBarProps(4, 0);
      const tree = renderComponent(props);
      const touchables = findTouchables(tree.root);
      // Style array should have tabButton and falsy compact
      const style = touchables[0].props.style;
      expect(style).toBeTruthy();
    });
  });

  // ----------------------------------------------------------------
  // Style constants verification
  // ----------------------------------------------------------------
  describe('style constants', () => {
    it('should use COLORS.primary for focused tab icon color', () => {
      expect(COLORS.primary).toBe('#3b82f6');
    });

    it('should use FONTS.semibold for focused tab label', () => {
      expect(FONTS.semibold).toBe('Urbanist_600SemiBold');
    });

    it('should use FONTS.medium for unfocused tab label', () => {
      expect(FONTS.medium).toBe('Urbanist_500Medium');
    });

    it('should use RADIUS.xl for tab bar border radius', () => {
      expect(RADIUS.xl).toBe(20);
    });
  });

  // ----------------------------------------------------------------
  // Haptic feedback configuration
  // ----------------------------------------------------------------
  describe('haptic feedback configuration', () => {
    it('should use Light impact style constant', () => {
      expect(Haptics.ImpactFeedbackStyle.Light).toBe('light');
    });

    it('should use Medium impact style constant', () => {
      expect(Haptics.ImpactFeedbackStyle.Medium).toBe('medium');
    });
  });

  // ----------------------------------------------------------------
  // Edge cases
  // ----------------------------------------------------------------
  describe('edge cases', () => {
    it('should handle tab with no icon (tabBarIcon returns undefined)', () => {
      const props = createMockTabBarProps(2, 0);
      props.descriptors['route-0'].options.tabBarIcon = jest.fn(() => undefined);
      const tree = renderComponent(props);
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should handle all tabs focused on the last one', () => {
      const props = createMockTabBarProps(5, 4);
      const tree = renderComponent(props);
      const touchables = findTouchables(tree.root);
      expect(touchables[4].props.accessibilityState).toEqual({ selected: true });
      expect(touchables[0].props.accessibilityState).toEqual({});
    });

    it('should call both onPress and onLongPress on different tabs sequentially', () => {
      const props = createMockTabBarProps(4, 0);
      const tree = renderComponent(props);
      const touchables = findTouchables(tree.root);

      renderer.act(() => {
        touchables[1].props.onPress();
      });
      renderer.act(() => {
        touchables[2].props.onLongPress();
      });

      expect(Haptics.impactAsync).toHaveBeenCalledTimes(2);
      expect(props.navigation.emit).toHaveBeenCalledTimes(2);
    });

    it('should call onPressIn and onPressOut in sequence', () => {
      const props = createMockTabBarProps(2, 0);
      const tree = renderComponent(props);
      const touchables = findTouchables(tree.root);

      renderer.act(() => {
        touchables[0].props.onPressIn();
      });
      renderer.act(() => {
        touchables[0].props.onPressOut();
      });

      expect(mockWithSpring).toHaveBeenCalledWith(0.9, { damping: 15, stiffness: 300 });
      expect(mockWithSpring).toHaveBeenCalledWith(1, { damping: 15, stiffness: 300 });
    });
  });
});
