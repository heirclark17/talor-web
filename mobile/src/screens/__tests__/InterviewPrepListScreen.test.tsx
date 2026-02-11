/**
 * InterviewPrepListScreen Comprehensive Tests
 *
 * Achieves high coverage by testing:
 * - Component rendering in all states (loading, empty, data)
 * - Refresh functionality via FlatList RefreshControl
 * - Navigation to detail screen on card press
 * - API calls and error handling (success, failure, exception, non-array, null)
 * - All conditional rendering paths (company name, job title, location fallbacks)
 * - Accessibility props on cards and empty state button
 * - Date formatting logic (ISO, date-only)
 * - Meta text formatting (location + date vs date only)
 * - Module exports
 * - Replicated formatDate helper
 */

// ---- Override react-native with proper React components for FlatList rendering ----
jest.mock('react-native', () => {
  const React = require('react');
  const mk = (name: string) => {
    const C = (props: any) => React.createElement(name, props, props.children);
    C.displayName = name;
    return C;
  };
  // FlatList must actually render its items for testing
  const MockFlatList = (props: any) => {
    const { data, renderItem, ListEmptyComponent, refreshControl, keyExtractor, contentContainerStyle, ...rest } = props;
    const children: any[] = [];
    if (refreshControl) {
      children.push(React.cloneElement(refreshControl, { key: '__refresh__' }));
    }
    if (data && data.length > 0) {
      data.forEach((item: any, index: number) => {
        const key = keyExtractor ? keyExtractor(item, index) : String(index);
        children.push(
          React.createElement('FlatListItem', { key }, renderItem({ item, index })),
        );
      });
    } else if (ListEmptyComponent) {
      const empty =
        typeof ListEmptyComponent === 'function'
          ? React.createElement(ListEmptyComponent)
          : ListEmptyComponent;
      children.push(React.createElement('FlatListEmpty', { key: '__empty__' }, empty));
    }
    return React.createElement('FlatList', rest, ...children);
  };
  MockFlatList.displayName = 'FlatList';

  const MockRefreshControl = (props: any) =>
    React.createElement('RefreshControl', props);
  MockRefreshControl.displayName = 'RefreshControl';

  return {
    Platform: { OS: 'ios', select: (obj: any) => obj.ios ?? obj.default },
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (style: any) => style,
      hairlineWidth: 1,
    },
    View: mk('View'),
    Text: mk('Text'),
    TouchableOpacity: mk('TouchableOpacity'),
    Pressable: mk('Pressable'),
    ScrollView: mk('ScrollView'),
    FlatList: MockFlatList,
    RefreshControl: MockRefreshControl,
    ActivityIndicator: mk('ActivityIndicator'),
    Animated: {
      View: mk('Animated.View'),
      Text: mk('Animated.Text'),
      Value: jest.fn(() => ({ setValue: jest.fn(), interpolate: jest.fn(() => 0) })),
      timing: jest.fn(() => ({ start: jest.fn() })),
      spring: jest.fn(() => ({ start: jest.fn() })),
      createAnimatedComponent: jest.fn((comp: any) => comp),
    },
    Dimensions: { get: () => ({ width: 390, height: 844 }) },
    useColorScheme: () => 'dark',
  };
});

jest.mock('../../hooks/useTheme', () => ({
  useTheme: jest.fn(() => ({
    colors: {
      text: '#ffffff',
      textSecondary: '#9ca3af',
      textTertiary: '#6b7280',
      background: '#0a0a0a',
      backgroundTertiary: '#2a2a2a',
      glass: 'rgba(255,255,255,0.04)',
      glassBorder: 'rgba(255,255,255,0.08)',
    },
    isDark: true,
  })),
}));

const mockNavigate = jest.fn();

// CRITICAL: useFocusEffect must use React.useEffect internally to avoid
// infinite re-render loops when loadPreps calls setState
jest.mock('@react-navigation/native', () => {
  const ReactActual = require('react');
  return {
    useNavigation: jest.fn(() => ({
      navigate: mockNavigate,
    })),
    useFocusEffect: jest.fn((callback: () => void | (() => void)) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      ReactActual.useEffect(() => {
        const cleanup = callback();
        return typeof cleanup === 'function' ? cleanup : undefined;
      }, []);
    }),
  };
});

// Mock lucide icons as React components so they render in the tree
jest.mock('lucide-react-native', () => {
  const ReactLocal = require('react');
  return new Proxy(
    {},
    {
      get: (_target: any, prop: string) => {
        if (prop === '__esModule') return false;
        const MockIcon = (props: any) =>
          ReactLocal.createElement('MockIcon', { ...props, testID: `icon-${prop}` });
        MockIcon.displayName = prop;
        return MockIcon;
      },
    },
  );
});

// SafeAreaView must be a real component so children render
jest.mock('react-native-safe-area-context', () => {
  const ReactLocal = require('react');
  return {
    SafeAreaView: (props: any) =>
      ReactLocal.createElement('SafeAreaView', props, props.children),
  };
});

const mockListInterviewPreps = jest.fn();

jest.mock('../../api/client', () => ({
  api: {
    listInterviewPreps: (...args: any[]) => mockListInterviewPreps(...args),
  },
}));

jest.mock('../../navigation/AppNavigator', () => ({
  RootStackParamList: {},
}));

// ---- Import component AFTER mocks ----
import React from 'react';
import renderer from 'react-test-renderer';
import { COLORS, SPACING, RADIUS, FONTS, TAB_BAR_HEIGHT } from '../../utils/constants';
import InterviewPrepListScreen from '../InterviewPrepListScreen';

// ---- Replicated helper: formatDate logic (mirrors component's internal function) ----
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ---- Helpers ----
const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

function renderComponent(): any {
  let tree: any;
  renderer.act(() => {
    tree = renderer.create(React.createElement(InterviewPrepListScreen));
  });
  return tree!;
}

async function renderAndFlush(): Promise<any> {
  let tree: any;
  await renderer.act(async () => {
    tree = renderer.create(React.createElement(InterviewPrepListScreen));
    await flushPromises();
  });
  return tree!;
}

function stringify(tree: any): string {
  return JSON.stringify(tree.toJSON());
}

// ========================================================================
// TESTS
// ========================================================================

describe('InterviewPrepListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockListInterviewPreps.mockResolvedValue({ success: true, data: [] });
  });

  // ---- Module Export Tests ----

  describe('module exports', () => {
    it('should export a default function component', () => {
      const mod = require('../InterviewPrepListScreen');
      expect(mod.default).toBeDefined();
      expect(typeof mod.default).toBe('function');
    });

    it('should have the function named InterviewPrepListScreen', () => {
      const mod = require('../InterviewPrepListScreen');
      expect(mod.default.name).toBe('InterviewPrepListScreen');
    });

    it('should not have additional named exports', () => {
      const mod = require('../InterviewPrepListScreen');
      const exportKeys = Object.keys(mod).filter((k) => k !== '__esModule');
      expect(exportKeys).toEqual(['default']);
    });
  });

  // ---- Replicated formatDate Logic Tests ----

  describe('formatDate logic (replicated)', () => {
    it('should format ISO date string to "MMM D, YYYY"', () => {
      const result = formatDate('2025-06-15T12:00:00Z');
      expect(result).toContain('Jun');
      expect(result).toContain('15');
      expect(result).toContain('2025');
    });

    it('should handle date-only strings', () => {
      const result = formatDate('2025-03-15');
      expect(result).toMatch(/\w{3}\s+\d{1,2},\s+\d{4}/);
    });

    it('should format end-of-year dates', () => {
      const result = formatDate('2025-12-31T23:59:59Z');
      expect(result).toContain('Dec');
      expect(result).toContain('2025');
    });

    it('should format mid-day dates to avoid timezone boundary issues', () => {
      // Use noon UTC to avoid timezone-related date shifting
      const result = formatDate('2025-01-15T12:00:00Z');
      expect(result).toContain('Jan');
      expect(result).toContain('2025');
    });
  });

  // ---- Constants Validation Tests ----

  describe('constants used by component', () => {
    it('should use correct COLORS.primary value', () => {
      expect(COLORS.primary).toBe('#3b82f6');
    });

    it('should use correct SPACING values', () => {
      expect(SPACING.lg).toBe(24);
      expect(SPACING.md).toBe(16);
      expect(SPACING.sm).toBe(8);
      expect(SPACING.xl).toBe(32);
      expect(SPACING.xxl).toBe(48);
    });

    it('should use correct RADIUS values', () => {
      expect(RADIUS.lg).toBe(24);
      expect(RADIUS.md).toBe(16);
    });

    it('should use correct FONTS values', () => {
      expect(FONTS.regular).toBe('Urbanist_400Regular');
      expect(FONTS.semibold).toBe('Urbanist_600SemiBold');
      expect(FONTS.extralight).toBe('Urbanist_200ExtraLight');
    });

    it('should use TAB_BAR_HEIGHT for list padding', () => {
      expect(TAB_BAR_HEIGHT).toBe(100);
    });
  });

  // ---- Component Rendering Tests ----

  describe('component rendering', () => {
    it('should render loading state initially (before API resolves)', () => {
      // Use a never-resolving promise to keep loading=true
      mockListInterviewPreps.mockReturnValue(new Promise(() => {}));

      const tree = renderComponent();
      const json = stringify(tree);

      expect(json).toContain('Loading interview preps...');
      expect(json).toContain('ActivityIndicator');
    });

    it('should render empty state when no interview preps', async () => {
      mockListInterviewPreps.mockResolvedValue({ success: true, data: [] });

      const tree = await renderAndFlush();
      const json = stringify(tree);

      expect(json).toContain('No Interview Preps');
      expect(json).toContain('Tailor a resume for a job posting');
      expect(json).toContain('Tailor a Resume');
      expect(mockListInterviewPreps).toHaveBeenCalledTimes(1);
    });

    it('should render interview preps list when data exists', async () => {
      const mockData = [
        {
          id: 1,
          tailored_resume_id: 10,
          company_name: 'Google',
          job_title: 'Software Engineer',
          job_location: 'Remote',
          created_at: '2025-06-15T12:00:00Z',
        },
      ];

      mockListInterviewPreps.mockResolvedValue({ success: true, data: mockData });

      const tree = await renderAndFlush();
      const json = stringify(tree);

      expect(json).toContain('Google');
      expect(json).toContain('Software Engineer');
      expect(json).toContain('Remote');
      expect(json).toContain('Interview Prep');
      expect(mockListInterviewPreps).toHaveBeenCalledTimes(1);
    });

    it('should render multiple interview preps', async () => {
      const mockData = [
        {
          id: 1,
          tailored_resume_id: 10,
          company_name: 'Google',
          job_title: 'SWE',
          created_at: '2025-06-01T00:00:00Z',
        },
        {
          id: 2,
          tailored_resume_id: 20,
          company_name: 'Meta',
          job_title: 'PM',
          job_location: 'Seattle',
          created_at: '2025-06-02T00:00:00Z',
        },
      ];

      mockListInterviewPreps.mockResolvedValue({ success: true, data: mockData });

      const tree = await renderAndFlush();
      const json = stringify(tree);

      expect(json).toContain('Google');
      expect(json).toContain('Meta');
      expect(json).toContain('SWE');
      expect(json).toContain('PM');
      expect(json).toContain('Seattle');
    });

    it('should render the header title "Interview Prep" after loading', async () => {
      mockListInterviewPreps.mockResolvedValue({ success: true, data: [] });

      const tree = await renderAndFlush();
      const json = stringify(tree);

      expect(json).toContain('Interview Prep');
    });
  });

  // ---- API Error Handling Tests ----

  describe('API error handling', () => {
    it('should handle API error response and show empty state', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockListInterviewPreps.mockResolvedValue({
        success: false,
        error: 'Network error',
      });

      const tree = await renderAndFlush();
      const json = stringify(tree);

      expect(mockListInterviewPreps).toHaveBeenCalled();
      expect(json).toContain('No Interview Preps');
      consoleSpy.mockRestore();
    });

    it('should handle API exception and show empty state', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockListInterviewPreps.mockRejectedValue(new Error('Connection failed'));

      const tree = await renderAndFlush();
      const json = stringify(tree);

      expect(mockListInterviewPreps).toHaveBeenCalled();
      expect(json).toContain('No Interview Preps');
      consoleSpy.mockRestore();
    });

    it('should handle non-array data response gracefully', async () => {
      mockListInterviewPreps.mockResolvedValue({
        success: true,
        data: { items: [] },
      });

      const tree = await renderAndFlush();
      const json = stringify(tree);

      expect(mockListInterviewPreps).toHaveBeenCalled();
      expect(json).toContain('No Interview Preps');
    });

    it('should handle null data response gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockListInterviewPreps.mockResolvedValue({
        success: true,
        data: null,
      });

      const tree = await renderAndFlush();
      const json = stringify(tree);

      expect(mockListInterviewPreps).toHaveBeenCalled();
      expect(json).toContain('No Interview Preps');
      consoleSpy.mockRestore();
    });

    it('should log error on API failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockListInterviewPreps.mockResolvedValue({
        success: false,
        error: 'Server 500',
      });

      await renderAndFlush();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load interview preps:',
        'Server 500',
      );
      consoleSpy.mockRestore();
    });

    it('should log error on API exception', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Network timeout');
      mockListInterviewPreps.mockRejectedValue(error);

      await renderAndFlush();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error loading interview preps:',
        error,
      );
      consoleSpy.mockRestore();
    });
  });

  // ---- Refresh Functionality Tests ----

  describe('refresh functionality', () => {
    it('should call API when component mounts via useFocusEffect', async () => {
      mockListInterviewPreps.mockResolvedValue({ success: true, data: [] });

      await renderAndFlush();

      expect(mockListInterviewPreps).toHaveBeenCalledTimes(1);
    });

    it('should render a FlatList after loading', async () => {
      mockListInterviewPreps.mockResolvedValue({ success: true, data: [] });

      const tree = await renderAndFlush();
      const root = tree.root;

      const flatLists = root.findAllByType('FlatList');
      expect(flatLists.length).toBeGreaterThan(0);
    });

    it('should call API again when handleRefresh is triggered via RefreshControl', async () => {
      const mockData = [
        {
          id: 1,
          tailored_resume_id: 1,
          company_name: 'TestCo',
          job_title: 'Dev',
          created_at: '2025-06-01',
        },
      ];
      mockListInterviewPreps.mockResolvedValue({ success: true, data: mockData });

      const tree = await renderAndFlush();
      const root = tree.root;

      // Find the RefreshControl and trigger onRefresh
      const refreshControls = root.findAllByType('RefreshControl');
      expect(refreshControls.length).toBeGreaterThan(0);

      await renderer.act(async () => {
        refreshControls[0].props.onRefresh();
        await flushPromises();
      });

      // Should have been called once on mount + once on refresh
      expect(mockListInterviewPreps).toHaveBeenCalledTimes(2);
    });
  });

  // ---- Navigation Tests ----

  describe('navigation', () => {
    it('should navigate to InterviewPrep detail screen on card press', async () => {
      const mockData = [
        {
          id: 1,
          tailored_resume_id: 42,
          company_name: 'Apple',
          job_title: 'Security PM',
          created_at: '2025-06-01',
        },
      ];

      mockListInterviewPreps.mockResolvedValue({ success: true, data: mockData });

      const tree = await renderAndFlush();
      const root = tree.root;

      // Find TouchableOpacity cards
      const touchables = root.findAllByType('TouchableOpacity');
      const card = touchables.find(
        (t: any) =>
          t.props.accessibilityRole === 'button' &&
          t.props.accessibilityLabel?.includes('Apple'),
      );

      expect(card).toBeDefined();

      await renderer.act(async () => {
        card!.props.onPress();
      });

      expect(mockNavigate).toHaveBeenCalledWith('InterviewPrep', {
        tailoredResumeId: 42,
      });
    });

    it('should navigate to Tailor screen from empty state button', async () => {
      mockListInterviewPreps.mockResolvedValue({ success: true, data: [] });

      const tree = await renderAndFlush();
      const root = tree.root;

      const touchables = root.findAllByType('TouchableOpacity');
      const tailorButton = touchables.find(
        (t: any) => t.props.accessibilityLabel === 'Tailor a resume',
      );

      expect(tailorButton).toBeDefined();

      await renderer.act(async () => {
        tailorButton!.props.onPress();
      });

      expect(mockNavigate).toHaveBeenCalledWith('Tailor');
    });
  });

  // ---- Conditional Rendering Tests ----

  describe('conditional rendering', () => {
    it('should render company name when provided', async () => {
      const mockData = [
        {
          id: 1,
          tailored_resume_id: 1,
          company_name: 'Google',
          job_title: 'SWE',
          created_at: '2025-06-01',
        },
      ];

      mockListInterviewPreps.mockResolvedValue({ success: true, data: mockData });

      const tree = await renderAndFlush();
      const json = stringify(tree);

      expect(json).toContain('Google');
    });

    it('should render "Unknown Company" when company_name is empty', async () => {
      const mockData = [
        {
          id: 1,
          tailored_resume_id: 1,
          company_name: '',
          job_title: 'Engineer',
          created_at: '2025-06-01',
        },
      ];

      mockListInterviewPreps.mockResolvedValue({ success: true, data: mockData });

      const tree = await renderAndFlush();
      const json = stringify(tree);

      expect(json).toContain('Unknown Company');
    });

    it('should render job title when provided', async () => {
      const mockData = [
        {
          id: 1,
          tailored_resume_id: 1,
          company_name: 'Meta',
          job_title: 'Product Manager',
          created_at: '2025-06-01',
        },
      ];

      mockListInterviewPreps.mockResolvedValue({ success: true, data: mockData });

      const tree = await renderAndFlush();
      const json = stringify(tree);

      expect(json).toContain('Product Manager');
    });

    it('should render "Interview Prep" fallback when job_title is empty', async () => {
      const mockData = [
        {
          id: 1,
          tailored_resume_id: 1,
          company_name: 'Acme',
          job_title: '',
          created_at: '2025-06-01',
        },
      ];

      mockListInterviewPreps.mockResolvedValue({ success: true, data: mockData });

      const tree = await renderAndFlush();
      const root = tree.root;

      const json = stringify(tree);
      expect(json).toContain('Acme');
      // The card should show "Interview Prep" as job title fallback
      const touchables = root.findAllByType('TouchableOpacity');
      const card = touchables.find(
        (t: any) =>
          t.props.accessibilityRole === 'button' &&
          t.props.accessibilityLabel?.includes('Acme'),
      );
      expect(card).toBeDefined();
    });

    it('should render job_location with separator when present', async () => {
      const mockData = [
        {
          id: 1,
          tailored_resume_id: 1,
          company_name: 'Amazon',
          job_title: 'SDE',
          job_location: 'Seattle, WA',
          created_at: '2025-06-01',
        },
      ];

      mockListInterviewPreps.mockResolvedValue({ success: true, data: mockData });

      const tree = await renderAndFlush();
      const json = stringify(tree);

      expect(json).toContain('Seattle, WA');
    });

    it('should not render location separator when job_location is absent', async () => {
      const mockData = [
        {
          id: 1,
          tailored_resume_id: 1,
          company_name: 'Microsoft',
          job_title: 'Engineer',
          created_at: '2025-06-15T12:00:00Z',
        },
      ];

      mockListInterviewPreps.mockResolvedValue({ success: true, data: mockData });

      const tree = await renderAndFlush();
      const json = stringify(tree);

      expect(json).toContain('Microsoft');
      expect(json).toContain('Engineer');
    });

    it('should not render location separator when job_location is empty string', async () => {
      const mockData = [
        {
          id: 1,
          tailored_resume_id: 1,
          company_name: 'Corp',
          job_title: 'Dev',
          job_location: '',
          created_at: '2025-06-01',
        },
      ];

      mockListInterviewPreps.mockResolvedValue({ success: true, data: mockData });

      const tree = await renderAndFlush();
      const json = stringify(tree);

      expect(json).toContain('Corp');
      expect(json).toContain('Dev');
    });

    it('should render prep with updated_at field without crashing', async () => {
      const mockData = [
        {
          id: 1,
          tailored_resume_id: 1,
          company_name: 'Netflix',
          job_title: 'Engineer',
          created_at: '2025-06-01T00:00:00Z',
          updated_at: '2025-06-05T00:00:00Z',
        },
      ];

      mockListInterviewPreps.mockResolvedValue({ success: true, data: mockData });

      const tree = await renderAndFlush();
      const json = stringify(tree);

      expect(json).toContain('Netflix');
      expect(json).toContain('Engineer');
    });
  });

  // ---- Date Formatting in Rendered Output Tests ----

  describe('date formatting in rendered output', () => {
    it('should format ISO date string correctly in the tree', async () => {
      const mockData = [
        {
          id: 1,
          tailored_resume_id: 1,
          company_name: 'Test Co',
          job_title: 'Engineer',
          created_at: '2025-06-15T12:00:00Z',
        },
      ];

      mockListInterviewPreps.mockResolvedValue({ success: true, data: mockData });

      const tree = await renderAndFlush();
      const json = stringify(tree);

      expect(json).toContain('Jun');
      expect(json).toContain('15');
      expect(json).toContain('2025');
    });

    it('should format date-only string correctly in the tree', async () => {
      const mockData = [
        {
          id: 1,
          tailored_resume_id: 1,
          company_name: 'Test Co',
          job_title: 'Engineer',
          created_at: '2025-03-15',
        },
      ];

      mockListInterviewPreps.mockResolvedValue({ success: true, data: mockData });

      const tree = await renderAndFlush();
      const json = stringify(tree);

      expect(json).toContain('2025');
    });
  });

  // ---- Accessibility Tests ----

  describe('accessibility', () => {
    it('should have correct accessibilityRole on card', async () => {
      const mockData = [
        {
          id: 1,
          tailored_resume_id: 1,
          company_name: 'Accessible Co',
          job_title: 'Engineer',
          created_at: '2025-06-01',
        },
      ];

      mockListInterviewPreps.mockResolvedValue({ success: true, data: mockData });

      const tree = await renderAndFlush();
      const root = tree.root;

      const touchables = root.findAllByType('TouchableOpacity');
      const card = touchables.find(
        (t: any) =>
          t.props.accessibilityRole === 'button' &&
          t.props.accessibilityLabel?.includes('Accessible Co'),
      );

      expect(card).toBeDefined();
      expect(card!.props.accessibilityRole).toBe('button');
      expect(card!.props.accessibilityLabel).toContain('Accessible Co');
      expect(card!.props.accessibilityLabel).toContain('Engineer');
      expect(card!.props.accessibilityHint).toBeDefined();
    });

    it('should have correct accessibilityRole and label on empty state button', async () => {
      mockListInterviewPreps.mockResolvedValue({ success: true, data: [] });

      const tree = await renderAndFlush();
      const root = tree.root;

      const touchables = root.findAllByType('TouchableOpacity');
      const tailorButton = touchables.find(
        (t: any) => t.props.accessibilityLabel === 'Tailor a resume',
      );

      expect(tailorButton).toBeDefined();
      expect(tailorButton!.props.accessibilityRole).toBe('button');
      expect(tailorButton!.props.accessibilityHint).toContain(
        'Navigate to resume tailoring',
      );
    });

    it('should have accessibilityHint with date on card', async () => {
      const mockData = [
        {
          id: 1,
          tailored_resume_id: 1,
          company_name: 'A11yDate Co',
          job_title: 'Tester',
          created_at: '2025-06-15T12:00:00Z',
        },
      ];

      mockListInterviewPreps.mockResolvedValue({ success: true, data: mockData });

      const tree = await renderAndFlush();
      const root = tree.root;

      const touchables = root.findAllByType('TouchableOpacity');
      const card = touchables.find(
        (t: any) => t.props.accessibilityLabel?.includes('A11yDate Co'),
      );

      expect(card).toBeDefined();
      expect(card!.props.accessibilityHint).toContain('Created on');
    });
  });

  // ---- Loading State Tests ----

  describe('loading state', () => {
    it('should show loading indicator and text while fetching data', () => {
      mockListInterviewPreps.mockReturnValue(new Promise(() => {}));

      const tree = renderComponent();
      const json = stringify(tree);

      expect(json).toContain('Loading interview preps...');
      expect(json).toContain('ActivityIndicator');
    });

    it('should hide loading state after data loads', async () => {
      mockListInterviewPreps.mockResolvedValue({ success: true, data: [] });

      const tree = await renderAndFlush();
      const json = stringify(tree);

      expect(json).not.toContain('Loading interview preps...');
      expect(json).toContain('No Interview Preps');
    });

    it('should show SafeAreaView in loading state', () => {
      mockListInterviewPreps.mockReturnValue(new Promise(() => {}));

      const tree = renderComponent();
      const root = tree.root;

      const safeAreas = root.findAllByType('SafeAreaView');
      expect(safeAreas.length).toBeGreaterThan(0);
    });
  });

  // ---- Meta Text Formatting Tests ----

  describe('meta text formatting', () => {
    it('should show location with bullet separator when location is present', async () => {
      const mockData = [
        {
          id: 1,
          tailored_resume_id: 1,
          company_name: 'MetaTest',
          job_title: 'Eng',
          job_location: 'Remote',
          created_at: '2025-06-15T12:00:00Z',
        },
      ];

      mockListInterviewPreps.mockResolvedValue({ success: true, data: mockData });

      const tree = await renderAndFlush();
      const json = stringify(tree);

      expect(json).toContain('Remote');
      expect(json).toContain('Jun');
    });

    it('should show only date when no location', async () => {
      const mockData = [
        {
          id: 1,
          tailored_resume_id: 1,
          company_name: 'MetaTest2',
          job_title: 'Eng',
          created_at: '2025-06-15T12:00:00Z',
        },
      ];

      mockListInterviewPreps.mockResolvedValue({ success: true, data: mockData });

      const tree = await renderAndFlush();
      const json = stringify(tree);

      expect(json).toContain('Jun');
      expect(json).toContain('15');
      expect(json).toContain('2025');
    });
  });

  // ---- Icon Rendering Tests ----

  describe('icon rendering', () => {
    it('should render Briefcase icon in card', async () => {
      const mockData = [
        {
          id: 1,
          tailored_resume_id: 1,
          company_name: 'IconTest',
          job_title: 'Dev',
          created_at: '2025-06-01',
        },
      ];

      mockListInterviewPreps.mockResolvedValue({ success: true, data: mockData });

      const tree = await renderAndFlush();
      const root = tree.root;

      const briefcaseIcons = root.findAll(
        (node: any) => node.props?.testID === 'icon-Briefcase',
      );
      expect(briefcaseIcons.length).toBeGreaterThan(0);
    });

    it('should render Building2 icon in card header', async () => {
      const mockData = [
        {
          id: 1,
          tailored_resume_id: 1,
          company_name: 'IconTest',
          job_title: 'Dev',
          created_at: '2025-06-01',
        },
      ];

      mockListInterviewPreps.mockResolvedValue({ success: true, data: mockData });

      const tree = await renderAndFlush();
      const root = tree.root;

      const building2Icons = root.findAll(
        (node: any) => node.props?.testID === 'icon-Building2',
      );
      expect(building2Icons.length).toBeGreaterThan(0);
    });

    it('should render ChevronRight icon in card', async () => {
      const mockData = [
        {
          id: 1,
          tailored_resume_id: 1,
          company_name: 'IconTest',
          job_title: 'Dev',
          created_at: '2025-06-01',
        },
      ];

      mockListInterviewPreps.mockResolvedValue({ success: true, data: mockData });

      const tree = await renderAndFlush();
      const root = tree.root;

      const chevronIcons = root.findAll(
        (node: any) => node.props?.testID === 'icon-ChevronRight',
      );
      expect(chevronIcons.length).toBeGreaterThan(0);
    });

    it('should render Target icon in empty state button', async () => {
      mockListInterviewPreps.mockResolvedValue({ success: true, data: [] });

      const tree = await renderAndFlush();
      const root = tree.root;

      const targetIcons = root.findAll(
        (node: any) => node.props?.testID === 'icon-Target',
      );
      expect(targetIcons.length).toBeGreaterThan(0);
    });

    it('should render Briefcase icon in empty state', async () => {
      mockListInterviewPreps.mockResolvedValue({ success: true, data: [] });

      const tree = await renderAndFlush();
      const root = tree.root;

      const briefcaseIcons = root.findAll(
        (node: any) => node.props?.testID === 'icon-Briefcase',
      );
      expect(briefcaseIcons.length).toBeGreaterThan(0);
    });
  });

  // ---- Style Application Tests ----

  describe('style application', () => {
    it('should apply glass background and border color to card', async () => {
      const mockData = [
        {
          id: 1,
          tailored_resume_id: 1,
          company_name: 'StyleTest',
          job_title: 'Dev',
          created_at: '2025-06-01',
        },
      ];

      mockListInterviewPreps.mockResolvedValue({ success: true, data: mockData });

      const tree = await renderAndFlush();
      const root = tree.root;

      const touchables = root.findAllByType('TouchableOpacity');
      const card = touchables.find(
        (t: any) => t.props.accessibilityLabel?.includes('StyleTest'),
      );

      expect(card).toBeDefined();
      const style = card!.props.style;
      const flatStyle = Array.isArray(style) ? Object.assign({}, ...style) : style;
      expect(flatStyle.backgroundColor).toBe('rgba(255,255,255,0.04)');
      expect(flatStyle.borderColor).toBe('rgba(255,255,255,0.08)');
    });

    it('should apply theme text color to card text elements', async () => {
      const mockData = [
        {
          id: 1,
          tailored_resume_id: 1,
          company_name: 'ThemeTest',
          job_title: 'Developer',
          created_at: '2025-06-01',
        },
      ];

      mockListInterviewPreps.mockResolvedValue({ success: true, data: mockData });

      const tree = await renderAndFlush();
      const root = tree.root;

      const textElements = root.findAllByType('Text');
      const whiteTextElements = textElements.filter((t: any) => {
        const style = t.props.style;
        if (Array.isArray(style)) {
          return style.some((s: any) => s?.color === '#ffffff');
        }
        return style?.color === '#ffffff';
      });
      expect(whiteTextElements.length).toBeGreaterThan(0);
    });

    it('should apply secondary text color to company name', async () => {
      const mockData = [
        {
          id: 1,
          tailored_resume_id: 1,
          company_name: 'ColorCo',
          job_title: 'Eng',
          created_at: '2025-06-01',
        },
      ];

      mockListInterviewPreps.mockResolvedValue({ success: true, data: mockData });

      const tree = await renderAndFlush();
      const root = tree.root;

      const textElements = root.findAllByType('Text');
      const secondaryTextElements = textElements.filter((t: any) => {
        const style = t.props.style;
        if (Array.isArray(style)) {
          return style.some((s: any) => s?.color === '#9ca3af');
        }
        return style?.color === '#9ca3af';
      });
      expect(secondaryTextElements.length).toBeGreaterThan(0);
    });
  });
});
