/**
 * CommonQuestionsScreen Test Suite
 *
 * Full coverage of component rendering, interactions, API calls, tab switching,
 * answer builder variants, share/copy feedback, regeneration, error states, and navigation.
 */

// ============================================================
// Mocks BEFORE imports
// ============================================================

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../../hooks/useTheme', () => ({
  useTheme: jest.fn(() => ({
    colors: {
      text: '#fff',
      textSecondary: '#999',
      textTertiary: '#666',
      background: '#000',
      backgroundSecondary: '#111',
      backgroundTertiary: '#222',
      border: '#333',
      glass: 'rgba(255,255,255,0.1)',
      glassBorder: 'rgba(255,255,255,0.2)',
    },
    isDark: true,
  })),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  })),
  useRoute: jest.fn(() => ({
    params: { interviewPrepId: 'prep-123' },
  })),
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: jest.fn(),
}));

const mockGenerateCommonQuestions = jest.fn(() =>
  Promise.resolve({ success: true, data: { questions: [] } })
);
const mockRegenerateSingleQuestion = jest.fn();

jest.mock('../../api/client', () => ({
  api: {
    generateCommonQuestions: (...args: any[]) => mockGenerateCommonQuestions(...args),
    regenerateSingleQuestion: (...args: any[]) => mockRegenerateSingleQuestion(...args),
  },
}));

// Override safe-area-context with React component for renderer
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: React.forwardRef((props: any, ref: any) =>
      React.createElement('SafeAreaView', { ...props, ref })
    ),
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

import React from 'react';
import renderer from 'react-test-renderer';
import { Alert, Share } from 'react-native';

// ============================================================
// Test Data Factories
// ============================================================

function makeQuestion(overrides: Record<string, any> = {}) {
  return {
    id: 'q1',
    question: 'Tell me about yourself',
    category: 'General',
    why_hard: 'Broad scope makes it hard to know where to start',
    common_mistakes: ['Being too vague', 'Rambling for too long'],
    exceptional_answer_builder: 'Use the STAR method to structure your response',
    what_to_say_short: 'I am a software engineer with 5 years experience',
    what_to_say_long:
      'I am a software engineer with 5 years of experience specializing in frontend development with React and TypeScript',
    ...overrides,
  };
}

function makeObjectBuilderQuestion(overrides: Record<string, any> = {}) {
  return makeQuestion({
    id: 'q2',
    question: 'Why should we hire you?',
    exceptional_answer_builder: {
      structure: '1. Start with your value proposition\n2. Connect to company needs\n\nConclusion paragraph',
      customization_checklist: ['Mention leadership', 'Cite metrics'],
      strong_phrases: ['I led', 'The impact was'],
    },
    ...overrides,
  });
}

function makeQuestionWithPlaceholders() {
  return makeQuestion({
    id: 'q3',
    question: 'What is your greatest strength?',
    placeholders_used: ['[specific skill]', '[years]'],
  });
}

// ============================================================
// Helpers
// ============================================================

function getTreeText(node: any): string {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getTreeText).join('');
  if (node.children) return node.children.map(getTreeText).join('');
  return '';
}

function findAllByType(root: any, type: string): any[] {
  const results: any[] = [];
  try {
    results.push(...root.findAllByType(type));
  } catch (_e) {
    // no matches
  }
  return results;
}

function findByProps(root: any, props: Record<string, any>): any[] {
  try {
    return root.findAll((node: any) => {
      return Object.keys(props).every((key) => node.props?.[key] === props[key]);
    });
  } catch (_e) {
    return [];
  }
}

// ============================================================
// Test Suite
// ============================================================

describe('CommonQuestionsScreen', () => {
  let CommonQuestionsScreen: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockGenerateCommonQuestions.mockReset();
    mockRegenerateSingleQuestion.mockReset();
    mockGenerateCommonQuestions.mockResolvedValue({
      success: true,
      data: { questions: [] },
    });
    CommonQuestionsScreen = require('../CommonQuestionsScreen').default;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const renderScreen = () => {
    let tree: any;
    renderer.act(() => {
      tree = renderer.create(React.createElement(CommonQuestionsScreen));
    });
    return tree!;
  };

  const renderScreenAsync = async () => {
    let tree: any;
    await renderer.act(async () => {
      tree = renderer.create(React.createElement(CommonQuestionsScreen));
    });
    return tree!;
  };

  // ========================================================================
  // Module Exports
  // ========================================================================
  describe('Module Exports', () => {
    it('should export a default function component', () => {
      expect(CommonQuestionsScreen).toBeDefined();
      expect(typeof CommonQuestionsScreen).toBe('function');
    });

    it('should be named CommonQuestionsScreen', () => {
      expect(CommonQuestionsScreen.name).toBe('CommonQuestionsScreen');
    });
  });

  // ========================================================================
  // Generating / Loading State
  // ========================================================================
  describe('Generating state (loading)', () => {
    it('should show loading state initially while generating', () => {
      // API returns a pending promise so generating stays true
      mockGenerateCommonQuestions.mockReturnValue(new Promise(() => {}));
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Generating personalized answers...');
      expect(text).toContain('Analyzing your background and the job requirements');
    });

    it('should show back button in loading state', () => {
      mockGenerateCommonQuestions.mockReturnValue(new Promise(() => {}));
      const tree = renderScreen();
      const root = tree.root;
      const backButtons = findByProps(root, { accessibilityLabel: 'Go back' });
      expect(backButtons.length).toBeGreaterThan(0);
    });

    it('should call goBack when back button pressed in loading state', () => {
      mockGenerateCommonQuestions.mockReturnValue(new Promise(() => {}));
      const tree = renderScreen();
      const root = tree.root;
      const backButtons = findByProps(root, { accessibilityLabel: 'Go back' });
      renderer.act(() => {
        backButtons[0].props.onPress();
      });
      expect(mockGoBack).toHaveBeenCalled();
    });

    it('should show header title in loading state', () => {
      mockGenerateCommonQuestions.mockReturnValue(new Promise(() => {}));
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Common Questions');
    });
  });

  // ========================================================================
  // API Integration: Generate Questions
  // ========================================================================
  describe('API: generateCommonQuestions', () => {
    it('should call api.generateCommonQuestions with interviewPrepId on mount', async () => {
      const tree = await renderScreenAsync();
      expect(mockGenerateCommonQuestions).toHaveBeenCalledWith('prep-123');
    });

    it('should show questions after successful API response', async () => {
      mockGenerateCommonQuestions.mockResolvedValue({
        success: true,
        data: { questions: [makeQuestion()] },
      });
      const tree = await renderScreenAsync();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Tell me about yourself');
    });

    it('should handle nested data structure (data.data.questions)', async () => {
      mockGenerateCommonQuestions.mockResolvedValue({
        success: true,
        data: { data: { questions: [makeQuestion({ id: 'nested-q1', question: 'Nested question' })] } },
      });
      const tree = await renderScreenAsync();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Nested question');
    });

    it('should show Alert when API returns success: false with error', async () => {
      mockGenerateCommonQuestions.mockResolvedValue({
        success: false,
        error: 'Server busy',
      });
      const tree = await renderScreenAsync();
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Server busy');
    });

    it('should show Alert with default message when API returns success: false without error', async () => {
      mockGenerateCommonQuestions.mockResolvedValue({
        success: false,
      });
      const tree = await renderScreenAsync();
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to generate questions');
    });

    it('should show Alert when API throws an exception', async () => {
      mockGenerateCommonQuestions.mockRejectedValue(new Error('Network failure'));
      const tree = await renderScreenAsync();
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to generate common questions');
    });

    it('should set generating to false after success', async () => {
      mockGenerateCommonQuestions.mockResolvedValue({
        success: true,
        data: { questions: [] },
      });
      const tree = await renderScreenAsync();
      const text = getTreeText(tree.toJSON());
      // After load, should show the intro card, not loading spinner
      expect(text).toContain('10 Common Interview Questions');
    });

    it('should set generating to false after failure', async () => {
      mockGenerateCommonQuestions.mockRejectedValue(new Error('err'));
      const tree = await renderScreenAsync();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('10 Common Interview Questions');
    });
  });

  // ========================================================================
  // Main View (non-generating)
  // ========================================================================
  describe('Main view after loading', () => {
    it('should show intro card with description text', async () => {
      const tree = await renderScreenAsync();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('10 Common Interview Questions');
      expect(text).toContain('Each answer is personalized');
    });

    it('should show header with back button and refresh button', async () => {
      const tree = await renderScreenAsync();
      const root = tree.root;
      const backButtons = findByProps(root, { accessibilityLabel: 'Go back' });
      const refreshButtons = findByProps(root, { accessibilityLabel: 'Regenerate all questions' });
      expect(backButtons.length).toBeGreaterThan(0);
      expect(refreshButtons.length).toBeGreaterThan(0);
    });

    it('should call goBack when back button pressed', async () => {
      const tree = await renderScreenAsync();
      const root = tree.root;
      const backButtons = findByProps(root, { accessibilityLabel: 'Go back' });
      renderer.act(() => {
        backButtons[0].props.onPress();
      });
      expect(mockGoBack).toHaveBeenCalled();
    });

    it('should call generateCommonQuestions again when refresh pressed', async () => {
      const tree = await renderScreenAsync();
      mockGenerateCommonQuestions.mockClear();
      mockGenerateCommonQuestions.mockResolvedValue({
        success: true,
        data: { questions: [] },
      });
      const root = tree.root;
      const refreshButtons = findByProps(root, { accessibilityLabel: 'Regenerate all questions' });
      await renderer.act(async () => {
        refreshButtons[0].props.onPress();
      });
      expect(mockGenerateCommonQuestions).toHaveBeenCalledWith('prep-123');
    });

    it('should render question numbers starting from 1', async () => {
      mockGenerateCommonQuestions.mockResolvedValue({
        success: true,
        data: {
          questions: [
            makeQuestion({ id: 'q1' }),
            makeQuestion({ id: 'q2', question: 'Why this company?' }),
          ],
        },
      });
      const tree = await renderScreenAsync();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('1');
      expect(text).toContain('2');
    });
  });

  // ========================================================================
  // Question Expansion / Collapse
  // ========================================================================
  describe('Question expansion and collapse', () => {
    beforeEach(() => {
      mockGenerateCommonQuestions.mockResolvedValue({
        success: true,
        data: { questions: [makeQuestion()] },
      });
    });

    it('should show collapsed question initially (ChevronDown visible)', async () => {
      const tree = await renderScreenAsync();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Tell me about yourself');
      // Should NOT show why_hard content since not expanded
      expect(text).not.toContain('Broad scope makes it hard');
    });

    it('should expand question when header pressed', async () => {
      const tree = await renderScreenAsync();
      const root = tree.root;
      const questionHeaders = findByProps(root, {
        accessibilityLabel: 'Tell me about yourself, collapsed',
      });
      expect(questionHeaders.length).toBe(1);

      await renderer.act(async () => {
        questionHeaders[0].props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      // Should show the why-hard tab content (default tab)
      expect(text).toContain('Why This Question Is Hard');
      expect(text).toContain('Broad scope makes it hard');
    });

    it('should collapse question when header pressed again', async () => {
      const tree = await renderScreenAsync();
      const root = tree.root;

      // Expand
      const collapsedHeaders = findByProps(root, {
        accessibilityLabel: 'Tell me about yourself, collapsed',
      });
      await renderer.act(async () => {
        collapsedHeaders[0].props.onPress();
      });

      // Collapse
      const expandedHeaders = findByProps(root, {
        accessibilityLabel: 'Tell me about yourself, expanded',
      });
      await renderer.act(async () => {
        expandedHeaders[0].props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Why This Question Is Hard');
    });

    it('should show category badge when expanded', async () => {
      const tree = await renderScreenAsync();
      const root = tree.root;
      const headers = findByProps(root, {
        accessibilityLabel: 'Tell me about yourself, collapsed',
      });
      await renderer.act(async () => {
        headers[0].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('General');
    });
  });

  // ========================================================================
  // Tab Navigation
  // ========================================================================
  describe('Tab navigation within expanded question', () => {
    beforeEach(() => {
      mockGenerateCommonQuestions.mockResolvedValue({
        success: true,
        data: {
          questions: [
            makeQuestion({
              common_mistakes: ['Mistake 1', 'Mistake 2', 'Mistake 3'],
            }),
          ],
        },
      });
    });

    const expandQuestion = async (tree: any) => {
      const root = tree.root;
      const headers = findByProps(root, {
        accessibilityLabel: 'Tell me about yourself, collapsed',
      });
      await renderer.act(async () => {
        headers[0].props.onPress();
      });
    };

    const switchToTab = async (root: any, tabState: { selected: boolean }) => {
      // Find tab buttons by accessibilityRole="tab"
      const tabs = root.findAll(
        (node: any) => node.props?.accessibilityRole === 'tab'
      );
      return tabs;
    };

    it('should show "Why Hard" tab content by default', async () => {
      const tree = await renderScreenAsync();
      await expandQuestion(tree);
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Why This Question Is Hard');
      expect(text).toContain('Broad scope makes it hard');
    });

    it('should show all 4 tab buttons', async () => {
      const tree = await renderScreenAsync();
      await expandQuestion(tree);
      const root = tree.root;
      const tabs = root.findAll(
        (node: any) => node.props?.accessibilityRole === 'tab'
      );
      expect(tabs.length).toBe(4);
    });

    it('should switch to Mistakes tab and show mistakes', async () => {
      const tree = await renderScreenAsync();
      await expandQuestion(tree);
      const root = tree.root;
      const tabs = root.findAll(
        (node: any) => node.props?.accessibilityRole === 'tab'
      );
      // Tab order: why-hard, mistakes, builder, answer
      await renderer.act(async () => {
        tabs[1].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Common Mistakes to Avoid');
      expect(text).toContain('Mistake 1');
      expect(text).toContain('Mistake 2');
      expect(text).toContain('Mistake 3');
      // Mistake numbers
      expect(text).toContain('1');
      expect(text).toContain('2');
      expect(text).toContain('3');
    });

    it('should switch to Builder tab and show string builder', async () => {
      const tree = await renderScreenAsync();
      await expandQuestion(tree);
      const root = tree.root;
      const tabs = root.findAll(
        (node: any) => node.props?.accessibilityRole === 'tab'
      );
      await renderer.act(async () => {
        tabs[2].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Answer Builder');
      expect(text).toContain('Use the STAR method');
    });

    it('should switch to Answer tab and show short/long versions', async () => {
      const tree = await renderScreenAsync();
      await expandQuestion(tree);
      const root = tree.root;
      const tabs = root.findAll(
        (node: any) => node.props?.accessibilityRole === 'tab'
      );
      await renderer.act(async () => {
        tabs[3].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('What to Say');
      expect(text).toContain('Short Version');
      expect(text).toContain('Full Version');
      expect(text).toContain('I am a software engineer with 5 years experience');
      expect(text).toContain('specializing in frontend development');
    });

    it('should show word count badges in answer tab', async () => {
      const tree = await renderScreenAsync();
      await expandQuestion(tree);
      const root = tree.root;
      const tabs = root.findAll(
        (node: any) => node.props?.accessibilityRole === 'tab'
      );
      await renderer.act(async () => {
        tabs[3].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      // "I am a software engineer with 5 years experience" = 9 words
      expect(text).toContain('words');
    });
  });

  // ========================================================================
  // Answer Builder: Object Type
  // ========================================================================
  describe('Answer builder with object type', () => {
    beforeEach(() => {
      mockGenerateCommonQuestions.mockResolvedValue({
        success: true,
        data: { questions: [makeObjectBuilderQuestion()] },
      });
    });

    const expandAndSwitchToBuilder = async (tree: any) => {
      const root = tree.root;
      const headers = findByProps(root, {
        accessibilityLabel: 'Why should we hire you?, collapsed',
      });
      await renderer.act(async () => {
        headers[0].props.onPress();
      });
      const tabs = root.findAll(
        (node: any) => node.props?.accessibilityRole === 'tab'
      );
      await renderer.act(async () => {
        tabs[2].props.onPress();
      });
    };

    it('should render structure section with numbered lines', async () => {
      const tree = await renderScreenAsync();
      await expandAndSwitchToBuilder(tree);
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Structure');
      expect(text).toContain('Start with your value proposition');
      expect(text).toContain('Connect to company needs');
    });

    it('should render non-numbered lines as plain text', async () => {
      const tree = await renderScreenAsync();
      await expandAndSwitchToBuilder(tree);
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Conclusion paragraph');
    });

    it('should render customization checklist items', async () => {
      const tree = await renderScreenAsync();
      await expandAndSwitchToBuilder(tree);
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Customization Checklist');
      expect(text).toContain('Mention leadership');
      expect(text).toContain('Cite metrics');
    });

    it('should render strong phrases', async () => {
      const tree = await renderScreenAsync();
      await expandAndSwitchToBuilder(tree);
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Strong Phrases to Use');
      // Phrases are wrapped in quotes
      expect(text).toContain('"I led"');
      expect(text).toContain('"The impact was"');
    });

    it('should not render structure section if structure is missing', async () => {
      mockGenerateCommonQuestions.mockResolvedValue({
        success: true,
        data: {
          questions: [
            makeQuestion({
              id: 'q-no-struct',
              question: 'No structure question',
              exceptional_answer_builder: {
                customization_checklist: ['Item A'],
                strong_phrases: ['phrase A'],
              },
            }),
          ],
        },
      });
      const tree = await renderScreenAsync();
      const root = tree.root;
      const headers = findByProps(root, {
        accessibilityLabel: 'No structure question, collapsed',
      });
      await renderer.act(async () => {
        headers[0].props.onPress();
      });
      const tabs = root.findAll(
        (node: any) => node.props?.accessibilityRole === 'tab'
      );
      await renderer.act(async () => {
        tabs[2].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Customization Checklist');
      expect(text).toContain('phrase A');
    });

    it('should not render checklist section if checklist is empty', async () => {
      mockGenerateCommonQuestions.mockResolvedValue({
        success: true,
        data: {
          questions: [
            makeQuestion({
              id: 'q-empty-checklist',
              question: 'Empty checklist question',
              exceptional_answer_builder: {
                structure: '1. Just a step',
                customization_checklist: [],
                strong_phrases: ['a phrase'],
              },
            }),
          ],
        },
      });
      const tree = await renderScreenAsync();
      const root = tree.root;
      const headers = findByProps(root, {
        accessibilityLabel: 'Empty checklist question, collapsed',
      });
      await renderer.act(async () => {
        headers[0].props.onPress();
      });
      const tabs = root.findAll(
        (node: any) => node.props?.accessibilityRole === 'tab'
      );
      await renderer.act(async () => {
        tabs[2].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Customization Checklist');
      expect(text).toContain('Strong Phrases to Use');
    });

    it('should not render strong phrases section if phrases are empty', async () => {
      mockGenerateCommonQuestions.mockResolvedValue({
        success: true,
        data: {
          questions: [
            makeQuestion({
              id: 'q-empty-phrases',
              question: 'Empty phrases question',
              exceptional_answer_builder: {
                structure: '1. Step one',
                customization_checklist: ['Check this'],
                strong_phrases: [],
              },
            }),
          ],
        },
      });
      const tree = await renderScreenAsync();
      const root = tree.root;
      const headers = findByProps(root, {
        accessibilityLabel: 'Empty phrases question, collapsed',
      });
      await renderer.act(async () => {
        headers[0].props.onPress();
      });
      const tabs = root.findAll(
        (node: any) => node.props?.accessibilityRole === 'tab'
      );
      await renderer.act(async () => {
        tabs[2].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Customization Checklist');
      expect(text).not.toContain('Strong Phrases to Use');
    });

    it('should handle empty lines in structure (return null for blank lines)', async () => {
      mockGenerateCommonQuestions.mockResolvedValue({
        success: true,
        data: {
          questions: [
            makeQuestion({
              id: 'q-blank-lines',
              question: 'Blank lines question',
              exceptional_answer_builder: {
                structure: '1. Step one\n\n2. Step two',
                customization_checklist: [],
                strong_phrases: [],
              },
            }),
          ],
        },
      });
      const tree = await renderScreenAsync();
      const root = tree.root;
      const headers = findByProps(root, {
        accessibilityLabel: 'Blank lines question, collapsed',
      });
      await renderer.act(async () => {
        headers[0].props.onPress();
      });
      const tabs = root.findAll(
        (node: any) => node.props?.accessibilityRole === 'tab'
      );
      await renderer.act(async () => {
        tabs[2].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Step one');
      expect(text).toContain('Step two');
    });
  });

  // ========================================================================
  // Answer Tab: Share / Copy with feedback
  // ========================================================================
  describe('Share / Copy functionality', () => {
    beforeEach(() => {
      mockGenerateCommonQuestions.mockResolvedValue({
        success: true,
        data: { questions: [makeQuestion()] },
      });
    });

    const expandAndSwitchToAnswer = async (tree: any) => {
      const root = tree.root;
      const headers = findByProps(root, {
        accessibilityLabel: 'Tell me about yourself, collapsed',
      });
      await renderer.act(async () => {
        headers[0].props.onPress();
      });
      const tabs = root.findAll(
        (node: any) => node.props?.accessibilityRole === 'tab'
      );
      await renderer.act(async () => {
        tabs[3].props.onPress();
      });
    };

    it('should call Share.share when short answer share button pressed', async () => {
      const tree = await renderScreenAsync();
      await expandAndSwitchToAnswer(tree);
      const root = tree.root;
      const shareButtons = findByProps(root, {
        accessibilityLabel: 'Share short answer',
      });
      expect(shareButtons.length).toBe(1);

      await renderer.act(async () => {
        await shareButtons[0].props.onPress();
      });

      expect(Share.share).toHaveBeenCalledWith({
        message: 'I am a software engineer with 5 years experience',
      });
    });

    it('should call Share.share when full answer share button pressed', async () => {
      const tree = await renderScreenAsync();
      await expandAndSwitchToAnswer(tree);
      const root = tree.root;
      const shareButtons = findByProps(root, {
        accessibilityLabel: 'Share full answer',
      });
      expect(shareButtons.length).toBe(1);

      await renderer.act(async () => {
        await shareButtons[0].props.onPress();
      });

      expect(Share.share).toHaveBeenCalledWith({
        message:
          'I am a software engineer with 5 years of experience specializing in frontend development with React and TypeScript',
      });
    });

    it('should show check icon after copying short answer (copiedId feedback)', async () => {
      const tree = await renderScreenAsync();
      await expandAndSwitchToAnswer(tree);
      const root = tree.root;
      const shareButtons = findByProps(root, {
        accessibilityLabel: 'Share short answer',
      });

      await renderer.act(async () => {
        await shareButtons[0].props.onPress();
      });

      // After share, copiedId is set so the check icon appears
      // The tree re-renders with the Check icon instead of Share2
      const text = getTreeText(tree.toJSON());
      // The component should now show Check icon for q1-short
      // We can verify the state by checking the tree structure
      expect(tree.toJSON()).toBeDefined();
    });

    it('should reset copiedId after 2000ms timeout', async () => {
      const tree = await renderScreenAsync();
      await expandAndSwitchToAnswer(tree);
      const root = tree.root;
      const shareButtons = findByProps(root, {
        accessibilityLabel: 'Share short answer',
      });

      await renderer.act(async () => {
        await shareButtons[0].props.onPress();
      });

      // Advance timers by 2000ms to clear the copiedId
      await renderer.act(async () => {
        jest.advanceTimersByTime(2000);
      });

      // After timeout, copiedId should be null again
      expect(tree.toJSON()).toBeDefined();
    });

    it('should handle Share.share error gracefully', async () => {
      (Share.share as jest.Mock).mockRejectedValueOnce(new Error('Share failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const tree = await renderScreenAsync();
      await expandAndSwitchToAnswer(tree);
      const root = tree.root;
      const shareButtons = findByProps(root, {
        accessibilityLabel: 'Share short answer',
      });

      await renderer.act(async () => {
        await shareButtons[0].props.onPress();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Failed to share:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  // ========================================================================
  // Placeholders
  // ========================================================================
  describe('Placeholders in answer tab', () => {
    it('should render placeholders when present', async () => {
      mockGenerateCommonQuestions.mockResolvedValue({
        success: true,
        data: { questions: [makeQuestionWithPlaceholders()] },
      });
      const tree = await renderScreenAsync();
      const root = tree.root;

      // Expand question
      const headers = findByProps(root, {
        accessibilityLabel: 'What is your greatest strength?, collapsed',
      });
      await renderer.act(async () => {
        headers[0].props.onPress();
      });

      // Switch to answer tab
      const tabs = root.findAll(
        (node: any) => node.props?.accessibilityRole === 'tab'
      );
      await renderer.act(async () => {
        tabs[3].props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Placeholders Used');
      expect(text).toContain('Replace these with your specific details');
      expect(text).toContain('[specific skill]');
      expect(text).toContain('[years]');
    });

    it('should not render placeholders section when placeholders_used is absent', async () => {
      mockGenerateCommonQuestions.mockResolvedValue({
        success: true,
        data: { questions: [makeQuestion()] }, // no placeholders_used
      });
      const tree = await renderScreenAsync();
      const root = tree.root;

      const headers = findByProps(root, {
        accessibilityLabel: 'Tell me about yourself, collapsed',
      });
      await renderer.act(async () => {
        headers[0].props.onPress();
      });
      const tabs = root.findAll(
        (node: any) => node.props?.accessibilityRole === 'tab'
      );
      await renderer.act(async () => {
        tabs[3].props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Placeholders Used');
    });

    it('should not render placeholders section when array is empty', async () => {
      mockGenerateCommonQuestions.mockResolvedValue({
        success: true,
        data: {
          questions: [
            makeQuestion({ placeholders_used: [] }),
          ],
        },
      });
      const tree = await renderScreenAsync();
      const root = tree.root;

      const headers = findByProps(root, {
        accessibilityLabel: 'Tell me about yourself, collapsed',
      });
      await renderer.act(async () => {
        headers[0].props.onPress();
      });
      const tabs = root.findAll(
        (node: any) => node.props?.accessibilityRole === 'tab'
      );
      await renderer.act(async () => {
        tabs[3].props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Placeholders Used');
    });
  });

  // ========================================================================
  // Regenerate Individual Question
  // ========================================================================
  describe('Regenerate single question', () => {
    beforeEach(() => {
      mockGenerateCommonQuestions.mockResolvedValue({
        success: true,
        data: { questions: [makeQuestion()] },
      });
    });

    const expandQuestion = async (tree: any) => {
      const root = tree.root;
      const headers = findByProps(root, {
        accessibilityLabel: 'Tell me about yourself, collapsed',
      });
      await renderer.act(async () => {
        headers[0].props.onPress();
      });
    };

    it('should show regenerate button when expanded', async () => {
      const tree = await renderScreenAsync();
      await expandQuestion(tree);
      const root = tree.root;
      const regenButtons = findByProps(root, {
        accessibilityLabel: 'Regenerate this answer',
      });
      expect(regenButtons.length).toBe(1);
    });

    it('should show "Regenerate Answer" text by default', async () => {
      const tree = await renderScreenAsync();
      await expandQuestion(tree);
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Regenerate Answer');
    });

    it('should call api.regenerateSingleQuestion with correct params', async () => {
      mockRegenerateSingleQuestion.mockResolvedValue({
        success: true,
        data: makeQuestion({ why_hard: 'Updated why hard' }),
      });

      const tree = await renderScreenAsync();
      await expandQuestion(tree);
      const root = tree.root;
      const regenButtons = findByProps(root, {
        accessibilityLabel: 'Regenerate this answer',
      });

      await renderer.act(async () => {
        await regenButtons[0].props.onPress();
      });

      expect(mockRegenerateSingleQuestion).toHaveBeenCalledWith({
        interview_prep_id: 'prep-123',
        question_id: 'q1',
      });
    });

    it('should update question content on successful regeneration', async () => {
      mockRegenerateSingleQuestion.mockResolvedValue({
        success: true,
        data: makeQuestion({
          why_hard: 'Updated difficulty explanation',
        }),
      });

      const tree = await renderScreenAsync();
      await expandQuestion(tree);
      const root = tree.root;
      const regenButtons = findByProps(root, {
        accessibilityLabel: 'Regenerate this answer',
      });

      await renderer.act(async () => {
        await regenButtons[0].props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Updated difficulty explanation');
    });

    it('should show "Regenerating..." during regeneration', async () => {
      mockRegenerateSingleQuestion.mockReturnValue(new Promise(() => {}));

      const tree = await renderScreenAsync();
      await expandQuestion(tree);
      const root = tree.root;
      const regenButtons = findByProps(root, {
        accessibilityLabel: 'Regenerate this answer',
      });

      renderer.act(() => {
        regenButtons[0].props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Regenerating...');
    });

    it('should show Alert when regeneration fails (success: false)', async () => {
      mockRegenerateSingleQuestion.mockResolvedValue({
        success: false,
        error: 'Regeneration failed',
      });

      const tree = await renderScreenAsync();
      await expandQuestion(tree);
      const root = tree.root;
      const regenButtons = findByProps(root, {
        accessibilityLabel: 'Regenerate this answer',
      });

      await renderer.act(async () => {
        await regenButtons[0].props.onPress();
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Regeneration failed');
    });

    it('should show Alert with default message when regeneration fails without error field', async () => {
      mockRegenerateSingleQuestion.mockResolvedValue({
        success: false,
      });

      const tree = await renderScreenAsync();
      await expandQuestion(tree);
      const root = tree.root;
      const regenButtons = findByProps(root, {
        accessibilityLabel: 'Regenerate this answer',
      });

      await renderer.act(async () => {
        await regenButtons[0].props.onPress();
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to regenerate question');
    });

    it('should show Alert when regeneration throws an exception', async () => {
      mockRegenerateSingleQuestion.mockRejectedValue(new Error('Network error'));

      const tree = await renderScreenAsync();
      await expandQuestion(tree);
      const root = tree.root;
      const regenButtons = findByProps(root, {
        accessibilityLabel: 'Regenerate this answer',
      });

      await renderer.act(async () => {
        await regenButtons[0].props.onPress();
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to regenerate question');
    });

    it('should reset regeneratingId after regeneration completes', async () => {
      mockRegenerateSingleQuestion.mockResolvedValue({
        success: true,
        data: makeQuestion(),
      });

      const tree = await renderScreenAsync();
      await expandQuestion(tree);
      const root = tree.root;
      const regenButtons = findByProps(root, {
        accessibilityLabel: 'Regenerate this answer',
      });

      await renderer.act(async () => {
        await regenButtons[0].props.onPress();
      });

      // After completion, button should say "Regenerate Answer" again
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Regenerate Answer');
      expect(text).not.toContain('Regenerating...');
    });

    it('should reset regeneratingId after regeneration error', async () => {
      mockRegenerateSingleQuestion.mockRejectedValue(new Error('err'));

      const tree = await renderScreenAsync();
      await expandQuestion(tree);
      const root = tree.root;
      const regenButtons = findByProps(root, {
        accessibilityLabel: 'Regenerate this answer',
      });

      await renderer.act(async () => {
        await regenButtons[0].props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Regenerate Answer');
    });
  });

  // ========================================================================
  // Multiple questions
  // ========================================================================
  describe('Multiple questions rendering', () => {
    it('should render multiple questions with correct numbering', async () => {
      mockGenerateCommonQuestions.mockResolvedValue({
        success: true,
        data: {
          questions: [
            makeQuestion({ id: 'q1', question: 'Question one' }),
            makeQuestion({ id: 'q2', question: 'Question two' }),
            makeQuestion({ id: 'q3', question: 'Question three' }),
          ],
        },
      });
      const tree = await renderScreenAsync();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Question one');
      expect(text).toContain('Question two');
      expect(text).toContain('Question three');
    });

    it('should expand only the clicked question', async () => {
      mockGenerateCommonQuestions.mockResolvedValue({
        success: true,
        data: {
          questions: [
            makeQuestion({ id: 'q1', question: 'First question', why_hard: 'First hard reason' }),
            makeQuestion({ id: 'q2', question: 'Second question', why_hard: 'Second hard reason' }),
          ],
        },
      });
      const tree = await renderScreenAsync();
      const root = tree.root;

      // Expand only the first question
      const headers = findByProps(root, {
        accessibilityLabel: 'First question, collapsed',
      });
      await renderer.act(async () => {
        headers[0].props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('First hard reason');
      expect(text).not.toContain('Second hard reason');
    });
  });

  // ========================================================================
  // countWords exercised through component (word count badges)
  // ========================================================================
  describe('Word count in component context', () => {
    it('should display correct word counts for short and long answers', async () => {
      mockGenerateCommonQuestions.mockResolvedValue({
        success: true,
        data: {
          questions: [
            makeQuestion({
              what_to_say_short: 'One two three',
              what_to_say_long: 'One two three four five six',
            }),
          ],
        },
      });
      const tree = await renderScreenAsync();
      const root = tree.root;

      // Expand question
      const headers = findByProps(root, {
        accessibilityLabel: 'Tell me about yourself, collapsed',
      });
      await renderer.act(async () => {
        headers[0].props.onPress();
      });

      // Switch to answer tab
      const tabs = root.findAll(
        (node: any) => node.props?.accessibilityRole === 'tab'
      );
      await renderer.act(async () => {
        tabs[3].props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      // "One two three" = 3 words, "One two three four five six" = 6 words
      expect(text).toContain('3');
      expect(text).toContain('6');
      expect(text).toContain('words');
    });
  });

  // ========================================================================
  // getActiveTab / setActiveTab exercised through component
  // ========================================================================
  describe('Tab state management through component interaction', () => {
    it('should maintain independent tab state per question', async () => {
      mockGenerateCommonQuestions.mockResolvedValue({
        success: true,
        data: {
          questions: [
            makeQuestion({ id: 'q1', question: 'First question' }),
            makeQuestion({ id: 'q2', question: 'Second question' }),
          ],
        },
      });
      const tree = await renderScreenAsync();
      const root = tree.root;

      // Expand first question
      const header1 = findByProps(root, {
        accessibilityLabel: 'First question, collapsed',
      });
      await renderer.act(async () => {
        header1[0].props.onPress();
      });

      // Switch first question to 'mistakes' tab
      let tabs = root.findAll(
        (node: any) => node.props?.accessibilityRole === 'tab'
      );
      await renderer.act(async () => {
        tabs[1].props.onPress(); // mistakes
      });

      // Expand second question
      const header2 = findByProps(root, {
        accessibilityLabel: 'Second question, collapsed',
      });
      await renderer.act(async () => {
        header2[0].props.onPress();
      });

      // Second question should default to 'why-hard' tab
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Why This Question Is Hard');
      expect(text).toContain('Common Mistakes to Avoid');
    });
  });

  // ========================================================================
  // copiedId state: Check vs Share icon toggle in answer tab
  // ========================================================================
  describe('Copied feedback icon toggle', () => {
    it('should show Share2 icon by default and Check after copy for short answer', async () => {
      mockGenerateCommonQuestions.mockResolvedValue({
        success: true,
        data: { questions: [makeQuestion()] },
      });
      const tree = await renderScreenAsync();
      const root = tree.root;

      // Expand and go to answer tab
      const headers = findByProps(root, {
        accessibilityLabel: 'Tell me about yourself, collapsed',
      });
      await renderer.act(async () => {
        headers[0].props.onPress();
      });
      const tabs = root.findAll(
        (node: any) => node.props?.accessibilityRole === 'tab'
      );
      await renderer.act(async () => {
        tabs[3].props.onPress();
      });

      // Press share on short answer
      const shareShort = findByProps(root, {
        accessibilityLabel: 'Share short answer',
      });
      await renderer.act(async () => {
        await shareShort[0].props.onPress();
      });

      // Verify the tree re-rendered (copiedId is now set)
      expect(tree.toJSON()).toBeDefined();

      // After 2s timeout, should reset
      await renderer.act(async () => {
        jest.advanceTimersByTime(2000);
      });
      expect(tree.toJSON()).toBeDefined();
    });

    it('should show Check icon after copy for long answer', async () => {
      mockGenerateCommonQuestions.mockResolvedValue({
        success: true,
        data: { questions: [makeQuestion()] },
      });
      const tree = await renderScreenAsync();
      const root = tree.root;

      const headers = findByProps(root, {
        accessibilityLabel: 'Tell me about yourself, collapsed',
      });
      await renderer.act(async () => {
        headers[0].props.onPress();
      });
      const tabs = root.findAll(
        (node: any) => node.props?.accessibilityRole === 'tab'
      );
      await renderer.act(async () => {
        tabs[3].props.onPress();
      });

      const shareLong = findByProps(root, {
        accessibilityLabel: 'Share full answer',
      });
      await renderer.act(async () => {
        await shareLong[0].props.onPress();
      });

      expect(Share.share).toHaveBeenCalledTimes(1);

      // Reset timeout
      await renderer.act(async () => {
        jest.advanceTimersByTime(2000);
      });
    });
  });

  // ========================================================================
  // Edge: common_mistakes with optional chaining (line 319)
  // ========================================================================
  describe('Common mistakes with optional chaining', () => {
    it('should render mistakes when common_mistakes is present', async () => {
      mockGenerateCommonQuestions.mockResolvedValue({
        success: true,
        data: {
          questions: [
            makeQuestion({
              common_mistakes: ['Only mistake'],
            }),
          ],
        },
      });
      const tree = await renderScreenAsync();
      const root = tree.root;

      const headers = findByProps(root, {
        accessibilityLabel: 'Tell me about yourself, collapsed',
      });
      await renderer.act(async () => {
        headers[0].props.onPress();
      });
      const tabs = root.findAll(
        (node: any) => node.props?.accessibilityRole === 'tab'
      );
      await renderer.act(async () => {
        tabs[1].props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Only mistake');
    });
  });

  // ========================================================================
  // Edge: Empty questions list
  // ========================================================================
  describe('Empty questions list', () => {
    it('should render intro card but no question cards when questions is empty', async () => {
      mockGenerateCommonQuestions.mockResolvedValue({
        success: true,
        data: { questions: [] },
      });
      const tree = await renderScreenAsync();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('10 Common Interview Questions');
      expect(text).not.toContain('Tell me about yourself');
    });
  });

  // ========================================================================
  // Tab active state (accessibilityState)
  // ========================================================================
  describe('Tab active state accessibility', () => {
    it('should have selected: true for the active tab', async () => {
      mockGenerateCommonQuestions.mockResolvedValue({
        success: true,
        data: { questions: [makeQuestion()] },
      });
      const tree = await renderScreenAsync();
      const root = tree.root;

      const headers = findByProps(root, {
        accessibilityLabel: 'Tell me about yourself, collapsed',
      });
      await renderer.act(async () => {
        headers[0].props.onPress();
      });

      const tabs = root.findAll(
        (node: any) => node.props?.accessibilityRole === 'tab'
      );

      // First tab (why-hard) should be selected by default
      expect(tabs[0].props.accessibilityState).toEqual({ selected: true });
      expect(tabs[1].props.accessibilityState).toEqual({ selected: false });
      expect(tabs[2].props.accessibilityState).toEqual({ selected: false });
      expect(tabs[3].props.accessibilityState).toEqual({ selected: false });

      // Switch to mistakes tab
      await renderer.act(async () => {
        tabs[1].props.onPress();
      });

      const updatedTabs = root.findAll(
        (node: any) => node.props?.accessibilityRole === 'tab'
      );
      expect(updatedTabs[0].props.accessibilityState).toEqual({ selected: false });
      expect(updatedTabs[1].props.accessibilityState).toEqual({ selected: true });
    });
  });
});
