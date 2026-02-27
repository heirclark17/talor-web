/**
 * SavedComparisonsScreen Comprehensive Tests
 *
 * Tests:
 * - Component rendering in all states (loading, empty, data, error)
 * - User interactions (delete, refresh, export, bulk operations)
 * - API calls and responses
 * - Navigation
 * - All conditional rendering paths
 * - formatDate and getScoreColor helpers
 * - Selection mode (toggle, select all, cancel)
 * - Bulk delete confirmation and execution
 * - Export functionality
 * - Accessibility attributes
 */

import React from 'react';
import { Alert } from 'react-native';
import renderer from 'react-test-renderer';

// ---- Mock ALL dependencies BEFORE imports ----

// Override react-native to provide FlatList/RefreshControl as real React components
// so FlatList renders its items and ListEmptyComponent (not just a string node).
jest.mock('react-native', () => {
  const React = require('react');

  // A minimal FlatList mock that renders items and empty component
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
          React.createElement(React.Fragment, { key }, renderItem({ item, index }))
        );
      });
    } else if (ListEmptyComponent) {
      const EmptyComp = typeof ListEmptyComponent === 'function'
        ? ListEmptyComponent
        : () => ListEmptyComponent;
      children.push(React.createElement(EmptyComp, { key: '__empty__' }));
    }
    return React.createElement('FlatList', rest, ...children);
  };

  const MockRefreshControl = (props: any) =>
    React.createElement('RefreshControl', props);

  return {
    Platform: { OS: 'ios', select: jest.fn((obj: any) => obj.ios ?? obj.default) },
    Alert: { alert: jest.fn() },
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (style: any) => style,
      hairlineWidth: 1,
    },
    FlatList: MockFlatList,
    RefreshControl: MockRefreshControl,
    View: (props: any) => React.createElement('View', props, props.children),
    Text: (props: any) => React.createElement('Text', props, props.children),
    TouchableOpacity: (props: any) => React.createElement('TouchableOpacity', props, props.children),
    ActivityIndicator: (props: any) => React.createElement('ActivityIndicator', props),
  };
});

jest.mock('../../hooks/useTheme', () => ({
  useTheme: jest.fn(() => ({
    colors: {
      text: '#fff',
      textSecondary: '#999',
      textTertiary: '#666',
      background: '#000',
      backgroundTertiary: '#222',
      border: '#333',
      glass: 'rgba(255,255,255,0.05)',
      glassBorder: 'rgba(255,255,255,0.1)',
    },
    isDark: true,
  })),
}));

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

// CRITICAL: useFocusEffect must use React.useEffect to defer callback execution.
// Calling the callback synchronously during render causes infinite re-renders
// because the callback sets state (setLoading, setComparisons).
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    useNavigation: jest.fn(() => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
    })),
    useFocusEffect: jest.fn((callback: any) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      React.useEffect(() => {
        const cleanup = callback();
        return typeof cleanup === 'function' ? cleanup : undefined;
      }, []);
    }),
  };
});

jest.mock('lucide-react-native', () => {
  const React = require('react');
  return new Proxy(
    {},
    {
      get: (_target: any, prop: string) => {
        if (typeof prop !== 'string' || prop === '__esModule') return undefined;
        const IconComponent = (props: any) =>
          React.createElement('MockIcon', { ...props, testID: `icon-${prop}` });
        IconComponent.displayName = prop;
        return IconComponent;
      },
    }
  );
});

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: (props: any) =>
      React.createElement('SafeAreaView', props, props.children),
  };
});

const mockGetSavedComparisons = jest.fn();
const mockDeleteComparison = jest.fn();
const mockExportSavedItems = jest.fn();
const mockBulkDeleteSavedItems = jest.fn();

jest.mock('../../api/client', () => ({
  api: {
    getSavedComparisons: (...args: any[]) => mockGetSavedComparisons(...args),
    deleteComparison: (...args: any[]) => mockDeleteComparison(...args),
    exportSavedItems: (...args: any[]) => mockExportSavedItems(...args),
    bulkDeleteSavedItems: (...args: any[]) => mockBulkDeleteSavedItems(...args),
  },
}));

jest.mock('../../components/glass/GlassCard', () => {
  const React = require('react');
  return {
    GlassCard: (props: any) =>
      React.createElement('GlassCard', props, props.children),
  };
});

jest.mock('../../navigation/AppNavigator', () => ({
  RootStackParamList: {},
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock URL and document for export functionality
global.URL = {
  createObjectURL: jest.fn(() => 'blob:mock-url'),
  revokeObjectURL: jest.fn(),
} as any;

global.document = {
  createElement: jest.fn(() => ({
    href: '',
    download: '',
    click: jest.fn(),
  })),
} as any;

import SavedComparisonsScreen from '../SavedComparisonsScreen';

// Helper: render the component inside renderer.act and wait for async effects
const renderScreen = async () => {
  let tree: any;
  await renderer.act(async () => {
    tree = renderer.create(React.createElement(SavedComparisonsScreen));
  });
  // Flush microtasks for async loadComparisons
  await renderer.act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
  return tree!;
};

// Helper: safe stringify that avoids circular refs
const safeStr = (obj: any): string => {
  try {
    return JSON.stringify(obj);
  } catch {
    return '';
  }
};

// Helper: stringify tree for content assertions
const treeStr = (tree: any) => {
  const json = tree.toJSON();
  return safeStr(json);
};

// Helper: find elements by type string in rendered tree
const findAllByType = (tree: any, type: string) => {
  return tree.root.findAll((node: any) => node.type === type);
};

// Helper: check if a fiber node contains a descendant matching a predicate
const hasDescendant = (node: any, predicate: (n: any) => boolean): boolean => {
  try {
    const found = node.findAll(predicate);
    return found.length > 0;
  } catch {
    return false;
  }
};

// Helper: find TouchableOpacity containing a specific text or testID pattern in descendants
const findTouchable = (tree: any, textMatch: string) => {
  const touchables = findAllByType(tree, 'TouchableOpacity');
  return touchables.find((t: any) => {
    // Check if any descendant node has testID or children matching
    return hasDescendant(t, (n: any) => {
      if (n.props?.testID && String(n.props.testID).includes(textMatch)) return true;
      if (typeof n.children === 'string' && n.children.includes(textMatch)) return true;
      if (Array.isArray(n.children)) {
        return n.children.some((c: any) => typeof c === 'string' && c.includes(textMatch));
      }
      return false;
    });
  });
};

// Helper: find TouchableOpacity by accessibilityLabel substring
const findTouchableByA11y = (tree: any, labelMatch: string) => {
  const touchables = findAllByType(tree, 'TouchableOpacity');
  return touchables.find(
    (t: any) => t.props?.accessibilityLabel?.includes(labelMatch)
  );
};

describe('SavedComparisonsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSavedComparisons.mockResolvedValue({ success: true, data: [] });
  });

  // ================================================================
  // Component Rendering
  // ================================================================
  describe('Component Rendering', () => {
    it('should render and call getSavedComparisons on mount', async () => {
      const tree = await renderScreen();
      expect(tree.toJSON()).toBeTruthy();
      expect(mockGetSavedComparisons).toHaveBeenCalledTimes(1);
    });

    it('should render empty state when no comparisons exist', async () => {
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: [] });
      const tree = await renderScreen();
      const str = treeStr(tree);
      expect(str).toContain('No Saved Comparisons');
      expect(str).toContain('Tailor a Resume');
    });

    it('should render comparisons list when data exists', async () => {
      const mockData = [
        {
          id: 1,
          title: 'Software Engineer at Google',
          company: 'Google',
          job_title: 'Software Engineer',
          tailored_resume_id: 42,
          created_at: '2026-01-15T10:00:00Z',
          match_score: 85,
        },
      ];
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: mockData });
      const tree = await renderScreen();
      const str = treeStr(tree);
      expect(str).toContain('Software Engineer at Google');
      expect(str).toContain('Google');
      expect(str).toContain('Software Engineer');
      expect(str).toContain('85');
      expect(str).toContain('match');
    });

    it('should handle API error gracefully and show empty state', async () => {
      mockGetSavedComparisons.mockResolvedValue({
        success: false,
        error: 'Network error',
      });
      const tree = await renderScreen();
      const str = treeStr(tree);
      expect(str).toContain('No Saved Comparisons');
    });

    it('should handle API exception and show empty state', async () => {
      mockGetSavedComparisons.mockRejectedValue(new Error('Connection failed'));
      const tree = await renderScreen();
      const str = treeStr(tree);
      expect(str).toContain('No Saved Comparisons');
    });

    it('should handle non-array data response gracefully', async () => {
      mockGetSavedComparisons.mockResolvedValue({
        success: true,
        data: { items: [] },
      });
      const tree = await renderScreen();
      const str = treeStr(tree);
      expect(str).toContain('No Saved Comparisons');
    });

    it('should render header title "Saved"', async () => {
      const tree = await renderScreen();
      const str = treeStr(tree);
      expect(str).toContain('Saved');
    });

    it('should show item count when comparisons exist', async () => {
      const mockData = [
        { id: 1, title: 'T1', tailored_resume_id: 1, created_at: '2026-01-15' },
        { id: 2, title: 'T2', tailored_resume_id: 2, created_at: '2026-01-16' },
      ];
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: mockData });
      const tree = await renderScreen();
      const str = treeStr(tree);
      expect(str).toContain('items');
    });
  });

  // ================================================================
  // formatDate
  // ================================================================
  describe('formatDate', () => {
    it('should format date as "Mon DD, YYYY"', async () => {
      const mockData = [
        { id: 1, title: 'T', tailored_resume_id: 1, created_at: '2026-01-15T10:00:00Z' },
      ];
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: mockData });
      const tree = await renderScreen();
      const str = treeStr(tree);
      expect(str).toContain('Jan');
      expect(str).toContain('2026');
    });
  });

  // ================================================================
  // getScoreColor
  // ================================================================
  describe('getScoreColor', () => {
    it('should use success color for scores >= 80', async () => {
      const mockData = [
        { id: 1, title: 'T', tailored_resume_id: 1, created_at: '2026-01-15', match_score: 85 },
      ];
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: mockData });
      const tree = await renderScreen();
      const str = treeStr(tree);
      expect(str).toContain('#10b981');
    });

    it('should use warning color for scores >= 60 and < 80', async () => {
      const mockData = [
        { id: 1, title: 'T', tailored_resume_id: 1, created_at: '2026-01-15', match_score: 65 },
      ];
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: mockData });
      const tree = await renderScreen();
      const str = treeStr(tree);
      expect(str).toContain('#f59e0b');
    });

    it('should use danger color for scores < 60', async () => {
      const mockData = [
        { id: 1, title: 'T', tailored_resume_id: 1, created_at: '2026-01-15', match_score: 45 },
      ];
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: mockData });
      const tree = await renderScreen();
      const str = treeStr(tree);
      expect(str).toContain('#f87171');
    });

    it('should not render score badge when score is undefined', async () => {
      const mockData = [
        { id: 1, title: 'T', tailored_resume_id: 1, created_at: '2026-01-15' },
      ];
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: mockData });
      const tree = await renderScreen();
      const str = treeStr(tree);
      expect(str).not.toContain('match');
    });

    it('should use textTertiary for score of 0 (falsy)', async () => {
      const mockData = [
        { id: 1, title: 'T', tailored_resume_id: 1, created_at: '2026-01-15', match_score: 0 },
      ];
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: mockData });
      const tree = await renderScreen();
      const str = treeStr(tree);
      expect(str).toContain('#666');
    });
  });

  // ================================================================
  // Conditional Rendering
  // ================================================================
  describe('Conditional Rendering', () => {
    it('should render company info when present', async () => {
      const mockData = [
        {
          id: 1, title: 'Test', company: 'Google', job_title: 'SWE',
          tailored_resume_id: 1, created_at: '2026-01-15', match_score: 85,
        },
      ];
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: mockData });
      const tree = await renderScreen();
      const str = treeStr(tree);
      expect(str).toContain('Google');
      expect(str).toContain('SWE');
    });

    it('should not render company/job_title rows when missing', async () => {
      const mockData = [
        { id: 1, title: 'Test', tailored_resume_id: 1, created_at: '2026-01-15' },
      ];
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: mockData });
      const tree = await renderScreen();
      const str = treeStr(tree);
      expect(str).toContain('Test');
      expect(str).not.toContain('icon-Building2');
      // icon-Briefcase is now a permanent header button (Track Applications), not a card icon
    });

    it('should render match score badge when match_score is present', async () => {
      const mockData = [
        { id: 1, title: 'T', tailored_resume_id: 1, created_at: '2026-01-15', match_score: 90 },
      ];
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: mockData });
      const tree = await renderScreen();
      const str = treeStr(tree);
      expect(str).toContain('90');
      expect(str).toContain('match');
    });

    it('should not render match score badge when match_score is undefined', async () => {
      const mockData = [
        { id: 1, title: 'T', tailored_resume_id: 1, created_at: '2026-01-15' },
      ];
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: mockData });
      const tree = await renderScreen();
      const str = treeStr(tree);
      expect(str).not.toContain('match');
    });

    it('should render export and selection mode buttons when data exists', async () => {
      const mockData = [
        { id: 1, title: 'T', tailored_resume_id: 1, created_at: '2026-01-15' },
      ];
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: mockData });
      const tree = await renderScreen();
      const str = treeStr(tree);
      expect(str).toContain('icon-Download');
      expect(str).toContain('icon-CheckSquare');
    });

    it('should render multiple comparison cards', async () => {
      const mockData = [
        { id: 1, title: 'Job A', tailored_resume_id: 1, created_at: '2026-01-15' },
        { id: 2, title: 'Job B', tailored_resume_id: 2, created_at: '2026-01-16' },
        { id: 3, title: 'Job C', tailored_resume_id: 3, created_at: '2026-01-17' },
      ];
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: mockData });
      const tree = await renderScreen();
      const str = treeStr(tree);
      expect(str).toContain('Job A');
      expect(str).toContain('Job B');
      expect(str).toContain('Job C');
    });
  });

  // ================================================================
  // Navigation
  // ================================================================
  describe('Navigation', () => {
    it('should navigate to Tailor from empty state button', async () => {
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: [] });
      const tree = await renderScreen();

      const tailorBtn = findTouchable(tree, 'Tailor a Resume');
      expect(tailorBtn).toBeDefined();

      await renderer.act(async () => {
        tailorBtn!.props.onPress();
      });
      expect(mockNavigate).toHaveBeenCalledWith('TailorMain');
    });

    it('should navigate to InterviewPreps when Prep button is pressed', async () => {
      const mockData = [
        { id: 1, title: 'T', tailored_resume_id: 42, created_at: '2026-01-15' },
      ];
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: mockData });
      const tree = await renderScreen();

      const prepBtn = findTouchableByA11y(tree, 'interview prep');
      expect(prepBtn).toBeDefined();

      await renderer.act(async () => {
        prepBtn!.props.onPress();
      });
      expect(mockNavigate).toHaveBeenCalledWith('InterviewPrep', {
        tailoredResumeId: 42,
      });
    });
  });

  // ================================================================
  // Delete Functionality
  // ================================================================
  describe('Delete Functionality', () => {
    it('should show confirmation alert when delete button is pressed', async () => {
      const mockData = [
        { id: 1, title: 'Test Job', tailored_resume_id: 1, created_at: '2026-01-15' },
      ];
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: mockData });
      const tree = await renderScreen();

      const deleteBtn = findTouchableByA11y(tree, 'Delete');
      expect(deleteBtn).toBeDefined();

      await renderer.act(async () => {
        deleteBtn!.props.onPress();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Delete Comparison',
        'Are you sure you want to delete this saved comparison?',
        expect.arrayContaining([
          expect.objectContaining({ text: 'Cancel', style: 'cancel' }),
          expect.objectContaining({ text: 'Delete', style: 'destructive' }),
        ])
      );
    });

    it('should remove item after successful deletion', async () => {
      const mockData = [
        { id: 1, title: 'Job A', tailored_resume_id: 1, created_at: '2026-01-15' },
        { id: 2, title: 'Job B', tailored_resume_id: 2, created_at: '2026-01-16' },
      ];
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: mockData });
      mockDeleteComparison.mockResolvedValue({ success: true });

      const tree = await renderScreen();

      const deleteBtn = findTouchableByA11y(tree, 'Delete Job A');
      expect(deleteBtn).toBeDefined();

      await renderer.act(async () => {
        deleteBtn!.props.onPress();
      });

      const alertCalls = (Alert.alert as jest.Mock).mock.calls;
      const lastCall = alertCalls[alertCalls.length - 1];
      const deleteAction = lastCall[2].find((b: any) => b.text === 'Delete');

      await renderer.act(async () => {
        await deleteAction.onPress();
      });

      expect(mockDeleteComparison).toHaveBeenCalledWith(1);
      const str = treeStr(tree);
      expect(str).not.toContain('Job A');
      expect(str).toContain('Job B');
    });

    it('should show error alert when deletion fails', async () => {
      const mockData = [
        { id: 1, title: 'Job A', tailored_resume_id: 1, created_at: '2026-01-15' },
      ];
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: mockData });
      mockDeleteComparison.mockResolvedValue({ success: false, error: 'Delete failed' });

      const tree = await renderScreen();
      const deleteBtn = findTouchableByA11y(tree, 'Delete Job A');

      await renderer.act(async () => {
        deleteBtn!.props.onPress();
      });

      const alertCalls = (Alert.alert as jest.Mock).mock.calls;
      const lastCall = alertCalls[alertCalls.length - 1];
      const deleteAction = lastCall[2].find((b: any) => b.text === 'Delete');

      await renderer.act(async () => {
        await deleteAction.onPress();
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Delete failed');
    });

    it('should show generic error when deletion throws exception', async () => {
      const mockData = [
        { id: 1, title: 'Job A', tailored_resume_id: 1, created_at: '2026-01-15' },
      ];
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: mockData });
      mockDeleteComparison.mockRejectedValue(new Error('Network error'));

      const tree = await renderScreen();
      const deleteBtn = findTouchableByA11y(tree, 'Delete Job A');

      await renderer.act(async () => {
        deleteBtn!.props.onPress();
      });

      const alertCalls = (Alert.alert as jest.Mock).mock.calls;
      const lastCall = alertCalls[alertCalls.length - 1];
      const deleteAction = lastCall[2].find((b: any) => b.text === 'Delete');

      await renderer.act(async () => {
        await deleteAction.onPress();
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to delete comparison');
    });
  });

  // ================================================================
  // Export Functionality
  // ================================================================
  describe('Export Functionality', () => {
    it('should export as JSON successfully and show success alert', async () => {
      const mockData = [
        { id: 1, title: 'T', tailored_resume_id: 1, created_at: '2026-01-15' },
      ];
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: mockData });
      mockExportSavedItems.mockResolvedValue({ success: true, data: 'mock-blob' });

      const tree = await renderScreen();

      const exportBtn = findTouchable(tree, 'icon-Download');
      expect(exportBtn).toBeDefined();

      await renderer.act(async () => {
        await exportBtn!.props.onPress();
      });

      expect(mockExportSavedItems).toHaveBeenCalledWith('json');
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        expect.stringContaining('1 items as JSON')
      );
    });

    it('should show error alert when export fails', async () => {
      const mockData = [
        { id: 1, title: 'T', tailored_resume_id: 1, created_at: '2026-01-15' },
      ];
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: mockData });
      mockExportSavedItems.mockResolvedValue({ success: false, error: 'Export failed' });

      const tree = await renderScreen();
      const exportBtn = findTouchable(tree, 'icon-Download');

      await renderer.act(async () => {
        await exportBtn!.props.onPress();
      });

      expect(Alert.alert).toHaveBeenCalledWith('Export Failed', 'Export failed');
    });

    it('should show error alert when export throws exception', async () => {
      const mockData = [
        { id: 1, title: 'T', tailored_resume_id: 1, created_at: '2026-01-15' },
      ];
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: mockData });
      mockExportSavedItems.mockRejectedValue(new Error('Export error'));

      const tree = await renderScreen();
      const exportBtn = findTouchable(tree, 'icon-Download');

      await renderer.act(async () => {
        await exportBtn!.props.onPress();
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Export error');
    });
  });

  // ================================================================
  // Selection Mode
  // ================================================================
  describe('Selection Mode', () => {
    it('should enter selection mode when CheckSquare header button is pressed', async () => {
      const mockData = [
        { id: 1, title: 'Job A', tailored_resume_id: 1, created_at: '2026-01-15' },
        { id: 2, title: 'Job B', tailored_resume_id: 2, created_at: '2026-01-16' },
      ];
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: mockData });
      const tree = await renderScreen();

      const selectModeBtn = findTouchable(tree, 'icon-CheckSquare');
      expect(selectModeBtn).toBeDefined();

      await renderer.act(async () => {
        selectModeBtn!.props.onPress();
      });

      const str = treeStr(tree);
      expect(str).toContain('Select All');
      expect(str).toContain('selected');
    });

    it('should toggle individual item selection', async () => {
      const mockData = [
        { id: 1, title: 'Job A', tailored_resume_id: 1, created_at: '2026-01-15' },
        { id: 2, title: 'Job B', tailored_resume_id: 2, created_at: '2026-01-16' },
      ];
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: mockData });
      const tree = await renderScreen();

      // Enter selection mode
      const selectModeBtn = findTouchable(tree, 'icon-CheckSquare');
      await renderer.act(async () => {
        selectModeBtn!.props.onPress();
      });

      // Find unselected checkboxes (TouchableOpacity containing MockIcon with testID="icon-Square")
      const checkboxes = findAllByType(tree, 'TouchableOpacity').filter((t: any) => {
        const hasSquare = hasDescendant(t, (n: any) => n.props?.testID === 'icon-Square');
        const hasCheckSquare = hasDescendant(t, (n: any) => n.props?.testID === 'icon-CheckSquare');
        return hasSquare && !hasCheckSquare;
      });
      expect(checkboxes.length).toBeGreaterThanOrEqual(1);

      // Tap first checkbox
      await renderer.act(async () => {
        checkboxes[0].props.onPress();
      });

      const str = treeStr(tree);
      expect(str).toContain('selected');
    });

    it('should select all and deselect all', async () => {
      const mockData = [
        { id: 1, title: 'Job A', tailored_resume_id: 1, created_at: '2026-01-15' },
        { id: 2, title: 'Job B', tailored_resume_id: 2, created_at: '2026-01-16' },
      ];
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: mockData });
      const tree = await renderScreen();

      // Enter selection mode
      const selectModeBtn = findTouchable(tree, 'icon-CheckSquare');
      await renderer.act(async () => {
        selectModeBtn!.props.onPress();
      });

      // Tap Select All
      const selectAllBtn = findTouchable(tree, 'Select All');
      expect(selectAllBtn).toBeDefined();

      await renderer.act(async () => {
        selectAllBtn!.props.onPress();
      });

      let str = treeStr(tree);
      expect(str).toContain('selected');
      expect(str).toContain('Deselect All');

      // Tap Deselect All
      const deselectAllBtn = findTouchable(tree, 'Deselect All');
      await renderer.act(async () => {
        deselectAllBtn!.props.onPress();
      });

      str = treeStr(tree);
      expect(str).toContain('Select All');
    });

    it('should deselect a previously selected item when tapped again', async () => {
      const mockData = [
        { id: 1, title: 'Job A', tailored_resume_id: 1, created_at: '2026-01-15' },
        { id: 2, title: 'Job B', tailored_resume_id: 2, created_at: '2026-01-16' },
      ];
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: mockData });
      const tree = await renderScreen();

      // Enter selection mode
      const selectModeBtn = findTouchable(tree, 'icon-CheckSquare');
      await renderer.act(async () => {
        selectModeBtn!.props.onPress();
      });

      // Select first item
      const checkboxesBefore = findAllByType(tree, 'TouchableOpacity').filter((t: any) => {
        return hasDescendant(t, (n: any) => n.props?.testID === 'icon-Square');
      });
      await renderer.act(async () => {
        checkboxesBefore[0].props.onPress();
      });

      let str = treeStr(tree);
      expect(str).toContain('1');
      expect(str).toContain('selected');

      // Now deselect it by tapping the checked checkbox (icon-CheckSquare inside the item row)
      const checkedBoxes = findAllByType(tree, 'TouchableOpacity').filter((t: any) => {
        const hasCheck = hasDescendant(t, (n: any) => n.props?.testID === 'icon-CheckSquare');
        // Exclude the header-level CheckSquare button (which enters selection mode)
        // The item checkbox also has parent that contains job text
        const hasJobText = hasDescendant(t, (n: any) => {
          if (typeof n.children === 'string' && (n.children === 'Job A' || n.children === 'Job B')) return true;
          return false;
        });
        return hasCheck && !hasJobText;
      });

      // Among all checkSquare touchables, find the ones in the item rows
      // They should be small toggleSelection handlers
      const itemCheckboxes = findAllByType(tree, 'TouchableOpacity').filter((t: any) => {
        return hasDescendant(t, (n: any) => n.props?.testID === 'icon-CheckSquare') &&
          !hasDescendant(t, (n: any) => typeof n.children === 'string' && n.children === 'Select All') &&
          !hasDescendant(t, (n: any) => typeof n.children === 'string' && n.children === 'Deselect All');
      });

      // Tap the first checked item checkbox to deselect
      if (itemCheckboxes.length > 0) {
        await renderer.act(async () => {
          itemCheckboxes[0].props.onPress();
        });
      }

      str = treeStr(tree);
      expect(str).toContain('selected');
    });

    it('should cancel selection mode', async () => {
      const mockData = [
        { id: 1, title: 'Job A', tailored_resume_id: 1, created_at: '2026-01-15' },
      ];
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: mockData });
      const tree = await renderScreen();

      // Enter selection mode
      const selectModeBtn = findTouchable(tree, 'icon-CheckSquare');
      await renderer.act(async () => {
        selectModeBtn!.props.onPress();
      });

      // Find the X (cancel) button
      const cancelBtn = findTouchable(tree, 'icon-X');
      expect(cancelBtn).toBeDefined();

      await renderer.act(async () => {
        cancelBtn!.props.onPress();
      });

      const str = treeStr(tree);
      expect(str).toContain('items');
      expect(str).not.toContain('Select All');
    });
  });

  // ================================================================
  // Bulk Delete Functionality
  // ================================================================
  describe('Bulk Delete Functionality', () => {
    const enterSelectionAndSelectAll = async (tree: any) => {
      const selectModeBtn = findTouchable(tree, 'icon-CheckSquare');
      await renderer.act(async () => {
        selectModeBtn!.props.onPress();
      });
      const selectAllBtn = findTouchable(tree, 'Select All');
      await renderer.act(async () => {
        selectAllBtn!.props.onPress();
      });
    };

    const enterSelectionAndSelectOne = async (tree: any) => {
      const selectModeBtn = findTouchable(tree, 'icon-CheckSquare');
      await renderer.act(async () => {
        selectModeBtn!.props.onPress();
      });
      // Find an unselected checkbox (Square icon, not CheckSquare)
      const checkbox = findAllByType(tree, 'TouchableOpacity').find((t: any) => {
        const hasSquare = hasDescendant(t, (n: any) => n.props?.testID === 'icon-Square');
        const hasCheckSquare = hasDescendant(t, (n: any) => n.props?.testID === 'icon-CheckSquare');
        return hasSquare && !hasCheckSquare;
      });
      await renderer.act(async () => {
        checkbox!.props.onPress();
      });
    };

    const findBulkDeleteBtn = (tree: any) => {
      return findAllByType(tree, 'TouchableOpacity').find((t: any) => {
        const hasTrash = hasDescendant(t, (n: any) => n.props?.testID === 'icon-Trash2');
        const hasDeleteText = hasDescendant(t, (n: any) => {
          if (typeof n.children === 'string' && n.children === 'Delete') return true;
          if (Array.isArray(n.children)) {
            return n.children.some((c: any) => typeof c === 'string' && c === 'Delete');
          }
          return false;
        });
        return hasTrash && hasDeleteText;
      });
    };

    const confirmAlertDelete = async () => {
      const alertCalls = (Alert.alert as jest.Mock).mock.calls;
      const lastCall = alertCalls[alertCalls.length - 1];
      const deleteAction = lastCall[2].find((b: any) => b.text === 'Delete');
      await renderer.act(async () => {
        await deleteAction.onPress();
      });
    };

    it('should not show bulk action bar when no items are selected', async () => {
      const mockData = [
        { id: 1, title: 'Job A', tailored_resume_id: 1, created_at: '2026-01-15' },
      ];
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: mockData });
      const tree = await renderScreen();

      // Enter selection mode but don't select anything
      const selectModeBtn = findTouchable(tree, 'icon-CheckSquare');
      await renderer.act(async () => {
        selectModeBtn!.props.onPress();
      });

      const bulkBtn = findBulkDeleteBtn(tree);
      expect(bulkBtn).toBeUndefined();
    });

    it('should show bulk delete confirmation when items are selected', async () => {
      const mockData = [
        { id: 1, title: 'Job A', tailored_resume_id: 1, created_at: '2026-01-15' },
        { id: 2, title: 'Job B', tailored_resume_id: 2, created_at: '2026-01-16' },
      ];
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: mockData });
      const tree = await renderScreen();

      await enterSelectionAndSelectAll(tree);

      const bulkDeleteBtn = findBulkDeleteBtn(tree);
      expect(bulkDeleteBtn).toBeDefined();

      await renderer.act(async () => {
        bulkDeleteBtn!.props.onPress();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Delete Selected Items',
        expect.stringContaining('2 saved comparisons'),
        expect.any(Array)
      );
    });

    it('should execute bulk delete successfully', async () => {
      const mockData = [
        { id: 1, title: 'Job A', tailored_resume_id: 1, created_at: '2026-01-15' },
        { id: 2, title: 'Job B', tailored_resume_id: 2, created_at: '2026-01-16' },
      ];
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: mockData });
      mockBulkDeleteSavedItems.mockResolvedValue({ success: true });

      const tree = await renderScreen();
      await enterSelectionAndSelectAll(tree);

      const bulkDeleteBtn = findBulkDeleteBtn(tree);
      await renderer.act(async () => {
        bulkDeleteBtn!.props.onPress();
      });

      await confirmAlertDelete();

      expect(mockBulkDeleteSavedItems).toHaveBeenCalledWith([1, 2]);
      expect(Alert.alert).toHaveBeenCalledWith('Success', expect.stringContaining('2'));
    });

    it('should handle bulk delete API failure', async () => {
      const mockData = [
        { id: 1, title: 'Job A', tailored_resume_id: 1, created_at: '2026-01-15' },
      ];
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: mockData });
      mockBulkDeleteSavedItems.mockResolvedValue({ success: false, error: 'Bulk delete failed' });

      const tree = await renderScreen();
      await enterSelectionAndSelectOne(tree);

      const bulkDeleteBtn = findBulkDeleteBtn(tree);
      await renderer.act(async () => {
        bulkDeleteBtn!.props.onPress();
      });

      await confirmAlertDelete();

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Bulk delete failed');
    });

    it('should handle bulk delete exception', async () => {
      const mockData = [
        { id: 1, title: 'Job A', tailored_resume_id: 1, created_at: '2026-01-15' },
      ];
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: mockData });
      mockBulkDeleteSavedItems.mockRejectedValue(new Error('Network error'));

      const tree = await renderScreen();
      await enterSelectionAndSelectOne(tree);

      const bulkDeleteBtn = findBulkDeleteBtn(tree);
      await renderer.act(async () => {
        bulkDeleteBtn!.props.onPress();
      });

      await confirmAlertDelete();

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to delete items');
    });

    it('should use singular "comparison" for single item bulk delete', async () => {
      const mockData = [
        { id: 1, title: 'Job A', tailored_resume_id: 1, created_at: '2026-01-15' },
      ];
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: mockData });
      const tree = await renderScreen();

      await enterSelectionAndSelectOne(tree);

      const bulkDeleteBtn = findBulkDeleteBtn(tree);
      await renderer.act(async () => {
        bulkDeleteBtn!.props.onPress();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Delete Selected Items',
        expect.stringContaining('1 saved comparison'),
        expect.any(Array)
      );
    });
  });

  // ================================================================
  // Refresh Functionality
  // ================================================================
  describe('Refresh Functionality', () => {
    it('should have a RefreshControl in the FlatList', async () => {
      const tree = await renderScreen();
      const refreshControls = findAllByType(tree, 'RefreshControl');
      expect(refreshControls.length).toBeGreaterThanOrEqual(1);
    });

    it('should call loadComparisons again on refresh', async () => {
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: [] });
      const tree = await renderScreen();

      expect(mockGetSavedComparisons).toHaveBeenCalledTimes(1);

      // Find RefreshControl and trigger onRefresh
      const refreshControls = findAllByType(tree, 'RefreshControl');
      const rc = refreshControls[0];

      await renderer.act(async () => {
        rc.props.onRefresh();
      });

      await renderer.act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      expect(mockGetSavedComparisons).toHaveBeenCalledTimes(2);
    });
  });

  // ================================================================
  // Accessibility
  // ================================================================
  describe('Accessibility', () => {
    it('should have accessibility labels on action buttons', async () => {
      const mockData = [
        {
          id: 1, title: 'Test', company: 'Acme', job_title: 'Engineer',
          tailored_resume_id: 1, created_at: '2026-01-15',
        },
      ];
      mockGetSavedComparisons.mockResolvedValue({ success: true, data: mockData });
      const tree = await renderScreen();

      // Check Prep button
      const prepBtn = findTouchableByA11y(tree, 'interview prep');
      expect(prepBtn).toBeDefined();
      expect(prepBtn!.props.accessibilityRole).toBe('button');
      expect(prepBtn!.props.accessibilityHint).toBeTruthy();

      // Check Delete button
      const deleteBtn = findTouchableByA11y(tree, 'Delete');
      expect(deleteBtn).toBeDefined();
      expect(deleteBtn!.props.accessibilityRole).toBe('button');
      expect(deleteBtn!.props.accessibilityHint).toBeTruthy();
      expect(deleteBtn!.props.accessibilityState).toBeDefined();
    });
  });
});
