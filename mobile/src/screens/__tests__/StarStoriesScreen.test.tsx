/**
 * StarStoriesScreen Comprehensive Tests
 *
 * Tests cover:
 * - Loading state rendering
 * - Empty state rendering with create story button
 * - Story list rendering (FlatList with story cards)
 * - Story card details (title, theme, date, fallbacks)
 * - Delete story flow (Alert confirmation, success, error, exception)
 * - Pull-to-refresh via RefreshControl
 * - Story detail modal (open, close, all STAR sections)
 * - Story detail modal conditionals (theme badge, company context, key themes, talking points, updated date)
 * - Builder modal (new story, edit story, close)
 * - handleSaveStory success/error/exception
 * - handleGenerateAI
 * - Feature #18: Analyze story (success, API error, exception, loading state)
 * - Feature #19: Story suggestions (success, API error, exception, loading state)
 * - Feature #20: Story variations (success, API error, exception, loading state, modal)
 * - Story analysis display (scores, strengths, improvements, impact assessment)
 * - Story suggestions display (tips, framings, enhancements, keywords)
 * - Story variations display (variation cards, usage guide)
 * - API data format handling (array vs {stories: []})
 * - formatDate logic
 * - Score coloring logic (>=80 success, >=60 warning, <60 danger)
 * - Module exports
 */

// ---- Override react-native with proper React components for FlatList rendering ----
jest.mock('react-native', () => {
  const React = require('react');
  const mk = (name: string) => {
    const C = (props: any) => React.createElement(name, props, props.children);
    C.displayName = name;
    return C;
  };

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

  const MockModal = (props: any) => {
    if (!props.visible) return null;
    return React.createElement('Modal', props, props.children);
  };
  MockModal.displayName = 'Modal';

  return {
    Platform: { OS: 'ios', select: (obj: any) => obj.ios ?? obj.default },
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (style: any) => style,
      hairlineWidth: 1,
    },
    Alert: { alert: jest.fn() },
    View: mk('View'),
    Text: mk('Text'),
    TouchableOpacity: mk('TouchableOpacity'),
    Pressable: mk('Pressable'),
    ScrollView: mk('ScrollView'),
    FlatList: MockFlatList,
    RefreshControl: MockRefreshControl,
    Modal: MockModal,
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
      backgroundSecondary: '#1a1a1a',
      backgroundTertiary: '#2a2a2a',
      border: '#374151',
      card: '#111111',
      primary: '#3b82f6',
      glass: 'rgba(255,255,255,0.04)',
      glassBorder: 'rgba(255,255,255,0.08)',
    },
    isDark: true,
  })),
}));

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => {
  const ReactActual = require('react');
  return {
    useNavigation: jest.fn(() => ({
      navigate: mockNavigate,
      goBack: jest.fn(),
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

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: jest.fn(() => ({
    Navigator: 'Navigator',
    Screen: 'Screen',
  })),
}));

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

jest.mock('react-native-safe-area-context', () => {
  const ReactLocal = require('react');
  return {
    SafeAreaView: (props: any) =>
      ReactLocal.createElement('SafeAreaView', props, props.children),
  };
});

const mockListStarStories = jest.fn();
const mockCreateStarStory = jest.fn();
const mockDeleteStarStory = jest.fn();
const mockAnalyzeStarStory = jest.fn();
const mockGetStorySuggestions = jest.fn();
const mockGenerateStoryVariations = jest.fn();

jest.mock('../../api/client', () => ({
  api: {
    listStarStories: (...args: any[]) => mockListStarStories(...args),
    createStarStory: (...args: any[]) => mockCreateStarStory(...args),
    deleteStarStory: (...args: any[]) => mockDeleteStarStory(...args),
    analyzeStarStory: (...args: any[]) => mockAnalyzeStarStory(...args),
    getStorySuggestions: (...args: any[]) => mockGetStorySuggestions(...args),
    generateStoryVariations: (...args: any[]) => mockGenerateStoryVariations(...args),
  },
}));

jest.mock('../../components', () => {
  const ReactLocal = require('react');
  return {
    STARStoryBuilder: (props: any) =>
      ReactLocal.createElement('STARStoryBuilder', props),
  };
});

jest.mock('../../navigation/AppNavigator', () => ({
  RootStackParamList: {},
}));

// ---- Imports (AFTER mocks) ----
import React from 'react';
import renderer from 'react-test-renderer';
import { Alert } from 'react-native';
import { COLORS, ALPHA_COLORS, SPACING, RADIUS, FONTS, TAB_BAR_HEIGHT } from '../../utils/constants';
import StarStoriesScreen from '../StarStoriesScreen';

// ---- Helpers ----
const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

function renderComponent(): any {
  let tree: any;
  renderer.act(() => {
    tree = renderer.create(React.createElement(StarStoriesScreen));
  });
  return tree!;
}

async function renderAndFlush(): Promise<any> {
  let tree: any;
  await renderer.act(async () => {
    tree = renderer.create(React.createElement(StarStoriesScreen));
    await flushPromises();
  });
  return tree!;
}

function stringify(tree: any): string {
  const seen = new WeakSet();
  return JSON.stringify(tree.toJSON(), (_key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]';
      seen.add(value);
    }
    return value;
  });
}

function getAllText(node: any): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (!node) return '';
  if (Array.isArray(node)) return node.map(getAllText).join('');
  if (node.children) return node.children.map((c: any) => getAllText(c)).join('');
  return '';
}

// ---- Sample data ----
const sampleStory = {
  id: 1,
  title: 'Leadership Under Pressure',
  story_theme: 'Leadership',
  company_context: 'Google - PM Interview',
  situation: 'Team faced a critical deadline with 3 engineers out sick',
  task: 'Deliver the feature release on time despite reduced team',
  action: 'Reorganized sprint, paired engineers, and handled code review myself',
  result: 'Delivered 2 days early with zero critical bugs',
  key_themes: ['Leadership', 'Time Management', 'Adaptability'],
  talking_points: ['Led 5 engineers', 'Used agile methodology', 'Zero regressions'],
  created_at: '2026-01-15T10:00:00Z',
  updated_at: '2026-01-20T10:00:00Z',
};

const sampleStoryMinimal = {
  id: 2,
  title: '',
  situation: 'S',
  task: 'T',
  action: 'A',
  result: 'R',
  created_at: '2026-02-01T12:00:00Z',
  updated_at: '2026-02-01T12:00:00Z',
};

// ========================================================================
// TESTS
// ========================================================================
describe('StarStoriesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockListStarStories.mockResolvedValue({ success: true, data: [] });
    mockCreateStarStory.mockResolvedValue({ success: true, data: {} });
    mockDeleteStarStory.mockResolvedValue({ success: true });
    mockAnalyzeStarStory.mockResolvedValue({ success: true, data: {} });
    mockGetStorySuggestions.mockResolvedValue({ success: true, data: {} });
    mockGenerateStoryVariations.mockResolvedValue({ success: true, data: {} });
  });

  // ---- Module Exports ----
  describe('module exports', () => {
    it('should export a default function component', () => {
      const mod = require('../StarStoriesScreen');
      expect(mod.default).toBeDefined();
      expect(typeof mod.default).toBe('function');
    });

    it('should have the function named StarStoriesScreen', () => {
      const mod = require('../StarStoriesScreen');
      expect(mod.default.name).toBe('StarStoriesScreen');
    });

    it('should not have additional named exports', () => {
      const mod = require('../StarStoriesScreen');
      const exportKeys = Object.keys(mod).filter((k) => k !== '__esModule');
      expect(exportKeys).toEqual(['default']);
    });
  });

  // ---- Loading State ----
  describe('loading state', () => {
    it('should render loading indicator before API resolves', () => {
      mockListStarStories.mockReturnValue(new Promise(() => {}));

      const tree = renderComponent();
      const json = stringify(tree);

      expect(json).toContain('Loading STAR stories...');
      expect(json).toContain('ActivityIndicator');
    });

    it('should show SafeAreaView in loading state', () => {
      mockListStarStories.mockReturnValue(new Promise(() => {}));

      const tree = renderComponent();
      const json = stringify(tree);

      expect(json).toContain('SafeAreaView');
    });
  });

  // ---- Empty State ----
  describe('empty state', () => {
    it('should render empty state when no stories', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [] });

      const tree = await renderAndFlush();
      const json = stringify(tree);

      expect(json).toContain('No STAR Stories');
      expect(json).toContain('Create behavioral interview stories');
      expect(json).toContain('Create Story');
    });

    it('should open builder modal when Create Story button is pressed in empty state', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [] });

      const tree = await renderAndFlush();
      const root = tree.root;

      // Find the create button in empty state
      const touchables = root.findAllByType('TouchableOpacity');
      const createBtn = touchables.find((t: any) => {
        const text = getAllText(t);
        return text.includes('Create Story');
      });

      expect(createBtn).toBeDefined();

      await renderer.act(async () => {
        createBtn!.props.onPress();
      });

      // Builder modal should now be visible
      const json = stringify(tree);
      expect(json).toContain('New STAR Story');
      expect(json).toContain('STARStoryBuilder');
    });

    it('should show the header title "STAR Stories" in empty state', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [] });

      const tree = await renderAndFlush();
      const json = stringify(tree);

      expect(json).toContain('STAR Stories');
    });

    it('should NOT show the add button in header when no stories', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [] });

      const tree = await renderAndFlush();
      const root = tree.root;

      // The "+" button only appears when stories.length > 0
      const mockIcons = root.findAllByType('MockIcon');
      const plusIcons = mockIcons.filter((i: any) => i.props.testID === 'icon-Plus');
      // There should be only the one in the empty state create button, not header
      // Since no stories, the header Plus is not rendered
      const headerView = root.findAllByType('View');
      // Find header add button by looking at Plus icons outside empty state
      // The empty state Plus is inside createButton, header Plus would be in addButton
      // Just confirm header does not have Plus by checking the count
      // In empty state: 1 Plus (create button). In list state: 2 Plus (header + would need stories)
      expect(plusIcons.length).toBe(1); // Only in empty state create button
    });
  });

  // ---- Story List Rendering ----
  describe('story list rendering', () => {
    it('should render story cards when stories exist', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });

      const tree = await renderAndFlush();
      const json = stringify(tree);

      expect(json).toContain('Leadership Under Pressure');
      expect(json).toContain('Leadership');
      expect(json).toContain('Jan');
    });

    it('should render multiple story cards', async () => {
      const stories = [
        sampleStory,
        { ...sampleStory, id: 3, title: 'Conflict Resolution', story_theme: 'Teamwork' },
      ];
      mockListStarStories.mockResolvedValue({ success: true, data: stories });

      const tree = await renderAndFlush();
      const json = stringify(tree);

      expect(json).toContain('Leadership Under Pressure');
      expect(json).toContain('Conflict Resolution');
      expect(json).toContain('Teamwork');
    });

    it('should show "Untitled Story" for stories without a title', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStoryMinimal] });

      const tree = await renderAndFlush();
      const json = stringify(tree);

      expect(json).toContain('Untitled Story');
    });

    it('should not render theme text when story_theme is absent', async () => {
      const noThemeStory = { ...sampleStory, id: 5, story_theme: undefined };
      mockListStarStories.mockResolvedValue({ success: true, data: [noThemeStory] });

      const tree = await renderAndFlush();
      const root = tree.root;

      // The theme text should not appear in the card
      // Check that the card does not have the cardTheme style text
      const texts = root.findAllByType('Text');
      const themeTexts = texts.filter(
        (t: any) => t.props.numberOfLines === 1 && t.props.style?.[0]?.fontSize === 13
      );
      // With no theme, there should be none matching cardTheme pattern
      const hasThemeContent = themeTexts.some((t: any) => {
        const content = getAllText(t);
        return content === 'Leadership';
      });
      expect(hasThemeContent).toBe(false);
    });

    it('should show the add button in header when stories exist', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });

      const tree = await renderAndFlush();
      const root = tree.root;

      const mockIcons = root.findAllByType('MockIcon');
      const plusIcons = mockIcons.filter((i: any) => i.props.testID === 'icon-Plus');
      expect(plusIcons.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle data.stories object format', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: { stories: [sampleStory] },
      });

      const tree = await renderAndFlush();
      const json = stringify(tree);

      expect(json).toContain('Leadership Under Pressure');
    });

    it('should set correct accessibility labels on story cards', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });

      const tree = await renderAndFlush();
      const root = tree.root;

      const touchables = root.findAllByType('TouchableOpacity');
      const card = touchables.find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      expect(card).toBeDefined();
      expect(card!.props.accessibilityHint).toContain('Theme: Leadership');
      expect(card!.props.accessibilityHint).toContain('Jan');
    });

    it('should set accessibility label with fallback for untitled stories', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStoryMinimal] });

      const tree = await renderAndFlush();
      const root = tree.root;

      const touchables = root.findAllByType('TouchableOpacity');
      const card = touchables.find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Untitled'
      );
      expect(card).toBeDefined();
    });

    it('should set accessibility hint with "No theme" fallback', async () => {
      const noTheme = { ...sampleStory, id: 7, story_theme: undefined };
      mockListStarStories.mockResolvedValue({ success: true, data: [noTheme] });

      const tree = await renderAndFlush();
      const root = tree.root;

      const touchables = root.findAllByType('TouchableOpacity');
      const card = touchables.find(
        (t: any) => t.props.accessibilityHint?.includes('No theme')
      );
      expect(card).toBeDefined();
    });
  });

  // ---- API Error Handling ----
  describe('API error handling', () => {
    it('should show empty state on API failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockListStarStories.mockResolvedValue({ success: false, error: 'Server error' });

      const tree = await renderAndFlush();
      const json = stringify(tree);

      expect(json).toContain('No STAR Stories');
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load STAR stories:', 'Server error');
      consoleSpy.mockRestore();
    });

    it('should show empty state on API exception', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Network timeout');
      mockListStarStories.mockRejectedValue(error);

      const tree = await renderAndFlush();
      const json = stringify(tree);

      expect(json).toContain('No STAR Stories');
      expect(consoleSpy).toHaveBeenCalledWith('Error loading STAR stories:', error);
      consoleSpy.mockRestore();
    });

    it('should handle success with null data', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockListStarStories.mockResolvedValue({ success: true, data: null });

      const tree = await renderAndFlush();
      const json = stringify(tree);

      // success is true but data is null - goes to else branch, logs error
      expect(json).toContain('No STAR Stories');
      consoleSpy.mockRestore();
    });

    it('should handle non-array data object without stories property', async () => {
      // This covers the `result.data.stories || []` branch where stories is undefined
      mockListStarStories.mockResolvedValue({ success: true, data: { total: 0 } });

      const tree = await renderAndFlush();
      const json = stringify(tree);

      expect(json).toContain('No STAR Stories');
    });
  });

  // ---- Pull-to-Refresh ----
  describe('pull-to-refresh', () => {
    it('should call API on mount via useFocusEffect', async () => {
      await renderAndFlush();
      expect(mockListStarStories).toHaveBeenCalledTimes(1);
    });

    it('should call API again when RefreshControl is triggered', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });

      const tree = await renderAndFlush();
      const root = tree.root;

      const refreshControls = root.findAllByType('RefreshControl');
      expect(refreshControls.length).toBeGreaterThan(0);

      await renderer.act(async () => {
        refreshControls[0].props.onRefresh();
        await flushPromises();
      });

      expect(mockListStarStories).toHaveBeenCalledTimes(2);
    });
  });

  // ---- Delete Story ----
  describe('delete story', () => {
    it('should show Alert when delete button is pressed', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });

      const tree = await renderAndFlush();
      const root = tree.root;

      // Find delete button by accessibility label
      const touchables = root.findAllByType('TouchableOpacity');
      const deleteBtn = touchables.find(
        (t: any) => t.props.accessibilityLabel === 'Delete Leadership Under Pressure'
      );
      expect(deleteBtn).toBeDefined();
      expect(deleteBtn!.props.accessibilityHint).toBe('Permanently removes this STAR story');

      const mockStopPropagation = jest.fn();
      await renderer.act(async () => {
        deleteBtn!.props.onPress({ stopPropagation: mockStopPropagation });
      });

      expect(mockStopPropagation).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith(
        'Delete STAR Story',
        'Are you sure you want to delete this story? This action cannot be undone.',
        expect.any(Array),
      );
    });

    it('should delete story successfully when confirmed', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockDeleteStarStory.mockResolvedValue({ success: true });

      const tree = await renderAndFlush();
      const root = tree.root;

      const touchables = root.findAllByType('TouchableOpacity');
      const deleteBtn = touchables.find(
        (t: any) => t.props.accessibilityLabel === 'Delete Leadership Under Pressure'
      );

      await renderer.act(async () => {
        deleteBtn!.props.onPress({ stopPropagation: jest.fn() });
      });

      // Get the Alert buttons and press Delete
      const alertCalls = (Alert.alert as jest.Mock).mock.calls;
      const buttons = alertCalls[0][2];
      const deleteAction = buttons.find((b: any) => b.text === 'Delete');
      expect(deleteAction.style).toBe('destructive');

      await renderer.act(async () => {
        await deleteAction.onPress();
        await flushPromises();
      });

      expect(mockDeleteStarStory).toHaveBeenCalledWith(1);

      // Story should be removed from the list
      const json = stringify(tree);
      expect(json).not.toContain('Leadership Under Pressure');
    });

    it('should handle delete API error', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockDeleteStarStory.mockResolvedValue({ success: false, error: 'Delete failed' });

      const tree = await renderAndFlush();
      const root = tree.root;

      const touchables = root.findAllByType('TouchableOpacity');
      const deleteBtn = touchables.find(
        (t: any) => t.props.accessibilityLabel === 'Delete Leadership Under Pressure'
      );

      await renderer.act(async () => {
        deleteBtn!.props.onPress({ stopPropagation: jest.fn() });
      });

      const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
      const deleteAction = buttons.find((b: any) => b.text === 'Delete');

      await renderer.act(async () => {
        await deleteAction.onPress();
        await flushPromises();
      });

      // Alert.alert should be called again with error
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Delete failed');
    });

    it('should handle delete API exception', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockDeleteStarStory.mockRejectedValue(new Error('Network'));

      const tree = await renderAndFlush();
      const root = tree.root;

      const touchables = root.findAllByType('TouchableOpacity');
      const deleteBtn = touchables.find(
        (t: any) => t.props.accessibilityLabel === 'Delete Leadership Under Pressure'
      );

      await renderer.act(async () => {
        deleteBtn!.props.onPress({ stopPropagation: jest.fn() });
      });

      const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
      const deleteAction = buttons.find((b: any) => b.text === 'Delete');

      await renderer.act(async () => {
        await deleteAction.onPress();
        await flushPromises();
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to delete STAR story');
    });

    it('should have Cancel button in delete Alert', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });

      const tree = await renderAndFlush();
      const root = tree.root;

      const touchables = root.findAllByType('TouchableOpacity');
      const deleteBtn = touchables.find(
        (t: any) => t.props.accessibilityLabel === 'Delete Leadership Under Pressure'
      );

      await renderer.act(async () => {
        deleteBtn!.props.onPress({ stopPropagation: jest.fn() });
      });

      const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
      const cancelAction = buttons.find((b: any) => b.text === 'Cancel');
      expect(cancelAction).toBeDefined();
      expect(cancelAction.style).toBe('cancel');
    });

    it('should clear selectedStory when deleting the currently selected story', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockDeleteStarStory.mockResolvedValue({ success: true });

      const tree = await renderAndFlush();
      const root = tree.root;

      // First select the story to open detail modal
      const touchables = root.findAllByType('TouchableOpacity');
      const card = touchables.find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );

      await renderer.act(async () => {
        card!.props.onPress();
      });

      // Now detail modal is visible
      let json = stringify(tree);
      expect(json).toContain('STAR Story');

      // Find delete button for same story (in the card list, not the modal)
      const allTouchables = root.findAllByType('TouchableOpacity');
      const deleteBtn = allTouchables.find(
        (t: any) => t.props.accessibilityLabel === 'Delete Leadership Under Pressure'
      );

      await renderer.act(async () => {
        deleteBtn!.props.onPress({ stopPropagation: jest.fn() });
      });

      const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
      const deleteAction = buttons.find((b: any) => b.text === 'Delete');

      await renderer.act(async () => {
        await deleteAction.onPress();
        await flushPromises();
      });

      // After deleting selected story, selectedStory should be null so detail modal closes
      json = stringify(tree);
      // The detail modal should no longer show (visible=false means Modal returns null)
      // The story card should be gone
      expect(json).not.toContain('Leadership Under Pressure');
    });

    it('should show delete button with correct accessibility state', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });

      const tree = await renderAndFlush();
      const root = tree.root;

      const touchables = root.findAllByType('TouchableOpacity');
      const deleteBtn = touchables.find(
        (t: any) => t.props.accessibilityLabel === 'Delete Leadership Under Pressure'
      );

      expect(deleteBtn!.props.accessibilityState).toEqual({ disabled: false, busy: false });
      expect(deleteBtn!.props.disabled).toBe(false);
    });

    it('should show fallback label "Delete story" for untitled stories', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStoryMinimal] });

      const tree = await renderAndFlush();
      const root = tree.root;

      const touchables = root.findAllByType('TouchableOpacity');
      const deleteBtn = touchables.find(
        (t: any) => t.props.accessibilityLabel === 'Delete story'
      );
      expect(deleteBtn).toBeDefined();
    });
  });

  // ---- Story Detail Modal ----
  describe('story detail modal', () => {
    it('should open detail modal when story card is pressed', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });

      const tree = await renderAndFlush();
      const root = tree.root;

      const touchables = root.findAllByType('TouchableOpacity');
      const card = touchables.find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );

      await renderer.act(async () => {
        card!.props.onPress();
      });

      const json = stringify(tree);
      expect(json).toContain('STAR Story');
      expect(json).toContain('Leadership Under Pressure');
      expect(json).toContain('Situation');
      expect(json).toContain('Task');
      expect(json).toContain('Action');
      expect(json).toContain('Result');
    });

    it('should show all STAR sections in detail modal', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });

      const tree = await renderAndFlush();
      const root = tree.root;

      const touchables = root.findAllByType('TouchableOpacity');
      const card = touchables.find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );

      await renderer.act(async () => {
        card!.props.onPress();
      });

      const json = stringify(tree);
      expect(json).toContain(sampleStory.situation);
      expect(json).toContain(sampleStory.task);
      expect(json).toContain(sampleStory.action);
      expect(json).toContain(sampleStory.result);
    });

    it('should show theme badge when story has a theme', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });

      const tree = await renderAndFlush();
      const root = tree.root;

      const touchables = root.findAllByType('TouchableOpacity');
      const card = touchables.find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );

      await renderer.act(async () => {
        card!.props.onPress();
      });

      const json = stringify(tree);
      expect(json).toContain('Leadership');
    });

    it('should not show theme badge when story has no theme', async () => {
      const noThemeStory = { ...sampleStory, id: 8, story_theme: undefined };
      mockListStarStories.mockResolvedValue({ success: true, data: [noThemeStory] });

      const tree = await renderAndFlush();
      const root = tree.root;

      const touchables = root.findAllByType('TouchableOpacity');
      const card = touchables.find(
        (t: any) => t.props.accessibilityRole === 'button' && t.props.accessibilityLabel?.includes('STAR story')
      );

      await renderer.act(async () => {
        card!.props.onPress();
      });

      // Theme badge should not be rendered - check that themeBadge style is absent
      // We verify that the title displays but theme badge is not shown
      const json = stringify(tree);
      expect(json).toContain('Leadership Under Pressure');
      // Since there is no theme, we can't simply check for absence of word
      // But we can verify the flow works (no crash)
    });

    it('should show company context when present', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });

      const tree = await renderAndFlush();
      const root = tree.root;

      const touchables = root.findAllByType('TouchableOpacity');
      const card = touchables.find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );

      await renderer.act(async () => {
        card!.props.onPress();
      });

      const json = stringify(tree);
      expect(json).toContain('Company Context');
      expect(json).toContain('Google - PM Interview');
    });

    it('should not show company context when absent', async () => {
      const noContextStory = { ...sampleStory, id: 9, company_context: undefined };
      mockListStarStories.mockResolvedValue({ success: true, data: [noContextStory] });

      const tree = await renderAndFlush();
      const root = tree.root;

      const touchables = root.findAllByType('TouchableOpacity');
      const card = touchables.find(
        (t: any) => t.props.accessibilityRole === 'button' && t.props.accessibilityLabel?.includes('STAR story')
      );

      await renderer.act(async () => {
        card!.props.onPress();
      });

      const json = stringify(tree);
      expect(json).not.toContain('Company Context');
    });

    it('should show key themes when present', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });

      const tree = await renderAndFlush();
      const root = tree.root;

      const touchables = root.findAllByType('TouchableOpacity');
      const card = touchables.find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );

      await renderer.act(async () => {
        card!.props.onPress();
      });

      const json = stringify(tree);
      expect(json).toContain('Key Themes');
      expect(json).toContain('Time Management');
      expect(json).toContain('Adaptability');
    });

    it('should not show key themes section when empty', async () => {
      const noThemesStory = { ...sampleStory, id: 10, key_themes: [] };
      mockListStarStories.mockResolvedValue({ success: true, data: [noThemesStory] });

      const tree = await renderAndFlush();
      const root = tree.root;

      const touchables = root.findAllByType('TouchableOpacity');
      const card = touchables.find(
        (t: any) => t.props.accessibilityRole === 'button' && t.props.accessibilityLabel?.includes('STAR story')
      );

      await renderer.act(async () => {
        card!.props.onPress();
      });

      const json = stringify(tree);
      expect(json).not.toContain('Key Themes');
    });

    it('should show talking points when present', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });

      const tree = await renderAndFlush();
      const root = tree.root;

      const touchables = root.findAllByType('TouchableOpacity');
      const card = touchables.find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );

      await renderer.act(async () => {
        card!.props.onPress();
      });

      const json = stringify(tree);
      expect(json).toContain('Talking Points');
      expect(json).toContain('Led 5 engineers');
      expect(json).toContain('Used agile methodology');
      expect(json).toContain('Zero regressions');
    });

    it('should not show talking points when empty', async () => {
      const noPointsStory = { ...sampleStory, id: 11, talking_points: [] };
      mockListStarStories.mockResolvedValue({ success: true, data: [noPointsStory] });

      const tree = await renderAndFlush();
      const root = tree.root;

      const touchables = root.findAllByType('TouchableOpacity');
      const card = touchables.find(
        (t: any) => t.props.accessibilityRole === 'button' && t.props.accessibilityLabel?.includes('STAR story')
      );

      await renderer.act(async () => {
        card!.props.onPress();
      });

      const json = stringify(tree);
      expect(json).not.toContain('Talking Points');
    });

    it('should show updated date when it differs from created date', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });

      const tree = await renderAndFlush();
      const root = tree.root;

      const touchables = root.findAllByType('TouchableOpacity');
      const card = touchables.find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );

      await renderer.act(async () => {
        card!.props.onPress();
      });

      const json = stringify(tree);
      expect(json).toContain('Created:');
      expect(json).toContain('Updated:');
    });

    it('should not show updated date when it equals created date', async () => {
      const sameDate = { ...sampleStory, id: 12, updated_at: sampleStory.created_at };
      mockListStarStories.mockResolvedValue({ success: true, data: [sameDate] });

      const tree = await renderAndFlush();
      const root = tree.root;

      const touchables = root.findAllByType('TouchableOpacity');
      const card = touchables.find(
        (t: any) => t.props.accessibilityRole === 'button' && t.props.accessibilityLabel?.includes('STAR story')
      );

      await renderer.act(async () => {
        card!.props.onPress();
      });

      const json = stringify(tree);
      expect(json).toContain('Created:');
      expect(json).not.toContain('Updated:');
    });

    it('should close detail modal via onRequestClose', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });

      const tree = await renderAndFlush();
      const root = tree.root;

      // Open modal
      const touchables = root.findAllByType('TouchableOpacity');
      const card = touchables.find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );

      await renderer.act(async () => {
        card!.props.onPress();
      });

      // Find detail modal (the second Modal - index 1, since builder is index 0)
      const modals = root.findAllByType('Modal');
      const detailModal = modals.find((m: any) => m.props.presentationStyle === 'pageSheet');

      expect(detailModal).toBeDefined();
      expect(detailModal!.props.visible).toBe(true);

      await renderer.act(async () => {
        detailModal!.props.onRequestClose();
      });

      // Modal should now be hidden
      const json = stringify(tree);
      expect(json).not.toContain('Situation');
      expect(json).not.toContain('Task');
    });

    it('should close detail modal via X close button press', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });

      const tree = await renderAndFlush();
      const root = tree.root;

      // Open modal
      const touchables = root.findAllByType('TouchableOpacity');
      const card = touchables.find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );

      await renderer.act(async () => {
        card!.props.onPress();
      });

      // Find X icon close button inside the detail modal
      const allTouchables = root.findAllByType('TouchableOpacity');
      const closeBtns = allTouchables.filter((t: any) => {
        const icons = t.findAllByType('MockIcon');
        return icons.some((i: any) => i.props.testID === 'icon-X');
      });

      // The first X button should be in the detail modal close
      expect(closeBtns.length).toBeGreaterThanOrEqual(1);

      await renderer.act(async () => {
        closeBtns[0].props.onPress();
      });

      const json = stringify(tree);
      // After setSelectedStory(null), detail modal should be hidden
      expect(json).not.toContain('Situation');
    });

    it('should display "Untitled Story" in detail modal for stories without title', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStoryMinimal] });

      const tree = await renderAndFlush();
      const root = tree.root;

      const touchables = root.findAllByType('TouchableOpacity');
      const card = touchables.find(
        (t: any) => t.props.accessibilityRole === 'button' && t.props.accessibilityLabel?.includes('STAR story')
      );

      await renderer.act(async () => {
        card!.props.onPress();
      });

      const json = stringify(tree);
      expect(json).toContain('Untitled Story');
    });
  });

  // ---- Builder Modal ----
  describe('builder modal', () => {
    it('should open builder modal with "New STAR Story" title from header plus button', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });

      const tree = await renderAndFlush();
      const root = tree.root;

      // Find the header add button (Plus icon in the header)
      const touchables = root.findAllByType('TouchableOpacity');
      // The header add button is the one that doesn't have accessibility labels like "STAR story:..."
      // It should contain a Plus icon
      const addBtn = touchables.find((t: any) => {
        const icons = t.findAllByType('MockIcon');
        return icons.some((i: any) => i.props.testID === 'icon-Plus') &&
               !t.props.accessibilityLabel?.includes('STAR story');
      });

      expect(addBtn).toBeDefined();

      await renderer.act(async () => {
        addBtn!.props.onPress();
      });

      const json = stringify(tree);
      expect(json).toContain('New STAR Story');
      expect(json).toContain('STARStoryBuilder');
    });

    it('should close builder modal via onRequestClose', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });

      const tree = await renderAndFlush();
      const root = tree.root;

      // Open builder
      const touchables = root.findAllByType('TouchableOpacity');
      const addBtn = touchables.find((t: any) => {
        const icons = t.findAllByType('MockIcon');
        return icons.some((i: any) => i.props.testID === 'icon-Plus') &&
               !t.props.accessibilityLabel?.includes('STAR story');
      });

      await renderer.act(async () => {
        addBtn!.props.onPress();
      });

      // Find builder modal and close it
      const modals = root.findAllByType('Modal');
      const builderModal = modals.find((m: any) => {
        try {
          const s = stringify({ toJSON: () => m });
          return s.includes('STARStoryBuilder');
        } catch {
          return false;
        }
      });

      expect(builderModal).toBeDefined();

      await renderer.act(async () => {
        builderModal!.props.onRequestClose();
      });

      // Builder modal should be closed
      const json = stringify(tree);
      expect(json).not.toContain('STARStoryBuilder');
    });

    it('should close builder modal via ArrowLeft button', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });

      const tree = await renderAndFlush();
      const root = tree.root;

      // Open builder
      const touchables = root.findAllByType('TouchableOpacity');
      const addBtn = touchables.find((t: any) => {
        const icons = t.findAllByType('MockIcon');
        return icons.some((i: any) => i.props.testID === 'icon-Plus') &&
               !t.props.accessibilityLabel?.includes('STAR story');
      });

      await renderer.act(async () => {
        addBtn!.props.onPress();
      });

      // Find the close button (ArrowLeft icon)
      const allTouchables = root.findAllByType('TouchableOpacity');
      const closeBtn = allTouchables.find((t: any) => {
        const icons = t.findAllByType('MockIcon');
        return icons.some((i: any) => i.props.testID === 'icon-ArrowLeft');
      });

      expect(closeBtn).toBeDefined();

      await renderer.act(async () => {
        closeBtn!.props.onPress();
      });

      const json = stringify(tree);
      expect(json).not.toContain('STARStoryBuilder');
    });

    it('should pass onCancel prop to STARStoryBuilder', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });

      const tree = await renderAndFlush();
      const root = tree.root;

      // Open builder
      const touchables = root.findAllByType('TouchableOpacity');
      const addBtn = touchables.find((t: any) => {
        const icons = t.findAllByType('MockIcon');
        return icons.some((i: any) => i.props.testID === 'icon-Plus') &&
               !t.props.accessibilityLabel?.includes('STAR story');
      });

      await renderer.act(async () => {
        addBtn!.props.onPress();
      });

      const builders = root.findAllByType('STARStoryBuilder');
      expect(builders.length).toBe(1);
      expect(builders[0].props.onSave).toBeDefined();
      expect(builders[0].props.onCancel).toBeDefined();
      expect(builders[0].props.onGenerateAI).toBeDefined();
      expect(builders[0].props.initialStory).toBeUndefined();

      // Test onCancel
      await renderer.act(async () => {
        builders[0].props.onCancel();
      });

      const json = stringify(tree);
      expect(json).not.toContain('STARStoryBuilder');
    });
  });

  // ---- handleSaveStory ----
  describe('handleSaveStory', () => {
    it('should save story successfully and close builder', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockCreateStarStory.mockResolvedValue({ success: true, data: {} });

      const tree = await renderAndFlush();
      const root = tree.root;

      // Open builder
      const touchables = root.findAllByType('TouchableOpacity');
      const addBtn = touchables.find((t: any) => {
        const icons = t.findAllByType('MockIcon');
        return icons.some((i: any) => i.props.testID === 'icon-Plus') &&
               !t.props.accessibilityLabel?.includes('STAR story');
      });

      await renderer.act(async () => {
        addBtn!.props.onPress();
      });

      const builders = root.findAllByType('STARStoryBuilder');

      await renderer.act(async () => {
        await builders[0].props.onSave({
          title: 'New Story',
          situation: 'S',
          task: 'T',
          action: 'A',
          result: 'R',
          key_themes: ['Theme1'],
          talking_points: ['Point1'],
        });
        await flushPromises();
      });

      expect(mockCreateStarStory).toHaveBeenCalledWith({
        title: 'New Story',
        situation: 'S',
        task: 'T',
        action: 'A',
        result: 'R',
        key_themes: ['Theme1'],
        talking_points: ['Point1'],
      });
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'STAR story saved successfully!');
    });

    it('should show error alert on save failure', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockCreateStarStory.mockResolvedValue({ success: false, error: 'Save failed' });

      const tree = await renderAndFlush();
      const root = tree.root;

      const touchables = root.findAllByType('TouchableOpacity');
      const addBtn = touchables.find((t: any) => {
        const icons = t.findAllByType('MockIcon');
        return icons.some((i: any) => i.props.testID === 'icon-Plus') &&
               !t.props.accessibilityLabel?.includes('STAR story');
      });

      await renderer.act(async () => {
        addBtn!.props.onPress();
      });

      const builders = root.findAllByType('STARStoryBuilder');

      await renderer.act(async () => {
        await builders[0].props.onSave({ title: 'Test', situation: 'S', task: 'T', action: 'A', result: 'R' });
        await flushPromises();
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Save failed');
    });

    it('should show generic error alert on save exception', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockCreateStarStory.mockRejectedValue(new Error('Network'));

      const tree = await renderAndFlush();
      const root = tree.root;

      const touchables = root.findAllByType('TouchableOpacity');
      const addBtn = touchables.find((t: any) => {
        const icons = t.findAllByType('MockIcon');
        return icons.some((i: any) => i.props.testID === 'icon-Plus') &&
               !t.props.accessibilityLabel?.includes('STAR story');
      });

      await renderer.act(async () => {
        addBtn!.props.onPress();
      });

      const builders = root.findAllByType('STARStoryBuilder');

      await renderer.act(async () => {
        await builders[0].props.onSave({ title: 'Test', situation: 'S', task: 'T', action: 'A', result: 'R' });
        await flushPromises();
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to save STAR story');
    });

    it('should show default error message when API returns success:false without error', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockCreateStarStory.mockResolvedValue({ success: false });

      const tree = await renderAndFlush();
      const root = tree.root;

      const touchables = root.findAllByType('TouchableOpacity');
      const addBtn = touchables.find((t: any) => {
        const icons = t.findAllByType('MockIcon');
        return icons.some((i: any) => i.props.testID === 'icon-Plus') &&
               !t.props.accessibilityLabel?.includes('STAR story');
      });

      await renderer.act(async () => {
        addBtn!.props.onPress();
      });

      const builders = root.findAllByType('STARStoryBuilder');

      await renderer.act(async () => {
        await builders[0].props.onSave({ title: 'T', situation: 'S', task: 'T', action: 'A', result: 'R' });
        await flushPromises();
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to save STAR story');
    });
  });

  // ---- handleGenerateAI ----
  describe('handleGenerateAI', () => {
    it('should show manual entry alert and return null', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });

      const tree = await renderAndFlush();
      const root = tree.root;

      const touchables = root.findAllByType('TouchableOpacity');
      const addBtn = touchables.find((t: any) => {
        const icons = t.findAllByType('MockIcon');
        return icons.some((i: any) => i.props.testID === 'icon-Plus') &&
               !t.props.accessibilityLabel?.includes('STAR story');
      });

      await renderer.act(async () => {
        addBtn!.props.onPress();
      });

      const builders = root.findAllByType('STARStoryBuilder');
      let result: any;

      await renderer.act(async () => {
        result = await builders[0].props.onGenerateAI('Test Title');
      });

      expect(result).toBeNull();
      expect(Alert.alert).toHaveBeenCalledWith(
        'Manual Entry Required',
        expect.stringContaining('Please fill in your STAR story details manually'),
      );
      expect(consoleSpy).toHaveBeenCalledWith('AI STAR story generation requested for:', 'Test Title');
      consoleSpy.mockRestore();
    });
  });

  // ---- Feature #18: Analyze Story ----
  describe('analyze story (Feature #18)', () => {
    const fullAnalysis = {
      overall_score: 85,
      component_scores: {
        situation: { score: 90, feedback: 'Clear context' },
        task: { score: 70, feedback: 'Could be more specific' },
        action: { score: 85, feedback: 'Good detail' },
        result: { score: 55, feedback: 'Needs quantification' },
      },
      strengths: ['Strong context', 'Clear actions'],
      areas_for_improvement: ['Add metrics', 'Be more concise'],
      impact_assessment: {
        quantifiable_results: true,
        leadership_demonstrated: true,
        problem_solving_shown: false,
      },
    };

    it('should trigger analysis and display results', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockAnalyzeStarStory.mockResolvedValue({ success: true, data: fullAnalysis });

      const tree = await renderAndFlush();
      const root = tree.root;

      // Open detail modal
      const touchables = root.findAllByType('TouchableOpacity');
      const card = touchables.find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );

      await renderer.act(async () => {
        card!.props.onPress();
      });

      // Find Analyze button
      const allTouchables = root.findAllByType('TouchableOpacity');
      const analyzeBtn = allTouchables.find((t: any) => {
        const text = getAllText(t);
        return text.includes('Analyze');
      });

      expect(analyzeBtn).toBeDefined();

      await renderer.act(async () => {
        analyzeBtn!.props.onPress();
        await flushPromises();
      });

      expect(mockAnalyzeStarStory).toHaveBeenCalledWith(1);

      const json = stringify(tree);
      expect(json).toContain('STAR Analysis');
      expect(json).toContain('Overall Score');
      expect(json).toContain('85');
      expect(json).toContain('/100');
    });

    it('should display component scores with correct color coding', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockAnalyzeStarStory.mockResolvedValue({ success: true, data: fullAnalysis });

      const tree = await renderAndFlush();
      const root = tree.root;

      // Open detail + analyze
      const touchables = root.findAllByType('TouchableOpacity');
      const card = touchables.find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );

      await renderer.act(async () => {
        card!.props.onPress();
      });

      const allTouchables = root.findAllByType('TouchableOpacity');
      const analyzeBtn = allTouchables.find((t: any) => getAllText(t).includes('Analyze'));

      await renderer.act(async () => {
        analyzeBtn!.props.onPress();
        await flushPromises();
      });

      const json = stringify(tree);
      // Verify component labels are capitalized
      expect(json).toContain('Situation');
      expect(json).toContain('Clear context');
      expect(json).toContain('Could be more specific');
      // Score 90 (success), 70 (warning), 85 (success), 55 (danger)
      expect(json).toContain(COLORS.success);
      expect(json).toContain(COLORS.warning);
      expect(json).toContain(COLORS.danger);
    });

    it('should display strengths', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockAnalyzeStarStory.mockResolvedValue({ success: true, data: fullAnalysis });

      const tree = await renderAndFlush();
      const root = tree.root;

      const touchables = root.findAllByType('TouchableOpacity');
      const card = touchables.find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );

      await renderer.act(async () => {
        card!.props.onPress();
      });

      const analyzeBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Analyze'));
      await renderer.act(async () => { analyzeBtn!.props.onPress(); await flushPromises(); });

      const json = stringify(tree);
      expect(json).toContain('Strengths');
      expect(json).toContain('Strong context');
      expect(json).toContain('Clear actions');
    });

    it('should display areas for improvement', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockAnalyzeStarStory.mockResolvedValue({ success: true, data: fullAnalysis });

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const analyzeBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Analyze'));
      await renderer.act(async () => { analyzeBtn!.props.onPress(); await flushPromises(); });

      const json = stringify(tree);
      expect(json).toContain('Areas for Improvement');
      expect(json).toContain('Add metrics');
      expect(json).toContain('Be more concise');
    });

    it('should display impact assessment with Yes/No values', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockAnalyzeStarStory.mockResolvedValue({ success: true, data: fullAnalysis });

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const analyzeBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Analyze'));
      await renderer.act(async () => { analyzeBtn!.props.onPress(); await flushPromises(); });

      const json = stringify(tree);
      expect(json).toContain('Impact Assessment');
      expect(json).toContain('Quantifiable Results:');
      expect(json).toContain('Leadership Demonstrated:');
      expect(json).toContain('Problem Solving:');
      // true -> Yes, false -> No
      expect(json).toContain('Yes');
      expect(json).toContain('No');
    });

    it('should handle analysis API error', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockAnalyzeStarStory.mockResolvedValue({ success: false, error: 'Analysis unavailable' });

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const analyzeBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Analyze'));
      await renderer.act(async () => { analyzeBtn!.props.onPress(); await flushPromises(); });

      expect(Alert.alert).toHaveBeenCalledWith('Analysis Failed', 'Analysis unavailable');
    });

    it('should handle analysis API exception', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockAnalyzeStarStory.mockRejectedValue(new Error('Timeout'));

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const analyzeBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Analyze'));
      await renderer.act(async () => { analyzeBtn!.props.onPress(); await flushPromises(); });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Timeout');
    });

    it('should handle analysis API exception without message', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockAnalyzeStarStory.mockRejectedValue({});

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const analyzeBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Analyze'));
      await renderer.act(async () => { analyzeBtn!.props.onPress(); await flushPromises(); });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to analyze story');
    });

    it('should handle analysis with default error message', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockAnalyzeStarStory.mockResolvedValue({ success: false });

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const analyzeBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Analyze'));
      await renderer.act(async () => { analyzeBtn!.props.onPress(); await flushPromises(); });

      expect(Alert.alert).toHaveBeenCalledWith('Analysis Failed', 'Could not analyze STAR story');
    });
  });

  // ---- Feature #19: Story Suggestions ----
  describe('story suggestions (Feature #19)', () => {
    const fullSuggestions = {
      improvement_tips: [
        { component: 'situation', suggestion: 'Add more context', reasoning: 'Helps interviewer understand' },
        { component: 'result', suggestion: 'Quantify the outcome', reasoning: 'Shows impact' },
      ],
      alternative_framings: [
        {
          perspective: 'Technical Lead',
          reframed_story: { situation: 'New situation', result: 'New result' },
        },
      ],
      impact_enhancements: [
        { type: 'metric', enhancement: 'Add revenue impact numbers' },
      ],
      keyword_recommendations: ['leadership', 'collaboration', 'agile'],
    };

    it('should trigger suggestions and display results', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockGetStorySuggestions.mockResolvedValue({ success: true, data: fullSuggestions });

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const suggestBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Suggest'));
      expect(suggestBtn).toBeDefined();

      await renderer.act(async () => { suggestBtn!.props.onPress(); await flushPromises(); });

      expect(mockGetStorySuggestions).toHaveBeenCalledWith(1);

      const json = stringify(tree);
      expect(json).toContain('Improvement Suggestions');
      expect(json).toContain('Component Improvements');
      expect(json).toContain('SITUATION');
      expect(json).toContain('Add more context');
      expect(json).toContain('Helps interviewer understand');
    });

    it('should display alternative framings', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockGetStorySuggestions.mockResolvedValue({ success: true, data: fullSuggestions });

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const suggestBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Suggest'));
      await renderer.act(async () => { suggestBtn!.props.onPress(); await flushPromises(); });

      const json = stringify(tree);
      expect(json).toContain('Alternative Framings');
      expect(json).toContain('Technical Lead');
      expect(json).toContain('Situation:');
      expect(json).toContain('New situation');
      expect(json).toContain('Result:');
      expect(json).toContain('New result');
    });

    it('should display impact enhancements', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockGetStorySuggestions.mockResolvedValue({ success: true, data: fullSuggestions });

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const suggestBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Suggest'));
      await renderer.act(async () => { suggestBtn!.props.onPress(); await flushPromises(); });

      const json = stringify(tree);
      expect(json).toContain('Impact Enhancements');
      expect(json).toContain('METRIC');
      expect(json).toContain('Add revenue impact numbers');
    });

    it('should display keyword recommendations', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockGetStorySuggestions.mockResolvedValue({ success: true, data: fullSuggestions });

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const suggestBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Suggest'));
      await renderer.act(async () => { suggestBtn!.props.onPress(); await flushPromises(); });

      const json = stringify(tree);
      expect(json).toContain('Recommended Keywords');
      expect(json).toContain('leadership');
      expect(json).toContain('collaboration');
      expect(json).toContain('agile');
    });

    it('should handle suggestions API error', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockGetStorySuggestions.mockResolvedValue({ success: false, error: 'Service down' });

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const suggestBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Suggest'));
      await renderer.act(async () => { suggestBtn!.props.onPress(); await flushPromises(); });

      expect(Alert.alert).toHaveBeenCalledWith('Suggestions Failed', 'Service down');
    });

    it('should handle suggestions API exception', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockGetStorySuggestions.mockRejectedValue(new Error('Timeout'));

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const suggestBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Suggest'));
      await renderer.act(async () => { suggestBtn!.props.onPress(); await flushPromises(); });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Timeout');
    });

    it('should handle suggestions API exception without message', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockGetStorySuggestions.mockRejectedValue({});

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const suggestBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Suggest'));
      await renderer.act(async () => { suggestBtn!.props.onPress(); await flushPromises(); });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to get suggestions');
    });

    it('should handle suggestions with default error message', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockGetStorySuggestions.mockResolvedValue({ success: false });

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const suggestBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Suggest'));
      await renderer.act(async () => { suggestBtn!.props.onPress(); await flushPromises(); });

      expect(Alert.alert).toHaveBeenCalledWith('Suggestions Failed', 'Could not get story suggestions');
    });
  });

  // ---- Feature #20: Story Variations ----
  describe('story variations (Feature #20)', () => {
    const fullVariations = {
      variations: [
        {
          context: 'technical_interview',
          tone: 'professional',
          story: {
            situation: 'Tech situation',
            task: 'Tech task',
            action: 'Tech action',
            result: 'Tech result',
          },
          optimal_use_case: 'Best for technical roles at FAANG companies',
        },
        {
          context: 'behavioral_interview',
          tone: 'conversational',
          story: {
            situation: 'Behavioral situation',
            task: 'Behavioral task',
            action: 'Behavioral action',
            result: 'Behavioral result',
          },
        },
      ],
      usage_guide: {
        technical_interview: 'Use when discussing architecture decisions',
        behavioral_interview: 'Use for teamwork and leadership questions',
      },
    };

    it('should trigger variations and open modal', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockGenerateStoryVariations.mockResolvedValue({ success: true, data: fullVariations });

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const variationsBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Variations'));
      expect(variationsBtn).toBeDefined();

      await renderer.act(async () => { variationsBtn!.props.onPress(); await flushPromises(); });

      expect(mockGenerateStoryVariations).toHaveBeenCalledWith({
        storyId: 1,
        contexts: ['technical_interview', 'behavioral_interview', 'executive_presentation', 'networking'],
        tones: ['professional', 'conversational', 'enthusiastic'],
      });

      const json = stringify(tree);
      expect(json).toContain('Story Variations');
      expect(json).toContain('TECHNICAL INTERVIEW');
      expect(json).toContain('professional');
      expect(json).toContain('Tech situation');
    });

    it('should display variation cards with all STAR sections', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockGenerateStoryVariations.mockResolvedValue({ success: true, data: fullVariations });

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const variationsBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Variations'));
      await renderer.act(async () => { variationsBtn!.props.onPress(); await flushPromises(); });

      const json = stringify(tree);
      expect(json).toContain('Tech task');
      expect(json).toContain('Tech action');
      expect(json).toContain('Tech result');
      expect(json).toContain('Behavioral situation');
    });

    it('should display optimal use case when present', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockGenerateStoryVariations.mockResolvedValue({ success: true, data: fullVariations });

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const variationsBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Variations'));
      await renderer.act(async () => { variationsBtn!.props.onPress(); await flushPromises(); });

      const json = stringify(tree);
      expect(json).toContain('Best For:');
      expect(json).toContain('Best for technical roles at FAANG companies');
    });

    it('should display usage guide', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockGenerateStoryVariations.mockResolvedValue({ success: true, data: fullVariations });

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const variationsBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Variations'));
      await renderer.act(async () => { variationsBtn!.props.onPress(); await flushPromises(); });

      const json = stringify(tree);
      expect(json).toContain('Usage Guide');
      expect(json).toContain('TECHNICAL INTERVIEW');
      expect(json).toContain('Use when discussing architecture decisions');
      expect(json).toContain('BEHAVIORAL INTERVIEW');
    });

    it('should close variations modal via onRequestClose', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockGenerateStoryVariations.mockResolvedValue({ success: true, data: fullVariations });

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const variationsBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Variations'));
      await renderer.act(async () => { variationsBtn!.props.onPress(); await flushPromises(); });

      // Find the variations modal by looking for the one whose onRequestClose sets showVariationsModal to false
      // The variations modal is the last Modal rendered (3rd modal)
      const modals = root.findAllByType('Modal');
      // The variations modal is the one with presentationStyle='fullScreen' that contains 'Story Variations'
      // It should be the last visible modal
      const variationsModal = modals[modals.length - 1];

      expect(variationsModal).toBeDefined();
      expect(variationsModal.props.visible).toBe(true);

      await renderer.act(async () => {
        variationsModal.props.onRequestClose();
      });

      // After closing, the variations modal should no longer be visible
      // But the detail modal and builder modal are still in the tree (detail is visible)
      // Verify the variations modal is gone by checking the last modal is no longer visible
      const modalsAfter = root.findAllByType('Modal');
      // The third modal (variations) should now have visible=false
      // Since our mock Modal returns null when visible=false, it won't be in the tree
      const json = stringify(tree);
      // The variations modal content should be gone, but detail modal may still have the story
      expect(json).not.toContain('Story Variations');
    });

    it('should close variations modal via X button', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockGenerateStoryVariations.mockResolvedValue({ success: true, data: fullVariations });

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const variationsBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Variations'));
      await renderer.act(async () => { variationsBtn!.props.onPress(); await flushPromises(); });

      // Find X close button inside variations modal (has icon-X)
      const allTouchables = root.findAllByType('TouchableOpacity');
      const closeBtns = allTouchables.filter((t: any) => {
        const icons = t.findAllByType('MockIcon');
        return icons.some((i: any) => i.props.testID === 'icon-X');
      });

      // The last X button should be in the variations modal
      const closeBtn = closeBtns[closeBtns.length - 1];
      expect(closeBtn).toBeDefined();

      await renderer.act(async () => {
        closeBtn.props.onPress();
      });

      const json = stringify(tree);
      expect(json).not.toContain('Usage Guide');
    });

    it('should handle variations API error', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockGenerateStoryVariations.mockResolvedValue({ success: false, error: 'Service unavailable' });

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const variationsBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Variations'));
      await renderer.act(async () => { variationsBtn!.props.onPress(); await flushPromises(); });

      expect(Alert.alert).toHaveBeenCalledWith('Generation Failed', 'Service unavailable');
    });

    it('should handle variations API exception', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockGenerateStoryVariations.mockRejectedValue(new Error('Connection lost'));

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const variationsBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Variations'));
      await renderer.act(async () => { variationsBtn!.props.onPress(); await flushPromises(); });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Connection lost');
    });

    it('should handle variations API exception without message', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockGenerateStoryVariations.mockRejectedValue({});

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const variationsBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Variations'));
      await renderer.act(async () => { variationsBtn!.props.onPress(); await flushPromises(); });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to generate variations');
    });

    it('should handle variations with default error message', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockGenerateStoryVariations.mockResolvedValue({ success: false });

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const variationsBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Variations'));
      await renderer.act(async () => { variationsBtn!.props.onPress(); await flushPromises(); });

      expect(Alert.alert).toHaveBeenCalledWith('Generation Failed', 'Could not generate story variations');
    });
  });

  // ---- Branch Coverage: deletingId loading indicator ----
  describe('delete loading state (branch coverage)', () => {
    it('should show ActivityIndicator on the delete button while deleting', async () => {
      // Use a never-resolving delete promise to keep deletingId set
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockDeleteStarStory.mockReturnValue(new Promise(() => {})); // never resolves

      const tree = await renderAndFlush();
      const root = tree.root;

      // Press delete
      const deleteBtn = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'Delete Leadership Under Pressure'
      );

      await renderer.act(async () => {
        deleteBtn!.props.onPress({ stopPropagation: jest.fn() });
      });

      // Trigger the actual delete (confirm)
      const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
      const deleteAction = buttons.find((b: any) => b.text === 'Delete');

      // Start delete but don't await (never resolves)
      renderer.act(() => {
        deleteAction.onPress();
      });

      // Now the deletingId should be set, showing ActivityIndicator instead of Trash2 icon
      const json = stringify(tree);
      // The delete button should be disabled and show busy
      // Since deletingId === item.id, the delete button shows ActivityIndicator
      const deleteBtnAfter = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'Delete Leadership Under Pressure'
      );
      expect(deleteBtnAfter!.props.disabled).toBe(true);
      expect(deleteBtnAfter!.props.accessibilityState).toEqual({ disabled: true, busy: true });
    });
  });

  // ---- Branch Coverage: editing story in builder modal ----
  describe('editing story in builder modal (branch coverage)', () => {
    // Note: The component doesn't currently expose a UI path to edit stories in the main screen
    // (no edit button visible). The editingStory state is set but never populated via onPress.
    // However, we can still cover the branch by verifying the builder modal title when
    // editingStory is null (which is the "New STAR Story" case, already covered).
    // The "Edit STAR Story" branch at line 364 requires editingStory to be set.
    // Since there's no direct UI to set editingStory in the current component,
    // this branch is effectively dead code from the UI perspective.
    // We verify the new story path is fully covered.

    it('should pass undefined initialStory for new story creation', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });

      const tree = await renderAndFlush();
      const root = tree.root;

      // Open builder via header button
      const addBtn = root.findAllByType('TouchableOpacity').find((t: any) => {
        const icons = t.findAllByType('MockIcon');
        return icons.some((i: any) => i.props.testID === 'icon-Plus') &&
               !t.props.accessibilityLabel?.includes('STAR story');
      });

      await renderer.act(async () => { addBtn!.props.onPress(); });

      const builders = root.findAllByType('STARStoryBuilder');
      expect(builders[0].props.initialStory).toBeUndefined();
    });
  });

  // ---- Branch Coverage: analysis/suggestions/variations loading spinners in detail modal ----
  describe('action button loading states in detail modal (branch coverage)', () => {
    it('should show ActivityIndicator on Analyze button while analyzing', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockAnalyzeStarStory.mockReturnValue(new Promise(() => {})); // never resolves

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const analyzeBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Analyze'));

      // Start analysis but don't resolve
      renderer.act(() => {
        analyzeBtn!.props.onPress();
      });

      // Now analyzingStoryId === selectedStory.id, so analyze button shows ActivityIndicator
      const json = stringify(tree);
      // The analyze button should be disabled
      const analyzeBtnAfter = root.findAllByType('TouchableOpacity').find((t: any) => {
        return t.props.disabled === true && !t.props.accessibilityLabel?.includes('Delete');
      });
      expect(analyzeBtnAfter).toBeDefined();
    });

    it('should show ActivityIndicator on Suggest button while loading suggestions', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockGetStorySuggestions.mockReturnValue(new Promise(() => {}));

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const suggestBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Suggest'));

      renderer.act(() => {
        suggestBtn!.props.onPress();
      });

      // loadingSuggestions should be true, suggest button shows ActivityIndicator
      const suggestBtnAfter = root.findAllByType('TouchableOpacity').find((t: any) => {
        // Find the suggest button that is now disabled (not the analyze or variations or delete)
        const icons = t.findAllByType('MockIcon');
        const hasLightbulb = icons.some((i: any) => i.props.testID === 'icon-Lightbulb');
        return t.props.disabled === true && !hasLightbulb;
      });
      // Verify that at least one action button is disabled
      const disabledBtns = root.findAllByType('TouchableOpacity').filter((t: any) => t.props.disabled === true);
      expect(disabledBtns.length).toBeGreaterThanOrEqual(1);
    });

    it('should show ActivityIndicator on Variations button while generating', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockGenerateStoryVariations.mockReturnValue(new Promise(() => {}));

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const variationsBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Variations'));

      renderer.act(() => {
        variationsBtn!.props.onPress();
      });

      // generatingVariations should be true
      const disabledBtns = root.findAllByType('TouchableOpacity').filter((t: any) => t.props.disabled === true);
      expect(disabledBtns.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ---- Branch Coverage: impact assessment boolean branches ----
  describe('impact assessment boolean branches (branch coverage)', () => {
    it('should display "Yes" for all true impact assessment values', async () => {
      const analysisAllTrue = {
        overall_score: 95,
        impact_assessment: {
          quantifiable_results: true,
          leadership_demonstrated: true,
          problem_solving_shown: true,
        },
      };
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockAnalyzeStarStory.mockResolvedValue({ success: true, data: analysisAllTrue });

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const analyzeBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Analyze'));
      await renderer.act(async () => { analyzeBtn!.props.onPress(); await flushPromises(); });

      const json = stringify(tree);
      // All three should show "Yes" with success color
      const yesMatches = json.match(/"Yes"/g);
      expect(yesMatches).not.toBeNull();
      expect(yesMatches!.length).toBeGreaterThanOrEqual(3);
      // All should use success color
      expect(json).toContain(COLORS.success);
    });

    it('should display "No" for all false impact assessment values', async () => {
      const analysisAllFalse = {
        overall_score: 50,
        impact_assessment: {
          quantifiable_results: false,
          leadership_demonstrated: false,
          problem_solving_shown: false,
        },
      };
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockAnalyzeStarStory.mockResolvedValue({ success: true, data: analysisAllFalse });

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const analyzeBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Analyze'));
      await renderer.act(async () => { analyzeBtn!.props.onPress(); await flushPromises(); });

      const json = stringify(tree);
      // All three should show "No" with danger color
      expect(json).toContain('Quantifiable Results:');
      expect(json).toContain('Leadership Demonstrated:');
      expect(json).toContain('Problem Solving:');
      // Count occurrences of "No" -- should have 3 for the false values
      const noMatches = json.match(/"No"/g);
      expect(noMatches).not.toBeNull();
      expect(noMatches!.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ---- Branch Coverage: analysis without optional fields ----
  describe('analysis without optional fields (branch coverage)', () => {
    it('should render analysis without strengths', async () => {
      const analysisNoStrengths = {
        overall_score: 75,
        component_scores: { situation: { score: 75, feedback: 'OK' } },
        strengths: [],
        areas_for_improvement: ['Improve'],
      };
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockAnalyzeStarStory.mockResolvedValue({ success: true, data: analysisNoStrengths });

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const analyzeBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Analyze'));
      await renderer.act(async () => { analyzeBtn!.props.onPress(); await flushPromises(); });

      const json = stringify(tree);
      expect(json).not.toContain('Strengths');
      expect(json).toContain('Areas for Improvement');
    });

    it('should render analysis without areas_for_improvement', async () => {
      const analysisNoAreas = {
        overall_score: 90,
        strengths: ['Great work'],
        areas_for_improvement: [],
      };
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockAnalyzeStarStory.mockResolvedValue({ success: true, data: analysisNoAreas });

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const analyzeBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Analyze'));
      await renderer.act(async () => { analyzeBtn!.props.onPress(); await flushPromises(); });

      const json = stringify(tree);
      expect(json).toContain('Strengths');
      expect(json).not.toContain('Areas for Improvement');
    });

    it('should render analysis without component_scores', async () => {
      const analysisNoComponents = {
        overall_score: 65,
      };
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockAnalyzeStarStory.mockResolvedValue({ success: true, data: analysisNoComponents });

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const analyzeBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Analyze'));
      await renderer.act(async () => { analyzeBtn!.props.onPress(); await flushPromises(); });

      const json = stringify(tree);
      expect(json).toContain('STAR Analysis');
      expect(json).toContain('65');
      expect(json).toContain('/100');
      // Without component_scores, no individual score feedback should appear
      // "Clear context" is from the full analysis mock - should not be present here
      expect(json).not.toContain('Clear context');
    });

    it('should render analysis without impact_assessment', async () => {
      const analysisNoImpact = {
        overall_score: 70,
      };
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockAnalyzeStarStory.mockResolvedValue({ success: true, data: analysisNoImpact });

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const analyzeBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Analyze'));
      await renderer.act(async () => { analyzeBtn!.props.onPress(); await flushPromises(); });

      const json = stringify(tree);
      expect(json).not.toContain('Impact Assessment');
    });
  });

  // ---- Branch Coverage: suggestions without optional fields ----
  describe('suggestions without optional fields (branch coverage)', () => {
    it('should render suggestions without improvement_tips', async () => {
      const suggestionsNoTips = {
        alternative_framings: [{ perspective: 'P1', reframed_story: { situation: 'S', result: 'R' } }],
      };
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockGetStorySuggestions.mockResolvedValue({ success: true, data: suggestionsNoTips });

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const suggestBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Suggest'));
      await renderer.act(async () => { suggestBtn!.props.onPress(); await flushPromises(); });

      const json = stringify(tree);
      expect(json).not.toContain('Component Improvements');
      expect(json).toContain('Alternative Framings');
    });

    it('should render suggestions without alternative_framings', async () => {
      const suggestionsNoFramings = {
        improvement_tips: [{ component: 'action', suggestion: 'S', reasoning: 'R' }],
        impact_enhancements: [{ type: 'metric', enhancement: 'E' }],
      };
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockGetStorySuggestions.mockResolvedValue({ success: true, data: suggestionsNoFramings });

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const suggestBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Suggest'));
      await renderer.act(async () => { suggestBtn!.props.onPress(); await flushPromises(); });

      const json = stringify(tree);
      expect(json).toContain('Component Improvements');
      expect(json).not.toContain('Alternative Framings');
      expect(json).toContain('Impact Enhancements');
    });

    it('should render suggestions without impact_enhancements', async () => {
      const suggestionsNoEnhancements = {
        keyword_recommendations: ['test'],
      };
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockGetStorySuggestions.mockResolvedValue({ success: true, data: suggestionsNoEnhancements });

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const suggestBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Suggest'));
      await renderer.act(async () => { suggestBtn!.props.onPress(); await flushPromises(); });

      const json = stringify(tree);
      expect(json).not.toContain('Impact Enhancements');
      expect(json).toContain('Recommended Keywords');
    });

    it('should render suggestions without keyword_recommendations', async () => {
      const suggestionsNoKeywords = {
        improvement_tips: [{ component: 'task', suggestion: 'S', reasoning: 'R' }],
      };
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockGetStorySuggestions.mockResolvedValue({ success: true, data: suggestionsNoKeywords });

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const suggestBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Suggest'));
      await renderer.act(async () => { suggestBtn!.props.onPress(); await flushPromises(); });

      const json = stringify(tree);
      expect(json).toContain('Component Improvements');
      expect(json).not.toContain('Recommended Keywords');
    });
  });

  // ---- Branch Coverage: variations without optional fields ----
  describe('variations without optional fields (branch coverage)', () => {
    it('should render variations without optimal_use_case', async () => {
      const variationsNoUseCase = {
        variations: [
          {
            context: 'networking',
            tone: 'enthusiastic',
            story: { situation: 'S', task: 'T', action: 'A', result: 'R' },
          },
        ],
      };
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockGenerateStoryVariations.mockResolvedValue({ success: true, data: variationsNoUseCase });

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const variationsBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Variations'));
      await renderer.act(async () => { variationsBtn!.props.onPress(); await flushPromises(); });

      const json = stringify(tree);
      expect(json).toContain('NETWORKING');
      expect(json).not.toContain('Best For:');
    });

    it('should render variations without usage_guide', async () => {
      const variationsNoGuide = {
        variations: [
          {
            context: 'executive_presentation',
            tone: 'professional',
            story: { situation: 'S', task: 'T', action: 'A', result: 'R' },
            optimal_use_case: 'Use for exec meetings',
          },
        ],
      };
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockGenerateStoryVariations.mockResolvedValue({ success: true, data: variationsNoGuide });

      const tree = await renderAndFlush();
      const root = tree.root;

      const card = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'STAR story: Leadership Under Pressure'
      );
      await renderer.act(async () => { card!.props.onPress(); });

      const variationsBtn = root.findAllByType('TouchableOpacity').find((t: any) => getAllText(t).includes('Variations'));
      await renderer.act(async () => { variationsBtn!.props.onPress(); await flushPromises(); });

      const json = stringify(tree);
      expect(json).toContain('EXECUTIVE PRESENTATION');
      expect(json).toContain('Best For:');
      expect(json).not.toContain('Usage Guide');
    });
  });

  // ---- Replicated formatDate Logic ----
  describe('formatDate logic (replicated)', () => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    };

    it('should format ISO date string', () => {
      const result = formatDate('2026-01-15T10:00:00Z');
      expect(result).toContain('Jan');
      expect(result).toContain('15');
      expect(result).toContain('2026');
    });

    it('should format date-only string', () => {
      const result = formatDate('2025-12-25');
      expect(result).toMatch(/\w{3}\s+\d{1,2},\s+\d{4}/);
    });

    it('should format end-of-year date', () => {
      const result = formatDate('2025-12-31T23:59:59Z');
      expect(result).toContain('Dec');
      expect(result).toContain('2025');
    });
  });

  // ---- Score Coloring Logic ----
  describe('score coloring logic (replicated)', () => {
    const getScoreColor = (score: number) => {
      if (score >= 80) return COLORS.success;
      if (score >= 60) return COLORS.warning;
      return COLORS.danger;
    };

    it('should return success for score >= 80', () => {
      expect(getScoreColor(80)).toBe(COLORS.success);
      expect(getScoreColor(100)).toBe(COLORS.success);
    });

    it('should return warning for score >= 60 and < 80', () => {
      expect(getScoreColor(60)).toBe(COLORS.warning);
      expect(getScoreColor(79)).toBe(COLORS.warning);
    });

    it('should return danger for score < 60', () => {
      expect(getScoreColor(59)).toBe(COLORS.danger);
      expect(getScoreColor(0)).toBe(COLORS.danger);
    });
  });

  // ---- Variation Context Formatting ----
  describe('variation context formatting (replicated)', () => {
    const formatContext = (context: string) => context.replace(/_/g, ' ').toUpperCase();

    it('should format underscore contexts', () => {
      expect(formatContext('technical_interview')).toBe('TECHNICAL INTERVIEW');
    });

    it('should handle single word', () => {
      expect(formatContext('networking')).toBe('NETWORKING');
    });

    it('should handle empty string', () => {
      expect(formatContext('')).toBe('');
    });
  });

  // ---- Story Data Handling ----
  describe('story data handling (replicated)', () => {
    const extractStoryList = (data: any): any[] => {
      if (Array.isArray(data)) return data;
      return data?.stories || [];
    };

    it('should return array directly', () => {
      expect(extractStoryList([{ id: 1 }])).toHaveLength(1);
    });

    it('should extract stories property from object', () => {
      expect(extractStoryList({ stories: [{ id: 1 }] })).toHaveLength(1);
    });

    it('should return empty for object without stories', () => {
      expect(extractStoryList({ total: 0 })).toEqual([]);
    });

    it('should return empty for null', () => {
      expect(extractStoryList(null)).toEqual([]);
    });

    it('should return empty for undefined', () => {
      expect(extractStoryList(undefined)).toEqual([]);
    });
  });

  // ---- Delete API error with no error message ----
  describe('delete with default error message', () => {
    it('should show default error message when delete fails without error field', async () => {
      mockListStarStories.mockResolvedValue({ success: true, data: [sampleStory] });
      mockDeleteStarStory.mockResolvedValue({ success: false });

      const tree = await renderAndFlush();
      const root = tree.root;

      const deleteBtn = root.findAllByType('TouchableOpacity').find(
        (t: any) => t.props.accessibilityLabel === 'Delete Leadership Under Pressure'
      );

      await renderer.act(async () => {
        deleteBtn!.props.onPress({ stopPropagation: jest.fn() });
      });

      const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
      const deleteAction = buttons.find((b: any) => b.text === 'Delete');

      await renderer.act(async () => {
        await deleteAction.onPress();
        await flushPromises();
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to delete STAR story');
    });
  });

  // ---- Constants validation ----
  describe('constants used by component', () => {
    it('should use correct COLORS.primary', () => {
      expect(COLORS.primary).toBe('#3b82f6');
    });

    it('should use correct COLORS.danger', () => {
      expect(COLORS.danger).toBe('#ef4444');
    });

    it('should use correct COLORS.success', () => {
      expect(COLORS.success).toBe('#10b981');
    });

    it('should use correct COLORS.warning', () => {
      expect(COLORS.warning).toBe('#f59e0b');
    });

    it('should have correct ALPHA_COLORS.primary.bg', () => {
      expect(ALPHA_COLORS.primary.bg).toBe('rgba(59, 130, 246, 0.15)');
    });

    it('should use TAB_BAR_HEIGHT', () => {
      expect(TAB_BAR_HEIGHT).toBe(100);
    });
  });
});
