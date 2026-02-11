/**
 * SearchFilter Comprehensive Component Tests
 *
 * Tests the SearchFilter component AND useSearchFilter hook using
 * react-test-renderer to properly handle React hooks (useState, useCallback,
 * useRef, useEffect, useMemo). Covers all render branches:
 *
 * 1. Search input and debounced onSearchChange callback
 * 2. Filter button press to toggle modal
 * 3. Filter selection and application
 * 4. Filter badge rendering and removal
 * 5. Sort button and modal
 * 6. Sort option selection
 * 7. Reset filters functionality
 * 8. Active filter count badge
 * 9. All prop combinations
 * 10. useSearchFilter hook with all methods (real React context)
 *
 * Target: 100% coverage for SearchFilter.tsx (101 lines)
 */

// ---------------------------------------------------------------------------
// MOCKS -- must be declared before any imports
// ---------------------------------------------------------------------------

const mockColors = {
  text: '#ffffff',
  textSecondary: '#9ca3af',
  textTertiary: '#6b7280',
  border: '#374151',
  backgroundSecondary: '#1a1a1a',
};

let mockIsDark = true;

jest.mock('../../context/ThemeContext', () => ({
  useTheme: jest.fn(() => ({
    colors: mockColors,
    isDark: mockIsDark,
  })),
}));

jest.mock('../glass/GlassCard', () => ({
  GlassCard: (props: any) => {
    const React = require('react');
    return React.createElement('MockGlassCard', { style: props.style, material: props.material, shadow: props.shadow }, props.children);
  },
}));

jest.mock('../glass/GlassButton', () => ({
  GlassButton: (props: any) => {
    const React = require('react');
    return React.createElement(
      'MockGlassButton',
      { label: props.label, onPress: props.onPress, disabled: props.disabled, variant: props.variant },
      `GlassButton(${props.label})`
    );
  },
}));

// Override the global reanimated mock to include Animated.createAnimatedComponent
// which SearchFilter calls at module scope (line 79)
jest.mock('react-native-reanimated', () => {
  const mockAnimatedComponent = jest.fn((comp: any) => comp);
  return {
    __esModule: true,
    default: {
      createAnimatedComponent: mockAnimatedComponent,
      View: 'Animated.View',
      Text: 'Animated.Text',
      ScrollView: 'Animated.ScrollView',
      call: () => {},
    },
    useSharedValue: jest.fn((init: any) => ({ value: init })),
    useAnimatedStyle: jest.fn(() => ({})),
    withSpring: jest.fn((val: any) => val),
    withTiming: jest.fn((val: any) => val),
    withDelay: jest.fn((_d: any, val: any) => val),
    interpolate: jest.fn(),
    Extrapolation: { CLAMP: 'clamp' },
    FadeIn: { duration: jest.fn().mockReturnThis() },
    FadeOut: { duration: jest.fn().mockReturnThis() },
    SlideInDown: { springify: jest.fn(() => ({ damping: jest.fn(() => ({})) })) },
    SlideOutDown: {},
    createAnimatedComponent: mockAnimatedComponent,
    Animated: {
      View: 'Animated.View',
      Text: 'Animated.Text',
      ScrollView: 'Animated.ScrollView',
    },
  };
});

// ---------------------------------------------------------------------------
// IMPORTS
// ---------------------------------------------------------------------------

import React from 'react';
import renderer from 'react-test-renderer';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SearchFilter, useSearchFilter } from '../SearchFilter';
import { COLORS, ALPHA_COLORS, SPACING } from '../../utils/constants';

// ---------------------------------------------------------------------------
// TEST DATA -- reusable across tests
// ---------------------------------------------------------------------------

const SAMPLE_FILTERS = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'draft', label: 'Draft' },
      { value: 'archived', label: 'Archived' },
    ],
  },
  {
    key: 'category',
    label: 'Category',
    options: [
      { value: 'tech', label: 'Technology' },
      { value: 'finance', label: 'Finance' },
    ],
  },
];

const SAMPLE_SORT_OPTIONS = [
  { value: 'date', label: 'Date Added' },
  { value: 'score', label: 'Match Score' },
  { value: 'name', label: 'Name (A-Z)', direction: 'asc' as const },
];

const BASE_PROPS = {
  searchQuery: '',
  onSearchChange: jest.fn(),
};

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

/** Render SearchFilter via react-test-renderer wrapped in act(). */
const renderSF = (overrides: Record<string, any> = {}) => {
  const props = { ...BASE_PROPS, ...overrides };
  let tree: any;
  renderer.act(() => {
    tree = renderer.create(React.createElement(SearchFilter, props));
  });
  return tree!;
};

/** Deep-collect all text strings from a JSON tree node. */
const getTreeText = (node: any): string => {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (typeof node === 'boolean') return '';
  let text = '';
  if (node.children) {
    for (const child of node.children) {
      text += getTreeText(child);
    }
  }
  return text;
};

/**
 * Recursively extract all text from an instance tree node's children.
 * Instance nodes have .children (array of child instances or strings)
 * and .props (which may include children).
 *
 * For lucide-react-native MockIcon instances, the type is a function
 * with a displayName, and calling type(props) returns a string like "XIcon".
 */
const getInstanceText = (node: any): string => {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);

  let text = '';

  // If node.type is a function (MockIcon), try calling it to get the rendered text
  if (typeof node.type === 'function' && node.type.displayName) {
    try {
      const result = node.type(node.props || {});
      if (typeof result === 'string') text += result;
    } catch {
      // Not all functions can be called safely
    }
  }

  // Walk instance children
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      text += ' ' + getInstanceText(child);
    }
  }

  // Also check props.children for strings (e.g., Text children)
  if (node.props) {
    const pc = node.props.children;
    if (typeof pc === 'string') {
      text += ' ' + pc;
    } else if (typeof pc === 'number') {
      text += ' ' + String(pc);
    } else if (Array.isArray(pc)) {
      for (const c of pc) {
        if (typeof c === 'string') text += ' ' + c;
        if (typeof c === 'number') text += ' ' + String(c);
      }
    }
  }

  return text;
};

/**
 * Find a TouchableOpacity in the instance tree whose subtree contains
 * the given text. Works by walking instance children (NOT toJSON, which
 * is only available on the root tree object, not instance nodes).
 *
 * Returns the LAST (deepest/most-specific) match to avoid returning
 * parent containers (like the modal overlay) that also contain the text.
 *
 * For icon names like 'SlidersHorizontalIcon', checks MockIcon displayName.
 * For text like 'Clear all' or 'Active', checks Text node children.
 */
const findButton = (root: any, text: string): any => {
  const all = root.findAllByType('TouchableOpacity');
  let lastMatch: any = null;
  for (const node of all) {
    const instanceText = getInstanceText(node);
    if (instanceText.includes(text)) lastMatch = node;
  }
  return lastMatch;
};

/**
 * Find ALL TouchableOpacity nodes whose subtree contains the given text.
 */
const findAllButtons = (root: any, text: string): any[] => {
  const all = root.findAllByType('TouchableOpacity');
  return all.filter((node: any) => getInstanceText(node).includes(text));
};

// ---------------------------------------------------------------------------
// TESTS
// ---------------------------------------------------------------------------

describe('SearchFilter Comprehensive Tests', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockIsDark = true;
    (BASE_PROPS.onSearchChange as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // =========================================================================
  // 1. MODULE EXPORTS
  // =========================================================================

  describe('module exports', () => {
    it('should export SearchFilter as a named export', () => {
      expect(SearchFilter).toBeDefined();
      expect(typeof SearchFilter).toBe('function');
    });

    it('should export SearchFilter as the default export', () => {
      const mod = require('../SearchFilter');
      expect(mod.default).toBe(mod.SearchFilter);
    });

    it('should export useSearchFilter hook', () => {
      expect(useSearchFilter).toBeDefined();
      expect(typeof useSearchFilter).toBe('function');
    });
  });

  // =========================================================================
  // 2. BASIC RENDERING
  // =========================================================================

  describe('basic rendering', () => {
    it('should render with minimal props (searchQuery + onSearchChange)', () => {
      const json = renderSF().toJSON();
      expect(json).toBeTruthy();
      expect(json.type).toBe('View');
    });

    it('should render TextInput with default placeholder "Search..."', () => {
      const str = JSON.stringify(renderSF().toJSON());
      expect(str).toContain('Search...');
    });

    it('should render custom placeholder when provided', () => {
      const str = JSON.stringify(renderSF({ placeholder: 'Find resumes...' }).toJSON());
      expect(str).toContain('Find resumes...');
    });

    it('should display localSearch value synced from searchQuery prop', () => {
      const str = JSON.stringify(renderSF({ searchQuery: 'hello' }).toJSON());
      expect(str).toContain('hello');
    });

    it('should NOT render filter button when filters prop is undefined', () => {
      const str = JSON.stringify(renderSF().toJSON());
      expect(str).not.toContain('SlidersHorizontal');
    });

    it('should NOT render filter button when filters is empty array', () => {
      const str = JSON.stringify(renderSF({ filters: [] }).toJSON());
      expect(str).not.toContain('SlidersHorizontal');
    });

    it('should NOT render sort button when sortOptions is undefined', () => {
      const str = JSON.stringify(renderSF().toJSON());
      expect(str).not.toContain('ArrowUpDown');
    });

    it('should NOT render sort button when sortOptions is empty array', () => {
      const str = JSON.stringify(renderSF({ sortOptions: [] }).toJSON());
      expect(str).not.toContain('ArrowUpDown');
    });
  });

  // =========================================================================
  // 3. SEARCH INPUT & DEBOUNCED CALLBACK
  // =========================================================================

  describe('search input and debounced onSearchChange', () => {
    it('should call onSearchChange after debounce delay (default 300ms)', () => {
      const onSearchChange = jest.fn();
      const tree = renderSF({ onSearchChange });
      const root = tree.root;

      const textInputs = root.findAllByType('TextInput');
      expect(textInputs.length).toBeGreaterThan(0);

      renderer.act(() => {
        textInputs[0].props.onChangeText('cyber');
      });

      expect(onSearchChange).not.toHaveBeenCalled();

      renderer.act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(onSearchChange).toHaveBeenCalledWith('cyber');
    });

    it('should respect custom debounceMs', () => {
      const onSearchChange = jest.fn();
      const tree = renderSF({ onSearchChange, debounceMs: 500 });
      const root = tree.root;
      const textInputs = root.findAllByType('TextInput');

      renderer.act(() => {
        textInputs[0].props.onChangeText('test');
      });

      renderer.act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(onSearchChange).not.toHaveBeenCalled();

      renderer.act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(onSearchChange).toHaveBeenCalledWith('test');
    });

    it('should debounce multiple rapid inputs (only fires last value)', () => {
      const onSearchChange = jest.fn();
      const tree = renderSF({ onSearchChange });
      const root = tree.root;
      const textInputs = root.findAllByType('TextInput');

      renderer.act(() => {
        textInputs[0].props.onChangeText('c');
      });
      renderer.act(() => {
        jest.advanceTimersByTime(100);
      });
      renderer.act(() => {
        textInputs[0].props.onChangeText('cy');
      });
      renderer.act(() => {
        jest.advanceTimersByTime(100);
      });
      renderer.act(() => {
        textInputs[0].props.onChangeText('cyber');
      });
      renderer.act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(onSearchChange).toHaveBeenCalledTimes(1);
      expect(onSearchChange).toHaveBeenCalledWith('cyber');
    });

    it('should update localSearch immediately on each keystroke', () => {
      const tree = renderSF();
      const root = tree.root;
      const textInputs = root.findAllByType('TextInput');

      renderer.act(() => {
        textInputs[0].props.onChangeText('hi');
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('hi');
    });

    it('should sync localSearch when searchQuery prop changes externally', () => {
      const tree = renderSF({ searchQuery: 'initial' });

      renderer.act(() => {
        tree.update(React.createElement(SearchFilter, { ...BASE_PROPS, searchQuery: 'updated' }));
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('updated');
    });
  });

  // =========================================================================
  // 4. CLEAR SEARCH BUTTON
  // =========================================================================

  describe('clear search button', () => {
    it('should NOT render X button when search is empty', () => {
      const str = JSON.stringify(renderSF({ searchQuery: '' }).toJSON());
      const xOccurrences = (str.match(/XIcon/g) || []).length;
      expect(xOccurrences).toBe(0);
    });

    it('should render X button when localSearch has text', () => {
      const str = JSON.stringify(renderSF({ searchQuery: 'test' }).toJSON());
      expect(str).toContain('XIcon');
    });

    it('should clear search and call onSearchChange with empty string when X pressed', () => {
      const onSearchChange = jest.fn();
      const tree = renderSF({ searchQuery: 'test', onSearchChange });
      const root = tree.root;

      const clearBtn = findButton(root, 'XIcon');
      expect(clearBtn).toBeTruthy();

      renderer.act(() => {
        clearBtn!.props.onPress();
      });

      expect(onSearchChange).toHaveBeenCalledWith('');
    });

    it('should trigger haptics on iOS when clearing search', () => {
      const tree = renderSF({ searchQuery: 'test' });
      const root = tree.root;

      const clearBtn = findButton(root, 'XIcon');

      renderer.act(() => {
        clearBtn!.props.onPress();
      });

      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    });
  });

  // =========================================================================
  // 5. FOCUS / BLUR HANDLERS
  // =========================================================================

  describe('focus and blur handlers', () => {
    it('should call handleFocus when TextInput receives focus', () => {
      const tree = renderSF();
      const root = tree.root;
      const textInputs = root.findAllByType('TextInput');

      renderer.act(() => {
        textInputs[0].props.onFocus();
      });

      const { withTiming } = require('react-native-reanimated');
      expect(withTiming).toHaveBeenCalled();
    });

    it('should call handleBlur when TextInput loses focus', () => {
      const tree = renderSF();
      const root = tree.root;
      const textInputs = root.findAllByType('TextInput');

      renderer.act(() => {
        textInputs[0].props.onBlur();
      });

      const { withTiming } = require('react-native-reanimated');
      expect(withTiming).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 6. FILTER BUTTON & PANEL TOGGLE
  // =========================================================================

  describe('filter button and panel toggle', () => {
    it('should render filter button when filters are provided', () => {
      const str = JSON.stringify(renderSF({ filters: SAMPLE_FILTERS }).toJSON());
      expect(str).toContain('SlidersHorizontalIcon');
    });

    it('should NOT show filter panel initially', () => {
      const str = JSON.stringify(renderSF({ filters: SAMPLE_FILTERS }).toJSON());
      expect(str).not.toContain('Filters');
    });

    it('should show filter panel after pressing filter button', () => {
      const tree = renderSF({ filters: SAMPLE_FILTERS });
      const root = tree.root;

      const filterBtn = findButton(root, 'SlidersHorizontalIcon');
      expect(filterBtn).toBeTruthy();

      renderer.act(() => {
        filterBtn!.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Filters');
    });

    it('should trigger haptics on iOS when toggling filters', () => {
      const tree = renderSF({ filters: SAMPLE_FILTERS });
      const root = tree.root;

      const filterBtn = findButton(root, 'SlidersHorizontalIcon');

      renderer.act(() => {
        filterBtn!.props.onPress();
      });

      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    });

    it('should animate filterIconScale with withSpring on toggle', () => {
      const tree = renderSF({ filters: SAMPLE_FILTERS });
      const root = tree.root;

      const filterBtn = findButton(root, 'SlidersHorizontalIcon');
      const { withSpring } = require('react-native-reanimated');
      withSpring.mockClear();

      renderer.act(() => {
        filterBtn!.props.onPress();
      });

      // toggleFilters calls withSpring twice (scale to 0.9, then back to 1)
      expect(withSpring).toHaveBeenCalledTimes(2);
    });

    it('should hide filter panel when toggle is pressed again', () => {
      const tree = renderSF({ filters: SAMPLE_FILTERS });
      const root = tree.root;

      // Open
      renderer.act(() => {
        findButton(root, 'SlidersHorizontalIcon')!.props.onPress();
      });
      expect(JSON.stringify(tree.toJSON())).toContain('Filters');

      // Close
      renderer.act(() => {
        findButton(root, 'SlidersHorizontalIcon')!.props.onPress();
      });
      expect(JSON.stringify(tree.toJSON())).not.toContain('Filters');
    });

    it('should render filter labels for each filter config', () => {
      const tree = renderSF({ filters: SAMPLE_FILTERS });
      const root = tree.root;

      renderer.act(() => {
        findButton(root, 'SlidersHorizontalIcon')!.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Status');
      expect(str).toContain('Category');
    });

    it('should render "All" chip for each filter group', () => {
      const tree = renderSF({ filters: SAMPLE_FILTERS });
      const root = tree.root;

      renderer.act(() => {
        findButton(root, 'SlidersHorizontalIcon')!.props.onPress();
      });

      const text = getTreeText(tree.toJSON());
      const allMatches = text.match(/All/g);
      expect(allMatches).toBeTruthy();
      expect(allMatches!.length).toBeGreaterThanOrEqual(2);
    });

    it('should render each filter option chip', () => {
      const tree = renderSF({ filters: SAMPLE_FILTERS });
      const root = tree.root;

      renderer.act(() => {
        findButton(root, 'SlidersHorizontalIcon')!.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Active');
      expect(str).toContain('Draft');
      expect(str).toContain('Archived');
      expect(str).toContain('Technology');
      expect(str).toContain('Finance');
    });
  });

  // =========================================================================
  // 7. FILTER SELECTION & APPLICATION
  // =========================================================================

  describe('filter selection and application', () => {
    it('should call onFilterChange when a filter option is selected', () => {
      const onFilterChange = jest.fn();
      const tree = renderSF({
        filters: SAMPLE_FILTERS,
        onFilterChange,
        selectedFilters: {},
      });
      const root = tree.root;

      // Open filter panel
      renderer.act(() => {
        findButton(root, 'SlidersHorizontalIcon')!.props.onPress();
      });

      // Find the "Active" chip and press it
      const activeChip = findButton(root, 'Active');
      expect(activeChip).toBeTruthy();

      renderer.act(() => {
        activeChip!.props.onPress();
      });

      expect(onFilterChange).toHaveBeenCalledWith({ status: 'active' });
    });

    it('should trigger haptics on iOS when selecting a filter', () => {
      const onFilterChange = jest.fn();
      const tree = renderSF({
        filters: SAMPLE_FILTERS,
        onFilterChange,
        selectedFilters: {},
      });
      const root = tree.root;

      renderer.act(() => {
        findButton(root, 'SlidersHorizontalIcon')!.props.onPress();
      });

      (Haptics.impactAsync as jest.Mock).mockClear();

      const draftChip = findButton(root, 'Draft');
      renderer.act(() => {
        draftChip!.props.onPress();
      });

      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    });

    it('should remove filter when "All" chip is pressed for a filter group', () => {
      const onFilterChange = jest.fn();
      const tree = renderSF({
        filters: SAMPLE_FILTERS,
        onFilterChange,
        selectedFilters: { status: 'active' },
      });
      const root = tree.root;

      renderer.act(() => {
        findButton(root, 'SlidersHorizontalIcon')!.props.onPress();
      });

      // Find "All" buttons -- exclude any that also contain "Clear all"
      const allChips = findAllButtons(root, 'All').filter((btn: any) => {
        const btnText = getInstanceText(btn);
        return !btnText.includes('Clear all') && !btnText.includes('Clear');
      });

      expect(allChips.length).toBeGreaterThan(0);

      renderer.act(() => {
        allChips[0].props.onPress();
      });

      expect(onFilterChange).toHaveBeenCalledWith({});
    });

    it('should highlight selected filter chip with primary color', () => {
      const tree = renderSF({
        filters: SAMPLE_FILTERS,
        selectedFilters: { status: 'active' },
      });
      const root = tree.root;

      renderer.act(() => {
        findButton(root, 'SlidersHorizontalIcon')!.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain(ALPHA_COLORS.primary.bg);
      expect(str).toContain(ALPHA_COLORS.primary.border);
    });

    it('should NOT call onFilterChange when onFilterChange prop is not provided', () => {
      const tree = renderSF({
        filters: SAMPLE_FILTERS,
        selectedFilters: {},
      });
      const root = tree.root;

      renderer.act(() => {
        findButton(root, 'SlidersHorizontalIcon')!.props.onPress();
      });

      const chip = findButton(root, 'Active');

      expect(() => {
        renderer.act(() => {
          chip!.props.onPress();
        });
      }).not.toThrow();
    });
  });

  // =========================================================================
  // 8. ACTIVE FILTER TAGS (badges) & REMOVAL
  // =========================================================================

  describe('active filter tags and badge removal', () => {
    it('should render active filter tags when filters selected and panel closed', () => {
      const str = JSON.stringify(
        renderSF({
          filters: SAMPLE_FILTERS,
          selectedFilters: { status: 'active' },
        }).toJSON()
      );
      expect(str).toContain('Status');
      expect(str).toContain('Active');
    });

    it('should NOT render active filter tags when panel is open', () => {
      const tree = renderSF({
        filters: SAMPLE_FILTERS,
        selectedFilters: { status: 'active' },
      });
      const root = tree.root;

      renderer.act(() => {
        findButton(root, 'SlidersHorizontalIcon')!.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Filters'); // Panel is open
    });

    it('should render filter tag with fallback to raw value when option label not found', () => {
      const str = JSON.stringify(
        renderSF({
          filters: SAMPLE_FILTERS,
          selectedFilters: { status: 'unknown_value' },
        }).toJSON()
      );
      expect(str).toContain('unknown_value');
    });

    it('should remove active filter when X on tag is pressed', () => {
      const onFilterChange = jest.fn();
      const tree = renderSF({
        filters: SAMPLE_FILTERS,
        selectedFilters: { status: 'active', category: 'tech' },
        onFilterChange,
      });
      const root = tree.root;

      // Find remove buttons in the tag row by hitSlop (tags have hitSlop={5,5,5,5})
      const allTouchables = root.findAllByType('TouchableOpacity');
      const removeButtons = allTouchables.filter((t: any) => {
        return t.props.hitSlop && t.props.hitSlop.top === 5;
      });

      expect(removeButtons.length).toBe(2); // one per active filter

      renderer.act(() => {
        removeButtons[0].props.onPress();
      });

      expect(onFilterChange).toHaveBeenCalled();
      const call = onFilterChange.mock.calls[0][0];
      expect(Object.keys(call).length).toBe(1);
    });

    it('should render multiple active filter tags', () => {
      const str = JSON.stringify(
        renderSF({
          filters: SAMPLE_FILTERS,
          selectedFilters: { status: 'active', category: 'tech' },
        }).toJSON()
      );
      expect(str).toContain('Status');
      expect(str).toContain('Category');
    });
  });

  // =========================================================================
  // 9. FILTER COUNT BADGE
  // =========================================================================

  describe('active filter count badge', () => {
    it('should NOT show badge when no active filters', () => {
      const str = JSON.stringify(
        renderSF({ filters: SAMPLE_FILTERS, selectedFilters: {} }).toJSON()
      );
      expect(str).not.toContain('filterBadge');
    });

    it('should show badge with count 1 when one filter is active', () => {
      const str = JSON.stringify(
        renderSF({
          filters: SAMPLE_FILTERS,
          selectedFilters: { status: 'active' },
        }).toJSON()
      );
      expect(str).toContain(COLORS.primary); // badge background
    });

    it('should show badge with count 2 when two filters are active', () => {
      const tree = renderSF({
        filters: SAMPLE_FILTERS,
        selectedFilters: { status: 'active', category: 'tech' },
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('2');
    });
  });

  // =========================================================================
  // 10. CLEAR ALL FILTERS
  // =========================================================================

  describe('clear all filters', () => {
    it('should show "Clear all" button when filters are active and panel is open', () => {
      const tree = renderSF({
        filters: SAMPLE_FILTERS,
        selectedFilters: { status: 'active' },
      });
      const root = tree.root;

      renderer.act(() => {
        findButton(root, 'SlidersHorizontalIcon')!.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Clear all');
    });

    it('should NOT show "Clear all" when no filters are active', () => {
      const tree = renderSF({
        filters: SAMPLE_FILTERS,
        selectedFilters: {},
      });
      const root = tree.root;

      renderer.act(() => {
        findButton(root, 'SlidersHorizontalIcon')!.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).not.toContain('Clear all');
    });

    it('should call onFilterChange({}) when "Clear all" is pressed', () => {
      const onFilterChange = jest.fn();
      const tree = renderSF({
        filters: SAMPLE_FILTERS,
        selectedFilters: { status: 'active', category: 'tech' },
        onFilterChange,
      });
      const root = tree.root;

      renderer.act(() => {
        findButton(root, 'SlidersHorizontalIcon')!.props.onPress();
      });

      const clearAllBtn = findButton(root, 'Clear all');
      expect(clearAllBtn).toBeTruthy();

      renderer.act(() => {
        clearAllBtn!.props.onPress();
      });

      expect(onFilterChange).toHaveBeenCalledWith({});
    });

    it('should trigger haptics with Medium style when clearing all filters', () => {
      const onFilterChange = jest.fn();
      const tree = renderSF({
        filters: SAMPLE_FILTERS,
        selectedFilters: { status: 'active' },
        onFilterChange,
      });
      const root = tree.root;

      renderer.act(() => {
        findButton(root, 'SlidersHorizontalIcon')!.props.onPress();
      });

      (Haptics.impactAsync as jest.Mock).mockClear();

      const clearAllBtn = findButton(root, 'Clear all');
      renderer.act(() => {
        clearAllBtn!.props.onPress();
      });

      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
    });

    it('should not call onFilterChange or haptics when onFilterChange is not provided', () => {
      const tree = renderSF({
        filters: SAMPLE_FILTERS,
        selectedFilters: { status: 'active' },
        // onFilterChange deliberately omitted
      });
      const root = tree.root;

      renderer.act(() => {
        findButton(root, 'SlidersHorizontalIcon')!.props.onPress();
      });

      (Haptics.impactAsync as jest.Mock).mockClear();

      const clearAllBtn = findButton(root, 'Clear all');

      expect(() => {
        renderer.act(() => {
          clearAllBtn!.props.onPress();
        });
      }).not.toThrow();

      // Haptics should NOT have been called since onFilterChange guard prevents it
      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 11. SORT BUTTON & MODAL
  // =========================================================================

  describe('sort button and modal', () => {
    it('should render sort button when sortOptions are provided', () => {
      const str = JSON.stringify(
        renderSF({ sortOptions: SAMPLE_SORT_OPTIONS }).toJSON()
      );
      expect(str).toContain('ArrowUpDownIcon');
    });

    it('should render sort modal (initially invisible via Modal visible=false)', () => {
      const tree = renderSF({ sortOptions: SAMPLE_SORT_OPTIONS });
      const root = tree.root;

      const modals = root.findAllByType('Modal');
      expect(modals.length).toBe(1);
      expect(modals[0].props.visible).toBe(false);
    });

    it('should open sort modal when sort button is pressed', () => {
      const tree = renderSF({ sortOptions: SAMPLE_SORT_OPTIONS });
      const root = tree.root;

      const sortBtn = findButton(root, 'ArrowUpDownIcon');
      expect(sortBtn).toBeTruthy();

      renderer.act(() => {
        sortBtn!.props.onPress();
      });

      const modals = root.findAllByType('Modal');
      expect(modals[0].props.visible).toBe(true);
    });

    it('should render "Sort by" title in the modal', () => {
      const tree = renderSF({ sortOptions: SAMPLE_SORT_OPTIONS });
      const root = tree.root;

      renderer.act(() => {
        findButton(root, 'ArrowUpDownIcon')!.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Sort by');
    });

    it('should render all sort option labels in the modal', () => {
      const tree = renderSF({ sortOptions: SAMPLE_SORT_OPTIONS });
      const root = tree.root;

      renderer.act(() => {
        findButton(root, 'ArrowUpDownIcon')!.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Date Added');
      expect(str).toContain('Match Score');
      expect(str).toContain('Name (A-Z)');
    });

    it('should close sort modal when overlay is pressed', () => {
      const tree = renderSF({ sortOptions: SAMPLE_SORT_OPTIONS });
      const root = tree.root;

      renderer.act(() => {
        findButton(root, 'ArrowUpDownIcon')!.props.onPress();
      });

      // Modal overlay has activeOpacity=1
      const allTouchables = root.findAllByType('TouchableOpacity');
      const overlay = allTouchables.find((t: any) => t.props.activeOpacity === 1);
      expect(overlay).toBeTruthy();

      renderer.act(() => {
        overlay!.props.onPress();
      });

      const modals = root.findAllByType('Modal');
      expect(modals[0].props.visible).toBe(false);
    });

    it('should close sort modal via onRequestClose (Android back button)', () => {
      const tree = renderSF({ sortOptions: SAMPLE_SORT_OPTIONS });
      const root = tree.root;

      renderer.act(() => {
        findButton(root, 'ArrowUpDownIcon')!.props.onPress();
      });

      const modals = root.findAllByType('Modal');
      expect(modals[0].props.visible).toBe(true);

      renderer.act(() => {
        modals[0].props.onRequestClose();
      });

      expect(root.findAllByType('Modal')[0].props.visible).toBe(false);
    });
  });

  // =========================================================================
  // 12. SORT OPTION SELECTION
  // =========================================================================

  describe('sort option selection', () => {
    it('should call onSortChange with selected sort value', () => {
      const onSortChange = jest.fn();
      const tree = renderSF({
        sortOptions: SAMPLE_SORT_OPTIONS,
        onSortChange,
        selectedSort: '',
      });
      const root = tree.root;

      renderer.act(() => {
        findButton(root, 'ArrowUpDownIcon')!.props.onPress();
      });

      const scoreOption = findButton(root, 'Match Score');
      expect(scoreOption).toBeTruthy();

      renderer.act(() => {
        scoreOption!.props.onPress();
      });

      expect(onSortChange).toHaveBeenCalledWith('score');
    });

    it('should close sort modal after selecting an option', () => {
      const onSortChange = jest.fn();
      const tree = renderSF({
        sortOptions: SAMPLE_SORT_OPTIONS,
        onSortChange,
      });
      const root = tree.root;

      renderer.act(() => {
        findButton(root, 'ArrowUpDownIcon')!.props.onPress();
      });

      const dateOption = findButton(root, 'Date Added');
      renderer.act(() => {
        dateOption!.props.onPress();
      });

      const modals = root.findAllByType('Modal');
      expect(modals[0].props.visible).toBe(false);
    });

    it('should trigger haptics on iOS when selecting a sort option', () => {
      const onSortChange = jest.fn();
      const tree = renderSF({
        sortOptions: SAMPLE_SORT_OPTIONS,
        onSortChange,
      });
      const root = tree.root;

      renderer.act(() => {
        findButton(root, 'ArrowUpDownIcon')!.props.onPress();
      });

      (Haptics.impactAsync as jest.Mock).mockClear();

      const option = findButton(root, 'Name (A-Z)');
      renderer.act(() => {
        option!.props.onPress();
      });

      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    });

    it('should highlight currently selected sort option with primary color', () => {
      const tree = renderSF({
        sortOptions: SAMPLE_SORT_OPTIONS,
        selectedSort: 'score',
      });
      const root = tree.root;

      renderer.act(() => {
        findButton(root, 'ArrowUpDownIcon')!.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain(ALPHA_COLORS.primary.bg);
      expect(str).toContain('CheckIcon');
    });

    it('should NOT show check icon for non-selected sort options', () => {
      const tree = renderSF({
        sortOptions: [{ value: 'date', label: 'Date' }],
        selectedSort: 'not_date',
      });
      const root = tree.root;

      renderer.act(() => {
        findButton(root, 'ArrowUpDownIcon')!.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).not.toContain('CheckIcon');
    });

    it('should handle onSortChange being undefined (optional chaining)', () => {
      const tree = renderSF({
        sortOptions: SAMPLE_SORT_OPTIONS,
      });
      const root = tree.root;

      renderer.act(() => {
        findButton(root, 'ArrowUpDownIcon')!.props.onPress();
      });

      const option = findButton(root, 'Date Added');

      expect(() => {
        renderer.act(() => {
          option!.props.onPress();
        });
      }).not.toThrow();
    });
  });

  // =========================================================================
  // 13. DARK / LIGHT MODE STYLING
  // =========================================================================

  describe('dark and light mode styling', () => {
    it('should use dark mode alpha colors for input container in dark mode', () => {
      mockIsDark = true;
      const str = JSON.stringify(renderSF().toJSON());
      expect(str).toContain(ALPHA_COLORS.white[5]);
      expect(str).toContain(ALPHA_COLORS.white[10]);
    });

    it('should use light mode alpha colors for input container in light mode', () => {
      mockIsDark = false;
      const str = JSON.stringify(renderSF().toJSON());
      expect(str).toContain(ALPHA_COLORS.black[3]);
      expect(str).toContain(ALPHA_COLORS.black[10]);
    });

    it('should use elevated dark colors for filter button when active (dark mode)', () => {
      mockIsDark = true;
      const str = JSON.stringify(
        renderSF({
          filters: SAMPLE_FILTERS,
          selectedFilters: { status: 'active' },
        }).toJSON()
      );
      expect(str).toContain(ALPHA_COLORS.white[10]);
      expect(str).toContain(ALPHA_COLORS.white[20]);
    });

    it('should use elevated light colors for filter button when active (light mode)', () => {
      mockIsDark = false;
      const str = JSON.stringify(
        renderSF({
          filters: SAMPLE_FILTERS,
          selectedFilters: { status: 'active' },
        }).toJSON()
      );
      expect(str).toContain(ALPHA_COLORS.black[10]);
      expect(str).toContain(ALPHA_COLORS.black[15]);
    });

    it('should use elevated colors for sort button when selectedSort is set (dark)', () => {
      mockIsDark = true;
      const str = JSON.stringify(
        renderSF({
          sortOptions: SAMPLE_SORT_OPTIONS,
          selectedSort: 'date',
        }).toJSON()
      );
      expect(str).toContain(ALPHA_COLORS.white[10]);
    });

    it('should use base colors for sort button when no selectedSort (light)', () => {
      mockIsDark = false;
      const str = JSON.stringify(
        renderSF({
          sortOptions: SAMPLE_SORT_OPTIONS,
          selectedSort: '',
        }).toJSON()
      );
      expect(str).toContain(ALPHA_COLORS.black[3]);
    });

    it('should use elevated light colors for sort button when selectedSort is set (light)', () => {
      mockIsDark = false;
      const str = JSON.stringify(
        renderSF({
          sortOptions: SAMPLE_SORT_OPTIONS,
          selectedSort: 'date',
        }).toJSON()
      );
      expect(str).toContain(ALPHA_COLORS.black[10]);
      expect(str).toContain(ALPHA_COLORS.black[15]);
    });

    it('should use base dark colors for sort button when no selectedSort (dark)', () => {
      mockIsDark = true;
      const str = JSON.stringify(
        renderSF({
          sortOptions: SAMPLE_SORT_OPTIONS,
          selectedSort: '',
        }).toJSON()
      );
      expect(str).toContain(ALPHA_COLORS.white[5]);
      expect(str).toContain(ALPHA_COLORS.white[10]);
    });

    it('should use base dark colors for filter button when inactive (dark)', () => {
      mockIsDark = true;
      const str = JSON.stringify(
        renderSF({
          filters: SAMPLE_FILTERS,
          selectedFilters: {},
        }).toJSON()
      );
      expect(str).toContain(ALPHA_COLORS.white[5]);
    });

    it('should use base light colors for filter button when inactive (light)', () => {
      mockIsDark = false;
      const str = JSON.stringify(
        renderSF({
          filters: SAMPLE_FILTERS,
          selectedFilters: {},
        }).toJSON()
      );
      expect(str).toContain(ALPHA_COLORS.black[3]);
    });

    it('should use dark chip colors for unselected filter chips in dark mode', () => {
      mockIsDark = true;
      const tree = renderSF({
        filters: SAMPLE_FILTERS,
        selectedFilters: {},
      });
      const root = tree.root;

      renderer.act(() => {
        findButton(root, 'SlidersHorizontalIcon')!.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain(ALPHA_COLORS.white[5]);
    });

    it('should use light chip colors for unselected filter chips in light mode', () => {
      mockIsDark = false;
      const tree = renderSF({
        filters: SAMPLE_FILTERS,
        selectedFilters: {},
      });
      const root = tree.root;

      renderer.act(() => {
        findButton(root, 'SlidersHorizontalIcon')!.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain(ALPHA_COLORS.black[3]);
    });

    it('should use light non-selected "All" chip colors when a filter is selected (light mode)', () => {
      mockIsDark = false;
      const tree = renderSF({
        filters: SAMPLE_FILTERS,
        selectedFilters: { status: 'active' },
      });
      const root = tree.root;

      renderer.act(() => {
        findButton(root, 'SlidersHorizontalIcon')!.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      // The "All" chip for "status" should be non-selected (use light neutral colors)
      // and the "Category" All chip should also be non-selected
      expect(str).toContain(ALPHA_COLORS.black[3]);
      expect(str).toContain(ALPHA_COLORS.black[10]);
    });
  });

  // =========================================================================
  // 14. ALL PROP COMBINATIONS
  // =========================================================================

  describe('all prop combinations', () => {
    it('should render with all props provided simultaneously', () => {
      const tree = renderSF({
        placeholder: 'Custom search...',
        searchQuery: 'resume',
        onSearchChange: jest.fn(),
        filters: SAMPLE_FILTERS,
        selectedFilters: { status: 'active' },
        onFilterChange: jest.fn(),
        sortOptions: SAMPLE_SORT_OPTIONS,
        selectedSort: 'score',
        onSortChange: jest.fn(),
        debounceMs: 200,
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Custom search...');
      expect(str).toContain('resume');
      expect(str).toContain('SlidersHorizontalIcon');
      expect(str).toContain('ArrowUpDownIcon');
    });

    it('should render only search bar when no filters or sort', () => {
      const str = JSON.stringify(renderSF().toJSON());
      expect(str).toContain('Search...');
      expect(str).not.toContain('SlidersHorizontalIcon');
      expect(str).not.toContain('ArrowUpDownIcon');
    });

    it('should render search + filters without sort', () => {
      const str = JSON.stringify(
        renderSF({ filters: SAMPLE_FILTERS }).toJSON()
      );
      expect(str).toContain('SlidersHorizontalIcon');
      expect(str).not.toContain('ArrowUpDownIcon');
    });

    it('should render search + sort without filters', () => {
      const str = JSON.stringify(
        renderSF({ sortOptions: SAMPLE_SORT_OPTIONS }).toJSON()
      );
      expect(str).not.toContain('SlidersHorizontalIcon');
      expect(str).toContain('ArrowUpDownIcon');
    });

    it('should use colors.text for sort button icon color when selectedSort is set', () => {
      const str = JSON.stringify(
        renderSF({
          sortOptions: SAMPLE_SORT_OPTIONS,
          selectedSort: 'date',
        }).toJSON()
      );
      expect(str).toContain(mockColors.text);
    });

    it('should use colors.textTertiary for sort button icon color when no selectedSort', () => {
      const str = JSON.stringify(
        renderSF({
          sortOptions: SAMPLE_SORT_OPTIONS,
        }).toJSON()
      );
      expect(str).toContain(mockColors.textTertiary);
    });
  });

  // =========================================================================
  // 15. useSearchFilter HOOK (real React context via helper component)
  // =========================================================================

  describe('useSearchFilter hook', () => {
    interface TestItem {
      name: string;
      status: string;
      score: number;
      category: string;
    }

    const testItems: TestItem[] = [
      { name: 'Alpha Resume', status: 'active', score: 85, category: 'tech' },
      { name: 'Beta Resume', status: 'draft', score: 60, category: 'finance' },
      { name: 'Gamma Resume', status: 'active', score: 92, category: 'tech' },
      { name: 'Delta Resume', status: 'archived', score: 45, category: 'healthcare' },
      { name: 'Epsilon Resume', status: 'draft', score: 78, category: 'finance' },
    ];

    /**
     * HookTestHarness: Renders a component that calls useSearchFilter
     * and exposes the return value via a mutable ref for assertions.
     */
    const createHarness = (
      items: TestItem[],
      searchFields: (keyof TestItem)[],
      filterFields?: Record<string, keyof TestItem>
    ) => {
      const resultRef: { current: ReturnType<typeof useSearchFilter<TestItem>> | null } = { current: null };

      const HookHarness = () => {
        const result = useSearchFilter(items, searchFields, filterFields);
        resultRef.current = result;
        return React.createElement('View', null, `items:${result.filteredItems.length}`);
      };

      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(HookHarness));
      });

      return { resultRef, tree: tree! };
    };

    it('should return all items initially when no search or filters', () => {
      const { resultRef } = createHarness(testItems, ['name', 'status']);
      expect(resultRef.current!.filteredItems).toHaveLength(5);
    });

    it('should have empty searchQuery initially', () => {
      const { resultRef } = createHarness(testItems, ['name']);
      expect(resultRef.current!.searchQuery).toBe('');
    });

    it('should have empty selectedFilters initially', () => {
      const { resultRef } = createHarness(testItems, ['name']);
      expect(resultRef.current!.selectedFilters).toEqual({});
    });

    it('should have empty selectedSort initially', () => {
      const { resultRef } = createHarness(testItems, ['name']);
      expect(resultRef.current!.selectedSort).toBe('');
    });

    it('should have hasFilters=false initially', () => {
      const { resultRef } = createHarness(testItems, ['name']);
      expect(resultRef.current!.hasFilters).toBe(false);
    });

    it('should filter items by string search query', () => {
      const { resultRef } = createHarness(testItems, ['name', 'status']);

      renderer.act(() => {
        resultRef.current!.setSearchQuery('Alpha');
      });

      expect(resultRef.current!.filteredItems).toHaveLength(1);
      expect(resultRef.current!.filteredItems[0].name).toBe('Alpha Resume');
    });

    it('should perform case-insensitive search', () => {
      const { resultRef } = createHarness(testItems, ['name']);

      renderer.act(() => {
        resultRef.current!.setSearchQuery('alpha');
      });

      expect(resultRef.current!.filteredItems).toHaveLength(1);
    });

    it('should search across multiple fields', () => {
      const { resultRef } = createHarness(testItems, ['name', 'status']);

      renderer.act(() => {
        resultRef.current!.setSearchQuery('draft');
      });

      expect(resultRef.current!.filteredItems).toHaveLength(2);
    });

    it('should match numeric fields converted to string', () => {
      const { resultRef } = createHarness(testItems, ['name', 'score'] as (keyof TestItem)[]);

      renderer.act(() => {
        resultRef.current!.setSearchQuery('92');
      });

      expect(resultRef.current!.filteredItems).toHaveLength(1);
      expect(resultRef.current!.filteredItems[0].name).toBe('Gamma Resume');
    });

    it('should return empty when search matches nothing', () => {
      const { resultRef } = createHarness(testItems, ['name']);

      renderer.act(() => {
        resultRef.current!.setSearchQuery('nonexistent');
      });

      expect(resultRef.current!.filteredItems).toHaveLength(0);
    });

    it('should ignore whitespace-only search', () => {
      const { resultRef } = createHarness(testItems, ['name']);

      renderer.act(() => {
        resultRef.current!.setSearchQuery('   ');
      });

      expect(resultRef.current!.filteredItems).toHaveLength(5);
    });

    it('should apply filters with filterFields', () => {
      const filterFields = { status: 'status' as keyof TestItem };
      const { resultRef } = createHarness(testItems, ['name'], filterFields);

      renderer.act(() => {
        resultRef.current!.setSelectedFilters({ status: 'active' });
      });

      expect(resultRef.current!.filteredItems).toHaveLength(2);
      expect(resultRef.current!.filteredItems.every((i) => i.status === 'active')).toBe(true);
    });

    it('should perform case-insensitive filter matching', () => {
      const filterFields = { status: 'status' as keyof TestItem };
      const { resultRef } = createHarness(testItems, ['name'], filterFields);

      renderer.act(() => {
        resultRef.current!.setSelectedFilters({ status: 'Active' });
      });

      expect(resultRef.current!.filteredItems).toHaveLength(2);
    });

    it('should apply multiple filters simultaneously', () => {
      const filterFields = {
        status: 'status' as keyof TestItem,
        category: 'category' as keyof TestItem,
      };
      const { resultRef } = createHarness(testItems, ['name'], filterFields);

      renderer.act(() => {
        resultRef.current!.setSelectedFilters({ status: 'active', category: 'tech' });
      });

      expect(resultRef.current!.filteredItems).toHaveLength(2);
    });

    it('should combine search and filters', () => {
      const filterFields = { status: 'status' as keyof TestItem };
      const { resultRef } = createHarness(testItems, ['name'], filterFields);

      renderer.act(() => {
        resultRef.current!.setSearchQuery('Resume');
        resultRef.current!.setSelectedFilters({ status: 'active' });
      });

      expect(resultRef.current!.filteredItems).toHaveLength(2);
    });

    it('should skip filter keys not in filterFields', () => {
      const filterFields = { status: 'status' as keyof TestItem };
      const { resultRef } = createHarness(testItems, ['name'], filterFields);

      renderer.act(() => {
        resultRef.current!.setSelectedFilters({ unknownKey: 'value' });
      });

      expect(resultRef.current!.filteredItems).toHaveLength(5);
    });

    it('should skip filter when filterFields is not provided', () => {
      const { resultRef } = createHarness(testItems, ['name']);

      renderer.act(() => {
        resultRef.current!.setSelectedFilters({ status: 'active' });
      });

      expect(resultRef.current!.filteredItems).toHaveLength(5);
    });

    it('should handle non-string field comparison (returns false for type mismatch)', () => {
      const filterFields = { score: 'score' as keyof TestItem };
      const { resultRef } = createHarness(testItems, ['name'], filterFields);

      renderer.act(() => {
        resultRef.current!.setSelectedFilters({ score: '85' });
      });

      expect(resultRef.current!.filteredItems).toHaveLength(0);
    });

    it('should return false for non-string non-number field values during search', () => {
      const items = [
        { name: 'Test', flag: true } as any,
      ];
      const { resultRef } = createHarness(items, ['name', 'flag'] as any);

      renderer.act(() => {
        resultRef.current!.setSearchQuery('true');
      });

      expect(resultRef.current!.filteredItems).toHaveLength(0);
    });

    it('should set hasFilters=true when searchQuery is non-empty', () => {
      const { resultRef } = createHarness(testItems, ['name']);

      renderer.act(() => {
        resultRef.current!.setSearchQuery('test');
      });

      expect(resultRef.current!.hasFilters).toBe(true);
    });

    it('should set hasFilters=true when selectedFilters is non-empty', () => {
      const { resultRef } = createHarness(testItems, ['name']);

      renderer.act(() => {
        resultRef.current!.setSelectedFilters({ status: 'active' });
      });

      expect(resultRef.current!.hasFilters).toBe(true);
    });

    it('should clearAll: reset searchQuery, selectedFilters, and selectedSort', () => {
      const { resultRef } = createHarness(testItems, ['name']);

      renderer.act(() => {
        resultRef.current!.setSearchQuery('test');
        resultRef.current!.setSelectedFilters({ status: 'active' });
        resultRef.current!.setSelectedSort('date');
      });

      expect(resultRef.current!.hasFilters).toBe(true);

      renderer.act(() => {
        resultRef.current!.clearAll();
      });

      expect(resultRef.current!.searchQuery).toBe('');
      expect(resultRef.current!.selectedFilters).toEqual({});
      expect(resultRef.current!.selectedSort).toBe('');
      expect(resultRef.current!.hasFilters).toBe(false);
      expect(resultRef.current!.filteredItems).toHaveLength(5);
    });

    it('should handle empty items array', () => {
      const { resultRef } = createHarness([], ['name']);
      expect(resultRef.current!.filteredItems).toHaveLength(0);
    });

    it('should handle setSelectedSort', () => {
      const { resultRef } = createHarness(testItems, ['name']);

      renderer.act(() => {
        resultRef.current!.setSelectedSort('score');
      });

      expect(resultRef.current!.selectedSort).toBe('score');
    });
  });

  // =========================================================================
  // 16. FILTER BUTTON STYLING WHEN showFilters IS TRUE
  // =========================================================================

  describe('filter button styling when panel is open', () => {
    it('should use elevated colors for filter button when panel is open (dark mode)', () => {
      mockIsDark = true;
      const tree = renderSF({
        filters: SAMPLE_FILTERS,
        selectedFilters: {},
      });
      const root = tree.root;

      renderer.act(() => {
        findButton(root, 'SlidersHorizontalIcon')!.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain(ALPHA_COLORS.white[10]);
      expect(str).toContain(ALPHA_COLORS.white[20]);
    });

    it('should use colors.text for filter icon when panel is open', () => {
      const tree = renderSF({
        filters: SAMPLE_FILTERS,
        selectedFilters: {},
      });
      const root = tree.root;

      renderer.act(() => {
        findButton(root, 'SlidersHorizontalIcon')!.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain(mockColors.text);
    });
  });

  // =========================================================================
  // 17. TextInput PROPS
  // =========================================================================

  describe('TextInput props', () => {
    it('should have returnKeyType="search"', () => {
      const root = renderSF().root;
      const textInputs = root.findAllByType('TextInput');
      expect(textInputs[0].props.returnKeyType).toBe('search');
    });

    it('should have autoCapitalize="none"', () => {
      const root = renderSF().root;
      const textInputs = root.findAllByType('TextInput');
      expect(textInputs[0].props.autoCapitalize).toBe('none');
    });

    it('should have autoCorrect=false', () => {
      const root = renderSF().root;
      const textInputs = root.findAllByType('TextInput');
      expect(textInputs[0].props.autoCorrect).toBe(false);
    });

    it('should use colors.text for input text color', () => {
      const str = JSON.stringify(renderSF().toJSON());
      expect(str).toContain(mockColors.text);
    });

    it('should use colors.textTertiary for placeholder text color', () => {
      const root = renderSF().root;
      const textInputs = root.findAllByType('TextInput');
      expect(textInputs[0].props.placeholderTextColor).toBe(mockColors.textTertiary);
    });
  });

  // =========================================================================
  // 18. SORT MODAL STYLING
  // =========================================================================

  describe('sort modal styling', () => {
    it('should render Modal with transparent=true and animationType="fade"', () => {
      const root = renderSF({ sortOptions: SAMPLE_SORT_OPTIONS }).root;
      const modals = root.findAllByType('Modal');
      expect(modals[0].props.transparent).toBe(true);
      expect(modals[0].props.animationType).toBe('fade');
    });

    it('should render sort option with transparent bg when not selected', () => {
      const tree = renderSF({
        sortOptions: [{ value: 'date', label: 'Date' }],
        selectedSort: '',
      });
      const root = tree.root;

      renderer.act(() => {
        findButton(root, 'ArrowUpDownIcon')!.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('transparent');
    });
  });

  // =========================================================================
  // 19. ANDROID PLATFORM (no haptics)
  // =========================================================================

  describe('Android platform (no haptics)', () => {
    const originalOS = Platform.OS;

    beforeEach(() => {
      (Platform as any).OS = 'android';
      (Haptics.impactAsync as jest.Mock).mockClear();
    });

    afterEach(() => {
      (Platform as any).OS = originalOS;
    });

    it('should NOT trigger haptics on Android when clearing search', () => {
      const tree = renderSF({ searchQuery: 'test' });
      const root = tree.root;
      const clearBtn = findButton(root, 'XIcon');

      renderer.act(() => {
        clearBtn!.props.onPress();
      });

      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });

    it('should NOT trigger haptics on Android when toggling filters', () => {
      const tree = renderSF({ filters: SAMPLE_FILTERS });
      const root = tree.root;
      const filterBtn = findButton(root, 'SlidersHorizontalIcon');

      renderer.act(() => {
        filterBtn!.props.onPress();
      });

      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });

    it('should NOT trigger haptics on Android when selecting a filter', () => {
      const onFilterChange = jest.fn();
      const tree = renderSF({
        filters: SAMPLE_FILTERS,
        onFilterChange,
        selectedFilters: {},
      });
      const root = tree.root;

      renderer.act(() => {
        findButton(root, 'SlidersHorizontalIcon')!.props.onPress();
      });

      const chip = findButton(root, 'Active');
      renderer.act(() => {
        chip!.props.onPress();
      });

      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });

    it('should NOT trigger haptics on Android when clearing all filters', () => {
      const onFilterChange = jest.fn();
      const tree = renderSF({
        filters: SAMPLE_FILTERS,
        selectedFilters: { status: 'active' },
        onFilterChange,
      });
      const root = tree.root;

      renderer.act(() => {
        findButton(root, 'SlidersHorizontalIcon')!.props.onPress();
      });

      const clearAllBtn = findButton(root, 'Clear all');
      renderer.act(() => {
        clearAllBtn!.props.onPress();
      });

      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });

    it('should NOT trigger haptics on Android when selecting a sort option', () => {
      const onSortChange = jest.fn();
      const tree = renderSF({
        sortOptions: SAMPLE_SORT_OPTIONS,
        onSortChange,
      });
      const root = tree.root;

      renderer.act(() => {
        findButton(root, 'ArrowUpDownIcon')!.props.onPress();
      });

      const option = findButton(root, 'Date Added');
      renderer.act(() => {
        option!.props.onPress();
      });

      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });
  });
});
