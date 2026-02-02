import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Keyboard,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import {
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  Check,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { GlassCard } from './glass/GlassCard';
import { GlassButton } from './glass/GlassButton';
import { useTheme } from '../context/ThemeContext';
import { COLORS, SPACING, RADIUS, FONTS, ANIMATION, ALPHA_COLORS } from '../utils/constants';

interface FilterOption {
  value: string;
  label: string;
}

interface SortOption {
  value: string;
  label: string;
  direction?: 'asc' | 'desc';
}

interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
}

interface SearchFilterProps {
  /** Placeholder text for search input */
  placeholder?: string;
  /** Current search query */
  searchQuery: string;
  /** Callback when search query changes */
  onSearchChange: (query: string) => void;
  /** Filter options configuration */
  filters?: FilterConfig[];
  /** Currently selected filters */
  selectedFilters?: Record<string, string>;
  /** Callback when filters change */
  onFilterChange?: (filters: Record<string, string>) => void;
  /** Sort options */
  sortOptions?: SortOption[];
  /** Currently selected sort */
  selectedSort?: string;
  /** Callback when sort changes */
  onSortChange?: (sort: string) => void;
  /** Debounce delay in ms */
  debounceMs?: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * Reusable search and filter component for list screens
 */
export function SearchFilter({
  placeholder = 'Search...',
  searchQuery,
  onSearchChange,
  filters,
  selectedFilters = {},
  onFilterChange,
  sortOptions,
  selectedSort,
  onSortChange,
  debounceMs = 300,
}: SearchFilterProps) {
  const { colors, isDark } = useTheme();
  const [showFilters, setShowFilters] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const inputRef = useRef<TextInput>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const filterIconScale = useSharedValue(1);
  const inputFocused = useSharedValue(0);

  // Sync local search with prop
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Debounced search
  const handleSearchInput = useCallback(
    (text: string) => {
      setLocalSearch(text);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        onSearchChange(text);
      }, debounceMs);
    },
    [onSearchChange, debounceMs]
  );

  const handleClearSearch = useCallback(() => {
    setLocalSearch('');
    onSearchChange('');
    inputRef.current?.focus();
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [onSearchChange]);

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      if (onFilterChange) {
        const newFilters = { ...selectedFilters };
        if (value === '') {
          delete newFilters[key];
        } else {
          newFilters[key] = value;
        }
        onFilterChange(newFilters);
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    },
    [onFilterChange, selectedFilters]
  );

  const handleClearFilters = useCallback(() => {
    if (onFilterChange) {
      onFilterChange({});
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  }, [onFilterChange]);

  const handleSortSelect = useCallback(
    (value: string) => {
      onSortChange?.(value);
      setShowSortModal(false);
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [onSortChange]
  );

  const toggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
    filterIconScale.value = withSpring(0.9, {
      damping: ANIMATION.spring.damping,
      stiffness: ANIMATION.spring.stiffness,
    });
    filterIconScale.value = withSpring(1, {
      damping: ANIMATION.spring.damping,
      stiffness: ANIMATION.spring.stiffness,
    });
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [filterIconScale]);

  const hasActiveFilters = useMemo(
    () => Object.keys(selectedFilters).length > 0,
    [selectedFilters]
  );

  const filterCount = Object.keys(selectedFilters).length;

  const filterIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: filterIconScale.value }],
  }));

  // Note: The input container style is handled inline, not with animated style
  // since we don't need smooth border color animation

  const handleFocus = () => {
    inputFocused.value = withTiming(1, { duration: ANIMATION.fast });
  };

  const handleBlur = () => {
    inputFocused.value = withTiming(0, { duration: ANIMATION.fast });
  };

  return (
    <View style={styles.container}>
      {/* Search bar row */}
      <View style={styles.searchRow}>
        {/* Search input */}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: isDark ? ALPHA_COLORS.white[5] : ALPHA_COLORS.black[3],
              borderColor: isDark ? ALPHA_COLORS.white[10] : ALPHA_COLORS.black[10],
            },
          ]}
        >
          <Search color={colors.textTertiary} size={20} style={styles.searchIcon} />
          <TextInput
            ref={inputRef}
            value={localSearch}
            onChangeText={handleSearchInput}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            placeholderTextColor={colors.textTertiary}
            style={[styles.input, { color: colors.text }]}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {localSearch.length > 0 && (
            <TouchableOpacity
              onPress={handleClearSearch}
              style={styles.clearButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X color={colors.textTertiary} size={18} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter button */}
        {filters && filters.length > 0 && (
          <AnimatedTouchable
            onPress={toggleFilters}
            style={[
              styles.iconButton,
              filterIconStyle,
              {
                backgroundColor:
                  showFilters || hasActiveFilters
                    ? isDark
                      ? ALPHA_COLORS.white[10]
                      : ALPHA_COLORS.black[10]
                    : isDark
                    ? ALPHA_COLORS.white[5]
                    : ALPHA_COLORS.black[3],
                borderColor:
                  showFilters || hasActiveFilters
                    ? isDark
                      ? ALPHA_COLORS.white[20]
                      : ALPHA_COLORS.black[15]
                    : isDark
                    ? ALPHA_COLORS.white[10]
                    : ALPHA_COLORS.black[10],
              },
            ]}
          >
            <SlidersHorizontal
              color={showFilters || hasActiveFilters ? colors.text : colors.textTertiary}
              size={20}
            />
            {hasActiveFilters && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{filterCount}</Text>
              </View>
            )}
          </AnimatedTouchable>
        )}

        {/* Sort button */}
        {sortOptions && sortOptions.length > 0 && (
          <TouchableOpacity
            onPress={() => setShowSortModal(true)}
            style={[
              styles.iconButton,
              {
                backgroundColor: selectedSort
                  ? isDark
                    ? ALPHA_COLORS.white[10]
                    : ALPHA_COLORS.black[10]
                  : isDark
                  ? ALPHA_COLORS.white[5]
                  : ALPHA_COLORS.black[3],
                borderColor: selectedSort
                  ? isDark
                    ? ALPHA_COLORS.white[20]
                    : ALPHA_COLORS.black[15]
                  : isDark
                  ? ALPHA_COLORS.white[10]
                  : ALPHA_COLORS.black[10],
              },
            ]}
          >
            <ArrowUpDown
              color={selectedSort ? colors.text : colors.textTertiary}
              size={20}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter panel */}
      {showFilters && filters && filters.length > 0 && (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
          <GlassCard style={styles.filterPanel} material="thin">
            <View style={styles.filterHeader}>
              <Text style={[styles.filterTitle, { color: colors.textSecondary }]}>Filters</Text>
              {hasActiveFilters && (
                <TouchableOpacity onPress={handleClearFilters}>
                  <Text style={[styles.clearAllText, { color: COLORS.primary }]}>Clear all</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.filterGrid}>
              {filters.map((filter) => (
                <View key={filter.key} style={styles.filterItem}>
                  <Text style={[styles.filterLabel, { color: colors.textTertiary }]}>
                    {filter.label}
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.filterOptions}>
                      <TouchableOpacity
                        onPress={() => handleFilterChange(filter.key, '')}
                        style={[
                          styles.filterChip,
                          {
                            backgroundColor: !selectedFilters[filter.key]
                              ? ALPHA_COLORS.primary.bg
                              : isDark
                              ? ALPHA_COLORS.white[5]
                              : ALPHA_COLORS.black[3],
                            borderColor: !selectedFilters[filter.key]
                              ? ALPHA_COLORS.primary.border
                              : isDark
                              ? ALPHA_COLORS.white[10]
                              : ALPHA_COLORS.black[10],
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            {
                              color: !selectedFilters[filter.key]
                                ? COLORS.primary
                                : colors.textSecondary,
                            },
                          ]}
                        >
                          All
                        </Text>
                      </TouchableOpacity>

                      {filter.options.map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          onPress={() => handleFilterChange(filter.key, option.value)}
                          style={[
                            styles.filterChip,
                            {
                              backgroundColor:
                                selectedFilters[filter.key] === option.value
                                  ? ALPHA_COLORS.primary.bg
                                  : isDark
                                  ? ALPHA_COLORS.white[5]
                                  : ALPHA_COLORS.black[3],
                              borderColor:
                                selectedFilters[filter.key] === option.value
                                  ? ALPHA_COLORS.primary.border
                                  : isDark
                                  ? ALPHA_COLORS.white[10]
                                  : ALPHA_COLORS.black[10],
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.filterChipText,
                              {
                                color:
                                  selectedFilters[filter.key] === option.value
                                    ? COLORS.primary
                                    : colors.textSecondary,
                              },
                            ]}
                          >
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              ))}
            </View>
          </GlassCard>
        </Animated.View>
      )}

      {/* Active filter tags */}
      {hasActiveFilters && !showFilters && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.activeFiltersRow}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Object.entries(selectedFilters).map(([key, value]) => {
              const filter = filters?.find((f) => f.key === key);
              const option = filter?.options.find((o) => o.value === value);
              return (
                <View
                  key={key}
                  style={[styles.activeFilterTag, { backgroundColor: ALPHA_COLORS.primary.bg }]}
                >
                  <Text style={[styles.activeFilterText, { color: COLORS.primary }]}>
                    {filter?.label}: {option?.label || value}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleFilterChange(key, '')}
                    hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                  >
                    <X color={COLORS.primary} size={14} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </Animated.View>
      )}

      {/* Sort modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <Animated.View
            entering={SlideInDown.springify().damping(15)}
            exiting={SlideOutDown}
          >
            <GlassCard style={styles.sortModal} material="thick" shadow="floating">
              <Text style={[styles.sortModalTitle, { color: colors.text }]}>Sort by</Text>
              {sortOptions?.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => handleSortSelect(option.value)}
                  style={[
                    styles.sortOption,
                    {
                      backgroundColor:
                        selectedSort === option.value
                          ? ALPHA_COLORS.primary.bg
                          : 'transparent',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.sortOptionText,
                      {
                        color:
                          selectedSort === option.value ? COLORS.primary : colors.text,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {selectedSort === option.value && (
                    <Check color={COLORS.primary} size={20} />
                  )}
                </TouchableOpacity>
              ))}
            </GlassCard>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

/**
 * Hook for managing search and filter state
 */
export function useSearchFilter<T>(
  items: T[],
  searchFields: (keyof T)[],
  filterFields?: Record<string, keyof T>
) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [selectedSort, setSelectedSort] = useState('');

  const filteredItems = useMemo(() => {
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
  }, [items, searchQuery, selectedFilters, searchFields, filterFields]);

  const clearAll = useCallback(() => {
    setSearchQuery('');
    setSelectedFilters({});
    setSelectedSort('');
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    selectedFilters,
    setSelectedFilters,
    selectedSort,
    setSelectedSort,
    filteredItems,
    clearAll,
    hasFilters: searchQuery.length > 0 || Object.keys(selectedFilters).length > 0,
  };
}

export default SearchFilter;

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  searchRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.regular,
    height: '100%',
  },
  clearButton: {
    padding: SPACING.xs,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: '#ffffff',
  },
  filterPanel: {
    marginTop: SPACING.md,
    padding: SPACING.md,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  filterTitle: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  clearAllText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  filterGrid: {
    gap: SPACING.md,
  },
  filterItem: {
    gap: SPACING.xs,
  },
  filterLabel: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  activeFiltersRow: {
    marginTop: SPACING.md,
  },
  activeFilterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    marginRight: SPACING.xs,
  },
  activeFilterText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: ALPHA_COLORS.overlay.light,
    justifyContent: 'flex-end',
  },
  sortModal: {
    margin: SPACING.lg,
    marginBottom: SPACING.xxl,
    padding: SPACING.lg,
  },
  sortModalTitle: {
    fontSize: 18,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.md,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs,
  },
  sortOptionText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
});
