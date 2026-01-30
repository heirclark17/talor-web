import React, { useState, useMemo, useCallback } from 'react'
import { Search, X, SlidersHorizontal, ChevronDown, ArrowUpDown } from 'lucide-react'

interface FilterOption {
  value: string
  label: string
}

interface SortOption {
  value: string
  label: string
  direction?: 'asc' | 'desc'
}

interface SearchFilterProps {
  /** Placeholder text for search input */
  placeholder?: string
  /** Current search query */
  searchQuery: string
  /** Callback when search query changes */
  onSearchChange: (query: string) => void
  /** Filter options configuration */
  filters?: {
    key: string
    label: string
    options: FilterOption[]
  }[]
  /** Currently selected filters */
  selectedFilters?: Record<string, string>
  /** Callback when filters change */
  onFilterChange?: (filters: Record<string, string>) => void
  /** Sort options */
  sortOptions?: SortOption[]
  /** Currently selected sort */
  selectedSort?: string
  /** Callback when sort changes */
  onSortChange?: (sort: string) => void
  /** Additional class names */
  className?: string
}

/**
 * Reusable search and filter component for list pages
 */
export default function SearchFilter({
  placeholder = 'Search...',
  searchQuery,
  onSearchChange,
  filters,
  selectedFilters = {},
  onFilterChange,
  sortOptions,
  selectedSort,
  onSortChange,
  className = '',
}: SearchFilterProps) {
  const [showFilters, setShowFilters] = useState(false)

  const handleClearSearch = useCallback(() => {
    onSearchChange('')
  }, [onSearchChange])

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      if (onFilterChange) {
        const newFilters = { ...selectedFilters }
        if (value === '') {
          delete newFilters[key]
        } else {
          newFilters[key] = value
        }
        onFilterChange(newFilters)
      }
    },
    [onFilterChange, selectedFilters]
  )

  const handleClearFilters = useCallback(() => {
    if (onFilterChange) {
      onFilterChange({})
    }
  }, [onFilterChange])

  const hasActiveFilters = useMemo(
    () => Object.keys(selectedFilters).length > 0,
    [selectedFilters]
  )

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search bar row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-12 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors text-[16px]"
            aria-label="Search"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 min-w-[32px] min-h-[32px] p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Filter and Sort buttons */}
        <div className="flex gap-2">
          {filters && filters.length > 0 && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors min-h-[44px] ${
                showFilters || hasActiveFilters
                  ? 'bg-white/10 border-white/30 text-white'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
              }`}
              aria-label={showFilters ? 'Hide filters' : 'Show filters'}
              aria-expanded={showFilters}
            >
              <SlidersHorizontal className="w-5 h-5" aria-hidden="true" />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <span className="bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {Object.keys(selectedFilters).length}
                </span>
              )}
            </button>
          )}

          {sortOptions && sortOptions.length > 0 && (
            <div className="relative">
              <select
                value={selectedSort || ''}
                onChange={(e) => onSortChange?.(e.target.value)}
                className="appearance-none flex items-center gap-2 px-4 py-3 pr-10 rounded-xl border bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors min-h-[44px] cursor-pointer"
                aria-label="Sort options"
              >
                <option value="" className="bg-gray-900">
                  Sort by...
                </option>
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-gray-900">
                    {option.label}
                  </option>
                ))}
              </select>
              <ArrowUpDown
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                aria-hidden="true"
              />
            </div>
          )}
        </div>
      </div>

      {/* Filter dropdowns */}
      {showFilters && filters && filters.length > 0 && (
        <div className="glass rounded-xl p-4 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-400">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filters.map((filter) => (
              <div key={filter.key} className="space-y-2">
                <label
                  htmlFor={`filter-${filter.key}`}
                  className="block text-sm text-gray-400"
                >
                  {filter.label}
                </label>
                <div className="relative">
                  <select
                    id={`filter-${filter.key}`}
                    value={selectedFilters[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 pr-10 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30 transition-colors cursor-pointer"
                  >
                    <option value="" className="bg-gray-900">
                      All
                    </option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value} className="bg-gray-900">
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                    aria-hidden="true"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active filter tags */}
      {hasActiveFilters && !showFilters && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(selectedFilters).map(([key, value]) => {
            const filter = filters?.find((f) => f.key === key)
            const option = filter?.options.find((o) => o.value === value)
            return (
              <span
                key={key}
                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
              >
                <span>
                  {filter?.label}: {option?.label || value}
                </span>
                <button
                  onClick={() => handleFilterChange(key, '')}
                  className="hover:text-white transition-colors"
                  aria-label={`Remove ${filter?.label} filter`}
                >
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}

/**
 * Hook for managing search and filter state
 */
export function useSearchFilter<T>(
  items: T[],
  searchFields: (keyof T)[],
  filterFields?: Record<string, keyof T>
) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({})
  const [selectedSort, setSelectedSort] = useState('')

  const filteredItems = useMemo(() => {
    let result = [...items]

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter((item) =>
        searchFields.some((field) => {
          const value = item[field]
          if (typeof value === 'string') {
            return value.toLowerCase().includes(query)
          }
          return false
        })
      )
    }

    // Apply filters
    if (filterFields) {
      Object.entries(selectedFilters).forEach(([filterKey, filterValue]) => {
        const field = filterFields[filterKey]
        if (field && filterValue) {
          result = result.filter((item) => {
            const value = item[field]
            if (typeof value === 'string') {
              return value.toLowerCase() === filterValue.toLowerCase()
            }
            return value === filterValue
          })
        }
      })
    }

    return result
  }, [items, searchQuery, selectedFilters, searchFields, filterFields])

  return {
    searchQuery,
    setSearchQuery,
    selectedFilters,
    setSelectedFilters,
    selectedSort,
    setSelectedSort,
    filteredItems,
  }
}
