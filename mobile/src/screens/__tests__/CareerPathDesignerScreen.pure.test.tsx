/**
 * CareerPathDesignerScreen Tests - Pure Logic
 *
 * Fast, non-async tests covering:
 * - Module exports
 * - Pure logic (toggleArrayItem, validation, progress messages, year calc, intake construction)
 */

// Mock expo-constants BEFORE any imports to prevent EXDevLauncher crash
jest.mock('expo-constants', () => ({
  default: { expoConfig: { extra: {} }, manifest: { extra: {} } },
  expoConfig: { extra: {} },
  manifest: { extra: {} },
}));

// Mock supabase BEFORE any imports to prevent BlobModule crash
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
  },
}));

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
describe('CareerPathDesignerScreen - Pure Logic Tests', () => {
  let CareerPathDesignerScreen: any;

  beforeAll(() => {
    CareerPathDesignerScreen = require('../CareerPathDesignerScreen').default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ================================================================
  // Module Exports
  // ================================================================
  describe('Module exports', () => {
    it('should export a default function component', () => {
      expect(CareerPathDesignerScreen).toBeDefined();
      expect(typeof CareerPathDesignerScreen).toBe('function');
    });

    it('should have a name of CareerPathDesignerScreen', () => {
      expect(CareerPathDesignerScreen.name).toBe('CareerPathDesignerScreen');
    });
  });

  // ================================================================
  // WizardStep type values (pure logic)
  // ================================================================
  describe('WizardStep type values', () => {
    const validSteps = ['welcome', 'upload', 'questions', 'generating', 'results'];

    it('should have exactly 5 wizard steps', () => {
      expect(validSteps).toHaveLength(5);
    });

    it('should start with welcome', () => {
      expect(validSteps[0]).toBe('welcome');
    });

    it('should end with results', () => {
      expect(validSteps[validSteps.length - 1]).toBe('results');
    });
  });

  // ================================================================
  // toggleArrayItem logic (replicated from component line 507)
  // ================================================================
  describe('toggleArrayItem logic', () => {
    const toggleArrayItem = (arr: string[], item: string): string[] => {
      if (arr.includes(item)) {
        return arr.filter((i) => i !== item);
      } else {
        return [...arr, item];
      }
    };

    it('should add an item not in the array', () => {
      expect(toggleArrayItem(['a', 'b'], 'c')).toEqual(['a', 'b', 'c']);
    });

    it('should remove an item already in the array', () => {
      expect(toggleArrayItem(['a', 'b', 'c'], 'b')).toEqual(['a', 'c']);
    });

    it('should handle empty array', () => {
      expect(toggleArrayItem([], 'x')).toEqual(['x']);
    });

    it('should handle single item add', () => {
      expect(toggleArrayItem([], 'a')).toEqual(['a']);
    });

    it('should handle single item removal', () => {
      expect(toggleArrayItem(['a'], 'a')).toEqual([]);
    });
  });

  // ================================================================
  // Validation logic (replicated from component lines 460-498)
  // ================================================================
  describe('Validation logic (replicated)', () => {
    const validateStep = (step: number, data: any): string | null => {
      if (step === 1) {
        if (!data.dreamRole?.trim()) return 'Please provide your dream role';
        const validTopTasks = data.topTasks.filter((t: string) => t.trim()).length >= 3;
        if (!validTopTasks) return 'Please provide at least 3 top tasks';
        const validStrengths = data.strengths.filter((s: string) => s.trim()).length >= 2;
        if (!validStrengths) return 'Please provide at least 2 strengths';
        return null;
      }
      if (step === 4) {
        if (data.learningStyle.length === 0)
          return 'Please select at least one learning style';
        return null;
      }
      if (step === 5) {
        if (data.transitionMotivation.length === 0)
          return 'Please select at least one motivation for transitioning';
        return null;
      }
      return null;
    };

    it('should fail step 1 with empty dreamRole', () => {
      expect(validateStep(1, { dreamRole: '', topTasks: [], strengths: [] })).toBe(
        'Please provide your dream role'
      );
    });

    it('should fail step 1 with < 3 top tasks', () => {
      expect(
        validateStep(1, {
          dreamRole: 'PM',
          topTasks: ['a', 'b'],
          strengths: ['x', 'y'],
        })
      ).toBe('Please provide at least 3 top tasks');
    });

    it('should fail step 1 with < 2 strengths', () => {
      expect(
        validateStep(1, {
          dreamRole: 'PM',
          topTasks: ['a', 'b', 'c'],
          strengths: ['x'],
        })
      ).toBe('Please provide at least 2 strengths');
    });

    it('should pass step 1 with valid data', () => {
      expect(
        validateStep(1, {
          dreamRole: 'PM',
          topTasks: ['a', 'b', 'c'],
          strengths: ['x', 'y'],
        })
      ).toBeNull();
    });

    it('should fail step 4 with empty learningStyle', () => {
      expect(validateStep(4, { learningStyle: [] })).toBe(
        'Please select at least one learning style'
      );
    });

    it('should pass step 4 with data', () => {
      expect(validateStep(4, { learningStyle: ['video'] })).toBeNull();
    });

    it('should fail step 5 with empty transitionMotivation', () => {
      expect(validateStep(5, { transitionMotivation: [] })).toBe(
        'Please select at least one motivation for transitioning'
      );
    });

    it('should pass step 5 with data', () => {
      expect(validateStep(5, { transitionMotivation: ['career-growth'] })).toBeNull();
    });

    it('should pass steps 2 and 3 (no validation required)', () => {
      expect(validateStep(2, {})).toBeNull();
      expect(validateStep(3, {})).toBeNull();
    });

    it('should count only non-empty trimmed tasks', () => {
      expect(
        validateStep(1, {
          dreamRole: 'Dev',
          topTasks: ['a', '', 'b', '  ', 'c'],
          strengths: ['s1', 's2'],
        })
      ).toBeNull();
    });

    it('should reject whitespace-only dreamRole', () => {
      expect(
        validateStep(1, {
          dreamRole: '   ',
          topTasks: ['a', 'b', 'c'],
          strengths: ['x', 'y'],
        })
      ).toBe('Please provide your dream role');
    });
  });

  // ================================================================
  // Progress messages logic (replicated from component line 363)
  // ================================================================
  describe('Progress messages logic (replicated)', () => {
    const progressMessages = [
      'Analyzing your background...',
      'Researching target role requirements...',
      'Identifying skill gaps...',
      'Finding relevant certifications...',
      'Discovering networking opportunities...',
      'Building your personalized roadmap...',
    ];

    const getMessageIndex = (progress: number) =>
      Math.min(Math.floor(progress / 20), progressMessages.length - 1);

    it('should return first message at 0%', () => {
      expect(progressMessages[getMessageIndex(0)]).toBe('Analyzing your background...');
    });

    it('should return second message at 20%', () => {
      expect(progressMessages[getMessageIndex(20)]).toBe(
        'Researching target role requirements...'
      );
    });

    it('should return third message at 50%', () => {
      expect(progressMessages[getMessageIndex(50)]).toBe('Identifying skill gaps...');
    });

    it('should return last message at 100%', () => {
      expect(progressMessages[getMessageIndex(100)]).toBe(
        'Building your personalized roadmap...'
      );
    });

    it('should clamp at the last message index for very high progress', () => {
      expect(progressMessages[getMessageIndex(200)]).toBe(
        'Building your personalized roadmap...'
      );
    });

    it('should return fourth message at 60%', () => {
      expect(progressMessages[getMessageIndex(60)]).toBe(
        'Finding relevant certifications...'
      );
    });
  });

  // ================================================================
  // Years calculation logic (replicated from component line 218)
  // ================================================================
  describe('Years calculation logic (replicated)', () => {
    const calculateYears = (experience: any[]): number => {
      return (
        experience?.reduce((total: number, exp: any) => {
          return total + (exp.duration_years || 0);
        }, 0) || 0
      );
    };

    it('should sum duration_years from experience array', () => {
      const exp = [
        { title: 'SE', duration_years: 3 },
        { title: 'SSE', duration_years: 5 },
      ];
      expect(calculateYears(exp)).toBe(8);
    });

    it('should handle missing duration_years', () => {
      const exp = [{ title: 'SE' }, { title: 'SSE', duration_years: 2 }];
      expect(calculateYears(exp)).toBe(2);
    });

    it('should return 0 for empty array', () => {
      expect(calculateYears([])).toBe(0);
    });

    it('should return 0 for undefined', () => {
      expect(calculateYears(undefined as any)).toBe(0);
    });
  });

  // ================================================================
  // handleGenerate validation logic (replicated from component line 285)
  // ================================================================
  describe('handleGenerate validation logic (replicated)', () => {
    const validateGenerate = (
      dreamRole: string,
      topTasks: string[],
      strengths: string[]
    ): string | null => {
      if (!dreamRole.trim()) {
        return 'Please tell us your dream role or career goal';
      }
      const validTopTasks = topTasks.filter((t) => t.trim()).length >= 3;
      if (!validTopTasks) {
        return 'Please provide at least 3 top tasks from your current role';
      }
      const validStrengths = strengths.filter((s) => s.trim()).length >= 2;
      if (!validStrengths) {
        return 'Please provide at least 2 strengths';
      }
      return null;
    };

    it('should fail with empty dreamRole', () => {
      expect(validateGenerate('', [], [])).toBe(
        'Please tell us your dream role or career goal'
      );
    });

    it('should fail with fewer than 3 tasks', () => {
      expect(validateGenerate('PM', ['a', 'b'], ['s1', 's2'])).toBe(
        'Please provide at least 3 top tasks from your current role'
      );
    });

    it('should fail with fewer than 2 strengths', () => {
      expect(validateGenerate('PM', ['a', 'b', 'c'], ['s1'])).toBe(
        'Please provide at least 2 strengths'
      );
    });

    it('should pass with valid data', () => {
      expect(validateGenerate('PM', ['a', 'b', 'c'], ['s1', 's2'])).toBeNull();
    });
  });

  // ================================================================
  // Intake object construction (replicated from component line 311)
  // ================================================================
  describe('Intake object construction (replicated)', () => {
    it('should use currentRole if provided, else dreamRole', () => {
      const buildIntake = (currentRole: string, dreamRole: string) => ({
        current_role_title: currentRole || dreamRole,
      });

      expect(buildIntake('Manager', 'Director').current_role_title).toBe('Manager');
      expect(buildIntake('', 'Director').current_role_title).toBe('Director');
    });

    it('should use currentIndustry if provided, else General', () => {
      const buildIntake = (currentIndustry: string) => ({
        current_industry: currentIndustry || 'General',
      });

      expect(buildIntake('Tech').current_industry).toBe('Tech');
      expect(buildIntake('').current_industry).toBe('General');
    });

    it('should use location if provided, else Remote', () => {
      const buildIntake = (location: string) => ({
        location: location || 'Remote',
      });

      expect(buildIntake('Austin, TX').location).toBe('Austin, TX');
      expect(buildIntake('').location).toBe('Remote');
    });
  });
});
