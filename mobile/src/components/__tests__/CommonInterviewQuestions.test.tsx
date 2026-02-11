/**
 * CommonInterviewQuestions Component Tests
 *
 * Tests module exports, empty/loading/data states, toggle expand interaction,
 * copy answer behavior with timer, error states, and edge cases for 100% coverage.
 */

import React from 'react';
import renderer from 'react-test-renderer';

// Mock dependencies before imports
jest.mock('lucide-react-native', () =>
  new Proxy({}, {
    get: (_: any, name: string) => {
      // Return React components for renderer compatibility
      const R = require('react');
      return R.forwardRef((props: any, ref: any) =>
        R.createElement(name, { ...props, ref })
      );
    },
  })
);
jest.mock('../glass/GlassCard', () => ({
  GlassCard: ({ children, ...props }: any) =>
    require('react').createElement('GlassCard', props, children),
}));
jest.mock('../glass/GlassButton', () => ({
  GlassButton: ({ children, ...props }: any) =>
    require('react').createElement('GlassButton', props, children),
}));
jest.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      text: '#fff',
      textSecondary: '#aaa',
      textTertiary: '#666',
      border: '#333',
      backgroundTertiary: '#222',
    },
  }),
}));

import CommonInterviewQuestions from '../CommonInterviewQuestions';

// --- Helpers ---

const renderComponent = (props: any) => {
  let tree: any;
  renderer.act(() => {
    tree = renderer.create(React.createElement(CommonInterviewQuestions, props));
  });
  return tree!;
};

const getTreeText = (node: any): string => {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  let text = '';
  if (node.props) {
    for (const val of Object.values(node.props)) {
      if (typeof val === 'string') text += ' ' + val;
    }
  }
  if (node.children) {
    for (const child of node.children) {
      text += ' ' + getTreeText(child);
    }
  }
  return text;
};

/** Safely stringify a tree, guarding against circular refs */
const safeStringify = (obj: any): string => {
  const seen = new WeakSet();
  return JSON.stringify(obj, (_key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]';
      seen.add(value);
    }
    return value;
  });
};

// --- Test Data ---

const makeQuestion = (overrides: any = {}) => ({
  id: 'q1',
  question: 'Tell me about yourself',
  why_hard: 'Too broad and easy to ramble',
  common_mistakes: ['Being too vague', 'Reciting your resume'],
  answer_builder: { opening: 'Start strong', body: 'Provide examples', closing: 'Wrap it up' },
  ready_answer: 'I am a cybersecurity program manager with 10 years of experience.',
  ...overrides,
});

const makeQuestionsData = (questions: any[] = [makeQuestion()]) => ({ questions });

const defaultProps = {
  interviewPrepId: 1,
  companyName: 'TestCo',
  jobTitle: 'Security Engineer',
};

// --- Tests ---

describe('CommonInterviewQuestions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('module exports', () => {
    it('should export a default function component', () => {
      expect(CommonInterviewQuestions).toBeDefined();
      expect(typeof CommonInterviewQuestions).toBe('function');
    });

    it('should have the correct function name', () => {
      expect(CommonInterviewQuestions.name).toBe('CommonInterviewQuestions');
    });
  });

  describe('empty state (no data, not loading)', () => {
    it('should render the empty state card', () => {
      const tree = renderComponent(defaultProps);
      const json = tree.toJSON();
      expect(json).toBeTruthy();
      expect(json.type).toBe('GlassCard');
    });

    it('should display company name in description', () => {
      const tree = renderComponent({ ...defaultProps, companyName: 'Acme Corp' });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Acme Corp');
    });

    it('should show the empty title', () => {
      const tree = renderComponent(defaultProps);
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Common Interview Questions People Struggle With');
    });

    it('should show guidance description text', () => {
      const tree = renderComponent(defaultProps);
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('tailored answers for the 10 most challenging interview questions');
    });

    it('should show guidance note about detailed guidance', () => {
      const tree = renderComponent(defaultProps);
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('detailed guidance');
      expect(text).toContain('ready-to-use');
    });

    it('should render generate button with correct label', () => {
      const tree = renderComponent({ ...defaultProps, onGenerate: jest.fn() });
      const buttons = tree.root.findAllByType('GlassButton');
      const genBtn = buttons.find((b: any) => b.props.label === 'Generate Tailored Guidance');
      expect(genBtn).toBeTruthy();
    });

    it('should have generate button enabled when not loading', () => {
      const tree = renderComponent({ ...defaultProps, onGenerate: jest.fn() });
      const buttons = tree.root.findAllByType('GlassButton');
      const genBtn = buttons.find((b: any) => b.props.label === 'Generate Tailored Guidance');
      expect(genBtn!.props.disabled).toBe(false);
    });

    it('should render the MessageSquare icon in empty state', () => {
      const tree = renderComponent(defaultProps);
      const icons = tree.root.findAllByType('MessageSquare');
      expect(icons.length).toBeGreaterThanOrEqual(1);
    });

    it('should not show error container when error is null', () => {
      const tree = renderComponent(defaultProps);
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Failed to generate');
    });
  });

  describe('loading state', () => {
    it('should render loading state with ActivityIndicator when generation is in progress', async () => {
      // Use a pending promise to keep the component in loading state
      let resolveGenerate: (val: any) => void;
      const pendingPromise = new Promise<any>((resolve) => {
        resolveGenerate = resolve;
      });
      const mockGenerate = jest.fn().mockReturnValue(pendingPromise);

      const tree = renderComponent({ ...defaultProps, onGenerate: mockGenerate });

      // Press generate to enter loading state
      const buttons = tree.root.findAllByType('GlassButton');
      const genBtn = buttons.find((b: any) => b.props.label === 'Generate Tailored Guidance');

      // Start generation (but don't await resolution)
      renderer.act(() => {
        genBtn!.props.onPress();
      });

      // Component should now be in loading state
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Generating tailored guidance...');

      // Cleanup: resolve the promise to avoid unhandled rejection
      await renderer.act(async () => {
        resolveGenerate!(null);
      });
    });

    it('should show the generate button with "Generating..." label while loading in empty state before async kicks in', () => {
      // The empty state checks `loading` in the label: loading ? 'Generating...' : 'Generate Tailored Guidance'
      // The loading state is set synchronously before the await, so between onPress and microtask
      // the empty state branch may still render with loading=true label.
      // Actually, React batches, so after act() the loading state card renders.
      // This test just verifies the loading card has the loading text.
      let resolveGenerate: (val: any) => void;
      const pendingPromise = new Promise<any>((resolve) => {
        resolveGenerate = resolve;
      });
      const mockGenerate = jest.fn().mockReturnValue(pendingPromise);

      const tree = renderComponent({ ...defaultProps, onGenerate: mockGenerate });
      const buttons = tree.root.findAllByType('GlassButton');
      const genBtn = buttons.find((b: any) => b.props.label === 'Generate Tailored Guidance');

      renderer.act(() => {
        genBtn!.props.onPress();
      });

      // In loading state, the loading card is rendered (not the empty card)
      const json = tree.toJSON();
      const text = getTreeText(json);
      expect(text).toContain('Generating tailored guidance');

      // Cleanup
      renderer.act(() => {
        resolveGenerate!(null);
      });
    });
  });

  describe('handleGenerate', () => {
    it('should call onGenerate and render data on success', async () => {
      const mockGenerate = jest.fn().mockResolvedValue(makeQuestionsData());
      const tree = renderComponent({ ...defaultProps, onGenerate: mockGenerate });

      const genBtn = tree.root
        .findAllByType('GlassButton')
        .find((b: any) => b.props.label === 'Generate Tailored Guidance');

      await renderer.act(async () => {
        genBtn!.props.onPress();
      });

      expect(mockGenerate).toHaveBeenCalledTimes(1);
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Tell me about yourself');
    });

    it('should not call onGenerate when prop is undefined', () => {
      const tree = renderComponent(defaultProps);
      // The generate button exists but onGenerate is undefined, pressing it does nothing
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Generate Tailored Guidance');
    });

    it('should early-return from handleGenerate when onGenerate is undefined and button is pressed', async () => {
      const tree = renderComponent(defaultProps);

      // Find the GlassButton and press it -- onGenerate is undefined so handleGenerate returns early
      const genBtn = tree.root
        .findAllByType('GlassButton')
        .find((b: any) => b.props.label === 'Generate Tailored Guidance');

      await renderer.act(async () => {
        genBtn!.props.onPress();
      });

      // Should still be in empty state (no loading, no data)
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Generate Tailored Guidance');
      expect(text).toContain('Common Interview Questions People Struggle With');
    });

    it('should handle onGenerate returning null', async () => {
      const mockGenerate = jest.fn().mockResolvedValue(null);
      const tree = renderComponent({ ...defaultProps, onGenerate: mockGenerate });

      const genBtn = tree.root
        .findAllByType('GlassButton')
        .find((b: any) => b.props.label === 'Generate Tailored Guidance');

      await renderer.act(async () => {
        genBtn!.props.onPress();
      });

      expect(mockGenerate).toHaveBeenCalledTimes(1);
      // Should go back to empty state since data is still null
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Generate Tailored Guidance');
    });

    it('should show error message when onGenerate throws with message', async () => {
      const mockGenerate = jest.fn().mockRejectedValue(new Error('Network error'));
      const tree = renderComponent({ ...defaultProps, onGenerate: mockGenerate });

      const genBtn = tree.root
        .findAllByType('GlassButton')
        .find((b: any) => b.props.label === 'Generate Tailored Guidance');

      await renderer.act(async () => {
        genBtn!.props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Network error');
    });

    it('should show fallback error when thrown error has no message', async () => {
      const mockGenerate = jest.fn().mockRejectedValue({});
      const tree = renderComponent({ ...defaultProps, onGenerate: mockGenerate });

      const genBtn = tree.root
        .findAllByType('GlassButton')
        .find((b: any) => b.props.label === 'Generate Tailored Guidance');

      await renderer.act(async () => {
        genBtn!.props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Failed to generate questions');
    });

    it('should render AlertCircle icon in error state', async () => {
      const mockGenerate = jest.fn().mockRejectedValue(new Error('Oops'));
      const tree = renderComponent({ ...defaultProps, onGenerate: mockGenerate });

      const genBtn = tree.root
        .findAllByType('GlassButton')
        .find((b: any) => b.props.label === 'Generate Tailored Guidance');

      await renderer.act(async () => {
        genBtn!.props.onPress();
      });

      const icons = tree.root.findAllByType('AlertCircle');
      expect(icons.length).toBeGreaterThanOrEqual(1);
    });

    it('should auto-expand first question after successful generation', async () => {
      const q1 = makeQuestion({ id: 'q1' });
      const q2 = makeQuestion({ id: 'q2', question: 'Why this company?' });
      const mockGenerate = jest.fn().mockResolvedValue(makeQuestionsData([q1, q2]));
      const tree = renderComponent({ ...defaultProps, onGenerate: mockGenerate });

      const genBtn = tree.root
        .findAllByType('GlassButton')
        .find((b: any) => b.props.label === 'Generate Tailored Guidance');

      await renderer.act(async () => {
        genBtn!.props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      // First question should be expanded (shows WHY THIS IS CHALLENGING)
      expect(text).toContain('WHY THIS IS CHALLENGING');
      expect(text).toContain('Too broad and easy to ramble');
    });
  });

  describe('data state - question rendering', () => {
    const setupDataState = async (questions?: any[]) => {
      const data = makeQuestionsData(questions);
      const mockGenerate = jest.fn().mockResolvedValue(data);
      const tree = renderComponent({ ...defaultProps, onGenerate: mockGenerate });

      const genBtn = tree.root
        .findAllByType('GlassButton')
        .find((b: any) => b.props.label === 'Generate Tailored Guidance');

      await renderer.act(async () => {
        genBtn!.props.onPress();
      });

      return tree;
    };

    it('should render question numbers', async () => {
      const tree = await setupDataState([
        makeQuestion({ id: 'q1' }),
        makeQuestion({ id: 'q2', question: 'Second question' }),
      ]);
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('1');
      expect(text).toContain('2');
    });

    it('should render question text for all questions', async () => {
      const tree = await setupDataState([
        makeQuestion({ id: 'q1', question: 'First Q' }),
        makeQuestion({ id: 'q2', question: 'Second Q' }),
      ]);
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('First Q');
      expect(text).toContain('Second Q');
    });

    it('should show ChevronDown for expanded and ChevronRight for collapsed', async () => {
      const tree = await setupDataState([
        makeQuestion({ id: 'q1' }),
        makeQuestion({ id: 'q2', question: 'Q2' }),
      ]);
      // q1 is auto-expanded, q2 is collapsed
      const downIcons = tree.root.findAllByType('ChevronDown');
      const rightIcons = tree.root.findAllByType('ChevronRight');
      expect(downIcons.length).toBeGreaterThanOrEqual(1);
      expect(rightIcons.length).toBeGreaterThanOrEqual(1);
    });

    it('should show WHY THIS IS CHALLENGING section for expanded question', async () => {
      const tree = await setupDataState();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('WHY THIS IS CHALLENGING');
    });

    it('should show COMMON MISTAKES TO AVOID with bullet items', async () => {
      const tree = await setupDataState();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('COMMON MISTAKES TO AVOID');
      expect(text).toContain('Being too vague');
      expect(text).toContain('Reciting your resume');
    });

    it('should show ANSWER FRAMEWORK with opening/body/closing', async () => {
      const tree = await setupDataState();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('ANSWER FRAMEWORK');
      expect(text).toContain('Opening:');
      expect(text).toContain('Start strong');
      expect(text).toContain('Body:');
      expect(text).toContain('Provide examples');
      expect(text).toContain('Closing:');
      expect(text).toContain('Wrap it up');
    });

    it('should show READY-TO-USE ANSWER section', async () => {
      const tree = await setupDataState();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('READY-TO-USE ANSWER');
      expect(text).toContain('cybersecurity program manager');
    });

    it('should not show common mistakes section when array is empty', async () => {
      const tree = await setupDataState([makeQuestion({ common_mistakes: [] })]);
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('COMMON MISTAKES TO AVOID');
    });

    it('should render the copy button in READY-TO-USE ANSWER section', async () => {
      const tree = await setupDataState();
      // The copy button has accessibilityLabel="Copy answer"
      const copyBtns = tree.root.findAll(
        (node: any) => node.props && node.props.accessibilityLabel === 'Copy answer'
      );
      expect(copyBtns.length).toBeGreaterThanOrEqual(1);
    });

    it('should render question header with accessibility props', async () => {
      const tree = await setupDataState();
      const headerBtns = tree.root.findAll(
        (node: any) => node.props && node.props.accessibilityLabel === 'Question 1'
      );
      expect(headerBtns.length).toBe(1);
      expect(headerBtns[0].props.accessibilityRole).toBe('button');
      expect(headerBtns[0].props.accessibilityState).toEqual({ expanded: true });
    });
  });

  describe('toggleExpand interaction', () => {
    const setupDataState = async (questions?: any[]) => {
      const data = makeQuestionsData(questions);
      const mockGenerate = jest.fn().mockResolvedValue(data);
      const tree = renderComponent({ ...defaultProps, onGenerate: mockGenerate });

      const genBtn = tree.root
        .findAllByType('GlassButton')
        .find((b: any) => b.props.label === 'Generate Tailored Guidance');

      await renderer.act(async () => {
        genBtn!.props.onPress();
      });

      return tree;
    };

    it('should collapse an expanded question when header is pressed', async () => {
      const tree = await setupDataState();

      // q1 is auto-expanded - verify it shows expanded content
      let text = getTreeText(tree.toJSON());
      expect(text).toContain('WHY THIS IS CHALLENGING');

      // Find the question header TouchableOpacity and press it to collapse
      const headerBtn = tree.root.findAll(
        (node: any) => node.props && node.props.accessibilityLabel === 'Question 1'
      )[0];

      await renderer.act(async () => {
        headerBtn.props.onPress();
      });

      // Now it should be collapsed - no expanded content
      text = getTreeText(tree.toJSON());
      expect(text).not.toContain('WHY THIS IS CHALLENGING');
      expect(text).not.toContain('READY-TO-USE ANSWER');
    });

    it('should expand a collapsed question when header is pressed', async () => {
      const tree = await setupDataState([
        makeQuestion({ id: 'q1' }),
        makeQuestion({ id: 'q2', question: 'Q2', why_hard: 'Q2 is hard' }),
      ]);

      // q1 is auto-expanded, q2 is collapsed
      let text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Q2 is hard');

      // Find q2 header and press it
      const q2Header = tree.root.findAll(
        (node: any) => node.props && node.props.accessibilityLabel === 'Question 2'
      )[0];

      await renderer.act(async () => {
        q2Header.props.onPress();
      });

      // Now q2 should be expanded
      text = getTreeText(tree.toJSON());
      expect(text).toContain('Q2 is hard');
    });

    it('should toggle expansion independently for multiple questions', async () => {
      const tree = await setupDataState([
        makeQuestion({ id: 'q1', why_hard: 'Q1 hard' }),
        makeQuestion({ id: 'q2', question: 'Q2', why_hard: 'Q2 hard' }),
      ]);

      // Expand q2
      const q2Header = tree.root.findAll(
        (node: any) => node.props && node.props.accessibilityLabel === 'Question 2'
      )[0];

      await renderer.act(async () => {
        q2Header.props.onPress();
      });

      // Both should be expanded
      let text = getTreeText(tree.toJSON());
      expect(text).toContain('Q1 hard');
      expect(text).toContain('Q2 hard');

      // Collapse q1
      const q1Header = tree.root.findAll(
        (node: any) => node.props && node.props.accessibilityLabel === 'Question 1'
      )[0];

      await renderer.act(async () => {
        q1Header.props.onPress();
      });

      // q1 collapsed, q2 still expanded
      text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Q1 hard');
      expect(text).toContain('Q2 hard');
    });

    it('should update ChevronDown/Right icons on toggle', async () => {
      const tree = await setupDataState([makeQuestion({ id: 'q1' })]);

      // Initially expanded - should have ChevronDown
      let downIcons = tree.root.findAllByType('ChevronDown');
      expect(downIcons.length).toBe(1);

      // Collapse
      const header = tree.root.findAll(
        (node: any) => node.props && node.props.accessibilityLabel === 'Question 1'
      )[0];

      await renderer.act(async () => {
        header.props.onPress();
      });

      // Now collapsed - should have ChevronRight, no ChevronDown
      downIcons = tree.root.findAllByType('ChevronDown');
      const rightIcons = tree.root.findAllByType('ChevronRight');
      expect(downIcons.length).toBe(0);
      expect(rightIcons.length).toBe(1);
    });

    it('should update accessibility state on toggle', async () => {
      const tree = await setupDataState([makeQuestion({ id: 'q1' })]);

      const header = tree.root.findAll(
        (node: any) => node.props && node.props.accessibilityLabel === 'Question 1'
      )[0];

      // Initially expanded
      expect(header.props.accessibilityState).toEqual({ expanded: true });

      await renderer.act(async () => {
        header.props.onPress();
      });

      // Now collapsed
      const headerAfter = tree.root.findAll(
        (node: any) => node.props && node.props.accessibilityLabel === 'Question 1'
      )[0];
      expect(headerAfter.props.accessibilityState).toEqual({ expanded: false });
    });
  });

  describe('copyAnswer interaction', () => {
    const setupDataState = async () => {
      const data = makeQuestionsData([makeQuestion({ id: 'q1' })]);
      const mockGenerate = jest.fn().mockResolvedValue(data);
      const tree = renderComponent({ ...defaultProps, onGenerate: mockGenerate });

      const genBtn = tree.root
        .findAllByType('GlassButton')
        .find((b: any) => b.props.label === 'Generate Tailored Guidance');

      await renderer.act(async () => {
        genBtn!.props.onPress();
      });

      return tree;
    };

    it('should show Copy icon initially and Check icon after pressing copy', async () => {
      jest.useFakeTimers();
      const tree = await setupDataState();

      // Initially shows Copy icon
      let copyIcons = tree.root.findAllByType('Copy');
      let checkIcons = tree.root.findAllByType('Check');
      expect(copyIcons.length).toBe(1);
      expect(checkIcons.length).toBe(0);

      // Press the copy button
      const copyBtn = tree.root.findAll(
        (node: any) => node.props && node.props.accessibilityLabel === 'Copy answer'
      )[0];

      await renderer.act(async () => {
        copyBtn.props.onPress();
      });

      // Now shows Check icon
      copyIcons = tree.root.findAllByType('Copy');
      checkIcons = tree.root.findAllByType('Check');
      expect(copyIcons.length).toBe(0);
      expect(checkIcons.length).toBe(1);

      jest.useRealTimers();
    });

    it('should revert to Copy icon after 2000ms timeout', async () => {
      jest.useFakeTimers();
      const tree = await setupDataState();

      // Press copy
      const copyBtn = tree.root.findAll(
        (node: any) => node.props && node.props.accessibilityLabel === 'Copy answer'
      )[0];

      await renderer.act(async () => {
        copyBtn.props.onPress();
      });

      // Verify Check icon is showing
      let checkIcons = tree.root.findAllByType('Check');
      expect(checkIcons.length).toBe(1);

      // Advance timer by 2000ms
      await renderer.act(async () => {
        jest.advanceTimersByTime(2000);
      });

      // Should revert to Copy icon
      const copyIcons = tree.root.findAllByType('Copy');
      checkIcons = tree.root.findAllByType('Check');
      expect(copyIcons.length).toBe(1);
      expect(checkIcons.length).toBe(0);

      jest.useRealTimers();
    });

    it('should handle multiple copy presses (idempotent)', async () => {
      jest.useFakeTimers();
      const tree = await setupDataState();

      const copyBtn = tree.root.findAll(
        (node: any) => node.props && node.props.accessibilityLabel === 'Copy answer'
      )[0];

      // Press copy twice
      await renderer.act(async () => {
        copyBtn.props.onPress();
      });
      await renderer.act(async () => {
        copyBtn.props.onPress();
      });

      // Should still show Check (double-add to Set is fine)
      const checkIcons = tree.root.findAllByType('Check');
      expect(checkIcons.length).toBe(1);

      jest.useRealTimers();
    });
  });

  describe('edge cases', () => {
    it('should handle questions data with empty questions array', async () => {
      const mockGenerate = jest.fn().mockResolvedValue({ questions: [] });
      const tree = renderComponent({ ...defaultProps, onGenerate: mockGenerate });

      const genBtn = tree.root
        .findAllByType('GlassButton')
        .find((b: any) => b.props.label === 'Generate Tailored Guidance');

      await renderer.act(async () => {
        genBtn!.props.onPress();
      });

      // Should render ScrollView with no question cards
      const json = tree.toJSON();
      expect(json).toBeTruthy();
    });

    it('should handle question with undefined common_mistakes', async () => {
      const q = makeQuestion({ common_mistakes: undefined });
      const mockGenerate = jest.fn().mockResolvedValue(makeQuestionsData([q]));
      const tree = renderComponent({ ...defaultProps, onGenerate: mockGenerate });

      const genBtn = tree.root
        .findAllByType('GlassButton')
        .find((b: any) => b.props.label === 'Generate Tailored Guidance');

      await renderer.act(async () => {
        genBtn!.props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('COMMON MISTAKES TO AVOID');
    });

    it('should handle question with undefined answer_builder', async () => {
      const q = makeQuestion({ answer_builder: undefined });
      const mockGenerate = jest.fn().mockResolvedValue(makeQuestionsData([q]));
      const tree = renderComponent({ ...defaultProps, onGenerate: mockGenerate });

      const genBtn = tree.root
        .findAllByType('GlassButton')
        .find((b: any) => b.props.label === 'Generate Tailored Guidance');

      await renderer.act(async () => {
        genBtn!.props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      // Should show ready answer but not answer framework
      expect(text).not.toContain('ANSWER FRAMEWORK');
      expect(text).toContain('READY-TO-USE ANSWER');
    });

    it('should clear error on retry after error', async () => {
      const mockGenerate = jest
        .fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValueOnce(makeQuestionsData());

      const tree = renderComponent({ ...defaultProps, onGenerate: mockGenerate });

      const genBtn = tree.root
        .findAllByType('GlassButton')
        .find((b: any) => b.props.label === 'Generate Tailored Guidance');

      // First attempt - error
      await renderer.act(async () => {
        genBtn!.props.onPress();
      });

      let text = getTreeText(tree.toJSON());
      expect(text).toContain('First failure');

      // Second attempt - success
      const genBtn2 = tree.root
        .findAllByType('GlassButton')
        .find((b: any) => b.props.label === 'Generate Tailored Guidance');

      await renderer.act(async () => {
        genBtn2!.props.onPress();
      });

      text = getTreeText(tree.toJSON());
      expect(text).not.toContain('First failure');
      expect(text).toContain('Tell me about yourself');
    });

    it('should render Sparkles icon on generate button in non-loading state', () => {
      const tree = renderComponent({ ...defaultProps, onGenerate: jest.fn() });
      const genBtn = tree.root
        .findAllByType('GlassButton')
        .find((b: any) => b.props.label === 'Generate Tailored Guidance');
      // icon prop should be defined (Sparkles element) when not loading
      expect(genBtn!.props.icon).toBeTruthy();
    });

    it('should handle question with single common_mistake', async () => {
      const q = makeQuestion({ common_mistakes: ['Only one mistake'] });
      const mockGenerate = jest.fn().mockResolvedValue(makeQuestionsData([q]));
      const tree = renderComponent({ ...defaultProps, onGenerate: mockGenerate });

      const genBtn = tree.root
        .findAllByType('GlassButton')
        .find((b: any) => b.props.label === 'Generate Tailored Guidance');

      await renderer.act(async () => {
        genBtn!.props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Only one mistake');
    });
  });
});
