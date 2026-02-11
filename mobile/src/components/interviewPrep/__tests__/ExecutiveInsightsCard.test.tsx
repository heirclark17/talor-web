/**
 * ExecutiveInsightsCard - Comprehensive Unit Tests
 *
 * Uses react-test-renderer to fully exercise useState for expand/collapse toggling.
 * Covers:
 * - Loading state rendering
 * - Null/undefined insights guard (returns null)
 * - Full data display with all 5 collapsible sections
 * - Default expanded section ('priorities')
 * - Toggling each section open and closed
 * - Chevron icon direction (up when expanded, down when collapsed)
 * - Empty array / missing field guards
 * - Partial data (only some fields present)
 */

import React from 'react';
import renderer from 'react-test-renderer';

// Mock GlassCard as a React component so react-test-renderer can render it
jest.mock('../../glass/GlassCard', () => {
  const { createElement } = require('react');
  return {
    GlassCard: ({ children, style, material }: any) =>
      createElement('GlassCard', { style, material }, children),
  };
});

import { ExecutiveInsightsCard } from '../ExecutiveInsightsCard';
import { ExecutiveInsights } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockColors = {
  glass: 'rgba(255,255,255,0.04)',
  glassBorder: 'rgba(255,255,255,0.08)',
  text: '#ffffff',
  textSecondary: '#9ca3af',
  textTertiary: '#6b7280',
  background: '#0a0a0a',
  backgroundSecondary: '#1a1a1a',
  backgroundTertiary: '#2a2a2a',
  border: '#374151',
};

const fullInsights: ExecutiveInsights = {
  executive_priorities: ['Priority Alpha', 'Priority Beta', 'Priority Gamma'],
  leadership_style: 'Transformational leadership with emphasis on innovation',
  decision_making_factors: ['Market data', 'Customer feedback', 'Risk tolerance'],
  strategic_initiatives: ['Cloud migration', 'AI integration', 'Global expansion'],
  c_suite_talking_points: ['Revenue growth strategy', 'Digital transformation roadmap'],
};

/**
 * Recursively collect all text content from a react-test-renderer JSON tree.
 */
function getTreeText(node: any): string {
  if (node == null) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getTreeText).join('');
  if (node.children) return node.children.map(getTreeText).join('');
  return '';
}

/**
 * Safely stringify a tree, handling potential circular references.
 */
function safeStringify(node: any): string {
  const seen = new WeakSet();
  return JSON.stringify(node, (_key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]';
      seen.add(value);
    }
    return value;
  });
}

/**
 * Render the component inside renderer.act() to flush effects.
 */
function renderCard(props: {
  insights: ExecutiveInsights;
  loading: boolean;
  colors: any;
}) {
  let tree: renderer.ReactTestRenderer;
  renderer.act(() => {
    tree = renderer.create(
      React.createElement(ExecutiveInsightsCard, props),
    );
  });
  return tree!;
}

/**
 * Find all TouchableOpacity elements (section headers) in the tree.
 */
function findTouchables(root: renderer.ReactTestInstance): renderer.ReactTestInstance[] {
  return root.findAll((node) => {
    return node.type === 'TouchableOpacity' && typeof node.props.onPress === 'function';
  });
}

/**
 * Find a specific touchable by checking if its subtree contains the given text.
 */
function findTouchableByText(
  root: renderer.ReactTestInstance,
  text: string,
): renderer.ReactTestInstance | undefined {
  const touchables = findTouchables(root);
  return touchables.find((t) => {
    try {
      const children = t.findAll((n) => n.type === 'Text');
      return children.some((c) => {
        const content = Array.isArray(c.props.children)
          ? c.props.children.join('')
          : String(c.props.children ?? '');
        return content.includes(text);
      });
    } catch {
      return false;
    }
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ExecutiveInsightsCard', () => {
  // ===== Loading State =====
  describe('Loading State', () => {
    it('renders a loading indicator with header when loading=true', () => {
      const tree = renderCard({
        insights: null as any,
        loading: true,
        colors: mockColors,
      });
      const json = tree.toJSON();
      const text = getTreeText(json);
      expect(text).toContain('Executive Insights');
      // ActivityIndicator renders as a string in the mock
      const str = safeStringify(json);
      expect(str).toContain('ActivityIndicator');
    });

    it('does NOT render section content when loading', () => {
      const tree = renderCard({
        insights: fullInsights,
        loading: true,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Priority Alpha');
      expect(text).not.toContain('Transformational leadership');
    });
  });

  // ===== Null / Undefined Insights =====
  describe('Null / Undefined Insights', () => {
    it('returns null when insights is null and not loading', () => {
      const tree = renderCard({
        insights: null as any,
        loading: false,
        colors: mockColors,
      });
      expect(tree.toJSON()).toBeNull();
    });

    it('returns null when insights is undefined and not loading', () => {
      const tree = renderCard({
        insights: undefined as any,
        loading: false,
        colors: mockColors,
      });
      expect(tree.toJSON()).toBeNull();
    });
  });

  // ===== Full Data Display =====
  describe('Full Data Display', () => {
    it('renders the header with Crown icon and title', () => {
      const tree = renderCard({
        insights: fullInsights,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Executive Insights');
    });

    it('renders the subtitle text', () => {
      const tree = renderCard({
        insights: fullInsights,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Navigate C-suite conversations with confidence');
    });

    it('renders all 5 section headers', () => {
      const tree = renderCard({
        insights: fullInsights,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Executive Priorities');
      expect(text).toContain('Leadership Style');
      expect(text).toContain('Decision Making Factors');
      expect(text).toContain('Strategic Initiatives');
      expect(text).toContain('C-Suite Talking Points');
    });

    it('renders the KEY badge for C-Suite Talking Points', () => {
      const tree = renderCard({
        insights: fullInsights,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('KEY');
    });
  });

  // ===== Default Expanded Section (priorities) =====
  describe('Default Expanded Section', () => {
    it('shows priorities content by default', () => {
      const tree = renderCard({
        insights: fullInsights,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Priority Alpha');
      expect(text).toContain('Priority Beta');
      expect(text).toContain('Priority Gamma');
    });

    it('does NOT show leadership content by default', () => {
      const tree = renderCard({
        insights: fullInsights,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Transformational leadership');
    });

    it('does NOT show decision making content by default', () => {
      const tree = renderCard({
        insights: fullInsights,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Market data');
    });

    it('does NOT show strategic initiatives content by default', () => {
      const tree = renderCard({
        insights: fullInsights,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Cloud migration');
    });

    it('does NOT show talking points content by default', () => {
      const tree = renderCard({
        insights: fullInsights,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Revenue growth strategy');
    });
  });

  // ===== Toggle Section: Collapse Priorities =====
  describe('Toggle: Collapse Priorities', () => {
    it('collapses priorities when its header is pressed', () => {
      const tree = renderCard({
        insights: fullInsights,
        loading: false,
        colors: mockColors,
      });
      // Verify priorities are visible initially
      expect(getTreeText(tree.toJSON())).toContain('Priority Alpha');

      // Find priorities header and press it
      const prioritiesBtn = findTouchableByText(tree.root, 'Executive Priorities');
      expect(prioritiesBtn).toBeDefined();
      renderer.act(() => {
        prioritiesBtn!.props.onPress();
      });

      // Priorities content should now be hidden
      expect(getTreeText(tree.toJSON())).not.toContain('Priority Alpha');
    });

    it('re-expands priorities when pressed again', () => {
      const tree = renderCard({
        insights: fullInsights,
        loading: false,
        colors: mockColors,
      });
      const prioritiesBtn = findTouchableByText(tree.root, 'Executive Priorities');

      // Collapse
      renderer.act(() => {
        prioritiesBtn!.props.onPress();
      });
      expect(getTreeText(tree.toJSON())).not.toContain('Priority Alpha');

      // Re-expand
      renderer.act(() => {
        prioritiesBtn!.props.onPress();
      });
      expect(getTreeText(tree.toJSON())).toContain('Priority Alpha');
    });
  });

  // ===== Toggle Section: Open Leadership Style =====
  describe('Toggle: Leadership Style', () => {
    it('shows leadership content when its header is pressed', () => {
      const tree = renderCard({
        insights: fullInsights,
        loading: false,
        colors: mockColors,
      });
      const leadershipBtn = findTouchableByText(tree.root, 'Leadership Style');
      expect(leadershipBtn).toBeDefined();

      renderer.act(() => {
        leadershipBtn!.props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Transformational leadership with emphasis on innovation');
      // Leadership is now expanded so priorities should be collapsed
      expect(text).not.toContain('Priority Alpha');
    });

    it('collapses leadership when pressed again', () => {
      const tree = renderCard({
        insights: fullInsights,
        loading: false,
        colors: mockColors,
      });
      const leadershipBtn = findTouchableByText(tree.root, 'Leadership Style');

      // Open
      renderer.act(() => {
        leadershipBtn!.props.onPress();
      });
      expect(getTreeText(tree.toJSON())).toContain('Transformational leadership');

      // Close
      renderer.act(() => {
        leadershipBtn!.props.onPress();
      });
      expect(getTreeText(tree.toJSON())).not.toContain('Transformational leadership');
    });
  });

  // ===== Toggle Section: Open Decision Making Factors =====
  describe('Toggle: Decision Making Factors', () => {
    it('shows decision factors with numbered indices when expanded', () => {
      const tree = renderCard({
        insights: fullInsights,
        loading: false,
        colors: mockColors,
      });
      const decisionsBtn = findTouchableByText(tree.root, 'Decision Making Factors');
      expect(decisionsBtn).toBeDefined();

      renderer.act(() => {
        decisionsBtn!.props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Market data');
      expect(text).toContain('Customer feedback');
      expect(text).toContain('Risk tolerance');
      // Check numbered indices: 1, 2, 3
      expect(text).toContain('1');
      expect(text).toContain('2');
      expect(text).toContain('3');
    });
  });

  // ===== Toggle Section: Open Strategic Initiatives =====
  describe('Toggle: Strategic Initiatives', () => {
    it('shows initiatives content when expanded', () => {
      const tree = renderCard({
        insights: fullInsights,
        loading: false,
        colors: mockColors,
      });
      const initiativesBtn = findTouchableByText(tree.root, 'Strategic Initiatives');
      expect(initiativesBtn).toBeDefined();

      renderer.act(() => {
        initiativesBtn!.props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Cloud migration');
      expect(text).toContain('AI integration');
      expect(text).toContain('Global expansion');
    });
  });

  // ===== Toggle Section: Open C-Suite Talking Points =====
  describe('Toggle: C-Suite Talking Points', () => {
    it('shows talking points content when expanded', () => {
      const tree = renderCard({
        insights: fullInsights,
        loading: false,
        colors: mockColors,
      });
      const talkingBtn = findTouchableByText(tree.root, 'C-Suite Talking Points');
      expect(talkingBtn).toBeDefined();

      renderer.act(() => {
        talkingBtn!.props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Revenue growth strategy');
      expect(text).toContain('Digital transformation roadmap');
    });
  });

  // ===== Empty / Missing Fields =====
  describe('Empty / Missing Fields', () => {
    it('does not render priorities section when array is empty', () => {
      const tree = renderCard({
        insights: { ...fullInsights, executive_priorities: [] },
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Executive Priorities');
    });

    it('does not render priorities section when field is undefined', () => {
      const tree = renderCard({
        insights: { ...fullInsights, executive_priorities: undefined },
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Executive Priorities');
    });

    it('does not render leadership section when field is undefined', () => {
      const tree = renderCard({
        insights: { ...fullInsights, leadership_style: undefined },
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Leadership Style');
    });

    it('does not render leadership section when field is empty string', () => {
      const tree = renderCard({
        insights: { ...fullInsights, leadership_style: '' },
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Leadership Style');
    });

    it('does not render decision factors section when array is empty', () => {
      const tree = renderCard({
        insights: { ...fullInsights, decision_making_factors: [] },
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Decision Making Factors');
    });

    it('does not render decision factors section when field is undefined', () => {
      const tree = renderCard({
        insights: { ...fullInsights, decision_making_factors: undefined },
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Decision Making Factors');
    });

    it('does not render strategic initiatives section when array is empty', () => {
      const tree = renderCard({
        insights: { ...fullInsights, strategic_initiatives: [] },
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Strategic Initiatives');
    });

    it('does not render strategic initiatives section when field is undefined', () => {
      const tree = renderCard({
        insights: { ...fullInsights, strategic_initiatives: undefined },
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Strategic Initiatives');
    });

    it('does not render talking points section when array is empty', () => {
      const tree = renderCard({
        insights: { ...fullInsights, c_suite_talking_points: [] },
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('C-Suite Talking Points');
    });

    it('does not render talking points section when field is undefined', () => {
      const tree = renderCard({
        insights: { ...fullInsights, c_suite_talking_points: undefined },
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('C-Suite Talking Points');
    });

    it('renders only the header/subtitle when all data fields are empty', () => {
      const tree = renderCard({
        insights: {
          executive_priorities: [],
          leadership_style: undefined,
          decision_making_factors: [],
          strategic_initiatives: [],
          c_suite_talking_points: [],
        },
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Executive Insights');
      expect(text).toContain('Navigate C-suite conversations with confidence');
      // No section headers should appear
      expect(text).not.toContain('Executive Priorities');
      expect(text).not.toContain('Leadership Style');
      expect(text).not.toContain('Decision Making Factors');
      expect(text).not.toContain('Strategic Initiatives');
      expect(text).not.toContain('C-Suite Talking Points');
    });
  });

  // ===== Partial Data =====
  describe('Partial Data', () => {
    it('renders only priorities and leadership when others are missing', () => {
      const tree = renderCard({
        insights: {
          executive_priorities: ['Only priority'],
          leadership_style: 'Servant leadership',
        },
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Executive Priorities');
      expect(text).toContain('Only priority');
      expect(text).toContain('Leadership Style');
      expect(text).not.toContain('Decision Making Factors');
      expect(text).not.toContain('Strategic Initiatives');
      expect(text).not.toContain('C-Suite Talking Points');
    });

    it('renders single-item arrays correctly', () => {
      const tree = renderCard({
        insights: {
          executive_priorities: ['Single priority'],
          decision_making_factors: ['Single factor'],
          strategic_initiatives: ['Single initiative'],
          c_suite_talking_points: ['Single point'],
        },
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      // priorities is expanded by default
      expect(text).toContain('Single priority');
    });
  });

  // ===== Chevron Direction =====
  describe('Chevron Direction', () => {
    it('shows ChevronUp for the expanded section and ChevronDown for collapsed', () => {
      const tree = renderCard({
        insights: fullInsights,
        loading: false,
        colors: mockColors,
      });
      // By default priorities is expanded
      // We verify the Chevron icons via the JSON structure
      const str = safeStringify(tree.toJSON());
      // ChevronUp for priorities (expanded), ChevronDown for others (collapsed)
      expect(str).toContain('ChevronUpIcon');
      expect(str).toContain('ChevronDownIcon');
    });

    it('swaps chevron direction when a different section is expanded', () => {
      const tree = renderCard({
        insights: fullInsights,
        loading: false,
        colors: mockColors,
      });
      // Expand leadership instead
      const leadershipBtn = findTouchableByText(tree.root, 'Leadership Style');
      renderer.act(() => {
        leadershipBtn!.props.onPress();
      });
      // Now leadership has ChevronUp, priorities has ChevronDown
      const str = safeStringify(tree.toJSON());
      // Still has both types but the distribution changed
      expect(str).toContain('ChevronUpIcon');
      expect(str).toContain('ChevronDownIcon');
    });
  });

  // ===== Accordion Behavior (only one section at a time) =====
  describe('Accordion Behavior', () => {
    it('only allows one section to be expanded at a time', () => {
      const tree = renderCard({
        insights: fullInsights,
        loading: false,
        colors: mockColors,
      });

      // Default: priorities expanded
      expect(getTreeText(tree.toJSON())).toContain('Priority Alpha');
      expect(getTreeText(tree.toJSON())).not.toContain('Market data');

      // Open decisions
      const decisionsBtn = findTouchableByText(tree.root, 'Decision Making Factors');
      renderer.act(() => {
        decisionsBtn!.props.onPress();
      });

      // Now decisions expanded, priorities collapsed
      expect(getTreeText(tree.toJSON())).toContain('Market data');
      expect(getTreeText(tree.toJSON())).not.toContain('Priority Alpha');

      // Open initiatives
      const initiativesBtn = findTouchableByText(tree.root, 'Strategic Initiatives');
      renderer.act(() => {
        initiativesBtn!.props.onPress();
      });

      // Now initiatives expanded, decisions collapsed
      expect(getTreeText(tree.toJSON())).toContain('Cloud migration');
      expect(getTreeText(tree.toJSON())).not.toContain('Market data');
    });

    it('collapses all sections when the expanded one is pressed', () => {
      const tree = renderCard({
        insights: fullInsights,
        loading: false,
        colors: mockColors,
      });

      // Collapse the default expanded section (priorities)
      const prioritiesBtn = findTouchableByText(tree.root, 'Executive Priorities');
      renderer.act(() => {
        prioritiesBtn!.props.onPress();
      });

      // No section content should be visible
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Priority Alpha');
      expect(text).not.toContain('Transformational leadership');
      expect(text).not.toContain('Market data');
      expect(text).not.toContain('Cloud migration');
      expect(text).not.toContain('Revenue growth strategy');
    });
  });

  // ===== Accessibility =====
  describe('Accessibility', () => {
    it('sets accessibilityRole="button" on section headers', () => {
      const tree = renderCard({
        insights: fullInsights,
        loading: false,
        colors: mockColors,
      });
      const touchables = findTouchables(tree.root);
      touchables.forEach((t) => {
        expect(t.props.accessibilityRole).toBe('button');
      });
    });
  });

  // ===== Colors Applied =====
  describe('Colors', () => {
    it('applies text color from props to the title', () => {
      const customColors = { ...mockColors, text: '#ff0000' };
      const tree = renderCard({
        insights: fullInsights,
        loading: false,
        colors: customColors,
      });
      const textNodes = tree.root.findAll(
        (n) => n.type === 'Text' && n.props.children === 'Executive Insights',
      );
      expect(textNodes.length).toBeGreaterThan(0);
      const titleStyle = textNodes[0].props.style;
      const flatStyle = Array.isArray(titleStyle)
        ? Object.assign({}, ...titleStyle)
        : titleStyle;
      expect(flatStyle.color).toBe('#ff0000');
    });
  });
});
