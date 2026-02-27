/**
 * InterviewStrategyCard Comprehensive Unit Tests
 *
 * Uses react-test-renderer to test real state changes (expand/collapse).
 * Covers:
 * - Loading state rendering
 * - Null/undefined strategy returns null
 * - Full data display for all 5 sections
 * - Expand/collapse toggle behavior (ChevronUp/ChevronDown)
 * - Default expanded section ('approach')
 * - Missing/empty fields hide sections
 * - Partial data combinations
 *
 * Note: lucide-react-native icons are mocked globally as plain string return
 * functions (e.g. Compass -> "CompassIcon"), so they appear as text children
 * in the JSON tree, not as typed nodes.
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
import { InterviewStrategyCard } from '../InterviewStrategyCard';
import { InterviewStrategy, ThemeColors } from '../types';
import { COLORS, ALPHA_COLORS } from '../../../utils/constants';

// --------------- Helpers ---------------

const mockColors: ThemeColors & { backgroundTertiary?: string; textTertiary?: string } = {
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

const fullStrategy: InterviewStrategy = {
  recommended_approach: 'Start with a strong opening about your relevant experience.',
  key_themes_to_emphasize: ['Leadership', 'Problem solving', 'Team collaboration'],
  stories_to_prepare: [
    { theme: 'Overcoming challenges', description: 'Describe a time you overcame a major obstacle.' },
    { theme: 'Innovation', description: 'Share an example of creative problem solving.' },
  ],
  questions_to_ask_interviewer: [
    'What does success look like in this role?',
    'How is the team structured?',
  ],
  pre_interview_checklist: [
    'Research the company website',
    'Review the job description',
    'Prepare STAR stories',
  ],
};

const renderComponent = (props: {
  strategy: InterviewStrategy;
  loading: boolean;
  colors: typeof mockColors;
}) => {
  let tree: renderer.ReactTestRenderer;
  renderer.act(() => {
    tree = renderer.create(
      React.createElement(InterviewStrategyCard, props)
    );
  });
  return tree!;
};

/** Recursively extract all text from a test renderer JSON tree */
const getTreeText = (node: any): string => {
  if (node === null || node === undefined) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getTreeText).join('');
  if (node.children) return node.children.map(getTreeText).join('');
  return '';
};

/** Find all nodes of a given type from JSON tree */
const findAllByType = (node: any, type: string): any[] => {
  const results: any[] = [];
  if (!node || typeof node === 'string' || typeof node === 'number') return results;
  if (Array.isArray(node)) {
    node.forEach(n => results.push(...findAllByType(n, type)));
    return results;
  }
  if (node.type === type) results.push(node);
  if (node.children) {
    node.children.forEach((child: any) => results.push(...findAllByType(child, type)));
  }
  return results;
};

/** Count occurrences of a substring in text */
const countOccurrences = (text: string, sub: string): number => {
  let count = 0;
  let pos = 0;
  while ((pos = text.indexOf(sub, pos)) !== -1) {
    count++;
    pos += sub.length;
  }
  return count;
};

// ============================================================
// Tests
// ============================================================

describe('InterviewStrategyCard', () => {
  // ---- Loading State ----
  describe('loading state', () => {
    it('renders loading spinner when loading is true', () => {
      const tree = renderComponent({
        strategy: null as any,
        loading: true,
        colors: mockColors,
      });
      const json = tree.toJSON();
      const text = getTreeText(json);

      expect(text).toContain('Interview Strategy');

      // Should have ActivityIndicator
      const indicators = findAllByType(json, 'ActivityIndicator');
      expect(indicators.length).toBe(1);
      expect(indicators[0].props.color).toBe(COLORS.primary);
    });

    it('renders Compass icon text in loading state header', () => {
      const tree = renderComponent({
        strategy: null as any,
        loading: true,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      // lucide mock returns "CompassIcon" string
      expect(text).toContain('CompassIcon');
    });

    it('renders GlassCard wrapper in loading state', () => {
      const tree = renderComponent({
        strategy: null as any,
        loading: true,
        colors: mockColors,
      });
      const json = tree.toJSON() as any;
      expect(json.type).toBe('GlassCard');
      expect(json.props.material).toBe('regular');
    });

    it('does not render section content in loading state', () => {
      const tree = renderComponent({
        strategy: fullStrategy,
        loading: true,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Recommended Approach');
      expect(text).not.toContain('Key Themes to Emphasize');
      expect(text).not.toContain('game plan');
    });
  });

  // ---- Null / undefined strategy ----
  describe('null strategy', () => {
    it('returns null when strategy is null and not loading', () => {
      const tree = renderComponent({
        strategy: null as any,
        loading: false,
        colors: mockColors,
      });
      expect(tree.toJSON()).toBeNull();
    });

    it('returns null when strategy is undefined and not loading', () => {
      const tree = renderComponent({
        strategy: undefined as any,
        loading: false,
        colors: mockColors,
      });
      expect(tree.toJSON()).toBeNull();
    });
  });

  // ---- Full Data Rendering ----
  describe('full data rendering', () => {
    it('renders the main header with Compass icon and title', () => {
      const tree = renderComponent({
        strategy: fullStrategy,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Interview Strategy');
      expect(text).toContain('CompassIcon');
    });

    it('renders the subtitle text', () => {
      const tree = renderComponent({
        strategy: fullStrategy,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Your game plan for interview success');
    });

    it('renders all section headers', () => {
      const tree = renderComponent({
        strategy: fullStrategy,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());

      expect(text).toContain('Recommended Approach');
      expect(text).toContain('Key Themes to Emphasize');
      expect(text).toContain('Stories to Prepare');
      expect(text).toContain('Questions to Ask Interviewer');
      expect(text).toContain('Pre-Interview Checklist');
    });

    it('renders section icons as mock icon strings', () => {
      const tree = renderComponent({
        strategy: fullStrategy,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());

      // lucide mock returns "<Name>Icon" strings
      expect(text).toContain('MapIcon');
      expect(text).toContain('StarIcon');
      expect(text).toContain('BookOpenIcon');
      expect(text).toContain('HelpCircleIcon');
      expect(text).toContain('CheckCircleIcon');
    });

    it('renders GlassCard wrapper with correct material', () => {
      const tree = renderComponent({
        strategy: fullStrategy,
        loading: false,
        colors: mockColors,
      });
      const json = tree.toJSON() as any;
      expect(json.type).toBe('GlassCard');
      expect(json.props.material).toBe('regular');
    });
  });

  // ---- Default expanded section (approach) ----
  describe('default expanded section', () => {
    it('expands the approach section by default', () => {
      const tree = renderComponent({
        strategy: fullStrategy,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());

      // Approach content should be visible
      expect(text).toContain('Start with a strong opening');
    });

    it('shows ChevronUp for approach (expanded) and ChevronDown for others (collapsed)', () => {
      const tree = renderComponent({
        strategy: fullStrategy,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());

      // 1 expanded (approach) -> ChevronUpIcon, 4 collapsed -> ChevronDownIcon
      expect(countOccurrences(text, 'ChevronUpIcon')).toBe(1);
      expect(countOccurrences(text, 'ChevronDownIcon')).toBe(4);
    });

    it('does not show content for collapsed sections by default', () => {
      const tree = renderComponent({
        strategy: fullStrategy,
        loading: false,
        colors: mockColors,
      });
      const text = getTreeText(tree.toJSON());

      // Themes content should NOT be visible (collapsed)
      expect(text).not.toContain('Leadership');
      expect(text).not.toContain('Problem solving');

      // Stories content should NOT be visible
      expect(text).not.toContain('Overcoming challenges');

      // Questions content should NOT be visible
      expect(text).not.toContain('What does success look like');

      // Checklist content should NOT be visible
      expect(text).not.toContain('Research the company website');
    });
  });

  // ---- Toggle / Expand-Collapse Behavior ----
  describe('expand/collapse toggle behavior', () => {
    it('collapses approach section when tapped (toggle off)', () => {
      const tree = renderComponent({
        strategy: fullStrategy,
        loading: false,
        colors: mockColors,
      });

      const root = tree.root;
      const approachButtons = root.findAll(
        (node: any) => node.props && node.props.accessibilityRole === 'button'
      );
      expect(approachButtons.length).toBeGreaterThanOrEqual(5);

      // First button is approach
      renderer.act(() => {
        approachButtons[0].props.onPress();
      });

      const textAfter = getTreeText(tree.toJSON());
      // Approach content should now be hidden
      expect(textAfter).not.toContain('Start with a strong opening');

      // All sections should now show ChevronDown (none expanded)
      expect(countOccurrences(textAfter, 'ChevronUpIcon')).toBe(0);
      expect(countOccurrences(textAfter, 'ChevronDownIcon')).toBe(5);
    });

    it('expands themes section when tapped', () => {
      const tree = renderComponent({
        strategy: fullStrategy,
        loading: false,
        colors: mockColors,
      });
      const root = tree.root;
      const buttons = root.findAll(
        (node: any) => node.props && node.props.accessibilityRole === 'button'
      );

      // Second button is themes
      renderer.act(() => {
        buttons[1].props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      // Themes content should now be visible
      expect(text).toContain('Leadership');
      expect(text).toContain('Problem solving');
      expect(text).toContain('Team collaboration');

      // Approach should now be collapsed (only one expanded at a time)
      expect(text).not.toContain('Start with a strong opening');
    });

    it('expands stories section and shows story items', () => {
      const tree = renderComponent({
        strategy: fullStrategy,
        loading: false,
        colors: mockColors,
      });
      const root = tree.root;
      const buttons = root.findAll(
        (node: any) => node.props && node.props.accessibilityRole === 'button'
      );

      // Third button is stories
      renderer.act(() => {
        buttons[2].props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Overcoming challenges');
      expect(text).toContain('Describe a time you overcame a major obstacle');
      expect(text).toContain('Innovation');
      expect(text).toContain('creative problem solving');

      // Story numbers should be rendered
      expect(text).toContain('1');
      expect(text).toContain('2');
    });

    it('expands questions section and shows question items', () => {
      const tree = renderComponent({
        strategy: fullStrategy,
        loading: false,
        colors: mockColors,
      });
      const root = tree.root;
      const buttons = root.findAll(
        (node: any) => node.props && node.props.accessibilityRole === 'button'
      );

      // Fourth button is questions
      renderer.act(() => {
        buttons[3].props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('What does success look like in this role?');
      expect(text).toContain('How is the team structured?');
    });

    it('expands checklist section and shows checklist items with Check icons', () => {
      const tree = renderComponent({
        strategy: fullStrategy,
        loading: false,
        colors: mockColors,
      });
      const root = tree.root;
      const buttons = root.findAll(
        (node: any) => node.props && node.props.accessibilityRole === 'button'
      );

      // Fifth button is checklist
      renderer.act(() => {
        buttons[4].props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Research the company website');
      expect(text).toContain('Review the job description');
      expect(text).toContain('Prepare STAR stories');

      // Check icons rendered as "CheckIcon" strings (3 items)
      expect(countOccurrences(text, 'CheckIcon')).toBe(3);
    });

    it('toggling same section twice collapses then re-expands it', () => {
      const tree = renderComponent({
        strategy: fullStrategy,
        loading: false,
        colors: mockColors,
      });
      const root = tree.root;
      const buttons = root.findAll(
        (node: any) => node.props && node.props.accessibilityRole === 'button'
      );

      // Approach is expanded by default - collapse it
      renderer.act(() => {
        buttons[0].props.onPress();
      });
      expect(getTreeText(tree.toJSON())).not.toContain('Start with a strong opening');

      // Re-expand approach
      renderer.act(() => {
        buttons[0].props.onPress();
      });
      expect(getTreeText(tree.toJSON())).toContain('Start with a strong opening');
    });

    it('switching sections collapses old and expands new', () => {
      const tree = renderComponent({
        strategy: fullStrategy,
        loading: false,
        colors: mockColors,
      });
      const root = tree.root;
      const buttons = root.findAll(
        (node: any) => node.props && node.props.accessibilityRole === 'button'
      );

      // Expand themes (collapses approach)
      renderer.act(() => {
        buttons[1].props.onPress();
      });
      let text = getTreeText(tree.toJSON());
      expect(text).toContain('Leadership');
      expect(text).not.toContain('Start with a strong opening');

      // Switch to checklist (collapses themes)
      renderer.act(() => {
        buttons[4].props.onPress();
      });
      text = getTreeText(tree.toJSON());
      expect(text).toContain('Research the company website');
      expect(text).not.toContain('Leadership');
    });
  });

  // ---- Missing / Empty Fields ----
  describe('missing or empty fields', () => {
    it('hides approach section when recommended_approach is undefined', () => {
      const strategy: InterviewStrategy = {
        ...fullStrategy,
        recommended_approach: undefined,
      };
      const tree = renderComponent({ strategy, loading: false, colors: mockColors });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Recommended Approach');
    });

    it('hides approach section when recommended_approach is empty string', () => {
      const strategy: InterviewStrategy = {
        ...fullStrategy,
        recommended_approach: '',
      };
      const tree = renderComponent({ strategy, loading: false, colors: mockColors });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Recommended Approach');
    });

    it('hides themes section when key_themes_to_emphasize is undefined', () => {
      const strategy: InterviewStrategy = {
        ...fullStrategy,
        key_themes_to_emphasize: undefined,
      };
      const tree = renderComponent({ strategy, loading: false, colors: mockColors });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Key Themes to Emphasize');
    });

    it('hides themes section when key_themes_to_emphasize is empty array', () => {
      const strategy: InterviewStrategy = {
        ...fullStrategy,
        key_themes_to_emphasize: [],
      };
      const tree = renderComponent({ strategy, loading: false, colors: mockColors });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Key Themes to Emphasize');
    });

    it('hides stories section when stories_to_prepare is undefined', () => {
      const strategy: InterviewStrategy = {
        ...fullStrategy,
        stories_to_prepare: undefined,
      };
      const tree = renderComponent({ strategy, loading: false, colors: mockColors });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Stories to Prepare');
    });

    it('hides stories section when stories_to_prepare is empty array', () => {
      const strategy: InterviewStrategy = {
        ...fullStrategy,
        stories_to_prepare: [],
      };
      const tree = renderComponent({ strategy, loading: false, colors: mockColors });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Stories to Prepare');
    });

    it('hides questions section when questions_to_ask_interviewer is undefined', () => {
      const strategy: InterviewStrategy = {
        ...fullStrategy,
        questions_to_ask_interviewer: undefined,
      };
      const tree = renderComponent({ strategy, loading: false, colors: mockColors });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Questions to Ask Interviewer');
    });

    it('hides questions section when questions_to_ask_interviewer is empty array', () => {
      const strategy: InterviewStrategy = {
        ...fullStrategy,
        questions_to_ask_interviewer: [],
      };
      const tree = renderComponent({ strategy, loading: false, colors: mockColors });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Questions to Ask Interviewer');
    });

    it('hides checklist section when pre_interview_checklist is undefined', () => {
      const strategy: InterviewStrategy = {
        ...fullStrategy,
        pre_interview_checklist: undefined,
      };
      const tree = renderComponent({ strategy, loading: false, colors: mockColors });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Pre-Interview Checklist');
    });

    it('hides checklist section when pre_interview_checklist is empty array', () => {
      const strategy: InterviewStrategy = {
        ...fullStrategy,
        pre_interview_checklist: [],
      };
      const tree = renderComponent({ strategy, loading: false, colors: mockColors });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Pre-Interview Checklist');
    });

    it('renders only approach section when all other fields are missing', () => {
      const strategy: InterviewStrategy = {
        recommended_approach: 'Focus on your strengths.',
      };
      const tree = renderComponent({ strategy, loading: false, colors: mockColors });
      const text = getTreeText(tree.toJSON());

      expect(text).toContain('Recommended Approach');
      expect(text).toContain('Focus on your strengths.');
      expect(text).not.toContain('Key Themes to Emphasize');
      expect(text).not.toContain('Stories to Prepare');
      expect(text).not.toContain('Questions to Ask Interviewer');
      expect(text).not.toContain('Pre-Interview Checklist');

      // Only 1 section button
      const root = tree.root;
      const buttons = root.findAll(
        (node: any) => node.props && node.props.accessibilityRole === 'button'
      );
      expect(buttons.length).toBe(1);
    });

    it('renders with completely empty strategy object (no sections shown)', () => {
      const strategy: InterviewStrategy = {};
      const tree = renderComponent({ strategy, loading: false, colors: mockColors });
      const text = getTreeText(tree.toJSON());

      // Header should still show
      expect(text).toContain('Interview Strategy');
      expect(text).toContain('Your game plan for interview success');

      // No section headers
      expect(text).not.toContain('Recommended Approach');
      expect(text).not.toContain('Key Themes to Emphasize');
      expect(text).not.toContain('Stories to Prepare');
      expect(text).not.toContain('Questions to Ask Interviewer');
      expect(text).not.toContain('Pre-Interview Checklist');
    });
  });

  // ---- Partial Data Combinations ----
  describe('partial data combinations', () => {
    it('renders only themes and checklist when other fields are missing', () => {
      const strategy: InterviewStrategy = {
        key_themes_to_emphasize: ['Teamwork', 'Adaptability'],
        pre_interview_checklist: ['Review notes'],
      };
      const tree = renderComponent({ strategy, loading: false, colors: mockColors });
      const text = getTreeText(tree.toJSON());

      expect(text).toContain('Key Themes to Emphasize');
      expect(text).toContain('Pre-Interview Checklist');
      expect(text).not.toContain('Recommended Approach');
      expect(text).not.toContain('Stories to Prepare');
      expect(text).not.toContain('Questions to Ask Interviewer');

      // Default expandedSection='approach' but approach is absent, so all collapsed
      expect(countOccurrences(text, 'ChevronUpIcon')).toBe(0);
      expect(countOccurrences(text, 'ChevronDownIcon')).toBe(2);
    });

    it('expands themes section from collapsed state (no approach present)', () => {
      const strategy: InterviewStrategy = {
        key_themes_to_emphasize: ['Innovation', 'Growth'],
      };
      const tree = renderComponent({ strategy, loading: false, colors: mockColors });

      // Initially collapsed (default expanded is approach, which is missing)
      expect(getTreeText(tree.toJSON())).not.toContain('Innovation');

      const root = tree.root;
      const buttons = root.findAll(
        (node: any) => node.props && node.props.accessibilityRole === 'button'
      );
      expect(buttons.length).toBe(1);

      renderer.act(() => {
        buttons[0].props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Innovation');
      expect(text).toContain('Growth');
    });

    it('renders single story item correctly', () => {
      const strategy: InterviewStrategy = {
        stories_to_prepare: [
          { theme: 'Leadership moment', description: 'Led a team of 10 engineers.' },
        ],
      };
      const tree = renderComponent({ strategy, loading: false, colors: mockColors });
      const root = tree.root;
      const buttons = root.findAll(
        (node: any) => node.props && node.props.accessibilityRole === 'button'
      );

      renderer.act(() => {
        buttons[0].props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Leadership moment');
      expect(text).toContain('Led a team of 10 engineers');
      expect(text).toContain('1');
    });

    it('renders single question item correctly', () => {
      const strategy: InterviewStrategy = {
        questions_to_ask_interviewer: ['What is the biggest challenge?'],
      };
      const tree = renderComponent({ strategy, loading: false, colors: mockColors });
      const root = tree.root;
      const buttons = root.findAll(
        (node: any) => node.props && node.props.accessibilityRole === 'button'
      );

      renderer.act(() => {
        buttons[0].props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('What is the biggest challenge?');
    });

    it('renders single checklist item with CheckIcon', () => {
      const strategy: InterviewStrategy = {
        pre_interview_checklist: ['Dress professionally'],
      };
      const tree = renderComponent({ strategy, loading: false, colors: mockColors });
      const root = tree.root;
      const buttons = root.findAll(
        (node: any) => node.props && node.props.accessibilityRole === 'button'
      );

      renderer.act(() => {
        buttons[0].props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Dress professionally');
      // "CheckIcon" but not "CheckCircleIcon" for the checklist items
      // The section header has "CheckCircleIcon"; each item has "CheckIcon"
      expect(countOccurrences(text, 'CheckIcon')).toBe(1);
    });
  });

  // ---- Color / Style Verification ----
  describe('color and style verification', () => {
    it('applies colors.text to the main title', () => {
      const tree = renderComponent({
        strategy: fullStrategy,
        loading: false,
        colors: mockColors,
      });
      const root = tree.root;
      // Find text nodes containing "Interview Strategy"
      const textNodes = root.findAll(
        (node: any) => {
          try {
            return (
              node.type === 'Text' &&
              node.children &&
              node.children.includes('Interview Strategy')
            );
          } catch { return false; }
        }
      );
      expect(textNodes.length).toBeGreaterThanOrEqual(1);
      const titleStyle = textNodes[0].props.style;
      const flatStyle = Array.isArray(titleStyle)
        ? Object.assign({}, ...titleStyle)
        : titleStyle;
      expect(flatStyle.color).toBe('#ffffff');
    });

    it('applies colors.textSecondary to the subtitle', () => {
      const tree = renderComponent({
        strategy: fullStrategy,
        loading: false,
        colors: mockColors,
      });
      const root = tree.root;
      const subtitleNodes = root.findAll(
        (node: any) => {
          try {
            return (
              node.type === 'Text' &&
              node.children &&
              node.children.some &&
              node.children.some((c: any) =>
                typeof c === 'string' && c.includes('game plan')
              )
            );
          } catch { return false; }
        }
      );
      expect(subtitleNodes.length).toBe(1);
      const style = subtitleNodes[0].props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style)
        : style;
      expect(flatStyle.color).toBe('#9ca3af');
    });

    it('renders approach highlight box with primary alpha colors', () => {
      const tree = renderComponent({
        strategy: fullStrategy,
        loading: false,
        colors: mockColors,
      });
      const json = tree.toJSON();

      const findHighlightBox = (node: any): any => {
        if (!node || typeof node === 'string') return null;
        if (Array.isArray(node)) {
          for (const n of node) {
            const found = findHighlightBox(n);
            if (found) return found;
          }
          return null;
        }
        if (node.type === 'View' && node.props && node.props.style) {
          const style = Array.isArray(node.props.style)
            ? Object.assign({}, ...node.props.style)
            : node.props.style;
          if (style.borderLeftWidth === 3 && style.backgroundColor === ALPHA_COLORS.primary.bg) {
            return node;
          }
        }
        if (node.children) {
          for (const child of node.children) {
            const found = findHighlightBox(child);
            if (found) return found;
          }
        }
        return null;
      };

      const highlightBox = findHighlightBox(json);
      expect(highlightBox).not.toBeNull();
    });

    it('applies correct background to icon container', () => {
      const tree = renderComponent({
        strategy: fullStrategy,
        loading: false,
        colors: mockColors,
      });
      const json = tree.toJSON();

      const iconContainers = findAllByType(json, 'View').filter((v: any) => {
        if (!v.props || !v.props.style) return false;
        const style = Array.isArray(v.props.style)
          ? Object.assign({}, ...v.props.style)
          : v.props.style;
        return style.backgroundColor === ALPHA_COLORS.primary.bg && style.width === 40;
      });
      expect(iconContainers.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ---- Questions section highlight box ----
  describe('questions section highlight box', () => {
    it('renders questions in info-colored highlight box', () => {
      const tree = renderComponent({
        strategy: fullStrategy,
        loading: false,
        colors: mockColors,
      });
      const root = tree.root;
      const buttons = root.findAll(
        (node: any) => node.props && node.props.accessibilityRole === 'button'
      );

      // Expand questions section (4th button)
      renderer.act(() => {
        buttons[3].props.onPress();
      });

      const json = tree.toJSON();
      const findInfoBox = (node: any): any => {
        if (!node || typeof node === 'string') return null;
        if (Array.isArray(node)) {
          for (const n of node) {
            const found = findInfoBox(n);
            if (found) return found;
          }
          return null;
        }
        if (node.type === 'View' && node.props && node.props.style) {
          const style = Array.isArray(node.props.style)
            ? Object.assign({}, ...node.props.style)
            : node.props.style;
          if (style.backgroundColor === ALPHA_COLORS.info.bg && style.borderColor === COLORS.info) {
            return node;
          }
        }
        if (node.children) {
          for (const child of node.children) {
            const found = findInfoBox(child);
            if (found) return found;
          }
        }
        return null;
      };

      const infoBox = findInfoBox(json);
      expect(infoBox).not.toBeNull();

      const text = getTreeText(json);
      expect(text).toContain('What does success look like');
      expect(text).toContain('How is the team structured');
    });
  });

  // ---- Edge cases for story numbering ----
  describe('story numbering', () => {
    it('numbers stories starting from 1', () => {
      const strategy: InterviewStrategy = {
        stories_to_prepare: [
          { theme: 'First', description: 'desc1' },
          { theme: 'Second', description: 'desc2' },
          { theme: 'Third', description: 'desc3' },
        ],
      };
      const tree = renderComponent({ strategy, loading: false, colors: mockColors });
      const root = tree.root;
      const buttons = root.findAll(
        (node: any) => node.props && node.props.accessibilityRole === 'button'
      );

      renderer.act(() => {
        buttons[0].props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('1');
      expect(text).toContain('2');
      expect(text).toContain('3');
      expect(text).toContain('First');
      expect(text).toContain('Second');
      expect(text).toContain('Third');
    });
  });

  // ---- Many items in arrays ----
  describe('many items in arrays', () => {
    it('renders all theme items when expanded', () => {
      const themes = Array.from({ length: 10 }, (_, i) => `Theme ${i + 1}`);
      const strategy: InterviewStrategy = {
        key_themes_to_emphasize: themes,
      };
      const tree = renderComponent({ strategy, loading: false, colors: mockColors });
      const root = tree.root;
      const buttons = root.findAll(
        (node: any) => node.props && node.props.accessibilityRole === 'button'
      );

      renderer.act(() => {
        buttons[0].props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      themes.forEach(theme => {
        expect(text).toContain(theme);
      });
    });

    it('renders all checklist items with CheckIcon when expanded', () => {
      const items = Array.from({ length: 8 }, (_, i) => `Checklist item ${i + 1}`);
      const strategy: InterviewStrategy = {
        pre_interview_checklist: items,
      };
      const tree = renderComponent({ strategy, loading: false, colors: mockColors });
      const root = tree.root;
      const buttons = root.findAll(
        (node: any) => node.props && node.props.accessibilityRole === 'button'
      );

      renderer.act(() => {
        buttons[0].props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      items.forEach(item => {
        expect(text).toContain(item);
      });

      // Each item has a "CheckIcon" string
      expect(countOccurrences(text, 'CheckIcon')).toBe(8);
    });
  });
});
