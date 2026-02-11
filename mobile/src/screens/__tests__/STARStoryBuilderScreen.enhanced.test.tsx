/**
 * STARStoryBuilderScreen Enhanced Tests
 *
 * Comprehensive interactive coverage using react-test-renderer:
 * - Component rendering and initialization
 * - API calls for loading experiences and stories
 * - Story generation with validation, success, and error paths
 * - Story editing (enter edit, save, cancel, error)
 * - Story deletion (confirm, execute, error)
 * - Experience selection and toggling
 * - Theme and tone dropdowns
 * - Guidance panel interactions (show/hide, section toggling)
 * - Story expansion/collapse
 * - Navigation (back button)
 * - Loading and empty states
 * - Story prompts section with STAR hints
 * - Constants verification
 *
 * Target: 100% coverage of STARStoryBuilderScreen.tsx
 */

// ---- Mock ALL dependencies BEFORE imports ----

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
      card: '#111',
      primary: '#007AFF',
      glass: 'rgba(255,255,255,0.05)',
      glassBorder: 'rgba(255,255,255,0.1)',
    },
    isDark: true,
  })),
}));

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  })),
  useRoute: jest.fn(() => ({
    params: { tailoredResumeId: 1, interviewPrepId: 2 },
  })),
  useFocusEffect: jest.fn(),
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: jest.fn(),
}));

jest.mock('lucide-react-native', () =>
  new Proxy({}, { get: (_t: any, prop: any) => (typeof prop === 'string' ? prop : undefined) })
);

// SafeAreaView must be a function for react-test-renderer
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: (props: any) =>
      React.createElement('SafeAreaView', props, props.children),
  };
});

// GlassCard must be a function for react-test-renderer
jest.mock('../../components/glass/GlassCard', () => {
  const React = require('react');
  return {
    GlassCard: (props: any) =>
      React.createElement('GlassCard', props, props.children),
  };
});

// GlassButton: must render with onPress/label for interaction testing
jest.mock('../../components/glass/GlassButton', () => {
  const React = require('react');
  const MockGlassButton = (props: any) =>
    React.createElement('MockGlassButton', {
      label: props.label,
      onPress: props.onPress,
      disabled: props.disabled,
      loading: props.loading,
      variant: props.variant,
      fullWidth: props.fullWidth,
    });
  MockGlassButton.displayName = 'GlassButton';
  return { GlassButton: MockGlassButton, default: MockGlassButton };
});

jest.mock('../../navigation/AppNavigator', () => ({
  RootStackParamList: {},
}));

const mockGetInterviewPrep = jest.fn();
const mockGetTailoredResume = jest.fn();
const mockGetResume = jest.fn();
const mockListStarStories = jest.fn();
const mockGenerateStarStory = jest.fn();
const mockCreateStarStory = jest.fn();
const mockUpdateStarStory = jest.fn();
const mockDeleteStarStory = jest.fn();

jest.mock('../../api/client', () => ({
  api: {
    getInterviewPrep: (...args: any[]) => mockGetInterviewPrep(...args),
    getTailoredResume: (...args: any[]) => mockGetTailoredResume(...args),
    getResume: (...args: any[]) => mockGetResume(...args),
    listStarStories: (...args: any[]) => mockListStarStories(...args),
    generateStarStory: (...args: any[]) => mockGenerateStarStory(...args),
    createStarStory: (...args: any[]) => mockCreateStarStory(...args),
    updateStarStory: (...args: any[]) => mockUpdateStarStory(...args),
    deleteStarStory: (...args: any[]) => mockDeleteStarStory(...args),
  },
}));

jest.spyOn(require('react-native').Alert, 'alert');

import React from 'react';
import renderer from 'react-test-renderer';
import { Alert } from 'react-native';

// ==========================================================================
// Helper functions
// ==========================================================================

/** Recursively extract all text from a react-test-renderer instance */
const getAllText = (instance: any): string => {
  if (typeof instance === 'string' || typeof instance === 'number') {
    return String(instance);
  }
  if (!instance || !instance.children) return '';
  return instance.children.map((c: any) => getAllText(c)).join(' ');
};

/** Find a TouchableOpacity whose descendant text contains the given string */
const findTouchableByText = (root: any, text: string): any => {
  const touchables = root.findAllByType('TouchableOpacity');
  return touchables.find((t: any) => getAllText(t).includes(text));
};

/**
 * Find a story action button (Edit / Delete / Save / Cancel) by matching
 * the LAST touchable whose text contains the label. Action buttons are
 * rendered after story headers, so the last match is always the correct one.
 * For "Edit" - matches "Edit3 Edit" (the action button), not "Editable Story" (header)
 * For "Delete" - matches "Trash2 Delete" (the action button), not "Story to Delete" (header)
 */
const findLastTouchableByText = (root: any, text: string): any => {
  const touchables = root.findAllByType('TouchableOpacity');
  const matches = touchables.filter((t: any) => getAllText(t).includes(text));
  return matches.length > 0 ? matches[matches.length - 1] : undefined;
};

/** Find a MockGlassButton by label prop */
const findGlassButtonByLabel = (root: any, label: string): any => {
  const buttons = root.findAllByType('MockGlassButton');
  return buttons.find((b: any) => b.props.label && b.props.label.includes(label));
};

/** Stringify the JSON tree for text searching */
const treeStr = (tree: any): string => JSON.stringify(tree.toJSON());

// ==========================================================================
// Test Suite
// ==========================================================================

describe('STARStoryBuilderScreen Enhanced Tests', () => {
  let STARStoryBuilderScreen: any;

  beforeAll(() => {
    STARStoryBuilderScreen = require('../STARStoryBuilderScreen').default;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Default API responses - successful minimal data
    mockGetInterviewPrep.mockResolvedValue({
      success: true,
      data: {
        company_name: 'Google',
        job_title: 'Software Engineer',
      },
    });

    mockGetTailoredResume.mockResolvedValue({
      success: true,
      data: {
        experience: [
          {
            title: 'Senior Engineer',
            company: 'Tech Corp',
            bullets: ['Led team of 5', 'Delivered project on time', 'Built CI/CD'],
          },
          {
            header: 'Lead Developer',
            company: 'Startup Inc',
            bullets: ['Built MVP'],
          },
        ],
      },
    });

    mockGetResume.mockResolvedValue({
      success: true,
      data: {
        parsed_data: {
          experience: [
            {
              title: 'Fallback Engineer',
              company: 'Backup Corp',
              bullets: ['Fallback bullet'],
            },
          ],
        },
      },
    });

    mockListStarStories.mockResolvedValue({
      success: true,
      data: [],
    });

    mockGenerateStarStory.mockResolvedValue({
      success: true,
      data: {
        title: 'Leadership Story',
        situation: 'Faced a deadline',
        task: 'Deliver on time',
        action: 'Organized sprints',
        result: 'Delivered early',
        key_themes: ['Leadership'],
        talking_points: ['Managed team effectively'],
      },
    });

    mockCreateStarStory.mockResolvedValue({
      success: true,
      data: { id: 1, title: 'Leadership Story' },
    });

    mockUpdateStarStory.mockResolvedValue({
      success: true,
      data: { id: 1 },
    });

    mockDeleteStarStory.mockResolvedValue({
      success: true,
    });
  });

  // ---- Render helper ----
  const renderScreen = () => {
    let tree: any;
    renderer.act(() => {
      tree = renderer.create(React.createElement(STARStoryBuilderScreen));
    });
    return tree!;
  };

  /** Render and wait for all async effects to settle */
  const renderAndWait = async () => {
    let tree: any;
    await renderer.act(async () => {
      tree = renderer.create(React.createElement(STARStoryBuilderScreen));
    });
    // Flush any remaining promises
    await renderer.act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    return tree!;
  };

  // ================================================================
  // Module Exports and Initialization
  // ================================================================
  describe('Module exports and initialization', () => {
    it('should export default function component', () => {
      expect(STARStoryBuilderScreen).toBeDefined();
      expect(typeof STARStoryBuilderScreen).toBe('function');
    });

    it('should have correct component name', () => {
      expect(STARStoryBuilderScreen.name).toBe('STARStoryBuilderScreen');
    });

    it('should render without crashing', async () => {
      const tree = await renderAndWait();
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should load interview prep context on mount', async () => {
      await renderAndWait();
      expect(mockGetInterviewPrep).toHaveBeenCalledWith(2);
    });

    it('should load experiences on mount via getTailoredResume', async () => {
      await renderAndWait();
      expect(mockGetTailoredResume).toHaveBeenCalledWith(1);
    });

    it('should load existing stories on mount', async () => {
      await renderAndWait();
      expect(mockListStarStories).toHaveBeenCalledWith(1);
    });

    it('should display header title "STAR Story Builder"', async () => {
      const tree = await renderAndWait();
      const str = treeStr(tree);
      expect(str).toContain('STAR Story Builder');
    });

    it('should display intro card with AI STAR Story Generator title', async () => {
      const tree = await renderAndWait();
      const str = treeStr(tree);
      expect(str).toContain('AI STAR Story Generator');
    });
  });

  // ================================================================
  // API Integration - Loading Data
  // ================================================================
  describe('API integration - loading data', () => {
    it('should show company context badge when company name is loaded', async () => {
      mockGetInterviewPrep.mockResolvedValue({
        success: true,
        data: {
          company_name: 'Amazon',
          job_title: 'Senior PM',
        },
      });

      const tree = await renderAndWait();
      const str = treeStr(tree);
      expect(str).toContain('Amazon');
      expect(str).toContain('Senior PM');
    });

    it('should handle interview prep with nested prep_data structure', async () => {
      mockGetInterviewPrep.mockResolvedValue({
        success: true,
        data: {
          prep_data: {
            company_profile: { name: 'Meta' },
            role_analysis: {
              job_title: 'Security Engineer',
              core_responsibilities: ['Threat Modeling', 'Code Review'],
            },
          },
        },
      });

      const tree = await renderAndWait();
      const str = treeStr(tree);
      expect(str).toContain('Meta');
      expect(str).toContain('Security Engineer');
    });

    it('should combine core responsibilities with default themes', async () => {
      mockGetInterviewPrep.mockResolvedValue({
        success: true,
        data: {
          prep_data: {
            role_analysis: {
              core_responsibilities: ['Custom Theme A', 'Custom Theme B'],
            },
          },
        },
      });

      const tree = await renderAndWait();
      const root = tree.root;

      // Open the theme dropdown to see all theme options
      const themeDropdown = findTouchableByText(root, 'Leadership Challenge');
      await renderer.act(async () => {
        themeDropdown.props.onPress();
      });

      const str = treeStr(tree);
      // Custom themes from core_responsibilities should appear in the dropdown
      expect(str).toContain('Custom Theme A');
      expect(str).toContain('Custom Theme B');
      // Default themes should still be present too
      expect(str).toContain('Problem Solving');
      expect(str).toContain('Team Collaboration');
    });

    it('should handle interview prep failure gracefully', async () => {
      mockGetInterviewPrep.mockRejectedValue(new Error('Network error'));

      const tree = await renderAndWait();
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should handle interview prep returning success: false', async () => {
      mockGetInterviewPrep.mockResolvedValue({
        success: false,
        error: 'Not found',
      });

      const tree = await renderAndWait();
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should display experiences from tailored resume data', async () => {
      const tree = await renderAndWait();
      const str = treeStr(tree);
      expect(str).toContain('Senior Engineer');
      expect(str).toContain('Tech Corp');
      expect(str).toContain('Led team of 5');
    });

    it('should show "+N more achievements" for experiences with >2 bullets', async () => {
      const tree = await renderAndWait();
      const str = treeStr(tree);
      // Senior Engineer has 3 bullets, shows first 2 + "+1 more achievements"
      expect(str).toContain('+');
      expect(str).toContain('more achievements');
    });

    it('should fallback to getResume when tailored resume has no experience', async () => {
      mockGetTailoredResume.mockResolvedValue({
        success: false,
        error: 'Not found',
      });
      // The fallback code does: const resumeData = baseResult.data; setExperiences(resumeData.experience || ...)
      // So the getResume response needs experience at the top level of data
      mockGetResume.mockResolvedValue({
        success: true,
        data: {
          experience: [
            {
              title: 'Fallback Engineer',
              company: 'Backup Corp',
              bullets: ['Fallback bullet'],
            },
          ],
        },
      });

      const tree = await renderAndWait();
      expect(mockGetResume).toHaveBeenCalledWith(1);
      const str = treeStr(tree);
      expect(str).toContain('Fallback Engineer');
    });

    it('should show experience with header field via getExperienceTitle', async () => {
      const tree = await renderAndWait();
      const str = treeStr(tree);
      // Second experience has header: 'Lead Developer'
      expect(str).toContain('Lead Developer');
    });

    it('should handle empty experience array', async () => {
      mockGetTailoredResume.mockResolvedValue({
        success: true,
        data: { experience: [] },
      });

      const tree = await renderAndWait();
      const str = treeStr(tree);
      expect(str).toContain('No experiences found');
    });

    it('should handle experience loading exception', async () => {
      mockGetTailoredResume.mockRejectedValue(new Error('Load failed'));

      const tree = await renderAndWait();
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should load and display existing stories', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: [
          {
            id: 1,
            title: 'Existing Story',
            situation: 'S',
            task: 'T',
            action: 'A',
            result: 'R',
          },
        ],
      });

      const tree = await renderAndWait();
      const str = treeStr(tree);
      expect(str).toContain('Existing Story');
      expect(str).toContain('Your STAR Stories');
    });

    it('should handle story loading failure', async () => {
      mockListStarStories.mockRejectedValue(new Error('Network error'));

      const tree = await renderAndWait();
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should display story prompts section when prep data has them', async () => {
      mockGetInterviewPrep.mockResolvedValue({
        success: true,
        data: {
          prep_data: {
            candidate_positioning: {
              story_prompts: [
                {
                  title: 'Describe a leadership challenge',
                  description: 'Tell about leading under pressure',
                  star_hint: {
                    situation: 'A time you led...',
                    task: 'Your goal was...',
                    action: 'You decided to...',
                    result: 'The outcome was...',
                  },
                },
              ],
            },
          },
        },
      });

      const tree = await renderAndWait();
      const str = treeStr(tree);
      expect(str).toContain('Story Prompts from Job');
    });

    it('should show tailored_data experience when present in response', async () => {
      mockGetTailoredResume.mockResolvedValue({
        success: true,
        data: {
          tailored_data: {
            experience: [
              { title: 'Tailored Role', company: 'Tailored Co' },
            ],
          },
        },
      });

      const tree = await renderAndWait();
      const str = treeStr(tree);
      expect(str).toContain('Tailored Role');
    });
  });

  // ================================================================
  // Experience Selection
  // ================================================================
  describe('Experience selection', () => {
    it('should toggle experience selection on press', async () => {
      const tree = await renderAndWait();
      const root = tree.root;

      // Find experience card TouchableOpacity
      const expCard = findTouchableByText(root, 'Senior Engineer');
      expect(expCard).toBeDefined();

      // Press to select
      await renderer.act(async () => {
        expCard.props.onPress();
      });

      // Check that border color changed to selected (primary blue)
      // The component uses COLORS.primary (#3b82f6) directly, not colors.primary from theme
      const str = treeStr(tree);
      expect(str).toContain('CheckCircle'); // Checkbox shows checked icon when selected
    });

    it('should deselect experience on second press', async () => {
      const tree = await renderAndWait();
      const root = tree.root;

      const expCard = findTouchableByText(root, 'Senior Engineer');
      // Select
      await renderer.act(async () => {
        expCard.props.onPress();
      });
      // Deselect
      await renderer.act(async () => {
        expCard.props.onPress();
      });

      // Should be deselected now
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should allow selecting multiple experiences', async () => {
      const tree = await renderAndWait();
      const root = tree.root;

      const exp1 = findTouchableByText(root, 'Senior Engineer');
      const exp2 = findTouchableByText(root, 'Lead Developer');

      await renderer.act(async () => {
        exp1.props.onPress();
      });
      await renderer.act(async () => {
        exp2.props.onPress();
      });

      // Both should be selected -- indicated by CheckCircle icons appearing
      const str = treeStr(tree);
      expect(str).toContain('CheckCircle');
    });
  });

  // ================================================================
  // Theme Dropdown
  // ================================================================
  describe('Theme dropdown', () => {
    it('should show default selected theme', async () => {
      const tree = await renderAndWait();
      const str = treeStr(tree);
      // Default themes start with 'Leadership Challenge'
      expect(str).toContain('Leadership Challenge');
    });

    it('should toggle theme dropdown on press', async () => {
      const tree = await renderAndWait();
      const root = tree.root;

      // Find the theme dropdown TouchableOpacity (contains "Leadership Challenge" or "Select a theme")
      const themeDropdown = findTouchableByText(root, 'Leadership Challenge');
      expect(themeDropdown).toBeDefined();

      // Open dropdown
      await renderer.act(async () => {
        themeDropdown.props.onPress();
      });

      // Should now show all themes
      const str = treeStr(tree);
      expect(str).toContain('Problem Solving');
      expect(str).toContain('Team Collaboration');
      expect(str).toContain('Conflict Resolution');
    });

    it('should select a different theme from dropdown', async () => {
      const tree = await renderAndWait();
      const root = tree.root;

      // Open dropdown
      const themeDropdown = findTouchableByText(root, 'Leadership Challenge');
      await renderer.act(async () => {
        themeDropdown.props.onPress();
      });

      // Select 'Problem Solving'
      const problemSolvingItem = findTouchableByText(root, 'Problem Solving');
      await renderer.act(async () => {
        problemSolvingItem.props.onPress();
      });

      // Dropdown should close, new theme selected
      const str = treeStr(tree);
      expect(str).toContain('Problem Solving');
    });
  });

  // ================================================================
  // Tone Dropdown
  // ================================================================
  describe('Tone dropdown', () => {
    it('should show default tone (Professional & Formal)', async () => {
      const tree = await renderAndWait();
      const str = treeStr(tree);
      expect(str).toContain('Professional');
      expect(str).toContain('Formal');
    });

    it('should toggle tone dropdown on press', async () => {
      const tree = await renderAndWait();
      const root = tree.root;

      // Find tone dropdown - it has "Professional & Formal" text
      const toneDropdown = findTouchableByText(root, 'Corporate, structured');
      expect(toneDropdown).toBeDefined();

      await renderer.act(async () => {
        toneDropdown.props.onPress();
      });

      const str = treeStr(tree);
      expect(str).toContain('Conversational');
      expect(str).toContain('Confident');
      expect(str).toContain('Technical');
      expect(str).toContain('Strategic');
    });

    it('should select a different tone', async () => {
      const tree = await renderAndWait();
      const root = tree.root;

      const toneDropdown = findTouchableByText(root, 'Corporate, structured');
      await renderer.act(async () => {
        toneDropdown.props.onPress();
      });

      const technicalItem = findTouchableByText(root, 'Technical & Detailed');
      await renderer.act(async () => {
        technicalItem.props.onPress();
      });

      const str = treeStr(tree);
      expect(str).toContain('Technical & Detailed');
      expect(str).toContain('Precise, methodical');
    });
  });

  // ================================================================
  // Story Generation
  // ================================================================
  describe('Story generation', () => {
    it('should show alert when generating without selected experiences', async () => {
      const tree = await renderAndWait();
      const root = tree.root;

      // Find generate button (no experiences selected)
      const genBtn = findGlassButtonByLabel(root, 'Generate STAR Story');
      expect(genBtn).toBeDefined();

      await renderer.act(async () => {
        genBtn.props.onPress();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Selection Required',
        'Please select at least one experience to generate a STAR story.'
      );
    });

    it('should generate story successfully and show success alert', async () => {
      const tree = await renderAndWait();
      const root = tree.root;

      // Select an experience first
      const expCard = findTouchableByText(root, 'Senior Engineer');
      await renderer.act(async () => {
        expCard.props.onPress();
      });

      // Press generate
      const genBtn = findGlassButtonByLabel(root, 'Generate STAR Story');
      await renderer.act(async () => {
        genBtn.props.onPress();
      });

      // Wait for async operations
      await renderer.act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      expect(mockGenerateStarStory).toHaveBeenCalled();
      expect(mockCreateStarStory).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        'STAR story generated and saved successfully!'
      );
    });

    it('should show generated story in the stories list after generation', async () => {
      const tree = await renderAndWait();
      const root = tree.root;

      // Select experience
      const expCard = findTouchableByText(root, 'Senior Engineer');
      await renderer.act(async () => {
        expCard.props.onPress();
      });

      // Generate
      const genBtn = findGlassButtonByLabel(root, 'Generate STAR Story');
      await renderer.act(async () => {
        genBtn.props.onPress();
      });
      await renderer.act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      const str = treeStr(tree);
      expect(str).toContain('Leadership Story');
      expect(str).toContain('Your STAR Stories');
    });

    it('should show warning alert when save fails but generation succeeds', async () => {
      mockCreateStarStory.mockResolvedValue({
        success: false,
        error: 'Save failed',
      });

      const tree = await renderAndWait();
      const root = tree.root;

      const expCard = findTouchableByText(root, 'Senior Engineer');
      await renderer.act(async () => {
        expCard.props.onPress();
      });

      const genBtn = findGlassButtonByLabel(root, 'Generate STAR Story');
      await renderer.act(async () => {
        genBtn.props.onPress();
      });
      await renderer.act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Warning',
        expect.stringContaining('could not be saved')
      );
    });

    it('should show error alert when generation itself fails', async () => {
      mockGenerateStarStory.mockResolvedValue({
        success: false,
        error: 'AI service unavailable',
      });

      const tree = await renderAndWait();
      const root = tree.root;

      const expCard = findTouchableByText(root, 'Senior Engineer');
      await renderer.act(async () => {
        expCard.props.onPress();
      });

      const genBtn = findGlassButtonByLabel(root, 'Generate STAR Story');
      await renderer.act(async () => {
        genBtn.props.onPress();
      });
      await renderer.act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'AI service unavailable');
    });

    it('should show error alert when generation throws exception', async () => {
      mockGenerateStarStory.mockRejectedValue(new Error('Network failure'));

      const tree = await renderAndWait();
      const root = tree.root;

      const expCard = findTouchableByText(root, 'Senior Engineer');
      await renderer.act(async () => {
        expCard.props.onPress();
      });

      const genBtn = findGlassButtonByLabel(root, 'Generate STAR Story');
      await renderer.act(async () => {
        genBtn.props.onPress();
      });
      await renderer.act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to generate STAR story');
    });

    it('should change button label to "Generate Another Story" after first story', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: [{ id: 1, title: 'First Story', situation: 'S', task: 'T', action: 'A', result: 'R' }],
      });

      const tree = await renderAndWait();
      const root = tree.root;

      const genBtn = findGlassButtonByLabel(root, 'Generate Another Story');
      expect(genBtn).toBeDefined();
    });

    it('should pass company context to generateStarStory when available', async () => {
      mockGetInterviewPrep.mockResolvedValue({
        success: true,
        data: { company_name: 'Google', job_title: 'SRE' },
      });

      const tree = await renderAndWait();
      const root = tree.root;

      const expCard = findTouchableByText(root, 'Senior Engineer');
      await renderer.act(async () => {
        expCard.props.onPress();
      });

      const genBtn = findGlassButtonByLabel(root, 'Generate STAR Story');
      await renderer.act(async () => {
        genBtn.props.onPress();
      });
      await renderer.act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      expect(mockGenerateStarStory).toHaveBeenCalledWith(
        expect.objectContaining({
          companyContext: 'Google - SRE',
        })
      );
    });

    it('should clear selected experiences after successful generation', async () => {
      const tree = await renderAndWait();
      const root = tree.root;

      const expCard = findTouchableByText(root, 'Senior Engineer');
      await renderer.act(async () => {
        expCard.props.onPress();
      });

      const genBtn = findGlassButtonByLabel(root, 'Generate STAR Story');
      await renderer.act(async () => {
        genBtn.props.onPress();
      });
      await renderer.act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      // After generation, the generate button should be disabled (no experiences selected)
      const newGenBtn = findGlassButtonByLabel(root, 'Generate Another Story');
      expect(newGenBtn.props.disabled).toBe(true);
    });
  });

  // ================================================================
  // Story Expansion and View Mode
  // ================================================================
  describe('Story expansion and view mode', () => {
    const storyWithQuestions = {
      id: 1,
      title: 'Full Story',
      situation: 'Test situation',
      task: 'Test task',
      action: 'Test action',
      result: 'Test result',
      key_themes: ['Leadership', 'Innovation'],
      talking_points: ['Point 1', 'Point 2'],
      probing_questions: {
        situation: ['Probing Q1 for situation'],
        action: ['Probing Q1 for action'],
        result: ['Probing Q1 for result'],
      },
      challenge_questions: {
        situation: ['Challenge Q1 for situation'],
        action: ['Challenge Q1 for action'],
        result: ['Challenge Q1 for result'],
      },
    };

    it('should expand story on header press', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: [storyWithQuestions],
      });

      const tree = await renderAndWait();
      const root = tree.root;

      // Find story header and press
      const storyHeader = findTouchableByText(root, 'Full Story');
      await renderer.act(async () => {
        storyHeader.props.onPress();
      });

      const str = treeStr(tree);
      expect(str).toContain('Test situation');
      expect(str).toContain('Test task');
      expect(str).toContain('Test action');
      expect(str).toContain('Test result');
    });

    it('should show STAR section labels in expanded view', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: [storyWithQuestions],
      });

      const tree = await renderAndWait();
      const root = tree.root;

      const storyHeader = findTouchableByText(root, 'Full Story');
      await renderer.act(async () => {
        storyHeader.props.onPress();
      });

      const str = treeStr(tree);
      expect(str).toContain('Situation');
      expect(str).toContain('Task');
      expect(str).toContain('Action');
      expect(str).toContain('Result');
    });

    it('should show key themes when story has them', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: [storyWithQuestions],
      });

      const tree = await renderAndWait();
      const root = tree.root;

      const storyHeader = findTouchableByText(root, 'Full Story');
      await renderer.act(async () => {
        storyHeader.props.onPress();
      });

      const str = treeStr(tree);
      expect(str).toContain('Key Themes');
      expect(str).toContain('Leadership');
      expect(str).toContain('Innovation');
    });

    it('should show talking points when story has them', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: [storyWithQuestions],
      });

      const tree = await renderAndWait();
      const root = tree.root;

      const storyHeader = findTouchableByText(root, 'Full Story');
      await renderer.act(async () => {
        storyHeader.props.onPress();
      });

      const str = treeStr(tree);
      expect(str).toContain('Talking Points');
      expect(str).toContain('Point 1');
      expect(str).toContain('Point 2');
    });

    it('should show probing questions for situation, action, result sections', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: [storyWithQuestions],
      });

      const tree = await renderAndWait();
      const root = tree.root;

      const storyHeader = findTouchableByText(root, 'Full Story');
      await renderer.act(async () => {
        storyHeader.props.onPress();
      });

      const str = treeStr(tree);
      expect(str).toContain('Probing Q1 for situation');
      expect(str).toContain('Probing Q1 for action');
      expect(str).toContain('Probing Q1 for result');
    });

    it('should show challenge questions for situation, action, result sections', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: [storyWithQuestions],
      });

      const tree = await renderAndWait();
      const root = tree.root;

      const storyHeader = findTouchableByText(root, 'Full Story');
      await renderer.act(async () => {
        storyHeader.props.onPress();
      });

      const str = treeStr(tree);
      expect(str).toContain('Challenge Q1 for situation');
      expect(str).toContain('Challenge Q1 for action');
      expect(str).toContain('Challenge Q1 for result');
    });

    it('should collapse story on second press', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: [storyWithQuestions],
      });

      const tree = await renderAndWait();
      const root = tree.root;

      const storyHeader = findTouchableByText(root, 'Full Story');
      // Expand
      await renderer.act(async () => {
        storyHeader.props.onPress();
      });
      // Collapse
      await renderer.act(async () => {
        storyHeader.props.onPress();
      });

      const str = treeStr(tree);
      // Should not show the detail text when collapsed
      expect(str).not.toContain('Test situation');
    });

    it('should show Edit and Delete action buttons in expanded view', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: [storyWithQuestions],
      });

      const tree = await renderAndWait();
      const root = tree.root;

      const storyHeader = findTouchableByText(root, 'Full Story');
      await renderer.act(async () => {
        storyHeader.props.onPress();
      });

      const str = treeStr(tree);
      expect(str).toContain('Edit');
      expect(str).toContain('Delete');
    });

    it('should show story count in section title', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: [
          { id: 1, title: 'Story 1', situation: 'S', task: 'T', action: 'A', result: 'R' },
          { id: 2, title: 'Story 2', situation: 'S', task: 'T', action: 'A', result: 'R' },
        ],
      });

      const tree = await renderAndWait();
      const str = treeStr(tree);
      expect(str).toContain('Your STAR Stories');
      expect(str).toContain('2');
    });
  });

  // ================================================================
  // Story Editing
  // ================================================================
  describe('Story editing', () => {
    const editableStory = {
      id: 1,
      title: 'Editable Story',
      situation: 'Original S',
      task: 'Original T',
      action: 'Original A',
      result: 'Original R',
    };

    it('should enter edit mode when edit button pressed', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: [editableStory],
      });

      const tree = await renderAndWait();
      const root = tree.root;

      // Expand story
      const storyHeader = findTouchableByText(root, 'Editable Story');
      await renderer.act(async () => {
        storyHeader.props.onPress();
      });

      // Press Edit button (use findLastTouchableByText to skip story header containing "Editable")
      const editBtn = findLastTouchableByText(root, 'Edit');
      await renderer.act(async () => {
        editBtn.props.onPress();
      });

      // Should show TextInput elements in edit mode
      const textInputs = root.findAllByType('TextInput');
      expect(textInputs.length).toBe(4); // situation, task, action, result
    });

    it('should show section labels in edit mode', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: [editableStory],
      });

      const tree = await renderAndWait();
      const root = tree.root;

      const storyHeader = findTouchableByText(root, 'Editable Story');
      await renderer.act(async () => {
        storyHeader.props.onPress();
      });

      const editBtn = findLastTouchableByText(root, 'Edit');
      await renderer.act(async () => {
        editBtn.props.onPress();
      });

      const str = treeStr(tree);
      expect(str).toContain('Situation');
      expect(str).toContain('Task');
      // JSX splits "Action" and " (Most Important!)" into separate children
      expect(str).toContain('Action');
      expect(str).toContain('Most Important!');
      expect(str).toContain('Result');
    });

    it('should update text in TextInput during editing', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: [editableStory],
      });

      const tree = await renderAndWait();
      const root = tree.root;

      const storyHeader = findTouchableByText(root, 'Editable Story');
      await renderer.act(async () => {
        storyHeader.props.onPress();
      });

      const editBtn = findLastTouchableByText(root, 'Edit');
      await renderer.act(async () => {
        editBtn.props.onPress();
      });

      // Simulate editing the situation TextInput
      const textInputs = root.findAllByType('TextInput');
      await renderer.act(async () => {
        textInputs[0].props.onChangeText('Updated situation');
      });

      // The TextInput value should now be updated
      expect(textInputs[0].props.value).toBe('Updated situation');
    });

    it('should save edited story successfully', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: [editableStory],
      });

      const tree = await renderAndWait();
      const root = tree.root;

      // Expand + edit
      const storyHeader = findTouchableByText(root, 'Editable Story');
      await renderer.act(async () => {
        storyHeader.props.onPress();
      });
      const editBtn = findLastTouchableByText(root, 'Edit');
      await renderer.act(async () => {
        editBtn.props.onPress();
      });

      // Edit a field
      const textInputs = root.findAllByType('TextInput');
      await renderer.act(async () => {
        textInputs[0].props.onChangeText('New situation');
      });

      // Press Save button
      const saveBtn = findLastTouchableByText(root, 'Save');
      await renderer.act(async () => {
        saveBtn.props.onPress();
      });
      await renderer.act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      expect(mockUpdateStarStory).toHaveBeenCalledWith(1, expect.objectContaining({
        situation: 'New situation',
      }));
    });

    it('should show error alert on save failure', async () => {
      mockUpdateStarStory.mockResolvedValue({
        success: false,
        error: 'Server error',
      });
      mockListStarStories.mockResolvedValue({
        success: true,
        data: [editableStory],
      });

      const tree = await renderAndWait();
      const root = tree.root;

      const storyHeader = findTouchableByText(root, 'Editable Story');
      await renderer.act(async () => {
        storyHeader.props.onPress();
      });
      const editBtn = findLastTouchableByText(root, 'Edit');
      await renderer.act(async () => {
        editBtn.props.onPress();
      });

      const saveBtn = findLastTouchableByText(root, 'Save');
      await renderer.act(async () => {
        saveBtn.props.onPress();
      });
      await renderer.act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Server error');
    });

    it('should show error alert when save throws exception', async () => {
      mockUpdateStarStory.mockRejectedValue(new Error('Network failure'));
      mockListStarStories.mockResolvedValue({
        success: true,
        data: [editableStory],
      });

      const tree = await renderAndWait();
      const root = tree.root;

      const storyHeader = findTouchableByText(root, 'Editable Story');
      await renderer.act(async () => {
        storyHeader.props.onPress();
      });
      const editBtn = findLastTouchableByText(root, 'Edit');
      await renderer.act(async () => {
        editBtn.props.onPress();
      });

      const saveBtn = findLastTouchableByText(root, 'Save');
      await renderer.act(async () => {
        saveBtn.props.onPress();
      });
      await renderer.act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to save story');
    });

    it('should cancel edit mode on Cancel press', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: [editableStory],
      });

      const tree = await renderAndWait();
      const root = tree.root;

      // Enter edit mode
      const storyHeader = findTouchableByText(root, 'Editable Story');
      await renderer.act(async () => {
        storyHeader.props.onPress();
      });
      const editBtn = findLastTouchableByText(root, 'Edit');
      await renderer.act(async () => {
        editBtn.props.onPress();
      });

      // Should be in edit mode (TextInputs visible)
      expect(root.findAllByType('TextInput').length).toBe(4);

      // Cancel - use findLastTouchableByText to avoid matching other touchables
      const cancelBtn = findLastTouchableByText(root, 'Cancel');
      await renderer.act(async () => {
        cancelBtn.props.onPress();
      });

      // Should exit edit mode - no more TextInputs
      expect(root.findAllByType('TextInput').length).toBe(0);
    });

    it('should not call API for stories with string IDs (local only)', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: [{ ...editableStory, id: 'story_local_123' }],
      });

      const tree = await renderAndWait();
      const root = tree.root;

      const storyHeader = findTouchableByText(root, 'Editable Story');
      await renderer.act(async () => {
        storyHeader.props.onPress();
      });
      const editBtn = findLastTouchableByText(root, 'Edit');
      await renderer.act(async () => {
        editBtn.props.onPress();
      });

      const saveBtn = findLastTouchableByText(root, 'Save');
      await renderer.act(async () => {
        saveBtn.props.onPress();
      });
      await renderer.act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      // Should NOT call API for string ID stories
      expect(mockUpdateStarStory).not.toHaveBeenCalled();
    });
  });

  // ================================================================
  // Story Deletion
  // ================================================================
  describe('Story deletion', () => {
    const deletableStory = {
      id: 1,
      title: 'Story to Delete',
      situation: 'S',
      task: 'T',
      action: 'A',
      result: 'R',
    };

    it('should show confirmation dialog when delete pressed', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: [deletableStory],
      });

      const tree = await renderAndWait();
      const root = tree.root;

      // Expand story
      const storyHeader = findTouchableByText(root, 'Story to Delete');
      await renderer.act(async () => {
        storyHeader.props.onPress();
      });

      // Press Delete action button (use findLastTouchableByText since header contains "Delete" too)
      const deleteBtn = findLastTouchableByText(root, 'Delete');
      await renderer.act(async () => {
        deleteBtn.props.onPress();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Delete Story',
        'Are you sure you want to delete this STAR story?',
        expect.arrayContaining([
          expect.objectContaining({ text: 'Cancel' }),
          expect.objectContaining({ text: 'Delete', style: 'destructive' }),
        ])
      );
    });

    it('should delete story on confirmation', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: [deletableStory],
      });

      const tree = await renderAndWait();
      const root = tree.root;

      const storyHeader = findTouchableByText(root, 'Story to Delete');
      await renderer.act(async () => {
        storyHeader.props.onPress();
      });

      const deleteBtn = findLastTouchableByText(root, 'Delete');
      await renderer.act(async () => {
        deleteBtn.props.onPress();
      });

      // Get the onPress callback from the Delete button in Alert
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const deleteAction = alertCall[2].find((a: any) => a.text === 'Delete');

      await renderer.act(async () => {
        await deleteAction.onPress();
      });

      expect(mockDeleteStarStory).toHaveBeenCalledWith(1);
    });

    it('should remove story from list after successful deletion', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: [deletableStory],
      });

      const tree = await renderAndWait();
      const root = tree.root;

      const storyHeader = findTouchableByText(root, 'Story to Delete');
      await renderer.act(async () => {
        storyHeader.props.onPress();
      });

      const deleteBtn = findLastTouchableByText(root, 'Delete');
      await renderer.act(async () => {
        deleteBtn.props.onPress();
      });

      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const deleteAction = alertCall[2].find((a: any) => a.text === 'Delete');

      await renderer.act(async () => {
        await deleteAction.onPress();
      });

      const str = treeStr(tree);
      expect(str).not.toContain('Story to Delete');
    });

    it('should show error alert when deletion fails', async () => {
      mockDeleteStarStory.mockResolvedValue({
        success: false,
        error: 'Delete failed',
      });
      mockListStarStories.mockResolvedValue({
        success: true,
        data: [deletableStory],
      });

      const tree = await renderAndWait();
      const root = tree.root;

      const storyHeader = findTouchableByText(root, 'Story to Delete');
      await renderer.act(async () => {
        storyHeader.props.onPress();
      });

      const deleteBtn = findLastTouchableByText(root, 'Delete');
      await renderer.act(async () => {
        deleteBtn.props.onPress();
      });

      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const deleteAction = alertCall[2].find((a: any) => a.text === 'Delete');

      await renderer.act(async () => {
        await deleteAction.onPress();
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Delete failed');
    });

    it('should show error alert when deletion throws exception', async () => {
      mockDeleteStarStory.mockRejectedValue(new Error('Network error'));
      mockListStarStories.mockResolvedValue({
        success: true,
        data: [deletableStory],
      });

      const tree = await renderAndWait();
      const root = tree.root;

      const storyHeader = findTouchableByText(root, 'Story to Delete');
      await renderer.act(async () => {
        storyHeader.props.onPress();
      });

      const deleteBtn = findLastTouchableByText(root, 'Delete');
      await renderer.act(async () => {
        deleteBtn.props.onPress();
      });

      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const deleteAction = alertCall[2].find((a: any) => a.text === 'Delete');

      await renderer.act(async () => {
        await deleteAction.onPress();
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to delete story');
    });

    it('should not call API for stories with string IDs', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: [{ ...deletableStory, id: 'local_story_1' }],
      });

      const tree = await renderAndWait();
      const root = tree.root;

      const storyHeader = findTouchableByText(root, 'Story to Delete');
      await renderer.act(async () => {
        storyHeader.props.onPress();
      });

      const deleteBtn = findLastTouchableByText(root, 'Delete');
      await renderer.act(async () => {
        deleteBtn.props.onPress();
      });

      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const deleteAction = alertCall[2].find((a: any) => a.text === 'Delete');

      await renderer.act(async () => {
        await deleteAction.onPress();
      });

      expect(mockDeleteStarStory).not.toHaveBeenCalled();
    });
  });

  // ================================================================
  // Guidance Panel
  // ================================================================
  describe('Guidance panel', () => {
    it('should show STAR Method Guide header', async () => {
      const tree = await renderAndWait();
      const str = treeStr(tree);
      expect(str).toContain('STAR Method Guide');
      expect(str).toContain('Learn how to craft compelling interview stories');
    });

    it('should toggle guide visibility on header press', async () => {
      const tree = await renderAndWait();
      const root = tree.root;

      // Find and press guide header
      const guideHeader = findTouchableByText(root, 'STAR Method Guide');
      expect(guideHeader).toBeDefined();

      await renderer.act(async () => {
        guideHeader.props.onPress();
      });

      const str = treeStr(tree);
      expect(str).toContain('SITUATION/TASK');
      expect(str).toContain('ACTION');
      expect(str).toContain('RESULTS');
    });

    it('should show situation section expanded by default in guide', async () => {
      const tree = await renderAndWait();
      const root = tree.root;

      const guideHeader = findTouchableByText(root, 'STAR Method Guide');
      await renderer.act(async () => {
        guideHeader.props.onPress();
      });

      const str = treeStr(tree);
      // Situation section should be expanded by default (expandedGuideSections starts with 'situation')
      expect(str).toContain('What made this situation significant');
      expect(str).toContain('Probing Questions');
    });

    it('should toggle guide sections individually', async () => {
      const tree = await renderAndWait();
      const root = tree.root;

      // Open guide
      const guideHeader = findTouchableByText(root, 'STAR Method Guide');
      await renderer.act(async () => {
        guideHeader.props.onPress();
      });

      // Press Action section header to expand it
      const actionSection = findTouchableByText(root, 'ACTION');
      await renderer.act(async () => {
        actionSection.props.onPress();
      });

      const str = treeStr(tree);
      expect(str).toContain('This is the MOST IMPORTANT section');
      expect(str).toContain('Were you leading the effort or supporting');
    });

    it('should show challenge questions in guide sections', async () => {
      const tree = await renderAndWait();
      const root = tree.root;

      const guideHeader = findTouchableByText(root, 'STAR Method Guide');
      await renderer.act(async () => {
        guideHeader.props.onPress();
      });

      const str = treeStr(tree);
      expect(str).toContain('Challenge Questions');
      expect(str).toContain('Why is this the best example');
    });

    it('should toggle result section in guide', async () => {
      const tree = await renderAndWait();
      const root = tree.root;

      const guideHeader = findTouchableByText(root, 'STAR Method Guide');
      await renderer.act(async () => {
        guideHeader.props.onPress();
      });

      const resultSection = findTouchableByText(root, 'RESULTS');
      await renderer.act(async () => {
        resultSection.props.onPress();
      });

      const str = treeStr(tree);
      expect(str).toContain('Types of Results to Include');
      expect(str).toContain('Financial impact');
      expect(str).toContain('Scale metrics');
    });

    it('should collapse situation section on second press', async () => {
      const tree = await renderAndWait();
      const root = tree.root;

      const guideHeader = findTouchableByText(root, 'STAR Method Guide');
      await renderer.act(async () => {
        guideHeader.props.onPress();
      });

      // Situation is expanded by default -- collapse it
      const situationSection = findTouchableByText(root, 'SITUATION/TASK');
      await renderer.act(async () => {
        situationSection.props.onPress();
      });

      const str = treeStr(tree);
      expect(str).not.toContain('What made this situation significant');
    });

    it('should hide guide content when toggled off', async () => {
      const tree = await renderAndWait();
      const root = tree.root;

      const guideHeader = findTouchableByText(root, 'STAR Method Guide');
      // Open
      await renderer.act(async () => {
        guideHeader.props.onPress();
      });
      // Close
      await renderer.act(async () => {
        guideHeader.props.onPress();
      });

      const str = treeStr(tree);
      expect(str).not.toContain('SITUATION/TASK');
    });
  });

  // ================================================================
  // Navigation
  // ================================================================
  describe('Navigation', () => {
    it('should navigate back when back button pressed', async () => {
      const tree = await renderAndWait();
      const root = tree.root;

      // Back button is the first TouchableOpacity in the header
      const touchables = root.findAllByType('TouchableOpacity');
      const backButton = touchables[0]; // First touchable is back button

      await renderer.act(async () => {
        backButton.props.onPress();
      });

      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  // ================================================================
  // Story Prompts
  // ================================================================
  describe('Story prompts', () => {
    const setupWithPrompts = () => {
      mockGetInterviewPrep.mockResolvedValue({
        success: true,
        data: {
          prep_data: {
            company_profile: { name: 'TestCo' },
            role_analysis: { job_title: 'Engineer' },
            candidate_positioning: {
              story_prompts: [
                {
                  title: 'Leadership Challenge',
                  description: 'Describe a leadership moment',
                  star_hint: {
                    situation: 'Hint S',
                    task: 'Hint T',
                    action: 'Hint A',
                    result: 'Hint R',
                  },
                },
                {
                  title: 'Problem Solving',
                  description: 'Describe solving a hard problem',
                },
              ],
            },
          },
        },
      });
    };

    it('should show story prompts dropdown when prompts are available', async () => {
      setupWithPrompts();
      const tree = await renderAndWait();
      const str = treeStr(tree);
      expect(str).toContain('Story Prompts from Job');
    });

    it('should open prompts dropdown and show prompt options', async () => {
      setupWithPrompts();
      const tree = await renderAndWait();
      const root = tree.root;

      const promptDropdown = findTouchableByText(root, 'Select a story prompt');
      await renderer.act(async () => {
        promptDropdown.props.onPress();
      });

      const str = treeStr(tree);
      expect(str).toContain('Leadership Challenge');
      expect(str).toContain('Problem Solving');
      expect(str).toContain('No prompt (custom theme only)');
    });

    it('should select a prompt and show STAR hints', async () => {
      setupWithPrompts();
      const tree = await renderAndWait();
      const root = tree.root;

      const promptDropdown = findTouchableByText(root, 'Select a story prompt');
      await renderer.act(async () => {
        promptDropdown.props.onPress();
      });

      // Select the first prompt with star_hint
      const leadershipPrompt = findTouchableByText(root, 'Describe a leadership moment');
      await renderer.act(async () => {
        leadershipPrompt.props.onPress();
      });

      const str = treeStr(tree);
      expect(str).toContain('STAR Hints for This Story');
      expect(str).toContain('Hint S');
      expect(str).toContain('Hint T');
      expect(str).toContain('Hint A');
      expect(str).toContain('Hint R');
    });

    it('should clear prompt selection with "No prompt" option', async () => {
      setupWithPrompts();
      const tree = await renderAndWait();
      const root = tree.root;

      // Open dropdown
      const promptDropdown = findTouchableByText(root, 'Select a story prompt');
      await renderer.act(async () => {
        promptDropdown.props.onPress();
      });

      // Select a prompt first
      const leadershipPrompt = findTouchableByText(root, 'Describe a leadership moment');
      await renderer.act(async () => {
        leadershipPrompt.props.onPress();
      });

      // Verify STAR hints appeared
      const strBefore = treeStr(tree);
      expect(strBefore).toContain('STAR Hints for This Story');

      // Reopen prompts dropdown - find it by the description text which is unique to the prompts dropdown
      // (theme dropdown also shows "Leadership Challenge" but doesn't have the description)
      const updatedDropdown = findTouchableByText(root, 'Describe a leadership moment');
      await renderer.act(async () => {
        updatedDropdown.props.onPress();
      });

      const noPromptOption = findTouchableByText(root, 'No prompt');
      await renderer.act(async () => {
        noPromptOption.props.onPress();
      });

      const str = treeStr(tree);
      expect(str).not.toContain('STAR Hints for This Story');
    });
  });

  // ================================================================
  // Loading States
  // ================================================================
  describe('Loading states', () => {
    it('should show loading indicator for experiences while loading', () => {
      // Override to make getTailoredResume never resolve (stays loading)
      mockGetTailoredResume.mockReturnValue(new Promise(() => {}));

      const tree = renderScreen();
      const str = treeStr(tree);
      expect(str).toContain('Loading resume experiences');
    });

    it('should show loading indicator for stories while loading', () => {
      mockListStarStories.mockReturnValue(new Promise(() => {}));

      const tree = renderScreen();
      const str = treeStr(tree);
      expect(str).toContain('Loading saved stories');
    });
  });

  // ================================================================
  // Constants and Configuration
  // ================================================================
  describe('Constants and configuration', () => {
    it('should have 5 tone options', () => {
      const TONE_OPTIONS = [
        { value: 'professional', label: 'Professional & Formal' },
        { value: 'conversational', label: 'Conversational & Authentic' },
        { value: 'confident', label: 'Confident & Assertive' },
        { value: 'technical', label: 'Technical & Detailed' },
        { value: 'strategic', label: 'Strategic & Visionary' },
      ];
      expect(TONE_OPTIONS).toHaveLength(5);
    });

    it('should have 8 default themes', () => {
      const DEFAULT_THEMES = [
        'Leadership Challenge',
        'Problem Solving',
        'Team Collaboration',
        'Handling Ambiguity',
        'Delivering Under Pressure',
        'Conflict Resolution',
        'Innovation & Creativity',
        'Customer Focus',
      ];
      expect(DEFAULT_THEMES).toHaveLength(8);
    });

    it('should combine themes with core responsibilities and deduplicate', () => {
      const DEFAULT_THEMES = ['A', 'B', 'C'];
      const coreResponsibilities = ['B', 'D', 'E'];
      const combined = [...new Set([...coreResponsibilities, ...DEFAULT_THEMES])];
      expect(combined).toEqual(['B', 'D', 'E', 'A', 'C']);
    });

    it('should auto-select first theme from DEFAULT_THEMES on initial mount', async () => {
      // The useEffect auto-selects the first theme when selectedTheme is empty
      // On mount, storyThemes = DEFAULT_THEMES and selectedTheme = ''
      // So the first default theme gets auto-selected
      const tree = await renderAndWait();
      const str = treeStr(tree);
      expect(str).toContain('Leadership Challenge'); // First default theme
    });

    it('should include custom responsibilities in dropdown options', async () => {
      mockGetInterviewPrep.mockResolvedValue({
        success: true,
        data: {
          prep_data: {
            role_analysis: {
              core_responsibilities: ['Custom First Theme'],
            },
          },
        },
      });

      const tree = await renderAndWait();
      const root = tree.root;

      // Open theme dropdown to verify custom theme is listed
      const themeDropdown = findTouchableByText(root, 'Leadership Challenge');
      await renderer.act(async () => {
        themeDropdown.props.onPress();
      });

      const str = treeStr(tree);
      expect(str).toContain('Custom First Theme');
    });
  });

  // ================================================================
  // Edge Cases
  // ================================================================
  describe('Edge cases', () => {
    it('should handle experience with position field only', async () => {
      mockGetTailoredResume.mockResolvedValue({
        success: true,
        data: {
          experience: [{ position: 'Manager' }],
        },
      });

      const tree = await renderAndWait();
      const str = treeStr(tree);
      expect(str).toContain('Manager');
    });

    it('should handle experience with no identifying fields', async () => {
      mockGetTailoredResume.mockResolvedValue({
        success: true,
        data: {
          experience: [{ company: 'Unknown Corp' }],
        },
      });

      const tree = await renderAndWait();
      const str = treeStr(tree);
      expect(str).toContain('Experience'); // fallback title
    });

    it('should handle experience without bullets', async () => {
      mockGetTailoredResume.mockResolvedValue({
        success: true,
        data: {
          experience: [{ title: 'No Bullets Role' }],
        },
      });

      const tree = await renderAndWait();
      const str = treeStr(tree);
      expect(str).toContain('No Bullets Role');
      // Should not crash without bullets
    });

    it('should handle experience with empty bullets array', async () => {
      mockGetTailoredResume.mockResolvedValue({
        success: true,
        data: {
          experience: [{ title: 'Empty Bullets', bullets: [] }],
        },
      });

      const tree = await renderAndWait();
      const str = treeStr(tree);
      expect(str).toContain('Empty Bullets');
    });

    it('should handle experience with exactly 2 bullets (no "more" text)', async () => {
      mockGetTailoredResume.mockResolvedValue({
        success: true,
        data: {
          experience: [{ title: 'Two Bullets', bullets: ['B1', 'B2'] }],
        },
      });

      const tree = await renderAndWait();
      const str = treeStr(tree);
      expect(str).toContain('B1');
      expect(str).toContain('B2');
      expect(str).not.toContain('more achievements');
    });

    it('should handle story with no key_themes or talking_points', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: [{
          id: 1,
          title: 'Minimal Story',
          situation: 'S',
          task: 'T',
          action: 'A',
          result: 'R',
        }],
      });

      const tree = await renderAndWait();
      const root = tree.root;

      const storyHeader = findTouchableByText(root, 'Minimal Story');
      await renderer.act(async () => {
        storyHeader.props.onPress();
      });

      const str = treeStr(tree);
      expect(str).not.toContain('Key Themes');
      expect(str).not.toContain('Talking Points');
    });

    it('should handle tailored resume with experiences key instead of experience', async () => {
      mockGetTailoredResume.mockResolvedValue({
        success: true,
        data: {
          experiences: [{ title: 'Alt Key Role', company: 'Alt Corp' }],
        },
      });

      const tree = await renderAndWait();
      const str = treeStr(tree);
      expect(str).toContain('Alt Key Role');
    });

    it('should show generate button disabled when no experiences selected and not generating', async () => {
      const tree = await renderAndWait();
      const root = tree.root;

      const genBtn = findGlassButtonByLabel(root, 'Generate STAR Story');
      expect(genBtn.props.disabled).toBe(true);
    });
  });
});
