import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react'
import SearchFilter, { useSearchFilter } from './SearchFilter'

const mockFilters = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
  {
    key: 'type',
    label: 'Type',
    options: [
      { value: 'resume', label: 'Resume' },
      { value: 'cover-letter', label: 'Cover Letter' },
    ],
  },
]

const mockSortOptions = [
  { value: 'date-desc', label: 'Date (Newest First)' },
  { value: 'date-asc', label: 'Date (Oldest First)' },
  { value: 'name-asc', label: 'Name (A-Z)' },
]

describe('SearchFilter Component', () => {
  const mockOnSearchChange = vi.fn()
  const mockOnFilterChange = vi.fn()
  const mockOnSortChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Search Input', () => {
    it('should render search input with default placeholder', () => {
      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
        />
      )

      const searchInput = screen.getByLabelText('Search')
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveAttribute('placeholder', 'Search...')
    })

    it('should render search input with custom placeholder', () => {
      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          placeholder="Search documents..."
        />
      )

      const searchInput = screen.getByLabelText('Search')
      expect(searchInput).toHaveAttribute('placeholder', 'Search documents...')
    })

    it('should display current search query', () => {
      render(
        <SearchFilter
          searchQuery="test query"
          onSearchChange={mockOnSearchChange}
        />
      )

      const searchInput = screen.getByLabelText('Search') as HTMLInputElement
      expect(searchInput.value).toBe('test query')
    })

    it('should call onSearchChange when typing', () => {
      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
        />
      )

      const searchInput = screen.getByLabelText('Search')
      fireEvent.change(searchInput, { target: { value: 'new search' } })

      expect(mockOnSearchChange).toHaveBeenCalledWith('new search')
    })

    it('should show clear button when search query exists', () => {
      render(
        <SearchFilter
          searchQuery="test"
          onSearchChange={mockOnSearchChange}
        />
      )

      const clearButton = screen.getByLabelText('Clear search')
      expect(clearButton).toBeInTheDocument()
    })

    it('should not show clear button when search query is empty', () => {
      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
        />
      )

      const clearButton = screen.queryByLabelText('Clear search')
      expect(clearButton).not.toBeInTheDocument()
    })

    it('should clear search when clear button is clicked', () => {
      render(
        <SearchFilter
          searchQuery="test"
          onSearchChange={mockOnSearchChange}
        />
      )

      const clearButton = screen.getByLabelText('Clear search')
      fireEvent.click(clearButton)

      expect(mockOnSearchChange).toHaveBeenCalledWith('')
    })
  })

  describe('Filter Button', () => {
    it('should not render filter button when no filters provided', () => {
      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
        />
      )

      const filterButton = screen.queryByLabelText(/filters/i)
      expect(filterButton).not.toBeInTheDocument()
    })

    it('should render filter button when filters provided', () => {
      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          filters={mockFilters}
        />
      )

      const filterButton = screen.getByLabelText('Show filters')
      expect(filterButton).toBeInTheDocument()
    })

    it('should toggle filters panel when filter button clicked', () => {
      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          filters={mockFilters}
          onFilterChange={mockOnFilterChange}
        />
      )

      const filterButton = screen.getByLabelText('Show filters')

      // Initially collapsed - check for filter dropdowns
      expect(screen.queryByLabelText('Status')).not.toBeInTheDocument()

      // Click to expand
      fireEvent.click(filterButton)
      expect(screen.getByLabelText('Status')).toBeInTheDocument()
      expect(screen.getByLabelText('Type')).toBeInTheDocument()

      // Click again to collapse
      fireEvent.click(screen.getByLabelText('Hide filters'))
      expect(screen.queryByLabelText('Status')).not.toBeInTheDocument()
    })

    it('should show active filter count badge', () => {
      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          filters={mockFilters}
          selectedFilters={{ status: 'active', type: 'resume' }}
          onFilterChange={mockOnFilterChange}
        />
      )

      const badge = screen.getByText('2')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('bg-blue-500')
    })

    it('should highlight filter button when filters are active', () => {
      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          filters={mockFilters}
          selectedFilters={{ status: 'active' }}
          onFilterChange={mockOnFilterChange}
        />
      )

      const filterButton = screen.getByLabelText('Show filters')
      expect(filterButton).toHaveClass('bg-theme-glass-10')
    })
  })

  describe('Filter Panel', () => {
    it('should render all filter dropdowns when panel is expanded', () => {
      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          filters={mockFilters}
          onFilterChange={mockOnFilterChange}
        />
      )

      const filterButton = screen.getByLabelText('Show filters')
      fireEvent.click(filterButton)

      expect(screen.getByLabelText('Status')).toBeInTheDocument()
      expect(screen.getByLabelText('Type')).toBeInTheDocument()
    })

    it('should display all filter options', () => {
      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          filters={mockFilters}
          onFilterChange={mockOnFilterChange}
        />
      )

      const filterButton = screen.getByLabelText('Show filters')
      fireEvent.click(filterButton)

      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText('Inactive')).toBeInTheDocument()
      expect(screen.getByText('Resume')).toBeInTheDocument()
      expect(screen.getByText('Cover Letter')).toBeInTheDocument()
    })

    it('should call onFilterChange when filter option selected', () => {
      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          filters={mockFilters}
          selectedFilters={{}}
          onFilterChange={mockOnFilterChange}
        />
      )

      const filterButton = screen.getByLabelText('Show filters')
      fireEvent.click(filterButton)

      const statusSelect = screen.getByLabelText('Status')
      fireEvent.change(statusSelect, { target: { value: 'active' } })

      expect(mockOnFilterChange).toHaveBeenCalledWith({ status: 'active' })
    })

    it('should remove filter when "All" option selected', () => {
      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          filters={mockFilters}
          selectedFilters={{ status: 'active' }}
          onFilterChange={mockOnFilterChange}
        />
      )

      const filterButton = screen.getByLabelText('Show filters')
      fireEvent.click(filterButton)

      const statusSelect = screen.getByLabelText('Status')
      fireEvent.change(statusSelect, { target: { value: '' } })

      expect(mockOnFilterChange).toHaveBeenCalledWith({})
    })

    it('should show clear all button when filters are active', () => {
      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          filters={mockFilters}
          selectedFilters={{ status: 'active' }}
          onFilterChange={mockOnFilterChange}
        />
      )

      const filterButton = screen.getByLabelText('Show filters')
      fireEvent.click(filterButton)

      expect(screen.getByText('Clear all')).toBeInTheDocument()
    })

    it('should clear all filters when clear all clicked', () => {
      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          filters={mockFilters}
          selectedFilters={{ status: 'active', type: 'resume' }}
          onFilterChange={mockOnFilterChange}
        />
      )

      const filterButton = screen.getByLabelText('Show filters')
      fireEvent.click(filterButton)

      const clearAllButton = screen.getByText('Clear all')
      fireEvent.click(clearAllButton)

      expect(mockOnFilterChange).toHaveBeenCalledWith({})
    })
  })

  describe('Sort Dropdown', () => {
    it('should not render sort dropdown when no sort options provided', () => {
      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
        />
      )

      const sortSelect = screen.queryByLabelText('Sort options')
      expect(sortSelect).not.toBeInTheDocument()
    })

    it('should render sort dropdown when sort options provided', () => {
      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          sortOptions={mockSortOptions}
          onSortChange={mockOnSortChange}
        />
      )

      const sortSelect = screen.getByLabelText('Sort options')
      expect(sortSelect).toBeInTheDocument()
    })

    it('should display all sort options', () => {
      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          sortOptions={mockSortOptions}
          onSortChange={mockOnSortChange}
        />
      )

      expect(screen.getByText('Date (Newest First)')).toBeInTheDocument()
      expect(screen.getByText('Date (Oldest First)')).toBeInTheDocument()
      expect(screen.getByText('Name (A-Z)')).toBeInTheDocument()
    })

    it('should call onSortChange when sort option selected', () => {
      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          sortOptions={mockSortOptions}
          onSortChange={mockOnSortChange}
        />
      )

      const sortSelect = screen.getByLabelText('Sort options')
      fireEvent.change(sortSelect, { target: { value: 'date-desc' } })

      expect(mockOnSortChange).toHaveBeenCalledWith('date-desc')
    })

    it('should display current sort selection', () => {
      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          sortOptions={mockSortOptions}
          selectedSort="name-asc"
          onSortChange={mockOnSortChange}
        />
      )

      const sortSelect = screen.getByLabelText('Sort options') as HTMLSelectElement
      expect(sortSelect.value).toBe('name-asc')
    })
  })

  describe('Active Filter Tags', () => {
    it('should not show filter tags when panel is expanded', () => {
      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          filters={mockFilters}
          selectedFilters={{ status: 'active' }}
          onFilterChange={mockOnFilterChange}
        />
      )

      // Expand panel
      const filterButton = screen.getByLabelText('Show filters')
      fireEvent.click(filterButton)

      // Tags should not be visible
      expect(screen.queryByText('Status: Active')).not.toBeInTheDocument()
    })

    it('should show filter tags when panel is collapsed and filters are active', () => {
      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          filters={mockFilters}
          selectedFilters={{ status: 'active', type: 'resume' }}
          onFilterChange={mockOnFilterChange}
        />
      )

      expect(screen.getByText('Status: Active')).toBeInTheDocument()
      expect(screen.getByText('Type: Resume')).toBeInTheDocument()
    })

    it('should remove individual filter when tag remove button clicked', () => {
      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          filters={mockFilters}
          selectedFilters={{ status: 'active', type: 'resume' }}
          onFilterChange={mockOnFilterChange}
        />
      )

      const removeButtons = screen.getAllByRole('button', { name: /remove .* filter/i })
      fireEvent.click(removeButtons[0])

      // Should remove just the status filter, keeping type
      expect(mockOnFilterChange).toHaveBeenCalledWith({ type: 'resume' })
    })
  })

  describe('Custom Class Name', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          className="custom-class"
        />
      )

      const wrapper = container.firstChild
      expect(wrapper).toHaveClass('custom-class')
    })
  })
})

describe('useSearchFilter Hook', () => {
  const mockItems = [
    { id: 1, name: 'Item One', status: 'active', category: 'A' },
    { id: 2, name: 'Item Two', status: 'inactive', category: 'B' },
    { id: 3, name: 'Another Item', status: 'active', category: 'A' },
    { id: 4, name: 'Test Item', status: 'active', category: 'C' },
  ]

  describe('Search Functionality', () => {
    it('should filter items by search query', () => {
      const { result } = renderHook(() =>
        useSearchFilter(mockItems, ['name'])
      )

      act(() => {
        result.current.setSearchQuery('Another')
      })

      expect(result.current.filteredItems).toHaveLength(1)
      expect(result.current.filteredItems[0].name).toBe('Another Item')
    })

    it('should search across multiple fields', () => {
      const { result } = renderHook(() =>
        useSearchFilter(mockItems, ['name', 'category'])
      )

      act(() => {
        result.current.setSearchQuery('B')
      })

      // Should find "Item Two" (has category B) and "Another Item" (name contains "Another")
      expect(result.current.filteredItems.length).toBeGreaterThanOrEqual(1)
    })

    it('should be case insensitive', () => {
      const { result } = renderHook(() =>
        useSearchFilter(mockItems, ['name'])
      )

      act(() => {
        result.current.setSearchQuery('ITEM')
      })

      expect(result.current.filteredItems).toHaveLength(4) // All items contain "item"
    })

    it('should return all items when search query is empty', () => {
      const { result } = renderHook(() =>
        useSearchFilter(mockItems, ['name'])
      )

      expect(result.current.filteredItems).toHaveLength(4)
    })
  })

  describe('Filter Functionality', () => {
    it('should filter items by single filter', () => {
      const { result } = renderHook(() =>
        useSearchFilter(mockItems, ['name'], { status: 'status' })
      )

      act(() => {
        result.current.setSelectedFilters({ status: 'active' })
      })

      expect(result.current.filteredItems).toHaveLength(3)
      expect(result.current.filteredItems.every(item => item.status === 'active')).toBe(true)
    })

    it('should filter items by multiple filters', () => {
      const { result } = renderHook(() =>
        useSearchFilter(mockItems, ['name'], { status: 'status', category: 'category' })
      )

      act(() => {
        result.current.setSelectedFilters({ status: 'active', category: 'A' })
      })

      expect(result.current.filteredItems).toHaveLength(2)
      expect(result.current.filteredItems.every(item =>
        item.status === 'active' && item.category === 'A'
      )).toBe(true)
    })

    it('should be case insensitive for string filters', () => {
      const { result } = renderHook(() =>
        useSearchFilter(mockItems, ['name'], { status: 'status' })
      )

      act(() => {
        result.current.setSelectedFilters({ status: 'ACTIVE' })
      })

      expect(result.current.filteredItems).toHaveLength(3)
    })
  })

  describe('Combined Search and Filter', () => {
    it('should apply both search and filters together', () => {
      const { result } = renderHook(() =>
        useSearchFilter(mockItems, ['name'], { status: 'status' })
      )

      act(() => {
        result.current.setSearchQuery('Item')
        result.current.setSelectedFilters({ status: 'active' })
      })

      // Should find items with "Item" in name AND active status
      expect(result.current.filteredItems).toHaveLength(3)
      expect(result.current.filteredItems.every(item =>
        item.status === 'active' && item.name.toLowerCase().includes('item')
      )).toBe(true)
    })
  })

  describe('Sort State', () => {
    it('should manage sort state', () => {
      const { result } = renderHook(() =>
        useSearchFilter(mockItems, ['name'])
      )

      act(() => {
        result.current.setSelectedSort('name-asc')
      })

      expect(result.current.selectedSort).toBe('name-asc')
    })
  })

  describe('State Persistence', () => {
    it('should preserve original items array', () => {
      const { result } = renderHook(() =>
        useSearchFilter(mockItems, ['name'])
      )

      act(() => {
        result.current.setSearchQuery('Test')
      })

      // Filtered items should be different length
      expect(result.current.filteredItems).toHaveLength(1)

      // But clearing search should restore all items
      act(() => {
        result.current.setSearchQuery('')
      })

      expect(result.current.filteredItems).toHaveLength(4)
    })
  })
})
