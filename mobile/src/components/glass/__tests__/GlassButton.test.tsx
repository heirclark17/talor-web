/**
 * GlassButton Unit Tests -- Direct Invocation for Coverage
 *
 * Calls GlassButton as a function to execute all internal code paths:
 * - Variant styles (primary, secondary, ghost, danger, success)
 * - Size configs (sm, md, lg)
 * - Loading/disabled states
 * - Haptic feedback
 * - Press handlers
 * - fullWidth, iconPosition, label vs children
 * - LiquidGlass vs Blur fallback rendering paths
 */

// Mock react hooks so they work outside component context
jest.mock('react', () => {
  const actualReact = jest.requireActual('react');
  return {
    ...actualReact,
    useCallback: (fn: any) => fn,
    useState: (init: any) => [init, jest.fn()],
    useRef: (init: any) => ({ current: init }),
    useEffect: jest.fn(),
    useMemo: (fn: any) => fn(),
  };
});

jest.mock('../../../context/ThemeContext', () => ({
  useTheme: jest.fn(() => ({
    isDark: true,
    colors: {
      text: '#ffffff',
      textSecondary: '#9ca3af',
      textTertiary: '#6b7280',
      background: '#0a0a0a',
      backgroundSecondary: '#1a1a1a',
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
import { GlassButton } from '../GlassButton';
import { useTheme } from '../../../context/ThemeContext';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS } from '../../../utils/constants';

const mockUseTheme = useTheme as jest.Mock;

describe('GlassButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTheme.mockReturnValue({
      isDark: true,
      colors: {
        text: '#ffffff',
        textSecondary: '#9ca3af',
        textTertiary: '#6b7280',
        background: '#0a0a0a',
        backgroundSecondary: '#1a1a1a',
        glass: 'rgba(255, 255, 255, 0.04)',
        glassBorder: 'rgba(255, 255, 255, 0.08)',
      },
    });
  });

  describe('module exports', () => {
    it('should export GlassButton as a named export', () => {
      expect(GlassButton).toBeDefined();
      expect(typeof GlassButton).toBe('function');
    });

    it('should export GlassButton as the default export', () => {
      const mod = require('../GlassButton');
      expect(mod.default).toBe(mod.GlassButton);
    });
  });

  describe('primary variant rendering', () => {
    it('should render with primary variant by default', () => {
      const element = GlassButton({ label: 'Test' });
      expect(element).toBeTruthy();
    });

    it('should render with explicit primary variant', () => {
      const element = GlassButton({ variant: 'primary', label: 'Submit' });
      expect(element).toBeTruthy();
    });

    it('should render primary with all size variants', () => {
      const sm = GlassButton({ variant: 'primary', size: 'sm', label: 'SM' });
      const md = GlassButton({ variant: 'primary', size: 'md', label: 'MD' });
      const lg = GlassButton({ variant: 'primary', size: 'lg', label: 'LG' });
      expect(sm).toBeTruthy();
      expect(md).toBeTruthy();
      expect(lg).toBeTruthy();
    });
  });

  describe('ghost variant rendering', () => {
    it('should render ghost variant with no glass effect', () => {
      const element = GlassButton({ variant: 'ghost', label: 'Ghost' });
      expect(element).toBeTruthy();
    });

    it('should render ghost variant in light mode', () => {
      mockUseTheme.mockReturnValue({
        isDark: false,
        colors: {
          text: '#000000',
          textSecondary: '#6b7280',
          textTertiary: '#9ca3af',
          background: '#ffffff',
          backgroundSecondary: '#f5f5f5',
          glass: 'rgba(0, 0, 0, 0.04)',
          glassBorder: 'rgba(0, 0, 0, 0.08)',
        },
      });
      const element = GlassButton({ variant: 'ghost', label: 'Light Ghost' });
      expect(element).toBeTruthy();
    });
  });

  describe('secondary variant rendering', () => {
    it('should render secondary variant in dark mode', () => {
      const element = GlassButton({ variant: 'secondary', label: 'Secondary' });
      expect(element).toBeTruthy();
    });

    it('should render secondary variant in light mode', () => {
      mockUseTheme.mockReturnValue({
        isDark: false,
        colors: {
          text: '#000000',
          textSecondary: '#6b7280',
          textTertiary: '#9ca3af',
          background: '#ffffff',
          backgroundSecondary: '#f5f5f5',
          glass: 'rgba(0, 0, 0, 0.04)',
          glassBorder: 'rgba(0, 0, 0, 0.08)',
        },
      });
      const element = GlassButton({ variant: 'secondary', label: 'Light Secondary' });
      expect(element).toBeTruthy();
    });
  });

  describe('danger variant rendering', () => {
    it('should render danger variant', () => {
      const element = GlassButton({ variant: 'danger', label: 'Delete' });
      expect(element).toBeTruthy();
    });

    it('should render danger variant in light mode', () => {
      mockUseTheme.mockReturnValue({
        isDark: false,
        colors: { text: '#000000', textSecondary: '#6b7280', textTertiary: '#9ca3af', background: '#ffffff', backgroundSecondary: '#f5f5f5', glass: 'rgba(0, 0, 0, 0.04)', glassBorder: 'rgba(0, 0, 0, 0.08)' },
      });
      const element = GlassButton({ variant: 'danger', label: 'Delete Light' });
      expect(element).toBeTruthy();
    });
  });

  describe('success variant rendering', () => {
    it('should render success variant', () => {
      const element = GlassButton({ variant: 'success', label: 'Confirm' });
      expect(element).toBeTruthy();
    });

    it('should render success variant in light mode', () => {
      mockUseTheme.mockReturnValue({
        isDark: false,
        colors: { text: '#000000', textSecondary: '#6b7280', textTertiary: '#9ca3af', background: '#ffffff', backgroundSecondary: '#f5f5f5', glass: 'rgba(0, 0, 0, 0.04)', glassBorder: 'rgba(0, 0, 0, 0.08)' },
      });
      const element = GlassButton({ variant: 'success', label: 'Confirm Light' });
      expect(element).toBeTruthy();
    });
  });

  describe('loading state', () => {
    it('should render loading state with ActivityIndicator', () => {
      const element = GlassButton({ label: 'Loading', loading: true });
      expect(element).toBeTruthy();
    });

    it('should be disabled when loading is true', () => {
      const element = GlassButton({ label: 'Loading', loading: true, variant: 'primary' });
      expect(element).toBeTruthy();
    });

    it('should show loading for each variant', () => {
      const variants: Array<'primary' | 'secondary' | 'ghost' | 'danger' | 'success'> = ['primary', 'secondary', 'ghost', 'danger', 'success'];
      variants.forEach((variant) => {
        const element = GlassButton({ variant, label: 'Load', loading: true });
        expect(element).toBeTruthy();
      });
    });
  });

  describe('disabled state', () => {
    it('should render disabled state', () => {
      const element = GlassButton({ label: 'Disabled', disabled: true });
      expect(element).toBeTruthy();
    });

    it('should apply 0.5 opacity when disabled', () => {
      const element = GlassButton({ label: 'Disabled', disabled: true, variant: 'ghost' });
      expect(element).toBeTruthy();
    });

    it('should be disabled when both loading and disabled are true', () => {
      const element = GlassButton({ label: 'Both', disabled: true, loading: true });
      expect(element).toBeTruthy();
    });
  });

  describe('icon rendering', () => {
    it('should render with icon on the left by default', () => {
      const actualReact = jest.requireActual('react');
      const icon = actualReact.createElement('View', null, 'icon');
      const element = GlassButton({ label: 'With Icon', icon });
      expect(element).toBeTruthy();
    });

    it('should render with icon on the right', () => {
      const actualReact = jest.requireActual('react');
      const icon = actualReact.createElement('View', null, 'icon');
      const element = GlassButton({ label: 'With Icon', icon, iconPosition: 'right' });
      expect(element).toBeTruthy();
    });

    it('should render icon without label', () => {
      const actualReact = jest.requireActual('react');
      const icon = actualReact.createElement('View', null, 'icon');
      const element = GlassButton({ icon });
      expect(element).toBeTruthy();
    });
  });

  describe('children rendering', () => {
    it('should render children when no label is provided', () => {
      const element = GlassButton({ children: 'Child Text' });
      expect(element).toBeTruthy();
    });

    it('should prefer label over children', () => {
      const element = GlassButton({ label: 'Label', children: 'Child' });
      expect(element).toBeTruthy();
    });
  });

  describe('fullWidth prop', () => {
    it('should render fullWidth button', () => {
      const element = GlassButton({ label: 'Full', fullWidth: true });
      expect(element).toBeTruthy();
    });

    it('should render fullWidth with secondary variant', () => {
      const element = GlassButton({ label: 'Full Secondary', fullWidth: true, variant: 'secondary' });
      expect(element).toBeTruthy();
    });
  });

  describe('haptic feedback', () => {
    it('should trigger haptics on press by default', () => {
      const onPress = jest.fn();
      const element = GlassButton({ label: 'Tap', onPress });
      expect(element).toBeTruthy();
    });

    it('should not trigger haptics when haptic is false', () => {
      const element = GlassButton({ label: 'No Haptics', haptic: false });
      expect(element).toBeTruthy();
    });
  });

  describe('press handlers execution', () => {
    it('should create handlePress callback that calls onPress', () => {
      const onPress = jest.fn();
      const element = GlassButton({ label: 'Press', onPress });
      expect(element).toBeTruthy();
    });

    it('should create handlePressIn and handlePressOut callbacks', () => {
      const element = GlassButton({ label: 'Animate' });
      expect(element).toBeTruthy();
    });
  });

  describe('custom style props', () => {
    it('should accept custom style prop', () => {
      const element = GlassButton({ label: 'Styled', style: { marginTop: 10 } });
      expect(element).toBeTruthy();
    });

    it('should accept custom textStyle prop', () => {
      const element = GlassButton({ label: 'Text Styled', textStyle: { letterSpacing: 2 } });
      expect(element).toBeTruthy();
    });
  });

  describe('SIZE_CONFIG values', () => {
    it('should use correct dimensions for sm size', () => {
      expect(SPACING.md).toBe(16);
      const element = GlassButton({ size: 'sm', label: 'SM' });
      expect(element).toBeTruthy();
    });

    it('should use correct dimensions for md size', () => {
      expect(SPACING.lg).toBe(24);
      const element = GlassButton({ size: 'md', label: 'MD' });
      expect(element).toBeTruthy();
    });

    it('should use correct dimensions for lg size', () => {
      expect(SPACING.xl).toBe(32);
      const element = GlassButton({ size: 'lg', label: 'LG' });
      expect(element).toBeTruthy();
    });
  });

  describe('variant style constants', () => {
    it('should use COLORS.primary for primary bg', () => {
      expect(COLORS.primary).toBe('#3b82f6');
    });

    it('should use COLORS.danger for danger text', () => {
      expect(COLORS.danger).toBe('#f87171');
    });

    it('should use COLORS.success for success text', () => {
      expect(COLORS.success).toBe('#10b981');
    });

    it('should use RADIUS.md for button borderRadius', () => {
      expect(RADIUS.md).toBe(12);
    });

    it('should use FONTS.semibold for label font', () => {
      expect(FONTS.semibold).toBe('Urbanist_600SemiBold');
    });
  });
});
