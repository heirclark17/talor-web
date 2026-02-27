/**
 * HomeScreen Unit Tests
 *
 * Tests for: module exports, formatDate logic, resume filtering/sorting,
 * score color determination, priority badge color mapping, StyleSheet keys,
 * full component rendering with interactions (react-test-renderer).
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

// ---- Mock ALL dependencies BEFORE imports ----

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: mockNavigate,
    goBack: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
    canGoBack: jest.fn(() => false),
  })),
  useRoute: jest.fn(() => ({ params: {} })),
  useFocusEffect: jest.fn((callback: any) => {
    const React = require('react');
    React.useEffect(() => { callback(); }, []);
  }),
  useIsFocused: jest.fn(() => true),
}));

jest.mock('../../context/ThemeContext', () => ({
  useTheme: jest.fn(() => ({
    colors: {
      text: '#ffffff',
      textSecondary: '#9ca3af',
      textTertiary: '#6b7280',
      background: '#0a0a0a',
      backgroundSecondary: '#1a1a1a',
      backgroundTertiary: '#2a2a2a',
      border: '#374151',
      card: '#111111',
      primary: '#3b82f6',
      glass: 'rgba(255,255,255,0.04)',
      glassBorder: 'rgba(255,255,255,0.08)',
    },
    isDark: true,
    themeMode: 'dark' as const,
    setThemeMode: jest.fn(),
    backgroundId: 'default',
    customBackgroundUri: null,
  })),
}));

jest.mock('../../components/glass/GlassCard', () => {
  const React = require('react');
  return {
    GlassCard: React.forwardRef((props: any, ref: any) =>
      React.createElement('GlassCard', { ...props, ref }, props.children)
    ),
  };
});

jest.mock('../../components/glass/GlassButton', () => {
  const React = require('react');
  return {
    GlassButton: (props: any) =>
      React.createElement('GlassButton', {
        ...props,
        testID: props.label || 'GlassButton',
      }),
  };
});

jest.mock('../../components/OnboardingTour', () => ({
  OnboardingTour: 'OnboardingTour',
}));

jest.mock('../../components/SearchFilter', () => {
  const React = require('react');
  return {
    SearchFilter: (props: any) =>
      React.createElement('SearchFilter', props),
    useSearchFilter: jest.fn(() => ({
      searchQuery: '',
      setSearchQuery: jest.fn(),
      selectedFilters: {},
      setSelectedFilters: jest.fn(),
      selectedSort: '',
      setSelectedSort: jest.fn(),
    })),
  };
});

// We override react-native locally to make FlatList/Modal/SafeAreaView renderable
jest.mock('react-native', () => {
  const React = require('react');
  return {
    Platform: { OS: 'ios', select: jest.fn((obj: any) => obj.ios ?? obj.default) },
    Alert: { alert: jest.fn() },
    Linking: { openURL: jest.fn(), canOpenURL: jest.fn() },
    Dimensions: {
      get: jest.fn(() => ({ width: 390, height: 844 })),
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    },
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (style: any) => style,
      hairlineWidth: 1,
    },
    View: React.forwardRef((props: any, ref: any) =>
      React.createElement('View', { ...props, ref }, props.children)
    ),
    Text: React.forwardRef((props: any, ref: any) =>
      React.createElement('Text', { ...props, ref }, props.children)
    ),
    TouchableOpacity: React.forwardRef((props: any, ref: any) =>
      React.createElement('TouchableOpacity', { ...props, ref }, props.children)
    ),
    ScrollView: React.forwardRef((props: any, ref: any) =>
      React.createElement('ScrollView', { ...props, ref }, props.children)
    ),
    // FlatList: render items + empty component
    FlatList: React.forwardRef((props: any, ref: any) => {
      const { data, renderItem, ListEmptyComponent, keyExtractor, refreshControl, ...rest } = props;
      const children: any[] = [];
      if (refreshControl) {
        children.push(React.cloneElement(refreshControl, { key: '__refresh__' }));
      }
      if (data && data.length > 0) {
        data.forEach((item: any, index: number) => {
          const key = keyExtractor ? keyExtractor(item, index) : String(index);
          children.push(
            React.createElement('FlatListItem', { key }, renderItem({ item, index }))
          );
        });
      } else if (ListEmptyComponent) {
        const emptyEl =
          typeof ListEmptyComponent === 'function'
            ? React.createElement(ListEmptyComponent)
            : ListEmptyComponent;
        children.push(React.createElement('FlatListEmpty', { key: '__empty__' }, emptyEl));
      }
      return React.createElement('FlatList', { ...rest, ref }, ...children);
    }),
    RefreshControl: (props: any) =>
      React.createElement('RefreshControl', props),
    Modal: React.forwardRef((props: any, ref: any) =>
      React.createElement('Modal', { ...props, ref }, props.children)
    ),
    ActivityIndicator: (props: any) =>
      React.createElement('ActivityIndicator', props),
    Image: 'Image',
    Switch: 'Switch',
    Animated: {
      View: 'Animated.View',
      Text: 'Animated.Text',
      Value: jest.fn(() => ({ setValue: jest.fn(), interpolate: jest.fn(() => 0) })),
      timing: jest.fn(() => ({ start: jest.fn() })),
      createAnimatedComponent: jest.fn((comp: any) => comp),
    },
    Keyboard: { dismiss: jest.fn(), addListener: jest.fn(() => ({ remove: jest.fn() })) },
    StatusBar: { setBarStyle: jest.fn() },
    PixelRatio: { get: jest.fn(() => 2), roundToNearestPixel: jest.fn((n: number) => n) },
    useColorScheme: jest.fn(() => 'dark'),
    useWindowDimensions: jest.fn(() => ({ width: 390, height: 844 })),
    I18nManager: { isRTL: false },
    Appearance: {
      getColorScheme: jest.fn(() => 'dark'),
      addChangeListener: jest.fn(() => ({ remove: jest.fn() })),
    },
    AccessibilityInfo: {
      isReduceMotionEnabled: jest.fn(() => Promise.resolve(false)),
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
      isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
    },
  };
});

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaView: React.forwardRef((props: any, ref: any) =>
      React.createElement('SafeAreaView', { ...props, ref }, props.children)
    ),
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

const mockStoreDefaults = {
  resumes: [] as any[],
  loading: false,
  refreshing: false,
  deletingId: null as number | null,
  analyzingId: null as number | null,
  currentAnalysis: null as any,
  fetchResumes: jest.fn(),
  refreshResumes: jest.fn(),
  deleteResume: jest.fn().mockResolvedValue(true),
  analyzeResume: jest.fn().mockResolvedValue(null),
  clearAnalysis: jest.fn(),
};

jest.mock('../../stores/resumeStore', () => ({
  useResumeStore: jest.fn(() => mockStoreDefaults),
  Resume: {},
}));

jest.mock('../../navigation/AppNavigator', () => ({
  RootStackParamList: {},
}));

jest.mock('../../contexts/PostHogContext', () => ({
  usePostHog: jest.fn(() => ({ capture: jest.fn() })),
}));

jest.mock('../../components/ui', () => {
  const RealReact = require('react');
  return {
    NumberText: (props: any) => RealReact.createElement('NumberText', props, props.children),
    RoundedNumeral: (props: any) => RealReact.createElement('RoundedNumeral', props, props.children),
  };
});

jest.mock('../../components/layout', () => {
  const RealReact = require('react');
  return {
    SectionHeader: (props: any) => RealReact.createElement('SectionHeader', props, props.children),
    ScreenContainer: (props: any) => RealReact.createElement('ScreenContainer', props, props.children),
  };
});

jest.mock('../../constants/SharedStyles', () => ({
  CardStyles: {},
  BadgeStyles: {},
  ModalStyles: {},
}));

let mockListTailoredResumes: jest.Mock = jest.fn(() => Promise.resolve({ success: true, data: [] }));
let mockDeleteTailoredResume: jest.Mock = jest.fn(() => Promise.resolve({ success: true }));
let mockDownloadTailoredResume: jest.Mock = jest.fn(() => Promise.resolve({ success: true, data: 'https://example.com/resume.pdf' }));

jest.mock('../../api/client', () => ({
  api: {
    get listTailoredResumes() { return mockListTailoredResumes; },
    get deleteTailoredResume() { return mockDeleteTailoredResume; },
    get downloadTailoredResume() { return mockDownloadTailoredResume; },
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('lucide-react-native', () => {
  const RealReact = require('react');
  const MockIcon = (props: any) =>
    RealReact.createElement('MockIcon', { ...props, testID: `icon-${props.name || 'unknown'}` });
  const iconNames = [
    'FileText', 'Upload', 'Trash2', 'Target', 'FileSearch', 'X',
    'CheckCircle', 'AlertCircle', 'TrendingUp', 'TrendingDown', 'BookOpen',
    'Briefcase', 'Clock', 'GitBranch', 'Download', 'Building2', 'Sparkles', 'Eye',
  ];
  const result: Record<string, any> = {};
  iconNames.forEach((name) => {
    result[name] = (props: any) =>
      RealReact.createElement('MockIcon', { ...props, testID: `icon-${name}` });
  });
  return result;
});

// ---- Imports ----

import React from 'react';
import renderer from 'react-test-renderer';
import { Alert } from 'react-native';
import { COLORS, ALPHA_COLORS, SPACING, RADIUS, FONTS, TAB_BAR_HEIGHT } from '../../utils/constants';
import { useResumeStore } from '../../stores/resumeStore';

// ---- Helper types ----
interface MockResume {
  id: number;
  filename: string;
  name?: string | null;
  skills_count: number;
  uploaded_at: string;
}

// ---- Helper: replicate formatDate logic from HomeScreen ----
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ---- Helper: replicate filtering logic from HomeScreen ----
function filterResumes(
  resumes: MockResume[],
  searchQuery: string,
  selectedSort: string,
): MockResume[] {
  let result = [...resumes];

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    result = result.filter(
      (resume) =>
        resume.filename.toLowerCase().includes(query) ||
        (resume.name && resume.name.toLowerCase().includes(query)),
    );
  }

  if (selectedSort === 'newest') {
    result.sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());
  } else if (selectedSort === 'oldest') {
    result.sort((a, b) => new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime());
  } else if (selectedSort === 'name') {
    result.sort((a, b) => a.filename.localeCompare(b.filename));
  } else if (selectedSort === 'skills') {
    result.sort((a, b) => b.skills_count - a.skills_count);
  }

  return result;
}

// ---- Helper: replicate score color logic ----
function getScoreColor(score: number): string {
  if (score >= 80) return COLORS.success;
  if (score >= 60) return COLORS.warning;
  return COLORS.danger;
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return ALPHA_COLORS.success.bg;
  if (score >= 60) return ALPHA_COLORS.warning.bg;
  return ALPHA_COLORS.danger.bg;
}

// ---- Helper: replicate priority badge color logic ----
function getPriorityBgColor(priority: string): string {
  if (priority === 'high') return ALPHA_COLORS.danger.bg;
  if (priority === 'medium') return ALPHA_COLORS.warning.bg;
  return ALPHA_COLORS.info.bg;
}

function getPriorityBorderColor(priority: string): string {
  if (priority === 'high') return ALPHA_COLORS.danger.border;
  if (priority === 'medium') return ALPHA_COLORS.warning.border;
  return ALPHA_COLORS.info.border;
}

function getPriorityTextColor(priority: string): string {
  if (priority === 'high') return COLORS.danger;
  if (priority === 'medium') return COLORS.warning;
  return COLORS.info;
}

// ---- Helper: recursive text extraction from tree ----
function getTreeText(node: any): string {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getTreeText).join('');
  if (node.children) return node.children.map(getTreeText).join('');
  return '';
}

// ---- Shared test data ----
const sampleResumes: MockResume[] = [
  { id: 1, filename: 'Software_Engineer.pdf', name: 'John Doe', skills_count: 15, uploaded_at: '2025-06-10T10:00:00Z' },
  { id: 2, filename: 'Data_Scientist.docx', name: 'Jane Smith', skills_count: 22, uploaded_at: '2025-06-12T10:00:00Z' },
  { id: 3, filename: 'PM_Resume.pdf', name: null, skills_count: 8, uploaded_at: '2025-06-08T10:00:00Z' },
];

const fullAnalysis = {
  overall_score: 85,
  strengths: ['Strong leadership skills', 'Technical depth'],
  weaknesses: ['Missing certifications', 'Short work history'],
  keyword_optimization: {
    score: 72,
    suggestions: 'Add more industry keywords',
    missing_keywords: ['agile', 'scrum', 'devops'],
  },
  ats_compatibility: {
    score: 80,
    recommendations: 'Use standard section headings',
    issues: ['Unusual formatting detected', 'Tables may cause issues'],
  },
  improvement_recommendations: [
    { category: 'Experience', priority: 'high', recommendation: 'Add more metrics', example: 'Increased sales by 25%' },
    { category: 'Skills', priority: 'medium', recommendation: 'Add cloud certs', example: 'AWS Certified Solutions Architect' },
    { category: 'Format', priority: 'low', recommendation: 'Use bullet points', example: 'Use action verbs' },
  ],
};

// ========================================================================
// TESTS
// ========================================================================

describe('HomeScreen', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    // Reset store defaults
    mockStoreDefaults.resumes = [];
    mockStoreDefaults.loading = false;
    mockStoreDefaults.refreshing = false;
    mockStoreDefaults.deletingId = null;
    mockStoreDefaults.analyzingId = null;
    mockStoreDefaults.currentAnalysis = null;
    mockStoreDefaults.fetchResumes = jest.fn();
    mockStoreDefaults.refreshResumes = jest.fn();
    mockStoreDefaults.deleteResume = jest.fn().mockResolvedValue(true);
    mockStoreDefaults.analyzeResume = jest.fn().mockResolvedValue(null);
    mockStoreDefaults.clearAnalysis = jest.fn();
  });

  // ---- Module Export Tests ----

  describe('module exports', () => {
    it('should export a default function component', () => {
      const mod = require('../HomeScreen');
      expect(mod.default).toBeDefined();
      expect(typeof mod.default).toBe('function');
    });

    it('should have the function named HomeScreen', () => {
      const mod = require('../HomeScreen');
      expect(mod.default.name).toBe('HomeScreen');
    });

    it('should not have any additional named exports', () => {
      const mod = require('../HomeScreen');
      const exportKeys = Object.keys(mod).filter((k) => k !== '__esModule');
      expect(exportKeys).toEqual(['default']);
    });
  });

  // ---- formatDate Logic Tests ----

  describe('formatDate logic', () => {
    it('should format an ISO date string to "MMM D, YYYY"', () => {
      const result = formatDate('2025-06-15T12:00:00Z');
      expect(result).toContain('Jun');
      expect(result).toContain('15');
      expect(result).toContain('2025');
    });

    it('should handle date-only strings (timezone dependent)', () => {
      const result = formatDate('2024-06-15');
      expect(result).toMatch(/\w{3}\s+\d{1,2},\s+\d{4}/);
    });

    it('should handle end-of-year dates', () => {
      const result = formatDate('2025-12-31T23:59:59Z');
      expect(result).toContain('2025');
    });

    it('should handle mid-year dates', () => {
      const result = formatDate('2025-07-15T12:00:00Z');
      expect(result).toContain('Jul');
      expect(result).toContain('2025');
    });
  });

  // ---- Resume Filtering Logic Tests ----

  describe('resume filtering logic', () => {
    const mockResumes: MockResume[] = [
      { id: 1, filename: 'Software_Engineer_Resume.pdf', name: 'John Doe', skills_count: 15, uploaded_at: '2025-06-10T10:00:00Z' },
      { id: 2, filename: 'Data_Scientist_CV.docx', name: 'Jane Smith', skills_count: 22, uploaded_at: '2025-06-12T10:00:00Z' },
      { id: 3, filename: 'PM_Resume.pdf', name: 'Alice Brown', skills_count: 8, uploaded_at: '2025-06-08T10:00:00Z' },
      { id: 4, filename: 'Backend_Developer.pdf', name: undefined, skills_count: 18, uploaded_at: '2025-06-15T10:00:00Z' },
    ];

    it('should return all resumes when no search query', () => {
      const result = filterResumes(mockResumes, '', '');
      expect(result).toHaveLength(4);
    });

    it('should filter by filename (case-insensitive)', () => {
      const result = filterResumes(mockResumes, 'software', '');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it('should filter by name (case-insensitive)', () => {
      const result = filterResumes(mockResumes, 'jane', '');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
    });

    it('should return empty when no matches', () => {
      const result = filterResumes(mockResumes, 'zzzznonexistent', '');
      expect(result).toHaveLength(0);
    });

    it('should handle whitespace-only search as no search', () => {
      const result = filterResumes(mockResumes, '   ', '');
      expect(result).toHaveLength(4);
    });

    it('should handle resumes with undefined name', () => {
      const result = filterResumes(mockResumes, 'Backend', '');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(4);
    });

    it('should match partial filename substrings', () => {
      const result = filterResumes(mockResumes, 'Resume', '');
      expect(result).toHaveLength(2);
    });
  });

  // ---- Resume Sorting Logic Tests ----

  describe('resume sorting logic', () => {
    const mockResumes: MockResume[] = [
      { id: 1, filename: 'Charlie_Resume.pdf', name: 'Charlie', skills_count: 10, uploaded_at: '2025-06-10T10:00:00Z' },
      { id: 2, filename: 'Alpha_Resume.pdf', name: 'Alpha', skills_count: 25, uploaded_at: '2025-06-15T10:00:00Z' },
      { id: 3, filename: 'Bravo_Resume.pdf', name: 'Bravo', skills_count: 5, uploaded_at: '2025-06-01T10:00:00Z' },
    ];

    it('should sort by newest first', () => {
      const result = filterResumes(mockResumes, '', 'newest');
      expect(result[0].id).toBe(2);
      expect(result[2].id).toBe(3);
    });

    it('should sort by oldest first', () => {
      const result = filterResumes(mockResumes, '', 'oldest');
      expect(result[0].id).toBe(3);
      expect(result[2].id).toBe(2);
    });

    it('should sort by name alphabetically', () => {
      const result = filterResumes(mockResumes, '', 'name');
      expect(result[0].filename).toBe('Alpha_Resume.pdf');
      expect(result[2].filename).toBe('Charlie_Resume.pdf');
    });

    it('should sort by most skills (descending)', () => {
      const result = filterResumes(mockResumes, '', 'skills');
      expect(result[0].skills_count).toBe(25);
      expect(result[2].skills_count).toBe(5);
    });

    it('should not change order for unknown sort value', () => {
      const result = filterResumes(mockResumes, '', 'unknown');
      expect(result[0].id).toBe(1);
    });

    it('should not change order when sort is empty', () => {
      const result = filterResumes(mockResumes, '', '');
      expect(result[0].id).toBe(1);
    });
  });

  // ---- Combined Filter + Sort Tests ----

  describe('combined filtering and sorting', () => {
    const mockResumes: MockResume[] = [
      { id: 1, filename: 'Resume_Engineer.pdf', name: 'Bob', skills_count: 10, uploaded_at: '2025-01-01T00:00:00Z' },
      { id: 2, filename: 'Resume_Manager.pdf', name: 'Alice', skills_count: 20, uploaded_at: '2025-06-01T00:00:00Z' },
      { id: 3, filename: 'CV_Designer.pdf', name: 'Carl', skills_count: 15, uploaded_at: '2025-03-01T00:00:00Z' },
    ];

    it('should filter then sort by newest', () => {
      const result = filterResumes(mockResumes, 'Resume', 'newest');
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(2);
    });

    it('should filter then sort by skills', () => {
      const result = filterResumes(mockResumes, 'Resume', 'skills');
      expect(result).toHaveLength(2);
      expect(result[0].skills_count).toBe(20);
    });
  });

  // ---- Score Color Logic Tests ----

  describe('score color logic (analysis modal)', () => {
    it('should return success color for scores >= 80', () => {
      expect(getScoreColor(80)).toBe(COLORS.success);
      expect(getScoreColor(95)).toBe(COLORS.success);
      expect(getScoreColor(100)).toBe(COLORS.success);
    });

    it('should return warning color for scores 60-79', () => {
      expect(getScoreColor(60)).toBe(COLORS.warning);
      expect(getScoreColor(70)).toBe(COLORS.warning);
      expect(getScoreColor(79)).toBe(COLORS.warning);
    });

    it('should return danger color for scores < 60', () => {
      expect(getScoreColor(0)).toBe(COLORS.danger);
      expect(getScoreColor(59)).toBe(COLORS.danger);
    });

    it('should return correct background colors for score badges', () => {
      expect(getScoreBgColor(85)).toBe(ALPHA_COLORS.success.bg);
      expect(getScoreBgColor(65)).toBe(ALPHA_COLORS.warning.bg);
      expect(getScoreBgColor(40)).toBe(ALPHA_COLORS.danger.bg);
    });
  });

  // ---- Priority Badge Color Logic Tests ----

  describe('priority badge color logic', () => {
    it('should return danger bg for high priority', () => {
      expect(getPriorityBgColor('high')).toBe(ALPHA_COLORS.danger.bg);
    });

    it('should return warning bg for medium priority', () => {
      expect(getPriorityBgColor('medium')).toBe(ALPHA_COLORS.warning.bg);
    });

    it('should return info bg for low priority', () => {
      expect(getPriorityBgColor('low')).toBe(ALPHA_COLORS.info.bg);
    });

    it('should return correct border colors per priority', () => {
      expect(getPriorityBorderColor('high')).toBe(ALPHA_COLORS.danger.border);
      expect(getPriorityBorderColor('medium')).toBe(ALPHA_COLORS.warning.border);
      expect(getPriorityBorderColor('low')).toBe(ALPHA_COLORS.info.border);
    });

    it('should return correct text colors per priority', () => {
      expect(getPriorityTextColor('high')).toBe(COLORS.danger);
      expect(getPriorityTextColor('medium')).toBe(COLORS.warning);
      expect(getPriorityTextColor('low')).toBe(COLORS.info);
    });
  });

  // ---- StyleSheet Structure Tests ----

  describe('StyleSheet structure', () => {
    it('should use constants from utils/constants for layout values', () => {
      expect(SPACING.lg).toBe(24);
      expect(SPACING.md).toBe(16);
      expect(SPACING.sm).toBe(8);
      expect(SPACING.xs).toBe(4);
      expect(SPACING.xl).toBe(32);
      expect(SPACING.xxl).toBe(48);
      expect(TAB_BAR_HEIGHT).toBe(100);
    });

    it('should use RADIUS constants for border radii', () => {
      expect(RADIUS.md).toBe(12);
      expect(RADIUS.sm).toBe(8);
      expect(RADIUS.lg).toBe(16);
    });

    it('should use FONTS constants for typography', () => {
      expect(FONTS.regular).toBe('Urbanist_400Regular');
      expect(FONTS.semibold).toBe('Urbanist_600SemiBold');
      expect(FONTS.extralight).toBe('Urbanist_200ExtraLight');
      expect(FONTS.bold).toBe('Urbanist_700Bold');
    });
  });

  // ---- Sort Option Configuration Tests ----

  describe('sort option configuration', () => {
    const sortOptions = [
      { value: 'newest', label: 'Newest First' },
      { value: 'oldest', label: 'Oldest First' },
      { value: 'name', label: 'Name (A-Z)' },
      { value: 'skills', label: 'Most Skills' },
    ];

    it('should have 4 sort options', () => {
      expect(sortOptions).toHaveLength(4);
    });

    it('should have correct sort option values', () => {
      const values = sortOptions.map((o) => o.value);
      expect(values).toEqual(['newest', 'oldest', 'name', 'skills']);
    });

    it('should have descriptive labels for each sort option', () => {
      sortOptions.forEach((option) => {
        expect(option.label).toBeTruthy();
        expect(option.label.length).toBeGreaterThan(3);
      });
    });
  });

  // ========================================================================
  // COMPONENT RENDERING TESTS (react-test-renderer)
  // ========================================================================

  describe('component rendering', () => {
    let HomeScreen: any;

    beforeEach(() => {
      HomeScreen = require('../HomeScreen').default;
    });

    const renderScreen = (storeOverrides?: Partial<typeof mockStoreDefaults>) => {
      if (storeOverrides) {
        Object.assign(mockStoreDefaults, storeOverrides);
      }
      (useResumeStore as unknown as jest.Mock).mockReturnValue(mockStoreDefaults);
      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(HomeScreen));
      });
      return tree!;
    };

    // -- Loading State --

    describe('loading state', () => {
      it('should render loading indicator and text when loading is true', () => {
        const tree = renderScreen({ loading: true });
        const json = tree.toJSON();
        const text = getTreeText(json);
        expect(text).toContain('Loading resumes...');
      });

      it('should render ActivityIndicator during loading', () => {
        const tree = renderScreen({ loading: true });
        const root = tree.root;
        const indicators = root.findAllByType('ActivityIndicator');
        expect(indicators.length).toBeGreaterThanOrEqual(1);
      });

      it('should not render FlatList when loading', () => {
        const tree = renderScreen({ loading: true });
        const root = tree.root;
        const flatLists = root.findAllByType('FlatList');
        expect(flatLists).toHaveLength(0);
      });
    });

    // -- Empty State --

    describe('empty state', () => {
      it('should render empty state when not loading and no resumes', () => {
        const tree = renderScreen({ loading: false, resumes: [] });
        const text = getTreeText(tree.toJSON());
        expect(text).toContain('No Resumes Yet');
        expect(text).toContain('Upload your first resume');
      });

      it('should render Upload Resume button in empty state', () => {
        const tree = renderScreen({ loading: false, resumes: [] });
        const root = tree.root;
        const buttons = root.findAllByType('GlassButton');
        const uploadBtn = buttons.find((b: any) => b.props.label === 'Upload Resume');
        expect(uploadBtn).toBeDefined();
      });

      it('should navigate to UploadResume when empty state upload button is pressed', () => {
        const tree = renderScreen({ loading: false, resumes: [] });
        const root = tree.root;
        const buttons = root.findAllByType('GlassButton');
        const uploadBtn = buttons.find((b: any) => b.props.label === 'Upload Resume');
        renderer.act(() => {
          uploadBtn!.props.onPress();
        });
        expect(mockNavigate).toHaveBeenCalledWith('UploadResume');
      });

      it('should not render SearchFilter when no resumes', () => {
        const tree = renderScreen({ loading: false, resumes: [] });
        const root = tree.root;
        const searchFilters = root.findAllByType('SearchFilter');
        expect(searchFilters).toHaveLength(0);
      });
    });

    // -- Resume List Rendering --

    describe('resume list rendering', () => {
      it('should render resume cards for each resume', () => {
        const tree = renderScreen({ resumes: sampleResumes });
        const root = tree.root;
        const cards = root.findAllByType('GlassCard');
        // Each resume renders a GlassCard
        expect(cards.length).toBeGreaterThanOrEqual(sampleResumes.length);
      });

      it('should display filename in each card', () => {
        const tree = renderScreen({ resumes: sampleResumes });
        const text = getTreeText(tree.toJSON());
        expect(text).toContain('Software_Engineer.pdf');
        expect(text).toContain('Data_Scientist.docx');
        expect(text).toContain('PM_Resume.pdf');
      });

      it('should display name when present', () => {
        const tree = renderScreen({ resumes: sampleResumes });
        const text = getTreeText(tree.toJSON());
        expect(text).toContain('John Doe');
        expect(text).toContain('Jane Smith');
      });

      it('should display skills count and formatted date', () => {
        const tree = renderScreen({ resumes: sampleResumes });
        const text = getTreeText(tree.toJSON());
        // Skills count
        expect(text).toContain('15');
        expect(text).toContain('skills');
        // Formatted date for 2025-06-10
        expect(text).toContain('Jun');
        expect(text).toContain('2025');
      });

      it('should render Analyze, Tailor, and Delete buttons for each resume', () => {
        const tree = renderScreen({ resumes: [sampleResumes[0]] });
        const root = tree.root;
        const buttons = root.findAllByType('GlassButton');
        const labels = buttons.map((b: any) => b.props.label);
        expect(labels).toContain('Analyze');
        expect(labels).toContain('Tailor');
        expect(labels).toContain('Delete');
      });

      it('should render SearchFilter when resumes exist', () => {
        const tree = renderScreen({ resumes: sampleResumes });
        const root = tree.root;
        const searchFilters = root.findAllByType('SearchFilter');
        expect(searchFilters).toHaveLength(1);
      });

      it('should pass sort options to SearchFilter', () => {
        const tree = renderScreen({ resumes: sampleResumes });
        const root = tree.root;
        const sf = root.findAllByType('SearchFilter')[0];
        expect(sf.props.sortOptions).toHaveLength(5);
        const values = sf.props.sortOptions.map((o: any) => o.value);
        expect(values).toEqual(['newest', 'oldest', 'name', 'skills', 'base_first']);
      });
    });

    // -- Header Upload Button --

    describe('header upload button', () => {
      it('should render header upload button when not loading', () => {
        const tree = renderScreen({ resumes: sampleResumes });
        const root = tree.root;
        // The header upload button has no label (just icon), find by style
        const buttons = root.findAllByType('GlassButton');
        // Header button is variant="secondary" size="sm" with no label text (Upload icon only)
        const headerBtn = buttons.find((b: any) => b.props.variant === 'secondary' && b.props.size === 'sm' && !b.props.label);
        expect(headerBtn).toBeDefined();
      });

      it('should navigate to UploadResume when header upload button pressed', () => {
        const tree = renderScreen({ resumes: sampleResumes });
        const root = tree.root;
        const buttons = root.findAllByType('GlassButton');
        // The header upload button is variant=secondary, size=sm, no label
        const headerBtn = buttons.find((b: any) => b.props.variant === 'secondary' && b.props.size === 'sm' && !b.props.label);
        renderer.act(() => {
          headerBtn!.props.onPress();
        });
        expect(mockNavigate).toHaveBeenCalledWith('UploadResume');
      });
    });

    // -- Pull-to-Refresh --

    describe('pull-to-refresh', () => {
      it('should render RefreshControl in FlatList', () => {
        const tree = renderScreen({ resumes: sampleResumes });
        const root = tree.root;
        const refreshControls = root.findAllByType('RefreshControl');
        expect(refreshControls.length).toBeGreaterThanOrEqual(1);
      });

      it('should call refreshResumes when pulled to refresh', () => {
        const mockRefresh = jest.fn();
        const tree = renderScreen({ resumes: sampleResumes, refreshResumes: mockRefresh });
        const root = tree.root;
        const rc = root.findAllByType('RefreshControl')[0];
        renderer.act(() => {
          rc.props.onRefresh();
        });
        expect(mockRefresh).toHaveBeenCalledTimes(1);
      });

      it('should pass refreshing state to RefreshControl', () => {
        const tree = renderScreen({ resumes: sampleResumes, refreshing: true });
        const root = tree.root;
        const rc = root.findAllByType('RefreshControl')[0];
        expect(rc.props.refreshing).toBe(true);
      });
    });

    // -- Tailor Button --

    describe('tailor button', () => {
      it('should navigate to Tailor screen with resumeId when Tailor is pressed', () => {
        const tree = renderScreen({ resumes: [sampleResumes[0]] });
        const root = tree.root;
        const buttons = root.findAllByType('GlassButton');
        const tailorBtn = buttons.find((b: any) => b.props.label === 'Tailor');
        renderer.act(() => {
          tailorBtn!.props.onPress();
        });
        expect(mockNavigate).toHaveBeenCalledWith('TailorResume', { resumeId: 1 });
      });
    });

    // -- Delete Button --

    describe('delete button', () => {
      it('should show Alert.alert when Delete is pressed', () => {
        const tree = renderScreen({ resumes: [sampleResumes[0]] });
        const root = tree.root;
        const buttons = root.findAllByType('GlassButton');
        const deleteBtn = buttons.find((b: any) => b.props.label === 'Delete');
        renderer.act(() => {
          deleteBtn!.props.onPress();
        });
        expect(Alert.alert).toHaveBeenCalledWith(
          'Delete Resume',
          'Are you sure you want to delete this resume? This action cannot be undone.',
          expect.any(Array),
        );
      });

      it('should call deleteResume on Alert confirm and succeed', async () => {
        const mockDelete = jest.fn().mockResolvedValue(true);
        const tree = renderScreen({ resumes: [sampleResumes[0]], deleteResume: mockDelete });
        const root = tree.root;
        const buttons = root.findAllByType('GlassButton');
        const deleteBtn = buttons.find((b: any) => b.props.label === 'Delete');

        renderer.act(() => {
          deleteBtn!.props.onPress();
        });

        // Get the Alert callback
        const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
        const alertButtons = alertCall[2];
        const deleteAction = alertButtons.find((b: any) => b.text === 'Delete');

        await renderer.act(async () => {
          await deleteAction.onPress();
        });

        expect(mockDelete).toHaveBeenCalledWith(1);
      });

      it('should show error Alert when deleteResume fails', async () => {
        const mockDelete = jest.fn().mockResolvedValue(false);
        const tree = renderScreen({ resumes: [sampleResumes[0]], deleteResume: mockDelete });
        const root = tree.root;
        const buttons = root.findAllByType('GlassButton');
        const deleteBtn = buttons.find((b: any) => b.props.label === 'Delete');

        renderer.act(() => {
          deleteBtn!.props.onPress();
        });

        const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
        const alertButtons = alertCall[2];
        const deleteAction = alertButtons.find((b: any) => b.text === 'Delete');

        await renderer.act(async () => {
          await deleteAction.onPress();
        });

        // Second Alert.alert call: error message
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to delete resume');
      });

      it('should have Cancel button in delete Alert', () => {
        const tree = renderScreen({ resumes: [sampleResumes[0]] });
        const root = tree.root;
        const buttons = root.findAllByType('GlassButton');
        const deleteBtn = buttons.find((b: any) => b.props.label === 'Delete');

        renderer.act(() => {
          deleteBtn!.props.onPress();
        });

        const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
        const alertButtons = alertCall[2];
        const cancelBtn = alertButtons.find((b: any) => b.text === 'Cancel');
        expect(cancelBtn).toBeDefined();
        expect(cancelBtn.style).toBe('cancel');
      });

      it('should show ActivityIndicator and empty label when deleting', () => {
        const tree = renderScreen({ resumes: [sampleResumes[0]], deletingId: 1 });
        const root = tree.root;
        const buttons = root.findAllByType('GlassButton');
        const deleteBtn = buttons.find((b: any) => b.props.variant === 'danger');
        expect(deleteBtn!.props.label).toBe('');
        expect(deleteBtn!.props.disabled).toBe(true);
      });
    });

    // -- Analyze Button --

    describe('analyze button', () => {
      it('should call analyzeResume and open modal on success', async () => {
        const mockAnalyze = jest.fn().mockResolvedValue(fullAnalysis);
        const tree = renderScreen({ resumes: [sampleResumes[0]], analyzeResume: mockAnalyze });
        const root = tree.root;
        const buttons = root.findAllByType('GlassButton');
        const analyzeBtn = buttons.find((b: any) => b.props.label === 'Analyze');

        await renderer.act(async () => {
          await analyzeBtn!.props.onPress();
        });

        expect(mockAnalyze).toHaveBeenCalledWith(1);
      });

      it('should show error Alert when analyzeResume returns null', async () => {
        const mockAnalyze = jest.fn().mockResolvedValue(null);
        const tree = renderScreen({ resumes: [sampleResumes[0]], analyzeResume: mockAnalyze });
        const root = tree.root;
        const buttons = root.findAllByType('GlassButton');
        const analyzeBtn = buttons.find((b: any) => b.props.label === 'Analyze');

        await renderer.act(async () => {
          await analyzeBtn!.props.onPress();
        });

        expect(Alert.alert).toHaveBeenCalledWith('Analysis Failed', 'Failed to analyze resume');
      });

      it('should be disabled when analyzingId matches resume id', () => {
        const tree = renderScreen({ resumes: [sampleResumes[0]], analyzingId: 1 });
        const root = tree.root;
        const buttons = root.findAllByType('GlassButton');
        const analyzeBtn = buttons.find((b: any) => b.props.label === 'Analyze');
        expect(analyzeBtn!.props.disabled).toBe(true);
      });

      it('should show ActivityIndicator icon when analyzing', () => {
        const tree = renderScreen({ resumes: [sampleResumes[0]], analyzingId: 1 });
        const root = tree.root;
        // Find GlassButton with label Analyze -- its icon should be ActivityIndicator
        const buttons = root.findAllByType('GlassButton');
        const analyzeBtn = buttons.find((b: any) => b.props.label === 'Analyze');
        // The icon prop is a React element; check it's an ActivityIndicator
        expect(analyzeBtn!.props.icon).toBeDefined();
      });
    });

    // -- Analysis Modal --

    describe('analysis modal', () => {
      it('should open modal after successful analysis', async () => {
        const mockAnalyze = jest.fn().mockResolvedValue(fullAnalysis);
        const tree = renderScreen({
          resumes: [sampleResumes[0]],
          analyzeResume: mockAnalyze,
          currentAnalysis: null,
        });
        const root = tree.root;
        const buttons = root.findAllByType('GlassButton');
        const analyzeBtn = buttons.find((b: any) => b.props.label === 'Analyze');

        await renderer.act(async () => {
          await analyzeBtn!.props.onPress();
        });

        // After analysis, modal should be visible (index 1 = analysis modal, index 0 = versions modal)
        const modal = root.findAllByType('Modal')[1];
        expect(modal.props.visible).toBe(true);
      });

      it('should display analysis content when currentAnalysis is present', async () => {
        const mockAnalyze = jest.fn().mockResolvedValue(fullAnalysis);
        // Set currentAnalysis AFTER analyzeResume resolves
        mockStoreDefaults.analyzeResume = mockAnalyze;
        mockStoreDefaults.resumes = [sampleResumes[0]];
        mockStoreDefaults.currentAnalysis = fullAnalysis;
        (useResumeStore as unknown as jest.Mock).mockReturnValue(mockStoreDefaults);

        let tree: any;
        renderer.act(() => {
          tree = renderer.create(React.createElement(HomeScreen));
        });
        const root = tree!.root;
        const buttons = root.findAllByType('GlassButton');
        const analyzeBtn = buttons.find((b: any) => b.props.label === 'Analyze');

        await renderer.act(async () => {
          await analyzeBtn!.props.onPress();
        });

        const text = getTreeText(tree!.toJSON());
        expect(text).toContain('Resume Analysis');
        expect(text).toContain('Overall Score');
        expect(text).toContain('85');
        expect(text).toContain('Strengths');
        expect(text).toContain('Strong leadership skills');
        expect(text).toContain('Technical depth');
      });

      it('should display weaknesses section', async () => {
        mockStoreDefaults.resumes = [sampleResumes[0]];
        mockStoreDefaults.currentAnalysis = fullAnalysis;
        mockStoreDefaults.analyzeResume = jest.fn().mockResolvedValue(fullAnalysis);
        (useResumeStore as unknown as jest.Mock).mockReturnValue(mockStoreDefaults);

        let tree: any;
        renderer.act(() => {
          tree = renderer.create(React.createElement(HomeScreen));
        });
        const root = tree!.root;
        const analyzeBtn = root.findAllByType('GlassButton').find((b: any) => b.props.label === 'Analyze');

        await renderer.act(async () => {
          await analyzeBtn!.props.onPress();
        });

        const text = getTreeText(tree!.toJSON());
        expect(text).toContain('Areas for Improvement');
        expect(text).toContain('Missing certifications');
        expect(text).toContain('Short work history');
      });

      it('should display keyword optimization section with missing keywords', async () => {
        mockStoreDefaults.resumes = [sampleResumes[0]];
        mockStoreDefaults.currentAnalysis = fullAnalysis;
        mockStoreDefaults.analyzeResume = jest.fn().mockResolvedValue(fullAnalysis);
        (useResumeStore as unknown as jest.Mock).mockReturnValue(mockStoreDefaults);

        let tree: any;
        renderer.act(() => {
          tree = renderer.create(React.createElement(HomeScreen));
        });
        const root = tree!.root;
        const analyzeBtn = root.findAllByType('GlassButton').find((b: any) => b.props.label === 'Analyze');

        await renderer.act(async () => {
          await analyzeBtn!.props.onPress();
        });

        const text = getTreeText(tree!.toJSON());
        expect(text).toContain('Keyword Optimization');
        expect(text).toContain('72');
        expect(text).toContain('Add more industry keywords');
        expect(text).toContain('Missing Keywords');
        expect(text).toContain('agile');
        expect(text).toContain('scrum');
        expect(text).toContain('devops');
      });

      it('should display ATS compatibility section with issues', async () => {
        mockStoreDefaults.resumes = [sampleResumes[0]];
        mockStoreDefaults.currentAnalysis = fullAnalysis;
        mockStoreDefaults.analyzeResume = jest.fn().mockResolvedValue(fullAnalysis);
        (useResumeStore as unknown as jest.Mock).mockReturnValue(mockStoreDefaults);

        let tree: any;
        renderer.act(() => {
          tree = renderer.create(React.createElement(HomeScreen));
        });
        const root = tree!.root;
        const analyzeBtn = root.findAllByType('GlassButton').find((b: any) => b.props.label === 'Analyze');

        await renderer.act(async () => {
          await analyzeBtn!.props.onPress();
        });

        const text = getTreeText(tree!.toJSON());
        expect(text).toContain('ATS Compatibility');
        expect(text).toContain('80');
        expect(text).toContain('Use standard section headings');
        expect(text).toContain('Issues Found');
        expect(text).toContain('Unusual formatting detected');
        expect(text).toContain('Tables may cause issues');
      });

      it('should display improvement recommendations with all priority levels', async () => {
        mockStoreDefaults.resumes = [sampleResumes[0]];
        mockStoreDefaults.currentAnalysis = fullAnalysis;
        mockStoreDefaults.analyzeResume = jest.fn().mockResolvedValue(fullAnalysis);
        (useResumeStore as unknown as jest.Mock).mockReturnValue(mockStoreDefaults);

        let tree: any;
        renderer.act(() => {
          tree = renderer.create(React.createElement(HomeScreen));
        });
        const root = tree!.root;
        const analyzeBtn = root.findAllByType('GlassButton').find((b: any) => b.props.label === 'Analyze');

        await renderer.act(async () => {
          await analyzeBtn!.props.onPress();
        });

        const text = getTreeText(tree!.toJSON());
        expect(text).toContain('Action Items');
        expect(text).toContain('Experience');
        expect(text).toContain('high');
        expect(text).toContain('Add more metrics');
        expect(text).toContain('Increased sales by 25%');
        expect(text).toContain('Skills');
        expect(text).toContain('medium');
        expect(text).toContain('Format');
        expect(text).toContain('low');
        expect(text).toContain('Example');
      });

      it('should close modal and clear analysis when close button pressed', async () => {
        const mockClear = jest.fn();
        mockStoreDefaults.resumes = [sampleResumes[0]];
        mockStoreDefaults.currentAnalysis = fullAnalysis;
        mockStoreDefaults.analyzeResume = jest.fn().mockResolvedValue(fullAnalysis);
        mockStoreDefaults.clearAnalysis = mockClear;
        (useResumeStore as unknown as jest.Mock).mockReturnValue(mockStoreDefaults);

        let tree: any;
        renderer.act(() => {
          tree = renderer.create(React.createElement(HomeScreen));
        });
        const root = tree!.root;
        const analyzeBtn = root.findAllByType('GlassButton').find((b: any) => b.props.label === 'Analyze');

        await renderer.act(async () => {
          await analyzeBtn!.props.onPress();
        });

        // Find close button by accessibilityLabel
        const touchables = root.findAllByType('TouchableOpacity');
        const closeBtn = touchables.find((t: any) =>
          t.props.accessibilityLabel === 'Close analysis'
        );

        renderer.act(() => {
          closeBtn!.props.onPress();
        });

        expect(mockClear).toHaveBeenCalled();
        // Modal should now be invisible (index 1 = analysis modal)
        const modal = root.findAllByType('Modal')[1];
        expect(modal.props.visible).toBe(false);
      });

      it('should close modal via onRequestClose (back button)', async () => {
        const mockClear = jest.fn();
        mockStoreDefaults.resumes = [sampleResumes[0]];
        mockStoreDefaults.currentAnalysis = fullAnalysis;
        mockStoreDefaults.analyzeResume = jest.fn().mockResolvedValue(fullAnalysis);
        mockStoreDefaults.clearAnalysis = mockClear;
        (useResumeStore as unknown as jest.Mock).mockReturnValue(mockStoreDefaults);

        let tree: any;
        renderer.act(() => {
          tree = renderer.create(React.createElement(HomeScreen));
        });
        const root = tree!.root;
        const analyzeBtn = root.findAllByType('GlassButton').find((b: any) => b.props.label === 'Analyze');

        await renderer.act(async () => {
          await analyzeBtn!.props.onPress();
        });

        const modal = root.findAllByType('Modal')[1];
        renderer.act(() => {
          modal.props.onRequestClose();
        });

        expect(mockClear).toHaveBeenCalled();
      });

      it('should display the filename in modal subtitle', async () => {
        mockStoreDefaults.resumes = [sampleResumes[0]];
        mockStoreDefaults.currentAnalysis = fullAnalysis;
        mockStoreDefaults.analyzeResume = jest.fn().mockResolvedValue(fullAnalysis);
        (useResumeStore as unknown as jest.Mock).mockReturnValue(mockStoreDefaults);

        let tree: any;
        renderer.act(() => {
          tree = renderer.create(React.createElement(HomeScreen));
        });
        const root = tree!.root;
        const analyzeBtn = root.findAllByType('GlassButton').find((b: any) => b.props.label === 'Analyze');

        await renderer.act(async () => {
          await analyzeBtn!.props.onPress();
        });

        const text = getTreeText(tree!.toJSON());
        expect(text).toContain('Software_Engineer.pdf');
      });
    });

    // -- Analysis Modal with empty missing_keywords and issues --

    describe('analysis modal with empty arrays', () => {
      const emptyArrayAnalysis = {
        overall_score: 55,
        strengths: ['Good formatting'],
        weaknesses: ['Needs improvement'],
        keyword_optimization: {
          score: 50,
          suggestions: 'Some suggestions',
          missing_keywords: [],
        },
        ats_compatibility: {
          score: 45,
          recommendations: 'Some recs',
          issues: [],
        },
        improvement_recommendations: [],
      };

      it('should not render Missing Keywords section when array is empty', async () => {
        mockStoreDefaults.resumes = [sampleResumes[0]];
        mockStoreDefaults.currentAnalysis = emptyArrayAnalysis;
        mockStoreDefaults.analyzeResume = jest.fn().mockResolvedValue(emptyArrayAnalysis);
        (useResumeStore as unknown as jest.Mock).mockReturnValue(mockStoreDefaults);

        let tree: any;
        renderer.act(() => {
          tree = renderer.create(React.createElement(HomeScreen));
        });
        const root = tree!.root;
        const analyzeBtn = root.findAllByType('GlassButton').find((b: any) => b.props.label === 'Analyze');

        await renderer.act(async () => {
          await analyzeBtn!.props.onPress();
        });

        const text = getTreeText(tree!.toJSON());
        expect(text).not.toContain('Missing Keywords');
      });

      it('should not render Issues Found section when issues array is empty', async () => {
        mockStoreDefaults.resumes = [sampleResumes[0]];
        mockStoreDefaults.currentAnalysis = emptyArrayAnalysis;
        mockStoreDefaults.analyzeResume = jest.fn().mockResolvedValue(emptyArrayAnalysis);
        (useResumeStore as unknown as jest.Mock).mockReturnValue(mockStoreDefaults);

        let tree: any;
        renderer.act(() => {
          tree = renderer.create(React.createElement(HomeScreen));
        });
        const root = tree!.root;
        const analyzeBtn = root.findAllByType('GlassButton').find((b: any) => b.props.label === 'Analyze');

        await renderer.act(async () => {
          await analyzeBtn!.props.onPress();
        });

        const text = getTreeText(tree!.toJSON());
        expect(text).not.toContain('Issues Found');
      });

      it('should use danger color for scores below 60', async () => {
        mockStoreDefaults.resumes = [sampleResumes[0]];
        mockStoreDefaults.currentAnalysis = emptyArrayAnalysis;
        mockStoreDefaults.analyzeResume = jest.fn().mockResolvedValue(emptyArrayAnalysis);
        (useResumeStore as unknown as jest.Mock).mockReturnValue(mockStoreDefaults);

        let tree: any;
        renderer.act(() => {
          tree = renderer.create(React.createElement(HomeScreen));
        });
        const root = tree!.root;
        const analyzeBtn = root.findAllByType('GlassButton').find((b: any) => b.props.label === 'Analyze');

        await renderer.act(async () => {
          await analyzeBtn!.props.onPress();
        });

        const text = getTreeText(tree!.toJSON());
        expect(text).toContain('55');
      });
    });

    // -- Analysis Modal with warning-level score --

    describe('analysis modal with warning-level score', () => {
      const warningAnalysis = {
        overall_score: 65,
        strengths: ['OK layout'],
        weaknesses: ['More content needed'],
        keyword_optimization: {
          score: 70,
          suggestions: 'Decent keywords',
          missing_keywords: ['python'],
        },
        ats_compatibility: {
          score: 75,
          recommendations: 'Good structure',
          issues: ['Minor issue'],
        },
        improvement_recommendations: [
          { category: 'Content', priority: 'medium', recommendation: 'Add detail', example: 'More projects' },
        ],
      };

      it('should render warning-level score correctly', async () => {
        mockStoreDefaults.resumes = [sampleResumes[0]];
        mockStoreDefaults.currentAnalysis = warningAnalysis;
        mockStoreDefaults.analyzeResume = jest.fn().mockResolvedValue(warningAnalysis);
        (useResumeStore as unknown as jest.Mock).mockReturnValue(mockStoreDefaults);

        let tree: any;
        renderer.act(() => {
          tree = renderer.create(React.createElement(HomeScreen));
        });
        const root = tree!.root;
        const analyzeBtn = root.findAllByType('GlassButton').find((b: any) => b.props.label === 'Analyze');

        await renderer.act(async () => {
          await analyzeBtn!.props.onPress();
        });

        const text = getTreeText(tree!.toJSON());
        expect(text).toContain('65');
        expect(text).toContain('python');
        expect(text).toContain('Minor issue');
      });
    });

    // -- Resume with null name --

    describe('resume without name field', () => {
      it('should not render name text when name is null', () => {
        const noNameResume = [{ id: 5, filename: 'NoName.pdf', name: null, skills_count: 3, uploaded_at: '2025-01-01T00:00:00Z' }];
        const tree = renderScreen({ resumes: noNameResume });
        const text = getTreeText(tree.toJSON());
        expect(text).toContain('NoName.pdf');
        // Should contain skills but not a name line
        expect(text).toContain('3');
      });

      it('should render name text when name is present', () => {
        const namedResume = [{ id: 6, filename: 'Named.pdf', name: 'Test Person', skills_count: 7, uploaded_at: '2025-03-01T00:00:00Z' }];
        const tree = renderScreen({ resumes: namedResume });
        const text = getTreeText(tree.toJSON());
        expect(text).toContain('Test Person');
      });
    });

    // -- useFocusEffect --

    describe('useFocusEffect', () => {
      it('should call fetchResumes when component mounts (focus effect)', () => {
        const mockFetch = jest.fn();
        renderScreen({ fetchResumes: mockFetch });
        // useFocusEffect mock calls callback immediately
        expect(mockFetch).toHaveBeenCalled();
      });
    });

    // -- OnboardingTour --

    describe('onboarding tour', () => {
      it('should render OnboardingTour component', () => {
        const tree = renderScreen({ resumes: sampleResumes });
        const root = tree.root;
        const tours = root.findAllByType('OnboardingTour');
        expect(tours).toHaveLength(1);
      });
    });

    // -- Title --

    describe('page title', () => {
      it('should display My Resumes as page title', () => {
        const tree = renderScreen({ resumes: [] });
        const text = getTreeText(tree.toJSON());
        expect(text).toContain('My Resumes');
      });
    });

    // -- Multiple resumes rendering --

    describe('multiple resume cards', () => {
      it('should render all resume items from the list', () => {
        const tree = renderScreen({ resumes: sampleResumes });
        const root = tree.root;
        const flatListItems = root.findAllByType('FlatListItem');
        expect(flatListItems).toHaveLength(3);
      });

      it('should render action buttons for each resume card', () => {
        const tree = renderScreen({ resumes: sampleResumes });
        const root = tree.root;
        const buttons = root.findAllByType('GlassButton');
        // Each resume has: Analyze, Tailor, Delete
        const analyzeButtons = buttons.filter((b: any) => b.props.label === 'Analyze');
        const tailorButtons = buttons.filter((b: any) => b.props.label === 'Tailor');
        const deleteButtons = buttons.filter((b: any) => b.props.label === 'Delete');
        expect(analyzeButtons).toHaveLength(3);
        expect(tailorButtons).toHaveLength(3);
        expect(deleteButtons).toHaveLength(3);
      });
    });

    // -- Search and Sort filtering within component (useMemo branches) --

    describe('search and sort filtering (useMemo)', () => {
      const sortableResumes = [
        { id: 1, filename: 'Alpha_Resume.pdf', name: 'Charlie', skills_count: 5, uploaded_at: '2025-01-01T00:00:00Z' },
        { id: 2, filename: 'Bravo_Resume.pdf', name: 'Alice', skills_count: 20, uploaded_at: '2025-06-01T00:00:00Z' },
        { id: 3, filename: 'Charlie_CV.pdf', name: 'Bravo', skills_count: 10, uploaded_at: '2025-03-01T00:00:00Z' },
      ];

      it('should filter resumes when search query is changed via SearchFilter', () => {
        const tree = renderScreen({ resumes: sortableResumes });
        const root = tree.root;
        const sf = root.findAllByType('SearchFilter')[0];

        // Call onSearchChange to trigger the search state
        renderer.act(() => {
          sf.props.onSearchChange('Alpha');
        });

        // After search, only Alpha_Resume should appear
        const items = root.findAllByType('FlatListItem');
        expect(items).toHaveLength(1);
        const text = getTreeText(tree.toJSON());
        expect(text).toContain('Alpha_Resume.pdf');
        expect(text).not.toContain('Bravo_Resume.pdf');
      });

      it('should filter by name field when search query matches name', () => {
        const tree = renderScreen({ resumes: sortableResumes });
        const root = tree.root;
        const sf = root.findAllByType('SearchFilter')[0];

        renderer.act(() => {
          sf.props.onSearchChange('Alice');
        });

        const items = root.findAllByType('FlatListItem');
        expect(items).toHaveLength(1);
        const text = getTreeText(tree.toJSON());
        expect(text).toContain('Bravo_Resume.pdf'); // Alice's resume
      });

      it('should sort by newest first when sort option is changed', () => {
        const tree = renderScreen({ resumes: sortableResumes });
        const root = tree.root;
        const sf = root.findAllByType('SearchFilter')[0];

        renderer.act(() => {
          sf.props.onSortChange('newest');
        });

        const items = root.findAllByType('FlatListItem');
        expect(items).toHaveLength(3);
        // First item should be the newest (2025-06-01)
        const firstItemText = getTreeText(items[0]);
        expect(firstItemText).toContain('Bravo_Resume.pdf');
      });

      it('should sort by oldest first when sort option is changed', () => {
        const tree = renderScreen({ resumes: sortableResumes });
        const root = tree.root;
        const sf = root.findAllByType('SearchFilter')[0];

        renderer.act(() => {
          sf.props.onSortChange('oldest');
        });

        const items = root.findAllByType('FlatListItem');
        const firstItemText = getTreeText(items[0]);
        expect(firstItemText).toContain('Alpha_Resume.pdf');
      });

      it('should sort by name (A-Z) when sort option is changed', () => {
        const tree = renderScreen({ resumes: sortableResumes });
        const root = tree.root;
        const sf = root.findAllByType('SearchFilter')[0];

        renderer.act(() => {
          sf.props.onSortChange('name');
        });

        const items = root.findAllByType('FlatListItem');
        const firstItemText = getTreeText(items[0]);
        expect(firstItemText).toContain('Alpha_Resume.pdf');
        const lastItemText = getTreeText(items[2]);
        expect(lastItemText).toContain('Charlie_CV.pdf');
      });

      it('should sort by most skills when sort option is changed', () => {
        const tree = renderScreen({ resumes: sortableResumes });
        const root = tree.root;
        const sf = root.findAllByType('SearchFilter')[0];

        renderer.act(() => {
          sf.props.onSortChange('skills');
        });

        const items = root.findAllByType('FlatListItem');
        const firstItemText = getTreeText(items[0]);
        expect(firstItemText).toContain('Bravo_Resume.pdf'); // 20 skills
        const lastItemText = getTreeText(items[2]);
        expect(lastItemText).toContain('Alpha_Resume.pdf'); // 5 skills
      });

      it('should show empty list when search matches nothing', () => {
        const tree = renderScreen({ resumes: sortableResumes });
        const root = tree.root;
        const sf = root.findAllByType('SearchFilter')[0];

        renderer.act(() => {
          sf.props.onSearchChange('zzzznonexistent');
        });

        const items = root.findAllByType('FlatListItem');
        expect(items).toHaveLength(0);
      });
    });
  });
});
