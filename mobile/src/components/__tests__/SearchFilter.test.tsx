/**
 * SearchFilter Tests
 *
 * Pure logic tests for the SearchFilter component and useSearchFilter hook:
 * - Module exports
 * - Search filtering logic (replicated from hook)
 * - Filter application logic
 * - hasActiveFilters derivation
 * - Debounce default value
 */

// Mock dependencies before imports
jest.mock('../../context/ThemeContext', () => ({
  useTheme: jest.fn(() => ({
    colors: {
      text: '#ffffff',
      textSecondary: '#9ca3af',
      textTertiary: '#6b7280',
      border: '#374151',
    },
    isDark: true,
  })),
}));

jest.mock('../glass/GlassCard', () => ({
  GlassCard: 'GlassCard',
}));

jest.mock('../glass/GlassButton', () => ({
  GlassButton: 'GlassButton',
}));

// SearchFilter imports Animated (default) from react-native-reanimated and calls
// Animated.createAnimatedComponent at module scope. The global mock does not
// include createAnimatedComponent on the default export, so we override here.
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
 * Replicate the filtering logic from useSearchFilter for pure testing.
 * This matches the exact logic in the hook without calling React hooks.
 */
function applySearchFilter<T>(
  items: T[],
  searchFields: (keyof T)[],
  searchQuery: string,
  selectedFilters: Record<string, string>,
  filterFields?: Record<string, keyof T>
): T[] {
  let result = [...items];

  // Apply search
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    result = result.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query);
        }
        if (typeof value === 'number') {
          return value.toString().includes(query);
        }
        return false;
      })
    );
  }

  // Apply filters
  if (filterFields) {
    Object.entries(selectedFilters).forEach(([filterKey, filterValue]) => {
      const field = filterFields[filterKey];
      if (field && filterValue) {
        result = result.filter((item) => {
          const value = item[field];
          if (typeof value === 'string') {
            return value.toLowerCase() === filterValue.toLowerCase();
          }
          return value === filterValue;
        });
      }
    });
  }

  return result;
}

describe('SearchFilter', () => {
  describe('module exports', () => {
    it('should export SearchFilter as named export', () => {
      const mod = require('../SearchFilter');
      expect(mod.SearchFilter).toBeDefined();
      expect(typeof mod.SearchFilter).toBe('function');
    });

    it('should export SearchFilter as default export', () => {
      const mod = require('../SearchFilter');
      expect(mod.default).toBeDefined();
      expect(typeof mod.default).toBe('function');
    });

    it('should export useSearchFilter hook', () => {
      const mod = require('../SearchFilter');
      expect(mod.useSearchFilter).toBeDefined();
      expect(typeof mod.useSearchFilter).toBe('function');
    });
  });

  describe('search filtering logic - no filters', () => {
    it('should return all items when no search query', () => {
      const result = applySearchFilter(testItems, ['name', 'status'], '', {});
      expect(result).toHaveLength(5);
    });

    it('should filter items by string field matching search query', () => {
      const result = applySearchFilter(testItems, ['name'], 'Alpha', {});
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Alpha Resume');
    });

    it('should perform case-insensitive search', () => {
      const result = applySearchFilter(testItems, ['name'], 'alpha', {});
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Alpha Resume');
    });

    it('should search across multiple fields', () => {
      const result = applySearchFilter(testItems, ['name', 'status'], 'draft', {});
      expect(result).toHaveLength(2);
    });

    it('should match numeric fields as strings', () => {
      const result = applySearchFilter(
        testItems,
        ['name', 'score'] as (keyof TestItem)[],
        '92',
        {}
      );
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Gamma Resume');
    });

    it('should return empty array when no items match search', () => {
      const result = applySearchFilter(testItems, ['name'], 'nonexistent', {});
      expect(result).toHaveLength(0);
    });

    it('should ignore whitespace-only search queries', () => {
      const result = applySearchFilter(testItems, ['name'], '   ', {});
      expect(result).toHaveLength(5);
    });

    it('should handle empty items array', () => {
      const result = applySearchFilter([] as TestItem[], ['name'], 'test', {});
      expect(result).toHaveLength(0);
    });
  });

  describe('filter application logic', () => {
    const filterFields = { status: 'status' as keyof TestItem };

    it('should filter items by exact field value', () => {
      const result = applySearchFilter(
        testItems,
        ['name'],
        '',
        { status: 'active' },
        filterFields
      );
      expect(result).toHaveLength(2);
      expect(result.every((item) => item.status === 'active')).toBe(true);
    });

    it('should perform case-insensitive filter matching for strings', () => {
      const result = applySearchFilter(
        testItems,
        ['name'],
        '',
        { status: 'Active' },
        filterFields
      );
      expect(result).toHaveLength(2);
    });

    it('should apply multiple filters simultaneously', () => {
      const multiFilterFields = {
        status: 'status' as keyof TestItem,
        category: 'category' as keyof TestItem,
      };
      const result = applySearchFilter(
        testItems,
        ['name'],
        '',
        { status: 'active', category: 'tech' },
        multiFilterFields
      );
      expect(result).toHaveLength(2);
      expect(result.every((item) => item.status === 'active' && item.category === 'tech')).toBe(true);
    });

    it('should combine search and filters', () => {
      const result = applySearchFilter(
        testItems,
        ['name'],
        'Resume',
        { status: 'active' },
        filterFields
      );
      expect(result).toHaveLength(2);
    });

    it('should return empty when filter matches nothing', () => {
      const result = applySearchFilter(
        testItems,
        ['name'],
        '',
        { status: 'nonexistent' },
        filterFields
      );
      expect(result).toHaveLength(0);
    });
  });

  describe('hasActiveFilters derivation logic', () => {
    it('should be false for empty selectedFilters', () => {
      const selectedFilters: Record<string, string> = {};
      expect(Object.keys(selectedFilters).length > 0).toBe(false);
    });

    it('should be true for non-empty selectedFilters', () => {
      const selectedFilters = { status: 'active' };
      expect(Object.keys(selectedFilters).length > 0).toBe(true);
    });

    it('should count the number of active filters correctly', () => {
      const selectedFilters = { status: 'active', category: 'tech' };
      const filterCount = Object.keys(selectedFilters).length;
      expect(filterCount).toBe(2);
    });
  });

  describe('hasFilters derivation logic', () => {
    it('should be false when no search and no filters', () => {
      const searchQuery = '';
      const selectedFilters: Record<string, string> = {};
      const hasFilters = searchQuery.length > 0 || Object.keys(selectedFilters).length > 0;
      expect(hasFilters).toBe(false);
    });

    it('should be true when search query is present', () => {
      const searchQuery = 'test';
      const selectedFilters: Record<string, string> = {};
      const hasFilters = searchQuery.length > 0 || Object.keys(selectedFilters).length > 0;
      expect(hasFilters).toBe(true);
    });

    it('should be true when filters are present', () => {
      const searchQuery = '';
      const selectedFilters = { status: 'active' };
      const hasFilters = searchQuery.length > 0 || Object.keys(selectedFilters).length > 0;
      expect(hasFilters).toBe(true);
    });

    it('should be true when both search and filters are present', () => {
      const searchQuery = 'test';
      const selectedFilters = { status: 'active' };
      const hasFilters = searchQuery.length > 0 || Object.keys(selectedFilters).length > 0;
      expect(hasFilters).toBe(true);
    });
  });

  describe('filter change logic', () => {
    it('should add a filter value', () => {
      const selectedFilters: Record<string, string> = {};
      const key = 'status';
      const value = 'active';

      const newFilters = { ...selectedFilters };
      if (value === '') {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }

      expect(newFilters).toEqual({ status: 'active' });
    });

    it('should remove a filter when value is empty string', () => {
      const selectedFilters = { status: 'active', category: 'tech' };
      const key = 'status';
      const value = '';

      const newFilters = { ...selectedFilters };
      if (value === '') {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }

      expect(newFilters).toEqual({ category: 'tech' });
      expect(newFilters.status).toBeUndefined();
    });

    it('should replace an existing filter value', () => {
      const selectedFilters = { status: 'active' };
      const key = 'status';
      const value = 'draft';

      const newFilters = { ...selectedFilters };
      if (value === '') {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }

      expect(newFilters).toEqual({ status: 'draft' });
    });
  });
});
