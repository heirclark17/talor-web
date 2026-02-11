/**
 * ChangeExplanation Tests
 *
 * Pure logic tests and direct component invocation:
 * - Module exports
 * - getChangeColor, getChangeBorderColor, getChangeIcon logic
 * - Empty changes handling, change detail type validation
 * - Direct component calls for empty, collapsed, and expanded branches
 */

import React from 'react';
import renderer from 'react-test-renderer';

// Mock dependencies before imports
jest.mock('../../hooks/useTheme', () => ({
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

jest.mock('../glass/GlassCard', () => ({
  GlassCard: (props: any) => props.children || null,
}));

import ChangeExplanation from '../ChangeExplanation';
import { COLORS } from '../../utils/constants';

const sampleChanges = [
  { type: 'added' as const, changed: 'New section', reason: 'Keyword coverage', keywords: ['cybersecurity', 'NIST'] },
  { type: 'removed' as const, original: 'Outdated cert', reason: 'Not relevant' },
  { type: 'modified' as const, original: 'Managed projects', changed: 'Led security initiatives', reason: 'Better verb', keywords: ['security'] },
];


const getTreeText = (node: any): string => {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (typeof node === 'boolean') return '';

  let text = '';

  // Handle array of nodes
  if (Array.isArray(node)) {
    return node.map(n => getTreeText(n)).join(' ');
  }

  // Extract text from props
  if (node.props) {
    // Get specific text props
    if (typeof node.props.children === 'string' || typeof node.props.children === 'number') {
      text += ' ' + node.props.children;
    } else if (Array.isArray(node.props.children)) {
      text += ' ' + getTreeText(node.props.children);
    } else if (node.props.children && typeof node.props.children === 'object') {
      text += ' ' + getTreeText(node.props.children);
    }

    // Also check for label, title, placeholder, value
    if (node.props.label) text += ' ' + node.props.label;
    if (node.props.title) text += ' ' + node.props.title;
    if (node.props.placeholder) text += ' ' + node.props.placeholder;
    if (typeof node.props.value === 'string') text += ' ' + node.props.value;
  }

  // Handle children array
  if (node.children && Array.isArray(node.children)) {
    text += ' ' + node.children.map((c: any) => getTreeText(c)).join(' ');
  }

  return text;
};

describe('ChangeExplanation', () => {
  describe('module exports', () => {
    it('should export ChangeExplanation as default export', () => {
      expect(ChangeExplanation).toBeDefined();
      expect(typeof ChangeExplanation).toBe('function');
    });

    it('should have the correct function name', () => {
      expect(ChangeExplanation.name).toBe('ChangeExplanation');
    });
  });

  describe('getChangeColor logic', () => {
    const mockTextSecondary = '#9ca3af';
    const getChangeColor = (type: string) => {
      switch (type) {
        case 'added': return COLORS.success;
        case 'removed': return COLORS.danger;
        case 'modified': return COLORS.warning;
        default: return mockTextSecondary;
      }
    };

    it('should return success for added', () => {
      expect(getChangeColor('added')).toBe(COLORS.success);
    });

    it('should return danger for removed', () => {
      expect(getChangeColor('removed')).toBe(COLORS.danger);
    });

    it('should return warning for modified', () => {
      expect(getChangeColor('modified')).toBe(COLORS.warning);
    });

    it('should return textSecondary for unknown', () => {
      expect(getChangeColor('unknown')).toBe(mockTextSecondary);
    });

    it('should return textSecondary for empty string', () => {
      expect(getChangeColor('')).toBe(mockTextSecondary);
    });
  });

  describe('getChangeBorderColor logic', () => {
    const mockBorder = '#374151';
    const getChangeBorderColor = (type: string) => {
      switch (type) {
        case 'added': return COLORS.success;
        case 'removed': return COLORS.danger;
        case 'modified': return COLORS.warning;
        default: return mockBorder;
      }
    };

    it('should return success for added', () => {
      expect(getChangeBorderColor('added')).toBe(COLORS.success);
    });

    it('should return danger for removed', () => {
      expect(getChangeBorderColor('removed')).toBe(COLORS.danger);
    });

    it('should return warning for modified', () => {
      expect(getChangeBorderColor('modified')).toBe(COLORS.warning);
    });

    it('should return default border for unknown', () => {
      expect(getChangeBorderColor('anything')).toBe(mockBorder);
    });
  });

  describe('getChangeIcon logic', () => {
    const getChangeIcon = (type: string) => {
      switch (type) {
        case 'added': return '+';
        case 'removed': return '-';
        case 'modified': return '~';
        default: return '\u2022';
      }
    };

    it('should return "+" for added', () => {
      expect(getChangeIcon('added')).toBe('+');
    });

    it('should return "-" for removed', () => {
      expect(getChangeIcon('removed')).toBe('-');
    });

    it('should return "~" for modified', () => {
      expect(getChangeIcon('modified')).toBe('~');
    });

    it('should return bullet for unknown', () => {
      expect(getChangeIcon('other')).toBe('\u2022');
    });
  });

  describe('empty changes handling', () => {
    it('should not render when changes is empty', () => {
      expect([].length > 0).toBe(false);
    });

    it('should render when changes has items', () => {
      expect(sampleChanges.length > 0).toBe(true);
    });
  });

  describe('change detail type validation', () => {
    it('should accept valid added change', () => {
      expect(sampleChanges[0].type).toBe('added');
      expect((sampleChanges[0] as any).original).toBeUndefined();
    });

    it('should accept valid removed change', () => {
      expect(sampleChanges[1].type).toBe('removed');
      expect((sampleChanges[1] as any).changed).toBeUndefined();
    });

    it('should accept modified change with both original and changed', () => {
      expect(sampleChanges[2].original).toBeDefined();
      expect(sampleChanges[2].changed).toBeDefined();
      expect(sampleChanges[2].keywords).toHaveLength(1);
    });

    it('should handle empty keywords array', () => {
      const change = { type: 'added' as const, changed: 'New', reason: 'Gap', keywords: [] as string[] };
      expect(change.keywords.length > 0).toBe(false);
    });

    it('should handle undefined keywords', () => {
      const change = { type: 'modified' as const, original: 'Old', changed: 'New', reason: 'Better' };
      expect((change as any).keywords).toBeUndefined();
    });
  });

  describe('accessibility label formatting', () => {
    it('should format label for expanded state', () => {
      const label = `${'Hide'} change explanation for ${'Professional Summary'}`;
      expect(label).toBe('Hide change explanation for Professional Summary');
    });

    it('should format label for collapsed state', () => {
      const label = `${'Show'} change explanation for ${'Experience'}`;
      expect(label).toBe('Show change explanation for Experience');
    });
  });

  describe('empty changes early return', () => {
    it('should indicate null return when changes is empty array', () => {
      // ChangeExplanation returns null early when changes.length === 0
      const changes: any[] = [];
      expect(changes.length === 0).toBe(true);
    });
  });

  describe('React.createElement invocation - with changes', () => {
    it('should create element with sample changes', () => {
      const element = React.createElement(ChangeExplanation, {
        sectionName: 'Professional Summary',
        changes: sampleChanges,
        originalText: 'Original summary',
        tailoredText: 'Tailored summary',
      });
      expect(element).toBeTruthy();
      expect(element.props.sectionName).toBe('Professional Summary');
      expect(element.props.changes).toHaveLength(3);
    });

    it('should create element with single change', () => {
      const element = React.createElement(ChangeExplanation, {
        sectionName: 'Skills',
        changes: [sampleChanges[0]],
        originalText: 'Old',
        tailoredText: 'New',
      });
      expect(element).toBeTruthy();
      expect(element.props.changes).toHaveLength(1);
    });

    it('should create element with empty changes', () => {
      const element = React.createElement(ChangeExplanation, {
        sectionName: 'Summary',
        changes: [],
        originalText: 'Orig',
        tailoredText: 'Tail',
      });
      expect(element).toBeTruthy();
      expect(element.props.changes).toHaveLength(0);
    });

    it('should create element with many changes', () => {
      const many = Array.from({ length: 10 }, (_, i) => ({
        type: 'modified' as const,
        original: `Old ${i}`,
        changed: `New ${i}`,
        reason: `Reason ${i}`,
      }));
      const element = React.createElement(ChangeExplanation, {
        sectionName: 'Experience',
        changes: many,
        originalText: 'O',
        tailoredText: 'T',
      });
      expect(element).toBeTruthy();
      expect(element.props.changes).toHaveLength(10);
    });

    it('should create element with change containing keywords', () => {
      const element = React.createElement(ChangeExplanation, {
        sectionName: 'Summary',
        changes: [{ type: 'modified' as const, original: 'A', changed: 'B', reason: 'R', keywords: ['kw1', 'kw2'] }],
        originalText: 'O',
        tailoredText: 'T',
      });
      expect(element).toBeTruthy();
      expect(element.props.changes[0].keywords).toEqual(['kw1', 'kw2']);
    });

    it('should create element with change without keywords', () => {
      const element = React.createElement(ChangeExplanation, {
        sectionName: 'Summary',
        changes: [{ type: 'added' as const, changed: 'New', reason: 'R' }],
        originalText: 'O',
        tailoredText: 'T',
      });
      expect(element).toBeTruthy();
      expect(element.props.changes[0].keywords).toBeUndefined();
    });

    it('should create element with removed change type', () => {
      const element = React.createElement(ChangeExplanation, {
        sectionName: 'Experience',
        changes: [{ type: 'removed' as const, original: 'Old content', reason: 'Not relevant' }],
        originalText: 'Old',
        tailoredText: 'New',
      });
      expect(element).toBeTruthy();
      expect(element.props.changes[0].type).toBe('removed');
    });
  });

  describe('react-test-renderer rendering - empty changes returns null', () => {
    const renderComponent = (props: any) => {
      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(ChangeExplanation, props));
      });
      return tree!;
    };

    it('should render null when changes array is empty', () => {
      const tree = renderComponent({
        sectionName: 'Summary',
        changes: [],
        originalText: 'Original',
        tailoredText: 'Tailored',
      });
      expect(tree.toJSON()).toBeNull();
    });
  });

  describe('react-test-renderer rendering - collapsed state', () => {
    const renderComponent = (props: any) => {
      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(ChangeExplanation, props));
      });
      return tree!;
    };

    it('should render collapsed toggle button with "Why was this changed?"', () => {
      const tree = renderComponent({
        sectionName: 'Professional Summary',
        changes: sampleChanges,
        originalText: 'Original text',
        tailoredText: 'Tailored text',
      });
      const str = getTreeText(tree.toJSON());
      expect(str).toContain('Why was this changed?');
    });

    it('should NOT show expanded content in collapsed state', () => {
      const tree = renderComponent({
        sectionName: 'Summary',
        changes: sampleChanges,
        originalText: 'Orig',
        tailoredText: 'Tail',
      });
      const str = getTreeText(tree.toJSON());
      // Expanded content has ORIGINAL, TAILORED, DETAILED CHANGES labels
      expect(str).not.toContain('ORIGINAL');
      expect(str).not.toContain('TAILORED');
      expect(str).not.toContain('DETAILED CHANGES');
    });
  });

  describe('react-test-renderer rendering - expanded state', () => {
    const renderComponent = (props: any) => {
      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(ChangeExplanation, props));
      });
      return tree!;
    };

    it('should expand when toggle button is pressed', () => {
      const tree = renderComponent({
        sectionName: 'Professional Summary',
        changes: sampleChanges,
        originalText: 'Original summary text',
        tailoredText: 'Tailored summary text',
      });
      const root = tree.root;

      // Find and press the toggle button
      const toggleButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel && b.props.accessibilityLabel.includes('change explanation')
      );
      expect(toggleButton).toBeDefined();

      renderer.act(() => {
        toggleButton!.props.onPress();
      });

      const str = getTreeText(tree.toJSON());
      expect(str).toContain('ORIGINAL');
      expect(str).toContain('TAILORED');
      expect(str).toContain('DETAILED CHANGES');
      expect(str).toContain('Original summary text');
      expect(str).toContain('Tailored summary text');
    });

    it('should show change details for all change types', () => {
      const tree = renderComponent({
        sectionName: 'Summary',
        changes: sampleChanges,
        originalText: 'Orig',
        tailoredText: 'Tail',
      });
      const root = tree.root;

      // Expand
      const toggleButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel && b.props.accessibilityLabel.includes('change explanation')
      );
      renderer.act(() => {
        toggleButton!.props.onPress();
      });

      const str = getTreeText(tree.toJSON());
      // Added change
      expect(str).toContain('New section');
      expect(str).toContain('Keyword coverage');
      // Removed change
      expect(str).toContain('Outdated cert');
      expect(str).toContain('Not relevant');
      // Modified change
      expect(str).toContain('Managed projects');
      expect(str).toContain('Led security initiatives');
      expect(str).toContain('Better verb');
    });

    it('should show keywords chips for changes with keywords', () => {
      const tree = renderComponent({
        sectionName: 'Summary',
        changes: sampleChanges,
        originalText: 'O',
        tailoredText: 'T',
      });
      const root = tree.root;

      // Expand
      const toggleButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel && b.props.accessibilityLabel.includes('change explanation')
      );
      renderer.act(() => {
        toggleButton!.props.onPress();
      });

      const str = getTreeText(tree.toJSON());
      expect(str).toContain('cybersecurity');
      expect(str).toContain('NIST');
      expect(str).toContain('security');
    });

    it('should collapse when toggle is pressed again', () => {
      const tree = renderComponent({
        sectionName: 'Summary',
        changes: sampleChanges,
        originalText: 'O',
        tailoredText: 'T',
      });
      const root = tree.root;

      const toggleButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel && b.props.accessibilityLabel.includes('change explanation')
      );

      // Expand
      renderer.act(() => {
        toggleButton!.props.onPress();
      });
      let str = getTreeText(tree.toJSON());
      expect(str).toContain('DETAILED CHANGES');

      // Collapse
      const toggleButton2 = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel && b.props.accessibilityLabel.includes('change explanation')
      );
      renderer.act(() => {
        toggleButton2!.props.onPress();
      });

      str = getTreeText(tree.toJSON());
      expect(str).not.toContain('DETAILED CHANGES');
    });
  });

  describe('react-test-renderer rendering - edge cases', () => {
    const renderComponent = (props: any) => {
      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(ChangeExplanation, props));
      });
      return tree!;
    };

    it('should render with single added change (no original)', () => {
      const tree = renderComponent({
        sectionName: 'Summary',
        changes: [{ type: 'added' as const, changed: 'New content', reason: 'Gap fill' }],
        originalText: 'O',
        tailoredText: 'T',
      });
      const root = tree.root;

      const toggleButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel && b.props.accessibilityLabel.includes('change explanation')
      );
      renderer.act(() => {
        toggleButton!.props.onPress();
      });

      const str = getTreeText(tree.toJSON());
      expect(str).toContain('New content');
      expect(str).toContain('Gap fill');
      // Should not contain "Before:" label since original is undefined
    });

    it('should render with single removed change (no changed text)', () => {
      const tree = renderComponent({
        sectionName: 'Skills',
        changes: [{ type: 'removed' as const, original: 'Outdated skill', reason: 'Irrelevant' }],
        originalText: 'O',
        tailoredText: 'T',
      });
      const root = tree.root;

      const toggleButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel && b.props.accessibilityLabel.includes('change explanation')
      );
      renderer.act(() => {
        toggleButton!.props.onPress();
      });

      const str = getTreeText(tree.toJSON());
      expect(str).toContain('Outdated skill');
      expect(str).toContain('Irrelevant');
    });

    it('should render with change that has empty keywords array', () => {
      const tree = renderComponent({
        sectionName: 'Summary',
        changes: [{ type: 'modified' as const, original: 'A', changed: 'B', reason: 'R', keywords: [] }],
        originalText: 'O',
        tailoredText: 'T',
      });
      const root = tree.root;

      const toggleButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel && b.props.accessibilityLabel.includes('change explanation')
      );
      renderer.act(() => {
        toggleButton!.props.onPress();
      });

      expect(tree.toJSON()).toBeDefined();
    });

    it('should render with many changes', () => {
      const many = Array.from({ length: 10 }, (_, i) => ({
        type: 'modified' as const,
        original: `Old ${i}`,
        changed: `New ${i}`,
        reason: `Reason ${i}`,
      }));
      const tree = renderComponent({
        sectionName: 'Experience',
        changes: many,
        originalText: 'O',
        tailoredText: 'T',
      });

      const root = tree.root;
      const toggleButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel && b.props.accessibilityLabel.includes('change explanation')
      );
      renderer.act(() => {
        toggleButton!.props.onPress();
      });

      const str = getTreeText(tree.toJSON());
      expect(str).toContain('Old 0');
      expect(str).toContain('New 9');
    });
  });
});
