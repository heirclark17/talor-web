/**
 * GlassCard Component Tests
 *
 * Comprehensive tests covering:
 * - Three render paths: LiquidGlass (iOS 26+), BlurView (older iOS), plain View (Android/no-blur)
 * - Style computation: background color, border color, tint color per material & theme
 * - All material types: ultraThin, thin, regular, thick, chrome
 * - Shadow types: all 6 real shadow presets
 * - Props: bordered, interactive, tintColor, useBlur, borderRadius, padding, style
 * - Dark and light theme variations
 */

import React from 'react';
import renderer from 'react-test-renderer';
import { Platform } from 'react-native';
import { GLASS, SHADOWS, RADIUS, SPACING } from '../../../utils/constants';

// --- Mock setup ---

const mockUseTheme = jest.fn(() => ({
  isDark: true,
  colors: { background: '#000', text: '#fff' },
}));

jest.mock('../../../context/ThemeContext', () => ({
  useTheme: (...args: any[]) => mockUseTheme(...args),
}));

let mockIsLiquidGlassSupported = false;

jest.mock('../LiquidGlassWrapper', () => ({
  get isLiquidGlassSupported() {
    return mockIsLiquidGlassSupported;
  },
  LiquidGlassView: ({ children, ...props }: any) =>
    require('react').createElement('LiquidGlassView', props, children),
}));

jest.mock('expo-blur', () => ({
  BlurView: ({ children, ...props }: any) =>
    require('react').createElement('BlurView', props, children),
}));

// --- Import after mocks ---
import { GlassCard } from '../GlassCard';

// --- Helpers ---

/** Render GlassCard and return the JSON tree */
const renderCard = (props: Record<string, any> = {}) => {
  let tree: renderer.ReactTestRenderer;
  renderer.act(() => {
    tree = renderer.create(
      <GlassCard {...props}>
        <>{/* child */}Test Content</>
      </GlassCard>
    );
  });
  return tree!.toJSON() as any;
};

/** Reset to defaults before each test */
beforeEach(() => {
  jest.clearAllMocks();
  mockUseTheme.mockReturnValue({
    isDark: true,
    colors: { background: '#000', text: '#fff' },
  });
  mockIsLiquidGlassSupported = false;
  // Default Platform is ios (from jest.setup.ts)
  (Platform as any).OS = 'ios';
});

// =============================================================================
// 1. RENDER PATH: BlurView (default on iOS, isLiquidGlassSupported=false, useBlur=true)
// =============================================================================

describe('GlassCard - BlurView path (iOS, no LiquidGlass, useBlur=true)', () => {
  it('renders BlurView as the inner element when on iOS with useBlur=true', () => {
    const json = renderCard();
    // Outer is View, inner is BlurView
    expect(json.type).toBe('View');
    const blurView = json.children[0];
    expect(blurView.type).toBe('BlurView');
  });

  it('passes blur intensity from material to BlurView', () => {
    const json = renderCard({ material: 'thick' });
    const blurView = json.children[0];
    expect(blurView.props.intensity).toBe(GLASS.materials.thick.blur); // 80
  });

  it('sets BlurView tint to "dark" when isDark is true', () => {
    const json = renderCard();
    const blurView = json.children[0];
    expect(blurView.props.tint).toBe('dark');
  });

  it('sets BlurView tint to "light" when isDark is false', () => {
    mockUseTheme.mockReturnValue({
      isDark: false,
      colors: { background: '#fff', text: '#000' },
    });
    const json = renderCard();
    const blurView = json.children[0];
    expect(blurView.props.tint).toBe('light');
  });

  it('applies containerStyle with borderRadius, overflow, border, and shadow on outer View', () => {
    const json = renderCard({ borderRadius: 20, shadow: 'elevated', bordered: true });
    const style = json.props.style;
    // style is an array: [containerStyle, customStyle]
    const containerStyle = style[0];
    expect(containerStyle.borderRadius).toBe(20);
    expect(containerStyle.overflow).toBe('hidden');
    expect(containerStyle.borderWidth).toBe(1);
    expect(containerStyle.shadowOpacity).toBe(SHADOWS.elevated.shadowOpacity);
  });

  it('applies custom style as second element in style array on outer View', () => {
    const json = renderCard({ style: { marginTop: 42 } });
    const styleArr = json.props.style;
    expect(styleArr[1]).toEqual({ marginTop: 42 });
  });

  it('wraps children inside blurContent View with padding and backgroundColor', () => {
    const json = renderCard({ padding: 32 });
    const blurView = json.children[0];
    const contentView = blurView.children[0];
    // contentView style is an array: [styles.blurContent, contentStyle, { backgroundColor }]
    const styles = contentView.props.style;
    // styles.blurContent = { flex: 1 }
    expect(styles[0]).toEqual({ flex: 1 });
    // contentStyle = { padding: 32 }
    expect(styles[1]).toEqual({ padding: 32 });
    // backgroundColor is computed from material opacity
    expect(styles[2].backgroundColor).toBeDefined();
  });

  it('computes dark theme backgroundColor as rgba(255,255,255, opacity*0.25)', () => {
    // regular material: opacity = 0.35
    const json = renderCard({ material: 'regular' });
    const contentView = json.children[0].children[0];
    const bg = contentView.props.style[2].backgroundColor;
    const expected = `rgba(255, 255, 255, ${0.35 * 0.25})`;
    expect(bg).toBe(expected);
  });

  it('computes light theme backgroundColor as rgba(255,255,255, opacity*1.5)', () => {
    mockUseTheme.mockReturnValue({
      isDark: false,
      colors: { background: '#fff', text: '#000' },
    });
    const json = renderCard({ material: 'regular' });
    const contentView = json.children[0].children[0];
    const bg = contentView.props.style[2].backgroundColor;
    const expected = `rgba(255, 255, 255, ${0.35 * 1.5})`;
    expect(bg).toBe(expected);
  });

  it('renders children text content inside BlurView content wrapper', () => {
    const json = renderCard();
    const contentView = json.children[0].children[0];
    // Children are the Fragment + text
    expect(JSON.stringify(contentView.children)).toContain('Test Content');
  });
});

// =============================================================================
// 2. RENDER PATH: Plain View fallback (useBlur=false or Android)
// =============================================================================

describe('GlassCard - Plain View fallback (useBlur=false or Android)', () => {
  it('renders plain View (no BlurView) when useBlur is false on iOS', () => {
    const json = renderCard({ useBlur: false });
    expect(json.type).toBe('View');
    // No BlurView child - first child should be the content View
    expect(json.children[0].type).toBe('View');
    // Make sure it is NOT a BlurView
    expect(json.children[0].type).not.toBe('BlurView');
  });

  it('renders plain View when Platform is android', () => {
    (Platform as any).OS = 'android';
    const json = renderCard();
    expect(json.type).toBe('View');
    // Should be the content View directly, not BlurView
    const firstChild = json.children[0];
    expect(firstChild.type).toBe('View');
  });

  it('applies backgroundColor directly on outer View for plain fallback', () => {
    const json = renderCard({ useBlur: false });
    const styleArr = json.props.style;
    // style array: [containerStyle, { backgroundColor }, customStyle]
    const bgStyle = styleArr[1];
    expect(bgStyle.backgroundColor).toBeDefined();
  });

  it('applies padding on inner content View for plain fallback', () => {
    const json = renderCard({ useBlur: false, padding: 44 });
    const contentView = json.children[0];
    expect(contentView.props.style).toEqual({ padding: 44 });
  });

  it('applies custom style as third element in style array for plain fallback', () => {
    const json = renderCard({ useBlur: false, style: { flex: 1 } });
    const styleArr = json.props.style;
    expect(styleArr[2]).toEqual({ flex: 1 });
  });
});

// =============================================================================
// 3. RENDER PATH: LiquidGlassView (iOS 26+, isLiquidGlassSupported=true)
// =============================================================================

describe('GlassCard - LiquidGlassView path (iOS 26+)', () => {
  beforeEach(() => {
    mockIsLiquidGlassSupported = true;
    (Platform as any).OS = 'ios';
  });

  it('renders LiquidGlassView when isLiquidGlassSupported is true on iOS', () => {
    const json = renderCard();
    expect(json.type).toBe('LiquidGlassView');
  });

  it('passes effect="regular" for regular, thick, and chrome materials', () => {
    for (const mat of ['regular', 'thick', 'chrome'] as const) {
      const json = renderCard({ material: mat });
      expect(json.props.effect).toBe('regular');
    }
  });

  it('passes effect="clear" for ultraThin and thin materials', () => {
    for (const mat of ['ultraThin', 'thin'] as const) {
      const json = renderCard({ material: mat });
      expect(json.props.effect).toBe('clear');
    }
  });

  it('passes interactive prop through to LiquidGlassView', () => {
    const json = renderCard({ interactive: true });
    expect(json.props.interactive).toBe(true);

    const json2 = renderCard({ interactive: false });
    expect(json2.props.interactive).toBe(false);
  });

  it('uses custom tintColor when provided', () => {
    const json = renderCard({ tintColor: 'rgba(255,0,0,0.5)' });
    expect(json.props.tintColor).toBe('rgba(255,0,0,0.5)');
  });

  it('computes default dark tintColor as rgba(255,255,255, opacity*0.15)', () => {
    // regular material opacity = 0.35
    const json = renderCard({ material: 'regular' });
    const expected = `rgba(255, 255, 255, ${0.35 * 0.15})`;
    expect(json.props.tintColor).toBe(expected);
  });

  it('computes default light tintColor as rgba(100,150,200, opacity*0.2)', () => {
    mockUseTheme.mockReturnValue({
      isDark: false,
      colors: { background: '#fff', text: '#000' },
    });
    const json = renderCard({ material: 'regular' });
    const expected = `rgba(100, 150, 200, ${0.35 * 0.2})`;
    expect(json.props.tintColor).toBe(expected);
  });

  it('passes colorScheme="dark" when isDark is true', () => {
    const json = renderCard();
    expect(json.props.colorScheme).toBe('dark');
  });

  it('passes colorScheme="light" when isDark is false', () => {
    mockUseTheme.mockReturnValue({
      isDark: false,
      colors: { background: '#fff', text: '#000' },
    });
    const json = renderCard();
    expect(json.props.colorScheme).toBe('light');
  });

  it('applies containerStyle, padding, and custom style in style array', () => {
    const json = renderCard({ borderRadius: 30, padding: 10, style: { opacity: 0.8 } });
    const styleArr = json.props.style;
    // [containerStyle, { padding }, customStyle]
    expect(styleArr[0].borderRadius).toBe(30);
    expect(styleArr[1]).toEqual({ padding: 10 });
    expect(styleArr[2]).toEqual({ opacity: 0.8 });
  });

  it('does NOT add borderWidth when isLiquidGlassSupported is true (even if bordered=true)', () => {
    const json = renderCard({ bordered: true });
    const containerStyle = json.props.style[0];
    expect(containerStyle.borderWidth).toBeUndefined();
  });

  it('does NOT render LiquidGlassView on Android even when isLiquidGlassSupported is true', () => {
    (Platform as any).OS = 'android';
    const json = renderCard();
    // Falls through to plain View fallback
    expect(json.type).toBe('View');
  });

  it('renders children inside LiquidGlassView', () => {
    const json = renderCard();
    expect(JSON.stringify(json.children)).toContain('Test Content');
  });
});

// =============================================================================
// 4. BORDERED PROP
// =============================================================================

describe('GlassCard - bordered prop', () => {
  it('adds borderWidth and borderColor when bordered=true and not LiquidGlass', () => {
    const json = renderCard({ bordered: true });
    // BlurView path: outer View has containerStyle
    const containerStyle = json.props.style[0];
    expect(containerStyle.borderWidth).toBe(1);
    expect(containerStyle.borderColor).toBeDefined();
  });

  it('does NOT add borderWidth when bordered=false', () => {
    const json = renderCard({ bordered: false });
    const containerStyle = json.props.style[0];
    expect(containerStyle.borderWidth).toBeUndefined();
    expect(containerStyle.borderColor).toBeUndefined();
  });

  it('computes dark border color as rgba(255,255,255, opacity*0.4)', () => {
    // regular: opacity = 0.35
    const json = renderCard({ material: 'regular', bordered: true });
    const containerStyle = json.props.style[0];
    expect(containerStyle.borderColor).toBe(`rgba(255, 255, 255, ${0.35 * 0.4})`);
  });

  it('computes light border color as rgba(0,0,0, opacity*0.15)', () => {
    mockUseTheme.mockReturnValue({
      isDark: false,
      colors: { background: '#fff', text: '#000' },
    });
    const json = renderCard({ material: 'regular', bordered: true });
    const containerStyle = json.props.style[0];
    expect(containerStyle.borderColor).toBe(`rgba(0, 0, 0, ${0.35 * 0.15})`);
  });
});

// =============================================================================
// 5. MATERIAL TYPES - verify each material's blur/opacity values are used
// =============================================================================

describe('GlassCard - all material types', () => {
  const materials = ['ultraThin', 'thin', 'regular', 'thick', 'chrome'] as const;

  materials.forEach((mat) => {
    const { blur, opacity } = GLASS.materials[mat];

    it(`material="${mat}" uses blur=${blur} in BlurView`, () => {
      const json = renderCard({ material: mat });
      const blurView = json.children[0];
      expect(blurView.props.intensity).toBe(blur);
    });

    it(`material="${mat}" computes correct dark backgroundColor (opacity=${opacity})`, () => {
      const json = renderCard({ material: mat });
      const contentView = json.children[0].children[0];
      const bg = contentView.props.style[2].backgroundColor;
      expect(bg).toBe(`rgba(255, 255, 255, ${opacity * 0.25})`);
    });

    it(`material="${mat}" computes correct light backgroundColor`, () => {
      mockUseTheme.mockReturnValue({
        isDark: false,
        colors: { background: '#fff', text: '#000' },
      });
      const json = renderCard({ material: mat });
      const contentView = json.children[0].children[0];
      const bg = contentView.props.style[2].backgroundColor;
      expect(bg).toBe(`rgba(255, 255, 255, ${opacity * 1.5})`);
    });
  });
});

// =============================================================================
// 6. SHADOW TYPES - verify all shadow presets are applied
// =============================================================================

describe('GlassCard - shadow types', () => {
  const shadowTypes = ['none', 'subtle', 'standard', 'elevated', 'floating', 'glass'] as const;

  shadowTypes.forEach((shadowName) => {
    it(`applies "${shadowName}" shadow style on container`, () => {
      const json = renderCard({ shadow: shadowName });
      const containerStyle = json.props.style[0];
      const expected = SHADOWS[shadowName];
      expect(containerStyle.shadowColor).toBe(expected.shadowColor);
      expect(containerStyle.shadowOpacity).toBe(expected.shadowOpacity);
      expect(containerStyle.shadowRadius).toBe(expected.shadowRadius);
      expect(containerStyle.elevation).toBe(expected.elevation);
    });
  });
});

// =============================================================================
// 7. DEFAULT PROP VALUES
// =============================================================================

describe('GlassCard - default prop values', () => {
  it('defaults borderRadius to RADIUS.lg (24)', () => {
    const json = renderCard();
    const containerStyle = json.props.style[0];
    expect(containerStyle.borderRadius).toBe(RADIUS.lg);
  });

  it('defaults padding to SPACING.lg (24)', () => {
    const json = renderCard();
    const blurView = json.children[0];
    const contentView = blurView.children[0];
    expect(contentView.props.style[1]).toEqual({ padding: SPACING.lg });
  });

  it('defaults shadow to "subtle"', () => {
    const json = renderCard();
    const containerStyle = json.props.style[0];
    expect(containerStyle.shadowOpacity).toBe(SHADOWS.subtle.shadowOpacity);
    expect(containerStyle.shadowRadius).toBe(SHADOWS.subtle.shadowRadius);
  });

  it('defaults material to "regular" (blur=60)', () => {
    const json = renderCard();
    const blurView = json.children[0];
    expect(blurView.props.intensity).toBe(GLASS.materials.regular.blur);
  });

  it('defaults bordered to true (border applied)', () => {
    const json = renderCard();
    const containerStyle = json.props.style[0];
    expect(containerStyle.borderWidth).toBe(1);
  });

  it('defaults interactive to false', () => {
    mockIsLiquidGlassSupported = true;
    const json = renderCard();
    expect(json.props.interactive).toBe(false);
  });

  it('defaults useBlur to true (BlurView rendered on iOS)', () => {
    const json = renderCard();
    expect(json.children[0].type).toBe('BlurView');
  });
});

// =============================================================================
// 8. useTheme HOOK INTEGRATION
// =============================================================================

describe('GlassCard - useTheme integration', () => {
  it('calls useTheme exactly once per render', () => {
    renderCard();
    expect(mockUseTheme).toHaveBeenCalledTimes(1);
  });

  it('uses isDark from useTheme to compute backgroundColor', () => {
    // dark theme: rgba(255,255,255, opacity*0.25)
    const darkJson = renderCard({ material: 'thin' });
    const darkBg = darkJson.children[0].children[0].props.style[2].backgroundColor;
    expect(darkBg).toBe(`rgba(255, 255, 255, ${0.25 * 0.25})`);

    // light theme: rgba(255,255,255, opacity*1.5)
    mockUseTheme.mockReturnValue({
      isDark: false,
      colors: { background: '#fff', text: '#000' },
    });
    const lightJson = renderCard({ material: 'thin' });
    const lightBg = lightJson.children[0].children[0].props.style[2].backgroundColor;
    expect(lightBg).toBe(`rgba(255, 255, 255, ${0.25 * 1.5})`);
  });
});

// =============================================================================
// 9. EXPORT STRUCTURE
// =============================================================================

describe('GlassCard - exports', () => {
  it('exports GlassCard as a named export', () => {
    expect(typeof GlassCard).toBe('function');
  });

  it('exports GlassCard as default export', () => {
    const defaultExport = require('../GlassCard').default;
    expect(defaultExport).toBe(GlassCard);
  });
});
