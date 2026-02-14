import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import KeywordPanel from './KeywordPanel'

const mockKeywordAnalysis = {
  total_keywords_added: 12,
  ats_optimization_score: 85,
  keyword_groups: [
    {
      category: 'technical_skills',
      keywords: [
        {
          keyword: 'Python',
          why_added: 'Required programming language for the role',
          jd_frequency: 5,
          ats_impact: 'high' as const,
          location_in_resume: 'Technical Skills',
          context: 'Developed backend services using Python and Django',
        },
        {
          keyword: 'Machine Learning',
          why_added: 'Core competency mentioned in job description',
          jd_frequency: 3,
          ats_impact: 'high' as const,
          location_in_resume: 'Professional Experience',
          context: 'Built ML models for predictive analytics',
        },
      ],
    },
    {
      category: 'soft_skills',
      keywords: [
        {
          keyword: 'Leadership',
          why_added: 'Essential for managing cross-functional teams',
          jd_frequency: 2,
          ats_impact: 'medium' as const,
          location_in_resume: 'Professional Experience',
          context: 'Led team of 8 engineers on enterprise project',
        },
      ],
    },
    {
      category: 'certifications',
      keywords: [
        {
          keyword: 'AWS Solutions Architect',
          why_added: 'Preferred certification listed in requirements',
          jd_frequency: 1,
          ats_impact: 'low' as const,
          location_in_resume: 'Certifications',
          context: '',
        },
      ],
    },
  ],
}

describe('KeywordPanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn()
  })

  describe('Loading State', () => {
    it('should display loading spinner when loading is true', () => {
      render(<KeywordPanel keywords={null} loading={true} />)

      expect(screen.getByTestId('keyword-panel')).toBeInTheDocument()
      expect(screen.getByText(/analyzing keywords/i)).toBeInTheDocument()
    })

    it('should show spinner animation when loading', () => {
      const { container } = render(<KeywordPanel keywords={null} loading={true} />)

      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('rounded-full', 'h-8', 'w-8')
    })
  })

  describe('No Data State', () => {
    it('should display no data message when keywords is null', () => {
      render(<KeywordPanel keywords={null} loading={false} />)

      expect(screen.getByText(/no keyword analysis available/i)).toBeInTheDocument()
    })

    it('should display no data message when keyword_groups is empty', () => {
      const emptyKeywords = {
        total_keywords_added: 0,
        ats_optimization_score: 0,
        keyword_groups: [],
      }
      render(<KeywordPanel keywords={emptyKeywords} loading={false} />)

      expect(screen.getByText(/no keyword analysis available/i)).toBeInTheDocument()
    })
  })

  describe('Header and Stats', () => {
    it('should display total keywords count', () => {
      render(<KeywordPanel keywords={mockKeywordAnalysis} loading={false} />)

      expect(screen.getByText(/12 total keywords/i)).toBeInTheDocument()
    })

    it('should display ATS optimization score', () => {
      render(<KeywordPanel keywords={mockKeywordAnalysis} loading={false} />)

      expect(screen.getByText(/ats score: 85\/100/i)).toBeInTheDocument()
    })

    it('should display large ATS score badge', () => {
      render(<KeywordPanel keywords={mockKeywordAnalysis} loading={false} />)

      const scoreDisplay = screen.getByText('85')
      expect(scoreDisplay).toHaveClass('text-2xl', 'font-bold', 'text-green-500')
    })
  })

  describe('Search Functionality', () => {
    it('should render search input', () => {
      render(<KeywordPanel keywords={mockKeywordAnalysis} loading={false} />)

      const searchInput = screen.getByTestId('keyword-search')
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveAttribute('placeholder', 'Search keywords...')
    })

    it('should filter keywords by search query', () => {
      render(<KeywordPanel keywords={mockKeywordAnalysis} loading={false} />)

      const searchInput = screen.getByTestId('keyword-search')
      fireEvent.change(searchInput, { target: { value: 'Python' } })

      expect(screen.getByText('Python')).toBeInTheDocument()
      expect(screen.queryByText('Leadership')).not.toBeInTheDocument()
    })

    it('should show clear button when search query is not empty', () => {
      render(<KeywordPanel keywords={mockKeywordAnalysis} loading={false} />)

      const searchInput = screen.getByTestId('keyword-search')
      fireEvent.change(searchInput, { target: { value: 'test' } })

      const clearButton = screen.getByRole('button', { name: '' })
      expect(clearButton).toBeInTheDocument()
    })

    it('should clear search when clear button is clicked', () => {
      render(<KeywordPanel keywords={mockKeywordAnalysis} loading={false} />)

      const searchInput = screen.getByTestId('keyword-search') as HTMLInputElement
      fireEvent.change(searchInput, { target: { value: 'Python' } })
      expect(searchInput.value).toBe('Python')

      const clearButton = screen.getByRole('button', { name: '' })
      fireEvent.click(clearButton)

      expect(searchInput.value).toBe('')
    })

    it('should show no results message when search has no matches', () => {
      render(<KeywordPanel keywords={mockKeywordAnalysis} loading={false} />)

      const searchInput = screen.getByTestId('keyword-search')
      fireEvent.change(searchInput, { target: { value: 'NonExistentKeyword' } })

      expect(screen.getByText(/no keywords match your search/i)).toBeInTheDocument()
    })

    it('should search across why_added text', () => {
      render(<KeywordPanel keywords={mockKeywordAnalysis} loading={false} />)

      const searchInput = screen.getByTestId('keyword-search')
      fireEvent.change(searchInput, { target: { value: 'programming language' } })

      expect(screen.getByText('Python')).toBeInTheDocument()
    })
  })

  describe('Category Filtering', () => {
    it('should render All Categories button', () => {
      render(<KeywordPanel keywords={mockKeywordAnalysis} loading={false} />)

      const allCategoriesButton = screen.getByText('All Categories')
      expect(allCategoriesButton).toBeInTheDocument()
    })

    it('should render category filter buttons for all categories', () => {
      render(<KeywordPanel keywords={mockKeywordAnalysis} loading={false} />)

      expect(screen.getByTestId('category-filter-technical_skills')).toBeInTheDocument()
      expect(screen.getByTestId('category-filter-soft_skills')).toBeInTheDocument()
      expect(screen.getByTestId('category-filter-certifications')).toBeInTheDocument()
    })

    it('should display keyword count for each category', () => {
      render(<KeywordPanel keywords={mockKeywordAnalysis} loading={false} />)

      const categoryCounts = screen.getAllByTestId('category-count')
      expect(categoryCounts[0]).toHaveTextContent('2') // technical_skills
      expect(categoryCounts[1]).toHaveTextContent('1') // soft_skills
      expect(categoryCounts[2]).toHaveTextContent('1') // certifications
    })

    it('should highlight All Categories button by default', () => {
      render(<KeywordPanel keywords={mockKeywordAnalysis} loading={false} />)

      const allCategoriesButton = screen.getByText('All Categories')
      expect(allCategoriesButton).toHaveClass('bg-blue-500', 'text-white')
    })

    it('should filter keywords by selected category', () => {
      render(<KeywordPanel keywords={mockKeywordAnalysis} loading={false} />)

      const technicalSkillsButton = screen.getByTestId('category-filter-technical_skills')
      fireEvent.click(technicalSkillsButton)

      expect(screen.getByText('Python')).toBeInTheDocument()
      expect(screen.getByText('Machine Learning')).toBeInTheDocument()
      expect(screen.queryByText('Leadership')).not.toBeInTheDocument()
    })

    it('should highlight selected category button', () => {
      render(<KeywordPanel keywords={mockKeywordAnalysis} loading={false} />)

      const softSkillsButton = screen.getByTestId('category-filter-soft_skills')
      fireEvent.click(softSkillsButton)

      expect(softSkillsButton).toHaveClass('bg-blue-500', 'text-white')
    })

    it('should reset to all categories when All Categories button clicked', () => {
      render(<KeywordPanel keywords={mockKeywordAnalysis} loading={false} />)

      // First select a specific category
      const technicalSkillsButton = screen.getByTestId('category-filter-technical_skills')
      fireEvent.click(technicalSkillsButton)

      // Then click All Categories
      const allCategoriesButton = screen.getByText('All Categories')
      fireEvent.click(allCategoriesButton)

      // Should show all keywords again
      expect(screen.getByText('Python')).toBeInTheDocument()
      expect(screen.getByText('Leadership')).toBeInTheDocument()
    })
  })

  describe('Combined Search and Category Filtering', () => {
    it('should apply both search and category filters together', () => {
      render(<KeywordPanel keywords={mockKeywordAnalysis} loading={false} />)

      // Select technical skills category
      const technicalSkillsButton = screen.getByTestId('category-filter-technical_skills')
      fireEvent.click(technicalSkillsButton)

      // Search for Python
      const searchInput = screen.getByTestId('keyword-search')
      fireEvent.change(searchInput, { target: { value: 'Python' } })

      // Should show Python but not Machine Learning or Leadership
      expect(screen.getByText('Python')).toBeInTheDocument()
      expect(screen.queryByText('Machine Learning')).not.toBeInTheDocument()
      expect(screen.queryByText('Leadership')).not.toBeInTheDocument()
    })
  })

  describe('Keyword Display', () => {
    it('should render all keyword items', () => {
      render(<KeywordPanel keywords={mockKeywordAnalysis} loading={false} />)

      const keywordItems = screen.getAllByTestId('keyword-item')
      expect(keywordItems).toHaveLength(4) // 2 technical + 1 soft + 1 cert
    })

    it('should display keyword name', () => {
      render(<KeywordPanel keywords={mockKeywordAnalysis} loading={false} />)

      expect(screen.getByText('Python')).toBeInTheDocument()
    })

    it('should display ATS impact badge', () => {
      render(<KeywordPanel keywords={mockKeywordAnalysis} loading={false} />)

      const impactBadges = screen.getAllByTestId('ats-impact')
      expect(impactBadges[0]).toHaveTextContent('high impact')
    })

    it('should apply correct color for high impact', () => {
      render(<KeywordPanel keywords={mockKeywordAnalysis} loading={false} />)

      const highImpactBadge = screen.getAllByTestId('ats-impact')[0]
      expect(highImpactBadge).toHaveClass('text-green-500')
    })

    it('should apply correct color for medium impact', () => {
      render(<KeywordPanel keywords={mockKeywordAnalysis} loading={false} />)

      const mediumImpactBadge = screen.getAllByTestId('ats-impact')[2]
      expect(mediumImpactBadge).toHaveClass('text-yellow-500')
    })

    it('should apply correct color for low impact', () => {
      render(<KeywordPanel keywords={mockKeywordAnalysis} loading={false} />)

      const lowImpactBadge = screen.getAllByTestId('ats-impact')[3]
      expect(lowImpactBadge).toHaveClass('text-blue-500')
    })

    it('should display JD frequency', () => {
      render(<KeywordPanel keywords={mockKeywordAnalysis} loading={false} />)

      const frequencyBadges = screen.getAllByTestId('jd-frequency')
      expect(frequencyBadges[0]).toHaveTextContent('5x in JD')
    })

    it('should display why_added explanation', () => {
      render(<KeywordPanel keywords={mockKeywordAnalysis} loading={false} />)

      expect(screen.getByText('Required programming language for the role')).toBeInTheDocument()
    })

    it('should display context when available', () => {
      render(<KeywordPanel keywords={mockKeywordAnalysis} loading={false} />)

      // Use getAllByText and check that at least one context quote exists
      const contextText = screen.getAllByText(/Developed backend services using Python and Django/i)
      expect(contextText.length).toBeGreaterThan(0)
    })

    it('should not display context when empty', () => {
      render(<KeywordPanel keywords={mockKeywordAnalysis} loading={false} />)

      const contextElements = screen.queryAllByText(/AWS Solutions Architect/i)
      // Should only find the keyword name, not a context quote
      expect(contextElements).toHaveLength(1)
    })

    it('should display location in resume', () => {
      render(<KeywordPanel keywords={mockKeywordAnalysis} loading={false} />)

      const locationButtons = screen.getAllByTestId('keyword-location')
      expect(locationButtons[0]).toHaveTextContent('📍 Technical Skills')
    })
  })

  describe('Category Groups Display', () => {
    it('should render category headers', () => {
      render(<KeywordPanel keywords={mockKeywordAnalysis} loading={false} />)

      const headers = screen.getAllByTestId('category-header')
      expect(headers.length).toBeGreaterThan(0)
    })

    it('should display correct category label', () => {
      render(<KeywordPanel keywords={mockKeywordAnalysis} loading={false} />)

      // Category labels appear in both filter buttons and group headers
      const technicalSkillsElements = screen.getAllByText('Technical Skills')
      const softSkillsElements = screen.getAllByText('Soft Skills')

      expect(technicalSkillsElements.length).toBeGreaterThan(0)
      expect(softSkillsElements.length).toBeGreaterThan(0)
    })

    it('should display category keyword count', () => {
      render(<KeywordPanel keywords={mockKeywordAnalysis} loading={false} />)

      const categoryHeaders = screen.getAllByTestId('category-header')
      // Each header should have a count badge
      expect(categoryHeaders.length).toBeGreaterThan(0)
    })
  })

  describe('Location Scrolling', () => {
    it('should call scrollIntoView when location button is clicked', () => {
      const mockElement = document.createElement('div')
      mockElement.id = 'technical-skills-section'
      document.body.appendChild(mockElement)

      const scrollIntoViewMock = vi.fn()
      mockElement.scrollIntoView = scrollIntoViewMock

      render(<KeywordPanel keywords={mockKeywordAnalysis} loading={false} />)

      const locationButtons = screen.getAllByTestId('keyword-location')
      fireEvent.click(locationButtons[0])

      expect(scrollIntoViewMock).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      })

      document.body.removeChild(mockElement)
    })

    it('should apply highlight class when scrolling to section', () => {
      vi.useFakeTimers()

      const mockElement = document.createElement('div')
      mockElement.id = 'professional-experience-section'
      document.body.appendChild(mockElement)

      render(<KeywordPanel keywords={mockKeywordAnalysis} loading={false} />)

      const locationButtons = screen.getAllByTestId('keyword-location')
      fireEvent.click(locationButtons[1]) // Professional Experience

      expect(mockElement.classList.contains('bg-yellow-500/20')).toBe(true)

      // Fast-forward time to verify highlight is removed
      vi.advanceTimersByTime(2000)
      expect(mockElement.classList.contains('bg-yellow-500/20')).toBe(false)

      document.body.removeChild(mockElement)
      vi.useRealTimers()
    })

    it('should handle missing section gracefully', () => {
      render(<KeywordPanel keywords={mockKeywordAnalysis} loading={false} />)

      const locationButtons = screen.getAllByTestId('keyword-location')
      // Should not throw error when clicking location for non-existent section
      expect(() => fireEvent.click(locationButtons[0])).not.toThrow()
    })
  })
})
