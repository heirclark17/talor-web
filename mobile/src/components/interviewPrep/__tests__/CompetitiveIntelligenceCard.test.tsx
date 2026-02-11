/**
 * CompetitiveIntelligenceCard Unit Tests
 *
 * Uses react-test-renderer to get real useState behavior for toggle/expand
 * coverage. Tests:
 * - Loading state rendering
 * - Null intelligence returns null
 * - Full data render with all sections
 * - Expand/collapse toggle for every section
 * - ChevronUp/ChevronDown icon switching
 * - Empty arrays and missing optional fields
 * - Section content visibility when expanded vs collapsed
 */

jest.mock('../../glass/GlassCard', () => {
  const React = require('react');
  return {
    GlassCard: React.forwardRef((props: any, ref: any) =>
      React.createElement('GlassCard', { ...props, ref })
    ),
  };
});

import React from 'react';
import renderer from 'react-test-renderer';
import { CompetitiveIntelligenceCard } from '../CompetitiveIntelligenceCard';
import { CompetitiveIntelligence, ThemeColors } from '../types';
import { COLORS, ALPHA_COLORS, FONTS } from '../../../utils/constants';

// --------------- Helpers ---------------

const mockColors: ThemeColors & { backgroundTertiary?: string; textTertiary?: string } = {
  glass: 'rgba(255, 255, 255, 0.04)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  text: '#ffffff',
  textSecondary: '#9ca3af',
  textTertiary: '#6b7280',
  background: '#0a0a0a',
  backgroundSecondary: '#1a1a1a',
  backgroundTertiary: '#2a2a2a',
  border: '#374151',
};

const fullIntelligence: CompetitiveIntelligence = {
  interview_angles: ['Angle A', 'Angle B', 'Angle C'],
  market_position: 'Leader in cybersecurity SaaS',
  competitive_advantages: ['Strong brand', 'Large customer base'],
  challenges: ['Talent retention', 'Rising competition'],
  differentiation_strategy: 'Focus on AI-driven threat detection',
};

/**
 * Recursively extract all text content from a react-test-renderer JSON tree.
 */
function getTreeText(node: any): string {
  if (node === null || node === undefined) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getTreeText).join('');
  if (node.children) return node.children.map(getTreeText).join('');
  return '';
}

/**
 * Safely JSON-stringify a tree with circular-ref protection.
 */
function safeStringify(obj: any): string {
  const seen = new WeakSet();
  return JSON.stringify(obj, (_key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]';
      seen.add(value);
    }
    return value;
  });
}

/**
 * Find all nodes of a given type in a react-test-renderer instance tree.
 */
function findAllByType(root: any, type: string): any[] {
  const results: any[] = [];
  try {
    const nodes = root.findAll((node: any) => {
      try {
        return node.type === type;
      } catch {
        return false;
      }
    });
    results.push(...nodes);
  } catch {
    // no matches
  }
  return results;
}

/**
 * Find all TouchableOpacity nodes in the tree.
 */
function findTouchables(root: any): any[] {
  return findAllByType(root, 'TouchableOpacity');
}

/**
 * Render helper wrapping renderer.create inside act().
 */
function renderComponent(props: {
  intelligence: CompetitiveIntelligence | null;
  loading: boolean;
  colors: typeof mockColors;
}) {
  let tree: renderer.ReactTestRenderer;
  renderer.act(() => {
    tree = renderer.create(
      React.createElement(CompetitiveIntelligenceCard, props as any)
    );
  });
  return tree!;
}

// --------------- Tests ---------------

describe('CompetitiveIntelligenceCard', () => {
  // ===== LOADING STATE =====
  describe('Loading state', () => {
    it('renders loading indicator with correct structure', () => {
      const tree = renderComponent({
        intelligence: null as any,
        loading: true,
        colors: mockColors,
      });
      const json = tree.toJSON();
      const text = getTreeText(json);
      expect(text).toContain('Competitive Intelligence');
      // ActivityIndicator should be present
      const str = safeStringify(json);
      expect(str).toContain('ActivityIndicator');
    });

    it('renders Target icon in loading state', () => {
      const tree = renderComponent({
        intelligence: null as any,
        loading: true,
        colors: mockColors,
      });
      const str = safeStringify(tree.toJSON());
      expect(str).toContain('TargetIcon');
    });

    it('renders with warning background color on icon container', () => {
      const tree = renderComponent({
        intelligence: null as any,
        loading: true,
        colors: mockColors,
      });
      const str = safeStringify(tree.toJSON());
      expect(str).toContain(ALPHA_COLORS.warning.bg);
    });

    it('does not render section headers when loading', () => {
      const tree = renderComponent({
        intelligence: null as any,
        loading: true,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Interview Angles');
      expect(text).not.toContain('Market Position');
      expect(text).not.toContain('Competitive Advantages');
      expect(text).not.toContain('Challenges');
      expect(text).not.toContain('Differentiation Strategy');
    });

    it('applies colors.text to the title', () => {
      const tree = renderComponent({
        intelligence: null as any,
        loading: true,
        colors: mockColors,
      });
      const str = safeStringify(tree.toJSON());
      expect(str).toContain(mockColors.text);
    });

    it('uses COLORS.primary for ActivityIndicator', () => {
      const tree = renderComponent({
        intelligence: null as any,
        loading: true,
        colors: mockColors,
      });
      const str = safeStringify(tree.toJSON());
      expect(str).toContain(COLORS.primary);
    });
  });

  // ===== NULL INTELLIGENCE =====
  describe('Null intelligence (not loading)', () => {
    it('returns null when intelligence is null and not loading', () => {
      const tree = renderComponent({
        intelligence: null as any,
        loading: false,
        colors: mockColors,
      });
      expect(tree.toJSON()).toBeNull();
    });

    it('returns null when intelligence is undefined and not loading', () => {
      const tree = renderComponent({
        intelligence: undefined as any,
        loading: false,
        colors: mockColors,
      });
      expect(tree.toJSON()).toBeNull();
    });
  });

  // ===== FULL DATA RENDER =====
  describe('Full data render', () => {
    it('renders header with Competitive Intelligence title', () => {
      const tree = renderComponent({
        intelligence: fullIntelligence,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Competitive Intelligence');
    });

    it('renders subtitle text', () => {
      const tree = renderComponent({
        intelligence: fullIntelligence,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Strategic positioning and market context');
    });

    it('renders all section headers', () => {
      const tree = renderComponent({
        intelligence: fullIntelligence,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Interview Angles');
      expect(text).toContain('Market Position');
      expect(text).toContain('Competitive Advantages');
      expect(text).toContain('Challenges');
      expect(text).toContain('Differentiation Strategy');
    });

    it('renders interview angles content by default (initially expanded)', () => {
      const tree = renderComponent({
        intelligence: fullIntelligence,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Angle A');
      expect(text).toContain('Angle B');
      expect(text).toContain('Angle C');
    });

    it('does not render market position content initially (collapsed)', () => {
      const tree = renderComponent({
        intelligence: fullIntelligence,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      // Market position text should NOT appear because it is not expanded
      expect(text).not.toContain('Leader in cybersecurity SaaS');
    });

    it('does not render competitive advantages content initially', () => {
      const tree = renderComponent({
        intelligence: fullIntelligence,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Strong brand');
      expect(text).not.toContain('Large customer base');
    });

    it('does not render challenges content initially', () => {
      const tree = renderComponent({
        intelligence: fullIntelligence,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Talent retention');
      expect(text).not.toContain('Rising competition');
    });

    it('does not render differentiation strategy content initially', () => {
      const tree = renderComponent({
        intelligence: fullIntelligence,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Focus on AI-driven threat detection');
    });

    it('renders Target icon in header', () => {
      const tree = renderComponent({
        intelligence: fullIntelligence,
        loading: false,
        colors: mockColors,
      });
      const str = safeStringify(tree.toJSON());
      expect(str).toContain('TargetIcon');
    });

    it('renders all section-specific icons', () => {
      const tree = renderComponent({
        intelligence: fullIntelligence,
        loading: false,
        colors: mockColors,
      });
      const str = safeStringify(tree.toJSON());
      expect(str).toContain('LightbulbIcon');
      expect(str).toContain('TrendingUpIcon');
      expect(str).toContain('CheckCircleIcon');
      expect(str).toContain('AlertTriangleIcon');
      expect(str).toContain('AwardIcon');
    });
  });

  // ===== TOGGLE / EXPAND / COLLAPSE =====
  describe('Section toggle behavior', () => {
    it('collapses interview_angles when its header is pressed', () => {
      const tree = renderComponent({
        intelligence: fullIntelligence,
        loading: false,
        colors: mockColors,
      });

      // Initially, interview angles content is visible
      let text = getTreeText(tree.toJSON());
      expect(text).toContain('Angle A');

      // Find the Interview Angles touchable and press it
      const touchables = findTouchables(tree.root);
      const interviewAnglesTouchable = touchables.find((t: any) => {
        try {
          const nodeText = getTreeText(t.props.children);
          return false; // children may be fiber nodes
        } catch {
          return false;
        }
      });

      // Use index-based: interview_angles is the first touchable
      renderer.act(() => {
        touchables[0].props.onPress();
      });

      text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Angle A');
      expect(text).not.toContain('Angle B');
    });

    it('expands market_position when its header is pressed', () => {
      const tree = renderComponent({
        intelligence: fullIntelligence,
        loading: false,
        colors: mockColors,
      });

      // Market position is the second touchable (index 1)
      const touchables = findTouchables(tree.root);
      renderer.act(() => {
        touchables[1].props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Leader in cybersecurity SaaS');
      // interview_angles should now be collapsed
      expect(text).not.toContain('Angle A');
    });

    it('expands competitive_advantages when its header is pressed', () => {
      const tree = renderComponent({
        intelligence: fullIntelligence,
        loading: false,
        colors: mockColors,
      });

      const touchables = findTouchables(tree.root);
      // advantages is the third touchable (index 2)
      renderer.act(() => {
        touchables[2].props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Strong brand');
      expect(text).toContain('Large customer base');
    });

    it('expands challenges when its header is pressed', () => {
      const tree = renderComponent({
        intelligence: fullIntelligence,
        loading: false,
        colors: mockColors,
      });

      const touchables = findTouchables(tree.root);
      // challenges is the fourth touchable (index 3)
      renderer.act(() => {
        touchables[3].props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Talent retention');
      expect(text).toContain('Rising competition');
    });

    it('expands differentiation_strategy when its header is pressed', () => {
      const tree = renderComponent({
        intelligence: fullIntelligence,
        loading: false,
        colors: mockColors,
      });

      const touchables = findTouchables(tree.root);
      // differentiation is the fifth touchable (index 4)
      renderer.act(() => {
        touchables[4].props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Focus on AI-driven threat detection');
    });

    it('collapses a section when pressed again (toggle off)', () => {
      const tree = renderComponent({
        intelligence: fullIntelligence,
        loading: false,
        colors: mockColors,
      });

      const touchables = findTouchables(tree.root);

      // Expand market_position
      renderer.act(() => {
        touchables[1].props.onPress();
      });
      let text = getTreeText(tree.toJSON());
      expect(text).toContain('Leader in cybersecurity SaaS');

      // Re-read touchables after state change
      const touchables2 = findTouchables(tree.root);
      // Press market_position again to collapse
      renderer.act(() => {
        touchables2[1].props.onPress();
      });
      text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Leader in cybersecurity SaaS');
    });

    it('only one section is expanded at a time', () => {
      const tree = renderComponent({
        intelligence: fullIntelligence,
        loading: false,
        colors: mockColors,
      });

      // Initially interview_angles is open
      let text = getTreeText(tree.toJSON());
      expect(text).toContain('Angle A');
      expect(text).not.toContain('Strong brand');

      // Expand advantages
      const touchables = findTouchables(tree.root);
      renderer.act(() => {
        touchables[2].props.onPress();
      });

      text = getTreeText(tree.toJSON());
      expect(text).toContain('Strong brand');
      expect(text).not.toContain('Angle A');
    });
  });

  // ===== CHEVRON ICONS =====
  describe('Chevron icon display', () => {
    it('shows ChevronUp for the initially expanded section (interview_angles)', () => {
      const tree = renderComponent({
        intelligence: fullIntelligence,
        loading: false,
        colors: mockColors,
      });
      const str = safeStringify(tree.toJSON());
      // ChevronUp should appear for interview_angles
      expect(str).toContain('ChevronUpIcon');
      // ChevronDown should appear for other sections
      expect(str).toContain('ChevronDownIcon');
    });

    it('switches chevron direction after toggle', () => {
      const tree = renderComponent({
        intelligence: fullIntelligence,
        loading: false,
        colors: mockColors,
      });

      // Before: interview_angles has ChevronUp
      // Collapse interview_angles
      const touchables = findTouchables(tree.root);
      renderer.act(() => {
        touchables[0].props.onPress();
      });

      const str = safeStringify(tree.toJSON());
      // Now all sections should be collapsed -> all ChevronDown
      // Count ChevronUp - should be 0
      const upCount = (str.match(/ChevronUpIcon/g) || []).length;
      expect(upCount).toBe(0);
    });

    it('shows ChevronUp only for newly expanded section', () => {
      const tree = renderComponent({
        intelligence: fullIntelligence,
        loading: false,
        colors: mockColors,
      });

      // Expand challenges (index 3)
      const touchables = findTouchables(tree.root);
      renderer.act(() => {
        touchables[3].props.onPress();
      });

      const str = safeStringify(tree.toJSON());
      const upCount = (str.match(/ChevronUpIcon/g) || []).length;
      expect(upCount).toBe(1);
    });
  });

  // ===== PARTIAL / MISSING DATA =====
  describe('Partial and missing data', () => {
    it('renders without market_position section when field is missing', () => {
      const intel: CompetitiveIntelligence = {
        interview_angles: ['Only angle'],
      };
      const tree = renderComponent({
        intelligence: intel,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Interview Angles');
      expect(text).not.toContain('Market Position');
    });

    it('renders without competitive_advantages section when field is missing', () => {
      const intel: CompetitiveIntelligence = {
        interview_angles: ['Angle'],
      };
      const tree = renderComponent({
        intelligence: intel,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Competitive Advantages');
    });

    it('renders without competitive_advantages section when array is empty', () => {
      const intel: CompetitiveIntelligence = {
        interview_angles: ['Angle'],
        competitive_advantages: [],
      };
      const tree = renderComponent({
        intelligence: intel,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Competitive Advantages');
    });

    it('renders without challenges section when field is missing', () => {
      const intel: CompetitiveIntelligence = {
        interview_angles: ['Angle'],
      };
      const tree = renderComponent({
        intelligence: intel,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Challenges');
    });

    it('renders without challenges section when array is empty', () => {
      const intel: CompetitiveIntelligence = {
        interview_angles: ['Angle'],
        challenges: [],
      };
      const tree = renderComponent({
        intelligence: intel,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Challenges');
    });

    it('renders without differentiation_strategy section when field is missing', () => {
      const intel: CompetitiveIntelligence = {
        interview_angles: ['Angle'],
      };
      const tree = renderComponent({
        intelligence: intel,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Differentiation Strategy');
    });

    it('does not show interview angles content when array is empty', () => {
      const intel: CompetitiveIntelligence = {
        interview_angles: [],
        market_position: 'Some position',
      };
      const tree = renderComponent({
        intelligence: intel,
        loading: false,
        colors: mockColors,
      });
      // interview_angles header is always shown, but content should not appear
      // since the array is empty (length check in JSX)
      const str = safeStringify(tree.toJSON());
      // The highlight box should NOT appear for empty angles
      expect(str).not.toContain(COLORS.warning + '"}');
      // Market Position header should show
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Market Position');
    });

    it('does not show interview angles content when field is undefined', () => {
      const intel: CompetitiveIntelligence = {
        market_position: 'Some position',
      };
      const tree = renderComponent({
        intelligence: intel,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      // Header is still shown
      expect(text).toContain('Interview Angles');
      // But no angle item text content (the highlight box should not render)
      // "Interview Angles" header contains "Angle" substring, so check for
      // the highlight box styling instead
      const str = safeStringify(tree.toJSON());
      // The highlight box has borderLeftWidth: 3 - should not appear
      expect(str).not.toContain('borderLeftWidth');
    });

    it('renders only market_position and differentiation_strategy (no arrays)', () => {
      const intel: CompetitiveIntelligence = {
        market_position: 'Market leader',
        differentiation_strategy: 'Innovation focus',
      };
      const tree = renderComponent({
        intelligence: intel,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Interview Angles');
      expect(text).toContain('Market Position');
      expect(text).toContain('Differentiation Strategy');
      expect(text).not.toContain('Competitive Advantages');
      expect(text).not.toContain('Challenges');
    });
  });

  // ===== SECTION CONTENT VERIFICATION =====
  describe('Section content details', () => {
    it('renders each interview angle with dot indicator', () => {
      const tree = renderComponent({
        intelligence: fullIntelligence,
        loading: false,
        colors: mockColors,
      });
      const str = safeStringify(tree.toJSON());
      // Each angle has a dot with warning color background
      expect(str).toContain(COLORS.warning);
      // Each angle text is present
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Angle A');
      expect(text).toContain('Angle B');
      expect(text).toContain('Angle C');
    });

    it('renders competitive advantages with CheckCircle icons when expanded', () => {
      const tree = renderComponent({
        intelligence: fullIntelligence,
        loading: false,
        colors: mockColors,
      });
      const touchables = findTouchables(tree.root);
      renderer.act(() => {
        touchables[2].props.onPress();
      });
      const str = safeStringify(tree.toJSON());
      // CheckCircle icons in the advantage list items
      expect(str).toContain('CheckCircleIcon');
      expect(str).toContain(ALPHA_COLORS.success.bg);
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Strong brand');
      expect(text).toContain('Large customer base');
    });

    it('renders challenges with AlertTriangle icons when expanded', () => {
      const tree = renderComponent({
        intelligence: fullIntelligence,
        loading: false,
        colors: mockColors,
      });
      const touchables = findTouchables(tree.root);
      renderer.act(() => {
        touchables[3].props.onPress();
      });
      const str = safeStringify(tree.toJSON());
      expect(str).toContain('AlertTriangleIcon');
      expect(str).toContain(ALPHA_COLORS.danger.bg);
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Talent retention');
      expect(text).toContain('Rising competition');
    });

    it('renders market position text in info box when expanded', () => {
      const tree = renderComponent({
        intelligence: fullIntelligence,
        loading: false,
        colors: mockColors,
      });
      const touchables = findTouchables(tree.root);
      renderer.act(() => {
        touchables[1].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Leader in cybersecurity SaaS');
      const str = safeStringify(tree.toJSON());
      expect(str).toContain(mockColors.backgroundTertiary);
    });

    it('renders differentiation strategy text in info box when expanded', () => {
      const tree = renderComponent({
        intelligence: fullIntelligence,
        loading: false,
        colors: mockColors,
      });
      const touchables = findTouchables(tree.root);
      renderer.act(() => {
        touchables[4].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Focus on AI-driven threat detection');
      const str = safeStringify(tree.toJSON());
      expect(str).toContain(mockColors.backgroundTertiary);
    });
  });

  // ===== STYLING AND COLORS =====
  describe('Styling and color application', () => {
    it('applies colors.text to section header texts', () => {
      const tree = renderComponent({
        intelligence: fullIntelligence,
        loading: false,
        colors: mockColors,
      });
      const str = safeStringify(tree.toJSON());
      // colors.text is used for all section header texts
      const textColorCount = (str.match(new RegExp(mockColors.text.replace('#', '\\#'), 'g')) || []).length;
      // At minimum: title + subtitle text color + each section header text
      expect(textColorCount).toBeGreaterThanOrEqual(6);
    });

    it('applies colors.textSecondary to subtitle and chevron icons', () => {
      const tree = renderComponent({
        intelligence: fullIntelligence,
        loading: false,
        colors: mockColors,
      });
      const str = safeStringify(tree.toJSON());
      expect(str).toContain(mockColors.textSecondary);
    });

    it('uses FONTS.semibold for section header text', () => {
      const tree = renderComponent({
        intelligence: fullIntelligence,
        loading: false,
        colors: mockColors,
      });
      const str = safeStringify(tree.toJSON());
      expect(str).toContain(FONTS.semibold);
    });

    it('applies warning highlight box styling to interview angles', () => {
      const tree = renderComponent({
        intelligence: fullIntelligence,
        loading: false,
        colors: mockColors,
      });
      const str = safeStringify(tree.toJSON());
      expect(str).toContain(ALPHA_COLORS.warning.bg);
      expect(str).toContain(COLORS.warning);
    });

    it('uses correct icon colors per section', () => {
      const tree = renderComponent({
        intelligence: fullIntelligence,
        loading: false,
        colors: mockColors,
      });
      // Icons are mocked as functions returning strings, so color props
      // do not appear in toJSON(). Verify via instance tree instead.
      const root = tree.root;
      // Find all icon components by checking for displayName pattern
      const allNodes = root.findAll((node: any) => {
        try {
          return typeof node.type === 'function' && node.type.displayName;
        } catch { return false; }
      });
      const iconNames = allNodes.map((n: any) => n.type.displayName);
      // Verify the expected icons are all present
      expect(iconNames).toContain('Target');
      expect(iconNames).toContain('Lightbulb');
      expect(iconNames).toContain('TrendingUp');
      expect(iconNames).toContain('CheckCircle');
      expect(iconNames).toContain('AlertTriangle');
      expect(iconNames).toContain('Award');
      // Verify color props on specific icons
      const lightbulb = allNodes.find((n: any) => n.type.displayName === 'Lightbulb');
      expect(lightbulb.props.color).toBe(COLORS.warning);
      const trendingUp = allNodes.find((n: any) => n.type.displayName === 'TrendingUp');
      expect(trendingUp.props.color).toBe(COLORS.info);
      const checkCircles = allNodes.filter((n: any) => n.type.displayName === 'CheckCircle');
      expect(checkCircles[0].props.color).toBe(COLORS.success);
      const alertTriangles = allNodes.filter((n: any) => n.type.displayName === 'AlertTriangle');
      expect(alertTriangles[0].props.color).toBe(COLORS.error);
      const award = allNodes.find((n: any) => n.type.displayName === 'Award');
      expect(award.props.color).toBe(COLORS.purple);
    });
  });

  // ===== EDGE CASES =====
  describe('Edge cases', () => {
    it('handles intelligence with only interview_angles', () => {
      const intel: CompetitiveIntelligence = {
        interview_angles: ['Single angle'],
      };
      const tree = renderComponent({
        intelligence: intel,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Single angle');
      expect(text).toContain('Interview Angles');
    });

    it('handles intelligence with all empty arrays', () => {
      const intel: CompetitiveIntelligence = {
        interview_angles: [],
        competitive_advantages: [],
        challenges: [],
      };
      const tree = renderComponent({
        intelligence: intel,
        loading: false,
        colors: mockColors,
      });
      const json = tree.toJSON();
      expect(json).not.toBeNull();
      const text = getTreeText(json);
      expect(text).toContain('Competitive Intelligence');
    });

    it('handles intelligence as empty object', () => {
      const intel: CompetitiveIntelligence = {};
      const tree = renderComponent({
        intelligence: intel,
        loading: false,
        colors: mockColors,
      });
      const json = tree.toJSON();
      expect(json).not.toBeNull();
      const text = getTreeText(json);
      expect(text).toContain('Competitive Intelligence');
      expect(text).toContain('Interview Angles');
      // Only Interview Angles header should appear, no other sections
      expect(text).not.toContain('Market Position');
      expect(text).not.toContain('Competitive Advantages');
      expect(text).not.toContain('Challenges');
      expect(text).not.toContain('Differentiation Strategy');
    });

    it('loading=true takes precedence over intelligence data', () => {
      const tree = renderComponent({
        intelligence: fullIntelligence,
        loading: true,
        colors: mockColors,
      });
      const str = safeStringify(tree.toJSON());
      expect(str).toContain('ActivityIndicator');
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Interview Angles');
    });

    it('renders with single-item arrays', () => {
      const intel: CompetitiveIntelligence = {
        interview_angles: ['One angle'],
        competitive_advantages: ['One advantage'],
        challenges: ['One challenge'],
      };
      const tree = renderComponent({
        intelligence: intel,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('One angle');
    });

    it('renders long text content without error', () => {
      const longText = 'A'.repeat(500);
      const intel: CompetitiveIntelligence = {
        interview_angles: [longText],
        market_position: longText,
        differentiation_strategy: longText,
      };
      const tree = renderComponent({
        intelligence: intel,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain(longText);
    });

    it('handles many interview angles', () => {
      const angles = Array.from({ length: 20 }, (_, i) => `Angle ${i + 1}`);
      const intel: CompetitiveIntelligence = {
        interview_angles: angles,
      };
      const tree = renderComponent({
        intelligence: intel,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Angle 1');
      expect(text).toContain('Angle 20');
    });
  });

  // ===== ACCESSIBILITY =====
  describe('Accessibility', () => {
    it('all section toggle buttons have accessibilityRole="button"', () => {
      const tree = renderComponent({
        intelligence: fullIntelligence,
        loading: false,
        colors: mockColors,
      });
      const touchables = findTouchables(tree.root);
      touchables.forEach((t: any) => {
        expect(t.props.accessibilityRole).toBe('button');
      });
    });

    it('has exactly 5 touchable sections with full data', () => {
      const tree = renderComponent({
        intelligence: fullIntelligence,
        loading: false,
        colors: mockColors,
      });
      const touchables = findTouchables(tree.root);
      expect(touchables).toHaveLength(5);
    });

    it('has 1 touchable section when only interview_angles exists', () => {
      const intel: CompetitiveIntelligence = {
        interview_angles: ['Angle'],
      };
      const tree = renderComponent({
        intelligence: intel,
        loading: false,
        colors: mockColors,
      });
      const touchables = findTouchables(tree.root);
      expect(touchables).toHaveLength(1);
    });
  });
});
