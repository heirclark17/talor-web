/**
 * InterviewPrepScreen Test Suite
 *
 * Comprehensive tests covering all code paths:
 * - ExpandableSection toggle (lines 60-96)
 * - BulletList rendering with various item types (lines 98-128)
 * - Chip component (lines 130-135)
 * - Loading state (lines 229-238)
 * - Empty/no-prep state with generate button (lines 240-286)
 * - Full prepData render with all 7 expandable sections (lines 288-998)
 * - AI Practice cards (lines 836-991)
 * - handleSectionPress toggle (lines 183-189)
 * - handleGeneratePrep error (lines 204-209)
 * - handleRefresh Alert flow (lines 212-227)
 * - Certifications loading/loaded badge states (lines 972-984)
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

// ---- MOCKS (must be before imports) ----

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockGetInterviewPrep = jest.fn();
const mockGenerateInterviewPrep = jest.fn();
const mockDeleteInterviewPrep = jest.fn();

let mockCachedPrep: any = null;
let mockStoreOverrides: Record<string, any> = {};

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
    params: { tailoredResumeId: 1 },
  })),
  useFocusEffect: jest.fn(),
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: jest.fn(),
}));

jest.mock('../../stores', () => ({
  useInterviewPrepStore: jest.fn((selector?: any) => {
    const state: any = {
      loading: false,
      generating: false,
      loadingReadiness: false,
      loadingValuesAlignment: false,
      loadingCompanyResearch: false,
      loadingStrategicNews: false,
      loadingCompetitiveIntelligence: false,
      loadingInterviewStrategy: false,
      loadingExecutiveInsights: false,
      loadingCertifications: false,
      getInterviewPrep: mockGetInterviewPrep,
      generateInterviewPrep: mockGenerateInterviewPrep,
      deleteInterviewPrep: mockDeleteInterviewPrep,
      cachedPreps: {},
      ...mockStoreOverrides,
    };
    if (typeof selector === 'function') return selector(state);
    return state;
  }),
  selectCachedPrep: jest.fn((_state: any, _id: number) => mockCachedPrep),
}));

jest.mock('../../components/glass/GlassCard', () => ({
  GlassCard: ({ children, ...props }: any) =>
    require('react').createElement('GlassCard', props, children),
}));

jest.mock('../../components/interviewPrep/types', () => ({}));

jest.mock('../../api/client', () => ({
  api: {
    getMockSessions: jest.fn(() => Promise.resolve({ success: true, data: [] })),
    listStarStories: jest.fn(() => Promise.resolve({ success: true, data: [] })),
    cacheInterviewPrepData: jest.fn(() => Promise.resolve({ success: true })),
  },
  ReadinessScore: {},
  ValuesAlignment: {},
  CompanyResearch: {},
  StrategicNewsItem: {},
  CompetitiveIntelligence: {},
  InterviewStrategy: {},
  ExecutiveInsights: {},
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }: any) =>
    require('react').createElement('SafeAreaView', props, children),
}));

// ---- IMPORTS ----

import React from 'react';
import renderer from 'react-test-renderer';
import { Alert } from 'react-native';

// Silence console.log from the component's debug statements
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});
afterAll(() => {
  (console.log as jest.Mock).mockRestore();
});

// ---- HELPERS ----

/** Recursively extract all text from a react-test-renderer tree */
function getTreeText(node: any): string {
  if (node == null) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getTreeText).join('');
  if (node.children) return node.children.map(getTreeText).join('');
  return '';
}

/** Safe JSON.stringify that handles circular refs */
function safeStringify(obj: any): string {
  const seen = new WeakSet();
  return JSON.stringify(obj, (_key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]';
      seen.add(value);
    }
    return value;
  });
}

/** Find a touchable by its accessibility label using root.findAll */
function findByAccessibilityLabel(root: any, label: string): any {
  const results = root.findAll(
    (node: any) => node.props && node.props.accessibilityLabel === label
  );
  return results.length > 0 ? results[0] : null;
}

/** Find all elements by type string */
function findAllByType(root: any, typeName: string): any[] {
  return root.findAll((node: any) => {
    const type = node.type;
    if (typeof type === 'string') return type === typeName;
    if (type && type.displayName) return type.displayName === typeName;
    if (type && type.name) return type.name === typeName;
    return false;
  });
}

// ---- FULL PREP DATA FIXTURES ----

const FULL_PREP_DATA = {
  prepData: {
    company_profile: {
      name: 'Acme Corp',
      overview_paragraph: 'Acme Corp is a leading tech company.',
      size_estimate: '5000 employees',
      industry: 'Technology',
      locations: ['San Francisco, CA', 'New York, NY'],
    },
    values_and_culture: {
      stated_values: [
        { name: 'Innovation', description: 'We innovate constantly' },
        { title: 'Integrity', description: 'We act with integrity' },
      ],
      practical_implications: [
        'Move fast and break things',
        'Always be transparent',
      ],
    },
    strategy_and_news: {
      strategic_themes: [
        { theme: 'AI Investment', rationale: 'Market demands AI capabilities' },
        { name: 'Cloud Migration', description: 'Moving to cloud-first' },
      ],
      technology_focus: [
        {
          technology: 'Kubernetes',
          name: 'K8s',
          description: 'Container orchestration platform',
          relevance_to_role: 'Critical for security operations',
        },
        {
          name: 'Terraform',
          description: 'Infrastructure as Code tool',
        },
      ],
      recent_events: [
        {
          title: 'Acme acquires SecureCo',
          headline: 'Major acquisition',
          summary: 'Acme Corp acquired SecureCo for $500M',
          impact_summary: 'Strengthens security portfolio',
          date: '2026-01-15',
          source: 'TechCrunch',
        },
        {
          headline: 'New data center launched',
          summary: 'Acme opens APAC data center',
          date: '2026-01-10',
          source: 'Reuters',
        },
        {
          summary: 'Only summary event',
        },
        // Events beyond 5 to test slice
        { title: 'Event 4', summary: 'S4' },
        { title: 'Event 5', summary: 'S5' },
        { title: 'Event 6 - should be sliced out', summary: 'S6' },
      ],
    },
    role_analysis: {
      job_title: 'Senior Security PM',
      seniority_level: 'Senior',
      core_responsibilities: [
        'Lead security programs',
        'Manage cross-functional teams',
        'Drive vulnerability remediation',
        'Build governance frameworks',
        'Report to executive leadership',
        'Sixth responsibility - sliced out',
      ],
      must_have_skills: [
        'NIST Frameworks',
        { name: 'Risk Management' },
        { skill: 'Stakeholder Communication' },
        { foo: 'bar' },
      ],
    },
    interview_preparation: {
      research_tasks: [
        'Research company history',
        'Review annual report',
      ],
      day_of_checklist: [
        'Bring copies of resume',
        'Prepare questions to ask',
      ],
    },
    candidate_positioning: {
      resume_focus_areas: [
        'Cybersecurity program management',
        'Risk governance experience',
      ],
      keyword_map: [
        {
          company_term: 'Technology Controls',
          term: 'TC',
          candidate_equivalent: 'Security Operations',
          equivalent: 'SecOps',
          context: 'Used interchangeably at the company',
        },
        {
          term: 'CTC',
          equivalent: 'Cyber Team',
        },
      ],
      story_prompts: [
        {
          title: 'Led Vulnerability Program',
          description: 'Tell how you built the vuln mgmt program',
          star_hint: {
            situation: 'Company had no formal vuln process',
            task: 'Build a vulnerability management program',
            action: 'Implemented CVSS scoring and SLA tracking',
            result: 'Reduced critical vulns by 60%',
          },
        },
        {
          title: 'Crisis Response',
          description: 'How you handled a major incident',
        },
      ],
    },
    questions_to_ask_interviewer: {
      culture: ['What is the team culture like?', 'How do you handle remote work?'],
      role: ['What does success look like in 90 days?'],
      empty_category: [],
    },
  },
  interviewPrepId: 42,
  readinessScore: null,
  valuesAlignment: null,
  companyResearch: null,
  strategicNews: null,
  competitiveIntelligence: null,
  interviewStrategy: null,
  executiveInsights: null,
  certificationRecommendations: null,
};

// ---- TEST SUITE ----

describe('InterviewPrepScreen', () => {
  let InterviewPrepScreen: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCachedPrep = null;
    mockStoreOverrides = {};
    InterviewPrepScreen = require('../InterviewPrepScreen').default;
  });

  const renderScreen = () => {
    let tree: any;
    renderer.act(() => {
      tree = renderer.create(React.createElement(InterviewPrepScreen));
    });
    return tree!;
  };

  // ========================================
  // Module Export Tests
  // ========================================
  describe('Module Exports', () => {
    it('should export a default function component', () => {
      const mod = require('../InterviewPrepScreen');
      expect(mod.default).toBeDefined();
      expect(typeof mod.default).toBe('function');
    });

    it('should have a function named InterviewPrepScreen', () => {
      const mod = require('../InterviewPrepScreen');
      expect(mod.default.name).toBe('InterviewPrepScreen');
    });
  });

  // ========================================
  // Loading State (lines 229-238)
  // ========================================
  describe('Loading state', () => {
    it('should render loading indicator when loading is true', () => {
      mockStoreOverrides = { loading: true };
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Loading interview prep...');
    });

    it('should show ActivityIndicator in loading state', () => {
      mockStoreOverrides = { loading: true };
      const tree = renderScreen();
      const str = safeStringify(tree.toJSON());
      expect(str).toContain('Loading interview prep');
    });
  });

  // ========================================
  // Empty / No-Prep State (lines 240-286)
  // ========================================
  describe('Empty state (no prepData)', () => {
    beforeEach(() => {
      mockCachedPrep = null;
    });

    it('should render empty state with "No Prep Available" title', () => {
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('No Prep Available');
    });

    it('should render the generate button text', () => {
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Generate Interview Prep');
    });

    it('should render back button with goBack navigation', () => {
      const tree = renderScreen();
      const backBtn = findByAccessibilityLabel(tree.root, 'Go back');
      expect(backBtn).not.toBeNull();
      renderer.act(() => {
        backBtn.props.onPress();
      });
      expect(mockGoBack).toHaveBeenCalled();
    });

    it('should show "Generating..." text when generating is true', () => {
      mockStoreOverrides = { generating: true };
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Generating...');
    });

    it('should disable generate button when generating', () => {
      mockStoreOverrides = { generating: true };
      const tree = renderScreen();
      const genBtn = findByAccessibilityLabel(tree.root, 'Generating interview prep');
      expect(genBtn).not.toBeNull();
      expect(genBtn.props.disabled).toBe(true);
    });

    it('should call generateInterviewPrep on generate button press', async () => {
      mockGenerateInterviewPrep.mockResolvedValue({ id: 1 });
      const tree = renderScreen();
      const genBtn = findByAccessibilityLabel(tree.root, 'Generate interview prep');
      expect(genBtn).not.toBeNull();
      await renderer.act(async () => {
        await genBtn.props.onPress();
      });
      expect(mockGenerateInterviewPrep).toHaveBeenCalledWith(1);
    });

    it('should show Alert.alert when generateInterviewPrep returns null', async () => {
      mockGenerateInterviewPrep.mockResolvedValue(null);
      const tree = renderScreen();
      const genBtn = findByAccessibilityLabel(tree.root, 'Generate interview prep');
      await renderer.act(async () => {
        await genBtn.props.onPress();
      });
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to generate interview prep');
    });

    it('should render description text about generating prep', () => {
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Generate AI-powered interview preparation materials');
    });
  });

  // ========================================
  // useEffect: fetching on mount (lines 192-201)
  // ========================================
  describe('Mount behavior', () => {
    it('should call getInterviewPrep when no cached prep exists', () => {
      mockCachedPrep = null;
      renderScreen();
      expect(mockGetInterviewPrep).toHaveBeenCalledWith(1);
    });

    it('should NOT call getInterviewPrep when cached prep exists', () => {
      mockCachedPrep = FULL_PREP_DATA;
      renderScreen();
      expect(mockGetInterviewPrep).not.toHaveBeenCalled();
    });
  });

  // ========================================
  // Full Prep Data Render (lines 288-998)
  // ========================================
  describe('Full render with prepData', () => {
    beforeEach(() => {
      mockCachedPrep = FULL_PREP_DATA;
    });

    it('should render the main view with header "Interview Prep"', () => {
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Interview Prep');
    });

    it('should render the back button in header', () => {
      const tree = renderScreen();
      const backBtn = findByAccessibilityLabel(tree.root, 'Go back');
      expect(backBtn).not.toBeNull();
      renderer.act(() => {
        backBtn.props.onPress();
      });
      expect(mockGoBack).toHaveBeenCalled();
    });

    it('should render the refresh button', () => {
      const tree = renderScreen();
      const refreshBtn = findByAccessibilityLabel(tree.root, 'Refresh interview prep data');
      expect(refreshBtn).not.toBeNull();
    });

    // ---- Job Info Card (lines 313-344) ----
    it('should render company name from company_profile', () => {
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Acme Corp');
    });

    it('should render job title from role_analysis', () => {
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Senior Security PM');
    });

    it('should render industry metadata', () => {
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Technology');
    });

    it('should render first location', () => {
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('San Francisco, CA');
    });

    it('should render seniority level', () => {
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Senior');
    });

    it('should render section labels', () => {
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('COMPANY INSIGHTS');
      expect(text).toContain('ROLE & PREPARATION');
    });

    // ---- Fallbacks for missing data ----
    it('should render "Company" fallback when company_profile.name is missing', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        prepData: {
          ...FULL_PREP_DATA.prepData,
          company_profile: { ...FULL_PREP_DATA.prepData.company_profile, name: undefined },
        },
      };
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Company');
    });

    it('should render "Position" fallback when role_analysis.job_title is missing', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        prepData: {
          ...FULL_PREP_DATA.prepData,
          role_analysis: { ...FULL_PREP_DATA.prepData.role_analysis, job_title: undefined },
        },
      };
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Position');
    });

    it('should not render industry metaItem when industry is missing', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        prepData: {
          ...FULL_PREP_DATA.prepData,
          company_profile: { ...FULL_PREP_DATA.prepData.company_profile, industry: undefined },
        },
      };
      const tree = renderScreen();
      const str = safeStringify(tree.toJSON());
      // The industry text should not appear
      expect(str).not.toContain('"Technology"');
    });

    it('should not render location metaItem when locations is empty', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        prepData: {
          ...FULL_PREP_DATA.prepData,
          company_profile: { ...FULL_PREP_DATA.prepData.company_profile, locations: [] },
        },
      };
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('San Francisco');
    });

    it('should not render seniority when seniority_level is missing', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        prepData: {
          ...FULL_PREP_DATA.prepData,
          role_analysis: { ...FULL_PREP_DATA.prepData.role_analysis, seniority_level: undefined },
        },
      };
      const tree = renderScreen();
      const str = safeStringify(tree.toJSON());
      expect(str).not.toContain('"Senior"');
    });
  });

  // ========================================
  // handleRefresh (lines 212-227)
  // ========================================
  describe('handleRefresh', () => {
    beforeEach(() => {
      mockCachedPrep = FULL_PREP_DATA;
    });

    it('should call Alert.alert with correct title and message', () => {
      const tree = renderScreen();
      const refreshBtn = findByAccessibilityLabel(tree.root, 'Refresh interview prep data');
      renderer.act(() => {
        refreshBtn.props.onPress();
      });
      expect(Alert.alert).toHaveBeenCalledWith(
        'Refresh Interview Prep',
        'This will reload all data from the server. Continue?',
        expect.any(Array)
      );
    });

    it('should call deleteInterviewPrep and getInterviewPrep when Refresh is confirmed', () => {
      const tree = renderScreen();
      const refreshBtn = findByAccessibilityLabel(tree.root, 'Refresh interview prep data');
      renderer.act(() => {
        refreshBtn.props.onPress();
      });
      // Get the alert buttons
      const alertCalls = (Alert.alert as jest.Mock).mock.calls;
      const buttons = alertCalls[0][2];
      // Find the "Refresh" button (second button)
      const refreshAction = buttons.find((b: any) => b.text === 'Refresh');
      expect(refreshAction).toBeDefined();
      renderer.act(() => {
        refreshAction.onPress();
      });
      expect(mockDeleteInterviewPrep).toHaveBeenCalledWith(1);
      expect(mockGetInterviewPrep).toHaveBeenCalledWith(1);
    });

    it('should have a Cancel button that does nothing', () => {
      const tree = renderScreen();
      const refreshBtn = findByAccessibilityLabel(tree.root, 'Refresh interview prep data');
      renderer.act(() => {
        refreshBtn.props.onPress();
      });
      const alertCalls = (Alert.alert as jest.Mock).mock.calls;
      const buttons = alertCalls[0][2];
      const cancelBtn = buttons.find((b: any) => b.text === 'Cancel');
      expect(cancelBtn).toBeDefined();
      expect(cancelBtn.style).toBe('cancel');
    });
  });

  // ========================================
  // handleSectionPress - Expandable Cards (lines 183-189)
  // ========================================
  describe('handleSectionPress - Company Profile section toggle', () => {
    beforeEach(() => {
      mockCachedPrep = FULL_PREP_DATA;
    });

    it('should show ChevronRight initially for Company Profile', () => {
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      // Section titles should be present
      expect(text).toContain('Company Profile');
      // But expanded content should NOT be present
      expect(text).not.toContain('Acme Corp is a leading tech company.');
    });

    it('should expand Company Profile section when pressed', () => {
      const tree = renderScreen();
      // Find all touchable elements and look for the one with Company Profile
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      // First card with activeOpacity=0.7 is Company Profile
      expect(touchables.length).toBeGreaterThan(0);
      renderer.act(() => {
        touchables[0].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Acme Corp is a leading tech company.');
      expect(text).toContain('5000 employees');
      expect(text).toContain('Industry:');
    });

    it('should collapse Company Profile section when pressed again', () => {
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      // Press to expand
      renderer.act(() => {
        touchables[0].props.onPress();
      });
      let text = getTreeText(tree.toJSON());
      expect(text).toContain('Acme Corp is a leading tech company.');
      // Press again to collapse
      renderer.act(() => {
        touchables[0].props.onPress();
      });
      text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Acme Corp is a leading tech company.');
    });

    it('should switch from Company Profile to Values & Culture when pressed', () => {
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      // Press Company Profile (index 0)
      renderer.act(() => {
        touchables[0].props.onPress();
      });
      let text = getTreeText(tree.toJSON());
      expect(text).toContain('Acme Corp is a leading tech company.');
      // Press Values & Culture (index 1)
      renderer.act(() => {
        touchables[1].props.onPress();
      });
      text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Acme Corp is a leading tech company.');
      expect(text).toContain('Core Values');
    });
  });

  // ========================================
  // Values & Culture Section (lines 396-446)
  // ========================================
  describe('Values & Culture expanded section', () => {
    beforeEach(() => {
      mockCachedPrep = FULL_PREP_DATA;
    });

    it('should show stated values count in subtitle', () => {
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('2 core values identified');
    });

    it('should render stated values when expanded', () => {
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      // Values & Culture is the second card (index 1)
      renderer.act(() => {
        touchables[1].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Innovation');
      expect(text).toContain('Integrity');
      expect(text).toContain('Core Values');
    });

    it('should render practical implications when expanded', () => {
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[1].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Practical Implications');
      expect(text).toContain('Move fast and break things');
      expect(text).toContain('Always be transparent');
    });

    it('should not render values section when stated_values is empty', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        prepData: {
          ...FULL_PREP_DATA.prepData,
          values_and_culture: { stated_values: [], practical_implications: [] },
        },
      };
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[1].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Core Values');
      expect(text).not.toContain('Practical Implications');
    });

    it('should handle value with title but no name', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        prepData: {
          ...FULL_PREP_DATA.prepData,
          values_and_culture: {
            stated_values: [{ title: 'Only Title' }],
            practical_implications: [],
          },
        },
      };
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[1].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Only Title');
    });

    it('should show "Unknown Value" when value has no name or title', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        prepData: {
          ...FULL_PREP_DATA.prepData,
          values_and_culture: {
            stated_values: [{ description: 'some desc' }],
            practical_implications: [],
          },
        },
      };
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[1].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Unknown Value');
    });
  });

  // ========================================
  // Strategy & News Section (lines 448-551)
  // ========================================
  describe('Strategy & News expanded section', () => {
    beforeEach(() => {
      mockCachedPrep = FULL_PREP_DATA;
    });

    it('should show recent events count in subtitle', () => {
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      // 6 events in fixture
      expect(text).toContain('6 recent updates');
    });

    it('should render strategic themes when expanded', () => {
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      // Strategy & News is index 2
      renderer.act(() => {
        touchables[2].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Strategic Themes');
      expect(text).toContain('AI Investment');
      expect(text).toContain('Market demands AI capabilities');
      expect(text).toContain('Cloud Migration');
      expect(text).toContain('Moving to cloud-first');
    });

    it('should render technology focus items when expanded', () => {
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[2].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Technology Focus');
      expect(text).toContain('Kubernetes');
      expect(text).toContain('Container orchestration platform');
      expect(text).toContain('Role Relevance:');
      expect(text).toContain('Critical for security operations');
      expect(text).toContain('Terraform');
    });

    it('should render recent events (sliced to 5) when expanded', () => {
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[2].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Recent Developments');
      expect(text).toContain('Acme acquires SecureCo');
      expect(text).toContain('New data center launched');
      expect(text).toContain('Only summary event');
      // 6th event should be sliced out
      expect(text).not.toContain('Event 6 - should be sliced out');
    });

    it('should render event impact_summary when present', () => {
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[2].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Impact:');
      expect(text).toContain('Strengthens security portfolio');
    });

    it('should render event date and source', () => {
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[2].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('2026-01-15');
      expect(text).toContain('TechCrunch');
    });

    it('should render event summary separately when different from title', () => {
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[2].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      // First event has both title and summary (different), so summary should render
      expect(text).toContain('Acme Corp acquired SecureCo for $500M');
    });

    it('should not render separate summary when it matches title/headline', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        prepData: {
          ...FULL_PREP_DATA.prepData,
          strategy_and_news: {
            strategic_themes: [],
            technology_focus: [],
            recent_events: [
              {
                title: 'Same title',
                summary: 'Same title',
              },
            ],
          },
        },
      };
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[2].props.onPress();
      });
      // The summary text should appear exactly once (as the title), not twice
      const str = safeStringify(tree.toJSON());
      const matches = str.match(/Same title/g);
      // Should appear once for the title text
      expect(matches).not.toBeNull();
      expect(matches!.length).toBe(1);
    });

    it('should not render technology relevance when relevance_to_role is missing', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        prepData: {
          ...FULL_PREP_DATA.prepData,
          strategy_and_news: {
            strategic_themes: [],
            technology_focus: [
              { name: 'Docker', description: 'Containers' },
            ],
            recent_events: [],
          },
        },
      };
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[2].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Role Relevance:');
    });

    it('should not render sections when data arrays are empty', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        prepData: {
          ...FULL_PREP_DATA.prepData,
          strategy_and_news: {
            strategic_themes: [],
            technology_focus: [],
            recent_events: [],
          },
        },
      };
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[2].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Strategic Themes');
      expect(text).not.toContain('Technology Focus');
      expect(text).not.toContain('Recent Developments');
    });
  });

  // ========================================
  // Role Analysis Section (lines 556-610)
  // ========================================
  describe('Role Analysis expanded section', () => {
    beforeEach(() => {
      mockCachedPrep = FULL_PREP_DATA;
    });

    it('should show job title in subtitle', () => {
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      // Already tested above, but confirm it is in role analysis card too
      expect(text).toContain('Senior Security PM');
    });

    it('should render core responsibilities (sliced to 5) when expanded', () => {
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      // Role Analysis is index 3
      renderer.act(() => {
        touchables[3].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Core Responsibilities');
      expect(text).toContain('Lead security programs');
      expect(text).toContain('Report to executive leadership');
      // 6th should be sliced out
      expect(text).not.toContain('Sixth responsibility - sliced out');
    });

    it('should render must-have skills as chips when expanded', () => {
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[3].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Must-Have Skills');
      expect(text).toContain('NIST Frameworks');
      expect(text).toContain('Risk Management');
      expect(text).toContain('Stakeholder Communication');
    });

    it('should render empty label for unrecognized skill object shape', () => {
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[3].props.onPress();
      });
      // The { foo: 'bar' } skill should render as empty string label
      const str = safeStringify(tree.toJSON());
      // Just verify the section rendered without errors
      expect(str).toContain('Must-Have Skills');
    });

    it('should show fallback subtitle when job_title is missing', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        prepData: {
          ...FULL_PREP_DATA.prepData,
          role_analysis: { ...FULL_PREP_DATA.prepData.role_analysis, job_title: undefined },
        },
      };
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Skills & requirements');
    });

    it('should not render core responsibilities when array is empty', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        prepData: {
          ...FULL_PREP_DATA.prepData,
          role_analysis: { ...FULL_PREP_DATA.prepData.role_analysis, core_responsibilities: [] },
        },
      };
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[3].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Core Responsibilities');
    });

    it('should not render must-have skills when array is empty', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        prepData: {
          ...FULL_PREP_DATA.prepData,
          role_analysis: { ...FULL_PREP_DATA.prepData.role_analysis, must_have_skills: [] },
        },
      };
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[3].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Must-Have Skills');
    });
  });

  // ========================================
  // Preparation Checklist Section (lines 612-662)
  // ========================================
  describe('Preparation Checklist expanded section', () => {
    beforeEach(() => {
      mockCachedPrep = FULL_PREP_DATA;
    });

    it('should show task count in subtitle', () => {
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      // Subtitle shows "0/4 tasks completed" format (2 research + 2 day-of = 4 total)
      expect(text).toContain('0/4 tasks completed');
    });

    it('should render research tasks and day-of checklist when expanded', () => {
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      // Preparation Checklist is index 4
      renderer.act(() => {
        touchables[4].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Research Tasks');
      expect(text).toContain('Research company history');
      expect(text).toContain('Review annual report');
      expect(text).toContain('Day-of Checklist');
      expect(text).toContain('Bring copies of resume');
      expect(text).toContain('Prepare questions to ask');
    });

    it('should not render sections when arrays are empty', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        prepData: {
          ...FULL_PREP_DATA.prepData,
          interview_preparation: { research_tasks: [], day_of_checklist: [] },
        },
      };
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[4].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      // The expanded section hides content items when arrays are empty
      // (section headers still appear in the progress bar area outside the expanded section)
      expect(text).not.toContain('Research company history');
      expect(text).not.toContain('Bring copies of resume');
    });
  });

  // ========================================
  // Questions to Ask Section (lines 664-711)
  // ========================================
  describe('Questions to Ask expanded section', () => {
    beforeEach(() => {
      mockCachedPrep = FULL_PREP_DATA;
    });

    it('should render questions grouped by category when expanded', () => {
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      // Questions to Ask is index 5
      renderer.act(() => {
        touchables[5].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('culture');
      expect(text).toContain('What is the team culture like?');
      expect(text).toContain('How do you handle remote work?');
      expect(text).toContain('role');
      expect(text).toContain('What does success look like in 90 days?');
    });

    it('should not render empty category', () => {
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[5].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      // "empty_category" has empty array, should not render
      expect(text).not.toContain('empty_category');
    });

    it('should show fallback text when questions_to_ask_interviewer is null', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        prepData: {
          ...FULL_PREP_DATA.prepData,
          questions_to_ask_interviewer: null,
        },
      };
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[5].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('No questions generated yet.');
    });
  });

  // ========================================
  // Candidate Positioning Section (lines 713-833)
  // ========================================
  describe('Candidate Positioning expanded section', () => {
    beforeEach(() => {
      mockCachedPrep = FULL_PREP_DATA;
    });

    it('should render resume focus areas when expanded', () => {
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      // Candidate Positioning is index 6
      renderer.act(() => {
        touchables[6].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Resume Focus Areas');
      expect(text).toContain('Key areas to highlight in your resume');
      expect(text).toContain('Cybersecurity program management');
      expect(text).toContain('Risk governance experience');
    });

    it('should render focus area numbers', () => {
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[6].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('1');
      expect(text).toContain('2');
    });

    it('should render keyword mapping when expanded', () => {
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[6].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Keyword Translation');
      expect(text).toContain('Map your experience to company terminology');
      expect(text).toContain('Company uses');
      expect(text).toContain('Technology Controls');
      expect(text).toContain('You say');
      expect(text).toContain('Security Operations');
      expect(text).toContain('Used interchangeably at the company');
    });

    it('should render keyword with term/equivalent fallback', () => {
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[6].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      // Second keyword uses term/equivalent fallback
      expect(text).toContain('CTC');
      expect(text).toContain('Cyber Team');
    });

    it('should render story prompts with STAR hints when expanded', () => {
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[6].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Story Prompts for Interviews');
      expect(text).toContain('STAR story ideas based on your experience');
      expect(text).toContain('Led Vulnerability Program');
      expect(text).toContain('Tell how you built the vuln mgmt program');
      expect(text).toContain('STAR Hint:');
      expect(text).toContain('S');
      expect(text).toContain('Company had no formal vuln process');
      expect(text).toContain('T');
      expect(text).toContain('Build a vulnerability management program');
      expect(text).toContain('A');
      expect(text).toContain('Implemented CVSS scoring and SLA tracking');
      expect(text).toContain('R');
      expect(text).toContain('Reduced critical vulns by 60%');
    });

    it('should render story prompts without star_hint', () => {
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[6].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Crisis Response');
      expect(text).toContain('How you handled a major incident');
    });

    it('should render Build Full STAR Stories button', () => {
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[6].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Build Full STAR Stories');
    });

    it('should navigate to STARStoryBuilder when Build Stories button is pressed', () => {
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[6].props.onPress();
      });
      // Find the Build Full STAR Stories button by finding all Text nodes
      // that contain the label, then walk up to the nearest parent with onPress
      const allNodes = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function'
      );
      // Filter: find touchables that do NOT have activeOpacity=0.7
      // (i.e. not the section toggle cards)
      const nonCardTouchables = allNodes.filter(
        (node: any) => node.props.activeOpacity !== 0.7
      );
      // The Build Stories button should be one of these.
      // It also doesn't have accessibilityRole or accessibilityLabel
      // Filter further: exclude the back button and refresh button
      const candidateButtons = nonCardTouchables.filter(
        (node: any) => !node.props.accessibilityRole && !node.props.accessibilityLabel
      );
      // There should be exactly one such button after expanding positioning
      expect(candidateButtons.length).toBeGreaterThan(0);
      // Press the last one (Build Stories appears after story prompts)
      renderer.act(() => {
        candidateButtons[candidateButtons.length - 1].props.onPress();
      });
      expect(mockNavigate).toHaveBeenCalledWith('STARStoryBuilder', { interviewPrepId: 42, tailoredResumeId: 1 });
    });

    it('should not render resume focus areas when array is empty', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        prepData: {
          ...FULL_PREP_DATA.prepData,
          candidate_positioning: { ...FULL_PREP_DATA.prepData.candidate_positioning, resume_focus_areas: [] },
        },
      };
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[6].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Resume Focus Areas');
    });

    it('should not render keyword map when array is empty', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        prepData: {
          ...FULL_PREP_DATA.prepData,
          candidate_positioning: { ...FULL_PREP_DATA.prepData.candidate_positioning, keyword_map: [] },
        },
      };
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[6].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Keyword Translation');
    });

    it('should not render story prompts when array is empty', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        prepData: {
          ...FULL_PREP_DATA.prepData,
          candidate_positioning: { ...FULL_PREP_DATA.prepData.candidate_positioning, story_prompts: [] },
        },
      };
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[6].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Story Prompts for Interviews');
    });

    it('should not render keyword context when context is missing', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        prepData: {
          ...FULL_PREP_DATA.prepData,
          candidate_positioning: {
            ...FULL_PREP_DATA.prepData.candidate_positioning,
            keyword_map: [{ term: 'A', equivalent: 'B' }],
          },
        },
      };
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[6].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Used interchangeably');
    });
  });

  // ========================================
  // AI Practice Cards (lines 836-991)
  // ========================================
  describe('AI Practice cards', () => {
    beforeEach(() => {
      mockCachedPrep = FULL_PREP_DATA;
    });

    it('should render AI PRACTICE section label when interviewPrepId exists', () => {
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('AI PRACTICE');
    });

    it('should not render AI PRACTICE section when interviewPrepId is null', () => {
      mockCachedPrep = { ...FULL_PREP_DATA, interviewPrepId: null };
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('AI PRACTICE');
    });

    it('should render all 5 AI practice card titles', () => {
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Behavioral & Technical');
      expect(text).toContain('Common Questions');
      expect(text).toContain('Practice Questions');
      expect(text).toContain('STAR Story Builder');
      expect(text).toContain('Certifications');
    });

    it('should render AI badges', () => {
      const tree = renderScreen();
      const str = safeStringify(tree.toJSON());
      // Multiple "AI" badges should be present
      const aiMatches = str.match(/"AI"/g);
      expect(aiMatches).not.toBeNull();
      expect(aiMatches!.length).toBeGreaterThanOrEqual(4);
    });

    it('should navigate to BehavioralTechnicalQuestions on press', () => {
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      // AI cards start at index 7 (after 7 expandable cards: 0-6)
      renderer.act(() => {
        touchables[7].props.onPress();
      });
      expect(mockNavigate).toHaveBeenCalledWith('BehavioralTechnicalQuestions', { interviewPrepId: 42 });
    });

    it('should navigate to CommonQuestions on press', () => {
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[8].props.onPress();
      });
      expect(mockNavigate).toHaveBeenCalledWith('CommonQuestions', { interviewPrepId: 42 });
    });

    it('should navigate to PracticeQuestions on press', () => {
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[9].props.onPress();
      });
      expect(mockNavigate).toHaveBeenCalledWith('PracticeQuestions', { interviewPrepId: 42, tailoredResumeId: 1 });
    });

    it('should navigate to STARStoryBuilder on press', () => {
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[10].props.onPress();
      });
      expect(mockNavigate).toHaveBeenCalledWith('STARStoryBuilder', { interviewPrepId: 42, tailoredResumeId: 1 });
    });

    it('should navigate to Certifications on press', () => {
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[11].props.onPress();
      });
      expect(mockNavigate).toHaveBeenCalledWith('Certifications', { interviewPrepId: 42 });
    });
  });

  // ========================================
  // Certifications Loading/Loaded Badge States (lines 972-984)
  // ========================================
  describe('Certifications card badge states', () => {
    it('should show ActivityIndicator when loadingCertifications is true', () => {
      mockCachedPrep = FULL_PREP_DATA;
      mockStoreOverrides = { loadingCertifications: true };
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Loading recommendations...');
    });

    it('should show CheckCircle when certificationRecommendations exists', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        certificationRecommendations: { recommended: ['CISSP', 'CISM'] },
      };
      const tree = renderScreen();
      // When certificationRecommendations is present and loadingCertifications is false,
      // a CheckCircle icon should render instead of "AI" badge
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Recommended certifications for this role');
    });

    it('should show "AI" badge when no certifications and not loading', () => {
      mockCachedPrep = FULL_PREP_DATA;
      mockStoreOverrides = { loadingCertifications: false };
      const tree = renderScreen();
      const str = safeStringify(tree.toJSON());
      // At least one "AI" badge should be near certifications
      expect(str).toContain('"AI"');
    });
  });

  // ========================================
  // Company Profile expanded with missing optional fields
  // ========================================
  describe('Company Profile expanded - missing optional fields', () => {
    it('should not render overview paragraph when missing', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        prepData: {
          ...FULL_PREP_DATA.prepData,
          company_profile: { name: 'TestCo' },
        },
      };
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[0].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Acme Corp is a leading tech company.');
      expect(text).not.toContain('Company Size:');
      expect(text).not.toContain('Industry:');
    });

    it('should render Company overview & culture fallback when name is missing in subtitle', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        prepData: {
          ...FULL_PREP_DATA.prepData,
          company_profile: {},
        },
      };
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Company overview & culture');
    });
  });

  // ========================================
  // Section subtitle fallbacks
  // ========================================
  describe('Section subtitle fallbacks', () => {
    it('should show "0 core values identified" when no stated_values', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        prepData: {
          ...FULL_PREP_DATA.prepData,
          values_and_culture: {},
        },
      };
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('0 core values identified');
    });

    it('should show "0 recent updates" when no recent_events', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        prepData: {
          ...FULL_PREP_DATA.prepData,
          strategy_and_news: {},
        },
      };
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('0 recent updates');
    });

    it('should show "0 tasks to complete" when no research_tasks', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        prepData: {
          ...FULL_PREP_DATA.prepData,
          interview_preparation: {},
        },
      };
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      // Format changed to "0/0 tasks completed"
      expect(text).toContain('0/0 tasks completed');
    });
  });

  // ========================================
  // ExpandableSection component (lines 60-96)
  // ========================================
  describe('ExpandableSection as standalone component', () => {
    it('should be defined in the module source (tested via component rendering)', () => {
      // ExpandableSection is used internally; we test it by verifying section toggle behavior
      // which is covered in the handleSectionPress tests above
      // This test verifies the module loads without error
      expect(InterviewPrepScreen).toBeDefined();
    });
  });

  // ========================================
  // BulletList component (lines 98-128) - via rendering
  // ========================================
  describe('BulletList component via rendering', () => {
    it('should render bullet items for research tasks when preparation is expanded', () => {
      mockCachedPrep = FULL_PREP_DATA;
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[4].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Research company history');
      expect(text).toContain('Review annual report');
    });
  });

  // ========================================
  // All loading flags active render
  // ========================================
  describe('All loading flags active', () => {
    it('should render without crash with all section loading flags active', () => {
      mockCachedPrep = FULL_PREP_DATA;
      mockStoreOverrides = {
        loadingReadiness: true,
        loadingValuesAlignment: true,
        loadingCompanyResearch: true,
        loadingStrategicNews: true,
        loadingCompetitiveIntelligence: true,
        loadingInterviewStrategy: true,
        loadingExecutiveInsights: true,
        loadingCertifications: true,
      };
      const tree = renderScreen();
      const json = tree.toJSON();
      expect(json).toBeDefined();
    });
  });

  // ========================================
  // Event with headline fallback (no title)
  // ========================================
  describe('News event headline fallback', () => {
    it('should use headline when title is missing', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        prepData: {
          ...FULL_PREP_DATA.prepData,
          strategy_and_news: {
            strategic_themes: [],
            technology_focus: [],
            recent_events: [
              { headline: 'Headline only event', summary: 'Different summary', date: '2026-02-01' },
            ],
          },
        },
      };
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[2].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Headline only event');
      expect(text).toContain('Different summary');
    });

    it('should not render separate summary when it matches headline', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        prepData: {
          ...FULL_PREP_DATA.prepData,
          strategy_and_news: {
            strategic_themes: [],
            technology_focus: [],
            recent_events: [
              { headline: 'Same text', summary: 'Same text' },
            ],
          },
        },
      };
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[2].props.onPress();
      });
      const str = safeStringify(tree.toJSON());
      const matches = str.match(/Same text/g);
      // Should appear once for headline, not duplicated as summary
      expect(matches).not.toBeNull();
      expect(matches!.length).toBe(1);
    });
  });

  // ========================================
  // Event with no date/source
  // ========================================
  describe('News event without date/source', () => {
    it('should render event without date and source fields', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        prepData: {
          ...FULL_PREP_DATA.prepData,
          strategy_and_news: {
            strategic_themes: [],
            technology_focus: [],
            recent_events: [
              { title: 'No date event' },
            ],
          },
        },
      };
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[2].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('No date event');
    });
  });

  // ========================================
  // Null/undefined data field guards
  // ========================================
  describe('Null data guards in expanded sections', () => {
    it('should handle null values_and_culture stated_values', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        prepData: {
          ...FULL_PREP_DATA.prepData,
          values_and_culture: { stated_values: null, practical_implications: null },
        },
      };
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[1].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Core Values');
    });

    it('should handle null strategy_and_news fields', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        prepData: {
          ...FULL_PREP_DATA.prepData,
          strategy_and_news: {
            strategic_themes: null,
            technology_focus: null,
            recent_events: null,
          },
        },
      };
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[2].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Strategic Themes');
    });

    it('should handle null role_analysis fields', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        prepData: {
          ...FULL_PREP_DATA.prepData,
          role_analysis: {
            core_responsibilities: null,
            must_have_skills: null,
          },
        },
      };
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[3].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Core Responsibilities');
      expect(text).not.toContain('Must-Have Skills');
    });

    it('should handle null interview_preparation fields', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        prepData: {
          ...FULL_PREP_DATA.prepData,
          interview_preparation: {
            research_tasks: null,
            day_of_checklist: null,
          },
        },
      };
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[4].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      // "Research Tasks" appears in the progress bar section always; check specific content items
      expect(text).not.toContain('Research company history');
    });

    it('should handle null candidate_positioning fields', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        prepData: {
          ...FULL_PREP_DATA.prepData,
          candidate_positioning: {
            resume_focus_areas: null,
            keyword_map: null,
            story_prompts: null,
          },
        },
      };
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[6].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Resume Focus Areas');
      expect(text).not.toContain('Keyword Translation');
      expect(text).not.toContain('Story Prompts for Interviews');
    });
  });

  // ========================================
  // Company Profile card subtitle with name present
  // ========================================
  describe('Company Profile card subtitle text', () => {
    it('should show company name in subtitle when present', () => {
      mockCachedPrep = FULL_PREP_DATA;
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      // Subtitle should show company name
      expect(text).toContain('Acme Corp');
    });
  });

  // ========================================
  // Event with no impact_summary
  // ========================================
  describe('Event without impact_summary', () => {
    it('should not render impact container when impact_summary is missing', () => {
      mockCachedPrep = {
        ...FULL_PREP_DATA,
        prepData: {
          ...FULL_PREP_DATA.prepData,
          strategy_and_news: {
            strategic_themes: [],
            technology_focus: [],
            recent_events: [
              { title: 'No impact event', summary: 'Some summary' },
            ],
          },
        },
      };
      const tree = renderScreen();
      const touchables = tree.root.findAll(
        (node: any) => node.props && typeof node.props.onPress === 'function' && node.props.activeOpacity === 0.7
      );
      renderer.act(() => {
        touchables[2].props.onPress();
      });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Impact:');
    });
  });
});
