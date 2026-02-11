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
describe('CareerPathDesignerScreen - Upload Step Tests', () => {
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
  describe('Upload step rendering', () => {
    const navigateToUpload = async () => {
      let tree: any;
      await renderer.act(async () => {
        tree = renderer.create(React.createElement(CareerPathDesignerScreen));
      });

      const root = tree!.root;
      const startBtn = findTouchableByText(root, 'Get Started');
      await renderer.act(async () => {
        startBtn!.props.onPress();
      });

      return tree!;
    };

    it('should render upload step', async () => {
      const tree = await navigateToUpload();
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Upload Your Resume');
      expect(str).toContain('Tap to select your resume');
      expect(str).toContain('Supports PDF, DOC, and DOCX files');
    });

    it('should show Skip button on upload step', async () => {
      const tree = await navigateToUpload();
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Skip');
    });

    it('should show Back button on upload step', async () => {
      const tree = await navigateToUpload();
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Back');
    });

    it('should go back to welcome when Back pressed on upload', async () => {
      const tree = await navigateToUpload();
      const root = tree.root;
      const backBtn = findTouchableByText(root, 'Back');

      await renderer.act(async () => {
        backBtn!.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Design Your Career Transition Path');
    });

    it('should skip to questions when Skip pressed', async () => {
      const tree = await navigateToUpload();
      const root = tree.root;
      const skipBtn = findTouchableByText(root, 'Skip');

      await renderer.act(async () => {
        skipBtn!.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Basic Profile');
    });

    it('should display existing resumes when available', async () => {
      mockResumeStoreState = {
        resumes: [
          { id: 1, filename: 'resume1.pdf', created_at: '2024-01-01' },
          { id: 2, filename: 'resume2.pdf', created_at: '2024-01-02' },
        ],
        loading: false,
        fetchResumes: mockFetchResumes,
      };

      const tree = await navigateToUpload();
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('resume1.pdf');
      expect(str).toContain('resume2.pdf');
      expect(str).toContain('Select from Your Previous Resumes');
      expect(str).toContain('OR');
    });

    it('should handle file upload via DocumentPicker', async () => {
      mockGetDocumentAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file:///path/to/resume.pdf',
            name: 'resume.pdf',
            mimeType: 'application/pdf',
          },
        ],
      });

      mockUploadResume.mockResolvedValue({
        success: true,
        data: {
          resume_id: 123,
          parsed_data: {
            experience: [
              { title: 'Software Engineer', company: 'Tech Corp', duration_years: 3 },
            ],
          },
        },
      });

      const tree = await navigateToUpload();
      const root = tree.root;

      // Tap the upload zone
      const uploadZone = findTouchableByText(root, 'Tap to select your resume');
      expect(uploadZone).toBeDefined();

      await renderer.act(async () => {
        uploadZone!.props.onPress();
      });

      expect(mockGetDocumentAsync).toHaveBeenCalled();
      expect(mockUploadResume).toHaveBeenCalled();

      // After upload, should show success and auto-navigate to questions
      await renderer.act(async () => {
        jest.advanceTimersByTime(600);
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Basic Profile');
    });

    it('should handle canceled file selection', async () => {
      mockGetDocumentAsync.mockResolvedValue({ canceled: true, assets: [] });

      const tree = await navigateToUpload();
      const root = tree.root;
      const uploadZone = findTouchableByText(root, 'Tap to select your resume');

      await renderer.act(async () => {
        uploadZone!.props.onPress();
      });

      expect(mockUploadResume).not.toHaveBeenCalled();
      // Should remain on upload step
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Upload Your Resume');
    });

    it('should handle upload error (success: false)', async () => {
      mockGetDocumentAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file://resume.pdf', name: 'resume.pdf', mimeType: 'application/pdf' }],
      });

      mockUploadResume.mockResolvedValue({
        success: false,
        error: 'Upload failed',
      });

      const tree = await navigateToUpload();
      const root = tree.root;
      const uploadZone = findTouchableByText(root, 'Tap to select your resume');

      await renderer.act(async () => {
        uploadZone!.props.onPress();
      });

      expect(mockUploadResume).toHaveBeenCalled();
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Failed to upload resume');
    });

    it('should handle upload exception', async () => {
      mockGetDocumentAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file://resume.pdf', name: 'resume.pdf', mimeType: 'application/pdf' }],
      });

      mockUploadResume.mockRejectedValue(new Error('Network error'));

      const tree = await navigateToUpload();
      const root = tree.root;
      const uploadZone = findTouchableByText(root, 'Tap to select your resume');

      await renderer.act(async () => {
        uploadZone!.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Network error');
    });

    it('should select existing resume and auto-fill', async () => {
      mockResumeStoreState = {
        resumes: [{ id: 5, filename: 'existing.pdf', created_at: '2024-01-01' }],
        loading: false,
        fetchResumes: mockFetchResumes,
      };

      mockGetResume.mockResolvedValue({
        success: true,
        data: {
          parsed_data: {
            experience: [
              { title: 'Senior Developer', company: 'Acme', duration_years: 5 },
              { title: 'Developer', company: 'StartUp', duration_years: 3 },
            ],
          },
        },
      });

      const tree = await navigateToUpload();
      const root = tree.root;
      const resumeBtn = findTouchableByText(root, 'existing.pdf');
      expect(resumeBtn).toBeDefined();

      await renderer.act(async () => {
        resumeBtn!.props.onPress();
      });

      expect(mockGetResume).toHaveBeenCalledWith(5);

      // Should auto-navigate to questions after 500ms
      await renderer.act(async () => {
        jest.advanceTimersByTime(600);
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Basic Profile');
    });

    it('should handle existing resume load failure', async () => {
      mockResumeStoreState = {
        resumes: [{ id: 5, filename: 'fail.pdf', created_at: '2024-01-01' }],
        loading: false,
        fetchResumes: mockFetchResumes,
      };

      mockGetResume.mockResolvedValue({
        success: false,
        error: 'Not found',
      });

      const tree = await navigateToUpload();
      const root = tree.root;
      const resumeBtn = findTouchableByText(root, 'fail.pdf');

      await renderer.act(async () => {
        resumeBtn!.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Failed to load resume');
    });

    it('should handle existing resume load exception', async () => {
      mockResumeStoreState = {
        resumes: [{ id: 5, filename: 'err.pdf', created_at: '2024-01-01' }],
        loading: false,
        fetchResumes: mockFetchResumes,
      };

      mockGetResume.mockRejectedValue(new Error('DB error'));

      const tree = await navigateToUpload();
      const root = tree.root;
      const resumeBtn = findTouchableByText(root, 'err.pdf');

      await renderer.act(async () => {
        resumeBtn!.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('DB error');
    });

    it('should show loading indicator for existing resumes', async () => {
      mockResumeStoreState = {
        resumes: [{ id: 1, filename: 'test.pdf', created_at: '2024-01-01' }],
        loading: true,
        fetchResumes: mockFetchResumes,
      };

      const tree = await navigateToUpload();
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('ActivityIndicator');
    });
  });

  // ================================================================
  // Questions step rendering
  // ================================================================
});
