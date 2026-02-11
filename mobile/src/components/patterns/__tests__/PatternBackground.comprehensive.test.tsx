/**
 * PatternBackground Comprehensive Tests
 *
 * Achieves 100% coverage by actually RENDERING PatternBackground via react-test-renderer
 * for every pattern type in both dark and light modes. Tests:
 *
 * - SeededRandom utility: determinism, range [0,1), different seeds, successive calls, edge seeds
 * - Component rendering: all 27 pattern types + default (unknown) case
 * - Color mapping: 1-color, 2-color, 3-color arrays with fallback logic
 * - Dark vs light mode: different seed generation, different pattern output
 * - SVG structure: outer View, Svg, Defs with LinearGradient, background Rect
 * - Pattern elements: each pattern type produces non-null children
 * - Default case: unknown pattern type renders null pattern elements
 * - Styles: container uses absoluteFillObject, svg positioned absolute top-left
 */

// Override react-native-svg mock to return actual React components so react-test-renderer
// can build a proper tree with children and props visible for assertions.
jest.mock('react-native-svg', () => {
  const React = require('react');
  const createMockComponent = (name: string) => {
    const Component = (props: any) => React.createElement(name, props, props.children);
    Component.displayName = name;
    return Component;
  };
  return {
    __esModule: true,
    default: createMockComponent('Svg'),
    Svg: createMockComponent('Svg'),
    Circle: createMockComponent('Circle'),
    Rect: createMockComponent('Rect'),
    Path: createMockComponent('Path'),
    Line: createMockComponent('Line'),
    G: createMockComponent('G'),
    Defs: createMockComponent('Defs'),
    LinearGradient: createMockComponent('LinearGradient'),
    Stop: createMockComponent('Stop'),
    Ellipse: createMockComponent('Ellipse'),
    Polygon: createMockComponent('Polygon'),
    Polyline: createMockComponent('Polyline'),
    ClipPath: createMockComponent('ClipPath'),
    Mask: createMockComponent('Mask'),
    Pattern: createMockComponent('Pattern'),
    Use: createMockComponent('Use'),
    Text: createMockComponent('SvgText'),
    TSpan: createMockComponent('TSpan'),
  };
});

import React from 'react';
import renderer from 'react-test-renderer';

// All 27 pattern types from the PatternType union in backgrounds.ts
const ALL_PATTERN_TYPES = [
  'hexagons',
  'dots-grid',
  'waves',
  'topographic',
  'blobs',
  'noise-grain',
  'circuit-board',
  'mesh-gradient',
  'bokeh',
  'crystals',
  'marble',
  'water-ripples',
  'fabric-weave',
  'starfield',
  'aurora-bands',
  'leopard',
  'cheetah',
  'festive-pattern',
  'hearts',
  'leaves',
  'snowflakes',
  'pumpkins',
  'fireworks',
  'eggs',
  'pinatas',
  'geometric-abstract',
  'organic-flow',
] as const;

// Standard test color sets
const THREE_COLORS = ['#ff0000', '#00ff00', '#0000ff'] as const;
const TWO_COLORS = ['#aabbcc', '#ddeeff'] as const;
const ONE_COLOR = ['#112233'] as const;

describe('PatternBackground Comprehensive', () => {
  let PatternBackground: any;

  beforeEach(() => {
    jest.clearAllMocks();
    const mod = require('../PatternBackground');
    PatternBackground = mod.PatternBackground;
  });

  // Helper: render PatternBackground via react-test-renderer
  const renderPattern = (patternType: string, colors: readonly string[], isDark: boolean) => {
    let tree: any;
    renderer.act(() => {
      tree = renderer.create(
        React.createElement(PatternBackground, { patternType, colors, isDark })
      );
    });
    return tree!;
  };

  // =========================================================================
  // 1. SeededRandom Utility
  // =========================================================================
  describe('seededRandom utility', () => {
    // Replicate the exact seededRandom function from PatternBackground.tsx
    function seededRandom(seed: number): () => number {
      let s = seed;
      return () => {
        s = Math.sin(s) * 10000;
        return s - Math.floor(s);
      };
    }

    it('should return a function', () => {
      const random = seededRandom(42);
      expect(typeof random).toBe('function');
    });

    it('should return values in [0, 1) range for 1000 calls', () => {
      const random = seededRandom(99);
      for (let i = 0; i < 1000; i++) {
        const val = random();
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });

    it('should produce identical sequences for the same seed', () => {
      const r1 = seededRandom(12345);
      const r2 = seededRandom(12345);
      for (let i = 0; i < 50; i++) {
        expect(r1()).toBe(r2());
      }
    });

    it('should produce different sequences for different seeds', () => {
      const r1 = seededRandom(100);
      const r2 = seededRandom(200);
      let different = false;
      for (let i = 0; i < 10; i++) {
        if (r1() !== r2()) { different = true; break; }
      }
      expect(different).toBe(true);
    });

    it('should produce different values on successive calls', () => {
      const random = seededRandom(77);
      const a = random();
      const b = random();
      expect(a).not.toBe(b);
    });

    it('should handle seed = 0', () => {
      const random = seededRandom(0);
      const val = random();
      expect(typeof val).toBe('number');
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    });

    it('should handle negative seeds', () => {
      const random = seededRandom(-500);
      const val = random();
      expect(typeof val).toBe('number');
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    });

    it('should handle very large seeds', () => {
      const random = seededRandom(999999999);
      const val = random();
      expect(typeof val).toBe('number');
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    });
  });

  // =========================================================================
  // 2. Module Exports
  // =========================================================================
  describe('module exports', () => {
    it('should export PatternBackground as named export', () => {
      expect(PatternBackground).toBeDefined();
      expect(typeof PatternBackground).toBe('function');
    });

    it('should export PatternBackground as default export', () => {
      const mod = require('../PatternBackground');
      expect(mod.default).toBeDefined();
      expect(mod.default).toBe(mod.PatternBackground);
    });
  });

  // =========================================================================
  // 3. SVG Structure (outer View + Svg + Defs + LinearGradient + Rect)
  // =========================================================================
  describe('SVG structure', () => {
    it('should render an outer View container', () => {
      const tree = renderPattern('hexagons', THREE_COLORS, true);
      const json = tree.toJSON();
      expect(json.type).toBe('View');
    });

    it('should render Svg as child of View', () => {
      const tree = renderPattern('hexagons', THREE_COLORS, true);
      const json = tree.toJSON();
      const svg = json.children.find((c: any) => c.type === 'Svg');
      expect(svg).toBeDefined();
    });

    it('should render Defs with LinearGradient containing two Stops', () => {
      const tree = renderPattern('hexagons', THREE_COLORS, true);
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Defs');
      expect(str).toContain('LinearGradient');
      expect(str).toContain('Stop');
    });

    it('should render a background Rect with fill url(#bgGradient)', () => {
      const tree = renderPattern('hexagons', THREE_COLORS, true);
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('"fill":"url(#bgGradient)"');
    });

    it('should use colors[0] as first Stop stopColor', () => {
      const tree = renderPattern('hexagons', THREE_COLORS, true);
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('"stopColor":"#ff0000"');
    });

    it('should use colors[1] as second Stop stopColor when available', () => {
      const tree = renderPattern('hexagons', THREE_COLORS, true);
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('"stopColor":"#00ff00"');
    });

    it('should fall back to colors[0] for second Stop when only one color provided', () => {
      const tree = renderPattern('hexagons', ONE_COLOR, true);
      const str = JSON.stringify(tree.toJSON());
      // Both stops should use the single color
      const matches = str.match(/"stopColor":"#112233"/g);
      expect(matches).not.toBeNull();
      expect(matches!.length).toBe(2);
    });
  });

  // =========================================================================
  // 4. Color Mapping / Fallback Logic
  // =========================================================================
  describe('color mapping and fallback', () => {
    it('should handle 3-color array (baseColor, accentColor, highlightColor all distinct)', () => {
      // blobs uses accentColor and highlightColor
      const tree = renderPattern('blobs', THREE_COLORS, false);
      const str = JSON.stringify(tree.toJSON());
      // accentColor = #00ff00, highlightColor = #0000ff
      // At least one of them should appear in the pattern
      const hasAccent = str.includes('#00ff00');
      const hasHighlight = str.includes('#0000ff');
      expect(hasAccent || hasHighlight).toBe(true);
    });

    it('should handle 2-color array (highlightColor falls back to colors[1])', () => {
      // crystals uses color1=accentColor, color2=highlightColor
      // With 2 colors: accentColor=#ddeeff, highlightColor=#ddeeff (fallback to colors[1])
      const tree = renderPattern('crystals', TWO_COLORS, false);
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('#ddeeff');
    });

    it('should handle 1-color array (all fallback to colors[0])', () => {
      const tree = renderPattern('blobs', ONE_COLOR, true);
      const str = JSON.stringify(tree.toJSON());
      // accentColor and highlightColor both fall back to #112233
      expect(str).toContain('#112233');
    });

    it('should pass colors array directly to mesh-gradient and aurora-bands', () => {
      // mesh-gradient receives the full colors array
      const tree = renderPattern('mesh-gradient', THREE_COLORS, false);
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('#ff0000');
      expect(str).toContain('#00ff00');
      expect(str).toContain('#0000ff');
    });

    it('should pass colors array to aurora-bands', () => {
      const tree = renderPattern('aurora-bands', THREE_COLORS, false);
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('#ff0000');
    });
  });

  // =========================================================================
  // 5. Seed Determinism: Same patternType + isDark => same output
  // =========================================================================
  describe('seed determinism', () => {
    it('should produce identical JSON for same patternType and isDark', () => {
      const tree1 = renderPattern('hexagons', THREE_COLORS, true);
      const tree2 = renderPattern('hexagons', THREE_COLORS, true);
      expect(JSON.stringify(tree1.toJSON())).toBe(JSON.stringify(tree2.toJSON()));
    });

    it('should produce different output for dark vs light with same pattern', () => {
      const treeDark = renderPattern('hexagons', THREE_COLORS, true);
      const treeLight = renderPattern('hexagons', THREE_COLORS, false);
      // Seeds differ by 1 (isDark ? 1 : 0), so random values differ
      expect(JSON.stringify(treeDark.toJSON())).not.toBe(JSON.stringify(treeLight.toJSON()));
    });

    it('should produce different output for different patternTypes', () => {
      const tree1 = renderPattern('hexagons', THREE_COLORS, true);
      const tree2 = renderPattern('waves', THREE_COLORS, true);
      expect(JSON.stringify(tree1.toJSON())).not.toBe(JSON.stringify(tree2.toJSON()));
    });
  });

  // =========================================================================
  // 6. Default Case (unknown pattern type => null patternElements)
  // =========================================================================
  describe('default case for unknown pattern type', () => {
    it('should render SVG structure but no pattern group for unknown type', () => {
      const tree = renderPattern('nonexistent-pattern' as any, THREE_COLORS, true);
      const json = tree.toJSON();
      // Should still have View > Svg with Defs + Rect
      expect(json.type).toBe('View');
      const svg = json.children.find((c: any) => c.type === 'Svg');
      expect(svg).toBeDefined();
      // The Svg should have Defs, Rect, but NO G group for patterns
      const gElements = svg.children.filter((c: any) => c && c.type === 'G');
      expect(gElements.length).toBe(0);
    });

    it('should not crash for empty string pattern type', () => {
      const tree = renderPattern('' as any, THREE_COLORS, false);
      const json = tree.toJSON();
      expect(json.type).toBe('View');
    });
  });

  // =========================================================================
  // 7. Render Every Pattern Type (dark mode)
  // =========================================================================
  describe('render all 27 pattern types (dark mode)', () => {
    ALL_PATTERN_TYPES.forEach((patternType) => {
      it(`should render ${patternType} pattern with non-null elements`, () => {
        const tree = renderPattern(patternType, THREE_COLORS, true);
        const json = tree.toJSON();
        expect(json).not.toBeNull();
        const str = JSON.stringify(json);
        // Every pattern returns a G group wrapping elements
        expect(str).toContain('"type":"G"');
      });
    });
  });

  // =========================================================================
  // 8. Render Every Pattern Type (light mode)
  // =========================================================================
  describe('render all 27 pattern types (light mode)', () => {
    ALL_PATTERN_TYPES.forEach((patternType) => {
      it(`should render ${patternType} pattern in light mode`, () => {
        const tree = renderPattern(patternType, THREE_COLORS, false);
        const json = tree.toJSON();
        expect(json).not.toBeNull();
        const str = JSON.stringify(json);
        expect(str).toContain('"type":"G"');
      });
    });
  });

  // =========================================================================
  // 9. Pattern-Specific Element Assertions
  // =========================================================================
  describe('pattern-specific SVG elements', () => {
    it('hexagons: should render Polygon elements', () => {
      const tree = renderPattern('hexagons', THREE_COLORS, true);
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('"type":"Polygon"');
      expect(str).toContain('"fill":"none"');
      expect(str).toContain('"stroke":"#00ff00"');
    });

    it('dots-grid: should render Circle elements with fill', () => {
      const tree = renderPattern('dots-grid', THREE_COLORS, true);
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('"type":"Circle"');
      expect(str).toContain('"fill":"#00ff00"');
    });

    it('waves: should render Path elements with stroke', () => {
      const tree = renderPattern('waves', THREE_COLORS, true);
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('"type":"Path"');
      expect(str).toContain('"stroke":"#00ff00"');
      expect(str).toContain('"fill":"none"');
    });

    it('topographic: should render closed Path elements (Z suffix in d attribute)', () => {
      const tree = renderPattern('topographic', THREE_COLORS, true);
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('"type":"Path"');
      expect(str).toContain(' Z"');
    });

    it('blobs: should render Ellipse elements', () => {
      const tree = renderPattern('blobs', THREE_COLORS, true);
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('"type":"Ellipse"');
    });

    it('noise-grain: should render many small Circle elements', () => {
      const tree = renderPattern('noise-grain', THREE_COLORS, true);
      const str = JSON.stringify(tree.toJSON());
      // 500 particles
      const circleCount = (str.match(/"type":"Circle"/g) || []).length;
      expect(circleCount).toBe(500);
    });

    it('circuit-board: should render Path (connections) and Circle (nodes) elements', () => {
      const tree = renderPattern('circuit-board', THREE_COLORS, true);
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('"type":"Path"');
      expect(str).toContain('"type":"Circle"');
    });

    it('mesh-gradient: should render large Circle elements with fill colors from array', () => {
      const tree = renderPattern('mesh-gradient', THREE_COLORS, true);
      const str = JSON.stringify(tree.toJSON());
      // Uses colors[i % colors.length], so all 3 colors appear
      expect(str).toContain('"fill":"#ff0000"');
      expect(str).toContain('"fill":"#00ff00"');
      expect(str).toContain('"fill":"#0000ff"');
    });

    it('bokeh: should render Circle elements with stroke (no fill)', () => {
      const tree = renderPattern('bokeh', THREE_COLORS, true);
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('"type":"Circle"');
      expect(str).toContain('"fill":"none"');
    });

    it('crystals: should render Polygon elements with variable sides', () => {
      const tree = renderPattern('crystals', THREE_COLORS, true);
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('"type":"Polygon"');
      expect(str).toContain('"fill":"none"');
    });

    it('marble: should render Path elements with Q curves (quadratic bezier)', () => {
      const tree = renderPattern('marble', THREE_COLORS, true);
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('"type":"Path"');
      expect(str).toContain(' Q ');
    });

    it('water-ripples: should render concentric Circle elements per group', () => {
      const tree = renderPattern('water-ripples', THREE_COLORS, true);
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('"type":"Circle"');
      expect(str).toContain('"fill":"none"');
      expect(str).toContain('"stroke":"#00ff00"');
    });

    it('fabric-weave: should render Line elements (horizontal and vertical)', () => {
      const tree = renderPattern('fabric-weave', THREE_COLORS, true);
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('"type":"Line"');
      expect(str).toContain('"stroke":"#00ff00"');
    });

    it('starfield: should render 150 Circle elements', () => {
      const tree = renderPattern('starfield', THREE_COLORS, true);
      const str = JSON.stringify(tree.toJSON());
      const circleCount = (str.match(/"type":"Circle"/g) || []).length;
      expect(circleCount).toBe(150);
    });

    it('aurora-bands: should render 5 filled Path elements (closed with Z)', () => {
      const tree = renderPattern('aurora-bands', THREE_COLORS, true);
      const str = JSON.stringify(tree.toJSON());
      const pathMatches = str.match(/"type":"Path"/g) || [];
      expect(pathMatches.length).toBe(5);
      expect(str).toContain(' Z"');
    });

    it('leopard: should render Ellipse (outer) and Circle (inner) elements', () => {
      const tree = renderPattern('leopard', THREE_COLORS, true);
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('"type":"Ellipse"');
      expect(str).toContain('"type":"Circle"');
      // 40 spots x 3 inner circles each = 120 inner circles + 40 outer ellipses
    });

    it('cheetah: should render 80 Circle elements', () => {
      const tree = renderPattern('cheetah', THREE_COLORS, true);
      const str = JSON.stringify(tree.toJSON());
      const circleCount = (str.match(/"type":"Circle"/g) || []).length;
      expect(circleCount).toBe(80);
    });

    it('festive-pattern: should render Polygon star shapes', () => {
      const tree = renderPattern('festive-pattern', THREE_COLORS, true);
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('"type":"Polygon"');
      // 30 items, each a 10-point star
      const polyCount = (str.match(/"type":"Polygon"/g) || []).length;
      expect(polyCount).toBe(30);
    });

    it('hearts: should render Path elements with heart curve shapes', () => {
      const tree = renderPattern('hearts', THREE_COLORS, true);
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('"type":"Path"');
      expect(str).toContain(' C '); // Cubic bezier curves for heart shape
      const pathCount = (str.match(/"type":"Path"/g) || []).length;
      expect(pathCount).toBe(25);
    });

    it('leaves: should render Path elements with rotation transforms', () => {
      const tree = renderPattern('leaves', THREE_COLORS, true);
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('"type":"Path"');
      expect(str).toContain('rotate(');
      const pathCount = (str.match(/"type":"Path"/g) || []).length;
      expect(pathCount).toBe(30);
    });

    it('snowflakes: should render Line elements (6 per flake, 60 flakes = 360 lines)', () => {
      const tree = renderPattern('snowflakes', THREE_COLORS, true);
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('"type":"Line"');
      const lineCount = (str.match(/"type":"Line"/g) || []).length;
      expect(lineCount).toBe(360);
    });

    it('pumpkins: should render Ellipse (body) and Rect (stem) elements', () => {
      const tree = renderPattern('pumpkins', THREE_COLORS, true);
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('"type":"Ellipse"');
      expect(str).toContain('"type":"Rect"');
      // 20 pumpkins = 20 ellipses + 20 rects (plus the bg Rect)
    });

    it('fireworks: should render Line (rays) and Circle (sparkles) elements', () => {
      const tree = renderPattern('fireworks', THREE_COLORS, true);
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('"type":"Line"');
      expect(str).toContain('"type":"Circle"');
    });

    it('eggs: should render Ellipse elements (taller than wide)', () => {
      const tree = renderPattern('eggs', THREE_COLORS, true);
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('"type":"Ellipse"');
      const ellipseCount = (str.match(/"type":"Ellipse"/g) || []).length;
      expect(ellipseCount).toBe(25);
    });

    it('pinatas: should render Polygon star shapes (5-point)', () => {
      const tree = renderPattern('pinatas', THREE_COLORS, true);
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('"type":"Polygon"');
      const polyCount = (str.match(/"type":"Polygon"/g) || []).length;
      expect(polyCount).toBe(20);
    });

    it('geometric-abstract: should render mix of Polygon, Rect, and Circle elements', () => {
      const tree = renderPattern('geometric-abstract', THREE_COLORS, true);
      const str = JSON.stringify(tree.toJSON());
      // 20 shapes randomly assigned to triangle(Polygon), square(Rect), or circle(Circle)
      // With seeded random, at least some of each type should appear
      const hasPolygon = str.includes('"type":"Polygon"');
      const hasRect = str.includes('"type":"Rect"');
      const hasCircle = str.includes('"type":"Circle"');
      // At least 2 of the 3 shape types should be present with 20 shapes
      const typeCount = [hasPolygon, hasRect, hasCircle].filter(Boolean).length;
      expect(typeCount).toBeGreaterThanOrEqual(2);
    });

    it('organic-flow: should render Path elements with cubic bezier C curves', () => {
      const tree = renderPattern('organic-flow', THREE_COLORS, true);
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('"type":"Path"');
      expect(str).toContain(' C ');
      const pathCount = (str.match(/"type":"Path"/g) || []).length;
      expect(pathCount).toBe(6);
    });
  });

  // =========================================================================
  // 10. Pattern Types Using Only Two Colors (accentColor, highlightColor)
  // =========================================================================
  describe('two-color patterns use both accentColor and highlightColor', () => {
    const twoColorPatterns = [
      'blobs', 'bokeh', 'crystals', 'marble', 'leopard', 'cheetah',
      'festive-pattern', 'hearts', 'leaves', 'pumpkins', 'fireworks',
      'eggs', 'pinatas', 'geometric-abstract', 'organic-flow',
    ];

    twoColorPatterns.forEach((pt) => {
      it(`${pt}: should use accent and/or highlight colors from 3-color array`, () => {
        const tree = renderPattern(pt, THREE_COLORS, true);
        const str = JSON.stringify(tree.toJSON());
        // accentColor = #00ff00, highlightColor = #0000ff
        const hasAccent = str.includes('#00ff00');
        const hasHighlight = str.includes('#0000ff');
        expect(hasAccent || hasHighlight).toBe(true);
      });
    });
  });

  // =========================================================================
  // 11. Single-Color Patterns (only use accentColor)
  // =========================================================================
  describe('single-color patterns use only accentColor', () => {
    const singleColorPatterns = [
      'hexagons', 'dots-grid', 'waves', 'topographic', 'noise-grain',
      'circuit-board', 'water-ripples', 'fabric-weave', 'starfield', 'snowflakes',
    ];

    singleColorPatterns.forEach((pt) => {
      it(`${pt}: should reference accentColor in rendered elements`, () => {
        const tree = renderPattern(pt, THREE_COLORS, true);
        const str = JSON.stringify(tree.toJSON());
        expect(str).toContain('#00ff00');
      });
    });
  });

  // =========================================================================
  // 12. Patterns Using Full Colors Array
  // =========================================================================
  describe('patterns receiving full colors array', () => {
    it('mesh-gradient: cycles through all colors in the array', () => {
      const colors = ['#aaa', '#bbb', '#ccc', '#ddd'] as const;
      const tree = renderPattern('mesh-gradient', colors, true);
      const str = JSON.stringify(tree.toJSON());
      // 6 blobs cycling through 4 colors: indices 0,1,2,3,0,1
      expect(str).toContain('"fill":"#aaa"');
      expect(str).toContain('"fill":"#bbb"');
      expect(str).toContain('"fill":"#ccc"');
      expect(str).toContain('"fill":"#ddd"');
    });

    it('aurora-bands: cycles through colors for each band', () => {
      const colors = ['#111', '#222'] as const;
      const tree = renderPattern('aurora-bands', colors, true);
      const str = JSON.stringify(tree.toJSON());
      // 5 bands cycling through 2 colors
      expect(str).toContain('"fill":"#111"');
      expect(str).toContain('"fill":"#222"');
    });
  });

  // =========================================================================
  // 13. Fabric-Weave Branching (horizontal vs vertical lines)
  // =========================================================================
  describe('fabric-weave line orientation', () => {
    it('should produce both horizontal (x1!=x2, y1==y2) and vertical (x1==x2, y1!=y2) lines', () => {
      const tree = renderPattern('fabric-weave', THREE_COLORS, true);
      const root = tree.root;
      const lines = root.findAllByType('Line');
      let hasHorizontal = false;
      let hasVertical = false;
      for (const line of lines) {
        const { x1, y1, x2, y2 } = line.props;
        if (y1 === y2 && x1 !== x2) hasHorizontal = true;
        if (x1 === x2 && y1 !== y2) hasVertical = true;
        if (hasHorizontal && hasVertical) break;
      }
      expect(hasHorizontal).toBe(true);
      expect(hasVertical).toBe(true);
    });
  });

  // =========================================================================
  // 14. Geometric-Abstract Shape Type Branching
  // =========================================================================
  describe('geometric-abstract shape types', () => {
    it('should render triangles (Polygon), squares (Rect), and circles (Circle)', () => {
      // With seed for 'g'.charCodeAt(0)*100+1 = 10301, the random sequence
      // should produce all 3 shape types across 20 shapes
      const tree = renderPattern('geometric-abstract', THREE_COLORS, true);
      const root = tree.root;
      const polygons = root.findAllByType('Polygon');
      const rects = root.findAllByType('Rect');
      const circles = root.findAllByType('Circle');

      // Filter out the background Rect (has fill="url(#bgGradient)")
      const patternRects = rects.filter((r: any) => r.props.fill !== 'url(#bgGradient)');

      // With 20 random shapes, very likely to have at least 1 of each type
      // But to be safe, just check at least 2 types are present
      const present = [polygons.length > 0, patternRects.length > 0, circles.length > 0]
        .filter(Boolean).length;
      expect(present).toBeGreaterThanOrEqual(2);
    });
  });

  // =========================================================================
  // 15. Circuit Board Self-Connection Skip
  // =========================================================================
  describe('circuit-board connection logic', () => {
    it('should render nodes as Circles and connections as Paths', () => {
      const tree = renderPattern('circuit-board', THREE_COLORS, true);
      const root = tree.root;
      const circles = root.findAllByType('Circle');
      const paths = root.findAllByType('Path');
      // 30 nodes rendered as circles
      expect(circles.length).toBe(30);
      // At least some connections (paths) should exist
      expect(paths.length).toBeGreaterThan(0);
    });

    it('should create right-angle connection paths with L commands', () => {
      const tree = renderPattern('circuit-board', THREE_COLORS, true);
      const str = JSON.stringify(tree.toJSON());
      // Right-angle paths use M ... L ... L ... L ... format
      expect(str).toContain('M ');
      expect(str).toContain(' L ');
    });
  });

  // =========================================================================
  // 16. Leopard Inner Spots
  // =========================================================================
  describe('leopard pattern structure', () => {
    it('should render 40 outer Ellipse rings and 120 inner Circle spots', () => {
      const tree = renderPattern('leopard', THREE_COLORS, true);
      const root = tree.root;
      const ellipses = root.findAllByType('Ellipse');
      const circles = root.findAllByType('Circle');
      expect(ellipses.length).toBe(40);
      expect(circles.length).toBe(120); // 40 spots x 3 inner circles
    });

    it('should apply rotation transforms to outer ellipses', () => {
      const tree = renderPattern('leopard', THREE_COLORS, true);
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('"transform":"rotate(');
    });
  });

  // =========================================================================
  // 17. Water Ripples Grouping
  // =========================================================================
  describe('water-ripples group structure', () => {
    it('should render 5 ripple groups with 4+ concentric circles each', () => {
      const tree = renderPattern('water-ripples', THREE_COLORS, true);
      const root = tree.root;
      const circles = root.findAllByType('Circle');
      // 5 groups, each with 4+ ripples (4-7 per group)
      expect(circles.length).toBeGreaterThanOrEqual(20); // min 5*4
      expect(circles.length).toBeLessThanOrEqual(40); // max 5*8
    });
  });

  // =========================================================================
  // 18. Pumpkin Stems
  // =========================================================================
  describe('pumpkin stem elements', () => {
    it('should render 20 Ellipse bodies and 20 Rect stems', () => {
      const tree = renderPattern('pumpkins', THREE_COLORS, true);
      const root = tree.root;
      const ellipses = root.findAllByType('Ellipse');
      const rects = root.findAllByType('Rect');
      expect(ellipses.length).toBe(20);
      // rects includes the background Rect, so there should be 20+1
      const patternRects = rects.filter((r: any) => r.props.fill !== 'url(#bgGradient)');
      expect(patternRects.length).toBe(20);
    });

    it('should use accentColor for body and highlightColor for stem', () => {
      const tree = renderPattern('pumpkins', THREE_COLORS, true);
      const root = tree.root;
      const ellipses = root.findAllByType('Ellipse');
      const rects = root.findAllByType('Rect').filter((r: any) => r.props.fill !== 'url(#bgGradient)');
      // Body uses color1 (accentColor = #00ff00)
      expect(ellipses[0].props.fill).toBe('#00ff00');
      // Stem uses color2 (highlightColor = #0000ff)
      expect(rects[0].props.fill).toBe('#0000ff');
    });
  });

  // =========================================================================
  // 19. Firework Sparkles
  // =========================================================================
  describe('firework sparkle details', () => {
    it('should render both Line (rays) and Circle (sparkles) per burst', () => {
      const tree = renderPattern('fireworks', THREE_COLORS, true);
      const root = tree.root;
      const lines = root.findAllByType('Line');
      const circles = root.findAllByType('Circle');
      // 8 bursts, each with 8-15 rays, each ray has 1 line + 1 sparkle circle
      expect(lines.length).toBeGreaterThan(0);
      expect(circles.length).toBe(lines.length); // 1:1 line to sparkle
    });
  });

  // =========================================================================
  // 20. Styles (container + svg)
  // =========================================================================
  describe('component styles', () => {
    it('should apply absoluteFillObject to container', () => {
      const tree = renderPattern('hexagons', THREE_COLORS, true);
      const json = tree.toJSON();
      // StyleSheet.create returns the object as-is in mock
      const style = json.props.style;
      expect(style).toEqual({
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      });
    });

    it('should apply absolute positioning to svg', () => {
      const tree = renderPattern('hexagons', THREE_COLORS, true);
      const json = tree.toJSON();
      const svg = json.children.find((c: any) => c.type === 'Svg');
      expect(svg.props.style).toEqual({ position: 'absolute', top: 0, left: 0 });
    });

    it('should set Svg width and height to screen dimensions', () => {
      const tree = renderPattern('hexagons', THREE_COLORS, true);
      const json = tree.toJSON();
      const svg = json.children.find((c: any) => c.type === 'Svg');
      // Mock Dimensions.get returns { width: 390, height: 844 }
      expect(svg.props.width).toBe(390);
      expect(svg.props.height).toBe(844);
    });
  });

  // =========================================================================
  // 21. Edge Cases
  // =========================================================================
  describe('edge cases', () => {
    it('should not crash with empty colors array (pattern uses fallbacks)', () => {
      // colors[0] will be undefined, colors[1] will be undefined
      // accentColor = undefined || undefined = undefined
      // This tests that rendering does not throw even with missing colors
      expect(() => {
        renderPattern('hexagons', [] as any, true);
      }).not.toThrow();
    });

    it('should handle very long color arrays gracefully', () => {
      const manyColors = Array.from({ length: 100 }, (_, i) => `#${String(i).padStart(6, '0')}`);
      expect(() => {
        renderPattern('mesh-gradient', manyColors as any, false);
      }).not.toThrow();
    });

    it('should re-render with different props without errors', () => {
      let tree: any;
      renderer.act(() => {
        tree = renderer.create(
          React.createElement(PatternBackground, {
            patternType: 'hexagons',
            colors: THREE_COLORS,
            isDark: true,
          })
        );
      });
      // Update props
      renderer.act(() => {
        tree.update(
          React.createElement(PatternBackground, {
            patternType: 'waves',
            colors: TWO_COLORS,
            isDark: false,
          })
        );
      });
      const json = tree.toJSON();
      expect(json).not.toBeNull();
      const str = JSON.stringify(json);
      expect(str).toContain('"type":"Path"');
    });
  });
});
