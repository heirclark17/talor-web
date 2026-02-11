/**
 * CareerPathDesignerScreen Tests
 *
 * Comprehensive test suite using react-test-renderer covering:
 * - Module exports
 * - Replicated pure logic (toggleArrayItem, validation, progress messages, year calc)
 * - Component rendering for all wizard steps (welcome, upload, questions, generating, results)
 * - User interactions (navigation, chip selection, text input, file upload, resume select)
 * - API calls and async operations (list plans, load plan, generate sync/async, trajectory, skill gaps, detailed plan)
 * - Error handling and validation at every step
 * - All conditional rendering paths
 *
 * Target: 100% coverage
 */

import React from 'react';
import renderer from 'react-test-renderer';
import { Alert } from 'react-native';

// ---- Mock fns ----
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockFetchResumes = jest.fn();
const mockListCareerPlans = jest.fn();
const mockGetCareerPlan = jest.fn();
const mockGenerateCareerPlan = jest.fn();
const mockGenerateCareerPlanAsync = jest.fn();
const mockGetCareerPlanJobStatus = jest.fn();
const mockGetResume = jest.fn();
const mockUploadResume = jest.fn();
const mockAnalyzeCareerTrajectory = jest.fn();
const mockGetSkillGaps = jest.fn();
const mockGenerateDetailedCareerPlan = jest.fn();
const mockGetDocumentAsync = jest.fn();

// ---- Store state ----
let mockResumeStoreState: any = {
  resumes: [],
  loading: false,
  fetchResumes: mockFetchResumes,
};

// ---- jest.mock declarations (BEFORE imports) ----

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

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  })),
  useFocusEffect: jest.fn((callback: any) => {
    // Wrap in useEffect to prevent infinite loop
    const React = require('react');
    React.useEffect(() => {
      callback();
    }, []);
  }),
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: jest.fn(() => ({
    Navigator: 'Navigator',
    Screen: 'Screen',
  })),
}));

jest.mock('lucide-react-native', () => {
  const RealReact = require('react');
  return new Proxy(
    {},
    {
      get: (_target: any, prop: any) => {
        if (typeof prop === 'string') {
          const Icon = (props: any) =>
            RealReact.createElement('MockIcon', { ...props, testID: prop });
          Icon.displayName = prop;
          return Icon;
        }
        return undefined;
      },
    }
  );
});

jest.mock('react-native-safe-area-context', () => {
  const RealReact = require('react');
  return {
    SafeAreaView: (props: any) =>
      RealReact.createElement('SafeAreaView', props, props.children),
  };
});

jest.mock('../../api/client', () => ({
  api: {
    listCareerPlans: (...args: any[]) => mockListCareerPlans(...args),
    getCareerPlan: (...args: any[]) => mockGetCareerPlan(...args),
    generateCareerPlan: (...args: any[]) => mockGenerateCareerPlan(...args),
    generateCareerPlanAsync: (...args: any[]) => mockGenerateCareerPlanAsync(...args),
    getCareerPlanJobStatus: (...args: any[]) => mockGetCareerPlanJobStatus(...args),
    getResume: (...args: any[]) => mockGetResume(...args),
    uploadResume: (...args: any[]) => mockUploadResume(...args),
    analyzeCareerTrajectory: (...args: any[]) => mockAnalyzeCareerTrajectory(...args),
    getSkillGaps: (...args: any[]) => mockGetSkillGaps(...args),
    generateDetailedCareerPlan: (...args: any[]) => mockGenerateDetailedCareerPlan(...args),
  },
}));

jest.mock('../../components', () => {
  const RealReact = require('react');
  return {
    CareerPlanResults: (props: any) =>
      RealReact.createElement('CareerPlanResults', props),
    CareerPathCertifications: (props: any) =>
      RealReact.createElement('CareerPathCertifications', props),
  };
});

jest.mock('../../stores/resumeStore', () => ({
  useResumeStore: jest.fn(() => mockResumeStoreState),
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: (...args: any[]) => mockGetDocumentAsync(...args),
}));

jest.mock('../../navigation/AppNavigator', () => ({
  RootStackParamList: {},
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// ====================================================================
// Test Suite
// ====================================================================
describe('CareerPathDesignerScreen - Welcome Step Tests', () => {
  let CareerPathDesignerScreen: any;

  // Helper: extract all text from a test instance tree recursively
  const getAllText = (instance: any): string => {
    if (typeof instance === 'string' || typeof instance === 'number') {
      return String(instance);
    }
    if (!instance || !instance.children) return '';
    return instance.children.map((c: any) => getAllText(c)).join(' ');
  };

  // Helper: find a TouchableOpacity whose descendant text contains the given string
  const findTouchableByText = (root: any, text: string): any => {
    const touchables = root.findAllByType('TouchableOpacity');
    return touchables.find((t: any) => getAllText(t).includes(text));
  };

  // Helper: render the screen with renderer.act
  const renderScreen = () => {
    let tree: any;
    renderer.act(() => {
      tree = renderer.create(React.createElement(CareerPathDesignerScreen));
    });
    return tree!;
  };

  beforeAll(() => {
    CareerPathDesignerScreen = require('../CareerPathDesignerScreen').default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockResumeStoreState = {
      resumes: [],
      loading: false,
      fetchResumes: mockFetchResumes,
    };

    // Default API responses
    mockListCareerPlans.mockResolvedValue({ success: true, data: [] });
    mockGetCareerPlan.mockResolvedValue({ success: true, data: {} });
    mockGenerateCareerPlan.mockResolvedValue({ success: true, data: {} });
    mockGenerateCareerPlanAsync.mockResolvedValue({ success: true, data: { job_id: 'test-job-123' } });
    // Return 'completed' by default to prevent polling loops in tests
    mockGetCareerPlanJobStatus.mockResolvedValue({
      success: true,
      data: {
        status: 'completed',
        progress: 100,
        plan: {
          profileSummary: 'Test career plan',
          milestones: [],
          skill_gaps: [],
          immediate_actions: [],
          long_term_goals: []
        }
      }
    });
    mockGetResume.mockResolvedValue({ success: true, data: { parsed_data: {} } });
    mockUploadResume.mockResolvedValue({ success: true, data: { id: 1 } });
    mockAnalyzeCareerTrajectory.mockResolvedValue({ success: true, data: {} });
    mockGetSkillGaps.mockResolvedValue({ success: true, data: {} });
    mockGenerateDetailedCareerPlan.mockResolvedValue({ success: true, data: {} });
    mockGetDocumentAsync.mockResolvedValue({ canceled: true, assets: [] });
  });

  afterEach(() => {
    // Clear all pending timers before switching to real timers
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  // ================================================================
  // Module Exports
  // ================================================================
  describe('Welcome step rendering', () => {
    it('should render welcome screen by default', async () => {
      let tree: any;
      await renderer.act(async () => {
        tree = renderer.create(React.createElement(CareerPathDesignerScreen));
      });
      const str = JSON.stringify(tree!.toJSON());
      expect(str).toContain('Design Your Career Transition Path');
      // Should NOT show Back/Previous on welcome screen
      expect(str).not.toContain('Previous');
    });

    it('should call listCareerPlans on mount', async () => {
      await renderer.act(async () => {
        renderer.create(React.createElement(CareerPathDesignerScreen));
      });
      expect(mockListCareerPlans).toHaveBeenCalled();
    });

    it('should display saved career plans when available', async () => {
      mockListCareerPlans.mockResolvedValue({
        success: true,
        data: [
          { id: 1, target_role: 'Software Engineer', created_at: '2024-01-01' },
          { id: 2, target_role: 'Product Manager', created_at: '2024-01-02' },
        ],
      });

      let tree: any;
      await renderer.act(async () => {
        tree = renderer.create(React.createElement(CareerPathDesignerScreen));
      });

      const str = JSON.stringify(tree!.toJSON());
      expect(str).toContain('Software Engineer');
      expect(str).toContain('Product Manager');
      expect(str).toContain('Your Saved Career Plans');
    });

    it('should show Create New Plan when saved plans exist', async () => {
      mockListCareerPlans.mockResolvedValue({
        success: true,
        data: [{ id: 1, target_role: 'Engineer', created_at: '2024-01-01' }],
      });

      let tree: any;
      await renderer.act(async () => {
        tree = renderer.create(React.createElement(CareerPathDesignerScreen));
      });

      const str = JSON.stringify(tree!.toJSON());
      expect(str).toContain('Create New Plan');
    });

    it('should show Get Started when no saved plans', async () => {
      mockListCareerPlans.mockResolvedValue({ success: true, data: [] });

      let tree: any;
      await renderer.act(async () => {
        tree = renderer.create(React.createElement(CareerPathDesignerScreen));
      });

      const str = JSON.stringify(tree!.toJSON());
      expect(str).toContain('Get Started');
    });

    it('should handle listCareerPlans error gracefully', async () => {
      mockListCareerPlans.mockRejectedValue(new Error('Network error'));

      let tree: any;
      await renderer.act(async () => {
        tree = renderer.create(React.createElement(CareerPathDesignerScreen));
      });

      expect(tree!.toJSON()).toBeDefined();
      expect(mockListCareerPlans).toHaveBeenCalled();
    });

    it('should handle listCareerPlans non-array data', async () => {
      mockListCareerPlans.mockResolvedValue({ success: true, data: 'not-array' });

      let tree: any;
      await renderer.act(async () => {
        tree = renderer.create(React.createElement(CareerPathDesignerScreen));
      });

      // Should not crash, no saved plans shown
      const str = JSON.stringify(tree!.toJSON());
      expect(str).not.toContain('Your Saved Career Plans');
    });

    it('should navigate to upload step when Get Started pressed', async () => {
      let tree: any;
      await renderer.act(async () => {
        tree = renderer.create(React.createElement(CareerPathDesignerScreen));
      });

      const root = tree!.root;
      const startBtn = findTouchableByText(root, 'Get Started');
      expect(startBtn).toBeDefined();

      await renderer.act(async () => {
        startBtn!.props.onPress();
      });

      const str = JSON.stringify(tree!.toJSON());
      expect(str).toContain('Upload Your Resume');
    });

    it('should load a saved plan when tapped', async () => {
      mockListCareerPlans.mockResolvedValue({
        success: true,
        data: [{ id: 42, target_role: 'DevOps', created_at: '2024-06-01' }],
      });

      mockGetCareerPlan.mockResolvedValue({
        success: true,
        data: {
          id: 42,
          profile_summary: 'Saved DevOps plan',
          current_role: 'SysAdmin',
          target_role: 'DevOps',
          timeline: '6months',
          milestones: [],
        },
      });

      let tree: any;
      await renderer.act(async () => {
        tree = renderer.create(React.createElement(CareerPathDesignerScreen));
      });

      const root = tree!.root;
      const planBtn = findTouchableByText(root, 'DevOps');
      expect(planBtn).toBeDefined();

      await renderer.act(async () => {
        planBtn!.props.onPress();
      });

      expect(mockGetCareerPlan).toHaveBeenCalledWith(42);
      // Should navigate to results
      const str = JSON.stringify(tree!.toJSON());
      expect(str).toContain('New Plan');
    });

    it('should handle failed saved plan load', async () => {
      mockListCareerPlans.mockResolvedValue({
        success: true,
        data: [{ id: 99, target_role: 'PM', created_at: '2024-01-01' }],
      });

      mockGetCareerPlan.mockResolvedValue({
        success: false,
        error: 'Plan not found',
      });

      let tree: any;
      await renderer.act(async () => {
        tree = renderer.create(React.createElement(CareerPathDesignerScreen));
      });

      const root = tree!.root;
      const planBtn = findTouchableByText(root, 'PM');

      await renderer.act(async () => {
        planBtn!.props.onPress();
      });

      // Should stay on welcome (no transition to results with error)
      // Error should be set
      expect(mockGetCareerPlan).toHaveBeenCalledWith(99);
    });

    it('should handle saved plan load exception', async () => {
      mockListCareerPlans.mockResolvedValue({
        success: true,
        data: [{ id: 99, target_role: 'PM', created_at: '2024-01-01' }],
      });

      mockGetCareerPlan.mockRejectedValue(new Error('Connection failed'));

      let tree: any;
      await renderer.act(async () => {
        tree = renderer.create(React.createElement(CareerPathDesignerScreen));
      });

      const root = tree!.root;
      const planBtn = findTouchableByText(root, 'PM');

      await renderer.act(async () => {
        planBtn!.props.onPress();
      });

      expect(mockGetCareerPlan).toHaveBeenCalledWith(99);
    });

    it('should display feature cards on welcome screen', async () => {
      let tree: any;
      await renderer.act(async () => {
        tree = renderer.create(React.createElement(CareerPathDesignerScreen));
      });

      const str = JSON.stringify(tree!.toJSON());
      expect(str).toContain('Upload Resume');
      expect(str).toContain('Detailed Assessment');
      expect(str).toContain('Actionable Plan');
      expect(str).toContain('10-15 minutes');
    });

    it('should display plan using target_roles array', async () => {
      mockListCareerPlans.mockResolvedValue({
        success: true,
        data: [{ id: 1, target_roles: ['Cloud Architect'], created_at: '2024-01-01' }],
      });

      let tree: any;
      await renderer.act(async () => {
        tree = renderer.create(React.createElement(CareerPathDesignerScreen));
      });

      const str = JSON.stringify(tree!.toJSON());
      expect(str).toContain('Cloud Architect');
    });

    it('should fallback to Career Plan when no role name', async () => {
      mockListCareerPlans.mockResolvedValue({
        success: true,
        data: [{ id: 1, created_at: '2024-01-01' }],
      });

      let tree: any;
      await renderer.act(async () => {
        tree = renderer.create(React.createElement(CareerPathDesignerScreen));
      });

      const str = JSON.stringify(tree!.toJSON());
      expect(str).toContain('Career Plan');
    });
  });

  // ================================================================
  // Upload step rendering
  // ================================================================
});
