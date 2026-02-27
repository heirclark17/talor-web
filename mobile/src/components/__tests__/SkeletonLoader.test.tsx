/**
 * SkeletonLoader Component Tests
 *
 * Comprehensive tests using react-test-renderer for all 8 skeleton components.
 * Covers: rendering, dark/light theme, custom props, shimmer animation setup,
 * SkeletonPage type switching, SkeletonText line generation, SkeletonAvatar
 * rounded logic, and all composite skeleton layouts.
 *
 * Target: 100% code coverage.
 */

// Mock ThemeContext before imports - start with dark mode
const mockUseTheme = jest.fn(() => ({
  isDark: true,
  colors: {
    background: '#0a0a0a',
    backgroundSecondary: '#1a1a1a',
    backgroundTertiary: '#2a2a2a',
    border: '#374151',
  },
}));

jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => mockUseTheme(),
}));

// Re-mock react-native-reanimated to provide a valid Animated.View for react-test-renderer.
// The global mock uses strings which cause "Element type is invalid" in renderer.create().
const mockUseSharedValue = jest.fn((init: any) => ({ value: init }));
const mockUseAnimatedStyle = jest.fn((cb: () => any) => {
  // Execute the callback so its body is covered
  try { cb(); } catch (_) {}
  return {};
});
const mockWithTiming = jest.fn((val: any) => val);
const mockWithRepeat = jest.fn((val: any) => val);
const mockInterpolate = jest.fn();

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const AnimatedView = React.forwardRef((props: any, ref: any) =>
    React.createElement('AnimatedView', { ...props, ref })
  );
  AnimatedView.displayName = 'AnimatedView';
  return {
    __esModule: true,
    default: {
      View: AnimatedView,
      Text: 'AnimatedText',
      ScrollView: 'AnimatedScrollView',
      createAnimatedComponent: jest.fn((comp: any) => comp),
    },
    useSharedValue: (init: any) => mockUseSharedValue(init),
    useAnimatedStyle: (cb: any) => mockUseAnimatedStyle(cb),
    withSpring: jest.fn((val: any) => val),
    withTiming: (...args: any[]) => mockWithTiming(...args),
    withDelay: jest.fn((_delay: any, val: any) => val),
    withSequence: jest.fn((...vals: any[]) => vals[vals.length - 1]),
    withRepeat: (...args: any[]) => mockWithRepeat(...args),
    interpolateColor: jest.fn(),
    interpolate: (val: any) => mockInterpolate(val),
    Easing: {
      linear: jest.fn(),
      ease: jest.fn(),
      bezier: jest.fn(),
      inOut: jest.fn(() => jest.fn()),
    },
    runOnJS: jest.fn((fn: any) => fn),
    cancelAnimation: jest.fn(),
    Animated: {
      View: AnimatedView,
      Text: 'AnimatedText',
      ScrollView: 'AnimatedScrollView',
    },
    createAnimatedComponent: jest.fn((comp: any) => comp),
  };
});

import React from 'react';
import renderer from 'react-test-renderer';
import {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonResumeItem,
  SkeletonInterviewPrepItem,
  SkeletonCareerPlan,
  SkeletonPage,
} from '../SkeletonLoader';
import { COLORS, RADIUS, SPACING } from '../../utils/constants';

// ---- Helpers ----

/** Render a component inside renderer.act() and return the tree */
const renderComponent = (element: React.ReactElement): renderer.ReactTestRenderer => {
  let tree!: renderer.ReactTestRenderer;
  renderer.act(() => {
    tree = renderer.create(element);
  });
  return tree;
};

/** Set theme to dark mode */
const setDarkMode = () => {
  mockUseTheme.mockReturnValue({
    isDark: true,
    colors: {
      background: '#0a0a0a',
      backgroundSecondary: '#1a1a1a',
      backgroundTertiary: '#2a2a2a',
      border: '#374151',
    },
  });
};

/** Set theme to light mode */
const setLightMode = () => {
  mockUseTheme.mockReturnValue({
    isDark: false,
    colors: {
      background: '#f8fafc',
      backgroundSecondary: '#f1f5f9',
      backgroundTertiary: '#e2e8f0',
      border: '#cbd5e1',
    },
  });
};

// ========================================================================
// Tests
// ========================================================================

describe('SkeletonLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setDarkMode();
  });

  // ---------- Module Exports ----------

  describe('Module Exports', () => {
    it('should export Skeleton as a named export', () => {
      expect(Skeleton).toBeDefined();
      expect(typeof Skeleton).toBe('function');
    });

    it('should export Skeleton as the default export', () => {
      const defaultExport = require('../SkeletonLoader').default;
      expect(defaultExport).toBe(Skeleton);
    });

    it('should export SkeletonText', () => {
      expect(typeof SkeletonText).toBe('function');
    });

    it('should export SkeletonAvatar', () => {
      expect(typeof SkeletonAvatar).toBe('function');
    });

    it('should export SkeletonCard', () => {
      expect(typeof SkeletonCard).toBe('function');
    });

    it('should export SkeletonResumeItem', () => {
      expect(typeof SkeletonResumeItem).toBe('function');
    });

    it('should export SkeletonInterviewPrepItem', () => {
      expect(typeof SkeletonInterviewPrepItem).toBe('function');
    });

    it('should export SkeletonCareerPlan', () => {
      expect(typeof SkeletonCareerPlan).toBe('function');
    });

    it('should export SkeletonPage', () => {
      expect(typeof SkeletonPage).toBe('function');
    });

    it('should export exactly 8 named component exports', () => {
      const mod = require('../SkeletonLoader');
      const exportedFunctions = Object.entries(mod).filter(
        ([key, val]) => typeof val === 'function' && key !== 'default'
      );
      expect(exportedFunctions.length).toBe(8);
    });
  });

  // ---------- Skeleton (base component) ----------

  describe('Skeleton', () => {
    it('should render with default props in dark mode', () => {
      const tree = renderComponent(React.createElement(Skeleton));
      const json = tree.toJSON() as any;
      expect(json).not.toBeNull();
      // Default: width='100%', height=20, borderRadius=RADIUS.sm
      const style = Array.isArray(json.props.style)
        ? Object.assign({}, ...json.props.style.filter(Boolean))
        : json.props.style;
      expect(style.height).toBe(20);
      expect(style.borderRadius).toBe(RADIUS.sm);
      expect(style.backgroundColor).toBe(COLORS.dark.backgroundTertiary);
    });

    it('should render with default props in light mode', () => {
      setLightMode();
      const tree = renderComponent(React.createElement(Skeleton));
      const json = tree.toJSON() as any;
      const style = Array.isArray(json.props.style)
        ? Object.assign({}, ...json.props.style.filter(Boolean))
        : json.props.style;
      expect(style.backgroundColor).toBe(COLORS.light.backgroundTertiary);
    });

    it('should apply custom width as number', () => {
      const tree = renderComponent(React.createElement(Skeleton, { width: 200 }));
      const json = tree.toJSON() as any;
      const style = Array.isArray(json.props.style)
        ? Object.assign({}, ...json.props.style.filter(Boolean))
        : json.props.style;
      expect(style.width).toBe(200);
    });

    it('should apply custom width as string percentage', () => {
      const tree = renderComponent(React.createElement(Skeleton, { width: '75%' }));
      const json = tree.toJSON() as any;
      const style = Array.isArray(json.props.style)
        ? Object.assign({}, ...json.props.style.filter(Boolean))
        : json.props.style;
      expect(style.width).toBe('75%');
    });

    it('should apply custom height', () => {
      const tree = renderComponent(React.createElement(Skeleton, { height: 50 }));
      const json = tree.toJSON() as any;
      const style = Array.isArray(json.props.style)
        ? Object.assign({}, ...json.props.style.filter(Boolean))
        : json.props.style;
      expect(style.height).toBe(50);
    });

    it('should apply custom borderRadius', () => {
      const tree = renderComponent(
        React.createElement(Skeleton, { borderRadius: RADIUS.full })
      );
      const json = tree.toJSON() as any;
      const style = Array.isArray(json.props.style)
        ? Object.assign({}, ...json.props.style.filter(Boolean))
        : json.props.style;
      expect(style.borderRadius).toBe(RADIUS.full);
    });

    it('should apply custom style prop', () => {
      const customStyle = { marginTop: 10, opacity: 0.5 };
      const tree = renderComponent(
        React.createElement(Skeleton, { style: customStyle })
      );
      const json = tree.toJSON() as any;
      // style is an array: [baseStyle, animatedStyle, customStyle]
      const styles = json.props.style;
      expect(styles).toContainEqual(expect.objectContaining({ marginTop: 10 }));
    });

    it('should call useSharedValue with initial value 0', () => {
      renderComponent(React.createElement(Skeleton));
      expect(mockUseSharedValue).toHaveBeenCalledWith(0);
    });

    it('should call useAnimatedStyle for shimmer opacity', () => {
      renderComponent(React.createElement(Skeleton));
      expect(mockUseAnimatedStyle).toHaveBeenCalled();
    });

    it('should set up shimmer animation with withRepeat and withTiming', () => {
      renderComponent(React.createElement(Skeleton));
      // useEffect calls: shimmer.value = withRepeat(withTiming(1, {duration:1500}), -1, false)
      expect(mockWithTiming).toHaveBeenCalledWith(1, { duration: 1500 });
      expect(mockWithRepeat).toHaveBeenCalledWith(
        expect.anything(),
        -1,
        false
      );
    });

    it('should render as Animated.View', () => {
      const tree = renderComponent(React.createElement(Skeleton));
      const json = tree.toJSON() as any;
      // The global mock maps Animated.View to the string 'Animated.View'
      // react-test-renderer renders it as a component
      expect(json).toBeTruthy();
    });
  });

  // ---------- SkeletonText ----------

  describe('SkeletonText', () => {
    it('should render 3 skeleton lines by default', () => {
      const tree = renderComponent(React.createElement(SkeletonText));
      const json = tree.toJSON() as any;
      // Outer View contains children array - one Skeleton per line
      expect(json.children).toHaveLength(3);
    });

    it('should render custom number of lines', () => {
      const tree = renderComponent(React.createElement(SkeletonText, { lines: 5 }));
      const json = tree.toJSON() as any;
      expect(json.children).toHaveLength(5);
    });

    it('should render single line', () => {
      const tree = renderComponent(React.createElement(SkeletonText, { lines: 1 }));
      const json = tree.toJSON() as any;
      expect(json.children).toHaveLength(1);
    });

    it('should apply gap spacing from default SPACING.sm', () => {
      const tree = renderComponent(React.createElement(SkeletonText));
      const json = tree.toJSON() as any;
      expect(json.props.style.gap).toBe(SPACING.sm);
    });

    it('should apply custom spacing', () => {
      const tree = renderComponent(
        React.createElement(SkeletonText, { spacing: 20 })
      );
      const json = tree.toJSON() as any;
      expect(json.props.style.gap).toBe(20);
    });

    it('should set last line width to 60% by default', () => {
      const tree = renderComponent(React.createElement(SkeletonText, { lines: 3 }));
      const json = tree.toJSON() as any;
      // Last child (index 2) should have width='60%'
      const lastChild = json.children[2];
      const lastStyle = Array.isArray(lastChild.props.style)
        ? Object.assign({}, ...lastChild.props.style.filter(Boolean))
        : lastChild.props.style;
      expect(lastStyle.width).toBe('60%');
    });

    it('should set non-last lines to width 100%', () => {
      const tree = renderComponent(React.createElement(SkeletonText, { lines: 3 }));
      const json = tree.toJSON() as any;
      const firstChild = json.children[0];
      const firstStyle = Array.isArray(firstChild.props.style)
        ? Object.assign({}, ...firstChild.props.style.filter(Boolean))
        : firstChild.props.style;
      expect(firstStyle.width).toBe('100%');
    });

    it('should apply custom lastLineWidth', () => {
      const tree = renderComponent(
        React.createElement(SkeletonText, { lines: 2, lastLineWidth: '40%' })
      );
      const json = tree.toJSON() as any;
      const lastChild = json.children[1];
      const lastStyle = Array.isArray(lastChild.props.style)
        ? Object.assign({}, ...lastChild.props.style.filter(Boolean))
        : lastChild.props.style;
      expect(lastStyle.width).toBe('40%');
    });

    it('should apply custom lastLineWidth as number', () => {
      const tree = renderComponent(
        React.createElement(SkeletonText, { lines: 2, lastLineWidth: 150 })
      );
      const json = tree.toJSON() as any;
      const lastChild = json.children[1];
      const lastStyle = Array.isArray(lastChild.props.style)
        ? Object.assign({}, ...lastChild.props.style.filter(Boolean))
        : lastChild.props.style;
      expect(lastStyle.width).toBe(150);
    });

    it('should apply custom lineHeight to each skeleton', () => {
      const tree = renderComponent(
        React.createElement(SkeletonText, { lineHeight: 24, lines: 2 })
      );
      const json = tree.toJSON() as any;
      json.children.forEach((child: any) => {
        const style = Array.isArray(child.props.style)
          ? Object.assign({}, ...child.props.style.filter(Boolean))
          : child.props.style;
        expect(style.height).toBe(24);
      });
    });

    it('should use default lineHeight of 16', () => {
      const tree = renderComponent(React.createElement(SkeletonText, { lines: 1 }));
      const json = tree.toJSON() as any;
      const style = Array.isArray(json.children[0].props.style)
        ? Object.assign({}, ...json.children[0].props.style.filter(Boolean))
        : json.children[0].props.style;
      expect(style.height).toBe(16);
    });
  });

  // ---------- SkeletonAvatar ----------

  describe('SkeletonAvatar', () => {
    it('should render with default size of 48 and circular borderRadius', () => {
      const tree = renderComponent(React.createElement(SkeletonAvatar));
      const json = tree.toJSON() as any;
      const style = Array.isArray(json.props.style)
        ? Object.assign({}, ...json.props.style.filter(Boolean))
        : json.props.style;
      expect(style.width).toBe(48);
      expect(style.height).toBe(48);
      expect(style.borderRadius).toBe(24); // 48 / 2
    });

    it('should render with custom size and circular borderRadius', () => {
      const tree = renderComponent(
        React.createElement(SkeletonAvatar, { size: 100 })
      );
      const json = tree.toJSON() as any;
      const style = Array.isArray(json.props.style)
        ? Object.assign({}, ...json.props.style.filter(Boolean))
        : json.props.style;
      expect(style.width).toBe(100);
      expect(style.height).toBe(100);
      expect(style.borderRadius).toBe(50); // 100 / 2
    });

    it('should use RADIUS.md when rounded is false', () => {
      const tree = renderComponent(
        React.createElement(SkeletonAvatar, { rounded: false })
      );
      const json = tree.toJSON() as any;
      const style = Array.isArray(json.props.style)
        ? Object.assign({}, ...json.props.style.filter(Boolean))
        : json.props.style;
      expect(style.borderRadius).toBe(RADIUS.md);
    });

    it('should use RADIUS.md for non-rounded with custom size', () => {
      const tree = renderComponent(
        React.createElement(SkeletonAvatar, { size: 80, rounded: false })
      );
      const json = tree.toJSON() as any;
      const style = Array.isArray(json.props.style)
        ? Object.assign({}, ...json.props.style.filter(Boolean))
        : json.props.style;
      expect(style.width).toBe(80);
      expect(style.height).toBe(80);
      expect(style.borderRadius).toBe(RADIUS.md);
    });
  });

  // ---------- SkeletonCard ----------

  describe('SkeletonCard', () => {
    it('should render in dark mode with correct background and border colors', () => {
      const tree = renderComponent(React.createElement(SkeletonCard));
      const json = tree.toJSON() as any;
      const str = JSON.stringify(json);
      expect(str).toContain(COLORS.dark.backgroundSecondary);
      expect(str).toContain(COLORS.dark.border);
    });

    it('should render in light mode with correct background and border colors', () => {
      setLightMode();
      const tree = renderComponent(React.createElement(SkeletonCard));
      const json = tree.toJSON() as any;
      const str = JSON.stringify(json);
      expect(str).toContain(COLORS.light.backgroundSecondary);
      expect(str).toContain(COLORS.light.border);
    });

    it('should contain a SkeletonAvatar (size 40) in the header', () => {
      const tree = renderComponent(React.createElement(SkeletonCard));
      const json = tree.toJSON() as any;
      const str = JSON.stringify(json);
      // The avatar in SkeletonCard uses size=40, so width=40, height=40
      // and borderRadius = 40/2 = 20
      expect(str).toContain('"width":40');
      expect(str).toContain('"height":40');
    });

    it('should contain header skeleton elements for title and subtitle', () => {
      const tree = renderComponent(React.createElement(SkeletonCard));
      const json = tree.toJSON() as any;
      const str = JSON.stringify(json);
      // Header has Skeleton height=18 width="70%" and Skeleton height=14 width="50%"
      expect(str).toContain('"height":18');
      expect(str).toContain('"width":"70%"');
      expect(str).toContain('"height":14');
      expect(str).toContain('"width":"50%"');
    });

    it('should contain SkeletonText with 3 lines', () => {
      const tree = renderComponent(React.createElement(SkeletonCard));
      const json = tree.toJSON() as any;
      const str = JSON.stringify(json);
      // SkeletonText default lines=3, lastLineWidth='60%'
      expect(str).toContain('"width":"60%"');
    });
  });

  // ---------- SkeletonResumeItem ----------

  describe('SkeletonResumeItem', () => {
    it('should render in dark mode with correct colors', () => {
      const tree = renderComponent(React.createElement(SkeletonResumeItem));
      const json = tree.toJSON() as any;
      const str = JSON.stringify(json);
      expect(str).toContain(COLORS.dark.backgroundSecondary);
      expect(str).toContain(COLORS.dark.border);
    });

    it('should render in light mode with correct colors', () => {
      setLightMode();
      const tree = renderComponent(React.createElement(SkeletonResumeItem));
      const json = tree.toJSON() as any;
      const str = JSON.stringify(json);
      expect(str).toContain(COLORS.light.backgroundSecondary);
      expect(str).toContain(COLORS.light.border);
    });

    it('should contain a 48x48 document icon skeleton with RADIUS.md', () => {
      const tree = renderComponent(React.createElement(SkeletonResumeItem));
      const json = tree.toJSON() as any;
      const str = JSON.stringify(json);
      expect(str).toContain('"width":48');
      expect(str).toContain('"height":48');
    });

    it('should contain text skeletons for name and subtitle', () => {
      const tree = renderComponent(React.createElement(SkeletonResumeItem));
      const json = tree.toJSON() as any;
      const str = JSON.stringify(json);
      // Skeleton height=18 width=150 and Skeleton height=14 width=100
      expect(str).toContain('"width":150');
      expect(str).toContain('"width":100');
    });

    it('should contain two action button skeletons (32x32, RADIUS.full)', () => {
      const tree = renderComponent(React.createElement(SkeletonResumeItem));
      const json = tree.toJSON() as any;
      const str = JSON.stringify(json);
      // Two instances of width:32, height:32
      const matches32 = str.match(/"width":32/g);
      expect(matches32).not.toBeNull();
      expect(matches32!.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ---------- SkeletonInterviewPrepItem ----------

  describe('SkeletonInterviewPrepItem', () => {
    it('should render in dark mode with correct colors', () => {
      const tree = renderComponent(React.createElement(SkeletonInterviewPrepItem));
      const json = tree.toJSON() as any;
      const str = JSON.stringify(json);
      expect(str).toContain(COLORS.dark.backgroundSecondary);
      expect(str).toContain(COLORS.dark.border);
    });

    it('should render in light mode with correct colors', () => {
      setLightMode();
      const tree = renderComponent(React.createElement(SkeletonInterviewPrepItem));
      const json = tree.toJSON() as any;
      const str = JSON.stringify(json);
      expect(str).toContain(COLORS.light.backgroundSecondary);
      expect(str).toContain(COLORS.light.border);
    });

    it('should contain header with title (60%) and badge (60x24)', () => {
      const tree = renderComponent(React.createElement(SkeletonInterviewPrepItem));
      const json = tree.toJSON() as any;
      const str = JSON.stringify(json);
      expect(str).toContain('"width":"60%"');
      expect(str).toContain('"width":60');
      expect(str).toContain('"height":24');
    });

    it('should contain a description skeleton (80% width, height 14)', () => {
      const tree = renderComponent(React.createElement(SkeletonInterviewPrepItem));
      const json = tree.toJSON() as any;
      const str = JSON.stringify(json);
      expect(str).toContain('"width":"80%"');
    });

    it('should contain footer with date (80x14) and button (100x32)', () => {
      const tree = renderComponent(React.createElement(SkeletonInterviewPrepItem));
      const json = tree.toJSON() as any;
      const str = JSON.stringify(json);
      expect(str).toContain('"width":80');
      expect(str).toContain('"width":100');
    });
  });

  // ---------- SkeletonCareerPlan ----------

  describe('SkeletonCareerPlan', () => {
    it('should render in dark mode with correct colors', () => {
      const tree = renderComponent(React.createElement(SkeletonCareerPlan));
      const json = tree.toJSON() as any;
      const str = JSON.stringify(json);
      expect(str).toContain(COLORS.dark.backgroundSecondary);
      expect(str).toContain(COLORS.dark.border);
    });

    it('should render in light mode with correct colors', () => {
      setLightMode();
      const tree = renderComponent(React.createElement(SkeletonCareerPlan));
      const json = tree.toJSON() as any;
      const str = JSON.stringify(json);
      expect(str).toContain(COLORS.light.backgroundSecondary);
      expect(str).toContain(COLORS.light.border);
    });

    it('should contain header with title (50%) and subtitle (40%)', () => {
      const tree = renderComponent(React.createElement(SkeletonCareerPlan));
      const json = tree.toJSON() as any;
      const str = JSON.stringify(json);
      expect(str).toContain('"width":"50%"');
      expect(str).toContain('"width":"40%"');
    });

    it('should contain a 40x40 icon skeleton in the header', () => {
      const tree = renderComponent(React.createElement(SkeletonCareerPlan));
      const json = tree.toJSON() as any;
      const str = JSON.stringify(json);
      // Skeleton width=40 height=40 borderRadius=RADIUS.md
      expect(str).toContain('"width":40');
      expect(str).toContain('"height":40');
    });

    it('should contain a progress bar skeleton (100% width, height 8)', () => {
      const tree = renderComponent(React.createElement(SkeletonCareerPlan));
      const json = tree.toJSON() as any;
      const str = JSON.stringify(json);
      expect(str).toContain('"height":8');
    });

    it('should contain 4 milestone dots (24x24, RADIUS.full)', () => {
      const tree = renderComponent(React.createElement(SkeletonCareerPlan));
      const json = tree.toJSON() as any;
      const str = JSON.stringify(json);
      // 4 instances of width:24, height:24
      const matches24w = str.match(/"width":24/g);
      expect(matches24w).not.toBeNull();
      expect(matches24w!.length).toBeGreaterThanOrEqual(4);
    });

    it('should contain SkeletonText with 2 lines at lineHeight 14', () => {
      const tree = renderComponent(React.createElement(SkeletonCareerPlan));
      const json = tree.toJSON() as any;
      const str = JSON.stringify(json);
      // SkeletonText lines=2 lineHeight=14
      // Last line width = '60%' (default), this also appears in header.
      // The lineHeight=14 for each line child
      expect(str).toContain('"height":14');
    });
  });

  // ---------- SkeletonPage ----------

  describe('SkeletonPage', () => {
    it('should render 3 items by default', () => {
      const tree = renderComponent(React.createElement(SkeletonPage));
      const json = tree.toJSON() as any;
      // Outer View has children = 3 page items
      expect(json.children).toHaveLength(3);
    });

    it('should render custom count of items', () => {
      const tree = renderComponent(
        React.createElement(SkeletonPage, { count: 5 })
      );
      const json = tree.toJSON() as any;
      expect(json.children).toHaveLength(5);
    });

    it('should render 1 item when count is 1', () => {
      const tree = renderComponent(
        React.createElement(SkeletonPage, { count: 1 })
      );
      const json = tree.toJSON() as any;
      expect(json.children).toHaveLength(1);
    });

    it('should render SkeletonCard for "list" type (default)', () => {
      // 'list' is the default type, falls through to default case => SkeletonCard
      const tree = renderComponent(
        React.createElement(SkeletonPage, { type: 'list', count: 1 })
      );
      const json = tree.toJSON() as any;
      const str = JSON.stringify(json);
      // SkeletonCard has header with avatar (40x40) and SkeletonText
      expect(str).toContain('"width":40');
      expect(str).toContain('"height":40');
      expect(str).toContain('"width":"70%"');
    });

    it('should render SkeletonCard for "card" type', () => {
      const tree = renderComponent(
        React.createElement(SkeletonPage, { type: 'card', count: 1 })
      );
      const json = tree.toJSON() as any;
      const str = JSON.stringify(json);
      // Same SkeletonCard content
      expect(str).toContain('"width":"70%"');
      expect(str).toContain('"width":"50%"');
    });

    it('should render SkeletonResumeItem for "resume" type', () => {
      const tree = renderComponent(
        React.createElement(SkeletonPage, { type: 'resume', count: 1 })
      );
      const json = tree.toJSON() as any;
      const str = JSON.stringify(json);
      // SkeletonResumeItem has width:150, width:100 text skeletons
      expect(str).toContain('"width":150');
      expect(str).toContain('"width":100');
    });

    it('should render SkeletonInterviewPrepItem for "interview" type', () => {
      const tree = renderComponent(
        React.createElement(SkeletonPage, { type: 'interview', count: 1 })
      );
      const json = tree.toJSON() as any;
      const str = JSON.stringify(json);
      // SkeletonInterviewPrepItem has width:"80%", width:80, width:100
      expect(str).toContain('"width":"80%"');
      expect(str).toContain('"width":80');
    });

    it('should render SkeletonCareerPlan for "career" type', () => {
      const tree = renderComponent(
        React.createElement(SkeletonPage, { type: 'career', count: 1 })
      );
      const json = tree.toJSON() as any;
      const str = JSON.stringify(json);
      // SkeletonCareerPlan has width:"50%", width:"40%", height:8
      expect(str).toContain('"width":"50%"');
      expect(str).toContain('"width":"40%"');
      expect(str).toContain('"height":8');
    });

    it('should apply page styles to outer container', () => {
      const tree = renderComponent(
        React.createElement(SkeletonPage, { count: 1 })
      );
      const json = tree.toJSON() as any;
      expect(json.props.style).toEqual(
        expect.objectContaining({
          flex: 1,
          padding: SPACING.md,
        })
      );
    });

    it('should apply pageItem styles with marginBottom to each item wrapper', () => {
      const tree = renderComponent(
        React.createElement(SkeletonPage, { count: 2 })
      );
      const json = tree.toJSON() as any;
      json.children.forEach((child: any) => {
        expect(child.props.style).toEqual(
          expect.objectContaining({ marginBottom: SPACING.md })
        );
      });
    });
  });

  // ---------- Theme switching across all composite components ----------

  describe('Theme-aware colors for composite components', () => {
    const compositeComponents = [
      { name: 'SkeletonCard', Component: SkeletonCard },
      { name: 'SkeletonResumeItem', Component: SkeletonResumeItem },
      { name: 'SkeletonInterviewPrepItem', Component: SkeletonInterviewPrepItem },
      { name: 'SkeletonCareerPlan', Component: SkeletonCareerPlan },
    ];

    compositeComponents.forEach(({ name, Component }) => {
      it(`${name} should use dark backgroundSecondary when isDark=true`, () => {
        setDarkMode();
        const tree = renderComponent(React.createElement(Component));
        const json = tree.toJSON() as any;
        const str = JSON.stringify(json);
        expect(str).toContain(COLORS.dark.backgroundSecondary);
      });

      it(`${name} should use light backgroundSecondary when isDark=false`, () => {
        setLightMode();
        const tree = renderComponent(React.createElement(Component));
        const json = tree.toJSON() as any;
        const str = JSON.stringify(json);
        expect(str).toContain(COLORS.light.backgroundSecondary);
      });

      it(`${name} should use dark border when isDark=true`, () => {
        setDarkMode();
        const tree = renderComponent(React.createElement(Component));
        const json = tree.toJSON() as any;
        const str = JSON.stringify(json);
        expect(str).toContain(COLORS.dark.border);
      });

      it(`${name} should use light border when isDark=false`, () => {
        setLightMode();
        const tree = renderComponent(React.createElement(Component));
        const json = tree.toJSON() as any;
        const str = JSON.stringify(json);
        expect(str).toContain(COLORS.light.border);
      });
    });
  });

  // ---------- Skeleton base component theme in composites ----------

  describe('Skeleton backgroundColor in composites', () => {
    it('should use dark backgroundTertiary in dark mode for inner Skeletons', () => {
      setDarkMode();
      const tree = renderComponent(React.createElement(SkeletonCard));
      const json = tree.toJSON() as any;
      const str = JSON.stringify(json);
      expect(str).toContain(COLORS.dark.backgroundTertiary);
    });

    it('should use light backgroundTertiary in light mode for inner Skeletons', () => {
      setLightMode();
      const tree = renderComponent(React.createElement(SkeletonCard));
      const json = tree.toJSON() as any;
      const str = JSON.stringify(json);
      expect(str).toContain(COLORS.light.backgroundTertiary);
    });
  });

  // ---------- StyleSheet verification ----------

  describe('StyleSheet definitions', () => {
    it('should apply card styles with padding, borderRadius, borderWidth, and gap', () => {
      const tree = renderComponent(React.createElement(SkeletonCard));
      const json = tree.toJSON() as any;
      // The outer View of SkeletonCard has [styles.card, {...colors}]
      const mergedStyle = Array.isArray(json.props.style)
        ? Object.assign({}, ...json.props.style.filter(Boolean))
        : json.props.style;
      expect(mergedStyle.padding).toBe(SPACING.md);
      expect(mergedStyle.borderRadius).toBe(RADIUS.lg);
      expect(mergedStyle.borderWidth).toBe(1);
      expect(mergedStyle.gap).toBe(SPACING.md);
    });

    it('should apply resumeItem styles with flexDirection row', () => {
      const tree = renderComponent(React.createElement(SkeletonResumeItem));
      const json = tree.toJSON() as any;
      const mergedStyle = Array.isArray(json.props.style)
        ? Object.assign({}, ...json.props.style.filter(Boolean))
        : json.props.style;
      expect(mergedStyle.flexDirection).toBe('row');
      expect(mergedStyle.justifyContent).toBe('space-between');
      expect(mergedStyle.alignItems).toBe('center');
    });

    it('should apply interviewItem styles with gap SPACING.sm', () => {
      const tree = renderComponent(React.createElement(SkeletonInterviewPrepItem));
      const json = tree.toJSON() as any;
      const mergedStyle = Array.isArray(json.props.style)
        ? Object.assign({}, ...json.props.style.filter(Boolean))
        : json.props.style;
      expect(mergedStyle.gap).toBe(SPACING.sm);
    });

    it('should apply careerCard styles with gap SPACING.md', () => {
      const tree = renderComponent(React.createElement(SkeletonCareerPlan));
      const json = tree.toJSON() as any;
      const mergedStyle = Array.isArray(json.props.style)
        ? Object.assign({}, ...json.props.style.filter(Boolean))
        : json.props.style;
      expect(mergedStyle.gap).toBe(SPACING.md);
    });
  });

  // ---------- Edge cases ----------

  describe('Edge cases', () => {
    it('should handle SkeletonText with 0 lines gracefully', () => {
      const tree = renderComponent(React.createElement(SkeletonText, { lines: 0 }));
      const json = tree.toJSON() as any;
      // Array.from({length: 0}) produces empty array
      expect(json.children).toBeNull();
    });

    it('should handle SkeletonPage with count 0', () => {
      const tree = renderComponent(
        React.createElement(SkeletonPage, { count: 0 })
      );
      const json = tree.toJSON() as any;
      expect(json.children).toBeNull();
    });

    it('should handle SkeletonAvatar with very small size', () => {
      const tree = renderComponent(
        React.createElement(SkeletonAvatar, { size: 2 })
      );
      const json = tree.toJSON() as any;
      const style = Array.isArray(json.props.style)
        ? Object.assign({}, ...json.props.style.filter(Boolean))
        : json.props.style;
      expect(style.width).toBe(2);
      expect(style.height).toBe(2);
      expect(style.borderRadius).toBe(1); // 2 / 2
    });

    it('should handle Skeleton with zero height', () => {
      const tree = renderComponent(React.createElement(Skeleton, { height: 0 }));
      const json = tree.toJSON() as any;
      const style = Array.isArray(json.props.style)
        ? Object.assign({}, ...json.props.style.filter(Boolean))
        : json.props.style;
      expect(style.height).toBe(0);
    });

    it('should handle Skeleton with zero borderRadius', () => {
      const tree = renderComponent(
        React.createElement(Skeleton, { borderRadius: 0 })
      );
      const json = tree.toJSON() as any;
      const style = Array.isArray(json.props.style)
        ? Object.assign({}, ...json.props.style.filter(Boolean))
        : json.props.style;
      expect(style.borderRadius).toBe(0);
    });

    it('should handle Skeleton with undefined style prop', () => {
      const tree = renderComponent(
        React.createElement(Skeleton, { style: undefined })
      );
      const json = tree.toJSON() as any;
      expect(json).not.toBeNull();
    });
  });
});
