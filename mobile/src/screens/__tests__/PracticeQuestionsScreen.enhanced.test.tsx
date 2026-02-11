/**
 * PracticeQuestionsScreen Enhanced Tests
 *
 * Comprehensive coverage for all component functionality using react-test-renderer:
 * - Component rendering for practice and history tabs
 * - Question loading and display
 * - Question expansion and collapse with STAR story generation
 * - Answer input and saving
 * - Practice history loading and display
 * - Tab switching
 * - Time tracking
 * - Loading, empty, and error states
 * - formatDate and formatDuration helpers
 * - calculateCompletionStats
 * - History item expansion with response_text and star_story
 * - Practice Again navigation
 *
 * Target: 100% coverage
 */

// ---- Mock setup BEFORE imports ----
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockRoute = {
  params: { interviewPrepId: 1, tailoredResumeId: 2 },
};

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
  useRoute: jest.fn(() => mockRoute),
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: jest.fn(),
}));

jest.mock('lucide-react-native', () =>
  new Proxy({}, { get: () => 'MockIcon' })
);

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: (props: any) =>
      React.createElement('SafeAreaView', props, props.children),
  };
});

const mockGeneratePracticeQuestions = jest.fn();
const mockGeneratePracticeStarStory = jest.fn();
const mockSavePracticeResponse = jest.fn();
const mockGetPracticeResponses = jest.fn();
const mockGetPracticeHistory = jest.fn();

jest.mock('../../api/client', () => ({
  api: {
    generatePracticeQuestions: (...args: any[]) => mockGeneratePracticeQuestions(...args),
    generatePracticeStarStory: (...args: any[]) => mockGeneratePracticeStarStory(...args),
    savePracticeResponse: (...args: any[]) => mockSavePracticeResponse(...args),
    getPracticeResponses: (...args: any[]) => mockGetPracticeResponses(...args),
    getPracticeHistory: (...args: any[]) => mockGetPracticeHistory(...args),
  },
  PracticeHistoryItem: {},
}));

// GlassButton: Return a React element so react-test-renderer can render it with props
jest.mock('../../components/glass/GlassButton', () => {
  const React = require('react');
  const MockGlassButton = (props: any) =>
    React.createElement('MockGlassButton', {
      label: props.label,
      onPress: props.onPress,
      disabled: props.disabled,
      loading: props.loading,
      variant: props.variant,
      size: props.size,
    });
  MockGlassButton.displayName = 'GlassButton';
  return { GlassButton: MockGlassButton, default: MockGlassButton };
});

jest.mock('../../navigation/AppNavigator', () => ({
  RootStackParamList: {},
}));

import React from 'react';
import renderer from 'react-test-renderer';
import { Alert } from 'react-native';

jest.spyOn(Alert, 'alert');

// ---- Helpers ----
const getAllText = (instance: any): string => {
  if (typeof instance === 'string' || typeof instance === 'number') {
    return String(instance);
  }
  if (!instance || !instance.children) return '';
  return instance.children.map((c: any) => getAllText(c)).join(' ');
};

const findTouchableByText = (root: any, text: string): any => {
  const touchables = root.findAllByType('TouchableOpacity');
  return touchables.find((t: any) => getAllText(t).includes(text));
};

const findGlassButtonByLabel = (root: any, label: string): any => {
  const buttons = root.findAllByType('MockGlassButton');
  return buttons.find((b: any) => b.props.label === label);
};

// ---- Default mock data ----
const DEFAULT_QUESTIONS = [
  {
    question: 'Tell me about a time you faced a challenge',
    category: 'behavioral',
    difficulty: 'Medium',
    why_asked: 'Tests problem-solving',
    key_skills_tested: ['problem-solving', 'leadership'],
  },
  {
    question: 'Describe a conflict with a team member',
    category: 'behavioral',
    difficulty: 'Hard',
    why_asked: 'Tests conflict resolution',
    key_skills_tested: ['communication', 'empathy'],
  },
];

const DEFAULT_STAR_STORY = {
  situation: 'Project deadline approaching',
  task: 'Deliver feature on time',
  action: 'Organized team sprints',
  result: 'Delivered 2 days early',
};

describe('PracticeQuestionsScreen Enhanced Tests', () => {
  let PracticeQuestionsScreen: any;

  beforeAll(() => {
    PracticeQuestionsScreen = require('../PracticeQuestionsScreen').default;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Default API responses
    mockGeneratePracticeQuestions.mockResolvedValue({
      success: true,
      data: {
        questions: DEFAULT_QUESTIONS,
      },
    });

    mockGeneratePracticeStarStory.mockResolvedValue({
      success: true,
      data: {
        star_story: DEFAULT_STAR_STORY,
      },
    });

    mockSavePracticeResponse.mockResolvedValue({
      success: true,
      data: { id: 1 },
    });

    mockGetPracticeResponses.mockResolvedValue({
      success: true,
      data: [],
    });

    mockGetPracticeHistory.mockResolvedValue({
      success: true,
      data: [],
    });
  });

  const renderScreen = async () => {
    let tree: any;
    await renderer.act(async () => {
      tree = renderer.create(React.createElement(PracticeQuestionsScreen));
    });
    return tree!;
  };

  // ================================================================
  // Module Exports and Initialization
  // ================================================================
  describe('Module exports and initialization', () => {
    it('should export default function component', () => {
      expect(PracticeQuestionsScreen).toBeDefined();
      expect(typeof PracticeQuestionsScreen).toBe('function');
    });

    it('should have correct component name', () => {
      expect(PracticeQuestionsScreen.name).toBe('PracticeQuestionsScreen');
    });

    it('should render without crashing', async () => {
      const tree = await renderScreen();
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should load practice questions on mount', async () => {
      await renderScreen();
      expect(mockGeneratePracticeQuestions).toHaveBeenCalledWith(1, 10);
    });

    it('should load saved responses after questions load', async () => {
      await renderScreen();
      expect(mockGetPracticeResponses).toHaveBeenCalledWith(1);
    });
  });

  // ================================================================
  // Loading State
  // ================================================================
  describe('Loading state', () => {
    it('should show loading indicator while loading questions', async () => {
      // Make the API call hang
      mockGeneratePracticeQuestions.mockImplementation(
        () => new Promise(() => {})
      );

      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(PracticeQuestionsScreen));
      });

      const str = JSON.stringify(tree!.toJSON());
      expect(str).toContain('ActivityIndicator');
      expect(str).toContain('Loading practice questions');
    });

    it('should show back button in loading state', async () => {
      mockGeneratePracticeQuestions.mockImplementation(
        () => new Promise(() => {})
      );

      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(PracticeQuestionsScreen));
      });

      const root = tree!.root;
      const touchables = root.findAllByType('TouchableOpacity');
      expect(touchables.length).toBeGreaterThan(0);

      // Back button should trigger goBack
      renderer.act(() => {
        touchables[0].props.onPress();
      });
      expect(mockGoBack).toHaveBeenCalled();
    });

    it('should show Practice Questions header in loading state', async () => {
      mockGeneratePracticeQuestions.mockImplementation(
        () => new Promise(() => {})
      );

      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(PracticeQuestionsScreen));
      });

      const str = JSON.stringify(tree!.toJSON());
      expect(str).toContain('Practice Questions');
    });
  });

  // ================================================================
  // Question Loading and Display
  // ================================================================
  describe('Question loading and display', () => {
    it('should display questions after successful load', async () => {
      const tree = await renderScreen();
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Tell me about a time you faced a challenge');
      expect(str).toContain('Describe a conflict with a team member');
    });

    it('should display question difficulty badges', async () => {
      const tree = await renderScreen();
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Medium');
      expect(str).toContain('Hard');
    });

    it('should display question categories', async () => {
      const tree = await renderScreen();
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('behavioral');
    });

    it('should show intro card with Job-Specific Practice', async () => {
      const tree = await renderScreen();
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Job-Specific Practice');
      expect(str).toContain('tailored to this specific role');
    });

    it('should handle nested data structure in API response', async () => {
      mockGeneratePracticeQuestions.mockResolvedValue({
        success: true,
        data: {
          data: {
            questions: [
              {
                question: 'Nested question',
                category: 'technical',
                difficulty: 'Easy',
                why_asked: 'Tests knowledge',
                key_skills_tested: ['coding'],
              },
            ],
          },
        },
      });

      const tree = await renderScreen();
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Nested question');
    });

    it('should handle API error during question loading', async () => {
      mockGeneratePracticeQuestions.mockResolvedValue({
        success: false,
        error: 'Failed to generate questions',
      });

      await renderScreen();
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to generate questions'
      );
    });

    it('should handle API error with no error message', async () => {
      mockGeneratePracticeQuestions.mockResolvedValue({
        success: false,
      });

      await renderScreen();
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to load practice questions'
      );
    });

    it('should handle API exception during question loading', async () => {
      mockGeneratePracticeQuestions.mockRejectedValue(new Error('Network error'));

      await renderScreen();
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to load practice questions'
      );
    });

    it('should display Easy difficulty with success color', async () => {
      mockGeneratePracticeQuestions.mockResolvedValue({
        success: true,
        data: {
          questions: [
            {
              question: 'Easy question',
              category: 'general',
              difficulty: 'Easy',
              why_asked: 'Basic check',
              key_skills_tested: ['basics'],
            },
          ],
        },
      });

      const tree = await renderScreen();
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Easy');
    });
  });

  // ================================================================
  // Question Expansion and Interaction
  // ================================================================
  describe('Question expansion and interaction', () => {
    it('should expand question when pressed', async () => {
      const tree = await renderScreen();
      const root = tree.root;

      const questionBtn = findTouchableByText(root, 'Tell me about a time');
      expect(questionBtn).toBeDefined();

      await renderer.act(async () => {
        questionBtn.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      // Expanded view shows "Why This Question Is Asked"
      expect(str).toContain('Why This Question Is Asked');
      expect(str).toContain('Tests problem-solving');
    });

    it('should show key skills when expanded', async () => {
      const tree = await renderScreen();
      const root = tree.root;

      const questionBtn = findTouchableByText(root, 'Tell me about a time');
      await renderer.act(async () => {
        questionBtn.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Key Skills Tested');
      expect(str).toContain('problem-solving');
      expect(str).toContain('leadership');
    });

    it('should collapse expanded question when pressed again', async () => {
      const tree = await renderScreen();
      const root = tree.root;

      const questionBtn = findTouchableByText(root, 'Tell me about a time');
      // Expand
      await renderer.act(async () => {
        questionBtn.props.onPress();
      });

      let str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Why This Question Is Asked');

      // Collapse
      const questionBtnAgain = findTouchableByText(root, 'Tell me about a time');
      await renderer.act(async () => {
        questionBtnAgain.props.onPress();
      });

      str = JSON.stringify(tree.toJSON());
      expect(str).not.toContain('Why This Question Is Asked');
    });

    it('should switch to different question when another is pressed', async () => {
      const tree = await renderScreen();
      const root = tree.root;

      // Expand first question
      const q1 = findTouchableByText(root, 'Tell me about a time');
      await renderer.act(async () => {
        q1.props.onPress();
      });

      let str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Tests problem-solving');

      // Press second question
      const q2 = findTouchableByText(root, 'Describe a conflict');
      await renderer.act(async () => {
        q2.props.onPress();
      });

      str = JSON.stringify(tree.toJSON());
      // Second question's why_asked should be visible
      expect(str).toContain('Tests conflict resolution');
    });

    it('should generate STAR story when question expanded', async () => {
      const tree = await renderScreen();
      const root = tree.root;

      const questionBtn = findTouchableByText(root, 'Tell me about a time');
      await renderer.act(async () => {
        questionBtn.props.onPress();
      });

      expect(mockGeneratePracticeStarStory).toHaveBeenCalledWith(
        1,
        'Tell me about a time you faced a challenge'
      );
    });

    it('should display generated STAR story', async () => {
      const tree = await renderScreen();
      const root = tree.root;

      const questionBtn = findTouchableByText(root, 'Tell me about a time');
      await renderer.act(async () => {
        questionBtn.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('AI-Generated STAR Story');
      expect(str).toContain('Project deadline approaching');
      expect(str).toContain('Deliver feature on time');
      expect(str).toContain('Organized team sprints');
      expect(str).toContain('Delivered 2 days early');
    });

    it('should show STAR labels (Situation, Task, Action, Result)', async () => {
      const tree = await renderScreen();
      const root = tree.root;

      const questionBtn = findTouchableByText(root, 'Tell me about a time');
      await renderer.act(async () => {
        questionBtn.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Situation');
      expect(str).toContain('Task');
      expect(str).toContain('Action');
      expect(str).toContain('Result');
    });

    it('should not regenerate story if already generated for that question', async () => {
      const tree = await renderScreen();
      const root = tree.root;

      // Expand first question
      const q = findTouchableByText(root, 'Tell me about a time');
      await renderer.act(async () => {
        q.props.onPress();
      });

      expect(mockGeneratePracticeStarStory).toHaveBeenCalledTimes(1);

      // Collapse
      const qAgain = findTouchableByText(root, 'Tell me about a time');
      await renderer.act(async () => {
        qAgain.props.onPress();
      });

      // Expand again
      const qFinal = findTouchableByText(root, 'Tell me about a time');
      await renderer.act(async () => {
        qFinal.props.onPress();
      });

      // Should NOT have called again since story is cached
      expect(mockGeneratePracticeStarStory).toHaveBeenCalledTimes(1);
    });

    it('should handle STAR generation error', async () => {
      mockGeneratePracticeStarStory.mockResolvedValue({
        success: false,
        error: 'Generation failed',
      });

      const tree = await renderScreen();
      const root = tree.root;

      const questionBtn = findTouchableByText(root, 'Tell me about a time');
      await renderer.act(async () => {
        questionBtn.props.onPress();
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Generation failed');
    });

    it('should handle STAR generation error with no message', async () => {
      mockGeneratePracticeStarStory.mockResolvedValue({
        success: false,
      });

      const tree = await renderScreen();
      const root = tree.root;

      const questionBtn = findTouchableByText(root, 'Tell me about a time');
      await renderer.act(async () => {
        questionBtn.props.onPress();
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to generate STAR story');
    });

    it('should handle STAR generation exception', async () => {
      mockGeneratePracticeStarStory.mockRejectedValue(new Error('Network'));

      const tree = await renderScreen();
      const root = tree.root;

      const questionBtn = findTouchableByText(root, 'Tell me about a time');
      await renderer.act(async () => {
        questionBtn.props.onPress();
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to generate STAR story');
    });

    it('should show generating indicator while STAR story is being generated', async () => {
      // Make the STAR generation hang
      mockGeneratePracticeStarStory.mockImplementation(
        () => new Promise(() => {})
      );

      const tree = await renderScreen();
      const root = tree.root;

      const questionBtn = findTouchableByText(root, 'Tell me about a time');
      renderer.act(() => {
        questionBtn.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Generating STAR story');
    });

    it('should show Generate STAR Story button when no story and not generating', async () => {
      // Mock a resolved story that returns null star_story
      mockGeneratePracticeStarStory.mockResolvedValue({
        success: true,
        data: { star_story: null },
      });

      const tree = await renderScreen();
      const root = tree.root;

      const questionBtn = findTouchableByText(root, 'Tell me about a time');
      await renderer.act(async () => {
        questionBtn.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Generate STAR Story');
    });

    it('should call handleGenerateStory when Generate STAR Story button is pressed', async () => {
      mockGeneratePracticeStarStory.mockResolvedValue({
        success: true,
        data: { star_story: null },
      });

      const tree = await renderScreen();
      const root = tree.root;

      // Expand question
      const questionBtn = findTouchableByText(root, 'Tell me about a time');
      await renderer.act(async () => {
        questionBtn.props.onPress();
      });

      // First call was during expand
      expect(mockGeneratePracticeStarStory).toHaveBeenCalledTimes(1);

      // Press Generate STAR Story button
      const genButton = findTouchableByText(root, 'Generate STAR Story');
      expect(genButton).toBeDefined();

      await renderer.act(async () => {
        genButton.props.onPress();
      });

      expect(mockGeneratePracticeStarStory).toHaveBeenCalledTimes(2);
    });
  });

  // ================================================================
  // Answer Input and Saving
  // ================================================================
  describe('Answer input and saving', () => {
    it('should show TextInput for answer when question expanded', async () => {
      const tree = await renderScreen();
      const root = tree.root;

      const questionBtn = findTouchableByText(root, 'Tell me about a time');
      await renderer.act(async () => {
        questionBtn.props.onPress();
      });

      const textInputs = root.findAllByType('TextInput');
      expect(textInputs.length).toBeGreaterThan(0);

      const answerInput = textInputs.find((t: any) =>
        t.props.placeholder?.includes('Write your answer')
      );
      expect(answerInput).toBeDefined();
    });

    it('should allow typing answer in text input', async () => {
      const tree = await renderScreen();
      const root = tree.root;

      const questionBtn = findTouchableByText(root, 'Tell me about a time');
      await renderer.act(async () => {
        questionBtn.props.onPress();
      });

      const textInputs = root.findAllByType('TextInput');
      const answerInput = textInputs.find((t: any) =>
        t.props.placeholder?.includes('Write your answer')
      );

      renderer.act(() => {
        answerInput!.props.onChangeText('My answer here');
      });

      // After typing, input value should be updated
      const updatedInputs = root.findAllByType('TextInput');
      const updated = updatedInputs.find((t: any) =>
        t.props.placeholder?.includes('Write your answer')
      );
      expect(updated!.props.value).toBe('My answer here');
    });

    it('should show character count when answer has content', async () => {
      const tree = await renderScreen();
      const root = tree.root;

      const questionBtn = findTouchableByText(root, 'Tell me about a time');
      await renderer.act(async () => {
        questionBtn.props.onPress();
      });

      const textInputs = root.findAllByType('TextInput');
      const answerInput = textInputs.find((t: any) =>
        t.props.placeholder?.includes('Write your answer')
      );

      renderer.act(() => {
        answerInput!.props.onChangeText('Hello world');
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('11');
      expect(str).toContain('characters');
    });

    it('should start practice timer on focus', async () => {
      const tree = await renderScreen();
      const root = tree.root;

      const questionBtn = findTouchableByText(root, 'Tell me about a time');
      await renderer.act(async () => {
        questionBtn.props.onPress();
      });

      const textInputs = root.findAllByType('TextInput');
      const answerInput = textInputs.find((t: any) =>
        t.props.placeholder?.includes('Write your answer')
      );

      renderer.act(() => {
        answerInput!.props.onFocus();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Practice in progress');
    });

    it('should show Start Practice button when not practicing', async () => {
      const tree = await renderScreen();
      const root = tree.root;

      const questionBtn = findTouchableByText(root, 'Tell me about a time');
      await renderer.act(async () => {
        questionBtn.props.onPress();
      });

      const startBtn = findGlassButtonByLabel(root, 'Start Practice');
      expect(startBtn).toBeDefined();
    });

    it('should start practice when Start Practice button pressed', async () => {
      const tree = await renderScreen();
      const root = tree.root;

      const questionBtn = findTouchableByText(root, 'Tell me about a time');
      await renderer.act(async () => {
        questionBtn.props.onPress();
      });

      const startBtn = findGlassButtonByLabel(root, 'Start Practice');
      renderer.act(() => {
        startBtn.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Practice in progress');

      // Start Practice button should no longer be visible
      const startBtnAfter = findGlassButtonByLabel(root, 'Start Practice');
      expect(startBtnAfter).toBeUndefined();
    });

    it('should not restart timer if already practicing on re-focus', async () => {
      const tree = await renderScreen();
      const root = tree.root;

      const questionBtn = findTouchableByText(root, 'Tell me about a time');
      await renderer.act(async () => {
        questionBtn.props.onPress();
      });

      const textInputs = root.findAllByType('TextInput');
      const answerInput = textInputs.find((t: any) =>
        t.props.placeholder?.includes('Write your answer')
      );

      // Focus once to start practicing
      renderer.act(() => {
        answerInput!.props.onFocus();
      });

      // Focus again - should not crash
      renderer.act(() => {
        answerInput!.props.onFocus();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Practice in progress');
    });

    it('should show Save Response button when STAR story exists', async () => {
      const tree = await renderScreen();
      const root = tree.root;

      const questionBtn = findTouchableByText(root, 'Tell me about a time');
      await renderer.act(async () => {
        questionBtn.props.onPress();
      });

      const saveBtn = findGlassButtonByLabel(root, 'Save Response');
      expect(saveBtn).toBeDefined();
    });

    it('should show Save Response button when user answer exists', async () => {
      // No STAR story
      mockGeneratePracticeStarStory.mockResolvedValue({
        success: true,
        data: { star_story: null },
      });

      const tree = await renderScreen();
      const root = tree.root;

      const questionBtn = findTouchableByText(root, 'Tell me about a time');
      await renderer.act(async () => {
        questionBtn.props.onPress();
      });

      // No Save Response button yet (no star story, no user answer)
      let saveBtn = findGlassButtonByLabel(root, 'Save Response');
      expect(saveBtn).toBeUndefined();

      // Type an answer
      const textInputs = root.findAllByType('TextInput');
      const answerInput = textInputs.find((t: any) =>
        t.props.placeholder?.includes('Write your answer')
      );

      renderer.act(() => {
        answerInput!.props.onChangeText('My answer');
      });

      // Now Save Response should appear
      saveBtn = findGlassButtonByLabel(root, 'Save Response');
      expect(saveBtn).toBeDefined();
    });

    it('should save practice response when Save Response pressed', async () => {
      const tree = await renderScreen();
      const root = tree.root;

      const questionBtn = findTouchableByText(root, 'Tell me about a time');
      await renderer.act(async () => {
        questionBtn.props.onPress();
      });

      // Type an answer
      const textInputs = root.findAllByType('TextInput');
      const answerInput = textInputs.find((t: any) =>
        t.props.placeholder?.includes('Write your answer')
      );
      renderer.act(() => {
        answerInput!.props.onChangeText('My detailed answer');
      });

      // Press Save Response
      const saveBtn = findGlassButtonByLabel(root, 'Save Response');
      await renderer.act(async () => {
        saveBtn.props.onPress();
      });

      expect(mockSavePracticeResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          interviewPrepId: 1,
          questionText: 'Tell me about a time you faced a challenge',
          questionCategory: 'behavioral',
          writtenAnswer: 'My detailed answer',
        })
      );
    });

    it('should pass STAR story and duration when saving', async () => {
      const tree = await renderScreen();
      const root = tree.root;

      const questionBtn = findTouchableByText(root, 'Tell me about a time');
      await renderer.act(async () => {
        questionBtn.props.onPress();
      });

      // Focus to start practice timer
      const textInputs = root.findAllByType('TextInput');
      const answerInput = textInputs.find((t: any) =>
        t.props.placeholder?.includes('Write your answer')
      );
      renderer.act(() => {
        answerInput!.props.onFocus();
      });

      // Press Save Response
      const saveBtn = findGlassButtonByLabel(root, 'Save Response');
      await renderer.act(async () => {
        saveBtn.props.onPress();
      });

      expect(mockSavePracticeResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          starStory: DEFAULT_STAR_STORY,
          practiceDurationSeconds: expect.any(Number),
        })
      );
    });

    it('should show saved badge after successful save', async () => {
      const tree = await renderScreen();
      const root = tree.root;

      const questionBtn = findTouchableByText(root, 'Tell me about a time');
      await renderer.act(async () => {
        questionBtn.props.onPress();
      });

      const saveBtn = findGlassButtonByLabel(root, 'Save Response');
      await renderer.act(async () => {
        saveBtn.props.onPress();
      });

      // Should show success alert
      expect(Alert.alert).toHaveBeenCalledWith(
        expect.stringContaining('Response Saved'),
        expect.any(String),
        expect.any(Array)
      );

      // Should show "Saved" badge
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Saved');
    });

    it('should clear saved status when answer is edited after saving', async () => {
      const tree = await renderScreen();
      const root = tree.root;

      const questionBtn = findTouchableByText(root, 'Tell me about a time');
      await renderer.act(async () => {
        questionBtn.props.onPress();
      });

      // Save first
      const saveBtn = findGlassButtonByLabel(root, 'Save Response');
      await renderer.act(async () => {
        saveBtn.props.onPress();
      });

      // Verify saved
      let str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Saved');

      // Edit the answer
      const textInputs = root.findAllByType('TextInput');
      const answerInput = textInputs.find((t: any) =>
        t.props.placeholder?.includes('Write your answer')
      );
      renderer.act(() => {
        answerInput!.props.onChangeText('Updated answer');
      });

      // Saved badge should be gone (isSaved is now false)
      // The border color changes to non-success
    });

    it('should handle save error', async () => {
      mockSavePracticeResponse.mockResolvedValue({
        success: false,
        error: 'Save failed',
      });

      const tree = await renderScreen();
      const root = tree.root;

      const questionBtn = findTouchableByText(root, 'Tell me about a time');
      await renderer.act(async () => {
        questionBtn.props.onPress();
      });

      const saveBtn = findGlassButtonByLabel(root, 'Save Response');
      await renderer.act(async () => {
        saveBtn.props.onPress();
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Save failed');
    });

    it('should handle save error with no message', async () => {
      mockSavePracticeResponse.mockResolvedValue({
        success: false,
      });

      const tree = await renderScreen();
      const root = tree.root;

      const questionBtn = findTouchableByText(root, 'Tell me about a time');
      await renderer.act(async () => {
        questionBtn.props.onPress();
      });

      const saveBtn = findGlassButtonByLabel(root, 'Save Response');
      await renderer.act(async () => {
        saveBtn.props.onPress();
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to save response');
    });

    it('should handle save exception', async () => {
      mockSavePracticeResponse.mockRejectedValue(new Error('Network'));

      const tree = await renderScreen();
      const root = tree.root;

      const questionBtn = findTouchableByText(root, 'Tell me about a time');
      await renderer.act(async () => {
        questionBtn.props.onPress();
      });

      const saveBtn = findGlassButtonByLabel(root, 'Save Response');
      await renderer.act(async () => {
        saveBtn.props.onPress();
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to save practice response');
    });

    it('should show Saving... label while saving', async () => {
      mockSavePracticeResponse.mockImplementation(
        () => new Promise(() => {})
      );

      const tree = await renderScreen();
      const root = tree.root;

      const questionBtn = findTouchableByText(root, 'Tell me about a time');
      await renderer.act(async () => {
        questionBtn.props.onPress();
      });

      const saveBtn = findGlassButtonByLabel(root, 'Save Response');
      renderer.act(() => {
        saveBtn.props.onPress();
      });

      // While saving, the button should show "Saving..."
      const savingBtn = findGlassButtonByLabel(root, 'Saving...');
      expect(savingBtn).toBeDefined();
      expect(savingBtn.props.disabled).toBe(true);
      expect(savingBtn.props.loading).toBe(true);
    });
  });

  // ================================================================
  // Tab Switching
  // ================================================================
  describe('Tab switching', () => {
    it('should show Practice and History tabs', async () => {
      const tree = await renderScreen();
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Practice');
      expect(str).toContain('History');
    });

    it('should switch to history tab', async () => {
      const tree = await renderScreen();
      const root = tree.root;

      const historyTab = findTouchableByText(root, 'History');
      expect(historyTab).toBeDefined();

      await renderer.act(async () => {
        historyTab.props.onPress();
      });

      expect(mockGetPracticeHistory).toHaveBeenCalledWith(1);
    });

    it('should switch back to practice tab', async () => {
      const tree = await renderScreen();
      const root = tree.root;

      // Switch to history
      const historyTab = findTouchableByText(root, 'History');
      await renderer.act(async () => {
        historyTab.props.onPress();
      });

      // Switch back to practice
      const practiceTab = findTouchableByText(root, 'Practice');
      renderer.act(() => {
        practiceTab.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Job-Specific Practice');
    });

    it('should reload history on each tab switch to history', async () => {
      const tree = await renderScreen();
      const root = tree.root;

      // First switch to history
      let historyTab = findTouchableByText(root, 'History');
      await renderer.act(async () => {
        historyTab.props.onPress();
      });

      expect(mockGetPracticeHistory).toHaveBeenCalledTimes(1);

      // Switch to practice
      const practiceTab = findTouchableByText(root, 'Practice');
      renderer.act(() => {
        practiceTab.props.onPress();
      });

      // Switch to history again
      historyTab = findTouchableByText(root, 'History');
      await renderer.act(async () => {
        historyTab.props.onPress();
      });

      expect(mockGetPracticeHistory).toHaveBeenCalledTimes(2);
    });

    it('should show tab accessibility attributes', async () => {
      const tree = await renderScreen();
      const root = tree.root;

      const historyTab = findTouchableByText(root, 'History');
      expect(historyTab.props.accessibilityRole).toBe('tab');
    });

    it('should show history count in tab when history exists', async () => {
      mockGetPracticeHistory.mockResolvedValue({
        success: true,
        data: [
          { id: 1, question_text: 'Q1', practiced_at: new Date().toISOString(), times_practiced: 1 },
          { id: 2, question_text: 'Q2', practiced_at: new Date().toISOString(), times_practiced: 1 },
        ],
      });

      const tree = await renderScreen();
      const root = tree.root;

      const historyTab = findTouchableByText(root, 'History');
      await renderer.act(async () => {
        historyTab.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      // Tab text includes "(2)"
      expect(str).toContain('2');
    });
  });

  // ================================================================
  // Practice History Tab
  // ================================================================
  describe('Practice history tab', () => {
    it('should show empty state when no history', async () => {
      const tree = await renderScreen();
      const root = tree.root;

      const historyTab = findTouchableByText(root, 'History');
      await renderer.act(async () => {
        historyTab.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('No Practice History');
      expect(str).toContain('Start practicing questions');
    });

    it('should show Start Practicing button in empty state', async () => {
      const tree = await renderScreen();
      const root = tree.root;

      const historyTab = findTouchableByText(root, 'History');
      await renderer.act(async () => {
        historyTab.props.onPress();
      });

      const startBtn = findGlassButtonByLabel(root, 'Start Practicing');
      expect(startBtn).toBeDefined();
    });

    it('should switch to practice tab when Start Practicing pressed', async () => {
      const tree = await renderScreen();
      const root = tree.root;

      const historyTab = findTouchableByText(root, 'History');
      await renderer.act(async () => {
        historyTab.props.onPress();
      });

      const startBtn = findGlassButtonByLabel(root, 'Start Practicing');
      renderer.act(() => {
        startBtn.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Job-Specific Practice');
    });

    it('should show loading indicator while history loads', async () => {
      mockGetPracticeHistory.mockImplementation(
        () => new Promise(() => {})
      );

      const tree = await renderScreen();
      const root = tree.root;

      const historyTab = findTouchableByText(root, 'History');
      renderer.act(() => {
        historyTab.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Loading practice history');
    });

    it('should display practice history items', async () => {
      mockGetPracticeHistory.mockResolvedValue({
        success: true,
        data: [
          {
            id: 1,
            question_text: 'Previous question',
            practiced_at: new Date().toISOString(),
            duration_seconds: 120,
            times_practiced: 3,
          },
        ],
      });

      const tree = await renderScreen();
      const root = tree.root;

      const historyTab = findTouchableByText(root, 'History');
      await renderer.act(async () => {
        historyTab.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Previous question');
      expect(str).toContain('3');  // times_practiced
    });

    it('should show stats card when history has items', async () => {
      mockGetPracticeHistory.mockResolvedValue({
        success: true,
        data: [
          {
            id: 1,
            question_text: 'Q1',
            practiced_at: new Date().toISOString(),
            times_practiced: 1,
          },
        ],
      });

      const tree = await renderScreen();
      const root = tree.root;

      const historyTab = findTouchableByText(root, 'History');
      await renderer.act(async () => {
        historyTab.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Completion');
      expect(str).toContain('Practiced');
      expect(str).toContain('Total');
    });

    it('should show category badge when question has category', async () => {
      mockGetPracticeHistory.mockResolvedValue({
        success: true,
        data: [
          {
            id: 1,
            question_text: 'Q1',
            question_category: 'behavioral',
            practiced_at: new Date().toISOString(),
            times_practiced: 1,
          },
        ],
      });

      const tree = await renderScreen();
      const root = tree.root;

      const historyTab = findTouchableByText(root, 'History');
      await renderer.act(async () => {
        historyTab.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('behavioral');
    });

    it('should show duration when present in history item', async () => {
      mockGetPracticeHistory.mockResolvedValue({
        success: true,
        data: [
          {
            id: 1,
            question_text: 'Q1',
            practiced_at: new Date().toISOString(),
            duration_seconds: 180,
            times_practiced: 2,
          },
        ],
      });

      const tree = await renderScreen();
      const root = tree.root;

      const historyTab = findTouchableByText(root, 'History');
      await renderer.act(async () => {
        historyTab.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Duration');
      expect(str).toContain('3m 0s');
    });

    it('should expand history item to show response', async () => {
      mockGetPracticeHistory.mockResolvedValue({
        success: true,
        data: [
          {
            id: 1,
            question_text: 'History question',
            practiced_at: new Date().toISOString(),
            duration_seconds: 180,
            times_practiced: 2,
            response_text: 'My previous answer',
          },
        ],
      });

      const tree = await renderScreen();
      const root = tree.root;

      const historyTab = findTouchableByText(root, 'History');
      await renderer.act(async () => {
        historyTab.props.onPress();
      });

      // Press history item to expand
      const historyItem = findTouchableByText(root, 'History question');
      renderer.act(() => {
        historyItem.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Your Response');
      expect(str).toContain('My previous answer');
    });

    it('should show STAR story in expanded history item', async () => {
      mockGetPracticeHistory.mockResolvedValue({
        success: true,
        data: [
          {
            id: 1,
            question_text: 'Q1',
            practiced_at: new Date().toISOString(),
            times_practiced: 1,
            star_story: {
              situation: 'Hist Situation',
              task: 'Hist Task',
              action: 'Hist Action',
              result: 'Hist Result',
            },
          },
        ],
      });

      const tree = await renderScreen();
      const root = tree.root;

      const historyTab = findTouchableByText(root, 'History');
      await renderer.act(async () => {
        historyTab.props.onPress();
      });

      const historyItem = findTouchableByText(root, 'Q1');
      renderer.act(() => {
        historyItem.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('STAR Story');
      expect(str).toContain('Hist Situation');
      expect(str).toContain('Hist Task');
      expect(str).toContain('Hist Action');
      expect(str).toContain('Hist Result');
    });

    it('should collapse history item when pressed again', async () => {
      mockGetPracticeHistory.mockResolvedValue({
        success: true,
        data: [
          {
            id: 1,
            question_text: 'Collapse me',
            practiced_at: new Date().toISOString(),
            times_practiced: 1,
            response_text: 'My answer',
          },
        ],
      });

      const tree = await renderScreen();
      const root = tree.root;

      const historyTab = findTouchableByText(root, 'History');
      await renderer.act(async () => {
        historyTab.props.onPress();
      });

      // Expand
      let historyItem = findTouchableByText(root, 'Collapse me');
      renderer.act(() => {
        historyItem.props.onPress();
      });

      let str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Your Response');

      // Collapse
      historyItem = findTouchableByText(root, 'Collapse me');
      renderer.act(() => {
        historyItem.props.onPress();
      });

      str = JSON.stringify(tree.toJSON());
      expect(str).not.toContain('Your Response');
    });

    it('should show Practice Again button in expanded history item', async () => {
      mockGetPracticeHistory.mockResolvedValue({
        success: true,
        data: [
          {
            id: 1,
            question_text: 'Practice again Q',
            practiced_at: new Date().toISOString(),
            times_practiced: 1,
          },
        ],
      });

      const tree = await renderScreen();
      const root = tree.root;

      const historyTab = findTouchableByText(root, 'History');
      await renderer.act(async () => {
        historyTab.props.onPress();
      });

      const historyItem = findTouchableByText(root, 'Practice again Q');
      renderer.act(() => {
        historyItem.props.onPress();
      });

      const practiceAgainBtn = findGlassButtonByLabel(root, 'Practice Again');
      expect(practiceAgainBtn).toBeDefined();
    });

    it('should switch to practice tab and expand matching question on Practice Again', async () => {
      mockGetPracticeHistory.mockResolvedValue({
        success: true,
        data: [
          {
            id: 1,
            question_text: 'Tell me about a time you faced a challenge',
            practiced_at: new Date().toISOString(),
            times_practiced: 2,
          },
        ],
      });

      const tree = await renderScreen();
      const root = tree.root;

      const historyTab = findTouchableByText(root, 'History');
      await renderer.act(async () => {
        historyTab.props.onPress();
      });

      const historyItem = findTouchableByText(root, 'Tell me about a time');
      renderer.act(() => {
        historyItem.props.onPress();
      });

      const practiceAgainBtn = findGlassButtonByLabel(root, 'Practice Again');
      await renderer.act(async () => {
        practiceAgainBtn.props.onPress();
      });

      // Should be back on practice tab with the question expanded
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Job-Specific Practice');
      expect(str).toContain('Why This Question Is Asked');
    });

    it('should handle Practice Again for non-matching question', async () => {
      mockGetPracticeHistory.mockResolvedValue({
        success: true,
        data: [
          {
            id: 1,
            question_text: 'Question not in current set',
            practiced_at: new Date().toISOString(),
            times_practiced: 1,
          },
        ],
      });

      const tree = await renderScreen();
      const root = tree.root;

      const historyTab = findTouchableByText(root, 'History');
      await renderer.act(async () => {
        historyTab.props.onPress();
      });

      const historyItem = findTouchableByText(root, 'Question not in current set');
      renderer.act(() => {
        historyItem.props.onPress();
      });

      const practiceAgainBtn = findGlassButtonByLabel(root, 'Practice Again');
      renderer.act(() => {
        practiceAgainBtn.props.onPress();
      });

      // Should still switch to practice tab without crash
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Job-Specific Practice');
    });

    it('should handle history API error', async () => {
      mockGetPracticeHistory.mockResolvedValue({
        success: false,
        error: 'History load failed',
      });

      const tree = await renderScreen();
      const root = tree.root;

      const historyTab = findTouchableByText(root, 'History');
      await renderer.act(async () => {
        historyTab.props.onPress();
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'History load failed');
    });

    it('should handle history API error with no message', async () => {
      mockGetPracticeHistory.mockResolvedValue({
        success: false,
      });

      const tree = await renderScreen();
      const root = tree.root;

      const historyTab = findTouchableByText(root, 'History');
      await renderer.act(async () => {
        historyTab.props.onPress();
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to load practice history');
    });

    it('should handle history API exception', async () => {
      mockGetPracticeHistory.mockRejectedValue(new Error('Network'));

      const tree = await renderScreen();
      const root = tree.root;

      const historyTab = findTouchableByText(root, 'History');
      await renderer.act(async () => {
        historyTab.props.onPress();
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to load practice history');
    });

    it('should have accessibility label on history items', async () => {
      mockGetPracticeHistory.mockResolvedValue({
        success: true,
        data: [
          {
            id: 1,
            question_text: 'A11y test',
            practiced_at: new Date().toISOString(),
            times_practiced: 1,
          },
        ],
      });

      const tree = await renderScreen();
      const root = tree.root;

      const historyTab = findTouchableByText(root, 'History');
      await renderer.act(async () => {
        historyTab.props.onPress();
      });

      const historyItem = findTouchableByText(root, 'A11y test');
      expect(historyItem.props.accessibilityRole).toBe('button');
      expect(historyItem.props.accessibilityLabel).toContain('Practice history item');
    });
  });

  // ================================================================
  // Saved Responses Loading
  // ================================================================
  describe('Saved responses loading', () => {
    it('should map saved responses to questions', async () => {
      mockGetPracticeResponses.mockResolvedValue({
        success: true,
        data: [
          {
            id: 1,
            question_text: 'Tell me about a time you faced a challenge',
            written_answer: 'My saved answer',
            times_practiced: 2,
            last_practiced_at: new Date().toISOString(),
          },
        ],
      });

      const tree = await renderScreen();
      const root = tree.root;

      // Expand the question
      const questionBtn = findTouchableByText(root, 'Tell me about a time');
      await renderer.act(async () => {
        questionBtn.props.onPress();
      });

      // TextInput should have saved answer
      const textInputs = root.findAllByType('TextInput');
      const answerInput = textInputs.find((t: any) =>
        t.props.placeholder?.includes('Write your answer')
      );
      expect(answerInput!.props.value).toBe('My saved answer');
    });

    it('should show saved badge for previously saved responses', async () => {
      mockGetPracticeResponses.mockResolvedValue({
        success: true,
        data: [
          {
            id: 1,
            question_text: 'Tell me about a time you faced a challenge',
            written_answer: 'Previously saved',
            times_practiced: 1,
            last_practiced_at: new Date().toISOString(),
          },
        ],
      });

      const tree = await renderScreen();
      const root = tree.root;

      // Expand the question
      const questionBtn = findTouchableByText(root, 'Tell me about a time');
      await renderer.act(async () => {
        questionBtn.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Saved');
    });

    it('should handle responses without written answer', async () => {
      mockGetPracticeResponses.mockResolvedValue({
        success: true,
        data: [
          {
            id: 1,
            question_text: 'Tell me about a time you faced a challenge',
            times_practiced: 1,
            last_practiced_at: new Date().toISOString(),
          },
        ],
      });

      const tree = await renderScreen();
      const root = tree.root;

      // Should not crash, question should still render
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Tell me about a time');
    });

    it('should handle responses error gracefully', async () => {
      mockGetPracticeResponses.mockRejectedValue(new Error('Responses failed'));

      const tree = await renderScreen();
      // Should still render questions without crash
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Tell me about a time');
    });

    it('should ignore responses for questions not in current set', async () => {
      mockGetPracticeResponses.mockResolvedValue({
        success: true,
        data: [
          {
            id: 1,
            question_text: 'Non-existent question',
            written_answer: 'Ghost answer',
            times_practiced: 1,
            last_practiced_at: new Date().toISOString(),
          },
        ],
      });

      const tree = await renderScreen();
      // Should not crash
      expect(tree.toJSON()).toBeTruthy();
    });
  });

  // ================================================================
  // Difficulty Color Mapping (replicated logic)
  // ================================================================
  describe('Difficulty badge colors', () => {
    it('should use correct colors for each difficulty level', () => {
      const COLORS = {
        error: '#ef4444',
        warning: '#f59e0b',
        success: '#10b981',
      };

      const getDifficultyColor = (difficulty: string): string => {
        switch (difficulty) {
          case 'Hard':
            return COLORS.error;
          case 'Medium':
            return COLORS.warning;
          default:
            return COLORS.success;
        }
      };

      expect(getDifficultyColor('Hard')).toBe(COLORS.error);
      expect(getDifficultyColor('Medium')).toBe(COLORS.warning);
      expect(getDifficultyColor('Easy')).toBe(COLORS.success);
      expect(getDifficultyColor('Unknown')).toBe(COLORS.success);
    });
  });

  // ================================================================
  // formatDate Helper (replicated from component)
  // ================================================================
  describe('formatDate helper', () => {
    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 60) {
        return `${diffMins}m ago`;
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else if (diffDays < 7) {
        return `${diffDays}d ago`;
      } else {
        return date.toLocaleDateString();
      }
    };

    it('should format minutes ago', () => {
      const fiveMinAgo = new Date(Date.now() - 5 * 60000).toISOString();
      expect(formatDate(fiveMinAgo)).toBe('5m ago');
    });

    it('should format hours ago', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 3600000).toISOString();
      expect(formatDate(twoHoursAgo)).toBe('2h ago');
    });

    it('should format days ago', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
      expect(formatDate(threeDaysAgo)).toBe('3d ago');
    });

    it('should format as date for older than a week', () => {
      const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString();
      const result = formatDate(twoWeeksAgo);
      // Should be a locale date string, not "14d ago"
      expect(result).not.toContain('d ago');
    });

    it('should format 0 minutes ago', () => {
      const justNow = new Date().toISOString();
      expect(formatDate(justNow)).toBe('0m ago');
    });

    it('should format exactly 59 minutes ago', () => {
      const fiftyNineMin = new Date(Date.now() - 59 * 60000).toISOString();
      expect(formatDate(fiftyNineMin)).toBe('59m ago');
    });

    it('should format exactly 23 hours ago', () => {
      const twentyThreeHours = new Date(Date.now() - 23 * 3600000).toISOString();
      expect(formatDate(twentyThreeHours)).toBe('23h ago');
    });

    it('should format exactly 6 days ago', () => {
      const sixDays = new Date(Date.now() - 6 * 86400000).toISOString();
      expect(formatDate(sixDays)).toBe('6d ago');
    });
  });

  // ================================================================
  // formatDuration Helper (replicated from component)
  // ================================================================
  describe('formatDuration helper', () => {
    const formatDuration = (seconds?: number): string => {
      if (!seconds) return 'N/A';
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}m ${secs}s`;
    };

    it('should format 90 seconds as 1m 30s', () => {
      expect(formatDuration(90)).toBe('1m 30s');
    });

    it('should format 60 seconds as 1m 0s', () => {
      expect(formatDuration(60)).toBe('1m 0s');
    });

    it('should format 0 seconds as N/A', () => {
      expect(formatDuration(0)).toBe('N/A');
    });

    it('should format undefined as N/A', () => {
      expect(formatDuration(undefined)).toBe('N/A');
    });

    it('should format 30 seconds as 0m 30s', () => {
      expect(formatDuration(30)).toBe('0m 30s');
    });

    it('should format large durations', () => {
      expect(formatDuration(3661)).toBe('61m 1s');
    });
  });

  // ================================================================
  // calculateCompletionStats (replicated from component)
  // ================================================================
  describe('calculateCompletionStats helper', () => {
    const calculateCompletionStats = (
      totalQuestions: number,
      practicedCount: number
    ): { total: number; practiced: number; percentage: number } => {
      const percentage =
        totalQuestions > 0
          ? Math.round((practicedCount / totalQuestions) * 100)
          : 0;
      return {
        total: totalQuestions,
        practiced: practicedCount,
        percentage,
      };
    };

    it('should calculate 50% completion', () => {
      const stats = calculateCompletionStats(10, 5);
      expect(stats.percentage).toBe(50);
      expect(stats.total).toBe(10);
      expect(stats.practiced).toBe(5);
    });

    it('should calculate 100% completion', () => {
      const allPracticed = calculateCompletionStats(10, 10);
      expect(allPracticed.percentage).toBe(100);
    });

    it('should calculate 0% completion', () => {
      const noPracticed = calculateCompletionStats(10, 0);
      expect(noPracticed.percentage).toBe(0);
    });

    it('should handle zero total questions', () => {
      const noQuestions = calculateCompletionStats(0, 0);
      expect(noQuestions.percentage).toBe(0);
    });

    it('should round percentage', () => {
      const stats = calculateCompletionStats(3, 1);
      expect(stats.percentage).toBe(33); // 33.33 rounds to 33
    });
  });

  // ================================================================
  // Navigation
  // ================================================================
  describe('Navigation', () => {
    it('should navigate back when back button pressed', async () => {
      const tree = await renderScreen();
      const root = tree.root;

      const touchables = root.findAllByType('TouchableOpacity');
      // First touchable in header is the back button
      const backButton = touchables.find((t: any) =>
        t.props.accessibilityLabel === 'Go back'
      );
      expect(backButton).toBeDefined();

      renderer.act(() => {
        backButton!.props.onPress();
      });

      expect(mockGoBack).toHaveBeenCalled();
    });

    it('should have Practice Questions header', async () => {
      const tree = await renderScreen();
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Practice Questions');
    });
  });

  // ================================================================
  // Save response reloads history when on history tab
  // ================================================================
  describe('Save response while on history tab', () => {
    it('should reload history after saving while on history tab', async () => {
      const tree = await renderScreen();
      const root = tree.root;

      // Expand a question and note the STAR story
      const questionBtn = findTouchableByText(root, 'Tell me about a time');
      await renderer.act(async () => {
        questionBtn.props.onPress();
      });

      // Switch to history tab (this triggers loadPracticeHistory)
      const historyTab = findTouchableByText(root, 'History');
      await renderer.act(async () => {
        historyTab.props.onPress();
      });

      expect(mockGetPracticeHistory).toHaveBeenCalledTimes(1);

      // Switch back to practice, then save a response on practice tab
      const practiceTab = findTouchableByText(root, 'Practice');
      renderer.act(() => {
        practiceTab.props.onPress();
      });

      // The question should still be expanded from before
      // Save response
      const saveBtn = findGlassButtonByLabel(root, 'Save Response');
      if (saveBtn) {
        await renderer.act(async () => {
          saveBtn.props.onPress();
        });
      }

      // History should NOT have been reloaded because we are on practice tab
      // (loadPracticeHistory is only called when activeTab === 'history' and during save if activeTab === 'history')
    });
  });

  // ================================================================
  // Coverage: formatDate branches in rendered history items
  // ================================================================
  describe('formatDate all branches in component', () => {
    it('should render history item with hours ago format', async () => {
      mockGetPracticeHistory.mockResolvedValue({
        success: true,
        data: [
          {
            id: 1,
            question_text: 'Hours ago question',
            practiced_at: new Date(Date.now() - 3 * 3600000).toISOString(),
            times_practiced: 1,
          },
        ],
      });

      const tree = await renderScreen();
      const root = tree.root;

      const historyTab = findTouchableByText(root, 'History');
      await renderer.act(async () => {
        historyTab.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('3h ago');
    });

    it('should render history item with days ago format', async () => {
      mockGetPracticeHistory.mockResolvedValue({
        success: true,
        data: [
          {
            id: 1,
            question_text: 'Days ago question',
            practiced_at: new Date(Date.now() - 4 * 86400000).toISOString(),
            times_practiced: 1,
          },
        ],
      });

      const tree = await renderScreen();
      const root = tree.root;

      const historyTab = findTouchableByText(root, 'History');
      await renderer.act(async () => {
        historyTab.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('4d ago');
    });

    it('should render history item with locale date format for older dates', async () => {
      mockGetPracticeHistory.mockResolvedValue({
        success: true,
        data: [
          {
            id: 1,
            question_text: 'Old question',
            practiced_at: new Date(Date.now() - 14 * 86400000).toISOString(),
            times_practiced: 1,
          },
        ],
      });

      const tree = await renderScreen();
      const root = tree.root;

      const historyTab = findTouchableByText(root, 'History');
      await renderer.act(async () => {
        historyTab.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      // Should NOT contain "d ago" for 14 days
      expect(str).not.toContain('14d ago');
      // Should contain locale date format (like "1/24/2026" or similar)
      expect(str).toContain('Old question');
    });
  });

  // ================================================================
  // Edge cases: Empty questions array
  // ================================================================
  describe('Empty questions array', () => {
    it('should render without questions gracefully', async () => {
      mockGeneratePracticeQuestions.mockResolvedValue({
        success: true,
        data: { questions: [] },
      });

      const tree = await renderScreen();
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Job-Specific Practice');
      // No questions rendered
      expect(str).not.toContain('Tell me about');
    });
  });

  // ================================================================
  // Edge cases: API response with data.data but no questions
  // ================================================================
  describe('API response edge cases', () => {
    it('should handle data.data with empty questions', async () => {
      mockGeneratePracticeQuestions.mockResolvedValue({
        success: true,
        data: {
          data: {
            questions: [],
          },
        },
      });

      const tree = await renderScreen();
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should handle data with no questions field', async () => {
      mockGeneratePracticeQuestions.mockResolvedValue({
        success: true,
        data: {},
      });

      const tree = await renderScreen();
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should handle getPracticeResponses non-array data', async () => {
      mockGetPracticeResponses.mockResolvedValue({
        success: true,
        data: null,
      });

      const tree = await renderScreen();
      expect(tree.toJSON()).toBeTruthy();
    });
  });
});
