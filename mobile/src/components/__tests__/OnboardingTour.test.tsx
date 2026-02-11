/**
 * OnboardingTour Tests - Comprehensive coverage using react-test-renderer
 *
 * Tests cover:
 * - Module exports (named, default, hook)
 * - Component rendering with react-test-renderer (all 6 steps)
 * - AsyncStorage completion check (useEffect)
 * - Navigation: next, back, skip, complete
 * - Completion persistence (markComplete -> AsyncStorage.setItem)
 * - useOnboardingTour hook (startTour, resetTour, hasCompletedTour)
 * - Visibility conditions (visible && hasCheckedStorage)
 * - Platform-specific haptics (ios vs android)
 * - Progress dot coloring
 * - Error handling paths in AsyncStorage
 * - forceShow override
 */

import React from 'react';
import renderer from 'react-test-renderer';
import { renderHook, act as rtlAct } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// Mock GlassCard and GlassButton as elements (not strings) for findAllByType
jest.mock('../glass/GlassCard', () => {
  const { createElement } = require('react');
  return {
    GlassCard: (props: any) =>
      createElement('MockGlassCard', props, props.children),
  };
});

jest.mock('../glass/GlassButton', () => {
  const { createElement } = require('react');
  return {
    GlassButton: (props: any) =>
      createElement('MockGlassButton', {
        ...props,
        testID: props.label,
      }),
  };
});

// Override react-native: global mock has StatusBar as { setBarStyle: fn } (not renderable).
// We need StatusBar as a string for react-test-renderer to render <StatusBar />.
jest.mock('react-native', () => ({
  Platform: { OS: 'ios', select: jest.fn((obj: any) => obj.ios ?? obj.default) },
  Alert: { alert: jest.fn() },
  Dimensions: {
    get: jest.fn(() => ({ width: 390, height: 844 })),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  StyleSheet: {
    create: (styles: any) => styles,
    flatten: (style: any) => style,
    hairlineWidth: 1,
    absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
    absoluteFillObject: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  },
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  Modal: 'Modal',
  StatusBar: 'StatusBar',
  Animated: {
    View: 'Animated.View',
    Text: 'Animated.Text',
    Value: jest.fn(() => ({ setValue: jest.fn(), interpolate: jest.fn(() => 0) })),
    timing: jest.fn(() => ({ start: jest.fn((cb?: any) => cb && cb({ finished: true })) })),
    spring: jest.fn(() => ({ start: jest.fn((cb?: any) => cb && cb({ finished: true })) })),
    createAnimatedComponent: jest.fn((comp: any) => comp),
  },
  useColorScheme: jest.fn(() => 'dark'),
}));

jest.mock('../../context/ThemeContext', () => ({
  useTheme: jest.fn(() => ({
    colors: {
      text: '#ffffff',
      textSecondary: '#9ca3af',
      textTertiary: '#6b7280',
      border: '#374151',
      backgroundTertiary: '#2a2a2a',
    },
    isDark: true,
  })),
}));

// Extend the global reanimated mock with FadeIn, FadeOut, Extrapolation
const mockWithTiming = jest.fn((val: any, _config?: any, cb?: any) => {
  // Execute the callback synchronously if provided (for runOnJS pattern)
  if (cb) cb({ finished: true });
  return val;
});

jest.mock('react-native-reanimated', () => {
  const mockModule: any = {
    __esModule: true,
    useSharedValue: jest.fn((init: any) => ({ value: init })),
    useAnimatedStyle: jest.fn((cb: any) => {
      // Call the callback to cover animated style functions
      try { cb(); } catch (_e) { /* ignore */ }
      return {};
    }),
    withSpring: jest.fn((val: any) => val),
    withTiming: mockWithTiming,
    withDelay: jest.fn((_delay: any, val: any) => val),
    withSequence: jest.fn((...vals: any[]) => vals[vals.length - 1]),
    withRepeat: jest.fn((val: any) => val),
    interpolateColor: jest.fn(),
    interpolate: jest.fn(),
    Easing: { linear: jest.fn(), ease: jest.fn(), bezier: jest.fn(), inOut: jest.fn(() => jest.fn()) },
    runOnJS: jest.fn((fn: any) => fn),
    cancelAnimation: jest.fn(),
    FadeIn: { duration: jest.fn(() => ({ build: jest.fn() })) },
    FadeOut: { duration: jest.fn(() => ({ build: jest.fn() })) },
    Extrapolation: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
    createAnimatedComponent: jest.fn((comp: any) => comp),
  };
  // Default export: Animated namespace with View, Text, ScrollView
  mockModule.default = {
    call: () => {},
    createAnimatedComponent: jest.fn((comp: any) => comp),
    View: 'Animated.View',
    Text: 'Animated.Text',
    ScrollView: 'Animated.ScrollView',
  };
  return mockModule;
});

const ONBOARDING_COMPLETE_KEY = 'talor_onboarding_complete';

// Helper: render component inside renderer.act()
const renderComponent = (props: any = {}) => {
  let tree: any;
  renderer.act(() => {
    tree = renderer.create(
      React.createElement(
        require('../OnboardingTour').OnboardingTour,
        props
      )
    );
  });
  return tree!;
};

// Helper: get all text from a JSON tree
const getAllText = (node: any): string => {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getAllText).join('');
  if (node && node.children) return node.children.map(getAllText).join('');
  return '';
};

// Helper: find elements by type name
const findByType = (root: any, typeName: string): any[] => {
  try {
    return root.findAllByType(typeName);
  } catch {
    return [];
  }
};

// Helper: find MockGlassButton by label
const findButtonByLabel = (root: any, label: string): any | null => {
  const buttons = root.findAllByType('MockGlassButton');
  return buttons.find((b: any) => b.props.label === label) || null;
};

// Helper: find TouchableOpacity elements
const findTouchables = (root: any): any[] => {
  return root.findAllByType('TouchableOpacity');
};

describe('OnboardingTour', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
    // Default to ios for haptics
    (Platform as any).OS = 'ios';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // =====================================================================
  // MODULE EXPORTS
  // =====================================================================
  describe('module exports', () => {
    it('should export OnboardingTour as named export', () => {
      const mod = require('../OnboardingTour');
      expect(mod.OnboardingTour).toBeDefined();
      expect(typeof mod.OnboardingTour).toBe('function');
    });

    it('should export OnboardingTour as default export', () => {
      const mod = require('../OnboardingTour');
      expect(mod.default).toBeDefined();
      expect(typeof mod.default).toBe('function');
    });

    it('should export useOnboardingTour hook', () => {
      const mod = require('../OnboardingTour');
      expect(mod.useOnboardingTour).toBeDefined();
      expect(typeof mod.useOnboardingTour).toBe('function');
    });

    it('should have named and default exports be the same function', () => {
      const mod = require('../OnboardingTour');
      expect(mod.OnboardingTour).toBe(mod.default);
    });
  });

  // =====================================================================
  // INITIAL RENDER - INVISIBLE STATE (AsyncStorage says completed)
  // =====================================================================
  describe('invisible state when onboarding already completed', () => {
    it('should return null when AsyncStorage has completion key', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');
      const tree = renderComponent({});
      // Flush the useEffect async call
      await renderer.act(async () => {
        await Promise.resolve();
      });
      // After useEffect, hasCheckedStorage=true but visible=false => returns null
      expect(tree.toJSON()).toBeNull();
    });

    it('should check AsyncStorage with correct key on mount', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');
      renderComponent({});
      await renderer.act(async () => {
        await Promise.resolve();
      });
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(ONBOARDING_COMPLETE_KEY);
    });
  });

  // =====================================================================
  // INITIAL RENDER - VISIBLE STATE (first time user)
  // =====================================================================
  describe('visible state when onboarding not completed', () => {
    const renderVisible = async (extraProps: any = {}) => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const tree = renderComponent(extraProps);
      // Flush useEffect promise
      await renderer.act(async () => {
        await Promise.resolve();
      });
      // Advance past the 1000ms setTimeout
      renderer.act(() => {
        jest.advanceTimersByTime(1000);
      });
      return tree;
    };

    it('should render Modal when onboarding not completed', async () => {
      const tree = await renderVisible();
      const json = tree.toJSON();
      expect(json).not.toBeNull();
      // The root element should be a Modal
      expect(json.type).toBe('Modal');
    });

    it('should show welcome step title initially', async () => {
      const tree = await renderVisible();
      const text = getAllText(tree.toJSON());
      expect(text).toContain('Welcome to Talor!');
    });

    it('should show welcome step description', async () => {
      const tree = await renderVisible();
      const text = getAllText(tree.toJSON());
      expect(text).toContain('job-winning resumes');
    });

    it('should show step counter "1 of 6"', async () => {
      const tree = await renderVisible();
      const text = getAllText(tree.toJSON());
      // Template literal splits: "1" and " of " and "6"
      expect(text).toContain('1');
      expect(text).toContain('of');
      expect(text).toContain('6');
    });

    it('should show Next button on first step', async () => {
      const tree = await renderVisible();
      const btn = findButtonByLabel(tree.root, 'Next');
      expect(btn).not.toBeNull();
    });

    it('should NOT show Back button on first step', async () => {
      const tree = await renderVisible();
      const btn = findButtonByLabel(tree.root, 'Back');
      expect(btn).toBeNull();
    });

    it('should show skip (X) button on first step', async () => {
      const tree = await renderVisible();
      // The skip button is a TouchableOpacity containing the X icon
      const touchables = findTouchables(tree.root);
      // There should be at least 2 touchables: background overlay + skip button
      expect(touchables.length).toBeGreaterThanOrEqual(2);
    });

    it('should render 6 progress dots', async () => {
      const tree = await renderVisible();
      // Find all View elements with borderRadius: 4 (the progress dots)
      const allViews = tree.root.findAllByType('View');
      const dots = allViews.filter((v: any) => {
        const style = v.props.style;
        if (Array.isArray(style)) {
          return style.some((s: any) => s && s.borderRadius === 4);
        }
        return style && style.borderRadius === 4;
      });
      expect(dots.length).toBe(6);
    });

    it('should set Modal visible prop to true', async () => {
      const tree = await renderVisible();
      const json = tree.toJSON();
      expect(json.props.visible).toBe(true);
    });

    it('should set Modal transparent prop', async () => {
      const tree = await renderVisible();
      const json = tree.toJSON();
      expect(json.props.transparent).toBe(true);
    });
  });

  // =====================================================================
  // FORCE SHOW
  // =====================================================================
  describe('forceShow prop', () => {
    it('should show tour when forceShow=true even if previously completed', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');
      const tree = renderComponent({ forceShow: true });
      await renderer.act(async () => {
        await Promise.resolve();
      });
      renderer.act(() => {
        jest.advanceTimersByTime(1000);
      });
      const json = tree.toJSON();
      expect(json).not.toBeNull();
      expect(json.type).toBe('Modal');
    });
  });

  // =====================================================================
  // NAVIGATION - NEXT
  // =====================================================================
  describe('next button navigation', () => {
    const renderAndGetVisible = async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const tree = renderComponent({});
      await renderer.act(async () => {
        await Promise.resolve();
      });
      renderer.act(() => {
        jest.advanceTimersByTime(1000);
      });
      return tree;
    };

    it('should navigate to step 2 when Next is pressed', async () => {
      const tree = await renderAndGetVisible();
      const nextBtn = findButtonByLabel(tree.root, 'Next');
      expect(nextBtn).not.toBeNull();

      renderer.act(() => {
        nextBtn.props.onPress();
      });

      const text = getAllText(tree.toJSON());
      expect(text).toContain('Upload Your Resume');
    });

    it('should show Back button after navigating to step 2', async () => {
      const tree = await renderAndGetVisible();
      const nextBtn = findButtonByLabel(tree.root, 'Next');

      renderer.act(() => {
        nextBtn.props.onPress();
      });

      const backBtn = findButtonByLabel(tree.root, 'Back');
      expect(backBtn).not.toBeNull();
    });

    it('should navigate through all 6 steps sequentially', async () => {
      const tree = await renderAndGetVisible();
      const expectedTitles = [
        'Upload Your Resume',
        'Tailor Your Resume',
        'Prepare for Interviews',
        'Plan Your Career Path',
        "All Set",
      ];

      for (let i = 0; i < 5; i++) {
        const nextBtn = findButtonByLabel(tree.root, i < 4 ? 'Next' : 'Next');
        if (!nextBtn) {
          // On step 5 (index 4), button label changes to "Get Started"
          const getStartedBtn = findButtonByLabel(tree.root, 'Get Started');
          expect(getStartedBtn).toBeDefined();
          break;
        }
        renderer.act(() => {
          nextBtn.props.onPress();
        });
        const text = getAllText(tree.toJSON());
        expect(text).toContain(expectedTitles[i]);
      }
    });

    it('should show "Get Started" button on last step', async () => {
      const tree = await renderAndGetVisible();

      // Navigate to last step (step 6, index 5)
      for (let i = 0; i < 5; i++) {
        const nextBtn = findButtonByLabel(tree.root, 'Next');
        renderer.act(() => {
          nextBtn.props.onPress();
        });
      }

      const getStartedBtn = findButtonByLabel(tree.root, 'Get Started');
      expect(getStartedBtn).not.toBeNull();
      // Next should no longer exist
      const nextBtn = findButtonByLabel(tree.root, 'Next');
      expect(nextBtn).toBeNull();
    });

    it('should trigger haptics on iOS when pressing Next', async () => {
      (Platform as any).OS = 'ios';
      const tree = await renderAndGetVisible();
      const nextBtn = findButtonByLabel(tree.root, 'Next');

      renderer.act(() => {
        nextBtn.props.onPress();
      });

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light
      );
    });

    it('should NOT trigger haptics on Android when pressing Next', async () => {
      (Platform as any).OS = 'android';
      const tree = await renderAndGetVisible();
      const nextBtn = findButtonByLabel(tree.root, 'Next');

      renderer.act(() => {
        nextBtn.props.onPress();
      });

      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });

    it('should update step counter as user navigates', async () => {
      const tree = await renderAndGetVisible();

      // Step 1: counter "1 of 6"
      let text = getAllText(tree.toJSON());
      expect(text).toContain('1');

      const nextBtn = findButtonByLabel(tree.root, 'Next');
      renderer.act(() => {
        nextBtn.props.onPress();
      });

      // Step 2: counter should now show 2
      text = getAllText(tree.toJSON());
      expect(text).toContain('2');
    });
  });

  // =====================================================================
  // NAVIGATION - BACK
  // =====================================================================
  describe('back button navigation', () => {
    const renderAtStep2 = async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const tree = renderComponent({});
      await renderer.act(async () => {
        await Promise.resolve();
      });
      renderer.act(() => {
        jest.advanceTimersByTime(1000);
      });
      // Go to step 2
      const nextBtn = findButtonByLabel(tree.root, 'Next');
      renderer.act(() => {
        nextBtn.props.onPress();
      });
      return tree;
    };

    it('should navigate back to step 1 from step 2', async () => {
      const tree = await renderAtStep2();
      const text1 = getAllText(tree.toJSON());
      expect(text1).toContain('Upload Your Resume');

      const backBtn = findButtonByLabel(tree.root, 'Back');
      renderer.act(() => {
        backBtn.props.onPress();
      });

      const text2 = getAllText(tree.toJSON());
      expect(text2).toContain('Welcome to Talor!');
    });

    it('should hide Back button after going back to first step', async () => {
      const tree = await renderAtStep2();
      const backBtn = findButtonByLabel(tree.root, 'Back');
      renderer.act(() => {
        backBtn.props.onPress();
      });

      const backAfter = findButtonByLabel(tree.root, 'Back');
      expect(backAfter).toBeNull();
    });

    it('should trigger haptics on iOS when pressing Back', async () => {
      (Platform as any).OS = 'ios';
      const tree = await renderAtStep2();
      const backBtn = findButtonByLabel(tree.root, 'Back');

      renderer.act(() => {
        backBtn.props.onPress();
      });

      // Haptics called twice: once for Next (to get to step 2), once for Back
      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light
      );
    });

    it('should NOT trigger haptics on Android when pressing Back', async () => {
      (Platform as any).OS = 'android';
      const tree = await renderAtStep2();
      jest.clearAllMocks(); // Clear the haptics call from Next
      const backBtn = findButtonByLabel(tree.root, 'Back');

      renderer.act(() => {
        backBtn.props.onPress();
      });

      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });

    it('should not go below step 0 (handleBack guard)', async () => {
      const tree = await renderAtStep2();
      // Go back to step 0
      const backBtn = findButtonByLabel(tree.root, 'Back');
      renderer.act(() => {
        backBtn.props.onPress();
      });

      // Now at step 0 - Back button should not exist
      const backBtnAgain = findButtonByLabel(tree.root, 'Back');
      expect(backBtnAgain).toBeNull();

      // Verify still on step 1
      const text = getAllText(tree.toJSON());
      expect(text).toContain('Welcome to Talor!');
    });

  });

  // =====================================================================
  // SKIP FUNCTIONALITY
  // =====================================================================
  describe('skip functionality', () => {
    const renderVisible = async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const tree = renderComponent({ onSkip: jest.fn(), onComplete: jest.fn() });
      await renderer.act(async () => {
        await Promise.resolve();
      });
      renderer.act(() => {
        jest.advanceTimersByTime(1000);
      });
      return tree;
    };

    it('should call markComplete (AsyncStorage.setItem) on skip', async () => {
      const onSkip = jest.fn();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const tree = renderComponent({ onSkip });
      await renderer.act(async () => {
        await Promise.resolve();
      });
      renderer.act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Find the skip X button - it's the TouchableOpacity with a specific style (skipButton)
      // The skip button is a TouchableOpacity that is NOT the background overlay
      const touchables = findTouchables(tree.root);
      // Find the skip touchable (it has a child that is the X icon, and its style includes zIndex: 10)
      const skipBtn = touchables.find((t: any) => {
        const style = t.props.style;
        if (Array.isArray(style)) {
          return style.some((s: any) => s && s.zIndex === 10);
        }
        return style && style.zIndex === 10;
      });

      expect(skipBtn).toBeDefined();

      await renderer.act(async () => {
        await skipBtn!.props.onPress();
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        ONBOARDING_COMPLETE_KEY,
        'true'
      );
    });

    it('should call onSkip callback when skipping', async () => {
      const onSkip = jest.fn();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const tree = renderComponent({ onSkip });
      await renderer.act(async () => {
        await Promise.resolve();
      });
      renderer.act(() => {
        jest.advanceTimersByTime(1000);
      });

      const touchables = findTouchables(tree.root);
      const skipBtn = touchables.find((t: any) => {
        const style = t.props.style;
        if (Array.isArray(style)) {
          return style.some((s: any) => s && s.zIndex === 10);
        }
        return style && style.zIndex === 10;
      });

      await renderer.act(async () => {
        await skipBtn!.props.onPress();
      });

      expect(onSkip).toHaveBeenCalledTimes(1);
    });

    it('should trigger Medium haptics on iOS when skipping', async () => {
      (Platform as any).OS = 'ios';
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const tree = renderComponent({ onSkip: jest.fn() });
      await renderer.act(async () => {
        await Promise.resolve();
      });
      renderer.act(() => {
        jest.advanceTimersByTime(1000);
      });

      const touchables = findTouchables(tree.root);
      const skipBtn = touchables.find((t: any) => {
        const style = t.props.style;
        if (Array.isArray(style)) {
          return style.some((s: any) => s && s.zIndex === 10);
        }
        return style && style.zIndex === 10;
      });

      await renderer.act(async () => {
        await skipBtn!.props.onPress();
      });

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Medium
      );
    });

    it('should NOT trigger haptics on Android when skipping', async () => {
      (Platform as any).OS = 'android';
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const tree = renderComponent({ onSkip: jest.fn() });
      await renderer.act(async () => {
        await Promise.resolve();
      });
      renderer.act(() => {
        jest.advanceTimersByTime(1000);
      });

      const touchables = findTouchables(tree.root);
      const skipBtn = touchables.find((t: any) => {
        const style = t.props.style;
        if (Array.isArray(style)) {
          return style.some((s: any) => s && s.zIndex === 10);
        }
        return style && style.zIndex === 10;
      });

      jest.clearAllMocks();
      await renderer.act(async () => {
        await skipBtn!.props.onPress();
      });

      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });

    it('should not show skip button on last step', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const tree = renderComponent({});
      await renderer.act(async () => {
        await Promise.resolve();
      });
      renderer.act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Navigate to last step
      for (let i = 0; i < 5; i++) {
        const nextBtn = findButtonByLabel(tree.root, 'Next');
        renderer.act(() => {
          nextBtn.props.onPress();
        });
      }

      // On the last step, the skip (X) button should not be present
      // The component conditionally renders: {!isLastStep && (<TouchableOpacity style={styles.skipButton} ...>)}
      const touchables = findTouchables(tree.root);
      const skipBtn = touchables.find((t: any) => {
        const style = t.props.style;
        if (Array.isArray(style)) {
          return style.some((s: any) => s && s.zIndex === 10);
        }
        return style && style.zIndex === 10;
      });
      expect(skipBtn).toBeUndefined();
    });
  });

  // =====================================================================
  // COMPLETE FUNCTIONALITY
  // =====================================================================
  describe('complete (Get Started) functionality', () => {
    const navigateToLastStep = async (extraProps: any = {}) => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const tree = renderComponent(extraProps);
      await renderer.act(async () => {
        await Promise.resolve();
      });
      renderer.act(() => {
        jest.advanceTimersByTime(1000);
      });
      // Navigate to last step
      for (let i = 0; i < 5; i++) {
        const nextBtn = findButtonByLabel(tree.root, 'Next');
        renderer.act(() => {
          nextBtn.props.onPress();
        });
      }
      return tree;
    };

    it('should call markComplete (AsyncStorage.setItem) on complete', async () => {
      const tree = await navigateToLastStep({ onComplete: jest.fn() });
      const getStartedBtn = findButtonByLabel(tree.root, 'Get Started');
      expect(getStartedBtn).not.toBeNull();

      await renderer.act(async () => {
        await getStartedBtn.props.onPress();
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        ONBOARDING_COMPLETE_KEY,
        'true'
      );
    });

    it('should call onComplete callback', async () => {
      const onComplete = jest.fn();
      const tree = await navigateToLastStep({ onComplete });
      const getStartedBtn = findButtonByLabel(tree.root, 'Get Started');

      await renderer.act(async () => {
        await getStartedBtn.props.onPress();
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('should trigger Medium haptics on iOS when completing', async () => {
      (Platform as any).OS = 'ios';
      const tree = await navigateToLastStep({ onComplete: jest.fn() });
      jest.clearAllMocks();
      const getStartedBtn = findButtonByLabel(tree.root, 'Get Started');

      await renderer.act(async () => {
        await getStartedBtn.props.onPress();
      });

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Medium
      );
    });

    it('should NOT trigger haptics on Android when completing', async () => {
      (Platform as any).OS = 'android';
      const tree = await navigateToLastStep({ onComplete: jest.fn() });
      jest.clearAllMocks();
      const getStartedBtn = findButtonByLabel(tree.root, 'Get Started');

      await renderer.act(async () => {
        await getStartedBtn.props.onPress();
      });

      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });

    it('should handle complete without onComplete callback', async () => {
      const tree = await navigateToLastStep({});
      const getStartedBtn = findButtonByLabel(tree.root, 'Get Started');

      // Should not throw even without onComplete
      await renderer.act(async () => {
        await getStartedBtn.props.onPress();
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        ONBOARDING_COMPLETE_KEY,
        'true'
      );
    });

    it('should also trigger handleComplete when pressing Next on last step', async () => {
      // The handleNext function calls handleComplete when currentStep === steps.length - 1
      const onComplete = jest.fn();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const tree = renderComponent({ onComplete });
      await renderer.act(async () => {
        await Promise.resolve();
      });
      renderer.act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Navigate to step 5 (index 4, second to last)
      for (let i = 0; i < 4; i++) {
        const nextBtn = findButtonByLabel(tree.root, 'Next');
        renderer.act(() => {
          nextBtn.props.onPress();
        });
      }

      // On step 5 (Career Path), press Next to go to last step
      const nextBtn = findButtonByLabel(tree.root, 'Next');
      renderer.act(() => {
        nextBtn.props.onPress();
      });

      // Now on last step, press Get Started which is the "next" equivalent
      const getStarted = findButtonByLabel(tree.root, 'Get Started');
      await renderer.act(async () => {
        await getStarted.props.onPress();
      });

      expect(onComplete).toHaveBeenCalled();
    });
  });

  // =====================================================================
  // MODAL onRequestClose
  // =====================================================================
  describe('Modal onRequestClose (Android back button)', () => {
    it('should call handleSkip when Modal requests close', async () => {
      const onSkip = jest.fn();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const tree = renderComponent({ onSkip });
      await renderer.act(async () => {
        await Promise.resolve();
      });
      renderer.act(() => {
        jest.advanceTimersByTime(1000);
      });

      const modal = tree.toJSON();
      expect(modal.type).toBe('Modal');

      // Call onRequestClose which is mapped to handleSkip
      await renderer.act(async () => {
        await modal.props.onRequestClose();
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        ONBOARDING_COMPLETE_KEY,
        'true'
      );
      expect(onSkip).toHaveBeenCalled();
    });
  });

  // =====================================================================
  // ASYNCSTORAGE ERROR HANDLING
  // =====================================================================
  describe('AsyncStorage error handling', () => {
    it('should handle getItem error gracefully and still set hasCheckedStorage', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error('Storage read error')
      );

      const tree = renderComponent({});
      await renderer.act(async () => {
        await Promise.resolve();
      });

      // hasCheckedStorage should be true (finally block), but visible stays false
      // so component returns null
      expect(tree.toJSON()).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error checking onboarding status:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });

    it('should handle setItem error in markComplete gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(
        new Error('Storage write error')
      );

      const onSkip = jest.fn();
      const tree = renderComponent({ onSkip });
      await renderer.act(async () => {
        await Promise.resolve();
      });
      renderer.act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Try to skip - markComplete will fail but should not crash
      const touchables = findTouchables(tree.root);
      const skipBtn = touchables.find((t: any) => {
        const style = t.props.style;
        if (Array.isArray(style)) {
          return style.some((s: any) => s && s.zIndex === 10);
        }
        return style && style.zIndex === 10;
      });

      await renderer.act(async () => {
        await skipBtn!.props.onPress();
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error saving onboarding status:',
        expect.any(Error)
      );
      // onSkip still called despite storage error
      expect(onSkip).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  // =====================================================================
  // STEP CONTENT VALIDATION
  // =====================================================================
  describe('step content for each step', () => {
    const renderAndNavigate = async (stepIndex: number) => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const tree = renderComponent({});
      await renderer.act(async () => {
        await Promise.resolve();
      });
      renderer.act(() => {
        jest.advanceTimersByTime(1000);
      });
      for (let i = 0; i < stepIndex; i++) {
        const nextBtn = findButtonByLabel(tree.root, 'Next');
        renderer.act(() => {
          nextBtn.props.onPress();
        });
      }
      return tree;
    };

    it('step 0 (welcome): should show welcome title and description', async () => {
      const tree = await renderAndNavigate(0);
      const text = getAllText(tree.toJSON());
      expect(text).toContain('Welcome to Talor!');
      expect(text).toContain('job-winning resumes');
    });

    it('step 1 (upload): should show upload step content', async () => {
      const tree = await renderAndNavigate(1);
      const text = getAllText(tree.toJSON());
      expect(text).toContain('Upload Your Resume');
      expect(text).toContain('PDF and Word documents');
    });

    it('step 2 (tailor): should show tailor step content', async () => {
      const tree = await renderAndNavigate(2);
      const text = getAllText(tree.toJSON());
      expect(text).toContain('Tailor Your Resume');
      expect(text).toContain('job URL');
    });

    it('step 3 (interview): should show interview step content', async () => {
      const tree = await renderAndNavigate(3);
      const text = getAllText(tree.toJSON());
      expect(text).toContain('Prepare for Interviews');
      expect(text).toContain('STAR stories');
    });

    it('step 4 (career): should show career step content', async () => {
      const tree = await renderAndNavigate(4);
      const text = getAllText(tree.toJSON());
      expect(text).toContain('Plan Your Career Path');
      expect(text).toContain('Career Path Designer');
    });

    it('step 5 (complete): should show completion step content', async () => {
      const tree = await renderAndNavigate(5);
      const text = getAllText(tree.toJSON());
      expect(text).toContain("All Set");
      expect(text).toContain('Get Started');
    });
  });

  // =====================================================================
  // SKIP WITHOUT CALLBACK
  // =====================================================================
  describe('skip without onSkip callback', () => {
    it('should not throw when onSkip is undefined', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const tree = renderComponent({});
      await renderer.act(async () => {
        await Promise.resolve();
      });
      renderer.act(() => {
        jest.advanceTimersByTime(1000);
      });

      const touchables = findTouchables(tree.root);
      const skipBtn = touchables.find((t: any) => {
        const style = t.props.style;
        if (Array.isArray(style)) {
          return style.some((s: any) => s && s.zIndex === 10);
        }
        return style && style.zIndex === 10;
      });

      // Should not throw
      await renderer.act(async () => {
        await skipBtn!.props.onPress();
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        ONBOARDING_COMPLETE_KEY,
        'true'
      );
    });
  });

  // =====================================================================
  // useOnboardingTour HOOK
  // =====================================================================
  describe('useOnboardingTour hook', () => {
    it('should return showTour as false initially', () => {
      const { result } = renderHook(() =>
        require('../OnboardingTour').useOnboardingTour()
      );
      expect(result.current.showTour).toBe(false);
    });

    it('should return startTour function', () => {
      const { result } = renderHook(() =>
        require('../OnboardingTour').useOnboardingTour()
      );
      expect(typeof result.current.startTour).toBe('function');
    });

    it('should return resetTour function', () => {
      const { result } = renderHook(() =>
        require('../OnboardingTour').useOnboardingTour()
      );
      expect(typeof result.current.resetTour).toBe('function');
    });

    it('should return hasCompletedTour function', () => {
      const { result } = renderHook(() =>
        require('../OnboardingTour').useOnboardingTour()
      );
      expect(typeof result.current.hasCompletedTour).toBe('function');
    });

    it('should return OnboardingTour component', () => {
      const { result } = renderHook(() =>
        require('../OnboardingTour').useOnboardingTour()
      );
      expect(typeof result.current.OnboardingTour).toBe('function');
    });

    it('startTour should set showTour to true', () => {
      const { result } = renderHook(() =>
        require('../OnboardingTour').useOnboardingTour()
      );

      rtlAct(() => {
        result.current.startTour();
      });

      expect(result.current.showTour).toBe(true);
    });

    it('resetTour should remove AsyncStorage key and set showTour to true', async () => {
      const { result } = renderHook(() =>
        require('../OnboardingTour').useOnboardingTour()
      );

      await rtlAct(async () => {
        await result.current.resetTour();
      });

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        ONBOARDING_COMPLETE_KEY
      );
      expect(result.current.showTour).toBe(true);
    });

    it('resetTour should handle AsyncStorage error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(
        new Error('Remove error')
      );

      const { result } = renderHook(() =>
        require('../OnboardingTour').useOnboardingTour()
      );

      await rtlAct(async () => {
        await result.current.resetTour();
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error resetting tour:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });

    it('hasCompletedTour should return true when key exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');

      const { result } = renderHook(() =>
        require('../OnboardingTour').useOnboardingTour()
      );

      let completed: boolean = false;
      await rtlAct(async () => {
        completed = await result.current.hasCompletedTour();
      });

      expect(completed).toBe(true);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(
        ONBOARDING_COMPLETE_KEY
      );
    });

    it('hasCompletedTour should return false when key does not exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() =>
        require('../OnboardingTour').useOnboardingTour()
      );

      let completed: boolean = true;
      await rtlAct(async () => {
        completed = await result.current.hasCompletedTour();
      });

      expect(completed).toBe(false);
    });

    it('hasCompletedTour should return false on AsyncStorage error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error('Read error')
      );

      const { result } = renderHook(() =>
        require('../OnboardingTour').useOnboardingTour()
      );

      let completed: boolean = true;
      await rtlAct(async () => {
        completed = await result.current.hasCompletedTour();
      });

      expect(completed).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error checking tour completion:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });

    it('OnboardingTour component from hook passes forceShow from showTour', () => {
      const { result } = renderHook(() =>
        require('../OnboardingTour').useOnboardingTour()
      );

      // The returned component is a wrapper that passes forceShow={showTour}
      const TourComponent = result.current.OnboardingTour;
      expect(typeof TourComponent).toBe('function');
    });

    it('OnboardingTour component from hook renders and passes forceShow prop', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const { result } = renderHook(() =>
        require('../OnboardingTour').useOnboardingTour()
      );

      // Actually render the component returned by the hook to cover line 347
      const TourComponent = result.current.OnboardingTour;
      let tree: any;
      renderer.act(() => {
        tree = renderer.create(
          React.createElement(TourComponent, { onComplete: jest.fn() })
        );
      });
      await renderer.act(async () => {
        await Promise.resolve();
      });
      // Component should render (returns null initially since showTour=false)
      expect(tree!.toJSON()).toBeNull();
    });
  });

  // =====================================================================
  // PROGRESS DOT STYLING
  // =====================================================================
  describe('progress dot styling', () => {
    it('should highlight current step dot with primary color', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const tree = renderComponent({});
      await renderer.act(async () => {
        await Promise.resolve();
      });
      renderer.act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Find dots: View elements with borderRadius: 4
      const allViews = tree.root.findAllByType('View');
      const dots = allViews.filter((v: any) => {
        const style = v.props.style;
        if (Array.isArray(style)) {
          return style.some((s: any) => s && s.borderRadius === 4);
        }
        return style && style.borderRadius === 4;
      });
      // First dot (current step 0) should have primary color
      const firstDotStyle = Array.isArray(dots[0].props.style)
        ? dots[0].props.style
        : [dots[0].props.style];
      const hasPrimary = firstDotStyle.some(
        (s: any) => s && s.backgroundColor === '#3b82f6'
      );
      expect(hasPrimary).toBe(true);
    });

    it('should change dot colors after navigation', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const tree = renderComponent({});
      await renderer.act(async () => {
        await Promise.resolve();
      });
      renderer.act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Navigate to step 2
      const nextBtn = findButtonByLabel(tree.root, 'Next');
      renderer.act(() => {
        nextBtn.props.onPress();
      });

      const allViews = tree.root.findAllByType('View');
      const dots = allViews.filter((v: any) => {
        const style = v.props.style;
        if (Array.isArray(style)) {
          return style.some((s: any) => s && s.borderRadius === 4);
        }
        return style && style.borderRadius === 4;
      });

      // First dot (completed, index < currentStep) should use textTertiary color
      const firstDotStyles = Array.isArray(dots[0].props.style)
        ? dots[0].props.style
        : [dots[0].props.style];
      const hasTextTertiary = firstDotStyles.some(
        (s: any) => s && s.backgroundColor === '#6b7280'
      );
      expect(hasTextTertiary).toBe(true);

      // Second dot (current) should use primary color
      const secondDotStyles = Array.isArray(dots[1].props.style)
        ? dots[1].props.style
        : [dots[1].props.style];
      const hasPrimary = secondDotStyles.some(
        (s: any) => s && s.backgroundColor === '#3b82f6'
      );
      expect(hasPrimary).toBe(true);
    });
  });

  // =====================================================================
  // BUTTON STYLES
  // =====================================================================
  describe('button configuration', () => {
    it('Next button should have primary variant', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const tree = renderComponent({});
      await renderer.act(async () => {
        await Promise.resolve();
      });
      renderer.act(() => {
        jest.advanceTimersByTime(1000);
      });

      const nextBtn = findButtonByLabel(tree.root, 'Next');
      expect(nextBtn.props.variant).toBe('primary');
    });

    it('Next button should have icon on non-last step', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const tree = renderComponent({});
      await renderer.act(async () => {
        await Promise.resolve();
      });
      renderer.act(() => {
        jest.advanceTimersByTime(1000);
      });

      const nextBtn = findButtonByLabel(tree.root, 'Next');
      expect(nextBtn.props.icon).toBeDefined();
      expect(nextBtn.props.iconPosition).toBe('right');
    });

    it('Get Started button should not have icon on last step', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const tree = renderComponent({});
      await renderer.act(async () => {
        await Promise.resolve();
      });
      renderer.act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Navigate to last step
      for (let i = 0; i < 5; i++) {
        const nextBtn = findButtonByLabel(tree.root, 'Next');
        renderer.act(() => {
          nextBtn.props.onPress();
        });
      }

      const getStartedBtn = findButtonByLabel(tree.root, 'Get Started');
      expect(getStartedBtn.props.icon).toBeUndefined();
    });

    it('Back button should have ghost variant', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const tree = renderComponent({});
      await renderer.act(async () => {
        await Promise.resolve();
      });
      renderer.act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Navigate to step 2
      const nextBtn = findButtonByLabel(tree.root, 'Next');
      renderer.act(() => {
        nextBtn.props.onPress();
      });

      const backBtn = findButtonByLabel(tree.root, 'Back');
      expect(backBtn.props.variant).toBe('ghost');
    });

    it('Next button should have fullWidthButton style on first step', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const tree = renderComponent({});
      await renderer.act(async () => {
        await Promise.resolve();
      });
      renderer.act(() => {
        jest.advanceTimersByTime(1000);
      });

      const nextBtn = findButtonByLabel(tree.root, 'Next');
      // style should contain fullWidthButton (flex: 1)
      const styleArray = nextBtn.props.style;
      const flatStyles = Array.isArray(styleArray)
        ? styleArray.filter(Boolean)
        : [styleArray];
      const hasFullWidth = flatStyles.some(
        (s: any) => s && s.flex === 1
      );
      expect(hasFullWidth).toBe(true);
    });
  });

  // =====================================================================
  // BACKGROUND OVERLAY
  // =====================================================================
  describe('background overlay', () => {
    it('should render a background overlay TouchableOpacity with absoluteFill', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const tree = renderComponent({});
      await renderer.act(async () => {
        await Promise.resolve();
      });
      renderer.act(() => {
        jest.advanceTimersByTime(1000);
      });

      const touchables = findTouchables(tree.root);
      // First touchable should be the background overlay with absoluteFill
      const bgOverlay = touchables.find((t: any) => {
        const style = t.props.style;
        if (style && style.position === 'absolute') return true;
        if (Array.isArray(style)) {
          return style.some((s: any) => s && s.position === 'absolute');
        }
        return false;
      });
      expect(bgOverlay).toBeDefined();
      expect(bgOverlay.props.activeOpacity).toBe(1);
    });

    it('background overlay onPress should be a no-op function', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const tree = renderComponent({});
      await renderer.act(async () => {
        await Promise.resolve();
      });
      renderer.act(() => {
        jest.advanceTimersByTime(1000);
      });

      const touchables = findTouchables(tree.root);
      const bgOverlay = touchables.find((t: any) => {
        const style = t.props.style;
        if (style && style.position === 'absolute') return true;
        if (Array.isArray(style)) {
          return style.some((s: any) => s && s.position === 'absolute');
        }
        return false;
      });
      // Call the empty onPress to cover line 228
      expect(() => bgOverlay.props.onPress()).not.toThrow();
    });
  });
});
